# Lamezia Trasparente — Data Architecture Contract v1

Status: **normative** for new data work.  
Scope: canonical civic data, source ingestion, semantic classification, public projections and research exports.  
Non-goal: forcing editorial/application state into the canonical civic graph when it does not represent a civic fact.

## 1. Governing principle

Lamezia Trasparente is a provenance-first civic knowledge system. The website, API and research exports are projections of a canonical data model; they are not independent semantic stores.

Every externally acquired civic fact must be traceable through the following chain:

```text
source
  -> acquisition run / release
  -> source artifact and/or source record
  -> extraction / assertion
  -> explicit resolution outcome
       -> canonical entity or event, when evidence and semantics justify one
       -> unresolved / not_applicable / no_canonical_target /
          insufficient_evidence / review_required otherwise
  -> identifiers / relations / classifications, where applicable
  -> publication policy
  -> public read model / research export
```

Preservation, provenance and taxonomy do **not** depend on successful entity resolution. A source record must never be forced into a synthetic canonical entity/event merely to complete the pipeline.

Files may physically remain outside PostgreSQL. Their identity, provenance, hash, publication state and relation to canonical records must nevertheless be represented by the canonical data architecture.

## 2. Bounded contexts

The repository contains three different classes of data and they must not be conflated.

### 2.1 Canonical civic data

Facts about the municipality, institutions, administrative acts, procurement, projects, organizations, people, places, assets, crime events and statistical observations.

These records are governed by the universal source, identity, identifier, relation, evidence and taxonomy rules in this contract.

### 2.2 Editorial/application state

Page blocks, site strings, editorial workflow state, subscriptions, conversations and similar product state are legitimate relational data but are not automatically canonical civic entities.

They remain in their bounded context unless they explicitly assert a civic fact.

### 2.3 Public/read-model data

Public-safe projections and static exports are derived products. They must never become an independent source of semantic truth.

## 3. Universal conceptual primitives

New domain models must express themselves using the following primitives where applicable.

- **Source** — authority, system, dataset or publisher from which evidence is acquired.
- **Release** — a source state/version acquired at a defined time.
- **Artifact** — physical content such as PDF, JSON, CSV, ZIP, image or video.
- **Source record** — source-native logical row/document/item.
- **Assertion** — a source-stated, extracted, derived or editorial claim.
- **Resolution outcome** — explicit result of attempting to map an assertion/source record to canonical identity; successful resolution is only one possible result.
- **Subject identity** — universal addressability layer for a canonical Entity or Event; it does not define domain semantics.
- **Entity** — an object with persistent identity.
- **Event** — something that happens in time.
- **Identifier** — an externally defined code attached to a canonical subject/entity/event as appropriate; it is not the object itself.
- **Relation** — a typed semantic relationship between canonical subjects/entities/events.
- **Classification** — assignment of a versioned taxonomy concept or an explicit non-classification outcome.
- **Observation** — quantitative fact defined by series, time, geography, dimensions, value and unit.
- **Public projection** — physically or logically separate read model generated through a publication policy.

## 4. Required semantic distinctions

The following concepts must not be collapsed:

```text
administrative act != publication != document != administrative event
project != CUP
contract != CIG
person != role != mandate != membership
organization != organization name string
place != latitude/longitude pair
source record != canonical entity
subject identity != entity semantics != event semantics
unknown != zero
not available != not applicable != extraction failure != ambiguity
unresolved != not_applicable != no_canonical_target != insufficient_evidence
```

## 5. Canonical identity

### 5.1 Universal subject/addressability spine

Cross-domain canonical identity must be able to address both **Entities** and **Events** without pretending they are the same semantic primitive.

The target identity layer therefore uses a universal subject spine (for example `canonical_subjects`) with an explicit `subject_kind = entity | event`. Typed domain tables remain authoritative for what a person, organization, contract, project, administrative act, crime event, lifecycle event, etc. actually means.

