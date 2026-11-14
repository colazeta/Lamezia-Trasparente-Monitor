import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261113";

/** Presentazione canonica LT distinta dall'acquisizione e dalle evidenze. */
const CANONICAL_20261114: Record<string, CanonicalProposalPresentation> = {
  "area-urbana-catanzaro-lamezia-governance-giovani-2026": {
  "proposalId": "area-urbana-catanzaro-lamezia-governance-giovani-2026",
  "version": "1.0",
  "title": "Pianificazione integrata per l'area Catanzaro–Lamezia",
  "request": "Sollecitare il passaggio dall'indirizzo regionale già adottato a una pianificazione sovracomunale e a una governance multilivello per l'area Catanzaro–Lamezia.",
  "actionTypes": [
    "coordinamento",
    "organizzazione",
    "trasparenza"
  ],
  "measures": [
    "Tradurre il precedente indirizzo regionale in obiettivi e strumenti operativi di pianificazione per l'area vasta.",
    "Coordinare le priorità dei territori interessati con gli strumenti di pianificazione esistenti, tra cui PTCP, QTR/P e piani strategici.",
    "Definire modalità di cooperazione multilivello tra le istituzioni coinvolte nel percorso d'area.",
    "Raccordare nella programmazione le funzioni produttive e logistiche lametine con quelle universitarie, sanitarie e amministrative del comprensorio catanzarese."
  ],
  "expectedOutcome": "Disporre di un percorso verificabile di programmazione congiunta, senza presupporre l'adozione di ulteriori atti, benefici economici o interventi realizzati.",
  "editorialNote": "La DGR Calabria n. 112 del 25 marzo 2026 e il Tavolo di coordinamento sono precedenti alla proposta del Movimento del 9 novembre: sono atti di contesto, non risposte o recepimenti causati dal Movimento. Il collegamento metropolitano richiamato da un partecipante non è trattato come misura nuova autonoma."
}
};

export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal, "id" | "title" | "summary">): CanonicalProposalPresentation {
  return CANONICAL_20261114[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261114[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_20261114)])].sort();
}
