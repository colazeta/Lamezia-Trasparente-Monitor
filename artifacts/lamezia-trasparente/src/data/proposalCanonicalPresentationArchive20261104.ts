import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261103";

/** Sintesi cittadina: la descrizione di acquisizione resta separata e auditabile. */
const CANONICAL_20261104: Record<string, CanonicalProposalPresentation> = {
  "cottola-fiala-pulizia-detriti-residenti-agricoltori-2026": {
    proposalId: "cottola-fiala-pulizia-detriti-residenti-agricoltori-2026",
    version: "1.0",
    title: "Pulizia dell'alveo del torrente Cottola presso Fialà",
    request: "Verificare le condizioni del tratto del torrente Cottola presso il ponte di Fialà e intervenire sui detriti segnalati, come richiesto da residenti e operatori agricoli.",
    actionTypes: ["manutenzione", "prevenzione_rischio", "messa_in_sicurezza"],
    measures: [
      "Verificare sul posto l'accumulo di detriti segnalato in prossimità del ponte.",
      "Valutare gli interventi necessari per rimuovere eventuali ostacoli al deflusso delle acque.",
      "Programmare gli interventi di pulizia e prevenzione che risultino tecnicamente appropriati.",
    ],
    expectedOutcome: "Chiarire le condizioni del tratto segnalato e l'eventuale necessità di opere di prevenzione, senza presumere rischi o benefici non accertati.",
  },
};
export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261104[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261104[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261104)].sort();
}
