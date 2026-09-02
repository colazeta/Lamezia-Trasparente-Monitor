# changedetection.io canonical trigger worker

## Status

Phase 3 introduces a separate one-shot worker that may consume **one** durable sentinel event and run the already-existing canonical PNRR ingestion function. It is disabled by default and is not invoked from the HTTP receiver.

## Activation

The worker is a separate ingestion-worker entrypoint:

```bash
CHANGE_SENTINEL_TRIGGER_ENABLED=true \
DATABASE_URL=... \
pnpm --filter @workspace/ingestion-worker run start:sentinel
```

With `CHANGE_SENTINEL_TRIGGER_ENABLED` unset/false, the bundled worker exits successfully **without importing the DB/queue modules and without requiring `DATABASE_URL`**.

The receiver and trigger have independent feature flags:

```text
CHANGE_SENTINEL_RECEIVER_ENABLED
CHANGE_SENTINEL_TRIGGER_ENABLED
```

This allows receiver-only observation before any sentinel-driven canonical fetch is authorised.

## Queue semantics

`change_sentinel_events` is both the idempotency ledger and a minimal durable queue.

States:

- `received`: authenticated event is available to a worker;
- `processing`: one worker owns a 15-minute lease;
- `processed`: canonical ingestion completed;
- `failed`: non-retryable source or retry budget exhausted.

The claim transaction uses `FOR UPDATE SKIP LOCKED`, so concurrent workers do not intentionally claim the same row. A stale `processing` lease becomes claimable again after 15 minutes.

Maximum canonical attempts per event: **3**.

A process crash after canonical ingestion but before final acknowledgement may lead to an at-least-once retry. This is acceptable because the existing PNRR ingestor is source-ID/upsert based. The queue never assumes exactly-once network execution.

## Promotion boundary

Only one canonical source is currently executable:

```text
attuazione-pnrr-lamezia
```

The mapping is hard-coded to the existing `runAttuazioneIngestion()` function. Any other `canonicalSourceId` is marked `source-not-promoted` and no fetch occurs.

There is no dynamic function name, URL dispatch, plugin lookup or webhook-controlled source selection.

## Material-change measurement

Before and after the PNRR ingestion, the worker fingerprints canonical project rows using only civic content fields:

- source ID / source URL;
- title and PNRR classification fields;
- implementing bodies;
- CUP / financed amount / status;
- start/end/publication dates;
- attachment title+URL set.

Operational DB fields such as surrogate ID, `firstSeenAt` and `lastSeenAt` are excluded. Attachment ordering is normalised.

The ledger stores:

- `canonical_before_hash`;
- `canonical_after_hash`;
- `material_change` boolean;
- attempt/lease timestamps;
- a bounded technical error code when needed.

It does not store changedetection diffs or canonical page content.

This creates the benchmark we need before changing polling policy: a sentinel event with `material_change=false` is a false-positive signal for canonical-data purposes.

## Failure and retry

Canonical ingestion error:

- attempts 1–2 → event returns to `received` with `canonical-ingestion-failed`;
- attempt 3 → `failed`.

Unpromoted source → immediate `failed` with `source-not-promoted`.

Worker failure never disables the existing scheduled PNRR refresh.

## Scheduling policy

This phase intentionally does **not** add a new cron or GitHub Actions schedule. The existing canonical PNRR refresh remains the control path.

The next gate should first run controlled sentinel events and inspect:

- receiver→queue latency;
- queue→canonical-run latency under the chosen deployment scheduler;
- `material_change` rate;
- retry rate;
- duplicate delivery rate;
- resources used by changedetection plus the trigger worker.

Only after that evidence should the sentinel worker receive a recurring schedule or replace/reduce any existing polling frequency.
