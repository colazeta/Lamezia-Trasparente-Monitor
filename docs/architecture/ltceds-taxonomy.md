# LTCEDS taxonomy materialisation

Status: ICCS tranche of issue #1017  
Parent standard: `docs/architecture/ltceds-v1.md`

## Principle

LTCEDS does not invent a local crime taxonomy. It keeps separate namespaces for:

- `iccs`: behaviour-based international statistical classification;
- `istat_offence`: Italian legal/statistical offence catalogue;
- `istat_iccs_mapping`: official correspondence between the Italian catalogue and ICCS;
- legal references asserted by individual sources.

A crosswalk is a relationship between classifications. It is not a statement that the two codes are semantically identical in every legal or historical context.

## First materialised source: Istat ICCS hierarchy

Istat's public `Classificazione internazionale dei reati` page exposes the ICCS hierarchy as a server-rendered table with the fields:

- `ID`;
- `DESCRIZIONE`;
- `DESCRIZIONE EN`;
- `ID PADRE`.

The repository materialiser:

```bash
pnpm --filter @workspace/scripts run fetch:ltceds-iccs
```

fetches that official page and writes:

```text
data/legalita/ltceds/taxonomy/iccs-istat-current.json
data/legalita/ltceds/taxonomy/iccs-istat-manifest.json
```

No mapping is inferred from labels and no source labels are editorially rewritten.

## Fail-closed drift checks

Before a live snapshot is written, the materialiser requires:

1. the expected table headers;
2. unique ICCS codes;
3. a closed parent hierarchy;
4. all eleven expected ICCS roots (`01` through `11`);
5. at least 300 nodes.

The minimum node count is a coarse truncation detector, not a claim that ICCS must forever contain an exact number of categories. A future legitimate structural revision that violates the sanity check requires explicit review and parser/version update.

## Snapshot provenance

Each materialised snapshot records:

- source provider and URL;
- source page publication date;
- retrieval time;
- parser version;
- SHA-256 of the exact source HTML;
- node count and roots;
- Istat attribution and CC BY 4.0 licence.

The separate manifest also hashes the resulting snapshot. A changed source hash is therefore visible even if the classification remains structurally valid.

## Why the Italian catalogue is not yet materialised

Istat's `Catalogo dei reati` is an official interactive search interface and explicitly describes detailed normative references, including article/sub-article detail and correspondence to crime classifications for offences and contraventions.

However, this tranche does not yet commit a stable machine endpoint for that interactive catalogue. The source inventory therefore marks it as:

`pending_endpoint_discovery`

The same applies to the official classification navigator/correspondence surface.

This is intentional. LTCEDS must not reverse-engineer an Italian-to-ICCS mapping by string similarity when Istat states that an official correspondence is maintained by the Sistan working group.

## Licensing

Istat states that, unless otherwise indicated, content published on its website is released under Creative Commons Attribution 4.0. LTCEDS stores that attribution with the Istat taxonomy source.

The 2025 UNODC ICCS Implementation Manual is registered as a methodological reference only. This repository does not assert a redistribution licence for reproducing its text.

## Versioning rules

When additional taxonomy sources are materialised:

- do not silently replace earlier snapshots;
- preserve source and retrieval versions/hashes;
- keep mappings many-to-many where the official source does so;
- distinguish `unmapped` from `conflict` and `unknown`;
- do not rewrite historical EVENT identity when legal classification changes;
- preserve classification assertions with provenance/time.

## Resolver integration

The deterministic resolver currently requires exact offence-key intersection for its strongest non-external-ID automatic rule.

After the official Istat catalogue/crosswalk is materialised, compatibility can become explicit and version-aware, for example:

- `exact_same_code`;
- `official_crosswalk_compatible`;
- `classification_changed_over_time`;
- `conflict`;
- `unknown`.

Any parent/child compatibility rule must be separately justified. Fuzzy label similarity is not an automatic equivalence rule.
