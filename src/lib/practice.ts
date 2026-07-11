import { normaliseArabicInput } from "@/lib/arabic";
import { FORM_SEQUENCE, type RootEntry, type SarfForm, type SarfFormKey } from "@/lib/types";

export type PracticeQuestionType =
  | "arabic_to_english"
  | "english_to_arabic"
  | "arabic_to_form_label"
  | "sentence_to_english";

export type PracticeDifficulty = "easy" | "medium" | "hard";

export type PracticeOption = {
  id: string;
  label: string;
};

export type PracticeQuestion = {
  id: string;
  type: PracticeQuestionType;
  root: string;
  formKey: SarfFormKey;
  prompt: string;
  promptArabic?: string;
  sentenceArabic?: string;
  targetArabic?: string;
  optionLanguage: "arabic" | "english";
  options: PracticeOption[];
  correctOptionId: string;
  explanation: {
    arabic: string;
    meaningEn: string;
    formLabelEn: string;
    formLabelAr: string;
  };
};

export type PracticeSession = {
  questions: PracticeQuestion[];
  roots: Array<{ root: string; displayRoot: string }>;
};

type PracticeSource = {
  root: string;
  displayRoot: string;
  form: SarfForm;
};

export type PracticeItemRef = { root: string; formKey: SarfFormKey };

type PracticeGeneratorOptions = {
  random?: () => number;
  priorityRoot?: string;
  priorityItems?: PracticeItemRef[];
  questionCount?: number;
  difficulty?: PracticeDifficulty | "daily";
};

const REQUIRED_FORM_FIELDS = [
  "arabic",
  "transliteration",
  "labelAr",
  "labelEn",
  "meaningEn",
  "exampleAr",
  "exampleEn",
] as const;

