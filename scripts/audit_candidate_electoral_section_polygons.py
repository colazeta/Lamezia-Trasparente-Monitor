from __future__ import annotations

import sys
from collections import Counter, defaultdict
from datetime import date

from electoral_geo_utils import (
    BOUNDARY_GEOJSON,
    ELECTION_ID,
    INTERIM_GEO_DIR,
    PROCESSED_GEO_DIR,
    QA_DIR,
    compactness_score,
    decimal_it,
    read_csv_rows,
    relpath,
    require_geospatial_dependencies,
    section_sort_key,
    write_csv_rows,
)


CIVICS_V1_CSV = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025.csv"
CIVICS_V2_CSV = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025_v2.csv"
REVIEW_QUEUE_CSV = QA_DIR / "anncsu_electoral_assignment_review_queue_2025.csv"
SPATIAL_RESOLUTION_CSV = INTERIM_GEO_DIR / "spatially_resolved_review_points_2025.csv"
POLYGONS_V1_GPKG = PROCESSED_GEO_DIR / "electoral_sections_candidate_2025_v1.gpkg"
POLYGONS_V2_GPKG = PROCESSED_GEO_DIR / "electoral_sections_candidate_2025_v2.gpkg"
POLYGON_LAYER_V1 = "electoral_sections_candidate_2025_v1"
POLYGON_LAYER_V2 = "electoral_sections_candidate_2025_v2"
REPORT_PATH = QA_DIR / "electoral_sections_candidate_polygon_report_2025.md"
METRICS_PATH = QA_DIR / "electoral_sections_candidate_polygon_metrics_2025.csv"
BOUNDARY_UNCERTAINTY_PATH = QA_DIR / "electoral_sections_boundary_uncertainty_points_2025.csv"


METRIC_HEADERS = [
    "section_number",
    "v1_points_used",
    "v2_deterministic_points_used",
    "v2_spatially_resolved_points_used",
    "v2_total_points_used",
    "polygon_count_v1",
    "polygon_count_v2",
    "area_sq_km_v1",
    "area_sq_km_v2",
    "perimeter_km_v1",
    "perimeter_km_v2",
    "compactness_score_v1",
    "compactness_score_v2",
    "remaining_review_points_within_50m",
    "remaining_review_points_within_100m",
    "geometry_confidence",
    "needs_manual_review",
    "notes",
]


UNCERTAINTY_HEADERS = [
    "access_id",
    "odonimo_raw",
    "civico",
    "esponente",
    "coord_x",
    "coord_y",
    "nearest_candidate_section",
    "distance_to_candidate_boundary_m",
    "problem_type",
    "suggested_review_action",
    "notes",
]


def markdown_table(headers: list[str], rows: list[list[str]]) -> list[str]:
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(row) + " |")
    return lines


def read_polygons(path, layer):
    gpd, _pd, _shapely, _tree = require_geospatial_dependencies()
    if not path.exists():
        raise RuntimeError(f"Missing polygon GPKG: {path}")
    return gpd.read_file(path, layer=layer)


def review_points_gdf(remaining_access_ids: set[str]):
    gpd, pd, _shapely, _tree = require_geospatial_dependencies()
    civics = {row.get("PROGRESSIVO_ACCESSO", ""): row for row in read_csv_rows(CIVICS_V2_CSV)}
    review = {row.get("anncsu_progressivo_accesso", ""): row for row in read_csv_rows(REVIEW_QUEUE_CSV)}
    records = []
    geometries = []
    for access_id in sorted(remaining_access_ids):
        civic = civics.get(access_id, {})
        item = review.get(access_id, {})
        lon = decimal_it(civic.get("COORD_X_COMUNE", ""))
        lat = decimal_it(civic.get("COORD_Y_COMUNE", ""))
        records.append({**civic, **item, "access_id": access_id, "coord_x": lon, "coord_y": lat})
        geometries.append(None if lon is None or lat is None else gpd.points_from_xy([lon], [lat], crs="EPSG:4326")[0])
    return gpd.GeoDataFrame(pd.DataFrame(records), geometry=geometries, crs="EPSG:4326").to_crs("EPSG:32633")


def nearest_boundary(point, polygons):
    distances = polygons.geometry.boundary.distance(point)
    nearest_idx = distances.idxmin()
    return str(polygons.loc[nearest_idx, "section_number"]), float(distances.loc[nearest_idx])


