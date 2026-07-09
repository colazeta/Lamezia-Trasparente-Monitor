# ANNCSU Coordinate Review Handoff Batch 1 2025

Date: 2026-07-09

## Scope

This handoff prepares the first coordinate-review batch for human inspection. It does not accept, apply, or train coordinate replacements.

## Result

- Source worksheet: `data/interim/qa/anncsu_coordinate_review_worksheet_batch_1_2025.csv`
- Handoff CSV: `data/interim/qa/anncsu_coordinate_review_handoff_batch_1_2025.csv`
- Handoff rows: 50
- Movement from source min/avg/max m: `57.1` / `3500.4` / `9051.1`

## Review Status Counts

- `awaiting_human_review`: 50

## Worksheet Action Counts

- `blank`: 50

## Candidate Method Counts

- `same_street_civic_number_interpolation`: 14
- `same_street_same_civic_number_anchor`: 36

## First Rows To Review

| rank | access_id | address | candidate | movement_m | status |
| --- | --- | --- | --- | --- | --- |
| 1 | 3520443 | VIA DEI BIZANTINI 195 B | 16.3040313, 38.9521376 | 1354.2 | awaiting_human_review |
| 2 | 3519808 | CONTRADA GABELLA 45 | 16.2744573, 38.9825926 | 3009.8 | awaiting_human_review |
| 3 | 3519781 | CONTRADA GABELLA 290 | 16.3415815, 38.9537039 | 5097.0 | awaiting_human_review |
| 4 | 3535225 | VIA ALDO MORO 40 S | 16.3348419, 38.9487546 | 5069.9 | awaiting_human_review |
| 5 | 3526951 | VIA BERNARDINO TELESIO 17 A | 16.2828543, 38.9647079 | 1256.9 | awaiting_human_review |
| 6 | 3526973 | VIA BERNARDINO TELESIO 54 C | 16.2829723, 38.9642488 | 4142.1 | awaiting_human_review |
| 7 | 3572084 | CORSO NUMISTRANO 37 B | 16.319956, 38.9755782 | 5623.6 | awaiting_human_review |
| 8 | 3529347 | VIA ANTONELLO DA MESSINA 54 | 16.2807241, 38.9688659 | 4253.1 | awaiting_human_review |
| 9 | 3524776 | VIA ANTONIO DE MEDICI 15 B | 16.3070765, 38.9720792 | 1741.1 | awaiting_human_review |
| 10 | 3528302 | CONTRADA BUCOLIA DI SOTTO 56 | 16.2899066, 38.988473 | 2729.3 | awaiting_human_review |
| 11 | 3562717 | VIA STATTI VIGNOLA 31 A | 16.3228291, 38.9731513 | 718.0 | awaiting_human_review |
| 12 | 3537393 | VIA TIMAVO 13 A | 16.3209243, 38.9677332 | 733.3 | awaiting_human_review |
| 13 | 3524034 | VIA DELLE ROSE 29 | 16.2824492, 38.9681481 | 1206.6 | awaiting_human_review |
| 14 | 3565191 | VIA GIOVANNI VENTITREESIMO 22 A | 16.2512812, 38.9209753 | 5629.7 | awaiting_human_review |
| 15 | 3530601 | CONTRADA CROZZANO SUPERIORE 95 | 16.2827353, 38.9894781 | 3885.5 | awaiting_human_review |

## Human Review Steps

1. Serve the local workbench with `python -m http.server 4177 --directory tools/electoral-review-workbench`.
2. Open `http://127.0.0.1:4177/`.
3. For each handoff row, filter by `access_id:<id>` and inspect the ANNCSU label, source point, candidate point, nearby same-street anchors, and street-register context.
4. Fill the source worksheet fields: `reviewer_action`, `coordinate_decision_confidence`, `reviewed_by`, `review_date`, and `coordinate_reason`.
5. Use `accept_candidate` only after human inspection confirms the candidate. Use `edit_coordinate` if the reviewer supplies a better lon/lat. Use `reject_candidate` or `needs_more_evidence` otherwise.

## After Review

Run:

```powershell
python scripts/build_anncsu_coordinate_decisions_from_worksheet.py
python scripts/intake_anncsu_coordinate_overrides.py --decisions data/interim/qa/anncsu_coordinate_reviewed_decisions_batch_1_2025.json
```

The intake gate must report `passed_with_accepted_reviewed_overrides` before any reviewed coordinate can become a recovery-layer value or training row.

## Guardrails

- Do not edit raw ANNCSU coordinates.
- Do not train from this handoff CSV.
- Do not create V4 geometry, public maps, GPKG files, UI, or deploy changes from this batch.
- Do not accept local-anchor candidates without human map/workbench inspection.
