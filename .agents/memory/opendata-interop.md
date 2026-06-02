---
name: Opendata DCAT-AP_IT / CKAN interoperability
description: Where the public DCAT and CKAN-style read endpoints live and the conventions they follow.
---

The Opendata section exposes standards-based, public read endpoints for federation/reuse:

- DCAT-AP_IT JSON-LD: `GET /api/opendata/catalog.jsonld` (whole catalog) and
  `GET /api/opendata/datasets/:id/dcat.jsonld` (single dataset). Content-type `application/ld+json`.
- CKAN-compatible Action API (read-only): `GET /api/3/action/{package_list,package_search,package_show,group_list,resource_show}`,
  using the CKAN envelope `{help, success, result}` / `{help, success, error:{__type,message}}`.

Conventions:
- Serialization lives in `artifacts/api-server/src/lib/dcat.ts`; routes in `routes/opendata.ts`.
- Absolute URIs use `publicOrigin(req)` (req.protocol+host; relies on app's `trust proxy`).
- `package_show?id=` resolves by sourceId, slug, OR numeric db id.
- Stored `dataset.theme` is the EU data-theme code (GOVE, ECON, …) → mapped to the EU authority URI; unknown codes are dropped. `frequency` mapped to EU frequency authority via a lookup table, raw string dropped if unmapped.
- These endpoints are intentionally NOT in `lib/api-spec/openapi.yaml` — they are external-facing, not consumed by the typed React client, so adding them would generate unused/awkward hooks. The React UI just links to the absolute `/api/...` URLs.

**Why:** task "Catalogo Opendata interoperabile (DCAT-AP_IT / CKAN)". DCAT-AP_IT mirrors the dati.gov.it federation format; CKAN read API is the de-facto standard third parties expect.
