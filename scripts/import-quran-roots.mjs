import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2];
const outputPath = path.resolve("src/data/quranRoots.ts");
const rootsSourcePath = path.resolve("src/data/roots.ts");

if (!inputPath) {
  console.error(
    "Usage: npm run import:quran-roots -- <roots.csv|roots.json>\nCSV columns: root,displayRoot,transliteration,glossEn,occurrenceCount,firstSurah,firstAyah,source,sourceUrl,sourceLicense",
  );
  process.exit(1);
}

const ARABIC_ROOT = /^[\u0621-\u064a]{3,4}$/;

function normaliseRoot(value) {
  return String(value || "")
    .trim()
    .replace(/[\s\u00a0ـ.,!?;:'"()[\]{}\-_/\\|،؛؟«»]/g, "")
    .replace(/[\u064b-\u065f\u0670]/g, "");
}

function displayRoot(root) {
  return [...root].join(" ");
}

function splitCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  if (quoted) throw new Error(`Malformed CSV line with unclosed quote: ${line}`);
  return cells;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("CSV must include a header and at least one row");
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line, index) => {
    const values = splitCsvLine(line);
    if (values.length !== headers.length) {
      throw new Error(`CSV row ${index + 2} has ${values.length} fields, expected ${headers.length}`);
    }
    return Object.fromEntries(headers.map((header, i) => [header, values[i]]));
  });
}

function readFullEntryRoots() {
  const source = fs.readFileSync(rootsSourcePath, "utf8");
  return new Set(
    [...source.matchAll(/root:\s*"([^"]+)"/g)].map((match) => normaliseRoot(match[1])),
  );
}

function rowToEntry(row, rowNumber, fullEntryRoots) {
  const root = normaliseRoot(row.root);
  if (!root || !ARABIC_ROOT.test(root)) {
    throw new Error(`Row ${rowNumber}: root "${row.root}" must be 3-4 Arabic letters`);
  }
  if (!row.source) throw new Error(`Row ${rowNumber}: source is required`);

  const occurrenceCount = row.occurrenceCount ? Number(row.occurrenceCount) : undefined;
  if (occurrenceCount !== undefined && (!Number.isInteger(occurrenceCount) || occurrenceCount < 0)) {
    throw new Error(`Row ${rowNumber}: occurrenceCount must be a non-negative integer`);
  }

  const firstSurah = row.firstSurah ? Number(row.firstSurah) : undefined;
  const firstAyah = row.firstAyah ? Number(row.firstAyah) : undefined;
  if ((firstSurah && !firstAyah) || (!firstSurah && firstAyah)) {
    throw new Error(`Row ${rowNumber}: firstSurah and firstAyah must be provided together`);
  }
  if (firstSurah && (firstSurah < 1 || firstSurah > 114 || firstAyah < 1)) {
    throw new Error(`Row ${rowNumber}: first occurrence must be a valid surah/ayah pair`);
  }

  return {
    root,
    displayRoot: row.displayRoot || displayRoot(root),
    transliteration: row.transliteration || undefined,
    glossEn: row.glossEn || undefined,
    occurrenceCount,
    firstOccurrence: firstSurah ? { surah: firstSurah, ayah: firstAyah } : undefined,
    source: row.source,
    sourceUrl: row.sourceUrl || undefined,
    sourceLicense: row.sourceLicense || undefined,
    hasFullEntry: fullEntryRoots.has(root),
    status: fullEntryRoots.has(root) ? "ai_draft" : "indexed_only",
    notes: row.notes || undefined,
  };
}

const absoluteInput = path.resolve(inputPath);
const raw = fs.readFileSync(absoluteInput, "utf8");
const rows = absoluteInput.endsWith(".json") ? JSON.parse(raw) : parseCsv(raw);
if (!Array.isArray(rows)) throw new Error("Input JSON must be an array of root objects");

const fullEntryRoots = readFullEntryRoots();
const deduped = new Map();
rows.forEach((row, index) => {
  const entry = rowToEntry(row, index + 2, fullEntryRoots);
  if (!deduped.has(entry.root)) deduped.set(entry.root, entry);
});

const entries = [...deduped.values()].sort((a, b) => {
  const countA = a.occurrenceCount ?? -1;
  const countB = b.occurrenceCount ?? -1;
  if (countA !== countB) return countB - countA;
  return a.root.localeCompare(b.root, "ar");
});

const body = `import type { QuranRootIndexEntry } from "@/lib/types";

export const quranRoots: QuranRootIndexEntry[] = ${JSON.stringify(entries, null, 2)};
`;

fs.writeFileSync(outputPath, body, "utf8");
console.log(`Imported ${entries.length} Quranic roots into ${outputPath}`);
