import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { useTracker } from "@/hooks/useTracker";
import { useThreads } from "@/hooks/useThreads";
import { buildHealthContext, buildContextDepHash } from "@/lib/health/context";
import type { ChatThread, ThreadMessage } from "@/lib/storage";
import { newId } from "@/lib/storage";

function toUIMessages(msgs: ThreadMessage[]): UIMessage[] {
  return msgs.map((m) => ({
    id: m.id,
    role: m.role,
    parts: [{ type: "text", text: m.content }],
  }));
}

function fromUIMessages(msgs: UIMessage[]): ThreadMessage[] {
  return msgs
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
      return {
        id: m.id,
        role: m.role as "user" | "assistant",
        content: text,
        createdAt: Date.now(),
      };
    });
}

function renderMarkdownLite(text: string) {
  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^\s*[-*]\s+(.*)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul class="list-disc pl-5 my-2">${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  return `<p>${html}</p>`;
}

const SUGGESTIONS = [
  "Explain my latest scores to me",
  "Is this much pain normal?",
  "Which blood tests should I ask my doctor for?",
  "Could my symptoms point to PCOS?",
  "Gentle remedies to ease my cramps tonight?",
];

export function ChatWindow({
  thread,
  compact = false,
  onMessagesChanged,
  onFirstMessage,
}: {
  thread: ChatThread;
  compact?: boolean;
  onMessagesChanged?: (msgs: ThreadMessage[]) => void;
  onFirstMessage?: (userText: string) => void;
}) {
  const { assessments } = useAssessment();
  const { entries } = useTracker();
  const { threads } = useThreads();
  const depHash = useMemo(
    () => buildContextDepHash(assessments, entries, threads),
    [assessments, entries, threads],
  );
  const healthContext = useMemo(
    () => buildHealthContext(assessments, entries, threads, thread.id),
    [depHash, thread.id],
  );

  const healthContextRef = useRef(healthContext);
  useEffect(() => {
    healthContextRef.current = healthContext;
  }, [healthContext]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: { messages, healthContext: healthContextRef.current, ...body },
        }),
      }),
    [],
  );

  const initialMessages = useMemo(() => toUIMessages(thread.messages), [thread.id]);

  const { messages, sendMessage, status, error } = useChat({
    id: thread.id,
    initialMessages: initialMessages as never,
    transport,
  } as never);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastCountRef = useRef(-1);

  useEffect(() => {
    if (lastCountRef.current === messages.length && status !== "streaming") return;
    lastCountRef.current = messages.length;
    onMessagesChanged?.(fromUIMessages(messages));
  }, [messages, status, onMessagesChanged]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [thread.id]);

  const isBusy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const t = text.trim();
    if (!t || isBusy) return;
    if (messages.length === 0) onFirstMessage?.(t);
    sendMessage({ text: t });
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className={`relative flex flex-col overflow-hidden ${compact ? "h-[520px]" : "h-full"}`}>
      {/* Animated gradient background specifically for the chat area */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20 pointer-events-none" />
      <motion.div
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />

      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="mx-auto max-w-lg text-center pt-12 pb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-rose to-accent-gold shadow-[0_0_30px_rgba(240,201,137,0.4)]"
            >
              <svg viewBox="0 0 28 28" className="h-8 w-8">
                <path d="M14 4 A10 10 0 0 1 14 24 A5 5 0 0 0 14 4" fill="#fff" />
              </svg>
            </motion.div>

            <motion.h3
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-3xl mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
            >
              Hi love, I'm Nari.
            </motion.h3>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground leading-relaxed px-4"
            >
              Ask me anything — about a symptom that's been on your mind, or what to raise at your
              next doctor visit.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <p className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-gold-soft/80 mb-4">
                <Sparkles className="h-3 w-3" /> Gentle openings
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    onClick={() => send(s)}
                    className="rounded-full border border-hairline/50 bg-white/5 backdrop-blur-sm px-4 py-2 text-xs text-foreground/80 transition-all hover:border-accent-gold-soft/50 hover:bg-white/10 hover:text-accent-gold-soft hover:shadow-[0_0_15px_rgba(240,201,137,0.15)]"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            const isUser = m.role === "user";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                {isUser ? (
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary to-primary/80 px-4 py-3 text-sm text-primary-foreground shadow-lg backdrop-blur-md">
                    {text}
                  </div>
                ) : (
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 px-5 py-4 text-sm text-foreground/95 leading-relaxed shadow-lg backdrop-blur-md [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:text-accent-gold-soft [&_li]:mb-1">
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownLite(text) }} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {status === "submitted" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-2"
          >
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="text-xs italic text-muted-foreground/80">Nari is thinking…</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md rounded-2xl border border-high/40 bg-high/10 p-5 text-center"
          >
            <p className="text-sm text-foreground/90 mb-3">
              Nari stumbled. {error.message || "Something went wrong with the response."}
            </p>
            <button
              onClick={() => {
                const userMsgs = messages.filter((m: { role: string }) => m.role === "user");
                const lastUser = userMsgs[userMsgs.length - 1];
                if (lastUser) {
                  const text = lastUser.parts
                    .map((p: { type: string; text?: string }) =>
                      p.type === "text" ? (p.text ?? "") : "",
                    )
                    .join("");
                  sendMessage({ text });
                }
              }}
              className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold"
            >
              Try again
            </button>
          </motion.div>
        )}
      </div>

      <div className="relative z-10 border-t border-hairline/50 bg-black/20 backdrop-blur-xl p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-3 max-w-4xl mx-auto"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask Nari anything about your cycle…"
              className="w-full resize-none rounded-2xl border border-hairline/50 bg-white/5 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-accent-gold-soft/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-gold-soft/20 scrollbar-hide"
              style={{ maxHeight: 140 }}
            />
          </div>
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            className="btn-primary-glow flex h-12 w-12 flex-none items-center justify-center rounded-full disabled:opacity-40 transition-transform active:scale-95"
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-2 text-center text-[10px] font-medium text-muted-foreground/60">
          <span>
            <Sparkles className="h-3 w-3 inline mr-1 opacity-50" />
            Nari is AI
          </span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span>Not medical advice</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span>See a doctor for anything urgent</span>
        </p>
      </div>
    </div>
  );
}

export function makeAdHocThread(): ChatThread {
  return { id: newId(), title: "Quick chat", updatedAt: Date.now(), messages: [] };
}
