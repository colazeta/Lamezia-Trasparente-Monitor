import type {
  PnrrProject,
  Publication,
  PublicationAttachment,
} from "@workspace/api-client-react";

import pnrrData from "./generated/lameziaPnrrProjects.json";
import pnrrDataUrl from "./generated/lameziaPnrrProjects.json?url";

export type PnrrDataOrigin = "runtime-api" | "static-municipal" | "hybrid";

export type PnrrFreshnessAssessment = "current" | "stale" | "not_assessed";

export type PnrrAttachmentPhase =
  | "programme_funding"
  | "planning_authorisations"
  | "procurement_contracts"
  | "execution_spending"
  | "completion_verification"
  | "other";

export interface PnrrViewAttachment {
  title: string;
  url: string;
  sourceOrder: number;
  sequence: number | null;
  documentDate: string | null;
  documentYear: number | null;
  datePrecision: "day" | "year" | null;
  phase: PnrrAttachmentPhase;
  phaseLabel: string;
  phaseDescription: string;
  classificationBasis:
    | "title_keyword"
    | "unclassified"
    | "runtime_unclassified";
}

export interface PnrrViewDocument {
  id: string | number;
  publicId: string;
  oggetto: string;
  tipologia: string;
  pubStart?: string | null;
  cups: string[];
  pnrrMission?: string | null;
  attachments?: PublicationAttachment[];
}

export type PnrrViewProject = Omit<PnrrProject, "documents" | "attachments"> & {
  documents: PnrrViewDocument[];
  attachments: PnrrViewAttachment[];
  dataOrigin: PnrrDataOrigin;
  freshnessAssessment: PnrrFreshnessAssessment;
  subAttuatore: string | null;
};

export interface LameziaPnrrAttachment {
  title: string;
  url: string;
  source_order: number;
  sequence: number | null;
  document_date: string | null;
  document_year: number | null;
  date_precision: "day" | "year" | null;
  date_basis: "title_explicit_date" | "title_or_filename_year" | null;
  phase: PnrrAttachmentPhase;
  classification_basis: "title_keyword" | "unclassified";
}

export interface LameziaPnrrAttachmentPhaseDefinition {
  id: PnrrAttachmentPhase;
  label: string;
  description: string;
}

export interface LameziaPnrrAlboEvidence {
  id: string;
  public_id: string;
  source: string;
  source_url: string | null;
  publication_number: string | null;
  publication_start: string | null;
  publication_end: string | null;
  office: string | null;
  act_type: string | null;
  act_number: string | null;
  act_date: string | null;
  subject: string;
  cups: string[];
  mission_codes: string[];
  match_basis: string[];
  verification_status: string;
  public_visibility: string;
  privacy_risk: string;
  document_url: string | null;
  archived_path: string | null;
  document_content_type: string | null;
  document_size_bytes: number | null;
  first_observed_at: string | null;
  last_observed_at: string | null;
  evidence_status: string;
  evidence_hash: string;
}

export interface LameziaPnrrStaticProject {
  source_id: string;
  source_url: string;
  title: string;
  mission: string | null;
  component: string | null;
  investment: string | null;
  intervention: string | null;
  holder: string | null;
  attuatore: string | null;
  sub_attuatore: string | null;
  cup: string | null;
  amount_eur: number | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  published_at: string | null;
  attachments: LameziaPnrrAttachment[];
  verification_status: string;
  source_record_hash: string;
  albo_evidence_ids: string[];
}

export interface LameziaPnrrStaticDataset {
  schema_version: number;
  metadata: {
    dataset_id: string;
    source: string;
    source_url: string;
    source_type: string;
    materialized_at: string;
    source_index_hash: string;
    albo_snapshot_generated_at: string | null;
    update_policy: string;
    reconciliation_rule: string;
    coverage_note: string;
    caveat: string;
    licence_or_terms_note: string;
  };
  attachment_taxonomy: {
    schema_version: string;
    order_policy: string;
    classification_policy: string;
    date_policy: string;
    phases: LameziaPnrrAttachmentPhaseDefinition[];
  };
  coverage: {
    projects: number;
    projects_with_cup: number;
    projects_with_amount: number;
    projects_with_albo_evidence: number;
    municipal_attachments: number;
    municipal_attachments_classified: number;
    municipal_attachments_with_year: number;
    municipal_attachments_with_day: number;
    albo_evidence: number;
    linked_albo_evidence: number;
    unmatched_albo_evidence: number;
  };
  projects: LameziaPnrrStaticProject[];
  albo_evidence: LameziaPnrrAlboEvidence[];
  unmatched_albo_evidence_ids: string[];
}

export interface LameziaPnrrStaticViewData {
  projects: PnrrViewProject[];
  unmatchedEvidence: PnrrViewDocument[];
}

