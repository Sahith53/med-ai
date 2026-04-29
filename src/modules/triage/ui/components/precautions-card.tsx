import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircleIcon, ShieldIcon } from "lucide-react";
import type { TriageDecision } from "../../types";
import { RiskBadge } from "./risk-badge";

interface PrecautionsCardProps {
  decision: TriageDecision;
}

export function PrecautionsCard({ decision }: PrecautionsCardProps) {
  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-green-100">
            <ShieldIcon className="size-5 text-green-700" />
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base text-green-900">
              Low Risk Assessment
            </CardTitle>
            <RiskBadge
              riskLevel={decision.riskLevel}
              severityScore={decision.severityScore}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-green-800">{decision.urgencyMessage}</p>

        {decision.precautions.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-green-900">
              Recommended Precautions:
            </p>
            <ul className="space-y-2">
              {decision.precautions.map((precaution, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                  <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-600" />
                  <span>{precaution}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {decision.specialist && (
          <p className="text-sm text-green-700">
            If symptoms persist, consider consulting a{" "}
            <strong>{decision.specialist}</strong>.
          </p>
        )}

        <p className="rounded border border-green-200 bg-green-100/50 p-2 text-xs text-green-700">
          {decision.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}
