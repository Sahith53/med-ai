export type RiskLevel = "low" | "medium" | "high" | "emergency";

export type TriageAction =
  | "precautions"
  | "consultation"
  | "alert"
  | "emergency_alert";

export interface SymptomAnalysis {
  symptoms: string[];
  riskLevel: RiskLevel;
  severityScore: number;
  possibleConditions: string[];
  urgencyRecommendation: string;
}

export interface SpecialistRecommendation {
  specialist: string;
  confidence: number;
  reasoning: string;
  alternatives: string[];
}

export interface TriageDecision {
  action: TriageAction;
  riskLevel: RiskLevel;
  severityScore: number;
  specialist: string;
  precautions: string[];
  urgencyMessage: string;
  shouldCreateMeeting: boolean;
  disclaimer: string;
}

export interface TriageChatMessage {
  role: "user" | "assistant";
  content: string;
  decision?: TriageDecision;
  timestamp: Date;
}

export interface TriageSession {
  id: string;
  userId: string;
  messages: TriageChatMessage[];
  currentDecision?: TriageDecision;
  meetingId?: string;
  createdAt: Date;
  updatedAt: Date;
}
