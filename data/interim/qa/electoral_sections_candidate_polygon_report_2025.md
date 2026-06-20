# Electoral sections candidate polygon report 2025

Date: 2026-06-20

Status: `candidate_inferred`, not official, for QGIS review only.

## Summary

- ANNCSU civic rows: 22757.
- Deterministically assigned civic rows: 14503.
- Initial review rows: 8254.
- V1 points used: 14503.
- Spatially resolved candidate points: 399.
- Points still requiring review after V2: 7855 (34.52%).
- V1 sections polygonized: 77.
- V2 sections polygonized: 77.
- Sections not polygonized as ordinary territorial sections: 78.
- Section 78 is hospital/special and is excluded from ordinary polygonization.
- Clipping boundary: data/processed/territorio/istat_sezioni_censimento_lamezia.geojson (ISTAT census-section dissolve used as candidate municipal boundary).

## Method

- Coordinates from ANNCSU are interpreted as WGS84 longitude/latitude and projected to EPSG:32633 for distance, area, and Voronoi operations.
- V1 uses only deterministic ANNCSU civic assignments with high/medium confidence and excludes section 78.
- V1 geometry method: `voronoi_from_deterministically_assigned_anncsu_civics`.
- V2 adds only points classified as `spatially_resolved_candidate` by the controlled spatial pass.
- V2 geometry method: `voronoi_from_deterministic_plus_spatially_resolved_anncsu_civics`.
- Candidate polygons are clipped to the dissolved ISTAT Lamezia census-section geometry; this is a municipal-boundary support layer, not an electoral-section source.
- The geospatial scripts require Python geospatial libraries (`geopandas`, `shapely`, `pyproj`, `scipy`, `pyogrio`); no frontend/runtime package manager dependency is added.

## Spatial Review Thresholds

- Minimum distance from candidate boundary: 50 m.
- K nearest deterministic points: 12.
- Minimum same-section nearest-neighbor share: 80%.
- Textual conflicts from the review queue are not auto-resolved.

## Spatial Resolution Outcomes

| classification | rows |
| --- | --- |
| spatial_hint_only | 701 |
| spatially_resolved_candidate | 399 |
| unresolved_conflict | 25 |
| unresolved_near_boundary | 6998 |
| unresolved_no_spatial_support | 131 |

## Candidate Geometry Files

- V1 GPKG: `data/processed/geo/electoral_sections_candidate_2025_v1.gpkg`.
- V2 GPKG: `data/processed/geo/electoral_sections_candidate_2025_v2.gpkg`.
- V2 civics CSV: `data/processed/geo/anncsu_lamezia_civics_with_electoral_section_2025_v2.csv`.
- Spatial resolution CSV: `data/interim/geo/spatially_resolved_review_points_2025.csv`.
- Metrics CSV: `data/interim/qa/electoral_sections_candidate_polygon_metrics_2025.csv`.
- Boundary uncertainty CSV: `data/interim/qa/electoral_sections_boundary_uncertainty_points_2025.csv`.

## Fragile Sections

- Sections requiring manual geometry review by automated metrics: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77.
- Boundary uncertainty points within 100 m: 7571.

## V1 vs V2

- V2 uses 399 additional candidate-resolved civic points over V1.
- Spatially resolved points are capped at medium confidence and are not equivalent to deterministic stradario assignments.
- Remaining review points are not used in V2 geometry.

## Limits

- These polygons are not official electoral-section boundaries.
- The official textual source remains the municipal electoral street register; geometry is a derivative candidate from assigned civic points.
- Voronoi boundaries are inferred from point distribution and require QGIS review before any analytical or public use.
- The ISTAT clipping boundary is an official census geography support layer, not a municipal electoral-section source.
- Section 78 is a special hospital section and should be handled separately.

## QGIS Review

- Open `data/interim/qa/electoral_sections_qgis_review_layers_2025.gpkg` if present.
- Inspect fragile sections, multi-part polygons, and boundary uncertainty points first.
- Compare remaining review points against the original street register before manual correction.
- Do not publish or wire these layers into the frontend until human validation is complete.
