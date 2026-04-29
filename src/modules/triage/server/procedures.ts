import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { triageSessions } from "@/db/schema";
import { and, desc, eq, count } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { assessSymptoms, extractSymptomsFromText } from "../services/triage.service";
import { recommendSpecialist } from "../services/recommendation.service";
import { evaluateDecision } from "./decision-engine";

export const triageRouter = createTRPCRouter({
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1, "Message is required"),
        conversationId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message, conversationId } = input;
      const userId = ctx.auth.user.id;

      const extractedSymptoms = extractSymptomsFromText(message);
      const analysis = assessSymptoms(extractedSymptoms, message);
      const recommendation = recommendSpecialist(analysis.symptoms);
      const decision = evaluateDecision(analysis, recommendation);

      const sessionId = conversationId ?? nanoid();

      const existingSession = conversationId
        ? await db
            .select()
            .from(triageSessions)
            .where(
              and(
                eq(triageSessions.id, conversationId),
                eq(triageSessions.userId, userId)
              )
            )
            .then((rows) => rows[0] ?? null)
        : null;

      const newMessage = {
        role: "user" as const,
        content: message,
        decision,
        timestamp: new Date(),
      };

      if (existingSession) {
        const prevMessages = existingSession.rawMessages
          ? (JSON.parse(existingSession.rawMessages) as unknown[])
          : [];

        await db
          .update(triageSessions)
          .set({
            symptoms: JSON.stringify(analysis.symptoms),
            riskLevel: analysis.riskLevel,
            severityScore: analysis.severityScore,
            specialistRecommendation: recommendation.specialist,
            decisionAction: decision.action,
            rawMessages: JSON.stringify([...prevMessages, newMessage]),
            updatedAt: new Date(),
          })
          .where(eq(triageSessions.id, sessionId));
      } else {
        await db.insert(triageSessions).values({
          id: sessionId,
          userId,
          symptoms: JSON.stringify(analysis.symptoms),
          riskLevel: analysis.riskLevel,
          severityScore: analysis.severityScore,
          specialistRecommendation: recommendation.specialist,
          decisionAction: decision.action,
          rawMessages: JSON.stringify([newMessage]),
        });
      }

      const responseText = buildResponseText(decision, recommendation);

      return {
        response: responseText,
        decision,
        conversationId: sessionId,
        specialist: recommendation,
        analysis,
      };
    }),

  getSession: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [session] = await db
        .select()
        .from(triageSessions)
        .where(
          and(
            eq(triageSessions.id, input.id),
            eq(triageSessions.userId, ctx.auth.user.id)
          )
        );

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      return {
        ...session,
        rawMessages: session.rawMessages
          ? JSON.parse(session.rawMessages)
          : [],
      };
    }),

  getSessions: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;

      const data = await db
        .select()
        .from(triageSessions)
        .where(eq(triageSessions.userId, ctx.auth.user.id))
        .orderBy(desc(triageSessions.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({ count: count() })
        .from(triageSessions)
        .where(eq(triageSessions.userId, ctx.auth.user.id));

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),

  linkMeeting: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        meetingId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [updated] = await db
        .update(triageSessions)
        .set({ meetingId: input.meetingId, updatedAt: new Date() })
        .where(
          and(
            eq(triageSessions.id, input.sessionId),
            eq(triageSessions.userId, ctx.auth.user.id)
          )
        )
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      return updated;
    }),
});

function buildResponseText(
  decision: ReturnType<typeof evaluateDecision>,
  recommendation: ReturnType<typeof recommendSpecialist>
): string {
  const lines: string[] = [];

  switch (decision.action) {
    case "emergency_alert":
      lines.push(
        "🚨 **EMERGENCY SITUATION DETECTED**",
        "",
        decision.urgencyMessage,
        "",
        "**Please call emergency services (108) immediately.** Do not attempt to drive yourself.",
        "",
        `Recommended specialist: **${decision.specialist}**`,
        "",
        decision.disclaimer
      );
      break;

    case "alert":
      lines.push(
        "⚠️ **HIGH RISK — Immediate Medical Attention Required**",
        "",
        decision.urgencyMessage,
        "",
        `Recommended specialist: **${decision.specialist}**`,
        recommendation.reasoning ? `_${recommendation.reasoning}_` : "",
        "",
        "You may start an AI video consultation below for immediate guidance.",
        "",
        decision.disclaimer
      );
      break;

    case "consultation":
      lines.push(
        "📋 **Medical Consultation Advised**",
        "",
        decision.urgencyMessage,
        "",
        `Recommended specialist: **${decision.specialist}**`,
        recommendation.reasoning ? `_${recommendation.reasoning}_` : "",
        "",
        "**Precautions while you wait:**"
      );
      decision.precautions.forEach((p) => lines.push(`• ${p}`));
      lines.push("", "You can start an AI video consultation below.", "", decision.disclaimer);
      break;

    case "precautions":
    default:
      lines.push(
        "✅ **Low Risk Assessment**",
        "",
        decision.urgencyMessage,
        "",
        `If symptoms persist, consider consulting a **${decision.specialist}**.`,
        "",
        "**Recommended precautions:**"
      );
      decision.precautions.forEach((p) => lines.push(`• ${p}`));
      lines.push("", decision.disclaimer);
      break;
  }

  return lines.join("\n");
}
