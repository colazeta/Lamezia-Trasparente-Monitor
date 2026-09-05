# LTCEDS taxonomy materialisation

Status: issue #1017 — ICCS + national-classification layers materialised; offence catalogue/crosswalk endpoint discovery remains open  
Parent standard: `docs/architecture/ltceds-v1.md`

## Principle

LTCEDS does not invent a local crime taxonomy. It keeps separate namespaces for:

- `iccs`: behaviour-based international statistical classification;
- `istat_synthetic`: Istat synthetic national classification;
- `istat_analytical`: Istat analytical national classification;
- `istat_crime_groups`: Istat cross-cutting groups/attributes;
- `istat_offence`: Italian legal/statistical offence catalogue;
- `istat_iccs_mapping`: official correspondence between the Italian catalogue and ICCS;
- legal references asserted by individual sources.

A crosswalk is a relationship between classifications. It is not a statement that two codes are semantically identical in every legal or historical context.

## Materialised source: Istat ICCS hierarchy

Istat's public `Classificazione internazionale dei reati` page exposes the ICCS hierarchy as a server-rendered table with the fields:

- `ID`;
- `DESCRIZIONE`;
- `DESCRIZIONE EN`;
- `ID PADRE`.

The repository materialiser:

```bash
pnpm --filter @workspace/scripts run fetch:ltceds-iccs
```

writes:

```text
data/legalita/ltceds/taxonomy/iccs-istat-current.json
data/legalita/ltceds/taxonomy/iccs-istat-manifest.json
```

No mapping is inferred from labels and no source labels are editorially rewritten.

## Materialised national Istat classification layers

Three additional official Istat surfaces are independently materialised by:

```bash
pnpm --filter @workspace/scripts run fetch:ltceds-istat-taxonomies
```

### Synthetic classification

Source: `Classificazione sintetica dei reati`.

The rendered table exposes:

- `ID`;
- `DESCRIZIONE`;
- `DESCRIZIONE EN`;
- `INIZIO VALIDITÀ`;
- `FINE VALIDITÀ`;
- `ID PADRE`.

LTCEDS preserves the source hierarchy and validity labels exactly. It writes:

```text
data/legalita/ltceds/taxonomy/istat-synthetic-current.json
data/legalita/ltceds/taxonomy/istat-synthetic-manifest.json
```

### Analytical classification

Source: `Classificazione analitica dei reati`.

The rendered table exposes:

- `ID`;
- `DESCRIZIONE`;
- `DESCRIZIONE EN`;
- `INIZIO VALIDITÀ`;
- `FINE VALIDITÀ`.

The observed source table does **not** expose `ID PADRE`. LTCEDS therefore stores this namespace as a source-faithful flat set and does not infer a hierarchy from code prefixes. It writes:

```text
data/legalita/ltceds/taxonomy/istat-analytical-current.json
data/legalita/ltceds/taxonomy/istat-analytical-manifest.json
```

### Cross-cutting crime groups

Source: `Gruppi di reato`.

Istat describes these as cross-cutting categories/attributes rather than an exclusive offence hierarchy. The public surface includes controlled group codes such as cybercrime, location, motive and situational-context families.

LTCEDS stores the source code and source label without assigning a synthetic parent relationship. It writes:

```text
data/legalita/ltceds/taxonomy/istat-crime-groups-current.json
data/legalita/ltceds/taxonomy/istat-crime-groups-manifest.json
```

Catalogue-to-group membership is **not** inferred by prefix. It remains part of the official navigator/correspondence problem.

## Fail-closed drift checks

### ICCS

Before a live ICCS snapshot is written, the materialiser requires:

1. the expected table headers;
2. unique ICCS codes;
3. a closed parent hierarchy;
4. all eleven expected ICCS roots (`01` through `11`);
5. at least 300 nodes.

### Istat synthetic

The materialiser requires:

- the exact expected table fields;
- unique IDs;
- at least a conservative minimum number of nodes;
- at least one source-declared self-parent root;
- closed parent references.

### Istat analytical

The materialiser requires:

- the exact expected table fields;
- unique IDs;
- a conservative minimum row count.

No parent closure is tested because the source does not expose a parent field.

### Istat groups

The materialiser isolates the crime-group selector from unrelated page controls and requires a conservative item count plus the source anchor families `Cy`, `Exp-Mig`, `Lo`, `Mot` and `SiC`. A changed page structure fails closed instead of silently publishing a partial vocabulary.

Minimum counts are truncation/drift guards, not claims that the official classifications must forever contain an exact number of categories. Legitimate structural revisions require explicit review and parser/version changes.

## Snapshot provenance

Every materialised taxonomy snapshot records:

- source provider and URL;
- source page publication date;
- retrieval time;
- parser version;
- SHA-256 of the exact source HTML;
- item count;
- Istat attribution and CC BY 4.0 licence.

Each separate manifest hashes the normalised resulting snapshot. A changed source hash is therefore visible even if the page remains structurally parseable.

## Remaining blocker: offence catalogue and official correspondences

Istat's `Catalogo dei reati` is an official interactive search interface. It exposes detailed normative identities including source, law/year, article, version/sub-article detail, description and sanction information. Istat currently declares normative coverage through December 2024.

Istat's `Navigatore delle classificazioni dei reati` is explicitly bidirectional:

- from an offence-catalogue element to synthetic, analytical, ICCS and group classifications;
- from a classification/group item back to the relevant catalogue elements.

Istat's own documentation also shows that these relationships are not uniformly one-to-one: 1:N, N:1 and exceptional 1:1 cases exist.

For that reason the source inventory continues to mark both resources as:

`pending_endpoint_discovery`

LTCEDS will not reconstruct those correspondences from:

- label similarity;
- article-number equality;
- common code prefixes;
- NLP similarity;
- manual convenience mappings.

A stable official machine channel, or a reproducibly queryable official response surface whose result identity/cardinality can be preserved, is required before `istat_offence` and `istat_iccs_mapping` are materialised.

## Licensing

Istat states that, unless otherwise indicated, content published on its website is released under Creative Commons Attribution 4.0. LTCEDS stores attribution with every Istat taxonomy source.

The 2025 UNODC ICCS Implementation Manual remains registered as a methodological reference only. The repository does not assert a redistribution licence for reproducing its text.

## Versioning rules

- do not silently replace earlier snapshots;
- preserve source and retrieval versions/hashes;
- preserve validity labels where Istat exposes them;
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
