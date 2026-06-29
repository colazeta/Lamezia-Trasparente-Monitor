# Electoral Review Workbench Methodology

## Scope

The electoral review workbench supports manual review of the Lamezia Terme
2025 candidate electoral section geometry. It is a local QA tool for the V3
census-aggregated candidate polygons, ANNCSU civic assignment evidence, and the
parsed electoral street register.

The workbench does not create official boundaries, public maps, V4 geometry, or
new electoral results. Its purpose is to collect structured human review
decisions that can be audited before any later geometry update.

## Current Orientation: Civic-first

The current workbench replaces the V2 census-cell-first review posture with a
civic-first model. V2 grouped many questions around census cells or section
metrics. That was useful for diagnosing geometry, but insufficient for manual
resolution because a census cell is not an electoral section and is not the
normative unit described by the electoral street register.

The civic-first model treats these as primary review units:

- individual civics;
- grouped civics on the same street/problem pattern;
- civic-number ranges;
- even/odd parity subsets;
- SNC subsets where present;
- street-register rules and competing street-register sections.

Census cells remain available only as support geometry. They help locate a
problem in QGIS, but they do not authorize assignment by themselves. OpenStreetMap
is also only visual context. The electoral street register remains the primary
normative source.

## Label Integrity Contract

Before a manual decision can be trusted, each displayed civic marker must remain
tied to its ANNCSU source `access_id`. The workbench therefore distinguishes
three different records:

- ANNCSU address: the source civic/access record, including raw odonimo,
  locality, civic number, exponent, source coordinates, `access_id`, and the
  current/proposed electoral section values carried in the civic assignment
  dataset.
- Electoral street-register rule: the normative source for assigning streets,
  civic intervals, parity/SNC subsets, polling places, and sections.
- OpenStreetMap visual context: basemap only. OSM labels can help orientation,
  but differences between OSM names and ANNCSU odonimi are not automatically
  source-record errors.

Marker labels must use the ANNCSU address for the individual point. A task title
may summarize a cluster, especially in multi-street cases, but it must not be
used as the label for every point in that task.

Task headings are generated from civics whose coordinates remain usable as
geometry evidence (`coordinate_quality_flag=ok`, plausible lon/lat, and not
excluded from future geometry). If no civic in the task meets that condition,
the heading must not present the raw odonym as validated. It uses a
`Civici da validare` heading and exposes the raw ANNCSU streets, stradario
labels, and street-context evidence separately.

The generator emits explicit task metadata for label interpretation:

- `is_multi_street_task`
- `street_count`
- `display_title_is_representative`
- `civic_interval_count`
- `candidate_section_count`
- `label_integrity_status`

When `is_multi_street_task` is true, reviewers should read the Summary street
list and the Civics tab grouping before deciding. The point popup remains the
authoritative display for the selected civic's ANNCSU street and civic number.

`scripts/audit_electoral_workbench_label_integrity.py` checks source CSV,
workbench JSON payloads, and GeoJSON layers end to end. It classifies:

- P0: access_id, coordinates, section, or marker label do not match the source
  civic CSV.
- P1: task-level multi-street/range/parity metadata is missing or misleading.
- P2: visual OSM/ANNCSU name differences only.

If the audit reports P0 or P1, the workbench must not be used for manual
assignment until the mismatch is corrected.

## Coordinate Quality Review

Coordinate quality is a separate concern from label integrity. A civic can have
the correct ANNCSU odonimo, civic number, `access_id`, and street-register
assignment evidence while still being unreliable as a geometric point.

`scripts/audit_anncsu_coordinate_quality.py` flags suspicious coordinates
without modifying ANNCSU raw data. It checks for:

- missing coordinates;
- implausible lon/lat values and possible X/Y swaps;
- points outside the municipal boundary candidate;
- points whose ANNCSU coordinate sits in a nearby validated civic context
  dominated by a different ANNCSU street label from the stradario;
