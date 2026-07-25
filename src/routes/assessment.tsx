import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { RiskBloom } from "@/components/visuals/RiskBloom";
import { CATEGORIES, computeScores, levelOf } from "@/lib/health/scoring";
import type { AssessmentRaw, SavedAssessment, Symptom } from "@/lib/storage";
import { storage } from "@/lib/storage";
import { useAssessment } from "@/hooks/useAssessment";
import { ArrowRight, ArrowLeft, RotateCcw, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Cycle Risk Assessment · NariCare" },
      {
        name: "description",
        content:
          "A 3-minute private assessment of your menstrual health across 5 clinically-informed patterns: irregularity, PCOS, pain, anaemia risk, and stress load.",
      },
      { property: "og:title", content: "Cycle Risk Assessment · NariCare" },
      {
        property: "og:description",
        content: "Answer 18 short questions, get a personal risk snapshot in under 3 minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssessmentPage,
});

const STEP_NAMES = ["Basics", "Regularity", "Flow & pain", "Symptoms", "Lifestyle"];
const SYMPTOMS: { key: Symptom; label: string }[] = [
  { key: "acne", label: "Persistent acne" },
  { key: "hirsutism", label: "Excess facial/body hair" },
  { key: "weightGain", label: "Unexplained weight gain" },
  { key: "hairThin", label: "Hair thinning" },
  { key: "fatigue", label: "Frequent fatigue" },
  { key: "dizziness", label: "Dizziness / breathlessness" },
  { key: "moodSwings", label: "Mood swings" },
  { key: "bloating", label: "Bloating" },
  { key: "breastTender", label: "Breast tenderness" },
  { key: "headache", label: "Recurring headaches" },
  { key: "nausea", label: "Nausea / vomiting during period" },
  { key: "backPain", label: "Lower back pain during period" },
  { key: "legPain", label: "Leg pain during period" },
  { key: "painBowel", label: "Pain during bowel movements" },
  { key: "painIntercourse", label: "Pain during intercourse" },
  { key: "pallor", label: "Pale skin / pale nails" },
  { key: "coldIntolerance", label: "Feeling unusually cold" },
  { key: "pica", label: "Craving ice / non-food items" },
  { key: "spotting", label: "Spotting between periods" },
];

const emptyRaw: AssessmentRaw = {
  age: 24,
  cycleLength: 28,
  periodLength: 5,
  variation: -1 as unknown as number,
  missed: -1 as unknown as number,
  pregnancyContext: null,
  flow: -1 as unknown as number,
  flowObjective: -1 as unknown as number,
  clots: -1 as unknown as number,
  painLevel: 3,
  painInterference: -1 as unknown as number,
  stressLevel: 4,
  sleep: -1 as unknown as number,
  exercise: -1 as unknown as number,
  height: -1 as unknown as number,
  weight: -1 as unknown as number,
  familyPCOS: false,
  familyEndo: false,
  sym: {
    acne: false,
    hirsutism: false,
    weightGain: false,
    hairThin: false,
    fatigue: false,
    dizziness: false,
    moodSwings: false,
    bloating: false,
    breastTender: false,
    headache: false,
    nausea: false,
    backPain: false,
    legPain: false,
    painBowel: false,
    painIntercourse: false,
    pallor: false,
    coldIntolerance: false,
    pica: false,
    spotting: false,
  },
};

