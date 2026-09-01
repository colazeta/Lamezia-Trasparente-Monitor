import { z } from "zod";
import type { DoclingEnrichmentReason } from "./doclingEnrichmentPolicy";

export const DOCLING_PROCESSOR_CONTRACT_VERSION = 1 as const;
export const DOCLING_REPRESENTATION_KIND = "derived-noncanonical" as const;

/**
 * Contract-capable reasons are deliberately narrower than every observation
 * reason. This list only defines what the processor boundary can represent; it
 * does not activate any of them. Promotion to execution remains a separate
 * policy decision behind DOCLING_ENRICHMENT_ENABLED.
 */
export const DOCLING_CONTRACT_REASONS = [
  "embedded-pdf-sparse-baseline",
  "embedded-pdf-container",
  "baseline-failed",
  "scan-like-sparse-baseline",
  "reviewed-layout-class",
] as const satisfies readonly DoclingEnrichmentReason[];

export const DOCLING_OUTPUT_KINDS = ["structured-json", "markdown"] as const;

export type DoclingContractReason = (typeof DOCLING_CONTRACT_REASONS)[number];
export type DoclingOutputKind = (typeof DOCLING_OUTPUT_KINDS)[number];

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const nonNegativeInteger = z.number().int().nonnegative();
const positiveInteger = z.number().int().positive();

const baselineObservationSchema = z
  .object({
    status: z.enum(["ok", "failed", "not-run"]),
    characters: nonNegativeInteger.nullable(),
    pages: positiveInteger.nullable(),
    hasEmbeddedPdf: z.boolean(),
  })
  .strict();

const processorSourceSchema = z
  .object({
    sha256: sha256Schema,
    contentType: z.literal("application/pdf"),
    sizeBytes: positiveInteger,
  })
  .strict();

const processorLimitsSchema = z
  .object({
    maxBytes: positiveInteger.max(50 * 1024 * 1024),
    maxPages: positiveInteger.max(100),
    timeoutMs: positiveInteger.max(5 * 60 * 1000),
  })
  .strict();

export type DoclingProcessorLimits = z.infer<typeof processorLimitsSchema>;

export const doclingProcessorRequestSchema = z
  .object({
    schemaVersion: z.literal(DOCLING_PROCESSOR_CONTRACT_VERSION),
    jobKey: z.string().min(1).max(256),
    representationKind: z.literal(DOCLING_REPRESENTATION_KIND),
    source: processorSourceSchema,
    selection: z
      .object({
        reason: z.enum(DOCLING_CONTRACT_REASONS),
        baseline: baselineObservationSchema,
      })
      .strict(),
    target: z
      .object({
        processor: z.literal("docling"),
        processorVersion: z.string().min(1).max(64),
      })
      .strict(),
    limits: processorLimitsSchema,
    requestedOutputs: z.array(z.enum(DOCLING_OUTPUT_KINDS)).min(1).max(2),
  })
  .strict()
  .superRefine((request, ctx) => {
    if (request.source.sizeBytes > request.limits.maxBytes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["source", "sizeBytes"],
        message: "source exceeds request maxBytes",
      });
    }
    const observedPages = request.selection.baseline.pages;
    if (observedPages !== null && observedPages > request.limits.maxPages) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selection", "baseline", "pages"],
        message: "observed page count exceeds request maxPages",
      });
    }
    if (new Set(request.requestedOutputs).size !== request.requestedOutputs.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requestedOutputs"],
        message: "requested outputs must be unique",
      });
    }
    if (!request.requestedOutputs.includes("structured-json")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requestedOutputs"],
        message: "structured-json is mandatory for every processor request",
      });
    }
    const expectedJobKey = buildDoclingJobKey({
      sourceSha256: request.source.sha256,
      reason: request.selection.reason,
      processorVersion: request.target.processorVersion,
      requestedOutputs: request.requestedOutputs,
      limits: request.limits,
    });
    if (request.jobKey !== expectedJobKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["jobKey"],
        message:
          "jobKey does not match source/reason/processor version/outputs/limits",
      });
    }
  });

const structuredJsonArtifactSchema = z
  .object({
    kind: z.literal("structured-json"),
    contentSha256: sha256Schema,
    sizeBytes: positiveInteger,
  })
  .strict();

const markdownArtifactSchema = z
  .object({
    kind: z.literal("markdown"),
    contentSha256: sha256Schema,
    sizeBytes: nonNegativeInteger,
  })
  .strict();

const processorArtifactSchema = z.union([
  structuredJsonArtifactSchema,
  markdownArtifactSchema,
]);

const resultBase = {
  schemaVersion: z.literal(DOCLING_PROCESSOR_CONTRACT_VERSION),
  jobKey: z.string().min(1).max(256),
  sourceSha256: sha256Schema,
  representationKind: z.literal(DOCLING_REPRESENTATION_KIND),
  processor: z
    .object({
      name: z.literal("docling"),
      version: z.string().min(1).max(64),
    })
    .strict(),
  extractedAt: z.string().datetime(),
  durationMs: nonNegativeInteger,
} as const;

