import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  generatePublicSeoAssets,
  normalizePublicSiteUrl,
} from "../../scripts/generate-public-seo-assets.mjs";

describe("production SEO asset generation", () => {
  test("rewrites sitemap and robots with the configured public origin", () => {
    const workspace = mkdtempSync(path.join(tmpdir(), "lamezia-seo-assets-"));
    const publicDir = path.join(workspace, "public");
    const outputDir = path.join(workspace, "dist", "public");

    try {
      mkdirSync(publicDir, { recursive: true });
      writeFileSync(
        path.join(publicDir, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>http://localhost:5173</loc></url>
  <url><loc>http://localhost:5173/domande</loc></url>
</urlset>
`,
        "utf8",
      );
      writeFileSync(
        path.join(publicDir, "robots.txt"),
        "User-agent: *\nAllow: /\nSitemap: http://localhost:5173/sitemap.xml\n",
        "utf8",
      );

      generatePublicSeoAssets({
        publicDir,
        outputDir,
        siteUrl: normalizePublicSiteUrl("https://prod.example"),
      });

      const sitemap = readFileSync(path.join(outputDir, "sitemap.xml"), "utf8");
      const robots = readFileSync(path.join(outputDir, "robots.txt"), "utf8");

      expect(sitemap).toContain("<loc>https://prod.example</loc>");
      expect(sitemap).toContain("<loc>https://prod.example/domande</loc>");
      expect(sitemap).not.toContain("http://localhost:5173");
      expect(robots).toContain("Sitemap: https://prod.example/sitemap.xml");
      expect(robots).not.toContain("http://localhost:5173");
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  });

  test("preserves a configured deployment base path", () => {
    const workspace = mkdtempSync(path.join(tmpdir(), "lamezia-seo-assets-"));
    const publicDir = path.join(workspace, "public");
    const outputDir = path.join(workspace, "dist", "public");

    try {
      mkdirSync(publicDir, { recursive: true });
      writeFileSync(
        path.join(publicDir, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://lamezia-trasparente-monitor.replit.app</loc></url>
  <url><loc>https://lamezia-trasparente-monitor.replit.app/domande</loc></url>
</urlset>
`,
        "utf8",
      );
      writeFileSync(
        path.join(publicDir, "robots.txt"),
        "User-agent: *\nAllow: /\nSitemap: https://lamezia-trasparente-monitor.replit.app/sitemap.xml\n",
        "utf8",
      );

      generatePublicSeoAssets({
        publicDir,
        outputDir,
        siteUrl: normalizePublicSiteUrl("https://prod.example/lamezia/"),
      });

      const sitemap = readFileSync(path.join(outputDir, "sitemap.xml"), "utf8");
      const robots = readFileSync(path.join(outputDir, "robots.txt"), "utf8");

      expect(sitemap).toContain("<loc>https://prod.example/lamezia</loc>");
      expect(sitemap).toContain("<loc>https://prod.example/lamezia/domande</loc>");
      expect(robots).toContain("Sitemap: https://prod.example/lamezia/sitemap.xml");
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  });
});
