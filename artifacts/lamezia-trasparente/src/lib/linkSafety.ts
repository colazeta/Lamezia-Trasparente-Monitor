export type LinkSafetyKind =
  | "empty"
  | "invalid"
  | "anchor"
  | "relative"
  | "internal"
  | "external"
  | "mailto"
  | "tel";

export type LinkSafetyResult = {
  kind: LinkSafetyKind;
  href: string;
  normalizedHref: string | null;
  protocol: string | null;
  origin: string | null;
  isExternal: boolean;
  shouldOpenInNewTab: boolean;
  rel: "noopener noreferrer" | null;
  reason: string | null;
};

const EXTERNAL_LINK_REL = "noopener noreferrer";

export function classifyLinkSafety(
  href: string | null | undefined,
  siteOrigin?: string | null,
): LinkSafetyResult {
  const value = href?.trim() ?? "";
  const origin = normalizeHttpOrigin(siteOrigin);

  if (value.length === 0) {
    return createResult("empty", value, null, null, null, "empty-input");
  }

  if (value.startsWith("#")) {
    return createResult("anchor", value, value, null, null, null);
  }

  const lowerValue = value.toLowerCase();
  if (lowerValue.startsWith("mailto:")) {
    return createResult("mailto", value, value, "mailto:", null, null);
  }

  if (lowerValue.startsWith("tel:")) {
    return createResult("tel", value, value, "tel:", null, null);
  }

  if (value.startsWith("//")) {
    if (!origin) {
      return createResult(
        "invalid",
        value,
        null,
        null,
        null,
        "protocol-relative-url-requires-http-origin",
      );
    }

    return classifyHttpUrl(new URL(value, origin), value, origin);
  }

  const absoluteProtocol = /^[a-z][a-z\d+.-]*:/i.exec(value)?.[0] ?? null;
  if (absoluteProtocol) {
    try {
      const url = new URL(value);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return createResult(
          "invalid",
          value,
          null,
          url.protocol,
          null,
          "unsupported-protocol",
        );
      }

      return classifyHttpUrl(url, value, origin);
    } catch {
      return createResult(
        "invalid",
        value,
        null,
        absoluteProtocol.toLowerCase(),
        null,
        "invalid-url",
      );
    }
  }

  if (/\s/.test(value)) {
    return createResult("invalid", value, null, null, null, "invalid-relative-url");
  }

  return createResult("relative", value, value, null, null, null);
}

function classifyHttpUrl(
  url: URL,
  originalHref: string,
  siteOrigin: string | null,
): LinkSafetyResult {
  const kind = siteOrigin && url.origin === siteOrigin ? "internal" : "external";

  return createResult(kind, originalHref, url.href, url.protocol, url.origin, null);
}

function normalizeHttpOrigin(origin: string | null | undefined): string | null {
  const value = origin?.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

function createResult(
  kind: LinkSafetyKind,
  href: string,
  normalizedHref: string | null,
  protocol: string | null,
  origin: string | null,
  reason: string | null,
): LinkSafetyResult {
  const isExternal = kind === "external";

  return {
    kind,
    href,
    normalizedHref,
    protocol,
    origin,
    isExternal,
    shouldOpenInNewTab: isExternal,
    rel: isExternal ? EXTERNAL_LINK_REL : null,
    reason,
  };
}
