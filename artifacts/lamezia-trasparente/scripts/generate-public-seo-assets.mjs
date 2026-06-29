import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");
const publicDir = path.join(appRoot, "public");
const defaultOutputDir = path.join(appRoot, "dist", "public");

function normalizeSiteUrl(rawSiteUrl) {
  const siteUrl = String(rawSiteUrl ?? "")
    .trim()
    .replace(/\/+$/, "");

  if (!siteUrl) {
    throw new Error("VITE_PUBLIC_SITE_URL must not be empty when provided.");
  }

  let parsed;
  try {
    parsed = new URL(siteUrl);
  } catch {
    throw new Error(
      `VITE_PUBLIC_SITE_URL must be an absolute URL: ${rawSiteUrl}`,
    );
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(
      `VITE_PUBLIC_SITE_URL must use http or https: ${rawSiteUrl}`,
    );
  }

  return siteUrl;
}

function readDefaultSiteUrl() {
  const robots = readFileSync(path.join(publicDir, "robots.txt"), "utf8");
  const match = robots.match(/^Sitemap:\s*(\S+)\/sitemap\.xml\s*$/m);

  if (!match) {
    throw new Error(
      "Unable to infer the default public site URL from public/robots.txt.",
    );
  }

  return normalizeSiteUrl(match[1]);
}

function extractSitemapPaths(sitemapXml, defaultSiteUrl) {
  const defaultUrl = new URL(defaultSiteUrl);
  const defaultBasePath = defaultUrl.pathname.replace(/\/+$/, "");
  const paths = Array.from(
    sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g),
    ([, loc]) => {
      const url = new URL(loc);

      if (url.origin !== defaultUrl.origin) {
        throw new Error(`Sitemap URL does not match the default origin: ${loc}`);
      }

      if (
        defaultBasePath &&
        url.pathname !== defaultBasePath &&
        !url.pathname.startsWith(`${defaultBasePath}/`)
      ) {
        throw new Error(
          `Sitemap URL does not match the default base path: ${loc}`,
        );
      }

      const relativePath = defaultBasePath
        ? url.pathname.slice(defaultBasePath.length) || "/"
        : url.pathname;

      return relativePath === "" ? "/" : relativePath;
    },
  );

  if (paths.length === 0) {
    throw new Error("public/sitemap.xml does not contain any <loc> entries.");
  }

  return paths;
}

function toSiteUrl(siteUrl, publicPath) {
  return publicPath === "/" ? siteUrl : `${siteUrl}${publicPath}`;
}

function buildSeoAssets({ siteUrl = process.env.VITE_PUBLIC_SITE_URL } = {}) {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl ?? readDefaultSiteUrl());
  const defaultSiteUrl = readDefaultSiteUrl();
  const sitemapTemplate = readFileSync(path.join(publicDir, "sitemap.xml"), "utf8");
  const robotsTemplate = readFileSync(path.join(publicDir, "robots.txt"), "utf8");
  const publicPaths = extractSitemapPaths(sitemapTemplate, defaultSiteUrl);
  let pathIndex = 0;

  const sitemap = sitemapTemplate.replace(
    /<loc>[^<]+<\/loc>/g,
    () => `<loc>${toSiteUrl(normalizedSiteUrl, publicPaths[pathIndex++])}</loc>`,
  );
  const robots = robotsTemplate.replace(
    /^Sitemap:\s*\S+\s*$/m,
    `Sitemap: ${normalizedSiteUrl}/sitemap.xml`,
  );

  return { publicPaths, robots, sitemap };
}

function writeRouteFallbackIndexes(outputDir, publicPaths) {
  const indexPath = path.join(outputDir, "index.html");
  if (!existsSync(indexPath)) return;

  const indexHtml = readFileSync(indexPath, "utf8");

  for (const publicPath of publicPaths) {
    const cleanPath = publicPath.replace(/^\/+/, "").replace(/\/+$/, "");
    if (!cleanPath || cleanPath.includes("..") || path.isAbsolute(cleanPath)) {
      continue;
    }
    if (path.extname(cleanPath)) continue;

    const routeIndexPath = path.join(outputDir, cleanPath, "index.html");
    mkdirSync(path.dirname(routeIndexPath), { recursive: true });
    writeFileSync(routeIndexPath, indexHtml);
  }
}

function writeSeoAssets(outputDir = defaultOutputDir) {
  const { publicPaths, robots, sitemap } = buildSeoAssets();
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(path.join(outputDir, "robots.txt"), robots);
  writeFileSync(path.join(outputDir, "sitemap.xml"), sitemap);
  writeRouteFallbackIndexes(outputDir, publicPaths);
}

function checkSeoAssets() {
  buildSeoAssets();
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [, , commandOrOutputDir] = process.argv;

  if (commandOrOutputDir === "--check") {
    checkSeoAssets();
  } else {
    writeSeoAssets(
      commandOrOutputDir ? path.resolve(commandOrOutputDir) : defaultOutputDir,
    );
  }
}

export {
  buildSeoAssets,
  checkSeoAssets,
  writeRouteFallbackIndexes,
  writeSeoAssets,
};
