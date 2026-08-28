import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PUBLIC_INDEXABLE_PATHS,
  PUBLIC_SITE_ORIGIN,
  PUBLIC_V0_ROUTE_CONTRACT,
  PUBLIC_V0_ROUTE_PATHS,
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

function readRedirectRules() {
  const redirects = readFileSync(
    path.join(appRoot, "public/_redirects"),
    "utf8",
  );

  return redirects
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [source, target, status] = line.split(/\s+/);
      return { source, target, status };
    });
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

  it("canonicalizes every directory route without rewriting it to the homepage", () => {
    const rules = readRedirectRules();

    for (const publicPath of PUBLIC_INDEXABLE_PATHS) {
      const route = publicPath.replace(/\/+$/, "");
      if (!route) continue;

      expect(rules).toContainEqual({
        source: route,
        target: `${route}/`,
        status: "301",
      });
      expect(rules).toContainEqual({
        source: `${route}/*`,
        target: "/index.html",
        status: "200",
      });
      expect(rules).not.toContainEqual({
        source: route,
        target: "/index.html",
        status: "200",
      });
    }
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

describe("v0 public route structural contract", () => {
  it("covers the P0 launch-blocker routes with explicit readiness statuses", () => {
    expect(PUBLIC_V0_ROUTE_PATHS).toEqual([
      "/",
      "/convocazioni",
      "/convocazioni/demo-consiglio-comunale-v0",
      "/contratti",
      "/organi",
      "/amministratori",
      "/pnrr",
      "/redazione",
      "/healthz.json",
      "/fonti-dati",
      "/metodologia",
      "/note-legali",
    ]);

    for (const route of PUBLIC_V0_ROUTE_CONTRACT) {
      expect(route.title.trim()).not.toBe("");
      expect(route.note.trim()).not.toBe("");
      expect(route.rationale.trim()).not.toBe("");
    }
  });

  it("keeps reserved and static-marker routes out of the public sitemap inventory", () => {
    const indexedPaths = PUBLIC_INDEXABLE_PATHS.join("\n");

    expect(indexedPaths).not.toContain("/redazione");
    expect(indexedPaths).not.toContain("/healthz.json");
  });
});
