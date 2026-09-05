# Lamezia Trasparente Crime Event Data Standard (LTCEDS)

**Version:** `1.0-draft.1`  
**Status:** working application profile; not stable  
**Scope:** source-grounded, incident-level representation of documented criminal events in Lamezia Terme  
**Related:** #1009, #401, #332, #537

## 1. Purpose

LTCEDS is an **application profile**, not a new crime taxonomy. It defines how Lamezia Trasparente identifies one real-world criminal occurrence, links multiple sources to it, classifies the conduct, represents uncertainty and exposes only a privacy-safe public projection.

The register is not a complete census of crimes committed, reported or prosecuted in the city. Counts from LTCEDS are **coverage counts of documented events**, not crime incidence or prevalence estimates unless independently reconciled with official statistics and labelled accordingly.

## 2. Standards reused

LTCEDS combines established standards according to their strongest role:

- **UNODC ICCS** — primary behavioural/statistical offence classification;
- **Istat Catalogue of Criminal Offences** and Istat↔ICCS mappings — Italian legal/statistical layer;
- **NIBRS / NIEM Justice** — conceptual incident-based model and one-to-many relations among incidents, offences, locations and justice actions;
- **ICCS disaggregating variables** — attempted/completed status, weapon, situational context, geography, date/time, location type, motive, cyber-relatedness and reporting source;
- **W3C PROV** — claim/source provenance;
- **EDTF / ISO 8601-2 concepts** — uncertain and approximate dates;
- **GeoJSON RFC 7946** — public geospatial exchange;
- **DCAT 3 / W3C Data on the Web Best Practices** — dataset metadata and versioning;
- **Police.uk-style geoprivacy principle** — public geometry may be less precise than internally known geometry.

NIBRS is used for the **incident model**, not as the primary offence taxonomy for Italy. ICCS remains the primary statistical taxonomy; Istat supplies the national legal/statistical mapping.

## 3. Non-negotiable principles

1. **Occurrence, not article.** The canonical object is the underlying occurrence, never the article, press release, arrest, police operation or court hearing.
2. **Stable identity.** Individually resolvable events receive an immutable UUIDv7. Later corrections and new sources do not change it.
3. **No false granularity.** A source-reported count of events does not justify minting synthetic individual IDs. Use `EVENT_CLUSTER` until events are individually resolvable.
4. **Multi-offence by design.** One event can contain multiple `OFFENCE_INSTANCE` rows.
5. **Multi-location by design.** Occurrence, target, discovery, recovery, arrest, search and procedural locations are distinct.
6. **Allegation is not guilt.** Investigation/prosecution/outcome is represented separately from the event itself.
7. **Claim-level provenance.** Material assertions remain traceable to sources and derivation mode.
8. **Explicit uncertainty.** Time/geographic precision is stored as data, never inferred from display formatting or coordinate decimals.
9. **Privacy by design.** Public output excludes unnecessary personal identifiers and can generalise or suppress geometry.
10. **Reproducible classification.** ICCS/Istat mapping basis and version must be identifiable.
11. **Fail closed.** Lack of a publishable occurrence location means “not mapped”, not substitution with arrest/search/discovery or municipal centroid.

## 4. Core graph

```text
EVENT 1 ───< EVENT_LOCATION
  │
  ├────< OFFENCE_INSTANCE
  │          └────< ALLEGATION_OUTCOME
  │
  ├────< EVENT_SOURCE >──── SOURCE
  ├────< ASSERTION >──── SOURCE
  ├────< CASE_EVENT_LINK >──── JUSTICE_CASE
  ├────< EVENT_SERIES_MEMBER >──── EVENT_SERIES
  └────< EVENT_RELATION >──── EVENT

EVENT_CLUSTER ───< SOURCE
```

## 5. EVENT

Minimum internal fields:

| field | rule |
|---|---|
| `event_id` | UUIDv7; immutable; no semantic content |
| `schema_version` | e.g. `1.0-draft.1` |
| `record_status` | `candidate`, `verified_source`, `published`, `superseded`, `merged`, `split`, `withdrawn`, `suppressed` |
| `event_form` | `discrete`, `continuous_episode`, `course_of_conduct` |
| `title_public` | neutral factual wording; no unnecessary person identifiers |
| `summary_public` | source-grounded and presumption-of-innocence safe |
| `occurred_start`, `occurred_end` | ISO date/datetime when supported |
| `occurred_edtf` | optional EDTF expression for uncertain historical dates |
| `time_precision` | explicit controlled value |
| `primary_occurrence_location_id` | optional; must reference an `occurrence` location |
| `privacy_tier` | `open`, `generalised`, `suppressed` |
| `current_revision` | monotonically increasing |

### Event forms

- `discrete`: bounded occurrence such as one robbery or shooting;
- `continuous_episode`: one uninterrupted transaction containing several acts/locations over an insignificant interval;
- `course_of_conduct`: repeated/continuing conduct reported as a period where individual episodes cannot be reliably separated.

