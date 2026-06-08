import { describe, expect, it } from "vitest";
import { auditSources, type SourceStatusRow } from "./sourceAudit";
import type { MonitoredSource } from "./sourceRegistry";

const now = new Date("2026-06-08T12:00:00.000Z");

const registry: MonitoredSource[] = [
  {
    source: "critical-feed",
    label: "Critical feed",
    kind: "crawl",
    priority: "critical",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 360,
    completenessRule: "Verifica tecnica del feed critico.",
    requiredSignals: ["itemsTotal"],
  },
  {
    source: "medium-mapping",
    label: "Medium mapping",
    kind: "mapping",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule: "Verifica tecnica del mapping.",
  },
];

function row(overrides: Partial<SourceStatusRow> = {}): SourceStatusRow {
  return {
    source: "critical-feed",
    label: "Critical feed",
    status: "ok",
    error: null,
    itemsTotal: 4,
    itemsNew: 1,
    lastCheckedAt: new Date("2026-06-08T11:00:00.000Z"),
    lastUpdatedAt: new Date("2026-06-08T11:00:00.000Z"),
    ...overrides,
  };
}

describe("auditSources", () => {
  it("marks a registered source without feed_status as missing", () => {
    const audit = auditSources([registry[0]], [], now);

    expect(audit.sources[0]).toMatchObject({
      source: "critical-feed",
      status: "missing",
      completenessScore: 0,
    });
    expect(audit.status).toBe("error");
    expect(audit.summary.missing).toBe(1);
  });

  it("marks an old lastCheckedAt as stale", () => {
    const audit = auditSources(
      [registry[0]],
      [row({ lastCheckedAt: new Date("2026-06-08T04:00:00.000Z") })],
      now,
    );

    expect(audit.sources[0]).toMatchObject({
      status: "stale",
      freshnessMinutes: 480,
      completenessScore: 0.4,
    });
    expect(audit.status).toBe("error");
  });

  it("keeps technical errors distinct from stale or warning states", () => {
    const audit = auditSources(
      [registry[0]],
      [row({ status: "error", error: "HTTP 500", itemsTotal: 0 })],
      now,
    );

    expect(audit.sources[0]).toMatchObject({
      status: "error",
      error: "HTTP 500",
      completenessScore: 0.2,
    });
    expect(audit.sources[0].findings).toContain(
      "Ultimo controllo registrato come errore tecnico.",
    );
  });

  it("marks a recent source with expected signals as ok", () => {
    const audit = auditSources([registry[0]], [row()], now);

    expect(audit.sources[0]).toMatchObject({
      status: "ok",
      freshnessMinutes: 60,
      itemsTotal: 4,
      itemsNew: 1,
      completenessScore: 1,
    });
    expect(audit.status).toBe("ok");
  });

  it("marks a recent source with zero required items as warning", () => {
    const audit = auditSources(
      [registry[0]],
      [row({ itemsTotal: 0, itemsNew: 0 })],
      now,
    );

    expect(audit.sources[0]).toMatchObject({
      status: "warning",
      completenessScore: 0.7,
    });
    expect(audit.status).toBe("warning");
  });

  it("aggregates critical or high stale/error/missing sources as global error", () => {
    const audit = auditSources(
      registry,
      [
        row({ status: "error", error: "Fetch failed" }),
        row({
          source: "medium-mapping",
          label: "Medium mapping",
          status: "ok",
          itemsTotal: 0,
          itemsNew: 0,
        }),
      ],
      now,
    );

    expect(audit.summary.criticalOpen).toBe(1);
    expect(audit.status).toBe("error");
  });
});
