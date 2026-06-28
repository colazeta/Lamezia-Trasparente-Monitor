# ANNCSU Coordinate Corruption Diagnostic 2025

Date: 2026-06-28

## Result

- The current suspect coordinates are copied through from the original ANNCSU indirizzario bytes.
- Suspect records inspected: 345
- Diagnostic CSV: `data/interim/qa/anncsu_coordinate_corruption_diagnostic_2025.csv`

This diagnostic does not edit ANNCSU raw files, processed election values, GPKG files, polygons, or public UI.

## Source Chain

| stage | path | rows | delimiter | notes |
| --- | --- | --- | --- | --- |
| raw zip | data/raw/geo/indirizzarioCalabria20260602.zip | 22757 | ; | internal=INDIR_CALA_20260602.csv; sha256=adcf9272b5e74cd2... |
| Lamezia extract | data/raw/geo/anncsu_lamezia_indirizzario_20260602.csv | 22757 | ; |  |
| processed civics V2 | data/processed/geo/anncsu_lamezia_civics_with_electoral_section_2025_v2.csv | 22757 | , |  |
| coordinate suspects | data/interim/qa/anncsu_coordinate_suspect_points_2025.csv | 345 | , |  |

## Integrity Checks

| check | count |
| --- | --- |
| extract_duplicate_access_ids | 0 |
| extract_missing_from_processed | 0 |
| extract_missing_from_raw | 0 |
| extract_processed_address_mismatches_all_rows | 0 |
| extract_processed_coordinate_mismatches_all_rows | 0 |
| processed_duplicate_access_ids | 0 |
| raw_duplicate_access_ids | 0 |
| raw_extract_address_mismatches_all_rows | 0 |
| raw_extract_coordinate_mismatches_all_rows | 0 |
| raw_missing_from_extract | 0 |

## Suspect Source Diagnosis

| diagnosis | count |
| --- | --- |
| suspect_coordinate_present_in_original_anncsu_raw | 345 |

## Repeated Coordinate Signals

| signal | count |
| --- | --- |
| exact_coordinate_groups_with_10plus_civics | 0 |
| exact_coordinate_groups_with_3plus_distinct_streets | 0 |

## Interpretation

- If `pipeline_extract_coordinate_mismatch` or `processed_coordinate_mismatch` appears, fix the local extraction/processing pipeline first.
- If suspect coordinates are already present in the original ANNCSU zip, treat ANNCSU coordinates as source evidence but not as automatically trustworthy geometry.
- Do not overwrite `COORD_X_COMUNE` or `COORD_Y_COMUNE`; preserve them as immutable source fields.
- Store any replacement as a separate reviewed coordinate with provider, query, confidence, reviewer decision, and original-coordinate distance.

## Recovery / Retraining Process

1. Keep raw ANNCSU coordinates unchanged and reproducible.
2. Use `anncsu_coordinate_suspect_points_2025.csv` plus this diagnostic to decide whether a record needs pipeline repair or external coordinate recovery.
3. Generate external geocoder candidates only for suspect records, with cache and rate limiting.
4. Compare each candidate against municipal boundary, ANNCSU street context, electoral street-register evidence, and same-street reviewed anchors.
5. Review candidates in the local workbench and export explicit coordinate decisions.
6. Build a future correction/training set from accepted manual overrides, not from unreviewed API results.
7. Re-run coordinate quality audits and only then consider a future V4 candidate geometry.

## External Geocoder Guardrails

- Nominatim can support small, cached, rate-limited candidate generation, but public Nominatim must not be treated as a bulk geocoding backend.
- For full re-geocoding of hundreds or thousands of civics, use a dedicated service, an internal Nominatim instance, or another provider with explicit bulk terms.
- API coordinates are proposals, not authoritative corrections.
