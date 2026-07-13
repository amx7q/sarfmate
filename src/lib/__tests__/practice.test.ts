import { describe, expect, it } from "vitest";
import { createPracticeSession, getPracticeEligibleRoots } from "@/lib/practice";
import { getAllRoots } from "@/lib/roots";
import { createSeededRandom } from "@/lib/dailyPractice";
import { FORM_LABELS, FORM_SEQUENCE, type RootEntry, type SarfFormKey } from "@/lib/types";

const FORM_ARABIC: Record<SarfFormKey, string> = {
  past: "كَتَبَ",
  present: "يَكْتُبُ",
  imperative: "اُكْتُبْ",
  place_or_mim_masdar: "مَكْتَب",
  active_participle: "كَاتِب",
  passive_participle: "مَكْتُوب",
};

function makeRoot(root: string, status: RootEntry["status"] = "reviewed"): RootEntry {
  return {
    root,
    displayRoot: root.split("").join(" "),
    meaningEn: `meaning ${root}`,
    status,
    measure: "I",
    updatedAt: "2026-01-01",
    forms: FORM_SEQUENCE.map((key, index) => ({
      order: index + 1,
      key,
      arabic: `${FORM_ARABIC[key]} ${root}`,
      transliteration: `${key}-${root}`,
      labelAr: FORM_LABELS[key].labelAr,
      labelEn: FORM_LABELS[key].labelEn,
      meaningEn: `${key.replaceAll("_", " ")} ${root}`,
      exampleAr: `${FORM_ARABIC[key]} ${root} مثال`,
      exampleEn: `Example ${root}`,
      reviewState: "reviewed",
    })),
  };
}

const deterministicRandom = () => 0.37;

