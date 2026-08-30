export const ALBO_NAVIGATION_FACET_READINESS_SCHEMA_VERSION =
  "albo-navigation-facet-readiness.v1";

export const ALBO_NAVIGATION_FACET_THRESHOLDS = {
  classification_coverage: 0.98,
  area_theme_accuracy: 0.9,
  area_theme_high_confidence_precision: 0.97,
  area_theme_max_fallback_rate: 0.1,
  area_theme_materialisation_coverage: 1,
  action_coverage: 0.7,
  action_precision: 0.95,
  action_min_records_per_option: 5,
} as const;

export const ALBO_AREA_THEME_REVIEWED_METRICS = {
  gold_set_id: "albo-area-theme-gold-set",
  gold_set_version: "2026-08-30.1",
  eligible_records: 21,
  correct_records: 21,
  accuracy: 1,
  high_confidence_records: 21,
  high_confidence_correct_records: 21,
  high_confidence_precision: 1,
  fallback_records: 0,
  fallback_rate: 0,
} as const;

export const ALBO_ACTION_REVIEWED_METRICS = {
  gold_set_id: "albo-area-theme-gold-set",
  gold_set_version: "2026-08-30.1",
  eligible_records: 21,
  assigned_records: 3,
  correct_assigned_records: 3,
  precision: 1,
} as const;

export interface AlboNavigationFacetRecord {
  public_visibility?: unknown;
  classification?: unknown;
  presentation?: unknown;
}

export interface AlboNavigationFacetReadiness {
  schema_version: typeof ALBO_NAVIGATION_FACET_READINESS_SCHEMA_VERSION;
  assessment_version: "2026-08-30.1";
  thresholds: typeof ALBO_NAVIGATION_FACET_THRESHOLDS;
  corpus: {
    visible_records: number;
    publishable_records: number;
  };
  facets: {
    act_family: MissingFacetContractAssessment;
    issuer_organ: MissingFacetContractAssessment;
    area_theme: AreaThemeFacetAssessment;
    action: ActionFacetAssessment;
  };
}

interface MissingFacetContractAssessment {
  contract_status: "missing";
  proxy_field: "classification.act_category" | "classification.sector";
  proxy_meaning: string;
  proxy_populated_records: number;
  proxy_coverage: number;
  required_coverage: number;
  proxy_coverage_pass: boolean;
  reviewed_accuracy: null;
  public_filter_ready: false;
  blocker: string;
}

interface AreaThemeFacetAssessment {
  contract_status: "versioned";
  contract_field: "presentation.area_theme";
  eligible_records: number;
  materialised_records: number;
  materialisation_coverage: number;
  required_materialisation_coverage: number;
  materialisation_pass: boolean;
  reviewed_accuracy: number;
  accuracy_pass: boolean;
  reviewed_high_confidence_precision: number;
  high_confidence_precision_pass: boolean;
  reviewed_fallback_rate: number;
  reviewed_fallback_rate_pass: boolean;
  corpus_fallback_records: number;
  corpus_fallback_rate: number | null;
  corpus_fallback_rate_pass: boolean;
  public_filter_ready: boolean;
  blocker: string | null;
}

interface ActionFacetAssessment {
  contract_status: "versioned";
  contract_field: "presentation.action_id";
  eligible_records: number;
  assigned_records: number;
  coverage: number;
  required_coverage: number;
  coverage_pass: boolean;
  reviewed_precision: number;
  required_precision: number;
  precision_pass: boolean;
  option_counts: Record<string, number>;
  minimum_records_per_option: number;
  required_minimum_records_per_option: number;
  minimum_per_option_pass: boolean;
  public_filter_ready: boolean;
  blocker: string | null;
}

/**
 * Measures only public projection fields. The existing act-category and sector
 * classifiers are reported as proxies, never promoted to missing contracts.
 */
