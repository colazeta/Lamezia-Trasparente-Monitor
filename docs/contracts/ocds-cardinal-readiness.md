# OCDS Cardinal readiness for public contracts

Issues: #879, #882

## Purpose

OCDS Cardinal is an Open Contracting Partnership tool that calculates procurement indicators and red flags from Open Contracting Data Standard (OCDS) compiled releases. Lamezia Trasparente uses it as a transparent screening methodology, not as a finding of irregularity.

The integration remains deliberately gated by **readiness**. Before any indicator is executed, the adapter asks whether all minimum source-backed and semantically validated fields required by that indicator occur on the same procurement record. It does **not** fill missing OCDS fields by inference and does not assign a procurement risk score.

Target version: **OCDS Cardinal 0.0.8**.

Adapter/report version after #882: **`anac-cardinal-readiness.v2` / `cardinal-readiness.v2`**.

Official Cardinal documentation:

- https://cardinal.readthedocs.io/en/latest/
- https://cardinal.readthedocs.io/en/latest/topics/workflow.html
- https://cardinal.readthedocs.io/en/latest/cli/coverage.html
- https://cardinal.readthedocs.io/en/latest/cli/prepare.html
- https://cardinal.readthedocs.io/en/latest/cli/indicators/

ANAC source discovery is documented separately in:

- `docs/contracts/anac-cardinal-source-discovery.md`

## Why readiness comes first

Cardinal expects OCDS compiled releases, normally upgraded to OCDS 1.1. Its workflow separates data collection, preparation and quality review from indicator calculation.

ANAC now provides several public layers relevant to this workflow, including monthly BDNCP downloads, separate participants and awardees datasets and official OCDS datasets. The current Lamezia Trasparente sync remains CIG-centred, so #882 enriches that compact record first while preserving a path towards ANAC's official OCDS representation.

The adapter follows four rules:

1. preserve source meaning instead of filling missing OCDS fields by inference;
2. distinguish direct source-backed mappings, conditional semantic mappings and deterministic local analysis fields;
3. evaluate minimum prerequisites on the same procurement record;
4. keep an indicator blocked until at least one current record satisfies all of its minimum prerequisites.

## Current ANAC record fields and OCDS treatment

| ANAC/repository field | OCDS projection | Treatment |
| --- | --- | --- |
| `cig` | `/ocid` | deterministic local analysis key only; not represented as an official publisher-issued OCID |
| `title` | `/tender/title` | source-backed |
| `contractingAuthority` | `/buyer/name` | source-backed |
| `contractingAuthorityCode` | none yet | AUSA retained as source identifier; not silently used as OCDS party id |
| `contractingAuthorityTaxId` | none yet | retained until identifier scheme and party relation are explicit |
| `tenderAmount` | `/tender/value/amount` | source-backed; currency still missing |
| `procedureType` | `/tender/procurementMethodDetails` | source-backed local label |
| `procedureCode` | `/tender/procurementMethod` | conditional semantic mapping; currently only verified open-procedure pairs are accepted |
| `publicationDate` | `/tender/tenderPeriod/startDate` | conditional semantic mapping; only for a verified open procedure |
| `submissionDeadline` | `/tender/tenderPeriod/endDate` | source-backed |
| `cpvCode`, `cpvDescription`, `cpvIsPrimary` | none of the Cardinal-required award-item paths | retained for benchmarking; lot-level CPV is not an award item |
| `outcomeCode`, `outcome`, `outcomeDate` | none yet | retained; procedure outcome alone is not an OCDS award |
| `recordId` | none yet | provenance only |

## Conditional mapping for an open procedure

Two meanings require an additional fail-closed rule.

### OCDS procurement method

The adapter maps to `/tender/procurementMethod = open` only when code and label agree. It currently accepts:

- code `open` plus label `Aperta` or `Procedura aperta`;
- legacy code `1` plus label `Procedura aperta`.

A procedure label on its own is insufficient. A code on its own is insufficient.

### Tender-period start

`submissionDeadline` directly supports `/tender/tenderPeriod/endDate`.

`publicationDate` supports `/tender/tenderPeriod/startDate` only after the same open-procedure test succeeds. This prevents a publication date from being treated as the beginning of the offer window for negotiated, invitation-based or otherwise ambiguous procedures.

