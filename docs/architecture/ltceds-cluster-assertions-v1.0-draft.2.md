# LTCEDS EVENT_CLUSTER scoped assertions — 1.0-draft.2

Status: **pre-1.0 standard revision**  
Scope: canonical/review semantics for `EVENT_CLUSTER` and provenance assertions  
Public EVENT payload: remains `public-event 1.0-draft.1`

## Why this revision exists

The LTCEDS stress corpus exposed the same failure mode in two independent source patterns:

1. an exact reported cluster count with a known investigation-seed occurrence window and broad areas, but without an exhaustive member-level list;
2. an approximate reported cluster count (for example, source-faithful wording such as “several hundred”), plus nearby contextual time/geography that is not demonstrably applicable to every member.

The old cluster core correctly prevented synthetic member minting, but count + resolution status alone could not preserve the **scope** of temporal, geographic and contextual claims.

A single `cluster_date`, `cluster_period`, `cluster_location` or representative map point would be wrong. It would silently turn context about a source, investigation, subset or seed event into a fact about every unresolved occurrence.

## Design decision

Do not add one date/place field to `EVENT_CLUSTER`.

Instead, extend the LTCEDS provenance model with **scoped assertions whose subject is the cluster**.

```text
EVENT_CLUSTER 1 ───< CLUSTER_ASSERTION >──── SOURCE
      │
      └────────────< resolved EVENT members
```

The cluster remains an anti-false-precision object. Assertions describe what a source supports and at what scope; they do not manufacture occurrence identity.

## Versioning

This revision introduces:

- `event-cluster-1.0-draft.2.schema.json`;
- `LTCEDS_CLUSTER_SCHEMA_VERSION = 1.0-draft.2`;
- scoped cluster assertion semantics.

It does **not** change:

- `public-event-1.0-draft.1`;
- public REST/GeoJSON EVENT behavior;
- EVENT identity rules;
- the prohibition on automatic cluster-member minting.

A future stable LTCEDS 1.0 can harmonise version labels after the stress corpus is complete.

## EVENT_CLUSTER core

Required canonical fields:

```text
cluster_id                 UUIDv7
schema_version             1.0-draft.2
reported_event_count       integer >= 1 | null
reported_count_text        string | null
count_precision            exact | minimum | approximate | unknown
resolution_status          unresolved | partially_resolved | resolved
resolved_event_ids         UUIDv7[]
assertions                 CLUSTER_ASSERTION[]
updated_at                 date-time
```

### Cardinality

`reported_event_count` is numeric only when the source supports a defensible integer.

For source wording such as “several hundred”, retain:

```text
reported_event_count = null
reported_count_text  = "several hundred"
count_precision      = approximate
```

Do not convert qualitative cardinality to an invented integer or midpoint.

For `count_precision=exact`, an integer count is mandatory.

### Resolution

- `unresolved`: no resolved member IDs;
- `partially_resolved`: some members may have independently resolved EVENT IDs;
- `resolved`: all known members are individually resolved.

For an exact-count resolved cluster, the number of unique `resolved_event_ids` must equal the reported count.

## CLUSTER_ASSERTION

Each assertion contains:

```text
assertion_id
subject_type = event_cluster
subject_id
predicate
scope
value
source_id
assertion_mode
source_locator?
subset_descriptor?
```

`subject_id` must equal the containing `cluster_id`.

### Predicates

Initial controlled predicates:

- `reported_cardinality`
- `temporal_scope`
- `geographic_scope`
- `offence_family`
- `target_class`
- `investigation_context`
- `other`

This list is intentionally small. It is not a substitute for ICCS/Istat offence classification or for a generic RDF/PROV layer.

### Assertion modes

- `explicit`
- `derived_crosswalk`
- `curator_inference`

A derived or curator assertion must retain source provenance and cannot acquire stronger subject scope merely because the derivation is plausible.

## Assertion scope

Scope is evidentiary, not cosmetic.

### `cluster_context`

The source describes the cluster or surrounding criminal pattern at aggregate level, but does not establish that the fact applies independently to every member.

Examples:

- a target class such as businesses/commercial activities;
- a broad named area associated with the reported series.

### `investigation_seed`

The fact describes an occurrence/window/location that initiated or seeded the investigation.

It **must never be inherited by all members**.

Example:

```text
seed window = night A–B
reported cluster count = 27
```

This does not mean all 27 occurred during A–B.

### `all_reported_members`

Use only when the source explicitly supports the fact for every reported member.

