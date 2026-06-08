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

  it("keeps dynamic, protected and redirect routes out of the sitemap inventory", () => {
    const indexedPaths = PUBLIC_INDEXABLE_PATHS.join("\n");

    expect(indexedPaths).not.toMatch(/:/);
    expect(indexedPaths).not.toContain("/admin");
    expect(indexedPaths).not.toContain("/redazione");
    expect(readSitemapUrls()).not.toContain(`${PUBLIC_SITE_ORIGIN}/admin`);
    expect(readSitemapUrls()).not.toContain(`${PUBLIC_SITE_ORIGIN}/redazione`);
  });
});
