import assert from "node:assert/strict";
import test from "node:test";

import {
  INITIAL_CIVIC_SOURCE_REGISTRY,
  describeCoverage,
  summarizeCivicSourceHealth,
  validateCivicSourceRegistry,
  type CivicSourceRegistryEntry,
} from "./civic-source-registry";

test("initial civic source registry covers the expected source types", () => {
  const types = new Set(
    INITIAL_CIVIC_SOURCE_REGISTRY.map((entry) => entry.type),
  );

  assert.deepEqual(
    types,
    new Set([
      "institutional_website",
      "albo_pretorio",
      "transparent_administration",
      "pnrr_portal",
      "open_data",
      "participatory_democracy",
      "service_reports",
      "verified_internal_static",
    ]),
  );
});

test("initial registry includes active, empty, unreachable and partial coverage fixtures", () => {
  assert.ok(
    INITIAL_CIVIC_SOURCE_REGISTRY.some(
      (entry) => entry.healthStatus === "healthy",
    ),
  );
  assert.ok(
    INITIAL_CIVIC_SOURCE_REGISTRY.some(
      (entry) => entry.healthStatus === "empty",
    ),
  );
  assert.ok(
    INITIAL_CIVIC_SOURCE_REGISTRY.some(
      (entry) => entry.healthStatus === "unreachable",
    ),
  );
  assert.ok(
    INITIAL_CIVIC_SOURCE_REGISTRY.some(
      (entry) => entry.coverage.completeness === "partial",
    ),
  );
});

test("summarizes civic source health with cautious verification language", () => {
  const report = summarizeCivicSourceHealth(INITIAL_CIVIC_SOURCE_REGISTRY);

  assert.equal(report.totalSources, INITIAL_CIVIC_SOURCE_REGISTRY.length);
  assert.equal(report.statusCounts.healthy, 3);
  assert.equal(report.statusCounts.empty, 1);
  assert.equal(report.statusCounts.unreachable, 1);
  assert.ok(report.sourcesRequiringVerification.length >= 4);
  assert.match(report.summary, /verifica tecnica o metodologica/);
  assert.match(report.summary, /non valutazioni sostanziali/);
  assert.doesNotMatch(report.summary, /corruzione|mafia|colpevole|illecito/i);
});

test("does not mark coverage complete unless explicitly declared", () => {
  const report = summarizeCivicSourceHealth(INITIAL_CIVIC_SOURCE_REGISTRY);

  assert.deepEqual(report.completeCoverageSourceIds, [
    "fonti-statiche-verificate",
  ]);

  const publicSourceSummaries = report.items
    .filter((item) => item.id !== "fonti-statiche-verificate")
    .map((item) => item.coverageSummary);

  assert.ok(
    publicSourceSummaries.every(
      (summary) =>
        !/^Copertura dichiarata completa|^Copertura completa/i.test(summary),
    ),
  );
});

test("describes unknown and partial coverage without implying completeness", () => {
  assert.equal(
    describeCoverage({
      jurisdiction: "Comune di Lamezia Terme",
      topics: ["atti", "allegati"],
      completeness: "unknown",
      notes: [],
    }),
    "Copertura non dichiarata completa; verifica richiesta per: atti, allegati.",
  );

  assert.equal(
    describeCoverage({
      jurisdiction: "Comune di Lamezia Terme",
      topics: ["atti"],
      completeness: "partial",
      notes: [],
    }),
    "Copertura parziale o da integrare per: atti.",
  );
});

test("initial registry validates without unsafe completeness claims", () => {
  assert.deepEqual(
    validateCivicSourceRegistry(INITIAL_CIVIC_SOURCE_REGISTRY),
    [],
  );
});

test("validates required URL channels and duplicate identifiers", () => {
  const entries: CivicSourceRegistryEntry[] = [
    {
      id: "duplicata",
      name: "Fonte A",
      type: "open_data",
      channel: { kind: "url", label: "URL" },
      coverage: {
        jurisdiction: "Comune di Lamezia Terme",
        topics: ["dataset"],
        completeness: "unknown",
        notes: [],
      },
      pollingPolicy: { cadence: "weekly", requiresLiveNetwork: true },
      lastCheckedAt: null,
      healthStatus: "needs_review",
      limitations: [],
    },
    {
      id: "duplicata",
      name: "Fonte B",
      type: "open_data",
      channel: { kind: "internal_static", label: "Statico" },
      coverage: {
        jurisdiction: "internal_verified_context",
        topics: ["fixture"],
        completeness: "explicitly_complete",
        notes: [],
      },
      pollingPolicy: { cadence: "manual", requiresLiveNetwork: false },
      lastCheckedAt: null,
      healthStatus: "healthy",
      limitations: [],
    },
  ];

  assert.deepEqual(validateCivicSourceRegistry(entries), [
    "Fonte duplicata: URL mancante per canale web.",
    "Fonte duplicata: duplicata",
  ]);
});

test("flags unsafe completeness notes without an explicit completeness declaration", () => {
  const errors = validateCivicSourceRegistry([
    {
      id: "fonte-non-esplicita",
      name: "Fonte non esplicita",
      type: "institutional_website",
      channel: {
        kind: "url",
        label: "URL",
        url: "https://example.test/",
      },
      coverage: {
        jurisdiction: "Comune di Lamezia Terme",
        topics: ["atti"],
        completeness: "unknown",
        notes: ["Archivio completo per gli atti disponibili."],
      },
      pollingPolicy: { cadence: "weekly", requiresLiveNetwork: true },
      lastCheckedAt: "2026-06-01T00:00:00.000Z",
      healthStatus: "healthy",
      limitations: [],
    },
  ]);

  assert.deepEqual(errors, [
    "Fonte fonte-non-esplicita: evitare affermazioni di completezza senza dichiarazione esplicita.",
  ]);
});
