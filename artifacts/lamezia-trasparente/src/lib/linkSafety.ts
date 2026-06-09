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
  input: string;
  href: string | null;
  isExternal: boolean;
  isInternal: boolean;
  shouldOpenInNewTab: boolean;
  rel: "noopener noreferrer" | null;
};

const EXTERNAL_LINK_REL = "noopener noreferrer";
const FALLBACK_PROTOCOL_RELATIVE_BASE = "https://link-safety.local";
const RELATIVE_URL_BASE = "https://relative.link-safety.local";
const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
const UNSAFE_RELATIVE_CHAR_PATTERN = /[\u0000-\u001f\u007f\s<>\\]/;

export function classifyLinkSafety(input: string, origin?: string): LinkSafetyResult {
  const trimmedInput = input.trim();

  if (trimmedInput.length === 0) {
    return createResult("empty", trimmedInput, null);
  }

  if (trimmedInput.startsWith("#")) {
    return createResult("anchor", trimmedInput, trimmedInput);
  }

  const lowerInput = trimmedInput.toLowerCase();

  if (lowerInput.startsWith("mailto:")) {
    return createResult("mailto", trimmedInput, trimmedInput);
  }

  if (lowerInput.startsWith("tel:")) {
    return createResult("tel", trimmedInput, trimmedInput);
  }

  const normalizedOrigin = normalizeOrigin(origin);

  if (trimmedInput.startsWith("//")) {
    const base = normalizedOrigin?.origin ?? FALLBACK_PROTOCOL_RELATIVE_BASE;
    const parsedUrl = parseUrl(trimmedInput, base);

    if (!parsedUrl || !isHttpUrl(parsedUrl)) {
      return createResult("invalid", trimmedInput, null);
    }

    return classifyHttpUrl(parsedUrl, trimmedInput, normalizedOrigin);
  }

  if (SCHEME_PATTERN.test(trimmedInput)) {
    const parsedUrl = parseUrl(trimmedInput);

    if (!parsedUrl || !isHttpUrl(parsedUrl)) {
      return createResult("invalid", trimmedInput, null);
    }

    return classifyHttpUrl(parsedUrl, trimmedInput, normalizedOrigin);
  }

  if (!isValidRelativeLink(trimmedInput)) {
    return createResult("invalid", trimmedInput, null);
  }

  return createResult("relative", trimmedInput, trimmedInput);
}

function classifyHttpUrl(
  parsedUrl: URL,
  originalInput: string,
  normalizedOrigin: URL | null,
): LinkSafetyResult {
  if (normalizedOrigin && isSameOrigin(parsedUrl, normalizedOrigin)) {
    return createResult("internal", originalInput, parsedUrl.href);
  }

  return createResult("external", originalInput, parsedUrl.href);
}

function normalizeOrigin(origin?: string): URL | null {
  if (!origin) {
    return null;
  }

  const parsedOrigin = parseUrl(origin.trim());

  if (!parsedOrigin || !isHttpUrl(parsedOrigin)) {
    return null;
  }

  return new URL(parsedOrigin.origin);
}

function parseUrl(input: string, base?: string): URL | null {
  try {
    return base ? new URL(input, base) : new URL(input);
  } catch {
    return null;
  }
}

function isHttpUrl(url: URL): boolean {
  return url.protocol === "http:" || url.protocol === "https:";
}

function isSameOrigin(left: URL, right: URL): boolean {
  return left.protocol === right.protocol && left.hostname === right.hostname && left.port === right.port;
}

function isValidRelativeLink(input: string): boolean {
  if (UNSAFE_RELATIVE_CHAR_PATTERN.test(input)) {
    return false;
  }

  const parsedRelativeUrl = parseUrl(input, RELATIVE_URL_BASE);

  if (!parsedRelativeUrl || !isHttpUrl(parsedRelativeUrl)) {
    return false;
  }

  return parsedRelativeUrl.origin === RELATIVE_URL_BASE;
}

function createResult(kind: LinkSafetyKind, input: string, href: string | null): LinkSafetyResult {
  const isExternal = kind === "external";
  const isInternal = kind === "internal" || kind === "relative" || kind === "anchor";

  return {
    kind,
    input,
    href,
    isExternal,
    isInternal,
    shouldOpenInNewTab: isExternal,
    rel: isExternal ? EXTERNAL_LINK_REL : null,
  };
}
