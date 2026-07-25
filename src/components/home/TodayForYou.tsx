import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarHeart, Sparkles, MessageCircle } from "lucide-react";
import { TodayForYouSkeleton } from "@/components/ui/page-skeleton";
import { useAssessment } from "@/hooks/useAssessment";
import { useTracker } from "@/hooks/useTracker";
import { CATEGORIES, levelOf } from "@/lib/health/scoring";

function daysBetween(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

function useNextPeriod() {
  const { entries } = useTracker();
  return useMemo(() => {
    const flowDays = entries
      .filter((e) => e.flow !== "none")
      .map((e) => e.date)
      .sort();
    if (flowDays.length === 0) return null;

    const groups: string[][] = [];
    for (const d of flowDays) {
      const last = groups[groups.length - 1];
      if (!last) {
        groups.push([d]);
        continue;
      }
      const diff = (new Date(d).getTime() - new Date(last[last.length - 1]).getTime()) / 86400000;
      if (diff <= 2) last.push(d);
      else groups.push([d]);
    }
    const starts = groups.map((g) => new Date(g[0]));
    if (starts.length < 2) return { lastLog: flowDays[flowDays.length - 1] };
    const gaps: number[] = [];
    for (let i = 1; i < starts.length; i++) {
      gaps.push(daysBetween(starts[i], starts[i - 1]));
    }
    const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    const next = new Date(starts[starts.length - 1].getTime() + avg * 86400000);
    const diff = daysBetween(next, new Date());
    return {
      nextDate: next.toISOString().slice(0, 10),
      inDays: diff,
      avg,
    };
  }, [entries]);
}

export function TodayForYou() {
  const { assessment, ready: aReady } = useAssessment();
  const { ready: tReady } = useTracker();
  const nextPeriod = useNextPeriod();

  if (!aReady || !tReady) return <TodayForYouSkeleton />;

  const topScore = assessment
    ? CATEGORIES.map((c) => ({
        name: c.name,
        score: assessment.scores[c.key],
      })).sort((a, b) => b.score - a.score)[0]
    : null;

  const level = topScore ? levelOf(topScore.score) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mx-auto max-w-7xl px-6"
    >
      <div className="glass-card relative overflow-hidden p-6 md:p-8">
        <div className="mb-5 flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: "var(--accent-gold-soft)" }}
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-gold-soft">
            Today for you
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Cycle card */}
          <Card
            icon={<CalendarHeart className="h-4 w-4" />}
            title="Your cycle"
            body={
              nextPeriod?.inDays !== undefined
                ? nextPeriod.inDays >= 0
                  ? `Next period expected in ~${nextPeriod.inDays} day${nextPeriod.inDays === 1 ? "" : "s"} (${nextPeriod.avg}-day cycle average).`
                  : `You're ${Math.abs(nextPeriod.inDays)} day${Math.abs(nextPeriod.inDays) === 1 ? "" : "s"} past the expected date — log today to keep the rhythm.`
                : nextPeriod?.lastLog
                  ? "Log another period start so Nari can learn your rhythm."
                  : "Log your first period to start seeing gentle predictions."
            }
            cta="Open tracker"
            to="/tracker"
          />

          {/* Assessment card */}
          <Card
            icon={<Sparkles className="h-4 w-4" />}
            title="Your check-in"
            body={
              topScore && level
                ? `Highest signal: ${topScore.name} — ${level.label.toLowerCase()}. Tap to revisit or ask Nari.`
                : "Take a 3-minute check-in so Nari can personalize every answer to you."
            }
            cta={assessment ? "Revisit results" : "Begin check-in"}
            to="/assessment"
            accent={level?.hex}
          />

          {/* Nari card */}
          <Card
            icon={<MessageCircle className="h-4 w-4" />}
            title="Talk to Nari"
            body={
              topScore
                ? `Curious about your ${topScore.name.toLowerCase()} signal? Ask Nari for what it means and what to do next.`
                : "A warm AI companion who knows women's health. Ask anything you'd whisper to a wise sister."
            }
            cta="Chat with Nari"
            to="/ask"
          />
        </div>
      </div>
    </motion.div>
  );
}

function Card({
  icon,
  title,
  body,
  cta,
  to,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  to: string;
  accent?: string;
}) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col gap-3 rounded-2xl border border-hairline bg-bg-alt/50 p-5 transition hover:border-accent-gold-soft/60 hover:bg-bg-alt/80"
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-rose/25 to-accent-gold/20"
          style={accent ? { color: accent } : { color: "var(--accent-gold-soft)" }}
        >
          {icon}
        </span>
        <h3 className="font-serif text-base">{title}</h3>
      </div>
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-gold-soft opacity-70 transition group-hover:opacity-100">
        {cta} →
      </span>
    </Link>
  );
}
