"""Strictly cross-check unresolved participles with ElixirFM's public derive interface."""

from __future__ import annotations

import html
import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ROOTS_PATH = PROJECT_ROOT / "out" / "data" / "roots"
CACHE_PATH = PROJECT_ROOT / "exports" / "SarfMate-elixirfm-cache.json"
OUTPUT_PATH = PROJECT_ROOT / "exports" / "SarfMate-elixirfm-evidence.json"
API = "https://quest.ms.mff.cuni.cz/cgi-bin/elixir/index.fcgi"
FORM_KEYS = ("active_participle", "passive_participle")
TAG_BY_FORM = {"active_participle": "A--A------", "passive_participle": "A--P------"}
DIACRITICS = re.compile(r"[\u064b-\u065f\u0670\u0640]")
ENGLISH_WORD = re.compile(r"[a-z]+")
STOP_WORDS = {"a", "an", "be", "of", "on", "one", "the", "to", "who", "with"}
LEXEME = re.compile(
    r'<table[^>]+class="lexeme"[^>]*><tr>(?P<head>.*?)</tr></table>\s*'
    r'<ul><li><table[^>]*>(?P<derived>.*?)</table>',
    re.S,
)
CELL = re.compile(r'<td class="(?P<class>[^"]+)"[^>]*>(?P<value>.*?)</td>', re.S)
ROW = re.compile(r"<tr>(.*?)</tr>", re.S)


def plain(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", value)).strip()


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
        for word in ENGLISH_WORD.findall(value.lower())
        if word not in STOP_WORDS and len(word) >= 4
    }


def cells(fragment: str) -> dict[str, str]:
    return {match.group("class"): plain(match.group("value")) for match in CELL.finditer(fragment)}


def parse_lexemes(content: str) -> list[dict]:
    lexemes = []
    for match in LEXEME.finditer(content):
        head = cells(match.group("head"))
        if head.get("xtag") != "V":
            continue
        derived: dict[str, set[str]] = {key: set() for key in FORM_KEYS}
        for row in ROW.finditer(match.group("derived")):
            values = cells(row.group(1))
            for form_key, tag in TAG_BY_FORM.items():
                if values.get("xtag") == tag and values.get("orth"):
                    derived[form_key].add(values["orth"])
        lexemes.append({
            "citation": head.get("orth", ""),
            "measure": head.get("class", ""),
            "gloss": head.get("reflex", ""),
            "derived": {key: sorted(values) for key, values in derived.items()},
        })
    return lexemes


def fetch(past: str) -> str:
    body = urllib.parse.urlencode({
        "mode": "derive",
        "text": "active participle passive participle",
        "clip": past,
        "submit": "Derive",
    }).encode()
    request = urllib.request.Request(
        API,
        data=body,
        headers={"User-Agent": "SarfMate lexical verification/1.0"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read().decode("utf-8")


def entries(roots: list[dict]):
    for root in roots:
        yield root, f"{root['root']}-main", root
        for variant in root.get("variants", []):
            yield root, variant["id"], variant


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    roots = json.loads(ROOTS_PATH.read_text(encoding="utf-8"))
    targets = []
    for root, entry_id, entry in entries(roots):
        if not entry.get("source"):
            continue
        forms = {form["key"]: form for form in entry["forms"]}
        past = forms["past"].get("arabic", "")
        if not past:
            continue
        for form_key in FORM_KEYS:
            if forms[form_key].get("reviewState") == "pending":
                targets.append({
                    "root": root["root"],
                    "entryId": entry_id,
                    "formKey": form_key,
                    "measure": entry["measure"],
                    "meaning": forms["past"].get("meaningEn", entry["meaningEn"]),
                    "past": past,
                })

    cache = json.loads(CACHE_PATH.read_text(encoding="utf-8")) if CACHE_PATH.exists() else {}
    past_forms = sorted({target["past"] for target in targets})
    for index, past in enumerate(past_forms, 1):
        if past not in cache:
            cache[past] = parse_lexemes(fetch(past))
            CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
            print(f"Fetched {index}/{len(past_forms)}: {past}")
            time.sleep(0.5)

    evidence = []
    for target in targets:
        matches = [
            item for item in cache.get(target["past"], [])
            if strip_arabic(item["citation"]) == strip_arabic(target["past"])
            and item["measure"] == target["measure"]
        ]
        meaning_keys = semantic_keys(target["meaning"])
        semantic_matches = [item for item in matches if meaning_keys & semantic_keys(item["gloss"])]
        preferred = semantic_matches
        candidates = {
            comparable(candidate)
            for item in preferred
            for candidate in item["derived"].get(target["formKey"], [])
            if candidate
        }
        display_candidates = sorted({
            candidate
            for item in preferred
            for candidate in item["derived"].get(target["formKey"], [])
            if candidate and comparable(candidate) in candidates
        })
        verified = bool(semantic_matches) and len(candidates) == 1 and len(display_candidates) >= 1
        evidence.append({
            **target,
            "candidate": display_candidates[0] if verified else None,
            "lexemeMatches": preferred,
            "verified": verified,
            "verificationTier": (
                "elixirfm_exact_lemma_measure_meaning" if verified else None
            ),
            "sourceUrl": API,
        })

    OUTPUT_PATH.write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf-8")
    verified = [item for item in evidence if item["verified"]]
    print(f"Unresolved participles checked: {len(evidence)}")
    print(f"Strictly verified by ElixirFM: {len(verified)}")
    print(f"Entries covered: {len({item['entryId'] for item in verified})}")


if __name__ == "__main__":
    main()
