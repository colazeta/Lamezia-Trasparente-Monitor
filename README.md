# rendiamoLameziaTrasparente

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

The worker expects the same server-side environment as ingestion in the API process, including `DATABASE_URL` and any optional source/provider configuration used by the existing ingestion modules. No provider-specific deploy configuration is committed here.
