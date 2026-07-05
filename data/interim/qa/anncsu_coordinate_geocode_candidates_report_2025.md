# ANNCSU Coordinate External Geocode Candidates 2025

Date: 2026-07-05

## Result

- Request plan rows: 345
- Selected rows for this run: 25
- Existing candidate access_ids before this run: 20
- Existing candidate rows preserved: 26
- Access_ids skipped because candidates already exist: 20
- Requests attempted in this run: 0
- Cached provider responses reused: 0
- New candidate rows from this run: 0
- Candidate rows written: 26
- Dry run: yes
- Limit: 25
- Selection filter: none
- Rate limit sleep seconds: 1.1
- Request plan CSV: `data/interim/qa/anncsu_coordinate_geocode_request_plan_2025.csv`
- Candidate CSV: `data/interim/qa/anncsu_coordinate_geocode_candidates_2025.csv`
- Workbench candidate JSON: `tools/electoral-review-workbench/public/data/coordinate_geocode_candidates_by_access.json`
- Cache directory: `.cache/anncsu-geocode/nominatim`

This script creates coordinate candidates only. It does not overwrite ANNCSU raw coordinates, processed civic assignments, GPKG files, polygons, or public UI.

## Provider Guardrails

- Provider: Nominatim search API (https://nominatim.openstreetmap.org/search).
- Public usage policy: https://operations.osmfoundation.org/policies/nominatim/.
- Public Nominatim is not a bulk geocoding backend; use this script for small, cached, rate-limited QA batches or point it at a dedicated provider/internal instance.
- API candidates require human review before they can become manual coordinate overrides.

## Candidate Status Counts

- `candidate_requires_human_review`: 19
- `no_candidate_returned`: 7

## Provider Confidence Counts

- `low_street_level`: 19

## Next Review Step

Use the candidate CSV as evidence in the local workbench. Accepted replacements must be exported as explicit `manual_coordinate_override` decisions with original coordinates, proposed coordinates, provider/query evidence, and reviewer confidence.
