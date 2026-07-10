import { describe, it, expect } from "vitest";
import { formatRoot, matchesRootTransliteration, normaliseArabicInput } from "@/lib/arabic";

describe("normaliseArabicInput", () => {
  it("strips harakat from a fully voweled word", () => {
    expect(normaliseArabicInput("سَمِعَ")).toBe("سمع");
  });

  it("removes spaces between letters", () => {
    expect(normaliseArabicInput("س م ع")).toBe("سمع");
  });

  it("removes hyphens and commas (Latin and Arabic)", () => {
    expect(normaliseArabicInput("س-م-ع")).toBe("سمع");
    expect(normaliseArabicInput("س،م،ع")).toBe("سمع");
    expect(normaliseArabicInput("س,م,ع")).toBe("سمع");
  });

  it("removes tatweel", () => {
    expect(normaliseArabicInput("كـتـب")).toBe("كتب");
  });

  it("normalises alef variants to bare alef", () => {
    expect(normaliseArabicInput("أكل")).toBe("اكل");
    expect(normaliseArabicInput("إكل")).toBe("اكل");
    expect(normaliseArabicInput("آكل")).toBe("اكل");
  });

  it("removes the dagger alif used in words like هٰذا", () => {
    expect(normaliseArabicInput("هٰذا")).toBe("هذا");
  });

  it("removes trailing punctuation", () => {
    expect(normaliseArabicInput("سمع.")).toBe("سمع");
    expect(normaliseArabicInput("سمع؟")).toBe("سمع");
  });

  it("returns an empty string for empty or separator-only input", () => {
    expect(normaliseArabicInput("")).toBe("");
    expect(normaliseArabicInput(" - ، ")).toBe("");
  });
});

describe("formatRoot", () => {
  it("spaces out a three-letter root", () => {
    expect(formatRoot("سمع")).toBe("س م ع");
    expect(formatRoot("كتب")).toBe("ك ت ب");
  });
});

describe("matchesRootTransliteration", () => {
  it("matches compact consonantal root transliteration", () => {
    expect(matchesRootTransliteration("كتب", "ktb")).toBe(true);
    expect(matchesRootTransliteration("خرج", "khrj")).toBe(true);
    expect(matchesRootTransliteration("شكر", "shkr")).toBe(true);
  });

  it("supports common learner spellings for ayn", () => {
    expect(matchesRootTransliteration("سمع", "sm3")).toBe(true);
    expect(matchesRootTransliteration("سمع", "smʿ")).toBe(true);
  });
});
