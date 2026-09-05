# LTCEDS — open-source reuse audit

**Status:** foundation decision record  
**Related:** #1009, #401, #332

## Decision rule

A repository is useful only if it improves one of these steps:

`source → candidate → resolve/cluster → classify → geocode → privacy → validate → publish → explore`

Prefer libraries and patterns already present in the monorepo. Add a dependency only when it removes meaningful custom code and remains compatible with the pnpm/TypeScript architecture.

## Adopt from the current monorepo

| component/pattern | decision | LTCEDS use |
|---|---|---|
| `leaflet` + `react-leaflet` | **adopt** | future public event map |
| `supercluster` | **adopt** | point clustering at low zoom |
| `scripts/territorio/spatial-public-snapshots-*` | **adopt pattern** | fail-closed public materialisation |
| `@workspace/publication-standardisation` | **adopt boundary** | shared geoprivacy/public-projection policy |
| OpenAPI + DB source-of-truth rule | **adopt** | runtime persistence/API phase |

The current spatial publication code already provides the right safety architecture: default-deny publication, source metadata, SHA-256 manifests and atomic replacement of generated files. Crime-event publication should extend that pattern rather than create another publishing system.

### No MapLibre migration in v1

MapLibre is a strong project, but adding it now would duplicate a map stack that already satisfies the expected initial workload. Reconsider MapLibre/vector tiles only when event volume, polygon/vector layers, styling requirements or measured client-side performance expose a concrete limit of Leaflet/Supercluster.

## External repositories worth reusing

### 1. Ajv — `ajv-validator/ajv`

- https://github.com/ajv-validator/ajv
- MIT licence.
- JSON Schema Draft 2020-12 validation.
- **Decision: adopt in the validator follow-up.**

LTCEDS already has a JSON Schema 2020-12 public contract. Ajv should compile that contract in CI and at ingestion/publication boundaries so JSON Schema remains the canonical machine-readable schema. Do not create a second hand-maintained equivalent schema in Zod.

Zod can remain at existing API boundaries where the monorepo already uses it/generated validation; LTCEDS JSON validation should not be duplicated manually.

### 2. uuid — `uuidjs/uuid`

- https://github.com/uuidjs/uuid
- MIT licence.
- RFC-compliant UUIDs, including `v7()`.
- **Decision: adopt when event creation is implemented.**

Use UUIDv7 for canonical event, cluster, offence-instance and source IDs. IDs remain opaque and immutable: date, location and offence semantics are never encoded in the identifier.

### 3. Turf — `Turfjs/turf`

- https://github.com/Turfjs/turf
- MIT licence.
- Deterministic JavaScript/TypeScript geospatial operations.
- **Decision: adopt selectively when a concrete spatial job needs it.**

Useful candidates include point-in-polygon assignment to neighbourhoods/areas, bounding boxes, distance checks used as one deduplication signal, and controlled geometry transformations. Prefer modular imports. Turf must never be used to invent an occurrence point from arrest, search, discovery or recovery geometry.

### 4. FBI Crime Data Explorer — `fbi-cde/crime-data-frontend`

- https://github.com/fbi-cde/crime-data-frontend
- **Decision: reference, not dependency.**

Useful for public interaction patterns: taxonomy navigation, dataset explanations, filtering, downloading and separating exploratory visualisation from underlying data. Its US/UCR assumptions and application stack should not be copied into Lamezia Trasparente.

### 5. dedupe — `dedupeio/dedupe`

- https://github.com/dedupeio/dedupe
- MIT licence.
- Fuzzy record linkage/entity resolution.
- **Decision: reference now; optional specialist service later.**

Borrow the conceptual separation between blocking/candidate generation, comparison features and match decisions. Do not introduce a Python service in the foundation release. Event identity is safety-critical: deterministic low-risk rules should handle simple matches while ambiguous cases remain curator-reviewed. Evaluate `dedupe` only when corpus size and ambiguity justify a language boundary.

### 6. Presidio — `data-privacy-stack/presidio`

- https://github.com/data-privacy-stack/presidio
- MIT licence.
- PII detection/redaction/anonymisation.
- **Decision: optional defence-in-depth QA, never publication authority.**

Presidio may later scan candidate narratives or generated public summaries for accidental PII. It cannot prove that a record is anonymous: Italian names, local addresses, contextual re-identification and Article 10 GDPR risks still require deterministic publication rules and human/legal review where necessary.

## What not to reuse blindly

- generic crime-map repositories that equate one article, police call or arrest with one crime event;
- US offence taxonomies as the primary classification for Italy;
- heatmaps or risk scores that imply prevalence from a source-selected event corpus;
- reverse geocoding that promotes arrest/search/discovery locations to offence locations;
- automatic fuzzy merges without a reviewable evidence trail;
- PII redaction as a substitute for geoprivacy/publication policy.

## Recommended process architecture

```text
Parallel/public source discovery
        ↓
source registry + content hash
        ↓
candidate extraction
        ↓
blocking / candidate duplicate sets
        ↓
event resolver
  ├─ individually resolved → EVENT
  └─ not individually resolvable → EVENT_CLUSTER
        ↓
ICCS classification + Istat/legal crosswalk
        ↓
geocode occurrence evidence only
        ↓
public projection / geoprivacy (default-deny)
        ↓
JSON Schema validation (Ajv)
        ↓
semantic policy validation (@workspace/publication-standardisation)
        ↓
atomic JSON/GeoJSON snapshot + SHA-256 manifest
        ↓
API / Leaflet + Supercluster UI
```

## Dependency plan

### Foundation PR (#1009)

No new runtime dependency. Materialise:

- LTCEDS specification;
- JSON Schema 2020-12;
- shared TypeScript semantic/publication invariants;
- tests;
- this reuse audit.

### Next dependency PR

Add only when used:

1. `ajv` for canonical schema validation;
2. `uuid` for UUIDv7 generation;
3. modular `@turf/*` packages for concrete geospatial operations.

This avoids a speculative platform rewrite and keeps each dependency decision reviewable.
