# changedetection.io as a non-canonical change sentinel

## Status

PoC architecture only. No HTTP receiver, no changedetection.io deployment, no DB write and no canonical ingestion behavior are changed by this increment.

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
LT watch registry / idempotency gate
        ↓
canonical LT source identity
        ↓
existing canonical ingestor
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

The phase-1 notification contract permits only:

```json
{
  "schemaVersion": 1,
  "sentinel": "changedetection.io",
  "watchKey": "pnrr-index",
  "watchUrl": "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
  "notificationTimestamp": 1788343200
}
```

`diff`, `diff_full`, snapshots, screenshots, HTML and page text are intentionally rejected by the strict schema. They are not necessary to decide whether the canonical ingestor should run.

### Authentication

A future HTTP receiver must require a dedicated high-entropy secret header, separate from editor/auth/API credentials. The secret must live in the deployment secret manager, never in watch manifests, notification bodies, source control or logs.

changedetection.io supports custom notification headers through its Apprise notification URL syntax; the exact receiver URL/header will be introduced only when the endpoint exists.

### Replay / duplicate delivery

Accepted notifications produce a deterministic event ID from:

- provider;
- watch key;
- registry-owned canonical URL;
- notification timestamp in milliseconds.

The future receiver/queue must use that event ID as an idempotency key. Duplicate delivery must not create duplicate canonical work.

## Threat model

### SSRF / arbitrary fetch

Mitigation: webhook URLs are never fetch targets; registry lookup owns the canonical URL.

### Spoofed notification

Mitigation: dedicated secret header before event parsing/wiring. Unknown watch or URL mismatch fail closed.

### Payload abuse / content leakage

Mitigation: strict small schema; diff/snapshot/content fields rejected; request-body size limit at the future route.

### Replay / retry storms

Mitigation: deterministic event ID and durable idempotency before a production trigger is enabled.

### False positives

Likely sources include timestamps, rotating navigation, counters and template/layout changes. Initial PoC starts without aggressive include filters so substantive changes are not hidden. Noise is measured first; subtractive selectors may then be added conservatively.

### False negatives

Overly narrow CSS/XPath filters can hide substantive changes. The existing scheduled canonical ingestion remains active throughout the PoC and acts as the comparison/control path.

## Failure isolation

changedetection.io must never become required for ordinary ingestion.

- sentinel unavailable → existing scheduled ingestion continues;
- notification rejected → existing scheduled ingestion continues;
- duplicate notification → no additional canonical work;
- canonical ingestor fails → normal source-specific failure handling applies;
- sentinel detects no change → no claim that the source is complete or unchanged in an administrative/legal sense.

## Promotion phases

### Phase 1 — contract (this PR)

- pinned upstream/security metadata;
- approved watch manifest;
- strict notification parser;
- watchKey/URL registry validation;
- deterministic event ID;
- canonical trigger object with no execution.

### Phase 2 — authenticated receiver

Only after Phase 1 CI/review:

- internal route, disabled by default;
- secret-header authentication;
- bounded body;
- durable idempotency store;
- telemetry containing only watch key/source id/outcome, never page content;
- no direct publication action.

### Phase 3 — controlled canonical trigger

Map accepted source IDs to explicit existing ingestion functions. Start with `attuazione-pnrr-lamezia` only. Keep the normal scheduled ingestion enabled and compare results.

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
