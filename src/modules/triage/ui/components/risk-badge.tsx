import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "../../types";

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  severityScore?: number;
  className?: string;
}

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; className: string }
> = {
  low: {
    label: "Low Risk",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  medium: {
    label: "Medium Risk",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  high: {
    label: "High Risk",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  emergency: {
    label: "EMERGENCY",
    className: "bg-red-100 text-red-800 border-red-300 font-bold animate-pulse",
  },
};

export function RiskBadge({ riskLevel, severityScore, className }: RiskBadgeProps) {
  const config = RISK_CONFIG[riskLevel];
  return (
    <Badge
      variant="outline"
      className={cn(config.className, "text-xs px-2 py-0.5", className)}
    >
      {config.label}
      {severityScore !== undefined && (
        <span className="ml-1 opacity-70">({severityScore}/10)</span>
      )}
    </Badge>
  );
}
