import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildSeoAssets,
  writeSeoAssets,
} from "../../scripts/generate-public-seo-assets.mjs";

const tempDirs: string[] = [];

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    rmSync(tempDir, { recursive: true, force: true });
  }

  delete process.env.VITE_PUBLIC_SITE_URL;
});

describe("production SEO asset generation", () => {
  it("rewrites copied public SEO assets with the configured production URL", () => {
    const { robots, sitemap } = buildSeoAssets({
      siteUrl: "https://prod.example",
    });

    expect(sitemap).toContain("<loc>https://prod.example</loc>");
    expect(sitemap).toContain("<loc>https://prod.example/domande</loc>");
    expect(robots).toContain("Sitemap: https://prod.example/sitemap.xml");
    expect(sitemap).not.toContain("http://localhost:5173");
    expect(robots).not.toContain("http://localhost:5173");
  });

  it("preserves a configured deployment base path in sitemap and robots output", () => {
    const outputDir = mkdtempSync(path.join(os.tmpdir(), "seo-assets-"));
    tempDirs.push(outputDir);

    process.env.VITE_PUBLIC_SITE_URL = "https://prod.example/lamezia";
    writeSeoAssets(outputDir);

    const sitemap = readFileSync(path.join(outputDir, "sitemap.xml"), "utf8");
    const robots = readFileSync(path.join(outputDir, "robots.txt"), "utf8");

    expect(sitemap).toContain("<loc>https://prod.example/lamezia</loc>");
    expect(sitemap).toContain(
      "<loc>https://prod.example/lamezia/domande</loc>",
    );
    expect(robots).toContain(
      "Sitemap: https://prod.example/lamezia/sitemap.xml",
    );
    expect(sitemap).not.toContain("http://localhost:5173");
    expect(robots).not.toContain("http://localhost:5173");
  });

  it("writes physical index fallbacks for sitemap routes", () => {
    const outputDir = mkdtempSync(path.join(os.tmpdir(), "seo-route-assets-"));
    tempDirs.push(outputDir);

    writeFileSync(path.join(outputDir, "index.html"), "<html>app shell</html>");
    process.env.VITE_PUBLIC_SITE_URL = "https://prod.example";
    writeSeoAssets(outputDir);

    expect(readFileSync(path.join(outputDir, "albo", "index.html"), "utf8")).toBe(
      "<html>app shell</html>",
    );
    expect(
      readFileSync(path.join(outputDir, "contratti", "index.html"), "utf8"),
    ).toBe("<html>app shell</html>");
    expect(
      readFileSync(
        path.join(outputDir, "legalita", "trame-festival", "index.html"),
        "utf8",
      ),
    ).toBe("<html>app shell</html>");
  });
});
