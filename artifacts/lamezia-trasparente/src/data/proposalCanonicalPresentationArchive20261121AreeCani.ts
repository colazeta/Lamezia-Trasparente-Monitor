import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261121Muraca";

const CANONICAL_AREE_CANI: Record<string, CanonicalProposalPresentation> = {
  "aree-sgambamento-cani-gianturco-2023": {
    proposalId: "aree-sgambamento-cani-gianturco-2023",
    version: "1.0",
    title: "Aree recintate per lo sgambamento dei cani nelle macrozone cittadine",
    request: "Valutare la realizzazione di più aree pubbliche recintate e attrezzate destinate allo sgambamento dei cani, distribuite nelle diverse parti della città.",
    actionTypes: ["infrastruttura", "valorizzazione", "organizzazione"],
    measures: [
      "Individuare almeno tre spazi potenzialmente idonei nelle macrozone cittadine, anche all'interno dei parchi.",
      "Verificare la fattibilità di recinzioni, zone ombreggiate, accessi sicuri, punti acqua e cestini.",
      "Valutare l'installazione di panchine, segnaletica e attrezzature coerenti con il benessere animale.",
      "Definire, qualora si proceda, modalità di realizzazione, gestione e manutenzione degli spazi.",
    ],
    expectedOutcome: "Disporre di una valutazione tecnica ed economica per una rete di spazi attrezzati, senza presumere che siano già realizzati o operativi.",
    editorialNote: "Il deposito della proposta del 2023 è riferito dal promotore senza protocollo acquisito. Nel novembre 2026 la Giunta annuncia un atto d'indirizzo per il Parco Adelchi Argada, dove era stata prospettata una possibile area; non è provato un recepimento causale né la costruzione dell'intervento.",
  },
};

export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal, "id" | "title" | "summary">): CanonicalProposalPresentation {
  return CANONICAL_AREE_CANI[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_AREE_CANI[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_AREE_CANI)])].sort();
}
