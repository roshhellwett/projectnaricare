import { useCallback, useEffect, useState } from "react";
import { storage, KEYS, type SavedAssessment } from "@/lib/storage";

function bySavedAtDesc(a: SavedAssessment, b: SavedAssessment) {
  return b.savedAt - a.savedAt;
}

function load() {
  const all = storage.getAssessments().sort(bySavedAtDesc);
  return { all, latest: all.length > 0 ? all[0] : null };
}

export function useAssessment() {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [latest, setLatest] = useState<SavedAssessment | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { all, latest } = load();
    setAssessments(all);
    setLatest(latest);
    setReady(true);
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEYS.assessment) {
        const { all, latest } = load();
        setAssessments(all);
        setLatest(latest);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const save = useCallback((a: SavedAssessment) => {
    const all = storage.getAssessments();
    const next = [a, ...all].sort(bySavedAtDesc);
    storage.setAssessments(next);
    setAssessments(next);
    setLatest(a);
  }, []);

  return { assessment: latest, assessments, latest, save, ready };
}
