"""Strictly cross-check disputed Qabas forms with CALIMA-MSA.

A correction is accepted only when Qabas and CALIMA agree on one fully
vowelled nominal lemma with the same undiacritized spelling. This deliberately
rejects verbs and ambiguous homographs.
"""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

from camel_tools.morphology.analyzer import Analyzer
from camel_tools.morphology.database import MorphologyDB


PROJECT_ROOT = Path(__file__).resolve().parents[1]
QABAS_PATH = PROJECT_ROOT / "exports" / "SarfMate-qabas-evidence.json"
ROOTS_PATH = PROJECT_ROOT / "out" / "data" / "roots"
OUTPUT_PATH = PROJECT_ROOT / "exports" / "SarfMate-calima-evidence.json"
DIACRITICS = re.compile(r"[\u064b-\u065f\u0670\u0640]")
SENSE_NUMBER = re.compile(r"\d+$")
NOMINAL_POS = {"adj", "noun", "noun_prop"}
SHORT_VOWELS = re.compile(r"[\u064b-\u0650\u0652\u0670]")
SEMANTIC_REJECTIONS = {
    "حدث-csv-265",  # “updating” does not support the imported “to speak” sense.
    "صلح-csv-204",  # صُلْح is reconciliation, not “to be righteous”.
    "حرم-csv-360",  # حَرام is not a verbal noun for this entry.
    "شوك-main",  # شَوِك is “thorny”, not the intended verbal noun “pricking”.
}
PARTICIPLE_REJECTIONS = {
    "جيء-main",  # مَجِيء is a verbal noun (“arrival”), not a passive participle.
}
ENGLISH_WORD = re.compile(r"[a-z]+")
STOP_WORDS = {"a", "an", "be", "of", "on", "one", "the", "to", "who", "with"}
VOWEL_MARKS = set("ًٌٍَُِْ")


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
    if clusters:
        clusters[-1] = clusters[-1][0] + "".join(
            mark for mark in clusters[-1][1:] if mark not in ("َ", "ُ", "ِ", "ً", "ٌ", "ٍ")
        )
    return "".join(cluster[:1] + "".join(sorted(cluster[1:])) for cluster in clusters)


