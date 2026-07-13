"""Generate the checked-in map of SarfMate forms verified by Qutrub."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
AUDIT_PATH = PROJECT_ROOT / "exports" / "SarfMate-qutrub-audit.csv"
ROOTS_PATH = PROJECT_ROOT / "out" / "data" / "roots"
OUTPUT_PATH = PROJECT_ROOT / "src" / "data" / "qutrubVerification.ts"
FORM_COLUMNS = {
    "past": ("past_match", "current_past", "qutrub_past"),
    "present": ("present_match", "current_present", "qutrub_present"),
    "imperative": ("imperative_match", "current_imperative", "qutrub_imperative"),
}
ARABIC_DIACRITIC = re.compile(r"[\u064b-\u065f\u0670]")


def main() -> None:
    roots = json.loads(ROOTS_PATH.read_text(encoding="utf-8"))
    entries = {}
    for root in roots:
        entries[f"{root['root']}-main"] = root
        entries.update({variant["id"]: variant for variant in root.get("variants", [])})

    verified: dict[str, dict[str, str]] = {}
    with AUDIT_PATH.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            entry = entries.get(row["verb_entry_id"])
            if not entry:
                continue
            forms = {form["key"]: form for form in entry.get("forms", [])}
            forms_to_verify = {}
            selected_result = row["qutrub_result"] in {
                "unambiguous",
                "matched_existing_future_type",
            }
            for key, (match_column, current_column, qutrub_column) in FORM_COLUMNS.items():
                form = forms.get(key, {})
                has_learner_content = all(
                    form.get(field) for field in ("arabic", "transliteration", "meaningEn")
                )
                if row[match_column] == "True" and has_learner_content:
                    forms_to_verify[key] = form["arabic"]
                elif (
                    selected_result
                    and has_learner_content
                    and row[qutrub_column]
                    and not ARABIC_DIACRITIC.search(row[current_column])
                ):
                    forms_to_verify[key] = row[qutrub_column]
            if forms_to_verify:
                verified[row["verb_entry_id"]] = forms_to_verify

    lines = [
        'import type { SarfFormKey } from "@/lib/types";',
        "",
        "/** Arabic conjugations matched against Qutrub's structured output. */",
        "type VerifiedForms = Partial<Record<SarfFormKey, string>>;",
        "",
        "export const QUTRUB_VERIFIED_FORMS: Readonly<Record<string, VerifiedForms>> = {",
    ]
    for entry_id, forms in sorted(verified.items()):
        fields = ", ".join(
            f"{json.dumps(key)}: {json.dumps(arabic, ensure_ascii=False)}"
            for key, arabic in forms.items()
        )
        lines.append(f"  {json.dumps(entry_id, ensure_ascii=False)}: {{ {fields} }},")
    lines.extend(["};", ""])
    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Created {OUTPUT_PATH}")
    print(f"Recorded {sum(map(len, verified.values()))} verified forms across {len(verified)} entries.")


if __name__ == "__main__":
    main()
