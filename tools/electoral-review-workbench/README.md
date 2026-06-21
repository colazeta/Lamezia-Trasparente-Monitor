# Electoral Review Workbench 2025

This is a local-only manual review tool for the Lamezia Terme 2025 electoral
section candidate geometry work. It supports QGIS-assisted review of the V3
census-aggregated candidate polygons and the unresolved ANNCSU civic cases.

It does not publish a map, create a public app route, generate V4 geometry, or
apply decisions back to the electoral dataset.

## Inputs

The web datasets are generated from repository inputs already present on
`main`:

- `data/interim/geo/electoral_section_census_cells_assignment_2025.gpkg`
- `data/processed/geo/electoral_sections_candidate_2025_v3_census_aggregated.gpkg`
- `data/interim/qa/electoral_sections_qgis_review_layers_2025_v3.gpkg`
- `data/processed/geo/anncsu_lamezia_civics_with_electoral_section_2025_v2.csv`
- `data/interim/qa/anncsu_electoral_assignment_review_queue_2025.csv`
- `data/interim/geo/electoral_street_rules_2025.csv`
- `data/interim/geo/anncsu_electoral_street_crosswalk_2025.csv`
- `data/interim/qa/electoral_sections_candidate_v3_census_metrics_2025.csv`
- `data/interim/qa/electoral_sections_boundary_uncertainty_points_2025.csv`

## Generate Review Data

From the repository root:

```powershell
python scripts/build_electoral_review_workbench_data.py
```

Generated browser data is written to:

```text
tools/electoral-review-workbench/public/data/
```

The generator exports only web-friendly JSON and GeoJSON. It does not modify
the source GPKG files.

## Run Locally

Serve the directory with any local static server. For example:

```powershell
python -m http.server 4177 --directory tools/electoral-review-workbench
```

Then open:

```text
http://127.0.0.1:4177/
```

Using a local server is required because the browser loads JSON and GeoJSON
through `fetch`.

## Review Flow

1. Open the workbench and choose a case from the queue.
2. Use the map to compare V3 candidate sections, V2 reference geometry, review
   cells, unresolved civics, spatially resolved civics, and a deterministic
   civic sample.
3. Inspect the case facts, related civics, and electoral street rules.
4. Record a decision in the decision panel.
5. Export decisions as CSV or JSON for later QA and controlled application.
6. To continue a previous session, choose the exported CSV/JSON file in the
   import control and press `Import`.

Decision records are stored in browser `localStorage` until exported. Clearing
site data clears unsaved decisions.

## Decision Types

- `confirm_current_assignment`
- `assign_to_section`
- `keep_unassigned`
- `keep_conflict`
- `split_required`
- `needs_external_source`
- `exclude_from_section_geometry`

Each decision can include a proposed section, confidence, reason, QGIS
observation, reviewer name, review date, follow-up flag, and notes.

## Outputs

The generated datasets include:

- `review_summary.json`
- `review_cases.json`
- `review_cells.geojson`
- `candidate_sections_v3.geojson`
- `candidate_sections_v2.geojson`
- `review_points.geojson`
- `spatially_resolved_points.geojson`
- `deterministic_points_sample.geojson`
- `civics_by_case.json`
- `street_rules_by_case.json`

The browser export produces:

- `electoral_sections_v3_manual_review_decisions.csv`
- `electoral_sections_v3_manual_review_decisions.json`

The exported decision fields are:

- `review_id`
- `census_cell_id`
- `case_type`
- `current_assignment_method`
- `current_assigned_section`
- `suggested_section_number`
- `proposed_section_number`
- `decision_type`
- `decision_confidence`
- `reason`
- `qgis_observation`
- `reviewed_by`
- `review_date`
- `requires_follow_up`
- `notes`

## Future V4 Use

The exported decisions are an input for a later V4 candidate-geometry phase.
Before that phase, the decision file should be validated with:

```powershell
python scripts/apply_electoral_review_decisions_stub.py electoral_sections_v3_manual_review_decisions.csv
```

The current stub validates required fields and reports what would be prepared
for a later application step. It intentionally does not write V4 geometry.

## Guardrails

- The V3 candidate geometry remains non-official.
- The workbench is not linked from the public app.
- No deploy configuration is changed.
- No proximity-only assignment is introduced.
- No polygon output is generated.
- Decisions require downstream QA before any V4 work.
