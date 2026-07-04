# Electoral Review Workbench: Civic-first

This is a local-only manual review tool for the Lamezia Terme 2025 electoral
section candidate geometry workflow. The current workbench is civic-first:
the primary review object is a civic, a group of civics, a civic range, a
parity/SNC subset, or an electoral street-register rule.

It does not publish a public route, create V4 geometry, apply decisions back to
GPKG files, modify processed electoral results, or treat candidate sections as
official boundaries.

## Run Locally

Generate the web payloads from the repository root:

```powershell
python scripts/build_electoral_review_workbench_data.py
```

Serve the static workbench:

```powershell
python -m http.server 4177 --directory tools/electoral-review-workbench
```

Open:

```text
http://127.0.0.1:4177/
```

Use a local HTTP server because the page loads JSON and GeoJSON through
`fetch`.

Run the label-integrity audit after regenerating data:

```powershell
python scripts/audit_electoral_workbench_label_integrity.py
```

Run the coordinate-quality audit before regenerating data when coordinate
suspects need to be refreshed:

```powershell
python scripts/audit_anncsu_coordinate_quality.py
python scripts/build_electoral_review_workbench_data.py
```

Diagnose whether suspicious coordinates were introduced locally or already
exist in the original ANNCSU indirizzario bytes:

```powershell
python scripts/diagnose_anncsu_coordinate_corruption.py
```

Prepare external geocoder recovery candidates without modifying raw ANNCSU
coordinates:

```powershell
python scripts/geocode_anncsu_coordinate_candidates.py
python scripts/geocode_anncsu_coordinate_candidates.py --execute --limit 10 --user-agent "Lamezia-Trasparente-Monitor/anncsu-coordinate-qa contact@example.org"
```

Use the first command for a request plan. Use `--execute` only for small,
cached, rate-limited QA batches, or with a dedicated provider/internal geocoder
that allows bulk use. The command writes both
`data/interim/qa/anncsu_coordinate_geocode_candidates_2025.csv` and the
workbench payload
`tools/electoral-review-workbench/public/data/coordinate_geocode_candidates_by_access.json`.

Generate local ANNCSU anchor candidates for suspect coordinates:

```powershell
python scripts/generate_anncsu_local_anchor_coordinate_candidates.py
python scripts/prepare_anncsu_coordinate_review_batch.py
python scripts/prepare_anncsu_coordinate_review_pack.py
```

These candidates use non-suspect same-street ANNCSU civics as review anchors.
They are not applied automatically and must still be confirmed through a
`manual_coordinate_override` decision. The review-batch script turns the
candidate list into a full priority queue plus a first batch of 50 high-signal
cases for manual workbench review. The review-pack script joins the suspect
diagnostic, local anchor, and external geocoder evidence into one CSV so a
reviewer can open each `access_id` in the workbench with a recommended review
track.

Build the auditable recovery layer and training set:

```powershell
python scripts/audit_anncsu_coordinate_decisions.py --decisions .\electoral_sections_civic_review_decisions_v1.json
python scripts/build_anncsu_coordinate_recovery_layer.py
python scripts/build_anncsu_coordinate_recovery_layer.py --decisions .\electoral_sections_civic_review_decisions_v1.json
python scripts/audit_anncsu_coordinate_quality.py --use-recovery-layer
```

Run the audit before applying any reviewed coordinate decision. P0/P1 findings
mean the decision export is not ready to become an effective coordinate or a
training-set row. The no-argument recovery command creates a no-overwrite
recovery layer. The `--decisions` command uses exported workbench decisions and
applies only accepted `manual_coordinate_override` records to
`effective_lon`/`effective_lat`. The recovery-layer quality audit reruns the
coordinate diagnostics with only accepted reviewed replacements applied, so the
result can be used as retraining evidence without rewriting ANNCSU raw data.

## Why Civic-first

The V2 task model was useful, but still too census-cell oriented. Census cells
are diagnostic geometry: they help orient review in QGIS, but they are not
electoral sections and should not be treated as the unit of manual assignment.