- same-street outliers using conservative cluster and nearest-neighbour tests;
- isolated points relative to civics on the same ANNCSU odonimo;
- rare census-cell placement for the same street when combined with spatial
  outlier evidence;
- anomalous civic-number progression only when the point is also spatially
  isolated from same-street civics.

The audit writes:

- `data/interim/qa/anncsu_coordinate_quality_report_2025.md`
- `data/interim/qa/anncsu_coordinate_suspect_points_2025.csv`

The workbench consumes that QA file and marks civics with:

- `coordinate_quality_flag`
- `coordinate_suspect_reason`
- `suggested_coordinate_action`
- `exclude_from_geometry_candidate`

Coordinate-suspect status does not imply that the electoral section is wrong.
The section decision remains grounded in the electoral street register. The
coordinate flag means only that the point should be treated cautiously as future
geometry evidence.

Manual coordinate decisions are exported separately from section decisions:

- `coordinate_decision_type`
- `original_lon`
- `original_lat`
- `proposed_lon`
- `proposed_lat`
- `coordinate_decision_confidence`
- `coordinate_reason`
- `exclude_from_geometry`
- `requires_external_coordinate_check`

`manual_coordinate_override` requires proposed coordinates. `exclude_from_geometry`
does not require alternative coordinates. Neither decision changes ANNCSU raw
data; both are review evidence for a later auditable geometry workflow.

The workbench can also capture a proposed civic relocation for the selected
`access_id`. This is a separate review aid: the reviewer may pick a point on the
map, drag the proposed marker, or type lon/lat manually. The UI then records the
original ANNCSU coordinates, the proposed coordinates, movement distance,
candidate V3 section context, nearby deterministic civic samples, original and
proposed nearby ANNCSU street context, and available electoral street-register
labels in `relocation_support_snapshot`.

That snapshot does not correct ANNCSU, does not create a V4 geometry, and does
not assign a section by proximity. It only preserves the evidence used when a
reviewer believes a coordinate should be excluded or overridden in a future
auditable geometry workflow.

OpenStreetMap remains visual context only. It can help a reviewer orient the map,
but it is not an official coordinate correction source and is not used by the
audit as automatic evidence of error.

### External coordinate recovery candidates

When many ANNCSU civic points appear spatially misplaced, the first step is to
diagnose whether the suspicious coordinate was introduced by the local pipeline
or was already present in the original ANNCSU indirizzario bytes.
`scripts/diagnose_anncsu_coordinate_corruption.py` compares the raw Calabria
indirizzario zip, the Lamezia extract, the processed civic assignment CSV, and
the coordinate-suspect queue. It writes:

- `data/interim/qa/anncsu_coordinate_corruption_diagnostic_report_2025.md`
- `data/interim/qa/anncsu_coordinate_corruption_diagnostic_2025.csv`

If the local pipeline copied the coordinate faithfully from the raw source, the
coordinate may still be unsuitable for geometry, but the raw field must remain
unchanged. Corrections are handled as reviewed replacement evidence, not as
edits to `COORD_X_COMUNE` or `COORD_Y_COMUNE`.

`scripts/geocode_anncsu_coordinate_candidates.py` can generate a request plan
and, when explicitly run with `--execute`, call a geocoder such as Nominatim for
small cached batches of suspect addresses. It writes:

- `data/interim/qa/anncsu_coordinate_geocode_request_plan_2025.csv`
- `data/interim/qa/anncsu_coordinate_geocode_candidates_2025.csv`
- `data/interim/qa/anncsu_coordinate_geocode_candidates_report_2025.md`

Public Nominatim must not be used as a bulk geocoding backend. Use it only for
small, cached, rate-limited QA batches with an identifiable User-Agent, or point
the same script pattern at a dedicated provider/internal instance. A geocoder
result is only a candidate: it must be checked against the electoral street
register, ANNCSU street context, boundary context, and then exported from the
workbench as an explicit `manual_coordinate_override`.

