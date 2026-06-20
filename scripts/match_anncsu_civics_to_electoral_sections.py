from __future__ import annotations

import csv
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

from normalise_street_names import normalize_street_name, read_csv_flexible
from utils import PROCESSED_DIR, ROOT, write_csv


ELECTION_ID = "comunali_lamezia_2025"
RAW_GEO_DIR = ROOT / "data" / "raw" / "geo"
INTERIM_GEO_DIR = ROOT / "data" / "interim" / "geo"
QA_DIR = ROOT / "data" / "interim" / "qa"
INDIRIZZARIO_PATH = RAW_GEO_DIR / "anncsu_lamezia_indirizzario_20260602.csv"
RULES_PATH = INTERIM_GEO_DIR / "electoral_street_rules_2025.csv"
CROSSWALK_PATH = INTERIM_GEO_DIR / "anncsu_electoral_street_crosswalk_2025.csv"
OUTPUT_PATH = PROCESSED_DIR / "geo" / "anncsu_lamezia_civics_with_electoral_section_2025.csv"
REVIEW_QUEUE_PATH = QA_DIR / "anncsu_electoral_assignment_review_queue_2025.csv"


ASSIGNMENT_COLUMNS = [
    "election_id",
    "street_name_normalised",
    "anncsu_civic_number",
    "anncsu_is_snc",
    "section_number",
    "rule_id",
    "assignment_method",
    "assignment_confidence",
    "assignment_status",
    "assignment_notes",
]


REVIEW_HEADERS = [
    "review_id",
    "reason",
    "election_id",
    "anncsu_progressivo_accesso",
    "anncsu_odonimo",
    "street_name_normalised",
    "civico",
    "esponente",
    "progressivo_snc",
    "candidate_rule_ids",
    "candidate_sections",
    "review_notes",
]


def civic_number(value: str) -> int | None:
    match = re.search(r"\d+", value or "")
    if not match:
        return None
    return int(match.group(0))


def is_snc(row: dict) -> bool:
    return not (row.get("CIVICO") or "").strip() and bool((row.get("PROGRESSIVO_SNC") or "").strip())


def civic_parity(number: int | None) -> str:
    if number is None:
        return ""
    return "even" if number % 2 == 0 else "odd"


def load_crosswalk_status() -> dict[str, str]:
    return {
        (row.get("anncsu_street_name_normalised") or row.get("street_name_normalised", "")): row.get("crosswalk_status", "")
        for row in read_csv_flexible(CROSSWALK_PATH)
    }


def load_crosswalk_rules() -> dict[str, list[dict]]:
    mapping: dict[str, list[dict]] = defaultdict(list)
    for row in read_csv_flexible(CROSSWALK_PATH):
        anncsu_key = row.get("anncsu_street_name_normalised") or row.get("street_name_normalised", "")
        electoral_key = row.get("street_name_normalised", "")
        if anncsu_key and electoral_key and row.get("crosswalk_status", "").startswith("matched"):
            mapping[anncsu_key].append(row)
    return mapping


def index_rules(rules: list[dict]) -> dict[str, list[dict]]:
    by_street: dict[str, list[dict]] = defaultdict(list)
    for rule in rules:
        key = rule.get("street_name_normalised") or normalize_street_name(rule.get("street_name_raw", ""))
        if key:
            by_street[key].append(rule)
    return by_street


def rule_matches(rule: dict, number: int | None, snc: bool) -> bool:
    includes_snc = rule.get("includes_snc") == "true"
    civic_from = civic_number(rule.get("civic_from", ""))
    civic_to = civic_number(rule.get("civic_to", ""))
    parity = rule.get("civic_parity", "")
    raw = (rule.get("civic_rule_raw") or "").upper()
    has_numeric_condition = bool(civic_from is not None or parity or "CON NUMERI CIVICI" in raw)
    has_civic_condition = bool(includes_snc or has_numeric_condition)

    if not has_civic_condition:
        return True
    if includes_snc and not has_numeric_condition:
        return snc
    if snc and includes_snc:
        return True
    if snc:
        return False
    if number is None:
        return False
    if civic_from is not None and civic_to is not None:
        low = min(civic_from, civic_to)
        high = max(civic_from, civic_to)
        if not (low <= number <= high):
            return False
    if parity in {"even", "odd"} and civic_parity(number) != parity:
        return False
    if "CON NUMERI CIVICI" in raw and number is None:
        return False
    return not snc


