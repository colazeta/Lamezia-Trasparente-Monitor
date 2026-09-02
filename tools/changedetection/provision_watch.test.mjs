import assert from "node:assert/strict";
import test from "node:test";
import {
  buildNotificationBody,
  buildNotificationUrl,
  CANONICAL_URL,
  CHECK_INTERVAL_MINUTES,
  desiredWatchConfig,
  EXPECTED_CHANGEDETECTION_VERSION,
  WATCH_KEY,
} from "./provision_watch.mjs";

const TOKEN = "sentinel-test-token-0123456789-abcdef";

test("provisioner pins reviewed upstream and canonical LT watch identity", () => {
  assert.equal(EXPECTED_CHANGEDETECTION_VERSION, "0.55.8");
  assert.equal(WATCH_KEY, "pnrr-index");
  assert.equal(
    CANONICAL_URL,
    "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
  );
});

test("notification body is minimal JSON and does not include diff or snapshot tokens", () => {
  const body = buildNotificationBody();
  assert.match(body, /"schemaVersion": 1/u);
  assert.match(body, /"watchKey": "pnrr-index"/u);
  assert.ok(body.includes("{{ watch_url }}"));
  assert.ok(body.includes("{{ notification_timestamp }}"));
  assert.doesNotMatch(body, /diff|snapshot|html|screenshot/iu);
});

test("production receiver becomes a secure posts Apprise URL with only the secret header", () => {
  const value = buildNotificationUrl(
    "https://api.example.org/api/internal/change-sentinel",
    TOKEN,
  );
  assert.match(value, /^posts:\/\/api\.example\.org\/api\/internal\/change-sentinel\?/u);
  assert.match(value, /\+x-lt-sentinel-token=/u);
  assert.ok(value.includes(encodeURIComponent(TOKEN)));
  assert.doesNotMatch(value, /watch_url|diff|snapshot/u);
});

test("plain HTTP receiver is permitted only for explicit loopback smoke", () => {
  assert.throws(
    () =>
      buildNotificationUrl(
        "http://127.0.0.1:5050/api/internal/change-sentinel",
        TOKEN,
      ),
    /HTTPS/u,
  );
  const local = buildNotificationUrl(
    "http://127.0.0.1:5050/api/internal/change-sentinel",
    TOKEN,
    { allowInsecureLocal: true },
  );
  assert.match(local, /^post:\/\/127\.0\.0\.1:5050\//u);
});

test("receiver URL cannot smuggle credentials, query parameters or fragments", () => {
  for (const url of [
    "https://user:pass@example.org/api/internal/change-sentinel",
    "https://example.org/api/internal/change-sentinel?next=https://evil.example",
    "https://example.org/api/internal/change-sentinel#fragment",
  ]) {
    assert.throws(() => buildNotificationUrl(url, TOKEN));
  }
});

test("desired watch remains requests-only, 15-minute and content-minimised", () => {
  const notificationUrl = buildNotificationUrl(
    "https://api.example.org/api/internal/change-sentinel",
    TOKEN,
  );
  const desired = desiredWatchConfig(notificationUrl);
  assert.equal(desired.url, CANONICAL_URL);
  assert.equal(desired.fetch_backend, "html_requests");
  assert.equal(desired.time_between_check_use_default, false);
  assert.equal(desired.time_between_check.minutes, CHECK_INTERVAL_MINUTES);
  assert.deepEqual(desired.notification_urls, [notificationUrl]);
  assert.equal(desired.notification_format, "text");
});
