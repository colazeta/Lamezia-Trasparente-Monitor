from __future__ import annotations

import sys
from collections import Counter
from datetime import date

from electoral_geo_utils import (
    BOUNDARY_GEOJSON,
    PROCESSED_GEO_DIR,
    INTERIM_GEO_DIR,
    QA_DIR,
    compactness_score,
    read_csv_rows,
    relpath,
    require_geospatial_dependencies,
    section_sort_key,
    write_csv_rows,
)


CELL_ASSIGNMENT_GPKG = INTERIM_GEO_DIR / "electoral_section_census_cells_assignment_2025.gpkg"
CELL_ASSIGNMENT_LAYER = "electoral_section_census_cells_assignment_2025"
POLYGONS_V1_GPKG = PROCESSED_GEO_DIR / "electoral_sections_candidate_2025_v1.gpkg"
POLYGONS_V2_GPKG = PROCESSED_GEO_DIR / "electoral_sections_candidate_2025_v2.gpkg"
POLYGONS_V3_GPKG = PROCESSED_GEO_DIR / "electoral_sections_candidate_2025_v3_census_aggregated.gpkg"
POLYGONS_V1_LAYER = "electoral_sections_candidate_2025_v1"
POLYGONS_V2_LAYER = "electoral_sections_candidate_2025_v2"
POLYGONS_V3_LAYER = "electoral_sections_candidate_2025_v3_census_aggregated"
REPORT_PATH = QA_DIR / "electoral_sections_candidate_v3_census_report_2025.md"
METRICS_PATH = QA_DIR / "electoral_sections_candidate_v3_census_metrics_2025.csv"
CIVICS_V2_CSV = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025_v2.csv"


