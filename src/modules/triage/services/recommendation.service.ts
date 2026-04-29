import type { SpecialistRecommendation } from "../types";

type KeywordWeight = [string, number];

const SPECIALIST_MAP: Record<string, KeywordWeight[]> = {
  Cardiologist: [
    ["chest pain", 1.0],
    ["heart palpitations", 1.0],
    ["palpitations", 0.9],
    ["irregular heartbeat", 1.0],
    ["high blood pressure", 0.8],
    ["shortness of breath", 0.6],
    ["swollen ankles", 0.7],
    ["chest tightness", 0.9],
    ["heart attack", 1.0],
  ],
  Neurologist: [
    ["severe headache", 1.0],
    ["migraine", 1.0],
    ["seizure", 1.0],
    ["numbness", 0.8],
    ["tingling", 0.8],
    ["dizziness", 0.7],
    ["tremor", 0.9],
    ["memory loss", 0.8],
    ["confusion", 0.7],
    ["headache", 0.6],
    ["stroke", 1.0],
    ["loss of consciousness", 0.9],
  ],
  Pulmonologist: [
    ["chronic cough", 1.0],
    ["wheezing", 1.0],
    ["asthma", 1.0],
    ["shortness of breath", 0.7],
    ["coughing blood", 1.0],
    ["breathing difficulty", 0.9],
    ["persistent cough", 0.9],
    ["difficulty breathing", 0.9],
    ["cough", 0.5],
  ],
  Gastroenterologist: [
    ["abdominal pain", 1.0],
    ["stomach pain", 0.9],
    ["bloating", 0.8],
    ["diarrhea", 0.8],
    ["constipation", 0.8],
    ["acid reflux", 1.0],
    ["heartburn", 0.9],
    ["nausea", 0.6],
    ["vomiting", 0.7],
    ["blood in stool", 1.0],
  ],
  Orthopedist: [
    ["joint pain", 1.0],
    ["back pain", 1.0],
    ["knee pain", 1.0],
    ["fracture", 1.0],
    ["bone pain", 0.9],
    ["sprain", 0.9],
    ["swollen joint", 0.9],
    ["stiffness", 0.7],
    ["muscle pain", 0.6],
  ],
  Dermatologist: [
    ["skin rash", 1.0],
    ["rash", 0.9],
    ["acne", 1.0],
    ["eczema", 1.0],
    ["psoriasis", 1.0],
    ["itchy skin", 0.9],
    ["hives", 0.9],
    ["skin lesion", 0.9],
  ],
  "ENT Specialist": [
    ["ear pain", 1.0],
    ["sore throat", 0.8],
    ["hearing loss", 1.0],
    ["tinnitus", 1.0],
    ["nasal congestion", 0.8],
    ["sinus pain", 0.9],
    ["nosebleed", 0.8],
    ["hoarseness", 0.8],
  ],
  Ophthalmologist: [
    ["blurred vision", 1.0],
    ["eye pain", 1.0],
    ["vision loss", 1.0],
    ["red eye", 0.9],
    ["eye infection", 1.0],
    ["double vision", 1.0],
  ],
  Endocrinologist: [
    ["excessive thirst", 0.9],
    ["frequent urination", 0.8],
    ["weight gain", 0.7],
    ["weight loss", 0.6],
    ["thyroid", 1.0],
    ["diabetes", 1.0],
    ["fatigue", 0.4],
  ],
  Psychiatrist: [
    ["anxiety", 1.0],
    ["depression", 1.0],
    ["insomnia", 0.8],
    ["panic attack", 1.0],
    ["mood swings", 0.9],
    ["hallucinations", 1.0],
    ["suicidal thoughts", 1.0],
  ],
  Rheumatologist: [
    ["joint swelling", 1.0],
    ["arthritis", 1.0],
    ["lupus", 1.0],
    ["chronic fatigue", 0.7],
    ["morning stiffness", 0.9],
    ["joint pain", 0.6],
  ],
  Urologist: [
    ["painful urination", 1.0],
    ["blood in urine", 1.0],
    ["frequent urination", 0.7],
    ["kidney pain", 0.9],
    ["urinary incontinence", 1.0],
  ],
  Allergist: [
    ["allergic reaction", 1.0],
    ["allergy", 1.0],
    ["sneezing", 0.7],
    ["watery eyes", 0.7],
    ["hives", 0.7],
    ["swelling", 0.6],
    ["anaphylaxis", 1.0],
  ],
};

export function recommendSpecialist(
  symptoms: string[]
): SpecialistRecommendation {
  if (symptoms.length === 0) {
    return {
      specialist: "General Physician",
      confidence: 0.5,
      reasoning:
        "No specific symptoms detected. A General Physician can perform an initial assessment.",
      alternatives: [],
    };
  }

  const joined = symptoms.join(" ").toLowerCase();
  const scores: Record<string, number> = {};
  const matchedKeywords: Record<string, string[]> = {};

  for (const [specialist, keywordWeights] of Object.entries(SPECIALIST_MAP)) {
    let score = 0;
    const matches: string[] = [];
    for (const [keyword, weight] of keywordWeights) {
      if (joined.includes(keyword)) {
        score += weight;
        matches.push(keyword);
      }
    }
    if (score > 0) {
      scores[specialist] = score;
      matchedKeywords[specialist] = matches;
    }
  }

  if (Object.keys(scores).length === 0) {
    return {
      specialist: "General Physician",
      confidence: 0.5,
      reasoning: `Symptoms (${symptoms.join(", ")}) did not match a specific specialty. A General Physician is recommended.`,
      alternatives: [],
    };
  }

  const ranked = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [topSpecialist, topScore] = ranked[0];

  const maxPossible = SPECIALIST_MAP[topSpecialist].reduce(
    (sum, [, w]) => sum + w,
    0
  );
  const confidence = Math.min(Math.round((topScore / maxPossible) * 100) / 100, 1.0);

  const matchStr = matchedKeywords[topSpecialist].join(", ");
  const reasoning = `Based on symptoms matching: ${matchStr}. A ${topSpecialist} is recommended for further evaluation.`;

  const alternatives = ranked
    .slice(1, 4)
    .filter(([, s]) => s > 0)
    .map(([name]) => name);

  return {
    specialist: topSpecialist,
    confidence,
    reasoning,
    alternatives,
  };
}
