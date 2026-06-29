from __future__ import annotations

import argparse
import csv
import json
import math
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from electoral_geo_utils import (
    INTERIM_GEO_DIR,
    PROCESSED_GEO_DIR,
    QA_DIR,
    ROOT,
    civics_to_geodataframe,
    load_boundary_32633,
    read_csv_rows,
    read_review_by_access_id,
    relpath,
    require_geospatial_dependencies,
)


SOURCE_CSV = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025_v2.csv"
RECOVERY_LAYER_CSV = INTERIM_GEO_DIR / "anncsu_lamezia_coordinate_recovery_candidates_2025.csv"
ANNCSU_STREET_REGISTER_CSV = ROOT / "data" / "raw" / "geo" / "anncsu_lamezia_stradario_20260602.csv"
CELLS_GPKG = INTERIM_GEO_DIR / "electoral_section_census_cells_assignment_2025.gpkg"
CELLS_LAYER = "electoral_section_census_cells_assignment_2025"
DATA_DIR = ROOT / "tools" / "electoral-review-workbench" / "public" / "data"
TASKS_JSON = DATA_DIR / "civic_review_tasks.json"
CIVICS_BY_TASK_JSON = DATA_DIR / "civics_by_task.json"
REVIEW_POINTS_GEOJSON = DATA_DIR / "review_points.geojson"
DETERMINISTIC_POINTS_GEOJSON = DATA_DIR / "deterministic_points_sample.geojson"
SPATIALLY_RESOLVED_POINTS_GEOJSON = DATA_DIR / "spatially_resolved_points.geojson"

REPORT_PATH = QA_DIR / "anncsu_coordinate_quality_report_2025.md"
SUSPECT_CSV = QA_DIR / "anncsu_coordinate_suspect_points_2025.csv"

LAMEZIA_LON_RANGE = (16.0, 16.6)
LAMEZIA_LAT_RANGE = (38.75, 39.15)
BOUNDARY_BUFFER_M = 25.0
SAME_STREET_NEAR_M = 150.0
SAME_STREET_ISOLATED_M = 500.0
CLUSTER_OUTLIER_MIN_M = 1000.0
PROGRESSIVE_OUTLIER_MIN_M = 500.0
PROGRESSIVE_NEAREST_MIN_M = 250.0
STREET_CONTEXT_RADIUS_M = 120.0
STREET_CONTEXT_MIN_NEIGHBOURS = 4
STREET_CONTEXT_DOMINANT_SHARE = 0.60
STREET_CONTEXT_SAME_STREET_NEAR_M = 150.0

