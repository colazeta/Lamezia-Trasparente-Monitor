# Electoral Workbench Relocation Flow Audit

## Scope

Static and payload audit for the local civic-first workbench relocation support. This report verifies that proposed coordinate overrides are captured as review evidence only, without modifying ANNCSU raw data or generating V4 geometry.

## Summary

- task_count: 2304
- civic_rows: 8227
- coordinate_suspect_records: 301
- coordinate_suspect_features: 301
- coordinate_suspect_tasks: 239
- deterministic_support_features: 3000
- v3_section_features: 29
- app_contract_checks: 17
- app_contract_total: 17

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
- leaflet_render: ok
- map_click_handler: ok
- drag_handler: ok
- manual_override_validation: ok
- fallback_render: ok
- relocation_styles: ok
- readme_docs: ok
- methodology_docs: ok

## Findings

- P0: none
- P1: none
- P2: none

## Boundary

- No ANNCSU raw coordinate is modified by the workbench.
- Proposed coordinates are exported in manual decisions only.
- `relocation_support_snapshot` is review evidence for a later auditable geometry workflow.
- The workbench does not create V4, public UI, deploy changes, GPKG changes, or public map routes.
