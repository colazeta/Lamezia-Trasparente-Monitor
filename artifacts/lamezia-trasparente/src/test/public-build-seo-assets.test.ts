import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const builtSitemapPath = path.join(
  repoRoot,
  "artifacts/lamezia-trasparente/dist/public/sitemap.xml",
);
const builtRobotsPath = path.join(
  repoRoot,
  "artifacts/lamezia-trasparente/dist/public/robots.txt",
);

function runProductionBuild(publicSiteUrl: string) {
  execFileSync(
    "pnpm",
    ["--filter", "@workspace/lamezia-trasparente", "run", "build"],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        VITE_PUBLIC_SITE_URL: publicSiteUrl,
      },
      stdio: "pipe",
    },
  );
}

function readBuiltSeoAssets() {
  return {
    sitemap: readFileSync(builtSitemapPath, "utf8"),
    robots: readFileSync(builtRobotsPath, "utf8"),
  };
}

describe("production build SEO assets", () => {
  it(
    "regenerates built sitemap and robots from VITE_PUBLIC_SITE_URL",
    () => {
      runProductionBuild("https://prod.example");

      const { sitemap, robots } = readBuiltSeoAssets();

      expect(sitemap).toContain("<loc>https://prod.example</loc>");
      expect(sitemap).toContain(
        "<loc>https://prod.example/metodologia</loc>",
      );
      expect(robots).toContain("Sitemap: https://prod.example/sitemap.xml");
      expect(`${sitemap}\n${robots}`).not.toContain("http://localhost:5173");
    },
    120_000,
  );

  it(
    "preserves configured public base paths in built sitemap and robots",
    () => {
      runProductionBuild("https://prod.example/lamezia");

      const { sitemap, robots } = readBuiltSeoAssets();

      expect(sitemap).toContain("<loc>https://prod.example/lamezia</loc>");
      expect(sitemap).toContain(
        "<loc>https://prod.example/lamezia/metodologia</loc>",
      );
      expect(robots).toContain(
        "Sitemap: https://prod.example/lamezia/sitemap.xml",
      );
      expect(sitemap).not.toContain(
        "<loc>https://prod.example/metodologia</loc>",
      );
    },
    120_000,
  );
});
