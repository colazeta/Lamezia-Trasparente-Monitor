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
