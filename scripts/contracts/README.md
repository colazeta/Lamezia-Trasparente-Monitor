# Contracts ingestion

This directory contains the source acquisition, normalisation and QA layers used to enrich the civic contract dossiers with public procurement data.

Current source-backed layers include:

- ANAC/BDNCP CIG acquisition for the monitored contract perimeter;
- ANAC `Aggiudicazioni` enrichment for award outcome fields and reported tenderer counts;
- OCDS Cardinal readiness checks that remain gated until their minimum source fields are available;
- ANAC `Partecipanti` and `Aggiudicatari` operator-identity ingestion, kept as separate datasets and relations;
- fixture-based and dry-run utilities retained for parser and source-discovery validation.

The operator sync is available through:

```bash
pnpm run contracts:anac-operators-sync
```

It discovers the official ANAC dataset resources through CKAN, falls back only to the canonical ANAC HTTPS archive path, streams the CSV, keeps only tracked CIGs and writes separate snapshots under:

- `data/public/contracts/anac-participants/latest.json`
- `data/public/contracts/anac-awardees/latest.json`

Operator identity rules are intentionally conservative: a valid source-backed fiscal identifier can form an `operatorKey`; a company name alone cannot. Participant and awardee roles are never merged, and group membership/role information is retained when published by ANAC.

See `docs/contracts/anac-operator-identity.md` for the detailed contract, provenance and limitations.

Out of scope for these scripts:

- no scraping of dynamic ANAC pages;
- no inference of absent operator identifiers, bids, bid prices or bid statuses;
- no automatic equivalence between the local `Contract.supplier` field and an ANAC awardee;
- no public risk score derived from operator recurrence;
- no claim that CIG-level open data complete the procurement or public-works lifecycle.

New source integrations should preserve source provenance, fail closed on incompatible schemas, keep missing values explicit and avoid presenting screening signals or descriptive recurrence as evidence of wrongdoing.
