import { createFileRoute, Link } from "@tanstack/react-router";
import { useAssessment } from "@/hooks/useAssessment";
import { CATEGORIES } from "@/lib/health/scoring";
import { storage, type SavedAssessment } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ClipboardList, Check, Sparkles, Printer, Activity, ShieldCheck, AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/lib/profile";
import { DoctorSkeleton, PageHeaderSkeleton } from "@/components/ui/page-skeleton";
import { useState, useMemo, useEffect } from "react";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Doctor Visit Prep · NariCare" },
      {
        name: "description",
        content:
          "A personalized clinical checklist built from your NariCare assessment.",
      },
    ],
  }),
  component: DoctorPage,
});

type RecommendationItem = {
  text: string;
  reason?: string;
};

// Fallback logic if AI fails
function useDoctorRecommendations(a: SavedAssessment | null) {
  return useMemo(() => {
    const tests: RecommendationItem[] = [];
    const questions: RecommendationItem[] = [];
    const bring: string[] = ["Your cycle tracker log (from NariCare or a paper diary)"];
    
    if (a) {
      const { scores, raw } = a;
      if (scores.pregnancyFlag) {
        tests.push({ text: "Urine or blood pregnancy test (β-hCG)", reason: "Flagged due to a missed period." });
        questions.push({ text: "Given my missed period, what is the safest first step?", reason: "To confirm or rule out pregnancy." });
      }
      if (scores.anaemia >= 34) {
        tests.push({ text: "Full blood count (CBC) & Serum ferritin", reason: "Symptoms indicating potential iron deficiency." });
        questions.push({ text: "I have been feeling fatigued with heavy flow — could I be iron-deficient?", reason: "Discuss symptom correlation with anaemia." });
      }
      if (scores.pcos >= 34) {
        tests.push({ text: "Pelvic ultrasound & Hormone panel", reason: "Symptoms consistent with PCOS patterns." });
        tests.push({ text: "Fasting glucose & HbA1c", reason: "Insulin resistance is commonly associated with PCOS." });
        questions.push({ text: "My cycle length is " + raw.cycleLength + " days with variation — could this be PCOS?", reason: "Explore hormonal causes for irregular cycles." });
      }
      if (scores.dysmenorrhea >= 64) {
        tests.push({ text: "Pelvic ultrasound", reason: "Severe pain interfering with activities." });
        questions.push({ text: "My period pain stops me from normal activities — is it possible this is endometriosis?", reason: "Ensure severe pain is not dismissed." });
        questions.push({ text: "What options do I have beyond standard painkillers?", reason: "Explore long-term pain management." });
      }
      if (scores.irregularity >= 34) {
        questions.push({ text: "Given my cycle variation, is there a hormonal cause worth investigating?", reason: "Patient logged highly erratic cycles." });
      }
      if (scores.stress >= 64) {
        questions.push({ text: "Could stress and sleep be significantly affecting my cycle?", reason: "Patient logged chronic high stress." });
      }
    } else {
      questions.push({ text: "General cycle-health check-up" });
      tests.push({ text: "Full blood count + ferritin (baseline)" });
    }

    return { tests, questions, bring };
  }, [a]);
}

