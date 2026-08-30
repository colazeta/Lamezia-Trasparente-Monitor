#!/usr/bin/env tsx
import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  ALBO_CLASSIFICATION_DICTIONARY,
  ALBO_CLASSIFICATION_KNOWN_LIMIT,
  classifyAlboRecordCategory,
  type AlboRecordClassification,
} from "./albo-classification-dictionary";
import { ALBO_PRETORIO_LAMEZIA_SOURCE } from "./albo-source-config";
import {
  ALBO_PUBLIC_AREA_THEME_DESCRIPTOR,
  ALBO_PUBLIC_AREA_THEME_KNOWN_LIMIT,
} from "./albo-area-theme-taxonomy";
import {
  assessAlboNavigationFacetReadiness,
  type AlboNavigationFacetReadiness,
} from "./albo-navigation-facet-readiness";
import {
  ALBO_PUBLICATION_STANDARDISATION,
  ALBO_PUBLICATION_STANDARDISATION_KNOWN_LIMIT,
} from "./albo-publication-standardisation";
import type {
  PublicationPresentation,
  PublicationStandardisationDescriptor,
} from "@workspace/publication-standardisation";
import {
  classifyAlboPublicSafety,
  makeAlboPublicSafetyDecision,
  projectPublicAct,
  publicActPublicId,
} from "@workspace/publication-standardisation/public-act";
import {
  promoteAlboArtifactBatch,
  recoverAlboArtifactTransaction,
} from "./albo-artifact-transaction";
import {
  MAX_PUBLIC_PDF_BYTES,
  assertArchiveYearDirectorySafe,
  assertArchivedDocumentsRootSafe,
  isArchivedStoragePath,
  prepareArchivedPdfWritePath,
  resolveExistingArchivedPdfPath,
  reviewedDocumentStoragePaths,
  validateArchivedStoragePath,
  verifyArchivedPdfFile,
} from "./albo-document-storage";

export {
  alboArtifactTransactionJournalPath,
  promoteAlboArtifactBatch,
  recoverAlboArtifactTransaction,
  type AlboArtifactWrite,
  type AlboPromotionEvent,
  type AlboPromotionHooks,
  type AlboPromotionOptions,
  type AlboPromotionResult,
} from "./albo-artifact-transaction";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const DEFAULT_OUT_DIR = path.join(REPO_ROOT, "data");

export type AlboFetchMethod = "xml" | "csv" | "print-fallback" | "html-fallback";
export type VerificationStatus =
  | "official_source_acquired"
  | "normalised_automatically"
  | "verification_required";
export type PrivacyRisk = "low" | "medium" | "high";
export type PublicVisibility =
  | "publishable"
  | "publishable_with_minimisation"
  | "metadata_only"
  | "do_not_publish";
export const ALBO_PRIVACY_POLICY_VERSION = "albo-privacy-policy.2026-08-30.1";
export type PrivacyAssessmentBasis =
  | "source_record"
  | "complete_public_record"
  | "redacted_public_record";
export interface PrivacyPolicyAttestation {
  schema_version: "albo-privacy-policy-attestation.v1";
  policy_version: string;
  assessment_basis: PrivacyAssessmentBasis;
  status: "current" | "reacquisition_required";
}

interface PrivacyClassification {
  privacyRisk: PrivacyRisk;
  publicVisibility: PublicVisibility;
  reason: string | null;
}

export interface RawAlboRecord {
  publication_number: string;
  publication_start: string | null;
  publication_end: string | null;
  office: string | null;
  act_type: string | null;
  act_number: string | null;
  act_date: string | null;
  subject: string | null;
  document_url: string | null;
  source_row: Record<string, string | null>;
}

export interface FetchAttempt {
  method: AlboFetchMethod;
  url: string;
  ok: boolean;
  status?: number;
  contentType?: string | null;
  recordCount?: number;
  reason?: string;
}

export interface AlboRawSnapshot {
  source: string;
  source_url: string;
  provider: string;
  retrieved_at: string;
  fetch_method: AlboFetchMethod;
  raw_format: "xml" | "csv" | "html";
  structured_export_attempts: FetchAttempt[];
  records: RawAlboRecord[];
  warnings: string[];
  known_limits: string[];
}

export interface AlboItem {
  id: string;
  source: string;
  source_url: string;
  retrieved_at: string;
  fetch_method: AlboFetchMethod;
  publication_number: string;
  publication_start: string | null;
  publication_end: string | null;
  office: string | null;
  act_type: string | null;
  act_number: string | null;
  act_date: string | null;
  subject: string | null;
  document_url: string | null;
  content_hash: string;
  verification_status: VerificationStatus;
  privacy_risk: PrivacyRisk;
  public_visibility: PublicVisibility;
  classification: AlboRecordClassification;
  known_limits: string[];
}

export interface AlboDiff {
  new: AlboItem[];
  changed: Array<{ before: AlboItem; after: AlboItem }>;
  removed: AlboItem[];
  unchanged: AlboItem[];
}

export interface RunCounts {
  acquired: number;
  new: number;
  changed: number;
  removed: number;
  unchanged: number;
  publishable: number;
  minimised: number;
  metadata_only: number;
  excluded: number;
}

export type DiffBaselineStatus = "public_safe" | "baseline_unavailable";
export interface DiffBaseline {
  status: DiffBaselineStatus;
  public_safe: boolean;
  previous_retrieved_at: string | null;
  note: string;
}

export interface CliOptions {
  outDir: string;
  fromFile?: string;
  inputFormat?: "xml" | "csv" | "html" | "print";
  retrievedAt?: string;
  detailFetch?: typeof fetch;
  pdfFetch?: typeof fetch;
  documentDiscovery?: boolean;
}

export type PublicRecord = Record<string, unknown> & {
  id: string;
  public_id: string;
  source: string;
  retrieved_at: string;
  verification_status: VerificationStatus;
  classification?: AlboRecordClassification;
  presentation?: PublicationPresentation | null;
  privacy_attestation?: PrivacyPolicyAttestation;
  known_limits: string[];
};
export type PublicLatest = Record<string, unknown> & {
  retrieved_at: string;
  standardisation: PublicationStandardisationDescriptor;
  area_theme_taxonomy?: typeof ALBO_PUBLIC_AREA_THEME_DESCRIPTOR;
  navigation_facet_readiness?: AlboNavigationFacetReadiness;
  classification_dictionary: typeof ALBO_CLASSIFICATION_DICTIONARY;
  counts: RunCounts;
  items: PublicRecord[];
  excluded: PublicRecord[];
};
interface PublicRecordDiff {
  new: PublicRecord[];
  changed: Array<{ before: PublicRecord; after: PublicRecord }>;
  removed: PublicRecord[];
  unchanged: PublicRecord[];
}
type PublicDiff = Record<string, unknown> & {
  counts: RunCounts;
  diff_baseline: DiffBaseline;
  standardisation: PublicationStandardisationDescriptor;
  area_theme_taxonomy?: typeof ALBO_PUBLIC_AREA_THEME_DESCRIPTOR;
  classification_dictionary: typeof ALBO_CLASSIFICATION_DICTIONARY;
};
export type PdfPreservationStatus =
  | "archived"
  | "excluded"
  | "human_review_required"
  | "skipped";
export type PdfPreservationReason =
  | "eligible_low_risk_publishable_pdf"
  | "no_document_url"
  | "non_https_document_url"
  | "non_official_document_url"
  | "privacy_excluded"
  | "human_review_required"
  | "content_type_not_pdf"
  | "size_limit_exceeded"
  | "fetch_failed";
export interface PdfPreservationDecision {
  id: string;
  publication_number: string;
  source: string;
  source_url: string;
  retrieved_at: string;
  document_url?: string;
  public_visibility: PublicVisibility;
  privacy_risk: PrivacyRisk;
  verification_status: VerificationStatus;
  preservation_status: PdfPreservationStatus;
  reason: PdfPreservationReason;
}
export interface ArchivedPdfDocument extends PdfPreservationDecision {
  preservation_status: "archived";
  reason: "eligible_low_risk_publishable_pdf";
  document_url: string;
  storage_path: string;
  sha256: string;
  size_bytes: number;
  content_type: string;
  verified_at?: string;
  etag?: string;
  last_modified?: string;
}
export interface AlboDocumentsManifest {
  generated_at: string;
  source: string;
  source_url: string;
  retrieved_at: string;
  verification_status: VerificationStatus;
  policy: {
    eligibility: string;
    official_url_host: string;
    requires_https: true;
    content_type: "application/pdf";
    max_size_bytes: number;
    storage_path_template: "data/public/albo/documents/<year>/<sha>.pdf";
    sha256_deduplication: true;
    no_ocr: true;
    no_pdf_parsing: true;
    no_summaries: true;
    no_rankings: true;
    privacy_revocation_cleanup: true;
    unmanaged_orphan_cleanup: false;
    upstream_revalidation: "conditional_get_or_full_get";
    local_reuse_verification: "path_sha256_size_and_pdf_signature";
    paid_storage: false;
  };
  counts: {
    considered: number;
    eligible: number;
    archived: number;
    skipped: number;
    excluded: number;
    human_review_required: number;
    revoked: number;
  };
  warnings: string[];
  documents: ArchivedPdfDocument[];
  decisions: PdfPreservationDecision[];
}
export interface DeliberaArchiveItem extends PublicRecord {
  deliberation_body: "giunta" | "consiglio" | "altro";
  first_observed_at: string;
  last_observed_at: string;
  archived_document: ArchivedPdfDocument | null;
}
export interface DelibereArchive {
  generated_at: string;
  source: string;
  source_url: string;
  verification_status: VerificationStatus;
  coverage: {
    first_observed_at: string | null;
    last_observed_at: string | null;
    first_act_date: string | null;
    last_act_date: string | null;
  };
  counts: {
    total: number;
    giunta: number;
    consiglio: number;
    altro: number;
    publishable: number;
    minimised: number;
    metadata_only: number;
    archived_documents: number;
  };
  known_limits: string[];
  items: DeliberaArchiveItem[];
}

interface PdfWrite {
  storagePath: string;
  bytes: Uint8Array;
}

interface PdfArchivePlan {
  manifest: AlboDocumentsManifest;
  writes: PdfWrite[];
  revocations: string[];
}
export type AlboPublicStatus = Record<string, unknown> & {
  source: string;
  source_url: string;
  last_run_at: string;
  last_update: string;
  method: AlboFetchMethod;
  counts: RunCounts;
  diff_baseline: DiffBaseline;
  warnings: string[];
  next_scheduled_check: string | null;
  verification_status: VerificationStatus;
  standardisation: PublicationStandardisationDescriptor;
  known_limits: string[];
  classification_dictionary: typeof ALBO_CLASSIFICATION_DICTIONARY;
};

export interface RunResult {
  snapshot: AlboRawSnapshot;
  items: AlboItem[];
  diff: AlboDiff;
  publicLatest: PublicLatest;
  publicDiff: PublicDiff;
  documentsManifest: AlboDocumentsManifest;
  delibereArchive: DelibereArchive;
  publicStatus: AlboPublicStatus;
  runLog: string;
  paths: Record<
    | "currentSnapshot"
    | "historySnapshot"
    | "processedItems"
    | "publicLatest"
    | "publicDiff"
    | "documentsManifest"
    | "delibereArchive"
    | "publicStatus"
    | "runLog",
    string
  >;
}

const DOCUMENT_URL_LIMIT =
  "Allegato/documento non incluso negli export strutturati Tinnvision o non disponibile tramite dettaglio ufficiale.";
const DOCUMENT_DISCOVERY_LIMIT =
  "Quando gli export strutturati non includono URL diretti, il monitor prova il dettaglio ufficiale Tinnvision solo per record pubblicabili a basso rischio.";
const FALLBACK_LIMIT =
  "Acquisizione effettuata da fallback HTML/print per indisponibilita' degli export strutturati.";
const MINIMISED_LIMIT =
  "Oggetto non ripubblicato integralmente nel layer pubblico per prudenza privacy.";
const PRIVACY_REACQUISITION_LIMIT =
  "Record storico già redatto: la policy privacy corrente richiede riacquisizione dalla fonte prima di qualunque esposizione più ricca; nel frattempo resta pubblicato al massimo come metadato minimo.";
const ROME_TIME_ZONE = "Europe/Rome";
const ROME_MONITORING_WINDOW = "08:00-20:00 Europe/Rome";
const GITHUB_ACTIONS_CRON_UTC = "10 6-19 * * *";
const OFFICIAL_ALBO_DISCLAIMER =
  "Lamezia Trasparente Monitor non sostituisce l'Albo Pretorio ufficiale: pubblicazioni, termini, allegati e contenuti vanno verificati sulla fonte istituzionale.";
const DELIBERE_ARCHIVE_LIMIT =
  "Archivio cumulativo dei soli record public-safe osservati dal monitor: la copertura inizia dalla prima acquisizione disponibile e non certifica la completezza storica delle deliberazioni comunali.";
const CIVIC_SAFEGUARDS = [
  "I PDF sono archiviati solo per record pubblicabili a basso rischio, con URL ufficiale, content-type application/pdf e limite dimensionale.",
  "Nessun PDF o allegato viene analizzato, interpretato, sottoposto a OCR o riassunto.",
  "Nessuna sintesi generativa, classifica, accusa o valutazione sostanziale viene prodotta.",
  "Il layer pubblico espone solo metadati minimizzati secondo le classi publishable, publishable_with_minimisation, metadata_only e do_not_publish.",
];
const NOTIFICATION_METADATA_ONLY_REASON =
  "Regola automatica prudenziale: notifiche e depositi procedurali pubblicati solo in forma minima.";

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { outDir: DEFAULT_OUT_DIR };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") continue;
    if (arg === "--out-dir") options.outDir = valueAfter(argv, ++index, arg);
    else if (arg === "--from-file") options.fromFile = valueAfter(argv, ++index, arg);
    else if (arg === "--input-format") options.inputFormat = parseInputFormat(valueAfter(argv, ++index, arg));
    else if (arg === "--retrieved-at") options.retrievedAt = valueAfter(argv, ++index, arg);
    else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

