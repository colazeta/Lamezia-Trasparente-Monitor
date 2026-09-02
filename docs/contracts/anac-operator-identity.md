# ANAC operator identity layer

Issue: #896

## Purpose

This layer connects monitored CIGs to economic operators reported in the public ANAC open-data datasets `Partecipanti` and `Aggiudicatari`.

It is an identity and provenance layer, not a risk model. A participation, award or recurrence is a descriptive fact and is not evidence of collusion, favoritism, corruption, criminal infiltration or other wrongdoing.

## Sources and separation

The two ANAC datasets remain separate throughout acquisition and publication:

| Dataset | Normalized relation | Public snapshot |
| --- | --- | --- |
| `partecipanti` | `participant` | `data/public/contracts/anac-participants/latest.json` |
| `aggiudicatari` | `awardee` | `data/public/contracts/anac-awardees/latest.json` |

The sync first queries the ANAC CKAN `package_show` endpoint for the requested dataset. A candidate is accepted only when it is an HTTPS resource on an ANAC domain, is a ZIP archive and belongs to the requested dataset path. If discovery does not return a usable resource, the sync uses only the canonical ANAC HTTPS archive path for that same dataset.

A redirect outside the official ANAC HTTPS domain is rejected.

## Source-backed fields

The parser requires the dataset to expose:

- CIG;
- `codiceFiscale`;
- `identificativoFiscaleEstero`;
- `ragioneSociale` / denomination;
- `ruolo`;
- `partrgrno` for participant group membership, or `aggrgrno` for awardee group membership.

Compatible snake-case aliases are accepted where the source schema uses them. Missing required columns cause the parser to fail closed instead of silently publishing a degraded interpretation.

Only rows whose CIG is already in the monitored ANAC/BDNCP perimeter are retained.

## Canonical operator identity

`operatorKey` is conservative and source-backed:

1. a usable Italian fiscal identifier wins and is represented as `IT-CODICE-FISCALE:<identifier>`;
2. otherwise, a published foreign fiscal identifier can form `ANAC-FOREIGN-FISCAL-ID:<identifier>`;
3. otherwise, `operatorKey` is `null`.

A company name by itself never forms a canonical key.

For the Italian source field, the adapter accepts the ANAC-documented identifier shapes used by the dataset: 11 digits or 16 alphanumeric characters. The adapter normalizes case and whitespace but does not invent, repair or infer a missing identifier.

A foreign fiscal identifier is preserved and normalized as published. Because the source does not necessarily provide an issuing jurisdiction, this key must not be treated as a globally unique cross-country identifier without further evidence.

## Roles and group membership

`participant` and `awardee` are different relations. The pipeline does not infer one from the other and does not equate the local `Contract.supplier` field with an ANAC awardee.

`ruolo` and the ANAC group identifier are retained on each relation. This prevents an RTI, consortium or other grouping from being flattened into unrelated firms.

The layer does not create synthetic bid-level offers. In particular, operator membership alone does not supply bid value, bid status, bid date or other fields required by bid-level Cardinal indicators.

## Deduplication

The normalization key for exact source-equivalent records includes:

- CIG;
- normalized relation;
- Italian fiscal identifier;
- foreign fiscal identifier;
- name;
- role;
- group identifier.

Only records equal on all of those dimensions are folded together. When that happens, every logical CSV record number is retained in `sourceRecordNumbers`.

The same operator in two CIGs, in two roles, or in two group contexts therefore remains represented by distinct relations.

## Provenance

Each snapshot records:

- dataset and relation;
- dataset page and acquired archive URL;
- whether the archive came from CKAN discovery or canonical fallback;
- acquisition timestamp;
- archive size;
- SHA-256 of the acquired ZIP;
- selected CSV member inside the ZIP;
- source archive URL and acquisition time on each normalized record;
- logical CSV record numbers after the header.

This allows a normalized relation to be traced back to a specific acquired archive and source record position even after exact duplicate folding.

## Coverage

The snapshot reports separately:

- tracked CIGs;
- CIGs with at least one matching relation;
- matched source rows;
- normalized relations;
- relations with and without canonical `operatorKey`;
- unique canonical operator keys;
- relations carrying a group identifier.

These are coverage and descriptive statistics. They are not risk indicators.

## Failure and update behavior

The two datasets are attempted independently in the same command. If one fails, the other is still attempted. A failed dataset does not receive a newly generated snapshot, and the command exits unsuccessfully after both attempts so the partial failure remains observable.

Downloads are streamed to a temporary archive with a size cap and ZIP-signature check. CSV contents are streamed from the archive and filtered by CIG rather than loaded in full memory.

## Command

From the repository root:

```bash
pnpm run contracts:anac-operators-sync
```

The command depends on the tracked-CIG perimeter already stored in `data/public/contracts/anac-bdncp/latest.json`.

## Explicit non-claims

The following conclusions must not be drawn automatically from these snapshots:

- absence of an operator means absence from the BDNCP;
- repeated participation means collusion;
- repeated awards mean favoritism;
- an awardee is identical to a locally named supplier unless identifiers support that link;
- a group membership is a bid-level offer;
- an operator relation by itself makes a Cardinal red flag computable.

Any later recurrence analysis, entity graph or screening layer must preserve these source boundaries and add its own explicit evidentiary and comparison rules.
