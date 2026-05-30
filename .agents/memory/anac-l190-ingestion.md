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
