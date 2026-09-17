import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as getPreviousCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds as getPreviousCanonicalProposalPresentationIds,
  hasCanonicalProposalPresentation as hasPreviousCanonicalProposalPresentation,
} from "./proposalCanonicalPresentationArchive20260916";

const LIBERALI_FNA_ID = "fna-assistenza-progetto-vita-liberali-lamezia-2026";
const CIMITERO_SANT_EUFEMIA_ID =
  "cimitero-sant-eufemia-loculi-accessi-custodia-comitato-2026";

const LIBERALI_FNA_CANONICAL: CanonicalProposalPresentation = {
  proposalId: LIBERALI_FNA_ID,
  version: "1.0",
  title: "Coordinamento tra FNA, assistenza domiciliare e Progetti di Vita",
  request:
    "Verificare e coordinare le misure di assistenza per le persone con disabilità, rendendo trasparenti criteri e graduatorie e controllando l'effettiva attuazione dei Progetti di Vita.",
  actionTypes: ["coordinamento", "trasparenza", "organizzazione", "rafforzamento_servizio"],
  measures: [
    "Verificare eventuali sovrapposizioni tra forme di assistenza domiciliare e misure FNA.",
    "Rafforzare il coordinamento operativo tra Comune e ASP.",
    "Rendere trasparenti criteri di accesso e gestione delle graduatorie.",
    "Valutare lo scorrimento delle graduatorie quando ne ricorrano i presupposti.",
    "Verificare l'effettiva attuazione dei Progetti di Vita.",
    "Garantire continuità e maggiore integrazione tra servizi sociali, sanitari, educativi e assistenziali.",
    "Aprire un confronto con famiglie e associazioni interessate.",
  ],
  expectedOutcome:
    "Ridurre duplicazioni e discontinuità e rendere più trasparente e coordinata la presa in carico delle persone con disabilità.",
};

const CIMITERO_SANT_EUFEMIA_CANONICAL: CanonicalProposalPresentation = {
  proposalId: CIMITERO_SANT_EUFEMIA_ID,
  version: "1.0",
  title: "Programmazione dei servizi del cimitero di Sant’Eufemia",
  request:
    "Definire interventi e risorse per disponibilità di loculi, accessibilità, custodia e funzionalità del cimitero di Sant’Eufemia.",
  actionTypes: ["infrastruttura", "manutenzione", "rafforzamento_servizio", "trasparenza"],
  measures: [
    "Definire programmi per aumentare la disponibilità di loculi.",
    "Chiarire se siano previsti ampliamenti o nuove realizzazioni.",
    "Intervenire sui marciapiedi e sui percorsi di accesso al cimitero.",
    "Garantire la presenza di un custode durante l'orario diurno.",
    "Rendere note le risorse destinate a sicurezza, decoro e funzionalità del cimitero.",
  ],
  expectedOutcome:
    "Migliorare capacità, accessibilità e continuità dei servizi cimiteriali a Sant’Eufemia senza presumere come accertate le criticità descritte dal promotore.",
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  if (proposal.id === LIBERALI_FNA_ID) return LIBERALI_FNA_CANONICAL;
  if (proposal.id === CIMITERO_SANT_EUFEMIA_ID)
    return CIMITERO_SANT_EUFEMIA_CANONICAL;
  return getPreviousCanonicalProposalPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string) {
  return (
    proposalId === LIBERALI_FNA_ID ||
    proposalId === CIMITERO_SANT_EUFEMIA_ID ||
    hasPreviousCanonicalProposalPresentation(proposalId)
  );
}

export function getCanonicalProposalPresentationIds() {
  return [
    ...getPreviousCanonicalProposalPresentationIds(),
    LIBERALI_FNA_ID,
    CIMITERO_SANT_EUFEMIA_ID,
  ].sort();
}
