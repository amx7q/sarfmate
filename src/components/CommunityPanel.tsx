"use client";

import { useState } from "react";
import SuggestRootDialog from "@/components/SuggestRootDialog";
import PendingSuggestions from "@/components/PendingSuggestions";

export default function CommunityPanel() {
  const [suggestOpen, setSuggestOpen] = useState(false);

  return (
    <section
      aria-label="Community"
      className="mb-4 mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">
            Join the community
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            Help make SarfMate better for everyone. Your suggestions and
            feedback matter.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={() => setSuggestOpen(true)}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Suggest a root
          </button>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted">
        Community suggestions are reviewed before publishing.
      </p>

      <PendingSuggestions />

      <SuggestRootDialog open={suggestOpen} onClose={() => setSuggestOpen(false)} />
    </section>
  );
}