`scripts/build_anncsu_coordinate_recovery_layer.py` then materializes the
separate recovery layer. Without decisions it keeps source coordinates as the
effective coordinates and classifies suspect records as requiring review. With
an exported workbench decisions file, it applies only accepted
`manual_coordinate_override` records to `effective_lon` and `effective_lat` and
writes:

- `data/interim/geo/anncsu_lamezia_coordinate_recovery_candidates_2025.csv`
- `data/interim/qa/anncsu_coordinate_recovery_training_set_2025.csv`
- `data/interim/qa/anncsu_coordinate_recovery_layer_report_2025.md`

Because public geocoders can miss local contrade and may return only
street-level results, `scripts/generate_anncsu_local_anchor_coordinate_candidates.py`
also creates local candidates from non-suspect ANNCSU civics on the same street.
It can interpolate between numeric civic anchors or provide weaker same-street
anchor candidates for human review:

- `data/interim/qa/anncsu_coordinate_local_anchor_candidates_2025.csv`
- `data/interim/qa/anncsu_coordinate_local_anchor_candidates_report_2025.md`

The retraining path is therefore review-first:

- collect accepted manual coordinate overrides and rejected candidates;
- build a correction/training set from reviewed decisions only;
- re-run coordinate-quality diagnostics using the reviewed replacements as
  trusted anchors;
- generate any future V4 candidate geometry only after the corrected coordinate
  layer is auditable.

## Evidence Chain

The local review workflow connects four evidence layers:

- the electoral street register, which describes the normative relationship
  between streets, civic-number ranges, parity rules, SNC rules, polling places,
  and electoral sections;
- ANNCSU civic points, which provide georeferenced access/civic locations and
  street-name evidence;
- census cells, which provide small areal units used to aggregate civic
  evidence without inventing section polygons directly from proximity;
- candidate V1/V2/V3 polygons, which are inferred QA geometries derived from
  available civic and cell evidence and remain non-official.

Manual review is necessary because some civics remain unresolved after
deterministic matching, some streets have no parsed street-register match, some
streets have competing section evidence, and some V3 geometry context remains
low-confidence. These cases require human review of the underlying street rules
and QGIS layers before any later geometry update.

## Source Inputs

The workbench is generated from already materialized repository files:

- V3 candidate sections:
  `data/processed/geo/electoral_sections_candidate_2025_v3_census_aggregated.gpkg`
- Census-cell assignments:
  `data/interim/geo/electoral_section_census_cells_assignment_2025.gpkg`
- QGIS review layers:
  `data/interim/qa/electoral_sections_qgis_review_layers_2025_v3.gpkg`
- ANNCSU civic assignments:
  `data/processed/geo/anncsu_lamezia_civics_with_electoral_section_2025_v2.csv`
- ANNCSU review queue:
  `data/interim/qa/anncsu_electoral_assignment_review_queue_2025.csv`
- Electoral street rules:
  `data/interim/geo/electoral_street_rules_2025.csv`
- Street crosswalk:
  `data/interim/geo/anncsu_electoral_street_crosswalk_2025.csv`
- V3 metrics:
  `data/interim/qa/electoral_sections_candidate_v3_census_metrics_2025.csv`
- Boundary uncertainty points:
  `data/interim/qa/electoral_sections_boundary_uncertainty_points_2025.csv`

## Generated Web Data

`scripts/build_electoral_review_workbench_data.py` converts the source files
into local browser datasets under:

```text
tools/electoral-review-workbench/public/data/
```

The conversion exports JSON and GeoJSON for display and triage. Source GPKG
files remain unchanged. No polygon dissolve, buffering, proximity assignment,
or geometry repair is performed by the workbench generator.

Primary civic-first payloads are:

- `civic_review_tasks.json`
- `civics_by_task.json`
- `street_register_evidence_by_task.json`
- `candidate_sections_by_task.json`
- `nearby_deterministic_by_task.json`

