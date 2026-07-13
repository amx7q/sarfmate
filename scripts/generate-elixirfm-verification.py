"""Generate the compact runtime map from strictly accepted ElixirFM evidence."""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
EVIDENCE_PATH = PROJECT_ROOT / "exports" / "SarfMate-elixirfm-evidence.json"
OUTPUT_PATH = PROJECT_ROOT / "src" / "data" / "elixirfmVerification.ts"


def main() -> None:
    evidence = json.loads(EVIDENCE_PATH.read_text(encoding="utf-8"))
    verified: dict[str, dict[str, dict[str, str]]] = defaultdict(dict)
    for item in evidence:
        if not item.get("verified") or not item.get("candidate"):
            continue
        verified[item["entryId"]][item["formKey"]] = {
            "arabic": item["candidate"],
            "meaningEn": item["meaning"],
        }

    lines = [
        'import type { SarfFormKey } from "@/lib/types";',
        "",
        "type VerifiedDerivedForm = { arabic: string; meaningEn: string };",
        "",
        "// Generated from exports/SarfMate-elixirfm-evidence.json.",
        "export const ELIXIRFM_VERIFIED_FORMS: Readonly<Record<",
        "  string,",
        "  Partial<Record<SarfFormKey, VerifiedDerivedForm>>",
        ">> = " + json.dumps(verified, ensure_ascii=False, indent=2) + ";",
        "",
    ]
    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Generated {sum(len(forms) for forms in verified.values())} verified forms across {len(verified)} entries.")


if __name__ == "__main__":
    main()
