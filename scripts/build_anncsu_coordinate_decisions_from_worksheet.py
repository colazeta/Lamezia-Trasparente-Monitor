from __future__ import annotations

import argparse
import json
import math
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import QA_DIR, read_csv_rows, relpath


WORKSHEET_CSV = QA_DIR / "anncsu_coordinate_review_worksheet_batch_1_2025.csv"
DECISIONS_JSON = QA_DIR / "anncsu_coordinate_reviewed_decisions_batch_1_2025.json"
REPORT_PATH = QA_DIR / "anncsu_coordinate_reviewed_decisions_batch_1_report_2025.md"

ACCEPT_ACTIONS = {"accept_candidate", "edit_coordinate"}
SKIP_ACTIONS = {"", "reject_candidate", "needs_more_evidence"}
TRAINING_READY_CONFIDENCE = {"high", "medium"}
LAMEZIA_LON_RANGE = (16.0, 16.6)
LAMEZIA_LAT_RANGE = (38.75, 39.15)


def as_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    return "" if text.lower() == "nan" else text.strip()


def as_float(value: Any) -> float:
    text = as_text(value).replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return math.nan


def decimal_text(value: Any) -> str:
    parsed = as_float(value)
    if math.isnan(parsed):
        return ""
    return f"{parsed:.7f}".rstrip("0").rstrip(".")


def path_label(path: Path) -> str:
    try:
        return relpath(path)
    except ValueError:
        return str(path)


def plausible_lon_lat(lon: float, lat: float) -> bool:
    return LAMEZIA_LON_RANGE[0] <= lon <= LAMEZIA_LON_RANGE[1] and LAMEZIA_LAT_RANGE[0] <= lat <= LAMEZIA_LAT_RANGE[1]


def selected_coordinate(row: dict[str, str]) -> tuple[str, str]:
    action = as_text(row.get("reviewer_action"))
    if action == "edit_coordinate":
        return decimal_text(row.get("reviewer_lon")), decimal_text(row.get("reviewer_lat"))
    return decimal_text(row.get("review_candidate_lon")), decimal_text(row.get("review_candidate_lat"))


def validate_row(row: dict[str, str], row_number: int) -> list[str]:
    errors: list[str] = []
    action = as_text(row.get("reviewer_action"))
    access_id = as_text(row.get("access_id"))
    if action in SKIP_ACTIONS:
        return errors
    if action not in ACCEPT_ACTIONS:
        return [f"row {row_number} access_id={access_id}: unknown reviewer_action `{action}`"]
    lon_text, lat_text = selected_coordinate(row)
    lon = as_float(lon_text)
    lat = as_float(lat_text)
    if not lon_text or not lat_text or not plausible_lon_lat(lon, lat):
        errors.append(f"row {row_number} access_id={access_id}: accepted coordinate is missing or outside Lamezia ranges")
    if as_text(row.get("coordinate_decision_confidence")) not in TRAINING_READY_CONFIDENCE:
        errors.append(f"row {row_number} access_id={access_id}: coordinate_decision_confidence must be high or medium")
    if not as_text(row.get("reviewed_by")):
        errors.append(f"row {row_number} access_id={access_id}: reviewed_by is required")
    if not as_text(row.get("review_date")):
        errors.append(f"row {row_number} access_id={access_id}: review_date is required")
    if not as_text(row.get("coordinate_reason")):
        errors.append(f"row {row_number} access_id={access_id}: coordinate_reason is required")
    return errors


