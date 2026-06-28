import { describe, expect, it } from "vitest";

import {
  CONTRACT_SOURCE_LIFECYCLE_PHASES,
  CONTRACT_SOURCE_MANUAL_VERIFICATION_LIMIT,
  contractsSourceManifest,
  getContractSourceById,
  listIngestionReadySources,
  listSourcesByIdentifier,
  listSourcesByLifecyclePhase,
  summariseSourceManifest,
  validateContractSourceManifest,
} from "./contractsSourceManifest";

describe("contracts source manifest", () => {
  it("loads the official source-family manifest", () => {
    expect(contractsSourceManifest.schema_version).toBe(
      "contracts-source-manifest.v1",
    );
    expect(contractsSourceManifest.sources.length).toBeGreaterThanOrEqual(11);
    expect(contractsSourceManifest.sources.map((source) => source.id)).toEqual(
      expect.arrayContaining([
        "anac-bdncp-pcp",
        "anac-pvl",
        "anac-open-data-cig-annual",
        "anac-open-data-cig-delta",
        "anac-open-data-aggiudicazioni",
        "anac-ocds-bdncp",
        "opencup",
        "mop-monitoraggio-opere-pubbliche",
        "comune-lamezia-albo-pretorio",
        "comune-lamezia-amministrazione-trasparente",
        "lmt-local-derived-contract-data",
      ]),
    );
  });

  it("requires identity, authority and status fields for every source", () => {
    for (const source of contractsSourceManifest.sources) {
      expect(source.id.trim()).not.toBe("");
      expect(source.label.trim()).not.toBe("");
      expect(source.authority.trim()).not.toBe("");
      expect(source.ingestion_status.trim()).not.toBe("");
      expect(source.public_claim_level.trim()).not.toBe("");
      expect(source.next_action.trim()).not.toBe("");
      expect(source.limitations.length).toBeGreaterThan(0);
    }
  });

  it("does not mark a source as ingested unless it is implemented", () => {
    const ingestedSources = contractsSourceManifest.sources.filter(
      (source) => source.public_claim_level === "ingested",
    );

    expect(ingestedSources.length).toBeGreaterThan(0);
    expect(
      ingestedSources.every(
        (source) => source.ingestion_status === "implemented",
      ),
    ).toBe(true);
  });

  it("keeps CIG-centred and CUP-centred sources distinguishable", () => {
    const cigSourceIds = listSourcesByIdentifier("CIG").map(
      (source) => source.id,
    );
    const cupSourceIds = listSourcesByIdentifier("CUP").map(
      (source) => source.id,
    );

    expect(cigSourceIds).toContain("anac-bdncp-pcp");
    expect(cigSourceIds).toContain("anac-open-data-cig-annual");
    expect(cigSourceIds).not.toContain("opencup");
    expect(cupSourceIds).toContain("opencup");
    expect(cupSourceIds).toContain("mop-monitoraggio-opere-pubbliche");
    expect(cupSourceIds).not.toContain("anac-pvl");
  });

  it("has valid lifecycle coverage keys and booleans", () => {
    for (const source of contractsSourceManifest.sources) {
      expect(Object.keys(source.lifecycle_coverage).sort()).toEqual(
        [...CONTRACT_SOURCE_LIFECYCLE_PHASES].sort(),
      );
      expect(Object.values(source.lifecycle_coverage)).toSatisfy(
        (values: unknown[]) =>
          values.every((value) => typeof value === "boolean"),
      );
    }
  });

  it("allows unresolved source URLs only with manual verification limits", () => {
    for (const source of contractsSourceManifest.sources) {
      if (source.official_url !== null) {
        continue;
      }

      expect(source.limitations.join(" ")).toContain(
        CONTRACT_SOURCE_MANUAL_VERIFICATION_LIMIT,
      );

      if (source.access_type === "unknown") {
        expect(source.ingestion_status).toBe("not_implemented");
      }
    }
  });

  it("does not overclaim real public ingestion for candidate sources", () => {
    for (const source of contractsSourceManifest.sources) {
      if (source.ingestion_status === "not_implemented") {
        expect(source.public_claim_level).not.toBe("ingested");
        expect(source.public_claim_level).not.toBe("ingestion_ready");
      }

      if (source.public_claim_level === "fixture_only") {
        expect(source.limitations.join(" ")).toMatch(/fixture/i);
      }
    }
  });

  it("validates source-level discovery metadata separately from ingestion metadata", () => {
    const annualCigSource = getContractSourceById("anac-open-data-cig-annual");

    expect(annualCigSource?.discovery_metadata).toMatchObject({
      discovery_status: "needs_manual_verification",
      checked_by: "codex",
      landing_page_url: "https://dati.anticorruzione.it/opendata/",
      package_url: null,
      detected_format: "html",
      freshness_label: "annual",
    });
    expect(annualCigSource?.ingestion_status).toBe("not_implemented");
    expect(annualCigSource?.public_claim_level).toBe("fixture_only");
  });

  it("allows ready_for_parser only after verified discovery, without marking it ingested", () => {
    const annualCigSource = getContractSourceById("anac-open-data-cig-annual");
    expect(annualCigSource).toBeDefined();
    if (!annualCigSource) {
      throw new Error("Missing annual CIG source fixture");
    }

    const verifiedManifest = validateContractSourceManifest({
      ...contractsSourceManifest,
      sources: [
        {
          ...annualCigSource,
          official_url:
            "https://dati.anticorruzione.it/opendata/download/anac-cig-annual-metadata-fixture.zip",
          access_type: "open_data",
          ingestion_status: "ready_for_parser",
          public_claim_level: "linked_only",
          discovery_metadata: {
            discovery_status: "verified",
            checked_at: "2026-06-27T20:50:00.000Z",
            checked_by: "codex",
            verified_url:
              "https://dati.anticorruzione.it/opendata/download/anac-cig-annual-metadata-fixture.zip",
            landing_page_url: "https://dati.anticorruzione.it/opendata/",
            package_url:
              "https://dati.anticorruzione.it/opendata/api/3/action/package_search?q=CIG",
            sample_file_url:
              "https://dati.anticorruzione.it/opendata/download/anac-cig-annual-metadata-fixture.zip",
            detected_format: "zip",
            freshness_label: "annual",
            version_hint: "metadata-fixture-v1",
            notes: ["Metadata verificato per test: non contiene record reali."],
          },
        },
      ],
    });

    expect(verifiedManifest.sources[0]).toMatchObject({
      ingestion_status: "ready_for_parser",
      public_claim_level: "linked_only",
      discovery_metadata: {
        discovery_status: "verified",
      },
    });
    expect(verifiedManifest.sources[0].public_claim_level).not.toBe("ingested");
  });

  it("rejects ready_for_parser when discovery still needs manual verification", () => {
    const annualCigSource = getContractSourceById("anac-open-data-cig-annual");
    expect(annualCigSource).toBeDefined();
    if (!annualCigSource) {
      throw new Error("Missing annual CIG source fixture");
    }

    expect(() =>
      validateContractSourceManifest({
        ...contractsSourceManifest,
        sources: [
          {
            ...annualCigSource,
            official_url:
              "https://dati.anticorruzione.it/opendata/download/anac-cig-annual-metadata-fixture.zip",
            access_type: "open_data",
            ingestion_status: "ready_for_parser",
          },
        ],
      }),
    ).toThrow(/ready_for_parser without verified discovery metadata/);
  });

  it("exposes helper functions for source groups and summaries", () => {
    expect(getContractSourceById("anac-bdncp-pcp")).toMatchObject({
      access_type: "portal_search",
      public_claim_level: "linked_only",
    });
    expect(
      listSourcesByLifecyclePhase("esecuzione").map((source) => source.id),
    ).toEqual(
      expect.arrayContaining([
        "mop-monitoraggio-opere-pubbliche",
        "comune-lamezia-albo-pretorio",
      ]),
    );
    expect(listIngestionReadySources().map((source) => source.id)).toEqual(
      expect.arrayContaining([
        "comune-lamezia-albo-pretorio",
        "lmt-local-derived-contract-data",
      ]),
    );

    const summary = summariseSourceManifest();

    expect(summary.totalSources).toBe(contractsSourceManifest.sources.length);
    expect(summary.byIngestionStatus.not_implemented).toBeGreaterThan(0);
    expect(summary.byDiscoveryStatus.needs_manual_verification).toBeGreaterThan(
      0,
    );
    expect(summary.byIdentifier.CIG).toBeGreaterThan(summary.byIdentifier.CUP);
    expect(summary.manualDiscoveryRequired).toEqual(
      expect.arrayContaining([
        "anac-open-data-cig-annual",
        "anac-ocds-bdncp",
        "mop-monitoraggio-opere-pubbliche",
      ]),
    );
  });
});
