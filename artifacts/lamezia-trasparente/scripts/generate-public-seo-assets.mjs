import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const LOCAL_PUBLIC_SITE_URL = "http://localhost:5173";
const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const publicRoutesPath = path.join(appRoot, "src/data/publicRoutes.ts");
const sitemapPath = path.join(appRoot, "public/sitemap.xml");
const robotsPath = path.join(appRoot, "public/robots.txt");
const checkOnly = process.argv.includes("--check");

function normalizePublicSiteOrigin(
  siteUrl,
  fallbackSiteUrl = LOCAL_PUBLIC_SITE_URL,
) {
  const fallbackOrigin = new URL(fallbackSiteUrl).origin;
  const candidate = siteUrl?.trim();

  if (!candidate) {
    return fallbackOrigin;
  }

  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : fallbackOrigin;
  } catch {
    return fallbackOrigin;
  }
}

function readPublicRoutePaths() {
  const publicRoutes = readFileSync(publicRoutesPath, "utf8");
  return Array.from(
    publicRoutes.matchAll(/path:\s*"(\/[^"#?]*)"/g),
    ([, routePath]) => routePath,
  );
}

function toPublicUrl(routePath, publicSiteOrigin) {
  return routePath === "/"
    ? publicSiteOrigin
    : `${publicSiteOrigin}${routePath}`;
}

function buildSitemap(routePaths, publicSiteOrigin) {
  const urls = routePaths
    .map(
      (routePath) =>
        `  <url><loc>${toPublicUrl(routePath, publicSiteOrigin)}</loc></url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Static sitemap for the public civic web app. Uses the documented local fallback origin when VITE_PUBLIC_SITE_URL is not set; dynamic detail pages and protected routes are intentionally excluded. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobots(publicSiteOrigin) {
  return `User-agent: *
Allow: /

# Static sitemap for the public civic routes served by the web app.
# Uses the documented local fallback origin when VITE_PUBLIC_SITE_URL is not set.
Sitemap: ${publicSiteOrigin}/sitemap.xml
`;
}

const publicSiteOrigin = normalizePublicSiteOrigin(
  process.env.VITE_PUBLIC_SITE_URL,
);
const publicRoutePaths = readPublicRoutePaths();
const generatedSitemap = buildSitemap(publicRoutePaths, publicSiteOrigin);
const generatedRobots = buildRobots(publicSiteOrigin);

if (checkOnly) {
  const currentSitemap = readFileSync(sitemapPath, "utf8");
  const currentRobots = readFileSync(robotsPath, "utf8");

  if (
    currentSitemap !== generatedSitemap ||
    currentRobots !== generatedRobots
  ) {
    console.error(
      "Public SEO assets are not aligned with src/data/publicRoutes.ts and VITE_PUBLIC_SITE_URL. Run pnpm --filter @workspace/lamezia-trasparente run seo:generate.",
    );
    process.exit(1);
  }
} else {
  writeFileSync(sitemapPath, generatedSitemap);
  writeFileSync(robotsPath, generatedRobots);
}
