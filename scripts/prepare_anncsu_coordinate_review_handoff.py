from __future__ import annotations

import argparse
import math
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import QA_DIR, read_csv_rows, relpath, write_csv_rows


WORKSHEET_CSV = QA_DIR / "anncsu_coordinate_review_worksheet_batch_1_2025.csv"
HANDOFF_CSV = QA_DIR / "anncsu_coordinate_review_handoff_batch_1_2025.csv"
REPORT_PATH = QA_DIR / "anncsu_coordinate_review_handoff_batch_1_report_2025.md"

OUTPUT_FIELDS = [
    "review_rank",
    "access_id",
    "address_label",
    "coordinate_quality_flag",
    "source_diagnosis",
    "source_lon",
    "source_lat",
    "candidate_lon",
    "candidate_lat",
    "candidate_source",
    "candidate_method",
    "candidate_confidence",
    "movement_from_source_m",
    "evidence_agreement",
    "review_track",
    "workbench_filter",
    "worksheet_reviewer_action",
    "review_status",
    "required_reviewer_fields",
    "acceptance_rule",
    "post_review_command",
]

REQUIRED_BASE_FIELDS = [
    "reviewer_action",
    "coordinate_decision_confidence",
    "reviewed_by",
    "review_date",
    "coordinate_reason",
]


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


def sort_key(row: dict[str, str]) -> tuple[int, str]:
    rank = as_float(row.get("review_rank"))
    return (int(rank) if not math.isnan(rank) else 999_999, as_text(row.get("access_id")))


def address_label(row: dict[str, str]) -> str:
    parts = [as_text(row.get("street")), as_text(row.get("civico")), as_text(row.get("esponente"))]
    return " ".join(part for part in parts if part)


def review_status(row: dict[str, str]) -> str:
    action = as_text(row.get("reviewer_action"))
    if not action:
        return "awaiting_human_review"
    if action in {"accept_candidate", "edit_coordinate"}:
        missing = [field for field in REQUIRED_BASE_FIELDS if not as_text(row.get(field))]
        if action == "edit_coordinate":
            missing.extend(field for field in ["reviewer_lon", "reviewer_lat"] if not as_text(row.get(field)))
        return "ready_for_decision_builder" if not missing else "incomplete_review_fields"
    if action in {"reject_candidate", "needs_more_evidence"}:
        return "reviewed_without_override"
    return "unknown_reviewer_action"


def required_fields(row: dict[str, str]) -> str:
    action = as_text(row.get("reviewer_action"))
    fields = list(REQUIRED_BASE_FIELDS)
    if action == "edit_coordinate":
        fields.extend(["reviewer_lon", "reviewer_lat"])
    return ";".join(fields)


def acceptance_rule(row: dict[str, str]) -> str:
    source = as_text(row.get("recommended_candidate_source"))
    confidence = as_text(row.get("local_candidate_confidence") or row.get("geocode_provider_confidence"))
    agreement = as_text(row.get("evidence_agreement"))
    if source == "local_anncsu_anchor" and confidence == "medium":
        return "Accept only after workbench inspection confirms ANNCSU label, same-street anchor context, and no visible contradiction."
    if agreement.startswith("local_and_geocoder"):
        return "Accept only if local anchor and geocoder evidence both match the reviewed civic context."
    return "Do not accept automatically; use edit_coordinate or needs_more_evidence unless human inspection is conclusive."


def handoff_row(row: dict[str, str]) -> dict[str, str]:
    return {
        "review_rank": as_text(row.get("review_rank")),
        "access_id": as_text(row.get("access_id")),
        "address_label": address_label(row),
        "coordinate_quality_flag": as_text(row.get("coordinate_quality_flag")),
        "source_diagnosis": as_text(row.get("source_diagnosis")),
        "source_lon": as_text(row.get("source_lon")),
        "source_lat": as_text(row.get("source_lat")),
        "candidate_lon": as_text(row.get("review_candidate_lon")),
        "candidate_lat": as_text(row.get("review_candidate_lat")),
        "candidate_source": as_text(row.get("recommended_candidate_source")),
        "candidate_method": as_text(row.get("local_candidate_method")),
        "candidate_confidence": as_text(row.get("local_candidate_confidence") or row.get("geocode_provider_confidence")),
        "movement_from_source_m": as_text(row.get("local_distance_from_source_m") or row.get("geocode_distance_from_source_m")),
        "evidence_agreement": as_text(row.get("evidence_agreement")),
        "review_track": as_text(row.get("recommended_review_track")),
        "workbench_filter": f"access_id:{as_text(row.get('access_id'))}",
        "worksheet_reviewer_action": as_text(row.get("reviewer_action")) or "blank",
        "review_status": review_status(row),
        "required_reviewer_fields": required_fields(row),
        "acceptance_rule": acceptance_rule(row),
        "post_review_command": "python scripts/build_anncsu_coordinate_decisions_from_worksheet.py",
    }


