# LTCEDS reviewed bundle compiler

Status: `1.0-draft` implementation boundary for issue #1032.

## Purpose

The reviewed-bundle compiler is the first general LTCEDS boundary that can turn an individually resolved and human-reviewed event into canonical persistence and, when permitted, a public projection.

It does not discover sources, resolve candidates, infer event identity, geocode facts, decide criminal responsibility or publish automatically from an article. Those stages remain separate.

```text
source discovery
  -> source candidate
  -> deterministic resolver / EVENT_CLUSTER
  -> reviewed event bundle
  -> compiler gates
  -> attested persistence plan
  -> one canonical DB transaction
  -> crime_public_events only when public gates pass
```

The two invariants are:

```text
candidate != EVENT
canonical EVENT != public EVENT
```

## Reviewed bundle

The machine-readable contract is:

```text
data/legalita/ltceds/reviewed-event-bundle-1.0.schema.json
```

It is JSON Schema Draft 2020-12 and intentionally sets `additionalProperties=false` throughout the v1 object graph.

The bundle contains:

- stable UUIDv7 event identity;
- event form and source-faithful temporal representation;
- offence instances with classification provenance;
- internal locations with evidence basis, evidence precision, resolved precision, sensitivity and publication risk;
- source metadata and publication-capacity metadata;
- optional existing `EVENT_CLUSTER` memberships;
- review decision and non-personal reviewer identifier;
- explicit `publication_intent`.

Person, suspect, victim, accused and defendant identity are out of scope for reviewed bundle v1. They are neither schema fields nor tolerated extension fields.

## Publication intent

### `publish`

Requires:

- canonical `record_status=published`;
- `review.decision=approved`;
- `review.public_text_checked=true`;
- source-publication-capacity gate;
- geoprivacy projection;
- public JSON Schema validation;
- public semantic validation.

Only then can `crime_public_events` be inserted or updated.

### `canonical_only`

Requires `record_status=verified_source` and an approved/canonical-only review.

No public payload is compiled and no public row is created. If a public row already exists for the same event, the DB writer fails closed instead of silently leaving that row visible. A transition from a previously public event must use `suppress` explicitly.

### `suppress`

Requires `record_status=suppressed` and reviewed public text. The compiler produces a suppressed public projection with null public geometry. Persisting it neutralises an existing public projection while preserving the canonical event and its audit history.

## Gate sequence

The CLI executes gates in this order:

1. **reviewed bundle JSON Schema** — Python `jsonschema`, Draft 2020-12;
2. **reviewed semantic invariants** — UUIDv7, referential consistency, no person-identity keys, event/review/intent consistency;
3. **source capacity** — reuses LTCEDS source-registry policy;
4. **internal-location consistency** — resolved precision cannot exceed evidence precision;
5. **geoprivacy projection** — reuses `@workspace/publication-standardisation/ltceds-location`;
6. **public semantic gate** — reuses `validatePublicEventSemantics`;
7. **public JSON Schema** — the existing canonical public-event Draft 2020-12 validator;
8. **attested-plan gate** — DB layer accepts only plans with every applicable gate passed.

The database writer does not re-decide editorial policy. It verifies the attestation, identity consistency and DB collisions, then persists transactionally.

## Source capacity

For `publication_intent=publish`, at least one source must normally satisfy the existing `sourceMaySolelySupportPublicEvent()` rule.

A high-risk or `human_gate` source combination requires both:

- `reviewer_role=senior_editor`;
- rationale code `HIGH_RISK_SOURCE_REVIEW`.

A bundle without normal primary publication capacity can only proceed with both:

- `reviewer_role=senior_editor`;
- rationale code `SOURCE_CAPACITY_OVERRIDE`.

These overrides are explicit review assertions. They do not change a source's underlying authority type or provenance.

## Geography and anchors

Internal geometry is never copied mechanically to the public payload.

The compiler calls the existing deterministic `projectPublicLocation()` policy. In particular:

- arrest/search/discovery/recovery/procedural geography remains non-default-map geography;
- municipality/unknown precision never becomes a point;
- exact low-risk public sites may retain exact source-supported geometry;
- residential/victim-linked locations require a matching reviewed public anchor and privacy-set policy;
- high-vulnerability and sexual-offence contexts suppress point geometry;
- no municipality-centroid marker or random jitter is introduced.

The compiler optionally reads:

```text
data/processed/legalita/ltceds_public_anchors.json
```

or an explicit `--anchors <path>` snapshot. If no anchor snapshot is available, the compiler fails closed at the individual location: locations that require a safe anchor are suppressed rather than made falsely precise.

## Dry-run first

```bash
pnpm --filter @workspace/scripts run compile:ltceds-reviewed -- path/to/bundle.json
```

Dry-run is the default. It emits an audit report containing:

- event and bundle hash;
- gate results;
- counts of canonical entities;
- selected public-anchor IDs;
- public payload hash/status/privacy tier when present;
- per-location geoprivacy decisions;
- no database action.

The full attested plan is not printed because it can contain internal canonical coordinates.

## Explicit write

```bash
pnpm --filter @workspace/scripts run compile:ltceds-reviewed -- path/to/bundle.json --write
```

Only after every gate passes does the CLI place the attested plan in a temporary file and delegate to:

```bash
pnpm --filter @workspace/db run apply:ltceds-reviewed-plan -- <temporary-plan.json>
```

The temporary plan is removed after the call.

## Transactional DB writer

The DB writer uses one transaction for the whole event plan.

Before upsert it fails closed on:

- event UUID already associated with a conflicting event form;
- source UUID changing source type or canonical source key;
- one canonical source key already assigned to another source UUID;
- offence UUID already assigned to another event;
- location UUID already assigned to another event;
- references to non-existing `EVENT_CLUSTER` IDs;
- `canonical_only` applied to an event that already has a public projection.

Within the same transaction it upserts:

- `crime_sources`;
- `crime_events`;
- `crime_event_offences`;
- `crime_event_locations`;
- `crime_event_sources`;
- existing-cluster memberships;
- `crime_public_events` when applicable.

There is no implicit delete or truncate path.

Public projection changes are SHA-256 classified as `inserted`, `updated` or `unchanged`. Suppression is reported explicitly as `suppressed`; canonical-only writes are reported as `canonical_only`.

## Hashing and audit

The compiler uses recursively key-sorted canonical JSON before SHA-256 for:

- reviewed bundle hash;
- public payload hash.

The audit surfaces:

- bundle hash;
- source IDs at DB write time;
- all compiler gate results;
- selected anchor IDs;
- public payload hash;
- public-row action.

A later audit-ledger extension can persist these reports without changing the event identity model.

## Safety posture

This compiler still does **not** authorise:

- live scraping -> automatic EVENT creation;
- person/victim/suspect identity in reviewed bundle v1;
- automatic allegation -> guilt conversion;
- automatic fuzzy resolver promotion;
- predictive policing or area-risk scoring;
- synthetic expansion of aggregate `EVENT_CLUSTER` counts;
- public reconstruction from internal DB location tables.

The existing public API remains read-only over `crime_public_events` only.

## Follow-up after this boundary

After the compiler is stable, the highest-value validation step is a larger review corpus spanning:

- contemporary simple events;
- multi-offence events;
- criminal-series/cluster cases;
- uncertain dates and historical sources;
- conflicting sources;
- sensitive/private occurrence locations;
- procedural developments separated from event identity.

That corpus should be used to decide whether `1.0-draft.1` can be promoted or needs another schema revision before a public UI is broadened.
