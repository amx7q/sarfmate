import { getAllRoots, getRootVerbEntries } from "@/lib/roots";
import { getQuranRootIndex } from "@/lib/quranRoots";
import type { ImportedVerbSource, QuranRootIndexEntry, RootEntry, RootVerbEntry, SarfForm } from "@/lib/types";

const PUBLIC_REVIEW_NOTE = "Needs human review.";

function publicForm(form: SarfForm): SarfForm {
  const { notes, ...rest } = form;
  return {
    ...rest,
    ...(notes ? { notes: PUBLIC_REVIEW_NOTE } : {}),
  };
}

function publicSource(source: ImportedVerbSource): ImportedVerbSource {
  return {
    chapter: source.chapter,
    sourcePage: source.sourcePage,
    verifiedFields: source.verifiedFields,
  };
}

function publicVerbEntry(entry: RootVerbEntry): RootVerbEntry {
  return {
    id: entry.id,
    meaningEn: entry.meaningEn,
    status: entry.status,
    measure: entry.measure,
    forms: entry.forms.map(publicForm),
    ...(entry.source ? { source: publicSource(entry.source) } : {}),
    updatedAt: entry.updatedAt,
  };
}

export function toPublicRootEntry(entry: RootEntry): RootEntry {
  return {
    root: entry.root,
    displayRoot: entry.displayRoot,
    meaningEn: entry.meaningEn,
    status: entry.status,
    measure: entry.measure,
    forms: entry.forms.map(publicForm),
    ...(entry.source ? { source: publicSource(entry.source) } : {}),
    ...(entry.variants ? { variants: getRootVerbEntries(entry).slice(1).map(publicVerbEntry) } : {}),
    ...(entry.quranic ? { quranic: entry.quranic } : {}),
    ...(entry.quranOccurrenceCount !== undefined
      ? { quranOccurrenceCount: entry.quranOccurrenceCount }
      : {}),
    ...(entry.firstQuranOccurrence ? { firstQuranOccurrence: entry.firstQuranOccurrence } : {}),
    updatedAt: entry.updatedAt,
  };
}

export function getPublicRootEntries(): RootEntry[] {
  return getAllRoots().map(toPublicRootEntry);
}

export function getPublicQuranRootIndex(): QuranRootIndexEntry[] {
  return getQuranRootIndex().map((entry) => ({
    root: entry.root,
    displayRoot: entry.displayRoot,
    ...(entry.transliteration ? { transliteration: entry.transliteration } : {}),
    ...(entry.glossEn ? { glossEn: entry.glossEn } : {}),
    ...(entry.occurrenceCount !== undefined ? { occurrenceCount: entry.occurrenceCount } : {}),
    ...(entry.firstOccurrence ? { firstOccurrence: entry.firstOccurrence } : {}),
    source: entry.source,
    ...(entry.sourceUrl ? { sourceUrl: entry.sourceUrl } : {}),
    ...(entry.sourceLicense ? { sourceLicense: entry.sourceLicense } : {}),
    hasFullEntry: entry.hasFullEntry,
    status: entry.status,
  }));
}
