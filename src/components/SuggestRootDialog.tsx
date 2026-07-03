"use client";

import { useState } from "react";
import type { Submission } from "@/lib/types";
import { submissionsStore } from "@/lib/submissionsStore";
import Dialog from "@/components/Dialog";
import SubmissionSuccess from "@/components/SubmissionSuccess";

const inputClass =
  "w-full rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-secondary";

export default function SuggestRootDialog({
  open,
  onClose,
  prefillRoot = "",
}: {
  open: boolean;
  onClose: () => void;
  prefillRoot?: string;
}) {
  const [saved, setSaved] = useState<Submission | null>(null);

  function handleClose() {
    setSaved(null);
    onClose();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const submission = submissionsStore.add({
      type: "root_suggestion",
      root: String(data.get("root") ?? "").trim(),
      suggestedCorrection: String(data.get("suggestion") ?? "").trim(),
      explanation: String(data.get("explanation") ?? "").trim() || undefined,
      contributorName: String(data.get("name") ?? "").trim() || undefined,
      contributorEmail: String(data.get("email") ?? "").trim() || undefined,
    });
    setSaved(submission);
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Suggest a root">
      {saved ? (
        <SubmissionSuccess submission={saved} onDone={handleClose} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="suggest-root" className="mb-1 block text-sm font-medium text-ink">
              Arabic root <span className="text-accent">*</span>
            </label>
            <input
              id="suggest-root"
              name="root"
              dir="rtl"
              lang="ar"
              required
              defaultValue={prefillRoot}
              placeholder="مثال: قرأ"
              className={`${inputClass} font-arabic text-lg`}
            />
          </div>
          <div>
            <label htmlFor="suggest-suggestion" className="mb-1 block text-sm font-medium text-ink">
              English meaning or suggested forms <span className="text-accent">*</span>
            </label>
            <textarea
              id="suggest-suggestion"
              name="suggestion"
              required
              rows={3}
              placeholder="e.g. reading, reciting — past قَرَأَ, present يَقْرَأُ …"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="suggest-explanation" className="mb-1 block text-sm font-medium text-ink">
              Why this root? (optional)
            </label>
            <textarea
              id="suggest-explanation"
              name="explanation"
              rows={2}
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="suggest-name" className="mb-1 block text-sm font-medium text-ink">
                Your name (optional)
              </label>
              <input id="suggest-name" name="name" className={inputClass} />
            </div>
            <div>
              <label htmlFor="suggest-email" className="mb-1 block text-sm font-medium text-ink">
                Email (optional)
              </label>
              <input id="suggest-email" name="email" type="email" className={inputClass} />
            </div>
          </div>
          <p className="text-xs text-muted">
            Community suggestions are reviewed before publishing.
          </p>
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Save suggestion
          </button>
        </form>
      )}
    </Dialog>
  );
}
