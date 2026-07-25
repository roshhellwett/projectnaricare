import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { storage } from "@/lib/storage";
import { usePWAInstall } from "@/hooks/usePWAInstall";

import logoUrl from "@/assets/logo.png";

export function SiteFooter() {
  const [showData, setShowData] = useState(false);
  const [clearing, setClearing] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleInstall = async () => {
    if (await install()) return;

    toast("Install NariCare", {
      description: isInstallable
        ? "Your browser is preparing the install prompt. Please try again in a moment."
        : "Use your browser menu and choose “Install app” or “Add to Home Screen.”",
    });
  };

  const confirmClear = () => {
    storage.clearAll();
    toast.success("All data cleared", {
      description: "Your NariCare data has been removed. Going home...",
    });
    setClearing(false);
    setShowData(false);
    setTimeout(() => (window.location.href = "/"), 1000);
  };

  return (
    <footer className="border-t border-hairline/70 bg-background/45 pb-24 pt-7 backdrop-blur-sm md:pb-8 md:pt-8 print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-hairline/50 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={logoUrl}
              alt="NariCare logo"
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-lg object-cover ring-1 ring-hairline/50"
              draggable={false}
            />
            <div className="min-w-0">
              <div className="font-serif text-base leading-none">NariCare</div>
              <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.14em] text-accent-gold-soft/70">
                Har Nari Ki Saheli
              </p>
            </div>
          </div>

          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-right">
            Private by design. Your data stays on this device. NariCare is a supportive companion,
            not a replacement for medical care.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4 text-[11px] sm:flex-row sm:items-center sm:justify-between">
          <nav
            aria-label="Footer links"
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted-foreground/70"
          >
            <Link to="/disclaimer" className="transition-colors hover:text-accent-gold-soft">
              Medical Disclaimer
            </Link>
            <span aria-hidden className="text-hairline">
              ·
            </span>
            <Link to="/privacy" className="transition-colors hover:text-accent-gold-soft">
              Privacy Policy
            </Link>
            <span aria-hidden className="text-hairline">
              ·
            </span>
            <Link to="/terms" className="transition-colors hover:text-accent-gold-soft">
              Terms of Service
            </Link>
          </nav>

          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            {!isInstalled && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 rounded-full bg-accent-rose/20 border border-accent-rose/30 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-accent-rose shadow-md shadow-accent-rose/10 transition-transform hover:bg-accent-rose/30 active:scale-95"
              >
                <Download className="h-3 w-3" />
                Install App
              </button>
            )}
            <button
              onClick={() => setShowData((open) => !open)}
              className="rounded-full border border-hairline/40 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground/80 transition-colors hover:border-accent-gold-soft/50 hover:text-accent-gold-soft"
            >
              {showData ? "Hide data settings" : "Manage Data"}
            </button>
          </div>
        </div>

        {showData && (
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <button
              onClick={() => setClearing(true)}
              className="rounded-full border border-high/30 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-high/70 transition hover:border-high hover:text-high"
            >
              Clear all history &amp; data
            </button>
          </div>
        )}

        {clearing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <div className="glass-panel max-w-sm p-8 text-center">
              <h3 className="mb-3 font-serif text-xl">Clear all history?</h3>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                This will permanently delete all your assessments, cycle logs, and chat
                conversations. Your profile name and age will be kept. This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setClearing(false)}
                  className="rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent-gold-soft"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClear}
                  className="rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-destructive/80"
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
