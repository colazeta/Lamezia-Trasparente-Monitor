from __future__ import annotations

import sys
from collections import Counter, defaultdict
from pathlib import Path

from electoral_geo_utils import (
    BOUNDARY_GEOJSON,
    ELECTION_ID,
    INTERIM_GEO_DIR,
    PROCESSED_GEO_DIR,
    QA_DIR,
    bool_text,
    civics_to_geodataframe,
    compactness_score,
    polygon_count,
    read_csv_rows,
    read_review_by_access_id,
    relpath,
    require_geospatial_dependencies,
    section_sort_key,
    write_gpkg,
)


CIVICS_V2_CSV = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025_v2.csv"
REVIEW_QUEUE_CSV = QA_DIR / "anncsu_electoral_assignment_review_queue_2025.csv"
CELL_ASSIGNMENT_GPKG = INTERIM_GEO_DIR / "electoral_section_census_cells_assignment_2025.gpkg"
CELL_ASSIGNMENT_LAYER = "electoral_section_census_cells_assignment_2025"
POLYGONS_V3_GPKG = PROCESSED_GEO_DIR / "electoral_sections_candidate_2025_v3_census_aggregated.gpkg"
POLYGONS_V3_LAYER = "electoral_sections_candidate_2025_v3_census_aggregated"

SECTION_78 = "78"
V3_METHOD = "census_section_aggregation_from_assigned_anncsu_civics"
MIN_ASSIGNED_CIVICS = 5
DOMINANT_SHARE_THRESHOLD = 0.70


def polygonal_part(geometry, shapely):
    if geometry is None or geometry.is_empty:
        return geometry
    geometry = shapely.make_valid(geometry)
    if geometry.geom_type in {"Polygon", "MultiPolygon"}:
        return geometry
    if geometry.geom_type == "GeometryCollection":
        polygonal = [geom for geom in geometry.geoms if geom.geom_type in {"Polygon", "MultiPolygon"} and not geom.is_empty]
        if polygonal:
            return shapely.make_valid(shapely.union_all(polygonal))
    return geometry


def load_census_cells():
    gpd, pd, shapely, _tree = require_geospatial_dependencies()
    if not BOUNDARY_GEOJSON.exists():
        raise RuntimeError(f"Missing ISTAT census geometry: {relpath(BOUNDARY_GEOJSON)}")

    cells = gpd.read_file(BOUNDARY_GEOJSON)
    if cells.empty:
        raise RuntimeError(f"Empty ISTAT census geometry: {relpath(BOUNDARY_GEOJSON)}")
    if cells.crs is None:
        cells = cells.set_crs("EPSG:4326", allow_override=True)

    id_field = "sezione_censimento_id"
    if id_field not in cells.columns:
        id_field = "census_cell_id"
        cells[id_field] = [f"census_cell_{idx + 1:04d}" for idx in range(len(cells))]

    original_invalid = int((~cells.geometry.is_valid).sum())
    cells = cells[[id_field, "geometry"]].rename(columns={id_field: "census_cell_id"}).copy()
    cells["census_cell_id"] = cells["census_cell_id"].astype(str)
    cells["geometry"] = cells.geometry.apply(lambda geom: polygonal_part(geom, shapely))
    cells = cells[~cells.geometry.is_empty & cells.geometry.notna()].copy()
    cells = cells.to_crs("EPSG:32633")
    cells.attrs["original_invalid_geometries"] = original_invalid
    cells.attrs["source_crs"] = str(gpd.read_file(BOUNDARY_GEOJSON).crs or "EPSG:4326")
    return cells


def join_civics_to_census(civics_gdf, cells_gdf):
    gpd, _pd, _shapely, _tree = require_geospatial_dependencies()
    point_cols = [
        "access_id",
        "section_number",
        "assignment_status",
        "assignment_method",
        "assignment_confidence",
        "human_review_required",
        "geometry",
    ]
    for col in point_cols:
        if col != "geometry" and col not in civics_gdf.columns:
            civics_gdf[col] = ""

    joined = gpd.sjoin(
        civics_gdf[point_cols].copy(),
        cells_gdf[["census_cell_id", "geometry"]].copy(),
        how="left",
        predicate="covered_by",
    )
    joined["census_cell_id"] = joined["census_cell_id"].fillna("")
    multi_matches = int(joined.duplicated(subset=["access_id"], keep=False).sum())
    joined = joined.sort_values(["access_id", "census_cell_id"]).drop_duplicates(subset=["access_id"], keep="first")
    joined.attrs["multi_cell_point_matches"] = multi_matches
    joined.attrs["points_without_census_cell"] = int(joined["census_cell_id"].eq("").sum())
    return joined


