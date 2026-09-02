# changedetection.io as a non-canonical change sentinel

## Status

The changedetection.io integration package is implemented behind independent fail-closed gates. The final closure gate uses the real pinned upstream image, its REST watch API, its Jinja notification renderer and its Apprise custom HTTP transport against the real LT authenticated receiver + Postgres ledger.

Upstream baseline:

- repository: `dgtlmoon/changedetection.io`;
- license: Apache-2.0;
- pinned version: `0.55.8`;
- minimum permitted version: `0.54.8`;
- REST API: `/api/v1/` with `x-api-key` authentication;
- notifications: custom HTTP targets through Apprise/Jinja;
- upstream notification variables used by LT: `watch_url`, `notification_timestamp`;
- custom header syntax used by LT: `+x-lt-sentinel-token=...`.

Do not use `latest`. Releases `<=0.54.7` are outside the permitted security floor.

## Architectural role

changedetection.io is a **sentinel**, never a source of record.

```text
approved external HTML page
        ↓
changedetection.io 0.55.8
        ↓
minimal authenticated event
        ↓
LT watch registry + receiver
        ↓
durable idempotency / queue ledger
        ↓
one-shot LT sentinel worker
        ↓
explicit existing canonical ingestor
        ↓
canonical content fingerprint before/after
```

The official upstream page and the content fetched by the LT ingestor remain canonical evidence. changedetection snapshots/diffs are neither stored in LT nor used to decide what content is canonical.

## First promoted watch

Only one watch is promoted:

- watch key: `pnrr-index`;
- canonical LT source: `attuazione-pnrr-lamezia`;
- canonical URL: `https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr`;
- fetch backend: `html_requests`;
- sentinel interval: 15 minutes;
- include filters: none initially.

No source URL is dynamically selected by a webhook. The canonical mapping is owned by the LT registry and the queue worker only dispatches this explicitly promoted source.

## Notification trust boundary

The accepted notification shape is intentionally tiny:

```json
{
  "schemaVersion": 1,
  "sentinel": "changedetection.io",
  "watchKey": "pnrr-index",
  "watchUrl": "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
  "notificationTimestamp": 1788343200
}
```

The real upstream watch is configured with Jinja variables `{{ watch_url }}` and `{{ notification_timestamp }}`. `diff`, `diff_full`, snapshots, screenshots, HTML and extracted page text are rejected by LT's strict schema and are never required by the integration.

The notification URL carries only the dedicated secret header through the upstream-supported Apprise `+header=value` syntax. The secret itself exists only in deployment/runtime configuration.

## Receiver

Endpoint:

```text
POST /api/internal/change-sentinel
```

It is hidden with `404` unless `CHANGE_SENTINEL_RECEIVER_ENABLED=true`.

When enabled:

1. a server-side secret of at least 32 characters must exist;
2. `x-lt-sentinel-token` is compared in constant time after fixed-size hashing;
3. request body is bounded to 4 KiB;
4. schema is strict and content-rich fields are rejected;
5. watchKey + URL must match the LT registry;
6. event timestamp must be within the allowed 48-hour / +5-minute window;
7. event is inserted into `change_sentinel_events` by deterministic primary-key event ID.

The receiver performs **no canonical fetch**.

## Durable queue / worker

A second independent feature flag controls canonical execution:

```text
CHANGE_SENTINEL_TRIGGER_ENABLED=true
```

The one-shot worker:

- does not import DB/canonical modules when disabled;
- claims at most one event per invocation;
- uses `FOR UPDATE SKIP LOCKED`;
- uses a 15-minute lease with stale-lease reclaim;
- permits at most 3 attempts;
- dispatches only `attuazione-pnrr-lamezia`;
- invokes the existing `runAttuazioneIngestion()` rather than introducing another fetcher/parser;
- stores bounded technical outcome metadata only.

The queue is deliberately at-least-once. A crash after canonical ingestion but before acknowledgement may cause a retry; the canonical ingestor is already source-ID/upsert based.

## Canonical material-change measurement

For every sentinel-driven PNRR crawl, LT fingerprints canonical project rows before and after ingestion. The fingerprint includes civic content fields and normalised attachments, while excluding operational fields such as DB IDs and first/last-seen timestamps.

The ledger stores only:

- canonical before hash;
- canonical after hash;
- `material_change` boolean;
- attempts/lease timestamps;
- technical error code where applicable.

This lets us measure changedetection false-positive signals against LT canonical data rather than against a visual/text diff.

## Idempotent upstream provisioning

`tools/changedetection/provision_watch.mjs`:

- requires upstream API base URL + API key;
- checks `/api/v1/systeminfo` and requires exactly `0.55.8`;
- lists existing watches;
- creates or updates the single PNRR watch;
- verifies the effective watch after provisioning;
- configures `html_requests`, 15-minute interval, minimal JSON body and secret header;
- refuses insecure non-loopback HTTP receiver URLs;
- never prints API key, webhook secret or notification target.

The provisioner may use the upstream native send-test endpoint with `--send-test`; this proves the actual Jinja/Apprise notification path without waiting for a real municipal-page change.

## Threat model / safeguards

### SSRF / arbitrary fetch

Webhook URLs are never fetch targets. The notification URL is only an integrity signal checked against the LT registry. Canonical work uses the pre-existing hard-coded LT source mapping.

### Spoofing

Dedicated secret header, constant-time comparison, strict registry lookup and timestamp bounds.

### Content leakage

4 KiB receiver budget, strict schema and no diff/snapshot/content persistence.

### Replay / retry storms

Deterministic event ID + DB primary key. Worker attempts are bounded to 3 with lease semantics.

### False positives

Initial watch avoids aggressive include filters. `material_change=false` provides the evidence needed to identify noise before selectors are tightened.

### False negatives

The pre-existing scheduled PNRR refresh remains active as the comparison/control path. No polling cadence is reduced by this integration package.

### Sentinel outage

The ordinary canonical scheduled ingestion continues independently.

## Packaged upstream smoke

`.github/workflows/changedetection-sentinel-smoke.yml` has **no schedule**. On relevant PR changes/manual dispatch it starts:

1. PostgreSQL;
2. the real LT API receiver with migrations;
3. `dgtlmoon/changedetection.io:0.55.8`;
4. the idempotent provisioner twice;
5. the upstream native test-notification path.

It verifies one durable LT event in receiver-only state and explicitly leaves the canonical trigger disabled. This proves the pinned upstream API/configuration, Jinja variables, Apprise header, LT auth/schema and DB idempotency boundary without making the smoke dependent on the live municipal page.

Queue→canonical dispatch, retry and fingerprint semantics remain covered by the normal CI/worker tests.

## Definition of complete

The **integration package** is complete when, on one reviewed head:

- general CI is green;
- hook / zero-cost gates are green;
- the pinned upstream smoke is green;
- provisioning is idempotent;
- receiver and trigger remain disabled by default;
- scheduled PNRR polling remains unchanged.

After that, the remaining work is operational evaluation rather than integration engineering: run the sentinel in a chosen environment, collect real latency/noise/material-change evidence, and only then decide whether any polling cadence should change or additional HTML sources should be promoted.
