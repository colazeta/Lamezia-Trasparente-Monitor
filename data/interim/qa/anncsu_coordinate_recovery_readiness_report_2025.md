# ANNCSU Coordinate Recovery Readiness 2025

Date: 2026-07-05

## Readiness Verdict

- `awaiting_human_review`: diagnostics and candidate evidence exist, but no reviewed coordinate overrides have been accepted yet.

## Source And Candidate Coverage

- Source civics: 22757
- Suspect coordinate rows: 345
- Suspects with local ANNCSU candidate: 330
- Suspects with external geocoder candidate: 13
- Suspects manual-review-ready in review pack: 220
- Worksheet rows: 50
- Worksheet accepted rows: 0
- Reviewed decisions JSON rows: 0
- Recovery rows: 22757
- Accepted reviewed overrides in recovery layer: 0
- Training-set rows: 0

## Diagnosis Counts

- `suspect_coordinate_present_in_original_anncsu_raw`: 345

## Coordinate Quality Flags

- `isolated_point`: 16
- `needs_manual_coordinate_review`: 9
- `outside_boundary`: 15
- `same_street_outlier`: 261
- `street_context_mismatch`: 44

## Review Pack Readiness

- `manual_review_ready`: 220
- `needs_manual_map_check`: 110
- `not_ready`: 15

## Worksheet Actions

- `blank`: 50

## Decision Audit Summary

- No reviewed coordinate decision rows to audit yet.

## Recovery Status Counts

- `candidate_requires_human_review`: 330
- `source_coordinate_unchanged`: 22412
- `suspect_requires_review`: 15

## Findings

| Severity | Code | Detail | Next action |
| --- | --- | --- | --- |
| P2 | `source-coordinate-suspects-come-from-raw-anncsu` | All current suspect coordinates are already present in the original ANNCSU indirizzario bytes. | Treat replacements as reviewed effective coordinates; do not overwrite raw source fields. |
| P2 | `no-reviewed-coordinate-overrides-yet` | The current worksheet has no accepted or edited coordinate rows. | Human review must mark rows before any recovery/training set can be populated. |
| P2 | `not-all-suspects-have-review-ready-candidate` | 125 suspect row(s) are not manual-review-ready in the current review pack. | Use dedicated geocoder/manual lookup for rows without a local or external candidate. |

## Operational Next Step

1. Complete rows in `data/interim/qa/anncsu_coordinate_review_worksheet_batch_1_2025.csv` with `accept_candidate`, `edit_coordinate`, `reject_candidate`, or `needs_more_evidence`.
2. Re-run `scripts/build_anncsu_coordinate_decisions_from_worksheet.py`.
3. Re-run `scripts/audit_anncsu_coordinate_decisions.py --decisions data/interim/qa/anncsu_coordinate_reviewed_decisions_batch_1_2025.json`.
4. Re-run `scripts/build_anncsu_coordinate_recovery_layer.py --decisions data/interim/qa/anncsu_coordinate_reviewed_decisions_batch_1_2025.json` only when the decision audit has no P0/P1 findings.
5. Re-run `scripts/audit_anncsu_coordinate_quality.py --use-recovery-layer` and inspect whether suspect counts actually fall.

Raw ANNCSU coordinates remain immutable. Reviewed replacements become separate effective coordinates and training rows only after the audit gate passes.
