# rendiamoLameziaTrasparente

## Frontend web app

The public React/Vite frontend lives in `artifacts/lamezia-trasparente`. For provider-neutral preparation notes covering build commands, static output, public configuration and the frontend/API/worker deployment boundary, see `docs/frontend-deployment.md`.

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

- [API pubblica (REST + MCP)](artifacts/api-server/PUBLIC_API.md)
- [Architettura generale](docs/architecture.md)
- [Architettura delle integrazioni dati](docs/integrations/README.md)
- [Inventario fonti e pipeline](docs/integrations/source-inventory.md)
- [Integrazione Cruscotto Italia](docs/integrations/cruscotto-italia.md)
- [Checklist interoperabilità AgID](docs/agid-interoperability-checklist.md)
