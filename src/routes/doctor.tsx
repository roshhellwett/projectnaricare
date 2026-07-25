import { createFileRoute, Link } from "@tanstack/react-router";
import { useAssessment } from "@/hooks/useAssessment";
import { CATEGORIES } from "@/lib/health/scoring";
import { storage } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ClipboardList, Check, Sparkles } from "lucide-react";
import { DoctorSkeleton, PageHeaderSkeleton } from "@/components/ui/page-skeleton";
import { useState } from "react";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Doctor Visit Prep · NariCare" },
      {
        name: "description",
        content:
          "A personalized checklist of tests, questions, and cycle data to bring to your gynaecologist — built from your NariCare assessment.",
      },
      { property: "og:title", content: "Doctor Visit Prep · NariCare" },
      {
        property: "og:description",
        content:
          "Create a private doctor-visit checklist from your NariCare assessment and cycle notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DoctorPage,
});

function CheckableItem({
  text,
  index,
  isQuestion = false,
}: {
  text: string;
  index: number;
  isQuestion?: boolean;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => setChecked(!checked)}
      className={`group relative flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all duration-300 ${
        checked ? "bg-white/5 opacity-60" : "hover:bg-white/5"
      }`}
    >
      <div
        className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-colors ${
          checked
            ? "border-accent-gold-soft bg-accent-gold-soft text-primary"
            : isQuestion
              ? "border-accent-rose bg-accent-rose/10 text-accent-rose"
              : "border-muted-foreground/50 text-transparent group-hover:border-accent-gold-soft"
        }`}
      >
        {checked ? (
          <Check className="h-3 w-3" />
        ) : isQuestion ? (
          <span className="text-[10px] font-bold">?</span>
        ) : null}
      </div>

      <div className="relative">
        <span
          className={`text-sm transition-all duration-300 ${checked ? "text-muted-foreground" : "text-foreground"}`}
        >
          {text}
        </span>
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="absolute left-0 top-1/2 h-px w-full origin-left bg-accent-gold-soft shadow-[0_0_8px_rgba(240,201,137,0.8)]"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

function DoctorPage() {
  const { assessment, ready } = useAssessment();
  const cached = !ready ? storage.getAssessments() : null;
  const a = ready ? assessment : cached && cached.length > 0 ? cached[0] : null;

  if (!ready && !a) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <PageHeaderSkeleton />
        <div className="mt-12">
          <DoctorSkeleton />
        </div>
      </div>
    );
  }

  const tests: string[] = [];
  const questions: string[] = [];
  const bring: string[] = ["Your cycle tracker log (from NariCare or a paper diary)"];

  if (a) {
    const { scores, raw } = a;
    if (scores.pregnancyFlag) {
      tests.push("Urine or blood pregnancy test (β-hCG)");
      questions.push(
        "Given my missed period and possibility of pregnancy, what's the safest first step?",
      );
    }
    if (scores.anaemia >= 34) {
      tests.push("Full blood count (CBC)");
      tests.push("Serum ferritin (iron stores)");
      questions.push("My periods are heavy and I'm often tired — could I be iron-deficient?");
    }
    if (scores.pcos >= 34) {
      tests.push("Pelvic ultrasound (transabdominal or transvaginal)");
      tests.push("Hormone panel: LH, FSH, testosterone, SHBG, prolactin, TSH");
      tests.push("Fasting glucose & HbA1c (insulin resistance is common with PCOS)");
      questions.push(
        "My cycle length is " + raw.cycleLength + " days with variation — could this be PCOS?",
      );
    }
    if (scores.dysmenorrhea >= 64) {
      tests.push("Pelvic ultrasound to look for structural causes");
      questions.push(
        "My period pain stops me from normal activities — could this be endometriosis?",
      );
      questions.push("What options do I have beyond over-the-counter painkillers?");
    }
    if (scores.irregularity >= 34) {
      questions.push("Given my cycle variation, is there a hormonal cause worth investigating?");
    }
    if (scores.stress >= 64) {
      questions.push(
        "Could stress and sleep be significantly affecting my cycle — and what do you recommend?",
      );
    }
    bring.push(
      `Note: your last assessment showed ${
        CATEGORIES.filter((c) => scores[c.key] >= 64)
          .map((c) => c.name)
          .join(", ") || "no high-risk patterns"
      }`,
    );
  } else {
    questions.push("General cycle-health check-up");
    tests.push("Full blood count + ferritin (baseline)");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="eyebrow justify-center"
        >
          Doctor visit prep
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 font-serif text-3xl md:text-4xl"
        >
          Walk in prepared. Walk out with answers.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-muted-foreground"
        >
          {a
            ? "Based on your latest scores, here is an interactive checklist for your next appointment."
            : "Take the assessment first for a personalized checklist. General guidance below meanwhile."}
        </motion.p>
      </div>

      {!a && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto mt-6 max-w-md"
        >
          <Link
            to="/assessment"
            className="btn-primary-glow flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            Take the 3-min assessment
          </Link>
        </motion.div>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-7 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent-gold-soft to-accent-rose opacity-50" />
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gold-soft/10 text-accent-gold-soft">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-2xl">Tests to Request</h2>
          </div>
          {tests.length ? (
            <div className="space-y-1">
              {tests.map((t, i) => (
                <CheckableItem key={t} text={t} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground p-3 bg-white/5 rounded-xl">
              No specific tests flagged — a routine check is fine.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-7 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent-rose to-accent-gold-soft opacity-50" />
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-rose/10 text-accent-rose">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-2xl">Questions to Ask</h2>
          </div>
          <div className="space-y-1">
            {questions.map((q, i) => (
              <CheckableItem key={q} text={q} index={i} isQuestion={true} />
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 glass-panel p-7 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h3 className="font-serif text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-gold-soft" />
            What to bring
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {bring.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-accent-gold-soft" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <Link
          to="/ask"
          className="btn-primary-glow flex-none inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold whitespace-nowrap"
        >
          <MessageCircle className="h-4 w-4" /> Ask Nari to expand
        </Link>
      </motion.div>
    </div>
  );
}
