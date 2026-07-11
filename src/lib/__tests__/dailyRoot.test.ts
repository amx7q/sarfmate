import { describe, expect, it } from "vitest";
import { getLocalDateKey, getPreviousLocalDateKey, selectDailyChallengeRoot, selectDailyRoot } from "@/lib/dailyRoot";
import { gradeArabicAnswer, gradeEnglishAnswer } from "@/lib/dailyRootChallenge";
import { getAllRoots } from "@/lib/roots";

describe("Daily Root selection", () => {
  it("creates a padded local calendar key without using the UTC day", () => {
    expect(getLocalDateKey(new Date(2026, 1, 3, 23, 30))).toBe("2026-02-03");
  });

  it("handles leap days and calendar boundaries", () => {
    expect(getLocalDateKey(new Date(2028, 1, 29))).toBe("2028-02-29");
    expect(getPreviousLocalDateKey("2027-01-01")).toBe("2026-12-31");
    expect(getPreviousLocalDateKey("2028-03-01")).toBe("2028-02-29");
  });

  it("is deterministic, eligible, non-mutating, and independent of source order", () => {
    const roots = getAllRoots();
    const original = roots.map((entry) => entry.root);
    const first = selectDailyRoot(roots, "2026-07-11");
    const reversed = selectDailyRoot([...roots].reverse(), "2026-07-11");
    expect(first).toBeDefined();
    expect(first?.root).toBe(reversed?.root);
    expect(selectDailyRoot(roots, "2026-07-11")?.root).toBe(first?.root);
    expect(first?.status).toBe("reviewed");
    expect(first?.forms).toHaveLength(6);
    expect(roots.map((entry) => entry.root)).toEqual(original);
  });

  it("uses a different root for the challenge", () => {
    const roots = getAllRoots();
    const displayed = selectDailyRoot(roots, "2026-07-11");
    const challenge = selectDailyChallengeRoot(roots, "2026-07-11", displayed?.root);
    expect(challenge).toBeDefined();
    expect(challenge?.root).not.toBe(displayed?.root);
  });

  it("handles an empty eligible list safely", () => {
    expect(selectDailyRoot([], "2026-07-11")).toBeUndefined();
  });
});

describe("Daily Root Challenge grading", () => {
  it("awards partial Arabic credit when letters match but vowels do not", () => {
    expect(gradeArabicAnswer("كتب", "كَتَبَ")).toBe("partial");
    expect(gradeArabicAnswer("كَتَبَ", "كَتَبَ")).toBe("correct");
    expect(gradeArabicAnswer("دخل", "كَتَبَ")).toBe("incorrect");
  });

  it("normalises simple English formatting", () => {
    expect(gradeEnglishAnswer("The writer!", "writer")).toBe(true);
    expect(gradeEnglishAnswer("reader", "writer")).toBe(false);
  });
});
