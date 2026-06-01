---
name: Opendata Maggioli portal access
description: How to reach the Lamezia Terme opendata catalog datasets (the public CKAN/Municipium APIs are NOT directly usable)
---
The Lamezia opendata portal (opendata.comune.lamezia-terme.cz.it) is a Maggioli/Municipium
microfrontend. The obvious endpoints are dead ends: CKAN/DCAT not exposed; the
`*.cloud.municipiumapp.it/api/v1/datasets` host returns 401.

**Working API (no token needed):** host `https://dataportal.maggioli.cloud`, used by the
`maggioli-opendata` microfrontend (`/api/v1/mgg-od/...`). Requires query param
`cod-ente=188067-opendata` (the portal id is in the catalog page HTML as `ente="188067-opendata"`).
Without an organization filter it returns the SHARED Maggioli catalog (~6000 datasets of all comuni).

- **List Lamezia datasets:** `GET /api/v1/mgg-od/datasets?cod-ente=188067-opendata&organizations=comune-di-lamezia-terme&start=N&rows=20`
  - `count` = total (36 as of 2026-05). Pagination is **Solr-style**: `start` (0-based offset) + `rows` (page size).
  - **`page`/`size`/`pageNumber`/`offset`/`limit` are all silently ignored** and always return the first 20 — using them gives 20 duplicate items. `rows` is capped at 20 (asking for more returns an empty list), so walk `start` by 20.
  - Note plural `organizations=` is the working filter key; `organization=`/`fq=`/`owner_org=` are ignored.
- **Dataset detail:** `GET /api/v1/mgg-od/datasets/detail/{id}?cod-ente=188067-opendata` (fuller licenseId etc.).
- **Resource file download:** each `resources[].url` is a public `https://www.opendata.maggioli.cloud/dataset/.../download/*.csv` (no auth, fetch directly).

Send `Accept: application/json` and an `Origin`/`Referer` of the portal to be safe (works without too).
Item shape: id, title, notes (description), groups[] (category, e.g. "Governo"), tags[], licenseId/licenseTitle,
metadataModified, holderName, resources[] ({name, format, url, lastModified}), extras[] (kv incl. theme, frequency, modified).
