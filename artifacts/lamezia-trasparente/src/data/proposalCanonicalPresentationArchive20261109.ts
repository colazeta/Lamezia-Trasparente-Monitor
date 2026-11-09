import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261108B";

/** Presentazione editoriale neutra, distinta dal record di acquisizione. */
const CANONICAL_20261109: Record<string, CanonicalProposalPresentation> = {
  "infermieristica-sede-ospedale-parco-agricolo-2026": {
    proposalId: "infermieristica-sede-ospedale-parco-agricolo-2026",
    version: "1.0",
    title: "Collocazione del corso di Infermieristica nel presidio ospedaliero",
    request:
      "Collocare la didattica del corso di laurea in Infermieristica presso il presidio Giovanni Paolo II di Lamezia Terme e valutarne un ampliamento all'interno della struttura.",
    actionTypes: ["organizzazione", "rafforzamento_servizio", "coordinamento"],
    measures: [
      "Individuare all'interno dell'ospedale gli spazi destinabili alle attività didattiche del corso.",
      "Mantenere la sede formativa nel presidio ospedaliero, secondo la richiesta dell'associazione.",
      "Valutare un ampliamento strutturale dell'offerta formativa all'interno del presidio.",
    ],
    expectedOutcome:
      "Realizzare, qualora approvato dai soggetti titolati, un polo formativo ospedaliero integrato; le ricadute educative e sanitarie prospettate dal promotore non sono quantificate né dimostrate.",
    editorialNote:
      "Si tratta di una richiesta associativa, non di un atto di approvazione o di una verifica sulla sede effettivamente adottata dall'Ateneo.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261109[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261109[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261109)].sort();
}