A `course_of_conduct` must never be counted interchangeably with discrete incidents without an explicit methodological transformation.

## 6. EVENT_CLUSTER

Use when evidence establishes that multiple distinct events exist but does not expose enough information to create distinct canonical records.

Core fields:

- `cluster_id`: UUIDv7;
- `reported_event_count`: integer or null;
- `count_precision`: `exact`, `minimum`, `approximate`, `unknown`;
- `occurred_start`, `occurred_end`;
- `area_label` only if source-supported;
- `resolution_status`: `unresolved`, `partially_resolved`, `resolved`;
- source references;
- `resolved_event_ids` as event-level evidence becomes available.

**Hard rule:** `EVENT_CLUSTER` members are never automatically minted from a count alone. Canonical event counts include only individually resolved events. A separately labelled source-reported aggregate may expose the cluster count.

## 7. EVENT_LOCATION

Roles:

`occurrence | target | discovery | recovery | arrest | search | procedural | other`

Key fields:

- internal/public place label;
- internal/public geometry;
- municipality/neighbourhood;
- `geo_precision_internal` and `geo_precision_public`;
- `geocoding_basis`;
- `location_sensitivity`;
- `privacy_transform`;
- ICCS location type;
- source/assertion provenance.

### Precision vocabulary

`exact_public_site | exact_address | street_segment | neighbourhood | locality | municipality | unknown`

### Sensitivity vocabulary

`public_place | non_sensitive | private_or_sensitive | unknown`

### Privacy transform

`none | public_place_centroid | street_generalisation | neighbourhood_centroid | municipality_centroid | suppressed`

### Default map rule

Only `location_role = occurrence` can become a default crime-map point. A body-discovery location, arrest location, search location or recovery location must never silently substitute for an unknown offence location.

Municipality-level/unknown evidence is not rendered as an artificial point at the city centroid.

A `private_or_sensitive` exact address is generalised or suppressed in the public projection.

## 8. OFFENCE_INSTANCE and taxonomy

One event may contain multiple offences. Classification order:

1. **ICCS behavioural/statistical code** — primary taxonomy;
2. **Istat catalogue item / legal reference** — Italian legal layer;
3. **Istat synthetic and analytical classifications** — Italian statistical layer;
4. **ICCS disaggregations + Istat transversal groups** — context/attributes;
5. **local extensions** only where standards are insufficient.

Core fields:

- `offence_instance_id` UUIDv7;
- `iccs_code`;
- Istat catalogue/synthetic/analytical codes;
- legal reference when explicitly supported;
- `classification_basis`: `source_stated_legal`, `istat_crosswalk`, `behavioural_manual`, `provisional`;
- ICCS attempted/completed, weapon, situational context, motive, cyber-relatedness, reported-by;
- affected object/victim counts when the source supports them.

Organised crime, mafia context, corporate crime, public procurement, domestic/family context and similar concepts are **cross-cutting attributes**, not replacements for the offence taxonomy.

Never infer organised-crime/mafia context from neighbourhood, surname, ethnicity, reputation or association alone. It requires explicit evidential support.

## 9. SOURCE and ASSERTION

Source types:

`judicial_primary | law_enforcement_primary | public_authority_primary | news_agency | press_secondary | academic | other`

Source type is not a “truth score”. Preserve publisher, URL/reference, publication/access date, archive reference where lawful, and content hash where available.

For material claims use `ASSERTION`:

- subject type/id;
- predicate;
- typed object/value;
- `source_id`;
- `assertion_mode`: `explicit`, `derived_crosswalk`, `curator_inference`;
- corroboration count;
- asserted/superseded metadata.

This allows the product to answer “why does this field say X?” without overwriting earlier source states.

## 10. Justice/procedural layer

A police operation, arrest or court case belongs to `JUSTICE_CASE` / investigative/procedural actions, not automatically to `EVENT`.

Possible allegation/outcome progression:

`reported → under_investigation → suspected → cautionary_measure → charged → on_trial → convicted_nonfinal/acquitted_nonfinal → convicted_final/acquitted_final`

Additional values can include `dismissed`, `archived`, `charge_withdrawn`, `unknown`.

Different people/offences in the same event may have different statuses; an event-level status is only a derived summary.

## 11. Identity, merge and split

### Mint a new EVENT when

A distinct criminal occurrence is individually resolvable from evidence.

### Merge candidate records only when

- they plausibly concern the same underlying occurrence/transaction;
- no material temporal contradiction exists;
- no material spatial contradiction exists;
- offence descriptions can coexist within one incident;
- source details support the same real-world referent.

Identity of an alleged offender may support resolution but is never required and must not be the sole match key.

### Split when

- sources establish autonomous occurrences;
- meaningful time/spatial discontinuity appears;
- one source bundles independent incidents;
- later evidence resolves part of an earlier cluster.

