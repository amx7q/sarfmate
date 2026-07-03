import { roots } from "@/data/roots";
import { normaliseArabicInput, formatRoot } from "@/lib/arabic";
import { FORM_SEQUENCE, type RootEntry, type SarfForm } from "@/lib/types";

/** Single data-access point. Swap the import for a database call later. */
export function getAllRoots(): RootEntry[] {
  return roots;
}

/** Finds a root entry by any reasonable user spelling of the root. */
export function findRoot(query: string): RootEntry | undefined {
  const q = normaliseArabicInput(query);
  if (!q) return undefined;
  return getAllRoots().find((entry) => normaliseArabicInput(entry.root) === q);
}

const HAS_ARABIC = /[؀-ۿ]/;

/**
 * Finds a root by Arabic letters or by English meaning.
 * Arabic input matches the root itself; English input matches the entry's
 * meaning summary first, then any form's meaning (e.g. "office" finds كتب).
 */
export function searchRoot(query: string): RootEntry | undefined {
  const arabicMatch = findRoot(query);
  if (arabicMatch) return arabicMatch;

  const q = query.trim().toLowerCase();
  if (!q || HAS_ARABIC.test(query)) return undefined;

  const all = getAllRoots();
  return (
    all.find((entry) => entry.meaningEn.toLowerCase().includes(q)) ??
    all.find((entry) =>
      entry.forms.some((form) => form.meaningEn.toLowerCase().includes(q)),
    )
  );
}

/** Returns the entry's forms sorted into the fixed learner order. */
export function getOrderedForms(entry: RootEntry): SarfForm[] {
  return [...entry.forms].sort((a, b) => a.order - b.order);
}

const ARABIC_LETTER = /^[ء-ي]{3}$/;
const REQUIRED_FORM_FIELDS = [
  "arabic",
  "transliteration",
  "labelAr",
  "labelEn",
  "meaningEn",
  "exampleAr",
  "exampleEn",
] as const;
const VALID_STATUSES = ["reviewed", "community_suggested", "ai_draft"] as const;
const PLACEHOLDER_RE = /\b(todo|tbd|placeholder|lorem ipsum|xxx)\b/i;

export function validateAllRootEntries(entries: RootEntry[] = getAllRoots()): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const key = normaliseArabicInput(entry.root);
    if (seen.has(key)) errors.push(`duplicate full root entry ${entry.root}`);
    seen.add(key);
    errors.push(...validateRootEntry(entry).map((error) => `${entry.root}: ${error}`));
  }

  return errors;
}

/** Validates a root entry, returning a list of human-readable problems (empty = valid). */
export function validateRootEntry(entry: RootEntry): string[] {
  const errors: string[] = [];

  if (!entry.root) {
    errors.push("root is missing");
  } else if (!ARABIC_LETTER.test(entry.root)) {
    errors.push(`root "${entry.root}" must be exactly three Arabic letters`);
  }

  if (!entry.displayRoot) {
    errors.push("displayRoot is missing");
  } else if (entry.root && entry.displayRoot !== formatRoot(entry.root)) {
    errors.push(`displayRoot "${entry.displayRoot}" does not match formatRoot(root)`);
  }

  if (!entry.meaningEn) errors.push("meaningEn is missing");
  if (!VALID_STATUSES.includes(entry.status)) {
    errors.push(`status "${entry.status}" is invalid`);
  }
  if (!entry.updatedAt || Number.isNaN(Date.parse(entry.updatedAt))) {
    errors.push("updatedAt is missing or not a parseable date");
  }
  if (entry.quranOccurrenceCount !== undefined && entry.quranOccurrenceCount < 0) {
    errors.push("quranOccurrenceCount must be a positive number when present");
  }
  if (entry.firstQuranOccurrence) {
    if (entry.firstQuranOccurrence.surah < 1 || entry.firstQuranOccurrence.surah > 114) {
      errors.push("firstQuranOccurrence.surah must be between 1 and 114");
    }
    if (entry.firstQuranOccurrence.ayah < 1) {
      errors.push("firstQuranOccurrence.ayah must be positive");
    }
  }
  if (
    [entry.meaningEn, entry.notes, ...entry.forms.flatMap((form) => [
      form.meaningEn,
      form.exampleEn,
      form.notes,
    ])]
      .filter(Boolean)
      .some((value) => PLACEHOLDER_RE.test(value!))
  ) {
    errors.push("entry contains accidental placeholder text");
  }

  if (entry.forms.length !== 6) {
    errors.push(`expected exactly 6 forms, found ${entry.forms.length}`);
  }

  const orders = entry.forms.map((f) => f.order);
  for (let expected = 1; expected <= 6; expected++) {
    if (!orders.includes(expected)) errors.push(`missing form with order ${expected}`);
  }
  if (new Set(orders).size !== orders.length) errors.push("duplicate form orders");

  const keys = entry.forms.map((f) => f.key);
  if (new Set(keys).size !== keys.length) errors.push("duplicate form keys");

  for (const form of entry.forms) {
    const expectedKey = FORM_SEQUENCE[form.order - 1];
    if (expectedKey && form.key !== expectedKey) {
      errors.push(
        `form at order ${form.order} has key "${form.key}" but the fixed sequence expects "${expectedKey}"`,
      );
    }
    for (const field of REQUIRED_FORM_FIELDS) {
      if (!form[field]) {
        errors.push(`form "${form.key}" is missing required field "${field}"`);
      }
    }
  }

  return errors;
}
