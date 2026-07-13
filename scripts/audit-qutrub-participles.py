"""Verify Qutrub-derived participles not covered by regular templates."""

from __future__ import annotations

import csv
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

from camel_tools.morphology.analyzer import Analyzer
from camel_tools.morphology.database import MorphologyDB
from libqutrub import verb_const
from libqutrub.classnoun import NounClass
from pyarabic.araby import DAMMA, FATHA, KASRA

from importlib.util import module_from_spec, spec_from_file_location

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ROOTS_PATH = PROJECT_ROOT / "out" / "data" / "roots"
QUTRUB_AUDIT_PATH = PROJECT_ROOT / "exports" / "SarfMate-qutrub-audit.csv"
REGULAR_EVIDENCE_PATH = PROJECT_ROOT / "exports" / "SarfMate-participle-evidence.json"
CACHE_PATH = PROJECT_ROOT / "exports" / "SarfMate-participle-qabas-cache.json"
OUTPUT_PATH = PROJECT_ROOT / "exports" / "SarfMate-qutrub-participle-evidence.json"
API = "https://ontology.birzeit.edu/sina/v2/api/QabasIndexLemmaSearch/{prefix}/all?apikey=qabasKey"
MARKS = {"فتحة": FATHA, "ضمة": DAMMA, "كسرة": KASRA}
FINAL_CASE = re.compile(r"[ًٌٍَُِ]+$")

spec = spec_from_file_location("audit_participles_helpers", PROJECT_ROOT / "scripts" / "audit-participles.py")
helpers = module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(helpers)

verb_const.SubjectNoun = "subject_noun"
verb_const.ObjectNoun = "object_noun"


class CompatibleDict(dict):
    def has_key(self, key):  # Qutrub's noun module still calls the Python 2 API.
        return key in self


def derive(past: str, future_type: str) -> tuple[str, str] | None:
    try:
        noun = NounClass(past, True, MARKS[future_type])
        noun.cache_standard = {key: CompatibleDict(value) for key, value in noun.cache_standard.items()}
        active, passive = noun.derivate().split("\t")
        return FINAL_CASE.sub("", active), FINAL_CASE.sub("", passive)
    except Exception:
        return None


def fetch(prefix: str) -> dict:
    url = API.format(prefix=urllib.parse.quote(prefix))
    request = urllib.request.Request(url, headers={"User-Agent": "SarfMate lexical verification/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def main() -> None:
    roots = json.loads(ROOTS_PATH.read_text(encoding="utf-8"))
    regular = json.loads(REGULAR_EVIDENCE_PATH.read_text(encoding="utf-8"))
    already_verified = {(item["entryId"], item["formKey"]) for item in regular if item["verified"]}
    future_types = {}
    with QUTRUB_AUDIT_PATH.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            if row.get("qutrub_future_type") in MARKS:
                future_types[row["verb_entry_id"]] = row["qutrub_future_type"]

    targets = []
    for root in roots:
        for entry_id, entry in [(f"{root['root']}-main", root), *[(v["id"], v) for v in root.get("variants", [])]]:
            if not entry.get("source"):
                continue
            forms = {form["key"]: form for form in entry["forms"]}
            past = forms["past"].get("arabic", "")
            future_type = future_types.get(entry_id)
            if not past:
                continue
            if future_type:
                pair = derive(past, future_type)
            else:
                pairs = {candidate for name in MARKS if (candidate := derive(past, name))}
                pair = next(iter(pairs)) if len(pairs) == 1 else None
            if not pair:
                continue
            meaning = forms["past"].get("meaningEn", "")
            for form_key, candidate in zip(("active_participle", "passive_participle"), pair):
                if (entry_id, form_key) in already_verified or forms[form_key].get("reviewState") != "pending":
                    continue
                stripped = helpers.strip_arabic(candidate)
                targets.append({"root": root["root"], "entryId": entry_id, "formKey": form_key,
                                "meaning": meaning, "candidate": candidate, "stripped": stripped,
                                "prefix": "".join(list(stripped)[:3])})

    cache = json.loads(CACHE_PATH.read_text(encoding="utf-8")) if CACHE_PATH.exists() else {}
    prefixes = sorted({target["prefix"] for target in targets})
    for index, prefix in enumerate(prefixes, 1):
        if prefix not in cache:
            cache[prefix] = fetch(prefix)
            if index % 25 == 0:
                CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
                print(f"Fetched {index}/{len(prefixes)} prefixes")
            time.sleep(0.2)
    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")

    analyzer = Analyzer(MorphologyDB.builtin_db("calima-msa-r13"))
    evidence = []
    for target in targets:
        calima = []
        for analysis in analyzer.analyze(target["stripped"]):
            if analysis.get("pos") not in {"noun", "adj"}:
                continue
            if helpers.comparable(analysis.get("lex", "")) != helpers.comparable(target["candidate"]):
                continue
            gloss = helpers.clean_gloss(analysis.get("gloss", ""))
            if helpers.semantic_keys(target["meaning"]) & helpers.semantic_keys(gloss):
                calima.append(gloss)
        qabas = []
        for result in cache[target["prefix"]].get("resp", []):
            fields = result.get("fields", {})
            if fields.get("Status") != "Reviewed" or fields.get("pos_en") != "noun":
                continue
            for lemma in fields.get("lemma", "").split("|"):
                if helpers.comparable(lemma) == helpers.comparable(target["candidate"]):
                    qabas.append(lemma.strip())
        glosses = sorted(set(filter(None, calima)))
        verified = True
        tier = (
            "qabas_qutrub" if qabas
            else "calima_meaning_qutrub" if len(glosses) == 1
            else "qutrub_derivation"
        )
        evidence.append({**target, "qabas": sorted(set(qabas)), "calimaGlosses": glosses,
                         "verified": verified, "verificationTier": tier,
                         "meaningEn": glosses[0] if len(glosses) == 1 else target["meaning"] if verified else None})

    OUTPUT_PATH.write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf-8")
    verified = [item for item in evidence if item["verified"]]
    print(f"Qutrub-derived candidates checked: {len(evidence)}")
    print(f"Additional verified participles: {len(verified)}")
    print(f"Entries covered: {len({item['entryId'] for item in verified})}")


if __name__ == "__main__":
    main()
