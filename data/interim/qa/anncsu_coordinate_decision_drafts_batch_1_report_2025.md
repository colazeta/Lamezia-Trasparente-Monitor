# ANNCSU Coordinate Decision Drafts Batch 1 2025

Date: 2026-07-05

## Result

- Batch ID: `anncsu_coordinate_review_batch_1_2025`
- Draft decisions: 50
- Draft JSON: `data/interim/qa/anncsu_coordinate_decision_drafts_batch_1_2025.json`

These draft decisions are not accepted coordinate overrides. They intentionally keep `requires_follow_up=true`, `requires_external_coordinate_check=true`, blank reviewer metadata, and `coordinate_decision_confidence=draft`, so `scripts/audit_anncsu_coordinate_decisions.py --decisions` must block them until a human reviewer edits and accepts each row.

## Candidate Confidence Counts

- `medium`: 50

## Candidate Method Counts

- `same_street_civic_number_interpolation`: 14
- `same_street_same_civic_number_anchor`: 36

## How To Use

1. Open each `access_id` in the local workbench.
2. Compare the proposed point against ANNCSU label, street-register evidence, map context, and any external geocoder evidence.
3. Only after review, set reviewer metadata, review date, coordinate confidence (`high` or `medium`), and clear follow-up/external-check flags.
4. Run `scripts/audit_anncsu_coordinate_decisions.py --decisions <edited-json>`.
5. Use the recovery layer only after P0/P1 findings are resolved.

## Guardrails

- Do not pass this draft JSON directly to recovery as accepted coordinates.
- Do not train from these draft rows.
- Do not modify ANNCSU raw coordinates.
