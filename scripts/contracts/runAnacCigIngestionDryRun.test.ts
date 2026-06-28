import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runAnacCigIngestionDryRun } from "./runAnacCigIngestionDryRun";

const fixturePath = fileURLToPath(
  new URL(
    "../../artifacts/lamezia-trasparente/src/test/fixtures/contracts/anac/anac-cig-fixture.json",
    import.meta.url,
  ),
);

const discoveryReportPath = fileURLToPath(
  new URL(
    "../../data/interim/contracts/source-discovery/anac-open-data-cig-annual.discovery.json",
    import.meta.url,
  ),
);

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0)
      .map((tempDir) => rm(tempDir, { recursive: true, force: true })),
  );
});

describe("ANAC CIG ingestion dry-run pipeline", () => {
  it("runs the fixture parser end to end and writes only a gated report", async () => {
    const reportDir = await makeTempDir();
    const result = await runAnacCigIngestionDryRun({
      fixturePath,
      discoveryReportPath,
      reportDir,
      generatedAt: "2026-06-28T09:00:00.000Z",
    });

    expect(result.report).toMatchObject({
      schema_version: "contracts-anac-cig-ingestion-dry-run.v1",
      source_id: "anac-open-data-cig-annual",
      mode: "fixture_only",
      parser_version: "anac-cig-fixture-v0",
      discovery_verification_result: "needs_manual_verification",
      discovery_suitable_for_parser: false,
      production_gate_status: "blocked_by_source_discovery",
      production_ingestion_allowed: false,
      production_records_written: false,
      public_app_data_written: false,
      database_writes: false,
      fixture_records_total: 6,
      parser_results: {
        parsed: 4,
        needs_review: 2,
        skipped: 0,
        failed: 0,
      },
    });
    expect(result.report.limitations.join(" ")).toMatch(
      /nessun record ANAC reale|verificare manualmente/i,
    );

    const persisted = JSON.parse(await readFile(result.reportPath, "utf8"));
    expect(persisted).toEqual(result.report);
  });

  it("does not let a dry-run report target public app directories", async () => {
    await expect(
      runAnacCigIngestionDryRun({
        fixturePath,
        discoveryReportPath,
        reportDir: resolve("artifacts/lamezia-trasparente/public/contracts"),
      }),
    ).rejects.toThrow(/public app or source data directory/i);
  });

  it("keeps production ingestion blocked when the discovery report is missing", async () => {
    const reportDir = await makeTempDir();
    const missingDiscoveryReportPath = join(
      reportDir,
      "missing.discovery.json",
    );
    const result = await runAnacCigIngestionDryRun({
      fixturePath,
      discoveryReportPath: missingDiscoveryReportPath,
      reportDir,
    });

    expect(result.report.discovery_verification_result).toBe("missing");
    expect(result.report.production_gate_status).toBe(
      "blocked_missing_discovery_report",
    );
    expect(result.report.production_ingestion_allowed).toBe(false);
    expect(result.report.next_action).toMatch(/discovery ufficiale ANAC/i);
  });

  it("inherits parser safety and rejects remote fixture URLs", async () => {
    const reportDir = await makeTempDir();

    await expect(
      runAnacCigIngestionDryRun({
        fixturePath: "https://example.test/anac-cig.json",
        discoveryReportPath,
        reportDir,
      }),
    ).rejects.toThrow(/local fixture files only/i);
  });
});

async function makeTempDir(): Promise<string> {
  const tempDir = await mkdtemp(join(tmpdir(), "anac-cig-dry-run-"));
  tempDirs.push(tempDir);
  return tempDir;
}
