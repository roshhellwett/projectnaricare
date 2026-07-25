// India-first date/time helpers. All dates the user sees or the app computes
// go through this module — never `new Date().toISOString().slice(0,10)` (that's
// UTC and rolls over wrong for late-evening IST users).

export const IST_TZ = "Asia/Kolkata";

/** Get IST-based Y/M/D parts for a given instant (defaults to now). */
function istParts(d: Date = new Date()) {
  // en-CA gives YYYY-MM-DD-friendly parts.
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

/** Today in IST as YYYY-MM-DD. */
export function todayIST(): string {
  const p = istParts();
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Convert an instant to its IST YYYY-MM-DD string. */
export function toISTDateString(d: Date | number | string): string {
  const dt = d instanceof Date ? d : new Date(d);
  const p = istParts(dt);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Parse a YYYY-MM-DD (interpreted as IST midnight) into a Date instant. */
export function parseISTDate(ymd: string): Date {
  // IST is UTC+5:30 with no DST — subtract 5h30m to get the UTC instant of IST midnight.
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, -5, -30));
}

/** Whole days between two YYYY-MM-DD dates (a - b). */
export function daysBetweenIST(a: string, b: string): number {
  const da = parseISTDate(a).getTime();
  const db = parseISTDate(b).getTime();
  return Math.round((da - db) / 86_400_000);
}

/** Add N days to a YYYY-MM-DD date. */
export function addDaysIST(ymd: string, n: number): string {
  const dt = parseISTDate(ymd);
  dt.setUTCDate(dt.getUTCDate() + n);
  return toISTDateString(dt);
}

/** e.g. "25 Jul 2026". */
export function formatDateIN(d: Date | number | string): string {
  const dt = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dt);
}

/** e.g. "25 Jul". */
export function formatDateShortIN(d: Date | number | string): string {
  const dt = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TZ,
    day: "2-digit",
    month: "short",
  }).format(dt);
}

/** e.g. "July 2026". */
export function formatMonthYearIN(d: Date | number | string): string {
  const dt = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TZ,
    month: "long",
    year: "numeric",
  }).format(dt);
}

/** e.g. "7:30 pm". */
export function formatTimeIN(d: Date | number | string): string {
  const dt = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(dt)
    .replace(/\s?(AM|PM)/i, (m) => m.trim().toLowerCase());
}

/** e.g. "25 Jul 2026, 7:30 pm IST". */
export function formatDateTimeIN(d: Date | number | string): string {
  return `${formatDateIN(d)}, ${formatTimeIN(d)} IST`;
}

/** IST hour (0-23) for greetings. */
export function istHour(): number {
  return istParts().hour;
}

/** Warm Hinglish relative time. */
export function formatRelativeIN(d: Date | number | string): string {
  const dt = d instanceof Date ? d : new Date(d);
  const diffSec = Math.round((Date.now() - dt.getTime()) / 1000);
  if (diffSec < 45) return "abhi";
  const min = Math.round(diffSec / 60);
  if (min < 60) return `${min} min pehle`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} ghante pehle`;
  const days = daysBetweenIST(todayIST(), toISTDateString(dt));
  if (days === 1) return "kal";
  if (days < 7) return `${days} din pehle`;
  return formatDateIN(dt);
}

/** Monday-first week (Indian cycle-tracking convention). */
export const WEEK_STARTS_ON = 1 as const;
export const WEEKDAY_SHORT_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** IST-based greeting bucket. */
export function greetingIN(): "Good morning" | "Good afternoon" | "Good evening" | "Good night" {
  const h = istHour();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}
