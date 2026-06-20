from __future__ import annotations

import sys
from collections import Counter, defaultdict
from pathlib import Path

from electoral_geo_utils import (
    ELECTION_ID,
    INTERIM_GEO_DIR,
    PROCESSED_GEO_DIR,
    QA_DIR,
    bool_text,
    civics_to_geodataframe,
    geometry_confidence,
    load_boundary_32633,
    polygon_count,
    read_csv_rows,
    read_review_by_access_id,
    relpath,
    require_geospatial_dependencies,
    section_sort_key,
    write_csv_rows,
    write_gpkg,
)


CIVICS_V1_CSV = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025.csv"
CIVICS_V1_GPKG = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025.gpkg"
CIVICS_V2_CSV = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025_v2.csv"
CIVICS_V2_GPKG = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025_v2.gpkg"
POLYGONS_V1_GPKG = PROCESSED_GEO_DIR / "electoral_sections_candidate_2025_v1.gpkg"
POLYGONS_V2_GPKG = PROCESSED_GEO_DIR / "electoral_sections_candidate_2025_v2.gpkg"
SPATIAL_RESOLUTION_CSV = INTERIM_GEO_DIR / "spatially_resolved_review_points_2025.csv"


POINT_LAYER_V1 = "anncsu_lamezia_civics_with_electoral_section_2025"
POINT_LAYER_V2 = "anncsu_lamezia_civics_with_electoral_section_2025_v2"
POLYGON_LAYER_V1 = "electoral_sections_candidate_2025_v1"
POLYGON_LAYER_V2 = "electoral_sections_candidate_2025_v2"
SECTION_78 = "78"


V1_METHOD = "voronoi_from_deterministically_assigned_anncsu_civics"
V2_METHOD = "voronoi_from_deterministic_plus_spatially_resolved_anncsu_civics"


def valid_point_rows(gdf, *, include_spatially_resolved: bool = False):
    valid = gdf[
        gdf.geometry.notna()
        & ~gdf.geometry.is_empty
        & gdf["section_number"].astype(str).ne("")
        & gdf["section_number"].astype(str).ne(SECTION_78)
        & gdf["assignment_confidence"].isin(["high", "medium"])
    ].copy()
    if include_spatially_resolved:
        return valid[
            (valid["assignment_status"].astype(str) == "assigned")
            | (valid["assignment_method"].astype(str) == "spatially_resolved_candidate")
        ].copy()
    return valid[valid["assignment_status"].astype(str) == "assigned"].copy()


def prepare_voronoi_seeds(points_gdf):
    seeds: list[dict] = []
    grouped: dict[tuple[float, float], list[int]] = defaultdict(list)
    for idx, geom in points_gdf.geometry.items():
        grouped[(round(geom.x, 3), round(geom.y, 3))].append(idx)

    duplicate_conflicts = 0
    for key, indexes in grouped.items():
        sections = {str(points_gdf.loc[idx, "section_number"]) for idx in indexes}
        if len(sections) > 1:
            duplicate_conflicts += len(indexes)
            continue
        idx = indexes[0]
        seeds.append(
            {
                "x": key[0],
                "y": key[1],
                "section_number": str(points_gdf.loc[idx, "section_number"]),
                "source_point_count": len(indexes),
            }
        )
    return seeds, duplicate_conflicts


