import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261109";

/** Contenuto canonico pubblico; acquisizione e limiti probatori restano separati. */
const CANONICAL_20261110: Record<string, CanonicalProposalPresentation> = {
  "ex-cinema-grandinetti-gestione-salvatore-vescio-2026": {
    proposalId: "ex-cinema-grandinetti-gestione-salvatore-vescio-2026",
    version: "1.0",
    title: "Gestione e attività culturali per l'ex Cinema Grandinetti",
    request:
      "Definire, nell'ambito del percorso di recupero dell'ex Cinema Grandinetti di Sambiase, un modello di gestione che ne preveda l'uso continuativo e una programmazione culturale aperta al territorio.",
    actionTypes: ["organizzazione", "coordinamento", "valorizzazione"],
    measures: [
      "Individuare e valutare possibili modalità di gestione della struttura dopo il recupero.",
      "Programmare attività teatrali, cinematografiche, artistiche e formative negli spazi recuperati.",
      "Prevedere il coinvolgimento delle scuole, delle associazioni e delle realtà culturali territoriali nella programmazione.",
      "Coordinare la progettazione delle future funzioni con le fasi amministrative di recupero dell'immobile.",
    ],
    expectedOutcome:
      "Definire un utilizzo culturale continuativo da sottoporre a valutazione e attuazione successiva; la disponibilità effettiva dell'immobile e i risultati attesi non sono ancora documentati.",
    editorialNote:
      "La richiesta riguarda gestione e funzioni culturali, non costituisce prova di affidamento, conclusione dei lavori o attivazione del servizio.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261110[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261110[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261110)].sort();
}
