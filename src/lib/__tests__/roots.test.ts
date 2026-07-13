import { describe, it, expect } from "vitest";
import { importedArabicVerbReport, importedPlaceholderCleanupAudit } from "@/data/roots";
import { QUTRUB_VERIFIED_FORMS } from "@/data/qutrubVerification";
import { QABAS_VERIFIED_FORMS } from "@/data/qabasVerification";
import { CALIMA_VERIFIED_FORMS } from "@/data/calimaVerification";
import { PARTICIPLE_VERIFIED_FORMS } from "@/data/participleVerification";
import { ELIXIRFM_VERIFIED_FORMS } from "@/data/elixirfmVerification";
import {
  getAllRoots,
  getRootVerbEntries,
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
import { toPublicRootEntry } from "@/lib/publicData";

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

  it("matches form transliteration", () => {
    expect(searchRoot("samiʿa")?.root).toBe("سمع");
  });

  it("matches compact consonantal root transliteration", () => {
    expect(searchRoot("ktb")?.root).toBe("كتب");
    expect(searchRoot("khrj")?.root).toBe("خرج");
  });

  it("returns undefined for unknown queries in either language", () => {
    expect(searchRoot("xyzzy")).toBeUndefined();
    expect(searchRoot("قرد")).toBeUndefined();
    expect(searchRoot("")).toBeUndefined();
  });
});

describe("imported Arabic verb variants", () => {
  it("keeps reviewed root entries intact while adding same-root partially reviewed variants", () => {
    const entry = findRoot("علم");
    expect(entry?.status).toBe("reviewed");
    const variant = entry?.variants?.find((item) => item.meaningEn === "To teach");
    expect(variant?.status).toBe("partially_reviewed");
    expect(variant?.source?.verifiedFields).toEqual([
      "meaning_en",
      "past_3ms",
      "present_3ms",
      "imperative_2ms",
      "masdar",
    ]);
  });

  it("publishes source attribution without internal CSV notes", () => {
    const entry = getAllRoots().find((root) => root.source?.csvNotes)!;
    const publicEntry = toPublicRootEntry(entry);
    expect(publicEntry.source).toBeDefined();
    expect(publicEntry.source?.csvNotes).toBeUndefined();
  });

  it("accounts for every CSV row in the import report", () => {
    expect(importedArabicVerbReport.processedRows).toBe(602);
    expect(importedArabicVerbReport.addedEntries).toBe(504);
    expect(importedArabicVerbReport.skippedExactDuplicateRows).toBe(4);
    expect(importedArabicVerbReport.skippedAlreadyRepresentedRows).toBe(89);
    expect(importedArabicVerbReport.skippedInvalidRows).toEqual([
      {
        rowNumber: 98,
        past: "ترجم",
        reason: 'could not infer a three-letter Arabic root; inferred "ترجم"',
      },
      {
        rowNumber: 240,
        past: "اطمأنّ",
        reason: 'could not infer a three-letter Arabic root; inferred "طمأن"',
      },
      {
        rowNumber: 257,
        past: "هيمن",
        reason: 'could not infer a three-letter Arabic root; inferred "هيمن"',
      },
      {
        rowNumber: 305,
        past: "كاد",
        reason: "missing required CSV field(s): imperative_2ms, masdar",
      },
      {
        rowNumber: 577,
        past: "اكفهر",
        reason: 'could not infer a three-letter Arabic root; inferred "كفهر"',
      },
    ]);
  });
});

describe("Quranic root index", () => {
  it("finds indexed Quranic roots by Arabic input", () => {
    // ليل has no naturally-attested beginner verb, so it's deliberately kept indexed-only
    // rather than forcing a fabricated six-form entry (see roots.ts's Quranic expansion notes).
    expect(findQuranRoot("ليل")?.status).toBe("indexed_only");
  });

  it("searchRootLibrary returns full entries before Quranic index-only entries", () => {
    const full = searchRootLibrary("hearing");
    expect(full?.kind).toBe("full_entry");
    if (full?.kind === "full_entry") expect(full.entry.root).toBe("سمع");
  });

  it("searchRootLibrary returns indexed-only Quranic results when no full entry exists", () => {
    const indexedOnly = searchRootLibrary("ليل");
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
    expect(errors.join(" ")).toContain('reviewed form "past" is missing learner content');
  });

  it("rejects reviewed entries that still carry AI-draft notes", () => {
    const base = getAllRoots().find((entry) => entry.status === "ai_draft")!;
    const errors = validateRootEntry({ ...base, status: "reviewed" });
    expect(errors.join(" ")).toContain("AI-draft review note");
  });
});

describe("library size", () => {
  it("keeps at least 100 full root entries", () => {
    expect(getAllRoots().length).toBeGreaterThanOrEqual(100);
  });
});

