"""Generate the checked-in map of strictly verified generated participles."""

from __future__ import annotations

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
EVIDENCE_PATH = PROJECT_ROOT / "exports" / "SarfMate-participle-evidence.json"
QUTRUB_EVIDENCE_PATH = PROJECT_ROOT / "exports" / "SarfMate-qutrub-participle-evidence.json"
OUTPUT_PATH = PROJECT_ROOT / "src" / "data" / "participleVerification.ts"


def main() -> None:
    evidence = json.loads(EVIDENCE_PATH.read_text(encoding="utf-8"))
    if QUTRUB_EVIDENCE_PATH.exists():
        evidence.extend(json.loads(QUTRUB_EVIDENCE_PATH.read_text(encoding="utf-8")))
    verified: dict[str, dict[str, dict[str, str]]] = {}
    for item in evidence:
        if item.get("verified"):
            verified.setdefault(item["entryId"], {})[item["formKey"]] = {
                "arabic": item["candidate"],
                "meaningEn": item["meaningEn"],
            }

    lines = [
        'import type { SarfFormKey } from "@/lib/types";',
        "",
        "type VerifiedParticiple = { arabic: string; meaningEn: string };",
        "type VerifiedParticiples = Partial<Record<SarfFormKey, VerifiedParticiple>>;",
        "",
        "/** Regular participles independently matched by Qabas and CALIMA-MSA. */",
        "export const PARTICIPLE_VERIFIED_FORMS: Readonly<Record<string, VerifiedParticiples>> = {",
    ]
    for entry_id, forms in sorted(verified.items()):
        fields = ", ".join(
            f"{json.dumps(key)}: {json.dumps(value, ensure_ascii=False)}"
            for key, value in forms.items()
        )
        lines.append(f"  {json.dumps(entry_id, ensure_ascii=False)}: {{ {fields} }},")
    lines.extend(["};", ""])
    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Recorded {sum(map(len, verified.values()))} participles across {len(verified)} entries.")


if __name__ == "__main__":
    main()
