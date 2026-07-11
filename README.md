# SarfMate — Arabic roots & forms

SarfMate is a clean, learner-friendly, English-first way to understand Arabic roots, core forms, meanings, and examples. Type an Arabic root like **سمع** and instantly see its six most useful forms — past verb, present verb, imperative, place noun / mim-masdar, active participle, and passive participle — in a fixed right-to-left learner order, each with vowels, transliteration, an English meaning, and an example sentence.

Built for English-speaking students of Arabic, ṣarf (Arabic morphology), Quranic Arabic, classical Arabic, and Modern Standard Arabic.

## Features

- **Root search** with lenient input: `سمع`, `س م ع`, `س-م-ع`, and fully voweled words all match.
- **Fixed six-form layout** in one right-to-left row (الماضي on the far right), scroll-snap carousel on small screens.
- **English meanings and example sentences** on every form, with copy buttons.
- **Community review workflow**: suggest roots and report errors in-app; submissions are recorded in Supabase (when configured — see [docs/SUPABASE.md](docs/SUPABASE.md)) and always saved locally with JSON export and email fallback.
- **Status badges** (Reviewed / Community suggested / AI draft) plus per-form "Needs review" notes for honest data quality.
- Accessible (keyboard-navigable dialogs, screen-reader labels, reduced-motion support) and fully responsive.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests (also validates the seed data) |
| `npm run data:validate` | Run the SarfMate data validation test gate |
| `npm run import:quran-roots -- <file>` | Import a Quranic root CSV/JSON into `src/data/quranRoots.ts` |

## Editing root data

All roots live in [`src/data/roots.ts`](src/data/roots.ts) as plain TypeScript objects matching the `RootEntry` type in [`src/lib/types.ts`](src/lib/types.ts). Each entry needs:

- `root` — exactly three Arabic letters (e.g. `"سمع"`)
- `displayRoot` — the spaced form (`"س م ع"`)
- `meaningEn`, `status`, `updatedAt`
- exactly six `forms` with orders 1–6 in the fixed sequence, each with Arabic (voweled), transliteration, English meaning, and an example sentence with translation

**Spelling rule:** Form-I imperatives use hamzat waṣl (اِسْمَعْ), never hamzat qaṭʿ (إسمع).

Run `npm run test` or `npm run data:validate` after editing — the test suite runs `validateRootEntry` against every seed entry and enforces the hamzat waṣl rule for sound roots. Mark uncertain forms with a `notes` field; the UI shows a "Needs review" footnote.

## Quranic root index

SarfMate keeps Quranic data in two levels:

- **Quranic root index**: [`src/data/quranRoots.ts`](src/data/quranRoots.ts) lists roots that appear in the Qur'an so they can be browsed and searched even when full forms are not ready.
- **Full SarfMate entries**: [`src/data/roots.ts`](src/data/roots.ts) contains rich six-form learner entries with Arabic, transliteration, meanings, examples, status, and review notes.

Indexed-only Quranic roots show a clear message: "This Quranic root is in the index, but a full SarfMate entry has not been added yet." Newly generated full entries are marked `ai_draft` and must not be promoted to `reviewed` until an Arabic teacher, native speaker, or qualified reviewer checks them.

The checked-in Quranic index is a partial starter sample. It is not a complete list of Quranic roots. Complete coverage requires importing a reliable, open/public, attributed source file.

### Importing Quranic roots

Use a properly licensed Quranic roots source. Do not scrape copyrighted websites and do not copy proprietary dictionary content.

```bash
npm run import:quran-roots -- ./path/to/quran-roots.csv
npm run data:validate
```

CSV columns:

```text
root,displayRoot,transliteration,glossEn,occurrenceCount,firstSurah,firstAyah,source,sourceUrl,sourceLicense
```

The importer normalises roots, removes duplicates, validates Arabic root shape, sorts by occurrence count, preserves attribution fields, and writes `src/data/quranRoots.ts`.

### Reviewing an AI draft

Before changing `status: "ai_draft"` to `status: "reviewed"`, check the root letters, all six forms, vowels, hamzah/weak-letter spelling, transliteration, English meanings, Arabic examples, translations, and Quranic metadata. Quranic roots can have rich meanings across contexts; SarfMate summaries are learner aids, not a replacement for tafsir or specialist dictionaries.

## Reporting errors & suggesting roots

- **In the app:** use "Notice an error" on any form card, or "Suggest a root". Submissions are sent to the SarfMate team (when Supabase is configured) and saved to your browser's localStorage; you can also copy the JSON payload or send it by email from the "Your pending suggestions" panel.
- **On GitHub:** open an issue with the [root suggestion](.github/ISSUE_TEMPLATE/root-suggestion.yml) or [error report](.github/ISSUE_TEMPLATE/error-report.yml) form.

Community suggestions are reviewed before publishing.

## Deployment (free options)

- **Vercel (recommended):** import the repo at vercel.com — zero configuration needed.
- **Netlify:** add the `@netlify/plugin-nextjs` build plugin; build command `npm run build`.
- **Cloudflare Pages:** use the Next.js preset (via `@cloudflare/next-on-pages` or OpenNext).
- **GitHub Pages:** add `output: "export"` to `next.config.ts` for a static export (all root pages are pre-rendered via `generateStaticParams`, so this works), then publish the `out/` directory.

## Known limitations

- The app ships a small reviewed seed dataset plus AI-draft Quranic learner entries.
- The Quranic root index is currently partial until imported from a reliable attributed source file.
- Root-only search can be ambiguous in Arabic — some letter sequences belong to multiple roots or verb forms.
- Entries require ongoing scholarly review; some forms are explicitly flagged as needing it.
- Derived Forms II–X, weak/hollow/doubled verbs, Quranic examples, audio pronunciation, and user accounts are future work.

## Architecture & roadmap

The code is structured so a backend can be added without a rewrite:

- All data access goes through [`src/lib/roots.ts`](src/lib/roots.ts) — swap the seed import for a database call.
- Submissions go through the `SubmissionsStore` interface in [`src/lib/submissionsStore.ts`](src/lib/submissionsStore.ts) — replace the localStorage implementation with Supabase or similar.
- The `RootEntry` / `SarfForm` / `Submission` types are backend-shape-agnostic.

Already shipped: Supabase-backed submissions, a practice quiz (`/practice`) with daily and review modes, and a streak-based Daily Root Challenge (`/daily-root-challenge`) with shareable result images.

Planned directions: admin review dashboard, user accounts, audio pronunciation, Forms II–X coverage, root maps, teacher tools, multilingual definitions, and API access.

## License

MIT — see [LICENSE](LICENSE).
