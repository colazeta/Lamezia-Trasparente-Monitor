from __future__ import annotations

import argparse
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import QA_DIR, read_csv_rows, relpath, write_csv_rows


REVIEW_PACK_CSV = QA_DIR / "anncsu_coordinate_review_pack_2025.csv"
WORKSHEET_CSV = QA_DIR / "anncsu_coordinate_review_worksheet_batch_1_2025.csv"
REPORT_PATH = QA_DIR / "anncsu_coordinate_review_worksheet_batch_1_report_2025.md"

OUTPUT_FIELDS = [
    "review_rank",
    "access_id",
    "street",
    "civico",
    "esponente",
    "coordinate_quality_flag",
    "source_diagnosis",
    "source_lon",
    "source_lat",
    "recommended_candidate_source",
    "review_candidate_lon",
    "review_candidate_lat",
    "recommended_review_track",
    "decision_readiness",
    "evidence_agreement",
    "local_candidate_method",
    "local_candidate_confidence",
    "local_distance_from_source_m",
    "geocode_provider_confidence",
    "geocode_distance_from_source_m",
    "local_geocode_distance_m",
    "reviewer_action",
    "reviewer_lon",
    "reviewer_lat",
    "coordinate_decision_confidence",
    "reviewed_by",
    "review_date",
    "coordinate_reason",
    "reviewer_notes",
    "audit_expected_status",
]

REVIEWER_ACTIONS = [
    "accept_candidate",
    "edit_coordinate",
    "reject_candidate",
    "needs_more_evidence",
]


def as_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    return "" if text.lower() == "nan" else text.strip()


def as_int(value: Any, default: int = 999_999) -> int:
    try:
        return int(float(as_text(value).replace(",", ".")))
    except ValueError:
        return default


def worksheet_row(row: dict[str, str]) -> dict[str, str]:
    out = {field: as_text(row.get(field)) for field in OUTPUT_FIELDS}
    out.update(
        {
            "reviewer_action": "",
            "reviewer_lon": "",
            "reviewer_lat": "",
            "coordinate_decision_confidence": "",
            "reviewed_by": "",
            "review_date": "",
            "coordinate_reason": "",
            "reviewer_notes": "",
            "audit_expected_status": "not_reviewed",
        }
    )
    return out


def markdown_table(headers: list[str], rows: list[list[str]]) -> list[str]:
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(value.replace("|", "\\|") for value in row) + " |")
    return lines


def write_report(rows: list[dict[str, str]], *, limit: int) -> None:
    readiness_counts = Counter(row["decision_readiness"] for row in rows)
    source_counts = Counter(row["recommended_candidate_source"] or "none" for row in rows)
    track_counts = Counter(row["recommended_review_track"] for row in rows)
    lines = [
        "# ANNCSU Coordinate Review Worksheet Batch 1 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Result",
        "",
        f"- Worksheet rows: {len(rows)}",
        f"- Requested limit: {limit}",
        f"- Worksheet CSV: `{relpath(WORKSHEET_CSV)}`",
        "",
        "The worksheet is a human-review input. It does not accept, apply, or train coordinate replacements. Rows remain non-actionable until a reviewer fills `reviewer_action`, reviewer metadata, review date, confidence, and reason.",
        "",
        "## Decision Readiness Counts",
        "",
    ]
    for key, value in sorted(readiness_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Recommended Candidate Source Counts", ""])
    for key, value in sorted(source_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Review Track Counts", ""])
    for key, value in sorted(track_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Allowed Reviewer Actions", ""])
    for action in REVIEWER_ACTIONS:
        lines.append(f"- `{action}`")
    lines.extend(["", "## First Rows", ""])
    lines.extend(
        markdown_table(
            ["rank", "access_id", "street", "civic", "candidate_source", "candidate_lon", "candidate_lat"],
            [
                [
                    row["review_rank"],
                    row["access_id"],
                    row["street"],
                    row["civico"],
                    row["recommended_candidate_source"],
                    row["review_candidate_lon"],
                    row["review_candidate_lat"],
                ]
                for row in rows[:10]
            ],
        )
    )
    lines.extend(
        [
            "",
            "## How To Use",
            "",
            "1. Review each row in the local workbench using `suggested_workbench_filter` or `access_id` from the source review pack.",
            "2. Use `accept_candidate` only when the candidate lon/lat is accepted after human inspection.",
            "3. Use `edit_coordinate` only when the reviewer supplies `reviewer_lon` and `reviewer_lat`.",
            "4. Use `reject_candidate` or `needs_more_evidence` when no coordinate should be exported.",
            "5. Run `scripts/build_anncsu_coordinate_decisions_from_worksheet.py` to create auditable JSON decisions from accepted rows only.",
            "",
            "## Guardrails",
            "",
            "- Do not train from this worksheet directly.",
            "- Do not edit ANNCSU raw coordinates.",
            "- Do not clear audit-blocking fields outside a documented human review.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare a human review worksheet for ANNCSU coordinate candidates.")
    parser.add_argument("--limit", type=int, default=50, help="Number of manual-review-ready rows to include.")
    parser.add_argument("--output", type=Path, default=WORKSHEET_CSV, help="Worksheet CSV output path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.limit <= 0:
        print("--limit must be positive", file=sys.stderr)
        return 1
    if not REVIEW_PACK_CSV.exists():
        print(f"missing_input={REVIEW_PACK_CSV}", file=sys.stderr)
        return 1

    candidates = [
        row
        for row in read_csv_rows(REVIEW_PACK_CSV)
        if as_text(row.get("decision_readiness")) == "manual_review_ready"
        and as_text(row.get("review_candidate_lon"))
        and as_text(row.get("review_candidate_lat"))
    ]
    selected = sorted(candidates, key=lambda row: (as_int(row.get("review_rank")), as_text(row.get("access_id"))))[: args.limit]
    rows = [worksheet_row(row) for row in selected]

    write_csv_rows(args.output, rows, OUTPUT_FIELDS)
    write_report(rows, limit=args.limit)

    print(f"worksheet_csv={args.output}")
    print(f"worksheet_report={REPORT_PATH}")
    print(f"worksheet_rows={len(rows)}")
    print("accepted_rows=0")
    return 0


if __name__ == "__main__":
    sys.exit(main())
