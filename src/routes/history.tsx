import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CalendarDays, Activity, Trash2, TrendingUp, Info } from "lucide-react";
import { storage, type SavedAssessment } from "@/lib/storage";
import { CATEGORIES, levelOf } from "@/lib/health/scoring";
import { RiskBloom } from "@/components/visuals/RiskBloom";
import { ListSkeleton } from "@/components/ui/page-skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useProfile } from "@/lib/profile";
import { formatDateIN, formatDateShortIN } from "@/lib/datetime";


export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Assessment History · NariCare" },
      {
        name: "description",
        content: "View your past cycle risk assessments and track your health journey over time.",
      },
    ],
  }),
  component: HistoryPage,
});

function getCategoryDescription(key: string, score: number) {
  if (score < 34) {
    return "Normal range. No immediate concern, you're doing well!";
  }
  if (key === "dysmenorrhea") {
    return score >= 64 
      ? "Severe pain preventing daily activities. Could indicate Endometriosis or Fibroids. Please consult a doctor." 
      : "Moderate cramps. If they worsen, consider a check-up.";
  }
  if (key === "pcos") {
    return score >= 64 
      ? "Strong indicators of hormonal imbalance (e.g. acne, hair changes, irregular cycles). A PCOS screening is highly recommended." 
      : "Some mild hormonal symptoms. Keep tracking.";
  }
  if (key === "irregularity") {
    return score >= 64 
      ? "Highly erratic cycle lengths. This can affect fertility and indicates hormonal fluctuations." 
      : "Slight cycle variation. Usually normal, but keep an eye on it.";
  }
  if (key === "anaemia") {
    return score >= 64 
      ? "High risk of iron deficiency due to heavy flow, fatigue, or dizziness. A CBC blood test is recommended." 
      : "Mild fatigue or flow issues. Ensure you eat iron-rich foods (palak, gud, chana).";
  }
  if (key === "stress") {
    return score >= 64 
      ? "High chronic stress is actively impacting your cycle health and causing physical symptoms. Prioritize rest, yaar." 
      : "Moderate stress levels. Try to find time to relax and unwind.";
  }
  return "Elevated risk. Keep monitoring.";
}

function HistoryPage() {
  const { profile } = useProfile();
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [ready, setReady] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [activeChartMetric, setActiveChartMetric] = useState<string>("dysmenorrhea");

  useEffect(() => {
    setAssessments(storage.getAssessments().sort((a, b) => b.savedAt - a.savedAt));
    setReady(true);
  }, []);

  const handleDelete = (e: React.MouseEvent, savedAt: number) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this assessment record?")) return;
    
    const newAssessments = assessments.filter(a => a.savedAt !== savedAt);
    storage.setAssessments(newAssessments);
    setAssessments(newAssessments);
    if (openId === savedAt) setOpenId(null);
  };

  const graphData = useMemo(() => {
    // Sort chronologically for the graph
    return [...assessments].sort((a, b) => a.savedAt - b.savedAt).map(a => {
      const date = formatDateShortIN(a.savedAt);
      return {
        date,
        dysmenorrhea: a.scores.dysmenorrhea,
        pcos: a.scores.pcos,
        irregularity: a.scores.irregularity,
        anaemia: a.scores.anaemia,
        stress: a.scores.stress
      };
    });
  }, [assessments]);

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
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 md:py-16">
      <div className="text-center mb-12">
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
          className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-accent-gold-soft to-accent-rose pb-2"
        >
          {profile?.name ? `${profile.name}'s Health Timeline` : "Assessment History"}
        </motion.h1>
      </div>

      {/* Visual Graph Section */}
      {assessments.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 md:p-8 mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent-rose to-accent-gold-soft opacity-30" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gold-soft/10 text-accent-gold-soft">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl">Health Trends</h2>
                <p className="text-xs text-muted-foreground">Visualize your scores over time</p>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap w-full">
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  onClick={() => setActiveChartMetric(c.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeChartMetric === c.key 
                      ? "bg-accent-gold-soft text-primary shadow-sm" 
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[220px] sm:h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1515', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#E8B9A0' }}
                />
                <Line 
                  type="monotone" 
                  dataKey={activeChartMetric} 
                  name={CATEGORIES.find(c => c.key === activeChartMetric)?.name || activeChartMetric}
                  stroke="#E8B9A0" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#E8B9A0", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#F28C8C", strokeWidth: 0 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* History List */}
      <div className="space-y-4">
        {assessments.map((a, i) => {
          const date = formatDateIN(a.savedAt);

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
              className="glass-panel overflow-hidden relative"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : a.savedAt)}
                className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left transition-colors hover:bg-white/[0.02] pr-16"
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

              {/* Absolute positioned delete button to not interfere with accordion click */}
              <button
                onClick={(e) => handleDelete(e, a.savedAt)}
                className="absolute right-6 top-6 p-2 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors z-10"
                title="Delete Assessment"
              >
                <Trash2 className="h-5 w-5" />
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
                      <div className="flex-none scale-90 md:scale-100 flex flex-col items-center">
                        <RiskBloom scores={a.scores} />
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-mono text-center max-w-[120px]">
                          Your Health Snapshot
                        </p>
                      </div>
                      
                      <div className="flex-1 w-full grid gap-4 sm:grid-cols-2">
                        {CATEGORIES.map((c) => {
                          const s = a.scores[c.key];
                          const lvl = levelOf(s);
                          const description = getCategoryDescription(c.key, s);
                          
                          return (
                            <div key={c.key} className="glass-card p-5 relative overflow-hidden group">
                              <div className="mb-3 flex items-start justify-between">
                                <h4 className="font-serif text-base">{c.name}</h4>
                                <span
                                  className="font-mono text-xl font-semibold"
                                  style={{ color: lvl.hex }}
                                >
                                  {s}
                                </span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-white/10 mb-3">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${s}%` }}
                                  transition={{ delay: 0.2, duration: 0.8 }}
                                  className="h-full rounded-full"
                                  style={{ background: lvl.hex }}
                                />
                              </div>
                              <div className="flex items-start gap-2 text-xs text-muted-foreground/80 leading-relaxed bg-white/5 p-2 rounded-lg">
                                <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-accent-gold-soft/70" />
                                <p>{description}</p>
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