function CheckableItem({ item, index, isQuestion = false }: { item: RecommendationItem; index: number; isQuestion?: boolean }) {
  const [checked, setChecked] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => setChecked(!checked)}
      className={`group relative flex w-full items-start gap-3 rounded-xl p-4 text-left transition-all duration-300 ${
        checked ? "bg-white/5 opacity-60" : "hover:bg-white/5 border border-transparent hover:border-white/5"
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
        {checked ? <Check className="h-3 w-3" /> : isQuestion ? <span className="text-[10px] font-bold">?</span> : null}
      </div>

      <div className="relative flex-1">
        <span className={`block text-sm transition-all duration-300 font-medium ${checked ? "text-muted-foreground" : "text-foreground"}`}>
          {item.text}
        </span>
        {item.reason && (
          <span className={`mt-1 block text-xs leading-relaxed transition-all duration-300 ${checked ? "text-muted-foreground/50" : "text-muted-foreground/80"}`}>
            {item.reason}
          </span>
        )}
      </div>
    </motion.button>
  );
}

function DoctorPrintView({ tests, questions }: { tests: RecommendationItem[], questions: RecommendationItem[] }) {
  const allAssessments = storage.getAssessments().sort((a, b) => b.savedAt - a.savedAt);
  const recentAssessments = allAssessments.slice(0, 3);
  
  if (recentAssessments.length === 0) return null;
  const date = new Date().toLocaleDateString();

  return (
    <div className="hidden print:flex flex-col w-full bg-white text-black font-sans">
      {/* PAGE 1: AI SUMMARY */}
      <div className="min-h-[100dvh] p-6 flex flex-col">
        <div className="border-b-2 border-black pb-3 mb-5">
          <h1 className="text-2xl font-serif font-bold text-black">Clinical Summary</h1>
          <p className="text-gray-600 mt-1 text-sm font-medium">Generated via NariCare on {date}</p>
          
          <div className="mt-3 p-3 border border-gray-300 bg-gray-50 rounded text-xs italic text-gray-700 leading-relaxed">
            <strong>Disclaimer:</strong> This report was generated by the patient to assist during clinical consultation. It is a record of patient-logged symptoms and concerns, and is not a medical diagnosis. The requested tests are suggestions for your clinical consideration.
          </div>
        </div>

        <div className="mb-5 flex-1">
          <h2 className="text-lg font-serif font-semibold border-b border-gray-200 pb-1 mb-3">Patient Concerns & Tests to Consider</h2>
          {tests.length === 0 ? (
            <p className="text-xs text-gray-600 italic">No specific tests flagged.</p>
          ) : (
            <ul className="space-y-3">
              {tests.map((t, i) => (
                <li key={i} className="pl-3 border-l-2 border-gray-300">
                  <p className="font-semibold text-sm">{t.text}</p>
                  {t.reason && <p className="text-xs text-gray-600 mt-0.5">{t.reason}</p>}
                </li>
              ))}
            </ul>
          )}

          <h2 className="text-lg font-serif font-semibold border-b border-gray-200 pb-1 mb-3 mt-6">Questions for Discussion</h2>
          <ul className="space-y-3">
            {questions.map((q, i) => (
              <li key={i} className="pl-3 border-l-2 border-gray-300">
                <p className="font-semibold text-sm">{q.text}</p>
                {q.reason && <p className="text-xs text-gray-600 mt-0.5">{q.reason}</p>}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="text-xs text-gray-500 font-serif italic text-center mt-6 pt-4 border-t border-gray-200">
          "You know your body best. Never let anyone tell you otherwise." 🌸 With love, Nari
        </div>
      </div>

      {/* PAGES 2, 3, 4: ASSESSMENT RAW SCORES */}
      {recentAssessments.map((a, idx) => {
        const assessmentDate = new Date(a.savedAt).toLocaleDateString();
        return (
          <div key={a.savedAt} className="min-h-[100dvh] p-6 flex flex-col break-before-page">
             <div className="border-b-2 border-black pb-3 mb-5">
                <h1 className="text-2xl font-serif font-bold text-black">Health Assessment Snapshot</h1>
                <p className="text-gray-600 mt-1 text-sm font-medium">Logged on {assessmentDate} {idx === 0 ? "(Most Recent)" : `(Historical)`}</p>
             </div>

             <div className="mb-6 grid grid-cols-3 gap-4">
               <div className="p-3 border border-gray-200 rounded">
                 <p className="text-xs text-gray-500 uppercase tracking-wide">Age</p>
                 <p className="font-semibold text-lg">{a.raw.age}</p>
               </div>
               <div className="p-3 border border-gray-200 rounded">
                 <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Cycle Length</p>
                 <p className="font-semibold text-lg">{a.raw.cycleLength} days</p>
               </div>
               <div className="p-3 border border-gray-200 rounded">
                 <p className="text-xs text-gray-500 uppercase tracking-wide">Period Length</p>
                 <p className="font-semibold text-lg">{a.raw.periodLength} days</p>
               </div>
             </div>

             <h2 className="text-lg font-serif font-semibold border-b border-gray-200 pb-1 mb-3">Clinical Risk Scores</h2>
             <div className="space-y-4 mb-6">
                {CATEGORIES.map(c => {
                  const score = a.scores[c.key as keyof typeof a.scores] as number;
                  let severity = "Low";
                  if (score >= 64) severity = "High (Flagged)";
                  else if (score >= 34) severity = "Moderate";

                  return (
                    <div key={c.key} className="flex justify-between items-center border-b border-gray-100 pb-2">
                       <div>
                         <p className="font-medium text-sm">{c.name}</p>
                         <p className={`text-xs ${score >= 64 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>{severity} Risk</p>
                       </div>
                       <div className="text-lg font-mono font-semibold">{score}/100</div>
                    </div>
                  );
                })}
             </div>

             {a.raw.sym && Object.values(a.raw.sym).some(Boolean) && (
               <>
                 <h2 className="text-lg font-serif font-semibold border-b border-gray-200 pb-1 mb-3">Logged Symptoms</h2>
                 <ul className="list-disc pl-5 text-sm text-gray-700">
                   {Object.entries(a.raw.sym)
                     .filter(([_, value]) => value)
                     .map(([key]) => (
                       <li key={key} className="mb-1 capitalize">
                         {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                       </li>
                     ))}
                 </ul>
               </>
             )}

             {a.raw.notes && a.raw.notes.trim() !== "" && (
               <>
                 <h2 className="text-lg font-serif font-semibold border-b border-gray-200 pb-1 mb-3 mt-6">Patient Notes</h2>
                 <p className="text-sm text-gray-700 whitespace-pre-wrap italic">"{a.raw.notes}"</p>
               </>
             )}
          </div>
        );
      })}
    </div>
  );
}