def markdown_table(headers: list[str], rows: list[list[str]]) -> list[str]:
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(value.replace("|", "\\|") for value in row) + " |")
    return lines


def movement_summary(rows: list[dict[str, str]]) -> tuple[str, str, str]:
    movements = [as_float(row.get("movement_from_source_m")) for row in rows]
    movements = [value for value in movements if not math.isnan(value)]
    if not movements:
        return "", "", ""
    return f"{min(movements):.1f}", f"{sum(movements) / len(movements):.1f}", f"{max(movements):.1f}"


def write_report(rows: list[dict[str, str]], source_worksheet: Path) -> None:
    status_counts = Counter(row["review_status"] for row in rows)
    action_counts = Counter(row["worksheet_reviewer_action"] for row in rows)
    method_counts = Counter(row["candidate_method"] or "blank" for row in rows)
    min_move, avg_move, max_move = movement_summary(rows)

    lines = [
        "# ANNCSU Coordinate Review Handoff Batch 1 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Scope",
        "",
        "This handoff prepares the first coordinate-review batch for human inspection. It does not accept, apply, or train coordinate replacements.",
        "",
        "## Result",
        "",
        f"- Source worksheet: `{relpath(source_worksheet)}`",
        f"- Handoff CSV: `{relpath(HANDOFF_CSV)}`",
        f"- Handoff rows: {len(rows)}",
        f"- Movement from source min/avg/max m: `{min_move}` / `{avg_move}` / `{max_move}`",
        "",
        "## Review Status Counts",
        "",
    ]
    for key, value in sorted(status_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Worksheet Action Counts", ""])
    for key, value in sorted(action_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Candidate Method Counts", ""])
    for key, value in sorted(method_counts.items()):
        lines.append(f"- `{key}`: {value}")

    lines.extend(["", "## First Rows To Review", ""])
    lines.extend(
        markdown_table(
            ["rank", "access_id", "address", "candidate", "movement_m", "status"],
            [
                [
                    row["review_rank"],
                    row["access_id"],
                    row["address_label"],
                    f"{row['candidate_lon']}, {row['candidate_lat']}",
                    row["movement_from_source_m"],
                    row["review_status"],
                ]
                for row in rows[:15]
            ],
        )
    )

    lines.extend(
        [
            "",
            "## Human Review Steps",
            "",
            "1. Serve the local workbench with `python -m http.server 4177 --directory tools/electoral-review-workbench`.",
            "2. Open `http://127.0.0.1:4177/`.",
            "3. For each handoff row, filter by `access_id:<id>` and inspect the ANNCSU label, source point, candidate point, nearby same-street anchors, and street-register context.",
            "4. Fill the source worksheet fields: `reviewer_action`, `coordinate_decision_confidence`, `reviewed_by`, `review_date`, and `coordinate_reason`.",
            "5. Use `accept_candidate` only after human inspection confirms the candidate. Use `edit_coordinate` if the reviewer supplies a better lon/lat. Use `reject_candidate` or `needs_more_evidence` otherwise.",
            "",
            "## After Review",
            "",
            "Run:",
            "",
            "```powershell",
            "python scripts/build_anncsu_coordinate_decisions_from_worksheet.py",
            "python scripts/intake_anncsu_coordinate_overrides.py --decisions data/interim/qa/anncsu_coordinate_reviewed_decisions_batch_1_2025.json",
            "```",
            "",
            "The intake gate must report `passed_with_accepted_reviewed_overrides` before any reviewed coordinate can become a recovery-layer value or training row.",
            "",
            "## Guardrails",
            "",
            "- Do not edit raw ANNCSU coordinates.",
            "- Do not train from this handoff CSV.",
            "- Do not create V4 geometry, public maps, GPKG files, UI, or deploy changes from this batch.",
            "- Do not accept local-anchor candidates without human map/workbench inspection.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare a human handoff for the first ANNCSU coordinate review worksheet.")
    parser.add_argument("--worksheet", type=Path, default=WORKSHEET_CSV, help="Coordinate review worksheet CSV.")
    parser.add_argument("--output", type=Path, default=HANDOFF_CSV, help="Handoff CSV output path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.worksheet.exists():
        print(f"missing_input={args.worksheet}", file=sys.stderr)
        return 1

    rows = [handoff_row(row) for row in sorted(read_csv_rows(args.worksheet), key=sort_key)]
    write_csv_rows(args.output, rows, OUTPUT_FIELDS)
    write_report(rows, args.worksheet)

    print(f"handoff_csv={args.output}")
    print(f"handoff_report={REPORT_PATH}")
    print(f"handoff_rows={len(rows)}")
    for key, value in sorted(Counter(row["review_status"] for row in rows).items()):
        print(f"{key}={value}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