The subject spine exists for:

- stable global UUIDs;
- legacy-to-canonical mapping;
- cross-domain addressability;
- cross-domain relations;
- migration reconciliation.

It must **not** become an EAV store, generic fact bag or replacement for typed domain schemas.

A source record with an unresolved, not-applicable or no-canonical-target outcome does not require creation of a subject row.

### 5.2 New canonical subject IDs

New cross-domain canonical subjects must use UUIDv7.

Legacy integer primary keys may remain during migration and may continue to be used as local implementation keys. They must not be treated as the future universal identity.

Legacy-to-canonical mapping must preserve the legacy namespace/type/id, the target subject ID, resolution method/status and sufficient audit metadata to reconstruct the decision.

### 5.3 External identifiers

CIG, CUP, tax code, VAT number, IPA code, ISTAT code, ANBSC identifiers, CLP, Albo progressivi and source-native IDs are identifiers attached to canonical subjects/entities/events as appropriate.

A new domain must not use the mere presence of one external identifier as a prerequisite for preserving a source record.

## 6. Source and provenance requirements

Every automated external source introduced after this contract must declare:

- source key and publisher;
- endpoint/resource;
- acquisition method;
- acquisition timestamp/run;
- source-native identifier when available;
- release/version/hash semantics;
- parser/extractor version;
- failure and partial-ingestion behaviour;
- coverage metrics;
- artifact retention policy;
- public-safety boundary.

A pipeline may not silently discard an acquired record because it is irrelevant to a current page.

## 7. Evidence, resolution and epistemic states

Derived data must distinguish at least:

- `source_stated`;
- `extracted`;
- `derived`;
- `editorial`.

Resolution must expose an explicit outcome, including where applicable:

- `resolved`;
- `unresolved`;
- `not_applicable`;
- `no_canonical_target`;
- `insufficient_evidence`;
- `review_required`.

The canonical resolved value may be denormalized into a typed domain table for efficient query, but the supporting assertion/evidence must remain auditable.

Manual corrections must supersede, not erase, previous automatic results.

## 8. Taxonomy requirements

Every reusable classification must declare:

- taxonomy/scheme identifier;
- concept identifier when a concept is assigned;
- taxonomy version;
- classification method;
- confidence or deterministic status where meaningful;
- review status;
- evidence/source;
- explicit non-classification outcome when no concept can defensibly be assigned.

At minimum, `unknown`, `not_applicable`, `insufficient_evidence` and `review_required` must remain distinguishable where meaningful. No pipeline may convert classification failure into silent record exclusion.

## 9. Domain modelling rules

### 9.1 Event-first where lifecycle matters

Use events rather than a mutable status-only row when the history is analytically meaningful. This applies especially to procurement, projects, institutional mandates, confiscated assets and crime events.

### 9.2 Typed domain relations first

Within a bounded domain, use typed foreign keys and normalized tables. The cross-domain subject/relation layer complements typed relational modelling; it does not replace it with a generic EAV/graph database.

### 9.3 No expanding nullable-FK polymorphism

Do not introduce new patterns such as:

```text
target_type
publication_id nullable
contract_id nullable
project_id nullable
...
```

for cross-domain relationships. Use the canonical subject/relation mechanism, or a dedicated typed relation when the relation is domain-local.

## 10. Geography

New geographic facts must distinguish:

- source/evidence precision;
- resolved precision;
- public precision;
- confidence;
- location role;
- sensitivity/publication risk where relevant.

New domain tables must not independently reinvent `latitude`, `longitude`, `geoAddress`, `geoSource`, `geoManual`, etc. unless they are an explicitly temporary compatibility projection.

PostGIS should be evaluated before the geographic canonical layer is finalized.

## 11. Statistical observations

New quantitative time-series ingestion should follow the mature pattern already used by demographics:

```text
series -> source release -> observation
```