The new queue loads `public/data/civic_review_tasks.json`. Each task contains
the civics to resolve, street-register context, suggested and competing
sections, representative census cells, map focus bbox, and the scope needed for
an auditable manual decision.

Supported task types are:

- `unassigned_civic_group`
- `multi_section_street_conflict`
- `civic_range_conflict`
- `parity_rule_review`
- `snc_review`
- `street_register_no_match`
- `street_register_multiple_matches`
- `boundary_civic_cluster`
- `census_cell_context`

Some task types may not appear in a generated run when the current data has no
matching cases. For example, the current review queue has no SNC civics.

## Map

The map uses Leaflet with OpenStreetMap tiles when the browser can reach them.
OpenStreetMap is visual context only. It is not an official source for section
assignment and must not be used as a proximity-based assignment rule.

Map layers include V3 candidate sections, optional V2 reference geometry,
diagnostic census cells, review civics, boundary uncertainty points, spatially
resolved points, deterministic civic samples, selected task civics, nearby
deterministic points, and competing sections.

Every civic marker is labelled from the ANNCSU source record, not from the task
title, OpenStreetMap, or a representative street name. The popup title uses:

```text
ANNCSU: [odonimo_raw] [civico/esponente]
```

The popup also shows `access_id`, source coordinates, current/proposed section,
task id, linked street-register rule where present, and the note that OSM is
visual background only.

## Label Integrity

The workbench separates three labels that must not be conflated:

- `ANNCSU address`: source record for the civic point, including odonimo,
  locality, civic number, exponent, coordinates, and `access_id`.
- `Electoral street-register rule`: normative rule used to reason about
  section assignment, including street rule, civic interval/parity/SNC, section,
  and PDF page.
- `OpenStreetMap visual context`: background map only. OSM street names are not
  official ANNCSU labels and are not assignment evidence.

The `Show label integrity` toggle opens a source-record panel for the selected
civic. It compares source payload values, GeoJSON properties, task metadata, and
street-register evidence. The `label_integrity_status` filter can isolate:

- `ok`
- `multi_street_task`
- `missing_source_record`
- `coordinate_outlier`
- `street_label_ambiguous`
- `needs_label_review`

For multi-street tasks, the title is intentionally representative. The Summary
tab lists the ANNCSU streets in the task, and the Civics tab groups rows by the
specific ANNCSU street so reviewers do not apply one street label to every
civic in the group.

Task headings are built from civics whose source coordinates are currently
usable as geometry evidence. When no civic in a task has reliable coordinates,
the heading must not promote the raw odonym as if it were validated; it uses a
`Civici da validare` heading and leaves the raw ANNCSU streets, street-register
labels, and coordinate context in the Summary, Civics, popup, and Decision
support panels.

## Coordinate Quality

Coordinate quality is separate from label integrity. A civic can have the
correct ANNCSU address and `access_id`, while its coordinate remains suspicious
as geometry evidence.

`scripts/audit_anncsu_coordinate_quality.py` writes:

- `data/interim/qa/anncsu_coordinate_quality_report_2025.md`
- `data/interim/qa/anncsu_coordinate_suspect_points_2025.csv`

The builder then emits:

- `public/data/coordinate_suspect_points.json`
- `public/data/coordinate_suspect_points.geojson`

The workbench exposes a `Coordinate quality` filter, coordinate-suspect badges,
a dedicated coordinate-suspect map layer, popup warnings, and coordinate fields
in the source-record debug panel.

Coordinate flags are review signals only:

- `missing_coordinate`
- `outside_boundary`
- `street_context_mismatch`
- `same_street_outlier`
- `isolated_point`
- `implausible_coordinate`
- `possible_xy_swap`
- `needs_manual_coordinate_review`

They do not modify ANNCSU raw data. They do not automatically mean the electoral
section is wrong. The section should still be reviewed against the electoral
street register. Future geometry generation may exclude or override a point only
through a traced coordinate decision.

