import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261107";

/** Canone neutrale distinto dal record di acquisizione e dalle accuse dei promotori. */
const CANONICAL_20261108_B: Record<string, CanonicalProposalPresentation> = {
  "via-guido-dorso-ripristino-cristiano-villella-2026": {
    proposalId: "via-guido-dorso-ripristino-cristiano-villella-2026",
    version: "1.0",
    title: "Verifiche e ripristino della carreggiata di via Guido Dorso",
    request:
      "Verificare le condizioni della sede stradale di via Guido Dorso e predisporre, se necessari, interventi per la sicurezza e il ripristino del manto.",
    actionTypes: ["manutenzione", "messa_in_sicurezza", "prevenzione_rischio"],
    measures: [
      "Effettuare un sopralluogo e valutare le condizioni della carreggiata nel tratto segnalato.",
      "Individuare e classificare eventuali criticità che richiedano misure temporanee di sicurezza.",
      "Definire gli interventi di manutenzione e ripristino necessari sulla base dell'accertamento tecnico.",
      "Comunicare l'eventuale programma di interventi e i tempi previsti.",
    ],
    expectedOutcome:
      "Disporre di un accertamento documentato e, se necessario, di un programma di ripristino; nessuna criticità o efficacia degli interventi è data per accertata.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261108_B[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261108_B[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261108_B)].sort();
}
