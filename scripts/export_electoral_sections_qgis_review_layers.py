from __future__ import annotations

import sys

from electoral_geo_utils import (
    INTERIM_GEO_DIR,
    PROCESSED_GEO_DIR,
    QA_DIR,
    decimal_it,
    read_csv_rows,
    require_geospatial_dependencies,
    write_gpkg,
)


POLYGONS_V1_GPKG = PROCESSED_GEO_DIR / "electoral_sections_candidate_2025_v1.gpkg"
POLYGONS_V2_GPKG = PROCESSED_GEO_DIR / "electoral_sections_candidate_2025_v2.gpkg"
CIVICS_V1_GPKG = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025.gpkg"
CIVICS_V2_GPKG = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025_v2.gpkg"
BOUNDARY_UNCERTAINTY_CSV = QA_DIR / "electoral_sections_boundary_uncertainty_points_2025.csv"
OUTPUT_GPKG = QA_DIR / "electoral_sections_qgis_review_layers_2025.gpkg"


def points_from_uncertainty_csv():
    gpd, pd, _shapely, _tree = require_geospatial_dependencies()
    rows = read_csv_rows(BOUNDARY_UNCERTAINTY_CSV)
    geometries = []
    records = []
    for row in rows:
        lon = decimal_it(str(row.get("coord_x", "")))
        lat = decimal_it(str(row.get("coord_y", "")))
        records.append(row)
        geometries.append(None if lon is None or lat is None else gpd.points_from_xy([lon], [lat], crs="EPSG:4326")[0])
    return gpd.GeoDataFrame(pd.DataFrame(records), geometry=geometries, crs="EPSG:4326").to_crs("EPSG:32633")


def main() -> int:
    gpd, _pd, _shapely, _tree = require_geospatial_dependencies()
    if OUTPUT_GPKG.exists():
        OUTPUT_GPKG.unlink()

    v1 = gpd.read_file(POLYGONS_V1_GPKG, layer="electoral_sections_candidate_2025_v1")
    v2 = gpd.read_file(POLYGONS_V2_GPKG, layer="electoral_sections_candidate_2025_v2")
    civics_v1 = gpd.read_file(CIVICS_V1_GPKG, layer="anncsu_lamezia_civics_with_electoral_section_2025")
    civics_v2 = gpd.read_file(CIVICS_V2_GPKG, layer="anncsu_lamezia_civics_with_electoral_section_2025_v2")

    deterministic = civics_v1[(civics_v1["human_review_required"] == False) & (civics_v1["section_number"].astype(str) != "78")].copy()
    spatially_resolved = civics_v2[civics_v2["assignment_method"].astype(str) == "spatially_resolved_candidate"].copy()
    remaining_review = civics_v2[civics_v2["human_review_required"] == True].copy()
    uncertainty = points_from_uncertainty_csv()

    write_gpkg(v1, OUTPUT_GPKG, "candidate_sections_v1", delete_existing=True)
    write_gpkg(v2, OUTPUT_GPKG, "candidate_sections_v2")
    write_gpkg(deterministic, OUTPUT_GPKG, "deterministic_points")
    write_gpkg(spatially_resolved, OUTPUT_GPKG, "spatially_resolved_points")
    write_gpkg(remaining_review, OUTPUT_GPKG, "remaining_review_points")
    write_gpkg(uncertainty, OUTPUT_GPKG, "boundary_uncertainty_points")

    print("qgis review gpkg")
    print(f"output={OUTPUT_GPKG}")
    print(f"candidate_sections_v1={len(v1)}")
    print(f"candidate_sections_v2={len(v2)}")
    print(f"deterministic_points={len(deterministic)}")
    print(f"spatially_resolved_points={len(spatially_resolved)}")
    print(f"remaining_review_points={len(remaining_review)}")
    print(f"boundary_uncertainty_points={len(uncertainty)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