def build_boundary_uncertainty(polygons_v2, resolution_rows: list[dict]) -> tuple[list[dict], dict[str, dict[str, int]]]:
    remaining = {
        row["access_id"]
        for row in resolution_rows
        if row.get("spatial_resolution_method") != "spatially_resolved_candidate"
    }
    points = review_points_gdf(remaining)
    rows: list[dict] = []
    counts: dict[str, dict[str, int]] = defaultdict(lambda: {"50": 0, "100": 0})
    for _idx, row in points.iterrows():
        if row.geometry is None or row.geometry.is_empty:
            continue
        nearest_section, distance = nearest_boundary(row.geometry, polygons_v2)
        if distance <= 100:
            if distance <= 50:
                counts[nearest_section]["50"] += 1
            counts[nearest_section]["100"] += 1
            rows.append(
                {
                    "access_id": row.get("access_id", ""),
                    "odonimo_raw": row.get("ODONIMO") or row.get("anncsu_odonimo", ""),
                    "civico": row.get("CIVICO") or row.get("civico", ""),
                    "esponente": row.get("ESPONENTE") or row.get("esponente", ""),
                    "coord_x": row.get("coord_x", ""),
                    "coord_y": row.get("coord_y", ""),
                    "nearest_candidate_section": nearest_section,
                    "distance_to_candidate_boundary_m": round(distance, 3),
                    "problem_type": row.get("reason", ""),
                    "suggested_review_action": "inspect_in_qgis_near_candidate_boundary",
                    "notes": "remaining review point within 100m of V2 candidate boundary",
                }
            )
    write_csv_rows(BOUNDARY_UNCERTAINTY_PATH, rows, UNCERTAINTY_HEADERS)
    return rows, counts


def polygon_by_section(gdf) -> dict[str, dict]:
    out: dict[str, dict] = {}
    for _idx, row in gdf.iterrows():
        out[str(row["section_number"])] = row.to_dict()
    return out


def build_metrics(polygons_v1, polygons_v2, boundary_counts):
    v1 = polygon_by_section(polygons_v1)
    v2 = polygon_by_section(polygons_v2)
    sections = sorted(set(v1) | set(v2), key=section_sort_key)
    rows = []
    fragile = []
    for section in sections:
        row1 = v1.get(section, {})
        row2 = v2.get(section, {})
        area1 = float(row1.get("area_sq_km") or 0)
        area2 = float(row2.get("area_sq_km") or 0)
        perim1 = float(row1.get("perimeter_km") or 0)
        perim2 = float(row2.get("perimeter_km") or 0)
        confidence = row2.get("geometry_confidence") or row1.get("geometry_confidence") or "low"
        needs_review = str(row2.get("needs_manual_review") if row2 else row1.get("needs_manual_review")).lower() in {"true", "1"}
        notes = row2.get("notes") or row1.get("notes") or ""
        if confidence != "high" or needs_review:
            fragile.append(section)
        rows.append(
            {
                "section_number": section,
                "v1_points_used": row1.get("points_used", ""),
                "v2_deterministic_points_used": row2.get("deterministic_points_used", ""),
                "v2_spatially_resolved_points_used": row2.get("spatially_resolved_points_used", ""),
                "v2_total_points_used": row2.get("total_points_used", ""),
                "polygon_count_v1": row1.get("polygon_count", ""),
                "polygon_count_v2": row2.get("polygon_count", ""),
                "area_sq_km_v1": area1,
                "area_sq_km_v2": area2,
                "perimeter_km_v1": perim1,
                "perimeter_km_v2": perim2,
                "compactness_score_v1": round(compactness_score(area1 * 1_000_000, perim1 * 1_000), 6),
                "compactness_score_v2": round(compactness_score(area2 * 1_000_000, perim2 * 1_000), 6),
                "remaining_review_points_within_50m": boundary_counts.get(section, {}).get("50", 0),
                "remaining_review_points_within_100m": boundary_counts.get(section, {}).get("100", 0),
                "geometry_confidence": confidence,
                "needs_manual_review": "true" if needs_review else "false",
                "notes": notes,
            }
        )
    write_csv_rows(METRICS_PATH, rows, METRIC_HEADERS)
    return rows, fragile


