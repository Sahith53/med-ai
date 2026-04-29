import type { RiskLevel, SymptomAnalysis } from "../types";

const EMERGENCY_SIGNALS = new Set([
  "unconscious",
  "stroke",
  "heart attack",
  "seizure",
  "suicidal thoughts",
  "coughing blood",
  "loss of consciousness",
  "severe bleeding",
  "difficulty breathing",
  "anaphylaxis",
  "overdose",
]);

const HIGH_RISK_SIGNALS = new Set([
  "chest pain",
  "shortness of breath",
  "chest tightness",
  "severe chest pain",
]);

const MEDIUM_RISK_SIGNALS = new Set([
  "fever",
  "dizziness",
  "persistent cough",
  "high temperature",
  "vomiting",
  "severe headache",
  "migraine",
]);

const SYMPTOM_KEYWORD_LIST = [
  "fever",
  "headache",
  "nausea",
  "dizziness",
  "cough",
  "fatigue",
  "chest pain",
  "shortness of breath",
  "sore throat",
  "vomiting",
  "diarrhea",
  "rash",
  "back pain",
  "joint pain",
  "anxiety",
  "depression",
  "insomnia",
  "stroke",
  "heart attack",
  "seizure",
  "unconscious",
  "suicidal thoughts",
  "coughing blood",
  "loss of consciousness",
  "severe bleeding",
  "difficulty breathing",
  "chest tightness",
  "blurred vision",
  "numbness",
  "tingling",
  "swelling",
  "abdominal pain",
  "ear pain",
  "eye pain",
  "persistent cough",
  "severe headache",
];

const CONDITION_MAP: Record<RiskLevel, string[]> = {
  emergency: [
    "Life-threatening emergency requiring immediate care",
    "Possible cardiac or neurological emergency",
  ],
  high: [
    "Possible cardiac or pulmonary condition",
    "Requires prompt medical evaluation",
  ],
  medium: [
    "Possible infection or inflammatory condition",
    "Clinical assessment recommended within 24–72 hours",
  ],
  low: [
    "General symptom cluster",
    "Monitor and consult if symptoms persist or worsen",
  ],
};

export function extractSymptomsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const keyword of SYMPTOM_KEYWORD_LIST) {
    if (lower.includes(keyword)) {
      found.add(keyword);
    }
  }
  return Array.from(found);
}

export function assessSymptoms(
  symptoms: string[],
  rawText: string
): SymptomAnalysis {
  const combined = symptoms.map((s) => s.toLowerCase());
  const textLower = rawText.toLowerCase();

  const allSignals = new Set([...combined, ...extractSymptomsFromText(textLower)]);

  let riskLevel: RiskLevel = "low";
  let severityScore = 2;
  let urgencyRecommendation =
    "Monitor your symptoms. Consult a clinician if they worsen or persist beyond a few days.";

  for (const signal of allSignals) {
    if (EMERGENCY_SIGNALS.has(signal)) {
      riskLevel = "emergency";
      severityScore = 10;
      urgencyRecommendation =
        "CALL EMERGENCY SERVICES (108) IMMEDIATELY. Do not wait. This may be life-threatening.";
      break;
    }
  }

  if (riskLevel !== "emergency") {
    for (const signal of allSignals) {
      if (HIGH_RISK_SIGNALS.has(signal)) {
        riskLevel = "high";
        severityScore = 8;
        urgencyRecommendation =
          "Seek immediate medical attention. Go to an urgent care clinic or emergency room as soon as possible.";
        break;
      }
    }
  }

  if (riskLevel === "low") {
    for (const signal of allSignals) {
      if (MEDIUM_RISK_SIGNALS.has(signal)) {
        riskLevel = "medium";
        severityScore = symptoms.length > 2 ? 6 : 5;
        urgencyRecommendation =
          "Schedule an appointment with a healthcare professional within 24–72 hours.";
        break;
      }
    }
  }

  if (riskLevel === "low" && allSignals.size > 0) {
    severityScore = Math.min(3, allSignals.size + 1);
  }

  const finalSymptoms = Array.from(allSignals);

  return {
    symptoms: finalSymptoms,
    riskLevel,
    severityScore,
    possibleConditions: CONDITION_MAP[riskLevel],
    urgencyRecommendation,
  };
}
