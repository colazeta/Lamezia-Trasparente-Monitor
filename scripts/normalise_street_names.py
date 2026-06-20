from __future__ import annotations

import csv
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

from utils import ROOT, relpath, write_csv


INTERIM_GEO_DIR = ROOT / "data" / "interim" / "geo"
RAW_GEO_DIR = ROOT / "data" / "raw" / "geo"
RULES_PATH = INTERIM_GEO_DIR / "electoral_street_rules_2025.csv"
ANNCSU_STRADARIO_PATH = RAW_GEO_DIR / "anncsu_lamezia_stradario_20260602.csv"
CROSSWALK_PATH = INTERIM_GEO_DIR / "anncsu_electoral_street_crosswalk_2025.csv"


CROSSWALK_HEADERS = [
    "street_name_normalised",
    "electoral_street_name_raw",
    "electoral_rule_count",
    "electoral_section_numbers",
    "anncsu_street_name_normalised",
    "anncsu_odonimo",
    "anncsu_progressivo_nazionale",
    "anncsu_total_accesses",
    "crosswalk_status",
    "match_method",
    "confidence",
    "notes",
]


def strip_accents(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    return "".join(ch for ch in value if not unicodedata.combining(ch))


def normalize_street_name(value: str) -> str:
    text = strip_accents(value).upper()
    text = text.replace("`", "'").replace("’", "'")
    text = re.sub(r"\bC\s*[./]?\s*DA\b", "CONTRADA", text)
    text = re.sub(r"\bCONTR\.\b", "CONTRADA", text)
    text = re.sub(r"\bLOC\s*\.\b", "LOCALITA", text)
    text = re.sub(r"\bTRAV\s*\.\b", "TRAVERSA", text)
    text = re.sub(r"\bF\s*\.\s*LLI\b", "FRATELLI", text)
    text = re.sub(r"\bV\.LE\b", "VIALE", text)
    text = re.sub(r"\bMONS\s*\.\b", "MONSIGNOR", text)
    text = re.sub(r"[\"'.,;:()]", " ", text)
    text = text.replace("|", "/")
    text = re.sub(r"\s*-\s*", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def abbreviation_signature(key: str) -> tuple[str, str] | None:
    tokens = street_name_tokens(key)
    if len(tokens) < 2:
        return None
    return tokens[-1], "".join(token[0] for token in tokens[:-1] if token)


def street_name_tokens(key: str) -> list[str]:
    tokens = key.split()
    if tokens and tokens[0] in {
        "ATRIO",
        "CONTRADA",
        "CORSO",
        "LARGO",
        "LARGHETTO",
        "LOCALITA",
        "PIAZZA",
        "RIONE",
        "SALITA",
        "SCESA",
        "TRAVERSA",
        "VIA",
        "VIALE",
        "VICO",
    }:
        tokens = tokens[1:]
    return tokens


def has_abbreviation_marker(key: str) -> bool:
    markers = {"GEN", "ING", "MAGG", "MONS"}
    return any(len(token) == 1 or token in markers for token in street_name_tokens(key))


def read_csv_flexible(path: Path) -> list[dict]:
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8-sig")
    sample = text[:20_000]
    try:
        delimiter = csv.Sniffer().sniff(sample, delimiters=";\t|,").delimiter
    except csv.Error:
        delimiter = ";"
    return list(csv.DictReader(text.splitlines(), delimiter=delimiter))


def compact_values(values: list[str], limit: int = 6) -> str:
    unique = sorted({value for value in values if value})
    if len(unique) <= limit:
        return "; ".join(unique)
    return "; ".join(unique[:limit]) + f"; ... (+{len(unique) - limit})"


def anncsu_index(rows: list[dict]) -> dict[str, list[dict]]:
    index: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        key = normalize_street_name(row.get("ODONIMO", ""))
        if key:
            index[key].append(row)
    return index


def anncsu_signature_index(anncsu_by_key: dict[str, list[dict]]) -> dict[tuple[str, str], list[str]]:
    index: dict[tuple[str, str], list[str]] = defaultdict(list)
    for key in anncsu_by_key:
        signature = abbreviation_signature(key)
        if signature:
            index[signature].append(key)
    return index


def row_for_match(
    *,
    key: str,
    rule_group: list[dict],
    anncsu_key: str,
    anncsu_matches: list[dict],
    status: str,
    method: str,
    confidence: str,
    notes: str,
) -> dict:
    sections = sorted({rule.get("section_number", "") for rule in rule_group}, key=lambda v: int(v or 0))
    raw_names = [rule.get("street_name_raw", "") for rule in rule_group]
    progressivi = [row.get("PROGRESSIVO_NAZIONALE", "") for row in anncsu_matches]
    odonimi = [row.get("ODONIMO", "") for row in anncsu_matches]
    accesses = sum(int(row.get("TOTALE_ACCESSI") or 0) for row in anncsu_matches)
    return {
        "street_name_normalised": key,
        "electoral_street_name_raw": compact_values(raw_names),
        "electoral_rule_count": str(len(rule_group)),
        "electoral_section_numbers": "; ".join(sections),
        "anncsu_street_name_normalised": anncsu_key,
        "anncsu_odonimo": compact_values(odonimi),
        "anncsu_progressivo_nazionale": compact_values(progressivi),
        "anncsu_total_accesses": str(accesses),
        "crosswalk_status": status,
        "match_method": method,
        "confidence": confidence,
        "notes": notes,
    }


def build_crosswalk() -> list[dict]:
    rules = read_csv_flexible(RULES_PATH)
    anncsu_rows = read_csv_flexible(ANNCSU_STRADARIO_PATH)
    if not rules:
        raise RuntimeError(f"Missing or empty electoral rules: {RULES_PATH}")
    if not anncsu_rows:
        raise RuntimeError(f"Missing or empty ANNCSU stradario extract: {ANNCSU_STRADARIO_PATH}")

    anncsu_by_key = anncsu_index(anncsu_rows)
    anncsu_by_signature = anncsu_signature_index(anncsu_by_key)
    grouped: dict[str, list[dict]] = defaultdict(list)
    for rule in rules:
        key = rule.get("street_name_normalised") or normalize_street_name(rule.get("street_name_raw", ""))
        if key:
            grouped[key].append(rule)

    rows: list[dict] = []
    for key in sorted(grouped):
        rule_group = grouped[key]
        anncsu_matches = anncsu_by_key.get(key, [])
        sections = sorted({rule.get("section_number", "") for rule in rule_group}, key=lambda v: int(v or 0))
        raw_names = [rule.get("street_name_raw", "") for rule in rule_group]
        if anncsu_matches:
            status = "matched"
            notes = ""
            confidence = "high"
            if len({row.get("ODONIMO", "") for row in anncsu_matches}) > 1:
                status = "matched_multiple_anncsu_rows"
                confidence = "medium"
                notes = "multiple ANNCSU stradario rows share the same normalized odonym"
            rows.append(row_for_match(
                key=key,
                rule_group=rule_group,
                anncsu_key=key,
                anncsu_matches=anncsu_matches,
                status=status,
                method="normalized_exact",
                confidence=confidence,
                notes=notes,
            ))
            continue

        signature = abbreviation_signature(key) if has_abbreviation_marker(key) else None
        signature_matches = anncsu_by_signature.get(signature, []) if signature else []
        if len(signature_matches) == 1:
            anncsu_key = signature_matches[0]
            rows.append(row_for_match(
                key=key,
                rule_group=rule_group,
                anncsu_key=anncsu_key,
                anncsu_matches=anncsu_by_key[anncsu_key],
                status="matched_abbreviation_unique",
                method="abbreviation_signature_unique",
                confidence="medium",
                notes="unique ANNCSU odonym match by final token plus preceding initials",
            ))
            continue

        rows.append(
            {
                "street_name_normalised": key,
                "electoral_street_name_raw": compact_values(raw_names),
                "electoral_rule_count": str(len(rule_group)),
                "electoral_section_numbers": "; ".join(sections),
                "anncsu_street_name_normalised": "",
                "anncsu_odonimo": "",
                "anncsu_progressivo_nazionale": "",
                "anncsu_total_accesses": "",
                "crosswalk_status": "unmatched",
                "match_method": "normalized_exact",
                "confidence": "review",
                "notes": "no exact normalized ANNCSU odonym match",
            }
        )

    return rows


def print_summary(rows: list[dict]) -> None:
    counts = Counter(row["crosswalk_status"] for row in rows)
    print("anncsu/electoral street crosswalk")
    print(f"rows={len(rows)}")
    for status, count in sorted(counts.items()):
        print(f"{status}={count}")
    print(f"crosswalk={CROSSWALK_PATH}")


def main() -> int:
    rows = build_crosswalk()
    write_csv(CROSSWALK_PATH, rows, CROSSWALK_HEADERS)
    print_summary(rows)
    unmatched = sum(1 for row in rows if row["crosswalk_status"] == "unmatched")
    if unmatched:
        print(f"unmatched_streets={unmatched} (kept for review; assignments will remain conservative)")
    print(f"relative_path={relpath(CROSSWALK_PATH)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