export function assessAlboNavigationFacetReadiness(
  records: readonly AlboNavigationFacetRecord[],
): AlboNavigationFacetReadiness {
  const visible = records.filter(
    (record) => record.public_visibility !== "do_not_publish",
  );
  const publishable = visible.filter(
    (record) => record.public_visibility === "publishable",
  );

  const actCategoryPopulated = visible.filter((record) => {
    const id = nestedString(record.classification, "act_category", "id");
    return Boolean(id && id !== "non_classificato");
  }).length;
  const sectorPopulated = visible.filter((record) => {
    const id = nestedString(record.classification, "sector", "id");
    return Boolean(id && id !== "non_classificato");
  }).length;

  const materialisedAreaThemes = publishable.flatMap((record) => {
    const assignment = nestedObject(record.presentation, "area_theme");
    return assignment ? [assignment] : [];
  });
  const materialisedAreaThemeCount = materialisedAreaThemes.length;
  const materialisationCoverage = ratio(
    materialisedAreaThemeCount,
    publishable.length,
  );
  const materialisationPass =
    materialisationCoverage >=
    ALBO_NAVIGATION_FACET_THRESHOLDS.area_theme_materialisation_coverage;
  const accuracyPass =
    ALBO_AREA_THEME_REVIEWED_METRICS.accuracy >=
    ALBO_NAVIGATION_FACET_THRESHOLDS.area_theme_accuracy;
  const highConfidencePrecisionPass =
    ALBO_AREA_THEME_REVIEWED_METRICS.high_confidence_precision >=
    ALBO_NAVIGATION_FACET_THRESHOLDS.area_theme_high_confidence_precision;
  const reviewedFallbackRatePass =
    ALBO_AREA_THEME_REVIEWED_METRICS.fallback_rate <=
    ALBO_NAVIGATION_FACET_THRESHOLDS.area_theme_max_fallback_rate;
  const corpusFallbackRecords = materialisedAreaThemes.filter(
    (assignment) => !nestedString(assignment, "theme_id"),
  ).length;
  const corpusFallbackRate = materialisedAreaThemeCount
    ? ratio(corpusFallbackRecords, materialisedAreaThemeCount)
    : null;
  const corpusFallbackRatePass =
    corpusFallbackRate !== null &&
    corpusFallbackRate <=
      ALBO_NAVIGATION_FACET_THRESHOLDS.area_theme_max_fallback_rate;

  const optionCounts: Record<string, number> = {};
  for (const record of publishable) {
    const actionId = nestedString(record.presentation, "action_id");
    if (actionId) optionCounts[actionId] = (optionCounts[actionId] ?? 0) + 1;
  }
  const assignedActions = Object.values(optionCounts).reduce(
    (total, count) => total + count,
    0,
  );
  const actionCoverage = ratio(assignedActions, publishable.length);
  const actionCoveragePass =
    actionCoverage >= ALBO_NAVIGATION_FACET_THRESHOLDS.action_coverage;
  const actionPrecisionPass =
    ALBO_ACTION_REVIEWED_METRICS.precision >=
    ALBO_NAVIGATION_FACET_THRESHOLDS.action_precision;
  const minimumRecordsPerOption = Object.keys(optionCounts).length
    ? Math.min(...Object.values(optionCounts))
    : 0;
  const minimumPerOptionPass =
    minimumRecordsPerOption >=
    ALBO_NAVIGATION_FACET_THRESHOLDS.action_min_records_per_option;

  const areaThemeReady =
    materialisationPass &&
    accuracyPass &&
    highConfidencePrecisionPass &&
    reviewedFallbackRatePass &&
    corpusFallbackRatePass;
  const actionReady =
    actionCoveragePass && actionPrecisionPass && minimumPerOptionPass;

  return {
    schema_version: ALBO_NAVIGATION_FACET_READINESS_SCHEMA_VERSION,
    assessment_version: "2026-08-30.1",
    thresholds: ALBO_NAVIGATION_FACET_THRESHOLDS,
    corpus: {
      visible_records: visible.length,
      publishable_records: publishable.length,
    },
    facets: {
      act_family: missingContractAssessment({
        contractName: "act_family",
        proxyField: "classification.act_category",
        proxyMeaning:
          "Categoria civica derivata dalla tipologia: utile come proxy di copertura, ma non e' ancora un contratto act_family.",
        populated: actCategoryPopulated,
        total: visible.length,
      }),
      issuer_organ: missingContractAssessment({
        contractName: "issuer/organ",
        proxyField: "classification.sector",
        proxyMeaning:
          "Settore civico derivato da provenienza e tipo atto: non identifica in modo affidabile issuer o organo.",
        populated: sectorPopulated,
        total: visible.length,
      }),
      area_theme: {
        contract_status: "versioned",
        contract_field: "presentation.area_theme",
        eligible_records: publishable.length,
        materialised_records: materialisedAreaThemeCount,
        materialisation_coverage: materialisationCoverage,
        required_materialisation_coverage:
          ALBO_NAVIGATION_FACET_THRESHOLDS.area_theme_materialisation_coverage,
        materialisation_pass: materialisationPass,
        reviewed_accuracy: ALBO_AREA_THEME_REVIEWED_METRICS.accuracy,
        accuracy_pass: accuracyPass,
        reviewed_high_confidence_precision:
          ALBO_AREA_THEME_REVIEWED_METRICS.high_confidence_precision,
        high_confidence_precision_pass: highConfidencePrecisionPass,
        reviewed_fallback_rate: ALBO_AREA_THEME_REVIEWED_METRICS.fallback_rate,
        reviewed_fallback_rate_pass: reviewedFallbackRatePass,
        corpus_fallback_records: corpusFallbackRecords,
        corpus_fallback_rate: corpusFallbackRate,
        corpus_fallback_rate_pass: corpusFallbackRatePass,
        public_filter_ready: areaThemeReady,
        blocker: areaThemeReady
          ? null
          : "Il contratto non e' ancora materializzato su tutti i record pubblicabili del corpus corrente.",
      },
      action: {
        contract_status: "versioned",
        contract_field: "presentation.action_id",
        eligible_records: publishable.length,
        assigned_records: assignedActions,
        coverage: actionCoverage,
        required_coverage: ALBO_NAVIGATION_FACET_THRESHOLDS.action_coverage,
        coverage_pass: actionCoveragePass,
        reviewed_precision: ALBO_ACTION_REVIEWED_METRICS.precision,
        required_precision: ALBO_NAVIGATION_FACET_THRESHOLDS.action_precision,
        precision_pass: actionPrecisionPass,
        option_counts: sortedCounts(optionCounts),
        minimum_records_per_option: minimumRecordsPerOption,
        required_minimum_records_per_option:
          ALBO_NAVIGATION_FACET_THRESHOLDS.action_min_records_per_option,
        minimum_per_option_pass: minimumPerOptionPass,
        public_filter_ready: actionReady,
        blocker: actionReady
          ? null
          : "Copertura e numerosita' per opzione insufficienti per un filtro leggibile.",
      },
    },
  };
}

