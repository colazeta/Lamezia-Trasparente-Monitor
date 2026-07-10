# Backend deployment runbook (Express API server)

Issue linkage: #243, under the infrastructure track #238.

This page documents the current operational path for deploying the Express API server as an independent backend service. It is intentionally docs-only: it records the commands and runtime assumptions that already exist in the repository, without changing API runtime, routes, generated clients, database schema, package scripts, CI/deploy workflow or application behavior.

## Scope and source-of-truth checks

- API server package: `artifacts/api-server/package.json` (`@workspace/api-server`).
- API entrypoint: `artifacts/api-server/src/index.ts`.
- Express app and CORS behavior: `artifacts/api-server/src/app.ts`.
- Health endpoints: `artifacts/api-server/src/routes/health.ts`.
- Database connection and migrations: `lib/db/src/client.ts`, `lib/db/src/baseline.ts`, `lib/db/migrations/` and the startup migration flow imported by the API entrypoint.
- OpenAPI remains the API contract source of truth under `lib/api-spec/openapi.yaml`; this runbook does not change it.

Stop if any referenced file, package script or environment variable contract has changed before deployment. Do not infer replacement commands or new secrets from this runbook alone.

## Build and start commands

Use `pnpm`, not `npm` or `yarn`.

From the repository root:

```bash
pnpm --filter @workspace/api-server run build
PORT=3000 pnpm --filter @workspace/api-server run start
```

Equivalent commands from `artifacts/api-server/`:

```bash
pnpm run build
PORT=3000 pnpm run start
```

Current package scripts are:

- `build`: `node ./build.mjs`
- `start`: `node --enable-source-maps ./dist/index.mjs`
- `dev`: `export NODE_ENV=development && pnpm run build && pnpm run start`
- `typecheck`: `tsc -p tsconfig.json --noEmit`
- `test`: `vitest run`

Operational notes:

- `PORT` is mandatory. Startup throws before binding if `PORT` is missing, not numeric or less than/equal to zero.
- The build bundles `artifacts/api-server/src/index.ts` with esbuild into `artifacts/api-server/dist/index.mjs` and copies database migrations into `artifacts/api-server/dist/migrations` so startup migrations can run from the built artifact.
- The start command is a Node process, not a frontend/Vite server.

## Startup sequence and readiness expectations

When the process starts successfully:

1. The Express app binds to `PORT`.
2. The server logs `Server listening`.
3. Pending database migrations are applied non-interactively by the startup flow.
4. The database schema is verified.
5. The embedded ingestion scheduler remains disabled unless explicitly enabled with `INGESTION_SCHEDULER_MODE=local` or `INGESTION_SCHEDULER_MODE=legacy`.

Treat a bound port as necessary but not sufficient: after deploy, check both the lightweight health endpoint and the migration health endpoint before shifting traffic.

## Health checks

Use the deployed service base URL, for example `https://api.example.test` below.

```bash
curl -fsS https://api.example.test/api/healthz
curl -fsS https://api.example.test/api/healthz/migrations
```

Expected responses:

- `GET /api/healthz` returns JSON compatible with the OpenAPI health response, currently a parsed `{ "status": "ok" }` payload.
- `GET /api/healthz/migrations` returns an operations payload with `status: "ok"` only when no migrations are pending. A `status: "pending"` response means the deploy must not be considered ready for traffic until the migration state is resolved.
- `GET /api/healthz/sources` is an operational source-audit endpoint. Use it for source freshness/completeness triage, not as an availability gate for the API process.

If `/api/healthz` fails, triage process binding, reverse proxy routing and `PORT`. If `/api/healthz/migrations` fails or reports pending migrations, triage database connectivity and migration state before enabling traffic.

## Server-only environment variables

Configure secrets in the backend service environment only. Do not expose server secrets through frontend `VITE_*` variables or public client configuration.

### Required for the API process

| Variable | Required when | Notes |
| --- | --- | --- |
| `PORT` | Always | Mandatory bind port read by `artifacts/api-server/src/index.ts`. |
| `DATABASE_URL` | Always for database-backed startup and routes | Required by the shared database client and migration/baseline helpers. Use a production database URL with least required privileges for the deployment model. |

### Authentication and editor/ingest operations

| Variable | Required when | Notes |
| --- | --- | --- |
| `CLERK_PUBLISHABLE_KEY` | Clerk-backed sessions are expected | Used by the Clerk Express middleware as a publishable key fallback. Despite the name, configure it on the backend service too. |
| `CLERK_SECRET_KEY` | Production Clerk proxy is used | Required by the Clerk proxy middleware in production for `/api/__clerk`. |
| `EDITOR_EMAILS` | Admin/editor or ingest routes need allow-listing | Comma-separated editor allow list used by editor and ingest guards. Development mode can relax some checks, but production should configure it explicitly. |
| `INGEST_API_TOKEN` | Ingest-protected endpoints are called | Bearer token expected by ingest authentication middleware. |

### Public URL, frontend integration and CORS

| Variable | Required when | Notes |
| --- | --- | --- |
| `PUBLIC_BASE_URL` | Recommended for production | Used to build public links in feeds, notifications and theme follow/unfollow flows. Prefer the canonical public web origin and avoid relying on Replit fallback domains in production. |

The current Express app uses `cors({ credentials: true, origin: true })`, reflecting the request origin while allowing credentials. For an independent backend deployment, configure the edge/proxy and frontend API base URL so browser requests go to the backend origin intentionally. If a stricter CORS allow-list is required, that is a runtime change and is outside this docs-only scope.