def citation_form(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    clusters: list[str] = []
    for character in normalized:
        if unicodedata.combining(character) and clusters:
            clusters[-1] += character
        else:
            clusters.append(character)
    if clusters:
        clusters[-1] = clusters[-1][0] + "".join(
            mark for mark in clusters[-1][1:] if mark not in ("َ", "ُ", "ِ", "ً", "ٌ", "ٍ")
        )
    return unicodedata.normalize("NFC", "".join(clusters))


def semantic_keys(value: str) -> set[str]:
    keys = set()
    for word in ENGLISH_WORD.findall(value.lower().replace("_", " ")):
        if word in STOP_WORDS or len(word) < 4:
            continue
        keys.add(word[:5] if len(word) >= 5 else word)
    return keys


def diacritic_compatible(left: str, right: str) -> bool:
    def clusters(value: str) -> list[tuple[str, set[str]]]:
        result: list[tuple[str, set[str]]] = []
        for character in unicodedata.normalize("NFD", value).replace("ـ", "").replace("ٱ", "ا"):
            if unicodedata.combining(character) and result:
                result[-1][1].add(character)
            else:
                result.append((character, set()))
        if result:
            result[-1][1].difference_update(VOWEL_MARKS)
        return result

    left_clusters = clusters(left)
    right_clusters = clusters(right)
    if [cluster[0] for cluster in left_clusters] != [cluster[0] for cluster in right_clusters]:
        return False
    for (_, left_marks), (_, right_marks) in zip(left_clusters, right_clusters):
        left_vowels = left_marks & VOWEL_MARKS
        right_vowels = right_marks & VOWEL_MARKS
        if left_vowels and right_vowels and left_vowels != right_vowels:
            return False
        if "ّ" in left_marks and right_marks and "ّ" not in right_marks:
            return False
        if "ّ" in right_marks and left_marks and "ّ" not in left_marks:
            return False
    return True


def has_participle_shape(form_key: str, value: str) -> bool:
    letters = strip_arabic(value)
    if form_key == "passive_participle":
        return letters.startswith("م")
    if form_key == "active_participle":
        return letters.startswith("م") or (len(letters) > 1 and letters[1] == "ا")
    return False


def main() -> None:
    analyzer = Analyzer(MorphologyDB.builtin_db("calima-msa-r13"))
    qabas_items = json.loads(QABAS_PATH.read_text(encoding="utf-8"))
    roots = json.loads(ROOTS_PATH.read_text(encoding="utf-8"))
    contexts = {}
    for root in roots:
        for entry_id, entry in [(f"{root['root']}-main", root), *[(v["id"], v) for v in root.get("variants", [])]]:
            contexts[entry_id] = {
                "imported": bool(entry.get("source")),
                "meanings": {form["key"]: form.get("meaningEn", "") for form in entry.get("forms", [])},
            }
    evidence = []

    for item in qabas_items:
        nominal_qabas = {
            comparable(match["lemma"]): citation_form(match["lemma"])
            for match in item.get("matches", [])
            if match.get("partOfSpeech") == "noun"
        }
        analyses = analyzer.analyze(item["stripped"])
        allowed_pos = {"noun", "noun_prop"} if item["formKey"] == "place_or_mim_masdar" else NOMINAL_POS
        nominal_calima = {
            comparable(analysis["lex"]): {
                "lemma": citation_form(analysis["lex"]),
                "partOfSpeech": analysis.get("pos"),
                "gloss": analysis.get("gloss", ""),
            }
            for analysis in analyses
            if analysis.get("pos") in allowed_pos and analysis.get("lex")
        }
        agreed_keys = sorted(set(nominal_qabas) & set(nominal_calima))
        agreed = [nominal_calima[key] for key in agreed_keys]
        agreed_key = agreed_keys[0] if len(agreed_keys) == 1 else None
        # Prefer Qabas's conventional citation spelling once both sources agree.
        source_agreement = nominal_qabas[agreed_key] if agreed_key else None
        context = contexts.get(item["entryId"], {"imported": False, "meanings": {}})
        meaning = context["meanings"].get(item["formKey"], "")
        agreed_gloss = agreed[0].get("gloss", "") if len(agreed) == 1 else ""
        semantic_match = bool(semantic_keys(meaning) & semantic_keys(agreed_gloss))
        # Imported CSV entries store their verbal noun in this slot. Restrict
        # automatic spelling changes to forms that have not yet been vowelled;
        # a disagreement with an already-vowelled form needs semantic review.
        safe_to_correct = (
            context["imported"]
            and item["formKey"] == "place_or_mim_masdar"
            and not SHORT_VOWELS.search(item["arabic"])
            and semantic_match
            and item["entryId"] not in SEMANTIC_REJECTIONS
        )
        strict_correction = source_agreement if safe_to_correct else None
        compatible_participle = (
            item["formKey"] in {"active_participle", "passive_participle"}
            and bool(source_agreement)
            and semantic_match
            and diacritic_compatible(item["arabic"], source_agreement)
            and has_participle_shape(item["formKey"], item["arabic"])
            and item["entryId"] not in PARTICIPLE_REJECTIONS
        )
        evidence.append(
            {
                **item,
                "qabasNominalLemmas": sorted(set(nominal_qabas.values())),
                "calimaNominalAnalyses": list(nominal_calima.values()),
                "agreedAnalyses": agreed,
                "sourceAgreement": source_agreement,
                "meaning": meaning,
                "semanticMatch": semantic_match,
                "safeToCorrect": safe_to_correct,
                "strictCorrection": strict_correction,
                "compatibleParticiple": compatible_participle,
                "verifiedArabic": strict_correction or (item["arabic"] if compatible_participle else None),
                "changesCurrentForm": bool(
                    strict_correction and comparable(strict_correction) != comparable(item["arabic"])
                ),
            }
        )

    OUTPUT_PATH.write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf-8")
    corrected = [item for item in evidence if item["changesCurrentForm"]]
    already_exact = [
        item
        for item in evidence
        if item["strictCorrection"] and not item["changesCurrentForm"]
    ]
    ambiguous = [item for item in evidence if len(item["agreedAnalyses"]) > 1]
    print(f"Strict corrections: {len(corrected)}")
    print(f"Strict agreements already exact: {len(already_exact)}")
    print(f"Ambiguous source agreements rejected: {len(ambiguous)}")
    print(f"No unique source agreement: {len(evidence) - len(corrected) - len(already_exact)}")


if __name__ == "__main__":
    main()
