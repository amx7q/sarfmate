"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { matchesRootTransliteration, normaliseArabicInput } from "@/lib/arabic";
import type { QuranRootIndexEntry, RootEntry, RootVerbEntry } from "@/lib/types";
import RootSearch from "@/components/RootSearch";
import RootResult from "@/components/RootResult";
import IndexedQuranRootCard from "@/components/IndexedQuranRootCard";
import EmptyState from "@/components/EmptyState";
import SuggestRootDialog from "@/components/SuggestRootDialog";

const EXAMPLE_ROOTS = ["سمع", "كتب", "فتح", "علم", "دخل", "خرج"] as const;
const HAS_ARABIC = /[\u0600-\u06ff]/;

type RootSearchResult =
  | { kind: "full_entry"; entry: RootEntry; quranIndexEntry?: QuranRootIndexEntry }
  | { kind: "indexed_only"; indexEntry: QuranRootIndexEntry };

function getRootVerbEntries(entry: RootEntry): RootVerbEntry[] {
  return [
    {
      id: `${entry.root}-main`,
      meaningEn: entry.meaningEn,
      status: entry.status,
      measure: entry.measure,
      forms: entry.forms,
      updatedAt: entry.updatedAt,
    },
    ...(entry.variants ?? []),
  ];
}

function findRoot(roots: RootEntry[], query: string): RootEntry | undefined {
  const q = normaliseArabicInput(query);
  if (!q) return undefined;
  return roots.find((entry) => normaliseArabicInput(entry.root) === q);
}

function searchRoot(roots: RootEntry[], query: string): RootEntry | undefined {
  const arabicMatch = findRoot(roots, query);
  if (arabicMatch) return arabicMatch;

  const q = query.trim().toLowerCase();
  if (!q || HAS_ARABIC.test(query)) return undefined;

  return (
    roots.find((entry) => matchesRootTransliteration(entry.root, q)) ??
    roots.find((entry) => entry.meaningEn.toLowerCase().includes(q)) ??
    roots.find((entry) =>
      getRootVerbEntries(entry).some(
        (verbEntry) =>
          verbEntry.meaningEn.toLowerCase().includes(q) ||
          verbEntry.forms.some(
            (form) =>
              form.meaningEn.toLowerCase().includes(q) ||
              form.arabic.includes(query.trim()),
          ),
      ),
    )
  );
}

function findQuranRoot(
  quranRoots: QuranRootIndexEntry[],
  query: string,
): QuranRootIndexEntry | undefined {
  const q = normaliseArabicInput(query);
  if (!q) return undefined;
  return quranRoots.find((entry) => normaliseArabicInput(entry.root) === q);
}

function searchQuranRootIndex(
  quranRoots: QuranRootIndexEntry[],
  query: string,
): QuranRootIndexEntry | undefined {
  const arabicMatch = findQuranRoot(quranRoots, query);
  if (arabicMatch) return arabicMatch;

  const q = query.trim().toLowerCase();
  if (!q || HAS_ARABIC.test(query)) return undefined;

  return (
    quranRoots.find((entry) => matchesRootTransliteration(entry.root, q)) ??
    quranRoots.find((entry) =>
      [entry.glossEn, entry.transliteration]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q)),
    )
  );
}

function searchRootLibrary(
  roots: RootEntry[],
  quranRoots: QuranRootIndexEntry[],
  query: string,
): RootSearchResult | undefined {
  const fullEntry = searchRoot(roots, query);
  if (fullEntry) {
    return {
      kind: "full_entry",
      entry: fullEntry,
      quranIndexEntry: findQuranRoot(quranRoots, fullEntry.root),
    };
  }

  const indexEntry = searchQuranRootIndex(quranRoots, query);
  if (indexEntry) return { kind: "indexed_only", indexEntry };
  return undefined;
}

export default function HomeSearch({
  roots,
  quranRoots,
}: {
  roots: RootEntry[];
  quranRoots: QuranRootIndexEntry[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [suggestOpen, setSuggestOpen] = useState(false);

  const normalised = normaliseArabicInput(query);
  const hasQuery = query.trim().length > 0;
  const result = hasQuery ? searchRootLibrary(roots, quranRoots, query) : undefined;

  function search(value: string) {
    setInput(value);
    setQuery(value);
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.replace(params.size ? `/?${params}` : "/", { scroll: false });
  }

  return (
    <section aria-label="Root search" id="search">
      <RootSearch
        value={input}
        onChange={setInput}
        onSubmit={() => search(input)}
      />

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-muted">Try a root:</span>
        {EXAMPLE_ROOTS.map((root) => (
          <button
            key={root}
            type="button"
            onClick={() => search(root)}
            className={`rounded-full border px-4 py-1.5 font-arabic text-lg transition-colors ${
              result?.kind === "full_entry" && result.entry.root === root
                ? "border-secondary bg-secondary/10 text-primary"
                : "border-border-soft bg-surface text-ink hover:border-secondary hover:text-primary"
            }`}
            dir="rtl"
            lang="ar"
          >
            {root}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-10">
        <AnimatePresence mode="wait">
          {result?.kind === "full_entry" ? (
            <RootResult key={result.entry.root} entry={result.entry} />
          ) : result?.kind === "indexed_only" ? (
            <IndexedQuranRootCard
              key={result.indexEntry.root}
              entry={result.indexEntry}
              onSuggest={() => setSuggestOpen(true)}
            />
          ) : hasQuery ? (
            <EmptyState
              key="empty"
              query={query.trim()}
              onSuggest={() => setSuggestOpen(true)}
            />
          ) : null}
        </AnimatePresence>
      </div>

      <SuggestRootDialog
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        prefillRoot={normalised}
      />
    </section>
  );
}
