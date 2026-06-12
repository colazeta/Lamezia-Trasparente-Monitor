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

test("returns a monitor read error when URL and audit path are required but not configured", async () => {
  const originalUrl = process.env.SOURCE_HEALTH_URL;
  const originalAuditPath = process.env.SOURCE_HEALTH_AUDIT_PATH;
  const originalSkip = process.env.SOURCE_HEALTH_SKIP_UNCONFIGURED;
  const originalFetch = globalThis.fetch;
  const fetchedUrls: string[] = [];

  process.env.SOURCE_HEALTH_URL = "   ";
  delete process.env.SOURCE_HEALTH_AUDIT_PATH;
  delete process.env.SOURCE_HEALTH_SKIP_UNCONFIGURED;
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

    for (const records of [envRecords, explicitBlankRecords]) {
      assert.equal(records.length, 1);
      assert.equal(records[0]?.source, "source-health-monitor");
      assert.equal(records[0]?.status, "error");
      assert.match(
        records[0]?.reason ?? "",
        /SOURCE_HEALTH_URL non configurato/,
      );
    }
    assert.deepEqual(
      detectAnomalies(
        envRecords,
        new Date("2026-06-09T08:00:00.000Z"),
      ).map((anomaly) => anomaly.marker),
      ["source-health:source-health-monitor:error"],
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
    if (originalSkip === undefined) {
      delete process.env.SOURCE_HEALTH_SKIP_UNCONFIGURED;
    } else {
      process.env.SOURCE_HEALTH_SKIP_UNCONFIGURED = originalSkip;
    }
  }

  assert.deepEqual(fetchedUrls, []);
});

test("skips source-health endpoint reads when the workflow endpoint is not configured", async () => {
  const originalUrl = process.env.SOURCE_HEALTH_URL;
  const originalAuditPath = process.env.SOURCE_HEALTH_AUDIT_PATH;
  const originalSkip = process.env.SOURCE_HEALTH_SKIP_UNCONFIGURED;
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;

  process.env.SOURCE_HEALTH_URL = "   ";
  delete process.env.SOURCE_HEALTH_AUDIT_PATH;
  process.env.SOURCE_HEALTH_SKIP_UNCONFIGURED = "true";
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("fetch should not be called");
  }) as typeof fetch;

  try {
    const records = await readSourceHealth(parseArgs([]));
    const anomalies = detectAnomalies(
      records,
      new Date("2026-06-09T08:00:00.000Z"),
    );

    assert.deepEqual(records, []);
    assert.deepEqual(anomalies, []);
    assert.equal(fetchCalls, 0);
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
    if (originalSkip === undefined) {
      delete process.env.SOURCE_HEALTH_SKIP_UNCONFIGURED;
    } else {
      process.env.SOURCE_HEALTH_SKIP_UNCONFIGURED = originalSkip;
    }
  }
});

test("normalizes blank audit paths before choosing the source-health reader", async () => {
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

  assert.deepEqual(fetchedUrls, [
    "https://monitor.example.test/sources",
    "https://monitor.example.test/sources",
  ]);
});

test("explicit URL arguments override configured audit paths", async () => {
  const originalAuditPath = process.env.SOURCE_HEALTH_AUDIT_PATH;
  const originalUrl = process.env.SOURCE_HEALTH_URL;
  const originalFetch = globalThis.fetch;
  const dir = await mkdtemp(join(tmpdir(), "source-health-"));
  const auditFile = join(dir, "audit.json");
  const fetchedUrls: string[] = [];

  await writeFile(
    auditFile,
    JSON.stringify({
      sources: [{ source: "audit-file", status: "error" }],
    }),
    "utf8",
  );

  process.env.SOURCE_HEALTH_AUDIT_PATH = auditFile;
  process.env.SOURCE_HEALTH_URL = "https://monitor.example.test/default";
  globalThis.fetch = (async (input: string | URL | Request) => {
    fetchedUrls.push(input.toString());
    return new Response(
      JSON.stringify({
        sources: [{ source: "manual-url", status: "ok" }],
      }),
      { status: 200 },
    );
  }) as typeof fetch;

  try {
    const options = parseArgs([
      "--url",
      "https://override.example.test/healthz/sources",
    ]);

    assert.equal(options.auditFile, undefined);
    assert.equal(options.url, "https://override.example.test/healthz/sources");
    const records = await readSourceHealth(options);

    assert.equal(records.length, 1);
    assert.equal(records[0]?.source, "manual-url");
    assert.equal(records[0]?.status, "ok");
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

  assert.deepEqual(fetchedUrls, [
    "https://override.example.test/healthz/sources",
  ]);
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
