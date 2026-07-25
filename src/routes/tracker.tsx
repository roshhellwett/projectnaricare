import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTracker } from "@/hooks/useTracker";
import { useProfile } from "@/lib/profile";
import { Trash2, Plus, CalendarDays } from "lucide-react";
import { ListSkeleton, CardSkeleton } from "@/components/ui/page-skeleton";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Cycle Tracker · NariCare" },
      {
        name: "description",
        content:
          "Log your periods, flow, pain and mood. See patterns and next-period predictions — all private, all in your browser.",
      },
      { property: "og:title", content: "Cycle Tracker · NariCare" },
      { property: "og:description", content: "Log periods and see your patterns, privately." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackerPage,
});

const FLOW_OPTIONS = ["none", "light", "moderate", "heavy"] as const;
const MOOD_OPTIONS = ["great", "good", "meh", "low", "awful"] as const;
const SYMPTOMS = [
  "cramps",
  "bloating",
  "headache",
  "fatigue",
  "mood swings",
  "acne",
  "breast tenderness",
];
const REMEDIES = [
  "Hot Water Bag",
  "Jeera/Ajwain Water",
  "Haldi Doodh",
  "Yoga/Stretching",
  "Fasting (Upvas)",
  "Rest Day",
];

function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function TrackerPage() {
  const { entries, add, remove, ready } = useTracker();
  const { profile } = useProfile();
  const [date, setDate] = useState(today());
  const [flow, setFlow] = useState<(typeof FLOW_OPTIONS)[number]>("light");
  const [pain, setPain] = useState(2);
  const [mood, setMood] = useState<(typeof MOOD_OPTIONS)[number]>("good");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [remedies, setRemedies] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const periods = useMemo(() => {
    // Group consecutive days with flow != none as periods
    const flowDays = entries
      .filter((e) => e.flow !== "none")
      .map((e) => e.date)
      .sort();
    const groups: string[][] = [];
    for (const d of flowDays) {
      const last = groups[groups.length - 1];
      if (!last) {
        groups.push([d]);
        continue;
      }
      const prev = new Date(last[last.length - 1]);
      const cur = new Date(d);
      const diff = (cur.getTime() - prev.getTime()) / 86400000;
      if (diff <= 2) last.push(d);
      else groups.push([d]);
    }
    return groups;
  }, [entries]);

  const nextPeriod = useMemo(() => {
    if (periods.length < 2) return null;
    const starts = periods.map((g) => new Date(g[0]));
    const gaps: number[] = [];
    for (let i = 1; i < starts.length; i++) {
      gaps.push((starts[i].getTime() - starts[i - 1].getTime()) / 86400000);
    }
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const last = starts[starts.length - 1];
    const next = new Date(last.getTime() + avg * 86400000);
    return { date: next.toISOString().slice(0, 10), avg: Math.round(avg) };
  }, [periods]);

  const submit = () => {
    add({ date, flow, pain, mood, symptoms, remedies, note: note || undefined });
    toast.success("Entry saved", { description: `${date} — ${flow} flow, pain ${pain}/10` });
    setNote("");
    setSymptoms([]);
    setRemedies([]);
  };

  const toggleSym = (s: string) =>
    setSymptoms((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const toggleRem = (r: string) =>
    setRemedies((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="eyebrow justify-center"
        >
          Cycle Tracker
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-accent-gold-soft to-accent-rose pb-2"
        >
          {profile?.name ? `Log today. See tomorrow, ${profile.name}.` : "Log today. See tomorrow."}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-muted-foreground"
        >
          Everything is stored on this device only.
        </motion.p>
      </div>

      <div className="mt-8 md:mt-12 flex flex-col gap-8 md:gap-10">
        {/* LOG FORM */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-7 md:p-9"
        >
          <h2 className="font-serif text-xl">Log an entry</h2>
          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-hairline/50 bg-white/5 px-4 py-3 text-base md:text-sm focus:border-accent-gold-soft focus:outline-none focus:ring-1 focus:ring-accent-gold-soft transition-all"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Flow
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FLOW_OPTIONS.map((f) => {
                  const active = flow === f;
                  return (
                    <motion.button
                      key={f}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFlow(f)}
                      className={`relative rounded-xl px-2 py-3 text-xs capitalize transition-colors ${active ? "bg-gradient-to-br from-primary to-[#a8446a] text-white shadow-lg shadow-primary/30" : "bg-white/5 hover:bg-white/10 text-muted-foreground border border-hairline/30"}`}
                    >
                      {f}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Pain ({pain}/10)
              </label>
              <input
                type="range"
                min={0}
                max={10}
                value={pain}
                onChange={(e) => setPain(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Mood
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {MOOD_OPTIONS.map((m) => {
                  const active = mood === m;
                  return (
                    <motion.button
                      key={m}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMood(m)}
                      className={`relative rounded-xl px-2 py-3 text-xs capitalize transition-colors ${active ? "bg-gradient-to-br from-accent-gold to-accent-gold-soft text-surface font-semibold shadow-lg shadow-accent-gold/30" : "bg-white/5 hover:bg-white/10 text-muted-foreground border border-hairline/30"}`}
                    >
                      {m}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Symptoms
              </label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map((s) => {
                  const active = symptoms.includes(s);
                  return (
                    <motion.button
                      key={s}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleSym(s)}
                      className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${active ? "border-transparent bg-primary text-white shadow-md shadow-primary/20" : "border-hairline hover:border-accent-gold-soft/50 text-muted-foreground bg-white/5"}`}
                    >
                      {s}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Remedies & Context
              </label>
              <div className="flex flex-wrap gap-2">
                {REMEDIES.map((r) => {
                  const active = remedies.includes(r);
                  return (
                    <motion.button
                      key={r}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleRem(r)}
                      className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${active ? "border-transparent bg-accent-gold-soft text-surface shadow-md shadow-accent-gold-soft/20 font-semibold" : "border-hairline hover:border-accent-gold-soft/50 text-muted-foreground bg-white/5"}`}
                    >
                      {r}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl border border-hairline/50 bg-white/5 px-4 py-3 text-base md:text-sm focus:border-accent-gold-soft focus:outline-none focus:ring-1 focus:ring-accent-gold-soft transition-all"
                placeholder="Anything else?"
              />
            </div>
            <button
              onClick={submit}
              className="btn-primary-glow inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" /> Save entry
            </button>
          </div>
        </motion.div>

        {/* BOTTOM COLUMN: HISTORY & INSIGHTS */}
        <div className="space-y-6 flex flex-col">
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> Periods logged
              </div>
              <div className="mt-2 font-serif text-4xl">{periods.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Total distinct cycles recorded</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> Next predicted
              </div>
              <div className="mt-2 font-serif text-2xl">{nextPeriod ? nextPeriod.date : "—"}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {nextPeriod ? `Avg cycle ${nextPeriod.avg} days` : "Log 2+ periods to predict"}
              </p>
            </motion.div>
          </div>

          <div className="glass-card p-6 flex flex-col flex-1 overflow-hidden">
            <h3 className="font-serif text-lg">Recent entries</h3>
            {!ready ? (
              <div className="mt-4">
                <ListSkeleton rows={4} />
              </div>
            ) : entries.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No entries yet. Add today's to get started.
              </p>
            ) : (
              <motion.ul layout className="mt-4 space-y-3 pb-2 flex-1">
                <AnimatePresence initial={false}>
                  {[...entries]
                    .reverse()
                    .slice(0, 12)
                    .map((e) => (
                      <motion.li
                        layout
                        initial={{ opacity: 0, x: -20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{ opacity: 0, scale: 0.8, height: 0 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        key={e.id}
                        className="flex items-center justify-between rounded-2xl border border-hairline/50 bg-white/5 px-5 py-4 text-sm backdrop-blur-sm overflow-hidden"
                      >
                        <div>
                          <div className="font-mono text-xs uppercase tracking-widest text-accent-gold-soft">
                            {e.date}
                          </div>
                          <div className="mt-1 font-medium text-foreground">
                            <span className="capitalize">{e.flow} flow</span>{" "}
                            <span className="text-muted-foreground px-1">•</span> Pain {e.pain}/10{" "}
                            <span className="text-muted-foreground px-1">•</span>{" "}
                            <span className="capitalize">{e.mood}</span>
                          </div>
                          {e.symptoms.length > 0 && (
                            <div className="mt-1.5 text-[11px] text-muted-foreground/80">
                              {e.symptoms.join(", ")}
                            </div>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => remove(e.id)}
                          className="rounded-full p-2.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </motion.li>
                    ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
