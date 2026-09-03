import { describe, expect, it } from "vitest";

import {
  SEMANTIC_CONTEXT_URL,
  SEMANTIC_ONTOLOGY_URL,
  SEMANTIC_PROFILE_URL,
  SEMANTIC_PROFILE_VERSION,
  SEMANTIC_RESOURCE_DESCRIPTORS,
  semanticDescriptor,
  type SemanticResource,
} from "./semanticProfile";

const EXPECTED_RESOURCES: SemanticResource[] = [
  "contract",
  "contracts",
  "document",
  "document_markdown",
  "documents",
  "performance",
  "pnrr",
  "theme",
  "themes",
];

describe("public semantic profile", () => {
  it("covers every MCP structured resource with stable public semantic assets", () => {
    expect(Object.keys(SEMANTIC_RESOURCE_DESCRIPTORS).sort()).toEqual(
      EXPECTED_RESOURCES.sort(),
    );

    for (const resource of EXPECTED_RESOURCES) {
      expect(semanticDescriptor(resource)).toMatchObject({
        profile: SEMANTIC_PROFILE_URL,
        context: SEMANTIC_CONTEXT_URL,
        ontology: SEMANTIC_ONTOLOGY_URL,
        profileVersion: SEMANTIC_PROFILE_VERSION,
      });
    }
  });

  it("models procurement records as descriptions of ePO contracts, not equivalence", () => {
    const contract = semanticDescriptor("contract");
    expect(contract.entityType).toBe(
      "https://lamezia-trasparente.pages.dev/ontology#PublicProcurementRecord",
    );
    expect(contract.mappings).toContainEqual({
      relation: "describes",
      term: "http://data.europa.eu/a4g/ontology#Contract",
      vocabulary: "eProcurement Ontology",
      version: "5.2.0",
    });
    expect(contract.mappings.some((mapping) => mapping.relation === "reference")).toBe(
      false,
    );
  });

  it("keeps the Italian transparency ontology explicitly reference-only", () => {
    const document = semanticDescriptor("document");
    expect(document.mappings).toContainEqual({
      relation: "reference",
      term: "https://w3id.org/italia/onto/Transparency/",
      vocabulary: "OntoPiA Transparency",
      version: "0.2-draft",
    });
  });

  it("uses SKOS for civic themes and an observation pattern for performance", () => {
    expect(semanticDescriptor("theme").mappings).toContainEqual({
      relation: "subClassOf",
      term: "http://www.w3.org/2004/02/skos/core#Concept",
      vocabulary: "SKOS",
      version: "2009-08-18",
    });

    expect(semanticDescriptor("performance").mappings).toContainEqual({
      relation: "observationPattern",
      term: "http://purl.org/linked-data/cube#Observation",
      vocabulary: "RDF Data Cube",
      version: "2014-01-16",
    });
  });
});
