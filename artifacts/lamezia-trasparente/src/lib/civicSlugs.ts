export const DEFAULT_CIVIC_SLUG_FALLBACK = "modulo-civico";

export type CivicSlugRecord = Readonly<{
  slug: string;
}>;

const EXTRA_LATIN_REPLACEMENTS: Readonly<Record<string, string>> = {
  ß: "ss",
  æ: "ae",
  œ: "oe",
  ø: "o",
  đ: "d",
  ł: "l",
  þ: "th",
};

function transliterateToAscii(value: string): string {
  return value
    .replace(/[ßæœøđłþ]/g, (match) => EXTRA_LATIN_REPLACEMENTS[match] ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Normalizes a technical module label into a deterministic public slug.
 *
 * The result is always lowercase ASCII, uses `-` as the only separator and
 * never starts or ends with a separator. Empty or symbol-only input falls back
 * to a neutral demo-module slug so callers never receive an empty identifier.
 */
export function normalizeCivicSlug(
  value: string,
  fallback: string = DEFAULT_CIVIC_SLUG_FALLBACK,
): string {
  const normalized = transliterateToAscii(value.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized.length > 0) {
    return normalized;
  }

  const normalizedFallback = transliterateToAscii(fallback.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedFallback.length > 0
    ? normalizedFallback
    : DEFAULT_CIVIC_SLUG_FALLBACK;
}

export function areCivicSlugsUnique<TRecord extends CivicSlugRecord>(
  records: readonly TRecord[],
): boolean {
  const seen = new Set<string>();

  for (const record of records) {
    const slug = normalizeCivicSlug(record.slug);
    if (seen.has(slug)) {
      return false;
    }
    seen.add(slug);
  }

  return true;
}

export function buildCivicSlugMap<TRecord extends CivicSlugRecord>(
  records: readonly TRecord[],
): Map<string, TRecord> {
  const bySlug = new Map<string, TRecord>();

  for (const record of records) {
    const slug = normalizeCivicSlug(record.slug);

    if (bySlug.has(slug)) {
      throw new Error(`Duplicate civic slug: ${slug}`);
    }

    bySlug.set(slug, record);
  }

  return bySlug;
}
