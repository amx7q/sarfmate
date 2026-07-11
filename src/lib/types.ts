export type RootStatus = "reviewed" | "community_suggested" | "ai_draft";
export type QuranRootStatus = "indexed_only" | "ai_draft" | "reviewed";

/** Classical Arabic verb measure (وزن) that this entry's forms conjugate. */
export type VerbMeasure = "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII" | "IX" | "X";

export type SarfFormKey =
  | "past"
  | "present"
  | "imperative"
  | "place_or_mim_masdar"
  | "active_participle"
  | "passive_participle";

export type SarfForm = {
  order: number;
  key: SarfFormKey;
  arabic: string;
  transliteration: string;
  labelAr: string;
  labelEn: string;
  meaningEn?: string;
  exampleAr?: string;
  exampleEn?: string;
  reviewState?: "reviewed" | "source_backed" | "pending";
  notes?: string;
};

export type ImportedVerbSource = {
  chapter: string;
  sourcePage: string;
  verifiedFields: readonly [
    "meaning_en",
    "past_3ms",
    "present_3ms",
    "imperative_2ms",
    "masdar",
  ];
  csvNotes?: string;
};

export type RootVerbEntry = {
  id: string;
  meaningEn: string;
  status: RootStatus;
  /** Verb measure (وزن) that this entry's six forms conjugate, e.g. "I" or "VIII". */
  measure: VerbMeasure;
  forms: SarfForm[];
  notes?: string;
  source?: ImportedVerbSource;
  updatedAt: string;
};

export type RootEntry = {
  root: string;
  displayRoot: string;
  meaningEn: string;
  status: RootStatus;
  /** Verb measure (وزن) that this entry's six forms conjugate, e.g. "I" or "VIII". */
  measure: VerbMeasure;
  forms: SarfForm[];
  variants?: RootVerbEntry[];
  notes?: string;
  source?: ImportedVerbSource;
  quranic?: boolean;
  quranOccurrenceCount?: number;
  firstQuranOccurrence?: {
    surah: number;
    ayah: number;
  };
  updatedAt: string;
};

export type QuranRootIndexEntry = {
  root: string;
  displayRoot: string;
  transliteration?: string;
  glossEn?: string;
  occurrenceCount?: number;
  firstOccurrence?: {
    surah: number;
    ayah: number;
  };
  source: string;
  sourceUrl?: string;
  sourceLicense?: string;
  hasFullEntry: boolean;
  status: QuranRootStatus;
  notes?: string;
};

export type Submission = {
  id: string;
  type: "root_suggestion" | "error_report";
  root: string;
  formKey?: SarfFormKey;
  currentValue?: string;
  suggestedCorrection: string;
  explanation?: string;
  contributorName?: string;
  contributorEmail?: string;
  createdAt: string;
  status: "pending";
  deliveryStatus?: "pending" | "sent" | "failed" | "disabled";
  deliveredAt?: string;
};

/** The fixed learner-friendly order of the six core forms. */
export const FORM_SEQUENCE: readonly SarfFormKey[] = [
  "past",
  "present",
  "imperative",
  "place_or_mim_masdar",
  "active_participle",
  "passive_participle",
] as const;

/** Single source of truth for the Arabic/English labels of each form. */
export const FORM_LABELS: Record<SarfFormKey, { labelAr: string; labelEn: string }> = {
  past: { labelAr: "الماضي", labelEn: "Past verb" },
  present: { labelAr: "المضارع", labelEn: "Present verb" },
  imperative: { labelAr: "الأمر", labelEn: "Imperative" },
  place_or_mim_masdar: {
    labelAr: "اسم المكان / مصدر ميمي",
    labelEn: "Place noun / mim-masdar",
  },
  active_participle: { labelAr: "اسم الفاعل", labelEn: "Active participle" },
  passive_participle: { labelAr: "اسم المفعول", labelEn: "Passive participle" },
};

export const STATUS_LABELS: Record<RootStatus, string> = {
  reviewed: "Reviewed",
  community_suggested: "Community suggested",
  ai_draft: "AI draft",
};
