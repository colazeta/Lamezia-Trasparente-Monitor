import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "../../../..");

const PUBLIC_API_CONSUMERS = [
  "artifacts/lamezia-trasparente/src/main.tsx",
  "artifacts/lamezia-trasparente/src/components/FeedSubscribeButton.tsx",
  "artifacts/lamezia-trasparente/src/components/admin/MigrationStatusBanner.tsx",
  "artifacts/lamezia-trasparente/src/components/helper/CivicAssistant.tsx",
  "artifacts/lamezia-trasparente/src/hooks/useSiteStrings.ts",
  "artifacts/lamezia-trasparente/src/lib/gis.ts",
  "artifacts/lamezia-trasparente/src/lib/postImages.ts",
  "artifacts/lamezia-trasparente/src/pages/Home.tsx",
  "artifacts/lamezia-trasparente/src/pages/MonitoraggioNuovo.tsx",
  "artifacts/lamezia-trasparente/src/pages/Opendata.tsx",
  "artifacts/lamezia-trasparente/src/pages/OpendataDetail.tsx",
  "artifacts/lamezia-trasparente/src/pages/Sviluppatori.tsx",
] as const;

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("public API origin contract", () => {
  it.each(PUBLIC_API_CONSUMERS)(
    "routes %s through the shared API base module",
    (relativePath) => {
      expect(readRepoFile(relativePath)).toContain("apiBaseUrl");
    },
  );

  it("documents the browser configuration in deploy and environment guidance", () => {
    expect(readRepoFile(".env.example")).toContain("VITE_API_BASE_URL=");
    expect(readRepoFile("docs/frontend-deployment.md")).toContain(
      "`VITE_API_BASE_URL`",
    );
    expect(readRepoFile("docs/backend-deployment.md")).toContain(
      "`VITE_API_BASE_URL`",
    );
  });
});
