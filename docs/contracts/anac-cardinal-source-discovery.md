# ANAC/BDNCP source discovery for OCDS Cardinal

Issue: #882

Discovery date: 2026-09-02

## Purpose

This note records which public ANAC/BDNCP sources can support the data prerequisites of OCDS Cardinal. It separates fields that are publicly available from fields that are merely part of the broader procurement lifecycle, and it avoids using FVOE or other non-public sources.

The discovery is intentionally conservative: a field is not promoted into an OCDS meaning unless the source semantics and the target semantics are compatible.

## Public source layers verified

### 1. ANAC Open Data portal

Official entry point:

- https://www.anticorruzione.it/-/portale-dei-dati-aperti-dell-autorita-nazionale-anticorruzione
- https://dati.anticorruzione.it/opendata

ANAC describes the Dataset area as a public download surface for BDNCP data in CSV or JSON, organised by year and month. The same catalogue also exposes separate datasets concerning participants, awardees and contract execution. The stated update cadence for these datasets is monthly.

This is the source family already used by the repository's CIG-centred synchronisation.

### 2. Official ANAC OCDS datasets

The national catalogue exposes ANAC datasets named `OCDS appalti ordinari anno <year>`, including the 2026 dataset in JSON. These datasets are important because ANAC is already publishing a representation according to the Open Contracting Data Standard rather than requiring Lamezia Trasparente to invent a full ANAC-to-OCDS transformation.

Public catalogue entry point:

- https://www.dati.gov.it/

Relevant dataset families include:

- `OCDS appalti ordinari anno 2026`;
- `Partecipanti`;
- `Aggiudicatari`.

### 3. ANAC National Public Procurement Platform data model

Official technical repository:

- https://github.com/anticorruzione/npa

The model confirms that the procurement lifecycle contains structured deadline, participant, award and CPV information. The current `tipoProcedura` typology uses explicit codes such as `open` for an open procedure. This technical model is used to validate semantics; it does not by itself prove that every field is present in every public bulk dataset.

### 4. Public legal publicity

The ANAC public legal publicity surface exposes notice-level information such as publication date, submission deadline, procedure, CIG, CPV, value and contracting authority for applicable notices.

Entry point:

- https://pubblicitalegale.anticorruzione.it/bdncp

This is useful for source verification and individual dossier enrichment, but it is not treated in this issue as a substitute for a stable bulk-data pipeline.

## Fields added to the current CIG-centred source record

The current parser now preserves the following nullable source fields when the monthly CIG archive exposes them:

| Source field | Repository field | Cardinal relevance | Current treatment |
| --- | --- | --- | --- |
| publication date | `publicationDate` | R003 | source-backed, but promoted to `/tender/tenderPeriod/startDate` only for a semantically verified open procedure |
| offer deadline | `submissionDeadline` | R003, R030 | source-backed `/tender/tenderPeriod/endDate` |
| procedure code | `procedureCode` | R003, R018 | retained; mapped to OCDS `open` only when code and label agree |
| procedure label | `procedureType` | R003, R018 | source-backed `/tender/procurementMethodDetails` |
| AUSA code | `contractingAuthorityCode` | organisation-level analysis | retained source-side; not silently used as OCDS `/buyer/id` |
| authority tax id | `contractingAuthorityTaxId` | organisation resolution | retained source-side until identifier scheme and party relation are explicit |
| CPV | `cpvCode`, `cpvDescription`, `cpvIsPrimary` | benchmark construction, future R048 | prevalent lot CPV retained; not converted into an award-item classification |
| procedure outcome | `outcomeCode`, `outcome`, `outcomeDate` | award enrichment | retained source-side; not sufficient to construct an OCDS award |

## Why R003 can be the first executable indicator

Cardinal R003 needs two fields on the same procurement record:

- `/tender/tenderPeriod/startDate`;
- `/tender/tenderPeriod/endDate`.

The offer deadline has a direct source meaning compatible with the period end. Publication date is more delicate: for an invitation-based or negotiated procedure, the public publication date is not necessarily the start of the period available to a tenderer to submit an offer.

The adapter therefore applies a fail-closed semantic rule:

1. the source must contain a valid publication date and offer deadline;
2. the procedure code and procedure label must independently agree that the procedure is open;
3. only then can publication date support `/tender/tenderPeriod/startDate` for readiness purposes.

The accepted open pairs currently include:

- current NPA-style code `open` with label `Aperta` or `Procedura aperta`;
- legacy CIG code `1` with label `Procedura aperta`.

A label by itself is insufficient, and a code by itself is insufficient.

## Why R018 remains blocked

R018 requires:

- `/tender/numberOfTenderers`;
- `/tender/procurementMethod`.

The open-procedure method can now be supported conditionally. The current CIG-centred record still does not provide a source-backed number of tenderers, so R018 must remain at most partially supported.

The public `Partecipanti` dataset is therefore the next candidate source. It must be joined only after verifying its CIG/lot key, historical coverage, update behaviour and treatment of grouped or consortium participants.

## Why CPV and outcome are not over-promoted

A prevalent CPV attached to a CIG/lot is valuable for constructing comparable procurement populations, but Cardinal R048 requires classification on awarded items. Those concepts are not interchangeable, so the adapter retains the source CPV without pretending that an award item exists.

Likewise, a procedure outcome such as `aggiudicata` does not by itself provide the active award object and supplier identifier required by several Cardinal indicators. The separate `Aggiudicatari` dataset is the appropriate next source to assess.

## Target architecture

The preferred direction after this issue is:

1. keep the compact CIG source as a low-cost identification and fallback layer;
2. ingest the official ANAC OCDS annual/monthly resources for tracked CIGs where practical;
3. use the public `Partecipanti` and `Aggiudicatari` datasets only for fields not sufficiently represented in the official OCDS releases, with explicit join provenance;
4. run Cardinal `coverage` against the resulting OCDS analysis corpus;
5. execute only indicators whose record-level readiness gate is satisfied;
6. build statistically meaningful comparison populations before interpreting cross-process outlier indicators.

This ordering reduces custom semantic translation and keeps ANAC's own OCDS representation as close as possible to the analytical layer.

## Excluded sources and interpretations

- FVOE and other restricted/non-public data are outside scope.
- No supplier or participant identity is inferred from free text.
- No ANAC outcome is treated as an OCDS award without award-level evidence.
- No CPV is treated as an award-item classification without item-level evidence.
- No red flag is evidence of corruption, collusion, favouritism, mafia infiltration, illegality or individual responsibility.

## Follow-up data gates

The next source-discovery increments should verify, in this order:

1. `Partecipanti`: stable CIG/lot join and derivation of number of tenderers;
2. `Aggiudicatari`: supplier identifier, award status/value and award date;
3. official ANAC OCDS resources: exact field coverage for the tracked municipal CIG population;
4. bid-level price, status and receipt-date availability, if public;
5. buyer/procuring-entity identifier construction using an explicit OCDS party/identifier scheme.
