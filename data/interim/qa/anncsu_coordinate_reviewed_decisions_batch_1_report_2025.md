# ANNCSU Coordinate Reviewed Decisions Batch 1 2025

Date: 2026-07-05

## Result

- Worksheet rows: 50
- Reviewed decisions exported: 0
- Blocking validation errors: 0
- Decisions JSON: `data/interim/qa/anncsu_coordinate_reviewed_decisions_batch_1_2025.json`

This builder exports only rows explicitly marked `accept_candidate` or `edit_coordinate`. Blank, rejected, and needs-more-evidence rows are not exported.

## Reviewer Action Counts

- `blank`: 50

## Next Step

Run `scripts/audit_anncsu_coordinate_decisions.py --decisions <decisions-json>` and resolve all P0/P1 findings before building the recovery layer.
