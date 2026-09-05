import type { AlboPublicSnapshot } from "./staticContractsDataset";
import {
  CANONICAL_TAXONOMY_VERSION,
  classifyAlboItem,
  type CanonicalAlboClassification,
} from "./canonicalAlboTaxonomy";

export const CANONICAL_ALBO_CORPUS_DATA_PATH =
  "data/processed/canonical/lamezia-public-corpus-current.json";

export const CANONICAL_ALBO_CORPUS_SCHEMA_VERSION =
  "lamezia-public-canonical-corpus.v1" as const;

export type CanonicalAlboRecord = {
  canonicalId: string;
  source: {
    system: "albo_pretorio";
    publicId: string | null;
    publicationNumber: string | null;
    documentUrl: string | null;
  };
  temporal: {
    actDate: string | null;
    publicationStart: string | null;
  };
  content: {
    subject: string | null;
    displayTitle: string | null;
  };
  provenance: {
    verificationStatus: string;
    publicVisibility: "publishable";
    derivedAt: string;
    taxonomyVersion: typeof CANONICAL_TAXONOMY_VERSION;
  };
  taxonomy: CanonicalAlboClassification;
};

export type CanonicalCoverageLedger = {
  sourceItemsObserved: number;
  sourceItemsReportedAcquired: number;
  publicOfficialItems: number;
  recordsMaterialised: number;
  taxonomyClassified: number;
  taxonomyReviewRequired: number;
  taxonomyInsufficientEvidence: number;
  procurementConfirmed: number;
  procurementPossible: number;
  procurementNone: number;
  procurementWithoutCig: number;
  procurementWithCig: number;
  multiCigRecords: number;
  coverageInvariantSatisfied: boolean;
};

export type CanonicalAlboCorpus = {
  schemaVersion: typeof CANONICAL_ALBO_CORPUS_SCHEMA_VERSION;
  taxonomyVersion: typeof CANONICAL_TAXONOMY_VERSION;
  generatedAt: string;
  source: {
    id: "albo_pretorio";
    label: string;
    url: string | null;
    scope: "current-public-window";
  };
  coverage: CanonicalCoverageLedger;
  records: CanonicalAlboRecord[];
};

export function buildCanonicalAlboCorpus(
  snapshot: AlboPublicSnapshot,
): CanonicalAlboCorpus {
  const generatedAt = validIso(snapshot.generated_at)
    ? snapshot.generated_at!
    : validIso(snapshot.retrieved_at)
      ? snapshot.retrieved_at!
      : new Date(0).toISOString();

  const sourceItems = snapshot.items ?? [];
  const publicOfficialItems = sourceItems.filter(
    (item) =>
      item.public_visibility === "publishable" &&
      item.verification_status === "official_source_acquired",
  );

  const records = publicOfficialItems.map((item, index) => {
    const taxonomy = classifyAlboItem(item);
    return {
      canonicalId: canonicalId(item.public_id, item.publication_number, index),
      source: {
        system: "albo_pretorio" as const,
        publicId: clean(item.public_id) || null,
        publicationNumber: clean(item.publication_number) || null,
        documentUrl: clean(item.document_url) || null,
      },
      temporal: {
        actDate: clean(item.act_date) || null,
        publicationStart: clean(item.publication_start) || null,
      },
      content: {
        subject: clean(item.subject) || null,
        displayTitle: clean(item.presentation?.display_title) || null,
      },
      provenance: {
        verificationStatus: item.verification_status ?? "unknown",
        publicVisibility: "publishable" as const,
        derivedAt: generatedAt,
        taxonomyVersion: CANONICAL_TAXONOMY_VERSION,
      },
      taxonomy,
    } satisfies CanonicalAlboRecord;
  });

  const procurementRecords = records.filter(
    (record) => record.taxonomy.procurementRelevance !== "none",
  );
  const coverage: CanonicalCoverageLedger = {
    sourceItemsObserved: sourceItems.length,
    sourceItemsReportedAcquired:
      finiteNonNegative(snapshot.counts?.acquired) ?? sourceItems.length,
    publicOfficialItems: publicOfficialItems.length,
    recordsMaterialised: records.length,
    taxonomyClassified: records.filter(
      (record) => record.taxonomy.taxonomyStatus === "classified",
    ).length,
    taxonomyReviewRequired: records.filter(
      (record) => record.taxonomy.taxonomyStatus === "review_required",
    ).length,
    taxonomyInsufficientEvidence: records.filter(
      (record) => record.taxonomy.taxonomyStatus === "insufficient_evidence",
    ).length,
    procurementConfirmed: records.filter(
      (record) => record.taxonomy.procurementRelevance === "confirmed",
    ).length,
    procurementPossible: records.filter(
      (record) => record.taxonomy.procurementRelevance === "possible",
    ).length,
    procurementNone: records.filter(
      (record) => record.taxonomy.procurementRelevance === "none",
    ).length,
    procurementWithoutCig: procurementRecords.filter(
      (record) => record.taxonomy.identifiers.cigs.length === 0,
    ).length,
    procurementWithCig: procurementRecords.filter(
      (record) => record.taxonomy.identifiers.cigs.length > 0,
    ).length,
    multiCigRecords: records.filter(
      (record) => record.taxonomy.identifiers.cigs.length > 1,
    ).length,
    coverageInvariantSatisfied: records.length === publicOfficialItems.length,
  };

  return {
    schemaVersion: CANONICAL_ALBO_CORPUS_SCHEMA_VERSION,
    taxonomyVersion: CANONICAL_TAXONOMY_VERSION,
    generatedAt,
    source: {
      id: "albo_pretorio",
      label: snapshot.source?.trim() || "Albo Pretorio Comune di Lamezia Terme",
      url: clean(snapshot.source_url) || null,
      scope: "current-public-window",
    },
    coverage,
    records,
  };
}

function canonicalId(
  publicId: string | undefined,
  publicationNumber: string | undefined,
  index: number,
): string {
  const stable = clean(publicId) || clean(publicationNumber);
  return stable ? `albo:${stable}` : `albo:current:${index + 1}`;
}

function clean(value: string | null | undefined): string {
  return value?.replace(/\s+/gu, " ").trim() ?? "";
}

function finiteNonNegative(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function validIso(value: string | null | undefined): boolean {
  return Boolean(value && !Number.isNaN(Date.parse(value)));
}
