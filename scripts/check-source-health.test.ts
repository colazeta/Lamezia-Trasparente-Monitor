import assert from "node:assert/strict";
import { test } from "node:test";
import {
  detectAnomalies,
  normalizePayload,
  renderIssueBody,
} from "./check-source-health";

test("normalizes source-health payload shapes and filters ok records", () => {
  const records = normalizePayload({
    sources: [
      { source: "albo", status: "ok" },
      {
        id: "determine",
        state: "stale",
        checkedAt: "2026-06-08T10:00:00.000Z",
      },
    ],
  });

  const anomalies = detectAnomalies(
    records,
    new Date("2026-06-08T11:00:00.000Z"),
  );

  assert.equal(anomalies.length, 1);
  assert.equal(anomalies[0]?.marker, "source-health:determine:stale");
  assert.equal(anomalies[0]?.lastCheckedAt, "2026-06-08T10:00:00.000Z");
});

test("requires warning persistence before creating a warning anomaly", () => {
  const records = normalizePayload({
    results: [
      { source: "warning-once", status: "warning", warningRuns: 1 },
      {
        source: "warning-persistent",
        status: "warning",
        consecutiveWarningRuns: 3,
      },
      { source: "warning-flag", status: "warning", persistent: true },
    ],
  });

  const anomalies = detectAnomalies(
    records,
    new Date("2026-06-08T11:00:00.000Z"),
    2,
  );

  assert.deepEqual(
    anomalies.map((anomaly) => anomaly.marker),
    [
      "source-health:warning-persistent:warning",
      "source-health:warning-flag:warning",
    ],
  );
});

test("renders cautious technical issue body with stable dedupe key", () => {
  const anomaly = detectAnomalies(
    [
      {
        source: "atti",
        status: "error",
        label: "Atti amministrativi",
        lastCheckedAt: "2026-06-08T12:00:00.000Z",
        reason: "HTTP 503 durante il controllo tecnico.",
      },
    ],
    new Date("2026-06-08T12:30:00.000Z"),
  )[0];

  assert.ok(anomaly);
  const body = renderIssueBody(anomaly);

  assert.match(body, /<!-- source-health:atti:error -->/);
  assert.match(
    body,
    /problema tecnico o operativo del monitoraggio automatico/,
  );
  assert.match(body, /Non indica una mancanza sostantiva degli atti pubblici/);
  assert.doesNotMatch(body, /corruzione|mafia|colpevole/i);
});
