---
name: ANAC L.190 ingestion
description: How the Comune di Lamezia Terme contracts feed is sourced and filtered
---

# ANAC contracts ingestion (Comune di Lamezia Terme)

- The reachable per-comune source is the **Tinn L.190/2012 feed** (same provider as the Albo Pretorio):
  `https://albo.tinnvision.cloud/export/xml?wich=190&ente=00301390795`. It is albo-schema XML; CIG/CUP/importo live in the free-text `<oggetto>`.

- **The feed mixes in non-contract acts** (convocazioni, ordinanze, etc.). Keyword filters like "lavori"/"servizio" over-match (e.g. "Calendario lavori"). **Only items with a CIG are genuine ANAC-tracked contracts** — ingest CIG-only.
  **Why:** keeps the contracts list and analytics clean and honest; non-CIG albo items polluted procedure/beneficiary distributions.

- Structured analytics (beneficiari, scelta contraente, MePa, importi) come from the **seeded ANAC-format rows** (`sourceId = seed-{cig}`); live ingestion augments with real CIG-bearing items (`sourceId = anac-{progressivo}`, idempotent upsert).
  **How to apply:** to wipe only ingested rows without touching seed, delete `WHERE source_id LIKE 'anac-%'`.

- Analytics beneficiary rankings skip rows whose supplier is empty/"Non specificato" so unstructured items don't dominate "top/most-recurrent beneficiario".

- **Live aggiudicatario/importo enrichment is done from the act `<oggetto>` free text, NOT from ANAC.** ANAC's `dati.anticorruzione.it` per-CIG endpoints (OCDS/smartCIG) are WAF-blocked ("Request Rejected") or 404 from the server; the comune's old L.190 dataset XML URLs return 410 Gone. `extractBeneficiario(oggetto)` (in anacContracts.ts) prefers a legal-form anchor (Srl/Spa/Soc.Coop./Ets…) walking tokens backward, falls back to trigger phrases ("in favore di…", "operatore economico…"); conservative by design — ~6/24 live items name a supplier, the rest genuinely don't.
  **Why:** keeps precision high so analytics aren't polluted; recall is limited by what the act text actually states.

- The contracts upsert must include `supplier` in BOTH insert and the UPDATE set, or already-ingested rows never get enriched on later runs (idempotency).

- **Dev DB contracts table can be badly drifted** (missing source_id + all ANAC columns); `drizzle-kit push` then wants to *truncate* to add the source_id unique constraint and aborts in non-TTY. Fix additively via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` + backfill source_id + add the unique constraint manually — never truncate the seeded rows.