describe("practice question generation", () => {
  const reviewedRoots = [makeRoot("كتب"), makeRoot("سمع"), makeRoot("علم")];

  it("creates a five-question session without mutating its root data", () => {
    const source = structuredClone(reviewedRoots);
    const session = createPracticeSession(source, { random: deterministicRandom });

    expect(session.questions).toHaveLength(5);
    expect(source).toEqual(reviewedRoots);
  });

  it("gives every question one present, unique correct option", () => {
    const session = createPracticeSession(reviewedRoots, { random: deterministicRandom });

    for (const question of session.questions) {
      expect(new Set(question.options.map((option) => option.label)).size).toBe(question.options.length);
      expect(new Set(question.options.map((option) => option.id)).size).toBe(question.options.length);
      expect(question.options.filter((option) => option.id === question.correctOptionId)).toHaveLength(1);
    }
  });

  it("uses individually reviewed forms from partially reviewed roots", () => {
    const malformed = makeRoot("دخل");
    malformed.forms[0] = { ...malformed.forms[0], arabic: "" };
    malformed.forms.slice(1).forEach((form) => { form.reviewState = "pending"; });
    const partial = makeRoot("خرج", "partially_reviewed");
    partial.forms.slice(1).forEach((form) => { form.reviewState = "pending"; });
    const roots = [...reviewedRoots, partial, malformed];

    expect(getPracticeEligibleRoots(roots).map((entry) => entry.root)).toEqual(
      [...reviewedRoots.map((entry) => entry.root), partial.root],
    );
    expect(createPracticeSession(roots, { random: deterministicRandom }).questions.every((question) =>
      [...reviewedRoots, partial].some((entry) => entry.root === question.root),
    )).toBe(true);
    const partialQuestions = createPracticeSession(roots, {
      priorityRoot: partial.root,
      random: deterministicRandom,
    }).questions.filter((question) => question.root === partial.root);
    expect(partialQuestions.every((question) => question.formKey === "past")).toBe(true);
    expect(createPracticeSession(roots, {
      priorityRoot: partial.root,
      random: deterministicRandom,
      difficulty: "hard",
    }).questions.every((question) => question.root !== partial.root)).toBe(true);
  });

  it("does not require example sentences for easy and medium reviewed-form questions", () => {
    const partial = makeRoot("خرج", "partially_reviewed");
    partial.forms.slice(1).forEach((form) => { form.reviewState = "pending"; });
    delete partial.forms[0].exampleAr;
    delete partial.forms[0].exampleEn;

    expect(getPracticeEligibleRoots([partial])).toHaveLength(1);
    expect(createPracticeSession([partial, ...reviewedRoots], {
      priorityRoot: partial.root,
      random: deterministicRandom,
      difficulty: "easy",
    }).questions.some((question) => question.root === partial.root)).toBe(true);
  });

  it("uses the stored target form for every question type", () => {
    const root = reviewedRoots[0];
    const session = createPracticeSession([root, ...reviewedRoots.slice(1)], {
      priorityRoot: root.root,
      random: deterministicRandom,
      difficulty: "daily",
    });

    const arabicToEnglish = session.questions.find((question) => question.type === "arabic_to_english")!;
    const englishToArabic = session.questions.find((question) => question.type === "english_to_arabic")!;
    const formLabel = session.questions.find((question) => question.type === "arabic_to_form_label")!;
    const sentenceToEnglish = session.questions.find((question) => question.type === "sentence_to_english")!;

    expect(arabicToEnglish.options.find((option) => option.id === arabicToEnglish.correctOptionId)?.label).toBe(
      arabicToEnglish.explanation.meaningEn,
    );
    expect(englishToArabic.options.find((option) => option.id === englishToArabic.correctOptionId)?.label).toBe(
      englishToArabic.explanation.arabic,
    );
    expect(formLabel.options.find((option) => option.id === formLabel.correctOptionId)?.label).toBe(
      formLabel.explanation.formLabelEn,
    );
    expect(sentenceToEnglish.sentenceArabic).toContain(sentenceToEnglish.targetArabic);
    expect(sentenceToEnglish.options.find((option) => option.id === sentenceToEnglish.correctOptionId)?.label).toBe(
      sentenceToEnglish.explanation.meaningEn,
    );
  });

  it("does not duplicate question ids and prioritises a requested reviewed root", () => {
    const priorityRoot = reviewedRoots[1];
    const session = createPracticeSession(reviewedRoots, {
      priorityRoot: priorityRoot.root,
      random: deterministicRandom,
    });

    expect(new Set(session.questions.map((question) => question.id)).size).toBe(session.questions.length);
    expect(session.questions[0].root).toBe(priorityRoot.root);
  });

  it("spreads a session across roots when enough reviewed roots are available", () => {
    const session = createPracticeSession(reviewedRoots, { random: deterministicRandom });

    expect(new Set(session.questions.map((question) => question.root)).size).toBe(3);
  });

  it("builds all daily question types from the real reviewed root library", () => {
    const session = createPracticeSession(getAllRoots(), {
      random: deterministicRandom,
      difficulty: "daily",
    });

    expect(session.questions).toHaveLength(5);
    expect(new Set(session.questions.map((question) => question.type))).toEqual(
      new Set([
        "arabic_to_english",
        "english_to_arabic",
        "arabic_to_form_label",
        "sentence_to_english",
      ]),
    );
  });

  it("uses the expected question mix for each difficulty", () => {
    const easy = createPracticeSession(reviewedRoots, { random: deterministicRandom, difficulty: "easy" });
    const medium = createPracticeSession(reviewedRoots, { random: deterministicRandom, difficulty: "medium" });
    const hard = createPracticeSession(reviewedRoots, { random: deterministicRandom, difficulty: "hard" });

    expect(new Set(easy.questions.map((question) => question.type))).toEqual(
      new Set(["arabic_to_english", "english_to_arabic"]),
    );
    expect(new Set(medium.questions.map((question) => question.type))).toEqual(
      new Set(["arabic_to_english", "english_to_arabic", "arabic_to_form_label"]),
    );
    expect(new Set(hard.questions.map((question) => question.type))).toEqual(
      new Set(["sentence_to_english"]),
    );
  });

  it("creates the same daily questions and options from the same date seed", () => {
    const first = createPracticeSession(reviewedRoots, {
      random: createSeededRandom("sarfmate-daily:2026-07-10"),
      difficulty: "daily",
    });
    const second = createPracticeSession(reviewedRoots, {
      random: createSeededRandom("sarfmate-daily:2026-07-10"),
      difficulty: "daily",
    });

    expect(second).toEqual(first);
  });

  it("stamps every question with the form key it targets", () => {
    const session = createPracticeSession(getAllRoots(), {
      random: deterministicRandom,
      difficulty: "daily",
    });

    for (const question of session.questions) {
      expect(question.formKey).toBeTruthy();
      expect(FORM_SEQUENCE).toContain(question.formKey);
    }
  });

  it("prioritises requested root+form items ahead of everything else", () => {
    const items = [
      { root: "سمع", formKey: "past" as const },
      { root: "علم", formKey: "active_participle" as const },
    ];
    const session = createPracticeSession(reviewedRoots, {
      random: deterministicRandom,
      priorityItems: items,
      questionCount: items.length,
    });

    expect(session.questions).toHaveLength(items.length);
    expect(session.questions.map((question) => ({ root: question.root, formKey: question.formKey }))).toEqual(
      expect.arrayContaining(items),
    );
  });

  it("skips a priority item with no eligible question and does not crash", () => {
    const items = [
      { root: "سمع", formKey: "past" as const },
      { root: "does-not-exist", formKey: "past" as const },
    ];
    const session = createPracticeSession(reviewedRoots, {
      random: deterministicRandom,
      priorityItems: items,
      questionCount: 5,
    });

    expect(session.questions.some((question) => question.root === "سمع" && question.formKey === "past")).toBe(true);
  });
});