def build_candidate_polygons(points_gdf, *, version: str, method: str, boundary_geom):
    gpd, pd, shapely, cKDTree = require_geospatial_dependencies()
    from shapely import MultiPoint, voronoi_polygons
    from shapely.ops import unary_union

    seeds, duplicate_conflicts = prepare_voronoi_seeds(points_gdf)
    if len(seeds) < 4:
        raise RuntimeError(f"Need at least 4 unique seeds to build Voronoi polygons; found {len(seeds)}")

    seed_points = [(seed["x"], seed["y"]) for seed in seeds]
    seed_tree = cKDTree(seed_points)
    point_geom = MultiPoint(seed_points)
    envelope = boundary_geom.envelope.buffer(5_000)
    cells = voronoi_polygons(point_geom, extend_to=envelope)

    cells_by_section: dict[str, list] = defaultdict(list)
    for cell in cells.geoms:
        if cell.is_empty:
            continue
        rep = cell.representative_point()
        _distance, seed_index = seed_tree.query([rep.x, rep.y], k=1)
        clipped = cell.intersection(boundary_geom)
        if clipped.is_empty:
            continue
        section = seeds[int(seed_index)]["section_number"]
        cells_by_section[section].append(shapely.make_valid(clipped))

    deterministic_counts = Counter()
    spatial_counts = Counter()
    for _idx, row in points_gdf.iterrows():
        section = str(row["section_number"])
        if row.get("assignment_method") == "spatially_resolved_candidate":
            spatial_counts[section] += 1
        else:
            deterministic_counts[section] += 1

    records = []
    geometries = []
    for section in sorted(cells_by_section, key=section_sort_key):
        geometry = shapely.make_valid(unary_union(cells_by_section[section]))
        parts = polygon_count(geometry)
        det_points = deterministic_counts.get(section, 0)
        spatial_points = spatial_counts.get(section, 0)
        total_points = det_points + spatial_points
        area_sq_km = geometry.area / 1_000_000
        perimeter_km = geometry.length / 1_000
        confidence, needs_review, notes = geometry_confidence(total_points, parts, area_sq_km)
        common = {
            "section_number": section,
            "election_id": ELECTION_ID,
            "geometry_status": "candidate_inferred",
            "candidate_geometry_method": method,
            "area_sq_km": round(area_sq_km, 6),
            "perimeter_km": round(perimeter_km, 6),
            "polygon_count": parts,
            "geometry_confidence": confidence,
            "needs_manual_review": needs_review,
            "notes": notes,
        }
        if version == "v1":
            common["points_used"] = total_points
        else:
            common["deterministic_points_used"] = det_points
            common["spatially_resolved_points_used"] = spatial_points
            common["total_points_used"] = total_points
        records.append(common)
        geometries.append(geometry)

    out = gpd.GeoDataFrame(pd.DataFrame(records), geometry=geometries, crs="EPSG:32633")
    out.attrs["duplicate_coordinate_conflicts"] = duplicate_conflicts
    return out


def write_point_gpkg(gdf, path: Path, layer: str) -> None:
    columns = [
        "access_id",
        "ODONIMO",
        "CIVICO",
        "ESPONENTE",
        "COORD_X_COMUNE",
        "COORD_Y_COMUNE",
        "section_number",
        "rule_id",
        "assignment_method",
        "assignment_confidence",
        "human_review_required",
        "notes",
        "problem_type",
        "geometry",
    ]
    safe = gdf.copy()
    for col in columns:
        if col != "geometry" and col not in safe.columns:
            safe[col] = ""
    write_gpkg(safe[columns], path, layer, delete_existing=True)


def build_v2_csv(v1_rows: list[dict], resolution_rows: list[dict]) -> None:
    resolution_by_access = {row["access_id"]: row for row in resolution_rows}
    headers = list(v1_rows[0].keys())
    extra_headers = [
        "human_review_required",
        "problem_type",
        "spatial_resolution_method",
        "distance_to_boundary_m",
        "nearest_assigned_points_k",
        "nearest_assigned_points_same_section_share",
        "competing_sections",
        "spatial_resolution_confidence",
    ]
    for header in extra_headers:
        if header not in headers:
            headers.append(header)

    out_rows: list[dict] = []
    for row in v1_rows:
        out = dict(row)
        access_id = row.get("PROGRESSIVO_ACCESSO", "")
        resolution = resolution_by_access.get(access_id)
        if resolution and resolution.get("spatial_resolution_method") == "spatially_resolved_candidate":
            out["section_number"] = resolution.get("resolved_section_number", "")
            out["rule_id"] = "spatially_resolved_candidate"
            out["assignment_method"] = "spatially_resolved_candidate"
            out["assignment_confidence"] = resolution.get("spatial_resolution_confidence", "medium")
            out["assignment_status"] = "assigned"
            out["assignment_notes"] = (
                f"Spatial candidate: inside section {out['section_number']}; "
                f"distance_to_boundary_m={resolution.get('distance_to_boundary_m', '')}; "
                f"nearest_share={resolution.get('nearest_assigned_points_same_section_share', '')}."
            )
            out["human_review_required"] = "false"
        else:
            out["human_review_required"] = "false" if row.get("assignment_status") == "assigned" else "true"
        if resolution:
            out["problem_type"] = resolution.get("original_problem_type", "")
            for header in extra_headers[2:]:
                out[header] = resolution.get(header, "")
        else:
            out["problem_type"] = ""
        out_rows.append(out)
    write_csv_rows(CIVICS_V2_CSV, out_rows, headers)


