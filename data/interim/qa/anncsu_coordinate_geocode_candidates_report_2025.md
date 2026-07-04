# ANNCSU Coordinate External Geocode Candidates 2025

Date: 2026-07-04

## Result

- Request plan rows: 345
- Requests attempted in this run: 0
- Cached provider responses reused: 27
- Candidate rows written: 26
- Dry run: no
- Limit: 20
- Selection filter: street_prefix=VIA
- Rate limit sleep seconds: 1.2
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
