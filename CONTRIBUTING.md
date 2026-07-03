# Contributing to SarfMate

Thank you for helping make SarfMate more accurate and useful for Arabic learners.

## Ways to contribute

1. **Suggest a root** — open a [root suggestion issue](.github/ISSUE_TEMPLATE/root-suggestion.yml) or use the in-app "Suggest a root" dialog and paste the JSON payload into an issue or email.
2. **Report an error** — open an [error report issue](.github/ISSUE_TEMPLATE/error-report.yml) or use "Notice an error" on any form card.
3. **Add or fix root data directly** — edit `src/data/roots.ts` and open a pull request.

## Adding or editing a root

Roots live in `src/data/roots.ts`. Each entry must match the `RootEntry` type in `src/lib/types.ts`:

- `root`: exactly three Arabic letters, no diacritics.
- `displayRoot`: the letters separated by spaces (must equal `formatRoot(root)`).
- Exactly **six forms**, orders 1–6, in the fixed sequence: past, present, imperative, place noun / mim-masdar, active participle, passive participle.
- Every form needs voweled Arabic, a transliteration, an English meaning, and an Arabic example sentence with English translation.
- Use `FORM_LABELS` from `src/lib/types.ts` for labels (as the existing entries do) so labels never drift.

### Arabic spelling rules

- Form-I imperatives use **hamzat waṣl**: اِسْمَعْ, اُكْتُبْ — never إسمع or أكتب. A test enforces this.
- Include full vowel marks on all forms and example sentences.

### Transliteration conventions

Use ʿ for ʿayn, ʾ for hamza, macrons for long vowels (ā, ī, ū), and dots for emphatic letters (ḥ, ṣ, ḍ, ṭ, ẓ).

### Data honesty

If a form is theoretically correct but rare or uncertain in real usage, keep it but add a `notes` field explaining the uncertainty — the UI shows it as a "Needs review" footnote. Do not present uncertain data as verified. If the whole entry is unverified, set `status: "ai_draft"`.

## Before opening a PR

```bash
npm run lint
npm run test   # validates every seed entry
npm run build
```

All three must pass. The test suite is the data-quality gate — a seed entry that fails `validateRootEntry` fails CI.
