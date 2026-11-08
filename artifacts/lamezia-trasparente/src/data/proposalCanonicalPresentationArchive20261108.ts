import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261107";

/** La presentazione pubblica è neutrale e separata dall'acquisizione. */
const CANONICAL_20261108: Record<string, CanonicalProposalPresentation> = {
  "scuola-perri-pitagora-don-milani-orario-sei-giorni-di-spena-2026": {
    proposalId: "scuola-perri-pitagora-don-milani-orario-sei-giorni-di-spena-2026",
    version: "1.0",
    title: "Riesame dell'orario scolastico al Perri Pitagora Don Milani",
    request:
      "Riesaminare l'organizzazione settimanale delle lezioni per le classi interessate e valutare il ritorno a un orario dal lunedì al sabato, dalle 08:15 alle 13:15.",
    actionTypes: ["organizzazione", "coordinamento"],
    measures: [
      "Riesaminare la distribuzione delle lezioni attualmente prevista su cinque giorni.",
      "Valutare per le classi interessate la proposta di lezioni 08:15–13:15 dal lunedì al sabato.",
      "Confrontare le ricadute organizzative delle due articolazioni orarie per alunni, famiglie e personale scolastico.",
      "Promuovere, nei rispettivi ruoli istituzionali, un confronto fra scuola, famiglie e amministrazione comunale.",
    ],
    expectedOutcome:
      "Consentire una valutazione motivata dell'articolazione settimanale dell'orario, senza presumere benefici, accoglimento o modifiche già adottate.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261108[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261108[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261108)].sort();
}
