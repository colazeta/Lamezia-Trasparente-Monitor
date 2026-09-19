import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as getPreviousCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds as getPreviousCanonicalProposalPresentationIds,
  hasCanonicalProposalPresentation as hasPreviousCanonicalProposalPresentation,
} from "./proposalCanonicalPresentationArchive20260915";

const CIMITERO_SAMBIASE_ID =
  "cimitero-sambiase-messa-sicurezza-futuro-nazionale-2026";

const CIMITERO_SAMBIASE_CANONICAL_PRESENTATION: CanonicalProposalPresentation = {
  proposalId: CIMITERO_SAMBIASE_ID,
  version: "1.0",
  title: "Messa in sicurezza e ripristino di una parte del cimitero di Sambiase",
  request:
    "Verificare con urgenza le condizioni della parte del cimitero di Sambiase segnalata e predisporre gli interventi necessari di messa in sicurezza e ripristino.",
  actionTypes: ["messa_in_sicurezza", "manutenzione", "prevenzione_rischio"],
  measures: [
    "Effettuare una verifica tecnica urgente della porzione del cimitero interessata dalla segnalazione.",
    "Mettere in sicurezza le parti che le verifiche confermino come pericolose o deteriorate.",
    "Ripristinare le porzioni strutturali e superficiali deteriorate individuate dalla verifica tecnica.",
  ],
  expectedOutcome:
    "Ridurre i rischi nella parte interessata e ripristinarne condizioni adeguate, senza presumere l'esistenza o la gravità tecnica delle criticità prima delle verifiche richieste.",
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  if (proposal.id === CIMITERO_SAMBIASE_ID)
    return CIMITERO_SAMBIASE_CANONICAL_PRESENTATION;
  return getPreviousCanonicalProposalPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string) {
  return (
    proposalId === CIMITERO_SAMBIASE_ID ||
    hasPreviousCanonicalProposalPresentation(proposalId)
  );
}

export function getCanonicalProposalPresentationIds() {
  return [
    ...getPreviousCanonicalProposalPresentationIds(),
    CIMITERO_SAMBIASE_ID,
  ].sort();
}
