from __future__ import annotations

import argparse
import math
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import QA_DIR, read_csv_rows, relpath, write_csv_rows


SUSPECT_CSV = QA_DIR / "anncsu_coordinate_suspect_points_2025.csv"
DIAGNOSTIC_CSV = QA_DIR / "anncsu_coordinate_corruption_diagnostic_2025.csv"
GEOCODE_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_geocode_candidates_2025.csv"
LOCAL_ANCHOR_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_local_anchor_candidates_2025.csv"

DEFAULT_BATCH_ID = "anncsu_dedicated_geocoder_batch_1_2025"
BATCH_CSV = QA_DIR / "anncsu_coordinate_dedicated_geocoder_batch_1_2025.csv"
REPORT_PATH = QA_DIR / "anncsu_coordinate_dedicated_geocoder_batch_1_report_2025.md"

OUTPUT_FIELDS = [
    "provider_batch_id",
    "batch_rank",
    "access_id",
    "address_query",
    "street",
    "house_number",
    "house_number_suffix",
    "city",
    "province",
    "region",
    "country",
    "source_lon",
    "source_lat",
    "coordinate_quality_flag",
    "coordinate_suspect_reason",
    "source_diagnosis",
    "recovery_action",
    "existing_geocoder_status",
    "existing_geocoder_provider_confidence",
    "local_anchor_status",
    "local_anchor_confidence",
    "local_anchor_lon",
    "local_anchor_lat",
    "local_anchor_distance_from_source_m",
    "requested_provider_instruction",
    "result_lon",
    "result_lat",
    "result_accuracy_m",
    "result_confidence",
    "result_match_type",
    "result_provider",
    "result_raw_id",
    "result_notes",
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


def decimal_text(value: Any) -> str:
    parsed = as_float(value)
    if math.isnan(parsed):
        return ""
    return f"{parsed:.7f}".rstrip("0").rstrip(".")


def address_query(row: dict[str, str]) -> str:
    street = as_text(row.get("odonimo_raw"))
    civic = as_text(row.get("civico"))
    exponent = as_text(row.get("esponente"))
    number = f"{civic}/{exponent}" if civic and exponent else civic
    return ", ".join(part for part in [f"{street} {number}".strip(), "Lamezia Terme", "Catanzaro", "Calabria", "Italia"] if part)


def first_by_access(rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    out: dict[str, dict[str, str]] = {}
    for row in rows:
        access_id = as_text(row.get("access_id"))
        if access_id and access_id not in out:
            out[access_id] = row
    return out


def geocoder_summary_by_access(rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    grouped: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        access_id = as_text(row.get("access_id"))
        if access_id:
            grouped.setdefault(access_id, []).append(row)
    out: dict[str, dict[str, str]] = {}
    for access_id, candidates in grouped.items():
        statuses = Counter(as_text(row.get("candidate_status")) or "blank" for row in candidates)
        confidences = Counter(as_text(row.get("provider_confidence")) or "blank" for row in candidates)
        has_review_candidate = statuses.get("candidate_requires_human_review", 0) > 0
        out[access_id] = {
            "existing_geocoder_status": "candidate_requires_human_review" if has_review_candidate else ";".join(sorted(statuses)),
            "existing_geocoder_provider_confidence": ";".join(sorted(confidences)),
            "has_review_candidate": "true" if has_review_candidate else "false",
        }
    return out


def local_anchor_best_by_access(rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    grouped: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        access_id = as_text(row.get("access_id"))
        if access_id:
            grouped.setdefault(access_id, []).append(row)

    def rank(row: dict[str, str]) -> tuple[int, int, float]:
        status_penalty = 0 if as_text(row.get("candidate_status")) == "candidate_requires_human_review" else 9
        confidence_order = {"medium": 0, "low": 1, "": 9}
        distance = as_float(row.get("distance_from_source_m"))
        if math.isnan(distance):
            distance = 999_999_999.0
        return (status_penalty, confidence_order.get(as_text(row.get("candidate_confidence")), 8), distance)

    return {access_id: sorted(candidates, key=rank)[0] for access_id, candidates in grouped.items()}


def priority(row: dict[str, str], geocoder: dict[str, str]) -> tuple[int, str]:
    if geocoder.get("has_review_candidate") == "true":
        return (9, "already_has_review_candidate")
    flag = as_text(row.get("coordinate_quality_flag"))
    if flag in {"missing_coordinate", "implausible_coordinate", "possible_xy_swap"}:
        return (0, "P1_dedicated_provider_required")
    if flag in {"outside_boundary", "street_context_mismatch"}:
        return (1, "P2_dedicated_provider_high_value")
    if flag in {"same_street_outlier", "isolated_point", "needs_manual_coordinate_review"}:
        return (2, "P2_dedicated_provider_useful")
    return (3, "P3_optional_provider_context")


def write_report(rows: list[dict[str, str]], selected_rows: list[dict[str, str]], skipped_existing: int, batch_id: str) -> None:
    priority_counts = Counter(row["requested_provider_instruction"] for row in selected_rows)
    flag_counts = Counter(row["coordinate_quality_flag"] for row in selected_rows)
    lines = [
        "# ANNCSU Dedicated Geocoder Batch 1 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Result",
        "",
        f"- Batch ID: `{batch_id}`",
        f"- Eligible suspect rows inspected: {len(rows)}",
        f"- Exported rows: {len(selected_rows)}",
        f"- Skipped rows with existing reviewable geocoder candidate: {skipped_existing}",
        f"- Batch CSV: `{relpath(BATCH_CSV)}`",
        "",
        "This file is a provider handoff template. It does not call a provider and does not modify ANNCSU raw coordinates, processed civic assignments, GPKG files, polygons, or public UI.",
        "",
        "## Provider Instructions",
        "",
        "- Use only a provider, internal service, or dedicated Nominatim instance whose terms allow this batch size.",
        "- Fill `result_lon`, `result_lat`, `result_accuracy_m`, `result_confidence`, `result_match_type`, `result_provider`, `result_raw_id`, and `result_notes`.",
        "- Do not write accepted coordinate overrides in this file. Results become review candidates only after import.",
        "",
        "## Requested Provider Instruction Counts",
        "",
    ]
    for key, value in sorted(priority_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Coordinate Quality Flags", ""])
    for key, value in sorted(flag_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(
        [
            "",
            "## Next Step",
            "",
            "After a provider fills the result columns, run `scripts/import_anncsu_dedicated_geocoder_results.py --input data/interim/qa/anncsu_coordinate_dedicated_geocoder_batch_1_2025.csv`.",
            "Imported provider rows remain `candidate_requires_human_review` evidence; they are not effective coordinate overrides or training rows until a reviewer accepts them.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare a provider-agnostic ANNCSU geocoder handoff CSV.")
    parser.add_argument("--batch-id", default=DEFAULT_BATCH_ID)
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--include-existing", action="store_true", help="Include rows that already have reviewable geocoder candidates.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.limit <= 0:
        print("--limit must be positive", file=sys.stderr)
        return 1
    missing = [path for path in [SUSPECT_CSV, DIAGNOSTIC_CSV] if not path.exists()]
    if missing:
        for path in missing:
            print(f"missing_input={path}", file=sys.stderr)
        return 1

    suspect_rows = read_csv_rows(SUSPECT_CSV)
    diagnostics_by_access = first_by_access(read_csv_rows(DIAGNOSTIC_CSV))
    geocoder_by_access = geocoder_summary_by_access(read_csv_rows(GEOCODE_CANDIDATES_CSV))
    local_by_access = local_anchor_best_by_access(read_csv_rows(LOCAL_ANCHOR_CANDIDATES_CSV))
    ranked: list[tuple[int, str, dict[str, str]]] = []
    skipped_existing = 0
    for suspect in suspect_rows:
        access_id = as_text(suspect.get("access_id"))
        diagnostic = diagnostics_by_access.get(access_id, {})
        geocoder = geocoder_by_access.get(access_id, {})
        rank_value, instruction = priority(suspect, geocoder)
        if geocoder.get("has_review_candidate") == "true" and not args.include_existing:
            skipped_existing += 1
            continue
        local = local_by_access.get(access_id, {})
        row = {
            "provider_batch_id": args.batch_id,
            "access_id": access_id,
            "address_query": address_query(suspect),
            "street": as_text(suspect.get("odonimo_raw")),
            "house_number": as_text(suspect.get("civico")),
            "house_number_suffix": as_text(suspect.get("esponente")),
            "city": "Lamezia Terme",
            "province": "Catanzaro",
            "region": "Calabria",
            "country": "Italia",
            "source_lon": decimal_text(suspect.get("coord_x")),
            "source_lat": decimal_text(suspect.get("coord_y")),
            "coordinate_quality_flag": as_text(suspect.get("coordinate_quality_flag")),
            "coordinate_suspect_reason": as_text(suspect.get("coordinate_suspect_reason")),
            "source_diagnosis": as_text(diagnostic.get("source_diagnosis")),
            "recovery_action": as_text(diagnostic.get("recovery_action") or suspect.get("suggested_action")),
            "existing_geocoder_status": as_text(geocoder.get("existing_geocoder_status")),
            "existing_geocoder_provider_confidence": as_text(geocoder.get("existing_geocoder_provider_confidence")),
            "local_anchor_status": as_text(local.get("candidate_status")),
            "local_anchor_confidence": as_text(local.get("candidate_confidence")),
            "local_anchor_lon": decimal_text(local.get("candidate_lon")),
            "local_anchor_lat": decimal_text(local.get("candidate_lat")),
            "local_anchor_distance_from_source_m": as_text(local.get("distance_from_source_m")),
            "requested_provider_instruction": instruction,
        }
        ranked.append((rank_value, access_id, row))

    selected = [row for _rank, _access_id, row in sorted(ranked, key=lambda item: (item[0], item[1]))[: args.limit]]
    for index, row in enumerate(selected, start=1):
        row["batch_rank"] = index

    write_csv_rows(BATCH_CSV, selected, OUTPUT_FIELDS)
    write_report(suspect_rows, selected, skipped_existing, args.batch_id)
    print(f"dedicated_geocoder_batch_csv={BATCH_CSV}")
    print(f"dedicated_geocoder_report={REPORT_PATH}")
    print(f"eligible_rows={len(suspect_rows)}")
    print(f"exported_rows={len(selected)}")
    print(f"skipped_existing_review_candidates={skipped_existing}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
