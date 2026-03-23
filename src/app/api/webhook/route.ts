import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { generateAvatarUri } from "@/lib/avatar";
import { streamChat } from "@/lib/stream-chat";
import { streamVideo } from "@/lib/stream-video";
import {
  CallEndedEvent,
  MessageNewEvent,
  CallTranscriptionReadyEvent,
  CallSessionParticipantLeftEvent,
  CallRecordingReadyEvent,
  CallSessionStartedEvent,
} from "@stream-io/node-sdk";
import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Add this Set to track processed messages and prevent duplicates
const processedMessages = new Set<string>();

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");
  const apikey = req.headers.get("x-api-key");

  if (!signature || !apikey) {
    return NextResponse.json(
      { error: "Missing signature or API key" },
      { status: 400 }
    );
  }

  const body = await req.text();

  if (!verifySignatureWithSDK(body, signature)) {
    return NextResponse.json(
      {
        error: "Invalid signature",
      },
      { status: 401 }
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON",
      },
      { status: 400 }
    );
  }

  const eventType = (payload as Record<string, unknown>)?.type;

  if (eventType === "call.session_started") {
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId;

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(
        and(
          eq(meetings.id, meetingId),
          not(eq(meetings.status, "completed")),
          not(eq(meetings.status, "active")),
          not(eq(meetings.status, "cancelled")),
          not(eq(meetings.status, "processing"))
        )
      );

    if (!existingMeeting) {
      return NextResponse.json(
        {
          error: "Meeting not found",
        },
        { status: 404 }
      );
    }

    await db
      .update(meetings)
      .set({
        status: "active",
        startedAt: new Date(),
      })
      .where(eq(meetings.id, existingMeeting.id));

    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existingMeeting.agentId));
    if (!existingAgent) {
      return NextResponse.json(
        {
          error: "Agent not found",
        },
        { status: 404 }
      );
    }

    const call = streamVideo.video.call("default", meetingId);
    const realtimeClient = await streamVideo.video.connectOpenAi({
      call,
      openAiApiKey: process.env.OPENAI_API_KEY!,
      agentUserId: existingAgent.id,
    });

    realtimeClient.updateSession({
      instructions: existingAgent.instructions,
    });
  } else if (eventType === "call.session_participant_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(":")[1];

    if (!meetingId) {
      return NextResponse.json(
        {
          error: "Missing meeting id",
        },
        { status: 400 }
      );
    }
    const call = streamVideo.video.call("default", meetingId);
    await call.end();
  } else if (eventType === "call.session_ended") {
    const event = payload as CallEndedEvent;
    const meetingId = event.call.custom?.meetingId;
    if (!meetingId) {
      return NextResponse.json(
        {
          error: "Missing meeting id",
        },
        { status: 400 }
      );
    }

    await db
      .update(meetings)
      .set({
        status: "processing",
        endedAt: new Date(),
      })
      .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));
  } else if (eventType === "call.transcription_ready") {
    const event = payload as CallTranscriptionReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        transcriptUrl: event.call_transcription.url,
      })
      .where(eq(meetings.id, meetingId))
      .returning();

    if (!updatedMeeting) {
      return NextResponse.json(
        {
          error: "Meeting not found",
        },
        { status: 404 }
      );
    }

    await inngest.send({
      name: "meetings/processing",
      data: {
        meetingId: updatedMeeting.id,
        transcriptUrl: updatedMeeting.transcriptUrl,
      },
    });
  } else if (eventType === "call.recording_ready") {
    const event = payload as CallRecordingReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    await db
      .update(meetings)
      .set({
        recordingUrl: event.call_recording.url,
      })
      .where(eq(meetings.id, meetingId))
      .returning();
  } else if (eventType === "message.new") {
    const event = payload as MessageNewEvent;

    const senderId = event.message?.user?.id;
    const channelId = event.channel_id;
    const text = event.message?.text;
    const messageId = event.message?.id;

    if (!senderId || !channelId || !text || !messageId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if we've already processed this message
    if (processedMessages.has(messageId)) {
      console.log(`Skipping duplicate message: ${messageId}`);
      return NextResponse.json({ status: "duplicate-ignored" });
    }

    // Mark this message as processed
    processedMessages.add(messageId);

    // Clean up old message IDs after 5 minutes to prevent memory leak
    setTimeout(() => {
      processedMessages.delete(messageId);
    }, 5 * 60 * 1000);

    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existingMeeting.agentId));

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (senderId === existingAgent.id) {
      return NextResponse.json({ status: "ignored-bot-message" });
    }

    const systemInstructions = `
You are an AI assistant who helps the user revisit a completed meeting.

You MUST follow these rules strictly:

1. You may ONLY answer questions that are directly related to:
   - The meeting summary below
   - The agent's original instructions below

2. If the user asks ANYTHING that is unrelated, off-topic, personal, or outside the scope of the meeting or instructions, you MUST politely decline.  
   Example response:
   "I'm sorry, but I can only answer questions related to the meeting or its details."

3. Always be polite, concise, and fact-based.  
4. If the meeting summary does not contain enough information to answer, say so politely.

───────────────────────────
MEETING SUMMARY:
${existingMeeting.summary}

AGENT INSTRUCTIONS:
${existingAgent.instructions}
───────────────────────────
`;

    const channel = streamChat.channel("messaging", channelId);

    await channel.query();

    const previousMessages = channel.state.messages
      .slice(-5)
      .filter((m) => m.text?.trim())
      .map<ChatCompletionMessageParam>((m) => ({
        role: m.user?.id === existingAgent.id ? "assistant" : "user",
        content: m.text!,
      }));

    const aiResponse = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstructions },
        ...previousMessages,
        { role: "user", content: text },
      ],
    });

    const reply = aiResponse.choices[0].message.content;

    if (!reply) {
      return NextResponse.json(
        { error: "GPT returned no text" },
        { status: 400 }
      );
    }

    const avatarUrl = generateAvatarUri({
      seed: existingAgent.name,
      variant: "botttsNeutral",
    });

    streamChat.upsertUser({
      id: existingAgent.id,
      name: existingAgent.name,
      image: avatarUrl,
    });

    await channel.sendMessage({
      text: reply,
      user: {
        id: existingAgent.id,
        name: existingAgent.name,
        image: avatarUrl,
      },
    });
  }

  return NextResponse.json({
    status: "ok",
  });
}