export async function runAlboIngestion(options: CliOptions): Promise<RunResult> {
  await recoverAlboArtifactTransaction(options.outDir);
  const pristineLifecycle = await isPristineAlboLifecycle(options.outDir);
  const currentPath = path.join(options.outDir, "snapshots", "albo", "current.json");
  const publicLatestPath = path.join(options.outDir, "public", "albo", "latest.json");
  const delibereArchivePath = path.join(
    options.outDir,
    "public",
    "albo",
    "delibere-archive.json",
  );
  const previous = await readSnapshot(currentPath);
  const previousPublicLatest = previous ? null : await readPublicLatest(publicLatestPath);
  const previousDelibereArchive = await readDelibereArchive(delibereArchivePath);
  const acquiredSnapshot = await acquireAlboSnapshot(options);
  const snapshot = await enrichSnapshotDocumentUrls(acquiredSnapshot, options);
  const previousItems = previous ? normalizeAlboRecords(previous) : [];
  const items = normalizeAlboRecords(snapshot);
  const diff = diffAlboItems(previousItems, items);
  const diffBaseline = buildDiffBaseline(previous, previousPublicLatest);
  const previousPublicRecords = previous
    ? publicRecordsFromItems(previousItems)
    : previousPublicLatest
      ? publicRecordsFromLatest(previousPublicLatest)
      : null;
  const publicRecordDiff = previousPublicRecords
    ? diffPublicRecords(previousPublicRecords, publicRecordsFromItems(items))
    : publicRecordDiffFromAlboDiff(diff);
  const counts = countRun(items, publicRecordDiff);
  const publicLatest = buildPublicLatest(snapshot, items, counts);
  const publicDiff = buildPublicDiff(snapshot, publicRecordDiff, counts, diffBaseline);
  const pdfArchivePlan = await archivePublicPdfs(
    options.outDir,
    snapshot,
    items,
    options.pdfFetch ?? fetch,
    pristineLifecycle,
  );
  const documentsManifest = pdfArchivePlan.manifest;
  const delibereArchive = buildDelibereArchive(
    previousDelibereArchive,
    publicLatest,
    documentsManifest,
  );
  const publicStatus = buildPublicStatus(snapshot, counts, diffBaseline);
  const runLog = renderRunLog(snapshot, counts);
  const paths = await writeArtifacts(
    options.outDir,
    snapshot,
    items,
    publicLatest,
    publicDiff,
    documentsManifest,
    delibereArchive,
    publicStatus,
    runLog,
    pdfArchivePlan,
  );
  return {
    snapshot,
    items,
    diff,
    publicLatest,
    publicDiff,
    documentsManifest,
    delibereArchive,
    publicStatus,
    runLog,
    paths,
  };
}

async function enrichSnapshotDocumentUrls(
  snapshot: AlboRawSnapshot,
  options: CliOptions,
): Promise<AlboRawSnapshot> {
  const shouldDiscover = options.documentDiscovery ?? !options.fromFile;
  if (!shouldDiscover) return snapshot;
  return discoverTinnvisionDocumentUrls(snapshot, options.detailFetch ?? fetch);
}

export async function discoverTinnvisionDocumentUrls(
  snapshot: AlboRawSnapshot,
  detailFetch: typeof fetch,
): Promise<AlboRawSnapshot> {
  let discovered = 0;
  let failed = 0;
  const records: RawAlboRecord[] = [];

  for (const record of snapshot.records) {
    if (record.document_url) {
      records.push(record);
      continue;
    }

    const classification = enforceClassificationSafety(
      classify(record),
      classifyAlboRecordCategory(record),
    );
    if (classification.publicVisibility !== "publishable" || classification.privacyRisk !== "low") {
      records.push(record);
      continue;
    }

    const result = await fetchTinnvisionDocumentUrl(record, detailFetch);
    if (result.status === "found") {
      discovered += 1;
      records.push({
        ...record,
        document_url: result.documentUrl,
        source_row: {
          ...record.source_row,
          document_url: result.documentUrl,
          detail_api_url: result.detailUrl,
          attachment_name: result.attachmentName,
        },
      });
    } else {
      if (result.status === "failed") failed += 1;
      records.push(record);
    }
  }

  return {
    ...snapshot,
    records,
    warnings: unique([
      ...snapshot.warnings,
      ...(failed ? [`Official Tinnvision detail document discovery failed for ${failed} publishable Albo record(s).`] : []),
    ]),
    known_limits: discovered
      ? unique([...snapshot.known_limits, DOCUMENT_DISCOVERY_LIMIT])
      : snapshot.known_limits,
  };
}

async function acquireAlboSnapshot(options: CliOptions): Promise<AlboRawSnapshot> {
  const retrievedAt = options.retrievedAt ?? new Date().toISOString();
  if (options.fromFile) {
    const format = options.inputFormat ?? inferInputFormat(options.fromFile);
    const parsed = parseByFormat(await readFile(options.fromFile, "utf8"), format);
    return buildSnapshot(parsed.records, parsed.method, parsed.rawFormat, retrievedAt, [
      { method: parsed.method, url: options.fromFile, ok: true, recordCount: parsed.records.length },
    ]);
  }

  const attempts: FetchAttempt[] = [];
  for (const candidate of [
    { method: "xml" as const, url: ALBO_PRETORIO_LAMEZIA_SOURCE.exportUrls.xml, rawFormat: "xml" as const, parser: parseTinnvisionXml },
    { method: "csv" as const, url: ALBO_PRETORIO_LAMEZIA_SOURCE.exportUrls.csv, rawFormat: "csv" as const, parser: parseTinnvisionCsv },
  ]) {
    const result = await tryFetch(candidate, fetch);
    attempts.push(result.attempt);
    if (result.records.length) return buildSnapshot(result.records, candidate.method, candidate.rawFormat, retrievedAt, attempts);
  }

  for (const candidate of [
    {
      method: "print-fallback" as const,
      url: ALBO_PRETORIO_LAMEZIA_SOURCE.exportUrls.print,
      rawFormat: "html" as const,
      parser: parseTinnvisionHtml,
    },
    {
      method: "html-fallback" as const,
      url: ALBO_PRETORIO_LAMEZIA_SOURCE.exportUrls.html,
      rawFormat: "html" as const,
      parser: parseTinnvisionHtml,
    },
  ]) {
    const result = await tryFetch(candidate, fetch);
    attempts.push(result.attempt);
    if (result.records.length) {
      return buildSnapshot(result.records, candidate.method, candidate.rawFormat, retrievedAt, attempts, [FALLBACK_LIMIT]);
    }
  }

  throw new Error(
    `No Albo records acquired. Attempts: ${attempts
      .map((attempt) => `${attempt.method}=${attempt.reason ?? attempt.status ?? "unknown"}`)
      .join(", ")}`,
  );
}

async function tryFetch(
  candidate: {
    method: AlboFetchMethod;
    url: string;
    rawFormat: "xml" | "csv" | "html";
    parser: (text: string) => RawAlboRecord[];
  },
  fetchImpl: typeof fetch,
): Promise<{ records: RawAlboRecord[]; attempt: FetchAttempt }> {
  try {
    const response = await fetchImpl(candidate.url, {
      headers: { accept: "*/*", "user-agent": "Lamezia-Trasparente-Monitor/Tranche-A" },
      redirect: "follow",
    });
    const text = await decodeResponse(response);
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      return {
        records: [],
        attempt: { method: candidate.method, url: candidate.url, ok: false, status: response.status, contentType, reason: `HTTP ${response.status}` },
      };
    }
    const records = candidate.parser(text);
    return {
      records,
      attempt: {
        method: candidate.method,
        url: candidate.url,
        ok: records.length > 0,
        status: response.status,
        contentType,
        recordCount: records.length,
        reason: records.length ? undefined : "Response did not contain parseable Albo records.",
      },
    };
  } catch (error) {
    return { records: [], attempt: { method: candidate.method, url: candidate.url, ok: false, reason: formatError(error) } };
  }
}

type TinnvisionDocumentDiscoveryResult =
  | {
      status: "found";
      documentUrl: string;
      detailUrl: string;
      attachmentName: string;
    }
  | { status: "not_found" }
  | { status: "failed" };

interface TinnvisionAttachmentCandidate {
  name: string;
  description: string;
  progressivo: string;
  tipoAllegato: string;
}

async function fetchTinnvisionDocumentUrl(
  record: RawAlboRecord,
  detailFetch: typeof fetch,
): Promise<TinnvisionDocumentDiscoveryResult> {
  const publicationId = tinnvisionDetailId(record.publication_number);
  if (!publicationId) return { status: "not_found" };

  const detailUrl = new URL(`/api/pubblicazioni/${publicationId}`, ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl);
  detailUrl.searchParams.set("ente", ALBO_PRETORIO_LAMEZIA_SOURCE.ente);

  try {
    const response = await detailFetch(detailUrl.href, {
      headers: {
        accept: "application/json",
        "user-agent": "Lamezia-Trasparente-Monitor/Albo-document-discovery",
      },
      redirect: "follow",
    });
    if (!response.ok) return { status: "failed" };

    const detail = (await response.json()) as unknown;
    const publication = objectValue(objectValue(detail, "pubblicazioneAlbo"));
    const year = stringValue(publication?.ANNO) ?? publicationId.split("-")[0] ?? null;
    const progressivo = stringValue(publication?.PROGRESSIVO) ?? publicationId.split("-")[1] ?? null;
    if (!year || !progressivo) return { status: "not_found" };

    const attachments = arrayValue(objectValue(objectValue(detail, "allegati"))?.items)
      .map(tinnvisionAttachmentCandidate)
      .filter((attachment): attachment is TinnvisionAttachmentCandidate => attachment !== null);
    const selected = selectTinnvisionPdfAttachment(attachments);
    if (!selected) return { status: "not_found" };

    const documentUrl = new URL(
      `/allegati/${encodeURIComponent(year)}_${encodeURIComponent(progressivo)}_${encodeURIComponent(
        selected.progressivo,
      )}_${encodeURIComponent(selected.tipoAllegato)}`,
      ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    );
    documentUrl.searchParams.set("ente", ALBO_PRETORIO_LAMEZIA_SOURCE.ente);

    return {
      status: "found",
      documentUrl: documentUrl.href,
      detailUrl: detailUrl.href,
      attachmentName: selected.name,
    };
  } catch {
    return { status: "failed" };
  }
}

function tinnvisionAttachmentCandidate(value: unknown): TinnvisionAttachmentCandidate | null {
  const attachment = objectValue(value);
  if (!attachment) return null;
  const name = stringValue(attachment.NOMEALLEGATO);
  const progressivo = stringValue(attachment.PROGRESSIVO);
  const tipoAllegato = stringValue(attachment.tipoAllegato);
  if (!name || !progressivo || !tipoAllegato) return null;
  return {
    name,
    description: stringValue(attachment.DESCALLEGATO) ?? "",
    progressivo,
    tipoAllegato,
  };
}

function selectTinnvisionPdfAttachment(
  attachments: TinnvisionAttachmentCandidate[],
): TinnvisionAttachmentCandidate | null {
  const pdfs = attachments.filter((attachment) => isDirectPdfAttachment(attachment.name));
  if (!pdfs.length) return null;

  return [...pdfs].sort((left, right) => {
    const score = scoreTinnvisionAttachment(right) - scoreTinnvisionAttachment(left);
    if (score !== 0) return score;
    return Number.parseInt(left.progressivo, 10) - Number.parseInt(right.progressivo, 10);
  })[0] ?? null;
}

function isDirectPdfAttachment(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return normalized.endsWith(".pdf") && !normalized.endsWith(".pdf.p7m");
}

function scoreTinnvisionAttachment(attachment: TinnvisionAttachmentCandidate): number {
  const text = `${attachment.description} ${attachment.name}`.toLowerCase();
  let score = 100;
  if (/\b(princ|p)\b/i.test(attachment.tipoAllegato)) score += 20;
  if (/versione non firmata|copia_/i.test(text)) score += 10;
  if (/atto|determin|ordinanza|delibera|decreto|documento di protocollo|convocazione|avviso|permesso/i.test(text)) {
    score += 30;
  }
  if (/nota di pubblicazione|notapubblicazione/i.test(text)) score -= 40;
  if (/omissis/i.test(text)) score -= 10;
  return score;
}

function tinnvisionDetailId(publicationNumber: string): string | null {
  const [year, number] = publicationNumber.split("/").map((value) => value.trim());
  return year && number ? `${year}-${number}` : null;
}

