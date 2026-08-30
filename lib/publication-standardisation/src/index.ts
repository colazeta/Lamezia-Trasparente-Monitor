export const PUBLICATION_STANDARDISATION_SCHEMA_VERSION =
  "publication-standardisation.v1";

export type PublicationStandardisationStatus =
  | "unchanged"
  | "standardised_automatically"
  | "review_required";

export type PublicationLayoutFlag = "display_title_too_long";

export interface CanonicalTerm {
  match: string;
  display: string;
}

export interface ActionPrefixRule {
  id: string;
  label: string;
  prefixes: readonly string[];
  allow_bare_remainder?: boolean;
}

export interface PublicationStandardisationProfile {
  id: string;
  version: string;
  locale: string;
  max_display_length: number;
  canonical_terms?: readonly CanonicalTerm[];
  action_prefixes?: readonly ActionPrefixRule[];
}

export interface PublicationStandardisationAudit {
  schema_version: typeof PUBLICATION_STANDARDISATION_SCHEMA_VERSION;
  profile_id: string;
  profile_version: string;
  input_field: string;
  input_field_preserved: true;
  status: PublicationStandardisationStatus;
  transformations: string[];
  layout_flags: PublicationLayoutFlag[];
  review_reasons: string[];
}

export interface PublicationPresentation {
  display_title: string;
  action_id: string | null;
  action_label: string | null;
  search_text: string;
  standardisation: PublicationStandardisationAudit;
}

export interface PublicationStandardisationDescriptor {
  schema_version: typeof PUBLICATION_STANDARDISATION_SCHEMA_VERSION;
  profile_id: string;
  profile_version: string;
  locale: string;
  stage: "after_public_safety_before_publication";
  execution: "deterministic_rules";
  input_values_preserved: true;
  generative_rewriting: false;
  ambiguous_cases: "review_required";
}

export interface StandardisePublicationTitleInput {
  input_text: string | null | undefined;
  input_field: string;
  profile: PublicationStandardisationProfile;
}

export function publicationStandardisationDescriptor(
  profile: PublicationStandardisationProfile,
): PublicationStandardisationDescriptor {
  return {
    schema_version: PUBLICATION_STANDARDISATION_SCHEMA_VERSION,
    profile_id: profile.id,
    profile_version: profile.version,
    locale: profile.locale,
    stage: "after_public_safety_before_publication",
    execution: "deterministic_rules",
    input_values_preserved: true,
    generative_rewriting: false,
    ambiguous_cases: "review_required",
  };
}

