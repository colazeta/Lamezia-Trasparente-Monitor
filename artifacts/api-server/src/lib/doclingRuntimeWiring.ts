import {
  runDoclingProcessorAdapter,
  type DoclingAdapterResult,
  type DoclingProcessorExecutor,
} from "./doclingProcessorAdapter";
import {
  isDoclingEnrichmentEnabled,
  type DoclingEnrichmentDecision,
} from "./doclingEnrichmentPolicy";

const TRUSTED_SHA256_RE = /^[a-f0-9]{64}$/;
const PROCESSOR_VERSION = "2.124.0";
const RUNTIME_MAX_PER_CYCLE = 1;
const RUNTIME_LIMITS = {
  maxBytes: 30 * 1024 * 1024,
  maxPages: 20,
  timeoutMs: 180_000,
} as const;
const WORKER_PROMOTED_REASONS = ["embedded-pdf-container"] as const;

let workerExecutor: DoclingProcessorExecutor | undefined;

export type DoclingRuntimeSummary = {
  eligible: number;
  executorUnavailable: number;
  featureDisabled: number;
  provenanceMissing: number;
  budgetSkipped: number;
  adapterEvaluated: number;
  validated: number;
  skipped: number;
  rejected: number;
  internalErrors: number;
  outcomes: Record<string, number>;
};

export type DoclingRuntimeContext = {
  executor: DoclingProcessorExecutor | undefined;
  remaining: number;
  summary: DoclingRuntimeSummary;
};

export type DoclingRuntimeCandidate = {
  decision: DoclingEnrichmentDecision;
  sourceBytes: Uint8Array;
  expectedSourceSha256: string | null | undefined;
  baselineCharacters: number;
  pages: number | null;
  hasEmbeddedPdf: boolean;
};

/**
 * Worker bootstrap only. The HTTP API process never calls this function, so an
 * API-side scheduler has no executor even if the feature flag is accidentally
 * enabled. Passing undefined is supported for tests/explicit reset.
 */
export function configureWorkerDoclingExecutor(
  executor: DoclingProcessorExecutor | undefined,
): void {
  workerExecutor = executor;
}

export function createDoclingRuntimeContext(): DoclingRuntimeContext {
  return {
    executor: workerExecutor,
    remaining: RUNTIME_MAX_PER_CYCLE,
    summary: {
      eligible: 0,
      executorUnavailable: 0,
      featureDisabled: 0,
      provenanceMissing: 0,
      budgetSkipped: 0,
      adapterEvaluated: 0,
      validated: 0,
      skipped: 0,
      rejected: 0,
      internalErrors: 0,
      outcomes: {},
    },
  };
}

function incrementOutcome(summary: DoclingRuntimeSummary, key: string): void {
  summary.outcomes[key] = (summary.outcomes[key] ?? 0) + 1;
}

function isTrustedSha256(value: string | null | undefined): value is string {
  return typeof value === "string" && TRUSTED_SHA256_RE.test(value);
}

function recordAdapterResult(
  summary: DoclingRuntimeSummary,
  result: DoclingAdapterResult,
): void {
  if (result.status === "validated") {
    summary.validated += 1;
    incrementOutcome(summary, "validated");
    return;
  }
  if (result.status === "skipped") {
    summary.skipped += 1;
    incrementOutcome(summary, `skipped:${result.code}`);
    return;
  }
  summary.rejected += 1;
  incrementOutcome(summary, `rejected:${result.code}`);
}

/**
 * Evaluate one already-observed candidate for worker-side execution.
 *
 * This function never persists or publishes Docling output. A validated result
 * is deliberately reduced to aggregate counters; the derived bytes become
 * unreachable after the call returns. Existing pdf-parse/Markdown behaviour is
 * therefore independent from Docling success/failure.
 */
export async function evaluateDoclingRuntimeCandidate(
  context: DoclingRuntimeContext,
  candidate: DoclingRuntimeCandidate,
): Promise<void> {
  if (
    !candidate.decision.requestStructuredExtraction ||
    candidate.decision.reason !== "embedded-pdf-container"
  ) {
    return;
  }

  context.summary.eligible += 1;
  const trustedSha = isTrustedSha256(candidate.expectedSourceSha256)
    ? candidate.expectedSourceSha256
    : null;
  if (!trustedSha) context.summary.provenanceMissing += 1;

  if (!context.executor) {
    context.summary.executorUnavailable += 1;
    incrementOutcome(context.summary, "executor-unavailable");
    return;
  }

  if (!isDoclingEnrichmentEnabled()) {
    context.summary.featureDisabled += 1;
    incrementOutcome(context.summary, "feature-disabled");
    return;
  }

  if (!trustedSha) {
    incrementOutcome(context.summary, "missing-provenance");
    return;
  }

  if (context.remaining <= 0) {
    context.summary.budgetSkipped += 1;
    incrementOutcome(context.summary, "cycle-budget");
    return;
  }
  context.remaining -= 1;
  context.summary.adapterEvaluated += 1;

  try {
    const result = await runDoclingProcessorAdapter(
      {
        sourceBytes: candidate.sourceBytes,
        expectedSourceSha256: trustedSha,
        reason: "embedded-pdf-container",
        baseline: {
          status: "ok",
          characters: candidate.baselineCharacters,
          pages: candidate.pages,
          hasEmbeddedPdf: candidate.hasEmbeddedPdf,
        },
        processorVersion: PROCESSOR_VERSION,
        limits: RUNTIME_LIMITS,
        requestedOutputs: ["structured-json"],
        executor: context.executor,
      },
      {
        enabled: true,
        promotedReasons: WORKER_PROMOTED_REASONS,
      },
    );
    recordAdapterResult(context.summary, result);
  } catch {
    // Optional derived processing must never change canonical pdf-parse output.
    context.summary.internalErrors += 1;
    incrementOutcome(context.summary, "internal-error");
  }
}