export function parseTinnvisionXml(xml: string): RawAlboRecord[] {
  return [...xml.matchAll(/<pubblicazione>([\s\S]*?)<\/pubblicazione>/gi)].flatMap((match) => {
    const block = match[1] ?? "";
    const publicationNumber = clean(xmlTag(block, "progressivo"));
    if (!publicationNumber) return [];
    const period = parsePeriod(xmlTag(block, "periodo-pubblicazione"));
    const typology = clean(xmlTag(block, "tipologia"));
    const regSet = clean(xmlTag(block, "num-reg-set"));
    const regGen = clean(xmlTag(block, "num-reg-gen"));
    const dataAtto = clean(xmlTag(block, "data-atto"));
    const dataRegGen = clean(xmlTag(block, "data-reg-gen"));
    const office = nullable(xmlTag(block, "provenienza"));
    const subject = nullable(xmlTag(block, "oggetto"));
    const documentUrl = nullable(
      firstXmlTag(block, [
        "document-url",
        "document_url",
        "url-documento",
        "url_documento",
        "allegato-url",
        "allegato_url",
        "link",
        "url",
        "pdf",
      ]),
    );
    return [
      {
        publication_number: publicationNumber,
        publication_start: period.start,
        publication_end: period.end,
        office,
        act_type: cleanActType(typology),
        act_number: registryNumber(regGen) ?? registryNumber(regSet),
        act_date: italianDate(dataAtto) ?? italianDate(dataRegGen),
        subject,
        document_url: documentUrl,
        source_row: {
          progressivo: publicationNumber,
          tipologia: typology,
          provenienza: office,
          periodo_pubblicazione: clean(xmlTag(block, "periodo-pubblicazione")),
          data_atto: dataAtto,
          num_reg_set: regSet,
          num_reg_gen: regGen,
          data_reg_gen: dataRegGen,
          oggetto: subject,
          document_url: documentUrl,
        },
      },
    ];
  });
}

export function parseTinnvisionCsv(csv: string): RawAlboRecord[] {
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];
  const headers = rows[0].map(headerKey);
  const value = (row: string[], name: string): string | null => {
    const index = headers.indexOf(headerKey(name));
    return index >= 0 ? nullable(row[index]) : null;
  };
  return rows.slice(1).flatMap((row) => {
    const publicationNumber = value(row, "Num. Pubblicazione");
    if (!publicationNumber) return [];
    const period = parsePeriod(value(row, "Periodo pubblicazione"));
    const typology = value(row, "Tipologia");
    const regSet = value(row, "Num.Reg.Set");
    const regGen = value(row, "Num.Reg.Gen");
    const documentUrl = firstCsvValue(row, headers, [
      "URL Documento",
      "Url Documento",
      "Document URL",
      "document_url",
      "Allegato",
      "URL Allegato",
      "Link",
      "PDF",
    ]);
    return [
      {
        publication_number: publicationNumber,
        publication_start: period.start,
        publication_end: period.end,
        office: value(row, "Provenienza"),
        act_type: cleanActType(typology),
        act_number: registryNumber(regGen) ?? registryNumber(regSet),
        act_date: italianDate(value(row, "Data atto")) ?? italianDate(value(row, "Data Reg.Gen")),
        subject: value(row, "Oggetto"),
        document_url: documentUrl,
        source_row: {
          num_pubblicazione: publicationNumber,
          provenienza: value(row, "Provenienza"),
          tipologia: typology,
          periodo_pubblicazione: value(row, "Periodo pubblicazione"),
          data_atto: value(row, "Data atto"),
          num_reg_set: regSet,
          num_reg_gen: regGen,
          data_reg_gen: value(row, "Data Reg.Gen"),
          oggetto: value(row, "Oggetto"),
          document_url: documentUrl,
        },
      },
    ];
  });
}

export function parseTinnvisionHtml(html: string): RawAlboRecord[] {
  const tbody = /<tbody[^>]*>([\s\S]*?)<\/tbody>/i.exec(html)?.[1] ?? html;
  return [...tbody.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].flatMap((row) => {
    const rawCells = [...(row[1] ?? "").matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cell[1] ?? "");
    const cells = rawCells.map((cell) => stripHtml(cell));
    if (cells.length < 9) return [];
    const publicationNumber = nullable(cells[1]);
    if (!publicationNumber) return [];
    const typology = nullable(cells[3]);
    const period = parsePeriod(cells[8]);
    const regGen = nullable(cells[5]);
    const regSet = nullable(cells[6]);
    const documentUrl = rawCells.map((cell) => hrefValue(cell)).find((href): href is string => Boolean(href)) ?? null;
    return [
      {
        publication_number: publicationNumber,
        publication_start: period.start,
        publication_end: period.end,
        office: nullable(cells[2]),
        act_type: cleanActType(typology),
        act_number: registryNumber(regGen) ?? registryNumber(regSet) ?? actNumber(typology),
        act_date: italianDate(typology),
        subject: nullable(cells[4]),
        document_url: documentUrl,
        source_row: {
          publication_number: publicationNumber,
          office: nullable(cells[2]),
          typology,
          subject: nullable(cells[4]),
          num_reg_gen: regGen,
          num_reg_set: regSet,
          publication_period: cells[8],
          document_url: documentUrl,
        },
      },
    ];
  });
}

export function normalizeAlboRecords(snapshot: AlboRawSnapshot): AlboItem[] {
  return snapshot.records
    .filter((record) => record.publication_number.trim())
    .map((record) => {
      const recordClassification = classifyAlboRecordCategory(record);
      const classification = enforceClassificationSafety(
        classify(record),
        recordClassification,
      );
      const content_hash = sha256({
        publication_number: record.publication_number,
        publication_start: record.publication_start,
        publication_end: record.publication_end,
        office: record.office,
        act_type: record.act_type,
        act_number: record.act_number,
        act_date: record.act_date,
        subject: record.subject,
        document_url: record.document_url,
      });
      return {
        id: `albo-${record.publication_number.replace(/[^0-9a-z]+/gi, "-").replace(/^-|-$/g, "")}`,
        source: snapshot.source,
        source_url: snapshot.source_url,
        retrieved_at: snapshot.retrieved_at,
        fetch_method: snapshot.fetch_method,
        publication_number: record.publication_number,
        publication_start: record.publication_start,
        publication_end: record.publication_end,
        office: record.office,
        act_type: record.act_type,
        act_number: record.act_number,
        act_date: record.act_date,
        subject: record.subject,
        document_url: record.document_url,
        content_hash,
        verification_status: verificationStatus(snapshot.fetch_method),
        privacy_risk: classification.privacyRisk,
        public_visibility: classification.publicVisibility,
        classification: recordClassification,
        known_limits: itemLimits(snapshot, record, classification.reason),
      };
    });
}

export function diffAlboItems(previous: AlboItem[], next: AlboItem[]): AlboDiff {
  const previousById = new Map(previous.map((item) => [item.id, item]));
  const nextById = new Map(next.map((item) => [item.id, item]));
  return {
    new: next.filter((item) => !previousById.has(item.id)),
    changed: next.flatMap((item) => {
      const before = previousById.get(item.id);
      return before && before.content_hash !== item.content_hash ? [{ before, after: item }] : [];
    }),
    removed: previous.filter((item) => !nextById.has(item.id)),
    unchanged: next.filter((item) => previousById.get(item.id)?.content_hash === item.content_hash),
  };
}

export function renderRunLog(snapshot: AlboRawSnapshot, counts: RunCounts): string {
  const warnings = snapshot.warnings.length ? snapshot.warnings.join("; ") : "nessuno";
  const nextCheck = nextScheduledCheck(snapshot.retrieved_at);
  return [
    `Run: ${romeTime(snapshot.retrieved_at)}`,
    `Fonte: ${snapshot.source}`,
    `URL fonte: ${snapshot.source_url}`,
    `Metodo: ${snapshot.fetch_method}`,
    `Atti acquisiti: ${counts.acquired}`,
    `Nuovi atti: ${counts.new}`,
    `Modificati: ${counts.changed}`,
    `Rimossi/non piu' presenti: ${counts.removed}`,
    `Invariati: ${counts.unchanged}`,
    `Pubblicabili: ${counts.publishable}`,
    `Minimizzati: ${counts.minimised}`,
    `Solo metadato: ${counts.metadata_only}`,
    `Esclusi dal public layer: ${counts.excluded}`,
    `Errori/warning: ${warnings}`,
    `Next check: ${nextCheck ?? "non calcolabile"} (${ROME_MONITORING_WINDOW}; cron UTC ${GITHUB_ACTIONS_CRON_UTC}).`,
    "",
    "Limiti noti:",
    ...snapshot.known_limits.map((limit) => `- ${limit}`),
    "",
  ].join("\n");
}

function buildSnapshot(
  records: RawAlboRecord[],
  method: AlboFetchMethod,
  rawFormat: "xml" | "csv" | "html",
  retrievedAt: string,
  attempts: FetchAttempt[],
  warnings: string[] = [],
): AlboRawSnapshot {
  const knownLimits: string[] = [...ALBO_PRETORIO_LAMEZIA_SOURCE.knownLimits];
  if (method === "print-fallback" || method === "html-fallback") knownLimits.push(FALLBACK_LIMIT);
  return {
    source: ALBO_PRETORIO_LAMEZIA_SOURCE.source,
    source_url: ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    provider: ALBO_PRETORIO_LAMEZIA_SOURCE.provider,
    retrieved_at: retrievedAt,
    fetch_method: method,
    raw_format: rawFormat,
    structured_export_attempts: attempts,
    records,
    warnings,
    known_limits: unique(knownLimits),
  };
}

function buildPublicLatest(snapshot: AlboRawSnapshot, items: AlboItem[], counts: RunCounts): PublicLatest {
  const publicItems = items
    .filter((item) => item.public_visibility !== "do_not_publish")
    .map(publicItem);
  const excludedItems = items
    .filter((item) => item.public_visibility === "do_not_publish")
    .map(publicExcludedItem);
  return {
    generated_at: snapshot.retrieved_at,
    source: snapshot.source,
    source_url: snapshot.source_url,
    retrieved_at: snapshot.retrieved_at,
    verification_status: verificationStatus(snapshot.fetch_method),
    known_limits: unique([
      ...snapshot.known_limits,
      ALBO_CLASSIFICATION_KNOWN_LIMIT,
      ALBO_PUBLICATION_STANDARDISATION_KNOWN_LIMIT,
      ALBO_PUBLIC_AREA_THEME_KNOWN_LIMIT,
    ]),
    standardisation: ALBO_PUBLICATION_STANDARDISATION,
    area_theme_taxonomy: ALBO_PUBLIC_AREA_THEME_DESCRIPTOR,
    navigation_facet_readiness:
      assessAlboNavigationFacetReadiness(publicItems),
    classification_dictionary: ALBO_CLASSIFICATION_DICTIONARY,
    counts,
    items: publicItems,
    excluded: excludedItems,
  };
}

function buildDiffBaseline(previous: AlboRawSnapshot | null, previousPublicLatest: PublicLatest | null): DiffBaseline {
  if (previous) {
    return {
      status: "public_safe",
      public_safe: true,
      previous_retrieved_at: previous.retrieved_at,
      note: "Previous Albo snapshot was normalised through the public-safe minimisation rules before writing diff-latest.json.",
    };
  }

  if (previousPublicLatest) {
    return {
      status: "public_safe",
      public_safe: true,
      previous_retrieved_at: previousPublicLatest.retrieved_at,
      note: "Diff derived from committed public/albo/latest.json; safe for scheduled public runs and limited to public-safe fields.",
    };
  }

  return {
    status: "baseline_unavailable",
    public_safe: false,
    previous_retrieved_at: null,
    note: "No previous raw snapshot or committed public latest baseline was available; this first-run diff must not be interpreted as a comparison against a prior monitor run.",
  };
}

function buildPublicDiff(
  snapshot: AlboRawSnapshot,
  diff: PublicRecordDiff,
  counts: RunCounts,
  diffBaseline: DiffBaseline,
): PublicDiff {
  return {
    generated_at: snapshot.retrieved_at,
    source: snapshot.source,
    source_url: snapshot.source_url,
    retrieved_at: snapshot.retrieved_at,
    verification_status: verificationStatus(snapshot.fetch_method),
    known_limits: unique([
      ...snapshot.known_limits,
      ALBO_CLASSIFICATION_KNOWN_LIMIT,
      ALBO_PUBLICATION_STANDARDISATION_KNOWN_LIMIT,
      ALBO_PUBLIC_AREA_THEME_KNOWN_LIMIT,
    ]),
    standardisation: ALBO_PUBLICATION_STANDARDISATION,
    area_theme_taxonomy: ALBO_PUBLIC_AREA_THEME_DESCRIPTOR,
    classification_dictionary: ALBO_CLASSIFICATION_DICTIONARY,
    counts,
    diff_baseline: diffBaseline,
    diff: {
      new: diff.new,
      changed: diff.changed,
      removed: diff.removed,
      unchanged: diff.unchanged,
    },
  };
}

function buildPublicStatus(snapshot: AlboRawSnapshot, counts: RunCounts, diffBaseline: DiffBaseline): AlboPublicStatus {
  return {
    generated_at: snapshot.retrieved_at,
    source: snapshot.source,
    source_url: snapshot.source_url,
    provider: snapshot.provider,
    last_run_at: snapshot.retrieved_at,
    last_update: snapshot.retrieved_at,
    method: snapshot.fetch_method,
    raw_format: snapshot.raw_format,
    counts,
    diff_baseline: diffBaseline,
    warnings: snapshot.warnings,
    next_scheduled_check: nextScheduledCheck(snapshot.retrieved_at),
    schedule: {
      monitoring_window: ROME_MONITORING_WINDOW,
      timezone: ROME_TIME_ZONE,
      github_actions_cron_utc: GITHUB_ACTIONS_CRON_UTC,
      utc_handling:
        "GitHub cron usa UTC; il workflow calcola l'ora Europe/Rome e salta le esecuzioni fuori dalla finestra civica.",
      zero_cost_runner: "ubuntu-latest",
    },
    verification_status: verificationStatus(snapshot.fetch_method),
    standardisation: ALBO_PUBLICATION_STANDARDISATION,
    area_theme_taxonomy: ALBO_PUBLIC_AREA_THEME_DESCRIPTOR,
    known_limits: publicStatusKnownLimits(snapshot, diffBaseline),
    classification_dictionary: ALBO_CLASSIFICATION_DICTIONARY,
    official_albo_disclaimer: OFFICIAL_ALBO_DISCLAIMER,
    civic_safeguards: CIVIC_SAFEGUARDS,
  };
}

