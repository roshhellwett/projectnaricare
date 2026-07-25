import type { SavedAssessment, TrackerEntry, ChatThread } from "../storage";
import { CATEGORIES, levelOf } from "./scoring";

const TRACKER_SYMPTOMS = [
  "cramps",
  "bloating",
  "headache",
  "fatigue",
  "mood swings",
  "acne",
  "breast tenderness",
];

export function buildHealthContext(
  assessments: SavedAssessment[],
  tracker: TrackerEntry[],
  pastThreads: ChatThread[] = [],
  currentThreadId?: string,
): string {
  const lines: string[] = [];

  if (assessments.length > 0) {
    const sorted = [...assessments].sort((a, b) => a.savedAt - b.savedAt);
    const latest = sorted[sorted.length - 1];

    lines.push(
      `User profile (latest): ${latest.raw.age}y, avg cycle ${latest.raw.cycleLength}d, period ${latest.raw.periodLength}d.`,
    );

    lines.push(`Assessment History (${sorted.length} total, most recent first):`);
    [...sorted].reverse().forEach((a) => {
      const date = new Date(a.savedAt).toISOString().split("T")[0];
      const scores = CATEGORIES.map(
        (c) => `${c.name} ${a.scores[c.key]} (${levelOf(a.scores[c.key]).label})`,
      ).join("; ");
      lines.push(`- [${date}]: ${scores}`);
    });

    const activeSym = Object.entries(latest.raw.sym)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (activeSym.length) lines.push(`Latest reported symptoms: ${activeSym.join(", ")}.`);
    if (latest.scores.pregnancyFlag)
      lines.push(`Pregnancy possibility flagged (missed period + unprotected sex).`);
    if (latest.scores.ageNote) lines.push(`Age context: ${latest.scores.ageNote}`);
    if (latest.scores.endometriosis >= 34) {
      lines.push(
        `Endometriosis likelihood score: ${latest.scores.endometriosis} (${levelOf(latest.scores.endometriosis).label}) — consider if pelvic pain + GI symptoms + family history align.`,
      );
    }

    if (sorted.length >= 2) {
      const oldest = sorted[0];
      const newest = sorted[sorted.length - 1];
      const deltas = CATEGORIES.map((c) => {
        const diff = newest.scores[c.key] - oldest.scores[c.key];
        if (Math.abs(diff) >= 10) {
          return `${c.name} ${diff > 0 ? "+" : ""}${diff} pts`;
        }
        return null;
      }).filter(Boolean) as string[];
      if (deltas.length) lines.push(`Score trend (earliest → latest): ${deltas.join(", ")}.`);
    }
  }

  if (tracker.length) {
    const sorted = [...tracker].sort((a, b) => a.date.localeCompare(b.date));
    const recent = sorted.slice(-14);

    const flowDays = sorted.filter((e) => e.flow !== "none").map((e) => e.date);
    let periodsCount = 0;
    if (flowDays.length > 0) {
      periodsCount = 1;
      for (let i = 1; i < flowDays.length; i++) {
        const diff =
          (new Date(flowDays[i]).getTime() - new Date(flowDays[i - 1]).getTime()) / 86400000;
        if (diff > 2) periodsCount++;
      }
    }

    const painScores = sorted.filter((e) => e.flow !== "none").map((e) => e.pain);
    const avgPain = painScores.length
      ? (painScores.reduce((a, b) => a + b, 0) / painScores.length).toFixed(1)
      : null;

    const flowValues = sorted.filter((e) => e.flow !== "none").map((e) => e.flow);
    const heavyCount = flowValues.filter((f) => f === "heavy").length;
    const moderateCount = flowValues.filter((f) => f === "moderate").length;
    const lightCount = flowValues.filter((f) => f === "light").length;
    const totalFlow = heavyCount + moderateCount + lightCount;
    const flowProfile =
      totalFlow > 0 ? `(${lightCount} light, ${moderateCount} moderate, ${heavyCount} heavy)` : "";

    const symptomFrequency: Record<string, number> = {};
    for (const e of sorted) {
      for (const s of e.symptoms) {
        symptomFrequency[s] = (symptomFrequency[s] || 0) + 1;
      }
    }
    const topSymptoms = Object.entries(symptomFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([s, c]) => `${s} (${c}x)`);

    const moodCounts: Record<string, number> = {};
    for (const e of sorted) {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    }
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

    lines.push(
      `Tracker: ${sorted.length} entries, ~${periodsCount} periods logged. ` +
        `Avg period pain ${avgPain ?? "?"}/10. Flow profile ${flowProfile}.`,
    );

    if (topSymptoms.length) lines.push(`Most logged symptoms: ${topSymptoms.join(", ")}.`);

    if (dominantMood)
      lines.push(`Dominant mood: "${dominantMood[0]}" reported ${dominantMood[1]}x.`);

    lines.push(
      `Recent logs (${recent.length}): ` +
        recent
          .map(
            (t) =>
              `[${t.date}] flow=${t.flow} pain=${t.pain}/10 mood=${t.mood}${t.symptoms.length ? ` sym:${t.symptoms.join(",")}` : ""}`,
          )
          .join("; ") +
        ".",
    );
  }

  if (pastThreads.length > 0) {
    const previous = pastThreads.filter((t) => t.id !== currentThreadId && t.messages.length > 0);
    if (previous.length > 0) {
      lines.push(`Previous Conversations (${previous.length} total, last 5 shown):`);
      const sortedThreads = [...previous].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);
      sortedThreads.forEach((t) => {
        const date = new Date(t.updatedAt).toISOString().split("T")[0];
        lines.push(`- [${date}] Topic: "${t.title}"`);
        const recentMsgs = t.messages.slice(-2);
        recentMsgs.forEach((m) => {
          const role = m.role === "user" ? "User" : "Nari";
          const snippet = m.content.length > 100 ? m.content.slice(0, 100) + "..." : m.content;
          lines.push(`  * ${role}: ${snippet}`);
        });
      });
    }
  }

  if (!lines.length) return "No prior assessment, cycle log, or past conversation yet.";
  return lines.join("\n");
}

