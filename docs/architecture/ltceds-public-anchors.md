# LTCEDS public anchors

Status: foundation for issue #1025  
Depends on: `docs/architecture/ltceds-geoprivacy.md`

## Purpose

The public-anchor layer is a **territorial privacy infrastructure**, not a crime dataset.
It contains deterministic points that can represent a sufficiently broad street-level
catchment when publishing an event at its exact internal location would be excessive.

No event, victim, suspect, proceeding or offence identifier is used to construct an
anchor. The same anchor can be reused by any future event whose internal location
resolves to the same geographic scope and whose publication-risk policy allows it.

## Source boundary

The first materializer reads:

```text
data/interim/geo/anncsu_lamezia_coordinate_recovery_candidates_2025.csv
```

That file is useful because the ANNCSU recovery workflow already separates raw
coordinates, suspect coordinates, geocoder/local-anchor candidates, reviewed manual
decisions and effective coordinates.

The LTCEDS materializer accepts only:

1. `anncsu_source_coordinate` rows with
   `coordinate_quality_flag=ok` and
   `coordinate_recovery_status=source_coordinate_unchanged`; or
2. future `manual_coordinate_override` rows carrying non-draft review metadata.

It rejects:

- suspect ANNCSU coordinates;
- Nominatim/provider candidates;
- local-anchor candidates that have not become reviewed effective coordinates;
- rows marked `exclude_from_geometry`;
- invalid or out-of-bounds points;
- rows without a civic address identity.

This preserves the existing ANNCSU rule: **candidate evidence is not an override**.

## Privacy-set identity

The privacy set is counted on unique civic addresses, not source rows.

The identity key is:

```text
normalised street + civic + esponente
```

Duplicate source rows therefore do not increase anonymity. If the same address has
conflicting effective coordinates, the address is excluded from anchor generation
instead of choosing one silently.

## Street scope keys

A public anchor now has an explicit `scope_key` such as:

```text
street:VIA XX SETTEMBRE
```

Internal event locations carry the corresponding `street_scope_key`,
`neighbourhood_scope_key` or `locality_scope_key` when those scopes are actually
resolved.

Anchor selection is exact on the relevant scope key. A street anchor for Via A can
never be selected for Via B merely because both anchors have the same precision.

This is a critical invariant: an unscoped city-wide anchor list is safe to pass to the
projection function because non-matching anchors are filtered out before privacy or
precision ranking.

## Initial publication thresholds

The initial street policy is deliberately conservative:

```text
minimum unique civic addresses       = 8
minimum distinct coordinate points   = 3
minimum spatial span                 = 30 m
```

The first threshold follows the Police.uk benchmark already adopted by LTCEDS as a
starting privacy rule. The other two thresholds prevent a misleading case in which
many address labels all resolve to one building/point and would therefore satisfy the
count while still exposing a single location.

These are policy parameters stored in the snapshot and manifest. They are not treated
as universal anonymity guarantees.

## Deterministic partitioning

For each eligible street:

1. civic addresses are deduplicated;
2. points are converted to a simple local metric frame;
3. the street is sorted along its dominant spatial axis;
4. a group closes only after it satisfies all privacy thresholds and leaves enough
   addresses for another possible privacy set;
5. a trailing undersized group is merged into the preceding group rather than being
   published below threshold;
6. groups that cannot satisfy the safeguards are not published.

The public point is the centroid of member coordinates. It is a catchment anchor, not
an assertion that the crime occurred at that point and not a surviving exact civic.

No random jitter is used.

## Stable anchor identity

Anchor IDs depend on:

- anchor algorithm version;
- street scope key;
- SHA-256 of the sorted unique member-address keys.

They do **not** depend on generation timestamp or input row order. If the underlying
privacy set changes, the anchor identity changes visibly rather than retaining an ID
for a materially different catchment.

Individual member civics and `access_id` values are not emitted in the public anchor
snapshot. A `member_set_sha256` is retained for reproducibility/audit.

## Output

Explicit materialisation command:

```bash
pnpm --filter @workspace/scripts run materialize:ltceds-public-anchors
```

writes atomically:

```text
data/processed/legalita/ltceds_public_anchors.json
data/processed/legalita/ltceds_public_anchors_manifest.json
```

The manifest records:

- source-path and source SHA-256;
- materializer version;
- privacy policy parameters;
- input/eligible/excluded counts;
- number of street scopes and anchors;
- covered/uncovered unique-address counts;
- exclusion reasons;
- snapshot SHA-256;
- availability of coarser fallback layers.

## Neighbourhood and locality fallbacks

No authoritative/reproducible neighbourhood layer is assumed in this tranche.
Therefore the manifest reports:

```text
neighbourhood = not_available
locality      = not_available
```

This is preferable to inventing neighbourhood boundaries or using the municipal
centroid. A future neighbourhood/locality anchor layer must have its own source,
version, geometry derivation and scope keys.

The current LTCEDS public schema also lacks a `locality_centroid` privacy transform,
so locality point publication remains fail-closed until a schema revision explicitly
adds it.

## Relation to events

The final flow is:

```text
source-supported event location
  -> internal resolution
  -> location scope key(s)
  -> publication-risk classification
  -> matching public-anchor catalogue
  -> privacy threshold gate
  -> public LtcedsPublicLocation
```

An anchor does not improve the evidence precision of an event. It only controls what
is safe to publish after the internal location has already been resolved.

## Non-goals

This layer does not:

- geocode crime events;
- infer where an event happened;
- correct ANNCSU coordinates;
- accept geocoder candidates;
- expose individual residential addresses;
- create neighbourhood boundaries;
- compute crime rates, heat maps or risk scores;
- use crime observations to choose anchor locations.
