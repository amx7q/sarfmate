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
  if (!entry.updatedAt || Number.isNaN(Date.parse(entry.updatedAt))) {
    errors.push("updatedAt is missing or not a parseable date");
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
