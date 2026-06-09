import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  detectAnomalies,
  normalizePayload,
  parseArgs,
  readSourceHealth,
  renderIssueBody,
  shouldUpdateExistingIssue,
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

test("skips source-health reads when URL and audit path are not configured", async () => {
  const originalUrl = process.env.SOURCE_HEALTH_URL;
  const originalAuditPath = process.env.SOURCE_HEALTH_AUDIT_PATH;
  const originalFetch = globalThis.fetch;
  const fetchedUrls: string[] = [];

  process.env.SOURCE_HEALTH_URL = "   ";
  delete process.env.SOURCE_HEALTH_AUDIT_PATH;
  globalThis.fetch = (async (input: string | URL | Request) => {
    fetchedUrls.push(input.toString());
    return new Response(JSON.stringify({ sources: [] }), {
      headers: { "content-type": "application/json" },
      status: 200,
    });
  }) as typeof fetch;

  try {
    const envRecords = await readSourceHealth(parseArgs([]));
    const explicitBlankRecords = await readSourceHealth(
      parseArgs(["--url", "\t  "]),
    );

    assert.deepEqual(envRecords, []);
    assert.deepEqual(explicitBlankRecords, []);
    assert.deepEqual(
      detectAnomalies(envRecords, new Date("2026-06-09T08:00:00.000Z")),
      [],
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) {
      delete process.env.SOURCE_HEALTH_URL;
    } else {
      process.env.SOURCE_HEALTH_URL = originalUrl;
    }
    if (originalAuditPath === undefined) {
      delete process.env.SOURCE_HEALTH_AUDIT_PATH;
    } else {
      process.env.SOURCE_HEALTH_AUDIT_PATH = originalAuditPath;
    }
  }

  assert.deepEqual(fetchedUrls, []);
});

test("normalizes blank audit paths before choosing configured endpoints", async () => {
  const originalAuditPath = process.env.SOURCE_HEALTH_AUDIT_PATH;
  const originalUrl = process.env.SOURCE_HEALTH_URL;
  const originalFetch = globalThis.fetch;
  const fetchedUrls: string[] = [];

  process.env.SOURCE_HEALTH_AUDIT_PATH = "  \n  ";
  process.env.SOURCE_HEALTH_URL = "https://monitor.example.test/sources";
  globalThis.fetch = (async (input: string | URL | Request) => {
    fetchedUrls.push(input.toString());
    return new Response(JSON.stringify({ sources: [] }), { status: 200 });
  }) as typeof fetch;

  try {
    const recordsFromEnv = await readSourceHealth(parseArgs([]));
    const recordsFromBlankAudit = await readSourceHealth(
      parseArgs(["--audit-file", "   "]),
    );

    assert.deepEqual(recordsFromEnv, []);
    assert.deepEqual(recordsFromBlankAudit, []);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalAuditPath === undefined) {
      delete process.env.SOURCE_HEALTH_AUDIT_PATH;
    } else {
      process.env.SOURCE_HEALTH_AUDIT_PATH = originalAuditPath;
    }
    if (originalUrl === undefined) {
      delete process.env.SOURCE_HEALTH_URL;
    } else {
      process.env.SOURCE_HEALTH_URL = originalUrl;
    }
  }

  assert.deepEqual(fetchedUrls, ["https://monitor.example.test/sources"]);
});

test("classifies unreachable endpoints separately from invalid JSON", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = (async () => {
      throw new Error("network down");
    }) as typeof fetch;

    const unreachableRecords = await readSourceHealth({
      url: "https://monitor.example.test/sources",
      dryRun: true,
      warningRunsThreshold: 2,
    });
    assert.match(
      unreachableRecords[0]?.reason ?? "",
      /configurato ma non raggiungibile/,
    );

    globalThis.fetch = (async () =>
      new Response("{ not json", { status: 200 })) as typeof fetch;

    const invalidJsonRecords = await readSourceHealth({
      url: "https://monitor.example.test/sources",
      dryRun: true,
      warningRunsThreshold: 2,
    });
    assert.match(
      invalidJsonRecords[0]?.reason ?? "",
      /raggiunto ma risposta JSON non valida/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("turns predictable audit read failures into monitor anomalies", async () => {
  const dir = await mkdtemp(join(tmpdir(), "source-health-"));
  const auditFile = join(dir, "broken.json");
  await writeFile(auditFile, "{ not-json", "utf8");

  const records = await readSourceHealth({
    auditFile,
    dryRun: true,
    warningRunsThreshold: 2,
  });
  const anomalies = detectAnomalies(
    records,
    new Date("2026-06-08T13:00:00.000Z"),
  );

  assert.equal(anomalies.length, 1);
  assert.equal(
    anomalies[0]?.marker,
    "source-health:source-health-monitor:error",
  );
  assert.match(anomalies[0]?.reason ?? "", /JSON non valido/);
});

test("does not update an existing issue only for volatile timestamps", () => {
  const original = detectAnomalies(
    [
      {
        source: "albo",
        status: "stale",
        label: "Albo pretorio",
        lastCheckedAt: "2026-06-08T10:00:00.000Z",
        lastSuccessAt: "2026-06-08T08:00:00.000Z",
      },
    ],
    new Date("2026-06-08T11:00:00.000Z"),
  )[0];
  const next = detectAnomalies(
    [
      {
        source: "albo",
        status: "stale",
        label: "Albo pretorio",
        lastCheckedAt: "2026-06-08T13:00:00.000Z",
        lastSuccessAt: "2026-06-08T12:00:00.000Z",
      },
    ],
    new Date("2026-06-08T14:00:00.000Z"),
  )[0];

  assert.ok(original);
  assert.ok(next);
  assert.equal(
    shouldUpdateExistingIssue(
      { title: original.title, body: renderIssueBody(original) },
      next,
    ),
    false,
  );
});

test("updates an existing issue when a substantive detail changes", () => {
  const original = detectAnomalies(
    [
      {
        source: "albo",
        status: "stale",
        label: "Albo pretorio",
        reason: "Prima soglia tecnica superata.",
      },
    ],
    new Date("2026-06-08T11:00:00.000Z"),
  )[0];
  const next = detectAnomalies(
    [
      {
        source: "albo",
        status: "stale",
        label: "Albo pretorio",
        reason: "Seconda soglia tecnica superata.",
      },
    ],
    new Date("2026-06-08T14:00:00.000Z"),
  )[0];

  assert.ok(original);
  assert.ok(next);
  assert.equal(
    shouldUpdateExistingIssue(
      { title: original.title, body: renderIssueBody(original) },
      next,
    ),
    true,
  );
});