Every exposed observation must have a source, release/acquisition, reference period, value, unit, status and dimensions where relevant.

## 12. Public-safety boundary

Canonical/internal storage and public presentation are different concerns.

Sensitive or publication-controlled domains must use a public read model generated through a versioned publication policy. The LTCEDS `crime_public_events` pattern is the reference implementation.

Public clients must not reconstruct public-safe records ad hoc from internal tables at request time where doing so could expose internal fields.

## 13. Repository data lake semantics

The existing repository layers remain valid, with the following normative roles:

- `data/raw/` — immutable or source-faithful acquisition artifacts; not a semantic canonical store.
- `data/interim/` — transient processing workspace; never authoritative.
- `data/processed/` — deterministic processed/exported products; canonical semantics must be recoverable from the DB/source registry.
- `data/curated/` — human-curated inputs or outputs; material civic facts must be round-tripped into the canonical DB or explicitly registered as source records.
- `data/public/` — public-safe read-model exports only.
- `data/sources/` — source manifests/snapshots; target state is alignment with the universal source registry.
- `data/geo/` — geographic source/reference artifacts; target state is alignment with the geo/source registries.
- `data/legalita/` — domain artifacts; target state is registered source/research material rather than a separate ontology.

No new civic dataset may exist only under `processed`, `curated` or `public` without a declared canonical/source ownership path.

## 14. Static build rule

Vite/Cloudflare may serialize and distribute public read models. It must not become the authoritative place for entity resolution, taxonomy decisions or cross-source reconciliation.

Target flow:

```text
canonical DB / validated public projection
  -> deterministic export
  -> static asset
  -> Cloudflare
```

## 15. Coverage and data-quality contract

Every recurring ingestion pipeline must be able to report, where applicable:

```text
observed
acquired
parseable
classified
resolved
unresolved
not_applicable
insufficient_evidence
review_required
failed
publicly_projected
```

A completeness claim is valid only relative to a declared source universe and time boundary.

## 16. Research-grade requirements

A research snapshot must identify:

- schema version;
- taxonomy version;
- source cutoff;
- source/coverage ledger;
- known limitations;
- data dictionary;
- checksum;
- export format/version.

Historical corrections and source revisions must remain reconstructable.

## 17. Architecture review gate for new data work

Any PR introducing a new table, source pipeline, recurring dataset or public dataset must document:

1. bounded context;
2. source/provenance ownership;
3. canonical entity/event ownership or explicit non-resolution semantics;
4. identity/identifier strategy;
5. taxonomy/classification strategy;
6. temporal/versioning semantics;
7. public projection/safety strategy;
8. coverage metrics;
9. migration/deprecation implications;
10. research/export implications.

The automated architecture inventory must fail closed when schema construction, registry ownership, migration provenance or repository data-layer ownership cannot be interpreted by the current gate.

## 18. Migration principle

Migration is additive and strangler-style:

```text
introduce canonical core
-> backfill / dual-write
-> reconcile
-> switch reads
-> freeze legacy writes
-> retire legacy representation only after equivalence proof
```

No existing source evidence or raw artifact is deleted merely because a new canonical representation is introduced.

A legacy `drizzle-kit push` database must not be declared equivalent to the current versioned migration chain merely because one sentinel table exists. Baseline recording requires a fail-closed compatibility proof sufficient for the structures being skipped.

## 19. Reference patterns already in the repository

The following current components are explicitly designated as architectural reference patterns:

- **LTCEDS crime events** — source/evidence separation, canonical events, constrained location model and physically separate public projection.
- **Demographics** — series/release/observation, append-only source revisions and release provenance.
- **Open data** — dataset/resource/snapshot acquisition hierarchy.
- **Organi membership history** — temporal membership modelling.
- **Publication public-safety attestation** — versioned fail-closed public-safety decision.

Future canonical work should generalize these patterns rather than create new incompatible ones.
