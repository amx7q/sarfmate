"use client";

import { useState } from "react";
import Link from "next/link";
import type { RootEntry } from "@/lib/types";
import { normaliseArabicInput } from "@/lib/arabic";
import { getQuranRootIndex } from "@/lib/quranRoots";
import StatusBadge from "@/components/StatusBadge";

type BrowseFilter =
  | "all"
  | "quranic"
  | "full"
  | "indexed"
  | "reviewed"
  | "ai_draft";

const FILTERS: { key: BrowseFilter; label: string }[] = [
  { key: "all", label: "All roots" },
  { key: "quranic", label: "Quranic roots" },
  { key: "full", label: "Full entries only" },
  { key: "indexed", label: "Indexed only" },
  { key: "reviewed", label: "Reviewed" },
  { key: "ai_draft", label: "AI draft" },
];

type BrowseItem =
  | { kind: "full"; root: string; entry: RootEntry }
  | {
      kind: "indexed";
      root: string;
      displayRoot: string;
      meaningEn: string;
      source: string;
    };

export default function BrowseRoots({ roots }: { roots: RootEntry[] }) {
  const [filter, setFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<BrowseFilter>("all");
  const fullKeys = new Set(roots.map((entry) => normaliseArabicInput(entry.root)));
  const indexedOnlyItems: BrowseItem[] = getQuranRootIndex()
    .filter((entry) => !fullKeys.has(normaliseArabicInput(entry.root)))
    .map((entry) => ({
      kind: "indexed",
      root: entry.root,
      displayRoot: entry.displayRoot,
      meaningEn: entry.glossEn ?? "Quranic root",
      source: entry.source,
    }));
  const browseItems: BrowseItem[] = [
    ...roots.map((entry) => ({ kind: "full" as const, root: entry.root, entry })),
    ...indexedOnlyItems,
  ];

  const normalisedFilter = normaliseArabicInput(filter);
  const englishFilter = filter.trim().toLowerCase();
  const filtered = browseItems.filter((item) => {
    if (activeFilter === "quranic" && item.kind === "full" && !item.entry.quranic) return false;
    if (activeFilter === "full" && item.kind !== "full") return false;
    if (activeFilter === "indexed" && item.kind !== "indexed") return false;
    if (activeFilter === "reviewed" && (item.kind !== "full" || item.entry.status !== "reviewed")) return false;
    if (activeFilter === "ai_draft" && (item.kind !== "full" || item.entry.status !== "ai_draft")) return false;
    if (!filter.trim()) return true;
    const root = item.kind === "full" ? item.entry.root : item.root;
    const meaning = item.kind === "full" ? item.entry.meaningEn : item.meaningEn;
    return (
      (normalisedFilter &&
        normaliseArabicInput(root).includes(normalisedFilter)) ||
      meaning.toLowerCase().includes(englishFilter)
    );
  });

  return (
    <div>
      <div className="mx-auto max-w-md">
        <label htmlFor="browse-filter" className="sr-only">
          Filter roots by Arabic letters or English meaning
        </label>
        <input
          id="browse-filter"
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter by root (سمع) or meaning (hearing)…"
          dir="auto"
          className="w-full rounded-2xl border border-border-soft bg-surface px-4 py-3 text-sm text-ink shadow-sm placeholder:text-muted focus:border-secondary"
        />
      </div>

      <p aria-live="polite" className="mt-4 text-center text-sm text-muted">
        {filtered.length} {filtered.length === 1 ? "root" : "roots"}
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveFilter(item.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === item.key
                ? "border-secondary bg-secondary/10 text-primary"
                : "border-border-soft bg-surface text-muted hover:border-secondary hover:text-primary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <li key={`${item.kind}-${item.root}`}>
            {item.kind === "full" ? (
              <Link
                href={`/root/${encodeURIComponent(item.entry.root)}`}
                className="flex h-full flex-col rounded-2xl border border-border-soft bg-surface p-5 shadow-sm transition-colors hover:border-secondary"
              >
                <span
                  dir="rtl"
                  lang="ar"
                  className="font-arabic text-3xl font-medium text-primary"
                >
                  {item.entry.displayRoot}
                </span>
                <span className="mt-2 text-sm text-muted">{item.entry.meaningEn}</span>
                <span className="mt-4 flex flex-wrap gap-2">
                  {item.entry.quranic && (
                    <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-ink">
                      Quranic root
                    </span>
                  )}
                  <StatusBadge status={item.entry.status} />
                </span>
              </Link>
            ) : (
              <div className="flex h-full flex-col rounded-2xl border border-accent/30 bg-surface p-5 shadow-sm">
                <span
                  dir="rtl"
                  lang="ar"
                  className="font-arabic text-3xl font-medium text-primary"
                >
                  {item.displayRoot}
                </span>
                <span className="mt-2 text-sm text-muted">{item.meaningEn}</span>
                <p className="mt-4 text-sm leading-6 text-muted">
                  This Quranic root is in the index, but a full SarfMate entry has
                  not been added yet.
                </p>
                <button
                  type="button"
                  className="mt-4 self-start rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  Help add this root
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted">
          No roots match your filter yet. Try different letters, or suggest this
          root from the home page.
        </p>
      )}
    </div>
  );
}
