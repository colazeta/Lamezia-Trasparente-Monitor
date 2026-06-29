# ANNCSU Local Anchor Coordinate Candidates 2025

Date: 2026-06-29

## Result

- Source civics checked: 22757
- Reliable local anchor civics: 22412
- Suspect rows processed: 345
- Candidate CSV: `data/interim/qa/anncsu_coordinate_local_anchor_candidates_2025.csv`

This script creates local ANNCSU anchor candidates only. It does not modify ANNCSU raw coordinates, processed assignments, GPKG files, polygons, or public UI.

## Candidate Status Counts

- `candidate_requires_human_review`: 330
- `no_candidate_returned`: 15

## Candidate Method Counts

- `nearest_same_street_numeric_anchor`: 102
- `no_local_anchor_candidate`: 15
- `same_street_civic_number_interpolation`: 192
- `same_street_same_civic_number_anchor`: 36

## Candidate Confidence Counts

- `low`: 110
- `medium`: 220

## Interpretation

- `same_street_civic_number_interpolation` uses nearby non-suspect ANNCSU anchors on the same street and numeric civic sequence.
- `same_street_same_civic_number_anchor`, `nearest_same_street_numeric_anchor`, and `same_street_anchor_median` are weaker review aids.
- All rows remain `candidate_requires_human_review` until a reviewer exports a `manual_coordinate_override` decision.
- Do not train from these candidates directly; train only from accepted manual overrides.
