# Electoral Review Workbench Methodology

## Scope

The electoral review workbench supports manual review of the Lamezia Terme
2025 candidate electoral section geometry. It is a local QA tool for the V3
census-aggregated candidate polygons and related ANNCSU civic assignment
evidence.

The workbench does not create official boundaries, public maps, V4 geometry, or
new electoral results. Its purpose is to collect structured human review
decisions that can be audited before any later geometry update.

## V2 Decision Orientation

V2 reorganizes the local workbench around review tasks rather than a flat list
of unresolved records. A task is the smallest useful decision unit for human
review: a conflicting census cell, a no-evidence cell, a grouped set of
unresolved civics on the same street/problem pattern, a boundary uncertainty
cluster, or a fragile section-level geometry prompt.

The task model is intended to help the reviewer answer:

- what needs review;
- why automatic assignment stopped;
- which section is suggested;
- which sections remain plausible alternatives;
- which parsed street-register rules support or conflict with that suggestion;
- where the task sits on the local map;
- whether a decision can be made now or should remain in review.

The exported decision file is an input for a future V4 workflow. V2 does not
apply decisions and does not create V4.

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
  the available civic and cell evidence and remain non-official.

OpenStreetMap may appear in the V2 workbench as an optional Leaflet basemap for
local orientation only. OSM is not part of the assignment evidence chain, is not
an official source for electoral sections, and must not be used to assign a
section by proximity. If OSM is unavailable, local repository geometries remain
available through the fallback map.

Manual review is necessary because some census cells contain evidence for
multiple sections, some cells have no assigned civic evidence, some civics remain
unresolved after deterministic matching, and some candidate section geometries
are marked low-confidence by the V3 metrics. These cases require a human review
of the underlying street rules and QGIS layers before any later geometry update.

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

Primary V2 payloads are:

- `review_tasks.json`
- `civics_by_task.json`
- `street_register_evidence_by_task.json`
- `candidate_sections_by_task.json`
- `nearby_deterministic_by_task.json`

Legacy V1 payloads can remain present for compatibility, but V2 uses the
task-oriented files as its primary browser data model.

## Review Task Types

The V2 review queue contains these task families:

- `census_cell_conflict`: a census cell contains deterministic evidence for
  multiple sections and no dominant section reaches the V3 assignment
  threshold.
- `no_assigned_civics_cell`: a census cell is present in the review layer but lacks
  assigned civic evidence sufficient for candidate geometry assignment.
- `unresolved_civic_group`: unresolved ANNCSU civics are grouped by street,
  unresolved reason, current section, and competing section context.
- `boundary_uncertainty_cluster`: unresolved civics near a candidate boundary
  are grouped by street, reason, and nearest candidate section so they can be
  reviewed as a geographic pattern rather than one point at a time.
- `section_low_confidence`: a V3 candidate section is present, but V3 metrics
  mark the section as low confidence.
- `section_needs_manual_review`: a V3 candidate section is not low-confidence
  but still has review flags in the V3 metrics.

These tasks are review prompts, not automatic corrections.

## Street Register Evidence in V2

The electoral street register remains the primary normative source. V2 exposes
parsed rule evidence per task from
`data/interim/geo/electoral_street_rules_2025.csv`, including rule id, section,
polling place, raw street rule, civic range/parity/SNC rule, extraction
confidence, match reason, relevance score, and source PDF page.

The workbench distinguishes direct civic-rule matches, same-street rules for
the suggested section, same-street rules for competing sections, same-street
rules in other sections, and tasks with no clear parsed street-register match.
When the PDF is copied into the local workbench, links use `#page=N` for the
parsed source page.

## Candidate Inferred Meaning

`candidate_inferred` means that a geometry or assignment is an analytical
candidate inferred from documented source evidence. It is not an official
municipal electoral boundary. A candidate-inferred object can support review,
comparison, and internal QA, but it must not be presented as authoritative or
published as an official section map.

## Section 78

Section 78 is excluded from the candidate polygon workflow as a
special/hospital section. It is tracked as an electoral-administrative fact, but
it is not polygonized by the V3 census-aggregated candidate process and should
not be forced into the local geometry review interface as an ordinary territorial
section.

## Manual Decision Fields

Each V2 exported decision record includes:

- `review_id`
- `task_id`
- `case_type`
- `census_cell_id`
- `involved_streets`
- `current_assignment_method`
- `current_assigned_section`
- `suggested_section_number`
- `competing_sections`
- `decision_type`
- `proposed_section_number`
- `decision_confidence`
- `reason`
- `qgis_observation`
- `reviewed_by`
- `review_date`
- `requires_follow_up`
- `notes`
- `evidence_snapshot`

Allowed decision types are:

- `confirm_suggested_section`
- `assign_to_alternative_section`
- `keep_unassigned`
- `keep_conflict`
- `split_required`
- `needs_external_source`
- `needs_qgis_review`

## Governance Rules

Manual decisions exported from the workbench are intermediate QA evidence.
They are not authoritative until reviewed, validated, and applied through a
separate, auditable pipeline.

Before any V4 candidate geometry can be produced, exported decisions should be
checked for:

- missing required fields;
- conflicting decisions for the same review case;
- low-confidence decisions affecting section boundaries;
- decisions that require external evidence;
- changes that would alter processed electoral values;
- consistency with the original electoral street register rules.

The workbench therefore separates decision capture from decision application.
It helps reviewers record the evidence-backed judgement, while any later V4
pipeline must remain a separate, auditable step that can be reviewed on its own.

## Publication Boundary

The V3 candidate geometry remains non-official and not suitable for public
frontend publication. The workbench itself is a local operator tool and must not
be linked from public navigation, deploy previews, or map routes.

Any future public representation requires a separate review step, explicit
methodological approval, and clear caveats.
