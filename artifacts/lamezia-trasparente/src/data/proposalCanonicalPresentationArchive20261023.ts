import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as getPreviousCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds as getPreviousCanonicalProposalPresentationIds,
  hasCanonicalProposalPresentation as hasPreviousCanonicalProposalPresentation,
} from "./proposalCanonicalPresentationArchive20261013";

const SCOUTED_CANONICAL_20261023: Record<string, CanonicalProposalPresentation> = {
  "stadi-renda-riga-regolarizzazione-apertura-pubblico-2026": {
    proposalId: "stadi-renda-riga-regolarizzazione-apertura-pubblico-2026",
    version: "1.0",
    title: "Verifiche e regolarizzazione delle procedure degli stadi Renda e Riga",
    request:
      "Chiarire lo stato degli adempimenti amministrativi e di sicurezza relativi ai due stadi comunali e definire tempi verificabili per la loro possibile riapertura al pubblico.",
    actionTypes: ["trasparenza", "organizzazione", "coordinamento"],
    measures: [
      "Verificare lo stato della documentazione relativa ai due impianti e il suo invio agli enti coinvolti.",
      "Chiarire lo stato degli adempimenti e delle verifiche di sicurezza necessari.",
      "Individuare gli adempimenti ancora da completare senza presupporre irregolarità accertate.",
      "Predisporre un cronoprogramma per la regolarizzazione delle procedure e la possibile riapertura al pubblico.",
      "Comunicare gli atti rilevanti e i tempi previsti al Consiglio comunale.",
    ],
    expectedOutcome:
      "Rendere trasparenti i passaggi procedurali e i tempi di possibile riapertura, senza rappresentare come accertate le criticità riferite dai promotori.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return SCOUTED_CANONICAL_20261023[proposal.id] ??
    getPreviousCanonicalProposalPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(SCOUTED_CANONICAL_20261023[proposalId]) ||
    hasPreviousCanonicalProposalPresentation(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [
    ...getPreviousCanonicalProposalPresentationIds(),
    ...Object.keys(SCOUTED_CANONICAL_20261023),
  ].sort();
}
