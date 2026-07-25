import { useState, useRef } from "react";
import { toast } from "sonner";
import { storage } from "@/lib/storage";

export function SiteFooter() {
  const [showData, setShowData] = useState(false);
  const [clearing, setClearing] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = storage.exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `naricare-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported", { description: "Your NariCare data has been downloaded." });
  };

  const handleImport = () => {
    importRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = storage.importData(reader.result as string);
      if (ok) {
        toast.success("Data imported", {
          description: "Refresh the page to see your restored data.",
        });
        window.location.reload();
      } else {
        toast.error("Import failed", { description: "The file format was not valid." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClear = () => {
    setClearing(true);
  };

  const confirmClear = () => {
    storage.clearAll();
    toast.success("All data cleared", {
      description: "Your NariCare data has been removed. The page will refresh.",
    });
    setClearing(false);
    setShowData(false);
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <footer className="border-t border-hairline bg-background/60 py-12 backdrop-blur-sm">
      <input
        ref={importRef}
        type="file"
        accept=".json"
        onChange={onFileSelected}
        className="hidden"
        aria-hidden
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="flex items-center gap-2 font-serif text-lg">
          <svg viewBox="0 0 28 28" className="h-6 w-6">
            <circle cx="14" cy="14" r="12" fill="none" stroke="#e3a857" strokeWidth="1.4" />
            <path d="M14 4 A10 10 0 0 1 14 24 A5 5 0 0 0 14 4" fill="#c65b7c" />
          </svg>
          NariCare
        </div>

        <div className="h-px w-16 bg-gradient-to-r from-transparent via-accent-gold/60 to-transparent" />

        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Runs in your browser · Your answers stay on your device · Not a substitute for
          professional medical advice. In an emergency, contact your doctor.
        </p>

        <p className="text-xs text-muted-foreground/70">Made with care for every Nari.</p>

        {/* Data controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setShowData(!showData)}
            className="rounded-full border border-hairline/30 px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/70 transition hover:border-accent-gold-soft/50 hover:text-accent-gold-soft"
          >
            {showData ? "Hide data settings" : `Data (${storage.getStorageSize().percent}% used)`}
          </button>
        </div>

        {showData && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={handleExport}
              className="rounded-full border border-hairline/30 px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/70 transition hover:border-accent-gold-soft/50 hover:text-accent-gold-soft"
            >
              Export data
            </button>
            <button
              onClick={handleImport}
              className="rounded-full border border-hairline/30 px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/70 transition hover:border-accent-gold-soft/50 hover:text-accent-gold-soft"
            >
              Import data
            </button>
            <button
              onClick={handleClear}
              className="rounded-full border border-high/30 px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest text-high/70 transition hover:border-high hover:text-high"
            >
              Clear all data
            </button>
          </div>
        )}

        {/* Clear confirmation overlay */}
        {clearing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="glass-panel max-w-sm p-8 text-center">
              <h3 className="font-serif text-xl mb-3">Clear all data?</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                This will permanently delete all your assessments, cycle logs, and chat
                conversations. This action cannot be undone.
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
