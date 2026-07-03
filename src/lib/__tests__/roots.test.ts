import { describe, it, expect } from "vitest";
import {
  getAllRoots,
  findRoot,
  searchRoot,
  getOrderedForms,
  validateAllRootEntries,
  validateRootEntry,
} from "@/lib/roots";
import {
  findQuranRoot,
  getQuranRootIndex,
  searchRootLibrary,
  validateQuranRootIndex,
} from "@/lib/quranRoots";
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
    expect(findRoot("قرد")).toBeUndefined();
    expect(findRoot("")).toBeUndefined();
  });
});

describe("searchRoot", () => {
  it("matches Arabic input like findRoot", () => {
    expect(searchRoot("سَمِعَ")?.root).toBe("سمع");
  });

  it("matches an English meaning summary", () => {
    expect(searchRoot("hearing")?.root).toBe("سمع");
    expect(searchRoot("Writing")?.root).toBe("كتب");
    expect(searchRoot("knowing")?.root).toBe("علم");
  });

  it("falls back to per-form English meanings", () => {
    expect(searchRoot("office")?.root).toBe("كتب");
    expect(searchRoot("entrance")?.root).toBe("دخل");
  });

  it("returns undefined for unknown queries in either language", () => {
    expect(searchRoot("xyzzy")).toBeUndefined();
    expect(searchRoot("قرد")).toBeUndefined();
    expect(searchRoot("")).toBeUndefined();
  });
});

describe("Quranic root index", () => {
  it("finds indexed Quranic roots by Arabic input", () => {
    expect(findQuranRoot("قرأ")?.status).toBe("indexed_only");
  });

  it("searchRootLibrary returns full entries before Quranic index-only entries", () => {
    const full = searchRootLibrary("hearing");
    expect(full?.kind).toBe("full_entry");
    if (full?.kind === "full_entry") expect(full.entry.root).toBe("سمع");
  });

  it("searchRootLibrary returns indexed-only Quranic results when no full entry exists", () => {
    const indexedOnly = searchRootLibrary("قرأ");
    expect(indexedOnly?.kind).toBe("indexed_only");
    if (indexedOnly?.kind === "indexed_only") {
      expect(indexedOnly.indexEntry.hasFullEntry).toBe(false);
    }
  });

  it("validates the Quranic index and full-entry dataset", () => {
    expect(validateAllRootEntries()).toEqual([]);
    expect(validateQuranRootIndex()).toEqual([]);
  });

  it("has no duplicate Quranic roots", () => {
    const keys = getQuranRootIndex().map((entry) => entry.root);
    expect(new Set(keys).size).toBe(keys.length);
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

describe("library size", () => {
  it("keeps at least 100 full root entries", () => {
    expect(getAllRoots().length).toBeGreaterThanOrEqual(100);
  });
});

describe("seed data spelling rules", () => {
  it("spells sound-root imperatives with hamzat wasl, never hamzat qat' (أ/إ)", () => {
    for (const entry of getAllRoots()) {
      if (entry.root[1] === entry.root[2]) continue;
      const imperative = entry.forms.find((f) => f.key === "imperative");
      expect(imperative).toBeDefined();
      expect(imperative!.arabic.startsWith("أ")).toBe(false);
      expect(imperative!.arabic.startsWith("إ")).toBe(false);
      expect(imperative!.arabic.startsWith("ا")).toBe(true);
    }
  });
});
