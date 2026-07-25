import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, CheckCircle2, Sparkles } from "lucide-react";
import { useTracker } from "@/hooks/useTracker";

// Indian-context specific remedy mapping
const REMEDY_MAP: Record<string, { category: string; items: string[] }> = {
  cramps: { category: "Pain Relief", items: ["Ajwain (carom seeds)", "Hot water bag", "Meftal-Spas or Ibuprofen"] },
  bloating: { category: "Digestion", items: ["Jeera (cumin) water", "Pudina (mint) tea"] },
  headache: { category: "Relief", items: ["Amrutanjan or Zandu Balm", "Ginger tea"] },
  fatigue: { category: "Energy (Iron)", items: ["Jaggery (Gud)", "Roasted Chana", "Dates"] },
  acne: { category: "Skincare", items: ["Pimple patches", "Turmeric (Haldi)"] },
};

const DEFAULT_REMEDIES = [
  { category: "Essentials", items: ["Pads / Menstrual Cup", "Dark Chocolate or favorite comfort snack"] },
];

export function useRestockPredictor(nextPeriodInDays: number | undefined) {
  const { entries } = useTracker();

  return useMemo(() => {
    // Only trigger 1 to 5 days before the period
    if (nextPeriodInDays === undefined || nextPeriodInDays < 0 || nextPeriodInDays > 5) {
      return null;
    }

    // Simple heuristic: just look at all symptoms logged in the last 60 days
    const cutoffMs = Date.now() - 60 * 86400000;
    const recentEntries = entries.filter((e) => {
      const [y, m, d] = e.date.split("-").map(Number);
      return Date.UTC(y, (m ?? 1) - 1, d ?? 1, -5, -30) >= cutoffMs;
    });

    const symptomCounts: Record<string, number> = {};
    
    let heavyFlowCount = 0;
    
    recentEntries.forEach(entry => {
      if (entry.flow === "heavy") heavyFlowCount++;
      entry.symptoms.forEach(sym => {
        symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
      });
    });

    // Determine predicted needs based on frequency
    const predictedCategories: { category: string; items: string[] }[] = [...DEFAULT_REMEDIES];
    
    if (heavyFlowCount >= 2) {
       predictedCategories.push({
         category: "Heavy Flow Needs",
         items: ["Overnight Pads", "Palak (Spinach) or Iron supplements"]
       });
    }

    // Add remedies for frequently logged symptoms (logged at least 2 times recently)
    Object.entries(symptomCounts).forEach(([sym, count]) => {
      if (count >= 2 && REMEDY_MAP[sym]) {
        // Prevent duplicate categories
        if (!predictedCategories.find(c => c.category === REMEDY_MAP[sym].category)) {
          predictedCategories.push(REMEDY_MAP[sym]);
        }
      }
    });

    return predictedCategories;
  }, [entries, nextPeriodInDays]);
}

export function RestockPredictor({ nextPeriodInDays }: { nextPeriodInDays: number | undefined }) {
  const predictedList = useRestockPredictor(nextPeriodInDays);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  if (!predictedList) return null;

  const toggleItem = (item: string) => {
    const next = new Set(checkedItems);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setCheckedItems(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-6 overflow-hidden rounded-2xl border border-accent-gold-soft/30 bg-gradient-to-br from-accent-gold-soft/5 to-transparent p-1"
    >
      <div className="rounded-xl bg-background/80 p-5 backdrop-blur-md">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-serif text-lg text-accent-gold-soft">
              <ShoppingBag className="h-5 w-5" />
              Nari's Restock Predictor
            </h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Based on your history, you might need these in ~{nextPeriodInDays} days. Nari has suggested practical Indian household remedies (Gharelu Nuskhe) mapped to your past symptoms.
            </p>
          </div>
          <Sparkles className="h-5 w-5 text-accent-gold-soft opacity-50 shrink-0" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {predictedList.map((group, i) => (
            <div key={i} className="rounded-lg border border-hairline bg-surface/50 p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.category}
              </h4>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => {
                  const isChecked = checkedItems.has(item);
                  return (
                    <li
                      key={item}
                      onClick={() => toggleItem(item)}
                      className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-accent-gold-soft"
                    >
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isChecked ? "text-accent-gold-soft" : "text-hairline"
                        }`}
                      />
                      <span className={isChecked ? "line-through opacity-50" : ""}>{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
