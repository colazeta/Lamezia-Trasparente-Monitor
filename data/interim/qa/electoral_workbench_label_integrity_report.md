# Electoral Workbench Label Integrity Audit

## Result

- P0 findings: 0
- P1 findings: 0
- P2 findings: 1
- Sample CSV: `data\interim\qa\electoral_workbench_label_integrity_sample.csv`

The audit checks that every marker label and coordinate remains tied to its source ANNCSU `access_id`.
OpenStreetMap is not audited as an address source because it is visual context only.

## Layer Counts

- `review_points.geojson`: features=7855, ok=7855
- `deterministic_points_sample.geojson`: features=3000, ok=3000
- `spatially_resolved_points.geojson`: features=399, ok=399

## Task Integrity

- multi_street_task=9, single_street_task=2150, tasks=2159

## Civic Payload Integrity

- ok=8028, rows=8028

## Street Register Evidence

- direct_compatible_rule=44, interval_overlap=34, parity_conflict=5, parity_match=22

## Findings

### P2

- `osm_anncsu_name_difference_not_a_marker_error`: Differences between OSM visible labels and ANNCSU odonimi are expected review context, not source-label errors.

## Interpretation

- P0: marker `access_id`, label, section, or coordinate does not match the source civic CSV.
- P1: task-level multi-street/range/parity metadata is missing or misleading.
- P2: OSM/ANNCSU visual-name differences only; OSM remains a background context.
