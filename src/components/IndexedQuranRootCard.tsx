"use client";

import type { QuranRootIndexEntry } from "@/lib/types";

export default function IndexedQuranRootCard({
  entry,
  onSuggest,
}: {
  entry: QuranRootIndexEntry;
  onSuggest?: () => void;
}) {
  return (
    <section className="rounded-2xl border border-accent/30 bg-surface p-6 text-center shadow-sm">
      <p className="text-sm font-semibold text-accent-strong">
        Quranic root · Indexed only
      </p>
      <h2
        dir="rtl"
        lang="ar"
        className="mt-3 font-arabic text-6xl font-medium tracking-wide text-primary"
      >
        {entry.displayRoot}
      </h2>
      <p className="mt-3 text-lg text-ink">{entry.glossEn}</p>
      {entry.transliteration && (
        <p className="mt-1 text-sm text-muted">{entry.transliteration}</p>
      )}
      <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted">
        This Quranic root is in the index, but a full SarfMate entry has not been added yet.
      </p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
        Quranic roots can have rich meanings across different contexts. SarfMate provides
        learner-friendly summaries and examples, not a replacement for tafsir or specialist
        dictionaries.
      </p>
      <button
        type="button"
        onClick={onSuggest}
        className="mt-6 rounded-xl border border-border-soft bg-surface px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-secondary hover:bg-background"
      >
        Request full entry
      </button>
    </section>
  );
}
