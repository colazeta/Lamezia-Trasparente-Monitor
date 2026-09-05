# LTCEDS source ingestion boundary

Status: `1.0-draft.1` companion architecture note  
Parent standard: `docs/architecture/ltceds-v1.md`  
Issue: #1012

## Purpose

LTCEDS must not turn every document it encounters into a criminal event. The ingestion boundary therefore models an observed **source record** first and an `EVENT` only later.

The pipeline is:

```text
source registry
  -> discovery / change trigger
  -> candidate envelope
  -> extraction of source assertions
  -> resolver
       -> existing EVENT
       -> new EVENT
       -> EVENT_CLUSTER
       -> non-event / duplicate / context
  -> publication policy
```

A news article, police press release, court document, historical page or aggregate report is evidence about a possible event or set of events. It is never the canonical event merely because it was retrieved.

## Separation from the civic source registry

`scripts/civic-source-registry.ts` remains the generic registry for civic monitoring. Its main questions are operational:

- is the source reachable;
- what does it cover;
- how often should it be checked;
- is coverage complete, partial or unknown;
- what source-health limitations exist.

LTCEDS needs a second, specialised layer. Its questions are evidentiary and publication-oriented:

- what kind of authority produced the source;
- how was it acquired;
- is the content structured, narrative or aggregate;
- can it identify an occurrence directly, corroborate one, only discover a lead or merely provide context;
- can it ever support publication without another source;
- does the source require a human gate because of privacy or reputational risk.

These two registries should be linked by identifiers where useful, not collapsed into one oversized type.

## Source definition

The TypeScript contract lives in:

`./scripts/legalita/crime-events/ltceds-source-registry.ts`

### Authority type

- `judicial_primary`
- `law_enforcement_primary`
- `public_authority_primary`
- `news_agency`
- `press_secondary`
- `academic_archive`
- `other`

Authority type does **not** encode truth or guilt. It records provenance class only.

### Acquisition mode

- `api`
- `rss`
- `sitemap`
- `html_listing`
- `structured_download`
- `manual`
- `archive`

Acquisition mode is deliberately independent from evidentiary value. An API can contain aggregate data; a manually acquired judicial record can be primary evidence.

### Content mode

- `structured`
- `semi_structured`
- `narrative`
- `aggregate`

### Evidence role

- `occurrence_primary`: the source can directly state facts about the occurrence;
- `corroboration`: useful to confirm or refine an event already supported elsewhere;
- `discovery_only`: can create a lead/candidate but not support publication alone;
- `context_only`: useful context, not event evidence.

### Candidate policy

- `automatic`: a candidate envelope may be generated automatically;
- `human_gate`: candidate generation/review requires a human decision;
- `disabled`: no event candidate should be created from this source.

### Publication support

- `primary_possible`
- `corroboration_only`
- `discovery_only`
- `context_only`

Only a primary authority source with `primary_possible`, no high privacy/reputational risk and no explicit corroboration requirement can *potentially* support an event by itself. This is a necessary condition, not an automatic publication decision.

## Candidate envelope

A candidate is an observation about one source record.

Required concepts:

- `candidateKey`: deterministic SHA-256 identifier;
- `sourceId`;
- source-native record identifier and/or canonical URL;
- publication and retrieval dates kept separate;
- content SHA-256 fingerprint;
- candidate kind;
- optional source-claimed event count;
- resolution state;
- typed assertions.

### Why candidate IDs are hashes rather than event UUIDs

Candidate identity answers: **which source record did we observe?**

Event identity answers: **which occurrence in the world have we resolved?**

They are different questions and must not share an identifier.

The candidate key uses:

1. `sourceId`;
2. the source-native `sourceRecordId` when available;
3. otherwise the canonical source URL.

Retrieval time, content hash, title, extracted offence type and other semantic fields do not participate in candidate identity. They can change while the source record remains the same.

When a stable source-native record ID is present it takes precedence over the URL, so redirects or archive moves do not create a new candidate.

## URL canonicalisation

Before URL-based candidate identity is calculated:

- only `http` and `https` are accepted;
- embedded credentials are rejected;
- URL fragments are removed;
- common analytics parameters such as `utm_*`, `fbclid`, `gclid`, `mc_cid` and similar are removed;
- remaining query parameters are sorted deterministically.