function publicStatusKnownLimits(snapshot: AlboRawSnapshot, diffBaseline: DiffBaseline): string[] {
  return unique([
    ...snapshot.known_limits,
    ALBO_CLASSIFICATION_KNOWN_LIMIT,
    ALBO_PUBLICATION_STANDARDISATION_KNOWN_LIMIT,
    ALBO_PUBLIC_AREA_THEME_KNOWN_LIMIT,
    ...(diffBaseline.status === "baseline_unavailable" ? [diffBaseline.note] : []),
  ]);
}

function sourcePrivacyAttestation(): PrivacyPolicyAttestation {
  return {
    schema_version: "albo-privacy-policy-attestation.v1",
    policy_version: ALBO_PRIVACY_POLICY_VERSION,
    assessment_basis: "source_record",
    status: "current",
  };
}

function alboItemDeliberationBody(
  item: AlboItem,
): "giunta" | "consiglio" | "altro" | null {
  if (
    item.classification.act_category.id !== "deliberazioni" &&
    !/^DELIBERAZIONE\b/i.test(item.act_type ?? "")
  ) {
    return null;
  }
  const actType = (item.act_type ?? "").toUpperCase();
  if (actType.includes("CONSIGLIO")) return "consiglio";
  if (actType.includes("GIUNTA")) return "giunta";
  return "altro";
}

function publicItem(item: AlboItem): PublicRecord {
  const deliberationBody = alboItemDeliberationBody(item);
  const decision = classifyAlboPublicSafety({
    subject: item.subject,
    act_type: item.act_type,
    office: item.office,
    act_category_id: item.classification.act_category.id,
  });
  const projection = projectPublicAct({
    id: item.id,
    progressivo: item.publication_number,
    tipologia: item.act_type,
    category: "albo",
    subcategory: item.classification.act_category.id,
    provenienza: item.office,
    oggetto: item.subject,
    data_atto: item.act_date,
    publication_start: item.publication_start,
    publication_end: item.publication_end,
    registry_section_number: null,
    registry_general_number: item.act_number,
    cups: [],
    pnrr_mission: null,
    is_pnrr: false,
    is_new: false,
    first_seen_at: item.retrieved_at,
    macrotema: null,
    decision,
    attachments: item.document_url
      ? [{ name: "Documento ufficiale", tipo: null, official_url: item.document_url, archived_url: null, content_type: null, size: null, public_safe: true }]
      : [],
  });
  if (!projection) return publicExcludedItem(item);

  const isFull = decision.public_visibility === "publishable";
  return {
    id: item.id,
    public_id: projection.public_id,
    source: item.source,
    source_url: item.source_url,
    retrieved_at: item.retrieved_at,
    publication_number: projection.progressivo,
    publication_start: projection.publication_start,
    publication_end: projection.publication_end,
    office: isFull ? projection.provenienza : null,
    act_type: isFull ? projection.tipologia : null,
    act_number: projection.registry_general_number,
    act_date: projection.data_atto,
    ...(isFull ? { content_hash: item.content_hash } : {}),
    subject: projection.oggetto,
    document_url: projection.attachments[0]?.official_url ?? null,
    public_note: decision.public_visibility === "publishable_with_minimisation"
      ? "Record pubblicato con minimizzazione automatica."
      : decision.public_visibility === "metadata_only"
        ? "Record limitato al metadato minimo."
        : null,
    verification_status: item.verification_status,
    privacy_risk: decision.privacy_risk,
    public_visibility: decision.public_visibility,
    classification: item.classification,
    privacy_attestation: sourcePrivacyAttestation(),
    ...(deliberationBody
      ? { deliberation_body: deliberationBody }
      : {}),
    presentation: projection.presentation,
    known_limits: item.known_limits,
  };
}

function publicExcludedItem(item: AlboItem): PublicRecord {
  const deliberationBody = alboItemDeliberationBody(item);
  return {
    id: item.id,
    public_id: publicActPublicId(item.publication_number) ?? item.id,
    source: item.source,
    source_url: item.source_url,
    retrieved_at: item.retrieved_at,
    publication_number: item.publication_number,
    verification_status: item.verification_status,
    privacy_risk: item.privacy_risk,
    public_visibility: "do_not_publish",
    privacy_attestation: sourcePrivacyAttestation(),
    ...(deliberationBody
      ? { deliberation_body: deliberationBody }
      : {}),
    known_limits: item.known_limits,
    exclusion_reason: "Record escluso dal layer pubblico per prudenza privacy automatica.",
  };
}

function publicRecordsFromItems(items: AlboItem[]): PublicRecord[] {
  return [
    ...items.filter((item) => item.public_visibility !== "do_not_publish").map(publicItem),
    ...items.filter((item) => item.public_visibility === "do_not_publish").map(publicExcludedItem),
  ];
}

function publicRecordsFromLatest(latest: PublicLatest): PublicRecord[] {
  return [...latest.items, ...latest.excluded].map(reapplyAlboPublicSafety);
}

function privacyPolicyAttestation(
  value: unknown,
): PrivacyPolicyAttestation | null {
  const candidate = objectValue(value);
  if (
    candidate?.schema_version !== "albo-privacy-policy-attestation.v1" ||
    typeof candidate.policy_version !== "string" ||
    (candidate.assessment_basis !== "source_record" &&
      candidate.assessment_basis !== "complete_public_record" &&
      candidate.assessment_basis !== "redacted_public_record") ||
    (candidate.status !== "current" &&
      candidate.status !== "reacquisition_required")
  ) {
    return null;
  }
  return candidate as unknown as PrivacyPolicyAttestation;
}

function currentCompletePrivacyAttestation(): PrivacyPolicyAttestation {
  return {
    schema_version: "albo-privacy-policy-attestation.v1",
    policy_version: ALBO_PRIVACY_POLICY_VERSION,
    assessment_basis: "complete_public_record",
    status: "current",
  };
}

function reacquisitionPrivacyAttestation(): PrivacyPolicyAttestation {
  return {
    schema_version: "albo-privacy-policy-attestation.v1",
    policy_version: ALBO_PRIVACY_POLICY_VERSION,
    assessment_basis: "redacted_public_record",
    status: "reacquisition_required",
  };
}

function hasCurrentCompletePrivacyAttestation(
  attestation: PrivacyPolicyAttestation | null,
): boolean {
  return Boolean(
    attestation &&
      attestation.policy_version === ALBO_PRIVACY_POLICY_VERSION &&
      attestation.status === "current" &&
      attestation.assessment_basis !== "redacted_public_record",
  );
}

export function reapplyAlboPublicSafety(record: PublicRecord): PublicRecord {
  const rawRecord = publicRecordAsRaw(record);
  const currentClassification = classifyAlboRecordCategory(rawRecord);
  const historicalClassification = normaliseStoredClassification(
    record.classification,
  );
  const presentationClassification = mergePublicClassifications(
    currentClassification,
    historicalClassification,
  );
  const currentVisibility = publicVisibilityValue(record.public_visibility);
  const currentRisk = privacyRiskValue(record.privacy_risk);
  const storedPrivacyAttestation = privacyPolicyAttestation(
    record.privacy_attestation,
  );
  const restrictedHistoryNeedsReacquisition =
    currentVisibility !== "publishable" &&
    !hasCurrentCompletePrivacyAttestation(storedPrivacyAttestation);
  let classified = enforceClassificationSafety(
    classify(rawRecord),
    currentClassification,
  );
  if (historicalClassification) {
    classified = enforceClassificationSafety(
      classified,
      historicalClassification,
    );
  }
  let effectiveRisk = moreRestrictiveRisk(currentRisk, classified.privacyRisk);
  let effectiveVisibility = moreRestrictiveVisibility(
    moreRestrictiveVisibility(currentVisibility, classified.publicVisibility),
    minimumVisibilityForRisk(effectiveRisk),
  );
  if (restrictedHistoryNeedsReacquisition) {
    effectiveRisk = moreRestrictiveRisk(effectiveRisk, "high");
    effectiveVisibility = moreRestrictiveVisibility(
      effectiveVisibility,
      "metadata_only",
    );
  }
  const reason = restrictedHistoryNeedsReacquisition
    ? PRIVACY_REACQUISITION_LIMIT
    : visibilityRank(classified.publicVisibility) >
        visibilityRank(currentVisibility)
      ? classified.reason
      : null;
  const outputPrivacyAttestation = restrictedHistoryNeedsReacquisition
    ? reacquisitionPrivacyAttestation()
    : currentVisibility === "publishable"
      ? currentCompletePrivacyAttestation()
      : (storedPrivacyAttestation ?? currentCompletePrivacyAttestation());

  return projectExistingPublicRecord(
    record,
    effectiveVisibility,
    effectiveRisk,
    reason,
    presentationClassification,
    outputPrivacyAttestation,
  );
}

function mergePublicClassifications(
  current: AlboRecordClassification,
  historical: AlboRecordClassification | null,
): AlboRecordClassification {
  if (!historical) return current;
  return {
    dictionary_version: ALBO_CLASSIFICATION_DICTIONARY.version,
    sector:
      current.sector.id === "non_classificato" &&
      historical.sector.id !== "non_classificato"
        ? historical.sector
        : current.sector,
    act_category:
      current.act_category.id === "non_classificato" &&
      historical.act_category.id !== "non_classificato"
        ? historical.act_category
        : current.act_category,
  };
}

function normaliseStoredClassification(
  value: unknown,
): AlboRecordClassification | null {
  const classification = objectValue(value);
  const storedSector = objectValue(classification?.sector);
  const storedActCategory = objectValue(classification?.act_category);
  if (!storedSector || !storedActCategory) return null;
  const sector = ALBO_CLASSIFICATION_DICTIONARY.sectors.find(
    (entry) => entry.id === storedSector.id,
  );
  const actCategory = ALBO_CLASSIFICATION_DICTIONARY.act_categories.find(
    (entry) => entry.id === storedActCategory.id,
  );
  if (!sector || !actCategory) return null;

  return {
    dictionary_version: ALBO_CLASSIFICATION_DICTIONARY.version,
    sector: {
      ...sector,
      confidence: classificationConfidence(storedSector.confidence),
      basis: classificationBasis(storedSector.basis),
    },
    act_category: {
      ...actCategory,
      confidence: classificationConfidence(storedActCategory.confidence),
      basis: classificationBasis(storedActCategory.basis),
    },
  };
}

function classificationConfidence(
  value: unknown,
): "high" | "medium" | "low" {
  return value === "high" || value === "medium" || value === "low"
    ? value
    : "low";
}

function classificationBasis(
  value: unknown,
): "office" | "act_type" | "office_and_act_type" | "fallback" {
  return value === "office" ||
    value === "act_type" ||
    value === "office_and_act_type" ||
    value === "fallback"
    ? value
    : "fallback";
}

function projectExistingPublicRecord(
  record: PublicRecord,
  publicVisibility: PublicVisibility,
  privacyRisk: PrivacyRisk,
  reason: string | null,
  classification: AlboRecordClassification,
  privacyAttestation: PrivacyPolicyAttestation,
): PublicRecord {
  const deliberationBody = deliberationBodyValue(record.deliberation_body);
  const policyFields = {
    privacy_attestation: privacyAttestation,
    ...(deliberationBody
      ? { deliberation_body: deliberationBody }
      : {}),
  };
  const persistedKnownLimits = Array.isArray(record.known_limits)
    ? record.known_limits.filter(
        (value): value is string => typeof value === "string",
      )
    : [];
  const knownLimits = unique([
    ...persistedKnownLimits,
    ...(publicVisibility === "publishable" ? [] : [MINIMISED_LIMIT]),
    ...(reason ? [reason] : []),
  ]);

  const decision = makeAlboPublicSafetyDecision(publicVisibility, privacyRisk, reason);
  const documentUrl = stringValue(record.document_url);
  const projection = decision ? projectPublicAct({
    id: record.id,
    progressivo: stringValue(record.publication_number) ?? "",
    tipologia: stringValue(record.act_type),
    category: "albo",
    subcategory: classification.act_category.id,
    provenienza: stringValue(record.office),
    oggetto: stringValue(record.subject),
    data_atto: stringValue(record.act_date),
    publication_start: stringValue(record.publication_start),
    publication_end: stringValue(record.publication_end),
    registry_section_number: null,
    registry_general_number: stringValue(record.act_number),
    cups: [],
    pnrr_mission: null,
    is_pnrr: false,
    is_new: false,
    first_seen_at: record.retrieved_at,
    macrotema: null,
    decision,
    attachments: documentUrl
      ? [{ name: "Documento ufficiale", tipo: null, official_url: documentUrl, archived_url: null, content_type: null, size: null, public_safe: true }]
      : [],
  }) : null;

  if (!projection) {
    return {
      id: record.id,
      public_id: publicActPublicId(stringValue(record.publication_number) ?? "") ?? record.id,
      source: record.source,
      source_url: record.source_url,
      retrieved_at: record.retrieved_at,
      publication_number: record.publication_number,
      verification_status: record.verification_status,
      privacy_risk: privacyRisk,
      public_visibility: "do_not_publish",
      classification,
      ...policyFields,
      known_limits: knownLimits,
      exclusion_reason: "Record escluso dal layer pubblico per prudenza privacy automatica.",
    };
  }

  const isFull = publicVisibility === "publishable";
  const contentHash = stringValue(record.content_hash);
  return {
    id: record.id,
    public_id: projection.public_id,
    source: record.source,
    source_url: stringValue(record.source_url),
    retrieved_at: record.retrieved_at,
    publication_number: projection.progressivo,
    publication_start: projection.publication_start,
    publication_end: projection.publication_end,
    office: isFull ? projection.provenienza : null,
    act_type: isFull ? projection.tipologia : null,
    act_number: projection.registry_general_number,
    act_date: projection.data_atto,
    ...(isFull && contentHash ? { content_hash: contentHash } : {}),
    subject: projection.oggetto,
    document_url: projection.attachments[0]?.official_url ?? null,
    public_note: publicVisibility === "publishable_with_minimisation"
      ? "Record pubblicato con minimizzazione automatica."
      : publicVisibility === "metadata_only"
        ? "Record limitato al metadato minimo."
        : null,
    verification_status: record.verification_status,
    privacy_risk: privacyRisk,
    public_visibility: publicVisibility,
    classification,
    ...policyFields,
    presentation: projection.presentation,
    known_limits: knownLimits,
  };
}

