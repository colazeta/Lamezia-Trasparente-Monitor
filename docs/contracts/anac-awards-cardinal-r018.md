# ANAC Aggiudicazioni → OCDS Cardinal R018

## Purpose

This layer adds award/outcome data without collapsing its provenance into the CIG procurement feed. It is limited to fields that ANAC publishes in the `Aggiudicazioni` open-data surface and that can be interpreted without inventing bid-level records.

## Why this source is needed

ANAC publishes procurement data in OCDS, but the Open Contracting Data Registry currently reports zero tenderers in the ANAC OCDS publication. Cardinal R018 requires both `/tender/numberOfTenderers` and `/tender/procurementMethod`.

The public ANAC `Aggiudicazioni` dataset exposes `num_imprese_offerenti`, described in ANAC data structures as the number of firms that submitted an offer. This is semantically suitable for OCDS `tender.numberOfTenderers` as a count. It does **not** provide the identity of each tenderer and therefore cannot unlock indicators requiring `bids/details[]/tenderers[]/id`.

## Mapping

| ANAC field | Analysis use | OCDS/Cardinal projection |
| --- | --- | --- |
| `cig` | join key | joins to the tracked procurement process; not an official OCID |
| `num_imprese_offerenti` | number of firms that submitted offers | `/tender/numberOfTenderers` |
| `numero_offerte_ammesse` | descriptive award evidence | not substituted for numberOfTenderers |
| `numero_offerte_escluse` | descriptive award evidence | not yet promoted to bid statuses |
| `data_aggiudicazione_definitiva` | award provenance | not enough by itself to construct an OCDS award |
| `importo_aggiudicazione` | award provenance | not enough by itself to construct bid values |
| `esito` | award/outcome provenance | not promoted without a documented award-status mapping |

## R018 gate

R018 is marked `computable` for a procurement record only when all of the following hold on the **same CIG**:

1. `num_imprese_offerenti` is a valid non-negative integer;
2. the existing procedure gate maps the ANAC procedure to OCDS `open` using independently consistent code and label;
3. the award enrichment record is source-backed by the ANAC Aggiudicazioni archive.

A direct award, negotiated/ambiguous procedure, missing tenderer count, or malformed count remains gated. `numero_offerte_ammesse` is never used as a fallback for `num_imprese_offerenti`.

## Acquisition

`syncOfficialAnacAwards.ts`:

- reads the already tracked CIG universe from `data/public/contracts/anac-bdncp/latest.json`;
- asks the official ANAC CKAN catalogue for package `aggiudicazioni`;
- selects an official HTTPS CSV ZIP resource and falls back to the documented `aggiudicazioni_csv.zip` path only if catalogue discovery is unavailable;
- streams the CSV through `unzip -p`, retaining only tracked CIGs;
- writes a separate `data/public/contracts/anac-awards/latest.json` snapshot.

The separate snapshot is deliberate: the CIG feed and Aggiudicazioni feed have different source archives and must remain independently auditable.

## What this does not unlock

R024, R028, R030, R035, R036 and R058 still require bid-level status, price, date and tenderer identity. R025 and R038 require tenderer identity across processes. R048 requires award suppliers and award-item classifications. Aggregate award counts are not sufficient substitutes.

## Public interpretation

A single-bid flag is a screening indicator only. It does not establish corruption, collusion, favouritism, illegality or responsibility. Public presentation must always expose the procedure type, the observed number of tenderers, the source record and the applicable methodology.
