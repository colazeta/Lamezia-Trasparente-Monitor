# ANNCSU Coordinate Review Worksheet Batch 1 2025

Date: 2026-07-05

## Result

- Worksheet rows: 50
- Requested limit: 50
- Worksheet CSV: `data/interim/qa/anncsu_coordinate_review_worksheet_batch_1_2025.csv`

The worksheet is a human-review input. It does not accept, apply, or train coordinate replacements. Rows remain non-actionable until a reviewer fills `reviewer_action`, reviewer metadata, review date, confidence, and reason.

## Decision Readiness Counts

- `manual_review_ready`: 50

## Recommended Candidate Source Counts

- `local_anncsu_anchor`: 50

## Review Track Counts

- `review_medium_local_anchor`: 50

## Allowed Reviewer Actions

- `accept_candidate`
- `edit_coordinate`
- `reject_candidate`
- `needs_more_evidence`

## First Rows

| rank | access_id | street | civic | candidate_source | candidate_lon | candidate_lat |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 3520443 | VIA DEI BIZANTINI | 195 | local_anncsu_anchor | 16.3040313 | 38.9521376 |
| 2 | 3519808 | CONTRADA GABELLA | 45 | local_anncsu_anchor | 16.2744573 | 38.9825926 |
| 3 | 3519781 | CONTRADA GABELLA | 290 | local_anncsu_anchor | 16.3415815 | 38.9537039 |
| 4 | 3535225 | VIA ALDO MORO | 40 | local_anncsu_anchor | 16.3348419 | 38.9487546 |
| 5 | 3526951 | VIA BERNARDINO TELESIO | 17 | local_anncsu_anchor | 16.2828543 | 38.9647079 |
| 6 | 3526973 | VIA BERNARDINO TELESIO | 54 | local_anncsu_anchor | 16.2829723 | 38.9642488 |
| 7 | 3572084 | CORSO NUMISTRANO | 37 | local_anncsu_anchor | 16.319956 | 38.9755782 |
| 8 | 3529347 | VIA ANTONELLO DA MESSINA | 54 | local_anncsu_anchor | 16.2807241 | 38.9688659 |
| 9 | 3524776 | VIA ANTONIO DE MEDICI | 15 | local_anncsu_anchor | 16.3070765 | 38.9720792 |
| 10 | 3528302 | CONTRADA BUCOLIA DI SOTTO | 56 | local_anncsu_anchor | 16.2899066 | 38.988473 |

## How To Use

1. Review each row in the local workbench using `suggested_workbench_filter` or `access_id` from the source review pack.
2. Use `accept_candidate` only when the candidate lon/lat is accepted after human inspection.
3. Use `edit_coordinate` only when the reviewer supplies `reviewer_lon` and `reviewer_lat`.
4. Use `reject_candidate` or `needs_more_evidence` when no coordinate should be exported.
5. Run `scripts/build_anncsu_coordinate_decisions_from_worksheet.py` to create auditable JSON decisions from accepted rows only.

## Guardrails

- Do not train from this worksheet directly.
- Do not edit ANNCSU raw coordinates.
- Do not clear audit-blocking fields outside a documented human review.