`review_tasks.json` may remain available as an earlier diagnostic artifact, but
the browser queue uses `civic_review_tasks.json`.

## Civic Review Task Types

The civic-first taxonomy supports:

- `unassigned_civic_group`: unresolved civics that need a grouped decision.
- `multi_section_street_conflict`: civics whose local evidence points toward
  multiple plausible sections.
- `civic_range_conflict`: numbered civics that need interval/range review
  against the street register.
- `parity_rule_review`: even/odd rules that need reviewer confirmation.
- `snc_review`: SNC civics that need reviewer confirmation.
- `street_register_no_match`: streets without a parsed street-register match.
- `street_register_multiple_matches`: streets with multiple parsed
  street-register matches.
- `boundary_civic_cluster`: civics near candidate boundaries that cannot be
  assigned by proximity alone.
- `census_cell_context`: retained only when a diagnostic cell has no smaller
  civic task.

Task types are emitted only when the current data contains matching cases.

## Street Register Evidence

The electoral street register remains the primary normative source. The
workbench exposes parsed rule evidence per task from
`data/interim/geo/electoral_street_rules_2025.csv`.

Each evidence row includes `compatibility_with_task`, using these values where
applicable:

- `direct_compatible_rule`
- `possible_variant_match`
- `competing_rule`
- `interval_overlap`
- `parity_match`
- `parity_conflict`
- `snc_match`
- `no_compatible_rule`

This classification is a review aid, not an automatic correction.

## Manual Decision Fields

Each exported decision record includes:

- `decision_id`
- `task_id`
- `decision_scope`
- `selected_access_ids`
- `odonimo_raw`
- `civic_from`
- `civic_to`
- `civic_parity`
- `includes_snc`
- `proposed_section_number`
- `decision_type`
- `decision_confidence`
- `reason`
- `street_register_rule_ids_used`
- `street_register_pages_used`
- `qgis_observation`
- `reviewed_by`
- `review_date`
- `requires_follow_up`
- `coordinate_decision_type`
- `original_lon`
- `original_lat`
- `proposed_lon`
- `proposed_lat`
- `coordinate_decision_confidence`
- `coordinate_reason`
- `exclude_from_geometry`
- `requires_external_coordinate_check`
- `relocation_support_snapshot`
- `notes`
- `evidence_snapshot`

Allowed decision scopes are:

- `entire_task`
- `selected_civics`
- `civic_range`
- `parity_subset`
- `snc_only`
- `keep_task_unresolved`

Allowed decision types are:

- `assign_civics_to_section`
- `confirm_existing_assignment`
- `keep_unresolved`
- `split_required`
- `needs_external_source`
- `exclude_from_geometry`
- `mark_as_non_residential_or_special`

## Future V4 Boundary

Manual decisions exported from the workbench are intermediate QA evidence.
They are not authoritative until reviewed, validated, and applied through a
separate, auditable pipeline.

Before any V4 candidate geometry can be produced, exported decisions should be
checked for:

- missing required fields;
- conflicting decisions for the same civic or task;
- low-confidence decisions affecting section boundaries;
- decisions that require external evidence;
- consistency with the original electoral street register rules;
- absence of changes to processed electoral values.

The workbench therefore separates decision capture from decision application.
It helps reviewers record an evidence-backed judgement, while any later V4
pipeline must remain a separate, auditable step that can be reviewed on its own.

## Publication Boundary

The V3 candidate geometry remains non-official and not suitable for public
frontend publication. The workbench itself is a local operator tool and must not
be linked from public navigation, deploy previews, or map routes.

Any future public representation requires a separate review step, explicit
methodological approval, and clear caveats.

## Section 78

Section 78 is excluded from the candidate polygon workflow as a
special/hospital section. It is tracked as an electoral-administrative fact, but
it is not polygonized by the V3 census-aggregated candidate process and should
not be forced into the local geometry review interface as an ordinary
territorial section.
