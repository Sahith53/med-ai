"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircleIcon, Loader2Icon, StethoscopeIcon, VideoIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import type { TriageDecision } from "../../types";
import { RiskBadge } from "./risk-badge";

interface ConsultationCardProps {
  decision: TriageDecision;
  sessionId: string;
}

export function ConsultationCard({ decision, sessionId }: ConsultationCardProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [isCreating, setIsCreating] = useState(false);

  const createAgentMutation = useMutation(
    trpc.agents.create.mutationOptions()
  );
  const createMeetingMutation = useMutation(
    trpc.meetings.create.mutationOptions()
  );
  const linkMeetingMutation = useMutation(
    trpc.triage.linkMeeting.mutationOptions()
  );

  const cardColor =
    decision.riskLevel === "high"
      ? { border: "border-orange-200", bg: "bg-orange-50/50", icon: "bg-orange-100", iconColor: "text-orange-700", title: "text-orange-900", text: "text-orange-800", disclaimer: "border-orange-200 bg-orange-100/50 text-orange-700" }
      : { border: "border-yellow-200", bg: "bg-yellow-50/50", icon: "bg-yellow-100", iconColor: "text-yellow-700", title: "text-yellow-900", text: "text-yellow-800", disclaimer: "border-yellow-200 bg-yellow-100/50 text-yellow-700" };

  async function handleStartConsultation() {
    setIsCreating(true);
    try {
      const agentInstructions = `You are a medical AI assistant helping a patient with the following symptoms. 
Risk Level: ${decision.riskLevel.toUpperCase()} (Severity: ${decision.severityScore}/10)
Recommended Specialist: ${decision.specialist}
Urgency: ${decision.urgencyMessage}

Your role:
- Listen carefully to the patient's symptoms and concerns
- Provide clear, empathetic guidance based on their risk level
- Recommend appropriate next steps and when to seek in-person care
- Do NOT diagnose conditions — guide the patient and recommend professional consultation
- Always end with a reminder to see a ${decision.specialist} in person

Remember: This is a support consultation, not a replacement for professional medical care.`;

      const agent = await createAgentMutation.mutateAsync({
        name: `Medical AI — ${decision.specialist}`,
        instructions: agentInstructions,
      });

      const meeting = await createMeetingMutation.mutateAsync({
        name: `Triage Consultation — ${decision.specialist}`,
        agentId: agent.id,
      });

      await linkMeetingMutation.mutateAsync({
        sessionId,
        meetingId: meeting.id,
      });

      router.push(`/call/${meeting.id}`);
    } catch {
      setIsCreating(false);
    }
  }

  return (
    <Card className={`${cardColor.border} ${cardColor.bg}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`flex size-9 items-center justify-center rounded-full ${cardColor.icon}`}>
            <StethoscopeIcon className={`size-5 ${cardColor.iconColor}`} />
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle className={`text-base ${cardColor.title}`}>
              Medical Consultation Advised
            </CardTitle>
            <RiskBadge
              riskLevel={decision.riskLevel}
              severityScore={decision.severityScore}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className={`text-sm ${cardColor.text}`}>{decision.urgencyMessage}</p>

        {decision.precautions.length > 0 && (
          <div>
            <p className={`mb-2 text-sm font-semibold ${cardColor.title}`}>
              Precautions while you wait:
            </p>
            <ul className="space-y-1">
              {decision.precautions.slice(0, 4).map((precaution, i) => (
                <li key={i} className={`flex items-start gap-2 text-sm ${cardColor.text}`}>
                  <CheckCircleIcon className={`mt-0.5 size-4 shrink-0 ${cardColor.iconColor}`} />
                  <span>{precaution}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={handleStartConsultation}
          disabled={isCreating}
          className="w-full gap-2"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Setting up consultation...
            </>
          ) : (
            <>
              <VideoIcon className="size-4" />
              Start AI Video Consultation
            </>
          )}
        </Button>

        <p className={`rounded border p-2 text-xs ${cardColor.disclaimer}`}>
          {decision.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}
