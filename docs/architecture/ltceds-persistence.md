# LTCEDS persistence boundary

Status: first persistence tranche for issue #1028  
Parent standard: `docs/architecture/ltceds-v1.md`

## Core rule

LTCEDS keeps the **canonical event store** and the **public read model** physically
separate.

The canonical store may contain internal event-resolution information, including
source-supported exact coordinates when retention is justified. The public HTTP/API
surface must never query those internal fields to build a response on demand.

Instead, an event is projected through the LTCEDS publication pipeline first and only
the already validated public representation is stored in `crime_public_events`.

```text
source/candidate
  -> resolver
  -> canonical EVENT
  -> taxonomy + internal location
  -> geoprivacy/public anchors
  -> LTCEDS JSON Schema gate
  -> semantic publication gate
  -> crime_public_events
  -> future public REST / GeoJSON / static snapshot
```

## First canonical tables

### `crime_events`

Stable UUIDv7 event identity plus the source-faithful temporal representation and
conservative calendar bounds for future filtering.

The query bounds are not substitutes for `temporal_start`, `temporal_end` or `EDTF`.
They may remain null when no defensible bound can be derived.

### `crime_event_offences`

One event can have multiple offence instances. ICCS, Istat catalogue, Istat synthetic,
Istat analytical and legal-reference fields remain distinct.

A `classification_source_id` can bind a classification to the source supporting it.
No label-similarity crosswalk is stored as official correspondence.

### `crime_event_locations`

Internal location records preserve:

- semantic role (`occurrence`, `arrest`, `search`, etc.);
- evidence basis;
- evidence precision;
- resolved precision;
- sensitivity and publication risk;
- internal WGS84 coordinates when justified;
- street/neighbourhood/locality scope keys used by the geoprivacy layer.

Database constraints require longitude/latitude as a pair, enforce WGS84 ranges, and
prohibit point geometry when the resolved precision is only `municipality` or
`unknown`.

The public API must not read this table.

### `crime_sources` and `crime_event_sources`

Sources remain first-class objects and are linked many-to-many to events with an
explicit support role. Source content itself is not copied into this tranche; only
metadata/fingerprints needed for provenance are persisted.

Classification/location records can also point to the source that supports the
specific assertion.

### `crime_event_clusters`

Clusters preserve reported cardinality without minting synthetic events. Source links
and resolved event membership are separate relational tables.

No database trigger expands a cluster automatically.

## Deliberately absent

The first persistence tranche contains no tables or columns for:

- victim identity;
- suspect/indagato/imputato identity;
- person names;
- personal addresses as a standalone registry;
- social graphs;
- predictive scores;
- neighbourhood crime risk.

If a future research/editorial need requires person-level assertions, that must be a
separate design/review because it changes the privacy and legal risk of the store.

## Public read model

`crime_public_events` contains only:

- canonical `event_id`;
- public schema version;
- validated LTCEDS public JSON payload;
- SHA-256 of the payload;
- publication-gate version;
- publication/update timestamps.

It intentionally has no columns for:

- internal longitude/latitude;
- address/place-name resolution;
- source body/content;
- person identity.

Database constraints ensure that:

- payload is a JSON object;
- payload hash has SHA-256 shape;
- `payload.event_id` equals the row `event_id`;
- `payload.schema_version` equals the row `schema_version`.

These constraints complement rather than replace the LTCEDS JSON Schema and semantic
publication gates.

## Write boundary

No general-purpose CRUD route is added in this tranche.

A future projection writer must execute, in order:

1. canonical source/candidate/resolver rules;
2. public geoprivacy projection;
3. JSON Schema Draft 2020-12 validation;
4. semantic publication validation;
5. publication-capacity/privacy review rules;
6. deterministic/canonical payload hashing;
7. upsert into `crime_public_events`.

The public table must not accept a "helpful" server-side reconstruction from canonical
coordinates at request time.

## Migration

Migration `0016_ltceds_persistence_boundary.sql` is additive only and is registered in
the existing Drizzle journal.

The normal package test now runs both:

```bash
tsx --test ./src/crimeEvents.test.ts
pnpm run check-migrations
```

so the repository CI verifies the public/internal column boundary and the existing
fail-closed destructive-migration scanner.

## Future public API

The next API tranche should be read-only and mounted under the existing public v1
surface. It should read exclusively from `crime_public_events` and provide at most:

- event list/filter;
- event detail by UUID;
- GeoJSON projection;
- coverage/methodology metadata.

The API must explicitly state that this is a register of documented events in the
censused sources, not a complete measure of crime incidence or area risk.
