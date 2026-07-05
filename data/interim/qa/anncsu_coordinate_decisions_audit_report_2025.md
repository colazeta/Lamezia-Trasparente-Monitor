# ANNCSU Coordinate Decisions Audit 2025

Date: 2026-07-05

## Scope

This audit checks exported local workbench coordinate decisions before any reviewed coordinate can become an effective replacement or a training-set row.

Raw ANNCSU coordinates remain immutable. A coordinate replacement is acceptable only as a reviewed `manual_coordinate_override` with a civic `access_id`, plausible lon/lat, reviewer metadata, and structured evidence snapshots.

## Inputs

- Decisions file: `data/interim/qa/anncsu_coordinate_reviewed_decisions_batch_1_2025.json`
- Processed civics: `data/processed/geo/anncsu_lamezia_civics_with_electoral_section_2025_v2.csv`
- Coordinate suspects: `data/interim/qa/anncsu_coordinate_suspect_points_2025.csv`
- External geocoder candidates: `data/interim/qa/anncsu_coordinate_geocode_candidates_2025.csv`
- Local ANNCSU anchor candidates: `data/interim/qa/anncsu_coordinate_local_anchor_candidates_2025.csv`

## Summary

### Export Metadata

- exported_at: ``
- export_format: `anncsu_coordinate_reviewed_decisions_v1`
- source_csv: `data/interim/qa/anncsu_coordinate_review_worksheet_batch_1_2025.csv`

- decision_rows: 0
- coordinate_decision_type_counts:
- manual_coordinate_override_rows: 0
- training_ready_manual_overrides: 0
- manual_override_candidate_matches_within_5m: 0
- manual_override_distance_min_m: ``
- manual_override_distance_max_m: ``
- manual_override_distance_avg_m: ``

## Findings

- No P0/P1/P2 findings.

## Gate

- P0/P1 findings mean the decisions file is not ready for `scripts/build_anncsu_coordinate_recovery_layer.py --decisions`.
- P2 findings are non-blocking review notes, but should be checked before future geometry generation.
- Use JSON export from the workbench for coordinate overrides; CSV export is insufficient for structured evidence snapshots.