This is the **only scope that LTCEDS may treat as inherited by every member by default**.

### `member_subset`

The source states that a fact applies to a subset of members.

A non-empty `subset_descriptor` is mandatory. The descriptor is provenance, not an instruction to mint unresolved members.

### `procedural_context`

The fact concerns investigation, proceeding, operation, arrest/search/seizure context or another procedural frame rather than criminal occurrences themselves.

It cannot become EVENT time/location/classification.

## Typed assertion values

### Text

```json
{ "type": "text", "text": "business and commercial activities" }
```

### Count

```json
{
  "type": "count",
  "count": null,
  "count_text": "several hundred",
  "precision": "approximate"
}
```

### Temporal

```json
{
  "type": "temporal",
  "start": "2025-02-28",
  "end": "2025-03-01",
  "edtf": null,
  "precision": "bounded_interval"
}
```

A temporal assertion has no implicit propagation to members; propagation depends on `scope`.

### Geographic

```json
{
  "type": "geographic",
  "place_name": "Example city centre and district",
  "precision": "locality"
}
```

**Cluster geographic values deliberately contain no geometry field.**

The canonical cluster standard does not create a representative point, centroid or jittered pseudo-location for unresolved members.

## Anti-propagation rules

### Rule 1 — source adjacency is not subject equality

Facts that occur in the same sentence/document do not automatically share the same subject.

A contextual period attached to one described phenomenon cannot be copied to a separately mentioned cluster merely because both appear in the same sentence.

### Rule 2 — seed is not member scope

`investigation_seed` never becomes `all_reported_members` automatically.

### Rule 3 — authority is not granularity

A judicial or law-enforcement primary source may still be too coarse to resolve EVENT members.

Source authority affects provenance/publication capacity; it does not manufacture occurrence-level granularity.

### Rule 4 — classification is scope-bound

An offence family stated at cluster context does not automatically become the classification of every future resolved member unless the source explicitly supports `all_reported_members` or member-level evidence later confirms it.

### Rule 5 — no cluster map feature

`EVENT_CLUSTER` is not a default crime-map feature.

`defaultClusterMapFeatures()` is empty by construction. Public EVENT GeoJSON remains generated only from individually resolved, privacy-safe EVENT projections.

## Member promotion

An assertion can be inherited by every member **only** when:

```text
scope = all_reported_members
```

`member_subset` still requires explicit subset resolution before any member-level use.

`cluster_context`, `investigation_seed`, and `procedural_context` are never promoted by default.

This does not itself create EVENT members. Member identity still requires the deterministic resolver/review boundary.

## Stress-corpus implications

### Exact-count cluster pattern

A source can support:

- exact reported count;
- an investigation seed time window;
- broad cluster geography;
- unresolved member identities.

LTCEDS stores these as separate assertions. The seed window is not the cluster-member interval.

### Approximate-count cluster pattern

A source can support:

- qualitative cardinality such as “several hundred”;
- target class;
- surrounding contextual time or place not demonstrably scoped to every member.

LTCEDS preserves the qualitative count and assertion scopes rather than inventing an integer or copying contextual time to all episodes.

## Persistence boundary

This PR/revision intentionally does **not** add a database migration.

Future persistence should prefer a generic assertion table or equivalent subject-aware model, rather than adding one `temporal_*` or coordinate column to `crime_event_clusters`.

Minimum persistence requirements:

- assertion/source provenance;
- subject type/id;
- scope;
- typed value;
- uniqueness/stable identity;
- no trigger or job that expands aggregate counts into EVENT rows.

A migration is a separate protected-path change after this standard layer is accepted.

## Public API/UI boundary

No public cluster endpoint or cluster-map layer is introduced here.

If aggregate cluster visualisation is ever designed, it must use a separate non-event visual grammar that cannot be confused with occurrence points and must retain coverage/uncertainty semantics. That is explicitly out of scope for `1.0-draft.2`.

## Machine enforcement

The machine contract consists of:

- JSON Schema Draft 2020-12 validation;
- semantic TypeScript validation for cross-field/identity rules;
- tests proving that `investigation_seed` does not apply to all members;
- tests proving approximate source-faithful count text is accepted without an invented integer;
- rejection of point geometry in cluster geographic assertions;
- resolved exact-count reconciliation.

## Stability decision

LTCEDS must remain pre-1.0 until the 30-slot stress corpus verifies that this scope model handles additional cluster/series cases without requiring another breaking semantic revision.
