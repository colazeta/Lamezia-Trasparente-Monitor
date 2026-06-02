---
name: Beni Confiscati section
description: Public mafia-confiscated-assets section, ANBSC ingestion, Italian route path vs English type names
---
Public "Beni Confiscati alle mafie" section (ConfiscatiBene-inspired), built mirroring the "bandi" pattern: DB schema w/ status+source enums + geo fields + manual precedence, OpenAPI codegen, api-server lib+routes, web list+map+detail+admin.

**Gotcha — path vs naming mismatch:** the Express routes and OpenAPI URL paths are Italian (`/api/beni-confiscati`, `/api/beni-confiscati/admin`, etc.), but the generated react-query hooks and TS types use English `ConfiscatedAsset` naming (`useListConfiscatedAssets`, `ConfiscatedAssetAdmin`). When smoke-testing endpoints, curl the Italian path — `/api/confiscated-assets` 404s.

**Manual precedence:** ANBSC CSV ingestion upserts via `onConflictDoUpdate` guarded to only overwrite rows where `source='auto'`; manual entries are never clobbered. Same precedence model as atti/legalità/bandi.

**ANBSC feed:** live open-data feed is typically unreachable in the isolated env (404, same as ISTAT SDMX). Ingestion is resilient — logs the error, continues the cycle, never crashes the boot. Seed provides 5 functional sample assets. Env overrides: ANBSC_OPENDATA_URL, ANBSC_TARGET_COMUNE.

**Geocoding:** reuses the contracts geocoding pass; admin has an inline LocationEditor dialog (leaflet click-to-place + nominatim address search) via useUpdateConfiscatedAssetLocation; setting a manual position clears geoVerify.