export function standardisePublicationTitle(
  input: StandardisePublicationTitleInput,
): PublicationPresentation | null {
  if (typeof input.input_text !== "string" || !input.input_text.trim()) {
    return null;
  }

  const transformations: string[] = [];
  const layoutFlags: PublicationLayoutFlag[] = [];
  const reviewReasons: string[] = [];
  const inputText = input.input_text;
  let cleaned = inputText.normalize("NFC");

  if (cleaned !== inputText) transformations.push("unicode_nfc");

  const apostrophesNormalised = cleaned.replace(
    /[\u2018\u2019\u0060\u00b4]/gu,
    "'",
  );
  if (apostrophesNormalised !== cleaned) {
    transformations.push("normalise_apostrophes");
    cleaned = apostrophesNormalised;
  }

  const whitespaceNormalised = cleaned.replace(/[\s\u00a0]+/gu, " ").trim();
  if (whitespaceNormalised !== cleaned) {
    transformations.push("collapse_whitespace");
    cleaned = whitespaceNormalised;
  }

  const punctuationTightened = cleaned.replace(/\s+([,.;:!?])/gu, "$1");
  if (punctuationTightened !== cleaned) {
    transformations.push("tighten_punctuation");
    cleaned = punctuationTightened;
  }

  const apostropheTightened = cleaned.replace(
    /\b((?:l|d|all|dall|dell|nell|sull|un|quest|quell|sant)')\s+(?=\p{L})/giu,
    "$1",
  );
  if (apostropheTightened !== cleaned) {
    transformations.push("tighten_apostrophe");
    cleaned = apostropheTightened;
  }

  const action = detectActionPrefix(
    cleaned,
    input.profile.action_prefixes ?? [],
  );
  let displayTitle = cleaned;

  const casing = letterCasing(displayTitle, input.profile.locale);
  if (casing === "upper" || casing === "lower") {
    displayTitle = sentenceCase(displayTitle, input.profile.locale);
    transformations.push("sentence_case");
  } else if (casing === "mostly_upper") {
    reviewReasons.push("inconsistent_casing");
  }

  const initialCapitalised = capitaliseInitial(
    displayTitle,
    input.profile.locale,
  );
  if (initialCapitalised !== displayTitle) {
    transformations.push("capitalise_initial");
    displayTitle = initialCapitalised;
  }

  const canonicalised = restoreCanonicalTerms(
    displayTitle,
    input.profile.canonical_terms ?? [],
  );
  if (canonicalised !== displayTitle) {
    transformations.push("restore_canonical_terms");
    displayTitle = canonicalised;
  }

  if (displayTitle.length > input.profile.max_display_length) {
    layoutFlags.push("display_title_too_long");
  }
  if (!balanced(displayTitle, "(", ")") || !balanced(displayTitle, "[", "]")) {
    reviewReasons.push("unbalanced_delimiters");
  }
  if (/(?:[!?;,]{2,}|\.{4,})/u.test(displayTitle)) {
    reviewReasons.push("repeated_punctuation");
  }

  const uniqueTransformations = unique(transformations);
  const uniqueLayoutFlags = uniqueLayoutValues(layoutFlags);
  const uniqueReviewReasons = unique(reviewReasons);
  const status: PublicationStandardisationStatus = uniqueReviewReasons.length
    ? "review_required"
    : uniqueTransformations.length
      ? "standardised_automatically"
      : "unchanged";

  const searchSource =
    displayTitle === cleaned ? displayTitle : `${displayTitle} ${cleaned}`;

  return {
    display_title: displayTitle,
    action_id: action?.id ?? null,
    action_label: action?.label ?? null,
    search_text: normaliseSearchText(searchSource, input.profile.locale),
    standardisation: {
      schema_version: PUBLICATION_STANDARDISATION_SCHEMA_VERSION,
      profile_id: input.profile.id,
      profile_version: input.profile.version,
      input_field: input.input_field,
      input_field_preserved: true,
      status,
      transformations: uniqueTransformations,
      layout_flags: uniqueLayoutFlags,
      review_reasons: uniqueReviewReasons,
    },
  };
}

export function normaliseSearchText(value: string, locale = "it-IT"): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase(locale)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

function detectActionPrefix(
  value: string,
  rules: readonly ActionPrefixRule[],
): { id: string; label: string } | null {
  for (const rule of rules) {
    for (const prefix of rule.prefixes) {
      const escapedPrefix = escapeRegExp(prefix);
      const qualifiedConnector =
        "(?:\\s*[:\\-\\u2013\\u2014]\\s*|\\s+(?:di|del|dello|della|dei|degli|delle)\\s+)";
      const connector = rule.allow_bare_remainder
        ? `(?:${qualifiedConnector}|\\s+)`
        : qualifiedConnector;
      const match = new RegExp(`^${escapedPrefix}${connector}(.+)$`, "iu").exec(
        value,
      );
      const remainder = match?.[1]?.trim();
      if (remainder && !/^(?:e|ed|o|ovvero)\b/iu.test(remainder)) {
        return { id: rule.id, label: rule.label };
      }
    }
  }
  return null;
}

function uniqueLayoutValues(
  values: PublicationLayoutFlag[],
): PublicationLayoutFlag[] {
  return [...new Set(values)];
}

function letterCasing(
  value: string,
  locale: string,
): "upper" | "lower" | "mixed" | "mostly_upper" | "none" {
  const letters = [...value].filter((character) => /\p{L}/u.test(character));
  if (!letters.length) return "none";

  const upper = letters.filter(
    (character) =>
      character === character.toLocaleUpperCase(locale) &&
      character !== character.toLocaleLowerCase(locale),
  ).length;
  const lower = letters.filter(
    (character) =>
      character === character.toLocaleLowerCase(locale) &&
      character !== character.toLocaleUpperCase(locale),
  ).length;

  if (upper > 0 && lower === 0) return "upper";
  if (lower > 0 && upper === 0) return "lower";
  if (upper / Math.max(upper + lower, 1) >= 0.85) return "mostly_upper";
  return "mixed";
}

function sentenceCase(value: string, locale: string): string {
  const lower = value.toLocaleLowerCase(locale);
  const withSentenceStarts = lower.replace(
    /([.!?])(\s+)(\p{L})/gu,
    (
      match: string,
      punctuation: string,
      whitespace: string,
      letter: string,
      offset: number,
      whole: string,
    ) => {
      const before = whole.slice(0, offset + punctuation.length);
      if (punctuation === "." && endsWithAbbreviation(before)) return match;
      return `${punctuation}${whitespace}${letter.toLocaleUpperCase(locale)}`;
    },
  );
  return capitaliseInitial(withSentenceStarts, locale);
}

function endsWithAbbreviation(value: string): boolean {
  return (
    /(?:\b(?:art|artt|n|nn|nr|prot|delib|det|d\.lgs|d\.p\.r|d\.m|l\.r|c\.c|c\.p|c\.p\.c|s\.m\.i|ecc|pag|pagg|sig|sigg|ing|arch|avv|dott)\.)$/iu.test(
      value,
    ) || /(?:\b\p{L}\.){2,}$/u.test(value)
  );
}

function capitaliseInitial(value: string, locale: string): string {
  const firstLetter = value.search(/\p{L}/u);
  if (firstLetter < 0) return value;
  const letter = value[firstLetter] ?? "";
  const upper = letter.toLocaleUpperCase(locale);
  if (letter === upper) return value;
  return `${value.slice(0, firstLetter)}${upper}${value.slice(firstLetter + 1)}`;
}

function restoreCanonicalTerms(
  value: string,
  terms: readonly CanonicalTerm[],
): string {
  return [...terms]
    .filter((term) => term.match.trim() && term.display.trim())
    .sort((left, right) => right.match.length - left.match.length)
    .reduce((current, term) => {
      const expression = new RegExp(
        `(^|[^\\p{L}\\p{N}])${escapeRegExp(term.match)}(?=$|[^\\p{L}\\p{N}])`,
        "giu",
      );
      return current.replace(
        expression,
        (_match, prefix: string) => `${prefix}${term.display}`,
      );
    }, value);
}

function balanced(value: string, opening: string, closing: string): boolean {
  let depth = 0;
  for (const character of value) {
    if (character === opening) depth += 1;
    if (character === closing) depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
