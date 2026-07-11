import { normaliseArabicInput } from "@/lib/arabic";

export type AnswerScore = "correct" | "partial" | "incorrect";

function normaliseVowelledArabic(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[\s\u00a0\u0640.,!?;:'"()[\]{}\-_/\\|،؛؟«»]/g, "")
    .replace(/[أإآٱ]/g, "ا");
}

function normaliseEnglish(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(a|an|the|to)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function gradeArabicAnswer(answer: string, expected: string): AnswerScore {
  if (!answer.trim()) return "incorrect";
  if (normaliseVowelledArabic(answer) === normaliseVowelledArabic(expected)) return "correct";
  return normaliseArabicInput(answer) === normaliseArabicInput(expected) ? "partial" : "incorrect";
}

export function gradeEnglishAnswer(answer: string, expected: string): boolean {
  const submitted = normaliseEnglish(answer);
  if (!submitted) return false;
  const accepted = expected
    .split(/[,;/]|\bor\b/i)
    .map(normaliseEnglish)
    .filter(Boolean);
  return accepted.some((meaning) => submitted === meaning);
}

export function arabicPoints(score: AnswerScore): number {
  return score === "correct" ? 1 : score === "partial" ? 0.5 : 0;
}

export type DailyRootChallengeProgress = {
  lastCompletedDate: string;
  streak: number;
  lastScore: number;
  totalPoints: number;
};

export const EMPTY_DAILY_ROOT_CHALLENGE_PROGRESS: DailyRootChallengeProgress = {
  lastCompletedDate: "",
  streak: 0,
  lastScore: 0,
  totalPoints: 12,
};

export function completeDailyRootChallenge(
  current: DailyRootChallengeProgress,
  dateKey: string,
  score: number,
  previousDateKey: string,
): DailyRootChallengeProgress {
  if (current.lastCompletedDate === dateKey) return { ...current, lastScore: score };
  return {
    lastCompletedDate: dateKey,
    streak: current.lastCompletedDate === previousDateKey ? current.streak + 1 : 1,
    lastScore: score,
    totalPoints: 12,
  };
}
