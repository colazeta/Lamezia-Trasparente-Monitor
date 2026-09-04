import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  SEMANTIC_ASSOCIATION_TYPES,
  SEMANTIC_ENTITY_RESOLUTION_STATUSES,
  SEMANTIC_ENTITY_TYPES,
  SEMANTIC_INVARIANTS,
  SEMANTIC_RECORD_TYPES,
  SEMANTIC_RELATION_ASSERTION_STATUSES,
  SemanticContractFixtureManifestSchema,
  SemanticContractSchema,
  semanticContractToJsonSchema,
  type SemanticContract,
} from "@workspace/api-zod";

const REPO_ROOT = fileURLToPath(new URL("../../../../", import.meta.url));

const CONTRACT_PATH = "docs/architecture/semantic-contract.v0.2.json";
const CONTRACT_SCHEMA_PATH =
  "docs/architecture/semantic-contract.v0.2.schema.json";
const FIXTURES_PATH =
  "docs/architecture/semantic-contract-fixtures.v0.2.json";

function readJson(relativePath: string): unknown {
  return JSON.parse(
    fs.readFileSync(path.resolve(REPO_ROOT, relativePath), "utf8"),
  );
}

function associationMap(contract: SemanticContract) {
  return new Map(contract.associations.map((item) => [item.type, item]));
}