function publicRecordAsRaw(record: PublicRecord): RawAlboRecord {
  return {
    publication_number: stringValue(record.publication_number) ?? "",
    publication_start: stringValue(record.publication_start),
    publication_end: stringValue(record.publication_end),
    office: stringValue(record.office),
    act_type: stringValue(record.act_type),
    act_number: stringValue(record.act_number),
    act_date: stringValue(record.act_date),
    subject: stringValue(record.subject),
    document_url: stringValue(record.document_url),
    source_row: {},
  };
}

function publicVisibilityValue(value: unknown): PublicVisibility {
  return value === "publishable" ||
    value === "publishable_with_minimisation" ||
    value === "metadata_only" ||
    value === "do_not_publish"
    ? value
    : "metadata_only";
}

function deliberationBodyValue(
  value: unknown,
): "giunta" | "consiglio" | "altro" | null {
  return value === "giunta" || value === "consiglio" || value === "altro"
    ? value
    : null;
}

function privacyRiskValue(value: unknown): PrivacyRisk {
  return value === "low" || value === "medium" || value === "high"
    ? value
    : "high";
}

function moreRestrictiveVisibility(
  current: PublicVisibility,
  classified: PublicVisibility,
): PublicVisibility {
  return visibilityRank(classified) > visibilityRank(current)
    ? classified
    : current;
}

function visibilityRank(value: PublicVisibility): number {
  return {
    publishable: 0,
    publishable_with_minimisation: 1,
    metadata_only: 2,
    do_not_publish: 3,
  }[value];
}

function moreRestrictiveRisk(
  current: PrivacyRisk,
  classified: PrivacyRisk,
): PrivacyRisk {
  const rank: Record<PrivacyRisk, number> = { low: 0, medium: 1, high: 2 };
  return rank[classified] > rank[current] ? classified : current;
}

function minimumVisibilityForRisk(risk: PrivacyRisk): PublicVisibility {
  if (risk === "high") return "metadata_only";
  if (risk === "medium") return "publishable_with_minimisation";
  return "publishable";
}

function publicRecordDiffFromAlboDiff(diff: AlboDiff): PublicRecordDiff {
  const safe = (item: AlboItem): PublicRecord =>
    item.public_visibility === "do_not_publish" ? publicExcludedItem(item) : publicItem(item);
  return {
    new: diff.new.map(safe),
    changed: diff.changed.map((entry) => ({ before: safe(entry.before), after: safe(entry.after) })),
    removed: diff.removed.map(safe),
    unchanged: diff.unchanged.map(safe),
  };
}

function diffPublicRecords(previous: PublicRecord[], next: PublicRecord[]): PublicRecordDiff {
  const previousById = new Map(previous.map((record) => [record.id, record]));
  const nextById = new Map(next.map((record) => [record.id, record]));
  const result: PublicRecordDiff = { new: [], changed: [], removed: [], unchanged: [] };

  for (const item of next) {
    const before = previousById.get(item.id);
    if (!before) {
      result.new.push(item);
    } else if (publicRecordComparableHash(before) !== publicRecordComparableHash(item)) {
      result.changed.push({ before, after: item });
    } else {
      result.unchanged.push(item);
    }
  }

  for (const item of previous) {
    if (!nextById.has(item.id)) result.removed.push(item);
  }

  return result;
}

function publicRecordComparableHash(record: PublicRecord): string {
  const {
    retrieved_at: _retrievedAt,
    content_hash: _contentHash,
    classification: _classification,
    presentation: _presentation,
    privacy_attestation: _privacyAttestation,
    deliberation_body: _deliberationBody,
    ...stablePublicRecord
  } = record;
  return sha256(stablePublicRecord);
}

export function buildDelibereArchive(
  previous: DelibereArchive | null,
  latest: PublicLatest,
  documentsManifest: AlboDocumentsManifest,
): DelibereArchive {
  const archivedById = new Map(
    documentsManifest.documents
      .filter(isReusableArchivedPdfDocument)
      .map((document) => [document.id, document]),
  );
  const itemsById = new Map<string, DeliberaArchiveItem>();

  for (const item of previous?.items ?? []) {
    const projected = archiveDeliberationRecord(item, item, archivedById);
    if (projected) itemsById.set(projected.id, projected);
  }

  for (const record of latest.excluded) {
    itemsById.delete(record.id);
  }

  for (const record of latest.items) {
    const existing = itemsById.get(record.id);
    const projected = archiveDeliberationRecord(
      record,
      existing,
      archivedById,
    );
    if (projected) itemsById.set(record.id, projected);
    else itemsById.delete(record.id);
  }

  const items = [...itemsById.values()]
    .sort(compareDeliberaArchiveItems);
  const firstObservedAt = earliestText(
    items.map((item) => item.first_observed_at),
  );
  const lastObservedAt = latestText(
    items.map((item) => item.last_observed_at),
  );
  const actDates = items
    .map(
      (item) =>
        publicRecordText(item, "act_date") ??
        publicRecordText(item, "publication_start"),
    )
    .filter((value): value is string => Boolean(value));

  return {
    generated_at: latest.retrieved_at,
    source:
      publicRecordValue(latest.source) ?? ALBO_PRETORIO_LAMEZIA_SOURCE.source,
    source_url:
      publicRecordValue(latest.source_url) ??
      ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    verification_status: archiveVerificationStatus(latest.verification_status),
    coverage: {
      first_observed_at: firstObservedAt,
      last_observed_at: lastObservedAt,
      first_act_date: earliestText(actDates),
      last_act_date: latestText(actDates),
    },
    counts: {
      total: items.length,
      giunta: items.filter((item) => deliberationSubtype(item) === "giunta")
        .length,
      consiglio: items.filter(
        (item) => deliberationSubtype(item) === "consiglio",
      ).length,
      altro: items.filter((item) => deliberationSubtype(item) === "altro")
        .length,
      publishable: items.filter(
        (item) => item.public_visibility === "publishable",
      ).length,
      minimised: items.filter(
        (item) => item.public_visibility === "publishable_with_minimisation",
      ).length,
      metadata_only: items.filter(
        (item) => item.public_visibility === "metadata_only",
      ).length,
      archived_documents: items.filter(
        (item) => item.archived_document !== null,
      ).length,
    },
    known_limits: unique([
      ...arrayValue(latest.known_limits).flatMap((value) =>
        typeof value === "string" ? [value] : [],
      ),
      DELIBERE_ARCHIVE_LIMIT,
      OFFICIAL_ALBO_DISCLAIMER,
    ]),
    items,
  };
}

function archiveDeliberationRecord(
  record: PublicRecord,
  existing: DeliberaArchiveItem | undefined,
  archivedById: ReadonlyMap<string, ArchivedPdfDocument>,
): DeliberaArchiveItem | null {
  const body = preferredDeliberationBody(
    deliberationSubtype(record),
    existing?.deliberation_body ?? "altro",
  );
  const projected = reapplyAlboPublicSafety(record);
  if (
    projected.public_visibility === "do_not_publish" ||
    !isDeliberationPublicRecord(projected)
  ) {
    return null;
  }
  if (!projected.presentation) {
    throw new Error(
      `Deliberation ${projected.id} has no public-safe presentation.`,
    );
  }

  return {
    ...projected,
    deliberation_body: preferredDeliberationBody(
      body,
      deliberationSubtype(projected),
    ),
    first_observed_at: existing?.first_observed_at ?? record.retrieved_at,
    last_observed_at: record.retrieved_at,
    archived_document: authorisedArchiveDocument(
      projected,
      archivedById.get(projected.id),
    ),
  };
}

function authorisedArchiveDocument(
  record: PublicRecord,
  document: ArchivedPdfDocument | undefined,
): ArchivedPdfDocument | null {
  const sha = document?.sha256.toLowerCase();
  const storagePath = document?.storage_path.toLowerCase();
  if (
    record.public_visibility !== "publishable" ||
    record.privacy_risk !== "low" ||
    !document ||
    document.id !== record.id ||
    document.public_visibility !== "publishable" ||
    document.privacy_risk !== "low" ||
    document.content_type.split(";", 1)[0]?.trim().toLowerCase() !==
      "application/pdf" ||
    !sha ||
    !/^[a-f0-9]{64}$/.test(sha) ||
    !storagePath?.endsWith(`/${sha}.pdf`)
  ) {
    return null;
  }
  return document;
}

function isDeliberationPublicRecord(record: PublicRecord): boolean {
  if (record.classification?.act_category.id === "deliberazioni") return true;
  return /^DELIBERAZIONE\b/i.test(publicRecordText(record, "act_type") ?? "");
}

function deliberationSubtype(
  record: PublicRecord,
): "giunta" | "consiglio" | "altro" {
  const storedBody = deliberationBodyValue(record.deliberation_body);
  if (storedBody === "giunta" || storedBody === "consiglio") {
    return storedBody;
  }
  const actType = (publicRecordText(record, "act_type") ?? "").toUpperCase();
  if (actType.includes("CONSIGLIO")) return "consiglio";
  if (actType.includes("GIUNTA")) return "giunta";
  return storedBody ?? "altro";
}

function preferredDeliberationBody(
  first: "giunta" | "consiglio" | "altro",
  second: "giunta" | "consiglio" | "altro",
): "giunta" | "consiglio" | "altro" {
  return first !== "altro" ? first : second;
}

function compareDeliberaArchiveItems(
  left: DeliberaArchiveItem,
  right: DeliberaArchiveItem,
): number {
  const leftKey = [
    publicRecordText(left, "act_date"),
    publicRecordText(left, "publication_start"),
    publicRecordText(left, "publication_number"),
    left.id,
  ]
    .filter(Boolean)
    .join("|");
  const rightKey = [
    publicRecordText(right, "act_date"),
    publicRecordText(right, "publication_start"),
    publicRecordText(right, "publication_number"),
    right.id,
  ]
    .filter(Boolean)
    .join("|");
  return rightKey.localeCompare(leftKey, "it");
}

function publicRecordText(record: PublicRecord, key: string): string | null {
  return publicRecordValue(record[key]);
}

function publicRecordValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function earliestText(values: string[]): string | null {
  return values.length > 0
    ? [...values].sort((left, right) => left.localeCompare(right))[0] ?? null
    : null;
}

function latestText(values: string[]): string | null {
  return values.length > 0
    ? [...values].sort((left, right) => right.localeCompare(left))[0] ?? null
    : null;
}

function archiveVerificationStatus(value: unknown): VerificationStatus {
  return value === "official_source_acquired" ||
    value === "normalised_automatically" ||
    value === "verification_required"
    ? value
    : "verification_required";
}

async function archivePublicPdfs(
  outDir: string,
  snapshot: AlboRawSnapshot,
  items: AlboItem[],
  pdfFetch: typeof fetch,
  allowMissingPreviousManifest: boolean,
): Promise<PdfArchivePlan> {
  const documents: ArchivedPdfDocument[] = [];
  const decisions: PdfPreservationDecision[] = [];
  const pendingWrites = new Map<string, Uint8Array>();
  const warnings: string[] = [];
  const previousDocuments = await readReusableArchivedDocuments(
    outDir,
    allowMissingPreviousManifest,
  );
  const reviewedPaths = await reviewedDocumentStoragePaths(outDir);

  for (const item of items) {
    const base = pdfDecisionBase(item);

    if (
      item.public_visibility === "publishable_with_minimisation" ||
      item.privacy_risk === "medium"
    ) {
      decisions.push({
        ...base,
        preservation_status: "human_review_required",
        reason: "human_review_required",
      });
      continue;
    }

    if (
      item.public_visibility !== "publishable" ||
      item.privacy_risk !== "low"
    ) {
      decisions.push({
        ...base,
        preservation_status: "excluded",
        reason: "privacy_excluded",
      });
      continue;
    }

    const officialDocument = resolveOfficialDocumentUrl(item.document_url);
    if (!officialDocument.href) {
      if (officialDocument.reason === "non_https_document_url") {
        warnings.push(
          `PDF archival skipped for ${item.id}: official document URL is not HTTPS.`,
        );
      }
      decisions.push({
        ...base,
        preservation_status: "skipped",
        reason: officialDocument.reason,
      });
      continue;
    }

    const previous = previousArchivedDocument(
      previousDocuments,
      item.id,
      officialDocument.href,
    );
    const archived = await fetchAndPlanPdf(
      outDir,
      item,
      officialDocument.href,
      pdfFetch,
      pendingWrites,
      previous,
    );
    decisions.push(archived);
    if (isArchivedPdfDocument(archived)) {
      documents.push(archived);
    }
  }

  const revocations = await planArchivedDocumentRevocations(
    outDir,
    previousDocuments,
    documents,
    reviewedPaths,
  );
  const archiveTreeAudit = await auditArchivedPdfTree(
    outDir,
    new Set([
      ...documents.map((document) => document.storage_path),
      ...reviewedPaths,
    ]),
    new Set(revocations),
  );
  if (archiveTreeAudit.unmanagedOrphans > 0) {
    warnings.push(
      `Detected ${archiveTreeAudit.unmanagedOrphans} unreferenced PDF file(s) in the validated archive tree; left untouched pending a separately reviewed cleanup.`,
    );
  }
  if (archiveTreeAudit.unexpectedEntries > 0) {
    warnings.push(
      `Detected ${archiveTreeAudit.unexpectedEntries} unexpected archive tree entry or entries; no unmanaged cleanup was attempted.`,
    );
  }

  const counts = {
    considered: items.length,
    eligible: decisions.filter(
      (decision) => decision.reason === "eligible_low_risk_publishable_pdf",
    ).length,
    archived: documents.length,
    skipped: decisions.filter(
      (decision) => decision.preservation_status === "skipped",
    ).length,
    excluded: decisions.filter(
      (decision) => decision.preservation_status === "excluded",
    ).length,
    human_review_required: decisions.filter(
      (decision) => decision.preservation_status === "human_review_required",
    ).length,
    revoked: revocations.length,
  };

  return {
    manifest: {
      generated_at: snapshot.retrieved_at,
      source: snapshot.source,
      source_url: snapshot.source_url,
      retrieved_at: snapshot.retrieved_at,
      verification_status: verificationStatus(snapshot.fetch_method),
      policy: {
        eligibility:
          "Archive only HTTPS official PDFs for records classified public_visibility=publishable and privacy_risk=low.",
        official_url_host: officialAlboHost(),
        requires_https: true,
        content_type: "application/pdf",
        max_size_bytes: MAX_PUBLIC_PDF_BYTES,
        storage_path_template: "data/public/albo/documents/<year>/<sha>.pdf",
        sha256_deduplication: true,
        no_ocr: true,
        no_pdf_parsing: true,
        no_summaries: true,
        no_rankings: true,
        privacy_revocation_cleanup: true,
        unmanaged_orphan_cleanup: false,
        upstream_revalidation: "conditional_get_or_full_get",
        local_reuse_verification: "path_sha256_size_and_pdf_signature",
        paid_storage: false,
      },
      counts,
      warnings: unique(warnings),
      documents,
      decisions,
    },
    writes: [...pendingWrites].map(([storagePath, bytes]) => ({
      storagePath,
      bytes,
    })),
    revocations,
  };
}

