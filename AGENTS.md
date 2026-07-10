

\---



\## `AGENTS.md` for Codex



```md

\# AGENTS.md



Project instructions for Codex when working on SarfMate.



Codex reads this file before doing work in the repository. Follow these instructions unless the user explicitly overrides them.



SarfMate is a learner-friendly Arabic roots and forms web app for English-speaking Arabic students. It helps users type Arabic root letters and see core Arabic forms, transliteration, English meanings, and example sentences.



Bias toward small, verified, maintainable changes.



\---



\## Project Summary



Name: SarfMate  

Domain: sarfmate.app  

Audience: English-speaking Arabic students  

Focus: Arabic roots, ṣarf, core forms, meanings, examples, community correction



SarfMate should feel like a polished learning tool, not a technical dictionary.



The product value is:



\- clean learner-first UI

\- fixed Arabic form order

\- English meanings under each form

\- example sentences

\- AI-draft vs reviewed labels

\- community correction workflow

\- beautiful Arabic typography



\---



\## Operating Principles



\### 1. Think Before Coding



Before implementing non-trivial tasks:



\- State assumptions.

\- Identify ambiguity.

\- Ask if the request is unclear.

\- Present tradeoffs if there are multiple valid approaches.

\- Prefer the simplest approach that meets the request.



Do not silently pick a risky interpretation.



\### 2. Simplicity First



Write the minimum code required.



Avoid:



\- speculative features

\- unnecessary abstractions

\- generic frameworks for one-off logic

\- adding backend services unless requested

\- broad rewrites

\- unrelated cleanup



If the solution is becoming large, pause and simplify.



\### 3. Surgical Changes



Touch only files needed for the task.



Do not:



\- refactor unrelated code

\- reformat entire files unnecessarily

\- rename public types without need

\- remove unrelated dead code

\- overwrite user changes



Do:



\- remove unused code caused by your changes

\- match existing style

\- keep diffs easy to review



\### 4. Goal-Driven Execution



Turn tasks into verifiable goals.



For multi-step tasks, use a short plan:



1\. Step → verify with check

2\. Step → verify with check

3\. Step → verify with check



For bugs, prefer:



1\. reproduce with test

2\. fix

3\. confirm test passes



For data changes, prefer:



1\. add/update data

2\. run data validator

3\. verify browse/search still works



\---



\## Arabic Data Rules



Accuracy is more important than quantity.



Do not mark generated entries as reviewed.



Allowed statuses:



```ts

type RootStatus = "reviewed" | "community\_suggested" | "ai\_draft";

Rules:



New generated entries must use status: "ai\_draft".

Existing reviewed entries must not be overwritten without explicit instruction.

Community submissions must not be auto-published as reviewed.

Add notes for uncertain Arabic forms.

Do not fabricate sources, Quranic occurrence counts, first occurrences, or citations.

Do not copy copyrighted dictionary definitions or example sentences.

Use short, simple, learner-friendly examples.

Prefer clear English meanings over technical glosses.



Important hamzat-waṣl rule:



Correct: اِسْمَعْ

Incorrect: إسمع



Do not write hamzat-waṣl imperatives with incorrect hamzat qaṭʿ.



Required Form Order



Every full SarfMate root entry must have exactly six forms in this order:



past

الماضي

Past verb

present

المضارع

Present verb

imperative

الأمر

Imperative

place\_or\_mim\_masdar

اسم المكان / مصدر ميمي

Place noun / mim-masdar

active\_participle

اسم الفاعل

Active participle

passive\_participle

اسم المفعول

Passive participle



Desktop display must be right-to-left:



past appears on the far right

passive\_participle appears on the far left



Do not change this order unless the user explicitly requests it.



Expected Data Types



Use existing project types where possible.



Expected shape:



type SarfFormKey =

&#x20; | "past"

&#x20; | "present"

&#x20; | "imperative"

&#x20; | "place\_or\_mim\_masdar"

&#x20; | "active\_participle"

