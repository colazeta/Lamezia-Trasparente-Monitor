import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
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
      expect(dataset.coverageStatus).toBeTruthy();
      expect(dataset.updateCadenceNote).toMatch(
        /non|dipende|segue|variabil|valutazione|verificat|SLA/i,
      );
      expect(dataset.knownLimits).toBeTruthy();
      expect(dataset.reuseExamples.length).toBeGreaterThan(0);
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
});
