import { describe, expect, it } from "vitest";
import {
  buildDoclingProcessorRequest,
  doclingProcessorRequestSchema,
  parseDoclingProcessorResultForRequest,
} from "./doclingProcessorContract";

const SOURCE_SHA = "a".repeat(64);
const STRUCTURED_SHA = "b".repeat(64);
const MARKDOWN_SHA = "c".repeat(64);
const DERIVED_SHA = "d".repeat(64);
const EXTRACTED_AT = "2026-09-01T20:00:00.000Z";

function request(
  requestedOutputs?: Array<"structured-json" | "markdown">,
  limitsOverride?: Partial<{
    maxBytes: number;
    maxPages: number;
    timeoutMs: number;
  }>,
) {
  return buildDoclingProcessorRequest({
    source: {
      sha256: SOURCE_SHA,
      contentType: "application/pdf",
      sizeBytes: 1000,
    },
    reason: "embedded-pdf-container",
    baseline: {
      status: "ok",
      characters: 810,
      pages: 1,
      hasEmbeddedPdf: true,
    },
    processorVersion: "2.124.0",
    limits: {
      maxBytes: 10_000,
      maxPages: 20,
      timeoutMs: 120_000,
      ...limitsOverride,
    },
    requestedOutputs,
  });
}

function okResult(req = request()) {
  return {
    schemaVersion: 2 as const,
    jobKey: req.jobKey,
    sourceSha256: SOURCE_SHA,
    representationKind: "derived-noncanonical" as const,
    processor: { name: "docling" as const, version: "2.124.0" },
    extractedAt: EXTRACTED_AT,
    status: "ok" as const,
    durationMs: 2500,
    derivedSource: {
      kind: "embedded-pdf" as const,
      parentSha256: SOURCE_SHA,
      sha256: DERIVED_SHA,
      sizeBytes: 8000,
      attachmentIndex: 1,
    },
    metrics: {
      markdownCharacters: 1452,
      pages: 1,
      tables: 0,
    },
    artifacts: [
      {
        kind: "structured-json" as const,
        contentSha256: STRUCTURED_SHA,
        sizeBytes: 9000,
      },
      {
        kind: "markdown" as const,
        contentSha256: MARKDOWN_SHA,
        sizeBytes: 1452,
      },
    ],
  };
}

describe("Docling processor request contract v2", () => {
  it("builds a deterministic source-hash keyed request without a locator", () => {
    const first = request();
    const second = request();
    expect(first.schemaVersion).toBe(2);
    expect(first.jobKey).toBe(second.jobKey);
    expect(first.jobKey).toContain("docling:v2:");
    expect(first.jobKey).toContain(SOURCE_SHA);
    expect(first.representationKind).toBe("derived-noncanonical");
    expect(first).not.toHaveProperty("path");
    expect(first).not.toHaveProperty("url");
    expect(first.source).not.toHaveProperty("path");
    expect(first.source).not.toHaveProperty("url");
  });

  it("includes outputs and execution limits in job identity", () => {
    const standard = request();
    const both = request(["structured-json", "markdown"]);
    const bothReordered = request(["markdown", "structured-json"]);
    const morePages = request(undefined, { maxPages: 40 });
    const longerTimeout = request(undefined, { timeoutMs: 180_000 });
    const largerByteEnvelope = request(undefined, { maxBytes: 20_000 });

    expect(standard.jobKey).not.toBe(both.jobKey);
    expect(both.jobKey).toBe(bothReordered.jobKey);
    expect(morePages.jobKey).not.toBe(standard.jobKey);
    expect(longerTimeout.jobKey).not.toBe(standard.jobKey);
    expect(largerByteEnvelope.jobKey).not.toBe(standard.jobKey);
  });

  it("rejects requests outside source/page/output bounds", () => {
    expect(() =>
      buildDoclingProcessorRequest({
        source: {
          sha256: SOURCE_SHA,
          contentType: "application/pdf",
          sizeBytes: 20_000,
        },
        reason: "scan-like-sparse-baseline",
        baseline: {
          status: "ok",
          characters: 16,
          pages: 1,
          hasEmbeddedPdf: false,
        },
        processorVersion: "2.124.0",
        limits: {
          maxBytes: 10_000,
          maxPages: 20,
          timeoutMs: 120_000,
        },
      }),
    ).toThrow();

    expect(() =>
      buildDoclingProcessorRequest({
        source: {
          sha256: SOURCE_SHA,
          contentType: "application/pdf",
          sizeBytes: 1000,
        },
        reason: "scan-like-sparse-baseline",
        baseline: {
          status: "ok",
          characters: 16,
          pages: 21,
          hasEmbeddedPdf: false,
        },
        processorVersion: "2.124.0",
        limits: {
          maxBytes: 10_000,
          maxPages: 20,
          timeoutMs: 120_000,
        },
      }),
    ).toThrow(/observed page count exceeds request maxPages/);

    expect(() => request(["markdown"])).toThrow(/structured-json is mandatory/);
    expect(request(["structured-json"]).requestedOutputs).toEqual([
      "structured-json",
    ]);
  });

  it("fails closed on unrecognised source locator fields", () => {
    const req = request();
    expect(() =>
      doclingProcessorRequestSchema.parse({
        ...req,
        source: {
          ...req.source,
          url: "https://example.test/document.pdf",
        },
      }),
    ).toThrow();
  });
});

