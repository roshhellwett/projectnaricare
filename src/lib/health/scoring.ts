import type { AssessmentRaw, AssessmentScores } from "../storage";

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

function ageContext(age: number) {
  if (age < 18) {
    return {
      pcosMult: 0.7,
      irregularityMult: 0.8,
      anaemiaMult: 1.0,
      note: "Cycles are often naturally irregular for the first couple of years after your first period — irregularity alone is weighted a little lower at your age.",
    };
  }
  if (age >= 41) {
    return {
      pcosMult: 0.6,
      irregularityMult: 1.15,
      anaemiaMult: 1.1,
      note: "In your 40s, irregular or heavier cycles are more commonly linked to perimenopause or fibroids than new-onset PCOS — still worth confirming with a doctor.",
    };
  }
  return { pcosMult: 1, irregularityMult: 1, anaemiaMult: 1, note: null as string | null };
}

export function computeScores(r: AssessmentRaw): AssessmentScores {
  const ctx = ageContext(r.age);

  // --- Cycle Irregularity ---
  // Based on FIGO 2018 classification of menstrual disorders
  // Normal: 24-38d cycle length, <7d variation, no missed periods
  let irregularity = 0;
  if (r.cycleLength < 21 || r.cycleLength > 38) irregularity += 30;
  else if (r.cycleLength < 24 || r.cycleLength > 35) irregularity += 15;
  irregularity += r.variation * 12;
  irregularity += r.missed * 14;
  if (r.sym.spotting) irregularity += 12;
  irregularity = clamp(irregularity * ctx.irregularityMult);

  // --- PCOS Indicators ---
  // Aligned with Rotterdam criteria weighting:
  // - Oligo/anovulation (cycle >35d, variation, missed periods)
  // - Clinical hyperandrogenism (hirsutism, acne, hair thinning)
  // - Family history increases likelihood
  // Each criterion group contributes up to ~33 pts
  let pcos = 0;
  if (r.cycleLength > 35) pcos += 18;
  pcos += Math.min(r.variation * 7, 21);
  pcos += Math.min(r.missed * 9, 27);
  if (r.sym.hirsutism) pcos += 20;
  if (r.sym.acne) pcos += 10;
  if (r.sym.hairThin) pcos += 12;
  if (r.sym.weightGain) pcos += 8;
  if (r.familyPCOS) pcos += 10;
  // Metabolic proxy: if both weight gain + sedentary + high variation
  if (r.sym.weightGain && r.exercise === 2 && r.variation >= 2) pcos += 5;
  pcos = clamp(pcos * ctx.pcosMult);

  // --- Dysmenorrhea (Period Pain) ---
  // Based on SOGC Guideline No. 345: Primary Dysmenorrhea
  // Pain severity + functional impact + associated symptoms
  let dysmenorrhea = 0;
  dysmenorrhea += r.painLevel * 6;
  dysmenorrhea += r.painInterference * 16;
  dysmenorrhea += r.clots * 6;
  if (r.sym.headache) dysmenorrhea += 4;
  if (r.sym.nausea) dysmenorrhea += 8;
  if (r.sym.backPain) dysmenorrhea += 6;
  if (r.sym.legPain) dysmenorrhea += 5;
  if (r.sym.painBowel) dysmenorrhea += 8;
  if (r.sym.painIntercourse) dysmenorrhea += 8;
  dysmenorrhea = clamp(dysmenorrhea);

  // --- Anaemia Risk ---
  // Objective flow (pads/tampons per day) + subjective flow + duration + symptoms
  let anaemia = 0;
  anaemia += r.flow * 10;
  anaemia += Math.min(r.flowObjective * 3, 18);
  anaemia += r.clots * 8;
  if (r.periodLength > 7) anaemia += 18;
  else if (r.periodLength > 5) anaemia += 8;
  if (r.sym.fatigue) anaemia += 12;
  if (r.sym.dizziness) anaemia += 14;
  if (r.sym.pallor) anaemia += 8;
  if (r.sym.coldIntolerance) anaemia += 6;
  if (r.sym.pica) anaemia += 10;
  // Heavy flow + exhaustion + dizziness = strong signal
  if (r.flow >= 2 && r.sym.fatigue && r.sym.dizziness) anaemia += 8;
  anaemia = clamp(anaemia * ctx.anaemiaMult);

  // --- Stress Load ---
  // Chronic stress affects HPO axis → hypothalamic amenorrhea
  let stress = 0;
  stress += r.stressLevel * 6;
  stress += r.sleep * 10;
  stress += r.exercise === 2 ? 10 : r.exercise === 3 ? 6 : r.exercise === 0 ? -4 : 0;
  if (r.sym.moodSwings) stress += 10;
  if (r.sym.bloating) stress += 5;
  if (r.sym.breastTender) stress += 3;
  stress += r.missed * 8;
  stress = clamp(stress);

  // --- Endometriosis Likelihood (informational) ---
  // Not a formal score shown in UI, used for context/AI suggestions
  let endometriosis = 0;
  endometriosis += r.painLevel * 6;
  endometriosis += r.painInterference * 12;
  if (r.sym.backPain) endometriosis += 6;
  if (r.sym.legPain) endometriosis += 5;
  if (r.sym.painBowel) endometriosis += 10;
  if (r.sym.painIntercourse) endometriosis += 10;
  if (r.sym.nausea) endometriosis += 6;
  if (r.familyEndo) endometriosis += 12;
  if (r.clots >= 1) endometriosis += 5;
  endometriosis = clamp(endometriosis);

  const pregnancyFlag = r.missed >= 1 && r.pregnancyContext === "unprotected";
  const pregnancyWatch = r.missed >= 1 && r.pregnancyContext === "protected";

  return {
    irregularity,
    pcos,
    dysmenorrhea,
    anaemia,
    stress,
    endometriosis,
    pregnancyFlag,
    pregnancyWatch,
    ageNote: ctx.note,
  };
}

export function levelOf(score: number) {
  if (score < 34) return { label: "Low", hex: "#7fb88b" };
  if (score < 64) return { label: "Moderate", hex: "#e3a857" };
  return { label: "High", hex: "#d9536b" };
}

export const CATEGORIES = [
  { key: "irregularity" as const, name: "Cycle Irregularity" },
  { key: "pcos" as const, name: "PCOS Indicators" },
  { key: "dysmenorrhea" as const, name: "Period Pain" },
  { key: "anaemia" as const, name: "Anaemia Risk" },
  { key: "stress" as const, name: "Stress Load" },
];
