import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261120";

const CANONICAL_ADDITION: Record<string, CanonicalProposalPresentation> = {
  "aeroporto-caro-voli-accordi-nucifero-2026": {
    proposalId: "aeroporto-caro-voli-accordi-nucifero-2026",
    version: "1.0",
    title: "Accordi tariffari per i collegamenti aerei con la Calabria",
    request: "Valutare un accordo con le compagnie aeree per migliorare l'accessibilità economica dei voli con la Calabria nei periodi di maggiore domanda, tenendo conto delle forme di sostegno pubblico eventualmente applicabili.",
    actionTypes: ["coordinamento", "regolazione", "trasparenza"],
    measures: [
      "Ricostruire e rendere pubblici i rapporti di incentivazione e gli accordi pertinenti ai collegamenti aerei.",
      "Avviare un confronto con i vettori interessati per valutare possibili strumenti di tutela dei passeggeri nei periodi di maggiore domanda.",
      "Verificare la compatibilità giuridica ed economica di eventuali condizioni tariffarie collegate agli incentivi pubblici.",
      "Valutare le connessioni con i servizi ferroviari e automobilistici regionali e le relative esigenze di rafforzamento.",
      "Comunicare gli esiti delle valutazioni e l'eventuale programma degli interventi.",
    ],
    expectedOutcome: "Disporre di una valutazione trasparente di misure potenzialmente idonee a favorire l'accessibilità dei collegamenti, senza presumere riduzioni dei prezzi o accordi già conclusi.",
    editorialNote: "La richiesta è del promotore; non sono stati verificati competenza tariffaria regionale, condizioni contrattuali, depositi istituzionali o efficacia delle misure. La nota del 19 novembre menziona un'interrogazione di altra esponente politica senza acquisizione dell'atto originale.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_ADDITION[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_ADDITION[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_ADDITION)])].sort();
}
