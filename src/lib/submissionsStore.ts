import type { Submission } from "@/lib/types";

const STORAGE_KEY = "sarfmate.submissions.v1";
const CONTACT_EMAIL = "ammarhaque97@gmail.com";

export type NewSubmission = Omit<Submission, "id" | "createdAt" | "status">;

/**
 * localStorage-backed submissions store. The interface is intentionally
 * backend-shaped so it can be replaced with Supabase (or similar) later.
 */
export interface SubmissionsStore {
  add(input: NewSubmission): Submission;
  getAll(): Submission[];
  updateDelivery(id: string, deliveryStatus: NonNullable<Submission["deliveryStatus"]>): void;
  remove(id: string): void;
  clear(): void;
}

const EMPTY: Submission[] = [];
let cache: Submission[] | null = null;
const listeners = new Set<() => void>();

function notify() {
  cache = null;
  for (const listener of listeners) listener();
}

function readAll(): Submission[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? (parsed as Submission[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function writeAll(submissions: Submission[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  notify();
}

/** For useSyncExternalStore: re-renders subscribers when submissions change. */
export function subscribeToSubmissions(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Stable server snapshot (submissions only exist in the browser). */
export function getServerSubmissionsSnapshot(): Submission[] {
  return EMPTY;
}

export const submissionsStore: SubmissionsStore = {
  add(input) {
    const submission: Submission = {
      ...input,
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      status: "pending",
      deliveryStatus: "pending",
    };
    writeAll([submission, ...readAll()]);
    return submission;
  },
  getAll: readAll,
  updateDelivery(id, deliveryStatus) {
    writeAll(
      readAll().map((submission) =>
        submission.id === id
          ? {
              ...submission,
              deliveryStatus,
              ...(deliveryStatus === "sent" ? { deliveredAt: new Date().toISOString() } : {}),
            }
          : submission,
      ),
    );
  },
  remove(id) {
    writeAll(readAll().filter((s) => s.id !== id));
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    notify();
  },
};

/** Pretty JSON payload for copying a submission into an issue or email. */
export function submissionToJson(submission: Submission): string {
  return JSON.stringify(submission, null, 2);
}

/** mailto: link with the submission encoded in the body. */
export function submissionMailtoHref(submission: Submission): string {
  const subject = encodeURIComponent(
    `SarfMate ${submission.type === "root_suggestion" ? "root suggestion" : "error report"}: ${submission.root}`,
  );
  const body = encodeURIComponent(
    `Hello SarfMate team,\n\nHere is my submission:\n\n${submissionToJson(submission)}\n`,
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}
