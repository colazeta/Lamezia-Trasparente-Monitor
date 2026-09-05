# LTCEDS deterministic resolver

Status: `1.0-draft.1` companion architecture note  
Parent standard: `docs/architecture/ltceds-v1.md`  
Upstream ingestion boundary: `docs/architecture/ltceds-source-ingestion.md`  
Issue: #1014

## Purpose

The resolver answers a narrow question:

> Does an occurrence item extracted from a source record refer to an already known canonical event, a genuinely unresolved/new occurrence, or an ambiguous/aggregate case that must remain under review?

It is deliberately **deterministic first**. Similarity scores, person names and free-text resemblance are not event identity.

```text
SOURCE RECORD
   -> candidate envelope
   -> one or more occurrence items
   -> deterministic resolver
       -> exact existing EVENT
       -> deterministic existing EVENT
       -> new-event candidate
       -> EVENT_CLUSTER required
       -> multiple distinct occurrences
       -> needs review
       -> non-event
```

## Resolution unit

The document is not the resolution unit. Each source record may expose zero, one or many `LtcedsOccurrenceCandidateItem` objects.

This permits one judicial document or press release to refer to multiple distinct criminal occurrences without collapsing them into a single event merely because they share a proceeding or operation.

## Strongest anchor: external occurrence identity

The strongest v0 rule is an explicit, stable source-native **occurrence** identifier already crosswalked to a canonical event:

```text
(source_id, external_occurrence_id) -> EVENT
```

This is intentionally different from:

- proceeding/fascicolo number;
- operation name;
- arrest identifier;
- search/perquisition identifier;
- person identifier.

Those may link records procedurally, but they are not occurrence identity.

If one external occurrence anchor maps to more than one canonical event, the resolver returns `needs_review`; it does not choose one.

An exact external occurrence anchor may survive later offence reclassification. In that case the event remains the same and the classification difference is preserved as a conflict rather than creating a duplicate event.

## Deterministic strong match

Without an exact external occurrence anchor, v0 may automatically match an existing event only when all of the following hold:

1. occurrence time windows overlap;
2. at least one **strong occurrence-location key** matches;
3. at least one canonical offence key matches;
4. no explicit `event_form` conflict exists.

This rule has the stable identifier:

`DETERMINISTIC_TIME_GEO_OFFENCE`

No numeric similarity score is used.

### Strong occurrence geography

Automatic matching accepts only normalised occurrence locations at these precisions:

- `exact_point`
- `address`
- `site`

The following are deliberately insufficient on their own:

- `street`
- `neighbourhood`
- `municipality`
- `unknown`

This prevents two unrelated events in the same neighbourhood or municipality from being merged automatically.

The location key is expected to come from a later deterministic normalisation/geocoding layer. The resolver itself performs no live geocoding.

## Time overlap

A point date/time is treated as a zero-length interval. A bounded interval overlaps conservatively when the intervals intersect.

Example:

```text
candidate: 2026-09-05
existing event window: 2026-09-01 .. 2026-09-10
=> overlap = true
```

Overlap does not upgrade either side's precision. It is merely a compatibility test.

More complete EDTF handling remains a later extension; v0 consumes already normalised parseable date/date-time boundaries.

## Offence compatibility

The v0 resolver uses explicit canonical offence keys. At least one exact normalised key intersection is required for the deterministic auto-match rule.

If time and strong occurrence geography align but offence keys conflict, the result is `needs_review`, not a new event and not an automatic merge. The conflict may reflect:

- a later legal reclassification;
- a source coding difference;
- a genuinely different occurrence.

Cross-taxonomy ICCS/Istat hierarchy reasoning belongs in the later taxonomy materialisation layer and must not be approximated here.

## Event-form conflict

If time and strong geography align but one record says `discrete` and the indexed event says `continuous_episode` or `course_of_conduct`, the resolver returns `needs_review`.

The resolver does not automatically split or merge event forms.

## Explicit non-anchors

The following are intentionally ignored as identity anchors in deterministic v0:

- names of suspects, defendants, victims or other people;
- proceeding/fascicolo/case number;
- operation name;
- article title;
- text similarity;
- arrest place;
- search/perquisition place;
- discovery/recovery place;
- other procedural locations.

These fields may be useful later as provenance or review context, but never replace occurrence-level time/geography/offence evidence.

## New-event candidate

A source occurrence item may be labelled `new_event_candidate` only when it has the full deterministic anchor set:

- occurrence time;
- strong occurrence geography;
- offence classification;

and no indexed event satisfies or materially conflicts with those anchors.

This decision does **not** itself allocate an EVENT UUID. Identity allocation remains a later layer, so resolver decisions stay reversible until persistence.

If required occurrence anchors are missing, the result is `needs_review` rather than a guess.

## Aggregate cardinality

The resolver reuses the cardinality policy from the candidate boundary.

If a source states N > 1 events but provides no individually resolved occurrence items:

`AGGREGATE_CLUSTER_REQUIRED`

If it supplies some, but fewer than N, individually resolved items:

`PARTIAL_AGGREGATE_CLUSTER_REQUIRED`

The unresolved remainder stays an `EVENT_CLUSTER`. No synthetic IDs are generated to fill the count.

## Multiple occurrences in one source record

Each occurrence item is resolved separately. When a record contains multiple individually resolvable items and none is ambiguous, the document-level decision is:

`multiple_events_resolved`

The result preserves per-item decisions, anchors, conflicts and matched event IDs.

If any item is ambiguous, document-level automatic resolution fails closed to `needs_review`.

## Machine-readable explanation

Every item result includes:

- `decision`;
- stable `ruleId`;
- matched canonical event IDs, if any;
- anchor classes actually used;
- explicit conflict codes;
- a short deterministic rationale.

This explanation is required for audit, curator review and future regression tests.

## Why fuzzy matching is deferred

The next stage may eventually use blocking/scoring inspired by `dedupeio/dedupe`, but only after the deterministic baseline has demonstrated where exact rules fail.

Any future fuzzy stage must:

- never override an exact external occurrence anchor;
- never use person names as a sufficient identity signal;
- keep procedural locations out of occurrence matching;
- expose the features that drove the score;
- remain human-reviewable above/below explicit thresholds;
- never create synthetic events from aggregate totals.

## Out of scope

This resolver does not:

- perform live source discovery;
- geocode addresses;
- allocate UUIDv7 identities;
- write DB rows;
- change OpenAPI;
- publish a UI;
- infer criminal responsibility;
- calculate crime rates or neighbourhood risk;
- perform fuzzy/probabilistic matching.
