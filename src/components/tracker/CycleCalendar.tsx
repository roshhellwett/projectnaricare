import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TrackerEntry } from "@/lib/storage";
import { formatMonthYearIN, todayIST, IST_TZ } from "@/lib/datetime";

type Props = {
  entries: TrackerEntry[];
  predictedDate?: string | null;
};

function flowColor(flow: TrackerEntry["flow"] | undefined) {
  switch (flow) {
    case "heavy":
      return "bg-gradient-to-br from-primary to-[#a8446a] text-white shadow-md shadow-primary/30";
    case "moderate":
      return "bg-primary/70 text-white";
    case "light":
      return "bg-primary/35 text-foreground";
    default:
      return "";
  }
}

// Current IST year/month at first render — used to seed the calendar cursor.
function istYearMonth(): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  return { year: y, month: m - 1 };
}

function ymd(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function CycleCalendar({ entries, predictedDate }: Props) {
  const [cursor, setCursor] = useState(istYearMonth);

  const byDate = useMemo(() => {
    const map = new Map<string, TrackerEntry>();
    for (const e of entries) map.set(e.date, e);
    return map;
  }, [entries]);

  const { year, month } = cursor;
  // Monday-first (Indian cycle convention). JS getDay: Sun=0…Sat=6 → Mon-first: (getDay+6)%7
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7;
  const todayStr = todayIST();
  const monthLabel = formatMonthYearIN(new Date(Date.UTC(year, month, 15)));

  const cells: Array<{ date: string; day: number } | null> = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: ymd(year, month, d), day: d });
  while (cells.length % 7 !== 0) cells.push(null);

  const shift = (n: number) => {
    const next = new Date(Date.UTC(year, month + n, 1));
    setCursor({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
  };

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shift(-1)}
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => shift(1)}
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        role="grid"
        aria-label={`Cycle calendar for ${monthLabel}`}
      >
        <div
          role="row"
          className="grid grid-cols-7 gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2"
        >
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} role="columnheader" className="text-center py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => {
            if (!c) return <div key={i} role="gridcell" aria-hidden className="aspect-square" />;
            const e = byDate.get(c.date);
            const isToday = c.date === todayStr;
            const isPredicted = predictedDate === c.date;
            const flowClass = flowColor(e?.flow);
            return (
              <motion.div
                key={c.date}
                role="gridcell"
                aria-label={
                  e
                    ? `${c.date}, ${e.flow} flow, pain ${e.pain} of 10`
                    : isPredicted
                      ? `${c.date}, predicted period`
                      : c.date
                }
                aria-current={isToday ? "date" : undefined}
                whileHover={{ scale: 1.06 }}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs relative border transition-colors ${
                  flowClass ||
                  (isPredicted
                    ? "border-dashed border-accent-gold-soft/70 text-accent-gold-soft"
                    : isToday
                      ? "border-accent-gold-soft/60 text-foreground bg-white/5"
                      : "border-transparent text-muted-foreground/70 hover:bg-white/5")
                }`}
                title={
                  e
                    ? `${c.date} — ${e.flow} flow, pain ${e.pain}/10`
                    : isPredicted
                      ? `${c.date} — predicted period`
                      : c.date
                }
              >
                {c.day}
                {e && e.symptoms.length > 0 && (
                  <span className="absolute bottom-1 right-1 h-1 w-1 rounded-full bg-accent-gold-soft" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-primary to-[#a8446a]" /> Heavy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary/70" /> Moderate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary/35" /> Light
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-accent-gold-soft/70" /> Predicted
        </span>
      </div>
    </div>
  );
}
