import { normaliseArabicInput } from "@/lib/arabic";
import { FORM_SEQUENCE, type RootEntry, type SarfForm } from "@/lib/types";

const REQUIRED_FORM_FIELDS = ["arabic", "labelEn", "meaningEn"] as const;

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPreviousLocalDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return getLocalDateKey(date);
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function getDailyRootEligibleEntries(entries: readonly RootEntry[]): RootEntry[] {
  return entries
    .filter((entry) =>
      entry.status === "reviewed" &&
      hasText(entry.root) &&
      normaliseArabicInput(entry.root).length === 3 &&
      hasText(entry.displayRoot) &&
      hasText(entry.meaningEn) &&
      entry.forms.length === FORM_SEQUENCE.length &&
      entry.forms.every((form, index) =>
        form.key === FORM_SEQUENCE[index] &&
        form.order === index + 1 &&
        REQUIRED_FORM_FIELDS.every((field) => hasText(form[field])),
      ),
    )
    .slice()
    .sort((a, b) => a.root.localeCompare(b.root, "ar"));
}

export function selectDailyRoot(
  entries: readonly RootEntry[],
  dateKey: string,
  salt = "daily-root",
): RootEntry | undefined {
  const eligible = getDailyRootEligibleEntries(entries);
  if (eligible.length === 0) return undefined;
  return eligible[hashString(`${salt}:${dateKey}`) % eligible.length];
}

export function selectDailyChallengeRoot(
  entries: readonly RootEntry[],
  dateKey: string,
  displayedRoot?: string,
): RootEntry | undefined {
  const eligible = getDailyRootEligibleEntries(entries).filter(
    (entry) => entry.root !== displayedRoot,
  );
  if (eligible.length === 0) return undefined;
  return eligible[hashString(`daily-root-challenge:${dateKey}`) % eligible.length];
}

export function getDailyCardForms(entry: RootEntry): SarfForm[] {
  const keys = new Set(["past", "present", "active_participle"]);
  return entry.forms.filter((form) => keys.has(form.key));
}