const okResultSchema = z
  .object({
    ...resultBase,
    status: z.literal("ok"),
    metrics: z
      .object({
        markdownCharacters: nonNegativeInteger,
        pages: positiveInteger.nullable(),
        tables: nonNegativeInteger.nullable(),
      })
      .strict(),
    artifacts: z.array(processorArtifactSchema).min(1).max(2),
  })
  .strict()
  .superRefine((result, ctx) => {
    if (!result.artifacts.some((artifact) => artifact.kind === "structured-json")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["artifacts"],
        message: "successful results must include structured-json",
      });
    }
    const kinds = result.artifacts.map((artifact) => artifact.kind);
    if (new Set(kinds).size !== kinds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["artifacts"],
        message: "artifact kinds must be unique",
      });
    }
  });

const failedResultSchema = z
  .object({
    ...resultBase,
    status: z.literal("failed"),
    failure: z
      .object({
        code: z.enum([
          "conversion-failed",
          "dependency-missing",
          "timeout",
          "source-hash-mismatch",
          "invalid-output",
        ]),
        retryable: z.boolean(),
      })
      .strict(),
  })
  .strict();

const skippedResultSchema = z
  .object({
    ...resultBase,
    status: z.literal("skipped"),
    skip: z
      .object({
        code: z.enum([
          "resource-bound",
          "policy-not-promoted",
          "unsupported-source",
        ]),
      })
      .strict(),
  })
  .strict();

export const doclingProcessorResultSchema = z.union([
  okResultSchema,
  failedResultSchema,
  skippedResultSchema,
]);

export type DoclingProcessorRequest = z.infer<typeof doclingProcessorRequestSchema>;
export type DoclingProcessorResult = z.infer<typeof doclingProcessorResultSchema>;

export function normalizeDoclingRequestedOutputs(
  outputs: readonly DoclingOutputKind[],
): DoclingOutputKind[] {
  return [...outputs].sort((a, b) => a.localeCompare(b));
}

export function buildDoclingJobKey(input: {
  sourceSha256: string;
  reason: DoclingContractReason;
  processorVersion: string;
  requestedOutputs: readonly DoclingOutputKind[];
  limits: DoclingProcessorLimits;
}): string {
  const outputKey = normalizeDoclingRequestedOutputs(input.requestedOutputs).join("+");
  const limitsKey = `b${input.limits.maxBytes}-p${input.limits.maxPages}-t${input.limits.timeoutMs}`;
  return `docling:v${DOCLING_PROCESSOR_CONTRACT_VERSION}:${input.processorVersion}:${input.sourceSha256}:${input.reason}:${outputKey}:${limitsKey}`;
}

export function buildDoclingProcessorRequest(input: {
  source: z.infer<typeof processorSourceSchema>;
  reason: DoclingContractReason;
  baseline: z.infer<typeof baselineObservationSchema>;
  processorVersion: string;
  limits: DoclingProcessorLimits;
  requestedOutputs?: DoclingOutputKind[];
}): DoclingProcessorRequest {
  const requestedOutputs = input.requestedOutputs ?? ["structured-json", "markdown"];
  return doclingProcessorRequestSchema.parse({
    schemaVersion: DOCLING_PROCESSOR_CONTRACT_VERSION,
    jobKey: buildDoclingJobKey({
      sourceSha256: input.source.sha256,
      reason: input.reason,
      processorVersion: input.processorVersion,
      requestedOutputs,
      limits: input.limits,
    }),
    representationKind: DOCLING_REPRESENTATION_KIND,
    source: input.source,
    selection: {
      reason: input.reason,
      baseline: input.baseline,
    },
    target: {
      processor: "docling",
      processorVersion: input.processorVersion,
    },
    limits: input.limits,
    requestedOutputs,
  });
}

/**
 * Validate an untrusted processor response against both the runtime schema and
 * the immutable request identity. Artifact storage locations are intentionally
 * absent from this boundary: the trusted caller decides where validated bytes
 * are persisted.
 */
export function parseDoclingProcessorResultForRequest(
  request: DoclingProcessorRequest,
  value: unknown,
): DoclingProcessorResult {
  const result = doclingProcessorResultSchema.parse(value);
  if (result.jobKey !== request.jobKey) {
    throw new Error("Docling processor result jobKey mismatch");
  }
  if (result.sourceSha256 !== request.source.sha256) {
    throw new Error("Docling processor result source SHA-256 mismatch");
  }
  if (result.processor.version !== request.target.processorVersion) {
    throw new Error("Docling processor result version mismatch");
  }
  if (result.status === "ok") {
    if (result.metrics.pages !== null && result.metrics.pages > request.limits.maxPages) {
      throw new Error("Docling processor result exceeds requested maxPages");
    }
    if (result.durationMs > request.limits.timeoutMs) {
      throw new Error("Docling processor result exceeds requested timeoutMs");
    }
    const requested = new Set(request.requestedOutputs);
    const returned = new Set(result.artifacts.map((artifact) => artifact.kind));
    for (const kind of requested) {
      if (!returned.has(kind)) {
        throw new Error(`Docling processor result missing requested output: ${kind}`);
      }
    }
    for (const kind of returned) {
      if (!requested.has(kind)) {
        throw new Error(`Docling processor result returned unrequested output: ${kind}`);
      }
    }
  }
  return result;
}