def main() -> int:
    if not CIVICS_V1_CSV.exists():
        print(f"missing_input={CIVICS_V1_CSV}", file=sys.stderr)
        return 1

    boundary_geom, boundary_source = load_boundary_32633()
    if boundary_geom is None:
        print(f"municipal_boundary_status={boundary_source}", file=sys.stderr)
        return 1

    review_by_access = read_review_by_access_id()
    civics_gdf = civics_to_geodataframe(CIVICS_V1_CSV, review_by_access)
    write_point_gpkg(civics_gdf, CIVICS_V1_GPKG, POINT_LAYER_V1)

    v1_points = valid_point_rows(civics_gdf)
    v1_polygons = build_candidate_polygons(v1_points, version="v1", method=V1_METHOD, boundary_geom=boundary_geom)
    write_gpkg(v1_polygons, POLYGONS_V1_GPKG, POLYGON_LAYER_V1, delete_existing=True)

    print("candidate electoral section polygons V1")
    print(f"boundary_source={boundary_source}")
    print(f"civics_total={len(civics_gdf)}")
    print(f"v1_points_used={len(v1_points)}")
    print(f"v1_sections={len(v1_polygons)}")
    print(f"point_gpkg={CIVICS_V1_GPKG}")
    print(f"v1_gpkg={POLYGONS_V1_GPKG}")

    if SPATIAL_RESOLUTION_CSV.exists():
        v1_rows = read_csv_rows(CIVICS_V1_CSV)
        resolution_rows = read_csv_rows(SPATIAL_RESOLUTION_CSV)
        build_v2_csv(v1_rows, resolution_rows)
        v2_review_by_access = {
            row.get("access_id", ""): {
                "reason": "" if row.get("spatial_resolution_method") == "spatially_resolved_candidate" else row.get("original_problem_type", "")
            }
            for row in resolution_rows
        }
        civics_v2_gdf = civics_to_geodataframe(CIVICS_V2_CSV, v2_review_by_access)
        write_point_gpkg(civics_v2_gdf, CIVICS_V2_GPKG, POINT_LAYER_V2)
        v2_points = valid_point_rows(civics_v2_gdf, include_spatially_resolved=True)
        v2_polygons = build_candidate_polygons(v2_points, version="v2", method=V2_METHOD, boundary_geom=boundary_geom)
        write_gpkg(v2_polygons, POLYGONS_V2_GPKG, POLYGON_LAYER_V2, delete_existing=True)
        print("candidate electoral section polygons V2")
        print(f"v2_points_used={len(v2_points)}")
        print(f"v2_sections={len(v2_polygons)}")
        print(f"v2_civics_csv={CIVICS_V2_CSV}")
        print(f"v2_point_gpkg={CIVICS_V2_GPKG}")
        print(f"v2_gpkg={POLYGONS_V2_GPKG}")
    else:
        print(f"spatial_resolution_csv=missing; V2 skipped until {relpath(SPATIAL_RESOLUTION_CSV)} exists")

    return 0


if __name__ == "__main__":
    sys.exit(main())
