/**
 * Normalises Arabic user input for lenient root matching.
 * Strips whitespace, tatweel, diacritics, punctuation, and separators,
 * and normalises alef variants. Never used to mutate stored data.
 */
export function normaliseArabicInput(input: string): string {
  return (
    input
      // whitespace incl. NBSP
      .replace(/[\s ]+/g, "")
      // tatweel
      .replace(/ـ/g, "")
      // harakat (U+064B-U+0652), Quranic marks (U+0653-U+065F), dagger alif (U+0670)
      .replace(/[ً-ٰٟ]/g, "")
      // punctuation and separators (Latin + Arabic comma/semicolon/question mark)
      .replace(/[.,!?;:'"()[\]{}\-_/\\|،؛؟«»]/g, "")
      // alef variants -> bare alef (matching leniency only)
      .replace(/[أإآٱ]/g, "ا")
  );
}

/** Formats a bare root into a spaced display form: "سمع" -> "س م ع". */
export function formatRoot(root: string): string {
  return [...root].join(" ");
}

const ROOT_TRANSLITERATION: Record<string, readonly string[]> = {
  ا: ["", "a"], أ: ["", "a"], إ: ["", "i"], آ: ["a"], ء: ["", "2"],
  ب: ["b"], ت: ["t"], ث: ["th"], ج: ["j"], ح: ["h"], خ: ["kh"],
  د: ["d"], ذ: ["dh"], ر: ["r"], ز: ["z"], س: ["s"], ش: ["sh"],
  ص: ["s"], ض: ["d"], ط: ["t"], ظ: ["z", "dh"], ع: ["", "3", "a"],
  غ: ["gh"], ف: ["f"], ق: ["q"], ك: ["k"], ل: ["l"], م: ["m"],
  ن: ["n"], ه: ["h"], و: ["w"], ي: ["y"], ى: ["y"],
};

/** Normalises common learner transliteration spellings for comparison. */
export function normaliseLatinTransliteration(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/ṣ/g, "s")
    .replace(/ḍ/g, "d")
    .replace(/ṭ/g, "t")
    .replace(/ẓ/g, "z")
    .replace(/ḥ/g, "h")
    .replace(/[ʿ‘’']/g, "")
    .replace(/[ʾʼ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Matches compact consonantal root input such as "ktb" against كتب. */
export function matchesRootTransliteration(root: string, input: string): boolean {
  const query = normaliseLatinTransliteration(input);
  if (!query) return false;

  let variants = [""];
  for (const letter of [...root]) {
    const choices = ROOT_TRANSLITERATION[letter];
    if (!choices) return false;
    variants = variants.flatMap((prefix) => choices.map((choice) => `${prefix}${choice}`));
  }
  return variants.includes(query);
}
