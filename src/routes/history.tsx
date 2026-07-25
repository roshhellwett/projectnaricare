import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CalendarDays, Activity } from "lucide-react";
import { storage, type SavedAssessment } from "@/lib/storage";
import { CATEGORIES, levelOf } from "@/lib/health/scoring";
import { RiskBloom } from "@/components/visuals/RiskBloom";
import { ListSkeleton } from "@/components/ui/page-skeleton";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Assessment History · NariCare" },
      {
        name: "description",
        content: "View your past cycle risk assessments and track your health journey over time.",
      },
      { property: "og:title", content: "Assessment History · NariCare" },
      {
        property: "og:description",
        content: "Review your saved NariCare risk snapshots and follow your cycle-health timeline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [ready, setReady] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    setAssessments(storage.getAssessments().sort((a, b) => b.savedAt - a.savedAt));
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-4">
          <ListSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="glass-panel max-w-md p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent-gold-soft to-accent-rose" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-hairline/50 mb-6">
            <Activity className="h-7 w-7 text-accent-gold-soft" />
          </div>
          <h2 className="font-serif text-3xl mb-3">No History Yet</h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            You haven't completed any assessments yet. Take your first assessment to start building
            your health timeline.
          </p>
          <Link
            to="/assessment"
            className="btn-primary-glow inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold"
          >
            Take Assessment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="eyebrow justify-center"
        >
          Your Timeline
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 font-serif text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-accent-gold-soft to-accent-rose pb-2"
        >
          Assessment History
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-muted-foreground"
        >
          Track your cycle risk scores over time.
        </motion.p>
      </div>

      <div className="mt-12 space-y-4">
        {assessments.map((a, i) => {
          const date = new Date(a.savedAt).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const overallAvg =
            (a.scores.irregularity +
              a.scores.pcos +
              a.scores.dysmenorrhea +
              a.scores.anaemia +
              a.scores.stress) /
            5;
          const overall = levelOf(overallAvg);
          const isOpen = openId === a.savedAt;

          return (
            <motion.div
              key={a.savedAt}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel overflow-hidden"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : a.savedAt)}
                className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="hidden h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white/5 border border-hairline/50 text-accent-gold-soft sm:flex">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl">{date}</h3>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: overall.hex, boxShadow: `0 0 10px ${overall.hex}88` }}
                      />
                      <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        Overall: {overall.label}
                      </span>
                    </div>
                  </div>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-hairline/50 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center bg-black/10">
                      <div className="flex-none scale-90 md:scale-100">
                        <RiskBloom scores={a.scores} />
                      </div>
                      <div className="flex-1 w-full grid gap-4 sm:grid-cols-2">
                        {CATEGORIES.map((c) => {
                          const s = a.scores[c.key];
                          const lvl = levelOf(s);
                          return (
                            <div key={c.key} className="glass-card p-4">
                              <div className="mb-2 flex items-start justify-between">
                                <h4 className="font-serif text-sm">{c.name}</h4>
                                <span
                                  className="font-mono text-lg font-semibold"
                                  style={{ color: lvl.hex }}
                                >
                                  {s}
                                </span>
                              </div>
                              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${s}%` }}
                                  transition={{ delay: 0.2, duration: 0.8 }}
                                  className="h-full rounded-full"
                                  style={{ background: lvl.hex }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
