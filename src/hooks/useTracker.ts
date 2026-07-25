import { useEffect, useState } from "react";
import { storage, KEYS, type TrackerEntry, newId } from "@/lib/storage";

export function useTracker() {
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEntries(storage.getTracker());
    setReady(true);
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEYS.tracker) setEntries(storage.getTracker());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const add = (partial: Omit<TrackerEntry, "id">) => {
    const entry: TrackerEntry = { ...partial, id: newId() };
    const next = [...entries.filter((e) => e.date !== entry.date), entry].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    storage.setTracker(next);
    setEntries(next);
  };

  const remove = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    storage.setTracker(next);
    setEntries(next);
  };

  return { entries, add, remove, ready };
}
