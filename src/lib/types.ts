export type RootStatus = "reviewed" | "community_suggested" | "ai_draft";

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
  meaningEn: string;
  exampleAr: string;
  exampleEn: string;
  notes?: string;
};

export type RootEntry = {
  root: string;
  displayRoot: string;
  meaningEn: string;
  status: RootStatus;
  forms: SarfForm[];
  notes?: string;
  updatedAt: string;
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
