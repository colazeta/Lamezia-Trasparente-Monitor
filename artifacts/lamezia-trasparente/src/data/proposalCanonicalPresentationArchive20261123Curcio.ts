import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261122Lifc";

const CANONICAL_CURCIO: Record<string, CanonicalProposalPresentation> = {
  "via-domenico-curcio-manutenzione-drenaggio-residenti-2026": {
    proposalId: "via-domenico-curcio-manutenzione-drenaggio-residenti-2026",
    version: "1.0",
    title: "Manutenzione e drenaggio di via Domenico Curcio a Magolà",
    request: "Verificare e risolvere le criticità della pavimentazione e del deflusso delle acque piovane in via Domenico Curcio, assicurando condizioni di accesso e circolazione verificabili.",
    actionTypes: ["manutenzione", "messa_in_sicurezza", "trasparenza"],
    measures: [
      "Verificare le condizioni della pavimentazione e le segnalazioni dei residenti sul tratto stradale.",
      "Accertare il funzionamento dello scolo delle acque piovane e l'eventuale ostruzione indicata dai residenti.",
      "Ripristinare il deflusso delle acque qualora la verifica tecnica accerti criticità.",
      "Individuare gli interventi necessari per rendere sicuri e accessibili gli accessi alle abitazioni.",
      "Comunicare le opere eseguite, le eventuali verifiche del drenaggio e i tempi per gli interventi ancora necessari.",
    ],
    expectedOutcome: "Disponibilità di una verifica tecnica e di un programma documentato per la manutenzione stradale e il deflusso delle acque, senza presumere la risoluzione delle criticità.",
    editorialNote: "L'appello originario è del 16 luglio 2026; il 3 novembre i residenti riferiscono una bitumazione e criticità del drenaggio. Le fonti non documentano protocollo delle segnalazioni, atti originali dei lavori, verifiche del sistema idraulico o nesso causale tra proposta e interventi. L'aggiornamento non è considerato recepimento né attuazione.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_CURCIO[proposal.id] ?? previousPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_CURCIO[proposalId]) || previousHas(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_CURCIO)])].sort();
}
