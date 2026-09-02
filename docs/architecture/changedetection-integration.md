# changedetection.io as a non-canonical change sentinel

## Status

Phase 1 contract/registry is merged. Phase 2 adds an authenticated, disabled-by-default receiver with durable idempotency, while still performing **no canonical ingestion** from the webhook request.

Upstream evaluated on 2026-09-02:

- repository: `dgtlmoon/changedetection.io`;
- license: Apache-2.0;
- pinned PoC version: `0.55.8`;
- minimum permitted version: `0.54.8`;
- upstream API: `/api/v1/` with API-key authentication for watch management;
- notifications: custom HTTP POST/PUT targets through Apprise/Jinja templates.

Do not use `latest`. Versions `<=0.54.7` are outside the permitted security floor.

## Architectural role

changedetection.io is a **sentinel**, not a source of record.

It may answer:

> Has a previously approved web resource materially changed since the last check?

It must not answer:

- what canonical content should be stored;
- which URL Lamezia Trasparente should fetch;
- whether a record should be inserted/updated/deleted;
- what a diff means administratively;
- whether a change is anomalous, risky or suspicious.

The intended flow is:

```text
approved external page
        ↓
changedetection.io watch
        ↓
minimal authenticated change event
        ↓
LT watch registry / durable idempotency gate
        ↓
canonical LT source identity
        ↓
(existing canonical ingestor — Phase 3 only)
        ↓
existing content hash / dedupe / normalisation / publication
```

The official upstream page and the content acquired by the existing LT ingestor remain canonical evidence.

## First PoC watch

The first watch is deliberately attached to an existing HTML ingestor:

- watch key: `pnrr-index`;
- LT source: `attuazione-pnrr-lamezia`;
- canonical URL: `https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr`;
- changedetection fetcher: `html_requests`;
- proposed PoC cadence: 15 minutes.

The canonical PNRR crawler already owns parsing and project discovery. The sentinel can therefore be evaluated without creating any new ingestion semantics.

## Trust boundary

### Registry-owned URL

The notification includes the watched URL only as an integrity signal. Lamezia Trasparente resolves `watchKey` against its own manifest and returns the registry-owned canonical URL.

A webhook URL must **never** be passed to `fetch()`, a browser, object storage or a canonical ingestor.

Known watch + URL mismatch = fail closed.

### Minimal payload

The notification contract permits only:

```json
{
  "schemaVersion": 1,
  "sentinel": "changedetection.io",
  "watchKey": "pnrr-index",
  "watchUrl": "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
  "notificationTimestamp": 1788343200
}
```

`diff`, `diff_full`, snapshots, screenshots, HTML and page text are intentionally rejected by the strict schema. They are not necessary to decide whether canonical work may be requested.

### Authentication

Phase 2 receiver:

```text
POST /api/internal/change-sentinel
```

It is hidden with `404` unless `CHANGE_SENTINEL_RECEIVER_ENABLED=true`. When enabled it requires a dedicated secret in `CHANGE_SENTINEL_WEBHOOK_TOKEN` and the matching `x-lt-sentinel-token` request header. Token comparison is performed after hashing to fixed-size buffers and using constant-time comparison.

The secret must live in the deployment secret manager, never in watch manifests, notification bodies, source control or logs.

### Replay / duplicate delivery

Accepted notifications produce a deterministic event ID from:

- provider;
- watch key;
- registry-owned canonical URL;
- notification timestamp in milliseconds.

`change_sentinel_events.event_id` is the primary key. Duplicate delivery is therefore durable and idempotent across process restarts.

The ledger stores only event/source/watch/timestamps/state metadata. It does not store webhook URL, diff, snapshot, HTML or text.

## Threat model

### SSRF / arbitrary fetch

Mitigation: webhook URLs are never fetch targets; registry lookup owns the canonical URL. Phase 2 has no fetch or ingestion dependency at all.

### Spoofed notification

Mitigation: dedicated secret header before semantic event acceptance. Unknown watch or URL mismatch fail closed.

### Payload abuse / content leakage

Mitigation: strict schema, 4 KiB receiver budget, diff/snapshot/content fields rejected, no content persistence.

### Replay / retry storms

Mitigation: deterministic event ID plus DB primary-key idempotency. Notifications older than 48 hours or more than 5 minutes in the future are rejected.

### False positives

Likely sources include timestamps, rotating navigation, counters and template/layout changes. Initial PoC starts without aggressive include filters so substantive changes are not hidden. Noise is measured first; subtractive selectors may then be added conservatively.

### False negatives

Overly narrow CSS/XPath filters can hide substantive changes. The existing scheduled canonical ingestion remains active throughout the PoC and acts as the comparison/control path.

## Failure isolation

changedetection.io must never become required for ordinary ingestion.

- sentinel unavailable → existing scheduled ingestion continues;
- receiver disabled/rejected → existing scheduled ingestion continues;
- duplicate notification → no duplicate ledger entry and no canonical work;
- receiver DB unavailable → `503`, sender may retry, scheduled ingestion continues;
- sentinel detects no change → no claim that the source is complete or unchanged in an administrative/legal sense.

## Promotion phases

### Phase 1 — contract / registry — complete

- pinned upstream/security metadata;
- approved watch manifest;
- strict notification parser;
- watchKey/URL registry validation;
- deterministic event ID;
- canonical trigger object with no execution.

### Phase 2 — authenticated receiver — current

- internal route, disabled by default;
- dedicated secret-header authentication;
- bounded body and timestamp window;
- durable idempotency store;
- telemetry containing only watch key/source id/outcome, never page content;
- no canonical ingestion action.

### Phase 3 — controlled canonical trigger

Map accepted source IDs to explicit existing ingestion functions. Start with `attuazione-pnrr-lamezia` only. Prefer worker/queue execution rather than running a long crawl synchronously inside the webhook request. Keep the normal scheduled ingestion enabled and compare results.

### Phase 4 — broader watch set

Promote additional sources only where the sentinel demonstrates meaningful latency/cost benefit. Structured feeds/APIs should not be added mechanically when normal polling is already cheap and reliable.

## PoC evaluation

For each real change, compare sentinel + canonical ingestion against the existing scheduled path:

1. time from upstream change to sentinel event;
2. time from event to canonical ingestion result;
3. duplicate event rate;
4. false-positive rate (sentinel fired but canonical content identity did not materially change);
5. missed-change rate compared with scheduled canonical polling;
6. request/CPU/memory footprint;
7. behavior when the sentinel is offline.

Promotion requires a real latency or operational benefit without weakening source provenance, canonical hashing, ingestion reliability or privacy/minimisation.

See `docs/architecture/changedetection-receiver.md` for the Phase 2 operational contract.