### Special rules

- multiple offences in one continuous occurrence → one EVENT, multiple offence instances;
- multiple victims in one occurrence → normally one EVENT;
- serial night with individually resolvable targets → separate events + one series;
- continuing maltreatment → `course_of_conduct` unless episodes are independently documented;
- arrest/operation/hearing → procedural action, not event;
- search/recovery location → not occurrence unless the offence itself occurs there (e.g. possession at that place/time);
- body found → `discovery`; homicide occurrence remains unknown unless established.

## 12. Deduplication workflow

Candidate matching should combine signals:

- temporal overlap;
- occurrence-location overlap at comparable precision;
- compatible ICCS/offence family;
- distinctive object/fact similarity;
- common case/operation reference;
- source text/entity similarity.

Resolver output: `likely_same | possible_same | distinct`.

Automatic merge is acceptable only for deterministic low-risk cases with no material contradiction. Ambiguous/sensitive/course-of-conduct cases remain human-gated.

## 13. Temporal uncertainty

`time_precision` values:

`exact_datetime | exact_date | bounded_interval | week_or_similar | month | year | approximate | unknown`

Use EDTF where useful for historical uncertainty. Do not manufacture midpoint dates for public display. If a representative date is needed for sorting, keep it derived and never expose it as the occurrence date.

## 14. Public privacy profile

Public core must not contain by default:

- names/initials of suspects, accused persons or victims;
- exact private residential addresses;
- licence plates, telephone numbers or personal identifiers;
- victim-identifying detail for sexual offences or minors;
- combinations of time/place/narrative that create material re-identification risk.

Maintain separate internal and public geometries. For domestic/sexual/minor-sensitive or otherwise re-identifiable cases, generalise to an appropriate area or suppress the point.

Machine redaction can be defence in depth but never replaces deterministic geoprivacy and editorial/legal review.

## 15. Public schema and validation layers

The machine-readable public-event contract is:

`data/legalita/ltceds/public-event-1.0-draft.1.schema.json`

Validation is intentionally two-layered:

1. **JSON Schema** — shape, required fields, enums, geometry bounds and some privacy conditionals;
2. **semantic publication policy** — `@workspace/publication-standardisation/ltceds`, covering UUIDv7, cluster false-granularity rules and default-map/geoprivacy invariants.

Ajv is the preferred follow-up validator for the JSON Schema 2020-12 contract. Do not create a second hand-maintained equivalent schema in another validation library.

## 16. Public distributions and UI semantics

Future distributions:

- JSON event records;
- GeoJSON FeatureCollection;
- CSV for tabular reuse;
- DCAT metadata;
- later OGC API – Features semantics where useful.

Default filters should include time, ICCS hierarchy, Istat layer, locality/neighbourhood, situational context, source type, procedural stage and geographic precision.

Mandatory disclaimer concept:

> La mappa rappresenta eventi criminali documentati nelle fonti censite da Lamezia Trasparente. Non è un censimento completo dei reati commessi o denunciati in città; copertura e selezione delle fonti variano nel tempo e per tipologia di reato.

No ranking “quartieri più criminali”, predictive policing or risk scoring follows from LTCEDS.

## 17. Repository integration

Use existing monorepo boundaries rather than a parallel application:

```text
docs/architecture/
  ltceds-v1.md
  ltceds-open-source-reuse.md

data/legalita/ltceds/
  public-event-1.0-draft.1.schema.json
  # future: vocab/, candidates/, events/, clusters/, series/, generated/

lib/publication-standardisation/src/
  ltceds.ts

scripts/legalita/crime-events/
  ltceds-core.test.ts
  # future: ingestion/resolution/materialisation jobs
```

When the feature enters runtime, the repository's existing rule applies: DB schema and OpenAPI contract are architectural sources of truth. Static JSON/GeoJSON are reproducible public distributions/fallbacks, not a competing canonical database.

Reuse the existing spatial publication pattern: default-deny, source metadata, SHA-256 manifest, atomic materialisation, canonical API with static continuity snapshot.

## 18. Planned pipeline

```text
source discovery
→ source normalisation + content hash
→ candidate extraction
→ duplicate blocking/candidate sets
→ event / cluster resolution
→ ICCS classification + Istat/legal crosswalk
→ occurrence geocoding + precision coding
→ privacy transform
→ JSON Schema validation
→ semantic publication validation
→ conflict checks
→ atomic JSON/GeoJSON publication
```

## 19. Stability gate

`1.0-draft.1` remains changeable. Promote to stable `1.0` only after:

- contemporary event stress test;
- 2000s event stress test;
- pre-2000/historical stress test;
- multi-offence and course-of-conduct cases;
- privacy/geoprivacy review;
- DB/API implementation test;
- curator workflow test for ambiguous merge/split decisions.

Breaking changes after stable 1.0 increment the major version.
