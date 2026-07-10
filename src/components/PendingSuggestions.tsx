"use client";

import { useState, useSyncExternalStore } from "react";
import {
  submissionsStore,
  subscribeToSubmissions,
  getServerSubmissionsSnapshot,
  submissionToJson,
  submissionMailtoHref,
} from "@/lib/submissionsStore";
import { retrySubmission } from "@/lib/submissionsRemote";
import CopyButton from "@/components/CopyButton";

/** Lists locally saved submissions, kept in sync with the store. */
export default function PendingSuggestions() {
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const submissions = useSyncExternalStore(
    subscribeToSubmissions,
    submissionsStore.getAll,
    getServerSubmissionsSnapshot,
  );

  if (submissions.length === 0) return null;

  const awaitingDelivery = submissions.filter(
    (submission) => submission.deliveryStatus !== "sent",
  ).length;

  async function handleRetry(submission: (typeof submissions)[number]) {
    setRetryingId(submission.id);
    await retrySubmission(submission);
    setRetryingId(null);
  }

  return (
    <div className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-primary">
          Your saved submissions ({submissions.length})
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
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                submission.deliveryStatus === "sent"
                  ? "bg-secondary/10 text-primary"
                  : submission.deliveryStatus === "pending"
                    ? "bg-accent/10 text-ink"
                    : "bg-background text-muted"
              }`}
            >
              {submission.deliveryStatus === "sent"
                ? "Sent"
                : submission.deliveryStatus === "pending"
                  ? "Sending…"
                  : "Needs sending"}
            </span>
            <span className="ms-auto flex items-center gap-1">
              {submission.deliveryStatus !== "sent" && (
                <button
                  type="button"
                  disabled={retryingId === submission.id}
                  onClick={() => handleRetry(submission)}
                  className="rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5 disabled:cursor-wait disabled:opacity-60"
                >
                  {retryingId === submission.id ? "Sending…" : "Retry"}
                </button>
              )}
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
        {awaitingDelivery === 0
          ? "All saved submissions have been sent. Copies remain on this device until you remove them."
          : `${awaitingDelivery} saved ${awaitingDelivery === 1 ? "submission still needs" : "submissions still need"} to be sent. You can retry, copy the JSON, or use email.`}
      </p>
    </div>
  );
}
