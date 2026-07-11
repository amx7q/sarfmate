import { describe, expect, it } from "vitest";
import {
  EMPTY_ATTEMPTS_STORE,
  getWeakItems,
  parseAttemptsStore,
  recordAttempt,
  type PracticeAttemptsStore,
} from "@/lib/practiceAttempts";

describe("practice attempts store parsing", () => {
  it("returns an empty store for missing or corrupted values", () => {
    expect(parseAttemptsStore(null)).toEqual(EMPTY_ATTEMPTS_STORE);
    expect(parseAttemptsStore("not-json")).toEqual(EMPTY_ATTEMPTS_STORE);
    expect(parseAttemptsStore('{"version":2,"items":{}}')).toEqual(EMPTY_ATTEMPTS_STORE);
    expect(parseAttemptsStore('{"version":1}')).toEqual(EMPTY_ATTEMPTS_STORE);
  });

  it("discards individual items with malformed or negative stats", () => {
    const raw = JSON.stringify({
      version: 1,
      items: {
        "كتب:past": { attempts: 3, correct: 2, recent: [true, false, true], lastAttemptAt: "2026-07-01" },
        "كتب:present": { attempts: -1, correct: 0, recent: [], lastAttemptAt: "2026-07-01" },
        "كتب:imperative": { attempts: 2, correct: 5, recent: [], lastAttemptAt: "2026-07-01" },
        "كتب:place_or_mim_masdar": { attempts: 1, recent: [true], lastAttemptAt: "2026-07-01" },
        "كتب:active_participle": "not-an-object",
      },
    });
    const store = parseAttemptsStore(raw);
    expect(Object.keys(store.items)).toEqual(["كتب:past"]);
  });

  it("tolerates unknown extra fields on stored items for forward compatibility", () => {
    const raw = JSON.stringify({
      version: 1,
      items: {
        "كتب:past": {
          attempts: 1,
          correct: 1,
          recent: [true],
          lastAttemptAt: "2026-07-01",
          box: 2,
          dueDate: "2026-07-10",
        },
      },
    });
    const store = parseAttemptsStore(raw);
    expect(store.items["كتب:past"]).toEqual({
      attempts: 1,
      correct: 1,
      recent: [true],
      lastAttemptAt: "2026-07-01",
    });
  });

  it("caps the recent array at 10 entries when parsing", () => {
    const recent = Array.from({ length: 15 }, (_, index) => index % 2 === 0);
    const raw = JSON.stringify({
      version: 1,
      items: { "كتب:past": { attempts: 15, correct: 8, recent, lastAttemptAt: "2026-07-01" } },
    });
    const store = parseAttemptsStore(raw);
    expect(store.items["كتب:past"].recent).toHaveLength(10);
    expect(store.items["كتب:past"].recent).toEqual(recent.slice(-10));
  });
});

describe("recordAttempt", () => {
  it("creates a new item on the first attempt", () => {
    const store = recordAttempt(EMPTY_ATTEMPTS_STORE, "كتب", "past", true, "2026-07-01");
    expect(store.items["كتب:past"]).toEqual({
      attempts: 1,
      correct: 1,
      recent: [true],
      lastAttemptAt: "2026-07-01",
    });
  });

  it("records a wrong answer with lastWrongAt set", () => {
    const store = recordAttempt(EMPTY_ATTEMPTS_STORE, "كتب", "past", false, "2026-07-01");
    expect(store.items["كتب:past"]).toEqual({
      attempts: 1,
      correct: 0,
      recent: [false],
      lastAttemptAt: "2026-07-01",
      lastWrongAt: "2026-07-01",
    });
  });

  it("accumulates attempts immutably and keeps the earlier store unchanged", () => {
    const first = recordAttempt(EMPTY_ATTEMPTS_STORE, "كتب", "past", false, "2026-07-01");
    const second = recordAttempt(first, "كتب", "past", true, "2026-07-02");

    expect(first.items["كتب:past"].attempts).toBe(1);
    expect(second.items["كتب:past"]).toEqual({
      attempts: 2,
      correct: 1,
      recent: [false, true],
      lastAttemptAt: "2026-07-02",
      lastWrongAt: "2026-07-01",
    });
  });

  it("caps recent history at 10 results, newest last", () => {
    let store = EMPTY_ATTEMPTS_STORE;
    for (let index = 0; index < 12; index += 1) {
      store = recordAttempt(store, "كتب", "past", index % 2 === 0, "2026-07-01");
    }
    expect(store.items["كتب:past"].recent).toHaveLength(10);
    expect(store.items["كتب:past"].attempts).toBe(12);
    expect(store.items["كتب:past"].recent[9]).toBe(false);
  });

  it("clears lastWrongAt tracking only implicitly, never resetting history on a correct answer", () => {
    const wrong = recordAttempt(EMPTY_ATTEMPTS_STORE, "كتب", "past", false, "2026-07-01");
    const thenCorrect = recordAttempt(wrong, "كتب", "past", true, "2026-07-02");
    expect(thenCorrect.items["كتب:past"].lastWrongAt).toBe("2026-07-01");
  });
});

describe("getWeakItems", () => {
  it("returns nothing when there are no wrong answers", () => {
    const store = recordAttempt(EMPTY_ATTEMPTS_STORE, "كتب", "past", true, "2026-07-01");
    expect(getWeakItems(store, "2026-07-01", 5)).toEqual([]);
  });

  it("excludes items last missed more than 14 days ago", () => {
    const store = recordAttempt(EMPTY_ATTEMPTS_STORE, "كتب", "past", false, "2026-06-01");
    expect(getWeakItems(store, "2026-06-20", 5)).toEqual([]);
    expect(getWeakItems(store, "2026-06-10", 5)).toEqual([{ root: "كتب", formKey: "past" }]);
  });

  it("orders items most recently wrong first, then by lowest recent accuracy", () => {
    let store: PracticeAttemptsStore = EMPTY_ATTEMPTS_STORE;
    store = recordAttempt(store, "كتب", "past", false, "2026-07-01");
    store = recordAttempt(store, "سمع", "present", false, "2026-07-01");
    store = recordAttempt(store, "سمع", "present", true, "2026-07-02");
    store = recordAttempt(store, "علم", "imperative", false, "2026-07-03");

    const weak = getWeakItems(store, "2026-07-03", 5);
    expect(weak[0]).toEqual({ root: "علم", formKey: "imperative" });
    expect(weak).toContainEqual({ root: "كتب", formKey: "past" });
    expect(weak).toContainEqual({ root: "سمع", formKey: "present" });
  });

  it("respects the limit", () => {
    let store: PracticeAttemptsStore = EMPTY_ATTEMPTS_STORE;
    for (const root of ["كتب", "سمع", "علم", "فتح", "دخل", "خرج"]) {
      store = recordAttempt(store, root, "past", false, "2026-07-01");
    }
    expect(getWeakItems(store, "2026-07-01", 3)).toHaveLength(3);
  });
});
