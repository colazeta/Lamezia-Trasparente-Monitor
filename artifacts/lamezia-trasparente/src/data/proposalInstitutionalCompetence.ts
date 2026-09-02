import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Institutional addressee and substantive competence are deliberately distinct.
 * A proposal being addressed to an institution does not prove that institution
 * has the legal or administrative competence to implement every requested measure.
 */
export const PROPOSAL_COMPETENCE_ASSESSMENT_STATUSES = [
  "not_assessed",
  "partially_verified",
  "verified",
] as const;

export type ProposalCompetenceAssessmentStatus =
  (typeof PROPOSAL_COMPETENCE_ASSESSMENT_STATUSES)[number];

export const PROPOSAL_COMPETENCE_ASSESSMENT_LABELS: Record<
  ProposalCompetenceAssessmentStatus,
  string
> = {
  not_assessed: "Competenza non valutata",
  partially_verified: "Competenza verificata in parte",
  verified: "Competenza verificata",
};

export const PROPOSAL_AUTHORITY_LEVELS = [
  "municipal",
  "intermunicipal",
  "regional",
  "health_authority",
  "state",
  "other",
] as const;

export type ProposalAuthorityLevel = (typeof PROPOSAL_AUTHORITY_LEVELS)[number];

export type ProposalCompetentAuthority = {
  id: string;
  label: string;
  level: ProposalAuthorityLevel;
  sourceLabel: string;
  sourceUrl?: string;
};

export type ProposalCompetenceAssessment = {
  status: Exclude<ProposalCompetenceAssessmentStatus, "not_assessed">;
  primaryAuthority?: ProposalCompetentAuthority;
  involvedAuthorities?: readonly ProposalCompetentAuthority[];
  note: string;
};

/**
 * Curated registry of substantive competence assessments.
 *
 * This registry is intentionally empty at introduction time. It must never be
 * populated by copying `institutionalRecipient` or by inferring competence from
 * the proposal topic. Each entry requires a reviewed source that supports the
 * allocation of competence for the concrete measure(s) in the proposal.
 */
export const PROPOSAL_COMPETENCE_ASSESSMENTS: Readonly<
  Partial<Record<string, ProposalCompetenceAssessment>>
> = {};

export type ProposalInstitutionalCompetence = {
  proposalId: string;
  sourceAddressee: string | null;
  publicAddressee: string;
  assessmentStatus: ProposalCompetenceAssessmentStatus;
  primaryAuthority?: ProposalCompetentAuthority;
  involvedAuthorities: readonly ProposalCompetentAuthority[];
  assessmentNote: string;
};

function canonicalPublicAddressee(value?: string) {
  if (!value?.trim()) return "Non indicato";

  // Keep the documented institution while removing internal office/role detail
  // after an em dash. The exact source wording remains available for audit.
  const [institution] = value.split(" — ");
  return institution.trim();
}

export function getProposalInstitutionalCompetence(
  proposal: Pick<PublicProposal, "id" | "institutionalRecipient">,
): ProposalInstitutionalCompetence {
  const assessment = PROPOSAL_COMPETENCE_ASSESSMENTS[proposal.id];

  if (!assessment) {
    return {
      proposalId: proposal.id,
      sourceAddressee: proposal.institutionalRecipient ?? null,
      publicAddressee: canonicalPublicAddressee(proposal.institutionalRecipient),
      assessmentStatus: "not_assessed",
      involvedAuthorities: [],
      assessmentNote:
        "Il destinatario documentato della proposta non viene trattato automaticamente come ente competente. La competenza sostanziale richiede una verifica separata.",
    };
  }

  return {
    proposalId: proposal.id,
    sourceAddressee: proposal.institutionalRecipient ?? null,
    publicAddressee: canonicalPublicAddressee(proposal.institutionalRecipient),
    assessmentStatus: assessment.status,
    primaryAuthority: assessment.primaryAuthority,
    involvedAuthorities: assessment.involvedAuthorities ?? [],
    assessmentNote: assessment.note,
  };
}

export function hasVerifiedProposalCompetence(
  proposal: Pick<PublicProposal, "id" | "institutionalRecipient">,
) {
  return getProposalInstitutionalCompetence(proposal).assessmentStatus !== "not_assessed";
}