CSV_FIELDS = [
    "access_id",
    "odonimo_raw",
    "localita",
    "civico",
    "esponente",
    "coord_x",
    "coord_y",
    "section_number",
    "assignment_method",
    "coordinate_quality_flag",
    "coordinate_suspect_reason",
    "same_street_neighbour_count",
    "distance_to_same_street_cluster_m",
    "distance_to_nearest_same_street_m",
    "nearest_validated_street_context",
    "nearest_validated_street_context_count",
    "distance_to_nearest_different_street_m",
    "census_cell_id",
    "suggested_action",
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


def civic_numeric(value: Any) -> float:
    text = as_text(value)
    digits = "".join(ch for ch in text if ch.isdigit())
    return float(digits) if digits else math.nan


def street_value(row: dict[str, Any]) -> str:
    return as_text(row.get("street_name_normalised") or row.get("ODONIMO") or row.get("odonimo_raw"))


def load_anncsu_street_register_labels() -> set[str]:
    if not ANNCSU_STREET_REGISTER_CSV.exists():
        return set()
    with ANNCSU_STREET_REGISTER_CSV.open(encoding="utf-8", newline="") as handle:
        return {
            street
            for row in csv.DictReader(handle, delimiter=";")
            if (street := as_text(row.get("ODONIMO")))
        }


def load_json(path: Path) -> Any:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def geojson_access_ids(path: Path) -> set[str]:
    payload = load_json(path)
    if not payload:
        return set()
    return {
        as_text((feature.get("properties") or {}).get("access_id"))
        for feature in payload.get("features", [])
        if as_text((feature.get("properties") or {}).get("access_id"))
    }


def percentile(values: list[float], pct: float) -> float:
    if not values:
        return math.nan
    ordered = sorted(values)
    idx = (len(ordered) - 1) * pct
    low = math.floor(idx)
    high = math.ceil(idx)
    if low == high:
        return ordered[int(idx)]
    return ordered[low] + (ordered[high] - ordered[low]) * (idx - low)


def robust_threshold(distances: list[float]) -> float:
    if len(distances) < 5:
        return math.inf
    q1 = percentile(distances, 0.25)
    q3 = percentile(distances, 0.75)
    iqr = q3 - q1
    median = statistics.median(distances)
    mad = statistics.median([abs(value - median) for value in distances])
    return max(CLUSTER_OUTLIER_MIN_M, q3 + 4 * iqr, median + 6 * mad)


def metres(value: float) -> str:
    return "" if math.isnan(value) else f"{value:.1f}"


def plausible_lon_lat(lon: float, lat: float) -> str:
    if math.isnan(lon) or math.isnan(lat):
        return "missing_coordinate"
    if LAMEZIA_LAT_RANGE[0] <= lon <= LAMEZIA_LAT_RANGE[1] and LAMEZIA_LON_RANGE[0] <= lat <= LAMEZIA_LON_RANGE[1]:
        return "possible_xy_swap"
    if not (LAMEZIA_LON_RANGE[0] <= lon <= LAMEZIA_LON_RANGE[1]):
        return "implausible_coordinate"
    if not (LAMEZIA_LAT_RANGE[0] <= lat <= LAMEZIA_LAT_RANGE[1]):
        return "implausible_coordinate"
    return "ok"


def suggested_action(flag: str) -> str:
    if flag == "ok":
        return "keep_as_is"
    if flag in {"missing_coordinate", "implausible_coordinate", "possible_xy_swap"}:
        return "requires_external_coordinate_check"
    if flag == "outside_boundary":
        return "review_coordinate_before_geometry"
    return "exclude_from_future_geometry_until_reviewed"


def flag_priority(flag: str) -> int:
    order = {
        "ok": 0,
        "needs_manual_coordinate_review": 1,
        "street_context_mismatch": 2,
        "isolated_point": 2,
        "same_street_outlier": 3,
        "outside_boundary": 4,
        "implausible_coordinate": 5,
        "possible_xy_swap": 6,
        "missing_coordinate": 7,
    }
    return order.get(flag, 0)


def choose_flag(flags: set[str]) -> str:
    return max(flags or {"ok"}, key=flag_priority)


def accepted_recovery_coordinates(path: Path) -> dict[str, dict[str, str]]:
    accepted: dict[str, dict[str, str]] = {}
    for row in read_csv_rows(path):
        access_id = as_text(row.get("access_id"))
        if not access_id:
            continue
        if as_text(row.get("effective_coordinate_source")) != "manual_coordinate_override":
            continue
        if as_text(row.get("coordinate_recovery_status")) != "accepted_reviewed_override":
            continue
        lon = as_float(row.get("effective_lon"))
        lat = as_float(row.get("effective_lat"))
        if plausible_lon_lat(lon, lat) != "ok":
            continue
        accepted[access_id] = row
    return accepted


def apply_recovery_coordinates(civics, recovery_by_access: dict[str, dict[str, str]], gpd) -> int:
    if not recovery_by_access:
        civics["coordinate_audit_coordinate_source"] = "anncsu_source_coordinate"
        return 0
    civics["coordinate_audit_coordinate_source"] = "anncsu_source_coordinate"
    applied = 0
    for index, row in civics.iterrows():
        access_id = as_text(row.get("access_id"))
        recovery = recovery_by_access.get(access_id)
        if not recovery:
            continue
        lon = as_float(recovery.get("effective_lon"))
        lat = as_float(recovery.get("effective_lat"))
        if plausible_lon_lat(lon, lat) != "ok":
            continue
        geometry = gpd.GeoSeries(gpd.points_from_xy([lon], [lat], crs="EPSG:4326"), crs="EPSG:4326").to_crs(civics.crs).iloc[0]
        civics.at[index, "geometry"] = geometry
        civics.at[index, "COORD_X_COMUNE"] = f"{lon:.7f}".rstrip("0").rstrip(".")
        civics.at[index, "COORD_Y_COMUNE"] = f"{lat:.7f}".rstrip("0").rstrip(".")
        civics.at[index, "coord_x"] = lon
        civics.at[index, "coord_y"] = lat
        civics.at[index, "coordinate_audit_coordinate_source"] = "reviewed_recovery_coordinate"
        applied += 1
    return applied


def write_csv(rows: list[dict[str, Any]]) -> None:
    SUSPECT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with SUSPECT_CSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in CSV_FIELDS})


