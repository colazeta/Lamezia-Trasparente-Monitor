# ANNCSU Coordinate Decisions Audit 2025

Date: 2026-06-29

## Scope

This audit checks exported local workbench coordinate decisions before any reviewed coordinate can become an effective replacement or a training-set row.

Raw ANNCSU coordinates remain immutable. A coordinate replacement is acceptable only as a reviewed `manual_coordinate_override` with a civic `access_id`, plausible lon/lat, reviewer metadata, and structured evidence snapshots.

## Inputs

- Decisions file: `none`
- Processed civics: `data/processed/geo/anncsu_lamezia_civics_with_electoral_section_2025_v2.csv`
- Coordinate suspects: `data/interim/qa/anncsu_coordinate_suspect_points_2025.csv`
- External geocoder candidates: `data/interim/qa/anncsu_coordinate_geocode_candidates_2025.csv`
- Local ANNCSU anchor candidates: `data/interim/qa/anncsu_coordinate_local_anchor_candidates_2025.csv`

## Summary

- No decisions file supplied. Run this script with `--decisions <workbench-json-export>` before applying reviewed coordinate overrides.

## Findings

- No P0/P1/P2 findings.

## Gate

- P0/P1 findings mean the decisions file is not ready for `scripts/build_anncsu_coordinate_recovery_layer.py --decisions`.
- P2 findings are non-blocking review notes, but should be checked before future geometry generation.
- Use JSON export from the workbench for coordinate overrides; CSV export is insufficient for structured evidence snapshots.
