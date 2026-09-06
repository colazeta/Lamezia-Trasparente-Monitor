# Crime monitor inbox

This directory is the versioned ingestion inbox for newly identified crime events concerning Lamezia Terme.

Each authoritative event is stored in exactly one JSON file, normally under a date-based subdirectory such as `2026-09-07/<event-key>.json`. Files must conform to `../monitor-event-1.0.schema.json` and to the stricter runtime validation in `lib/db/src/crimeMonitorIngestionCore.ts`.

## Persistence boundary

Files in this directory are **internal ingestion artifacts**, not public map payloads. After validation, the importer may upsert only the canonical crime tables:

- `crime_events`
- `crime_sources`
- `crime_event_offences`
- `crime_event_locations`
- `crime_event_sources`

The monitor importer never writes to `crime_public_events`. Publication is a separate editorial/privacy operation and must pass the dedicated publication gate.

## Required editorial rules

- `record_status` must remain non-public (`verified_source`, or a later corrective status such as `merged`, `superseded`, `withdrawn` or `suppressed`). `published` is deliberately rejected.
- Keep one stable `event_key` per resolved real-world event. Correct the existing artifact instead of creating a second file for the same event.
- Once an event artifact has been established, do not change `discovered_at`: it participates in deterministic event identity. Later corrections change `updated_at` while preserving the original discovery timestamp.
- Use stable `source_key`, `offence_key` and `location_key` values so corrections preserve canonical child identifiers.
- At least one `occurrence` or `target` location must concern Lamezia Terme.
- Never invent a precise point. `evidence_precision`, `resolved_precision` and `evidence_basis` must reflect what the source actually supports.
- Internal exact coordinates are permitted only when justified; municipality/unknown precision must not carry point geometry.
- Set `sensitivity` and `publication_risk` conservatively. These fields inform later publication decisions but do not themselves publish anything.
- Do not add person/victim/suspect identity fields to monitor artifacts. The first LTCEDS persistence tranche intentionally excludes them.
- Use `provisional` classification when the available source does not support a defensible legal or taxonomy classification.

## Validation and ingestion

Dry-run validation of the complete versioned inbox (no database access):

```sh
pnpm --filter @workspace/db run import:crime-monitor --input data/legalita/ltceds/monitor
```

For a manual canonical ingestion, execute only the event artifact that has been added or reviewed:

```sh
DATABASE_URL=... pnpm --filter @workspace/db run import:crime-monitor --input data/legalita/ltceds/monitor/2026-09-07/<event-key>.json --execute
```

On pushes to `main`, `.github/workflows/crime-event-ingestion.yml` determines which monitor JSON files were added or modified by that push and executes canonical ingestion only for those files. The normal operational path therefore does **not** replay the entire historical inbox on every update.

The execute path fails closed if the selected event ID is already present in `crime_public_events`; published records cannot be silently mutated through the monitoring inbox. Corrections to already published events must pass through the separate publication/editorial pipeline.