describe("semantic contract v0.2", () => {
  const contract = SemanticContractSchema.parse(readJson(CONTRACT_PATH));
  const fixtures = SemanticContractFixtureManifestSchema.parse(
    readJson(FIXTURES_PATH),
  );

  it("keeps the committed JSON Schema in lock-step with Zod", () => {
    expect(readJson(CONTRACT_SCHEMA_PATH)).toEqual(
      semanticContractToJsonSchema(),
    );
  });

  it("materializes the complete versioned vocabulary without enabling runtime or DB migration", () => {
    expect(contract.entity_types).toEqual([...SEMANTIC_ENTITY_TYPES]);
    expect(contract.record_types).toEqual([...SEMANTIC_RECORD_TYPES]);
    expect(contract.associations.map(({ type }) => type)).toEqual([
      ...SEMANTIC_ASSOCIATION_TYPES,
    ]);
    expect(contract.status_axes.entity_resolution_statuses).toEqual([
      ...SEMANTIC_ENTITY_RESOLUTION_STATUSES,
    ]);
    expect(contract.status_axes.relation_assertion_statuses).toEqual([
      ...SEMANTIC_RELATION_ASSERTION_STATUSES,
    ]);
    expect(contract.invariants).toEqual([...SEMANTIC_INVARIANTS]);
    expect(contract.status_axes.independent).toBe(true);
    expect(contract.runtime_public_surface).toBe(false);
    expect(contract.database_migration_authorized).toBe(false);
  });

  it("enforces the v0.2 distinctions that prevent semantic overreach", () => {
    const associations = associationMap(contract);

    expect(associations.get("RoleAssignment")?.required_dimensions).toContain(
      "context",
    );
    expect(
      associations.get("EventParticipation")?.required_dimensions,
    ).toContain("event");

    expect(
      associations.get("AssetStateAssertion")?.historical_event_implied,
    ).toBe(false);
    expect(associations.get("AssetStateAssertion")?.requires_dated_event).toBe(
      false,
    );
    expect(associations.get("AssetMeasure")?.historical_event_implied).toBe(
      true,
    );
    expect(associations.get("AssetMeasure")?.requires_dated_event).toBe(true);
    expect(associations.get("AssetMeasure")?.required_dimensions).toContain(
      "event_date_or_explicit_date_precision",
    );

    expect(
      associations.get("IndicatorObservation")?.required_dimensions,
    ).toEqual(
      expect.arrayContaining([
        "indicator",
        "period",
        "value",
        "unit",
        "source_statement",
      ]),
    );

    expect(contract.evidence_link_policy.text_only_canonical_link_allowed).toBe(
      false,
    );
    for (const basis of contract.evidence_link_policy.allowed_match_bases) {
      expect(
        contract.evidence_link_policy.disallowed_canonical_link_bases,
      ).not.toContain(basis);
    }
    expect(
      contract.evidence_link_policy.disallowed_canonical_link_bases,
    ).toEqual(
      expect.arrayContaining([
        "topic_only",
        "generic_text_similarity",
        "pnrr_keyword_only",
      ]),
    );
  });

  it("keeps identifier scope and public-safety semantics explicit", () => {
    const policies = new Map(
      contract.identifier_policies.map((item) => [item.scheme, item]),
    );

    expect(policies.get("CUP")?.canonical_target_types).toEqual(["Project"]);
    expect(policies.get("CIG")?.canonical_target_types).toEqual([
      "ProcurementProcess",
      "PublicContract",
    ]);
    expect(policies.get("source_id")).toMatchObject({
      canonical_target_types: ["SourceRecord"],
      scope: "source_specific",
      public_safety_review: false,
    });
    expect(policies.get("tax_identifier")).toMatchObject({
      canonical_target_types: ["Person", "Organization"],
      public_safety_review: true,
    });
  });

  it("keeps all seven fixtures inside the executable contract", () => {
    const expectedFixtureIds = [
      "electoral-candidacy-doris-lo-moro-2025",
      "pnrr-cloud-project-municipal-plus-opencup",
      "pnrr-procurement-attachment-party-evidence",
      "pnrr-albo-qualified-cup-reconciliation",
      "confiscated-assets-state-without-reconstructed-timeline",
      "indicator-population-resident-definition-and-observations",
      "opendata-dcat-contract",
    ];

    expect(fixtures.fixture_count).toBe(7);
    expect(fixtures.fixtures.map(({ id }) => id)).toEqual(expectedFixtureIds);

    for (const fixture of fixtures.fixtures) {
      for (const type of fixture.entity_types) {
        expect(contract.entity_types).toContain(type);
      }
      for (const type of fixture.record_types) {
        expect(contract.record_types).toContain(type);
      }
      for (const type of fixture.association_types) {
        expect(contract.associations.map(({ type: value }) => value)).toContain(
          type,
        );
      }
      for (const type of fixture.forbidden_association_types) {
        expect(contract.associations.map(({ type: value }) => value)).toContain(
          type,
        );
      }
      for (const status of fixture.resolution_statuses) {
        expect(contract.status_axes.entity_resolution_statuses).toContain(
          status,
        );
      }
      for (const status of fixture.relation_statuses) {
        expect(contract.status_axes.relation_assertion_statuses).toContain(
          status,
        );
      }
      for (const invariant of fixture.required_invariants) {
        expect(contract.invariants).toContain(invariant);
      }
    }
  });

  it("fails stale fixtures by checking their repository source anchors", () => {
    for (const fixture of fixtures.fixtures) {
      for (const anchor of fixture.source_anchors) {
        const absolutePath = path.resolve(REPO_ROOT, anchor.path);
        expect(
          fs.existsSync(absolutePath),
          `${fixture.id}: missing source ${anchor.path}`,
        ).toBe(true);

        const source = fs.readFileSync(absolutePath, "utf8");
        for (const token of anchor.must_contain) {
          expect(
            source.includes(token),
            `${fixture.id}: source ${anchor.path} no longer contains ${JSON.stringify(token)}`,
          ).toBe(true);
        }
      }
    }
  });

  it("pins the high-risk negative projections from the stress test", () => {
    const byId = new Map(fixtures.fixtures.map((item) => [item.id, item]));

    expect(
      byId.get("electoral-candidacy-doris-lo-moro-2025")
        ?.forbidden_association_types,
    ).toContain("RoleAssignment");

    expect(
      byId.get("confiscated-assets-state-without-reconstructed-timeline")
        ?.required_invariants,
    ).toEqual(
      expect.arrayContaining([
        "no_fictional_seed_as_evidence",
        "no_status_to_history_inference",
      ]),
    );

    expect(
      byId.get("pnrr-albo-qualified-cup-reconciliation")
        ?.required_invariants,
    ).toContain("no_text_only_project_reconciliation");

    expect(
      byId.get("pnrr-procurement-attachment-party-evidence")
        ?.required_invariants,
    ).toContain("no_name_only_entity_merge");
  });
});
