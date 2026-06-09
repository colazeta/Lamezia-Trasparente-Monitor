import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PUBLIC_INDEXABLE_PATHS,
  PUBLIC_SITE_ORIGIN,
  toPublicUrl,
} from "../data/publicRoutes";

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

function readPublicFile(relativePath: string) {
  return readFileSync(path.join(appRoot, relativePath), "utf8");
}

function readSitemapUrls() {
  const sitemap = readPublicFile("public/sitemap.xml");
  return Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), ([, loc]) => loc);
}

function readRobotsSitemapUrl() {
  const robots = readPublicFile("public/robots.txt");
  return robots.match(/^Sitemap:\s*(\S+)$/m)?.[1];
}

describe("public route sitemap inventory", () => {
  it("keeps the static public sitemap aligned with the typed route inventory", () => {
    const expectedUrls = PUBLIC_INDEXABLE_PATHS.map(toPublicUrl);

    expect(readSitemapUrls()).toEqual(expectedUrls);
  });

  it("does not contain duplicate public paths or sitemap URLs", () => {
    const sitemapUrls = readSitemapUrls();

    expect(new Set(PUBLIC_INDEXABLE_PATHS).size).toBe(
      PUBLIC_INDEXABLE_PATHS.length,
    );
    expect(new Set(sitemapUrls).size).toBe(sitemapUrls.length);
  });

  it("uses absolute URLs and keeps robots.txt aligned with the sitemap base", () => {
    const sitemapUrls = readSitemapUrls();

    for (const sitemapUrl of sitemapUrls) {
      expect(sitemapUrl).toMatch(/^https?:\/\//);
      expect(() => new URL(sitemapUrl)).not.toThrow();
    }
    expect(readRobotsSitemapUrl()).toBe(`${PUBLIC_SITE_ORIGIN}/sitemap.xml`);
  });

  it("does not publish the previous Replit deployment domain as a hard-coded SEO base", () => {
    const publicSeoFiles = [
      readPublicFile("public/sitemap.xml"),
      readPublicFile("public/robots.txt"),
    ].join("\n");

    expect(publicSeoFiles).not.toContain(
      "https://lamezia-trasparente-monitor.replit.app",
    );
  });

  it("keeps dynamic, protected and redirect routes out of the sitemap inventory", () => {
    const indexedPaths = PUBLIC_INDEXABLE_PATHS.join("\n");

    expect(indexedPaths).not.toMatch(/:/);
    expect(indexedPaths).not.toContain("/admin");
    expect(indexedPaths).not.toContain("/redazione");
    expect(readSitemapUrls()).not.toContain(`${PUBLIC_SITE_ORIGIN}/admin`);
    expect(readSitemapUrls()).not.toContain(`${PUBLIC_SITE_ORIGIN}/redazione`);
  });
});
