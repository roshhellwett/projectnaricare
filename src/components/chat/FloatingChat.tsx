import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Activity, Coffee, Heart } from "lucide-react";
import { useLocation, Link } from "@tanstack/react-router";
import { useProfile } from "@/lib/profile";
import { useAssessment } from "@/hooks/useAssessment";
import { useTracker } from "@/hooks/useTracker";

export function FloatingChat() {
  const { profile } = useProfile();
  const { assessments } = useAssessment();
  const { entries } = useTracker();
  
  const hasData = assessments.length > 0;

  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [activeRelief, setActiveRelief] = useState<string | null>(null);

  // Don't render the bubble on /ask (full-page chat)
  if (location.pathname.startsWith("/ask")) return null;

  const nameStr = profile ? profile.name : "there";
  let greeting = `Hi ${nameStr}! How are you feeling today?`;
  
  if (!hasData) {
    greeting = `Hi ${nameStr}! To give you safe and personalized advice, I need a baseline understanding of your cycle. Please take the Check-in assessment first!`;
  } else if (location.pathname === "/tracker") {
    greeting = `Logging your cycle, ${nameStr}? Let me know if you need help understanding any symptoms.`;
  } else if (location.pathname === "/history") {
    greeting = `Here's your cycle history, ${nameStr}. Looking for patterns?`;
  } else if (location.pathname === "/doctor") {
    greeting = `Nervous about your appointment, ${nameStr}? It's perfectly normal. I'm here to help you prepare.`;
  }

  const renderRelief = () => {
    switch (activeRelief) {
      case "relax":
        return (
          <div className="p-4 text-sm animate-in fade-in">
            <h4 className="font-serif font-bold text-accent-gold-soft mb-2 text-base">4-7-8 Breathing</h4>
            <p className="mb-2">Breathe in quietly through the nose for <strong>4 seconds</strong>.</p>
            <p className="mb-2">Hold the breath for <strong>7 seconds</strong>.</p>
            <p className="mb-4">Exhale completely through the mouth for <strong>8 seconds</strong>.</p>
            <button onClick={() => setActiveRelief(null)} className="text-xs text-muted-foreground underline transition hover:text-foreground">Back</button>
          </div>
        );
      case "cramps":
        return (
          <div className="p-4 text-sm animate-in fade-in">
            <h4 className="font-serif font-bold text-accent-rose mb-2 text-base">Instant Cramp Relief</h4>
            <ul className="list-disc pl-4 space-y-1 mb-4 text-muted-foreground">
              <li>Apply a hot water bag to your lower abdomen or lower back.</li>
              <li>Drink warm Ajwain (carom seed) or Jeera (cumin) water.</li>
              <li>Try the Child's Pose (Balasana) to stretch your lower back.</li>
            </ul>
            <button onClick={() => setActiveRelief(null)} className="text-xs text-muted-foreground underline transition hover:text-foreground">Back</button>
          </div>
        );
      case "bleeding":
        return (
          <div className="p-4 text-sm animate-in fade-in">
            <h4 className="font-serif font-bold text-destructive mb-2 text-base">Bleeding Concerns</h4>
            <p className="mb-2 text-muted-foreground">It is normal for flow to vary. However, seek medical advice if:</p>
            <ul className="list-disc pl-4 space-y-1 mb-4 text-muted-foreground">
              <li>You are soaking through a pad or tampon every hour for 2+ hours.</li>
              <li>You pass clots larger than a quarter.</li>
            </ul>
            <button onClick={() => setActiveRelief(null)} className="text-xs text-muted-foreground underline transition hover:text-foreground">Back</button>
          </div>
        );
      default:
        return (
          <div className="p-4 flex flex-col gap-2">
            <button onClick={() => setActiveRelief("relax")} className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition border border-hairline/50 text-left group">
               <Heart className="h-5 w-5 text-accent-gold-soft group-hover:scale-110 transition-transform" />
               <div>
                 <div className="text-sm font-medium">Quick Relaxation</div>
                 <div className="text-xs text-muted-foreground">Guided breathing for anxiety</div>
               </div>
            </button>
            <button onClick={() => setActiveRelief("cramps")} className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition border border-hairline/50 text-left group">
               <Coffee className="h-5 w-5 text-accent-rose group-hover:scale-110 transition-transform" />
               <div>
                 <div className="text-sm font-medium">Cramp Relief</div>
                 <div className="text-xs text-muted-foreground">Instant home remedies</div>
               </div>
            </button>
            <button onClick={() => setActiveRelief("bleeding")} className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition border border-hairline/50 text-left group">
               <Activity className="h-5 w-5 text-destructive group-hover:scale-110 transition-transform" />
               <div>
                 <div className="text-sm font-medium">Bleeding Concerns?</div>
                 <div className="text-xs text-muted-foreground">Quick triage guidelines</div>
               </div>
            </button>
          </div>
        );
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass-panel fixed bottom-[calc(env(safe-area-inset-bottom,0)+10rem)] md:bottom-[calc(env(safe-area-inset-bottom,0)+5.5rem)] right-3 md:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[360px] max-w-[400px] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-hairline/50 bg-gradient-to-r from-accent-rose/20 to-accent-gold/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-rose to-accent-gold shadow-md shadow-accent-rose/20">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="leading-tight">
                  <div className="font-serif text-sm">Nari Co-Pilot</div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    Instant help
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setOpen(false); setActiveRelief(null); }}
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 pb-2 border-b border-hairline/20 bg-black/10">
              <p className="text-sm font-medium leading-relaxed italic text-foreground/90">"{greeting}"</p>
            </div>

            <div className="min-h-[220px]">
              {!hasData ? (
                <div className="p-4 flex flex-col gap-3">
                  <Link to="/assessment" onClick={() => setOpen(false)} className="flex items-center gap-3 w-full p-3 rounded-xl bg-gradient-to-br from-accent-gold-soft/20 to-accent-rose/20 hover:from-accent-gold-soft/30 hover:to-accent-rose/30 transition border border-accent-gold-soft/30 text-left group">
                     <div>
                       <div className="text-sm font-medium text-accent-gold-soft">Take Assessment</div>
                       <div className="text-xs text-muted-foreground mt-0.5">Let me understand your cycle</div>
                     </div>
                  </Link>
                </div>
              ) : (
                renderRelief()
              )}
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        onClick={() => { setOpen((v) => !v); setActiveRelief(null); }}
        className="btn-primary-glow !fixed bottom-[calc(env(safe-area-inset-bottom,0)+5.5rem)] md:!bottom-6 right-4 md:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full"
        aria-label={open ? "Close Co-Pilot" : "Open Co-Pilot"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Sparkles className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