async function planArchivedDocumentRevocations(
  outDir: string,
  previousDocuments: ArchivedPdfDocument[],
  activeDocuments: ArchivedPdfDocument[],
  reviewedPaths: Set<string>,
): Promise<string[]> {
  const activePaths = new Set(
    [
      ...activeDocuments.map((document) => document.storage_path),
      ...reviewedPaths,
    ],
  );
  const revocations = new Set<string>();

  for (const previous of previousDocuments) {
    if (activePaths.has(previous.storage_path)) continue;
    validateArchivedStoragePath(previous.storage_path);
    try {
      const absolutePath = await resolveExistingArchivedPdfPath(
        outDir,
        previous.storage_path,
      );
      const file = await lstat(absolutePath);
      if (!file.isFile()) {
        throw new Error(
          `Archived PDF revocation target is not a file: ${previous.storage_path}`,
        );
      }
      revocations.add(previous.storage_path);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  return [...revocations];
}

async function auditArchivedPdfTree(
  outDir: string,
  activePaths: Set<string>,
  plannedRevocations: Set<string>,
): Promise<{ unmanagedOrphans: number; unexpectedEntries: number }> {
  const documentsRoot = await assertArchivedDocumentsRootSafe(outDir);
  if (!documentsRoot) {
    return { unmanagedOrphans: 0, unexpectedEntries: 0 };
  }
  let years: Dirent[];
  try {
    years = await readdir(documentsRoot, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { unmanagedOrphans: 0, unexpectedEntries: 0 };
    }
    throw error;
  }

  let unmanagedOrphans = 0;
  let unexpectedEntries = 0;
  for (const year of years) {
    if (year.isSymbolicLink()) {
      throw new Error(
        `Unsafe symlink in archived PDF tree: ${path.join(documentsRoot, year.name)}`,
      );
    }
    if (!year.isDirectory() || !/^\d{4}$/u.test(year.name)) {
      unexpectedEntries += 1;
      continue;
    }
    const yearPath = await assertArchiveYearDirectorySafe(outDir, year.name);
    const entries = await readdir(yearPath, {
      withFileTypes: true,
    });
    for (const entry of entries) {
      const storagePath = `data/public/albo/documents/${year.name}/${entry.name}`;
      if (entry.isSymbolicLink()) {
        throw new Error(
          `Unsafe symlink in archived PDF tree: ${path.join(yearPath, entry.name)}`,
        );
      }
      if (!entry.isFile() || !isArchivedStoragePath(storagePath)) {
        unexpectedEntries += 1;
        continue;
      }
      if (
        !activePaths.has(storagePath) &&
        !plannedRevocations.has(storagePath)
      ) {
        unmanagedOrphans += 1;
      }
    }
  }

  return { unmanagedOrphans, unexpectedEntries };
}

async function readReusableArchivedDocuments(
  outDir: string,
  allowMissing: boolean,
): Promise<ArchivedPdfDocument[]> {
  const manifestPath = path.join(
    outDir,
    "public",
    "albo",
    "documents-manifest.json",
  );
  let contents: string;
  try {
    contents = await readFile(manifestPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      if (allowMissing) return [];
      throw new Error(
        `Missing previous Albo PDF manifest after an earlier ingestion: ${manifestPath}`,
        { cause: error },
      );
    }
    throw new Error(`Cannot read previous Albo PDF manifest: ${manifestPath}`, {
      cause: error,
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents) as unknown;
  } catch (error) {
    throw new Error(
      `Invalid JSON in previous Albo PDF manifest: ${manifestPath}`,
      {
        cause: error,
      },
    );
  }

  return validateAlboDocumentsManifest(parsed, manifestPath).documents;
}

export function validateAlboDocumentsManifest(
  value: unknown,
  manifestPath = "Albo PDF manifest",
): AlboDocumentsManifest {
  const invalid = (detail: string): never => {
    throw new Error(
      `Invalid schema in previous Albo PDF manifest: ${manifestPath} (${detail})`,
    );
  };
  const manifestValue = objectValue(value);
  if (!manifestValue) invalid("top-level object");
  const manifest = manifestValue as Record<string, unknown>;
  if (
    !isIsoDateString(manifest.generated_at) ||
    typeof manifest.source !== "string" ||
    !manifest.source ||
    !isOfficialAlboHttpsUrl(manifest.source_url) ||
    !isIsoDateString(manifest.retrieved_at) ||
    !isVerificationStatus(manifest.verification_status)
  ) {
    invalid("identity metadata");
  }

  const policy = objectValue(manifest.policy);
  if (
    !policy ||
    typeof policy.eligibility !== "string" ||
    !policy.eligibility ||
    policy.official_url_host !== officialAlboHost() ||
    policy.requires_https !== true ||
    policy.content_type !== "application/pdf" ||
    policy.max_size_bytes !== MAX_PUBLIC_PDF_BYTES ||
    policy.storage_path_template !==
      "data/public/albo/documents/<year>/<sha>.pdf" ||
    policy.sha256_deduplication !== true ||
    policy.no_ocr !== true ||
    policy.no_pdf_parsing !== true ||
    policy.no_summaries !== true ||
    policy.no_rankings !== true ||
    policy.privacy_revocation_cleanup !== true ||
    policy.unmanaged_orphan_cleanup !== false ||
    policy.upstream_revalidation !== "conditional_get_or_full_get" ||
    policy.local_reuse_verification !==
      "path_sha256_size_and_pdf_signature" ||
    policy.paid_storage !== false
  ) {
    invalid("policy");
  }
  if (
    !Array.isArray(manifest.warnings) ||
    !manifest.warnings.every((warning) => typeof warning === "string") ||
    !Array.isArray(manifest.decisions) ||
    !Array.isArray(manifest.documents)
  ) {
    invalid("collections");
  }

  const decisionValues = manifest.decisions as unknown[];
  const documentValues = manifest.documents as unknown[];
  const decisions: Array<PdfPreservationDecision | ArchivedPdfDocument> =
    decisionValues.map((decision, index) => {
      if (!isPdfPreservationDecision(decision)) {
        invalid(`decisions[${index}]`);
      }
      return decision as PdfPreservationDecision | ArchivedPdfDocument;
    });
  const documents: ArchivedPdfDocument[] = documentValues.map(
    (document, index) => {
      if (!isReusableArchivedPdfDocument(document)) {
        invalid(`documents[${index}]`);
      }
      return document as ArchivedPdfDocument;
    },
  );
  if (
    new Set(decisions.map((decision) => decision.id)).size !== decisions.length
  ) {
    invalid("duplicate decision ids");
  }
  if (
    new Set(documents.map((document) => document.id)).size !== documents.length
  ) {
    invalid("duplicate document ids");
  }

  const documentById = new Map(
    documents.map((document) => [document.id, document]),
  );
  for (const decision of decisions) {
    if (
      decision.source !== manifest.source ||
      decision.source_url !== manifest.source_url ||
      decision.retrieved_at !== manifest.retrieved_at ||
      decision.verification_status !== manifest.verification_status
    ) {
      invalid(`decision ${decision.id} source coherence`);
    }
    if (decision.preservation_status === "archived") {
      const document = documentById.get(decision.id);
      if (!document || !sameArchivedDecision(decision, document)) {
        invalid(`archived decision ${decision.id} coherence`);
      }
    } else if (documentById.has(decision.id)) {
      invalid(`non-archived decision ${decision.id} has a document`);
    }
  }
  if (
    documents.some(
      (document) =>
        document.source !== manifest.source ||
        document.source_url !== manifest.source_url ||
        document.retrieved_at !== manifest.retrieved_at,
    )
  ) {
    invalid("document source coherence");
  }

  const countsValue = objectValue(manifest.counts);
  if (!countsValue) invalid("counts");
  const counts = countsValue as Record<string, unknown>;
  const countKeys = [
    "considered",
    "eligible",
    "archived",
    "skipped",
    "excluded",
    "human_review_required",
    "revoked",
  ] as const;
  if (
    countKeys.some(
      (key) =>
        !Number.isSafeInteger(counts[key]) || (counts[key] as number) < 0,
    )
  ) {
    invalid("counts");
  }
  const expectedCounts = {
    considered: decisions.length,
    eligible: decisions.filter(
      (decision) => decision.reason === "eligible_low_risk_publishable_pdf",
    ).length,
    archived: documents.length,
    skipped: decisions.filter(
      (decision) => decision.preservation_status === "skipped",
    ).length,
    excluded: decisions.filter(
      (decision) => decision.preservation_status === "excluded",
    ).length,
    human_review_required: decisions.filter(
      (decision) => decision.preservation_status === "human_review_required",
    ).length,
  };
  if (
    Object.entries(expectedCounts).some(
      ([key, expected]) => counts[key] !== expected,
    )
  ) {
    invalid("count coherence");
  }

  return manifest as unknown as AlboDocumentsManifest;
}

function isPdfPreservationDecision(
  value: unknown,
): value is PdfPreservationDecision | ArchivedPdfDocument {
  const decision = objectValue(value);
  if (
    !decision ||
    typeof decision.id !== "string" ||
    !decision.id ||
    typeof decision.publication_number !== "string" ||
    typeof decision.source !== "string" ||
    !isOfficialAlboHttpsUrl(decision.source_url) ||
    !isIsoDateString(decision.retrieved_at) ||
    !isPublicVisibility(decision.public_visibility) ||
    !isPrivacyRisk(decision.privacy_risk) ||
    !isVerificationStatus(decision.verification_status)
  ) {
    return false;
  }
  if (decision.preservation_status === "archived") {
    return (
      isReusableArchivedPdfDocument(decision) &&
      isOfficialAlboHttpsUrl(decision.document_url) &&
      decision.public_visibility === "publishable" &&
      decision.privacy_risk === "low"
    );
  }
  if (
    decision.document_url !== undefined ||
    decision.storage_path !== undefined ||
    decision.sha256 !== undefined ||
    decision.size_bytes !== undefined ||
    decision.content_type !== undefined
  ) {
    return false;
  }
  if (decision.preservation_status === "excluded") {
    return decision.reason === "privacy_excluded";
  }
  if (decision.preservation_status === "human_review_required") {
    return decision.reason === "human_review_required";
  }
  if (decision.preservation_status === "skipped") {
    return [
      "no_document_url",
      "non_https_document_url",
      "non_official_document_url",
      "content_type_not_pdf",
      "size_limit_exceeded",
      "fetch_failed",
    ].includes(String(decision.reason));
  }
  return false;
}

function sameArchivedDecision(
  decision: PdfPreservationDecision | ArchivedPdfDocument,
  document: ArchivedPdfDocument,
): boolean {
  if (!isArchivedPdfDocument(decision)) return false;
  return (
    decision.storage_path === document.storage_path &&
    decision.sha256 === document.sha256 &&
    decision.size_bytes === document.size_bytes &&
    decision.content_type === document.content_type &&
    decision.document_url === document.document_url
  );
}

function previousArchivedDocument(
  previousDocuments: ArchivedPdfDocument[],
  itemId: string,
  documentUrl: string,
): ArchivedPdfDocument | null {
  return (
    previousDocuments.find(
      (document) =>
        document.id === itemId && document.document_url === documentUrl,
    ) ??
    previousDocuments.find(
      (document) => document.document_url === documentUrl,
    ) ??
    null
  );
}

async function verifiedReusableArchivedDocument(
  outDir: string,
  item: AlboItem,
  documentUrl: string,
  previous: ArchivedPdfDocument | null,
): Promise<ArchivedPdfDocument | null> {
  if (!previous) return null;
  const expectedPath = `data/public/albo/documents/${publicationYear(item)}/${previous.sha256}.pdf`;
  if (
    previous.storage_path !== expectedPath ||
    previous.content_type !== "application/pdf" ||
    previous.size_bytes <= 0 ||
    previous.size_bytes > MAX_PUBLIC_PDF_BYTES
  ) {
    return null;
  }
  try {
    await verifyArchivedPdfFile(outDir, previous, { requireSize: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    if (/symlink|escapes the archive root/iu.test(errorMessage(error))) {
      throw error;
    }
    return null;
  }
  return {
    ...pdfDecisionBase(item),
    document_url: documentUrl,
    preservation_status: "archived",
    reason: "eligible_low_risk_publishable_pdf",
    storage_path: previous.storage_path,
    sha256: previous.sha256,
    size_bytes: previous.size_bytes,
    content_type: previous.content_type,
    ...(previous.verified_at ? { verified_at: previous.verified_at } : {}),
    ...(previous.etag ? { etag: previous.etag } : {}),
    ...(previous.last_modified
      ? { last_modified: previous.last_modified }
      : {}),
  };
}

function isReusableStoragePath(storagePath: string): boolean {
  return isArchivedStoragePath(storagePath);
}

function isReusableArchivedPdfDocument(
  value: unknown,
): value is ArchivedPdfDocument {
  const document = objectValue(value);
  if (!document) return false;
  return (
    document.preservation_status === "archived" &&
    document.reason === "eligible_low_risk_publishable_pdf" &&
    typeof document.document_url === "string" &&
    typeof document.storage_path === "string" &&
    typeof document.sha256 === "string" &&
    /^[a-f0-9]{64}$/iu.test(document.sha256) &&
    typeof document.size_bytes === "number" &&
    Number.isSafeInteger(document.size_bytes) &&
    document.size_bytes > 0 &&
    document.size_bytes <= MAX_PUBLIC_PDF_BYTES &&
    document.content_type === "application/pdf" &&
    typeof document.id === "string" &&
    typeof document.publication_number === "string" &&
    typeof document.source === "string" &&
    typeof document.source_url === "string" &&
    typeof document.retrieved_at === "string" &&
    typeof document.public_visibility === "string" &&
    typeof document.privacy_risk === "string" &&
    typeof document.verification_status === "string" &&
    (document.verified_at === undefined ||
      typeof document.verified_at === "string") &&
    (document.etag === undefined || typeof document.etag === "string") &&
    (document.last_modified === undefined ||
      typeof document.last_modified === "string") &&
    isReusableStoragePath(document.storage_path) &&
    document.storage_path.endsWith(`/${document.sha256}.pdf`)
  );
}

async function fetchAndPlanPdf(
  outDir: string,
  item: AlboItem,
  documentUrl: string,
  pdfFetch: typeof fetch,
  pendingWrites: Map<string, Uint8Array>,
  previous: ArchivedPdfDocument | null,
): Promise<PdfPreservationDecision | ArchivedPdfDocument> {
  const base = pdfDecisionBase(item);
  const reusable = await verifiedReusableArchivedDocument(
    outDir,
    item,
    documentUrl,
    previous,
  );
  const conditionalHeaders = new Headers();
  if (reusable?.etag) conditionalHeaders.set("if-none-match", reusable.etag);
  if (reusable?.last_modified) {
    conditionalHeaders.set("if-modified-since", reusable.last_modified);
  }

  try {
    const response = await fetchOfficialPdfWithValidatedRedirects(
      documentUrl,
      pdfFetch,
      conditionalHeaders,
    );
    if (response.status === 304) {
      if (
        !reusable ||
        (!conditionalHeaders.has("if-none-match") &&
          !conditionalHeaders.has("if-modified-since"))
      ) {
        return {
          ...base,
          preservation_status: "skipped",
          reason: "fetch_failed",
        };
      }
      return {
        ...reusable,
        verified_at: item.retrieved_at,
      };
    }
    if (!response.ok) {
      await cancelResponseBody(response);
      return {
        ...base,
        preservation_status: "skipped",
        reason: "fetch_failed",
      };
    }

    const contentType = normalizeContentType(
      response.headers.get("content-type"),
    );
    if (contentType !== "application/pdf") {
      await cancelResponseBody(response);
      return {
        ...base,
        preservation_status: "skipped",
        reason: "content_type_not_pdf",
      };
    }

    const declaredSize = parseContentLength(
      response.headers.get("content-length"),
    );
    if (declaredSize !== null && declaredSize > MAX_PUBLIC_PDF_BYTES) {
      await cancelResponseBody(response);
      return {
        ...base,
        preservation_status: "skipped",
        reason: "size_limit_exceeded",
      };
    }

    const bytes = await readResponseBodyWithinLimit(
      response,
      MAX_PUBLIC_PDF_BYTES,
    );
    if (!bytes) {
      return {
        ...base,
        preservation_status: "skipped",
        reason: "size_limit_exceeded",
      };
    }
    if (
      (declaredSize !== null && declaredSize !== bytes.byteLength) ||
      !hasPdfSignature(bytes)
    ) {
      return {
        ...base,
        preservation_status: "skipped",
        reason:
          declaredSize !== null && declaredSize !== bytes.byteLength
            ? "fetch_failed"
            : "content_type_not_pdf",
      };
    }

    const digest = sha256Bytes(bytes);
    const year = publicationYear(item);
    const storagePath = `data/public/albo/documents/${year}/${digest}.pdf`;
    if (
      !reusable ||
      reusable.sha256 !== digest ||
      reusable.size_bytes !== bytes.byteLength ||
      reusable.storage_path !== storagePath
    ) {
      pendingWrites.set(storagePath, bytes);
    }

    return {
      ...base,
      document_url: documentUrl,
      preservation_status: "archived",
      reason: "eligible_low_risk_publishable_pdf",
      storage_path: storagePath,
      sha256: digest,
      size_bytes: bytes.byteLength,
      content_type: contentType,
      verified_at: item.retrieved_at,
      ...headerMetadata(response),
    };
  } catch {
    return {
      ...base,
      preservation_status: "skipped",
      reason: "fetch_failed",
    };
  }
}

async function fetchOfficialPdfWithValidatedRedirects(
  initialUrl: string,
  pdfFetch: typeof fetch,
  headers: Headers,
): Promise<Response> {
  const visited = new Set<string>();
  let currentUrl = initialUrl;
  for (let hop = 0; hop <= 5; hop += 1) {
    const official = resolveOfficialDocumentUrl(currentUrl);
    if (!official.href || visited.has(official.href)) {
      throw new Error(`Unsafe or cyclic official PDF redirect: ${currentUrl}`);
    }
    visited.add(official.href);
    const response = await pdfFetch(official.href, {
      headers,
      redirect: "manual",
    });
    if (
      response.url &&
      resolveOfficialDocumentUrl(response.url).href === null
    ) {
      await cancelResponseBody(response);
      throw new Error("PDF fetch resolved outside the official HTTPS host");
    }
    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return response;
    }
    const location = response.headers.get("location");
    await cancelResponseBody(response);
    if (!location || hop === 5) {
      throw new Error("Invalid or excessive official PDF redirect chain");
    }
    currentUrl = new URL(location, official.href).href;
  }
  throw new Error("Excessive official PDF redirect chain");
}

async function readResponseBodyWithinLimit(
  response: Response,
  maxBytes: number,
): Promise<Uint8Array | null> {
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        try {
          await reader.cancel("Albo public PDF size limit exceeded");
        } catch {
          // The byte cap remains authoritative even if cancellation reports an error.
        }
        return null;
      }
      chunks.push(value);
    }
  } catch (error) {
    try {
      await reader.cancel(error);
    } catch {
      // Preserve the stream read failure.
    }
    throw error;
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function cancelResponseBody(response: Response): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // Cancellation is best-effort after the response has already been rejected.
  }
}

function headerMetadata(
  response: Response,
): Pick<ArchivedPdfDocument, "etag" | "last_modified"> {
  const etag = nullable(response.headers.get("etag"));
  const lastModified = nullable(response.headers.get("last-modified"));
  return {
    ...(etag ? { etag } : {}),
    ...(lastModified ? { last_modified: lastModified } : {}),
  };
}

function hasPdfSignature(bytes: Uint8Array): boolean {
  const prefix = new TextDecoder("latin1").decode(bytes.slice(0, 1024));
  return prefix.includes("%PDF-");
}

function pdfDecisionBase(item: AlboItem): Omit<PdfPreservationDecision, "document_url" | "preservation_status" | "reason"> {
  return {
    id: item.id,
    publication_number: item.publication_number,
    source: item.source,
    source_url: item.source_url,
    retrieved_at: item.retrieved_at,
    public_visibility: item.public_visibility,
    privacy_risk: item.privacy_risk,
    verification_status: item.verification_status,
  };
}

function isArchivedPdfDocument(decision: PdfPreservationDecision | ArchivedPdfDocument): decision is ArchivedPdfDocument {
  return decision.preservation_status === "archived";
}

async function writeArtifacts(
  outDir: string,
  snapshot: AlboRawSnapshot,
  items: AlboItem[],
  publicLatest: PublicLatest,
  publicDiff: PublicDiff,
  documentsManifest: AlboDocumentsManifest,
  delibereArchive: DelibereArchive,
  publicStatus: AlboPublicStatus,
  runLog: string,
  pdfArchivePlan: PdfArchivePlan,
): Promise<RunResult["paths"]> {
  const paths = {
    currentSnapshot: path.join(outDir, "snapshots", "albo", "current.json"),
    historySnapshot: path.join(
      outDir,
      "snapshots",
      "albo",
      "history",
      `${snapshot.retrieved_at.replace(/[:.]/g, "-")}.json`,
    ),
    processedItems: path.join(outDir, "processed", "albo", "albo_items.json"),
    publicLatest: path.join(outDir, "public", "albo", "latest.json"),
    publicDiff: path.join(outDir, "public", "albo", "diff-latest.json"),
    documentsManifest: path.join(
      outDir,
      "public",
      "albo",
      "documents-manifest.json",
    ),
    delibereArchive: path.join(
      outDir,
      "public",
      "albo",
      "delibere-archive.json",
    ),
    publicStatus: path.join(outDir, "public", "albo", "status.json"),
    runLog: path.join(outDir, "public", "albo", "run-latest.md"),
  };

  const pdfWrites = await Promise.all(
    pdfArchivePlan.writes.map(async ({ storagePath, bytes }) => ({
      target: await prepareArchivedPdfWritePath(outDir, storagePath),
      contents: bytes,
    })),
  );
  const pdfRevocations = await Promise.all(
    pdfArchivePlan.revocations.map((storagePath) =>
      resolveExistingArchivedPdfPath(outDir, storagePath),
    ),
  );
  const processed = {
    generated_at: snapshot.retrieved_at,
    source: snapshot.source,
    source_url: snapshot.source_url,
    retrieved_at: snapshot.retrieved_at,
    items,
  };
  await promoteAlboArtifactBatch(
    [
      ...pdfWrites,
      { target: paths.currentSnapshot, contents: jsonText(snapshot) },
      { target: paths.historySnapshot, contents: jsonText(snapshot) },
      { target: paths.processedItems, contents: jsonText(processed) },
      { target: paths.publicLatest, contents: jsonText(publicLatest) },
      { target: paths.publicDiff, contents: jsonText(publicDiff) },
      { target: paths.delibereArchive, contents: jsonText(delibereArchive) },
      { target: paths.publicStatus, contents: jsonText(publicStatus) },
      { target: paths.runLog, contents: runLog },
      // The serving allow-list is promoted last, after every referenced PDF.
      {
        target: paths.documentsManifest,
        contents: jsonText(documentsManifest),
      },
    ],
    pdfRevocations,
    { outDir },
  );
  return paths;
}

function jsonText(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function countRun(
  items: AlboItem[],
  diff: { new: unknown[]; changed: unknown[]; removed: unknown[]; unchanged: unknown[] },
): RunCounts {
  return {
    acquired: items.length,
    new: diff.new.length,
    changed: diff.changed.length,
    removed: diff.removed.length,
    unchanged: diff.unchanged.length,
    publishable: countVisibility(items, "publishable"),
    minimised: countVisibility(items, "publishable_with_minimisation"),
    metadata_only: countVisibility(items, "metadata_only"),
    excluded: countVisibility(items, "do_not_publish"),
  };
}

async function readSnapshot(filePath: string): Promise<AlboRawSnapshot | null> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw new Error(`Cannot read previous Albo snapshot: ${filePath}`, {
      cause: error,
    });
  }
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch (error) {
    throw new Error(`Invalid JSON in previous Albo snapshot: ${filePath}`, {
      cause: error,
    });
  }
  if (!isSnapshot(value)) {
    throw new Error(`Invalid schema in previous Albo snapshot: ${filePath}`);
  }
  return value;
}

