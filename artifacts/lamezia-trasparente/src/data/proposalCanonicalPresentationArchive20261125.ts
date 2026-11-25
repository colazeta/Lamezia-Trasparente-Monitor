import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261124";
const CANONICAL: Record<string, CanonicalProposalPresentation> = {
  "verde-urbano-adattamento-caldo-isde-2026": {
    "proposalId": "verde-urbano-adattamento-caldo-isde-2026",
    "version": "1.0",
    "title": "Verde urbano e adattamento al caldo",
    "request": "Proteggere e aumentare il verde urbano e recuperare suolo permeabile, dando conto delle misure di adattamento e dei quartieri prioritari.",
    "actionTypes": [
      "prevenzione_rischio",
      "regolazione",
      "trasparenza",
      "coordinamento"
    ],
    "measures": [
      "Salvaguardare le alberature esistenti e aumentare verde e ombra nei quartieri più esposti.",
      "Limitare il nuovo consumo di suolo e recuperare superfici permeabili.",
      "Coinvolgere le donne e le loro organizzazioni nella progettazione dei piani per il caldo.",
      "Rendere conto delle misure adottate e previste, indicando tempi, risorse e quartieri prioritari."
    ],
    "expectedOutcome": "Maggiore protezione dal caldo e disponibilità di informazioni sulle priorità di adattamento.",
    "editorialNote": "Richiesta generale ai Comuni, cofirmata da una rappresentante locale; nessun progetto, target comunale o risultato verificato."
  },
  "prevenzione-violenza-genere-lamezia-bene-comune-2026": {
    "proposalId": "prevenzione-violenza-genere-lamezia-bene-comune-2026",
    "version": "1.0",
    "title": "Prevenzione della violenza di genere e sostegno ai centri antiviolenza",
    "request": "Rafforzare le politiche di prevenzione e i servizi territoriali di sostegno alle donne.",
    "actionTypes": [
      "rafforzamento_servizio",
      "prevenzione_rischio"
    ],
    "measures": [
      "Promuovere l'educazione all'affettività e al rispetto nelle scuole.",
      "Sostenere l'autonomia economica delle donne.",
      "Potenziare in modo continuativo i centri antiviolenza territoriali e prevedere risorse certe."
    ],
    "expectedOutcome": "Rafforzamento dei percorsi di prevenzione e sostegno.",
    "editorialNote": "Il comunicato non individua enti, programmi, importi o scadenze specifici."
  }
};
export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal,"id"|"title"|"summary">): CanonicalProposalPresentation { return CANONICAL[proposal.id] ?? previousPresentation(proposal); }
export function hasCanonicalProposalPresentation(id: string): boolean { return Boolean(CANONICAL[id]) || previousHas(id); }
export function getCanonicalProposalPresentationIds(): string[] { return [...new Set([...previousIds(), ...Object.keys(CANONICAL)])].sort(); }