describe("seed data spelling rules", () => {
  it("spells each entry's imperative correctly for its verb measure", () => {
    // Measures I/VII/VIII/IX/X take the اِ hamzat-waṣl augment regardless of root shape.
    // Measures II/III keep the root's own first letter (no augment). Measure IV takes
    // hamzat qaṭʿ (أ). Measures V/VI take the تَ augment. Form-I doubled roots, roots
    // whose first letter is already أ/و, and roots with a medial hamza have irregular
    // imperative formation that a single rule can't capture, so they're spot-checked by
    // hand in reviewFormNotes/reviewExamples instead of asserted here.
    const HAMZA_LETTERS = new Set(["أ", "إ", "ء", "ئ"]);

    for (const entry of getAllRoots()) {
      if (entry.source) continue;
      const imperative = entry.forms.find((f) => f.key === "imperative");
      expect(imperative).toBeDefined();
      const arabic = imperative!.arabic;
      const root = entry.root;
      const doubled = root[1] === root[2];
      const initialHamzaOrWaw = root.startsWith("أ") || root.startsWith("و");
      const medialHamza = HAMZA_LETTERS.has(root[1]);
      // True hollow (medial-weak, drops to a 2-consonant CVC imperative like قُلْ) only
      // when the final radical is solid. When the final radical is also weak (e.g. كوي),
      // the verb conjugates like a defective root and keeps the اِ helper (اِكْوِ).
      const hollow = (root[1] === "و" || root[1] === "ي") && root[2] !== "و" && root[2] !== "ي";

      switch (entry.measure) {
        case "I":
          if (doubled || initialHamzaOrWaw || medialHamza) break;
          if (hollow) {
            expect(arabic.startsWith(root[0])).toBe(true);
          } else {
            expect(arabic.startsWith("أ")).toBe(false);
            expect(arabic.startsWith("إ")).toBe(false);
            expect(arabic.startsWith("ا")).toBe(true);
          }
          break;
        case "II":
        case "III":
          expect(arabic.startsWith(root[0])).toBe(true);
          break;
        case "IV":
          expect(arabic.startsWith("أ")).toBe(true);
          expect(arabic.startsWith("إ")).toBe(false);
          break;
        case "V":
        case "VI":
          expect(arabic.startsWith("ت")).toBe(true);
          break;
        case "VII":
        case "VIII":
        case "IX":
        case "X":
          expect(arabic.startsWith("أ")).toBe(false);
          expect(arabic.startsWith("إ")).toBe(false);
          expect(arabic.startsWith("ا")).toBe(true);
          break;
      }
    }
  });

  it("keeps every entry's measure as one of the ten classical measures", () => {
    const VALID_MEASURES = new Set(["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]);
    for (const entry of getAllRoots()) {
      expect(VALID_MEASURES.has(entry.measure)).toBe(true);
    }
  });
});

describe("imported draft content", () => {
  it("marks every Qutrub-matched form reviewed and partially reviews its whole entry", () => {
    let verifiedFormCount = 0;
    for (const root of getAllRoots()) {
      for (const entry of getRootVerbEntries(root)) {
        const verifiedKeys = Object.keys(QUTRUB_VERIFIED_FORMS[entry.id] ?? []);
        verifiedFormCount += verifiedKeys.length;
        for (const key of verifiedKeys) {
          expect(entry.forms.find((form) => form.key === key)?.reviewState).toBe("reviewed");
        }
      }
    }
    expect(verifiedFormCount).toBeGreaterThan(578);
    expect(findRoot("أخذ")?.status).toBe("partially_reviewed");
  });

  it("marks every exact Qabas derived-form match reviewed", () => {
    let verifiedFormCount = 0;
    for (const root of getAllRoots()) {
      for (const entry of getRootVerbEntries(root)) {
        const verifiedKeys = Object.keys(QABAS_VERIFIED_FORMS[entry.id] ?? []);
        verifiedFormCount += verifiedKeys.length;
        for (const key of verifiedKeys) {
          expect(entry.forms.find((form) => form.key === key)?.reviewState).toBe("reviewed");
        }
      }
    }
    expect(verifiedFormCount).toBe(413);
  });

  it("applies every strict Qabas and CALIMA verification", () => {
    let verifiedFormCount = 0;
    for (const root of getAllRoots()) {
      for (const entry of getRootVerbEntries(root)) {
        const verifiedForms = CALIMA_VERIFIED_FORMS[entry.id] ?? {};
        verifiedFormCount += Object.keys(verifiedForms).length;
        for (const [key, arabic] of Object.entries(verifiedForms)) {
          const form = entry.forms.find((candidate) => candidate.key === key);
          expect(form?.arabic).toBe(arabic);
          expect(form?.reviewState).toBe("reviewed");
        }
      }
    }
    expect(verifiedFormCount).toBe(156);
  });

  it("fills only strictly verified generated participles", () => {
    let verifiedFormCount = 0;
    for (const root of getAllRoots()) {
      for (const entry of getRootVerbEntries(root)) {
        const verifiedForms = PARTICIPLE_VERIFIED_FORMS[entry.id] ?? {};
        verifiedFormCount += Object.keys(verifiedForms).length;
        for (const [key, verified] of Object.entries(verifiedForms)) {
          const form = entry.forms.find((candidate) => candidate.key === key);
          expect(form?.arabic).toBe(verified.arabic);
          expect(form?.meaningEn).toBe(verified.meaningEn);
          expect(form?.reviewState).toBe("reviewed");
        }
      }
    }
    expect(verifiedFormCount).toBe(836);
  });

  it("applies every exact ElixirFM lemma, measure, and meaning match", () => {
    let verifiedFormCount = 0;
    for (const root of getAllRoots()) {
      for (const entry of getRootVerbEntries(root)) {
        const verifiedForms = ELIXIRFM_VERIFIED_FORMS[entry.id] ?? {};
        verifiedFormCount += Object.keys(verifiedForms).length;
        for (const [key, verified] of Object.entries(verifiedForms)) {
          const form = entry.forms.find((candidate) => candidate.key === key);
          expect(form?.arabic).toBe(verified.arabic);
          expect(form?.meaningEn).toBe(verified.meaningEn);
          expect(form?.reviewState).toBe("reviewed");
        }
      }
    }
    expect(verifiedFormCount).toBe(83);
  });

  it("promotes drafts only when all six forms are source-reviewed", () => {
    const entries = getAllRoots().flatMap(getRootVerbEntries);
    const fullyVerified = entries.filter((entry) =>
      entry.forms.every((form) => form.reviewState === "reviewed"),
    );
    expect(fullyVerified).toHaveLength(60);
    expect(fullyVerified.every((entry) => entry.status === "reviewed")).toBe(true);
    expect(entries.filter((entry) => entry.status === "reviewed")).toHaveLength(64);
  });

  it("audits every entry cleaned by the shared importer fix", () => {
    expect(importedPlaceholderCleanupAudit.affectedEntries).toBe(504);
    expect(importedPlaceholderCleanupAudit.cleanedLearnerFields).toBe(10_080);
    expect(importedPlaceholderCleanupAudit.items).toHaveLength(504 * 6);
  });

  it("keeps unsupported imported participles pending instead of generating them", () => {
    const imported = getAllRoots()
      .flatMap((entry) => entry.variants ?? [])
      .find((entry) =>
        entry.source &&
        !PARTICIPLE_VERIFIED_FORMS[entry.id] &&
        !ELIXIRFM_VERIFIED_FORMS[entry.id],
      );
    expect(imported).toBeDefined();
    for (const key of ["active_participle", "passive_participle"] as const) {
      const form = imported!.forms.find((candidate) => candidate.key === key)!;
      expect(form.reviewState).toBe("pending");
      expect(form.arabic).toBe("");
      expect(form.meaningEn).toBeUndefined();
      expect(form.exampleEn).toBeUndefined();
    }
  });

  it("uses the source masdar as a verbal noun, not a place noun", () => {
    const imported = getAllRoots()
      .flatMap((entry) => entry.variants ?? [])
      .find((entry) => entry.source)!;
    const masdar = imported.forms.find((form) => form.key === "place_or_mim_masdar")!;
    expect(masdar.labelAr).toBe("المصدر");
    expect(masdar.labelEn).toBe("Verbal noun");
    expect(["source_backed", "reviewed"]).toContain(masdar.reviewState);
  });

  it("rejects learner-facing placeholder templates with field context", () => {
    const base = getAllRoots()[0];
    const forms = base.forms.map((form) =>
      form.key === "past" ? { ...form, meaningEn: "Past form for: test" } : form,
    );
    expect(validateRootEntry({ ...base, forms }).join(" ")).toContain(
      'form "past" field "meaningEn" contains rejected placeholder pattern',
    );
  });

  it("keeps the تخرّج regression entry free of generic action prose", () => {
    const graduate = findRoot("خرج")?.variants?.find((entry) => entry.meaningEn === "To graduate");
    expect(graduate).toBeDefined();
    const learnerText = graduate!.forms
      .flatMap((form) => [form.meaningEn, form.exampleEn])
      .filter(Boolean)
      .join(" ");
    expect(learnerText).not.toMatch(/action:|AI-generated|Masdar from CSV|masdar listed for/i);
  });

  it("does not publish internal form notes as learner meanings", () => {
    const entry = getAllRoots().find((root) => root.variants?.some((variant) => variant.source))!;
    const publicEntry = toPublicRootEntry(entry);
    const imported = publicEntry.variants!.find((variant) => variant.source)!;
    expect(imported.forms.every((form) => form.notes === undefined)).toBe(true);
  });
});
