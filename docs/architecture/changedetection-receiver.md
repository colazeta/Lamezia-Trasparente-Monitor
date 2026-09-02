# changedetection.io authenticated receiver

## Status

Phase 2 receiver for the changedetection.io sentinel. The route is present in the API bundle but **hidden by default** and performs no canonical ingestion.

## Endpoint

```text
POST /api/internal/change-sentinel
```

When `CHANGE_SENTINEL_RECEIVER_ENABLED` is not exactly `true`, the endpoint returns `404` and records nothing.

## Required configuration

Only the API deployment intended to receive sentinel callbacks should set:

```text
CHANGE_SENTINEL_RECEIVER_ENABLED=true
CHANGE_SENTINEL_WEBHOOK_TOKEN=<high-entropy secret, at least 32 characters>
```

The changedetection.io notification must send the same secret in:

```text
x-lt-sentinel-token: <secret>
```

The token belongs in the deployment secret manager. Do not put it in the watch manifest, notification JSON, repository, screenshots or logs.

If the receiver is enabled but the token is missing/too short, it fails closed with `503`.

## Processing order

1. receiver feature flag;
2. server-side token configuration;
3. constant-time secret comparison;
4. 4 KiB receiver payload budget;
5. strict phase-1 notification schema;
6. LT watchKey/canonical URL registry match;
7. event timestamp window (maximum 5 minutes in the future, 48 hours old);
8. durable idempotency insert keyed by event SHA-256.

The route never calls `fetch()`, changedetection.io APIs or an LT canonical ingestor.

## Persistence

`change_sentinel_events` stores only:

- deterministic event ID;
- provider;
- LT watch key;
- LT canonical source ID;
- upstream-observed timestamp;
- receiver timestamp;
- technical state (`received`).

It does **not** store the notification URL, page diff, snapshot, HTML, screenshot, extracted text or canonical page content.

The event ID is the primary key. Duplicate delivery therefore becomes a durable idempotent `200 {"status":"duplicate"}` rather than another work item. A first accepted delivery returns `202 {"status":"accepted"}`.

## Failure behavior

- receiver disabled → `404`;
- bad/missing token → `401`;
- invalid server token configuration → `503`;
- payload over 4 KiB → `413`;
- schema/watch/URL/timestamp rejection → `400`;
- durable store unavailable → `503` so the sender may retry;
- duplicate → `200`;
- newly persisted valid event → `202`.

None of these outcomes changes the existing scheduled canonical ingestion.

## Explicit non-goals

This phase does not:

- run `runAttuazioneIngestion`;
- queue canonical work;
- modify `runIngestionCycle()`;
- alter the normal three-hour ingestion schedule;
- fetch a webhook-provided URL;
- deploy or provision changedetection.io;
- publish sentinel data to the frontend or public API.

## Next gate

After CI/migration review, Phase 3 may add a controlled mapping from the single source `attuazione-pnrr-lamezia` to its existing canonical ingestion function. That trigger should be worker/queue-oriented rather than a long crawl executed synchronously inside the webhook response, and the existing scheduled ingestion must remain enabled as the control path during the benchmark.