The corresponding browser configuration is `VITE_API_BASE_URL`. It is a public frontend build value, not a backend secret: set it to the deployed API origin (without `/api`) when frontend and backend are separated, or leave it empty when a reviewed reverse proxy keeps API requests same-origin.

### Optional integrations and operational alerts

| Variable | Required when | Notes |
| --- | --- | --- |
| `LOG_LEVEL` | Optional | Defaults to `info`; useful for controlled triage. |
| `OPS_ALERT_EMAIL` | Optional but recommended | Receives best-effort migration status alerts when Resend/email delivery is available. |
| `RESEND_API_KEY` | Email delivery is required outside Replit connectors | Preferred production credential for Resend-backed email. |
| `RESEND_FROM_EMAIL` | Email delivery is required | Defaults to `Lamezia Trasparente <onboarding@resend.dev>` if unset. Configure a verified sender for production. |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | AI helper/brief features are enabled | Optional integration endpoint for server-side AI features. |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | AI helper/brief features are enabled | Server-side API key for the AI integration. |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Object storage download/search routes are used | Comma-separated object-storage paths. Missing configuration causes object access paths to throw when used. |
| `PRIVATE_OBJECT_DIR` | Private object upload/storage routes are used | Required by private object-storage paths when used. |
| `ANBSC_OPENDATA_URL` | Override confiscated-assets source URL | Optional override; otherwise code uses its default public source URL. |
| `ANBSC_TARGET_COMUNE` | Override confiscated-assets municipality filter | Defaults to `LAMEZIA TERME`. |
| `ITALIADOMANI_LOC_CSV_URL` | Override Italia Domani location CSV | Optional override for source ingestion/helpers. |
| `ITALIADOMANI_PROJ_CSV_URL` | Override Italia Domani project CSV | Optional override for source ingestion/helpers. |
| `INGESTION_SCHEDULER_MODE` | Embedded scheduler is intentionally enabled | Leave unset/disabled for an independent API process. Use only `local` or `legacy` when deliberately opting into embedded ingestion. |

### Replit-specific fallbacks to avoid as production assumptions

The current code still contains Replit fallbacks for some flows:

- `REPLIT_DEV_DOMAIN` can be used as a fallback for public URLs when `PUBLIC_BASE_URL` is missing.
- `REPLIT_CONNECTORS_HOSTNAME`, `REPL_IDENTITY` and `WEB_REPL_RENEWAL` can be used to discover Resend credentials when `RESEND_API_KEY` is missing.
- Object storage code currently constructs a Google Cloud Storage client using a Replit sidecar endpoint at `http://127.0.0.1:1106`.

For a backend-independent production deploy, do not treat those fallbacks as portable guarantees. Prefer explicit production variables (`PUBLIC_BASE_URL`, `RESEND_API_KEY`, storage configuration) or open a separate runtime issue for replacing Replit-coupled behavior.

## Deployment checklist

1. Build with `pnpm --filter @workspace/api-server run build`.
2. Package/runtime includes `artifacts/api-server/dist/index.mjs`, generated source maps if needed, copied `dist/migrations`, and runtime `node_modules` dependencies that were externalized by the build.
3. Configure required server-only variables: at minimum `PORT` and `DATABASE_URL`.
4. Configure production auth, public URL, email and object-storage variables according to the features enabled for the service.
5. Start with `pnpm --filter @workspace/api-server run start` or the equivalent service command that executes `node --enable-source-maps ./dist/index.mjs` from the API package context.
6. Check logs for `Server listening`, migration status and schema verification outcome.
7. Verify `GET /api/healthz` and `GET /api/healthz/migrations` through the same reverse proxy/load balancer path that users will hit.
8. Only then shift traffic from the previous backend target.

## Stop conditions

Stop the deploy and do not shift traffic when any of these occur:

- `PORT` is missing/invalid or the process exits before binding.
- `DATABASE_URL` is missing or database connection/migration startup fails.
- Startup logs report aborted, failed or pending migrations that cannot be resolved during the deploy window.
- `GET /api/healthz` does not return `status: "ok"` through the production route.
- `GET /api/healthz/migrations` does not return `status: "ok"`.
- Required production auth/email/storage/AI variables for enabled features are absent.
- The deployment depends on Replit-only fallbacks that are not available in the target backend runtime.
- CORS/base URL routing causes browser requests to hit an unintended origin or omit credentials required by authenticated flows.

## Rollback and triage

Rollback should be operationally conservative and document-based:

1. Stop traffic shift immediately or route traffic back to the previous known-good backend.
2. Preserve logs from startup, migration status, health checks and reverse proxy routing.
3. If migrations failed or remained pending, inspect the migration status reported by `/api/healthz/migrations` and the startup logs. Apply the repository-provided manual migration command only when the database state has been reviewed:

   ```bash
   pnpm --filter @workspace/db run migrate
   ```

4. Restart the API process after resolving database state, then repeat the health checks.
5. If object storage/email behavior fails only outside Replit, classify it as a portability blocker and open a separate runtime issue rather than patching it inside the deploy window.
6. Keep public communication factual and cautious: describe service availability, migration state, configuration gaps or source-monitoring limitations without implying wrongdoing or completeness beyond the data verified.

## Known blockers and follow-up candidates

No runtime changes were made for this runbook. The following are documented operational constraints, not solved by this docs-only scope:

- CORS is currently permissive/reflected for credentialed requests. A stricter production allow-list would require a code/config change outside #243 docs scope.
- Some public URL and email credential paths still have Replit fallbacks. Production deployments should prefer explicit variables, or a separate issue should remove those assumptions.
- Object storage currently depends on a Replit sidecar credential endpoint. If object storage must work in a non-Replit backend runtime, verify the target runtime has a compatible credential path or open a dedicated runtime/storage issue.
