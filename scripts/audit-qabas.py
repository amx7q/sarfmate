"""Verify SarfMate derived forms against Birzeit University's Qabas lexicon."""

from __future__ import annotations

import json
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
ROOTS_PATH = PROJECT_ROOT / "out" / "data" / "roots"
CACHE_PATH = PROJECT_ROOT / "exports" / "SarfMate-qabas-cache.json"
EVIDENCE_PATH = PROJECT_ROOT / "exports" / "SarfMate-qabas-evidence.json"
FORM_KEYS = {"place_or_mim_masdar", "active_participle", "passive_participle"}
API = "https://ontology.birzeit.edu/sina/v2/api/QabasIndexLemmaSearch/{prefix}/all?apikey=qabasKey"
DIACRITICS = re.compile(r"[\u064b-\u065f\u0670\u0640]")
SENSE_NUMBER = re.compile(r"\d+$")


def strip_arabic(value: str) -> str:
    return DIACRITICS.sub("", value).replace("ٱ", "ا").strip()


def comparable(value: str) -> str:
    value = SENSE_NUMBER.sub("", value.strip())
    normalized = unicodedata.normalize("NFD", value).replace("ـ", "").replace("ٱ", "ا")
    clusters: list[str] = []
    for character in normalized:
        if unicodedata.combining(character) and clusters:
            clusters[-1] += character
        else:
            clusters.append(character)
    # Ignore nominative citation endings; Qabas commonly includes them while SarfMate may not.
    if clusters and any(mark in clusters[-1][1:] for mark in ("ُ", "ٌ")):
        clusters[-1] = clusters[-1][0] + "".join(
            mark for mark in clusters[-1][1:] if mark not in ("ُ", "ٌ")
        )
    return "".join(cluster[:1] + "".join(sorted(cluster[1:])) for cluster in clusters)


def entries(roots: list[dict]):
    for root in roots:
        yield root, f"{root['root']}-main", root
        for variant in root.get("variants", []):
            yield root, variant["id"], variant


def fetch_prefix(prefix: str) -> dict:
    url = API.format(prefix=urllib.parse.quote(prefix))
    request = urllib.request.Request(url, headers={"User-Agent": "SarfMate lexical verification/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def main() -> None:
    roots = json.loads(ROOTS_PATH.read_text(encoding="utf-8"))
    targets = []
    for root, entry_id, entry in entries(roots):
        for form in entry.get("forms", []):
            if form["key"] not in FORM_KEYS or not form.get("arabic"):
                continue
            stripped = strip_arabic(form["arabic"])
            targets.append(
                {
                    "root": root["root"],
                    "entryId": entry_id,
                    "formKey": form["key"],
                    "arabic": form["arabic"],
                    "stripped": stripped,
                    "prefix": "".join(list(stripped)[:3]),
                }
            )

    cache = json.loads(CACHE_PATH.read_text(encoding="utf-8")) if CACHE_PATH.exists() else {}
    prefixes = sorted({target["prefix"] for target in targets})
    for index, prefix in enumerate(prefixes, 1):
        if prefix in cache:
            continue
        try:
            cache[prefix] = fetch_prefix(prefix)
        except urllib.error.HTTPError as error:
            if error.code == 429:
                CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
                raise SystemExit(f"Qabas rate-limited at {index}/{len(prefixes)}; saved resumable cache.")
            cache[prefix] = {"error": f"HTTP {error.code}"}
        except Exception as error:
            cache[prefix] = {"error": str(error)}
        if index % 25 == 0:
            CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
            print(f"Fetched {index}/{len(prefixes)} prefixes")
        time.sleep(0.2)
    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")

    evidence = []
    for target in targets:
        response = cache.get(target["prefix"], {})
        matches = []
        for result in response.get("resp", []):
            fields = result.get("fields", {})
            if fields.get("Status") != "Reviewed":
                continue
            for lemma in fields.get("lemma", "").split("|"):
                if strip_arabic(lemma) == target["stripped"]:
                    matches.append(
                        {
                            "lemmaId": result.get("pk"),
                            "lemma": lemma.strip(),
                            "partOfSpeech": fields.get("pos_en"),
                            "nounType": fields.get("noun_type_ar"),
                            "exactVowelMatch": comparable(lemma) == comparable(target["arabic"]),
                        }
                    )
        evidence.append({**target, "matches": matches})

    EVIDENCE_PATH.write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Checked {len(targets)} derived forms using {len(prefixes)} cached prefixes.")
    print(f"Reviewed lemma matches: {sum(bool(item['matches']) for item in evidence)}")
    print(f"Exact vowel matches: {sum(any(match['exactVowelMatch'] for match in item['matches']) for item in evidence)}")


if __name__ == "__main__":
    main()
