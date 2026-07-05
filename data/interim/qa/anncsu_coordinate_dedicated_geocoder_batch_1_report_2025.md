# ANNCSU Dedicated Geocoder Batch 1 2025

Date: 2026-07-05

## Result

- Batch ID: `anncsu_dedicated_geocoder_batch_1_2025`
- Eligible suspect rows inspected: 345
- Exported rows: 100
- Skipped rows with existing reviewable geocoder candidate: 13
- Batch CSV: `data/interim/qa/anncsu_coordinate_dedicated_geocoder_batch_1_2025.csv`

This file is a provider handoff template. It does not call a provider and does not modify ANNCSU raw coordinates, processed civic assignments, GPKG files, polygons, or public UI.

## Provider Instructions

- Use only a provider, internal service, or dedicated Nominatim instance whose terms allow this batch size.
- Fill `result_lon`, `result_lat`, `result_accuracy_m`, `result_confidence`, `result_match_type`, `result_provider`, `result_raw_id`, and `result_notes`.
- Do not write accepted coordinate overrides in this file. Results become review candidates only after import.

## Requested Provider Instruction Counts

- `P2_dedicated_provider_high_value`: 58
- `P2_dedicated_provider_useful`: 42

## Coordinate Quality Flags

- `outside_boundary`: 15
- `same_street_outlier`: 42
- `street_context_mismatch`: 43

## Next Step

After a provider fills the result columns, run `scripts/import_anncsu_dedicated_geocoder_results.py --input data/interim/qa/anncsu_coordinate_dedicated_geocoder_batch_1_2025.csv`.
Imported provider rows remain `candidate_requires_human_review` evidence; they are not effective coordinate overrides or training rows until a reviewer accepts them.
