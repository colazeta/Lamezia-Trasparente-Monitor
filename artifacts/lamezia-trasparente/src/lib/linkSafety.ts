export type LinkSafetyKind =
  | "empty"
  | "invalid"
  | "anchor"
  | "relative"
  | "internal"
  | "external"
  | "mailto"
  | "tel";

export interface LinkSafetyMetadata {
  /** Original value received by the helper, before trimming. */
  rawHref: string;
  /** Trimmed value used for deterministic classification. */
  href: string;
  /** Neutral technical category for the link-like value. */
  kind: LinkSafetyKind;
  /** True only for absolute HTTP/HTTPS URLs outside the provided origin. */
  isExternal: boolean;
  /** True for absolute HTTP/HTTPS URLs classified as internal or external. */
  isHttp: boolean;
  /** False only for empty or syntactically unsupported values. */
  isValid: boolean;
  /** Normalized origin used for HTTP/HTTPS comparisons, when available. */
  origin: string | null;
  /** Normalized absolute URL for HTTP/HTTPS values; otherwise null. */
  url: string | null;
}

const ABSOLUTE_SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/i;
const RELATIVE_PATH_PATTERN = /^(?:[./?]|[^\s:]+(?:[/?#]|$))/;

function normalizeOrigin(origin?: string | null): string | null {
  if (!origin?.trim()) {
    return null;
  }

  try {
    const parsed = new URL(origin.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.origin
      : null;
  } catch {
    return null;
  }
}

function metadata(
  rawHref: string,
  href: string,
  kind: LinkSafetyKind,
  origin: string | null,
  url: string | null = null,
): LinkSafetyMetadata {
  const isHttp = kind === "internal" || kind === "external";

  return {
    rawHref,
    href,
    kind,
    isExternal: kind === "external",
    isHttp,
    isValid: kind !== "empty" && kind !== "invalid",
    origin,
    url,
  };
}

/**
 * Classify a link-like value without reading browser globals.
 *
 * The helper is intentionally neutral and infrastructural: it only describes
 * URL shape and same-origin status so future shared components can decide how
 * to render links without duplicating parsing rules.
 */
export function classifyLinkSafety(
  rawHref: string | null | undefined,
  options: { origin?: string | null } = {},
): LinkSafetyMetadata {
  const rawValue = rawHref ?? "";
  const href = rawValue.trim();
  const origin = normalizeOrigin(options.origin);

  if (!href) {
    return metadata(rawValue, href, "empty", origin);
  }

  if (href.startsWith("#")) {
    return metadata(rawValue, href, "anchor", origin);
  }

  if (/^mailto:/i.test(href)) {
    return metadata(rawValue, href, "mailto", origin);
  }

  if (/^tel:/i.test(href)) {
    return metadata(rawValue, href, "tel", origin);
  }

  if (/^(?:https?:\/\/|\/\/)/i.test(href)) {
    try {
      const parsed = href.startsWith("//")
        ? new URL(`https:${href}`)
        : new URL(href);
      const kind =
        origin !== null && parsed.origin === origin ? "internal" : "external";
      return metadata(rawValue, href, kind, origin, parsed.href);
    } catch {
      return metadata(rawValue, href, "invalid", origin);
    }
  }

  if (ABSOLUTE_SCHEME_PATTERN.test(href)) {
    return metadata(rawValue, href, "invalid", origin);
  }

  if (RELATIVE_PATH_PATTERN.test(href)) {
    return metadata(rawValue, href, "relative", origin);
  }

  return metadata(rawValue, href, "invalid", origin);
}
