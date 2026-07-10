"use client";

import { useState } from "react";
import {
  isHoneypotFilled,
  saveSubmission,
  type SaveSubmissionResult,
} from "@/lib/submissionsRemote";
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
  const [saved, setSaved] = useState<SaveSubmissionResult | null>(null);
  const [sending, setSending] = useState(false);

  function handleClose() {
    setSaved(null);
    setSending(false);
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    const data = new FormData(event.currentTarget);
    if (isHoneypotFilled(data.get("website"))) {
      setSending(false);
      return;
    }
    const result = await saveSubmission({
      type: "root_suggestion",
      root: String(data.get("root") ?? "").trim(),
      suggestedCorrection: String(data.get("suggestion") ?? "").trim(),
      explanation: String(data.get("explanation") ?? "").trim() || undefined,
      contributorName: String(data.get("name") ?? "").trim() || undefined,
      contributorEmail: String(data.get("email") ?? "").trim() || undefined,
    });
    setSending(false);
    setSaved(result);
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Suggest a root">
      {saved ? (
        <SubmissionSuccess
          submission={saved.submission}
          remote={saved.remote}
          onDone={handleClose}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="suggest-website">Website</label>
            <input
              id="suggest-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
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
              maxLength={40}
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
              maxLength={2000}
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
              maxLength={2000}
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="suggest-name" className="mb-1 block text-sm font-medium text-ink">
                Your name (optional)
              </label>
              <input id="suggest-name" name="name" maxLength={200} className={inputClass} />
            </div>
            <div>
              <label htmlFor="suggest-email" className="mb-1 block text-sm font-medium text-ink">
                Email (optional)
              </label>
              <input id="suggest-email" name="email" type="email" maxLength={320} className={inputClass} />
            </div>
          </div>
          <p className="text-xs text-muted">
            Community suggestions are reviewed before publishing.
          </p>
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
          >
            {sending ? "Sending…" : "Save suggestion"}
          </button>
        </form>
      )}
    </Dialog>
  );
}
