export const PUBLICATION_AREA_THEME_SCHEMA_VERSION =
  "publication-area-theme.v1";

export type PublicationAreaThemeConfidence = "high" | "medium";

export type PublicationAreaThemeNullReason =
  | "input_withheld_for_privacy"
  | "input_missing"
  | "not_classified"
  | "ambiguous_match";

export interface PublicationAreaThemeDefinition {
  /** Stable machine identifier. Reader-facing labels may evolve by version. */
  id: string;
  label: string;
  description: string;
}

export interface PublicationAreaThemeRule {
  id: string;
  theme_id: string;
  confidence: PublicationAreaThemeConfidence;
  /** Resolves intentional overlaps without relying on declaration order. */
  priority: number;
  match: {
    any?: readonly string[];
    all?: readonly string[];
    none?: readonly string[];
  };
}

export interface PublicationAreaThemeTaxonomy {
  id: string;
  version: string;
  locale: string;
  themes: readonly PublicationAreaThemeDefinition[];
  rules: readonly PublicationAreaThemeRule[];
}

export interface PublicationAreaThemeEvidence {
  rule_id: string;
  input_field: string;
  matched_terms: string[];
}

export interface PublicationAreaThemeOverride {
  id: string;
  theme_id: string;
  confidence: PublicationAreaThemeConfidence;
  rationale: string;
}

export interface AppliedPublicationAreaThemeOverride extends PublicationAreaThemeOverride {
  previous_theme_id: string | null;
  previous_rule_id: string | null;
}

export interface PublicationAreaThemeAssignment {
  schema_version: typeof PUBLICATION_AREA_THEME_SCHEMA_VERSION;
  taxonomy_id: string;
  taxonomy_version: string;
  theme_id: string | null;
  theme_label: string | null;
  confidence: PublicationAreaThemeConfidence | null;
  basis: "deterministic_rule" | "manual_override" | "fallback";
  rule_id: string | null;
  evidence: PublicationAreaThemeEvidence[];
  null_reason: PublicationAreaThemeNullReason | null;
  override: AppliedPublicationAreaThemeOverride | null;
}

export interface PublicationAreaThemeInputText {
  field: string;
  value: string | null | undefined;
}

export interface ClassifyPublicationAreaThemeInput {
  taxonomy: PublicationAreaThemeTaxonomy;
  texts: readonly PublicationAreaThemeInputText[];
  availability?: "available" | "withheld_for_privacy" | "missing";
  override?: PublicationAreaThemeOverride | null;
}

interface RuleCandidate {
  rule: PublicationAreaThemeRule;
  evidence: PublicationAreaThemeEvidence[];
  specificity: number;
}

/**
 * Adds a local, explainable navigation facet. It never replaces an official
 * act type, family, issuer, organ or action and only receives public-safe text.
 */
export function classifyPublicationAreaTheme(
  input: ClassifyPublicationAreaThemeInput,
): PublicationAreaThemeAssignment {
  const themes = validateTaxonomy(input.taxonomy);
  const base = assignmentBase(input.taxonomy);

  if (input.availability === "withheld_for_privacy") {
    return {
      ...base,
      basis: "fallback",
      null_reason: "input_withheld_for_privacy",
    };
  }

  const texts = input.texts.flatMap((entry) => {
    if (typeof entry.value !== "string" || !entry.value.trim()) return [];
    return [
      {
        field: entry.field,
        normalised: normaliseForMatching(entry.value, input.taxonomy.locale),
      },
    ];
  });
  if (input.availability === "missing" || !texts.length) {
    return { ...base, basis: "fallback", null_reason: "input_missing" };
  }

  const candidates = input.taxonomy.rules.flatMap((rule) => {
    const evidence = matchRule(rule, texts, input.taxonomy.locale);
    if (!evidence.length) return [];
    return [
      {
        rule,
        evidence,
        specificity: evidence.reduce(
          (total, item) =>
            total +
            item.matched_terms.reduce(
              (subtotal, term) => subtotal + term.split(" ").length,
              0,
            ),
          0,
        ),
      },
    ];
  });

  candidates.sort(compareCandidates);
  const winner = candidates[0];
  let automatic: PublicationAreaThemeAssignment;
  if (!winner) {
    automatic = { ...base, basis: "fallback", null_reason: "not_classified" };
  } else {
    const tied = candidates.filter(
      (candidate) => candidateRank(candidate) === candidateRank(winner),
    );
    const tiedThemeIds = new Set(
      tied.map((candidate) => candidate.rule.theme_id),
    );
    if (tiedThemeIds.size > 1) {
      automatic = {
        ...base,
        basis: "fallback",
        evidence: tied.flatMap((candidate) => candidate.evidence),
        null_reason: "ambiguous_match",
      };
    } else {
      const theme = themes.get(winner.rule.theme_id);
      if (!theme)
        throw new Error(`Unknown area theme: ${winner.rule.theme_id}`);
      automatic = {
        ...base,
        theme_id: theme.id,
        theme_label: theme.label,
        confidence: winner.rule.confidence,
        basis: "deterministic_rule",
        rule_id: winner.rule.id,
        evidence: winner.evidence,
        null_reason: null,
      };
    }
  }

  if (!input.override) return automatic;
  const overrideTheme = themes.get(input.override.theme_id);
  if (!overrideTheme) {
    throw new Error(`Unknown override area theme: ${input.override.theme_id}`);
  }
  if (!input.override.id.trim() || !input.override.rationale.trim()) {
    throw new Error("Area theme overrides require an id and rationale");
  }

  return {
    ...automatic,
    theme_id: overrideTheme.id,
    theme_label: overrideTheme.label,
    confidence: input.override.confidence,
    basis: "manual_override",
    null_reason: null,
    override: {
      ...input.override,
      previous_theme_id: automatic.theme_id,
      previous_rule_id: automatic.rule_id,
    },
  };
}

