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

The Vite app also copies `artifacts/lamezia-trasparente/public/_redirects` into the build output. Cloudflare Pages must publish that output directory so direct SPA routes such as `/contratti` are served by `index.html` without redirecting to `/`.

## Contracts route smoke

After a deployment, the live URL must satisfy both checks:

- `https://lamezia-trasparente.pages.dev/contratti` remains on `/contratti` when loaded directly.
- The generated JavaScript bundle contains the contract-state markers `Contratti protagonisti`, `Stato dei fascicoli contrattuali`, `Copertura fasi`, and `Copertura stato fasi dei fascicoli`.

The `deploy smoke` GitHub Actions workflow checks these markers against `https://lamezia-trasparente.pages.dev` by default. If it fails after a main push, the likely issue is Cloudflare Pages publishing an old build, a wrong output directory, or a deployment that did not include the `_redirects` file.