async function readPublicLatest(filePath: string): Promise<PublicLatest | null> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw new Error(`Cannot read previous public Albo data: ${filePath}`, {
      cause: error,
    });
  }
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch (error) {
    throw new Error(`Invalid JSON in previous public Albo data: ${filePath}`, {
      cause: error,
    });
  }
  if (!isPublicLatest(value)) {
    throw new Error(`Invalid schema in previous public Albo data: ${filePath}`);
  }
  return value;
}

async function isPristineAlboLifecycle(outDir: string): Promise<boolean> {
  const managedRoots = [
    path.join(outDir, "snapshots", "albo"),
    path.join(outDir, "processed", "albo"),
    path.join(outDir, "public", "albo"),
  ];
  for (const managedRoot of managedRoots) {
    try {
      await lstat(managedRoot);
      return false;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw new Error(
          `Cannot inspect previous Albo lifecycle state: ${managedRoot}`,
          { cause: error },
        );
      }
    }
  }
  return true;
}

async function readDelibereArchive(
  filePath: string,
): Promise<DelibereArchive | null> {
  let serialised: string;
  try {
    serialised = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }

  let value: unknown;
  try {
    value = JSON.parse(serialised) as unknown;
  } catch (error) {
    throw new Error(`Invalid deliberations archive JSON at ${filePath}.`, {
      cause: error,
    });
  }
  if (!isDelibereArchive(value)) {
    throw new Error(`Invalid deliberations archive schema at ${filePath}.`);
  }
  return value;
}

