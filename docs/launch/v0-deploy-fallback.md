# v0 deploy fallback readiness

Refs #362. Refs #341.

This checklist defines a provider-neutral readiness gate for publishing a cautious v0 when the final hosting target, live API, worker schedule or live data refresh are not yet confirmed. It is documentation-only: it does not choose a hosting provider, publish real environment values, add workflows, change routing, modify sitemap/robots, introduce endpoints or change civic copy in the application.

## Definition of a publishable v0

A v0 is publishable only when a non-specialist visitor can open a public URL or a verifiable static bundle and understand which operating mode is being shown.

The page or site must not imply complete live civic coverage when live data, workers, API routes or source checks are incomplete. It must show sources, limits and verification status before asking users to trust the output.

## Operating modes

### Live mode

Use this mode only when the public URL, frontend build, API path, health/readiness checks and source status are all verified for the current deployment.

### Static-fallback mode

Use this mode when the frontend is publishable but live API, scheduled worker, source refresh or final hosting are not yet stable. Static fallback is acceptable for v0 if the page explicitly marks demo, fixture or snapshot data and explains what is not live.

### Temporary-status-page mode

Use this mode only if the app shell or routing is blocked but a public placeholder is needed. It must link to the repository or release notes and avoid presenting any demo data as current civic information.

## Minimum checks before public sharing

- Public URL opens without authentication.
- `VITE_PUBLIC_SITE_URL` matches the URL users will receive.
- `BASE_PATH` is documented when the site is served below a subpath.
- API base URL or API-disabled mode is explicit.
- Static assets load from the same deployed path.
- SPA fallback or 404 handling does not hide routing failures.
- The first public screen states whether the data is live, fixture, snapshot or unavailable.
- Sources and limits are visible before or next to the civic output.

## Static fallback requirements

A static v0 is acceptable only when all these conditions are true:

1. the build artefact can be opened locally or from a public static host;
2. the UI does not require a successful live backend call for the first civic output;
3. demo or fixture records are marked in user-facing copy;
4. no claim suggests official completeness, legal validation or institutional endorsement;
5. source links, missing fields and verification timestamps can be shown as absent, partial or unverified;
6. the deploy notes say what must change before live mode.

## Fixture, demo and snapshot declarations

Use these declarations consistently:

- **Fixture/demo**: data exists only to show the shape of the page; it is not civic information.
- **Snapshot**: data was captured at a stated time and may be stale.
- **Live**: data comes from a current endpoint or source check and has a visible timestamp.
- **Unavailable**: data is not present or the source could not be checked.

## Manual readiness checklist

Record the result before asking for a human go/no-go decision:

- URL tested:
- Commit or PR tested:
- Mode: live / static-fallback / temporary-status-page
- Build command:
- Build result:
- Route tested:
- Source/limits banner visible: yes / no
- Demo or fixture declaration visible: yes / no / not applicable
- Health/readiness endpoint tested: yes / no / not applicable
- API disabled mode clear to users: yes / no / not applicable
- Known limitation shown to users:
- Rollback path:
- Owner of next decision:

## Go criteria

A cautious v0 can be shared when:

- one civic output is visible or an explicit status page explains why it is not;
- the operating mode is clear;
- sources, limits and verification status are visible;
- no sensitive privacy/legal/editorial claim is introduced without review;
- build or static bundle is reproducible from documented commands;
- rollback or replacement path is documented.

## No-go criteria

Do not share the v0 as public output when:

- the page cannot be opened from the advertised URL;
- the route depends on an unavailable backend without a static fallback;
- fixture data appears to be real data;
- source limitations are hidden;
- canonical URL, base path or routing are misleading;
- user-facing copy implies official endorsement, fault, illegality or completeness without evidence.

## Rollback or fallback steps

1. Replace live link with static-fallback link or temporary status page.
2. State the disabled component: API, worker, live data, source checks or final domain.
3. Keep the last known safe artefact or commit identifier.
4. Preserve the public explanation of limits and mode.
5. Open or update the Human Decision Ledger with the required human decision.

## Human digest notes

When handing off #362, include:

- public URL or artefact path tested;
- commit/PR used;
- operating mode;
- whether API/worker/source refresh are active, disabled or unverified;
- fixture/demo/snapshot declarations shown to users;
- manual health/readiness result and timestamp;
- residual limitations, owner and next decision;
- explicit note that this checklist does not choose the final hosting provider or replace #248 if a human deployment decision is still required.
