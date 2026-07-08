# ANNCSU Coordinate Override Intake 2025

Date: 2026-07-08

## Scope

This report records the controlled intake gate for reviewed ANNCSU coordinate overrides. It does not edit raw ANNCSU coordinates, processed electoral results, GPKG files, public UI, maps, or candidate polygons.

Reviewed coordinates become effective only as separate recovery-layer values after the coordinate-decision audit has no P0/P1 findings.

## Gate Result

- Status: `awaiting_reviewed_decisions`
- Decisions input: none
- Decision rows: 0
- Recovery rows: 22757
- Training rows accepted from manual overrides: 0
- Suspect rows after latest coordinate-quality audit: 345
- Quality audit run in this intake: false
- Quality audit skip option: false

## Pipeline Steps

- No decision file supplied; no override pipeline steps were run.

## Decision Audit Findings

- No findings CSV entries currently recorded.

## Effective Coordinate Source Counts

- `anncsu_source_coordinate`: 22757

## Recovery Status Counts

- `candidate_requires_human_review`: 330
- `source_coordinate_unchanged`: 22412
- `suspect_requires_review`: 15

## Coordinate Quality Flag Counts

- `isolated_point`: 16
- `needs_manual_coordinate_review`: 9
- `outside_boundary`: 15
- `same_street_outlier`: 261
- `street_context_mismatch`: 44

## Outputs Checked

- Decision audit report: `data/interim/qa/anncsu_coordinate_decisions_audit_report_2025.md`
- Decision findings CSV: `data/interim/qa/anncsu_coordinate_decisions_audit_findings_2025.csv`
- Recovery layer CSV: `data/interim/geo/anncsu_lamezia_coordinate_recovery_candidates_2025.csv`
- Recovery layer report: `data/interim/qa/anncsu_coordinate_recovery_layer_report_2025.md`
- Training-set CSV: `data/interim/qa/anncsu_coordinate_recovery_training_set_2025.csv`
- Coordinate quality report: `data/interim/qa/anncsu_coordinate_quality_report_2025.md`

## How To Use

1. Export reviewed coordinate decisions from the local workbench or build them from a human-filled worksheet.
2. Run `python scripts/intake_anncsu_coordinate_overrides.py --decisions <reviewed-decisions.json>`.
3. If the status is `passed_with_accepted_reviewed_overrides`, commit the decision export, recovery layer, training set, and QA reports in a small PR.
4. If the status is blocked, inspect the decision audit report and fix P0/P1 findings before rebuilding the recovery layer.

## Guardrails

- Do not train from geocoder or local-anchor candidates before human acceptance.
- Do not rewrite `COORD_X_COMUNE` or `COORD_Y_COMUNE` in raw ANNCSU files.
- Do not use this intake report to create V4 geometry automatically.
- Keep public UI, deploy, maps, GPKG files, and electoral result values out of this workflow.
