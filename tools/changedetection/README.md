# changedetection.io sentinel PoC

This directory documents how to evaluate changedetection.io as a **non-canonical sentinel** for Lamezia Trasparente. The first PR does not deploy or start the service and does not expose a webhook receiver.

## Version and security floor

Use exactly:

```text
dgtlmoon/changedetection.io:0.55.8
```

Do not use `latest`. Do not use versions below `0.54.8`.

Upstream license: Apache-2.0.

## Local isolated instance

For an operator-run local PoC, bind the UI/API only to loopback and use a persistent local volume:

```bash
docker run -d \
  --restart unless-stopped \
  --name lt-changedetection-poc \
  -p 127.0.0.1:5000:5000 \
  -v lt-changedetection-poc:/datastore \
  dgtlmoon/changedetection.io:0.55.8
```

Do not expose this PoC instance publicly without an explicit deployment/security review.

## First watch

Create only the reviewed PNRR index watch:

```text
watchKey: pnrr-index
URL: https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr
fetch backend: html_requests
proposed interval: 15 minutes
```

Start without include filters. This deliberately favors false positives over false negatives while we establish what parts of the municipal page are volatile. Add subtractive selectors later only from measured noise.

The corresponding canonical LT source is already `attuazione-pnrr-lamezia`; changedetection.io never replaces that ingestor.

## Minimal notification body

When the future authenticated receiver exists, configure the watch notification body as minimal JSON:

```jinja
{
  "schemaVersion": 1,
  "sentinel": "changedetection.io",
  "watchKey": "pnrr-index",
  "watchUrl": {{ watch_url | tojson }},
  "notificationTimestamp": {{ notification_timestamp | tojson }}
}
```

Do **not** add `diff`, `diff_full`, `current_snapshot`, `prev_snapshot`, screenshots, page HTML or extracted text.

changedetection.io notifications support HTTP POST targets and custom headers via Apprise. The receiver URL and secret header are intentionally not specified in this PoC because no endpoint has been promoted yet.

## API management

The upstream REST API is available under `/api/v1/` and uses `x-api-key` authentication when API access is configured. Any future watch provisioning automation should use an API key supplied from the deployment secret manager; never commit it to this repository.

Watch provisioning should be idempotent by LT `watchKey`, and should verify the upstream URL/config after creation rather than assuming a successful POST means the intended watch exists.

## What the PoC validates

The current repository-side contract validates:

- strict minimal payload;
- HTTPS-only watch URL;
- approved `watchKey`;
- exact match between notification URL and LT registry URL;
- deterministic event ID for retries;
- canonical trigger identity owned by LT, not the webhook;
- rejection of diff/snapshot content.

It performs no network call and invokes no ingestor.

## Next gate

After CI/review, introduce an authenticated, disabled-by-default receiver and durable idempotency. Only then wire the single PNRR watch to the existing canonical PNRR ingestion function and benchmark latency/false positives against the existing scheduled cycle.
