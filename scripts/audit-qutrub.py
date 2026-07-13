r"""Compare SarfMate verb forms with the official Qutrub conjugation library.

Run with the isolated library on PYTHONPATH, for example:
  PYTHONPATH=C:\tmp\sarfmate-qutrub python scripts/audit-qutrub.py
"""

from __future__ import annotations

import csv
import json
import sys
import unicodedata
from pathlib import Path

import libqutrub.conjugator


PROJECT_ROOT = Path(__file__).resolve().parents[1]
INPUT_PATH = PROJECT_ROOT / "out" / "data" / "roots"
OUTPUT_PATH = PROJECT_ROOT / "exports" / "SarfMate-qutrub-audit.csv"
FUTURE_TYPES = ("فتحة", "ضمة", "كسرة")


def comparable(value: str | None) -> str:
    normalized = unicodedata.normalize("NFD", value or "").replace("ـ", "").replace("ٱ", "ا")
    clusters: list[str] = []
    for character in normalized:
        if unicodedata.combining(character) and clusters:
            clusters[-1] += character
        else:
            clusters.append(character)
    return "".join(cluster[:1] + "".join(sorted(cluster[1:])) for cluster in clusters)


def verb_entries(roots: list[dict]):
    for root in roots:
        yield root, {
            "id": f"{root['root']}-main",
            "meaningEn": root.get("meaningEn", ""),
            "status": root.get("status", ""),
            "measure": root.get("measure", ""),
            "forms": root.get("forms", []),
        }, "Main"
        for variant in root.get("variants", []):
            yield root, variant, "Variant"


def conjugate(past: str, future_type: str) -> dict:
    return libqutrub.conjugator.conjugate(
        past,
        future_type,
        alltense=True,
        past=True,
        future=True,
        passive=True,
        imperative=True,
        future_moode=True,
        confirmed=True,
        transitive=True,
        display_format="DICT",
    )


def main() -> int:
    roots = json.loads(INPUT_PATH.read_text(encoding="utf-8"))
    rows: list[dict[str, str]] = []

    for root, entry, entry_type in verb_entries(roots):
        forms = {form["key"]: form for form in entry.get("forms", [])}
        current_past = forms.get("past", {}).get("arabic", "")
        current_present = forms.get("present", {}).get("arabic", "")
        current_imperative = forms.get("imperative", {}).get("arabic", "")
        row = {
            "root": root["root"],
            "verb_entry_id": entry["id"],
            "entry_type": entry_type,
            "measure": entry.get("measure", ""),
            "status": entry.get("status", ""),
            "meaning": entry.get("meaningEn", ""),
            "current_past": current_past,
            "current_present": current_present,
            "current_imperative": current_imperative,
            "qutrub_result": "",
            "qutrub_future_type": "",
            "qutrub_past": "",
            "qutrub_present": "",
            "qutrub_imperative": "",
            "past_match": "",
            "present_match": "",
            "imperative_match": "",
            "safe_corrections": "",
            "qutrub_url": f"https://qutrub.arabeyes.org/?verb={current_past}",
        }

        if not current_past:
            row["qutrub_result"] = "missing_past_input"
            rows.append(row)
            continue

        candidates: list[dict[str, str]] = []
        errors: list[str] = []
        for future_type in FUTURE_TYPES:
            try:
                table = conjugate(current_past, future_type)
                candidate = {
                    "future_type": future_type,
                    "past": table.get("الماضي المعلوم", {}).get("هو", ""),
                    "present": table.get("المضارع المعلوم", {}).get("هو", ""),
                    "imperative": table.get("الأمر", {}).get("أنت", ""),
                }
                signature = tuple(comparable(candidate[key]) for key in ("past", "present", "imperative"))
                if not any(
                    tuple(comparable(existing[key]) for key in ("past", "present", "imperative"))
                    == signature
                    for existing in candidates
                ):
                    candidates.append(candidate)
            except Exception as error:  # Qutrub raises several legacy exception types.
                errors.append(f"{future_type}: {error}")

        if not candidates:
            row["qutrub_result"] = "error: " + " | ".join(errors)
            rows.append(row)
            continue

        matching = [
            candidate
            for candidate in candidates
            if (
                current_present
                and comparable(candidate["present"]) == comparable(current_present)
            )
            or (
                current_imperative
                and comparable(candidate["imperative"]) == comparable(current_imperative)
            )
        ]
        if len(candidates) == 1:
            selected = candidates[0]
            result = "unambiguous"
        elif len(matching) == 1:
            selected = matching[0]
            result = "matched_existing_future_type"
        else:
            selected = None
            result = "ambiguous_future_type"

        row["qutrub_result"] = result
        row["qutrub_past"] = candidates[0]["past"]
        row["past_match"] = str(comparable(candidates[0]["past"]) == comparable(current_past))
        if selected:
            row["qutrub_future_type"] = selected["future_type"]
            row["qutrub_present"] = selected["present"]
            row["qutrub_imperative"] = selected["imperative"]
            row["present_match"] = str(comparable(selected["present"]) == comparable(current_present))
            row["imperative_match"] = str(comparable(selected["imperative"]) == comparable(current_imperative))
            corrections = []
            if current_past and row["past_match"] == "False":
                corrections.append(f"past={selected['past']}")
            if current_present and row["present_match"] == "False":
                corrections.append(f"present={selected['present']}")
            if current_imperative and row["imperative_match"] == "False":
                corrections.append(f"imperative={selected['imperative']}")
            row["safe_corrections"] = "; ".join(corrections)
        rows.append(row)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    summary: dict[str, int] = {}
    for row in rows:
        summary[row["qutrub_result"]] = summary.get(row["qutrub_result"], 0) + 1
    print(json.dumps({"entries": len(rows), "results": summary}, ensure_ascii=False, indent=2))
    print(f"Created {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
