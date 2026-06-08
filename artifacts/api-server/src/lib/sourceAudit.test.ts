import { describe, expect, it } from "vitest";
import { auditSources, type FeedStatusAuditRow } from "./sourceAudit";
import type { MonitoredSource } from "./sourceRegistry";

const now = new Date("2026-06-08T12:00:00.000Z");

const baseSource: MonitoredSource = {
  source: "test-critical",
  label: "Fonte test critica",
  kind: "crawl",
  priority: "critical",
  expectedCadenceMinutes: 180,
  staleAfterMinutes: 240,
  completenessRule:
    "Regola operativa per testare freshness e segnali tecnici, senza claim di completezza assoluta.",
  requiredSignals: ["itemsTotal"],
};

function statusRow(
  overrides: Partial<FeedStatusAuditRow> = {},
): FeedStatusAuditRow {
  return {
    source: baseSource.source,
    status: "ok",
    error: null,
    itemsTotal: 3,
    itemsNew: 1,
    lastCheckedAt: new Date("2026-06-08T11:30:00.000Z"),
    lastUpdatedAt: new Date("2026-06-08T11:30:00.000Z"),
    ...overrides,
  };
}

describe("auditSources", () => {
  it("marks a registry source without feed_status row as missing", () => {
    const audit = auditSources([baseSource], [], now);

    expect(audit.sources[0]).toMatchObject({
      source: baseSource.source,
      status: "missing",
      completenessScore: 0,
      lastCheckedAt: null,
      itemsTotal: null,
    });
    expect(audit.summary.missing).toBe(1);
    expect(audit.status).toBe("error");
  });

  it("marks an old lastCheckedAt as stale", () => {
    const audit = auditSources(
      [baseSource],
      [statusRow({ lastCheckedAt: new Date("2026-06-08T07:30:00.000Z") })],
      now,
    );

    expect(audit.sources[0]).toMatchObject({
      status: "stale",
      freshnessMinutes: 270,
      completenessScore: 0.4,
    });
    expect(audit.summary.stale).toBe(1);
  });

  it("keeps technical errors distinct from stale and missing states", () => {
    const audit = auditSources(
      [baseSource],
      [
        statusRow({
          status: "error",
          error: "Fetch failed with status 500",
          lastCheckedAt: new Date("2026-06-08T11:55:00.000Z"),
        }),
      ],
      now,
    );

    expect(audit.sources[0]).toMatchObject({
      status: "error",
      error: "Fetch failed with status 500",
      freshnessMinutes: 5,
      completenessScore: 0.2,
    });
    expect(audit.summary.error).toBe(1);
  });

  it("marks a recent source with expected signals as ok", () => {
    const audit = auditSources([baseSource], [statusRow()], now);

    expect(audit.sources[0]).toMatchObject({
      status: "ok",
      freshnessMinutes: 30,
      itemsTotal: 3,
      itemsNew: 1,
      completenessScore: 1,
    });
    expect(audit.summary.ok).toBe(1);
    expect(audit.status).toBe("ok");
  });

  it("returns aggregate error when a critical or high source is open", () => {
    const lowSource: MonitoredSource = {
      ...baseSource,
      source: "test-low",
      label: "Fonte test bassa priorità",
      priority: "low",
    };
    const highSource: MonitoredSource = {
      ...baseSource,
      source: "test-high",
      label: "Fonte test alta priorità",
      priority: "high",
    };

    const audit = auditSources(
      [lowSource, highSource],
      [
        statusRow({ source: "test-low" }),
        statusRow({
          source: "test-high",
          status: "error",
          error: "Timeout operativo",
        }),
      ],
      now,
    );

    expect(audit.status).toBe("error");
    expect(audit.summary).toMatchObject({
      total: 2,
      ok: 1,
      error: 1,
      criticalOpen: 1,
    });
  });

  it("marks zero-row required signals as an operational warning", () => {
    const audit = auditSources(
      [baseSource],
      [statusRow({ itemsTotal: 0, itemsNew: 0 })],
      now,
    );

    expect(audit.sources[0]).toMatchObject({
      status: "warning",
      completenessScore: 0.7,
    });
    expect(audit.status).toBe("warning");
  });
});
