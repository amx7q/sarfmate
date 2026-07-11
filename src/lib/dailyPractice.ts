export const DAILY_PRACTICE_STORAGE_KEY = "sarfmate-daily-practice-v1";

export type DailyPracticeProgress = {
  lastCompletedDate: string;
  streak: number;
  lastScore: number;
  questionCount: number;
};

export const EMPTY_DAILY_PROGRESS: DailyPracticeProgress = {
  lastCompletedDate: "",
  streak: 0,
  lastScore: 0,
  questionCount: 5,
};

export function getUtcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getPreviousUtcDateKey(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return getUtcDateKey(date);
}

export function createSeededRandom(seedText: string): () => number {
  let seed = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    seed ^= seedText.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }

  return () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function parseDailyPracticeProgress(value: string | null): DailyPracticeProgress {
  if (!value) return EMPTY_DAILY_PROGRESS;
  try {
    const parsed = JSON.parse(value) as Partial<DailyPracticeProgress>;
    if (
      typeof parsed.lastCompletedDate !== "string" ||
      typeof parsed.streak !== "number" ||
      !Number.isInteger(parsed.streak) ||
      parsed.streak < 0 ||
      typeof parsed.lastScore !== "number" ||
      !Number.isInteger(parsed.lastScore) ||
      parsed.lastScore < 0 ||
      typeof parsed.questionCount !== "number" ||
      !Number.isInteger(parsed.questionCount) ||
      parsed.questionCount < 1 ||
      parsed.lastScore > parsed.questionCount
    ) {
      return EMPTY_DAILY_PROGRESS;
    }
    return parsed as DailyPracticeProgress;
  } catch {
    return EMPTY_DAILY_PROGRESS;
  }
}

export function completeDailyPractice(
  current: DailyPracticeProgress,
  dateKey: string,
  score: number,
  questionCount: number,
): DailyPracticeProgress {
  if (current.lastCompletedDate === dateKey) {
    return { ...current, lastScore: score, questionCount };
  }

  const continued = current.lastCompletedDate === getPreviousUtcDateKey(dateKey);
  return {
    lastCompletedDate: dateKey,
    streak: continued ? current.streak + 1 : 1,
    lastScore: score,
    questionCount,
  };
}

export function getActiveDailyStreak(
  progress: DailyPracticeProgress,
  dateKey: string,
): number {
  return progress.lastCompletedDate === dateKey ||
    progress.lastCompletedDate === getPreviousUtcDateKey(dateKey)
    ? progress.streak
    : 0;
}
