---
name: ISTAT SDMX performance ingestion
description: How the "Performance del Comune" automatic indicator ingestion pulls real ISTAT data and why series stay sparse.
---

# ISTAT SDMX as the automatic source for performance indicators

The "Performance del Comune" section ingests real historical data from ISTAT's
SDMX REST API. Working example (resident population, Lamezia Terme):

- URL: `https://esploradati.istat.it/SDMXWS/rest/data/IT1,22_289,1.0/A.079160.JAN.9.TOTAL.99?startPeriod=2015&endPeriod=2026`
- Required header: `Accept: application/vnd.sdmx.data+csv;version=1.0.0` (returns CSV).
- CSV has named columns `TIME_PERIOD` and `OBS_VALUE` — parse by header name, order is not guaranteed.
- DSD dimension order for dataflow 22_289: `FREQ.REF_AREA.DATA_TYPE.SEX.AGE.MARITAL_STATUS` (6 keys). For total population: `A.<istatCode>.JAN.9.TOTAL.99`. Lamezia Terme ISTAT code = `079160`.
- Age-subgroup codes (Y_GE65 etc.) did NOT resolve for this dataflow — automatic source is total population only; richer breakdowns must stay manual.

**Why series can look empty:** the isolated build environment frequently cannot
reach `esploradati.istat.it:443` (undici Connect Timeout ~10s). This is an
environment network limit, NOT a code bug. The ingestion catches it and writes a
`status:error` row to `feed_status` (source `performance:istat-popolazione`),
which `GET /performance/feed-status` surfaces. Expect real data only where the
host is reachable (e.g. production).

**How to apply / extend:** add more series to the `ISTAT_SERIES` config array in
`artifacts/api-server/src/lib/performanceIndicators.ts`; each entry's
`externalKey` must match a `performance_indicators.external_key` whose
`updateMode='automatic'`. Ingestion is non-destructive: it never overwrites
value rows where `manual=true` (set whenever the redazione PUTs a value).