function AssessmentPage() {
  const { assessment, save } = useAssessment();
  const [showResults, setShowResults] = useState(!!assessment);
  const [raw, setRaw] = useState<AssessmentRaw>(assessment?.raw ?? emptyRaw);
  const [step, setStep] = useState(1);
  const [err, setErr] = useState<string | null>(null);

  const set = <K extends keyof AssessmentRaw>(k: K, v: AssessmentRaw[K]) =>
    setRaw((r) => ({ ...r, [k]: v }));

  const validate = (n: number): string | null => {
    if (n === 1) {
      if (!raw.age || raw.age < 10 || raw.age > 60 || !Number.isInteger(raw.age))
        return "Please enter an age between 10 and 60.";
    }
    if (n === 2) {
      if (raw.variation < 0) return "Pick how much your cycle varies.";
      if (raw.missed < 0) return "Pick how many periods you missed.";
      if (!raw.pregnancyContext) return "Pick a pregnancy-possibility option.";
    }
    if (n === 3) {
      if (raw.flow < 0) return "Pick your flow level.";
      if (raw.flowObjective < 0) return "Estimate how many pads/tampons you use.";
      if (raw.clots < 0) return "Pick a clots option.";
      if (raw.painInterference < 0) return "Pick a pain-interference option.";
    }
    if (n === 5) {
      if (raw.sleep < 0) return "Pick a sleep option.";
      if (raw.exercise < 0) return "Pick an exercise option.";
    }
    return null;
  };

  const next = () => {
    const e = validate(step);
    if (e) {
      setErr(e);
      return;
    }
    setErr(null);
    if (step < 5) setStep(step + 1);
    else {
      const scores = computeScores(raw);
      const s: SavedAssessment = { savedAt: Date.now(), raw, scores };
      save(s);
      toast.success("Assessment saved", { description: "Your results are ready below." });
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const retake = () => {
    setRaw(emptyRaw);
    setStep(1);
    setShowResults(false);
    setErr(null);
  };

  if (showResults) {
    const all = storage.getAssessments();
    const saved = all.length > 0 ? all[0] : null;
    if (!saved) {
      setShowResults(false);
      return null;
    }
    return <Results saved={saved} onRetake={retake} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 overflow-x-hidden">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="eyebrow justify-center"
        >
          Assessment
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 font-serif text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-accent-gold-soft to-accent-rose pb-2"
        >
          Tell us about your last few cycles.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-muted-foreground"
        >
          Estimates are fine — just go with your best recollection.
        </motion.p>
      </div>

      <div className="mt-12 glass-panel p-6 md:p-10 relative">
        <div className="h-1 overflow-hidden rounded-full bg-surface-light">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-gold to-accent-rose"
            initial={false}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>Step {step} of 5</span>
          <span>{STEP_NAMES[step - 1]}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="mt-10"
          >
            {step === 1 && <Step1 raw={raw} set={set} />}
            {step === 2 && <Step2 raw={raw} set={set} />}
            {step === 3 && <Step3 raw={raw} set={set} />}
            {step === 4 && <Step4 raw={raw} set={set} />}
            {step === 5 && <Step5 raw={raw} set={set} />}
          </motion.div>
        </AnimatePresence>

        {err && <p className="mt-4 text-sm text-high">{err}</p>}

        <div className="mt-8 flex items-center justify-between border-t border-hairline pt-6">
          <button
            type="button"
            onClick={() => {
              setStep(Math.max(1, step - 1));
              setErr(null);
            }}
            className={`inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold hover:border-accent-gold-soft ${step === 1 ? "invisible" : ""}`}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            type="button"
            onClick={next}
            className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold"
          >
            {step === 5 ? "See my results" : "Continue"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ------- Step components -------

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      {hint && <p className="mb-3 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

function Choices<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null | number;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <motion.button
            key={String(o.value)}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(o.value)}
            className={`relative rounded-2xl border px-4 py-4 text-sm transition-colors ${
              selected
                ? "border-transparent bg-gradient-to-br from-primary to-[#a8446a] font-semibold text-white shadow-lg shadow-primary/30"
                : "border-hairline/50 bg-white/5 hover:bg-white/10 text-muted-foreground"
            }`}
          >
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}

function Range({
  min,
  max,
  value,
  onChange,
  suffix,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-primary"
      />
      <span className="min-w-14 rounded-lg border border-hairline bg-bg-alt px-3 py-1.5 text-center font-mono text-sm">
        {value}
        {suffix ?? ""}
      </span>
    </div>
  );
}

function Step1({
  raw,
  set,
}: {
  raw: AssessmentRaw;
  set: <K extends keyof AssessmentRaw>(k: K, v: AssessmentRaw[K]) => void;
}) {
  return (
    <div>
      <h3 className="mb-1 font-serif text-2xl">The basics</h3>
      <p className="mb-6 text-sm text-muted-foreground">A few numbers to anchor everything else.</p>
      <Field
        label="Your age"
        hint="Between 10 and 60 — the reproductive age range this tool is built for."
      >
        <input
          type="number"
          min={10}
          max={60}
          value={raw.age || ""}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= 0) set("age", v);
          }}
          onBlur={() => {
            if (raw.age < 10) set("age", 10);
            else if (raw.age > 60) set("age", 60);
          }}
          placeholder="e.g. 24"
          className="w-full rounded-xl border border-hairline bg-bg-alt px-4 py-3 text-base focus:border-accent-gold-soft focus:outline-none"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Height (cm, optional)" hint="For BMI context — skip if unsure.">
          <input
            type="number"
            min={100}
            max={250}
            value={raw.height > 0 ? raw.height : ""}
            onChange={(e) => set("height", Number(e.target.value))}
            placeholder="e.g. 165"
            className="w-full rounded-xl border border-hairline bg-bg-alt px-4 py-3 text-base focus:border-accent-gold-soft focus:outline-none"
          />
        </Field>
        <Field label="Weight (kg, optional)" hint="Rough estimate is fine.">
          <input
            type="number"
            min={30}
            max={250}
            value={raw.weight > 0 ? raw.weight : ""}
            onChange={(e) => set("weight", Number(e.target.value))}
            placeholder="e.g. 65"
            className="w-full rounded-xl border border-hairline bg-bg-alt px-4 py-3 text-base focus:border-accent-gold-soft focus:outline-none"
          />
        </Field>
      </div>
      <Field label="Average cycle length (day 1 to day 1)">
        <Range
          min={15}
          max={60}
          value={raw.cycleLength}
          onChange={(v) => set("cycleLength", v)}
          suffix=" days"
        />
      </Field>
      <Field label="Average period duration">
        <Range
          min={1}
          max={14}
          value={raw.periodLength}
          onChange={(v) => set("periodLength", v)}
          suffix=" days"
        />
      </Field>
    </div>
  );
}

function Step2({
  raw,
  set,
}: {
  raw: AssessmentRaw;
  set: <K extends keyof AssessmentRaw>(k: K, v: AssessmentRaw[K]) => void;
}) {
  return (
    <div>
      <h3 className="mb-1 font-serif text-2xl">Regularity</h3>
      <p className="mb-6 text-sm text-muted-foreground">
        How predictable has your cycle been lately?
      </p>
      <Field label="How much does your cycle length vary month to month?">
        <Choices<number>
          value={raw.variation}
          onChange={(v) => set("variation", v)}
          options={[
            { value: 0, label: "Almost never (±0–2 days)" },
            { value: 1, label: "A little (±3–7 days)" },
            { value: 2, label: "Noticeably (±8–14 days)" },
            { value: 3, label: "A lot (14+ days)" },
          ]}
        />
      </Field>
      <Field label="In the last 6 months, how many periods did you miss entirely?">
        <Choices<number>
          value={raw.missed}
          onChange={(v) => set("missed", v)}
          options={[
            { value: 0, label: "0" },
            { value: 1, label: "1" },
            { value: 2, label: "2–3" },
            { value: 3, label: "4+" },
          ]}
        />
      </Field>
      <Field
        label="Are you sexually active in a way that could result in pregnancy?"
        hint="This matters because a missed period can mean pregnancy, not just irregularity."
      >
        <Choices<"none" | "protected" | "unprotected" | "undisclosed">
          value={raw.pregnancyContext}
          onChange={(v) => set("pregnancyContext", v)}
          options={[
            { value: "none", label: "Not sexually active" },
            { value: "protected", label: "Yes — reliable contraception" },
            { value: "unprotected", label: "Yes — no / inconsistent contraception" },
            { value: "undisclosed", label: "Prefer not to say" },
          ]}
        />
      </Field>
    </div>
  );
}

function Step3({
  raw,
  set,
}: {
  raw: AssessmentRaw;
  set: <K extends keyof AssessmentRaw>(k: K, v: AssessmentRaw[K]) => void;
}) {
  return (
    <div>
      <h3 className="mb-1 font-serif text-2xl">Flow &amp; pain</h3>
      <p className="mb-6 text-sm text-muted-foreground">Details about bleeding and discomfort.</p>
      <Field label="How would you describe your flow?">
        <Choices<number>
          value={raw.flow}
          onChange={(v) => set("flow", v)}
          options={[
            { value: 0, label: "Light" },
            { value: 1, label: "Moderate" },
            { value: 2, label: "Heavy" },
            { value: 3, label: "Very heavy" },
          ]}
        />
      </Field>
      <Field label="On heavy days, how many pads or tampons do you use?">
        <Choices<number>
          value={raw.flowObjective}
          onChange={(v) => set("flowObjective", v)}
          options={[
            { value: 0, label: "0–3 per day" },
            { value: 1, label: "4–6 per day" },
            { value: 2, label: "7–9 per day" },
            { value: 3, label: "10+ per day" },
          ]}
        />
      </Field>
      <Field label="Do you regularly pass large clots?">
        <Choices<number>
          value={raw.clots}
          onChange={(v) => set("clots", v)}
          options={[
            { value: 0, label: "No" },
            { value: 1, label: "Occasionally" },
            { value: 2, label: "Every cycle" },
          ]}
        />
      </Field>
      <Field label="Period pain level (0 = none, 10 = unbearable)">
        <Range min={0} max={10} value={raw.painLevel} onChange={(v) => set("painLevel", v)} />
      </Field>
      <Field label="Does the pain stop you from your normal daily activities?">
        <Choices<number>
          value={raw.painInterference}
          onChange={(v) => set("painInterference", v)}
          options={[
            { value: 0, label: "Never" },
            { value: 1, label: "Sometimes" },
            { value: 2, label: "Most cycles" },
          ]}
        />
      </Field>
    </div>
  );
}

function Step4({
  raw,
  set,
}: {
  raw: AssessmentRaw;
  set: <K extends keyof AssessmentRaw>(k: K, v: AssessmentRaw[K]) => void;
}) {
  const toggle = (k: Symptom) => set("sym", { ...raw.sym, [k]: !raw.sym[k] });
  return (
    <div>
      <h3 className="mb-1 font-serif text-2xl">Other symptoms</h3>
      <p className="mb-6 text-sm text-muted-foreground">
        Select anything you've noticed regularly — not just during your period.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {SYMPTOMS.map((s) => {
          const on = raw.sym[s.key];
          return (
            <motion.button
              key={s.key}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(s.key)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left text-sm transition-colors ${
                on
                  ? "border-transparent bg-gradient-to-br from-primary/90 to-[#a8446a]/90 text-white shadow-lg shadow-primary/20"
                  : "border-hairline/50 bg-white/5 hover:bg-white/10 text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-5 w-5 flex-none items-center justify-center rounded-md transition-colors ${on ? "bg-white text-primary shadow-sm" : "border border-hairline/50 bg-black/20"}`}
              >
                {on && <span className="text-[12px] font-bold">✓</span>}
              </span>
              {s.label}
            </motion.button>
          );
        })}
      </div>
      <div className="mt-6 border-t border-hairline/30 pt-6">
        <Field
          label="Family history"
          hint="Select any that apply — genetics play a role in many cycle conditions."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: "familyPCOS" as const, label: "PCOS (mother / sister)" },
              { key: "familyEndo" as const, label: "Endometriosis (mother / sister)" },
            ].map((f) => {
              const on = raw[f.key];
              return (
                <motion.button
                  key={f.key}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => set(f.key, !on)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left text-sm transition-colors ${
                    on
                      ? "border-transparent bg-gradient-to-br from-primary/90 to-[#a8446a]/90 text-white shadow-lg shadow-primary/20"
                      : "border-hairline/50 bg-white/5 hover:bg-white/10 text-muted-foreground"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded-md transition-colors ${on ? "bg-white text-primary shadow-sm" : "border border-hairline/50 bg-black/20"}`}
                  >
                    {on && <span className="text-[12px] font-bold">✓</span>}
                  </span>
                  {f.label}
                </motion.button>
              );
            })}
          </div>
        </Field>
      </div>
    </div>
  );
}

function Step5({
  raw,
  set,
}: {
  raw: AssessmentRaw;
  set: <K extends keyof AssessmentRaw>(k: K, v: AssessmentRaw[K]) => void;
}) {
  return (
    <div>
      <h3 className="mb-1 font-serif text-2xl">Lifestyle</h3>
      <p className="mb-6 text-sm text-muted-foreground">Context that shapes hormonal balance.</p>
      <Field label="Day-to-day stress level">
        <Range min={0} max={10} value={raw.stressLevel} onChange={(v) => set("stressLevel", v)} />
      </Field>
      <Field label="Average sleep per night">
        <Choices<number>
          value={raw.sleep}
          onChange={(v) => set("sleep", v)}
          options={[
            { value: 0, label: "7–9 hrs" },
            { value: 1, label: "6–7 hrs" },
            { value: 2, label: "Under 6 hrs" },
            { value: 3, label: "Irregular / shift" },
          ]}
        />
      </Field>
      <Field label="How often do you exercise?">
        <Choices<number>
          value={raw.exercise}
          onChange={(v) => set("exercise", v)}
          options={[
            { value: 0, label: "Most days" },
            { value: 1, label: "A few times a week" },
            { value: 2, label: "Rarely" },
            { value: 3, label: "Intense training" },
          ]}
        />
      </Field>
    </div>
  );
}

// ------- Results -------

function Results({ saved, onRetake }: { saved: SavedAssessment; onRetake: () => void }) {
  const { scores } = saved;
  const overallAvg =
    (scores.irregularity + scores.pcos + scores.dysmenorrhea + scores.anaemia + scores.stress) / 5;
  const overall = levelOf(overallAvg);
  const highs = CATEGORIES.filter((c) => scores[c.key] >= 64).map((c) => c.name);

  const summary =
    highs.length === 0
      ? "Nothing here crosses into the high-risk range. Keep tracking your cycle month to month."
      : highs.length === 1
        ? `Everything looks steady except one area — ${highs[0]} — worth a conversation with a doctor.`
        : `${highs.length} areas scored in the high range: ${highs.join(", ")}. A solid checklist for your next doctor's visit.`;

  const recs: string[] = [];
  if (scores.pregnancyFlag)
    recs.push("Take a home pregnancy test first, then see a doctor regardless of result.");
  else if (scores.pregnancyWatch)
    recs.push("Rule out pregnancy with a home test before acting on the irregularity score.");
  if (scores.irregularity >= 34)
    recs.push("Track cycle start dates for 3 months and bring the log to your appointment.");
  if (scores.pcos >= 64)
    recs.push("Ask about a pelvic ultrasound and hormone panel (LH, FSH, testosterone).");
  else if (scores.pcos >= 34)
    recs.push("Mention skin/hair symptoms alongside cycle length at your next check-up.");
  if (scores.dysmenorrhea >= 64)
    recs.push("Persistent disruptive pain can indicate endometriosis — discuss directly.");
  if (scores.anaemia >= 64) recs.push("Ask for a haemoglobin / ferritin blood test.");
  else if (scores.anaemia >= 34)
    recs.push("Consider iron-rich foods and monitor fatigue during heavier days.");
  if (scores.stress >= 64)
    recs.push("Sleep and stress load are high enough to be affecting your cycle.");
  if (!recs.length) recs.push("No urgent flags — a routine annual check-up is still a good idea.");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {scores.pregnancyFlag && (
        <div className="mb-8 rounded-2xl border border-accent-gold/50 bg-accent-gold/10 p-6 text-sm">
          <strong className="text-foreground">Possible pregnancy — please check this first.</strong>{" "}
          You reported a missed period and sexual activity without reliable contraception. Take a
          home pregnancy test now, and see a doctor regardless of the result.
        </div>
      )}
      {!scores.pregnancyFlag && scores.pregnancyWatch && (
        <div className="mb-8 rounded-2xl border border-hairline bg-bg-alt p-6 text-sm">
          <strong className="text-foreground">Quick note:</strong> You reported a missed period.
          Rule out pregnancy with a home test before reading the irregularity score below as a
          cycle-disorder signal.
        </div>
      )}

      <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="flex justify-center">
          <RiskBloom scores={scores} />
        </div>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest"
            style={{ borderColor: overall.hex }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: overall.hex }} />
            Overall: {overall.label} attention
          </div>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl">Your cycle risk snapshot</h1>
          <p className="mt-4 text-muted-foreground">{summary}</p>
          {scores.ageNote && (
            <p className="mt-3 text-sm text-accent-gold-soft">Age context: {scores.ageNote}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/ask"
              className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              <MessageCircle className="h-4 w-4" /> Ask Nari about my results
            </Link>
            <Link
              to="/doctor"
              className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold hover:border-accent-gold-soft hover:text-accent-gold-soft"
            >
              Prepare for a doctor visit
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {CATEGORIES.map((c, i) => {
          const s = scores[c.key];
          const lvl = levelOf(s);
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="glass-card p-6"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="font-serif text-lg">{c.name}</h3>
                <span className="font-mono text-2xl font-semibold" style={{ color: lvl.hex }}>
                  {s}
                </span>
              </div>
              <span
                className="mb-3 inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                style={{ background: `${lvl.hex}22`, color: lvl.hex, borderColor: `${lvl.hex}55` }}
              >
                {lvl.label} risk
              </span>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-light">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s}%` }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: lvl.hex }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-hairline bg-surface p-8">
        <h3 className="font-serif text-xl">Worth raising with a doctor</h3>
        <ul className="mt-4 space-y-2 pl-5 text-sm text-muted-foreground [&>li]:list-disc">
          {recs.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-2xl border border-high/40 bg-high/10 p-6 text-sm text-muted-foreground">
        <strong className="text-foreground">This is not a medical diagnosis.</strong> NariCare
        estimates likelihood patterns from self-reported answers. It cannot replace a consultation,
        ultrasound, or blood test. If any score reads "High," or you're in pain right now, please
        speak with a gynaecologist.
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onRetake}
          className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          <RotateCcw className="h-4 w-4" /> Retake assessment
        </button>
        <Link
          to="/ask"
          className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold hover:border-accent-gold-soft hover:text-accent-gold-soft"
        >
          <MessageCircle className="h-4 w-4" /> Discuss with Nari
        </Link>
      </div>
    </div>
  );
}
