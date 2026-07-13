"""Generate and strictly verify missing participles for regular imported verbs."""

from __future__ import annotations

import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

from camel_tools.morphology.analyzer import Analyzer
from camel_tools.morphology.database import MorphologyDB

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ROOTS_PATH = PROJECT_ROOT / "out" / "data" / "roots"
CACHE_PATH = PROJECT_ROOT / "exports" / "SarfMate-participle-qabas-cache.json"
EVIDENCE_PATH = PROJECT_ROOT / "exports" / "SarfMate-participle-evidence.json"
API = "https://ontology.birzeit.edu/sina/v2/api/QabasIndexLemmaSearch/{prefix}/all?apikey=qabasKey"
UNSAFE_ROOT_LETTERS = set("اوىيءأإؤئآة")
ENGLISH_SUFFIX = re.compile(r"\+.*$")
DIACRITICS = re.compile(r"[\u064b-\u065f\u0670\u0640]")
ENGLISH_WORD = re.compile(r"[a-z]+")
STOP_WORDS = {"a", "an", "be", "of", "on", "one", "the", "to", "who", "with"}
REJECTIONS = {("نفس-csv-413", "passive_participle")}

TEMPLATES = {
    "I": ("{f}َا{a}ِ{l}", "مَ{f}ْ{a}ُو{l}"),
    "II": ("مُ{f}َ{a}ِّ{l}", "مُ{f}َ{a}َّ{l}"),
    "III": ("مُ{f}َا{a}ِ{l}", "مُ{f}َا{a}َ{l}"),
    "IV": ("مُ{f}ْ{a}ِ{l}", "مُ{f}ْ{a}َ{l}"),
    "V": ("مُتَ{f}َ{a}ِّ{l}", "مُتَ{f}َ{a}َّ{l}"),
    "VI": ("مُتَ{f}َا{a}ِ{l}", "مُتَ{f}َا{a}َ{l}"),
    "VII": ("مُنْ{f}َ{a}ِ{l}", "مُنْ{f}َ{a}َ{l}"),
    "VIII": ("مُ{f}ْتَ{a}ِ{l}", "مُ{f}ْتَ{a}َ{l}"),
    "X": ("مُسْتَ{f}ْ{a}ِ{l}", "مُسْتَ{f}ْ{a}َ{l}"),
}


def strip_arabic(value: str) -> str:
    return DIACRITICS.sub("", value).replace("ٱ", "ا").strip()


def comparable(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value).replace("ـ", "").replace("ٱ", "ا")
    clusters: list[str] = []
    for character in normalized:
        if unicodedata.combining(character) and clusters:
            clusters[-1] += character
        else:
            clusters.append(character)
    if clusters:
        clusters[-1] = clusters[-1][0]
    return "".join(cluster[:1] + "".join(sorted(cluster[1:])) for cluster in clusters)


def semantic_keys(value: str) -> set[str]:
    return {
        word[:5] if len(word) >= 5 else word
        for word in ENGLISH_WORD.findall(value.lower().replace("_", " "))
        if word not in STOP_WORDS and len(word) >= 4
    }


def entries(roots: list[dict]):
    for root in roots:
        yield root, f"{root['root']}-main", root
        for variant in root.get("variants", []):
            yield root, variant["id"], variant


def fetch(prefix: str) -> dict:
    url = API.format(prefix=urllib.parse.quote(prefix))
    request = urllib.request.Request(url, headers={"User-Agent": "SarfMate lexical verification/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def clean_gloss(value: str) -> str:
    values = []
    for part in re.split(r"[;_]", ENGLISH_SUFFIX.sub("", value)):
        cleaned = part.strip().replace("-", " ")
        if cleaned and cleaned not in values:
            values.append(cleaned)
    return "; ".join(values)


def main() -> None:
    roots = json.loads(ROOTS_PATH.read_text(encoding="utf-8"))
    analyzer = Analyzer(MorphologyDB.builtin_db("calima-msa-r13"))
    targets = []
    for root, entry_id, entry in entries(roots):
        if not entry.get("source") or entry.get("measure") not in TEMPLATES:
            continue
        letters = list(root["root"])
        if len(letters) != 3 or any(letter in UNSAFE_ROOT_LETTERS for letter in letters):
            continue
        meaning = next((f.get("meaningEn", "") for f in entry["forms"] if f["key"] == "past"), "")
        active, passive = TEMPLATES[entry["measure"]]
        for form_key, template in (("active_participle", active), ("passive_participle", passive)):
            current = next(f for f in entry["forms"] if f["key"] == form_key)
            if current.get("reviewState") != "pending" or current.get("arabic"):
                continue
            candidate = template.format(f=letters[0], a=letters[1], l=letters[2])
            stripped = strip_arabic(candidate)
            targets.append({
                "root": root["root"], "entryId": entry_id, "formKey": form_key,
                "measure": entry["measure"], "meaning": meaning, "candidate": candidate,
                "stripped": stripped, "prefix": "".join(list(stripped)[:3]),
            })

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

    evidence = []
    for target in targets:
        calima = []
        for analysis in analyzer.analyze(target["stripped"]):
            if analysis.get("pos") not in {"noun", "adj"}:
                continue
            if comparable(analysis.get("lex", "")) != comparable(target["candidate"]):
                continue
            gloss = clean_gloss(analysis.get("gloss", ""))
            if semantic_keys(target["meaning"]) & semantic_keys(gloss):
                calima.append({"lemma": analysis["lex"], "pos": analysis["pos"], "gloss": gloss})
        qabas = []
        for result in cache[target["prefix"]].get("resp", []):
            fields = result.get("fields", {})
            if fields.get("Status") != "Reviewed" or fields.get("pos_en") != "noun":
                continue
            for lemma in fields.get("lemma", "").split("|"):
                if comparable(lemma) == comparable(target["candidate"]):
                    qabas.append(lemma.strip())
        glosses = sorted({item["gloss"] for item in calima if item["gloss"]})
        calima_meaning_match = bool(calima and len(glosses) == 1)
        verified = bool(
            (qabas or calima_meaning_match)
            and (target["entryId"], target["formKey"]) not in REJECTIONS
        )
        verification_tier = (
            "qabas_calima_meaning" if verified and qabas and calima_meaning_match
            else "qabas_regular_pattern" if verified
            and qabas
            else "calima_meaning" if verified and calima_meaning_match
            else None
        )
        evidence.append({**target, "calima": calima, "qabas": sorted(set(qabas)),
                         "verified": verified, "verificationTier": verification_tier,
                         "meaningEn": glosses[0] if verification_tier in {"qabas_calima_meaning", "calima_meaning"}
                         else target["meaning"] if verified else None})

    EVIDENCE_PATH.write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf-8")
    verified = [item for item in evidence if item["verified"]]
    print(f"Regular candidates checked: {len(evidence)}")
    print(f"Strictly verified participles: {len(verified)}")
    print(f"Entries covered: {len({item['entryId'] for item in verified})}")


if __name__ == "__main__":
    main()
