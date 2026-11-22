import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261121AreeCani";

const CANONICAL_LIFC: Record<string, CanonicalProposalPresentation> = {
  "centro-fibrosi-cistica-lamezia-tutela-spazi-lifc-2026": {
    proposalId: "centro-fibrosi-cistica-lamezia-tutela-spazi-lifc-2026",
    version: "1.0",
    title: "Tutela degli spazi assistenziali del Centro regionale per la fibrosi cistica",
    request: "Preservare gli ambienti e le attività del Centro regionale per la fibrosi cistica di Lamezia Terme da eventuali riorganizzazioni che ne modifichino la destinazione assistenziale.",
    actionTypes: ["rafforzamento_servizio", "coordinamento", "prevenzione_rischio"],
    measures: [
      "Mantenere la disponibilità dei locali attualmente destinati alla cura dei pazienti con fibrosi cistica.",
      "Conservare la destinazione assistenziale della palestra, del laboratorio spirometrico e degli altri spazi richiamati dall'associazione.",
      "Confrontare con la rappresentanza dei pazienti eventuali ipotesi future di riassetto logistico e organizzativo.",
    ],
    expectedOutcome: "Continuità nella disponibilità dei locali necessari alle attività del Centro, da verificare attraverso documentazione e riscontri successivi.",
    editorialNote: "La diffida precedente al 17 novembre è citata in una comunicazione congiunta pubblicata il 21 novembre, ma non è stata acquisita in originale né ne è noto il protocollo. La nota riferisce rassicurazioni ASP dopo la riunione del 17 novembre: non equivalgono ad un provvedimento originale, a recepimento formale o ad attuazione verificata.",
  },
};

export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal, "id" | "title" | "summary">): CanonicalProposalPresentation {
  return CANONICAL_LIFC[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_LIFC[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_LIFC)])].sort();
}