function parseByFormat(
  text: string,
  format: NonNullable<CliOptions["inputFormat"]>,
): { records: RawAlboRecord[]; method: AlboFetchMethod; rawFormat: "xml" | "csv" | "html" } {
  if (format === "xml") return { records: parseTinnvisionXml(text), method: "xml", rawFormat: "xml" };
  if (format === "csv") return { records: parseTinnvisionCsv(text), method: "csv", rawFormat: "csv" };
  return {
    records: parseTinnvisionHtml(text),
    method: format === "print" ? "print-fallback" : "html-fallback",
    rawFormat: "html",
  };
}

function classify(record: RawAlboRecord): PrivacyClassification {
  const decision = classifyAlboPublicSafety({
    subject: record.subject,
    act_type: record.act_type,
    office: record.office,
  });
  return {
    privacyRisk: decision.privacy_risk,
    publicVisibility: decision.public_visibility,
    reason: decision.reason,
  };
}

function enforceClassificationSafety(
  classification: PrivacyClassification,
  recordClassification: unknown,
): PrivacyClassification {
  if (
    isNotificationDepositClassification(recordClassification) &&
    visibilityRank(classification.publicVisibility) < visibilityRank("metadata_only")
  ) {
    return {
      privacyRisk: "high",
      publicVisibility: "metadata_only",
      reason: NOTIFICATION_METADATA_ONLY_REASON,
    };
  }
  return classification;
}

function isNotificationDepositClassification(value: unknown): boolean {
  const classification = objectValue(value);
  const actCategory = objectValue(classification?.act_category);
  return actCategory?.id === "notifiche_depositi";
}

function itemLimits(snapshot: AlboRawSnapshot, record: RawAlboRecord, reason: string | null): string[] {
  const limits = [...snapshot.known_limits, ALBO_CLASSIFICATION_KNOWN_LIMIT];
  if (!record.document_url) limits.push(DOCUMENT_URL_LIMIT);
  if (reason) limits.push(MINIMISED_LIMIT, reason);
  return unique(limits);
}

async function decodeResponse(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  const charset = /charset=([^;\s]+)/i.exec(contentType)?.[1]?.toLowerCase();
  const decoder = charset === "iso-8859-1" || charset === "latin1" ? "windows-1252" : "utf-8";
  return new TextDecoder(decoder).decode(new Uint8Array(await response.arrayBuffer()));
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ";" && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function parsePeriod(value: string | null): { start: string | null; end: string | null } {
  const [start, end] = clean(value).split(/\s+-\s+/);
  return { start: italianDate(start ?? null), end: italianDate(end ?? null) };
}

function italianDate(value: string | null): string | null {
  const match = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(clean(value));
  if (!match) return null;
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function xmlTag(block: string, tagName: string): string | null {
  return new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i").exec(block)?.[1] ?? null;
}

function firstXmlTag(block: string, tagNames: string[]): string | null {
  for (const tagName of tagNames) {
    const value = xmlTag(block, tagName);
    if (nullable(value)) return value;
  }
  return null;
}

function cleanActType(value: string | null): string | null {
  return nullable(clean(value).replace(/\s+NR\.?\s+.*$/i, ""));
}

function registryNumber(value: string | null): string | null {
  const number = clean(value);
  return number && number !== "0" ? number : null;
}

function actNumber(value: string | null): string | null {
  return registryNumber(/\bNR\.?\s*([A-Z0-9/-]+)/i.exec(clean(value))?.[1] ?? null);
}

function headerKey(value: string): string {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function firstCsvValue(row: string[], headers: string[], names: string[]): string | null {
  for (const name of names) {
    const index = headers.indexOf(headerKey(name));
    const value = index >= 0 ? nullable(row[index]) : null;
    if (value) return value;
  }
  return null;
}

function hrefValue(value: string): string | null {
  const match = /\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i.exec(value);
  return nullable(match?.[1] ?? match?.[2] ?? match?.[3]);
}

function stripHtml(value: string): string {
  return clean(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function nullable(value: string | null | undefined): string | null {
  const normalized = clean(value ?? null);
  return normalized ? normalized : null;
}

function objectValue(value: unknown, key?: string): Record<string, unknown> | null {
  const candidate = key && value && typeof value === "object"
    ? (value as Record<string, unknown>)[key]
    : value;
  return candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? (candidate as Record<string, unknown>)
    : null;
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string | null {
  if (typeof value === "string") return nullable(value);
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function clean(value: string | null | undefined): string {
  return decodeEntities(value ?? "").replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    deg: "deg",
    agrave: "a",
    egrave: "e",
    eacute: "e",
    igrave: "i",
    ograve: "o",
    ugrave: "u",
  };
  return value.replace(/&(#[0-9]+|#x[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    const lower = code.toLowerCase();
    if (lower.startsWith("#x")) return codePoint(Number.parseInt(lower.slice(2), 16), entity);
    if (lower.startsWith("#")) return codePoint(Number.parseInt(lower.slice(1), 10), entity);
    return named[lower] ?? entity;
  });
}

function codePoint(value: number, fallback: string): string {
  if (!Number.isFinite(value)) return fallback;
  try {
    return String.fromCodePoint(value);
  } catch {
    return fallback;
  }
}

function verificationStatus(method: AlboFetchMethod): VerificationStatus {
  return method === "print-fallback" || method === "html-fallback"
    ? "verification_required"
    : "official_source_acquired";
}

function countVisibility(items: AlboItem[], visibility: PublicVisibility): number {
  return items.filter((item) => item.public_visibility === visibility).length;
}

function resolveOfficialDocumentUrl(value: string | null): {
  href: string | null;
  reason: PdfPreservationReason;
} {
  if (!value) return { href: null, reason: "no_document_url" };
  try {
    const url = new URL(value, ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl);
    if (
      url.host !== officialAlboHost() ||
      url.username !== "" ||
      url.password !== ""
    ) {
      return { href: null, reason: "non_official_document_url" };
    }
    if (url.protocol === "https:") {
      return {
        href: url.href,
        reason: "eligible_low_risk_publishable_pdf",
      };
    }
    if (url.protocol === "http:") {
      return { href: null, reason: "non_https_document_url" };
    }
    return { href: null, reason: "non_official_document_url" };
  } catch {
    return { href: null, reason: "non_official_document_url" };
  }
}

function officialAlboHost(): string {
  return new URL(ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl).host;
}

function normalizeContentType(value: string | null): string {
  return (value ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
}

function parseContentLength(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function publicationYear(item: AlboItem): string {
  const candidate = [item.publication_start, item.act_date, item.retrieved_at]
    .map((value) => /^(\d{4})/.exec(value ?? "")?.[1])
    .find((value): value is string => Boolean(value));
  return candidate ?? "unknown";
}

function inferInputFormat(filePath: string): NonNullable<CliOptions["inputFormat"]> {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".xml") return "xml";
  if (extension === ".csv") return "csv";
  if (extension === ".html" || extension === ".htm") return "html";
  throw new Error(`Cannot infer input format from ${filePath}; pass --input-format.`);
}

function parseInputFormat(value: string): NonNullable<CliOptions["inputFormat"]> {
  if (value === "xml" || value === "csv" || value === "html" || value === "print") return value;
  throw new Error(`Unsupported input format: ${value}`);
}

function valueAfter(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value || value.startsWith("--")) throw new Error(`Missing value for ${flag}.`);
  return value;
}

function usage(): string {
  return [
    "Usage: pnpm albo:fetch [--out-dir data] [--from-file fixture.xml] [--input-format xml|csv|html|print] [--retrieved-at ISO_DATE]",
    "",
    "Fetches the Comune di Lamezia Terme Albo Pretorio from Tinnvision.",
    "The command tries XML and CSV exports first, then falls back to print/HTML parsing only when needed.",
  ].join("\n");
}

function sha256(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function sha256Bytes(value: Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function romeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TIME_ZONE,
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function nextScheduledCheck(iso: string): string | null {
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return null;

  const candidate = new Date(start.getTime() + 60_000);
  candidate.setUTCMinutes(10, 0, 0);
  if (candidate <= start) candidate.setUTCHours(candidate.getUTCHours() + 1);

  for (let index = 0; index < 72; index += 1) {
    if (isInsideRomeMonitoringWindow(candidate)) return candidate.toISOString();
    candidate.setUTCHours(candidate.getUTCHours() + 1);
  }

  return null;
}

function isInsideRomeMonitoringWindow(date: Date): boolean {
  const hourPart = new Intl.DateTimeFormat("en-GB", {
    timeZone: ROME_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(date);
  const hour = Number.parseInt(hourPart, 10);
  return hour >= 8 && hour <= 20;
}

function isSnapshot(value: unknown): value is AlboRawSnapshot {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { records?: unknown }).records) &&
    typeof (value as { source?: unknown }).source === "string" &&
    typeof (value as { source_url?: unknown }).source_url === "string" &&
    typeof (value as { retrieved_at?: unknown }).retrieved_at === "string"
  );
}

export function isPublicLatest(value: unknown): value is PublicLatest {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { retrieved_at?: unknown }).retrieved_at === "string" &&
    Array.isArray((value as { items?: unknown }).items) &&
    Array.isArray((value as { excluded?: unknown }).excluded) &&
    (value as { items: unknown[] }).items.every(isPublicRecord) &&
    (value as { excluded: unknown[] }).excluded.every(isPublicRecord)
  );
}

function isPublicRecord(value: unknown): value is PublicRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { id?: unknown }).id === "string" &&
    typeof (value as { source?: unknown }).source === "string" &&
    typeof (value as { retrieved_at?: unknown }).retrieved_at === "string" &&
    typeof (value as { verification_status?: unknown }).verification_status === "string" &&
    Array.isArray((value as { known_limits?: unknown }).known_limits) &&
    (value as { known_limits: unknown[] }).known_limits.every(
      (entry) => typeof entry === "string",
    )
  );
}

export function isDelibereArchive(value: unknown): value is DelibereArchive {
  const archive = objectValue(value);
  if (!archive) return false;
  const coverage = objectValue(archive.coverage);
  const counts = objectValue(archive.counts);
  const items = archive.items;
  return (
    typeof archive.generated_at === "string" &&
    typeof archive.source === "string" &&
    typeof archive.source_url === "string" &&
    archiveVerificationStatus(archive.verification_status) ===
      archive.verification_status &&
    coverage !== null &&
    counts !== null &&
    Array.isArray(archive.known_limits) &&
    Array.isArray(items) &&
    items.every(isDeliberaArchiveItem)
  );
}

function isDeliberaArchiveItem(value: unknown): value is DeliberaArchiveItem {
  if (!isPublicRecord(value)) return false;
  const item = value as PublicRecord & Record<string, unknown>;
  const visibility = item.public_visibility;
  const privacyRisk = item.privacy_risk;
  const archivedDocument = item.archived_document;
  const deliberationBody = item.deliberation_body;
  const canExposeArchivedDocument =
    visibility === "publishable" && privacyRisk === "low";
  return (
    (visibility === "publishable" ||
      visibility === "publishable_with_minimisation" ||
      visibility === "metadata_only") &&
    (privacyRisk === "low" ||
      privacyRisk === "medium" ||
      privacyRisk === "high") &&
    (deliberationBody === "giunta" ||
      deliberationBody === "consiglio" ||
      deliberationBody === "altro") &&
    typeof item.first_observed_at === "string" &&
    typeof item.last_observed_at === "string" &&
    isDeliberationPublicRecord(item) &&
    isPublicationPresentation(item.presentation) &&
    (archivedDocument === null ||
      (canExposeArchivedDocument &&
        isReusableArchivedPdfDocument(archivedDocument) &&
        archivedDocument.id === item.id))
  );
}

function isPublicationPresentation(value: unknown): value is PublicationPresentation {
  const presentation = objectValue(value);
  const standardisation = objectValue(presentation?.standardisation);
  return (
    typeof presentation?.display_title === "string" &&
    presentation.display_title.trim().length > 0 &&
    typeof presentation.search_text === "string" &&
    standardisation !== null &&
    typeof standardisation.profile_id === "string" &&
    typeof standardisation.profile_version === "string" &&
    standardisation.input_field === "subject"
  );
}

function isIsoDateString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    Number.isFinite(Date.parse(value))
  );
}

function isOfficialAlboHttpsUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    resolveOfficialDocumentUrl(value).href !== null
  );
}

function isVerificationStatus(value: unknown): value is VerificationStatus {
  return [
    "official_source_acquired",
    "normalised_automatically",
    "verification_required",
  ].includes(String(value));
}

function isPublicVisibility(value: unknown): value is PublicVisibility {
  return [
    "publishable",
    "publishable_with_minimisation",
    "metadata_only",
    "do_not_publish",
  ].includes(String(value));
}

function isPrivacyRisk(value: unknown): value is PrivacyRisk {
  return ["low", "medium", "high"].includes(String(value));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim()))];
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function main(): Promise<void> {
  const result = await runAlboIngestion(parseArgs(process.argv.slice(2)));
  console.log(result.runLog);
  console.log(`Snapshot corrente: ${result.paths.currentSnapshot}`);
  console.log(`Snapshot storico: ${result.paths.historySnapshot}`);
  console.log(`Output pubblico: ${result.paths.publicLatest}`);
  console.log(`Diff pubblico: ${result.paths.publicDiff}`);
  console.log(`Manifest documenti pubblici: ${result.paths.documentsManifest}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(formatError(error));
    process.exitCode = 1;
  });
}
