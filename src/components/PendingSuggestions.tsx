"use client";

import { useSyncExternalStore } from "react";
import {
  submissionsStore,
  subscribeToSubmissions,
  getServerSubmissionsSnapshot,
  submissionToJson,
  submissionMailtoHref,
} from "@/lib/submissionsStore";
import CopyButton from "@/components/CopyButton";

/** Lists locally saved submissions, kept in sync with the store. */
export default function PendingSuggestions() {
  const submissions = useSyncExternalStore(
    subscribeToSubmissions,
    submissionsStore.getAll,
    getServerSubmissionsSnapshot,
  );

  if (submissions.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-primary">
          Your pending suggestions ({submissions.length})
        </h3>
        <button
          type="button"
          onClick={() => submissionsStore.clear()}
          className="rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-background hover:text-ink"
        >
          Clear all
        </button>
      </div>
      <ul className="mt-3 space-y-3">
        {submissions.map((submission) => (
          <li
            key={submission.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border-soft bg-background px-3 py-2"
          >
            <span className="text-xs font-medium text-ink">
              {submission.type === "root_suggestion" ? "Root suggestion" : "Error report"}
            </span>
            <span dir="rtl" lang="ar" className="font-arabic text-base text-primary">
              {submission.root}
            </span>
            <span className="text-xs text-muted">
              {new Date(submission.createdAt).toLocaleDateString()}
            </span>
            <span className="ms-auto flex items-center gap-1">
              <CopyButton
                text={submissionToJson(submission)}
                ariaLabel={`Copy JSON for ${submission.root} submission`}
                label="Copy JSON"
              />
              <a
                href={submissionMailtoHref(submission)}
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
              >
                Email
              </a>
              <button
                type="button"
                onClick={() => submissionsStore.remove(submission.id)}
                aria-label={`Remove ${submission.root} submission`}
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                Remove
              </button>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        Suggestions are stored on this device. Copy the JSON or email it to
        share with the SarfMate team.
      </p>
    </div>
  );
}
