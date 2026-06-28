# ANNCSU Coordinate Recovery Layer 2025

Date: 2026-06-28

## Result

- Recovery rows: 22757
- Training rows accepted from manual overrides: 0
- Decisions input: none
- Recovery CSV: `data/interim/geo/anncsu_lamezia_coordinate_recovery_candidates_2025.csv`
- Training-set CSV: `data/interim/qa/anncsu_coordinate_recovery_training_set_2025.csv`

This layer does not overwrite ANNCSU raw coordinates. `source_lon/source_lat` remain the original source values; `effective_lon/effective_lat` are populated only for accepted reviewed overrides.

## Effective Coordinate Source Counts

- `anncsu_source_coordinate`: 22757

## Recovery Status Counts

- `source_coordinate_unchanged`: 22412
- `suspect_requires_review`: 345

## Geocoder Candidate Counts

- `candidate_requires_human_review`: 2
- `no_candidate_returned`: 3

## How To Use

1. Run `scripts/diagnose_anncsu_coordinate_corruption.py` and `scripts/geocode_anncsu_coordinate_candidates.py`.
2. Review candidate or manually picked coordinates in the local workbench.
3. Export decisions from the workbench as JSON or CSV.
4. Re-run this script with `--decisions <exported file>`.
5. Use only `accepted_reviewed_override` rows as a correction/training set for future coordinate-quality passes.

## Guardrails

- Do not use `candidate_requires_human_review` as an applied correction.
- Do not train from unreviewed provider results.
- Do not change processed electoral result values.
- Do not generate V4 geometry until reviewed overrides pass a separate audit.