function missingContractAssessment(input: {
  contractName: "act_family" | "issuer/organ";
  proxyField: MissingFacetContractAssessment["proxy_field"];
  proxyMeaning: string;
  populated: number;
  total: number;
}): MissingFacetContractAssessment {
  const coverage = ratio(input.populated, input.total);
  const coveragePass =
    coverage >= ALBO_NAVIGATION_FACET_THRESHOLDS.classification_coverage;
  return {
    contract_status: "missing",
    proxy_field: input.proxyField,
    proxy_meaning: input.proxyMeaning,
    proxy_populated_records: input.populated,
    proxy_coverage: coverage,
    required_coverage: ALBO_NAVIGATION_FACET_THRESHOLDS.classification_coverage,
    proxy_coverage_pass: coveragePass,
    reviewed_accuracy: null,
    public_filter_ready: false,
    blocker: coveragePass
      ? `Contratto ${input.contractName} assente; la proxy non dispone di accuratezza revisionata.`
      : `Contratto ${input.contractName} assente; la proxy non raggiunge il 98% e non dispone di accuratezza revisionata.`,
  };
}

function nestedObject(
  value: unknown,
  key: string,
): Record<string, unknown> | null;
function nestedObject(
  value: unknown,
  firstKey: string,
  secondKey: string,
): Record<string, unknown> | null;
function nestedObject(
  value: unknown,
  firstKey: string,
  secondKey?: string,
): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const first = (value as Record<string, unknown>)[firstKey];
  const candidate = secondKey
    ? first && typeof first === "object" && !Array.isArray(first)
      ? (first as Record<string, unknown>)[secondKey]
      : null
    : first;
  return candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? (candidate as Record<string, unknown>)
    : null;
}

function nestedString(
  value: unknown,
  firstKey: string,
  secondKey?: string,
): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const first = (value as Record<string, unknown>)[firstKey];
  const candidate = secondKey
    ? first && typeof first === "object" && !Array.isArray(first)
      ? (first as Record<string, unknown>)[secondKey]
      : null
    : first;
  return typeof candidate === "string" && candidate.trim() ? candidate : null;
}

function ratio(numerator: number, denominator: number): number {
  return denominator ? numerator / denominator : 0;
}

function sortedCounts(counts: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) =>
      left.localeCompare(right, "en"),
    ),
  );
}
