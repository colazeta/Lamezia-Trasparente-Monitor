import type { PublicProposal } from "./propostePubblicheCore";
import * as baseline from "./proposalInstitutionalCompetence";
import type {
  ProposalCompetenceAssessment,
  ProposalCompetenceAssessmentStatus,
  ProposalCompetentAuthority,
  ProposalInstitutionalCompetence,
} from "./proposalInstitutionalCompetence";

export type {
  ProposalAuthorityLevel,
  ProposalCompetenceAssessment,
  ProposalCompetenceAssessmentStatus,
  ProposalCompetentAuthority,
  ProposalInstitutionalCompetence,
} from "./proposalInstitutionalCompetence";

export {
  PROPOSAL_AUTHORITY_LEVELS,
  PROPOSAL_COMPETENCE_ASSESSMENT_LABELS,
  PROPOSAL_COMPETENCE_ASSESSMENT_STATUSES,
} from "./proposalInstitutionalCompetence";

const PRESIDENTE_CONSIGLIO_LAMEZIA: ProposalCompetentAuthority = {
  id: "presidente-consiglio-comunale-lamezia-terme",
  label: "Presidente del Consiglio comunale di Lamezia Terme",
  level: "municipal",
  sourceLabel:
    "Comune di Lamezia Terme — Regolamento di funzionamento del Consiglio comunale, art. 5",
  sourceUrl:
    "https://www.comune.lamezia-terme.cz.it/it/documenti_pubblici/regolamento-di-funzionamento-del-consiglio-comunale-modificato-con-deliberazione-di-consiglio-comunale-n-1-del-31-01-2025",
};

const SCORDOVILLO_ID =
  "scordovillo-consiglio-aperto-trasparenza-futuro-nazionale-2026";

const SCORDOVILLO_ASSESSMENT: ProposalCompetenceAssessment = {
  status: "partially_verified",
  primaryAuthority: PRESIDENTE_CONSIGLIO_LAMEZIA,
  note:
    "L'art. 5 del Regolamento comunale vigente stabilisce che il Presidente del Consiglio convoca il Consiglio e convoca e presiede la Conferenza dei Capigruppo: questo sostiene direttamente la competenza sulla misura specifica di convocazione della seduta richiesta. La proposta comprende però anche trasparenza dei criteri abitativi, responsabilità interistituzionali e valutazioni sull'impatto sociale delle scelte collegate al superamento di Scordovillo. Queste componenti coinvolgono soggetti e competenze ulteriori che non vengono inferiti dalla materia, dal destinatario o dalle dichiarazioni dei promotori; per questo l'assessment complessivo resta parziale.",
};

export const PROPOSAL_COMPETENCE_ASSESSMENTS: Readonly<
  Partial<Record<string, ProposalCompetenceAssessment>>
> = {
  ...baseline.PROPOSAL_COMPETENCE_ASSESSMENTS,
  [SCORDOVILLO_ID]: SCORDOVILLO_ASSESSMENT,
};

function canonicalPublicAddressee(value?: string) {
  if (!value?.trim()) return "Non indicato";
  const [institution] = value.split(" — ");
  return institution.trim();
}

export function getProposalInstitutionalCompetence(
  proposal: Pick<PublicProposal, "id" | "institutionalRecipient">,
): ProposalInstitutionalCompetence {
  const assessment = PROPOSAL_COMPETENCE_ASSESSMENTS[proposal.id];

  if (!assessment) return baseline.getProposalInstitutionalCompetence(proposal);

  return {
    proposalId: proposal.id,
    sourceAddressee: proposal.institutionalRecipient ?? null,
    publicAddressee: canonicalPublicAddressee(proposal.institutionalRecipient),
    assessmentStatus: assessment.status as ProposalCompetenceAssessmentStatus,
    primaryAuthority: assessment.primaryAuthority,
    involvedAuthorities: assessment.involvedAuthorities ?? [],
    assessmentNote: assessment.note,
  };
}

export function hasVerifiedProposalCompetence(
  proposal: Pick<PublicProposal, "id" | "institutionalRecipient">,
) {
  return getProposalInstitutionalCompetence(proposal).assessmentStatus !==
    "not_assessed";
}