def method_and_confidence(rule: dict, crosswalk_method: str) -> tuple[str, str]:
    raw = (rule.get("civic_rule_raw") or "").upper()
    prefix = "normalized_street_exact"
    base_confidence = "high"
    if crosswalk_method == "abbreviation_signature_unique":
        prefix = "anncsu_crosswalk_abbreviation_unique"
        base_confidence = "medium"
    if rule.get("includes_snc") == "true" and (rule.get("civic_from") or rule.get("civic_parity")):
        return f"{prefix}_and_civic_rule", base_confidence
    if rule.get("civic_from") or rule.get("civic_parity"):
        return f"{prefix}_and_civic_rule", base_confidence
    if "CON NUMERI CIVICI" in raw:
        return f"{prefix}_and_civic_presence_rule", "medium"
    if rule.get("includes_snc") == "true":
        return f"{prefix}_and_snc_rule", base_confidence
    return prefix, base_confidence


def add_review(
    queue: list[dict],
    *,
    reason: str,
    civic: dict,
    street_key: str,
    candidates: list[dict],
    notes: str,
) -> None:
    queue.append(
        {
            "review_id": f"anncsu_review_{len(queue) + 1:06d}",
            "reason": reason,
            "election_id": ELECTION_ID,
            "anncsu_progressivo_accesso": civic.get("PROGRESSIVO_ACCESSO", ""),
            "anncsu_odonimo": civic.get("ODONIMO", ""),
            "street_name_normalised": street_key,
            "civico": civic.get("CIVICO", ""),
            "esponente": civic.get("ESPONENTE", ""),
            "progressivo_snc": civic.get("PROGRESSIVO_SNC", ""),
            "candidate_rule_ids": "; ".join(rule.get("rule_id", "") for rule in candidates),
            "candidate_sections": "; ".join(sorted({rule.get("section_number", "") for rule in candidates}, key=lambda v: int(v or 0))),
            "review_notes": notes,
        }
    )


