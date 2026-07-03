"use client";

import { useState } from "react";
import Link from "next/link";
import type { RootEntry } from "@/lib/types";
import { normaliseArabicInput } from "@/lib/arabic";
import StatusBadge from "@/components/StatusBadge";

export default function BrowseRoots({ roots }: { roots: RootEntry[] }) {
  const [filter, setFilter] = useState("");

  const normalisedFilter = normaliseArabicInput(filter);
  const englishFilter = filter.trim().toLowerCase();
  const filtered = roots.filter((entry) => {
    if (!filter.trim()) return true;
    return (
      (normalisedFilter &&
        normaliseArabicInput(entry.root).includes(normalisedFilter)) ||
      entry.meaningEn.toLowerCase().includes(englishFilter)
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

      <ul className="mt-6 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry) => (
          <li key={entry.root}>
            <Link
              href={`/root/${encodeURIComponent(entry.root)}`}
              className="flex h-full flex-col rounded-2xl border border-border-soft bg-surface p-5 shadow-sm transition-colors hover:border-secondary"
            >
              <span
                dir="rtl"
                lang="ar"
                className="font-arabic text-3xl font-medium text-primary"
              >
                {entry.displayRoot}
              </span>
              <span className="mt-2 text-sm text-muted">{entry.meaningEn}</span>
              <span className="mt-4">
                <StatusBadge status={entry.status} />
              </span>
            </Link>
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