def decision_for(row: dict[str, str]) -> dict[str, Any]:
    access_id = as_text(row.get("access_id"))
    action = as_text(row.get("reviewer_action"))
    proposed_lon, proposed_lat = selected_coordinate(row)
    source_lon = decimal_text(row.get("source_lon"))
    source_lat = decimal_text(row.get("source_lat"))
    evidence_snapshot = {
        "source": "anncsu_coordinate_review_worksheet_batch_1_2025",
        "reviewer_action": action,
        "selected_civic_coordinate_quality": {
            "access_id": access_id,
            "street": as_text(row.get("street")),
            "civico": as_text(row.get("civico")),
            "esponente": as_text(row.get("esponente")),
            "coordinate_quality_flag": as_text(row.get("coordinate_quality_flag")),
            "source_diagnosis": as_text(row.get("source_diagnosis")),
            "source_lon": source_lon,
            "source_lat": source_lat,
        },
        "candidate": {
            "recommended_candidate_source": as_text(row.get("recommended_candidate_source")),
            "review_candidate_lon": decimal_text(row.get("review_candidate_lon")),
            "review_candidate_lat": decimal_text(row.get("review_candidate_lat")),
            "recommended_review_track": as_text(row.get("recommended_review_track")),
            "evidence_agreement": as_text(row.get("evidence_agreement")),
            "local_candidate_method": as_text(row.get("local_candidate_method")),
            "local_candidate_confidence": as_text(row.get("local_candidate_confidence")),
            "geocode_provider_confidence": as_text(row.get("geocode_provider_confidence")),
            "local_geocode_distance_m": as_text(row.get("local_geocode_distance_m")),
        },
    }
    relocation_support_snapshot = {
        "access_id": access_id,
        "source_lon": source_lon,
        "source_lat": source_lat,
        "proposed_lon": proposed_lon,
        "proposed_lat": proposed_lat,
        "coordinate_quality_flag": as_text(row.get("coordinate_quality_flag")),
        "local_anchor_candidates": [
            {
                "provider": "local_anncsu_anchor",
                "candidate_method": as_text(row.get("local_candidate_method")),
                "candidate_confidence": as_text(row.get("local_candidate_confidence")),
                "candidate_lon": decimal_text(row.get("review_candidate_lon")),
                "candidate_lat": decimal_text(row.get("review_candidate_lat")),
                "distance_from_source_m": as_text(row.get("local_distance_from_source_m")),
            }
        ],
        "reviewer_action": action,
        "reviewer_notes": as_text(row.get("reviewer_notes")),
    }
    return {
        "decision_id": f"reviewed-coordinate-override:{access_id}",
        "task_id": f"coordinate-reviewed:{access_id}",
        "decision_scope": "single_civic",
        "selected_access_ids": access_id,
        "odonimo_raw": as_text(row.get("street")),
        "civic_from": as_text(row.get("civico")),
        "civic_to": as_text(row.get("civico")),
        "civic_parity": "",
        "includes_snc": False,
        "proposed_section_number": "",
        "decision_type": "coordinate_reviewed",
        "decision_confidence": as_text(row.get("coordinate_decision_confidence")),
        "reason": as_text(row.get("coordinate_reason")),
        "street_register_rule_ids_used": "",
        "street_register_pages_used": "",
        "qgis_observation": as_text(row.get("reviewer_notes")),
        "reviewed_by": as_text(row.get("reviewed_by")),
        "review_date": as_text(row.get("review_date")),
        "requires_follow_up": False,
        "coordinate_decision_type": "manual_coordinate_override",
        "original_lon": source_lon,
        "original_lat": source_lat,
        "proposed_lon": proposed_lon,
        "proposed_lat": proposed_lat,
        "coordinate_decision_confidence": as_text(row.get("coordinate_decision_confidence")),
        "coordinate_reason": as_text(row.get("coordinate_reason")),
        "exclude_from_geometry": False,
        "requires_external_coordinate_check": False,
        "relocation_support_snapshot": relocation_support_snapshot,
        "notes": as_text(row.get("reviewer_notes")),
        "evidence_snapshot": evidence_snapshot,
        "saved_at": "",
    }


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_report(rows: list[dict[str, str]], decisions: list[dict[str, Any]], errors: list[str], output_path: Path) -> None:
    action_counts = Counter(as_text(row.get("reviewer_action")) or "blank" for row in rows)
    lines = [
        "# ANNCSU Coordinate Reviewed Decisions Batch 1 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Result",
        "",
        f"- Worksheet rows: {len(rows)}",
        f"- Reviewed decisions exported: {len(decisions)}",
        f"- Blocking validation errors: {len(errors)}",
        f"- Decisions JSON: `{path_label(output_path)}`",
        "",
        "This builder exports only rows explicitly marked `accept_candidate` or `edit_coordinate`. Blank, rejected, and needs-more-evidence rows are not exported.",
        "",
        "## Reviewer Action Counts",
        "",
    ]
    for key, value in sorted(action_counts.items()):
        lines.append(f"- `{key}`: {value}")
    if errors:
        lines.extend(["", "## Blocking Errors", ""])
        for error in errors[:100]:
            lines.append(f"- {error}")
        if len(errors) > 100:
            lines.append(f"- ... {len(errors) - 100} more errors")
    lines.extend(
        [
            "",
            "## Next Step",
            "",
            "Run `scripts/audit_anncsu_coordinate_decisions.py --decisions <decisions-json>` and resolve all P0/P1 findings before building the recovery layer.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build reviewed ANNCSU coordinate decisions from a human-filled worksheet.")
    parser.add_argument("--worksheet", type=Path, default=WORKSHEET_CSV, help="Human-filled coordinate review worksheet CSV.")
    parser.add_argument("--output", type=Path, default=DECISIONS_JSON, help="Reviewed decisions JSON output path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.worksheet.exists():
        print(f"missing_input={args.worksheet}", file=sys.stderr)
        return 1
    rows = read_csv_rows(args.worksheet)
    errors: list[str] = []
    decisions: list[dict[str, Any]] = []
    for index, row in enumerate(rows, start=2):
        row_errors = validate_row(row, index)
        errors.extend(row_errors)
        action = as_text(row.get("reviewer_action"))
        if not row_errors and action in ACCEPT_ACTIONS:
            decisions.append(decision_for(row))

    payload = {
        "exported_at": "",
        "export_format": "anncsu_coordinate_reviewed_decisions_v1",
        "source_csv": path_label(args.worksheet),
        "decisions": decisions,
    }
    if not errors:
        write_json(args.output, payload)
    write_report(rows, decisions if not errors else [], errors, args.output)

    print(f"worksheet_rows={len(rows)}")
    print(f"reviewed_decisions={0 if errors else len(decisions)}")
    print(f"blocking_errors={len(errors)}")
    print(f"decisions_json={args.output if not errors else ''}")
    print(f"reviewed_decisions_report={REPORT_PATH}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