export const LAMEZIA_PNRR_STATIC_DATA = pnrrData as LameziaPnrrStaticDataset;

export const LAMEZIA_PNRR_STATIC_DATA_URL = pnrrDataUrl;

export const LAMEZIA_PNRR_STATIC_VIEW = buildStaticPnrrViewData(
  LAMEZIA_PNRR_STATIC_DATA,
);

export function buildStaticPnrrViewData(
  dataset: LameziaPnrrStaticDataset,
): LameziaPnrrStaticViewData {
  const attachmentPhases = new Map(
    dataset.attachment_taxonomy.phases.map((phase) => [phase.id, phase]),
  );
  const evidenceById = new Map(
    dataset.albo_evidence.map((evidence) => [
      evidence.id,
      toPnrrViewDocument(evidence),
    ]),
  );

  const projects = dataset.projects.map((project) => {
    const documents = project.albo_evidence_ids.flatMap((evidenceId) => {
      const evidence = evidenceById.get(evidenceId);
      return evidence ? [evidence] : [];
    });
    const lastPublication = latestDate(
      documents.map((document) => document.pubStart ?? null),
    );

    return {
      id: Number(project.source_id),
      key: `comune-pnrr-${project.source_id}`,
      sourceId: project.source_id,
      projectSourceUrl: project.source_url,
      locationSourceUrl: dataset.metadata.source_url,
      importSourceLabel: dataset.metadata.source,
      importSourceUrl: dataset.metadata.source_url,
      importSourceStatus: "ok",
      importSourceError: null,
      url: project.source_url,
      title: project.title,
      cup: project.cup,
      mission: project.mission,
      component: project.component,
      investment: project.investment,
      intervention: project.intervention,
      holder: project.holder,
      attuatore: project.attuatore,
      subAttuatore: project.sub_attuatore,
      importoFinanziato: project.amount_eur,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      publishedAt: project.published_at,
      lastUpdatedAt: null,
      location: "Lamezia Terme",
      locationQuality: "dedotta" as const,
      locationNote:
        "Il perimetro deriva dalla sezione PNRR del Comune; la scheda non espone necessariamente l'ubicazione puntuale dell'intervento.",
      trasparenzaCompleta: true,
      aggiornamentoVecchio: false,
      attachments: project.attachments.map((attachment) => {
        const phase = attachmentPhases.get(attachment.phase);
        return {
          title: attachment.title,
          url: attachment.url,
          sourceOrder: attachment.source_order,
          sequence: attachment.sequence,
          documentDate: attachment.document_date,
          documentYear: attachment.document_year,
          datePrecision: attachment.date_precision,
          phase: attachment.phase,
          phaseLabel: phase?.label ?? "Altri documenti",
          phaseDescription:
            phase?.description ??
            "Allegati non classificati automaticamente in una fase documentale.",
          classificationBasis: attachment.classification_basis,
        } satisfies PnrrViewAttachment;
      }),
      documentsCount: documents.length,
      lastPublication,
      documents,
      linkedContracts: [],
      dataOrigin: "static-municipal" as const,
      freshnessAssessment: "not_assessed" as const,
    } satisfies PnrrViewProject;
  });

  const unmatchedEvidence = dataset.unmatched_albo_evidence_ids.flatMap(
    (evidenceId) => {
      const evidence = evidenceById.get(evidenceId);
      return evidence ? [evidence] : [];
    },
  );

  return { projects, unmatchedEvidence };
}

export function adaptRuntimePnrrProjects(value: unknown): PnrrViewProject[] {
  if (!Array.isArray(value)) return [];

  return (value as PnrrProject[]).map((project) => ({
    ...project,
    documents: project.documents,
    attachments: project.attachments.map((attachment, index) =>
      toRuntimeAttachment(attachment, index),
    ),
    dataOrigin: "runtime-api",
    freshnessAssessment: project.lastUpdatedAt
      ? project.aggiornamentoVecchio
        ? "stale"
        : "current"
      : "not_assessed",
    subAttuatore: null,
  }));
}

export function adaptRuntimePnrrDocuments(value: unknown): PnrrViewDocument[] {
  return Array.isArray(value) ? (value as Publication[]) : [];
}

