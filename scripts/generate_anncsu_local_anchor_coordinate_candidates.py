from __future__ import annotations

import csv
import math
import statistics
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import QA_DIR, ROOT, decimal_it, read_csv_rows, relpath


CIVICS_V2_CSV = ROOT / "data" / "processed" / "geo" / "anncsu_lamezia_civics_with_electoral_section_2025_v2.csv"
SUSPECT_CSV = QA_DIR / "anncsu_coordinate_suspect_points_2025.csv"
CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_local_anchor_candidates_2025.csv"
REPORT_PATH = QA_DIR / "anncsu_coordinate_local_anchor_candidates_report_2025.md"

LAMEZIA_LON_RANGE = (16.0, 16.6)
LAMEZIA_LAT_RANGE = (38.75, 39.15)

OUTPUT_FIELDS = [
    "access_id",
    "provider",
    "candidate_method",
    "candidate_status",
    "candidate_lon",
    "candidate_lat",
    "candidate_confidence",
    "candidate_explanation",
    "source_lon",
    "source_lat",
    "distance_from_source_m",
    "street",
    "civico",
    "esponente",
    "coordinate_quality_flag",
    "anchor_count",
    "numeric_anchor_count",
    "lower_anchor_access_id",
    "lower_anchor_civic",
    "upper_anchor_access_id",
    "upper_anchor_civic",
    "nearest_anchor_access_id",
    "nearest_anchor_civic",
    "nearest_anchor_distance_m",
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


def decimal_text(value: float) -> str:
    if math.isnan(value):
        return ""
    return f"{value:.7f}".rstrip("0").rstrip(".")


def source_lon(row: dict[str, Any]) -> float:
    return as_float(row.get("COORD_X_COMUNE") or row.get("coord_x") or row.get("source_lon"))


def source_lat(row: dict[str, Any]) -> float:
    return as_float(row.get("COORD_Y_COMUNE") or row.get("coord_y") or row.get("source_lat"))


def plausible_lamezia(lon: float, lat: float) -> bool:
    return LAMEZIA_LON_RANGE[0] <= lon <= LAMEZIA_LON_RANGE[1] and LAMEZIA_LAT_RANGE[0] <= lat <= LAMEZIA_LAT_RANGE[1]


def civic_number(value: Any) -> int | None:
    digits = "".join(ch for ch in as_text(value) if ch.isdigit())
    return int(digits) if digits else None


def street_value(row: dict[str, Any]) -> str:
    return as_text(row.get("ODONIMO") or row.get("odonimo_raw") or row.get("street_name_normalised"))


def access_id(row: dict[str, Any]) -> str:
    return as_text(row.get("PROGRESSIVO_ACCESSO") or row.get("access_id"))


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


def anchor_record(row: dict[str, Any]) -> dict[str, Any]:
    lon = source_lon(row)
    lat = source_lat(row)
    return {
        "access_id": access_id(row),
        "street": street_value(row),
        "civico": as_text(row.get("CIVICO") or row.get("civico")),
        "esponente": as_text(row.get("ESPONENTE") or row.get("esponente")),
        "civic_number": civic_number(row.get("CIVICO") or row.get("civico")),
        "lon": lon,
        "lat": lat,
    }


def weighted_interpolation(lower: dict[str, Any], upper: dict[str, Any], number: int) -> tuple[float, float]:
    low = lower["civic_number"]
    high = upper["civic_number"]
    if low == high:
        return (lower["lon"] + upper["lon"]) / 2, (lower["lat"] + upper["lat"]) / 2
    weight = (number - low) / (high - low)
    lon = lower["lon"] + (upper["lon"] - lower["lon"]) * weight
    lat = lower["lat"] + (upper["lat"] - lower["lat"]) * weight
    return lon, lat


def nearest_anchor(lon: float, lat: float, anchors: list[dict[str, Any]]) -> tuple[dict[str, Any] | None, float]:
    best = None
    best_distance = math.inf
    for anchor in anchors:
        distance = haversine_m(lon, lat, anchor["lon"], anchor["lat"])
        if distance < best_distance:
            best = anchor
            best_distance = distance
    return best, best_distance


def candidate_for_suspect(
    suspect: dict[str, Any],
    source_row: dict[str, Any] | None,
    anchors: list[dict[str, Any]],
) -> dict[str, Any]:
    street = as_text(suspect.get("odonimo_raw") or street_value(source_row or {}))
    number = civic_number(suspect.get("civico") or (source_row or {}).get("CIVICO"))
    lon = as_float(suspect.get("coord_x") or (source_row or {}).get("COORD_X_COMUNE"))
    lat = as_float(suspect.get("coord_y") or (source_row or {}).get("COORD_Y_COMUNE"))
    numeric_anchors = sorted(
        [anchor for anchor in anchors if anchor.get("civic_number") is not None],
        key=lambda item: (item["civic_number"], item["access_id"]),
    )
    nearest, nearest_distance = nearest_anchor(lon, lat, anchors)
    method = "no_local_anchor_candidate"
    status = "no_candidate_returned"
    candidate_lon = math.nan
    candidate_lat = math.nan
    confidence = ""
    explanation = ""
    lower = None
    upper = None

    if number is not None:
        same_number = [anchor for anchor in numeric_anchors if anchor["civic_number"] == number]
        if same_number:
            candidate_lon = statistics.median(anchor["lon"] for anchor in same_number)
            candidate_lat = statistics.median(anchor["lat"] for anchor in same_number)
            method = "same_street_same_civic_number_anchor"
            status = "candidate_requires_human_review"
            confidence = "medium"
            explanation = f"{len(same_number)} same-street anchor(s) share civic number {number}."
        else:
            lower_candidates = [anchor for anchor in numeric_anchors if anchor["civic_number"] < number]
            upper_candidates = [anchor for anchor in numeric_anchors if anchor["civic_number"] > number]
            lower = lower_candidates[-1] if lower_candidates else None
            upper = upper_candidates[0] if upper_candidates else None
            if lower and upper:
                candidate_lon, candidate_lat = weighted_interpolation(lower, upper, number)
                method = "same_street_civic_number_interpolation"
                status = "candidate_requires_human_review"
                gap = upper["civic_number"] - lower["civic_number"]
                confidence = "medium" if gap <= 20 else "low"
                explanation = (
                    f"Interpolated civic {number} between same-street anchors "
                    f"{lower['civic_number']} and {upper['civic_number']}."
                )
            elif nearest:
                candidate_lon = nearest["lon"]
                candidate_lat = nearest["lat"]
                method = "nearest_same_street_numeric_anchor"
                status = "candidate_requires_human_review"
                confidence = "low"
                explanation = "Only one-sided or sparse numeric same-street anchors were available."
    elif anchors:
        candidate_lon = statistics.median(anchor["lon"] for anchor in anchors)
        candidate_lat = statistics.median(anchor["lat"] for anchor in anchors)
        method = "same_street_anchor_median"
        status = "candidate_requires_human_review"
        confidence = "low"
        explanation = "No numeric civic number was available; candidate is same-street anchor median."

    if status != "candidate_requires_human_review":
        explanation = "No reliable same-street local anchor candidate could be computed."

    distance_from_source = haversine_m(lon, lat, candidate_lon, candidate_lat)
    return {
        "access_id": as_text(suspect.get("access_id")),
        "provider": "local_anncsu_anchor",
        "candidate_method": method,
        "candidate_status": status,
        "candidate_lon": decimal_text(candidate_lon),
        "candidate_lat": decimal_text(candidate_lat),
        "candidate_confidence": confidence,
        "candidate_explanation": explanation,
        "source_lon": decimal_text(lon),
        "source_lat": decimal_text(lat),
        "distance_from_source_m": "" if math.isnan(distance_from_source) else f"{distance_from_source:.1f}",
        "street": street,
        "civico": as_text(suspect.get("civico") or (source_row or {}).get("CIVICO")),
        "esponente": as_text(suspect.get("esponente") or (source_row or {}).get("ESPONENTE")),
        "coordinate_quality_flag": as_text(suspect.get("coordinate_quality_flag")),
        "anchor_count": len(anchors),
        "numeric_anchor_count": len(numeric_anchors),
        "lower_anchor_access_id": as_text((lower or {}).get("access_id")),
        "lower_anchor_civic": as_text((lower or {}).get("civic_number")),
        "upper_anchor_access_id": as_text((upper or {}).get("access_id")),
        "upper_anchor_civic": as_text((upper or {}).get("civic_number")),
        "nearest_anchor_access_id": as_text((nearest or {}).get("access_id")),
        "nearest_anchor_civic": as_text((nearest or {}).get("civic_number")),
        "nearest_anchor_distance_m": "" if math.isinf(nearest_distance) else f"{nearest_distance:.1f}",
        "notes": "Local ANNCSU anchor candidate only; do not apply without human review.",
    }


def write_csv(rows: list[dict[str, Any]]) -> None:
    CANDIDATES_CSV.parent.mkdir(parents=True, exist_ok=True)
    with CANDIDATES_CSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in OUTPUT_FIELDS})


