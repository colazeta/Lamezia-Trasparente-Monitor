import { createHash } from "node:crypto";
import {
  buildDoclingProcessorRequest,
  parseDoclingProcessorResultForRequest,
  type DoclingContractReason,
  type DoclingOutputKind,
  type DoclingProcessorLimits,
  type DoclingProcessorRequest,
  type DoclingProcessorResult,
} from "./doclingProcessorContract";
import { isDoclingEnrichmentEnabled } from "./doclingEnrichmentPolicy";

/**
 * No reason is promoted through the adapter's global default policy. Runtime
 * promotion remains worker-local and separately feature-gated.
 */
export const DOCLING_PROMOTED_REASONS: readonly DoclingContractReason[] = [];

export type DoclingAdapterBaseline = {
  status: "ok" | "failed" | "not-run";
  characters: number | null;
  pages: number | null;
  hasEmbeddedPdf: boolean;
};

export type DoclingExecutorArtifacts = Partial<
  Record<DoclingOutputKind, Uint8Array>
>;

export type DoclingExecutorOutcome = {
  result: unknown;
  artifacts: DoclingExecutorArtifacts;
  /**
   * For container transforms, the executor returns the exact child bytes only
   * so this trusted boundary can independently verify the processor-declared
   * SHA/size. The bytes are never persisted or exposed by the adapter result.
   */
  derivedSourceBytes?: Uint8Array;
};

export type DoclingProcessorExecutor = (input: {
  request: DoclingProcessorRequest;
  sourceBytes: Uint8Array;
  signal: AbortSignal;
}) => Promise<DoclingExecutorOutcome>;

export type DoclingAdapterPolicy = {
  enabled: boolean;
  promotedReasons: readonly DoclingContractReason[];
};

export type DoclingAdapterResult =
  | {
      status: "skipped";
      code: "feature-disabled" | "policy-not-promoted";
    }
  | {
      status: "rejected";
      code:
        | "source-hash-mismatch"
        | "request-invalid"
        | "executor-timeout"
        | "executor-error"
        | "executor-outcome-invalid"
        | "source-bytes-mutated"
        | "processor-result-invalid"
        | "derived-source-missing"
        | "derived-source-unexpected"
        | "derived-source-size-mismatch"
        | "derived-source-hash-mismatch"
        | "derived-source-format-invalid"
        | "artifact-set-invalid"
        | "artifact-size-mismatch"
        | "artifact-hash-mismatch"
        | "structured-json-invalid";
    }
  | {
      status: "validated";
      request: DoclingProcessorRequest;
      result: DoclingProcessorResult;
      artifacts: DoclingExecutorArtifacts;
    };

export type RunDoclingAdapterInput = {
  sourceBytes: Uint8Array;
  expectedSourceSha256: string;
  reason: DoclingContractReason;
  baseline: DoclingAdapterBaseline;
  processorVersion: string;
  limits: DoclingProcessorLimits;
  executor: DoclingProcessorExecutor;
  requestedOutputs?: DoclingOutputKind[];
};

class DoclingExecutorTimeoutError extends Error {
  constructor() {
    super("Docling executor timed out");
    this.name = "DoclingExecutorTimeoutError";
  }
}

function sha256Bytes(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function defaultPolicy(): DoclingAdapterPolicy {
  return {
    enabled: isDoclingEnrichmentEnabled(),
    promotedReasons: DOCLING_PROMOTED_REASONS,
  };
}

function isPromoted(
  reason: DoclingContractReason,
  promotedReasons: readonly DoclingContractReason[],
): boolean {
  return promotedReasons.includes(reason);
}

async function executeWithTimeout(
  executor: DoclingProcessorExecutor,
  request: DoclingProcessorRequest,
  sourceBytes: Uint8Array,
): Promise<DoclingExecutorOutcome> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new DoclingExecutorTimeoutError());
      controller.abort();
    }, request.limits.timeoutMs);
  });

  try {
    return await Promise.race([
      executor({ request, sourceBytes, signal: controller.signal }),
      timeout,
    ]);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new DoclingExecutorTimeoutError();
    }
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function cloneExecutorArtifacts(value: unknown): DoclingExecutorArtifacts | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const cloned: DoclingExecutorArtifacts = {};
  for (const [kind, bytes] of Object.entries(value as Record<string, unknown>)) {
    if (kind !== "structured-json" && kind !== "markdown") return null;
    if (!(bytes instanceof Uint8Array)) return null;
    cloned[kind] = new Uint8Array(bytes);
  }
  return cloned;
}

function cloneOptionalBytes(value: unknown): Uint8Array | null | undefined {
  if (value === undefined) return undefined;
  if (!(value instanceof Uint8Array)) return null;
  return new Uint8Array(value);
}

