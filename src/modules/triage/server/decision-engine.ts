import type {
  SpecialistRecommendation,
  SymptomAnalysis,
  TriageAction,
  TriageDecision,
} from "../types";

const DISCLAIMER =
  "This assessment is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.";

const SYMPTOM_PRECAUTIONS: Record<string, string[]> = {
  fever: [
    "Rest and stay hydrated with water or electrolyte drinks",
    "Take paracetamol or ibuprofen to manage temperature (follow dosage instructions)",
    "Monitor temperature every 4 hours",
    "Seek care if fever exceeds 39.5°C (103°F) or lasts more than 3 days",
  ],
  headache: [
    "Rest in a quiet, darkened room",
    "Stay hydrated",
    "Apply a cold or warm compress to your forehead",
    "Avoid screens and bright lights",
  ],
  cough: [
    "Stay hydrated with warm fluids like honey and lemon tea",
    "Use a humidifier to keep air moist",
    "Avoid smoking and irritants",
    "Try throat lozenges for relief",
  ],
  nausea: [
    "Eat small, bland meals (crackers, toast, plain rice)",
    "Stay hydrated with small sips of water",
    "Avoid strong smells, fatty, or spicy foods",
    "Rest in a semi-upright position",
  ],
  dizziness: [
    "Sit or lie down immediately to prevent falls",
    "Stand up slowly from sitting or lying positions",
    "Stay hydrated",
    "Avoid sudden head movements",
  ],
  fatigue: [
    "Ensure 7–9 hours of quality sleep",
    "Maintain a balanced diet rich in iron and vitamins",
    "Reduce stress and take regular breaks",
    "Stay hydrated throughout the day",
  ],
  "sore throat": [
    "Gargle with warm salt water several times a day",
    "Drink warm fluids like tea with honey",
    "Use throat lozenges or sprays for relief",
    "Avoid cold drinks and irritants",
  ],
  "back pain": [
    "Apply ice for the first 48 hours, then switch to heat",
    "Take over-the-counter pain relievers if needed",
    "Avoid heavy lifting and maintain good posture",
    "Gentle stretching may provide relief",
  ],
  rash: [
    "Avoid scratching the affected area",
    "Apply calamine lotion or hydrocortisone cream for relief",
    "Keep the area clean and dry",
    "Avoid known allergens and irritants",
  ],
  "joint pain": [
    "Rest the affected joint",
    "Apply ice for 20 minutes several times a day",
    "Use over-the-counter anti-inflammatory medications if appropriate",
    "Elevate the joint if swollen",
  ],
};

const DEFAULT_PRECAUTIONS = [
  "Rest adequately and monitor your symptoms",
  "Stay hydrated and maintain a balanced diet",
  "Keep a symptom diary to track changes",
  "Consult a healthcare provider if symptoms worsen or new symptoms develop",
];

function buildPrecautions(symptoms: string[]): string[] {
  const result = new Set<string>();
  for (const symptom of symptoms) {
    const tips = SYMPTOM_PRECAUTIONS[symptom.toLowerCase()];
    if (tips) {
      tips.forEach((t) => result.add(t));
    }
  }
  if (result.size === 0) {
    return DEFAULT_PRECAUTIONS;
  }
  return Array.from(result).slice(0, 6);
}

function buildUrgencyMessage(
  action: TriageAction,
  analysis: SymptomAnalysis,
  specialist: string
): string {
  switch (action) {
    case "emergency_alert":
      return `🚨 EMERGENCY: ${analysis.urgencyRecommendation} Recommended: Emergency Medicine / ${specialist}.`;
    case "alert":
      return `⚠️ HIGH RISK: ${analysis.urgencyRecommendation} Recommended specialist: ${specialist}.`;
    case "consultation":
      return `📋 MEDICAL CONSULTATION ADVISED: ${analysis.urgencyRecommendation} A ${specialist} is recommended.`;
    case "precautions":
      return `✅ LOW RISK: ${analysis.urgencyRecommendation} You may consult a ${specialist} if needed.`;
  }
}

export function evaluateDecision(
  analysis: SymptomAnalysis,
  recommendation: SpecialistRecommendation
): TriageDecision {
  let action: TriageAction;
  let shouldCreateMeeting: boolean;

  switch (analysis.riskLevel) {
    case "emergency":
      action = "emergency_alert";
      shouldCreateMeeting = false;
      break;
    case "high":
      action = "alert";
      shouldCreateMeeting = true;
      break;
    case "medium":
      action = "consultation";
      shouldCreateMeeting = true;
      break;
    case "low":
    default:
      action = "precautions";
      shouldCreateMeeting = false;
      break;
  }

  const precautions =
    action === "precautions" || action === "consultation"
      ? buildPrecautions(analysis.symptoms)
      : [];

  const urgencyMessage = buildUrgencyMessage(
    action,
    analysis,
    recommendation.specialist
  );

  return {
    action,
    riskLevel: analysis.riskLevel,
    severityScore: analysis.severityScore,
    specialist: recommendation.specialist,
    precautions,
    urgencyMessage,
    shouldCreateMeeting,
    disclaimer: DISCLAIMER,
  };
}
