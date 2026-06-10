export const COMMITMENT_SOURCE_KINDS = [
  "political_promise",
  "administrative_direction",
  "executive_act",
  "public_communication",
] as const;

export const COMMITMENT_STATUSES = [
  "announced",
  "formalised",
  "scheduled",
  "in_progress",
  "implemented",
  "partially_implemented",
  "not_found_in_monitored_sources",
  "not_assessable",
] as const;

export const COMMITMENT_FOLLOW_UP_KINDS = [
  "administrative_direction",
  "executive_act",
  "public_communication",
] as const;

export type CommitmentSourceKind = (typeof COMMITMENT_SOURCE_KINDS)[number];
export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number];
export type CommitmentAdministrativeFollowUpKind =
  (typeof COMMITMENT_FOLLOW_UP_KINDS)[number];

export interface CommitmentSource {
  id: string;
  kind: CommitmentSourceKind;
  title: string;
  date: string;
  url?: string;
  citation?: string;
  note: string;
}

export interface CommitmentEvidenceLink {
  id: string;
  sourceId: string;
  commitmentId: string;
  relation:
    | "states_commitment"
    | "formalises_commitment"
    | "schedules_commitment"
    | "documents_progress"
    | "documents_implementation"
    | "documents_partial_implementation"
    | "documents_no_match_in_scope"
    | "supports_non_assessability";
  note: string;
}

export interface CommitmentAdministrativeFollowUp {
  id: string;
  commitmentId: string;
  kind: CommitmentAdministrativeFollowUpKind;
  title: string;
  date: string;
  sourceId: string;
  evidenceLinkId: string;
  note: string;
}

export interface CommitmentTimelineEntry {
  id: string;
  commitmentId: string;
  status: CommitmentStatus;
  date: string;
  evidenceLinkIds: string[];
  note: string;
  notAssessableReason?: string;
}

export interface PublicCommitment {
  id: string;
  neutralTitle: string;
  summary: string;
  sources: CommitmentSource[];
  evidenceLinks: CommitmentEvidenceLink[];
  administrativeFollowUps: CommitmentAdministrativeFollowUp[];
  currentStatus: CommitmentStatus;
  currentStatusEvidenceLinkIds: string[];
  currentStatusReason?: string;
  timeline: CommitmentTimelineEntry[];
  methodologyNote: string;
  civicGraphHints?: {
    commitmentNodeId?: string;
    sourceNodeIds?: string[];
    actNodeIds?: string[];
  };
}

export interface CommitmentChainStatus {
  status: CommitmentStatus;
  evidenceLinkIds: string[];
  sourceIds: string[];
  reason?: string;
}

export interface CommitmentDocumentChain {
  commitmentId: string;
  sourceIds: string[];
  evidenceLinkIds: string[];
  followUpIds: string[];
  status: CommitmentChainStatus;
}

export interface CommitmentValidationIssue {
  commitmentId: string;
  field: string;
  reason:
    | "missing-source"
    | "missing-evidence-link"
    | "invalid-source-reference"
    | "invalid-commitment-reference"
    | "invalid-evidence-link-reference"
    | "missing-status-support"
    | "missing-not-assessable-reason"
    | "missing-cautious-methodology-note";
}

export const COMMITMENT_STATUS_LABELS: Record<CommitmentStatus, string> = {
  announced: "Annunciato in fonte pubblica",
  formalised: "Formalizzato in atto o indirizzo",
  scheduled: "Programmato o calendarizzato",
  in_progress: "In avanzamento documentale",
  implemented: "Attuazione documentata",
  partially_implemented: "Attuazione parziale documentata",
  not_found_in_monitored_sources: "Non trovato nelle fonti monitorate",
  not_assessable: "Non valutabile con le fonti disponibili",
};

export const COMMITMENT_STATUS_DESCRIPTIONS: Record<CommitmentStatus, string> =
  {
    announced:
      "La fonte pubblica contiene un impegno o una comunicazione, senza indicare da sola un seguito amministrativo.",
    formalised:
      "Una fonte documenta un indirizzo o una formalizzazione amministrativa collegata all'impegno.",
    scheduled:
      "Una fonte indica una programmazione, calendarizzazione o fase prevista da verificare nei documenti successivi.",
    in_progress:
      "Le fonti disponibili descrivono attività o atti intermedi, senza trasformarli automaticamente in esito concluso.",
    implemented:
      "Le fonti disponibili documentano un esito amministrativo osservabile, da leggere entro i limiti della fonte.",
    partially_implemented:
      "Le fonti disponibili documentano solo una parte dell'impegno o un avanzamento circoscritto.",
    not_found_in_monitored_sources:
      "Nel perimetro dichiarato delle fonti monitorate non è stato trovato un riscontro sufficiente.",
    not_assessable:
      "Le informazioni disponibili non consentono una classificazione documentale prudente.",
  };

const NON_ASSESSABLE_STATUSES = new Set<CommitmentStatus>([
  "not_found_in_monitored_sources",
  "not_assessable",
]);

function unique(values: readonly string[]): string[] {
  return Array.from(new Set(values));
}

