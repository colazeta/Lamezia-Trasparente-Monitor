# LTCEDS public API

Status: first read-only HTTP tranche for issue #1030  
Depends on: `docs/architecture/ltceds-persistence.md`

## Boundary

The public LTCEDS API is mounted inside the existing read-only surface:

```text
/api/public/v1
```

It does not introduce an internal crime API and it does not read canonical LTCEDS
location/source/offence tables to construct public responses.

The database reader in:

```text
artifacts/api-server/src/lib/publicCrimeEvents.ts
```

imports exactly `crimePublicEventsTable` from the LTCEDS persistence model. A static
DB-free test fails if canonical table symbols such as `crimeEventLocationsTable` or
`crimeSourcesTable` appear in that reader.

This is deliberate defence in depth: even if a future route is implemented
incorrectly, the normal public reader does not possess an internal coordinate join.

## Read-time validation

`crime_public_events` is already a post-publication-gate store, but the API does not
blindly cast JSONB to LTCEDS.

`parseReadablePublicCrimeEvent()` performs a light runtime structural check and then
reruns the pure LTCEDS semantic publication rules. It requires, among other things:

- current supported LTCEDS schema version;
- `record_status=published`;
- UUIDv7 event/offence/source identity through the existing semantic gate;
- supported event form and temporal precision;
- public location role/precision/sensitivity/privacy-transform enums;
- WGS84 point shape when geometry is present;
- at least one offence and source;
- supported source/classification categories.

A corrupt, stale or manually inserted public-store payload is omitted/fails closed.
The reader never attempts to repair it from canonical/internal tables.

## Endpoints

### `GET /crime-events`

Returns a paginated envelope of documented public events.

Initial filters:

- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`
- `iccs=` — exact ICCS code or descendants separated by `.`
- `istat=` — exact public Istat catalogue/synthetic/analytical code
- `eventForm=`
- `neighbourhood=`
- `context=`
- `mappable=true|false`
- `page`
- `pageSize` (max 100)

There is intentionally no person, victim, suspect or defendant search.

For the initial expected dataset size, filtering the validated public JSON in memory is
preferable to adding premature duplicated filter columns to `crime_public_events`.
The read model can be denormalised later if measurements demonstrate a need.

### `GET /crime-events/{eventId}`

Returns one public LTCEDS payload. The route requires a UUIDv7 through the read core;
invalid/nonexistent/non-readable projections return 404 without querying canonical
LTCEDS tables for a fallback.

### `GET /crime-events.geojson`

Returns a GeoJSON FeatureCollection generated **only** from geometry already present
in the public LTCEDS payload.

`defaultPublicMapLocations()` remains authoritative. Therefore:

- only `occurrence` locations can become default map features;
- arrest/search/discovery/recovery/procedural locations never become crime markers;
- municipality/unknown points and suppressed geometry remain excluded;
- private exact un-generalised points remain excluded.

Feature properties are intentionally small: event id, title, public date/precision,
public ICCS codes, neighbourhood when already public, geo precision, privacy transform
and update time.

### `GET /crime-events/coverage`

Returns documentary coverage metadata:

- documented event count;
- mappable event count;
- public map feature count;
- earliest/latest defensibly parseable documented date;
- last update;
- supported schema versions;
- mandatory methodology/disclaimer metadata.

It does not estimate unobserved crime or territorial risk.

## Methodological disclaimer

Every list, GeoJSON and coverage response carries or documents the same statement:

> Il registro rappresenta eventi criminali documentati nelle fonti censite da Lamezia Trasparente. Non rappresenta la totalità dei reati verificatisi, denunciati o perseguiti nel territorio e non deve essere interpretato come misura del rischio criminale di un'area.

No endpoint offers heat-map risk scores, neighbourhood rankings, predictive policing
or inferred crime incidence.

## Date filtering

The public API uses only dates already represented in the public payload. It supports
conservative bounds for simple year, month, date and basic EDTF-style intervals.

When a date filter is requested and an event has no defensibly parseable public time
bound, the event is excluded from that filtered result instead of receiving an
invented date.

## OpenAPI

The existing public OpenAPI builder is left intact. `publicCrimeOpenapi.ts` adds a
small overlay at response time with the LTCEDS paths/components.

The OpenAPI `CrimeEventPublicPayload` component is intentionally only a minimal
description and carries the canonical LTCEDS schema identifier:

```text
https://lameziatrasparente.it/schema/ltceds/public-event/1.0-draft.1/schema.json
```

It is not a second normative crime-event schema. The repository JSON Schema remains
the machine contract enforced by the LTCEDS publication gate.

## Tests

Two layers are used:

1. **DB-free standard CI tests** exercise payload validation, filters, pagination,
   GeoJSON occurrence-only behaviour, coverage semantics, OpenAPI overlay and static
   public-table-only reader imports.
2. When a disposable PostgreSQL test configuration is available, the existing public
   route integration suite inserts synthetic canonical/public rows and verifies
   list/detail/filters/GeoJSON/coverage end-to-end.

No test fixture contains a real crime event or person.
