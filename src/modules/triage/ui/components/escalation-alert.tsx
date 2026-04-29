"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, Loader2Icon, PhoneIcon, VideoIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import type { TriageDecision } from "../../types";
import { RiskBadge } from "./risk-badge";

interface EscalationAlertProps {
  decision: TriageDecision;
  sessionId: string;
}

export function EscalationAlert({ decision, sessionId }: EscalationAlertProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [isCreating, setIsCreating] = useState(false);
  const isEmergency = decision.riskLevel === "emergency";

  const createAgentMutation = useMutation(trpc.agents.create.mutationOptions());
  const createMeetingMutation = useMutation(trpc.meetings.create.mutationOptions());
  const linkMeetingMutation = useMutation(trpc.triage.linkMeeting.mutationOptions());

  const colors = isEmergency
    ? {
        border: "border-red-300",
        bg: "bg-red-50",
        iconBg: "bg-red-100",
        iconColor: "text-red-700",
        title: "text-red-900",
        text: "text-red-800",
        disclaimer: "border-red-200 bg-red-100/50 text-red-700",
        calloutBg: "bg-red-100 border-red-200",
      }
    : {
        border: "border-orange-300",
        bg: "bg-orange-50",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-700",
        title: "text-orange-900",
        text: "text-orange-800",
        disclaimer: "border-orange-200 bg-orange-100/50 text-orange-700",
        calloutBg: "bg-orange-100 border-orange-200",
      };

  async function handleStartConsultation() {
    setIsCreating(true);
    try {
      const agentInstructions = `You are a medical AI assistant for an URGENT situation. 
Risk Level: ${decision.riskLevel.toUpperCase()} (Severity: ${decision.severityScore}/10)
Recommended Specialist: ${decision.specialist}

IMPORTANT: This patient has been flagged as ${isEmergency ? "an EMERGENCY" : "HIGH RISK"}. 
Your primary goal is to:
1. Keep the patient calm
2. Strongly encourage them to call emergency services or go to an emergency room immediately
3. Provide immediate safety guidance while they await help
4. Do NOT attempt to diagnose or treat — focus on immediate safety

${isEmergency ? "If the patient has not called 108, urge them to do so immediately." : "Strongly advise the patient to seek emergency care now."}`;

      const agent = await createAgentMutation.mutateAsync({
        name: `Emergency AI — ${decision.specialist}`,
        instructions: agentInstructions,
      });

      const meeting = await createMeetingMutation.mutateAsync({
        name: `${isEmergency ? "Emergency" : "Urgent"} Consultation — ${decision.specialist}`,
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
    <Card className={`${colors.border} ${colors.bg}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`flex size-9 items-center justify-center rounded-full ${colors.iconBg}`}>
            <AlertTriangleIcon className={`size-5 ${colors.iconColor}`} />
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle className={`text-base ${colors.title}`}>
              {isEmergency ? "EMERGENCY — Call 911 Now" : "High Risk — Seek Immediate Care"}
            </CardTitle>
            <RiskBadge
              riskLevel={decision.riskLevel}
              severityScore={decision.severityScore}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEmergency && (
          <div className={`flex items-center gap-3 rounded-lg border p-3 ${colors.calloutBg}`}>
            <PhoneIcon className={`size-5 shrink-0 ${colors.iconColor}`} />
            <div>
              <p className={`text-sm font-bold ${colors.title}`}>
                Call Emergency Services Immediately
              </p>
              <p className={`text-xs ${colors.text}`}>
                Dial 911 (US) · 999 (UK) · 112 (EU) · 108 (India)
              </p>
            </div>
          </div>
        )}

        <p className={`text-sm ${colors.text}`}>{decision.urgencyMessage}</p>

        <div>
          <p className={`mb-1 text-sm font-semibold ${colors.title}`}>
            Recommended Specialist:
          </p>
          <p className={`text-sm ${colors.text}`}>{decision.specialist}</p>
        </div>

        {decision.shouldCreateMeeting && (
          <Button
            onClick={handleStartConsultation}
            disabled={isCreating}
            variant="outline"
            className={`w-full gap-2 border-current ${colors.text}`}
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
                {isEmergency
                  ? "Talk to AI (while waiting for help)"
                  : "Start AI Video Consultation"}
              </>
            )}
          </Button>
        )}

        <p className={`rounded border p-2 text-xs ${colors.disclaimer}`}>
          {decision.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}
