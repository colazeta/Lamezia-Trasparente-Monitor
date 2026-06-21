#!/usr/bin/env python3
"""Validate exported electoral review decisions without applying them.

This is intentionally a stub. It checks CSV/JSON exports from the local review
workbench and prints a QA summary. It does not write V4 geometries, source CSVs,
GPKG files, or processed electoral data.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any


REQUIRED_FIELDS = {
    "review_id",
    "case_type",
    "decision_type",
    "decision_confidence",
    "reason",
    "reviewed_by",
    "review_date",
}

ALLOWED_DECISION_TYPES = {
    "confirm_current_assignment",
    "assign_to_section",
    "keep_unassigned",
    "keep_conflict",
    "split_required",
    "needs_external_source",
    "exclude_from_section_geometry",
}

ALLOWED_CONFIDENCE = {"high", "medium", "low"}


def load_decisions(path: Path) -> list[dict[str, Any]]:
    suffix = path.suffix.lower()
    if suffix == ".json":
        payload = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(payload, dict):
            decisions = payload.get("decisions", [])
        else:
            decisions = payload
        if not isinstance(decisions, list):
            raise ValueError("JSON export must contain a decisions list")
        return [dict(row) for row in decisions]
    if suffix == ".csv":
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            return [dict(row) for row in csv.DictReader(handle)]
    raise ValueError("Expected a .csv or .json decision export")


def validate_row(row: dict[str, Any], row_number: int) -> list[str]:
    errors: list[str] = []
    for field in sorted(REQUIRED_FIELDS):
        if not str(row.get(field, "")).strip():
            errors.append(f"row {row_number}: missing {field}")

    decision_type = str(row.get("decision_type", "")).strip()
    if decision_type and decision_type not in ALLOWED_DECISION_TYPES:
        errors.append(f"row {row_number}: unsupported decision_type {decision_type!r}")

    confidence = str(row.get("decision_confidence", "")).strip()
    if confidence and confidence not in ALLOWED_CONFIDENCE:
        errors.append(f"row {row_number}: unsupported decision_confidence {confidence!r}")

    if decision_type == "assign_to_section" and not str(row.get("proposed_section_number", "")).strip():
        errors.append(f"row {row_number}: assign_to_section requires proposed_section_number")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate exported electoral review decisions without applying them."
    )
    parser.add_argument("decision_export", type=Path, help="CSV or JSON export from the local workbench")
    args = parser.parse_args()

    decisions = load_decisions(args.decision_export)
    errors: list[str] = []
    review_ids: Counter[str] = Counter()
    decision_types: Counter[str] = Counter()
    proposed_sections: Counter[str] = Counter()
    follow_up = 0

    for index, row in enumerate(decisions, start=1):
        review_id = str(row.get("review_id", "")).strip()
        if review_id:
            review_ids[review_id] += 1
        decision_types[str(row.get("decision_type", "")).strip() or "missing"] += 1
        proposed_section = str(row.get("proposed_section_number", "")).strip()
        if proposed_section:
            proposed_sections[proposed_section] += 1
        requires_follow_up = str(row.get("requires_follow_up", "")).strip().lower()
        if requires_follow_up in {"1", "true", "yes", "y"}:
            follow_up += 1
        errors.extend(validate_row(row, index))

    duplicate_ids = sorted(review_id for review_id, count in review_ids.items() if count > 1)
    for review_id in duplicate_ids:
        errors.append(f"duplicate decision for review_id {review_id}")

    print("electoral review decisions stub")
    print(f"input={args.decision_export}")
    print(f"decisions={len(decisions)}")
    print(f"unique_review_ids={len(review_ids)}")
    print(f"duplicate_review_ids={len(duplicate_ids)}")
    print(f"requires_follow_up={follow_up}")
    print("decision_types=" + ", ".join(f"{key}:{value}" for key, value in sorted(decision_types.items())))
    if proposed_sections:
        print("proposed_sections=" + ", ".join(f"{key}:{value}" for key, value in sorted(proposed_sections.items(), key=lambda item: int(item[0]) if item[0].isdigit() else 9999)))

    if errors:
        print("validation_status=failed")
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print("validation_status=passed")
    print("would_prepare=review_decision_application_plan")
    print("would_check=section_assignments, conflicts, follow_up_flags, source_rule_consistency")
    print("apply_status=not_applied")
    print("note=stub only; no V4 geometry or processed data was written")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
