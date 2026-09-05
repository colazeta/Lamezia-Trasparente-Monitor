# LTCEDS geocoding and geoprivacy

Status: foundation for issue #1023  
Parent standard: `docs/architecture/ltceds-v1.md`

## Separation of concerns

LTCEDS treats three questions as distinct:

1. **What location does the source actually support?**
2. **What internal geometry, if any, can be resolved from that evidence?**
3. **What geometry is safe and methodologically honest to publish?**

A geocoder answers only the second question and only as a candidate generator. It cannot improve the evidentiary precision of the source and it does not decide publication safety.

```text
source assertion
  -> evidence precision
  -> geocoder / local gazetteer candidates
  -> reviewed internal resolution
  -> publication-risk policy
  -> deterministic public anchor or suppression
  -> LtcedsPublicLocation
```

## Evidence-capped resolution

The controlled evidence bases are:

- `source_stated_exact`
- `source_stated_named_site`
- `source_stated_street`
- `source_stated_neighbourhood`
- `source_stated_locality`
- `geocoder_candidate`
- `editorial_inference`
- `unknown`

The existing LTCEDS geographic precision vocabulary remains authoritative:

```text
exact_public_site / exact_address
  -> street_segment
  -> neighbourhood
  -> locality
  -> municipality
  -> unknown
```

A candidate result is capped to the less-specific of candidate precision and evidence precision.

Examples:

- source says `Via X` + geocoder finds `Via X 14` -> maximum supported precision remains `street_segment`;
- source names a public building and the gazetteer resolves its entrance -> it can remain `exact_public_site` after review;
- source says only `quartiere Y` -> no geocoder result may turn it into a street or civic event.

Even an exact candidate remains `candidate` until an explicit resolution/review step. Provider confidence is evidence about the geocoder response, not evidence that the criminal event happened there.

## Reuse of the existing ANNCSU/Nominatim work

The repository already has an ANNCSU coordinate-recovery workflow that provides useful implementation patterns:

- explicit `exact_civic` and `street_only` query variants;
- provider candidate records rather than silent coordinate replacement;
- cache keys based on the query;
- Lamezia bounding-box checks;
- candidate rank/type/house-number metadata;
- a review workbench rather than automatic acceptance.

LTCEDS should reuse these patterns through a future adapter. It must not make the existing ANNCSU QA pipeline itself a runtime dependency of event publication.

The preferred future order is:

1. local/official address or place identifier where available;
2. ANNCSU/toponymic context where applicable;
3. documented external geocoder candidate, such as Nominatim, if needed;
4. human review when the location affects event identity or public precision.

## Publication risk is not the same as geocode precision

An internally exact coordinate may still be inappropriate to publish.

LTCEDS uses a separate `publication_risk` vocabulary:

- `low_public_site`
- `non_sensitive`
- `residential`
- `victim_linked`
- `minor_or_vulnerable`
- `sexual_offence_context`
- `unknown`

Default policy:

- source-supported, low-risk public sites may retain exact public geometry;
- residential and victim-linked locations require deterministic generalisation;
- unknown risk does not receive street-level publication by default;
- minor/vulnerable and sexual-offence contexts suppress public point geometry;
- municipality-only or unknown evidence never becomes a municipality-centroid point.

This is deliberately more conservative than simply checking whether an address was already mentioned in a public article.

## Deterministic public anchors

LTCEDS does **not** randomly jitter event points.

Public geometry is selected from separately generated and versioned geographic anchors. An anchor is not derived from the event record itself and contains:

- `anchor_id`
- `kind`
- WGS84 geometry
- public precision
- source
- optional `privacy_set_size`
- generation/source version time

Initial kinds:

- `street_anchor`
- `neighbourhood_anchor`
- `locality_anchor`

The public projection always selects an anchor that is no more specific than the underlying evidence.

### Residential/victim-linked street threshold

The foundation uses a configurable default minimum privacy-set size of **8** for a street anchor in residential/victim-linked publication contexts. This follows the conservative benchmark already identified in the Police.uk anonymisation model; it is not treated as a universal statistical theorem.

The value therefore lives in policy configuration:

```text
minimum_residential_privacy_set_size = 8
```

Future ANNCSU-derived anchor materialisation should calculate and document the relevant address/civic catchment rather than hard-code a claim about anonymity.

If the street anchor is below the configured threshold, publication falls back to a neighbourhood anchor. If no safe represented anchor exists, geometry is suppressed.

## High-vulnerability contexts

For `minor_or_vulnerable` and `sexual_offence_context`, the current foundation suppresses point geometry entirely and exposes at most municipality-level precision in the public location object.

A future policy may allow a coarser aggregate geography after a dedicated privacy review, but the foundation intentionally fails closed.

## Locality anchors and schema evolution

The current public-event schema has explicit transforms for:

- street generalisation;
- neighbourhood centroid;
- municipality centroid;
- suppression.

It does **not** yet define a `locality_centroid` transform. Consequently, the core can recognise a locality anchor but will not emit its point geometry under `1.0-draft.1`; it preserves locality precision and suppresses geometry instead of mislabelling the transform.

Adding a locality-centroid representation requires an explicit future schema revision, not a silent enum mutation.

## Non-occurrence locations

`arrest`, `search`, `discovery`, `recovery` and `procedural` locations may be resolved and, where safe, retained as related locations. They are still not crime-occurrence points.

The existing `isDefaultPublicMapLocation()` rule remains authoritative: only `occurrence` locations can appear by default on the crime-event map.

## What this foundation does not do

It does not:

- issue live geocoder requests;
- accept Nominatim/ANNCSU candidates automatically;
- infer locations from person names;
- fabricate coordinates from municipality centroids;
- jitter points randomly;
- generate heat maps or crime-risk scores;
- decide DB/OpenAPI storage;
- publish real event locations.

## Next implementation step

After this core is stable, create a separate, reviewable materialiser for **public anchors for Lamezia Terme**. It should reuse canonical territory data already in the repository and, where address counts are needed, ANNCSU-derived inputs with explicit provenance.

Only after anchor generation is reproducible should a live/cached geocoding adapter feed reviewed LTCEDS candidate locations.
