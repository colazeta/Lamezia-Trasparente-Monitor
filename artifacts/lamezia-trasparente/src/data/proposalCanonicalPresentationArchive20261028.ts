import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261027";

/** Neutral citizen-facing presentation, separate from acquisition provenance. */
const CANONICAL_20261028: Record<string, CanonicalProposalPresentation> = {
  "commissariato-lamezia-organico-cento-unita-coisp-2026": {
    proposalId: "commissariato-lamezia-organico-cento-unita-coisp-2026",
    version: "1.0",
    title: "Rafforzamento dell'organico del Commissariato di Lamezia Terme",
    request:
      "Rafforzare l'organico del Commissariato di Polizia di Stato di Lamezia Terme fino ad almeno 100 unità, come richiesto dal sindacato COISP.",
    actionTypes: ["organizzazione"],
    measures: [
      "Predisporre un piano di potenziamento del personale in servizio presso il Commissariato di Polizia di Stato di Lamezia Terme.",
      "Incrementare la dotazione di personale del Commissariato sino a raggiungere almeno 100 unità, secondo la soglia proposta dal sindacato.",
    ],
    expectedOutcome:
      "Disporre di una dotazione di personale corrispondente alla richiesta, senza presumere l'organico attuale, il fabbisogno accertato o l'efficacia di misure non attuate.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261028[proposal.id] ?? previousPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261028[proposalId]) || previousHas(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261028)].sort();
}
