# ANNCSU Coordinate Review Batch 1 2025

Date: 2026-07-03

## Result

- Priority queue rows: 345
- Batch target size: 50
- Batch 1 rows: 50
- Priority queue CSV: `data/interim/qa/anncsu_coordinate_review_priority_queue_2025.csv`
- Batch 1 CSV: `data/interim/qa/anncsu_coordinate_review_batch_1_2025.csv`

This batch does not apply coordinate corrections. It is a manual-review worklist for the local workbench.

## Queue Status Counts

- `no_local_candidate`: 15
- `ready_for_later_manual_review`: 280
- `ready_for_manual_review`: 50

## Batch 1 Method Counts

- `same_street_civic_number_interpolation`: 14
- `same_street_same_civic_number_anchor`: 36

## Batch 1 Confidence Counts

- `medium`: 50

## Batch 1 Coordinate Flags

- `needs_manual_coordinate_review`: 1
- `outside_boundary`: 2
- `same_street_outlier`: 43
- `street_context_mismatch`: 4

## Review Instructions

1. Open each `access_id` in the local electoral review workbench.
2. Check the ANNCSU label, local-anchor evidence, street-register evidence, and map context.
3. If accepted, export a JSON decision with `coordinate_decision_type=manual_coordinate_override` and the candidate lon/lat.
4. If rejected, leave it unresolved or mark `needs_external_verification`.
5. Run `scripts/audit_anncsu_coordinate_decisions.py --decisions <json-export>` before applying any override.
6. Rebuild the recovery layer and rerun `scripts/audit_anncsu_coordinate_quality.py --use-recovery-layer`.

## Guardrails

- Do not edit ANNCSU raw coordinates.
- Do not apply local-anchor candidates automatically.
- Do not train from rejected, low-evidence, or unaudited decisions.
- Do not generate V4 geometry from this batch alone.

## First 15 Batch Rows

- rank 1: `3520443` VIA DEI BIZANTINI 195 -> `same_street_same_civic_number_anchor` medium (1354.2 m)
- rank 2: `3519808` CONTRADA GABELLA 45 -> `same_street_same_civic_number_anchor` medium (3009.8 m)
- rank 3: `3519781` CONTRADA GABELLA 290 -> `same_street_same_civic_number_anchor` medium (5097.0 m)
- rank 4: `3535225` VIA ALDO MORO 40 -> `same_street_same_civic_number_anchor` medium (5069.9 m)
- rank 5: `3526951` VIA BERNARDINO TELESIO 17 -> `same_street_same_civic_number_anchor` medium (1256.9 m)
- rank 6: `3526973` VIA BERNARDINO TELESIO 54 -> `same_street_same_civic_number_anchor` medium (4142.1 m)
- rank 7: `3572084` CORSO NUMISTRANO 37 -> `same_street_same_civic_number_anchor` medium (5623.6 m)
- rank 8: `3529347` VIA ANTONELLO DA MESSINA 54 -> `same_street_same_civic_number_anchor` medium (4253.1 m)
- rank 9: `3524776` VIA ANTONIO DE MEDICI 15 -> `same_street_same_civic_number_anchor` medium (1741.1 m)
- rank 10: `3528302` CONTRADA BUCOLIA DI SOTTO 56 -> `same_street_same_civic_number_anchor` medium (2729.3 m)
- rank 11: `3562717` VIA STATTI VIGNOLA 31 -> `same_street_same_civic_number_anchor` medium (718.0 m)
- rank 12: `3537393` VIA TIMAVO 13 -> `same_street_same_civic_number_anchor` medium (733.3 m)
- rank 13: `3524034` VIA DELLE ROSE 29 -> `same_street_same_civic_number_anchor` medium (1206.6 m)
- rank 14: `3565191` VIA GIOVANNI VENTITREESIMO 22 -> `same_street_same_civic_number_anchor` medium (5629.7 m)
- rank 15: `3530601` CONTRADA CROZZANO SUPERIORE 95 -> `same_street_same_civic_number_anchor` medium (3885.5 m)