def write_report(rows: list[dict[str, Any]], source_count: int, anchor_count: int) -> None:
    method_counts = Counter(row["candidate_method"] for row in rows)
    status_counts = Counter(row["candidate_status"] for row in rows)
    confidence_counts = Counter(row["candidate_confidence"] for row in rows if row["candidate_confidence"])
    lines = [
        "# ANNCSU Local Anchor Coordinate Candidates 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Result",
        "",
        f"- Source civics checked: {source_count}",
        f"- Reliable local anchor civics: {anchor_count}",
        f"- Suspect rows processed: {len(rows)}",
        f"- Candidate CSV: `{relpath(CANDIDATES_CSV)}`",
        "",
        "This script creates local ANNCSU anchor candidates only. It does not modify ANNCSU raw coordinates, processed assignments, GPKG files, polygons, or public UI.",
        "",
        "## Candidate Status Counts",
        "",
    ]
    for key, value in sorted(status_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Candidate Method Counts", ""])
    for key, value in sorted(method_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Candidate Confidence Counts", ""])
    if confidence_counts:
        for key, value in sorted(confidence_counts.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- No candidate confidence values produced.")
    lines.extend(
        [
            "",
            "## Interpretation",
            "",
            "- `same_street_civic_number_interpolation` uses nearby non-suspect ANNCSU anchors on the same street and numeric civic sequence.",
            "- `same_street_same_civic_number_anchor`, `nearest_same_street_numeric_anchor`, and `same_street_anchor_median` are weaker review aids.",
            "- All rows remain `candidate_requires_human_review` until a reviewer exports a `manual_coordinate_override` decision.",
            "- Do not train from these candidates directly; train only from accepted manual overrides.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    missing = [path for path in [CIVICS_V2_CSV, SUSPECT_CSV] if not path.exists()]
    if missing:
        for path in missing:
            print(f"missing_input={path}", file=sys.stderr)
        return 1

    civics = read_csv_rows(CIVICS_V2_CSV)
    suspects = read_csv_rows(SUSPECT_CSV)
    suspect_ids = {as_text(row.get("access_id")) for row in suspects if as_text(row.get("access_id"))}
    source_by_access = {access_id(row): row for row in civics if access_id(row)}
    anchors_by_street: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in civics:
        row_access_id = access_id(row)
        if not row_access_id or row_access_id in suspect_ids:
            continue
        lon = source_lon(row)
        lat = source_lat(row)
        if not plausible_lamezia(lon, lat):
            continue
        street = street_value(row)
        if not street:
            continue
        anchors_by_street[street].append(anchor_record(row))

    rows = [
        candidate_for_suspect(
            suspect,
            source_by_access.get(as_text(suspect.get("access_id"))),
            anchors_by_street.get(as_text(suspect.get("odonimo_raw")), []),
        )
        for suspect in suspects
    ]
    rows.sort(key=lambda row: (row["candidate_status"], row["street"], row["civico"], row["access_id"]))
    write_csv(rows)
    write_report(rows, len(civics), sum(len(items) for items in anchors_by_street.values()))
    print(f"local_anchor_candidates_csv={CANDIDATES_CSV}")
    print(f"local_anchor_candidates_report={REPORT_PATH}")
    print(f"suspect_rows={len(rows)}")
    print(f"candidate_rows={sum(1 for row in rows if row['candidate_status'] == 'candidate_requires_human_review')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
