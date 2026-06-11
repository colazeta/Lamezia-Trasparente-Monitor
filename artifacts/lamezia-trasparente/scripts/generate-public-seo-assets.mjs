import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_PUBLIC_SITE_URL = "https://lamezia-trasparente-monitor.replit.app";

function readOption(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

function normalizeRoutePathname(value) {
  const rawValue = (value ?? "").trim();
  if (!rawValue || rawValue === "/" || rawValue === "./") {
    return "";
  }

  const withLeadingSlash = rawValue.startsWith("/") ? rawValue : `/${rawValue}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, "");
  return withoutTrailingSlash === "/" ? "" : withoutTrailingSlash;
}

export function normalizeBasePath(value) {
  const rawValue = (value ?? "").trim();
  if (!rawValue || rawValue === "/" || rawValue === "./") {
    return "";
  }

  if (URL.canParse(rawValue)) {
    return normalizeRoutePathname(new URL(rawValue).pathname);
  }

  return normalizeRoutePathname(rawValue);
}

export function normalizePublicSiteUrl(value, { basePath = "" } = {}) {
  const rawValue = (value ?? DEFAULT_PUBLIC_SITE_URL).trim();
  if (!rawValue) {
    throw new Error("VITE_PUBLIC_SITE_URL cannot be blank.");
  }

  const parsedUrl = new URL(rawValue);
  if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") {
    throw new Error("VITE_PUBLIC_SITE_URL must be an HTTPS URL, except for localhost development checks.");
  }

  const sitePathname = normalizeRoutePathname(parsedUrl.pathname);
  const normalizedBasePath = normalizeBasePath(basePath);
  const effectivePathname = normalizedBasePath && sitePathname !== normalizedBasePath && !sitePathname.startsWith(`${normalizedBasePath}/`)
    ? `${normalizedBasePath}${sitePathname}`
    : sitePathname || normalizedBasePath;

  return `${parsedUrl.origin}${effectivePathname}`;
}

function joinPublicUrl(siteUrl, pathname) {
  const parsedSiteUrl = new URL(siteUrl);
  const siteBasePath = normalizeRoutePathname(parsedSiteUrl.pathname);
  const routePathname = normalizeRoutePathname(pathname);

  if (!routePathname) {
    return siteUrl;
  }

  const routeWithinBase = siteBasePath && (routePathname === siteBasePath || routePathname.startsWith(`${siteBasePath}/`))
    ? routePathname.slice(siteBasePath.length)
    : routePathname;

  return `${siteUrl}${routeWithinBase}`;
}

function pathnameFromLoc(value) {
  try {
    const url = new URL(value);
    return url.pathname === "" ? "/" : url.pathname;
  } catch {
    return value.startsWith("/") ? value : `/${value}`;
  }
}

export function renderSitemap(template, siteUrl) {
  return template.replace(/<loc>([^<]+)<\/loc>/g, (_match, loc) => {
    return `<loc>${joinPublicUrl(siteUrl, pathnameFromLoc(loc))}</loc>`;
  });
}

export function renderRobots(template, siteUrl) {
  const sitemapLine = `Sitemap: ${joinPublicUrl(siteUrl, "/sitemap.xml")}`;
  if (/^Sitemap:\s*.+$/m.test(template)) {
    return template.replace(/^Sitemap:\s*.+$/m, sitemapLine);
  }
  return `${template.trimEnd()}\n${sitemapLine}\n`;
}

export function generatePublicSeoAssets({
  publicDir = path.resolve("public"),
  outputDir = path.resolve("dist", "public"),
  basePath = process.env.BASE_PATH,
  siteUrl = normalizePublicSiteUrl(process.env.VITE_PUBLIC_SITE_URL, { basePath }),
} = {}) {
  const sitemapTemplate = readFileSync(path.join(publicDir, "sitemap.xml"), "utf8");
  const robotsTemplate = readFileSync(path.join(publicDir, "robots.txt"), "utf8");

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(path.join(outputDir, "sitemap.xml"), renderSitemap(sitemapTemplate, siteUrl), "utf8");
  writeFileSync(path.join(outputDir, "robots.txt"), renderRobots(robotsTemplate, siteUrl), "utf8");

  return { outputDir, siteUrl };
}

function runCli() {
  const isCheck = process.argv.includes("--check");
  const hasExplicitOutput = Boolean(readOption("--out-dir") || process.env.SEO_ASSETS_OUTPUT_DIR);
  const publicDir = path.resolve(readOption("--public-dir") ?? process.env.SEO_ASSETS_PUBLIC_DIR ?? "public");
  const outputDir = path.resolve(
    readOption("--out-dir") ??
      process.env.SEO_ASSETS_OUTPUT_DIR ??
      (isCheck ? mkdtempSync(path.join(tmpdir(), "lamezia-seo-assets-")) : path.join("dist", "public")),
  );

  generatePublicSeoAssets({ publicDir, outputDir });

  if (isCheck && !hasExplicitOutput) {
    rmSync(outputDir, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli();
}