def main() -> int:
    polygons_v1 = read_polygons(POLYGONS_V1_GPKG, POLYGON_LAYER_V1)
    polygons_v2 = read_polygons(POLYGONS_V2_GPKG, POLYGON_LAYER_V2)
    civics_v1 = read_csv_rows(CIVICS_V1_CSV)
    civics_v2 = read_csv_rows(CIVICS_V2_CSV)
    review_queue = read_csv_rows(REVIEW_QUEUE_CSV)
    resolutions = read_csv_rows(SPATIAL_RESOLUTION_CSV)

    deterministic = [row for row in civics_v1 if row.get("assignment_status") == "assigned"]
    initial_review = [row for row in civics_v1 if row.get("assignment_status") != "assigned"]
    spatially_resolved = [row for row in resolutions if row.get("spatial_resolution_method") == "spatially_resolved_candidate"]
    still_review = [row for row in civics_v2 if row.get("human_review_required") == "true"]
    resolution_counts = Counter(row.get("spatial_resolution_method", "") for row in resolutions)

    boundary_rows, boundary_counts = build_boundary_uncertainty(polygons_v2, resolutions)
    metrics_rows, fragile_sections = build_metrics(polygons_v1, polygons_v2, boundary_counts)

    non_polyg = ["78"]
    report = [
        "# Electoral sections candidate polygon report 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "Status: `candidate_inferred`, not official, for QGIS review only.",
        "",
        "## Summary",
        "",
        f"- ANNCSU civic rows: {len(civics_v1)}.",
        f"- Deterministically assigned civic rows: {len(deterministic)}.",
        f"- Initial review rows: {len(initial_review)}.",
        f"- V1 points used: {int(polygons_v1['points_used'].sum())}.",
        f"- Spatially resolved candidate points: {len(spatially_resolved)}.",
        f"- Points still requiring review after V2: {len(still_review)} ({len(still_review) / len(civics_v1):.2%}).",
        f"- V1 sections polygonized: {len(polygons_v1)}.",
        f"- V2 sections polygonized: {len(polygons_v2)}.",
        f"- Sections not polygonized as ordinary territorial sections: {', '.join(non_polyg)}.",
        "- Section 78 is hospital/special and is excluded from ordinary polygonization.",
        f"- Clipping boundary: {relpath(BOUNDARY_GEOJSON)} (ISTAT census-section dissolve used as candidate municipal boundary).",
        "",
        "## Method",
        "",
        "- Coordinates from ANNCSU are interpreted as WGS84 longitude/latitude and projected to EPSG:32633 for distance, area, and Voronoi operations.",
        "- V1 uses only deterministic ANNCSU civic assignments with high/medium confidence and excludes section 78.",
        "- V1 geometry method: `voronoi_from_deterministically_assigned_anncsu_civics`.",
        "- V2 adds only points classified as `spatially_resolved_candidate` by the controlled spatial pass.",
        "- V2 geometry method: `voronoi_from_deterministic_plus_spatially_resolved_anncsu_civics`.",
        "- Candidate polygons are clipped to the dissolved ISTAT Lamezia census-section geometry; this is a municipal-boundary support layer, not an electoral-section source.",
        "- The geospatial scripts require Python geospatial libraries (`geopandas`, `shapely`, `pyproj`, `scipy`, `pyogrio`); no frontend/runtime package manager dependency is added.",
        "",
        "## Spatial Review Thresholds",
        "",
        "- Minimum distance from candidate boundary: 50 m.",
        "- K nearest deterministic points: 12.",
        "- Minimum same-section nearest-neighbor share: 80%.",
        "- Textual conflicts from the review queue are not auto-resolved.",
        "",
        "## Spatial Resolution Outcomes",
        "",
    ]
    report.extend(markdown_table(["classification", "rows"], [[key or "(blank)", str(value)] for key, value in sorted(resolution_counts.items())]))
    report.extend(
        [
            "",
            "## Candidate Geometry Files",
            "",
            f"- V1 GPKG: `{relpath(POLYGONS_V1_GPKG)}`.",
            f"- V2 GPKG: `{relpath(POLYGONS_V2_GPKG)}`.",
            f"- V2 civics CSV: `{relpath(CIVICS_V2_CSV)}`.",
            f"- Spatial resolution CSV: `{relpath(SPATIAL_RESOLUTION_CSV)}`.",
            f"- Metrics CSV: `{relpath(METRICS_PATH)}`.",
            f"- Boundary uncertainty CSV: `{relpath(BOUNDARY_UNCERTAINTY_PATH)}`.",
            "",
            "## Fragile Sections",
            "",
            f"- Sections requiring manual geometry review by automated metrics: {', '.join(fragile_sections) if fragile_sections else 'none'}.",
            f"- Boundary uncertainty points within 100 m: {len(boundary_rows)}.",
            "",
            "## V1 vs V2",
            "",
            f"- V2 uses {len(spatially_resolved)} additional candidate-resolved civic points over V1.",
            "- Spatially resolved points are capped at medium confidence and are not equivalent to deterministic stradario assignments.",
            "- Remaining review points are not used in V2 geometry.",
            "",
            "## Limits",
            "",
            "- These polygons are not official electoral-section boundaries.",
            "- The official textual source remains the municipal electoral street register; geometry is a derivative candidate from assigned civic points.",
            "- Voronoi boundaries are inferred from point distribution and require QGIS review before any analytical or public use.",
            "- The ISTAT clipping boundary is an official census geography support layer, not a municipal electoral-section source.",
            "- Section 78 is a special hospital section and should be handled separately.",
            "",
            "## QGIS Review",
            "",
            "- Open `data/interim/qa/electoral_sections_qgis_review_layers_2025.gpkg` if present.",
            "- Inspect fragile sections, multi-part polygons, and boundary uncertainty points first.",
            "- Compare remaining review points against the original street register before manual correction.",
            "- Do not publish or wire these layers into the frontend until human validation is complete.",
        ]
    )
    REPORT_PATH.write_text("\n".join(report) + "\n", encoding="utf-8")

    print("candidate polygon audit")
    print(f"metrics={METRICS_PATH}")
    print(f"boundary_uncertainty_points={BOUNDARY_UNCERTAINTY_PATH} rows={len(boundary_rows)}")
    print(f"report={REPORT_PATH}")
    print(f"fragile_sections={len(fragile_sections)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
