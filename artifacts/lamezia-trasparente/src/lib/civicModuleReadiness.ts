export type CivicModuleId = string;

export type CivicModuleArea =
  | "administration"
  | "assets"
  | "civic_access"
  | "monitoring"
  | "participation"
  | "procurement"
  | "other";

export type ReadinessLevel =
  | "demo_only"
  | "source_not_configured"
  | "methodology_partial"
  | "ready_for_future_exposure"
  | "future_exposure_blocked"
  | "not_publishable";

export type SourceCoverageStatus =
  | "not_configured"
  | "demo_only"
  | "documented_partial"
  | "documented";

export type MethodologyStatus = "missing" | "partial" | "documented";

export type ExposureIntent = "internal_only" | "future_public" | "blocked";

export type NotPublishableReason =
  | "source_not_configured"
  | "methodology_missing"
  | "demo_flag_missing"
  | "demo_only"
  | "future_exposure_blocked";

export interface CivicModuleReadinessInput {
  readonly id: CivicModuleId;
  readonly area: CivicModuleArea;
  readonly sourceCoverage: SourceCoverageStatus;
  readonly methodology: MethodologyStatus;
  readonly demoMode?: boolean;
  readonly exposureIntent?: ExposureIntent;
}

export interface CivicModuleReadinessReport {
  readonly id: CivicModuleId;
  readonly slug: CivicModuleId;
  readonly area: CivicModuleArea;
  readonly readiness: ReadinessLevel;
  readonly sourceCoverage: SourceCoverageStatus;
  readonly methodology: MethodologyStatus;
  readonly demoMode: boolean | null;
  readonly exposureIntent: ExposureIntent;
  readonly publishable: boolean;
  readonly notPublishableReasons: readonly NotPublishableReason[];
  readonly technicalReasons: readonly string[];
}

export interface CivicModuleReadinessCounts {
  readonly byReadiness: Record<ReadinessLevel, number>;
  readonly byArea: Record<CivicModuleArea, number>;
  readonly bySourceCoverage: Record<SourceCoverageStatus, number>;
}

export interface CivicModuleReadinessMatrix {
  readonly reports: readonly CivicModuleReadinessReport[];
  readonly counts: CivicModuleReadinessCounts;
  readonly notPublishableRecords: readonly CivicModuleReadinessReport[];
}

const READINESS_LEVELS: readonly ReadinessLevel[] = [
  "demo_only",
  "source_not_configured",
  "methodology_partial",
  "ready_for_future_exposure",
  "future_exposure_blocked",
  "not_publishable",
];

const CIVIC_MODULE_AREAS: readonly CivicModuleArea[] = [
  "administration",
  "assets",
  "civic_access",
  "monitoring",
  "participation",
  "procurement",
  "other",
];

const SOURCE_COVERAGE_STATUSES: readonly SourceCoverageStatus[] = [
  "not_configured",
  "demo_only",
  "documented_partial",
  "documented",
];

const DEFAULT_EXPOSURE_INTENT: ExposureIntent = "internal_only";

export function normalizeCivicModuleId(value: string): CivicModuleId {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "module";
}

export function civicModuleSlug(value: CivicModuleId): CivicModuleId {
  return normalizeCivicModuleId(value);
}

export function classifyCivicModuleReadiness(
  input: CivicModuleReadinessInput,
): ReadinessLevel {
  const exposureIntent = input.exposureIntent ?? DEFAULT_EXPOSURE_INTENT;
  const reasons = collectNotPublishableReasons(input);

  if (reasons.includes("demo_flag_missing")) {
    return "not_publishable";
  }

  if (reasons.includes("demo_only")) {
    return "demo_only";
  }

  if (reasons.includes("source_not_configured")) {
    return "source_not_configured";
  }

  if (reasons.includes("methodology_missing")) {
    return "not_publishable";
  }

  if (exposureIntent === "blocked") {
    return "future_exposure_blocked";
  }

  if (
    input.methodology === "partial" ||
    input.sourceCoverage === "documented_partial"
  ) {
    return "methodology_partial";
  }

  return "ready_for_future_exposure";
}

