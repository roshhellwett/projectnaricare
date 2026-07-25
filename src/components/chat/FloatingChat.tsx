import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Maximize2, Lock } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChatWindow } from "./ChatWindow";
import { storage, newId, type ChatThread } from "@/lib/storage";

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Hydrate quick thread on client only
    let id = storage.getQuickThreadId();
    if (!id) {
      id = newId();
      storage.setQuickThreadId(id);
    }
    const all = storage.getThreads();
    let t = all.find((x) => x.id === id);
    if (!t) {
      t = { id, title: "Quick chat", updatedAt: Date.now(), messages: [] };
      storage.setThreads([t, ...all]);
    }
    setThread(t);
  }, []);

  // Don't render the bubble on /ask (full-page chat)
  if (location.pathname.startsWith("/ask")) return null;

  return (
    <>
      <AnimatePresence>
        {open && thread && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass-panel fixed bottom-[calc(env(safe-area-inset-bottom,0)+5.5rem)] right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden sm:right-6"
          >
            <div className="flex items-center justify-between border-b border-hairline/50 bg-gradient-to-r from-accent-rose/20 to-accent-gold/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-rose to-accent-gold">
                  <svg viewBox="0 0 28 28" className="h-5 w-5">
                    <path d="M14 4 A10 10 0 0 1 14 24 A5 5 0 0 0 14 4" fill="#fff" />
                  </svg>
                </div>
                <div className="leading-tight">
                  <div className="font-serif text-sm">Ask Nari</div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    AI health companion
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  to="/ask"
                  className="rounded-full p-1.5 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                  aria-label="Open full chat"
                  onClick={() => setOpen(false)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {storage.getAssessments().length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center flex-1">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-hairline/50">
                  <Lock className="h-6 w-6 text-accent-gold-soft" />
                </div>
                <h3 className="font-serif text-lg mb-2">Unlock Nari</h3>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed max-w-xs">
                  Take the 3-minute health assessment so Nari knows your context.
                </p>
                <Link
                  to="/assessment"
                  onClick={() => setOpen(false)}
                  className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
                >
                  Take assessment
                </Link>
              </div>
            ) : (
              <ChatWindow
                thread={thread}
                compact
                onMessagesChanged={(msgs) => {
                  const all = storage.getThreads();
                  const existing = all.find((t) => t.id === thread.id);
                  const title =
                    msgs.find((m) => m.role === "user")?.content.slice(0, 40) ?? "Quick chat";
                  const base = existing ?? thread;
                  const updated: ChatThread = {
                    ...base,
                    messages: msgs,
                    updatedAt: Date.now(),
                    title: base.title === "New conversation" ? title : base.title,
                  };
                  const idx = all.findIndex((t) => t.id === thread.id);
                  if (idx === -1) storage.setThreads([updated, ...all]);
                  else {
                    const next = [...all];
                    next[idx] = updated;
                    storage.setThreads(next);
                  }
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        onClick={() => setOpen((v) => !v)}
        className="btn-primary-glow !fixed bottom-[calc(env(safe-area-inset-bottom,0)+1rem)] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full sm:right-6 sm:bottom-6"
        aria-label={open ? "Close chat" : "Open chat with Nari"}
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
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
