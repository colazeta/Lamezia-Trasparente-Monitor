import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  CKAN_ENDPOINTS,
  DCAT_ENDPOINTS,
  MCP_EXAMPLE,
  getTransparencyDatasetQualitySignals,
  OPENDATA_DOCUMENTED_ENDPOINTS,
  PUBLIC_API_DOC_PATH,
  PUBLIC_API_DOCUMENTED_MCP_TOOLS,
  PUBLIC_API_DOCUMENTED_REST_ENDPOINTS,
  TRANSPARENCY_DATASETS,
} from "../data/apiTransparency";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "../../../..");

function readPublicApiDocumentation() {
  return readFileSync(path.join(repoRoot, PUBLIC_API_DOC_PATH), "utf8");
}

function readOpendataRouter() {
  return readFileSync(
    path.join(repoRoot, "artifacts/api-server/src/routes/opendata.ts"),
    "utf8",
  );
}

function toOpendataRouterPath(endpoint: string) {
  return endpoint.replace(/^\/api/, "").replace(/\{([^}]+)\}/g, ":$1");
}

describe("API transparency catalog", () => {
  it("keeps the typed catalog entries complete enough for maintenance", () => {
    const names = TRANSPARENCY_DATASETS.map((dataset) => dataset.datasetName);

    expect(new Set(names).size).toBe(names.length);
    expect(TRANSPARENCY_DATASETS.length).toBeGreaterThanOrEqual(6);

    for (const dataset of TRANSPARENCY_DATASETS) {
      expect(dataset.datasetName).toBeTruthy();
      expect(dataset.sourceType).toMatch(
        /^(ufficiale|derivata|redazionale|seed\/demo)$/,
      );
      expect(dataset.dataKindLabel).toMatch(
        /^Dato (ufficiale|derivato|arricchito|misto)$/,
      );
      expect(dataset.coverageStatus).toBeTruthy();
      expect(dataset.sourceNote).toBeTruthy();
      expect(dataset.updateCadenceNote).toBeTruthy();
      expect(dataset.knownLimits).toBeTruthy();
      expect(dataset.reuseExamples.length).toBeGreaterThan(0);
      for (const example of dataset.reuseExamples) {
        expect(example.trim()).not.toHaveLength(0);
      }
    }
  });

  it("guards provenance, quality notes and civic caveats for every public dataset", () => {
    const qualitySignals = getTransparencyDatasetQualitySignals();

    expect(qualitySignals).toHaveLength(TRANSPARENCY_DATASETS.length);

    for (const signal of qualitySignals) {
      expect(signal.hasProvenanceFields, signal.datasetName).toBe(true);
      expect(signal.hasQualityAndLimitNotes, signal.datasetName).toBe(true);
      expect(signal.hasReuseExamples, signal.datasetName).toBe(true);
      expect(signal.hasMethodologicalCaution, signal.datasetName).toBe(true);
      expect(signal.hasCoherentSourceKind, signal.datasetName).toBe(true);
      expect(signal.hasNoUnsupportedAssuranceClaims, signal.datasetName).toBe(
        true,
      );
      expect(signal.hasValidOptionalSourceUrl, signal.datasetName).toBe(true);
    }
  });

  it("keeps the public REST and MCP inventory aligned with PUBLIC_API.md", () => {
    const publicApiDocumentation = readPublicApiDocumentation();

    for (const endpoint of PUBLIC_API_DOCUMENTED_REST_ENDPOINTS) {
      expect(publicApiDocumentation).toContain(endpoint);
    }

    for (const tool of PUBLIC_API_DOCUMENTED_MCP_TOOLS) {
      expect(publicApiDocumentation).toContain(tool);
    }
  });

  it("keeps OpenData examples aligned with documentation and implemented routes", () => {
    const publicApiDocumentation = readPublicApiDocumentation();
    const opendataRouter = readOpendataRouter();

    for (const endpoint of OPENDATA_DOCUMENTED_ENDPOINTS) {
      expect(publicApiDocumentation).toContain(endpoint);
      expect(opendataRouter).toContain(
        `router.get("${toOpendataRouterPath(endpoint)}"`,
      );
    }

    const documentedExamples = new Set(
      [...DCAT_ENDPOINTS, ...CKAN_ENDPOINTS].map(
        (endpoint) => endpoint.example.split("?")[0],
      ),
    );
    const examples = [...DCAT_ENDPOINTS, ...CKAN_ENDPOINTS].map(
      (endpoint) => endpoint.example,
    );
    for (const endpoint of OPENDATA_DOCUMENTED_ENDPOINTS) {
      expect(documentedExamples).toContain(endpoint);
    }
    expect(examples).not.toContain("/api/3/action/package_show?id=");
    expect(examples).not.toContain("/api/3/action/resource_show?id=");
  });

  it("documents the required MCP Streamable HTTP headers in the reusable example", () => {
    expect(MCP_EXAMPLE).toContain('-H "Content-Type: application/json"');
    expect(MCP_EXAMPLE).toContain(
      '-H "Accept: application/json, text/event-stream"',
    );
    expect(MCP_EXAMPLE).not.toContain("Authorization");
  });
});
