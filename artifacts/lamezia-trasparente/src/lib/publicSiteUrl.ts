export const LOCAL_PUBLIC_SITE_URL = "http://localhost:5173";

type PublicSiteOriginOptions = {
  configuredSiteUrl?: string;
  browserOrigin?: string;
  fallbackSiteUrl?: string;
};

function isHttpUrl(url: URL) {
  return url.protocol === "http:" || url.protocol === "https:";
}

export function normalizePublicSiteOrigin(
  siteUrl: string | undefined,
  fallbackSiteUrl = LOCAL_PUBLIC_SITE_URL,
) {
  const fallbackOrigin = new URL(fallbackSiteUrl).origin;
  const candidate = siteUrl?.trim();

  if (!candidate) {
    return fallbackOrigin;
  }

  try {
    const url = new URL(candidate);
    return isHttpUrl(url) ? url.origin : fallbackOrigin;
  } catch {
    return fallbackOrigin;
  }
}

export function resolvePublicSiteOrigin(options: PublicSiteOriginOptions = {}) {
  const configuredSiteUrl = Object.hasOwn(options, "configuredSiteUrl")
    ? options.configuredSiteUrl
    : import.meta.env.VITE_PUBLIC_SITE_URL;
  const browserOrigin = Object.hasOwn(options, "browserOrigin")
    ? options.browserOrigin
    : typeof window !== "undefined"
      ? window.location.origin
      : undefined;
  const fallbackSiteUrl = options.fallbackSiteUrl ?? LOCAL_PUBLIC_SITE_URL;

  if (configuredSiteUrl?.trim()) {
    return normalizePublicSiteOrigin(configuredSiteUrl, fallbackSiteUrl);
  }

  return normalizePublicSiteOrigin(browserOrigin, fallbackSiteUrl);
}

export function toAbsolutePublicUrl(
  pathOrUrl: string | undefined,
  publicSiteOrigin = resolvePublicSiteOrigin(),
) {
  const normalizedOrigin = normalizePublicSiteOrigin(publicSiteOrigin);

  try {
    return new URL(pathOrUrl || "/", `${normalizedOrigin}/`).toString();
  } catch {
    return `${normalizedOrigin}/`;
  }
}
