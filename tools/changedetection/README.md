# changedetection.io sentinel integration

changedetection.io is integrated as a **non-canonical change sentinel** for selected Lamezia Trasparente HTML sources. It never replaces the official page, canonical LT fetcher/parser or publication pipeline.

## Pinned upstream

Use exactly:

```text
dgtlmoon/changedetection.io:0.55.8
```

Security floor: `>=0.54.8`. Do not use `latest` and do not deploy releases `<=0.54.7`.

Upstream license: Apache-2.0.

The provisioning tool also checks `/api/v1/systeminfo` and refuses to configure an instance whose reported version is not exactly `0.55.8`.

## Integrated flow

```text
approved external HTML page
        ↓
changedetection.io 0.55.8
        ↓
minimal signed/authenticated event
        ↓
LT receiver (disabled by default)
        ↓
durable event-id ledger / queue
        ↓
LT sentinel worker (independent flag)
        ↓
existing canonical ingestor
        ↓
canonical fingerprint before/after
```

The only promoted source is currently:

```text
watchKey: pnrr-index
canonicalSourceId: attuazione-pnrr-lamezia
URL: https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr
fetch backend: html_requests
interval: 15 minutes
```

The existing scheduled PNRR refresh remains enabled as the comparison/control path. No existing polling cadence is reduced by this integration.

## Receiver and trigger flags

Two independent switches are required:

```text
CHANGE_SENTINEL_RECEIVER_ENABLED=true
CHANGE_SENTINEL_TRIGGER_ENABLED=true
```

Receiver-only observation is therefore possible without authorising a sentinel-driven canonical crawl.

The receiver requires a dedicated secret:

```text
CHANGE_SENTINEL_WEBHOOK_TOKEN=<high-entropy secret, >=32 chars>
```

It expects that value in `x-lt-sentinel-token`. Secrets belong only in deployment secret managers / changedetection runtime configuration and must never be committed or logged.

## Idempotent watch provisioning

Configure the reviewed watch through the upstream API using:

```bash
CHANGEDETECTION_BASE_URL=https://sentinel.example.org \
CHANGEDETECTION_API_KEY=... \
CHANGE_SENTINEL_RECEIVER_URL=https://api.example.org/api/internal/change-sentinel \
CHANGE_SENTINEL_WEBHOOK_TOKEN=... \
node tools/changedetection/provision_watch.mjs
```

The provisioner:

- verifies upstream version `0.55.8`;
- lists existing watches;
- creates or updates one matching the LT PNRR watch identity;
- sets `html_requests` and 15-minute cadence;
- configures a minimal JSON body using real upstream Jinja variables `watch_url` and `notification_timestamp`;
- configures the Apprise custom HTTP header `+x-lt-sentinel-token`;
- reads the watch back and verifies its effective configuration;
- never prints the API key, webhook token or notification URL.

A receiver URL must use HTTPS. Plain HTTP is accepted only for explicit loopback smoke tests with `CHANGE_SENTINEL_ALLOW_INSECURE_LOCAL=true`.

## Notification body

The provisioner configures only:

```jinja
{
  "schemaVersion": 1,
  "sentinel": "changedetection.io",
  "watchKey": "pnrr-index",
  "watchUrl": "{{ watch_url }}",
  "notificationTimestamp": {{ notification_timestamp }}
}
```

Do **not** add `diff`, `diff_full`, snapshots, screenshots, HTML or extracted text. The LT receiver uses the URL only to verify it matches its own registry; it never uses webhook data as a fetch target.

## Optional upstream test notification

After provisioning, an operator can exercise the real changedetection notification renderer without waiting for a source change:

```bash
node tools/changedetection/provision_watch.mjs --send-test
```

This calls the upstream native test-notification endpoint for the provisioned watch. The command still emits no secret or page content.

## Local isolated upstream instance

For local inspection only:

```bash
docker run -d \
  --restart unless-stopped \
  --name lt-changedetection-poc \
  -p 127.0.0.1:5000:5000 \
  -v lt-changedetection-poc:/datastore \
  dgtlmoon/changedetection.io:0.55.8
```

Do not expose such an instance publicly without a deployment/security review.

## Packaged smoke

`.github/workflows/changedetection-sentinel-smoke.yml` is deliberately unscheduled. It starts:

1. PostgreSQL;
2. the real LT API receiver with migrations;
3. the pinned upstream Docker image `0.55.8`;
4. idempotent watch provisioning twice;
5. the actual upstream `send-test` notification path.

It then verifies that LT has exactly one durable `received` event for `attuazione-pnrr-lamezia`, with zero canonical work executed. This exercises the actual Jinja body, Apprise custom header, receiver authentication, strict event contract and DB idempotency boundary without depending on a live change to the municipal page.

The queue→canonical PNRR path remains independently covered by the normal TypeScript/worker CI, including source allowlisting, leases, retries and material-change fingerprints.

## What remains an operational decision

Integration completeness does **not** imply that the sentinel should replace scheduled polling. Before changing cadence, collect real observations for:

- notification latency;
- `material_change=true/false` rate;
- duplicate notifications;
- retry/failure rate;
- changedetection CPU/memory footprint;
- missed changes compared with the existing scheduled control path.

Additional watches should be promoted only where these measurements show a clear benefit. Structured feeds/APIs should continue to use their native canonical polling when that is already cheap and reliable.
