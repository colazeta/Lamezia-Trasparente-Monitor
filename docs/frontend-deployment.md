# Frontend deployment preparation (React/Vite)

Issue linkage: #242, under the infrastructure track #238.

This note documents the current provider-neutral path for deploying the public React/Vite frontend as a separate static web service. It is intentionally documentation-only: it records commands, build output and environment assumptions already visible in the repository without changing runtime code, routing, metadata, generated API clients, database schema, GitHub Actions, package scripts or provider configuration.

## Scope and service boundaries

- Frontend package: `artifacts/lamezia-trasparente/package.json` (`@workspace/lamezia-trasparente`).
- Vite configuration: `artifacts/lamezia-trasparente/vite.config.ts`.
- Static build output: `artifacts/lamezia-trasparente/dist/public`.
- API contract source of truth: `lib/api-spec/openapi.yaml`.

Deploy the frontend as static assets only. The frontend service should not run database migrations, ingestion jobs or server-only API logic.

Keep these deploy units separate:

1. **Static frontend service**: builds `@workspace/lamezia-trasparente` and serves `artifacts/lamezia-trasparente/dist/public`.
2. **API server service**: builds and runs `@workspace/api-server`; see `docs/backend-deployment.md` for the Express API process, `PORT`, `DATABASE_URL`, migrations and health checks.
3. **Ingestion worker service**: runs `@workspace/ingestion-worker` on a schedule or job runner; it is not part of the static frontend deploy.

Do not place API server secrets, database credentials or ingestion credentials in the static frontend environment.

## Build and validation commands

Use `pnpm`, not `npm` or `yarn`.

Targeted frontend checks from the repository root:

```bash
pnpm --filter @workspace/lamezia-trasparente run typecheck
pnpm --filter @workspace/lamezia-trasparente run build
```

Repository-level checks before a production deploy:

```bash
pnpm run typecheck
pnpm run build
```

The frontend package scripts currently used by those commands are:

- `typecheck`: `tsc -p tsconfig.json --noEmit`
- `build`: `vite build --config vite.config.ts`
- `serve`: `vite preview --config vite.config.ts --host 0.0.0.0`

After `pnpm --filter @workspace/lamezia-trasparente run build`, verify that the deploy artifact directory exists and contains the generated Vite assets:

```bash
test -d artifacts/lamezia-trasparente/dist/public
find artifacts/lamezia-trasparente/dist/public -maxdepth 2 -type f | sort | head
```

## Provider-neutral static hosting settings

The frontend can be configured on static hosting providers such as Cloudflare Pages, Netlify or Vercel as equivalent targets. This note does not select or require a provider.

Use these settings unless a future provider-specific deploy file intentionally overrides them:

| Setting | Value |
| --- | --- |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm --filter @workspace/lamezia-trasparente run build` |
| Publish/output directory | `artifacts/lamezia-trasparente/dist/public` |
| Framework preset | Vite/React/static site, if the provider asks |
| Node package manager | `pnpm` |

For single-page app history fallback, configure the hosting provider to serve `index.html` for frontend routes that do not match a real static file. Keep API paths routed to the separate API server instead of the static fallback.

## Public frontend configuration

Only expose values that are safe to embed in browser-delivered JavaScript. Vite variables prefixed with `VITE_` are public at build time.

Known frontend/public configuration points in the current repo:

| Variable | Required when | Notes |
| --- | --- | --- |
| `BASE_PATH` | The frontend is hosted below a subpath instead of `/` | Read by Vite config and emitted as `import.meta.env.BASE_URL`. Defaults to `/`. Use this only for the static asset/router base path, not for API routing. |
| `PORT` | Local `vite dev` or `vite preview` needs a non-default port | Read by Vite dev/preview config. Defaults to `8081`. Static hosting providers usually ignore this for published assets. |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk-backed browser sign-in/editor flows are enabled | Public Clerk publishable key consumed by the React app. Do not substitute server secrets. |
| `VITE_CLERK_PROXY_URL` | Clerk is routed through a configured proxy | Optional public proxy URL consumed by the React app. |

Current frontend API calls use repository conventions such as `/api` and `/api/public/v1`. In a split deployment, decide at the edge/proxy layer how those paths reach the separate API server. Do not hard-code a provider-specific API origin in this note unless a future issue chooses that architecture and documents the migration path.

## Pre-deploy checklist

Before publishing a frontend build:

- Confirm the target branch and commit are intended for the frontend deploy.
- Run `git diff --check` for whitespace and patch hygiene.
- Run the targeted frontend typecheck and build commands.
- Run the root `pnpm run typecheck` and `pnpm run build` checks when the deploy candidate should represent the full monorepo state.
- Confirm `artifacts/lamezia-trasparente/dist/public` exists after the build and is the provider publish directory.
- Confirm the static host has no server-only secrets such as `DATABASE_URL` or ingestion credentials.
- Confirm any public Clerk values are publishable/browser-safe values.
- Confirm `/api` and `/api/public/v1` requests are routed to the separate API service, not swallowed by the SPA fallback.
- Confirm the API service health and migration checks separately, following `docs/backend-deployment.md`.
- Confirm ingestion jobs are scheduled and monitored separately from the frontend deploy when ingestion is in scope.

## Residual decisions and non-goals

This note deliberately leaves provider selection, automatic deployment wiring, production domain names, CDN/cache policy, API edge routing details and secret provisioning as operational decisions for follow-up work. It does not introduce new dependencies, scripts, workflows or runtime behavior.