def build_outputs() -> tuple[list[dict], list[dict], list[str]]:
    civics = read_csv_flexible(INDIRIZZARIO_PATH)
    rules = read_csv_flexible(RULES_PATH)
    crosswalk_status = load_crosswalk_status()
    crosswalk_rules = load_crosswalk_rules()
    if not civics:
        raise RuntimeError(f"Missing or empty ANNCSU indirizzario extract: {INDIRIZZARIO_PATH}")
    if not rules:
        raise RuntimeError(f"Missing or empty electoral rules: {RULES_PATH}")
    rules_by_street = index_rules(rules)

    output_rows: list[dict] = []
    review_queue: list[dict] = []
    source_headers = list(civics[0].keys())

    for civic in civics:
        street_key = normalize_street_name(civic.get("ODONIMO", ""))
        number = civic_number(civic.get("CIVICO", ""))
        snc = is_snc(civic)
        crosswalk_candidates = crosswalk_rules.get(street_key, [])
        candidate_rule_rows = []
        for row in crosswalk_candidates:
            for rule in rules_by_street.get(row.get("street_name_normalised", ""), []):
                candidate_rule_rows.append((rule, row))
        if not candidate_rule_rows:
            candidate_rule_rows = [(rule, {"match_method": "normalized_exact", "crosswalk_status": crosswalk_status.get(street_key, "")}) for rule in rules_by_street.get(street_key, [])]
        candidates = [rule for rule, _row in candidate_rule_rows]
        exact_crosswalk = crosswalk_status.get(street_key, "")
        matching = [(rule, row) for rule, row in candidate_rule_rows if rule_matches(rule, number, snc)]

        assignment = {
            "election_id": ELECTION_ID,
            "street_name_normalised": street_key,
            "anncsu_civic_number": str(number) if number is not None else "",
            "anncsu_is_snc": "true" if snc else "false",
            "section_number": "",
            "rule_id": "",
            "assignment_method": "",
            "assignment_confidence": "",
            "assignment_status": "review_required",
            "assignment_notes": "",
        }

        if not candidates:
            assignment["assignment_notes"] = "street not found in parsed electoral rules"
            add_review(
                review_queue,
                reason="street_not_in_electoral_rules",
                civic=civic,
                street_key=street_key,
                candidates=[],
                notes=assignment["assignment_notes"],
            )
        elif exact_crosswalk == "unmatched":
            assignment["assignment_notes"] = "electoral street has no exact ANNCSU stradario crosswalk"
            add_review(
                review_queue,
                reason="street_crosswalk_unmatched",
                civic=civic,
                street_key=street_key,
                candidates=candidates,
                notes=assignment["assignment_notes"],
            )
        elif len(matching) == 1:
            rule, crosswalk_row = matching[0]
            method, confidence = method_and_confidence(rule, crosswalk_row.get("match_method", "normalized_exact"))
            assignment.update(
                {
                    "section_number": rule["section_number"],
                    "rule_id": rule["rule_id"],
                    "assignment_method": method,
                    "assignment_confidence": confidence,
                    "assignment_status": "assigned",
                    "assignment_notes": (
                        "" if crosswalk_row.get("match_method") == "normalized_exact"
                        else f"crosswalk_status={crosswalk_row.get('crosswalk_status', '')}; electoral_street={rule.get('street_name_raw', '')}"
                    ),
                }
            )
        elif len(matching) > 1:
            assignment["assignment_notes"] = "multiple electoral rules match this street/civic"
            add_review(
                review_queue,
                reason="ambiguous_multiple_rules",
                civic=civic,
                street_key=street_key,
                candidates=[rule for rule, _row in matching],
                notes=assignment["assignment_notes"],
            )
        else:
            assignment["assignment_notes"] = "street exists but no civic rule matches this access"
            add_review(
                review_queue,
                reason="no_civic_rule_match",
                civic=civic,
                street_key=street_key,
                candidates=candidates,
                notes=assignment["assignment_notes"],
            )

        output_rows.append({**civic, **assignment})

    return output_rows, review_queue, source_headers


def print_summary(output_rows: list[dict], review_queue: list[dict]) -> None:
    status_counts = Counter(row["assignment_status"] for row in output_rows)
    method_counts = Counter(row["assignment_method"] for row in output_rows if row["assignment_method"])
    reason_counts = Counter(row["reason"] for row in review_queue)
    print("ANNCSU civic electoral section assignment")
    print(f"rows={len(output_rows)}")
    for status, count in sorted(status_counts.items()):
        print(f"{status}={count}")
    for method, count in sorted(method_counts.items()):
        print(f"method[{method}]={count}")
    for reason, count in sorted(reason_counts.items()):
        print(f"review[{reason}]={count}")
    print(f"output={OUTPUT_PATH}")
    print(f"review_queue={REVIEW_QUEUE_PATH}")


def main() -> int:
    output_rows, review_queue, source_headers = build_outputs()
    headers = source_headers + ASSIGNMENT_COLUMNS
    write_csv(OUTPUT_PATH, output_rows, headers)
    write_csv(REVIEW_QUEUE_PATH, review_queue, REVIEW_HEADERS)
    print_summary(output_rows, review_queue)
    assigned = [row for row in output_rows if row["assignment_status"] == "assigned"]
    invalid = [
        row for row in assigned
        if not row["rule_id"] or not row["assignment_method"] or not row["assignment_confidence"]
    ]
    return 1 if invalid else 0


if __name__ == "__main__":
    sys.exit(main())