describe("Docling processor result contract v2", () => {
  it("accepts matching parent-child provenance and requested artifacts", () => {
    const req = request();
    const parsed = parseDoclingProcessorResultForRequest(req, okResult(req));
    expect(parsed.status).toBe("ok");
    if (parsed.status === "ok") {
      expect(parsed.derivedSource?.parentSha256).toBe(SOURCE_SHA);
      expect(parsed.derivedSource?.sha256).toBe(DERIVED_SHA);
      expect(parsed.artifacts.some((artifact) => artifact.kind === "structured-json")).toBe(true);
      expect(parsed.artifacts.some((artifact) => artifact.kind === "markdown")).toBe(true);
      expect(parsed.extractedAt).toBe(EXTRACTED_AT);
    }
  });

  it("requires a valid timestamp and immutable parent identity", () => {
    const req = request();
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        extractedAt: "not-a-date",
      }),
    ).toThrow();
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        sourceSha256: "e".repeat(64),
      }),
    ).toThrow(/source SHA-256 mismatch/);
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        jobKey: "docling:v2:other",
      }),
    ).toThrow(/jobKey mismatch/);
  });

  it("requires parent-child provenance for embedded container success", () => {
    const req = request();
    const { derivedSource: _removed, ...withoutDerived } = okResult(req);
    expect(() =>
      parseDoclingProcessorResultForRequest(req, withoutDerived),
    ).toThrow(/missing embedded derived source/);

    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        derivedSource: {
          ...okResult(req).derivedSource,
          parentSha256: "f".repeat(64),
        },
      }),
    ).toThrow(/parent SHA-256 mismatch/);
  });

  it("enforces derived-source and processor resource bounds", () => {
    const req = request();
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        derivedSource: {
          ...okResult(req).derivedSource,
          sizeBytes: 10_001,
        },
      }),
    ).toThrow(/derived source exceeds requested maxBytes/);
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        metrics: { ...okResult(req).metrics, pages: 21 },
      }),
    ).toThrow(/exceeds requested maxPages/);
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        durationMs: 120_001,
      }),
    ).toThrow(/exceeds requested timeoutMs/);
  });

  it("requires exactly the requested output set", () => {
    const req = request();
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        artifacts: [
          {
            kind: "structured-json",
            contentSha256: STRUCTURED_SHA,
            sizeBytes: 9000,
          },
        ],
      }),
    ).toThrow(/missing requested output: markdown/);

    const structuredOnly = request(["structured-json"]);
    const parsed = parseDoclingProcessorResultForRequest(structuredOnly, {
      ...okResult(structuredOnly),
      artifacts: [
        {
          kind: "structured-json",
          contentSha256: STRUCTURED_SHA,
          sizeBytes: 9000,
        },
      ],
    });
    expect(parsed.status).toBe("ok");

    expect(() =>
      parseDoclingProcessorResultForRequest(structuredOnly, okResult(structuredOnly)),
    ).toThrow(/returned unrequested output: markdown/);
  });

  it("rejects malformed successful artifacts", () => {
    const req = request();
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        artifacts: [
          {
            kind: "markdown",
            contentSha256: MARKDOWN_SHA,
            sizeBytes: 1452,
          },
        ],
      }),
    ).toThrow();

    const structuredOnly = request(["structured-json"]);
    expect(() =>
      parseDoclingProcessorResultForRequest(structuredOnly, {
        ...okResult(structuredOnly),
        artifacts: [
          {
            kind: "structured-json",
            contentSha256: STRUCTURED_SHA,
            sizeBytes: 0,
          },
        ],
      }),
    ).toThrow();
  });

  it("accepts a bounded skip without fabricated provenance or artifacts", () => {
    const req = request();
    const parsed = parseDoclingProcessorResultForRequest(req, {
      schemaVersion: 2,
      jobKey: req.jobKey,
      sourceSha256: SOURCE_SHA,
      representationKind: "derived-noncanonical",
      processor: { name: "docling", version: "2.124.0" },
      extractedAt: EXTRACTED_AT,
      status: "skipped",
      durationMs: 0,
      skip: { code: "resource-bound" },
    });
    expect(parsed.status).toBe("skipped");
  });
});
