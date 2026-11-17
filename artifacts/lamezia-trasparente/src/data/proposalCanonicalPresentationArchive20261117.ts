import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261116";

const CANONICAL_20261117: Record<string, CanonicalProposalPresentation> = {
  "polo-sportivo-paralimpico-stretto-iona-2026": {
  "proposalId": "polo-sportivo-paralimpico-stretto-iona-2026",
  "version": "1.0",
  "title": "Valutazione di un polo sportivo paralimpico a Lamezia",
  "request": "Verificare fattibilità e percorso istituzionale di un polo sportivo paralimpico nell'area del nuovo palazzetto e dello stadio Carlei, valutando riqualificazione, accessibilità e modalità di gestione.",
  "actionTypes": [
    "infrastruttura",
    "valorizzazione",
    "coordinamento"
  ],
  "measures": [
    "Verificare la disponibilità e i vincoli delle aree e delle strutture che potrebbero ospitare il polo.",
    "Valutare gli interventi di accessibilità e adeguamento degli impianti per le attività paralimpiche.",
    "Definire le possibili funzioni sportive, formative e agonistiche del polo.",
    "Esaminare con il Comitato Italiano Paralimpico e le istituzioni interessate un possibile modello gestionale.",
    "Rendere verificabili gli eventuali atti successivi, le responsabilità, le fonti di finanziamento e il cronoprogramma."
  ],
  "expectedOutcome": "Disporre di basi tecniche e amministrative per decidere se e come realizzare il progetto, senza presumere benefici o finanziamenti.",
  "editorialNote": "Il comunicato regionale del 16 novembre attesta l'approvazione della stipula di un protocollo d'intesa, non la sua sottoscrizione. Non dimostra che la proposta di Ionà sia stata formalmente recepita né che siano iniziati i lavori."
}
};

export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal, "id" | "title" | "summary">): CanonicalProposalPresentation {
  return CANONICAL_20261117[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261117[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_20261117)])].sort();
}
