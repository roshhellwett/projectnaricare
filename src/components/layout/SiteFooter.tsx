import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { storage } from "@/lib/storage";

import logoUrl from "@/assets/logo.png";

export function SiteFooter() {
  const [showData, setShowData] = useState(false);
  const [clearing, setClearing] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setClearing(true);
  };

  const confirmClear = () => {
    storage.clearAll();
    toast.success("All data cleared", {
      description: "Your NariCare data has been removed. Going home...",
    });
    setClearing(false);
    setShowData(false);
    setTimeout(() => window.location.href = "/", 1000);
  };

  return (
    <footer className="border-t border-hairline bg-background/60 pt-12 pb-28 md:pb-12 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="flex items-center gap-3 font-serif text-lg">
          <img
            src={logoUrl}
            alt="NariCare logo"
            width={24}
            height={24}
            className="h-6 w-6 rounded-md object-cover ring-1 ring-hairline/50 shadow-sm shadow-accent-gold-soft/10"
            draggable={false}
          />
          NariCare
        </div>

        <div className="h-px w-16 bg-gradient-to-r from-transparent via-accent-gold/60 to-transparent" />

        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          A completely private space just for you. Your data never leaves this device. 
          NariCare is a supportive companion, not a doctor — please always seek professional 
          medical care when you need it.
        </p>

        <p className="text-xs text-muted-foreground/70 font-mono uppercase tracking-widest">
          Har Nari Ki Saheli
        </p>

        {/* Data controls */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/70">
            <Link to="/disclaimer" className="hover:text-accent-gold-soft transition-colors py-1">Medical Disclaimer</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-accent-gold-soft transition-colors py-1">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-accent-gold-soft transition-colors py-1">Terms of Service</Link>
          </div>

          <button
            onClick={() => setShowData(!showData)}
            className="rounded-full border border-hairline/30 px-4 py-2 min-h-[44px] text-[11px] font-mono uppercase tracking-widest text-muted-foreground/70 transition hover:border-accent-gold-soft/50 hover:text-accent-gold-soft mt-2"
          >
            {showData ? "Hide data settings" : "Manage Data"}
          </button>
        </div>

        {showData && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={handleClear}
              className="rounded-full border border-high/30 px-4 py-2 min-h-[44px] text-[11px] font-mono uppercase tracking-widest text-high/70 transition hover:border-high hover:text-high"
            >
              Clear all history & data
            </button>
          </div>
        )}

        {/* Clear confirmation overlay */}
        {clearing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="glass-panel max-w-sm p-8 text-center">
              <h3 className="font-serif text-xl mb-3">Clear all history?</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                This will permanently delete all your assessments, cycle logs, and chat
                conversations. Your profile name and age will be kept. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setClearing(false)}
                  className="rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent-gold-soft transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClear}
                  className="rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-white hover:bg-destructive/80 transition-colors"
                >
                  Yes, clear everything
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