def is_assigned_support(row) -> bool:
    section = str(row.get("section_number") or "").strip()
    review_value = row.get("human_review_required")
    review_text = "" if review_value is None else str(review_value).lower()
    return (
        section != ""
        and section != SECTION_78
        and str(row.get("assignment_status") or "") == "assigned"
        and review_text in {"false", "0"}
    )


def is_spatially_resolved(row) -> bool:
    return str(row.get("assignment_method") or "") == "spatially_resolved_candidate"


def compact_section_counts(counts: Counter) -> str:
    return ";".join(f"{section}:{counts[section]}" for section in sorted(counts, key=section_sort_key))


def assign_census_cells(cells_gdf, joined_points):
    gpd, pd, _shapely, _tree = require_geospatial_dependencies()
    points_by_cell: dict[str, list[dict]] = defaultdict(list)
    for _idx, row in joined_points.iterrows():
        cell_id = str(row.get("census_cell_id") or "")
        if cell_id:
            points_by_cell[cell_id].append(row.to_dict())

    records = []
    for _idx, cell in cells_gdf.iterrows():
        cell_id = str(cell["census_cell_id"])
        points = points_by_cell.get(cell_id, [])
        support = [row for row in points if is_assigned_support(row)]
        section_counts = Counter(str(row.get("section_number")) for row in support)
        assigned_civics = sum(section_counts.values())
        dominant_section = ""
        dominant_count = 0
        dominant_share = 0.0
        if section_counts:
            dominant_section, dominant_count = sorted(
                section_counts.items(),
                key=lambda item: (-item[1], section_sort_key(item[0])),
            )[0]
            dominant_share = dominant_count / assigned_civics if assigned_civics else 0.0

        total_civics = len(points)
        deterministic_civics = sum(1 for row in support if not is_spatially_resolved(row))
        spatially_resolved_civics = sum(1 for row in support if is_spatially_resolved(row))
        review_civics = sum(1 for row in points if not is_assigned_support(row))

        assigned_section = ""
        suggested_section = dominant_section
        method = ""
        confidence = "none"
        needs_review = True
        notes = ""
        if assigned_civics >= MIN_ASSIGNED_CIVICS and dominant_share >= DOMINANT_SHARE_THRESHOLD:
            assigned_section = dominant_section
            method = "census_cell_dominant_section_threshold"
            confidence = "high" if assigned_civics >= 20 and dominant_share >= 0.85 else "medium"
            needs_review = False
            notes = (
                f"assigned by dominant section share among assigned civics; "
                f"assigned_civics={assigned_civics}; dominant_share={dominant_share:.3f}"
            )
        elif 0 < assigned_civics < MIN_ASSIGNED_CIVICS and len(section_counts) == 1:
            assigned_section = dominant_section
            method = "census_cell_single_section_low_evidence"
            confidence = "low"
            needs_review = True
            notes = (
                "assigned with low evidence because fewer than 5 assigned civics all support "
                f"section {dominant_section}"
            )
        elif assigned_civics == 0:
            method = "no_assigned_civics"
            suggested_section = ""
            notes = "no assigned ANNCSU civic evidence inside census cell"
        else:
            method = "census_cell_conflict"
            notes = (
                f"no dominant section reaches {DOMINANT_SHARE_THRESHOLD:.0%}; "
                f"assigned_civics={assigned_civics}; distribution={compact_section_counts(section_counts)}"
            )

        records.append(
            {
                "census_cell_id": cell_id,
                "assigned_section_number": assigned_section,
                "suggested_section_number": suggested_section,
                "total_civics": total_civics,
                "deterministic_civics": deterministic_civics,
                "spatially_resolved_civics": spatially_resolved_civics,
                "review_civics": review_civics,
                "dominant_section_share": round(dominant_share, 6),
                "competing_sections": compact_section_counts(section_counts),
                "assignment_method": method,
                "assignment_confidence": confidence,
                "needs_manual_review": needs_review,
                "notes": notes,
                "geometry": cell.geometry,
            }
        )

    return gpd.GeoDataFrame(pd.DataFrame(records), geometry="geometry", crs=cells_gdf.crs)


def v3_geometry_confidence(section_row: dict) -> tuple[str, bool, str]:
    notes: list[str] = []
    confidence = "high"
    if section_row["census_cells_used"] < 2:
        confidence = "low"
        notes.append("very few census cells assigned")
    if section_row["deterministic_civics_used"] + section_row["spatially_resolved_civics_used"] < 5:
        confidence = "low"
        notes.append("very few supporting assigned civics")
    if section_row["polygon_count"] > 5:
        confidence = "low"
        notes.append("multi-part census aggregate")
    elif section_row["polygon_count"] > 2 and confidence == "high":
        confidence = "medium"
        notes.append("multi-part census aggregate")
    if section_row["conflict_cells_count"] > 0:
        confidence = "low" if section_row["conflict_cells_count"] > 2 else min(confidence, "medium", key=["low", "medium", "high"].index)
        notes.append("nearby or suggested census cells remain conflicted")
    if section_row["area_sq_km"] <= 0:
        confidence = "low"
        notes.append("zero or invalid area")
    if section_row["review_civics_inside"] > section_row["deterministic_civics_used"] + section_row["spatially_resolved_civics_used"]:
        if confidence == "high":
            confidence = "medium"
        notes.append("review civics exceed assigned civic support inside used cells")
    return confidence, confidence != "high", "; ".join(notes)


