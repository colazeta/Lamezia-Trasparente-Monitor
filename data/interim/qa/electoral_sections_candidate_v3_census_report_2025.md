# Electoral sections candidate V3 census aggregation report 2025

Date: 2026-06-20

Status: `candidate_inferred`, not official, for QGIS review only.

## Why V3

- V1/V2 Voronoi polygons are useful diagnostics from assigned ANNCSU civic points, but QGIS review showed fragmentation in several dissolved geometries.
- V3 uses ISTAT census sections as operational aggregation cells so candidate boundaries are easier to inspect and less point-noise driven.
- The ISTAT census sections are not treated as official electoral-section boundaries; the municipal electoral street register remains the primary source for section assignment.

## Inputs

- V2 civics CSV: `data/processed/geo/anncsu_lamezia_civics_with_electoral_section_2025_v2.csv`.
- ISTAT census sections: `data/processed/territorio/istat_sezioni_censimento_lamezia.geojson`.
- Cell assignment GPKG: `data/interim/geo/electoral_section_census_cells_assignment_2025.gpkg`.
- V3 GPKG: `data/processed/geo/electoral_sections_candidate_2025_v3_census_aggregated.gpkg`.

## Census Cell Assignment Summary

- ISTAT census cells used: 317.
- Cells assigned to an electoral section: 63.
- Cells assigned by dominant-section threshold: 34.
- Low-evidence single-section cells: 29.
- Conflict cells left unassigned: 116.
- No-evidence cells left unassigned: 138.
- V3 electoral sections produced: 29.
- V2 sections not produced in conservative V3 dissolve: 48.
- V2 polygon parts: 1766.
- V3 polygon parts: 47.
- V2 non-high confidence sections: 75.
- V3 sections requiring review by automated metrics: 28.
- Remaining review civics are still visible for QGIS inspection: 7855.

## Cell Assignment Rules

- At least 5 assigned civics and dominant electoral-section share >= 70%: assign the census cell to the dominant section with high or medium confidence.
- Fewer than 5 assigned civics, all supporting one section: assign with low confidence and keep manual review required.
- Multiple sections without a 70% dominant share: mark as `census_cell_conflict` and leave unassigned.
- No assigned civics inside the cell: mark as `no_assigned_civics` and leave unassigned.
- Section 78 is not included in ordinary territorial polygonization.

## Cell Method Counts

| assignment_method | cells |
| --- | --- |
| census_cell_conflict | 116 |
| census_cell_dominant_section_threshold | 34 |
| census_cell_single_section_low_evidence | 29 |
| no_assigned_civics | 138 |

## Fragile V3 Sections

