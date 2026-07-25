import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useCallback, useState } from "react";
import { useThreads } from "@/hooks/useThreads";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatLockdown } from "@/components/chat/ChatLockdown";
import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { ThreadMessage } from "@/lib/storage";
import { storage } from "@/lib/storage";

export const Route = createFileRoute("/ask/$threadId")({
  head: () => ({
    meta: [
      { title: "Ask Nari · NariCare" },
      { name: "description", content: "Continue your conversation with Nari." },
      { property: "og:title", content: "Ask Nari · NariCare" },
      { property: "og:description", content: "Continue your conversation with Nari." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AskThread,
});

function AskThread() {
  const { threadId } = Route.useParams();
  const { threads, ready, create, remove, setMessages } = useThreads();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const thread = useMemo(
    () =>
      threads.find((t) => t.id === threadId) ?? {
        id: threadId,
        title: "New conversation",
        updatedAt: Date.now(),
        messages: [] as ThreadMessage[],
      },
    [threads, threadId],
  );

  const handleMessages = useCallback(
    (msgs: ThreadMessage[]) => {
      if (msgs.length === 0) return;
      setMessages(threadId, msgs);
    },
    [threadId, setMessages],
  );

  const newThread = () => {
    const t = create();
    navigate({ to: "/ask/$threadId", params: { threadId: t.id } });
    setSidebarOpen(false);
  };

  const deleteThread = (id: string) => {
    remove(id);
    if (id === threadId) {
      const rest = threads.filter((t) => t.id !== id);
      if (rest.length) navigate({ to: "/ask/$threadId", params: { threadId: rest[0].id } });
      else {
        const t = create();
        navigate({ to: "/ask/$threadId", params: { threadId: t.id } });
      }
    }
  };

  if (ready && storage.getAssessments().length === 0) {
    return <ChatLockdown />;
  }

  return (
    <div className="flex flex-col h-full md:mx-auto md:max-w-6xl md:px-6 md:py-8">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-hairline/30 backdrop-blur-md sticky top-0 z-20 md:hidden">
        <Link to="/" className="p-2 -ml-2 text-accent-gold-soft">
          <PanelLeftClose className="h-5 w-5" />
        </Link>
        <div className="font-serif text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-accent-gold-soft to-accent-rose">
          Nari AI
        </div>
        <button onClick={newThread} className="p-2 -mr-2 text-accent-rose">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="hidden md:block mb-8 text-center">
        <div className="eyebrow justify-center">Ask Nari</div>
        <h1 className="mt-3 font-serif text-3xl md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-accent-gold-soft to-accent-rose pb-1">
          Your private AI health companion
        </h1>
      </div>

      <div className="flex-1 flex overflow-hidden md:grid md:grid-cols-[260px_1fr] md:gap-4 h-full relative">
        {/* Sidebar */}
        <aside
          className={`absolute inset-0 z-30 bg-background/95 backdrop-blur-xl md:static md:bg-transparent md:glass-card flex flex-col overflow-hidden h-full transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-hairline/50 p-4 bg-black/10">
            <button
              onClick={newThread}
              className="btn-primary-glow flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-transform active:scale-95"
            >
              <Plus className="h-4 w-4" /> New chat
            </button>
            <button className="md:hidden ml-4 p-2 text-muted-foreground" onClick={() => setSidebarOpen(false)}>
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </div>
          {ready && threads.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No conversations yet.</p>
          ) : (
            <ul className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
              {threads.map((t) => {
                const active = t.id === threadId;
                return (
                  <li key={t.id}>
                    <div
                      className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all duration-300 ${
                        active
                          ? "bg-accent-gold-soft/10 border border-accent-gold-soft/20 shadow-[0_0_15px_rgba(240,201,137,0.05)]"
                          : "border border-transparent hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <Link
                        to="/ask/$threadId"
                        params={{ threadId: t.id }}
                        onClick={() => setSidebarOpen(false)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left text-sm"
                      >
                        <div
                          className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg transition-colors ${
                            active
                              ? "bg-accent-gold-soft/20 text-accent-gold-soft"
                              : "bg-white/5 text-muted-foreground group-hover:text-foreground"
                          }`}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <span
                          className={`truncate transition-colors ${
                            active
                              ? "text-accent-gold-soft font-medium"
                              : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        >
                          {t.title}
                        </span>
                      </Link>
                      <button
                        onClick={() => deleteThread(t.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/50 opacity-0 transition-all hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100"
                        aria-label="Delete thread"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Chat Main Window */}
        <main className="flex-1 flex flex-col min-w-0 h-[calc(100dvh-60px)] md:h-[640px] w-full max-w-full">
          <ChatWindow
            key={threadId}
            thread={thread}
            compact={false}
            onMessagesChanged={handleMessages}
          />
        </main>
      </div>
    </div>
  );
}
