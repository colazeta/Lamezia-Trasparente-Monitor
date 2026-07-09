# Cloudflare Pages production target

The public production target for the civic app is:

- https://lamezia-trasparente.pages.dev

Replit is not part of the production path for this repository.

## Expected Cloudflare Pages settings

Use these settings when the Cloudflare Pages project is connected to the GitHub repository:

- Production branch: `main`
- Build command: `pnpm install --frozen-lockfile && pnpm --filter @workspace/lamezia-trasparente run build`
- Build output directory: `artifacts/lamezia-trasparente/dist/public`
- Root directory: repository root, unless the dashboard separately supports the package directory without changing the output directory above
- Environment variable: `BASE_PATH=/`

The root `wrangler.toml` also declares `pages_build_output_dir = "artifacts/lamezia-trasparente/dist/public"` for Cloudflare Pages and Wrangler-based deployments. The dashboard settings must remain aligned with that path.

The Vite app also copies `artifacts/lamezia-trasparente/public/_redirects` and `artifacts/lamezia-trasparente/public/deploy-provenance.json` into the build output. Cloudflare Pages must publish that output directory so direct SPA routes such as `/contratti` are served by `index.html` without redirecting to `/`.

## Direct deployment workflow

The `Cloudflare Pages deploy` GitHub Actions workflow builds the static frontend, checks the generated fallback, checks the deploy provenance artifact, deploys `artifacts/lamezia-trasparente/dist/public` with Wrangler, then runs the public contracts smoke against `https://lamezia-trasparente.pages.dev`.

Configure these repository settings before relying on the direct deploy job:

- Secret: `CLOUDFLARE_API_TOKEN`
- Secret or variable: `CLOUDFLARE_ACCOUNT_ID`
- Optional variable: `CLOUDFLARE_PROJECT_NAME` (defaults to `lamezia-trasparente`)
- Optional variable: `PUBLIC_SITE_URL` (defaults to `https://lamezia-trasparente.pages.dev`)

Create the two required values in GitHub at `Settings -> Secrets and variables -> Actions`. Keep the API token as a secret. The account ID may be a secret or a repository variable because the workflow accepts both.

If the Cloudflare credentials are missing, the workflow fails before the deploy step and writes a short remediation checklist to the GitHub Actions step summary. A green `Cloudflare Pages deploy` run means the credentials were present, Wrangler attempted the production publish, and the live public contracts smoke passed.

The other workflows have different jobs:

- `CI` verifies install, typecheck, build and tests.
- `deploy smoke` builds locally and smoke-checks the currently configured public URL.
- `GitHub Pages static fallback` verifies the static fallback artifact.

Those workflows can be green while production Cloudflare deployment is still blocked. The deploy signal for `https://lamezia-trasparente.pages.dev` is the `Cloudflare Pages deploy` workflow.

After adding or fixing the credentials, rerun the failed `Cloudflare Pages deploy` workflow from GitHub Actions, or dispatch it manually on branch `main`.

## Deploy provenance marker

The public build includes `/deploy-provenance.json` with `deploymentContract = "public-routes-contracts-organi-v2"`. The public contracts smoke requires that marker before checking bundle strings. If `pages.dev` serves a new JavaScript asset but not this JSON marker, Cloudflare is publishing a source or output that is not the current `artifacts/lamezia-trasparente/dist/public` build.

## Contracts route smoke

After a deployment, the live URL must satisfy all checks:

- `https://lamezia-trasparente.pages.dev/deploy-provenance.json` exposes `public-routes-contracts-organi-v2`.
- `https://lamezia-trasparente.pages.dev/contratti` remains on `/contratti` when loaded directly.
- The generated JavaScript bundle contains the contract-state markers `Contratti protagonisti`, `Stato dei fascicoli contrattuali`, `Copertura fasi`, and `Copertura stato fasi dei fascicoli`.

The shared script `scripts/check-public-contracts-page.mjs` enforces this public smoke. The `deploy smoke` workflow and the direct Cloudflare deploy workflow both use it.
