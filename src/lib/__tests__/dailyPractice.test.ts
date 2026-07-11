import { describe, expect, it } from "vitest";
import {
  EMPTY_DAILY_PROGRESS,
  completeDailyPractice,
  createSeededRandom,
  getActiveDailyStreak,
  getPreviousUtcDateKey,
  getUtcDateKey,
  parseDailyPracticeProgress,
} from "@/lib/dailyPractice";

describe("daily practice helpers", () => {
  it("uses a stable UTC date key and previous day", () => {
    expect(getUtcDateKey(new Date("2026-07-10T23:59:00Z"))).toBe("2026-07-10");
    expect(getPreviousUtcDateKey("2026-03-01")).toBe("2026-02-28");
  });

  it("creates the same random sequence from the same seed", () => {
    const first = createSeededRandom("daily:2026-07-10");
    const second = createSeededRandom("daily:2026-07-10");
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it("starts, continues, and resets a streak", () => {
    const first = completeDailyPractice(EMPTY_DAILY_PROGRESS, "2026-07-08", 4, 5);
    const second = completeDailyPractice(first, "2026-07-09", 5, 5);
    const reset = completeDailyPractice(second, "2026-07-11", 3, 5);
    expect(first.streak).toBe(1);
    expect(second.streak).toBe(2);
    expect(reset.streak).toBe(1);
  });

  it("does not increment twice on the same day", () => {
    const first = completeDailyPractice(EMPTY_DAILY_PROGRESS, "2026-07-10", 3, 5);
    const replay = completeDailyPractice(first, "2026-07-10", 5, 5);
    expect(replay).toEqual({ ...first, lastScore: 5 });
  });

  it("shows only a current or yesterday-continuable streak as active", () => {
    const progress = completeDailyPractice(EMPTY_DAILY_PROGRESS, "2026-07-09", 4, 5);
    expect(getActiveDailyStreak(progress, "2026-07-09")).toBe(1);
    expect(getActiveDailyStreak(progress, "2026-07-10")).toBe(1);
    expect(getActiveDailyStreak(progress, "2026-07-11")).toBe(0);
  });

  it("safely rejects missing, corrupted, and malformed stored values", () => {
    expect(parseDailyPracticeProgress(null)).toEqual(EMPTY_DAILY_PROGRESS);
    expect(parseDailyPracticeProgress("not-json")).toEqual(EMPTY_DAILY_PROGRESS);
    expect(parseDailyPracticeProgress('{"streak":-2}')).toEqual(EMPTY_DAILY_PROGRESS);
  });
});