| section | confidence | parts | conflict_cells | notes |
| --- | --- | --- | --- | --- |
| 8 | low | 2 | 4 | nearby or suggested census cells remain conflicted |
| 16 | low | 1 | 1 | very few census cells assigned; very few supporting assigned civics; nearby or suggested census cells remain conflicted |
| 18 | low | 2 | 1 | very few supporting assigned civics; nearby or suggested census cells remain conflicted; review civics exceed assigned civic support inside used cells |
| 20 | low | 1 | 1 | very few census cells assigned; very few supporting assigned civics; nearby or suggested census cells remain conflicted; review civics exceed assigned civic support inside used cel |
| 24 | medium | 3 | 2 | multi-part census aggregate; nearby or suggested census cells remain conflicted |
| 25 | low | 1 | 0 | very few census cells assigned; very few supporting assigned civics |
| 29 | medium | 3 | 2 | multi-part census aggregate; nearby or suggested census cells remain conflicted |
| 30 | medium | 2 | 2 | nearby or suggested census cells remain conflicted |
| 32 | low | 1 | 0 | very few census cells assigned |
| 34 | low | 1 | 0 | very few census cells assigned; very few supporting assigned civics |
| 36 | low | 1 | 7 | very few census cells assigned; very few supporting assigned civics; nearby or suggested census cells remain conflicted |
| 38 | low | 1 | 1 | very few census cells assigned; very few supporting assigned civics; nearby or suggested census cells remain conflicted |
| 43 | low | 1 | 3 | very few census cells assigned; nearby or suggested census cells remain conflicted |
| 44 | medium | 2 | 2 | nearby or suggested census cells remain conflicted; review civics exceed assigned civic support inside used cells |
| 46 | low | 1 | 0 | very few census cells assigned |
| 48 | medium | 2 | 1 | nearby or suggested census cells remain conflicted |
| 50 | medium | 1 | 2 | nearby or suggested census cells remain conflicted |
| 53 | low | 1 | 1 | very few census cells assigned; nearby or suggested census cells remain conflicted |
| 54 | low | 2 | 4 | nearby or suggested census cells remain conflicted |
| 55 | low | 1 | 3 | very few census cells assigned; very few supporting assigned civics; nearby or suggested census cells remain conflicted |
| 57 | medium | 4 | 2 | multi-part census aggregate; nearby or suggested census cells remain conflicted |
| 60 | low | 1 | 2 | very few census cells assigned; very few supporting assigned civics; nearby or suggested census cells remain conflicted |
| 62 | medium | 3 | 2 | multi-part census aggregate; nearby or suggested census cells remain conflicted |
| 63 | low | 2 | 4 | very few supporting assigned civics; nearby or suggested census cells remain conflicted |
| 64 | low | 1 | 1 | very few census cells assigned; very few supporting assigned civics; nearby or suggested census cells remain conflicted |
| 70 | low | 1 | 2 | very few census cells assigned; nearby or suggested census cells remain conflicted |
| 76 | low | 2 | 2 | very few supporting assigned civics; nearby or suggested census cells remain conflicted; review civics exceed assigned civic support inside used cells |
| 77 | medium | 1 | 2 | nearby or suggested census cells remain conflicted |

## Qualitative V2/V3 Comparison

- V2 is a point-derived Voronoi candidate and can preserve fine-grained uncertainty, but it may fragment when assigned civic points are sparse or spatially irregular.
- V3 aggregates whole ISTAT census cells, so it is more readable for QGIS review and avoids many narrow Voronoi shards.
- V3 deliberately leaves conflict and no-evidence census cells outside the dissolved electoral-section polygons rather than forcing them into a section.
- Because of that conservative rule, V3 currently produces 29 sections rather than the 77 sections visible in V2.
- V1/V2 remain available and should be compared against V3 during manual review.

## V2 Sections Not Produced In V3

1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 17, 19, 21, 22, 23, 26, 27, 28, 31, 33, 35, 37, 39, 40, 41, 42, 45, 47, 51, 52, 56, 58, 59, 61, 65, 66, 67, 68, 69, 71, 72, 73, 74, 75

## Outputs

- Cell assignment layer: `data/interim/geo/electoral_section_census_cells_assignment_2025.gpkg` layer `electoral_section_census_cells_assignment_2025`.
- V3 candidate polygons: `data/processed/geo/electoral_sections_candidate_2025_v3_census_aggregated.gpkg` layer `electoral_sections_candidate_2025_v3_census_aggregated`.
- V3 metrics CSV: `data/interim/qa/electoral_sections_candidate_v3_census_metrics_2025.csv`.
- QGIS review package: `data/interim/qa/electoral_sections_qgis_review_layers_2025_v3.gpkg`.

## Limits

- V3 is not an official electoral boundary dataset.
- Census sections are used only as aggregation cells; they are not an electoral source.
- Cells with conflicts or no assigned civic evidence are intentionally not forced into final geometry.
- Low-evidence cells and non-high confidence sections require manual QGIS review against the street register.
- No frontend, public map, deploy, or electoral result values are changed by this workflow.

## QGIS Review Instructions

- Open `data/interim/qa/electoral_sections_qgis_review_layers_2025_v3.gpkg`.
- Start with `candidate_sections_v3_census_aggregated` and `census_cells_assignment`.
- Filter `census_cells_assignment` by `assignment_method in ('census_cell_conflict', 'no_assigned_civics')`.
- Compare V3 against `candidate_sections_v2_voronoi` and inspect remaining review points before any manual correction.
- Treat every layer as candidate/non-official until human validation is complete.