const QUESTION_TYPES: Record<PracticeDifficulty | "daily", PracticeQuestionType[]> = {
  easy: ["arabic_to_english", "english_to_arabic"],
  medium: ["arabic_to_english", "english_to_arabic", "arabic_to_form_label"],
  hard: ["sentence_to_english"],
  daily: [
    "arabic_to_english",
    "english_to_arabic",
    "arabic_to_form_label",
    "sentence_to_english",
  ],
};

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function normaliseLabel(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function optionId(source: PracticeSource): string {
  return `${source.root}:${source.form.key}`;
}

function randomIndex(length: number, random: () => number): number {
  return Math.min(length - 1, Math.max(0, Math.floor(random() * length)));
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, random);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

/** Returns roots whose reviewed, complete six-form data is safe to quiz from. */
export function getPracticeEligibleRoots(entries: readonly RootEntry[]): RootEntry[] {
  return entries.filter((entry) => {
    if (
      entry.status !== "reviewed" ||
      !hasText(entry.root) ||
      !hasText(entry.displayRoot) ||
      !hasText(entry.meaningEn) ||
      entry.forms.length !== FORM_SEQUENCE.length
    ) {
      return false;
    }

    return entry.forms.every((form, index) =>
      form.key === FORM_SEQUENCE[index] &&
      form.order === index + 1 &&
      REQUIRED_FORM_FIELDS.every((field) => hasText(form[field])),
    );
  });
}

function makeOptions(
  correct: PracticeSource,
  allSources: readonly PracticeSource[],
  label: (source: PracticeSource) => string,
  random: () => number,
): PracticeOption[] | null {
  const correctLabel = label(correct);
  const usedLabels = new Set([normaliseLabel(correctLabel)]);
  const distractors: PracticeSource[] = [];

  for (const source of shuffled(allSources, random)) {
    const sourceLabel = label(source);
    if (optionId(source) === optionId(correct) || usedLabels.has(normaliseLabel(sourceLabel))) continue;
    usedLabels.add(normaliseLabel(sourceLabel));
    distractors.push(source);
    if (distractors.length === 3) break;
  }

  if (distractors.length < 2) return null;

  return shuffled([correct, ...distractors], random).map((source) => ({
    id: optionId(source),
    label: label(source),
  }));
}

function createQuestion(
  type: PracticeQuestionType,
  source: PracticeSource,
  allSources: readonly PracticeSource[],
  random: () => number,
): PracticeQuestion | null {
  const { form } = source;
  const id = `${type}:${source.root}:${form.key}`;
  const base = {
    id,
    type,
    root: source.root,
    formKey: form.key,
    explanation: {
      arabic: form.arabic,
      meaningEn: form.meaningEn,
      formLabelEn: form.labelEn,
      formLabelAr: form.labelAr,
    },
  };

  if (type === "arabic_to_english") {
    const options = makeOptions(source, allSources, (item) => item.form.meaningEn, random);
    if (!options) return null;
    return {
      ...base,
      prompt: "What does this form mean?",
      promptArabic: form.arabic,
      optionLanguage: "english",
      options,
      correctOptionId: optionId(source),
    };
  }

  if (type === "sentence_to_english") {
    if (!form.exampleAr.includes(form.arabic)) return null;
    const options = makeOptions(source, allSources, (item) => item.form.meaningEn, random);
    if (!options) return null;
    return {
      ...base,
      prompt: "What does the highlighted form mean in this sentence?",
      sentenceArabic: form.exampleAr,
      targetArabic: form.arabic,
      optionLanguage: "english",
      options,
      correctOptionId: optionId(source),
    };
  }

  if (type === "arabic_to_form_label") {
    const options = makeOptions(source, allSources, (item) => item.form.labelEn, random);
    if (!options) return null;
    return {
      ...base,
      prompt: "Which type of form is shown?",
      promptArabic: form.arabic,
      optionLanguage: "english",
      options,
      correctOptionId: optionId(source),
    };
  }

  const sameMeaning = new Set(
    allSources
      .filter((item) => normaliseLabel(item.form.meaningEn) === normaliseLabel(form.meaningEn))
      .map(optionId),
  );
  const uniqueMeaningSources = allSources.filter((item) => !sameMeaning.has(optionId(item)) || optionId(item) === optionId(source));
  const options = makeOptions(source, uniqueMeaningSources, (item) => item.form.arabic, random);
  if (!options) return null;
  return {
    ...base,
    prompt: `Which form means “${form.meaningEn}”?`,
    optionLanguage: "arabic",
    options,
    correctOptionId: optionId(source),
  };
}

/**
 * Builds a fresh in-memory practice session. It never mutates the root data and
 * accepts a random function so its option and question ordering is testable.
 */
export function createPracticeSession(
  entries: readonly RootEntry[],
  {
    random = Math.random,
    priorityRoot,
    priorityItems,
    questionCount = 5,
    difficulty = "medium",
  }: PracticeGeneratorOptions = {},
): PracticeSession {
  const eligibleRoots = getPracticeEligibleRoots(entries);
  const priorityKey = priorityRoot ? normaliseArabicInput(priorityRoot) : "";
  const priorityRoots = priorityKey
    ? eligibleRoots.filter((entry) => normaliseArabicInput(entry.root) === priorityKey)
    : [];
  const otherRoots = eligibleRoots.filter((entry) => !priorityRoots.includes(entry));
  const orderedRoots = [...priorityRoots, ...shuffled(otherRoots, random)];
  const allSources = orderedRoots.flatMap((entry) =>
    entry.forms.map((form) => ({ root: entry.root, displayRoot: entry.displayRoot, form })),
  );

  const candidates = orderedRoots.flatMap((entry) =>
    entry.forms.flatMap((form) => {
      const source = { root: entry.root, displayRoot: entry.displayRoot, form };
      return QUESTION_TYPES[difficulty].map((type) => createQuestion(type, source, allSources, random)).filter(
        (question): question is PracticeQuestion => question !== null,
      );
    }),
  );

  const selected: PracticeQuestion[] = [];
  const selectedIds = new Set<string>();
  const selectedRoots = new Set<string>();
  for (const item of priorityItems ?? []) {
    if (selected.length >= questionCount) break;
    const question = candidates.find(
      (candidate) =>
        candidate.root === item.root && candidate.formKey === item.formKey && !selectedIds.has(candidate.id),
    );
    if (question) {
      selected.push(question);
      selectedIds.add(question.id);
      selectedRoots.add(question.root);
    }
  }
  for (const type of QUESTION_TYPES[difficulty]) {
    const question = candidates.find(
      (candidate) =>
        candidate.type === type &&
        !selectedIds.has(candidate.id) &&
        !selectedRoots.has(candidate.root),
    ) ?? candidates.find((candidate) => candidate.type === type && !selectedIds.has(candidate.id));
    if (question) {
      selected.push(question);
      selectedIds.add(question.id);
      selectedRoots.add(question.root);
    }
  }
  for (const question of candidates) {
    if (selected.length >= questionCount) break;
    if (!selectedIds.has(question.id) && !selectedRoots.has(question.root)) {
      selected.push(question);
      selectedIds.add(question.id);
      selectedRoots.add(question.root);
    }
  }
  for (const question of candidates) {
    if (selected.length >= questionCount) break;
    if (!selectedIds.has(question.id)) {
      selected.push(question);
      selectedIds.add(question.id);
    }
  }

  const questions = selected.slice(0, questionCount);
  const includedRoots = new Map<string, string>();
  for (const question of questions) {
    const root = orderedRoots.find((entry) => entry.root === question.root);
    if (root) includedRoots.set(root.root, root.displayRoot);
  }

  return {
    questions,
    roots: [...includedRoots].map(([root, displayRoot]) => ({ root, displayRoot })),
  };
}
