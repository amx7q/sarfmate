import type { Submission } from "@/lib/types";
import { submissionsStore, type NewSubmission } from "@/lib/submissionsStore";

/**
 * Best-effort remote delivery of submissions to Supabase, layered on top of
 * the local submissionsStore. The local save always happens first and never
 * depends on the network; the remote insert is a write-only drop-box
 * (INSERT-only RLS policy — see supabase/schema.sql).
 *
 * When the NEXT_PUBLIC_SUPABASE_* env vars are absent, everything degrades
 * to the original localStorage-only behaviour.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const REMOTE_TIMEOUT_MS = 10_000;

export type RemoteResult = "sent" | "failed" | "disabled";

export type SubmissionErrorCategory =
  | "configuration"
  | "authorization"
  | "rate_limited"
  | "server"
  | "network"
  | "timeout"
  | "unknown";

export type SaveSubmissionResult = {
  submission: Submission;
  remote: RemoteResult;
};

export function isRemoteSubmissionsEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Honeypot values are intentionally never stored, sent, or logged. */
export function isHoneypotFilled(value: FormDataEntryValue | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function responseErrorCategory(status: number): SubmissionErrorCategory {
  if (status === 401 || status === 403) return "authorization";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  return "unknown";
}

/** Maps the camelCase Submission to the snake_case submissions table row. */
export function toSupabaseRow(submission: Submission): Record<string, unknown> {
  return {
    type: submission.type,
    root: submission.root,
    form_key: submission.formKey ?? null,
    current_value: submission.currentValue ?? null,
    suggested_correction: submission.suggestedCorrection,
    explanation: submission.explanation ?? null,
    contributor_name: submission.contributorName ?? null,
    contributor_email: submission.contributorEmail ?? null,
    client_id: submission.id,
  };
}

export async function sendSubmissionToSupabase(
  submission: Submission,
): Promise<{ ok: true; duplicate?: true } | { ok: false; category: SubmissionErrorCategory }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false, category: "configuration" };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS);
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        // Required: the INSERT-only RLS policy means PostgREST cannot
        // return the inserted row, so we must not ask for a representation.
        Prefer: "return=minimal",
      },
      body: JSON.stringify(toSupabaseRow(submission)),
      signal: controller.signal,
    });
    // A retry of a row already accepted by Supabase is a successful delivery
    // from the visitor's perspective. The unique client_id index makes this
    // response safe to recognise as an idempotent duplicate.
    if (response.status === 409) return { ok: true, duplicate: true };
    if (!response.ok) return { ok: false, category: responseErrorCategory(response.status) };
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      category: error instanceof Error && error.name === "AbortError" ? "timeout" : "network",
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Saves a submission locally (always) and then tries to deliver it to the
 * SarfMate team via Supabase (best effort).
 */
export async function saveSubmission(
  input: NewSubmission,
): Promise<SaveSubmissionResult> {
  const submission = submissionsStore.add(input);
  if (!isRemoteSubmissionsEnabled()) {
    submissionsStore.updateDelivery(submission.id, "disabled");
    return { submission: { ...submission, deliveryStatus: "disabled" }, remote: "disabled" };
  }
  const result = await sendSubmissionToSupabase(submission);
  const remote = result.ok ? "sent" : "failed";
  submissionsStore.updateDelivery(submission.id, remote);
  return { submission: { ...submission, deliveryStatus: remote }, remote };
}

/** Retries remote delivery for a submission already saved on this device. */
export async function retrySubmission(submission: Submission): Promise<RemoteResult> {
  if (!isRemoteSubmissionsEnabled()) {
    submissionsStore.updateDelivery(submission.id, "disabled");
    return "disabled";
  }
  submissionsStore.updateDelivery(submission.id, "pending");
  const result = await sendSubmissionToSupabase(submission);
  const remote = result.ok ? "sent" : "failed";
  submissionsStore.updateDelivery(submission.id, remote);
  return remote;
}
