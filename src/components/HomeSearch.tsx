"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import type { RootEntry } from "@/lib/types";
import { normaliseArabicInput } from "@/lib/arabic";
import RootSearch from "@/components/RootSearch";
import RootResult from "@/components/RootResult";
import EmptyState from "@/components/EmptyState";
import SuggestRootDialog from "@/components/SuggestRootDialog";

const EXAMPLE_ROOTS = ["سمع", "كتب", "فتح", "علم", "دخل", "خرج"] as const;

export default function HomeSearch({ roots }: { roots: RootEntry[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [suggestOpen, setSuggestOpen] = useState(false);

  const normalised = normaliseArabicInput(query);
  const entry = normalised
    ? roots.find((r) => normaliseArabicInput(r.root) === normalised)
    : undefined;

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
              normalised === root
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
          {entry ? (
            <RootResult key={entry.root} entry={entry} />
          ) : normalised ? (
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