export function mergePnrrViewProjects(
  runtimeProjects: readonly PnrrViewProject[],
  staticProjects: readonly PnrrViewProject[],
): PnrrViewProject[] {
  const staticByCup = new Map(
    staticProjects
      .filter((project) => project.cup)
      .map((project) => [normaliseCup(project.cup), project]),
  );
  const mergedStaticKeys = new Set<string>();

  const merged = runtimeProjects.map((runtimeProject) => {
    const staticProject = runtimeProject.cup
      ? staticByCup.get(normaliseCup(runtimeProject.cup))
      : undefined;
    if (!staticProject) return runtimeProject;

    mergedStaticKeys.add(staticProject.key);
    const documents = mergeDocuments(
      runtimeProject.documents,
      staticProject.documents,
    );

    return {
      ...runtimeProject,
      url: runtimeProject.url ?? staticProject.url,
      title: runtimeProject.title.trim()
        ? runtimeProject.title
        : staticProject.title,
      mission: preferText(runtimeProject.mission, staticProject.mission),
      component: preferText(runtimeProject.component, staticProject.component),
      investment: preferText(
        runtimeProject.investment,
        staticProject.investment,
      ),
      intervention: preferText(
        runtimeProject.intervention,
        staticProject.intervention,
      ),
      holder: preferText(runtimeProject.holder, staticProject.holder),
      attuatore: preferText(runtimeProject.attuatore, staticProject.attuatore),
      subAttuatore: staticProject.subAttuatore,
      importoFinanziato:
        runtimeProject.importoFinanziato ?? staticProject.importoFinanziato,
      status: preferText(runtimeProject.status, staticProject.status),
      startDate: runtimeProject.startDate ?? staticProject.startDate,
      endDate: runtimeProject.endDate ?? staticProject.endDate,
      publishedAt: runtimeProject.publishedAt ?? staticProject.publishedAt,
      trasparenzaCompleta: true,
      attachments: mergeAttachments(
        runtimeProject.attachments,
        staticProject.attachments,
      ),
      documentsCount: Math.max(runtimeProject.documentsCount, documents.length),
      lastPublication: latestDate([
        runtimeProject.lastPublication ?? null,
        staticProject.lastPublication ?? null,
      ]),
      documents,
      dataOrigin: "hybrid",
    } satisfies PnrrViewProject;
  });

  return [
    ...merged,
    ...staticProjects.filter((project) => !mergedStaticKeys.has(project.key)),
  ];
}

export function mergePnrrViewDocuments(
  runtimeDocuments: readonly PnrrViewDocument[],
  staticDocuments: readonly PnrrViewDocument[],
): PnrrViewDocument[] {
  return mergeDocuments(runtimeDocuments, staticDocuments);
}

function toPnrrViewDocument(
  evidence: LameziaPnrrAlboEvidence,
): PnrrViewDocument {
  const archiveUrl = evidence.archived_path
    ? `/${evidence.archived_path.replace(/^\/+/, "")}`
    : null;
  const attachments =
    evidence.document_url || archiveUrl
      ? [
          {
            name: evidence.publication_number
              ? `Atto Albo ${evidence.publication_number}`
              : "Documento dell'atto",
            tipo: evidence.document_content_type ?? "documento",
            officialUrl:
              evidence.document_url ?? evidence.source_url ?? archiveUrl ?? "#",
            storagePath: archiveUrl,
            contentType: evidence.document_content_type,
            size: evidence.document_size_bytes,
          },
        ]
      : [];

  return {
    id: evidence.id,
    publicId: evidence.public_id,
    oggetto: evidence.subject,
    tipologia: evidence.act_type ?? "Atto Albo Pretorio",
    pubStart: evidence.publication_start,
    cups: evidence.cups,
    pnrrMission: evidence.mission_codes.join(", ") || null,
    attachments,
  };
}

function mergeAttachments(
  left: readonly PnrrViewAttachment[],
  right: readonly PnrrViewAttachment[],
) {
  return Array.from(
    new Map(
      [...left, ...right].map((attachment) => [attachment.url, attachment]),
    ).values(),
  );
}

function toRuntimeAttachment(
  attachment: PnrrProject["attachments"][number],
  sourceOrder: number,
): PnrrViewAttachment {
  return {
    title: attachment.title,
    url: attachment.url,
    sourceOrder,
    sequence: null,
    documentDate: null,
    documentYear: null,
    datePrecision: null,
    phase: "other",
    phaseLabel: "Altri documenti",
    phaseDescription:
      "Allegati non classificati automaticamente in una fase documentale.",
    classificationBasis: "runtime_unclassified",
  };
}

function mergeDocuments(
  left: readonly PnrrViewDocument[],
  right: readonly PnrrViewDocument[],
) {
  return Array.from(
    new Map(
      [...left, ...right].map((document) => [
        document.publicId || String(document.id),
        document,
      ]),
    ).values(),
  );
}

function preferText(
  preferred: string | null | undefined,
  fallback: string | null | undefined,
) {
  return preferred?.trim() ? preferred : fallback;
}

function normaliseCup(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function latestDate(values: readonly (string | null)[]) {
  return (
    values
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null
  );
}
