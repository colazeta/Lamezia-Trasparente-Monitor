import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261104";

/** Canone di presentazione neutrale, distinto da dichiarazioni e acquisizione. */
const CANONICAL_20261105: Record<string, CanonicalProposalPresentation> = {
  "patto-civico-monitoraggio-progetti-de-biase-2026": {
    proposalId: "patto-civico-monitoraggio-progetti-de-biase-2026",
    version: "1.0",
    title: "Patto civico per le priorità e il monitoraggio dei progetti cittadini",
    request:
      "Definire un patto di metodo tra le forze politiche e gli altri soggetti interessati, con priorità condivise e informazioni periodiche sull'avanzamento dei progetti comunali, come proposto da Salvatore De Biase.",
    actionTypes: ["coordinamento", "trasparenza", "organizzazione"],
    measures: [
      "Individuare un'agenda condivisa degli interventi strategici, indipendente dai cambi di maggioranza.",
      "Predisporre un dossier pubblico per ciascun progetto con stato di avanzamento, atti, finanziamenti, responsabili e scadenze.",
      "Aggiornare ogni sei mesi i cittadini sui risultati conseguiti e sulle attività ancora da realizzare.",
      "Elaborare un piano di rafforzamento del Comune relativo a personale, organizzazione degli uffici, riscossione e capacità di progettazione.",
      "Coinvolgere giovani, scuole, università, associazioni e imprese nella definizione delle prospettive di sviluppo cittadine.",
    ],
    expectedOutcome:
      "Rendere più verificabili priorità e avanzamento dei progetti e strutturare il confronto cittadino; l'eventuale sottoscrizione del patto e la sua efficacia restano da accertare.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261105[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261105[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261105)].sort();
}