### Civic Relocation Support

When a selected civic appears georeferenced in the wrong place, the Decision tab
can record a proposed coordinate without changing ANNCSU raw data. Use `Pick
proposed point on map` to click a candidate position, or type `proposed_lon` and
`proposed_lat` manually. The proposed marker can be dragged on the Leaflet map.

The support panel records:

- original ANNCSU lon/lat;
- proposed lon/lat;
- movement distance in metres;
- candidate V3 section containing the proposed point, when any;
- original and proposed nearby ANNCSU street context from validated civic
  samples;
- electoral street-register labels available for the selected civic task;
- nearest deterministic civic samples;
- nearest deterministic samples on the same ANNCSU street.

This support is evidence for review only. It does not create V4 geometry, does
not correct ANNCSU, and does not assign sections by proximity. The exported
decision includes `relocation_support_snapshot` so the proposed relocation can
be audited later.

## Street Register Evidence

`public/data/street_register_evidence_by_task.json` links each civic task to
parsed rules from `data/interim/geo/electoral_street_rules_2025.csv`.

Each rule carries `compatibility_with_task`, using these values where
applicable:

- `direct_compatible_rule`
- `possible_variant_match`
- `competing_rule`
- `interval_overlap`
- `parity_match`
- `parity_conflict`
- `snc_match`
- `no_compatible_rule`

The electoral street register remains the primary normative source. Census
cells and OSM are context only.

## Civic Decisions

The Civics tab lets a reviewer select all civics, even civics, odd civics, SNC
civics, a typed civic range, unassigned civics, or competing civics. The
Decision tab records the decision scope:

- `entire_task`
- `selected_civics`
- `civic_range`
- `parity_subset`
- `snc_only`
- `keep_task_unresolved`

Exports are available as JSON and CSV with these fields:

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

Allowed decision types are:

- `assign_civics_to_section`
- `confirm_existing_assignment`
- `keep_unresolved`
- `split_required`
- `needs_external_source`
- `exclude_from_geometry`
- `mark_as_non_residential_or_special`

Allowed coordinate decision types are:

- `keep_as_is`
- `flag_coordinate_suspect`
- `exclude_from_geometry`
- `manual_coordinate_override`
- `needs_external_verification`

`manual_coordinate_override` requires `proposed_lon` and `proposed_lat`.
`exclude_from_geometry` can be saved without alternative coordinates.

## Generated Data

Primary civic-first payloads:

- `civic_review_tasks.json`
- `civics_by_task.json`
- `street_register_evidence_by_task.json`
- `candidate_sections_by_task.json`
- `nearby_deterministic_by_task.json`
- `review_summary.json`
- `coordinate_suspect_points.json`
- `coordinate_suspect_points.geojson`

Compatibility payloads from earlier workbench versions may remain generated
under `public/data/`, but the interface uses the civic-first files above.

Label-integrity QA outputs are written to:

- `data/interim/qa/electoral_workbench_label_integrity_report.md`
- `data/interim/qa/electoral_workbench_label_integrity_sample.csv`

## Process Boundary

The in-app process panel records the intended sequence:

1. Review civici
2. Export decisioni
3. PR decisioni manuali
4. Audit decisioni
5. Generazione V4 candidata
6. QGIS check V4
7. Eventuale pubblicazione solo dopo human gate

The decisions captured here are inputs for a future auditable V4 workflow.
This PR does not create V4.

## Guardrails

- Do not link this workbench from the public app.
- Do not change public routing, deploy, Cloudflare, homepage, or navigation.
- Do not create V4 in this PR.
- Do not apply decisions to GPKG files in this PR.
- Do not modify processed electoral result values.
- Do not modify ANNCSU raw coordinates in this workbench.
- Do not use OSM or proximity alone as assignment evidence.
- Do not make manual decisions when `access_id`, label, and coordinates are not
  coherent.
- Treat all candidate geometries as non-official QA artifacts.
