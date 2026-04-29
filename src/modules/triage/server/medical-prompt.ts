type BuildMedicalPromptParams = {
  symptoms: string[] | string;
  riskLevel: string;
  specialist: string;
};

export function buildMedicalPrompt({
  symptoms,
  riskLevel,
  specialist,
}: BuildMedicalPromptParams): string {
  const symptomsText = Array.isArray(symptoms)
    ? symptoms.filter(Boolean).join(", ")
    : symptoms;

  const safeSymptoms = symptomsText?.trim() || "No symptoms provided";
  const safeRiskLevel = riskLevel?.trim() || "unknown";
  const safeSpecialist = specialist?.trim() || "General Physician";

  return `
You are a professional AI medical assistant.

Patient symptoms:
${safeSymptoms}

Risk level: ${safeRiskLevel}
Recommended specialist: ${safeSpecialist}

Your role:
* Ask relevant follow-up questions
* Be calm, professional, and empathetic
* DO NOT give final diagnosis
* Suggest next steps
* Encourage real doctor consultation
* Keep answers short and conversational

IMPORTANT:
Stay strictly within medical context.
Do NOT switch topics.
Do NOT behave like a general chatbot.
`.trim();
}
