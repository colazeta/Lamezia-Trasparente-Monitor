from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import QA_DIR, ROOT, read_csv_rows, relpath, write_csv_rows


DEFAULT_INPUT_CSV = QA_DIR / "anncsu_coordinate_dedicated_geocoder_batch_1_2025.csv"
CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_geocode_candidates_2025.csv"
REPORT_PATH = QA_DIR / "anncsu_coordinate_dedicated_geocoder_import_report_2025.md"
WORKBENCH_DATA_DIR = ROOT / "tools" / "electoral-review-workbench" / "public" / "data"
WORKBENCH_CANDIDATES_JSON = WORKBENCH_DATA_DIR / "coordinate_geocode_candidates_by_access.json"

LAMEZIA_BBOX = (16.0, 38.75, 16.6, 39.15)
CONFIDENCE_VALUES = {"medium", "low", "low_street_level", "very_low", "reject_outside_context"}

CANDIDATE_FIELDS = [
    "access_id",
    "provider",
    "query",
    "query_variant",
    "candidate_rank",
    "candidate_lon",
    "candidate_lat",
    "candidate_display_name",
    "candidate_class",
    "candidate_type",
    "candidate_importance",
    "candidate_place_rank",
    "candidate_has_house_number",
    "within_lamezia_bbox",
    "distance_from_source_m",
    "provider_confidence",
    "candidate_status",
    "provider_license",
    "cache_key",
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
    return f"{parsed:.7f}"


def within_lamezia_bbox(lon: float, lat: float) -> bool:
    west, south, east, north = LAMEZIA_BBOX
    return west <= lon <= east and south <= lat <= north


def haversine_m(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    if any(math.isnan(value) for value in [lon1, lat1, lon2, lat2]):
        return math.nan
    radius = 6_371_000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def candidate_key(row: dict[str, Any]) -> tuple[str, str, str, str, str, str, str, str]:
    return (
        as_text(row.get("access_id")),
        as_text(row.get("provider")),
        as_text(row.get("query_variant")),
        as_text(row.get("cache_key")),
        as_text(row.get("candidate_rank")),
        as_text(row.get("candidate_lon")),
        as_text(row.get("candidate_lat")),
        as_text(row.get("candidate_status")),
    )


def merge_candidates(existing: list[dict[str, Any]], new_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str, str, str, str, str, str]] = set()
    for row in [*existing, *new_rows]:
        key = candidate_key(row)
        if key in seen:
            continue
        seen.add(key)
        merged.append(row)
    return merged


def workbench_payload(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, str]]]:
    grouped: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        access_id = as_text(row.get("access_id"))
        if not access_id:
            continue
        grouped.setdefault(access_id, []).append(
            {
                "provider": as_text(row.get("provider")),
                "query": as_text(row.get("query")),
                "query_variant": as_text(row.get("query_variant")),
                "candidate_rank": as_text(row.get("candidate_rank")),
                "candidate_lon": as_text(row.get("candidate_lon")),
                "candidate_lat": as_text(row.get("candidate_lat")),
                "candidate_display_name": as_text(row.get("candidate_display_name")),
                "candidate_type": as_text(row.get("candidate_type")),
                "candidate_has_house_number": as_text(row.get("candidate_has_house_number")),
                "within_lamezia_bbox": as_text(row.get("within_lamezia_bbox")),
                "distance_from_source_m": as_text(row.get("distance_from_source_m")),
                "provider_confidence": as_text(row.get("provider_confidence")),
                "candidate_status": as_text(row.get("candidate_status")),
            }
        )
    return grouped


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def normalized_confidence(value: str, match_type: str, in_bbox: bool) -> str:
    confidence = as_text(value).lower()
    if confidence == "high":
        return "medium"
    if confidence in CONFIDENCE_VALUES:
        return confidence
    if not in_bbox:
        return "reject_outside_context"
    if as_text(match_type).lower() in {"house", "house_number", "address", "parcel", "building"}:
        return "medium"
    if as_text(match_type):
        return "low"
    return "low_street_level"


