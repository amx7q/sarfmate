# CLAUDE.md

Project-specific instructions for Claude when working on SarfMate.

SarfMate is a learner-friendly Arabic roots and forms web app for English-speaking Arabic students. The product helps learners type Arabic root letters and see core forms, meanings, transliteration, and example sentences in a clean, premium interface.

These instructions intentionally bias toward caution, small diffs, and verified work over speed.

---

## 1. Core Product Context

SarfMate is for English-speaking learners of Arabic, especially students of:

- Arabic ṣarf / morphology
- Quranic Arabic
- Classical Arabic
- Modern Standard Arabic

The product is not trying to be the first Arabic conjugator. Its value is:

- clean learner-first presentation
- fixed form ordering
- English meanings under each form
- example sentences
- community corrections
- reviewed vs AI-draft data labels
- beautiful, calm, premium UI

Do not turn SarfMate into a cluttered technical dictionary unless explicitly asked.

---

## 2. Think Before Coding

Do not assume. Do not hide confusion. Surface tradeoffs.

Before implementing:

- State assumptions briefly.
- If multiple interpretations exist, present them.
- If a simpler approach exists, say so.
- If something is unclear, stop and ask.
- Push back on changes that would hurt data quality, UI clarity, or maintainability.

For trivial fixes, use judgment and proceed if the intent is obvious.

---

## 3. Simplicity First

Write the minimum code that solves the task.

Avoid:

- speculative features
- premature abstractions
- generic frameworks for one use case
- unnecessary config systems
- sweeping rewrites
- over-engineered error handling

If a solution can be 50 lines instead of 200, prefer 50.

Do not add backend infrastructure unless the task explicitly requires it. The MVP is designed to work with local TypeScript/JSON data and free static hosting.

---

## 4. Surgical Changes

Touch only what the task requires.

When editing existing code:

- Do not refactor unrelated files.
- Do not reformat unrelated code.
- Do not rename things unless needed.
- Match existing style.
- Clean up only unused imports, variables, or files caused by your own changes.
- Mention unrelated issues instead of fixing them silently.

Every changed line should trace back to the user’s request.

---

## 5. Goal-Driven Execution

For multi-step tasks, start with a short plan:

1. Step → verification
2. Step → verification
3. Step → verification

Define success criteria before coding.

Examples:

- “Add root validation” → tests cover invalid roots and valid roots.
- “Fix search” → test reproduces failure, then passes.
- “Add data entries” → data validator passes and entries appear in browse/search.

Loop until the work is verified.

---

## 6. Arabic Data Accuracy Rules

Accuracy matters more than volume.

Never mark generated Arabic data as reviewed unless a human reviewer explicitly verified it.

Statuses:

- `reviewed`: human-reviewed, trusted entry
- `community_suggested`: submitted by user/community, not fully verified
- `ai_draft`: generated or uncertain, requires review

Rules:

- New AI-generated entries must use `status: "ai_draft"`.
- Do not silently overwrite reviewed entries.
- Do not claim a Quranic root index is complete unless imported from a reliable source.
- Do not fabricate Quranic occurrence counts, first occurrences, citations, or sources.
- Do not copy copyrighted dictionary definitions or example sentences.
- Use simple learner-friendly English meanings.
- Use short Arabic example sentences.
- Include notes when forms are uncommon, uncertain, weak, hollow, hamzated, doubled, or context-dependent.

Important spelling rule:

- Do not write hamzat-waṣl imperatives with incorrect إ.
- Example:
  - Correct: `اِسْمَعْ`
  - Incorrect: `إسمع`

---

## 7. Fixed Form Order

Full SarfMate entries must contain exactly six forms in this order:

1. `past`
   - Arabic label: `الماضي`
   - English label: `Past verb`

2. `present`
   - Arabic label: `المضارع`
   - English label: `Present verb`

3. `imperative`
   - Arabic label: `الأمر`
   - English label: `Imperative`

4. `place_or_mim_masdar`
   - Arabic label: `اسم المكان / مصدر ميمي`
   - English label: `Place noun / mim-masdar`

5. `active_participle`
   - Arabic label: `اسم الفاعل`
   - English label: `Active participle`

6. `passive_participle`
   - Arabic label: `اسم المفعول`
   - English label: `Passive participle`

On desktop, the visual display should be one right-to-left row:

- `الماضي` on the far right
- `اسم المفعول` on the far left

Do not break this order.

---

## 8. Data Model Expectations

Use the existing types unless the task requires careful extension.

Expected shape:

```ts
type RootStatus = "reviewed" | "community_suggested" | "ai_draft";

type SarfFormKey =
  | "past"
  | "present"
  | "imperative"
  | "place_or_mim_masdar"
  | "active_participle"
  | "passive_participle";

type SarfForm = {
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

type RootEntry = {
  root: string;
  displayRoot: string;
  meaningEn: string;
  status: RootStatus;
  forms: SarfForm[];
  notes?: string;
  quranic?: boolean;
  quranOccurrenceCount?: number;
  firstQuranOccurrence?: {
    surah: number;
    ayah: number;
  };
  updatedAt: string;
};

If Quranic root index support exists, indexed-only roots must be clearly separate from full learner entries.

9. Validation Requirements

When changing root data or data models, run or update validation.

The validator should catch:

duplicate roots
invalid statuses
missing required fields
wrong form count
duplicate form keys
wrong form order
missing Arabic text
missing transliteration
missing English meaning
missing example sentences
invalid Quranic metadata
AI-generated entries incorrectly marked as reviewed

If npm run data:validate exists, run it after data changes.

10. UI and UX Rules

SarfMate should feel:

calm
premium
Apple-like in polish, without copying Apple branding
learner-friendly
spacious
precise
beautiful for Arabic text

Design direction:

warm off-white background
deep teal primary
emerald secondary
soft gold accent
rounded cards
subtle shadows
hairline borders
smooth focus rings
generous whitespace
excellent Arabic typography

Do not introduce clutter. Do not make the interface feel like a spreadsheet or technical corpus tool.

Arabic should be visually dominant on form cards. English should clarify, not overwhelm.

11. Motion and Interaction

Animations should be subtle and high quality.

Prefer:

gentle entrance transitions
card stagger animations
smooth search/result transitions
tasteful hover/tap microinteractions
copy success feedback
accessible modal transitions

Always respect reduced motion.

Avoid:

flashy animation
layout shift
janky transitions
unnecessary animation libraries beyond what already exists
12. Accessibility

Preserve or improve:

semantic HTML
keyboard navigation
visible focus states
sufficient contrast
screen-reader labels
RTL Arabic display
LTR English explanations
reduced-motion support

Dialogs must be keyboard-accessible.

Copy buttons and “Notice an error” buttons must have clear accessible labels.

13. Community Features

SarfMate supports community improvement, but submissions are not trusted automatically.

For submissions:

always save to localStorage first (the local store is the source of the visitor's "pending suggestions" panel)
additionally send to Supabase via src/lib/submissionsRemote.ts when NEXT_PUBLIC_SUPABASE_* env vars are set (write-only drop-box, INSERT-only RLS — see supabase/schema.sql and docs/SUPABASE.md); remote failure must never block the local save or the success screen
generate copyable JSON payloads
keep status: "pending"
show that suggestions are reviewed before publishing

Do not remove the Supabase submissions integration. Do not add accounts, auth, or admin dashboards unless explicitly asked.

14. Quranic Roots Rules

For Quranic roots:

Separate indexed-only Quranic roots from full SarfMate entries.
Do not claim completeness without a reliable imported source.
Do not fabricate occurrence counts or first occurrences.
Add source and license fields where applicable.
Include learner-friendly disclaimers:
SarfMate summaries are not tafsir.
Quranic roots may have rich meanings across contexts.

If a complete Quranic root source is unavailable, build import tooling and document the missing source rather than hallucinating a full dataset.

15. Testing and Commands

Use the project’s package manager and existing scripts.

Before finishing code changes, run the relevant checks:

npm run lint
npm run test
npm run data:validate
npm run build

If a script does not exist, mention that instead of pretending it passed.

For data-only changes, at minimum run:

npm run data:validate
npm run test

If tests fail because of pre-existing issues, report them clearly and separate them from your own changes.

16. Git Discipline

Before editing:

git status

After editing:

git diff

Do not overwrite user changes.

Commit only when asked or when the task explicitly requests a commit.

Use clear commit messages, for example:

Add AI draft Quranic root entries
Fix Arabic root search normalisation
Improve form card RTL layout
17. Deployment Context

The project is intended for free hosting, currently using:

GitHub repository
Cloudflare Workers/Pages
custom domain: sarfmate.app

Do not change deployment architecture unless explicitly asked.

For .app domains, HTTPS is required. Cloudflare should manage SSL.

18. Final Response Format

When finished, report:

what changed
files changed
commands run
pass/fail results
known limitations
any follow-up needed

Be honest. Do not claim checks passed unless they were actually run and passed.