export function createCivicModuleReadinessReport(
  input: CivicModuleReadinessInput,
): CivicModuleReadinessReport {
  const exposureIntent = input.exposureIntent ?? DEFAULT_EXPOSURE_INTENT;
  const notPublishableReasons = collectNotPublishableReasons(input);
  const readiness = classifyCivicModuleReadiness(input);

  return {
    id: input.id,
    slug: civicModuleSlug(input.id),
    area: input.area,
    readiness,
    sourceCoverage: input.sourceCoverage,
    methodology: input.methodology,
    demoMode: input.demoMode ?? null,
    exposureIntent,
    publishable: notPublishableReasons.length === 0 && exposureIntent === "future_public",
    notPublishableReasons,
    technicalReasons: buildTechnicalReasons({
      ...input,
      exposureIntent,
    }, readiness, notPublishableReasons),
  };
}

export function createCivicModuleReadinessMatrix(
  inputs: readonly CivicModuleReadinessInput[],
): CivicModuleReadinessMatrix {
  const reports = sortCivicModuleReadinessReports(
    inputs.map((input) => createCivicModuleReadinessReport(input)),
  );

  return {
    reports,
    counts: countCivicModuleReadinessReports(reports),
    notPublishableRecords: reports.filter((report) => !report.publishable),
  };
}

export function sortCivicModuleReadinessReports(
  reports: readonly CivicModuleReadinessReport[],
): CivicModuleReadinessReport[] {
  return [...reports].sort((left, right) => {
    const areaComparison = left.area.localeCompare(right.area);

    if (areaComparison !== 0) {
      return areaComparison;
    }

    const readinessComparison = left.readiness.localeCompare(right.readiness);

    if (readinessComparison !== 0) {
      return readinessComparison;
    }

    return left.slug.localeCompare(right.slug);
  });
}

export function countCivicModuleReadinessReports(
  reports: readonly CivicModuleReadinessReport[],
): CivicModuleReadinessCounts {
  const byReadiness = createZeroCounts(READINESS_LEVELS);
  const byArea = createZeroCounts(CIVIC_MODULE_AREAS);
  const bySourceCoverage = createZeroCounts(SOURCE_COVERAGE_STATUSES);

  for (const report of reports) {
    byReadiness[report.readiness] += 1;
    byArea[report.area] += 1;
    bySourceCoverage[report.sourceCoverage] += 1;
  }

  return {
    byReadiness,
    byArea,
    bySourceCoverage,
  };
}

export function findNotPublishableCivicModuleRecords(
  reports: readonly CivicModuleReadinessReport[],
): CivicModuleReadinessReport[] {
  return reports.filter((report) => !report.publishable);
}

function collectNotPublishableReasons(
  input: CivicModuleReadinessInput,
): NotPublishableReason[] {
  const exposureIntent = input.exposureIntent ?? DEFAULT_EXPOSURE_INTENT;
  const reasons: NotPublishableReason[] = [];

  if (input.sourceCoverage === "not_configured") {
    reasons.push("source_not_configured");
  }

  if (input.methodology === "missing") {
    reasons.push("methodology_missing");
  }

  if (typeof input.demoMode !== "boolean") {
    reasons.push("demo_flag_missing");
  }

  if (input.demoMode === true || input.sourceCoverage === "demo_only") {
    reasons.push("demo_only");
  }

  if (exposureIntent === "blocked") {
    reasons.push("future_exposure_blocked");
  }

  return reasons;
}

function buildTechnicalReasons(
  input: CivicModuleReadinessInput & { readonly exposureIntent: ExposureIntent },
  readiness: ReadinessLevel,
  notPublishableReasons: readonly NotPublishableReason[],
): string[] {
  if (notPublishableReasons.length > 0) {
    return notPublishableReasons.map((reason) => `readiness:${reason}`);
  }

  if (readiness === "methodology_partial") {
    return ["readiness:methodology_or_source_partial"];
  }

  if (input.exposureIntent === "future_public") {
    return ["readiness:technical_preconditions_present"];
  }

  return ["readiness:kept_internal_without_public_exposure_intent"];
}

function createZeroCounts<const T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
}
