# Electoral Review Workbench V2

This is a local-only manual review tool for the Lamezia Terme 2025 electoral
section candidate geometry work. V2 is organized around decision tasks rather
than a flat list of unresolved technical records.

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

## V2 Review Tasks

The main queue loads `public/data/review_tasks.json`. Each task is an
aggregated review unit with a title, priority, suggested section, competing
sections, civic range, reason for unresolved status, evidence strength, map
focus bbox, and source files.

Task types are:

- `unresolved_civic_group`
- `census_cell_conflict`
- `no_assigned_civics_cell`
- `boundary_uncertainty_cluster`
- `section_low_confidence`
- `section_needs_manual_review`

Use filters for type, priority, decision status, suggested section, competing
section, street, unresolved reason, street-register evidence, high-priority
only, many-civic tasks, and current map extent.

## Map

The map uses Leaflet with OpenStreetMap tiles when the browser can reach them.
OSM is visual context only. It is not an official source for section assignment
and must not be used as a proximity-based assignment rule.

If Leaflet or OSM tiles are unavailable, the workbench still draws local
GeoJSON geometries in the fallback SVG map.

Map layers include:

- V3 candidate sections;
- optional V2 reference geometry;
- review census cells;
- review civics;
- boundary uncertainty points;
- spatially resolved points;
- deterministic civic sample;
- selected task civics;
- optional nearby deterministic points and competing sections.

## Street Register Evidence

`public/data/street_register_evidence_by_task.json` links each task to parsed
rules from `data/interim/geo/electoral_street_rules_2025.csv`.

The panel distinguishes:

- direct rule matches from civic assignments;
- same-street rules for the suggested section;
- same-street rules for competing sections;
- same-street rules in other sections;
- tasks with no clear parsed rule match.

When the source PDF is small enough, the generator copies it to:

```text
tools/electoral-review-workbench/public/source/Stradario_elettorale.pdf
```

The evidence panel links to `#page=N` for the parsed source page when available.

## Decision Cockpit

The right panel contains:

- Summary;
- Civics;
- Street register evidence;
- Candidate sections;
- Nearby evidence;
- Decision.

The Civics tab shows access id, street, civic number, locality, current and
suggested section, assignment method/confidence, rule id, review flag,
boundary distance, and notes. Clicking a civic highlights it on the map.

The Candidate sections tab summarizes suggested and competing sections, civic
support, street-register rule counts, nearby deterministic counts, and boundary
warnings.

## Decisions

Decisions are stored in browser `localStorage` until exported. The page warns
before leaving when saved decisions have not been exported.

Exports are available as JSON and CSV with these fields:

- `review_id`
- `task_id`
- `case_type`
- `census_cell_id`
- `involved_streets`
- `current_assignment_method`
- `current_assigned_section`
- `suggested_section_number`
- `competing_sections`
- `proposed_section_number`
- `decision_type`
- `decision_confidence`
- `reason`
- `qgis_observation`
- `reviewed_by`
- `review_date`
- `requires_follow_up`
- `notes`
- `evidence_snapshot`

Previous JSON or CSV exports can be imported to resume local work.

## Generated Data

Primary V2 payloads:

- `review_tasks.json`
- `civics_by_task.json`
- `street_register_evidence_by_task.json`
- `candidate_sections_by_task.json`
- `nearby_deterministic_by_task.json`

Compatibility payloads from V1 remain generated under `public/data/`, but the
V2 interface uses the task-oriented files above.

## Guardrails

- Do not link this workbench from the public app.
- Do not change public routing, deploy, Cloudflare, homepage, or navigation.
- Do not create V4 in this PR.
- Do not apply decisions to GPKG files in this PR.
- Do not modify processed electoral result values.
- Do not use OSM or proximity alone as assignment evidence.
- Treat all candidate geometries as non-official QA artifacts.
