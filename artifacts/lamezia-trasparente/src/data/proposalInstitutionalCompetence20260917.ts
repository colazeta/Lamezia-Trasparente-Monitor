import type { PublicProposal } from "./propostePubblicheCore";
import * as previous from "./proposalInstitutionalCompetence20260913";
import type {
  ProposalCompetenceAssessment,
  ProposalCompetenceAssessmentStatus,
  ProposalCompetentAuthority,
  ProposalInstitutionalCompetence,
} from "./proposalInstitutionalCompetence20260913";

export type {
  ProposalAuthorityLevel,
  ProposalCompetenceAssessment,
  ProposalCompetenceAssessmentStatus,
  ProposalCompetentAuthority,
  ProposalInstitutionalCompetence,
} from "./proposalInstitutionalCompetence20260913";

export {
  PROPOSAL_AUTHORITY_LEVELS,
  PROPOSAL_COMPETENCE_ASSESSMENT_LABELS,
  PROPOSAL_COMPETENCE_ASSESSMENT_STATUSES,
} from "./proposalInstitutionalCompetence20260913";

const ATS_LAMEZIA: ProposalCompetentAuthority = {
  id: "ats-lamezia-terme",
  label: "Ambito Territoriale Sociale di Lamezia Terme (Comune capofila)",
  level: "intermunicipal",
  sourceLabel: "Comune di Lamezia Terme — Progetti di Vita, programmazione ATS",
  sourceUrl:
    "https://comune.lamezia-terme.cz.it/it/news/lats-investe-oltre-255-mila-euro-sui-progetti-di-vita?type=2",
};

const ASP_CATANZARO: ProposalCompetentAuthority = {
  id: "asp-catanzaro",
  label: "Azienda Sanitaria Provinciale di Catanzaro",
  level: "health_authority",
  sourceLabel:
    "Comune di Lamezia Terme — Protocollo ATS-ASP e presa in carico multidisciplinare dei Progetti di Vita",
  sourceUrl:
    "https://www.comune.lamezia-terme.cz.it/it/news/115163/lamezia-amministrazione-comunale-su-disabilita-sottoscritti-142-progetti-di-vita-ora-rafforziamo-la-rete-territoriale",
};

const REGIONE_CALABRIA_FNA: ProposalCompetentAuthority = {
  id: "regione-calabria",
  label: "Regione Calabria",
  level: "regional",
  sourceLabel:
    "Regione Calabria — Decreto n. 11315 del 25/06/2026, trasferimento FNA agli ATS per disabili gravissimi",
  sourceUrl:
    "https://www.regione.calabria.it/provvedimenti-della-regione/page/392/",
};

const LIBERALI_FNA_ID = "fna-assistenza-progetto-vita-liberali-lamezia-2026";

const LIBERALI_FNA_ASSESSMENT: ProposalCompetenceAssessment = {
  status: "partially_verified",
  primaryAuthority: ATS_LAMEZIA,
  involvedAuthorities: [ASP_CATANZARO, REGIONE_CALABRIA_FNA],
  note:
    "Fonti istituzionali documentano il ruolo dell'ATS di Lamezia nella programmazione sociale e dei Progetti di Vita, il raccordo multidisciplinare con l'ASP di Catanzaro e il trasferimento regionale delle risorse FNA agli ATS. Questo sostiene la rilevanza sostanziale di ATS, ASP e Regione per il pacchetto di misure richiesto. Non sono però ricostruite in questo run le regole di compatibilità tra ogni specifica prestazione, i presupposti giuridici per lo scorrimento delle singole graduatorie o la titolarità di ciascun controllo operativo: l'assessment resta quindi parziale. Il destinatario della nota non è usato come prova della competenza.",
};

export const PROPOSAL_COMPETENCE_ASSESSMENTS: Readonly<
  Partial<Record<string, ProposalCompetenceAssessment>>
> = {
  ...previous.PROPOSAL_COMPETENCE_ASSESSMENTS,
  [LIBERALI_FNA_ID]: LIBERALI_FNA_ASSESSMENT,
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

  if (!assessment) return previous.getProposalInstitutionalCompetence(proposal);

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