&#x20; | "passive\_participle";



type SarfForm = {

&#x20; order: number;

&#x20; key: SarfFormKey;

&#x20; arabic: string;

&#x20; transliteration: string;

&#x20; labelAr: string;

&#x20; labelEn: string;

&#x20; meaningEn: string;

&#x20; exampleAr: string;

&#x20; exampleEn: string;

&#x20; notes?: string;

};



type RootEntry = {

&#x20; root: string;

&#x20; displayRoot: string;

&#x20; meaningEn: string;

&#x20; status: RootStatus;

&#x20; forms: SarfForm\[];

&#x20; notes?: string;

&#x20; quranic?: boolean;

&#x20; quranOccurrenceCount?: number;

&#x20; firstQuranOccurrence?: {

&#x20;   surah: number;

&#x20;   ayah: number;

&#x20; };

&#x20; updatedAt: string;

};



If Quranic root indexing exists, keep indexed-only Quranic roots separate from full root entries.



Validation Expectations



When editing data or data models, update or run validation.



Validation should catch:



duplicate full roots

duplicate Quranic index roots

missing required fields

invalid root status

wrong form count

wrong form keys

wrong order

duplicate form keys

missing Arabic text

missing transliteration

missing English meaning

missing example sentence

invalid Quranic metadata

AI-generated entries incorrectly marked as reviewed



Prefer adding tests or validator rules rather than relying on visual inspection.



UI Rules



The UI should remain:



premium

calm

spacious

learner-friendly

polished

Arabic-aware

responsive



Visual direction:



warm off-white background

deep teal primary

emerald secondary

soft gold accent

rounded cards

hairline borders

subtle shadows

strong focus states

generous spacing

beautiful Arabic type



Do not introduce clutter, harsh colours, dense tables, or generic dashboard styling.



Arabic form text should be large and visually dominant. English text should support the learner.



Interaction and Motion



Use existing animation patterns.



Animations should be:



subtle

smooth

purposeful

accessible



Preserve:



reduced-motion support

no layout shift

card stagger where appropriate

copy button feedback

clean modal transitions



Do not add flashy or distracting motion.



Accessibility Requirements



Maintain or improve:



semantic HTML

keyboard navigation

visible focus states

screen-reader labels

colour contrast

RTL Arabic sections

LTR English sections

reduced-motion support



Do not rely on colour alone to communicate status.



Community Features



Community submissions are suggestions, not truth.



For MVP/local functionality:



use the existing localStorage pattern if present

keep suggestions pending

generate copyable JSON if that pattern exists

show review-before-publishing copy



Do not add auth, database, Supabase, email sending, or admin workflows unless asked.



Quranic Roots



For Quranic root work:



Do not invent a complete Quranic roots list.

Use a reliable imported source if available.

Store attribution/source/license fields.

Clearly distinguish indexed-only roots from full entries.

Do not fabricate occurrence counts.

Do not claim SarfMate replaces tafsir or specialist dictionaries.



If a reliable full Quranic dataset is unavailable, build import tooling and document what source file is needed.



Commands



Use the project’s existing package manager. Check lockfiles first.



Common commands:



npm run lint

npm run test

npm run data:validate

npm run build



Run relevant checks before finishing.



If a command does not exist, say so.



Do not claim a command passed unless it was actually run.



Git Workflow



Before changes:



git status



Review changes:



git diff



Do not overwrite user changes.



Do not commit unless requested or the task explicitly says to commit.



If committing, use concise messages:



Add AI draft root entries

Fix root search normalisation

Improve Quranic root browse filters

Deployment Context



The project is intended to deploy free using GitHub and Cloudflare.



Current domain:



sarfmate.app



Do not change deployment architecture unless requested.



.app requires HTTPS. Cloudflare should manage SSL.



Final Response



End with:



summary of changes

files changed

commands run

results

known limitations

next recommended step, if any



Be honest about failures, skipped checks, or uncertainty.

