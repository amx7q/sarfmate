import { quranRoots } from "@/data/quranRoots";
import { matchesRootTransliteration, normaliseArabicInput } from "@/lib/arabic";
import { getAllRoots, searchRoot } from "@/lib/roots";
import type { QuranRootIndexEntry, RootEntry } from "@/lib/types";

export type RootSearchResult =
  | { kind: "full_entry"; entry: RootEntry; quranIndexEntry?: QuranRootIndexEntry }
  | { kind: "indexed_only"; indexEntry: QuranRootIndexEntry };

const HAS_ARABIC = /[\u0600-\u06ff]/;

export function getQuranRootIndex(): QuranRootIndexEntry[] {
  return quranRoots;
}

export function findQuranRoot(query: string): QuranRootIndexEntry | undefined {
  const q = normaliseArabicInput(query);
  if (!q) return undefined;
  return getQuranRootIndex().find((entry) => normaliseArabicInput(entry.root) === q);
}

export function searchQuranRootIndex(query: string): QuranRootIndexEntry | undefined {
  const arabicMatch = findQuranRoot(query);
  if (arabicMatch) return arabicMatch;

  const q = query.trim().toLowerCase();
  if (!q || HAS_ARABIC.test(query)) return undefined;

  return (
    getQuranRootIndex().find((entry) => matchesRootTransliteration(entry.root, q)) ??
    getQuranRootIndex().find((entry) =>
      [entry.glossEn, entry.transliteration]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q)),
    )
  );
}

export function searchRootLibrary(query: string): RootSearchResult | undefined {
  const fullEntry = searchRoot(query);
  if (fullEntry) {
    return {
      kind: "full_entry",
      entry: fullEntry,
      quranIndexEntry: findQuranRoot(fullEntry.root),
    };
  }

  const indexEntry = searchQuranRootIndex(query);
  if (indexEntry) return { kind: "indexed_only", indexEntry };
  return undefined;
}

export function validateQuranRootIndex(): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const fullQuranicRoots = new Set(
    getAllRoots()
      .filter((entry) => entry.quranic)
      .map((entry) => normaliseArabicInput(entry.root)),
  );

  for (const entry of getQuranRootIndex()) {
    const key = normaliseArabicInput(entry.root);
    if (!entry.root) errors.push("Quranic index entry is missing root");
    if (!entry.displayRoot) errors.push(`Quranic index entry ${entry.root} is missing displayRoot`);
    if (!entry.source) errors.push(`Quranic index entry ${entry.root} is missing source`);
    if (!["indexed_only", "ai_draft", "reviewed"].includes(entry.status)) {
      errors.push(`Quranic index entry ${entry.root} has invalid status ${entry.status}`);
    }
    if (seen.has(key)) errors.push(`duplicate Quranic index root ${entry.root}`);
    seen.add(key);

    const hasFullEntry = fullQuranicRoots.has(key);
    if (entry.hasFullEntry !== hasFullEntry) {
      errors.push(
        `Quranic index root ${entry.root} has hasFullEntry=${entry.hasFullEntry} but full entry presence is ${hasFullEntry}`,
      );
    }
    if (!hasFullEntry && entry.status !== "indexed_only") {
      errors.push(`Quranic index root ${entry.root} is indexed-only but status is ${entry.status}`);
    }
  }

  return errors;
}
