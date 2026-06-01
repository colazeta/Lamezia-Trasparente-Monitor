---
name: Albo attachment archival via Tinn detail API
description: How to fetch per-act attachments/files from the Tinn albo portal and archive them
---

The Albo Pretorio list feed has no file links, but the Tinn detail API does.

- Detail endpoint: `GET https://albo.tinnvision.cloud/api/pubblicazioni/{ANNO}-{PROGRESSIVO}?ente=00301390795`
  **Why the gate matters:** it requires header `Accept: application/json`. Without it the server returns 404 (looks broken but isn't).
  **id format:** uses a DASH — XML `progressivo` `2026/1835` becomes `2026-1835`.
- Attachment download: `https://albo.tinnvision.cloud/allegati/{ANNO}_{PROGRESSIVO}_{allegato.PROGRESSIVO}_{allegato.tipoAllegato}?ente=00301390795` (underscores here, not dashes). Returns the real binary (PDF / p7m / octet-stream).

**How to apply:** enrichment is best-effort and decoupled from the main ingest — it runs after `runIngestion()` in `runIngestionCycle`, never throws, processes rows `WHERE detail_fetched_at IS NULL` in capped batches with low concurrency. Files are archived to public object storage and the row's `attachments` jsonb stores both `storagePath` (archived copy, preferred) and `officialUrl` (direct portal link, fallback). Frontend prefers `storagePath`, falls back to `officialUrl`, then to the generic portal URL when an act has zero attachments.