This is identity normalisation, not content scraping.

## Content fingerprint

`contentSha256` is intentionally separate from `candidateKey`.

If the source modifies the same record:

```text
candidateKey: unchanged
contentSha256: changed
```

This permits change detection without manufacturing a second source record.

The existing change-sentinel architecture can therefore be reused as a **trigger/fingerprint mechanism**. It must not become the event resolver itself.

## Assertion candidates

Extraction emits source assertions, not canonical facts.

Current roles include:

### Occurrence-facing

- `occurrence_date`
- `occurrence_location`
- `offence_classification`
- `event_count`

### Procedural / other locations and dates

- `arrest_date`
- `arrest_location`
- `search_date`
- `search_location`
- `discovery_date`
- `discovery_location`
- `procedural_status`
- `other`

The distinction is structural. An extraction system is not allowed to relabel `arrest_location`, `search_location` or `discovery_location` as `occurrence_location` merely to obtain a mappable point.

Each assertion also records its basis:

- `source_stated`
- `structured_field`
- `extracted`
- `editorial_review`

The future resolver will preserve provenance at assertion level when conflicts are reconciled.

## Aggregate counts and false granularity

A source may state, for example, that an operation concerns 27 offences or 12 thefts.

That number is **not** permission to create 27 or 12 individual `EVENT` objects.

The cardinality planner therefore distinguishes:

- `event_cluster_required`: source gives N > 1 but no individual items are resolved;
- `mixed_resolved_plus_cluster_required`: some, but not all, items are individually resolved;
- `individual_resolution_possible`: every claimed item has independent source-level identity/evidence;
- `single_event_possible`;
- `unresolved`;
- `no_event`.

If an aggregate report says `claimedEventCount = 27` and zero individual occurrences can be separated, the downstream object is an `EVENT_CLUSTER`, not 27 generated IDs.

## Procedural-only candidates

A document can be relevant to the criminal-history corpus while containing only procedural facts: arrest, search, discovery, hearing or another procedural state.

Such a candidate is retained for linking/provenance but is **procedural-only** until another source supplies occurrence-level evidence. It must not receive a crime-map point by borrowing the procedural location.

## Non-event context

`non_event_context` is explicitly non-promotable. Examples could include a general policy report or background history that does not identify a specific occurrence.

The builder marks it `rejected_non_event` for event resolution while allowing downstream research tooling to retain the source separately if useful.

## Privacy and reputational gates

The source definition carries separate `personalDataRisk` and `reputationalRisk` levels.

A source with `high` risk is forced to `human_gate` even if its nominal candidate policy is `automatic`.

This is intentionally earlier than the final LTCEDS public projection. Privacy is checked twice:

1. **ingestion/candidate gate** — whether a source record should enter automated resolution;
2. **publication gate** — whether specific fields/geometry may be exposed publicly.

Presidio or another PII detector may later be used as defence-in-depth. It does not replace deterministic LTCEDS rules.

## Relationship with existing change detection

The existing `changeSentinelWorker` and `changeSentinelQueue` demonstrate useful patterns:

- source IDs are canonical;
- one bounded queue item is processed at a time;
- canonical content is fingerprinted with SHA-256;
- routine operational timestamps are excluded from material-change fingerprints;
- unpromoted sources fail closed.

For LTCEDS the analogous future workflow should be:

```text
source changed
  -> retrieve/capture source record
  -> canonicalise locator
  -> compare candidateKey/contentSha256
  -> create/update candidate envelope
  -> extract assertions
  -> enqueue resolver
```

No live source is promoted by this foundation PR.

## What remains downstream

This note deliberately stops before event resolution. Follow-up work should implement:

1. source-specific discovery adapters;
2. a resolver using date/time, occurrence geography, offence compatibility and source-native identifiers;
3. deterministic exact-match rules before any fuzzy/probabilistic logic;
4. explicit merge/split review;
5. EVENT_CLUSTER handling;
6. assertion-level provenance and conflicts;
7. DB/OpenAPI only after the resolver model is stable.

## Non-goals

This boundary does not:

- infer guilt;
- score people or neighbourhoods;
- treat press coverage as complete crime data;
- use number of candidates as a crime rate;
- geocode procedural locations as offence locations;
- generate individual events from aggregate totals;
- introduce live scraping or new external dependencies.
