import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261102";

/** Presentazioni cittadine separate dalle note di acquisizione. */
const CANONICAL_20261103: Record<string, CanonicalProposalPresentation> = {
  "corsi-acqua-manutenzione-cristiano-villella-2026": {
    proposalId: "corsi-acqua-manutenzione-cristiano-villella-2026",
    version: "1.0",
    title: "Pulizia e manutenzione programmata dei corsi d'acqua",
    request: "Programmare ed eseguire interventi di pulizia e manutenzione degli alvei dei corsi d'acqua cittadini e chiarire il calendario degli interventi annunciati, come richiesto da Cristiano e Villella.",
    actionTypes: ["manutenzione", "prevenzione_rischio", "trasparenza", "coordinamento"],
    measures: [
      "Programmare interventi di pulizia effettiva degli alvei e di rimozione dei materiali che possono ostacolare il deflusso.",
      "Definire un programma di manutenzione continuativa dei corsi d'acqua interessati.",
      "Chiarire lo stato dell'accordo con Calabria Verde e rendere conoscibili tempi previsti e ambiti di intervento.",
      "Fornire riscontro sulle ragioni degli eventuali ritardi, senza presupporre responsabilità accertate.",
    ],
    expectedOutcome: "Rendere tracciabili gli interventi richiesti e sostenere la prevenzione dei rischi idraulici; criticità e benefici effettivi devono essere verificati.",
  },
  "welfare-tavoli-permanenti-forum-terzo-settore-2025": {
    proposalId: "welfare-tavoli-permanenti-forum-terzo-settore-2025",
    version: "1.0",
    title: "Tavoli permanenti per la co-programmazione del welfare",
    request: "Ripristinare tavoli tematici permanenti di confronto tra istituzioni locali ed enti del Terzo Settore per partecipare alla programmazione delle politiche sociali, come richiesto dal Forum territoriale.",
    actionTypes: ["coordinamento", "organizzazione", "rafforzamento_servizio"],
    measures: [
      "Istituire o riattivare tavoli tematici periodici per le politiche sociali.",
      "Coinvolgere gli enti del Terzo Settore nella rilevazione dei bisogni e nella co-programmazione dei servizi.",
      "Definire modalità continuative e inclusive di partecipazione al confronto con il Comune e l'Ambito Territoriale Sociale.",
    ],
    expectedOutcome: "Rendere più strutturato il confronto fra servizi e associazioni; l'effettivo funzionamento dei tavoli e gli eventuali effetti sui servizi non risultano ancora comprovati.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261103[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261103[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261103)].sort();
}