def imported_candidate_for(row: dict[str, str], candidate_rank: int) -> dict[str, str] | None:
    access_id = as_text(row.get("access_id"))
    lon = as_float(row.get("result_lon"))
    lat = as_float(row.get("result_lat"))
    if not access_id or math.isnan(lon) or math.isnan(lat):
        return None
    source_lon = as_float(row.get("source_lon"))
    source_lat = as_float(row.get("source_lat"))
    in_bbox = within_lamezia_bbox(lon, lat)
    confidence = normalized_confidence(as_text(row.get("result_confidence")), as_text(row.get("result_match_type")), in_bbox)
    provider = as_text(row.get("result_provider")) or "dedicated_geocoder"
    raw_id = as_text(row.get("result_raw_id"))
    key_material = "|".join([provider, raw_id, access_id, decimal_text(lon), decimal_text(lat), as_text(row.get("address_query"))])
    distance = haversine_m(source_lon, source_lat, lon, lat)
    return {
        "access_id": access_id,
        "provider": provider,
        "query": as_text(row.get("address_query")),
        "query_variant": "dedicated_provider",
        "candidate_rank": candidate_rank,
        "candidate_lon": decimal_text(lon),
        "candidate_lat": decimal_text(lat),
        "candidate_display_name": as_text(row.get("result_notes") or row.get("address_query")),
        "candidate_class": "provider_result",
        "candidate_type": as_text(row.get("result_match_type")),
        "candidate_importance": "",
        "candidate_place_rank": "",
        "candidate_has_house_number": "true" if confidence == "medium" else "false",
        "within_lamezia_bbox": "true" if in_bbox else "false",
        "distance_from_source_m": "" if math.isnan(distance) else f"{distance:.1f}",
        "provider_confidence": confidence,
        "candidate_status": "candidate_requires_human_review" if confidence != "reject_outside_context" else "rejected_context",
        "provider_license": "Dedicated provider result; verify provider terms and source license before reuse",
        "cache_key": hashlib.sha256(key_material.encode("utf-8")).hexdigest(),
    }


def write_report(input_path: Path, imported_rows: list[dict[str, str]], candidate_rows: list[dict[str, Any]]) -> None:
    status_counts = Counter(as_text(row.get("candidate_status")) for row in imported_rows)
    confidence_counts = Counter(as_text(row.get("provider_confidence")) for row in imported_rows)
    access_ids = {as_text(row.get("access_id")) for row in candidate_rows if as_text(row.get("access_id"))}
    lines = [
        "# ANNCSU Dedicated Geocoder Import 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Result",
        "",
        f"- Input CSV: `{relpath(input_path)}`",
        f"- Imported candidate rows: {len(imported_rows)}",
        f"- Candidate access_ids after import: {len(access_ids)}",
        f"- Candidate CSV: `{relpath(CANDIDATES_CSV)}`",
        f"- Workbench candidate JSON: `{relpath(WORKBENCH_CANDIDATES_JSON)}`",
        "",
        "Imported rows are provider candidates only. They do not overwrite ANNCSU raw coordinates, processed civic assignments, GPKG files, polygons, public UI, or training rows.",
        "",
        "## Imported Candidate Status Counts",
        "",
    ]
    if status_counts:
        for key, value in sorted(status_counts.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- No importable result rows found.")
    lines.extend(["", "## Imported Provider Confidence Counts", ""])
    if confidence_counts:
        for key, value in sorted(confidence_counts.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- No provider confidence values imported.")
    lines.extend(
        [
            "",
            "## Next Step",
            "",
            "Run `scripts/prepare_anncsu_coordinate_review_pack.py` and review imported provider candidates in the local workbench. Accepted replacements must still be exported as explicit `manual_coordinate_override` decisions.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import provider-filled dedicated geocoder results as review candidates.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT_CSV, help="Provider-filled CSV from prepare_anncsu_dedicated_geocoder_batch.py.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.input.exists():
        print(f"missing_input={args.input}", file=sys.stderr)
        return 1
    input_rows = read_csv_rows(args.input)
    imported_rows: list[dict[str, str]] = []
    for index, row in enumerate(input_rows, start=1):
        candidate = imported_candidate_for(row, index)
        if candidate is not None:
            imported_rows.append(candidate)

    existing_rows = read_csv_rows(CANDIDATES_CSV)
    candidate_rows = merge_candidates(existing_rows, imported_rows)
    if imported_rows:
        write_csv_rows(CANDIDATES_CSV, candidate_rows, CANDIDATE_FIELDS)
        write_json(WORKBENCH_CANDIDATES_JSON, workbench_payload(candidate_rows))
    write_report(args.input, imported_rows, candidate_rows)

    print(f"dedicated_geocoder_import_report={REPORT_PATH}")
    print(f"imported_candidate_rows={len(imported_rows)}")
    print(f"candidate_rows={len(candidate_rows)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