def dissolve_v3(cell_assignments):
    gpd, pd, shapely, _tree = require_geospatial_dependencies()
    assigned = cell_assignments[
        cell_assignments["assigned_section_number"].astype(str).ne("")
        & cell_assignments["assigned_section_number"].astype(str).ne(SECTION_78)
    ].copy()
    if assigned.empty:
        raise RuntimeError("No census cells were assigned to ordinary electoral sections")

    conflict_by_suggested = Counter(
        str(row.get("suggested_section_number") or "")
        for _idx, row in cell_assignments[cell_assignments["assignment_method"] == "census_cell_conflict"].iterrows()
        if str(row.get("suggested_section_number") or "")
    )
    records = []
    geometries = []
    for section in sorted(assigned["assigned_section_number"].astype(str).unique(), key=section_sort_key):
        section_cells = assigned[assigned["assigned_section_number"].astype(str) == section].copy()
        geometry = shapely.make_valid(shapely.union_all(list(section_cells.geometry)))
        area_sq_km = geometry.area / 1_000_000
        perimeter_km = geometry.length / 1_000
        parts = polygon_count(geometry)
        record = {
            "section_number": section,
            "election_id": ELECTION_ID,
            "geometry_status": "candidate_inferred",
            "candidate_geometry_method": V3_METHOD,
            "census_cells_used": int(len(section_cells)),
            "deterministic_civics_used": int(section_cells["deterministic_civics"].sum()),
            "spatially_resolved_civics_used": int(section_cells["spatially_resolved_civics"].sum()),
            "review_civics_inside": int(section_cells["review_civics"].sum()),
            "conflict_cells_count": int(conflict_by_suggested.get(section, 0)),
            "no_evidence_cells_count": 0,
            "area_sq_km": round(area_sq_km, 6),
            "perimeter_km": round(perimeter_km, 6),
            "polygon_count": parts,
        }
        confidence, needs_review, notes = v3_geometry_confidence(record)
        record["geometry_confidence"] = confidence
        record["needs_manual_review"] = needs_review
        record["notes"] = notes
        records.append(record)
        geometries.append(geometry)

    return gpd.GeoDataFrame(pd.DataFrame(records), geometry=geometries, crs=cell_assignments.crs)


def main() -> int:
    if not CIVICS_V2_CSV.exists():
        print(f"missing_input={relpath(CIVICS_V2_CSV)}", file=sys.stderr)
        return 1
    if not REVIEW_QUEUE_CSV.exists():
        print(f"missing_input={relpath(REVIEW_QUEUE_CSV)}", file=sys.stderr)
        return 1

    cells = load_census_cells()
    review_by_access = read_review_by_access_id(REVIEW_QUEUE_CSV)
    civics = civics_to_geodataframe(CIVICS_V2_CSV, review_by_access)
    joined = join_civics_to_census(civics, cells)
    assignments = assign_census_cells(cells, joined)
    v3 = dissolve_v3(assignments)

    write_gpkg(assignments, CELL_ASSIGNMENT_GPKG, CELL_ASSIGNMENT_LAYER, delete_existing=True)
    write_gpkg(v3, POLYGONS_V3_GPKG, POLYGONS_V3_LAYER, delete_existing=True)

    assigned_cells = int(assignments["assigned_section_number"].astype(str).ne("").sum())
    conflict_cells = int((assignments["assignment_method"] == "census_cell_conflict").sum())
    no_evidence_cells = int((assignments["assignment_method"] == "no_assigned_civics").sum())
    print("candidate electoral section polygons V3 census")
    print(f"census_source={relpath(BOUNDARY_GEOJSON)}")
    print(f"census_cells={len(assignments)}")
    print(f"census_invalid_geometries_repaired={cells.attrs.get('original_invalid_geometries', 0)}")
    print(f"civics_total={len(civics)}")
    print(f"points_without_census_cell={joined.attrs.get('points_without_census_cell', 0)}")
    print(f"multi_cell_point_matches={joined.attrs.get('multi_cell_point_matches', 0)}")
    print(f"assigned_cells={assigned_cells}")
    print(f"conflict_cells={conflict_cells}")
    print(f"no_evidence_cells={no_evidence_cells}")
    print(f"v3_sections={len(v3)}")
    print(f"cell_assignment_gpkg={CELL_ASSIGNMENT_GPKG}")
    print(f"v3_gpkg={POLYGONS_V3_GPKG}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
