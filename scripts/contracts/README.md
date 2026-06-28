# Contracts ingestion skeleton

This directory contains the first fixture-only normalisation layer for ANAC/BDNCP-style CIG open-data records.

Current scope:

- reads local JSON fixtures only;
- normalises formally valid CIG values through the existing procurement identifier helper;
- maps records into `ContractDossier`-compatible objects;
- attaches `ContractIngestionMetadata` separately from public source labels;
- marks ANAC fixture evidence as `fonte ufficiale ingerita` only for data actually parsed from the fixture;
- keeps execution and valutazione/collaudo/esito missing unless a future explicit execution/evaluation source exists.
- runs metadata-only source discovery reports with `node scripts/contracts/discoverOfficialAnacSource.ts <source-id>`, without writing production records.
- runs a gated fixture-only ingestion dry-run with `tsx scripts/contracts/runAnacCigIngestionDryRun.ts anac-open-data-cig-annual`, writing only an interim report under `data/interim/contracts/ingestion/`.

Out of scope:

- no scraping of dynamic ANAC pages;
- no live download of BDNCP, PVL, OpenCUP or MOP datasets;
- no production import into the application database;
- no claim that CIG-only data complete the public-works lifecycle;
- no operator, amount, award, execution or collaudo inference when source fields are absent.
- no public exposure of source discovery output as ingested contract records.
- no promotion from dry-run to production ingestion while ANAC source discovery remains manual-verification-only.

Future PRs should add documented dataset discovery/download, schema-specific parsers, persistence, freshness metadata and human-review gates before exposing ingested records in public production pages.