function validateDerivedSourceBytes(
  result: DoclingProcessorResult,
  derivedSourceBytes: Uint8Array | undefined,
): DoclingAdapterResult | null {
  if (result.status !== "ok") {
    return derivedSourceBytes === undefined
      ? null
      : { status: "rejected", code: "derived-source-unexpected" };
  }

  if (!result.derivedSource) {
    return derivedSourceBytes === undefined
      ? null
      : { status: "rejected", code: "derived-source-unexpected" };
  }
  if (!derivedSourceBytes) {
    return { status: "rejected", code: "derived-source-missing" };
  }
  if (derivedSourceBytes.byteLength !== result.derivedSource.sizeBytes) {
    return { status: "rejected", code: "derived-source-size-mismatch" };
  }
  if (sha256Bytes(derivedSourceBytes) !== result.derivedSource.sha256) {
    return { status: "rejected", code: "derived-source-hash-mismatch" };
  }
  const pdfMagic = new TextDecoder("ascii").decode(
    derivedSourceBytes.subarray(0, Math.min(5, derivedSourceBytes.byteLength)),
  );
  if (pdfMagic !== "%PDF-") {
    return { status: "rejected", code: "derived-source-format-invalid" };
  }
  return null;
}

function validateArtifactBytes(
  result: DoclingProcessorResult,
  artifacts: DoclingExecutorArtifacts,
): DoclingAdapterResult | null {
  const suppliedKinds = Object.keys(artifacts).filter(
    (kind) => artifacts[kind as DoclingOutputKind] !== undefined,
  );

  if (result.status !== "ok") {
    return suppliedKinds.length === 0
      ? null
      : { status: "rejected", code: "artifact-set-invalid" };
  }

  const expectedKinds = result.artifacts.map((artifact) => artifact.kind);
  if (
    suppliedKinds.length !== expectedKinds.length ||
    suppliedKinds.some((kind) => !expectedKinds.includes(kind as DoclingOutputKind))
  ) {
    return { status: "rejected", code: "artifact-set-invalid" };
  }

  for (const artifact of result.artifacts) {
    const bytes = artifacts[artifact.kind];
    if (!bytes) {
      return { status: "rejected", code: "artifact-set-invalid" };
    }
    if (bytes.byteLength !== artifact.sizeBytes) {
      return { status: "rejected", code: "artifact-size-mismatch" };
    }
    if (sha256Bytes(bytes) !== artifact.contentSha256) {
      return { status: "rejected", code: "artifact-hash-mismatch" };
    }

    if (artifact.kind === "structured-json") {
      try {
        const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        const parsed = JSON.parse(text) as unknown;
        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
          return { status: "rejected", code: "structured-json-invalid" };
        }
      } catch {
        return { status: "rejected", code: "structured-json-invalid" };
      }
    }
  }

  return null;
}

/**
 * Trusted Node-side boundary for the separate Docling processor.
 *
 * The adapter validates the immutable parent source, the request/result
 * identity, the derived child-PDF bytes for container transforms, and all
 * requested output artifacts. It never persists or publishes derived bytes.
 */
export async function runDoclingProcessorAdapter(
  input: RunDoclingAdapterInput,
  policy: DoclingAdapterPolicy = defaultPolicy(),
): Promise<DoclingAdapterResult> {
  if (!policy.enabled) {
    return { status: "skipped", code: "feature-disabled" };
  }
  if (!isPromoted(input.reason, policy.promotedReasons)) {
    return { status: "skipped", code: "policy-not-promoted" };
  }

  const sourceBytes = new Uint8Array(input.sourceBytes);
  const sourceSha256 = sha256Bytes(sourceBytes);
  if (sourceSha256 !== input.expectedSourceSha256) {
    return { status: "rejected", code: "source-hash-mismatch" };
  }

  let request: DoclingProcessorRequest;
  try {
    request = buildDoclingProcessorRequest({
      source: {
        sha256: sourceSha256,
        contentType: "application/pdf",
        sizeBytes: sourceBytes.byteLength,
      },
      reason: input.reason,
      baseline: input.baseline,
      processorVersion: input.processorVersion,
      limits: input.limits,
      requestedOutputs: input.requestedOutputs ?? ["structured-json"],
    });
  } catch {
    return { status: "rejected", code: "request-invalid" };
  }

  const transportBytes = new Uint8Array(sourceBytes);
  let outcome: DoclingExecutorOutcome;
  try {
    outcome = await executeWithTimeout(input.executor, request, transportBytes);
  } catch (error) {
    return {
      status: "rejected",
      code:
        error instanceof DoclingExecutorTimeoutError
          ? "executor-timeout"
          : "executor-error",
    };
  }

  if (sha256Bytes(transportBytes) !== sourceSha256) {
    return { status: "rejected", code: "source-bytes-mutated" };
  }

  if (
    outcome === null ||
    typeof outcome !== "object" ||
    !("result" in outcome) ||
    !("artifacts" in outcome)
  ) {
    return { status: "rejected", code: "executor-outcome-invalid" };
  }

  const artifacts = cloneExecutorArtifacts(outcome.artifacts);
  const derivedSourceBytes = cloneOptionalBytes(outcome.derivedSourceBytes);
  if (!artifacts || derivedSourceBytes === null) {
    return { status: "rejected", code: "executor-outcome-invalid" };
  }

  let result: DoclingProcessorResult;
  try {
    result = parseDoclingProcessorResultForRequest(request, outcome.result);
  } catch {
    return { status: "rejected", code: "processor-result-invalid" };
  }

  const derivedSourceError = validateDerivedSourceBytes(
    result,
    derivedSourceBytes,
  );
  if (derivedSourceError) return derivedSourceError;

  const artifactError = validateArtifactBytes(result, artifacts);
  if (artifactError) return artifactError;

  return {
    status: "validated",
    request,
    result,
    artifacts,
  };
}
