# ANNCSU Dedicated Geocoder Batch 2025

Date: 2026-07-06

## Result

- Batch ID: `anncsu_dedicated_geocoder_batch_2_2025`
- Suspect rows inspected: 345
- Eligible rows after filters: 228
- Exported rows: 100
- Skipped rows with existing reviewable geocoder candidate: 17
- Skipped rows already present in previous batch CSVs: 100
- Offset applied after filters: 0
- Batch CSV: `data/interim/qa/anncsu_coordinate_dedicated_geocoder_batch_2_2025.csv`

This file is a provider handoff template. It does not call a provider and does not modify ANNCSU raw coordinates, processed civic assignments, GPKG files, polygons, or public UI.

## Previous Batch Inputs

- `data/interim/qa/anncsu_coordinate_dedicated_geocoder_batch_1_2025.csv`

## Provider Instructions

- Use only a provider, internal service, or dedicated Nominatim instance whose terms allow this batch size.
- Fill `result_lon`, `result_lat`, `result_accuracy_m`, `result_confidence`, `result_match_type`, `result_provider`, `result_raw_id`, and `result_notes`.
- Do not write accepted coordinate overrides in this file. Results become review candidates only after import.

## Requested Provider Instruction Counts

- `P2_dedicated_provider_useful`: 100

## Coordinate Quality Flags

- `isolated_point`: 8
- `needs_manual_coordinate_review`: 5
- `same_street_outlier`: 87

## Next Step

After a provider fills the result columns, run `scripts/import_anncsu_dedicated_geocoder_results.py --input data/interim/qa/anncsu_coordinate_dedicated_geocoder_batch_2_2025.csv`.
Imported provider rows remain `candidate_requires_human_review` evidence; they are not effective coordinate overrides or training rows until a reviewer accepts them.
