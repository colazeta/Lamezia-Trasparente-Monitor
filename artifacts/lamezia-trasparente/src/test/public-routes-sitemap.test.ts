import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PUBLIC_INDEXABLE_PATHS,
  PUBLIC_SITE_ORIGIN,
  V0_PUBLIC_ROUTE_CONTRACT,
  V0_PUBLIC_ROUTE_PATHS,
  toPublicUrl,
} from "../data/publicRoutes";

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

function readSitemapUrls() {
  const sitemap = readFileSync(
    path.join(appRoot, "public/sitemap.xml"),
    "utf8",
  );
  return Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), ([, loc]) => loc);
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

  it("keeps dynamic, protected and redirect routes out of the sitemap inventory", () => {
    const indexedPaths = PUBLIC_INDEXABLE_PATHS.join("\n");

    expect(indexedPaths).not.toMatch(/:/);
    expect(indexedPaths).not.toContain("/admin");
    expect(indexedPaths).not.toContain("/redazione");
    expect(readSitemapUrls()).not.toContain(`${PUBLIC_SITE_ORIGIN}/admin`);
    expect(readSitemapUrls()).not.toContain(`${PUBLIC_SITE_ORIGIN}/redazione`);
  });
});


describe("v0 structural route contract", () => {
  it("covers the minimum v0 route set with unique paths", () => {
    expect(V0_PUBLIC_ROUTE_PATHS).toEqual([
      "/",
      "/convocazioni",
      "/convocazioni/demo-consiglio-comunale-v0",
      "/contratti",
      "/pnrr",
      "/redazione",
      "/healthz.json",
      "/fonti-dati",
      "/metodologia",
      "/note-legali",
    ]);
    expect(new Set(V0_PUBLIC_ROUTE_PATHS).size).toBe(
      V0_PUBLIC_ROUTE_PATHS.length,
    );
  });

  it("keeps critical v0 routes out of normal error-boundary flow", () => {
    for (const route of V0_PUBLIC_ROUTE_CONTRACT) {
      if (route.v0Critical) {
        expect(route.mustNotErrorBoundary, route.path).toBe(true);
      }
      if (route.status === "pubblicabile") {
        expect(route.requiresSourceAndLimits, route.path).toBe(true);
      }
    }
  });

  it("keeps reserved and marker routes outside the public sitemap", () => {
    expect(PUBLIC_INDEXABLE_PATHS).not.toContain("/redazione");
    expect(PUBLIC_INDEXABLE_PATHS).not.toContain("/healthz.json");
  });
});
