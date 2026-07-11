import type { SarfFormKey } from "@/lib/types";

export const PRACTICE_ATTEMPTS_STORAGE_KEY = "sarfmate-practice-attempts-v1";

const RECENT_LIMIT = 10;
const WEAK_WINDOW_DAYS = 14;

export type AttemptItemStats = {
  attempts: number;
  correct: number;
  recent: boolean[];
  lastAttemptAt: string;
  lastWrongAt?: string;
};

export type PracticeAttemptsStore = {
  version: 1;
  items: Record<string, AttemptItemStats>;
};

export const EMPTY_ATTEMPTS_STORE: PracticeAttemptsStore = { version: 1, items: {} };

export type WeakItem = { root: string; formKey: SarfFormKey };

function itemKey(root: string, formKey: SarfFormKey): string {
  return `${root}:${formKey}`;
}

function isValidStats(value: unknown): value is AttemptItemStats {
  if (!value || typeof value !== "object") return false;
  const stats = value as Partial<AttemptItemStats>;
  return (
    Number.isInteger(stats.attempts) &&
    stats.attempts! >= 0 &&
    Number.isInteger(stats.correct) &&
    stats.correct! >= 0 &&
    stats.correct! <= stats.attempts! &&
    Array.isArray(stats.recent) &&
    stats.recent.every((value) => typeof value === "boolean") &&
    typeof stats.lastAttemptAt === "string" &&
    (stats.lastWrongAt === undefined || typeof stats.lastWrongAt === "string")
  );
}

/** Parses the stored attempt log, discarding anything malformed back to an empty store. */
export function parseAttemptsStore(raw: string | null): PracticeAttemptsStore {
  if (!raw) return EMPTY_ATTEMPTS_STORE;
  try {
    const parsed = JSON.parse(raw) as Partial<PracticeAttemptsStore>;
    if (parsed.version !== 1 || !parsed.items || typeof parsed.items !== "object") {
      return EMPTY_ATTEMPTS_STORE;
    }
    const items: Record<string, AttemptItemStats> = {};
    for (const [key, value] of Object.entries(parsed.items)) {
      if (isValidStats(value)) {
        items[key] = {
          attempts: value.attempts,
          correct: value.correct,
          recent: value.recent.slice(-RECENT_LIMIT),
          lastAttemptAt: value.lastAttemptAt,
          ...(value.lastWrongAt ? { lastWrongAt: value.lastWrongAt } : {}),
        };
      }
    }
    return { version: 1, items };
  } catch {
    return EMPTY_ATTEMPTS_STORE;
  }
}

/** Immutably records one graded answer for a root+form item. */
export function recordAttempt(
  store: PracticeAttemptsStore,
  root: string,
  formKey: SarfFormKey,
  correct: boolean,
  dateKey: string,
): PracticeAttemptsStore {
  const key = itemKey(root, formKey);
  const existing = store.items[key];
  const recent = [...(existing?.recent ?? []), correct].slice(-RECENT_LIMIT);
  const next: AttemptItemStats = {
    attempts: (existing?.attempts ?? 0) + 1,
    correct: (existing?.correct ?? 0) + (correct ? 1 : 0),
    recent,
    lastAttemptAt: dateKey,
    ...(correct ? (existing?.lastWrongAt ? { lastWrongAt: existing.lastWrongAt } : {}) : { lastWrongAt: dateKey }),
  };
  return { version: 1, items: { ...store.items, [key]: next } };
}

function daysBetween(fromDateKey: string, toDateKey: string): number {
  const from = new Date(`${fromDateKey}T00:00:00.000Z`).getTime();
  const to = new Date(`${toDateKey}T00:00:00.000Z`).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

function recentAccuracy(stats: AttemptItemStats): number {
  if (stats.recent.length === 0) return 1;
  const correctCount = stats.recent.filter(Boolean).length;
  return correctCount / stats.recent.length;
}

/** Returns the weakest root+form items missed within the last 14 days, most in need of review first. */
export function getWeakItems(store: PracticeAttemptsStore, dateKey: string, limit: number): WeakItem[] {
  const candidates = Object.entries(store.items)
    .filter(([, stats]) => stats.lastWrongAt && daysBetween(stats.lastWrongAt, dateKey) <= WEAK_WINDOW_DAYS)
    .map(([key, stats]) => {
      const [root, formKey] = key.split(":") as [string, SarfFormKey];
      return { root, formKey, stats };
    });

  candidates.sort((a, b) => {
    const aLastWrong = a.stats.recent[a.stats.recent.length - 1] === false;
    const bLastWrong = b.stats.recent[b.stats.recent.length - 1] === false;
    if (aLastWrong !== bLastWrong) return aLastWrong ? -1 : 1;

    const accuracyDiff = recentAccuracy(a.stats) - recentAccuracy(b.stats);
    if (accuracyDiff !== 0) return accuracyDiff;

    return (b.stats.lastWrongAt ?? "").localeCompare(a.stats.lastWrongAt ?? "");
  });

  return candidates.slice(0, limit).map(({ root, formKey }) => ({ root, formKey }));
}
