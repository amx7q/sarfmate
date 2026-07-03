"use client";

import type { Submission } from "@/lib/types";
import { submissionToJson, submissionMailtoHref } from "@/lib/submissionsStore";
import CopyButton from "@/components/CopyButton";

/** Shared success view after a suggestion or error report is saved locally. */
export default function SubmissionSuccess({
  submission,
  onDone,
}: {
  submission: Submission;
  onDone: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink">
        Thank you! Your submission has been saved on this device and added to
        your pending suggestions.
      </p>
      <p className="text-sm text-muted">
        Community suggestions are reviewed before publishing. To send it to the
        SarfMate team now, copy the JSON below or use email.
      </p>
      <pre className="max-h-48 overflow-auto rounded-xl border border-border-soft bg-background p-3 text-xs text-ink">
        {submissionToJson(submission)}
      </pre>
      <div className="flex flex-wrap items-center gap-3">
        <CopyButton
          text={submissionToJson(submission)}
          ariaLabel="Copy submission JSON"
          label="Copy JSON"
        />
        <a
          href={submissionMailtoHref(submission)}
          className="rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
        >
          Send by email
        </a>
        <button
          type="button"
          onClick={onDone}
          className="ml-auto rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Done
        </button>
      </div>
    </div>
  );
}
