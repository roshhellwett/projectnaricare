import { useCallback, useEffect, useState } from "react";
import { storage, KEYS, type ChatThread, type ThreadMessage, newId } from "@/lib/storage";

export function useThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setThreads(storage.getThreads());
    setReady(true);
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEYS.threads) setThreads(storage.getThreads());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const persist = useCallback((next: ChatThread[]) => {
    storage.setThreads(next);
    setThreads(next);
  }, []);

  const create = useCallback(
    (title = "New conversation"): ChatThread => {
      const t: ChatThread = { id: newId(), title, updatedAt: Date.now(), messages: [] };
      persist([t, ...threads]);
      return t;
    },
    [threads, persist],
  );

  const remove = useCallback(
    (id: string) => persist(threads.filter((t) => t.id !== id)),
    [threads, persist],
  );

  const rename = useCallback(
    (id: string, title: string) =>
      persist(threads.map((t) => (t.id === id ? { ...t, title, updatedAt: Date.now() } : t))),
    [threads, persist],
  );

  const setMessages = useCallback(
    (id: string, messages: ThreadMessage[]) => {
      // read current from storage to avoid stale-closure clobbering when called
      // from streaming callbacks
      const current = storage.getThreads();
      const idx = current.findIndex((t) => t.id === id);
      let next: ChatThread[];
      const firstUser = messages.find((m) => m.role === "user");
      const title = firstUser ? firstUser.content.slice(0, 48) : "New conversation";
      if (idx === -1) {
        next = [{ id, title, updatedAt: Date.now(), messages }, ...current];
      } else {
        const updated: ChatThread = {
          ...current[idx],
          messages,
          updatedAt: Date.now(),
          title: current[idx].title === "New conversation" ? title : current[idx].title,
        };
        next = [updated, ...current.filter((t) => t.id !== id)];
      }
      persist(next);
    },
    [persist],
  );

  return { threads, ready, create, remove, rename, setMessages };
}
