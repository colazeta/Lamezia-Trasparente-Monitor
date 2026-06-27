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

## Generated Data

Primary civic-first payloads:

- `civic_review_tasks.json`
- `civics_by_task.json`
- `street_register_evidence_by_task.json`
- `candidate_sections_by_task.json`
- `nearby_deterministic_by_task.json`
- `review_summary.json`

Compatibility payloads from earlier workbench versions may remain generated
under `public/data/`, but the interface uses the civic-first files above.

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
- Do not use OSM or proximity alone as assignment evidence.
- Treat all candidate geometries as non-official QA artifacts.