## Cardinal 0.0.8 red flags and readiness after #882

The current committed ANAC snapshot can still contain zero structured matches if the CIG source is unavailable, so the actual execution gate can remain closed even though the record schema is now capable of supporting R003 when suitable source records are acquired.

| Code | Indicator | Current data position | Readiness rule |
| --- | --- | --- | --- |
| R003 | Short submission period | publication date + submission deadline now parsed | **computable per record** only for a semantically verified open procedure with both dates |
| R018 | Single bid received | open procurement method can be mapped conditionally; number of tenderers still missing | partially supported on eligible open-procedure records; not computable |
| R024 | Price close to winning bid | bid prices/statuses/tenderers and award supplier missing | unsupported |
| R025 | Excessive unsuccessful bids | bid statuses/tenderers and award suppliers missing | unsupported |
| R028 | Identical bid prices | bid prices/statuses/tenderers missing | unsupported |
| R030 | Late bid won | submission deadline can exist; bid receipt date/status/tenderer and award supplier missing | partially supported only when the deadline is present; not computable |
| R035 | All except winning bid disqualified | bid statuses/tenderers and award supplier missing | unsupported |
| R036 | Lowest bid disqualified | bid statuses/prices/currency and award status missing | unsupported |
| R038 | Excessive disqualified bids | bid statuses/tenderer IDs missing | unsupported |
| R048 | Heterogeneous supplier | lot CPV is available but award supplier/item classification is not | unsupported |
| R058 | Heavily discounted bid | bid prices/statuses/tenderers and award supplier missing | unsupported |

The machine-readable report derives these statuses from actual records. A field existing in the schema does not make an indicator computable when the current records do not carry it.

## Record-level gate

For each record the adapter constructs only the OCDS paths that can be justified from that record. An indicator is marked `computable` only if at least one record contains all required paths simultaneously.

This prevents false readiness caused by aggregate column coverage. For example, a start date on one CIG and an end date on another CIG cannot make R003 executable.

The report includes `recordCoverage.totalRecords` and `recordCoverage.computableRecords` for every indicator.

## Machine-readable readiness report

Run from the repository root:

```bash
pnpm run contracts:cardinal-readiness
```

The command reads `data/public/contracts/anac-bdncp/latest.json` by default and prints a JSON report containing:

- Cardinal and adapter versions;
- current ANAC acquisition status and structured record count;
- per-source-field non-null coverage;
- directly source-backed OCDS paths;
- conditionally projectable OCDS paths;
- locally-derived OCDS paths;
- per-indicator `computable`, `partially-supported` or `unsupported` status;
- missing prerequisite paths;
- per-indicator count of computable current records;
- an explicit execution gate and methodological limitations.

An alternate ANAC snapshot can be supplied as the first argument to the package-level script:

```bash
pnpm --filter @workspace/scripts run check:cardinal-readiness -- path/to/snapshot.json
```

## Interpretation safeguard

A Cardinal result is a **screening signal**. It must never be displayed as proof of corruption, favouritism, collusion, mafia infiltration, illegality or individual responsibility. A signal should lead to source verification and contextual review.

Any future public indicator card should expose at least the indicator code, methodology, source fields used, reference population where relevant, Cardinal version, run date, source provenance and limitations. An unexplained composite “corruption score” should not be introduced.

## Next integration stage

The next priority is no longer to guess missing OCDS semantics from the CIG record. The public ANAC ecosystem already exposes richer sources, including official OCDS data, participants and awardees.

Recommended order:

1. verify and ingest the official ANAC OCDS resources for the tracked CIG population;
2. verify the `Partecipanti` join and derive a source-backed number of tenderers, taking consortium/group structure into account;
3. verify `Aggiudicatari` for supplier identifiers and award-level data;
4. investigate whether public bid-level prices, statuses and receipt dates are available with stable joins;
5. construct comparable CPV/procedure/value/time populations for statistical Cardinal indicators;
6. add Cardinal `coverage`, then `prepare`, then only the indicators that pass the record-level execution gate.

Statistical outlier indicators must be calibrated on an adequate comparable population rather than interpreted from a very small municipal sample alone.
