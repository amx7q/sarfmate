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
