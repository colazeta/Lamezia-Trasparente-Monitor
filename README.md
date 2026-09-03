# rendiamoLameziaTrasparente

## Frontend web app

The public React/Vite frontend lives in `artifacts/lamezia-trasparente`. For provider-neutral preparation notes covering build commands, static output, public configuration and the frontend/API/worker deployment boundary, see `docs/frontend-deployment.md`.

## Public MCP server

LameziaTrasparente exposes a permanent, public **Model Context Protocol (MCP)** server for external AI clients on `/api/mcp`. It is a read-only Streamable HTTP surface over the same public-safe data model used by the REST API.

The server supports the current MCP `2026-07-28` stateless protocol and retains stateless compatibility for 2025-era clients. The stable public tool contract covers administrative records, contracts, monitoring themes, performance indicators and PNRR projects. All tools are annotated read-only; no editorial, administrative or raw-ingestion capability is exposed.

Structured MCP results also expose a **versioned civic semantic profile**. LameziaTrasparente reuses DCAT/DCAT-AP, PROV-O, SKOS, the EU eProcurement Ontology and Italian OntoPiA/schema.gov.it assets while keeping alignment, reference and validated conformance as distinct concepts.

For endpoint configuration, the stable tool catalogue, protocol compatibility, safety rules and examples, see **[`docs/MCP.md`](docs/MCP.md)**. For ontology design, URI policy and semantic-governance rules, see **[`docs/SEMANTIC_MODEL.md`](docs/SEMANTIC_MODEL.md)**.

## WebMCP Challenge 2026

LameziaTrasparente is an existing civic-transparency platform that was **meaningfully extended with WebMCP during the OpenAI WebMCP Challenge submission period**. The challenge work is tracked in [issue #910](https://github.com/colazeta/Lamezia-Trasparente-Monitor/issues/910) and is deliberately separated from the pre-existing REST API and backend MCP server.

The browser-side extension registers four public, read-only WebMCP tools:

- `search_civic_documents` — search indexed public administrative records;
- `filter_public_contracts` — query public contracts by text, procedure, amount and date;
- `explore_pnrr_projects` — explore PNRR projects by text, mission and status;
- `inspect_civic_record` — open an individual document, contract or PNRR record.

Successful calls return structured public-safe data to the agent, move the citizen to the relevant LameziaTrasparente section and show an accessible read-only activity panel in the live UI with the action, result count and a small result preview. No editorial or write capability is exposed.

For the exact pre-challenge baseline, implementation notes, safeguards, demo prompt, video outline and submission copy, see **[`docs/WEBMCP_CHALLENGE_2026.md`](docs/WEBMCP_CHALLENGE_2026.md)**.

## Ingestion worker

The monorepo includes `@workspace/ingestion-worker`, a scheduled-job artifact that runs one ingestion cycle and exits. It reuses the API server ingestion pipeline instead of duplicating crawler logic, applies the same migration/schema startup safeguards before ingestion, and closes the PostgreSQL pool when the run finishes.

Useful commands:

```bash
pnpm --filter @workspace/ingestion-worker run typecheck
pnpm --filter @workspace/ingestion-worker run build
pnpm --filter @workspace/ingestion-worker run start
```

A cron provider should build the artifact during deployment and execute the bundled entrypoint for each scheduled run:

```bash
pnpm --filter @workspace/ingestion-worker run build
node artifacts/ingestion-worker/dist/index.mjs
```

Il deploy avviene tramite il pannello **Deployments** di Replit (target: `autoscale`). Alla pubblicazione:
1. Replit esegue `pnpm run build`
2. Avvia l'api-server (`node dist/index.mjs`)
3. L'api-server esegue le migrazioni e poi avvia l'ingestione

---

## Dev vs Produzione

| Aspetto | Dev (workspace Replit) | Produzione (deployment autoscale) |
|---|---|---|
| **Codice** | Identico | Identico |
| **Database** | PostgreSQL locale (Replit) | PostgreSQL managed (Replit) |
| **Schema** | `push` (interattivo, niente SQL) | Migrazione runner automatica all'avvio |
| **Avvio** | `tsx` (hot-reload via workflow) | `node dist/index.mjs` (bundle esbuild) |
| **Variabili d'ambiente** | `.env` locale / Secrets Replit dev | Secrets Replit produzione |
| **Object Storage** | Sidecar Replit (`REPL_IDENTITY`) | Sidecar Replit (`REPL_IDENTITY`) |
| **Log** | Pino pretty (stdout) | Pino JSON (stdout) |
| `NODE_ENV` | `development` | `production` |

---

## Strategia branch (dev → prod)

Il repository su GitHub usa **due branch principali**:

| Branch | Scopo |
|---|---|
| `dev` | Lavoro quotidiano — ogni task viene integrato qui |
| `main` (o `prod`) | Allineato al deployment di produzione |

**Flusso consigliato:**

```
feature/xxx  →  dev  →  (test + review)  →  main
```

1. Tutto il lavoro avviene su `dev` (o branch di feature poi mergiati in `dev`).
2. Quando `dev` è stabile e testato, si promuove su `main`.
3. Il deploy di produzione parte da `main`.

**Script post-merge** (`scripts/post-merge.sh`): viene eseguito automaticamente da Replit dopo ogni merge nel workspace dev. Esegue:
```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/db push      # aggiorna lo schema del DB di dev
pnpm --filter @workspace/db seed      # aggiorna i dati di seed
```

---

## Documentazione aggiuntiva

- [Public MCP server](docs/MCP.md)
- [Modello semantico e ontologie](docs/SEMANTIC_MODEL.md)
- [WebMCP Challenge 2026](docs/WEBMCP_CHALLENGE_2026.md)
- [API pubblica (REST + MCP)](artifacts/api-server/PUBLIC_API.md)
- [Architettura delle integrazioni](docs/architecture/README.md)
- [Layer di standardizzazione prima della pubblicazione](docs/architecture/publication-standardisation.md)
- [Catalogo delle fonti e delle integrazioni](docs/architecture/integration-source-catalog.md)
- [Integrazione Cruscotto Italia](docs/architecture/cruscotto-italia-integration.md)
- [Allineamento a best practice AgID/Developers Italia/Designers Italia](docs/architecture/agid-alignment.md)