function assignmentBase(
  taxonomy: PublicationAreaThemeTaxonomy,
): PublicationAreaThemeAssignment {
  return {
    schema_version: PUBLICATION_AREA_THEME_SCHEMA_VERSION,
    taxonomy_id: taxonomy.id,
    taxonomy_version: taxonomy.version,
    theme_id: null,
    theme_label: null,
    confidence: null,
    basis: "fallback",
    rule_id: null,
    evidence: [],
    null_reason: null,
    override: null,
  };
}

function validateTaxonomy(
  taxonomy: PublicationAreaThemeTaxonomy,
): Map<string, PublicationAreaThemeDefinition> {
  if (
    !taxonomy.id.trim() ||
    !taxonomy.version.trim() ||
    !taxonomy.locale.trim()
  ) {
    throw new Error("Area theme taxonomy id, version and locale are required");
  }
  const themes = new Map<string, PublicationAreaThemeDefinition>();
  for (const theme of taxonomy.themes) {
    if (!theme.id.trim() || !theme.label.trim() || !theme.description.trim()) {
      throw new Error("Area theme ids, labels and descriptions are required");
    }
    if (themes.has(theme.id))
      throw new Error(`Duplicate area theme: ${theme.id}`);
    themes.set(theme.id, theme);
  }
  const ruleIds = new Set<string>();
  for (const rule of taxonomy.rules) {
    if (!rule.id.trim()) throw new Error("Area theme rule ids are required");
    if (ruleIds.has(rule.id))
      throw new Error(`Duplicate area theme rule: ${rule.id}`);
    ruleIds.add(rule.id);
    if (!themes.has(rule.theme_id)) {
      throw new Error(`Area theme rule ${rule.id} references ${rule.theme_id}`);
    }
    if (!Number.isInteger(rule.priority)) {
      throw new Error(`Area theme rule ${rule.id} has a non-integer priority`);
    }
    const hasPositiveClause =
      (rule.match.any?.some((term) => term.trim()) ?? false) ||
      (rule.match.all?.some((term) => term.trim()) ?? false);
    if (!hasPositiveClause) {
      throw new Error(
        `Area theme rule ${rule.id} has no positive match clause`,
      );
    }
  }
  return themes;
}

function matchRule(
  rule: PublicationAreaThemeRule,
  texts: readonly { field: string; normalised: string }[],
  locale: string,
): PublicationAreaThemeEvidence[] {
  const any = normaliseTerms(rule.match.any ?? [], locale);
  const all = normaliseTerms(rule.match.all ?? [], locale);
  const none = normaliseTerms(rule.match.none ?? [], locale);
  const joined = texts.map((entry) => entry.normalised).join(" ");

  if (none.some((term) => containsTerm(joined, term))) return [];
  if (all.some((term) => !containsTerm(joined, term))) return [];
  if (any.length && !any.some((term) => containsTerm(joined, term))) return [];

  return texts.flatMap((entry) => {
    const matchedTerms = [...all, ...any].filter((term) =>
      containsTerm(entry.normalised, term),
    );
    return matchedTerms.length
      ? [
          {
            rule_id: rule.id,
            input_field: entry.field,
            matched_terms: [...new Set(matchedTerms)],
          },
        ]
      : [];
  });
}

function normaliseTerms(terms: readonly string[], locale: string): string[] {
  return [
    ...new Set(
      terms.map((term) => normaliseForMatching(term, locale)).filter(Boolean),
    ),
  ];
}

function normaliseForMatching(value: string, locale: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase(locale)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

function containsTerm(value: string, term: string): boolean {
  return ` ${value} `.includes(` ${term} `);
}

function confidenceRank(value: PublicationAreaThemeConfidence): number {
  return value === "high" ? 2 : 1;
}

function candidateRank(candidate: RuleCandidate): string {
  return [
    confidenceRank(candidate.rule.confidence),
    candidate.rule.priority,
    candidate.specificity,
  ].join(":");
}

function compareCandidates(left: RuleCandidate, right: RuleCandidate): number {
  const confidence =
    confidenceRank(right.rule.confidence) -
    confidenceRank(left.rule.confidence);
  if (confidence !== 0) return confidence;
  const priority = right.rule.priority - left.rule.priority;
  if (priority !== 0) return priority;
  const specificity = right.specificity - left.specificity;
  if (specificity !== 0) return specificity;
  return left.rule.id.localeCompare(right.rule.id, "en");
}
