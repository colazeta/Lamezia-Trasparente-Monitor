# ANNCSU Dedicated Geocoder Import 2025

Date: 2026-07-05

## Result

- Input CSV: `data/interim/qa/anncsu_coordinate_dedicated_geocoder_batch_1_2025.csv`
- Input rows: 100
- Rows with provider result fields present: 0
- Rows with importable result coordinates: 0
- Blank provider-result rows skipped: 100
- Incomplete or invalid provider-result rows skipped: 0
- Imported candidate rows: 0
- Candidate access_ids after import: 30
- Candidate CSV: `data/interim/qa/anncsu_coordinate_geocode_candidates_2025.csv`
- Workbench candidate JSON: `tools/electoral-review-workbench/public/data/coordinate_geocode_candidates_by_access.json`

Imported rows are provider candidates only. They do not overwrite ANNCSU raw coordinates, processed civic assignments, GPKG files, polygons, public UI, or training rows.

## Imported Candidate Status Counts

- No importable result rows found.

## Imported Provider Confidence Counts

- No provider confidence values imported.

## Imported Provider Counts

- No provider rows imported.

## Next Step

Run `scripts/prepare_anncsu_coordinate_review_pack.py` and review imported provider candidates in the local workbench. Accepted replacements must still be exported as explicit `manual_coordinate_override` decisions.
