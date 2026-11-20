import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261119Backfill";
import { SCORDOVILLO_DISCUSSION_IDS } from "./proposalScoutingUpdates20261120Scordovillo";

/** The underlying requests and atomic measures are preserved unchanged. */
const DISCUSSION_EDITORIAL_NOTE =
  "Aggiornamento 19 novembre 2026: la seduta aperta del Consiglio comunale su Scordovillo si è svolta secondo due cronache giornalistiche dirette. Non è stato acquisito il verbale comunale originale. La discussione del tema non costituisce approvazione, recepimento o attuazione di misure abitative, e non attribuisce la convocazione a un unico promotore. Il rigetto riportato di una diversa mozione sui tempi non è un rigetto di questa richiesta.";

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  const presentation = previousPresentation(proposal);
  return SCORDOVILLO_DISCUSSION_IDS.some(id => id === proposal.id)
    ? { ...presentation, editorialNote: DISCUSSION_EDITORIAL_NOTE }
    : presentation;
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return previousIds();
}
