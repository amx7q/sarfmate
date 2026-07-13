"""Generate corrections jointly verified by Qabas and CALIMA."""

from __future__ import annotations

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
EVIDENCE_PATH = PROJECT_ROOT / "exports" / "SarfMate-calima-evidence.json"
OUTPUT_PATH = PROJECT_ROOT / "src" / "data" / "calimaVerification.ts"


def main() -> None:
    evidence = json.loads(EVIDENCE_PATH.read_text(encoding="utf-8"))
    verified: dict[str, dict[str, str]] = {}
    for item in evidence:
        if item.get("verifiedArabic"):
            verified.setdefault(item["entryId"], {})[item["formKey"]] = item["verifiedArabic"]

    lines = [
        'import type { SarfFormKey } from "@/lib/types";',
        "",
        "type VerifiedForms = Partial<Record<SarfFormKey, string>>;",
        "",
        "/** Corrections where reviewed Qabas and CALIMA-MSA uniquely agree. */",
        "export const CALIMA_VERIFIED_FORMS: Readonly<Record<string, VerifiedForms>> = {",
    ]
    for entry_id, forms in sorted(verified.items()):
        fields = ", ".join(
            f"{json.dumps(key)}: {json.dumps(arabic, ensure_ascii=False)}"
            for key, arabic in forms.items()
        )
        lines.append(f"  {json.dumps(entry_id, ensure_ascii=False)}: {{ {fields} }},")
    lines.extend(["};", ""])
    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Recorded {sum(map(len, verified.values()))} strict corrections across {len(verified)} entries.")


if __name__ == "__main__":
    main()
