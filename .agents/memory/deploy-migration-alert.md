---
name: Deploy migration alert
description: How/why the api-server actively alerts the team on a non-ok DB migration state after deploy
---
The api-server startup chain (`artifacts/api-server/src/index.ts`) calls
`alertMigrationProblem(...)` from `artifacts/api-server/src/lib/migrationStatus.ts`
whenever the database migration state is not "ok":
- `pending` — `runMigrations()` succeeded but `status.pendingTags` is non-empty.
- `aborted` — `runMigrations()` threw `MigrationError` (atomic batch, nothing applied).
- `failed`  — `runMigrations()` threw a non-`MigrationError`.

The alert reuses the existing Resend-backed `sendEmail` and sends to `OPS_ALERT_EMAIL`.
`buildMigrationAlertEmail` is a pure formatter (unit-tested) that names the detected
state and the affected migration tag(s), reusing the `MigrationStatus`/`MigrationError`
payload.

**Why:** the read-only `/api/healthz/migrations` endpoint + startup log line were passive;
a bad deploy only surfaced via misbehaving ingestion. The alert is active.

**How to apply:** `OPS_ALERT_EMAIL` is plain config (an address, not a secret). When it is
unset, or Resend isn't connected, the alert is logged and skipped — it never throws, so it
cannot disrupt startup. To actually receive emails in prod, set `OPS_ALERT_EMAIL` and connect Resend.
