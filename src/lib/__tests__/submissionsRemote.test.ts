import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Submission } from "@/lib/types";

const SAMPLE: Submission = {
  id: "local-123",
  type: "error_report",
  root: "كتب",
  formKey: "imperative",
  currentValue: "اُكْتُبْ",
  suggestedCorrection: "اُكْتُبْ with a different example",
  explanation: "Example sentence sounds unnatural",
  contributorName: "Test User",
  contributorEmail: "test@example.com",
  createdAt: "2026-07-03T00:00:00.000Z",
  status: "pending",
};

async function loadModule() {
  vi.resetModules();
  return import("@/lib/submissionsRemote");
}

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("toSupabaseRow", () => {
  it("maps camelCase fields to snake_case columns", async () => {
    const { toSupabaseRow } = await loadModule();
    expect(toSupabaseRow(SAMPLE)).toEqual({
      type: "error_report",
      root: "كتب",
      form_key: "imperative",
      current_value: "اُكْتُبْ",
      suggested_correction: "اُكْتُبْ with a different example",
      explanation: "Example sentence sounds unnatural",
      contributor_name: "Test User",
      contributor_email: "test@example.com",
      client_id: "local-123",
    });
  });

  it("sends null for absent optional fields", async () => {
    const { toSupabaseRow } = await loadModule();
    const row = toSupabaseRow({
      ...SAMPLE,
      formKey: undefined,
      currentValue: undefined,
      explanation: undefined,
      contributorName: undefined,
      contributorEmail: undefined,
    });
    expect(row.form_key).toBeNull();
    expect(row.current_value).toBeNull();
    expect(row.explanation).toBeNull();
    expect(row.contributor_name).toBeNull();
    expect(row.contributor_email).toBeNull();
  });
});

describe("sendSubmissionToSupabase", () => {
  it("short-circuits without fetching when env vars are absent", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const { sendSubmissionToSupabase, isRemoteSubmissionsEnabled } =
      await loadModule();
    expect(isRemoteSubmissionsEnabled()).toBe(false);
    const result = await sendSubmissionToSupabase(SAMPLE);
    expect(result).toEqual({ ok: false, category: "configuration" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("POSTs to /rest/v1/submissions with anon headers and return=minimal", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    vi.stubGlobal("fetch", fetchSpy);

    const { sendSubmissionToSupabase } = await loadModule();
    const result = await sendSubmissionToSupabase(SAMPLE);

    expect(result).toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://example.supabase.co/rest/v1/submissions");
    expect(init.method).toBe("POST");
    expect(init.headers.apikey).toBe("anon-key");
    expect(init.headers.Authorization).toBe("Bearer anon-key");
    expect(init.headers.Prefer).toBe("return=minimal");
    expect(JSON.parse(init.body).client_id).toBe("local-123");
  });

  it("reports failure on a non-ok response", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));

    const { sendSubmissionToSupabase } = await loadModule();
    const result = await sendSubmissionToSupabase(SAMPLE);
    expect(result).toEqual({ ok: false, category: "authorization" });
  });

  it("treats a duplicate client_id response as an already successful retry", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 409 }));

    const { sendSubmissionToSupabase } = await loadModule();
    await expect(sendSubmissionToSupabase(SAMPLE)).resolves.toEqual({
      ok: true,
      duplicate: true,
    });
  });

  it("reports failure when fetch throws", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { sendSubmissionToSupabase } = await loadModule();
    const result = await sendSubmissionToSupabase(SAMPLE);
    expect(result).toEqual({ ok: false, category: "network" });
  });
});

describe("isHoneypotFilled", () => {
  it("only flags non-empty string values", async () => {
    const { isHoneypotFilled } = await loadModule();
    expect(isHoneypotFilled(null)).toBe(false);
    expect(isHoneypotFilled("   ")).toBe(false);
    expect(isHoneypotFilled("https://spam.example")).toBe(true);
  });
});

describe("retrySubmission", () => {
  it("retries an existing locally saved submission", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    vi.stubGlobal("fetch", fetchSpy);

    const { retrySubmission } = await loadModule();
    await expect(retrySubmission({ ...SAMPLE, deliveryStatus: "failed" })).resolves.toBe("sent");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