def write_report(
    rows: list[dict[str, Any]],
    all_count: int,
    source_context: dict[str, Any],
    task_count: int,
    workbench_access_count: int,
    missing_task_count: int,
    recovery_context: dict[str, Any],
) -> None:
    counts = Counter(row["coordinate_quality_flag"] for row in rows)
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# ANNCSU Coordinate Quality Audit 2025",
        "",
        "## Result",
        "",
        f"- Source civics checked: {all_count}",
        f"- Suspect civic coordinates: {len(rows)}",
        f"- Civic review tasks loaded: {task_count}",
        f"- Workbench point access_ids observed: {workbench_access_count}",
        f"- Suspect points missing from `civics_by_task`: {missing_task_count}",
        f"- Reviewed recovery coordinates applied for this audit: {recovery_context.get('applied_recovery_coordinates', 0)}",
        f"- Suspect CSV: `{relpath(SUSPECT_CSV)}`",
        "",
        "This audit does not alter ANNCSU raw data and does not assign sections by OpenStreetMap or proximity.",
        "It flags coordinates that need manual coordinate review before they are used as geometric evidence.",
        "",
        "## Sources",
        "",
        f"- Source CSV: `{relpath(SOURCE_CSV)}`",
        f"- ANNCSU street register: `{relpath(ANNCSU_STREET_REGISTER_CSV)}`",
        f"- Census cells: `{relpath(CELLS_GPKG)}` layer `{CELLS_LAYER}`",
        f"- Boundary source: `{source_context.get('boundary_source', 'missing')}`",
        f"- Recovery layer used: `{recovery_context.get('recovery_layer', 'none')}`",
        f"- Recovery layer accepted overrides available: {recovery_context.get('accepted_recovery_coordinates', 0)}",
        "",
        "## Flag Counts",
        "",
    ]
    if counts:
        for flag, count in sorted(counts.items()):
            lines.append(f"- `{flag}`: {count}")
    else:
        lines.append("- `ok`: all checked coordinates")
    lines.extend(
        [
            "",
            "## Checks Performed",
            "",
            "- Missing coordinates.",
            "- Implausible Lamezia lon/lat ranges and possible X/Y swaps.",
            f"- Outside municipal boundary candidate, with {BOUNDARY_BUFFER_M:.0f} m tolerance.",
            "- Same-street cluster outliers using robust distance thresholds.",
            f"- Isolated same-street points with no same-street neighbour within {SAME_STREET_NEAR_M:.0f} m and nearest same-street distance above {SAME_STREET_ISOLATED_M:.0f} m.",
            "- Rare census-cell placement for a street when combined with a spatial outlier signal.",
            f"- Street-context mismatch against nearby validated ANNCSU civics within {STREET_CONTEXT_RADIUS_M:.0f} m, using ANNCSU street-register labels rather than OSM labels.",
            f"- Progressive civic-number anomalies only when adjacent civic numbers are spatially distant and the nearest same-street civic is above {PROGRESSIVE_NEAREST_MIN_M:.0f} m.",
            "",
            "## Interpretation",
            "",
            "- `coordinate suspect` does not mean the civic label is wrong.",
            "- `coordinate suspect` does not by itself mean the electoral section is wrong.",
            "- The electoral section should still be reviewed against the electoral street register.",
            "- Future geometry generation may exclude or override these points only through a traced manual decision.",
            "- When run with `--use-recovery-layer`, only accepted reviewed `manual_coordinate_override` coordinates replace source coordinates for this QA pass.",
            "- OpenStreetMap remains visual context only.",
        ]
    )
    if rows:
        lines.extend(["", "## Sample Suspects", ""])
        for row in rows[:25]:
            lines.append(
                f"- `{row['access_id']}` {row['odonimo_raw']} {row['civico']}: "
                f"`{row['coordinate_quality_flag']}`; {row['coordinate_suspect_reason']}"
            )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit ANNCSU civic coordinate quality.")
    parser.add_argument(
        "--use-recovery-layer",
        action="store_true",
        help="Use accepted reviewed effective coordinates from the recovery layer for this audit pass.",
    )
    parser.add_argument(
        "--recovery-layer",
        type=Path,
        default=RECOVERY_LAYER_CSV,
        help="Recovery layer CSV produced by build_anncsu_coordinate_recovery_layer.py.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    gpd, pd, shapely, cKDTree = require_geospatial_dependencies()
    boundary, boundary_source = load_boundary_32633()
    cells = gpd.read_file(CELLS_GPKG, layer=CELLS_LAYER).to_crs("EPSG:32633")
    civics = civics_to_geodataframe(SOURCE_CSV, read_review_by_access_id())
    civics["access_id"] = civics["access_id"].astype(str)
    recovery_by_access: dict[str, dict[str, str]] = {}
    applied_recovery_coordinates = 0
    if args.use_recovery_layer:
        if not args.recovery_layer.exists():
            print(f"missing_recovery_layer={args.recovery_layer}", file=sys.stderr)
            return 1
        recovery_by_access = accepted_recovery_coordinates(args.recovery_layer)
        applied_recovery_coordinates = apply_recovery_coordinates(civics, recovery_by_access, gpd)
    official_streets = load_anncsu_street_register_labels()
    joined = gpd.sjoin(
        civics,
        cells[["census_cell_id", "geometry"]],
        how="left",
        predicate="covered_by",
    )
    joined["census_cell_id"] = joined["census_cell_id"].fillna("")
    joined = joined.sort_values(["access_id", "census_cell_id"]).drop_duplicates(subset=["access_id"], keep="first")

    records = [row.to_dict() for _idx, row in joined.iterrows()]
    by_street: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        by_street[street_value(record)].append(record)

    metrics_by_access: dict[str, dict[str, Any]] = {
        as_text(record.get("access_id")): {
            "neighbour_count": 0,
            "cluster_distance": math.nan,
            "nearest_same_street": math.nan,
            "nearest_validated_street_context": "",
            "nearest_validated_street_context_count": 0,
            "nearest_validated_street_context_share": 0.0,
            "nearest_different_street": math.nan,
            "nearest_same_context_street": math.nan,
            "same_context_street_count": 0,
            "progressive_distance": math.nan,
            "rare_cell": False,
        }
        for record in records
    }

    for street, street_rows in by_street.items():
        valid_rows = [row for row in street_rows if row.get("geometry") is not None and not row.get("geometry").is_empty]
        if len(valid_rows) < 2:
            continue
        coords = [(row["geometry"].x, row["geometry"].y) for row in valid_rows]
        tree = cKDTree(coords)
        centroid = shapely.MultiPoint([row["geometry"] for row in valid_rows]).centroid
        cluster_distances = [row["geometry"].distance(centroid) for row in valid_rows]
        threshold = robust_threshold(cluster_distances)
        cell_counts = Counter(as_text(row.get("census_cell_id")) for row in valid_rows if as_text(row.get("census_cell_id")))
        dominant_cell, dominant_cell_count = ("", 0)
        if cell_counts:
            dominant_cell, dominant_cell_count = cell_counts.most_common(1)[0]
        dominant_share = dominant_cell_count / len(valid_rows) if valid_rows else 0.0

        progressive_distances: dict[str, float] = {}
        numeric_rows = [row for row in valid_rows if not math.isnan(civic_numeric(row.get("CIVICO") or row.get("civico")))]
        numeric_rows.sort(key=lambda row: (civic_numeric(row.get("CIVICO") or row.get("civico")), as_text(row.get("ESPONENTE"))))
        for index, row in enumerate(numeric_rows):
            distances: list[float] = []
            for neighbour_index in [index - 1, index + 1]:
                if 0 <= neighbour_index < len(numeric_rows):
                    distances.append(row["geometry"].distance(numeric_rows[neighbour_index]["geometry"]))
            if distances:
                progressive_distances[as_text(row.get("access_id"))] = min(distances)
        progressive_values = [value for value in progressive_distances.values() if value > 0]
        progressive_threshold = max(
            PROGRESSIVE_OUTLIER_MIN_M,
            statistics.median(progressive_values) * 8 if progressive_values else PROGRESSIVE_OUTLIER_MIN_M,
        )

        for index, row in enumerate(valid_rows):
            access_id = as_text(row.get("access_id"))
            distances, _indexes = tree.query(coords[index], k=min(len(valid_rows), 6))
            distance_values = [float(value) for value in (distances if hasattr(distances, "__iter__") else [distances]) if float(value) > 0]
            nearest = min(distance_values) if distance_values else math.nan
            neighbour_count = len(tree.query_ball_point(coords[index], SAME_STREET_NEAR_M)) - 1
            cluster_distance = row["geometry"].distance(centroid)
            cell_id = as_text(row.get("census_cell_id"))
            rare_cell = bool(
                cell_id
                and dominant_cell
                and cell_id != dominant_cell
                and dominant_share >= 0.70
                and cell_counts.get(cell_id, 0) <= 1
                and cluster_distance > threshold
            )
            metrics_by_access[access_id].update(
                {
                    "neighbour_count": max(0, neighbour_count),
                    "cluster_distance": cluster_distance,
                    "nearest_same_street": nearest,
                    "same_street_threshold": threshold,
                    "progressive_distance": progressive_distances.get(access_id, math.nan),
                    "progressive_threshold": progressive_threshold,
                    "rare_cell": rare_cell,
                }
            )

    buffered_boundary = boundary.buffer(BOUNDARY_BUFFER_M) if boundary is not None else None
    validated_context_rows: list[dict[str, Any]] = []
    for row in records:
        geom = row.get("geometry")
        street = street_value(row)
        lon = as_float(row.get("COORD_X_COMUNE"))
        lat = as_float(row.get("COORD_Y_COMUNE"))
        if not street or (official_streets and street not in official_streets):
            continue
        if plausible_lon_lat(lon, lat) != "ok":
            continue
        if geom is None or geom.is_empty:
            continue
        if buffered_boundary is not None and not buffered_boundary.covers(geom):
            continue
        validated_context_rows.append(row)

    if len(validated_context_rows) >= 2:
        context_coords = [(row["geometry"].x, row["geometry"].y) for row in validated_context_rows]
        context_tree = cKDTree(context_coords)
        for index, row in enumerate(validated_context_rows):
            access_id = as_text(row.get("access_id"))
            street = street_value(row)
            neighbour_indexes = [
                neighbour_index
                for neighbour_index in context_tree.query_ball_point(context_coords[index], STREET_CONTEXT_RADIUS_M)
                if neighbour_index != index
            ]
            if not neighbour_indexes:
                continue
            neighbour_distances = {
                neighbour_index: float(row["geometry"].distance(validated_context_rows[neighbour_index]["geometry"]))
                for neighbour_index in neighbour_indexes
            }
            different = [
                neighbour_index
                for neighbour_index in neighbour_indexes
                if street_value(validated_context_rows[neighbour_index]) != street
            ]
            same = [
                neighbour_index
                for neighbour_index in neighbour_indexes
                if street_value(validated_context_rows[neighbour_index]) == street
            ]
            counts = Counter(street_value(validated_context_rows[neighbour_index]) for neighbour_index in different)
            dominant_street, dominant_count = ("", 0)
            if counts:
                dominant_street, dominant_count = counts.most_common(1)[0]
            nearest_different = min((neighbour_distances[idx] for idx in different), default=math.nan)
            nearest_same = min((neighbour_distances[idx] for idx in same), default=math.nan)
            denominator = len(neighbour_indexes)
            share = dominant_count / denominator if denominator else 0.0
            metrics_by_access[access_id].update(
                {
                    "nearest_validated_street_context": dominant_street,
                    "nearest_validated_street_context_count": dominant_count,
                    "nearest_validated_street_context_share": share,
                    "nearest_different_street": nearest_different,
                    "nearest_same_context_street": nearest_same,
                    "same_context_street_count": len(same),
                }
            )

    suspect_rows: list[dict[str, Any]] = []
    for row in records:
        access_id = as_text(row.get("access_id"))
        lon = as_float(row.get("COORD_X_COMUNE"))
        lat = as_float(row.get("COORD_Y_COMUNE"))
        flags: set[str] = set()
        reasons: list[str] = []
        plausibility = plausible_lon_lat(lon, lat)
        if plausibility != "ok":
            flags.add(plausibility)
            reasons.append(plausibility.replace("_", " "))

        geom = row.get("geometry")
        if plausibility == "ok" and buffered_boundary is not None and geom is not None and not geom.is_empty:
            if not buffered_boundary.covers(geom):
                flags.add("outside_boundary")
                distance = geom.distance(boundary)
                reasons.append(f"outside municipal boundary candidate by {distance:.1f} m")

        metrics = metrics_by_access.get(access_id, {})
        street_count = len(by_street.get(street_value(row), []))
        cluster_distance = float(metrics.get("cluster_distance", math.nan))
        threshold = float(metrics.get("same_street_threshold", math.inf))
        nearest_same_street = float(metrics.get("nearest_same_street", math.nan))
        progressive_distance = float(metrics.get("progressive_distance", math.nan))
        progressive_threshold = float(metrics.get("progressive_threshold", math.inf))
        street_context = as_text(metrics.get("nearest_validated_street_context"))
        street_context_count = int(metrics.get("nearest_validated_street_context_count", 0) or 0)
        street_context_share = float(metrics.get("nearest_validated_street_context_share", 0.0) or 0.0)
        nearest_different_street = float(metrics.get("nearest_different_street", math.nan))
        nearest_same_context_street = float(metrics.get("nearest_same_context_street", math.nan))
        same_context_street_count = int(metrics.get("same_context_street_count", 0) or 0)
        cluster_far = street_count >= 5 and not math.isnan(cluster_distance) and cluster_distance > threshold
        nearest_far = not math.isnan(nearest_same_street) and nearest_same_street > SAME_STREET_ISOLATED_M
        street_context_mismatch = (
            bool(street_context)
            and street_context != street_value(row)
            and street_context_count >= STREET_CONTEXT_MIN_NEIGHBOURS
            and street_context_share >= STREET_CONTEXT_DOMINANT_SHARE
            and (
                same_context_street_count == 0
                or (
                    not math.isnan(nearest_same_context_street)
                    and nearest_same_context_street > STREET_CONTEXT_SAME_STREET_NEAR_M
                )
            )
        )
        progressive_far = (
            street_count >= 5
            and not math.isnan(progressive_distance)
            and progressive_distance > progressive_threshold
            and not math.isnan(nearest_same_street)
            and nearest_same_street > PROGRESSIVE_NEAREST_MIN_M
        )
        if cluster_far and nearest_far:
            flags.add("same_street_outlier")
            reasons.append(f"{cluster_distance:.1f} m from same-street cluster centroid")
        if (
            street_count >= 5
            and int(metrics.get("neighbour_count", 0)) == 0
            and not math.isnan(nearest_same_street)
            and nearest_same_street > SAME_STREET_ISOLATED_M
        ):
            flags.add("isolated_point")
            reasons.append(f"nearest same-street civic is {nearest_same_street:.1f} m away")
        if metrics.get("rare_cell"):
            flags.add("needs_manual_coordinate_review")
            reasons.append("rare census-cell placement for same-street civics")
        if street_context_mismatch:
            flags.add("street_context_mismatch")
            reasons.append(
                f"point is near validated ANNCSU civics labelled {street_context} "
                f"({street_context_count} of nearby context within {STREET_CONTEXT_RADIUS_M:.0f} m)"
            )
        if progressive_far:
            flags.add("same_street_outlier")
            reasons.append(f"progressive civic-number neighbour is {progressive_distance:.1f} m away")

        flag = choose_flag(flags)
        if flag == "ok":
            continue
        suspect_rows.append(
            {
                "access_id": access_id,
                "odonimo_raw": as_text(row.get("ODONIMO")),
                "localita": as_text(row.get("LOCALITA'")),
                "civico": as_text(row.get("CIVICO")),
                "esponente": as_text(row.get("ESPONENTE")),
                "coord_x": as_text(row.get("COORD_X_COMUNE")),
                "coord_y": as_text(row.get("COORD_Y_COMUNE")),
                "section_number": as_text(row.get("section_number")),
                "assignment_method": as_text(row.get("assignment_method")),
                "coordinate_quality_flag": flag,
                "coordinate_suspect_reason": "; ".join(dict.fromkeys(reasons)),
                "same_street_neighbour_count": metrics.get("neighbour_count", 0),
                "distance_to_same_street_cluster_m": metres(cluster_distance),
                "distance_to_nearest_same_street_m": metres(nearest_same_street),
                "nearest_validated_street_context": street_context,
                "nearest_validated_street_context_count": street_context_count,
                "distance_to_nearest_different_street_m": metres(nearest_different_street),
                "census_cell_id": as_text(row.get("census_cell_id")),
                "suggested_action": suggested_action(flag),
                "notes": "Coordinate suspect is a geometry-quality signal only; do not modify ANNCSU raw.",
            }
        )

    task_payload = load_json(TASKS_JSON) or []
    civics_by_task = load_json(CIVICS_BY_TASK_JSON) or {}
    workbench_access = set()
    for rows in civics_by_task.values():
        for row in rows:
            if as_text(row.get("access_id")):
                workbench_access.add(as_text(row.get("access_id")))
    workbench_access |= geojson_access_ids(REVIEW_POINTS_GEOJSON)
    workbench_access |= geojson_access_ids(DETERMINISTIC_POINTS_GEOJSON)
    workbench_access |= geojson_access_ids(SPATIALLY_RESOLVED_POINTS_GEOJSON)
    civics_by_task_access = {
        as_text(row.get("access_id"))
        for rows in civics_by_task.values()
        for row in rows
        if as_text(row.get("access_id"))
    }
    missing_task_access = [
        row["access_id"] for row in suspect_rows if as_text(row.get("access_id")) not in civics_by_task_access
    ]

    suspect_rows.sort(key=lambda item: (flag_priority(item["coordinate_quality_flag"]) * -1, item["odonimo_raw"], item["civico"], item["access_id"]))
    write_csv(suspect_rows)
    write_report(
        suspect_rows,
        len(records),
        {"boundary_source": boundary_source},
        len(task_payload),
        len(workbench_access),
        len(missing_task_access),
        {
            "recovery_layer": relpath(args.recovery_layer) if args.use_recovery_layer else "none",
            "accepted_recovery_coordinates": len(recovery_by_access),
            "applied_recovery_coordinates": applied_recovery_coordinates,
        },
    )

    print(f"coordinate_quality_report={REPORT_PATH}")
    print(f"coordinate_suspect_csv={SUSPECT_CSV}")
    print(f"source_civics={len(records)}")
    print(f"accepted_recovery_coordinates={len(recovery_by_access)}")
    print(f"applied_recovery_coordinates={applied_recovery_coordinates}")
    print(f"suspect_points={len(suspect_rows)}")
    print(f"suspect_points_missing_from_civics_by_task={len(missing_task_access)}")
    return 1 if missing_task_access else 0


if __name__ == "__main__":
    sys.exit(main())
