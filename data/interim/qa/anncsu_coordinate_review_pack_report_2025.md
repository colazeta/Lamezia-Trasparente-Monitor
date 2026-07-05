# ANNCSU Coordinate Review Pack 2025

Date: 2026-07-05

## Result

- Review pack rows: 345
- Manual-review-ready rows: 221
- Review pack CSV: `data/interim/qa/anncsu_coordinate_review_pack_2025.csv`

This review pack does not overwrite ANNCSU raw coordinates, processed civic assignments, GPKG files, polygons, or public UI. It only joins existing diagnostics, local ANNCSU anchors, and external geocoder candidates into one review table.

## Decision Readiness

- `manual_review_ready`: 221
- `needs_manual_map_check`: 109
- `not_ready`: 15

## Recommended Candidate Source

- `local_anncsu_anchor`: 329
- `none`: 16

## Evidence Agreement

- `local_anchor_only`: 313
- `local_and_geocoder_agree_within_150m`: 5
- `local_geocoder_conflict_over_500m`: 12
- `no_review_candidate`: 15

## Recommended Review Tracks

- `needs_dedicated_provider_or_manual_lookup`: 15
- `resolve_local_geocoder_conflict`: 1
- `review_local_anchor_with_external_support`: 5
- `review_low_local_anchor`: 108
- `review_medium_local_anchor`: 216

## First Manual-Review-Ready Rows

| rank | access_id | street | civic | source | track | candidate_lon | candidate_lat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 3520443 | VIA DEI BIZANTINI | 195 | local_anncsu_anchor | review_medium_local_anchor | 16.3040313 | 38.9521376 |
| 2 | 3519808 | CONTRADA GABELLA | 45 | local_anncsu_anchor | review_medium_local_anchor | 16.2744573 | 38.9825926 |
| 3 | 3519781 | CONTRADA GABELLA | 290 | local_anncsu_anchor | review_medium_local_anchor | 16.3415815 | 38.9537039 |
| 4 | 3535225 | VIA ALDO MORO | 40 | local_anncsu_anchor | review_medium_local_anchor | 16.3348419 | 38.9487546 |
| 5 | 3526951 | VIA BERNARDINO TELESIO | 17 | local_anncsu_anchor | review_medium_local_anchor | 16.2828543 | 38.9647079 |
| 6 | 3526973 | VIA BERNARDINO TELESIO | 54 | local_anncsu_anchor | review_medium_local_anchor | 16.2829723 | 38.9642488 |
| 7 | 3572084 | CORSO NUMISTRANO | 37 | local_anncsu_anchor | review_medium_local_anchor | 16.319956 | 38.9755782 |
| 8 | 3529347 | VIA ANTONELLO DA MESSINA | 54 | local_anncsu_anchor | review_medium_local_anchor | 16.2807241 | 38.9688659 |
| 9 | 3524776 | VIA ANTONIO DE MEDICI | 15 | local_anncsu_anchor | review_medium_local_anchor | 16.3070765 | 38.9720792 |
| 10 | 3528302 | CONTRADA BUCOLIA DI SOTTO | 56 | local_anncsu_anchor | review_medium_local_anchor | 16.2899066 | 38.988473 |

## How To Use

1. Open `tools/electoral-review-workbench` and filter by `access_id` from the review pack.
2. Compare the local anchor, external geocoder candidate, ANNCSU label, and street-register evidence.
3. Export a JSON `manual_coordinate_override` only when the reviewer accepts a point.
4. Run `scripts/audit_anncsu_coordinate_decisions.py --decisions <exported-json>`.
5. Run `scripts/build_anncsu_coordinate_recovery_layer.py --decisions <exported-json>` only after P0/P1 findings are resolved.

## Guardrails

- Do not train from this CSV directly.
- Do not apply `low_street_level` geocoder rows as exact civic coordinates.
- Use accepted manual overrides, not unreviewed candidates, as retraining rows.
