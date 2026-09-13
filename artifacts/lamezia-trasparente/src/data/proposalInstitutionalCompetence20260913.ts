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

const COMUNE_LAMEZIA_POLIZIA_LOCALE: ProposalCompetentAuthority = {
  id: "comune-lamezia-terme",
  label: "Comune di Lamezia Terme",
  level: "municipal",
  sourceLabel:
    "Comune di Lamezia Terme — Comando Polizia Locale e procedura di mobilità per Istruttori Agenti di Vigilanza",
  sourceUrl:
    "https://www.comune.lamezia-terme.cz.it/it/unita_organizzative/comando-polizia-locale",
};

const SCORDOVILLO_ID =
  "scordovillo-consiglio-aperto-trasparenza-futuro-nazionale-2026";
const POLIZIA_LOCALE_RENDA_ID =
  "polizia-locale-piano-assunzioni-h24-parco-agricolo-2026";

const SCORDOVILLO_ASSESSMENT: ProposalCompetenceAssessment = {
  status: "partially_verified",
  primaryAuthority: PRESIDENTE_CONSIGLIO_LAMEZIA,
  note:
    "L'art. 5 del Regolamento comunale vigente stabilisce che il Presidente del Consiglio convoca il Consiglio e convoca e presiede la Conferenza dei Capigruppo: questo sostiene direttamente la competenza sulla misura specifica di convocazione della seduta richiesta. La proposta comprende però anche trasparenza dei criteri abitativi, responsabilità interistituzionali e valutazioni sull'impatto sociale delle scelte collegate al superamento di Scordovillo. Queste componenti coinvolgono soggetti e competenze ulteriori che non vengono inferiti dalla materia, dal destinatario o dalle dichiarazioni dei promotori; per questo l'assessment complessivo resta parziale.",
};

const POLIZIA_LOCALE_RENDA_ASSESSMENT: ProposalCompetenceAssessment = {
  status: "partially_verified",
  primaryAuthority: COMUNE_LAMEZIA_POLIZIA_LOCALE,
  note:
    "Le fonti ufficiali comunali identificano il Comando Polizia Locale come struttura del Comune e documentano nel 2026 una procedura comunale di mobilità per quattro Istruttori Agenti di Vigilanza. Questo sostiene il coinvolgimento sostanziale del Comune nelle misure di organizzazione e reclutamento del corpo. La richiesta di Renda riguarda però un piano straordinario di assunzioni a tempo indeterminato e una più ampia copertura del servizio, che implicano programmazione del fabbisogno, vincoli finanziari e organizzazione dei turni non integralmente ricostruiti in questo run; l'assessment resta quindi parziale. Il destinatario generico indicato nella nota non viene usato come fonte della competenza.",
};

export const PROPOSAL_COMPETENCE_ASSESSMENTS: Readonly<
  Partial<Record<string, ProposalCompetenceAssessment>>
> = {
  ...baseline.PROPOSAL_COMPETENCE_ASSESSMENTS,
  [SCORDOVILLO_ID]: SCORDOVILLO_ASSESSMENT,
  [POLIZIA_LOCALE_RENDA_ID]: POLIZIA_LOCALE_RENDA_ASSESSMENT,
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