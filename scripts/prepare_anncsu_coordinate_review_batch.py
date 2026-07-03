#!/usr/bin/env python3
"""Prepare a prioritized manual-review batch for ANNCSU coordinate recovery."""

from __future__ import annotations

import argparse
import math
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import QA_DIR, read_csv_rows, relpath, write_csv_rows


LOCAL_ANCHOR_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_local_anchor_candidates_2025.csv"
GEOCODE_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_geocode_candidates_2025.csv"
SUSPECT_CSV = QA_DIR / "anncsu_coordinate_suspect_points_2025.csv"

PRIORITY_QUEUE_CSV = QA_DIR / "anncsu_coordinate_review_priority_queue_2025.csv"
BATCH_1_CSV = QA_DIR / "anncsu_coordinate_review_batch_1_2025.csv"
REPORT_PATH = QA_DIR / "anncsu_coordinate_review_batch_1_report_2025.md"

BATCH_ID = "anncsu_coordinate_review_batch_1_2025"
DEFAULT_BATCH_SIZE = 50

OUTPUT_FIELDS = [
    "review_rank",
    "review_batch_id",
    "review_priority_band",
    "candidate_review_status",
    "access_id",
    "street",
    "civico",
    "esponente",
    "coordinate_quality_flag",
    "coordinate_suspect_reason",
    "source_lon",
    "source_lat",
    "candidate_lon",
    "candidate_lat",
    "candidate_method",
    "candidate_confidence",
    "candidate_status",
    "distance_from_source_m",
    "anchor_count",
    "numeric_anchor_count",
    "nearest_anchor_distance_m",
    "lower_anchor_access_id",
    "lower_anchor_civic",
    "upper_anchor_access_id",
    "upper_anchor_civic",
    "nearest_anchor_access_id",
    "nearest_anchor_civic",
    "external_geocoder_candidate_count",
    "candidate_explanation",
    "suggested_workbench_filter",
    "recommended_review_action",
    "notes",
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


def as_int(value: Any) -> int:
    parsed = as_float(value)
    if math.isnan(parsed):
        return 0
    return int(parsed)


def civic_number(value: Any) -> float:
    digits = "".join(ch for ch in as_text(value) if ch.isdigit())
    return float(digits) if digits else math.inf


def geocoder_candidates_by_access(rows: list[dict[str, str]]) -> dict[str, int]:
    grouped: dict[str, int] = defaultdict(int)
    for row in rows:
        access_id = as_text(row.get("access_id"))
        if not access_id:
            continue
        if as_text(row.get("candidate_status")) != "candidate_requires_human_review":
            continue
        if as_text(row.get("candidate_lon")) and as_text(row.get("candidate_lat")):
            grouped[access_id] += 1
    return grouped


def priority_key(row: dict[str, Any]) -> tuple[Any, ...]:
    status_rank = {
        "candidate_requires_human_review": 0,
        "no_candidate_returned": 9,
        "": 10,
    }.get(as_text(row.get("candidate_status")), 8)
    method_rank = {
        "same_street_same_civic_number_anchor": 0,
        "same_street_civic_number_interpolation": 1,
        "nearest_same_street_numeric_anchor": 2,
        "same_street_anchor_median": 3,
        "no_local_anchor_candidate": 9,
    }.get(as_text(row.get("candidate_method")), 8)
    confidence_rank = {
        "medium": 0,
        "low": 1,
        "": 9,
    }.get(as_text(row.get("candidate_confidence")), 8)
    flag_rank = {
        "outside_boundary": 0,
        "same_street_outlier": 1,
        "street_context_mismatch": 2,
        "isolated_point": 3,
        "needs_manual_coordinate_review": 4,
    }.get(as_text(row.get("coordinate_quality_flag")), 5)
    distance = as_float(row.get("distance_from_source_m"))
    if math.isnan(distance):
        distance = 999_999_999.0
    # Small movements are lower impact; extremely large movements should still be checked,
    # but after stronger, more ordinary local-anchor cases.
    if distance < 20:
        distance_band = 3
    elif distance <= 5_000:
        distance_band = 0
    elif distance <= 10_000:
        distance_band = 1
    else:
        distance_band = 2
    return (
        status_rank,
        method_rank,
        confidence_rank,
        flag_rank,
        -as_int(row.get("numeric_anchor_count")),
        -as_int(row.get("anchor_count")),
        distance_band,
        distance,
        as_text(row.get("street")),
        civic_number(row.get("civico")),
        as_text(row.get("access_id")),
    )


def enriched_rows(batch_size: int) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    local_rows = read_csv_rows(LOCAL_ANCHOR_CANDIDATES_CSV)
    suspects_by_access = {as_text(row.get("access_id")): row for row in read_csv_rows(SUSPECT_CSV)}
    geocoder_counts = geocoder_candidates_by_access(read_csv_rows(GEOCODE_CANDIDATES_CSV))

    sorted_rows = sorted(local_rows, key=priority_key)
    queue_rows: list[dict[str, Any]] = []
    reviewable_seen = 0
    for index, row in enumerate(sorted_rows, start=1):
        access_id = as_text(row.get("access_id"))
        suspect = suspects_by_access.get(access_id, {})
        reviewable = as_text(row.get("candidate_status")) == "candidate_requires_human_review"
        if reviewable:
            reviewable_seen += 1
        in_batch = reviewable and reviewable_seen <= batch_size
        if not reviewable:
            priority_band = "needs_external_geocoder_or_manual_pick"
            review_status = "no_local_candidate"
            action = "Review only after stronger evidence is available; try dedicated geocoder or manual map pick."
        elif in_batch:
            priority_band = "batch_1"
            review_status = "ready_for_manual_review"
            action = "Open this access_id in the workbench; accept as manual_coordinate_override only after checking ANNCSU label, street-register evidence, and local context."
        else:
            priority_band = "later_review"
            review_status = "ready_for_later_manual_review"
            action = "Keep queued for later manual review after batch 1."

        queue_rows.append(
            {
                "review_rank": index,
                "review_batch_id": BATCH_ID if in_batch else "",
                "review_priority_band": priority_band,
                "candidate_review_status": review_status,
                "access_id": access_id,
                "street": as_text(row.get("street")),
                "civico": as_text(row.get("civico")),
                "esponente": as_text(row.get("esponente")),
                "coordinate_quality_flag": as_text(row.get("coordinate_quality_flag")),
                "coordinate_suspect_reason": as_text(suspect.get("coordinate_suspect_reason")),
                "source_lon": as_text(row.get("source_lon")),
                "source_lat": as_text(row.get("source_lat")),
                "candidate_lon": as_text(row.get("candidate_lon")),
                "candidate_lat": as_text(row.get("candidate_lat")),
                "candidate_method": as_text(row.get("candidate_method")),
                "candidate_confidence": as_text(row.get("candidate_confidence")),
                "candidate_status": as_text(row.get("candidate_status")),
                "distance_from_source_m": as_text(row.get("distance_from_source_m")),
                "anchor_count": as_text(row.get("anchor_count")),
                "numeric_anchor_count": as_text(row.get("numeric_anchor_count")),
                "nearest_anchor_distance_m": as_text(row.get("nearest_anchor_distance_m")),
                "lower_anchor_access_id": as_text(row.get("lower_anchor_access_id")),
                "lower_anchor_civic": as_text(row.get("lower_anchor_civic")),
                "upper_anchor_access_id": as_text(row.get("upper_anchor_access_id")),
                "upper_anchor_civic": as_text(row.get("upper_anchor_civic")),
                "nearest_anchor_access_id": as_text(row.get("nearest_anchor_access_id")),
                "nearest_anchor_civic": as_text(row.get("nearest_anchor_civic")),
                "external_geocoder_candidate_count": geocoder_counts.get(access_id, 0),
                "candidate_explanation": as_text(row.get("candidate_explanation")),
                "suggested_workbench_filter": f"access_id:{access_id}",
                "recommended_review_action": action,
                "notes": "Batching does not apply coordinates. Export JSON decisions and run the coordinate-decision audit before recovery-layer use.",
            }
        )
    batch_rows = [row for row in queue_rows if row["review_batch_id"] == BATCH_ID]
    return queue_rows, batch_rows


def write_report(queue_rows: list[dict[str, Any]], batch_rows: list[dict[str, Any]], batch_size: int) -> None:
    status_counts = Counter(row["candidate_review_status"] for row in queue_rows)
    batch_method_counts = Counter(row["candidate_method"] for row in batch_rows)
    batch_flag_counts = Counter(row["coordinate_quality_flag"] for row in batch_rows)
    batch_confidence_counts = Counter(row["candidate_confidence"] for row in batch_rows)
    lines = [
        "# ANNCSU Coordinate Review Batch 1 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Result",
        "",
        f"- Priority queue rows: {len(queue_rows)}",
        f"- Batch target size: {batch_size}",
        f"- Batch 1 rows: {len(batch_rows)}",
        f"- Priority queue CSV: `{relpath(PRIORITY_QUEUE_CSV)}`",
        f"- Batch 1 CSV: `{relpath(BATCH_1_CSV)}`",
        "",
        "This batch does not apply coordinate corrections. It is a manual-review worklist for the local workbench.",
        "",
        "## Queue Status Counts",
        "",
    ]
    for key, value in sorted(status_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Batch 1 Method Counts", ""])
    for key, value in sorted(batch_method_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Batch 1 Confidence Counts", ""])
    for key, value in sorted(batch_confidence_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Batch 1 Coordinate Flags", ""])
    for key, value in sorted(batch_flag_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(
        [
            "",
            "## Review Instructions",
            "",
            "1. Open each `access_id` in the local electoral review workbench.",
            "2. Check the ANNCSU label, local-anchor evidence, street-register evidence, and map context.",
            "3. If accepted, export a JSON decision with `coordinate_decision_type=manual_coordinate_override` and the candidate lon/lat.",
            "4. If rejected, leave it unresolved or mark `needs_external_verification`.",
            "5. Run `scripts/audit_anncsu_coordinate_decisions.py --decisions <json-export>` before applying any override.",
            "6. Rebuild the recovery layer and rerun `scripts/audit_anncsu_coordinate_quality.py --use-recovery-layer`.",
            "",
            "## Guardrails",
            "",
            "- Do not edit ANNCSU raw coordinates.",
            "- Do not apply local-anchor candidates automatically.",
            "- Do not train from rejected, low-evidence, or unaudited decisions.",
            "- Do not generate V4 geometry from this batch alone.",
            "",
            "## First 15 Batch Rows",
            "",
        ]
    )
    for row in batch_rows[:15]:
        lines.append(
            f"- rank {row['review_rank']}: `{row['access_id']}` {row['street']} {row['civico']} -> "
            f"`{row['candidate_method']}` {row['candidate_confidence']} ({row['distance_from_source_m']} m)"
        )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare a prioritized ANNCSU coordinate manual-review batch.")
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE, help="Number of reviewable rows in batch 1.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    missing = [path for path in [LOCAL_ANCHOR_CANDIDATES_CSV, SUSPECT_CSV] if not path.exists()]
    if missing:
        for path in missing:
            print(f"missing_input={path}")
        return 1
    queue_rows, batch_rows = enriched_rows(max(1, args.batch_size))
    write_csv_rows(PRIORITY_QUEUE_CSV, queue_rows, OUTPUT_FIELDS)
    write_csv_rows(BATCH_1_CSV, batch_rows, OUTPUT_FIELDS)
    write_report(queue_rows, batch_rows, max(1, args.batch_size))
    print(f"priority_queue_csv={PRIORITY_QUEUE_CSV}")
    print(f"batch_1_csv={BATCH_1_CSV}")
    print(f"batch_1_report={REPORT_PATH}")
    print(f"priority_queue_rows={len(queue_rows)}")
    print(f"batch_1_rows={len(batch_rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