METRIC_HEADERS = [
    "section_number",
    "census_cells_used",
    "total_civics",
    "deterministic_civics",
    "spatially_resolved_civics",
    "review_civics_inside",
    "conflict_cells_count",
    "no_evidence_cells_count",
    "area_sq_km",
    "perimeter_km",
    "polygon_count",
    "geometry_confidence",
    "needs_manual_review",
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


def read_layer(path, layer):
    gpd, _pd, _shapely, _tree = require_geospatial_dependencies()
    if not path.exists():
        raise RuntimeError(f"Missing GPKG: {relpath(path)}")
    return gpd.read_file(path, layer=layer)


def write_metrics(v3):
    rows = []
    for _idx, row in v3.sort_values("section_number", key=lambda s: s.map(section_sort_key)).iterrows():
        rows.append(
            {
                "section_number": row.get("section_number", ""),
                "census_cells_used": int(row.get("census_cells_used") or 0),
                "total_civics": int(row.get("deterministic_civics_used") or 0)
                + int(row.get("spatially_resolved_civics_used") or 0)
                + int(row.get("review_civics_inside") or 0),
                "deterministic_civics": int(row.get("deterministic_civics_used") or 0),
                "spatially_resolved_civics": int(row.get("spatially_resolved_civics_used") or 0),
                "review_civics_inside": int(row.get("review_civics_inside") or 0),
                "conflict_cells_count": int(row.get("conflict_cells_count") or 0),
                "no_evidence_cells_count": int(row.get("no_evidence_cells_count") or 0),
                "area_sq_km": row.get("area_sq_km", ""),
                "perimeter_km": row.get("perimeter_km", ""),
                "polygon_count": int(row.get("polygon_count") or 0),
                "geometry_confidence": row.get("geometry_confidence", ""),
                "needs_manual_review": str(row.get("needs_manual_review")).lower(),
                "notes": row.get("notes", ""),
            }
        )
    write_csv_rows(METRICS_PATH, rows, METRIC_HEADERS)
    return rows


def fragile_sections(v3):
    rows = []
    for _idx, row in v3.iterrows():
        needs_review = str(row.get("needs_manual_review")).lower() in {"true", "1"}
        if row.get("geometry_confidence") != "high" or needs_review:
            rows.append(
                [
                    str(row.get("section_number", "")),
                    str(row.get("geometry_confidence", "")),
                    str(row.get("polygon_count", "")),
                    str(row.get("conflict_cells_count", "")),
                    str(row.get("notes", ""))[:180],
                ]
            )
    return sorted(rows, key=lambda item: section_sort_key(item[0]))


def cell_method_counts(cells):
    return Counter(str(value) for value in cells["assignment_method"].fillna(""))


def main() -> int:
    cells = read_layer(CELL_ASSIGNMENT_GPKG, CELL_ASSIGNMENT_LAYER)
    v1 = read_layer(POLYGONS_V1_GPKG, POLYGONS_V1_LAYER)
    v2 = read_layer(POLYGONS_V2_GPKG, POLYGONS_V2_LAYER)
    v3 = read_layer(POLYGONS_V3_GPKG, POLYGONS_V3_LAYER)
    civics_v2 = read_csv_rows(CIVICS_V2_CSV)

    metrics = write_metrics(v3)
    methods = cell_method_counts(cells)
    assigned_cells = int(cells["assigned_section_number"].astype(str).ne("").sum())
    conflict_cells = int(methods.get("census_cell_conflict", 0))
    no_evidence_cells = int(methods.get("no_assigned_civics", 0))
    low_evidence_cells = int(methods.get("census_cell_single_section_low_evidence", 0))
    threshold_cells = int(methods.get("census_cell_dominant_section_threshold", 0))
    fragile = fragile_sections(v3)
    remaining_review_civics = sum(1 for row in civics_v2 if row.get("human_review_required") == "true")
    total_v2_polygon_parts = int(v2["polygon_count"].sum()) if "polygon_count" in v2.columns else 0
    total_v3_polygon_parts = int(v3["polygon_count"].sum()) if "polygon_count" in v3.columns else 0
    v2_fragile = int((v2["geometry_confidence"].astype(str) != "high").sum()) if "geometry_confidence" in v2.columns else 0
    v3_fragile = len(fragile)
    v2_sections = {str(value) for value in v2["section_number"].astype(str)}
    v3_sections = {str(value) for value in v3["section_number"].astype(str)}
    missing_v3_sections = sorted(v2_sections - v3_sections, key=section_sort_key)

    report = [
        "# Electoral sections candidate V3 census aggregation report 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "Status: `candidate_inferred`, not official, for QGIS review only.",
        "",
        "## Why V3",
        "",
        "- V1/V2 Voronoi polygons are useful diagnostics from assigned ANNCSU civic points, but QGIS review showed fragmentation in several dissolved geometries.",
        "- V3 uses ISTAT census sections as operational aggregation cells so candidate boundaries are easier to inspect and less point-noise driven.",
        "- The ISTAT census sections are not treated as official electoral-section boundaries; the municipal electoral street register remains the primary source for section assignment.",
        "",
        "## Inputs",
        "",
        f"- V2 civics CSV: `{relpath(CIVICS_V2_CSV)}`.",
        f"- ISTAT census sections: `{relpath(BOUNDARY_GEOJSON)}`.",
        f"- Cell assignment GPKG: `{relpath(CELL_ASSIGNMENT_GPKG)}`.",
        f"- V3 GPKG: `{relpath(POLYGONS_V3_GPKG)}`.",
        "",
        "## Census Cell Assignment Summary",
        "",
        f"- ISTAT census cells used: {len(cells)}.",
        f"- Cells assigned to an electoral section: {assigned_cells}.",
        f"- Cells assigned by dominant-section threshold: {threshold_cells}.",
        f"- Low-evidence single-section cells: {low_evidence_cells}.",
        f"- Conflict cells left unassigned: {conflict_cells}.",
        f"- No-evidence cells left unassigned: {no_evidence_cells}.",
        f"- V3 electoral sections produced: {len(v3)}.",
        f"- V2 sections not produced in conservative V3 dissolve: {len(missing_v3_sections)}.",
        f"- V2 polygon parts: {total_v2_polygon_parts}.",
        f"- V3 polygon parts: {total_v3_polygon_parts}.",
        f"- V2 non-high confidence sections: {v2_fragile}.",
        f"- V3 sections requiring review by automated metrics: {v3_fragile}.",
        f"- Remaining review civics are still visible for QGIS inspection: {remaining_review_civics}.",
        "",
        "## Cell Assignment Rules",
        "",
        "- At least 5 assigned civics and dominant electoral-section share >= 70%: assign the census cell to the dominant section with high or medium confidence.",
        "- Fewer than 5 assigned civics, all supporting one section: assign with low confidence and keep manual review required.",
        "- Multiple sections without a 70% dominant share: mark as `census_cell_conflict` and leave unassigned.",
        "- No assigned civics inside the cell: mark as `no_assigned_civics` and leave unassigned.",
        "- Section 78 is not included in ordinary territorial polygonization.",
        "",
        "## Cell Method Counts",
        "",
    ]
    report.extend(markdown_table(["assignment_method", "cells"], [[key or "(blank)", str(value)] for key, value in sorted(methods.items())]))
    report.extend(
        [
            "",
            "## Fragile V3 Sections",
            "",
        ]
    )
    if fragile:
        report.extend(markdown_table(["section", "confidence", "parts", "conflict_cells", "notes"], fragile[:30]))
    else:
        report.append("- No fragile sections flagged by automated V3 metrics.")
    report.extend(
        [
            "",
            "## Qualitative V2/V3 Comparison",
            "",
            "- V2 is a point-derived Voronoi candidate and can preserve fine-grained uncertainty, but it may fragment when assigned civic points are sparse or spatially irregular.",
            "- V3 aggregates whole ISTAT census cells, so it is more readable for QGIS review and avoids many narrow Voronoi shards.",
            "- V3 deliberately leaves conflict and no-evidence census cells outside the dissolved electoral-section polygons rather than forcing them into a section.",
            f"- Because of that conservative rule, V3 currently produces {len(v3)} sections rather than the {len(v2)} sections visible in V2.",
            "- V1/V2 remain available and should be compared against V3 during manual review.",
            "",
            "## V2 Sections Not Produced In V3",
            "",
            ", ".join(missing_v3_sections) if missing_v3_sections else "None.",
            "",
            "## Outputs",
            "",
            f"- Cell assignment layer: `{relpath(CELL_ASSIGNMENT_GPKG)}` layer `electoral_section_census_cells_assignment_2025`.",
            f"- V3 candidate polygons: `{relpath(POLYGONS_V3_GPKG)}` layer `electoral_sections_candidate_2025_v3_census_aggregated`.",
            f"- V3 metrics CSV: `{relpath(METRICS_PATH)}`.",
            "- QGIS review package: `data/interim/qa/electoral_sections_qgis_review_layers_2025_v3.gpkg`.",
            "",
            "## Limits",
            "",
            "- V3 is not an official electoral boundary dataset.",
            "- Census sections are used only as aggregation cells; they are not an electoral source.",
            "- Cells with conflicts or no assigned civic evidence are intentionally not forced into final geometry.",
            "- Low-evidence cells and non-high confidence sections require manual QGIS review against the street register.",
            "- No frontend, public map, deploy, or electoral result values are changed by this workflow.",
            "",
            "## QGIS Review Instructions",
            "",
            "- Open `data/interim/qa/electoral_sections_qgis_review_layers_2025_v3.gpkg`.",
            "- Start with `candidate_sections_v3_census_aggregated` and `census_cells_assignment`.",
            "- Filter `census_cells_assignment` by `assignment_method in ('census_cell_conflict', 'no_assigned_civics')`.",
            "- Compare V3 against `candidate_sections_v2_voronoi` and inspect remaining review points before any manual correction.",
            "- Treat every layer as candidate/non-official until human validation is complete.",
        ]
    )
    REPORT_PATH.write_text("\n".join(report) + "\n", encoding="utf-8")

    print("candidate polygon V3 census audit")
    print(f"metrics={METRICS_PATH}")
    print(f"report={REPORT_PATH}")
    print(f"census_cells={len(cells)}")
    print(f"assigned_cells={assigned_cells}")
    print(f"conflict_cells={conflict_cells}")
    print(f"no_evidence_cells={no_evidence_cells}")
    print(f"v3_sections={len(v3)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
