from __future__ import annotations

import sys
from collections import Counter

from electoral_geo_utils import (
    INTERIM_GEO_DIR,
    PROCESSED_GEO_DIR,
    QA_DIR,
    decimal_it,
    parse_sections,
    read_csv_rows,
    relpath,
    require_geospatial_dependencies,
    section_sort_key,
    write_csv_rows,
)


CIVICS_CSV = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025.csv"
REVIEW_QUEUE_CSV = QA_DIR / "anncsu_electoral_assignment_review_queue_2025.csv"
POLYGONS_V1_GPKG = PROCESSED_GEO_DIR / "electoral_sections_candidate_2025_v1.gpkg"
POLYGON_LAYER_V1 = "electoral_sections_candidate_2025_v1"
OUTPUT_CSV = INTERIM_GEO_DIR / "spatially_resolved_review_points_2025.csv"


MIN_DISTANCE_TO_BOUNDARY_M = 50.0
K_NEAREST_ASSIGNED_POINTS = 12
MIN_NEIGHBOR_SHARE = 0.80
SECTION_78 = "78"


HEADERS = [
    "access_id",
    "odonimo_raw",
    "civico",
    "esponente",
    "coord_x",
    "coord_y",
    "original_problem_type",
    "original_candidate_sections",
    "resolved_section_number",
    "spatial_resolution_method",
    "distance_to_boundary_m",
    "nearest_assigned_points_k",
    "nearest_assigned_points_same_section_share",
    "competing_sections",
    "spatial_resolution_confidence",
    "still_requires_manual_review",
    "notes",
]


def load_civics_by_access_id() -> dict[str, dict]:
    return {row.get("PROGRESSIVO_ACCESSO", ""): row for row in read_csv_rows(CIVICS_CSV)}


def review_points_gdf():
    gpd, pd, _shapely, _tree = require_geospatial_dependencies()
    civics = load_civics_by_access_id()
    records = []
    geometries = []
    for review in read_csv_rows(REVIEW_QUEUE_CSV):
        access_id = review.get("anncsu_progressivo_accesso", "")
        civic = civics.get(access_id, {})
        lon = decimal_it(civic.get("COORD_X_COMUNE", ""))
        lat = decimal_it(civic.get("COORD_Y_COMUNE", ""))
        record = {**review, **civic, "access_id": access_id, "coord_x": lon, "coord_y": lat}
        records.append(record)
        geometries.append(None if lon is None or lat is None else gpd.points_from_xy([lon], [lat], crs="EPSG:4326")[0])
    gdf = gpd.GeoDataFrame(pd.DataFrame(records), geometry=geometries, crs="EPSG:4326")
    return gdf.to_crs("EPSG:32633")


def deterministic_points():
    gpd, pd, _shapely, _tree = require_geospatial_dependencies()
    records = []
    geometries = []
    for row in read_csv_rows(CIVICS_CSV):
        if row.get("assignment_status") != "assigned":
            continue
        if row.get("section_number") in ("", SECTION_78):
            continue
        if row.get("assignment_confidence") not in {"high", "medium"}:
            continue
        lon = decimal_it(row.get("COORD_X_COMUNE", ""))
        lat = decimal_it(row.get("COORD_Y_COMUNE", ""))
        if lon is None or lat is None:
            continue
        records.append(row)
        geometries.append(gpd.points_from_xy([lon], [lat], crs="EPSG:4326")[0])
    return gpd.GeoDataFrame(pd.DataFrame(records), geometry=geometries, crs="EPSG:4326").to_crs("EPSG:32633")


def nearest_polygon_info(point, polygons_gdf):
    distances = polygons_gdf.geometry.boundary.distance(point)
    nearest_idx = distances.idxmin()
    nearest = polygons_gdf.loc[nearest_idx]
    return str(nearest["section_number"]), float(distances.loc[nearest_idx])


def sections_covering_point(point, polygons_gdf) -> list[str]:
    matches = polygons_gdf[polygons_gdf.geometry.covers(point)]
    return sorted({str(value) for value in matches["section_number"].tolist()}, key=section_sort_key)


def neighbor_support(point, assigned_gdf, tree, k: int) -> tuple[str, float, str]:
    if assigned_gdf.empty:
        return "", 0.0, ""
    use_k = min(k, len(assigned_gdf))
    distances, indexes = tree.query([point.x, point.y], k=use_k)
    if use_k == 1:
        indexes = [int(indexes)]
    sections = [str(assigned_gdf.iloc[int(index)]["section_number"]) for index in indexes]
    counts = Counter(sections)
    section, count = counts.most_common(1)[0]
    competing = "; ".join(f"{key}:{value}" for key, value in sorted(counts.items(), key=lambda item: section_sort_key(item[0])))
    return section, count / use_k, competing


