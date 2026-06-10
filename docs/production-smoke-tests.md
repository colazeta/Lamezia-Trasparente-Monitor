# Production validation and smoke tests v0

Issue: #249. Epic: #238.

This v0 is a reviewable, dry-run-oriented checklist for validating a production release of Lamezia Trasparente Monitor. It is intentionally limited to documentation plus a TypeScript plan helper. It does **not** probe live services, introduce providers or secrets, change deployment workflows, run ingestion, or mutate storage.

## Principles and guardrails

- Treat this as a pre-cutover and validation-window checklist, not as evidence about the underlying administrative content.
- Use cautious language when recording findings: `indicator`, `signal`, `data gap`, `monitoring need`, `transparency issue`, `verification required`.
- Do not infer wrongdoing, intent, responsibility, corruption, favouritism or infiltration from smoke-test outcomes.
- Do not print secrets, provider credentials, signed URLs, cookies or authorization headers in notes, screenshots or logs.
- Do not upload, overwrite, delete or list private storage objects.
- Do not start scheduled workers, ingestion pipelines or source-health probes as part of this checklist.
- If a check would require production credentials, provider-console access, DNS changes, workflow edits, database migrations or generated client changes, stop and open a follow-up instead.

## Preconditions

Before starting any production validation window, confirm:

1. The candidate commit SHA and branch are known and match the reviewed PR.
2. The frontend build has already completed in the expected deployment path or can be rebuilt locally from the same revision.
3. The API contract remains the reviewed OpenAPI contract; this checklist does not alter it.
4. The operator has read-only access to public URLs only, unless an existing deployment process separately grants access.
5. Rollback owner, escalation contact and time window are known.
6. Any screenshots or notes redact operational details that are not already public.

## Environment and configuration to verify

The dry-run helper accepts only non-secret configuration indicators. Values are never printed; the helper reports only `set` or `missing`.

| Variable                  | Required for dry-run? | Used for                                      | Notes                                                                         |
| ------------------------- | --------------------- | --------------------------------------------- | ----------------------------------------------------------------------------- |
| `API_BASE_URL`            | No                    | Future approved read-only API smoke execution | Must be a public base URL if used by a human/operator. Do not include tokens. |
| `PUBLIC_BASE_URL`         | No                    | Future approved public page validation        | Must be a public frontend base URL if used by a human/operator.               |
| `PUBLIC_STORAGE_BASE_URL` | No                    | Public file-link sanity notes                 | Public link base only; no bucket secrets or signed write URLs.                |
| `WORKER_STATUS_REFERENCE` | No                    | Pointer to existing one-shot/status evidence  | A public or internal reference label is enough; do not include credentials.   |

Safe commands:

```bash
pnpm --dir scripts exec tsx production-smoke-plan.ts
pnpm --dir scripts exec node --import tsx --test ./production-smoke-plan.test.ts
pnpm --dir scripts run test
pnpm run typecheck
pnpm run build
git diff --check
```

The helper command renders the plan and validates that the plan remains deterministic, categorized and secret-free. It does not call endpoints.

## Smoke checklist

| Order | Category                             | Check                                                                                                                                                                              | Pass criteria                                                                                                    | If failing                                                                                     |
| ----- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 01    | Frontend static build / public pages | Confirm the reviewed frontend build can be produced and tied to the candidate revision.                                                                                            | Build exits with code 0 and the artifact/release identifier is recorded.                                         | Stop promotion; inspect build logs and keep the previous release active.                       |
| 02    | Frontend static build / public pages | Confirm key public page shells are included: `/`, `/albo`, `/contratti`, `/bandi`, `/beni-confiscati`, `/fonti-dati`, `/stato-monitoraggio`.                                       | Routes are present in the reviewed frontend and remain readable in local/staging review.                         | Record the missing route as a release blocker or follow-up, depending on severity.             |
| 03    | API health                           | During an approved validation window only, check `GET /api/healthz` against the configured API base.                                                                               | HTTP 200 JSON with a `status` field; no credential is required or logged.                                        | Escalate to the API/deploy owner; keep rollback available.                                     |
| 04    | Public API read-only                 | During an approved validation window only, sample bounded read-only endpoints: `/api/publications`, `/api/contracts`, `/api/bandi`, `/api/beni-confiscati`, `/api/stats/overview`. | Each sampled endpoint returns HTTP 200 JSON or a documented empty state.                                         | Record endpoint, status code and non-secret response summary; avoid repeated probing.          |
| 05    | Worker one-shot/status               | Verify existing one-shot execution evidence or feed-status/status output without enabling a scheduler.                                                                             | Evidence is recent enough for the release window, or a clear data gap is documented.                             | Do not start schedulers; escalate to the worker owner with the missing evidence.               |
| 06    | Storage/public file links            | Sample existing public file/document links rendered by the app; do not upload or delete.                                                                                           | Sampled public links resolve or have documented source limitations.                                              | Record broken link examples without secrets; escalate to storage/deploy owner.                 |
| 07    | Key data pages                       | During approved human validation, inspect `/albo`, `/contratti`, `/bandi`, `/beni-confiscati`, `/accesso-civico`, `/performance`, `/legalita`, `/fonti-dati`.                      | Pages render with accessible headings, cautious explanatory copy and source/limitation context where applicable. | Stop if pages fail to render; otherwise document the data gap or monitoring need as follow-up. |

## Pass/fail recording template

Use this minimal template in PR or release notes:

```text
Production smoke validation for <commit SHA> on <date/time UTC>

- Frontend build/artifact: pass|fail|not run — <non-secret note>
- Public page shells: pass|fail|not run — <non-secret note>
- API health /api/healthz: pass|fail|not run — <non-secret note>
- Public API read-only sample: pass|fail|not run — <non-secret note>
- Worker one-shot/status evidence: pass|fail|not run — <non-secret note>
- Storage/public link sanity: pass|fail|not run — <non-secret note>
- Key data pages: pass|fail|not run — <non-secret note>

Rollback/escalation used: yes|no — <owner or follow-up issue>
Residual limitations: <data gap, monitoring need, verification required>
```

## Rollback and escalation minimum

- If frontend build or routing fails, keep or restore the previous frontend deployment and open a release-blocking follow-up.
- If API health fails, pause promotion and escalate to the API/deploy owner with timestamp, commit SHA and non-secret logs.
- If public API read-only checks fail, avoid repeated live probing; capture one bounded example and escalate.
- If worker status evidence is missing, do not start scheduled jobs as a workaround; request a separate one-shot/status follow-up.
- If storage links require credentials or write access, stop the storage check and request a provider-specific follow-up.
- If key data pages render but show a data gap, record it as a transparency or monitoring need rather than an allegation.

## Dry-run helper

The helper in `scripts/production-smoke-plan.ts` exports a typed ordered plan and a validator. It checks that:

- required categories are present;
- check IDs are deterministic and ordered;
- no check requires a hardcoded live URL;
- no secret-like environment variable is requested;
- failure reasons are readable;
- environment values are summarized only as `set` or `missing`.

Run it before a validation window to confirm the checklist is coherent. Live execution, provider configuration and deployment automation remain out of scope for this v0.