function hasText(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function buildCommitmentDocumentChain(
  commitment: PublicCommitment,
): CommitmentDocumentChain {
  const sourceIds = new Set(commitment.sources.map((source) => source.id));
  const evidenceLinks = new Map(
    commitment.evidenceLinks.map((link) => [link.id, link] as const),
  );
  const currentStatusLinks = commitment.currentStatusEvidenceLinkIds
    .map((linkId) => evidenceLinks.get(linkId))
    .filter((link): link is CommitmentEvidenceLink => link !== undefined);

  return {
    commitmentId: commitment.id,
    sourceIds: Array.from(sourceIds),
    evidenceLinkIds: commitment.evidenceLinks.map((link) => link.id),
    followUpIds: commitment.administrativeFollowUps.map(
      (followUp) => followUp.id,
    ),
    status: {
      status: commitment.currentStatus,
      evidenceLinkIds: commitment.currentStatusEvidenceLinkIds,
      sourceIds: unique(currentStatusLinks.map((link) => link.sourceId)),
      reason: commitment.currentStatusReason,
    },
  };
}

export function validateCommitmentDocumentChain(
  commitment: PublicCommitment,
): CommitmentValidationIssue[] {
  const issues: CommitmentValidationIssue[] = [];
  const sourceIds = new Set(commitment.sources.map((source) => source.id));
  const evidenceLinkIds = new Set(
    commitment.evidenceLinks.map((link) => link.id),
  );

  if (commitment.sources.length === 0) {
    issues.push({
      commitmentId: commitment.id,
      field: "sources",
      reason: "missing-source",
    });
  }

  if (commitment.evidenceLinks.length === 0) {
    issues.push({
      commitmentId: commitment.id,
      field: "evidenceLinks",
      reason: "missing-evidence-link",
    });
  }

  for (const link of commitment.evidenceLinks) {
    if (link.commitmentId !== commitment.id) {
      issues.push({
        commitmentId: commitment.id,
        field: `evidenceLinks.${link.id}.commitmentId`,
        reason: "invalid-commitment-reference",
      });
    }

    if (!sourceIds.has(link.sourceId)) {
      issues.push({
        commitmentId: commitment.id,
        field: `evidenceLinks.${link.id}.sourceId`,
        reason: "invalid-source-reference",
      });
    }
  }

  for (const followUp of commitment.administrativeFollowUps) {
    if (followUp.commitmentId !== commitment.id) {
      issues.push({
        commitmentId: commitment.id,
        field: `administrativeFollowUps.${followUp.id}.commitmentId`,
        reason: "invalid-commitment-reference",
      });
    }

    if (!sourceIds.has(followUp.sourceId)) {
      issues.push({
        commitmentId: commitment.id,
        field: `administrativeFollowUps.${followUp.id}.sourceId`,
        reason: "invalid-source-reference",
      });
    }

    if (!evidenceLinkIds.has(followUp.evidenceLinkId)) {
      issues.push({
        commitmentId: commitment.id,
        field: `administrativeFollowUps.${followUp.id}.evidenceLinkId`,
        reason: "invalid-evidence-link-reference",
      });
    }
  }

  for (const entry of commitment.timeline) {
    if (entry.commitmentId !== commitment.id) {
      issues.push({
        commitmentId: commitment.id,
        field: `timeline.${entry.id}.commitmentId`,
        reason: "invalid-commitment-reference",
      });
    }

    for (const evidenceLinkId of entry.evidenceLinkIds) {
      if (!evidenceLinkIds.has(evidenceLinkId)) {
        issues.push({
          commitmentId: commitment.id,
          field: `timeline.${entry.id}.evidenceLinkIds`,
          reason: "invalid-evidence-link-reference",
        });
      }
    }

    if (
      entry.evidenceLinkIds.length === 0 &&
      !hasText(entry.notAssessableReason)
    ) {
      issues.push({
        commitmentId: commitment.id,
        field: NON_ASSESSABLE_STATUSES.has(entry.status)
          ? `timeline.${entry.id}.notAssessableReason`
          : `timeline.${entry.id}.evidenceLinkIds`,
        reason: NON_ASSESSABLE_STATUSES.has(entry.status)
          ? "missing-not-assessable-reason"
          : "missing-status-support",
      });
    }
  }

  for (const evidenceLinkId of commitment.currentStatusEvidenceLinkIds) {
    if (!evidenceLinkIds.has(evidenceLinkId)) {
      issues.push({
        commitmentId: commitment.id,
        field: "currentStatusEvidenceLinkIds",
        reason: "invalid-evidence-link-reference",
      });
    }
  }

  if (
    commitment.currentStatusEvidenceLinkIds.length === 0 &&
    !hasText(commitment.currentStatusReason)
  ) {
    issues.push({
      commitmentId: commitment.id,
      field: "currentStatusReason",
      reason: NON_ASSESSABLE_STATUSES.has(commitment.currentStatus)
        ? "missing-not-assessable-reason"
        : "missing-status-support",
    });
  }

  if (!/fonte|document|verific|monitor/i.test(commitment.methodologyNote)) {
    issues.push({
      commitmentId: commitment.id,
      field: "methodologyNote",
      reason: "missing-cautious-methodology-note",
    });
  }

  return issues;
}
