// Typed localStorage helpers. All keys namespaced under `naricare:`.

export type Symptom =
  | "acne"
  | "hirsutism"
  | "weightGain"
  | "hairThin"
  | "fatigue"
  | "dizziness"
  | "moodSwings"
  | "bloating"
  | "breastTender"
  | "headache"
  | "nausea"
  | "backPain"
  | "legPain"
  | "painBowel"
  | "painIntercourse"
  | "pallor"
  | "coldIntolerance"
  | "pica"
  | "spotting";

export type AssessmentRaw = {
  age: number;
  cycleLength: number;
  periodLength: number;
  variation: number;
  missed: number;
  pregnancyContext: "none" | "protected" | "unprotected" | "undisclosed" | null;
  flow: number;
  flowObjective: number;
  clots: number;
  painLevel: number;
  painInterference: number;
  stressLevel: number;
  sleep: number;
  exercise: number;
  height: number;
  weight: number;
  familyPCOS: boolean;
  familyEndo: boolean;
  sym: Record<Symptom, boolean>;
};

export type AssessmentScores = {
  irregularity: number;
  pcos: number;
  dysmenorrhea: number;
  anaemia: number;
  stress: number;
  endometriosis: number;
  pregnancyFlag: boolean;
  pregnancyWatch: boolean;
  ageNote: string | null;
};

export type SavedAssessment = {
  savedAt: number;
  raw: AssessmentRaw;
  scores: AssessmentScores;
};

export type TrackerEntry = {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  flow: "none" | "light" | "moderate" | "heavy";
  pain: number; // 0-10
  mood: "great" | "good" | "meh" | "low" | "awful";
  symptoms: string[];
  note?: string;
};

export type ThreadMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ThreadMessage[];
};

export const KEYS = {
  assessment: "naricare:assessment",
  tracker: "naricare:tracker",
  threads: "naricare:threads",
  quickThreadId: "naricare:quick-thread-id",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — silent */
  }
}

const MAX_ASSESSMENTS = 20;
const MAX_THREADS = 50;
const MAX_TRACKER_ENTRIES = 500;

function pruneAssessments(a: SavedAssessment[]): SavedAssessment[] {
  return a.sort((a, b) => b.savedAt - a.savedAt).slice(0, MAX_ASSESSMENTS);
}

function pruneThreads(t: ChatThread[]): ChatThread[] {
  return t.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_THREADS);
}

function pruneTracker(e: TrackerEntry[]): TrackerEntry[] {
  return e.sort((a, b) => b.date.localeCompare(a.date)).slice(0, MAX_TRACKER_ENTRIES);
}

export const storage = {
  getAssessments: (): SavedAssessment[] => {
    const raw = read<SavedAssessment | SavedAssessment[]>(KEYS.assessment, []);
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") return [raw];
    return [];
  },
  setAssessments: (a: SavedAssessment[]) => write(KEYS.assessment, pruneAssessments(a)),

  getTracker: (): TrackerEntry[] => read(KEYS.tracker, [] as TrackerEntry[]),
  setTracker: (e: TrackerEntry[]) => write(KEYS.tracker, pruneTracker(e)),

  getThreads: (): ChatThread[] => read(KEYS.threads, [] as ChatThread[]),
  setThreads: (t: ChatThread[]) => write(KEYS.threads, pruneThreads(t)),

  getQuickThreadId: (): string | null => read(KEYS.quickThreadId, null),
  setQuickThreadId: (id: string) => write(KEYS.quickThreadId, id),

  exportData: (): string => {
    const payload: Record<string, unknown> = {};
    for (const [key, lsKey] of Object.entries(KEYS)) {
      payload[key] = read(lsKey, null);
    }
    return JSON.stringify(payload, null, 2);
  },

  importData: (json: string): boolean => {
    try {
      const payload = JSON.parse(json) as Record<string, unknown>;
      for (const [key, lsKey] of Object.entries(KEYS)) {
        if (key in payload) {
          write(lsKey, payload[key]);
        }
      }
      return true;
    } catch {
      return false;
    }
  },

  clearAll: (): void => {
    for (const lsKey of Object.values(KEYS)) {
      if (!isBrowser()) return;
      try {
        window.localStorage.removeItem(lsKey);
      } catch {
        /* noop */
      }
    }
  },

  getStorageSize: (): { used: number; total: number; percent: number } => {
    const total = 5 * 1024 * 1024;
    let used = 0;
    if (!isBrowser()) return { used: 0, total, percent: 0 };
    try {
      for (const lsKey of Object.values(KEYS)) {
        const raw = window.localStorage.getItem(lsKey);
        if (raw) used += raw.length * 2;
      }
    } catch {
      /* noop */
    }
    return { used, total, percent: Math.round((used / total) * 100) };
  },
};

export function newId() {
  if (isBrowser() && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