export function buildContextDepHash(
  assessments: SavedAssessment[],
  tracker: TrackerEntry[],
  threads: ChatThread[],
): string {
  const aHash = assessments.length
    ? `${assessments.length}:${assessments[0]?.savedAt ?? 0}:${assessments[assessments.length - 1]?.savedAt ?? 0}`
    : "0";
  const tHash = tracker.length
    ? `${tracker.length}:${tracker[0]?.date ?? ""}:${tracker[tracker.length - 1]?.date ?? ""}`
    : "0";
  const thHash = threads.length ? `${threads.length}:${threads[0]?.updatedAt ?? 0}` : "0";
  return `${aHash}|${tHash}|${thHash}`;
}

export const SYSTEM_PROMPT = `You are Nari, a warm, knowledgeable AI health companion built into NariCare — a women's menstrual and reproductive-health website. Your users are women seeking to understand their bodies.

Style:
- Warm, empathetic, direct. Speak like a caring older sister who happens to have medical knowledge.
- Use plain language. Explain jargon. Use short paragraphs, occasional bullet points.
- Address emotional context: cycles are personal and can be confusing or scary.
- Use "you" and speak directly to the user.

Medical rules — non-negotiable:
- You are NOT a doctor and CANNOT diagnose. Say this clearly when relevant.
- For red-flag symptoms (severe pelvic pain, heavy bleeding with dizziness, missed period + possibility of pregnancy, fever + pelvic pain, sudden vision changes, bleeding after menopause), urge the user to see a doctor or go to urgent care TODAY. Put this warning up front.
- Never recommend prescription medication dosages. General over-the-counter guidance (e.g. "many women find ibuprofen helps with cramps — check the label") is OK.
- Always end with a gentle nudge to consult a gynaecologist for anything concerning.

Understanding Scores (given in HEALTH CONTEXT):
Each category scores 0-100. Low <34, Moderate 34-63, High >=64.

1. Cycle Irregularity: Higher = more erratic cycles. Factors: cycle length outside 21-35d, variation, missed periods. Age matters: teens often have natural irregularity; women 40+ may have perimenopause-related changes.

2. PCOS Indicators: Higher = more features consistent with PCOS. Factors: long cycles (>35d), variation, missed periods, acne, hirsutism (excess hair), weight gain, hair thinning. Uses Rotterdam-like criteria weighting. NOT a diagnosis — only an ultrasound + blood tests can confirm.

3. Period Pain (Dysmenorrhea): Higher = more severe pain. Factors: pain level (0-10), how often it interferes with daily life, clot size/frequency, headaches. Pain that regularly stops normal activities at score >=64 may suggest endometriosis — encourage discussion with a gynaecologist.

4. Anaemia Risk: Higher = greater risk of iron deficiency. Factors: flow heaviness, clots, period length >5d, fatigue, dizziness. Heavy bleeding + fatigue + dizziness together are strong signals.

5. Stress Load: Higher = lifestyle factors affecting cycle. Factors: stress level, sleep quality, exercise frequency, mood swings, bloating. Chronic high stress can suppress ovulation (hypothalamic amenorrhea).

How to use scores:
- Connect the dots across categories: high PCOS + high Anaemia = suggest iron panel too; high Stress + high Irregularity = lifestyle interventions may help regulate cycles.
- If scores changed between assessments, acknowledge the trajectory ("Your Irregularity score has dropped 15 points since last time — that's great progress").
- Be specific: reference actual score numbers and category names from the context.

Personalization:
- A HEALTH CONTEXT block is provided with the user's assessment scores, cycle tracker logs, and past conversation history. Reference it directly.
- If they haven't done an assessment, suggest it gently.
- If they have tracker data, reference patterns you see ("I notice your last 3 cycles averaged heavier flow").

Scope:
- Discuss: menstrual health, PCOS, endometriosis, adenomyosis, fibroids, anaemia, contraception (general info), pregnancy possibility, nutrition for cycle health, exercise, mental health tied to cycles, when to see a doctor.
- Politely redirect off-topic requests back to women's health.
- If asked about specific medications by name, provide general information (class, common uses) but never recommend a specific dose or say "you should take this."

Format markdown. Keep responses focused — under 250 words unless asked for depth. Use bullet points for lists. Use **bold** for emphasis on important points.`;
