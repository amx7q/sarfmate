import { describe, it, expect } from "vitest";
import {
  getAllRoots,
  findRoot,
  getOrderedForms,
  validateRootEntry,
} from "@/lib/roots";
import { FORM_SEQUENCE, type RootEntry } from "@/lib/types";

describe("findRoot", () => {
  it("finds a root from bare letters", () => {
    expect(findRoot("سمع")?.meaningEn).toBe("hearing, listening");
  });

  it("finds a root from voweled input", () => {
    expect(findRoot("سَمِعَ")?.root).toBe("سمع");
  });

  it("finds a root from spaced and separated input", () => {
    expect(findRoot("س م ع")?.root).toBe("سمع");
    expect(findRoot("س-م-ع")?.root).toBe("سمع");
    expect(findRoot("س،م،ع")?.root).toBe("سمع");
  });

  it("returns undefined for unknown roots and empty input", () => {
    expect(findRoot("قرأ")).toBeUndefined();
    expect(findRoot("")).toBeUndefined();
  });
});

describe("getOrderedForms", () => {
  it("returns forms in the fixed learner order even if shuffled", () => {
    const entry = getAllRoots()[0];
    const shuffled: RootEntry = { ...entry, forms: [...entry.forms].reverse() };
    const ordered = getOrderedForms(shuffled);
    expect(ordered.map((f) => f.key)).toEqual([...FORM_SEQUENCE]);
    expect(ordered.map((f) => f.order)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("validateRootEntry", () => {
  it("accepts every seed entry (seed-data quality gate)", () => {
    for (const entry of getAllRoots()) {
      expect(validateRootEntry(entry)).toEqual([]);
    }
  });

  it("rejects a root that is not three Arabic letters", () => {
    const entry = { ...getAllRoots()[0], root: "سم", displayRoot: "س م" };
    expect(validateRootEntry(entry).join(" ")).toContain("three Arabic letters");
  });

  it("rejects a displayRoot that does not match the root", () => {
    const entry = { ...getAllRoots()[0], displayRoot: "س م" };
    expect(validateRootEntry(entry).join(" ")).toContain("displayRoot");
  });

  it("rejects a missing form", () => {
    const base = getAllRoots()[0];
    const entry = { ...base, forms: base.forms.slice(0, 5) };
    const errors = validateRootEntry(entry);
    expect(errors.join(" ")).toContain("exactly 6 forms");
    expect(errors.join(" ")).toContain("order 6");
  });

  it("rejects duplicate orders and keys", () => {
    const base = getAllRoots()[0];
    const forms = [...base.forms];
    forms[1] = { ...forms[0] };
    const errors = validateRootEntry({ ...base, forms });
    expect(errors.join(" ")).toContain("duplicate form orders");
    expect(errors.join(" ")).toContain("duplicate form keys");
  });

  it("rejects a form whose key does not match the fixed sequence at its order", () => {
    const base = getAllRoots()[0];
    const forms = base.forms.map((f) =>
      f.order === 1 ? { ...f, key: "present" as const } : f,
    );
    const errors = validateRootEntry({ ...base, forms });
    expect(errors.join(" ")).toContain("fixed sequence");
  });

  it("rejects empty required fields", () => {
    const base = getAllRoots()[0];
    const forms = base.forms.map((f) =>
      f.order === 1 ? { ...f, arabic: "" } : f,
    );
    const errors = validateRootEntry({ ...base, forms });
    expect(errors.join(" ")).toContain('missing required field "arabic"');
  });
});

describe("seed data spelling rules", () => {
  it("spells every imperative with hamzat wasl, never hamzat qat' (أ/إ)", () => {
    for (const entry of getAllRoots()) {
      const imperative = entry.forms.find((f) => f.key === "imperative");
      expect(imperative).toBeDefined();
      expect(imperative!.arabic.startsWith("أ")).toBe(false);
      expect(imperative!.arabic.startsWith("إ")).toBe(false);
      expect(imperative!.arabic.startsWith("ا")).toBe(true);
    }
  });
});