function DoctorPage() {
  const { assessment, ready } = useAssessment();
  const { profile } = useProfile();
  const cached = !ready ? storage.getAssessments() : null;
  const a = ready ? assessment : cached && cached.length > 0 ? cached[0] : null;

  const fallbackData = useDoctorRecommendations(a);

  const [status, setStatus] = useState<'idle' | 'analyzing' | 'complete' | 'error'>('idle');
  const [shouldVisitDoctor, setShouldVisitDoctor] = useState<boolean>(false);
  const [didiMessage, setDidiMessage] = useState<string>('');
  const [aiTests, setAiTests] = useState<RecommendationItem[]>([]);
  const [aiQuestions, setAiQuestions] = useState<RecommendationItem[]>([]);
  
  const [loadingIndex, setLoadingIndex] = useState(0);

  // Dynamic loading phrases based on latest assessment scores
  const LOADING_PHRASES = useMemo(() => {
    const phrases = ["Hmm, let me pull up your cycle logs..."];
    if (a) {
      if (a.scores.dysmenorrhea > 50) phrases.push("I see you've been dealing with some tough cramps, yaar. Let's look into that...");
      if (a.scores.irregularity > 50) phrases.push("Noticing some variation in your cycle lengths here...");
      if (a.scores.stress > 50) phrases.push("Your stress levels have been quite high. Let's factor that in...");
    }
    phrases.push("Reviewing your historical patterns...");
    phrases.push("Compiling your clinical triage report...");
    return phrases;
  }, [a]);

  useEffect(() => {
    if (status === 'analyzing') {
      const timer = setInterval(() => {
        setLoadingIndex((i) => (i + 1) % LOADING_PHRASES.length);
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [status, LOADING_PHRASES.length]);

  const handleAnalyze = async () => {
    setStatus('analyzing');
    setLoadingIndex(0);

    const allAssessments = storage.getAssessments();
    const trackerLogs = storage.getTracker();

    try {
      const res = await fetch("/api/doctor-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          context: JSON.stringify({ assessments: allAssessments, trackerEntries: trackerLogs }),
          profile
        })
      });

      if (!res.ok) throw new Error("API Failed");

      const data = await res.json();
      setShouldVisitDoctor(data.shouldVisitDoctor);
      setDidiMessage(data.message);
      setAiTests(data.tests || []);
      setAiQuestions(data.questions || []);
      setStatus('complete');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const activeQuestions = status === 'complete' ? aiQuestions : fallbackData.questions;
    const activeTests = status === 'complete' ? aiTests : fallbackData.tests;
    const text = `NariCare Clinical Checklist\n\nQuestions for Discussion:\n${activeQuestions.map(q => `- ${q.text}`).join('\n')}\n\nTests to Consider:\n${activeTests.map(t => `- ${t.text}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    toast.success("Checklist copied to clipboard!");
  };

  if (!ready && !a) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 md:py-16 print:hidden">
        <PageHeaderSkeleton />
        <div className="mt-12">
          <DoctorSkeleton />
        </div>
      </div>
    );
  }

  if (ready && !a) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 md:py-16 print:hidden">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 rounded-2xl border border-accent-gold-soft/30 bg-gradient-to-br from-accent-gold-soft/10 via-transparent to-accent-rose/5 p-6 md:p-10 text-center flex flex-col items-center"
        >
          <Activity className="h-10 w-10 text-accent-gold-soft mb-4" />
          <h2 className="font-serif text-3xl mb-3">Hi {profile?.name || "there"}!</h2>
          <p className="text-muted-foreground max-w-xl mb-8">
            To help you prepare for your doctor's visit, I need to understand your body's story first. Let's do a quick check-in so I can generate the perfect questions for your doctor!
          </p>
          <Link
            to="/assessment"
            className="btn-primary-glow flex-none inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold whitespace-nowrap shadow-lg shadow-accent-gold-soft/20"
          >
            Take Assessment
          </Link>
        </motion.div>
      </div>
    );
  }

  const activeTests = status === 'complete' ? aiTests : fallbackData.tests;
  const activeQuestions = status === 'complete' ? aiQuestions : fallbackData.questions;

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 md:py-16 print:hidden">
        
        {/* Pre-Analysis Banner */}
        {status === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 rounded-2xl border border-accent-gold-soft/30 bg-gradient-to-br from-accent-gold-soft/10 via-transparent to-accent-rose/5 p-6 md:p-10 text-center flex flex-col items-center"
          >
            <Activity className="h-10 w-10 text-accent-gold-soft mb-4" />
            <h2 className="font-serif text-3xl mb-3">Should I Visit a Doctor?</h2>
            <p className="text-muted-foreground max-w-xl mb-8">
              Don't guess if your symptoms are normal. Ask Nari to analyze your cycle history and provide a smart clinical triage decision. If a visit is needed, she will generate a printable checklist for your doctor.
            </p>
            <button
              onClick={handleAnalyze}
              className="btn-primary-glow flex-none inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold whitespace-nowrap shadow-lg shadow-accent-gold-soft/20"
            >
              <Sparkles className="h-5 w-5" /> Analyze My History with AI
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {status === 'analyzing' && (
          <div className="mb-12 py-20 flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
              <Activity className="h-12 w-12 text-accent-gold-soft opacity-50 mb-6" />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="font-serif text-xl sm:text-2xl text-accent-gold-soft max-w-xl"
              >
                {LOADING_PHRASES[loadingIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}

        {/* Error Fallback State */}
        {status === 'error' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-destructive">Nari's AI is currently resting.</p>
              <p className="text-sm text-destructive/80 mt-1">
                We couldn't analyze your long-term history right now, but don't worry! Here is your standard clinical checklist based on your latest assessment.
              </p>
            </div>
          </motion.div>
        )}

        {/* AI Result States */}
        {(status === 'complete' || status === 'error') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            
            {/* The Didi Message / Triage Decision */}
            {status === 'complete' && (
              <div className={`rounded-2xl border p-6 md:p-8 ${shouldVisitDoctor ? 'border-accent-rose/30 bg-accent-rose/5' : 'border-green-500/30 bg-green-500/5 text-center flex flex-col items-center'}`}>
                {shouldVisitDoctor ? (
                  <h2 className="font-serif text-2xl text-accent-rose flex items-center gap-2 mb-4">
                    <Activity className="h-6 w-6" /> Doctor Visit Recommended
                  </h2>
                ) : (
                  <>
                    <ShieldCheck className="h-12 w-12 text-green-500 mb-4" />
                    <h2 className="font-serif text-3xl text-green-500 mb-4">You're doing great!</h2>
                  </>
                )}
                <p className={`text-lg leading-relaxed ${shouldVisitDoctor ? 'text-foreground' : 'text-foreground max-w-2xl'}`}>
                  {didiMessage}
                </p>
                
                {/* Print button is at the top for convenience if they need to go */}
                {shouldVisitDoctor && (
                   <div className="mt-6 flex flex-wrap justify-center gap-3 w-full">
                     <button
                       onClick={handlePrint}
                       className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-5 py-2.5 md:px-6 md:py-3 text-sm font-semibold whitespace-nowrap shadow-lg shadow-accent-gold-soft/20 flex-1 md:flex-none justify-center"
                     >
                       <Printer className="h-4 w-4" /> Save PDF
                     </button>
                     <button
                       onClick={handleCopy}
                       className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 md:px-6 md:py-3 text-sm font-semibold whitespace-nowrap hover:border-accent-gold-soft transition-colors flex-1 md:flex-none justify-center"
                     >
                       <Copy className="h-4 w-4" /> Copy
                     </button>
                   </div>
                )}
              </div>
            )}

            {/* Checklist UIs (Shown if Error OR if AI says Should Visit) */}
            {(status === 'error' || (status === 'complete' && shouldVisitDoctor)) && (
              <div className="grid gap-6 md:grid-cols-2 mt-8">
                <motion.div className="glass-panel p-7 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent-gold-soft to-accent-rose opacity-50" />
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gold-soft/10 text-accent-gold-soft">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <h2 className="font-serif text-2xl">Tests to Request</h2>
                  </div>
                  {activeTests.length ? (
                    <div className="space-y-2">
                      {activeTests.map((t, i) => (
                        <CheckableItem key={i} item={t} index={i} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-3 bg-white/5 rounded-xl">
                      No specific tests flagged — a routine check is fine.
                    </p>
                  )}
                </motion.div>

                <motion.div className="glass-panel p-7 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent-rose to-accent-gold-soft opacity-50" />
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-rose/10 text-accent-rose">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <h2 className="font-serif text-2xl">Questions to Ask</h2>
                  </div>
                  <div className="space-y-2">
                    {activeQuestions.map((q, i) => (
                      <CheckableItem key={i} item={q} index={i} isQuestion={true} />
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Error state print button */}
            {status === 'error' && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handlePrint}
                  className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold whitespace-nowrap shadow-lg shadow-accent-gold-soft/20"
                >
                  <Printer className="h-4 w-4" /> Save Checklist as PDF
                </button>
              </div>
            )}
            
          </motion.div>
        )}
      </div>

      {/* Hidden Print View */}
      <DoctorPrintView tests={activeTests} questions={activeQuestions} />
    </>
  );
}
