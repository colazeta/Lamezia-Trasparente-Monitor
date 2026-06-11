import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const DEFAULT_PUBLIC_SITE_URL = "https://lamezia-trasparente-monitor.replit.app";

function readOption(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

function normalizePublicSiteUrl(value) {
  const rawValue = (value ?? DEFAULT_PUBLIC_SITE_URL).trim();
  if (!rawValue) {
    throw new Error("VITE_PUBLIC_SITE_URL cannot be blank.");
  }

  const parsedUrl = new URL(rawValue);
  if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") {
    throw new Error("VITE_PUBLIC_SITE_URL must be an HTTPS URL, except for localhost development checks.");
  }

  const pathname = parsedUrl.pathname.replace(/\/+$/, "");
  return `${parsedUrl.origin}${pathname === "/" ? "" : pathname}`;
}

function joinPublicUrl(siteUrl, pathname) {
  const cleanPathname = pathname === "/" ? "" : pathname;
  return `${siteUrl}${cleanPathname}`;
}

function pathnameFromLoc(value) {
  try {
    const url = new URL(value);
    return url.pathname === "" ? "/" : url.pathname;
  } catch {
    return value.startsWith("/") ? value : `/${value}`;
  }
}

function renderSitemap(template, siteUrl) {
  return template.replace(/<loc>([^<]+)<\/loc>/g, (_match, loc) => {
    return `<loc>${joinPublicUrl(siteUrl, pathnameFromLoc(loc))}</loc>`;
  });
}

function renderRobots(template, siteUrl) {
  const sitemapLine = `Sitemap: ${joinPublicUrl(siteUrl, "/sitemap.xml")}`;
  if (/^Sitemap:\s*.+$/m.test(template)) {
    return template.replace(/^Sitemap:\s*.+$/m, sitemapLine);
  }
  return `${template.trimEnd()}\n${sitemapLine}\n`;
}

const isCheck = process.argv.includes("--check");
const publicDir = path.resolve(readOption("--public-dir") ?? process.env.SEO_ASSETS_PUBLIC_DIR ?? "public");
const outputDir = path.resolve(
  readOption("--out-dir") ??
    process.env.SEO_ASSETS_OUTPUT_DIR ??
    (isCheck ? mkdtempSync(path.join(tmpdir(), "lamezia-seo-assets-")) : path.join("dist", "public")),
);

const siteUrl = normalizePublicSiteUrl(process.env.VITE_PUBLIC_SITE_URL);
const sitemapTemplate = readFileSync(path.join(publicDir, "sitemap.xml"), "utf8");
const robotsTemplate = readFileSync(path.join(publicDir, "robots.txt"), "utf8");

mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, "sitemap.xml"), renderSitemap(sitemapTemplate, siteUrl), "utf8");
writeFileSync(path.join(outputDir, "robots.txt"), renderRobots(robotsTemplate, siteUrl), "utf8");

if (isCheck && !readOption("--out-dir") && !process.env.SEO_ASSETS_OUTPUT_DIR) {
  rmSync(outputDir, { recursive: true, force: true });
}