def classify_review_point(row, polygons_gdf, assigned_gdf, tree) -> dict:
    point = row.geometry
    access_id = row.get("access_id", "")
    lon = row.get("coord_x")
    lat = row.get("coord_y")
    original_problem = row.get("reason", "")
    candidate_sections = parse_sections(row.get("candidate_sections", ""))
    base = {
        "access_id": access_id,
        "odonimo_raw": row.get("ODONIMO") or row.get("anncsu_odonimo", ""),
        "civico": row.get("CIVICO") or row.get("civico", ""),
        "esponente": row.get("ESPONENTE") or row.get("esponente", ""),
        "coord_x": "" if lon is None else lon,
        "coord_y": "" if lat is None else lat,
        "original_problem_type": original_problem,
        "original_candidate_sections": "; ".join(sorted(candidate_sections, key=section_sort_key)),
        "resolved_section_number": "",
        "spatial_resolution_method": "unresolved_no_spatial_support",
        "distance_to_boundary_m": "",
        "nearest_assigned_points_k": str(K_NEAREST_ASSIGNED_POINTS),
        "nearest_assigned_points_same_section_share": "",
        "competing_sections": "",
        "spatial_resolution_confidence": "",
        "still_requires_manual_review": "true",
        "notes": "",
    }
    if point is None or point.is_empty:
        base["notes"] = "missing or invalid coordinates"
        return base

    covering = sections_covering_point(point, polygons_gdf)
    nearest_section, nearest_boundary_distance = nearest_polygon_info(point, polygons_gdf)
    base["resolved_section_number"] = covering[0] if len(covering) == 1 else nearest_section
    base["distance_to_boundary_m"] = round(nearest_boundary_distance, 3)

    neighbor_section, share, competing = neighbor_support(point, assigned_gdf, tree, K_NEAREST_ASSIGNED_POINTS)
    base["nearest_assigned_points_same_section_share"] = round(share, 4)
    base["competing_sections"] = competing

    if len(covering) != 1:
        base["spatial_resolution_method"] = "unresolved_no_spatial_support"
        base["notes"] = f"point is covered by {len(covering)} candidate sections"
        return base
    resolved_section = covering[0]

    if nearest_boundary_distance < MIN_DISTANCE_TO_BOUNDARY_M:
        base["spatial_resolution_method"] = "unresolved_near_boundary"
        base["notes"] = f"distance_to_boundary_m below {MIN_DISTANCE_TO_BOUNDARY_M}"
        return base

    if neighbor_section != resolved_section or share < MIN_NEIGHBOR_SHARE:
        base["spatial_resolution_method"] = "spatial_hint_only"
        base["notes"] = "nearest assigned points do not meet section-share threshold"
        return base

    if candidate_sections:
        if candidate_sections == {resolved_section}:
            pass
        else:
            base["spatial_resolution_method"] = "unresolved_conflict"
            base["notes"] = "candidate_sections from textual review queue compete with spatial section"
            return base

    if original_problem in {"ambiguous_multiple_rules", "no_civic_rule_match"}:
        base["spatial_resolution_method"] = "unresolved_conflict"
        base["notes"] = "review reason indicates explicit textual ambiguity or civic-rule mismatch"
        return base

    base["spatial_resolution_method"] = "spatially_resolved_candidate"
    base["spatial_resolution_confidence"] = "medium"
    base["still_requires_manual_review"] = "false"
    base["notes"] = (
        f"inside one V1 candidate section; boundary distance >= {MIN_DISTANCE_TO_BOUNDARY_M}m; "
        f"{K_NEAREST_ASSIGNED_POINTS} nearest assigned points support section at >= {MIN_NEIGHBOR_SHARE:.0%}"
    )
    return base


def main() -> int:
    if not POLYGONS_V1_GPKG.exists():
        print(f"missing_v1_polygons={POLYGONS_V1_GPKG}", file=sys.stderr)
        return 1
    gpd, _pd, _shapely, cKDTree = require_geospatial_dependencies()
    polygons = gpd.read_file(POLYGONS_V1_GPKG, layer=POLYGON_LAYER_V1)
    review = review_points_gdf()
    assigned = deterministic_points()
    if assigned.empty:
        print("No deterministic assigned points available", file=sys.stderr)
        return 1
    tree = cKDTree([(geom.x, geom.y) for geom in assigned.geometry])

    rows = [classify_review_point(row, polygons, assigned, tree) for _idx, row in review.iterrows()]
    write_csv_rows(OUTPUT_CSV, rows, HEADERS)

    counts = Counter(row["spatial_resolution_method"] for row in rows)
    print("spatial review resolution")
    print(f"review_points={len(rows)}")
    for key, value in sorted(counts.items()):
        print(f"{key}={value}")
    print(f"output={OUTPUT_CSV}")
    print(f"relative_path={relpath(OUTPUT_CSV)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
