# Electoral Workbench Relocation Flow Audit

## Scope

Static and payload audit for the local civic-first workbench relocation support. This report verifies that proposed coordinate overrides are captured as review evidence only, without modifying ANNCSU raw data or generating V4 geometry.

## Summary

- task_count: 2329
- civic_rows: 8257
- coordinate_suspect_records: 345
- coordinate_suspect_features: 345
- coordinate_review_batch_access_ids: 345
- coordinate_review_batch_rows: 345
- coordinate_suspect_tasks: 277
- street_context_mismatch_records: 44
- heading_source_counts: {'no_validated_civic_heading': 359, 'validated_civics': 1970}
- deterministic_support_features: 3000
- v3_section_features: 29
- app_contract_checks: 27
- app_contract_total: 27

## UI Contract

- decision_field_relocation_support_snapshot: ok
- map_pick_button: ok
- clear_button: ok
- use_original_button: ok
- support_panel: ok
- draft_state: ok
- map_pick_state: ok
- support_model: ok
- support_snapshot: ok
- street_context_summary: ok
- street_register_labels: ok
- leaflet_render: ok
- map_click_handler: ok
- drag_handler: ok
- manual_override_validation: ok
- street_context_filter: ok
- coordinate_batch_filter: ok
- coordinate_batch_payload: ok
- coordinate_batch_panel: ok
- coordinate_batch_snapshot: ok
- heading_source_ui: ok
- fallback_render: ok
- relocation_styles: ok
- readme_docs: ok
- readme_batch_docs: ok
- methodology_docs: ok
- methodology_batch_docs: ok

## Findings

- P0: none
- P1: none
- P2: none

## Boundary

- No ANNCSU raw coordinate is modified by the workbench.
- Proposed coordinates are exported in manual decisions only.
- `relocation_support_snapshot` is review evidence for a later auditable geometry workflow.
- The workbench does not create V4, public UI, deploy changes, GPKG changes, or public map routes.
