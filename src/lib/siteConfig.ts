/** Canonical site constants shared by metadata, sitemap, robots, and JSON-LD. */
export const SITE_URL = "https://sarfmate.app";
export const SITE_NAME = "SarfMate";
export const SITE_TITLE = "SarfMate — Arabic roots & forms";
export const SITE_DESCRIPTION =
  "Type an Arabic root and see its core forms, meanings, and examples in one clean learner-friendly view. Built for English-speaking students of Arabic, ṣarf, and Quranic vocabulary.";

/** Absolute URL for a root detail page, with the Arabic segment encoded. */
export function rootUrl(root: string): string {
  return `${SITE_URL}/root/${encodeURIComponent(root)}`;
}
