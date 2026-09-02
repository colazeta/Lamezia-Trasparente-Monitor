# OCDS Cardinal readiness for public contracts

Issue: #879

## Purpose

OCDS Cardinal is an Open Contracting Partnership tool that calculates procurement indicators and red flags from Open Contracting Data Standard (OCDS) compiled releases. Lamezia Trasparente uses it as a transparent screening methodology, not as a finding of irregularity.

The first integration stage is deliberately limited to **readiness**. It asks whether the ANAC/BDNCP data currently acquired by the project contains the minimum source-backed fields needed by each Cardinal red flag. It does **not** calculate red flags and does not assign a procurement risk score.

Target version: **OCDS Cardinal 0.0.8**.

Official documentation:

- https://cardinal.readthedocs.io/en/latest/
- https://cardinal.readthedocs.io/en/latest/topics/workflow.html
- https://cardinal.readthedocs.io/en/latest/cli/coverage.html
- https://cardinal.readthedocs.io/en/latest/cli/prepare.html
- https://cardinal.readthedocs.io/en/latest/cli/indicators/

## Why readiness comes first

Cardinal expects OCDS compiled releases, normally upgraded to OCDS 1.1. Its workflow separates data collection, preparation and quality review from indicator calculation. The current ANAC sync in this repository has a much narrower record shape: CIG, lot subject, contracting-authority name, lot amount, local procedure label and a source record identifier when available.

Those fields are useful for contract identification and enrichment, but they do not currently include the bid-level, tender-period, award, supplier and item-classification data needed by Cardinal's red flags.

The adapter therefore follows three rules:

1. preserve source meaning instead of filling missing OCDS fields by inference;
2. distinguish source-backed mappings from deterministic local analysis fields;
3. keep an indicator blocked until all of its minimum source-backed prerequisites are present.

## Safe mappings from the current ANAC record

| ANAC field | OCDS projection | Treatment |
| --- | --- | --- |
| `cig` | `/ocid` | deterministic local analysis key only; not represented as an official publisher-issued OCID |
| `title` | `/tender/title` | source-backed |
| `contractingAuthority` | `/buyer/name` | source-backed; buyer identifier still missing |
| `tenderAmount` | `/tender/value/amount` | source-backed; currency still missing |
| `procedureType` | `/tender/procurementMethodDetails` | source-backed local label; no silent conversion to `/tender/procurementMethod` |
| `recordId` | none yet | retained as provenance until an OCDS relationship is documented |

## Cardinal 0.0.8 red flags and current readiness

The table records minimum fields needed to make each indicator methodologically computable. Cardinal can have additional exclusions, configuration and population-size requirements; therefore `computable` means only that the minimum data gate is satisfied, not that a substantive result is automatically reliable.

| Code | Indicator | Key missing data in the current ANAC record | Current readiness |
| --- | --- | --- | --- |
| R003 | Short submission period | tender period start/end dates | unsupported |
| R018 | Single bid received | number of tenderers; standardised procurement method | unsupported |
| R024 | Price close to winning bid | bid prices/statuses/tenderers; active award/supplier | unsupported |
| R025 | Excessive unsuccessful bids | bid statuses/tenderers; active awards/suppliers; adequate cross-process population | unsupported |
| R028 | Identical bid prices | bid prices/statuses/tenderers | unsupported |
| R030 | Late bid won | bid receipt date/status/tenderer; submission deadline; active award/supplier | unsupported |
| R035 | All except winning bid disqualified | bid statuses/tenderers; active award/supplier | unsupported |
| R036 | Lowest bid disqualified | bid statuses and prices; currency; active award | unsupported |
| R038 | Excessive disqualified bids | bid statuses/tenderer IDs; organisation IDs for buyer/procuring-entity outputs | unsupported |
| R048 | Heterogeneous supplier | active awards/suppliers; item classification ID and scheme | unsupported |
| R058 | Heavily discounted bid | bid prices/statuses/tenderers; active award/supplier | unsupported |

## Machine-readable readiness report

Run from the repository root:

```bash
pnpm run contracts:cardinal-readiness
```

The command reads `data/public/contracts/anac-bdncp/latest.json` by default and prints a JSON report containing:

- the Cardinal and adapter versions;
- current ANAC acquisition status and structured record count;
- per-source-field non-null coverage;
- source-backed and locally-derived OCDS paths;
- per-indicator `computable`, `partially-supported` or `unsupported` status;
- missing prerequisite paths;
- an explicit execution gate and methodological limitations.

An alternate ANAC snapshot can be supplied as the first argument to the package-level script:

```bash
pnpm --filter @workspace/scripts run check:cardinal-readiness -- path/to/snapshot.json
```

## Interpretation safeguard

A Cardinal result is a **screening signal**. It must never be displayed as proof of corruption, favouritism, collusion, mafia infiltration, illegality or individual responsibility. A signal should lead to source verification and contextual review.

For the public interface, any future indicator card should expose at least the indicator code, methodology, source fields used, reference population where relevant, Cardinal version, run date, source provenance and limitations. An unexplained composite “corruption score” should not be introduced.

## Next integration stage

The next issue should enrich the current CIG-centred source from BDNCP with the fields that close the most useful prerequisite gaps, then create a verified OCDS 1.1 analysis projection. The recommended order is:

1. tender period dates and standardised procurement method;
2. number of tenderers and bid-level tenderer identifiers;
3. bid statuses, bid values, currencies and receipt dates;
4. award statuses and supplier identifiers;
5. item classifications, preferably CPV with explicit scheme provenance;
6. stable buyer/procuring-entity identifiers.

Only after those fields are source-backed should the pipeline add Cardinal's `prepare` and `indicators` commands. Statistical indicators must then be calibrated on an adequate comparable population rather than interpreted from a very small municipal sample alone.
