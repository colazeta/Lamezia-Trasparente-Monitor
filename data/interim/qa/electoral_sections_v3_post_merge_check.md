# Electoral sections V3 post-merge check

Date: 2026-06-20

Status: post-merge QA for PR #609. The V3 census-aggregated geometries are `candidate_inferred`, non-official, and must not be published in the frontend before guided QGIS review.

## Verified Main Commit

- Verified branch: `origin/main`.
- Verified commit: `b770d7f965a89eba55b5191e02be4388f170c4ec`.
- The verified commit is the merge commit for PR #609.
- Worktree used for this check: clean branch `geo/post-merge-v3-census-check` created from `origin/main`.

## V3 Files Found

- `data/processed/geo/electoral_sections_candidate_2025_v3_census_aggregated.gpkg`
- `data/interim/geo/electoral_section_census_cells_assignment_2025.gpkg`
- `data/interim/qa/electoral_sections_qgis_review_layers_2025_v3.gpkg`
- `data/interim/qa/electoral_sections_candidate_v3_census_report_2025.md`
- `data/interim/qa/electoral_sections_candidate_v3_census_metrics_2025.csv`
- `scripts/create_candidate_electoral_section_polygons_v3_census.py`
- `scripts/audit_candidate_electoral_section_polygons_v3_census.py`
- `scripts/export_electoral_sections_qgis_review_layers_v3.py`

## GPKG Checks

| File | Layer | Rows | CRS | Geometry | Invalid | Empty |
| --- | --- | ---: | --- | --- | ---: | ---: |
| `data/processed/geo/electoral_sections_candidate_2025_v3_census_aggregated.gpkg` | `electoral_sections_candidate_2025_v3_census_aggregated` | 29 | EPSG:32633 | MultiPolygon | 0 | 0 |
| `data/interim/geo/electoral_section_census_cells_assignment_2025.gpkg` | `electoral_section_census_cells_assignment_2025` | 317 | EPSG:32633 | MultiPolygon | 0 | 0 |

The QGIS review GPKG `data/interim/qa/electoral_sections_qgis_review_layers_2025_v3.gpkg` is openable and contains the expected eight layers:

| Layer | Rows | CRS | Geometry | Invalid | Empty |
| --- | ---: | --- | --- | ---: | ---: |
| `candidate_sections_v3_census_aggregated` | 29 | EPSG:32633 | MultiPolygon | 0 | 0 |
| `candidate_sections_v2_voronoi` | 77 | EPSG:32633 | MultiPolygon | 0 | 0 |
| `candidate_sections_v1_voronoi` | 77 | EPSG:32633 | MultiPolygon | 0 | 0 |
| `census_cells_assignment` | 317 | EPSG:32633 | MultiPolygon | 0 | 0 |
| `deterministic_points` | 14503 | EPSG:32633 | Point | 0 | 0 |
| `spatially_resolved_points` | 399 | EPSG:32633 | Point | 0 | 0 |
| `remaining_review_points` | 7855 | EPSG:32633 | Point | 0 | 0 |
| `boundary_uncertainty_points` | 7571 | EPSG:32633 | Point | 0 | 0 |

## Count Checks

- ANNCSU civic rows in V2: 22757.
- Deterministically assigned civic rows: 14503.
- Initial review rows: 8254.
- Spatially resolved candidate rows: 399.
- Rows still requiring review after V2: 7855.
- V1 sections present in QGIS review layer: 77.
- V2 sections present in QGIS review layer: 77.
- V3 census-aggregated sections: 29.
- Section 78 appears in V3 ordinary territorial polygons: no.
- Census cells total: 317.
- `census_cell_conflict` cells: 116.
- `no_assigned_civics` cells: 138.
- V3 sections with `geometry_confidence = low`: 19.
- V3 sections with `needs_manual_review = true`: 28.

## Script And Validation Status

- `scripts/validate_totals.py`: passed.
- `scripts/audit_candidate_electoral_section_polygons_v3_census.py`: passed.
- CSV readability check for `electoral_sections_candidate_v3_census_metrics_2025.csv`: passed with 29 rows, 14 columns, no blank headers and no duplicate headers.
- GPKG readability, CRS and geometry validity checks: passed.
- `scripts/create_candidate_electoral_section_polygons_v3_census.py` and `scripts/export_electoral_sections_qgis_review_layers_v3.py` were not rerun in this post-merge check because they rewrite tracked GPKG outputs. Their existing outputs were opened and verified instead.

## Byte-Churn Check

- The post-merge check was run in a fresh worktree created from `origin/main`, not in the earlier worktree that had modified GPKG files from regeneration.
- Running `scripts/audit_candidate_electoral_section_polygons_v3_census.py` did not leave any working-tree diff.
- No GPKG was regenerated or committed by this post-merge check.
- No geospatial byte-churn was observed in the fresh post-merge worktree.

## Findings

| Priority | Finding | Status | Notes |
| --- | --- | --- | --- |
| P0 | None | Clear | No blocking data, file presence, GPKG readability, CRS or geometry validity issue found. |
| P1 | None | Clear | No structural post-merge issue found. |
| P2 | `qgis-review-required-before-publication` | Open | V3 remains candidate/non-official. The 116 conflict cells, 138 no-evidence cells, 19 low-confidence sections and 28 sections requiring manual review should be inspected before any public use. |
| P2 | `geospatial-output-byte-determinism` | Not observed in this check | GPKG-writing scripts were intentionally not rerun; audit-only execution left no diff. If create/export scripts are rerun later, compare content before committing regenerated binaries. |

## Next Recommended Action

Proceed with guided QGIS review. Start from `data/interim/qa/electoral_sections_qgis_review_layers_2025_v3.gpkg`, inspect `census_cells_assignment` filtered to `census_cell_conflict` and `no_assigned_civics`, compare V3 against V1/V2 Voronoi layers, and decide whether conflict cells need manual adjudication before any V4 or public-facing use.

Do not publish V3 in the frontend and do not use it as an official electoral boundary dataset until human review is complete.
