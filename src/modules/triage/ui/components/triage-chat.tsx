"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon, SendIcon, HeartPulseIcon } from "lucide-react";
import { useRef, useState } from "react";
import Markdown from "react-markdown";
import type { TriageDecision } from "../../types";
import { PrecautionsCard } from "./precautions-card";
import { ConsultationCard } from "./consultation-card";
import { EscalationAlert } from "./escalation-alert";

interface ChatEntry {
  role: "user" | "assistant";
  content: string;
  decision?: TriageDecision;
  sessionId?: string;
}

export function TriageChat() {
  const trpc = useTRPC();
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation(trpc.triage.chat.mutationOptions());

  function scrollToBottom() {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }

  async function handleSubmit() {
    const text = input.trim();
    if (!text || chatMutation.isPending) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
    ]);
    scrollToBottom();

    try {
      const result = await chatMutation.mutateAsync({
        message: text,
        conversationId,
      });

      setConversationId(result.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.response,
          decision: result.decision,
          sessionId: result.conversationId,
        },
      ]);
      scrollToBottom();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong processing your message. Please try again.",
        },
      ]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <HeartPulseIcon className="size-7" />
              </div>
              <div>
                <p className="font-medium text-foreground">Symptom Assessment</p>
                <p className="mt-1 text-sm">
                  Describe your symptoms in detail. I will assess your risk level
                  and recommend next steps.
                </p>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {[
                  "I have a fever and headache",
                  "I have chest pain",
                  "I feel dizzy and nauseous",
                  "I have a persistent cough",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="space-y-3">
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm">
                    <Markdown
                      components={{
                        p: (props) => <p className="mb-2 last:mb-0" {...props} />,
                        strong: (props) => <strong className="font-semibold" {...props} />,
                        ul: (props) => <ul className="mb-2 list-disc pl-4" {...props} />,
                        li: (props) => <li className="mb-0.5" {...props} />,
                      }}
                    >
                      {msg.content}
                    </Markdown>
                  </div>

                  {msg.decision && msg.sessionId && (
                    <div className="max-w-lg">
                      {msg.decision.action === "precautions" && (
                        <PrecautionsCard decision={msg.decision} />
                      )}
                      {(msg.decision.action === "consultation" ||
                        msg.decision.action === "alert") && (
                        <ConsultationCard
                          decision={msg.decision}
                          sessionId={msg.sessionId}
                        />
                      )}
                      {msg.decision.action === "emergency_alert" && (
                        <EscalationAlert
                          decision={msg.decision}
                          sessionId={msg.sessionId}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Analyzing symptoms...
            </div>
          )}
        </div>
      </div>

      <div className="border-t bg-background p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms... (Press Enter to send)"
            className="min-h-[52px] max-h-32 resize-none"
            disabled={chatMutation.isPending}
            rows={2}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || chatMutation.isPending}
            size="icon"
            className="size-[52px] shrink-0"
          >
            {chatMutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SendIcon className="size-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}
