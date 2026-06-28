import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  buildDiscoveryReport,
  discoverOfficialAnacSource,
  type DiscoveryCandidate,
  type ManifestSourceForDiscovery,
  type SourceDiscoveryProbe,
} from "./discoverOfficialAnacSource";

const fixturesDir = fileURLToPath(
  new URL(
    "../../artifacts/lamezia-trasparente/src/test/fixtures/contracts/source-discovery/",
    import.meta.url,
  ),
);

const source: ManifestSourceForDiscovery = {
  id: "anac-open-data-cig-annual",
  label: "ANAC open data CIG annual datasets",
  authority: "ANAC",
  official_url: null,
  ingestion_status: "not_implemented",
  public_claim_level: "fixture_only",
};

const candidate: DiscoveryCandidate = {
  source_id: source.id,
  landing_page_url: "https://dati.anticorruzione.it/opendata/",
  package_search_url:
    "https://dati.anticorruzione.it/opendata/api/3/action/package_search?q=CIG",
  checked_by: "codex",
  freshness_label: "annual",
  version_hint: null,
  notes: [
    "Fixture metadata-only: richiede comunque verifica manuale prima di pubblicare record.",
  ],
  next_parser_action:
    "Verificare endpoint ufficiale stabile e schema prima del parser reale.",
};

const tempDirs: string[] = [];

afterEach(async () => {
  while (tempDirs.length > 0) {
    const tempDir = tempDirs.pop();
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
});

describe("official ANAC source discovery spike", () => {
  it("marks metadata-only structured resources as verified and parser-ready, without records", async () => {
    const packageProbe = await readProbeFixture(
      "successful-metadata-discovery.json",
    );
    const report = buildDiscoveryReport({
      source,
      candidate,
      probes: [landingProbe(), packageProbe],
      checkedAt: "2026-06-27T20:50:00.000Z",
    });

    expect(report).toMatchObject({
      source_id: source.id,
      verification_result: "verified",
      detected_format: "zip",
      suitable_for_parser: true,
      production_records_written: false,
      public_app_data_written: false,
      sample_file_url:
        "https://dati.anticorruzione.it/opendata/download/anac-cig-annual-metadata-fixture.zip",
    });
    expect(JSON.stringify(report)).not.toMatch(
      /"records"|"amount"|"operator"|"cup"|"cig":"|"supplier"/i,
    );
  });

  it("keeps gateway-rejected metadata as manual verification, not ingestion", async () => {
    const packageProbe = await readProbeFixture(
      "manual-verification-response.json",
    );
    const report = buildDiscoveryReport({
      source,
      candidate,
      probes: [landingProbe(), packageProbe],
      checkedAt: "2026-06-27T20:50:00.000Z",
    });

    expect(report.verification_result).toBe("needs_manual_verification");
    expect(report.suitable_for_parser).toBe(false);
    expect(report.discovery_metadata.discovery_status).toBe(
      "needs_manual_verification",
    );
    expect(report.discovery_metadata.package_url).toBeNull();
    expect(report.limitations.join(" ")).toMatch(
      /manualmente|gateway|Nessun record ANAC reale/i,
    );
    expect(report.next_parser_action).toContain("Verificare endpoint");
  });

  it("records unavailable metadata separately from parser readiness", async () => {
    const packageProbe = await readProbeFixture(
      "unavailable-source-response.json",
    );
    const report = buildDiscoveryReport({
      source,
      candidate,
      probes: [landingProbe(), packageProbe],
      checkedAt: "2026-06-27T20:50:00.000Z",
    });

    expect(report.verification_result).toBe("unavailable");
    expect(report.suitable_for_parser).toBe(false);
    expect(report.discovery_metadata.discovery_status).toBe("unavailable");
    expect(report.limitations.join(" ")).toContain("HTTP 404");
  });

  it("writes reports only to an interim discovery directory", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "anac-source-discovery-"));
    tempDirs.push(tempDir);
    const packageProbe = await readProbeFixture(
      "manual-verification-response.json",
    );

    const result = await discoverOfficialAnacSource(source.id, {
      reportDir: tempDir,
      now: new Date("2026-06-27T20:50:00.000Z"),
      probeUrl: async (url, request) =>
        request.method === "HEAD" ? landingProbe(url) : packageProbe,
    });
    const written = JSON.parse(await readFile(result.reportPath, "utf8")) as {
      source_id: string;
      public_app_data_written: boolean;
      production_records_written: boolean;
    };

    expect(result.reportPath.startsWith(tempDir)).toBe(true);
    expect(written).toMatchObject({
      source_id: source.id,
      public_app_data_written: false,
      production_records_written: false,
    });
  });

  it("rejects public app directories as discovery report targets", async () => {
    await expect(
      discoverOfficialAnacSource(source.id, {
        reportDir: "artifacts/lamezia-trasparente/public/source-discovery",
        probeUrl: async (url, request) =>
          request.method === "HEAD" ? landingProbe(url) : landingProbe(url),
      }),
    ).rejects.toThrow("Discovery reports must stay out of public app data");
  });
});

async function readProbeFixture(
  fileName: string,
): Promise<SourceDiscoveryProbe> {
  const payload = JSON.parse(
    await readFile(join(fixturesDir, fileName), "utf8"),
  ) as { probe: SourceDiscoveryProbe };

  return payload.probe;
}

function landingProbe(url = candidate.landing_page_url): SourceDiscoveryProbe {
  return {
    url: url ?? "https://dati.anticorruzione.it/opendata/",
    method: "HEAD",
    ok: true,
    status: 200,
    content_type: "text/html; charset=UTF-8",
    content_length: 269,
    detected_format: "html",
  };
}
