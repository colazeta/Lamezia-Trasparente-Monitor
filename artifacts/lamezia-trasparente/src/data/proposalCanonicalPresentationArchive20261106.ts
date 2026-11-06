import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261105Backfill";

/** Presentazione neutrale; dichiarazioni e limiti probatori restano nel record di acquisizione. */
const CANONICAL_20261106: Record<string, CanonicalProposalPresentation> = {
  "contrade-acquadauzano-filicioni-viabilita-cristiano-villella-2026": {
    proposalId: "contrade-acquadauzano-filicioni-viabilita-cristiano-villella-2026",
    version: "1.0",
    title: "Verifiche e manutenzione della viabilità in cinque contrade",
    request:
      "Eseguire sopralluoghi tecnici e valutare gli interventi necessari sulle strade segnalate nelle località Acquadauzano, Gabella, Filicioni, Cubiti e Caria.",
    actionTypes: ["manutenzione", "prevenzione_rischio"],
    measures: [
      "Effettuare sopralluoghi tecnici nei tratti segnalati delle cinque località.",
      "Verificare la stabilità e l'accessibilità della strada presso Filicioni e le condizioni della carreggiata a Cubiti.",
      "Valutare la riparazione delle buche sulla strada Acquadauzano–Gabella.",
      "Valutare pulizia e sistemazione del tratto Acquadauzano–Caria, secondo le risultanze dei sopralluoghi.",
      "Definire, ove necessario, priorità di messa in sicurezza per la circolazione e l'accesso dei mezzi di soccorso.",
    ],
    expectedOutcome:
      "Disporre di accertamenti tecnici per programmare eventuali interventi di accessibilità e sicurezza; non sono verificati né gli accertamenti né l'efficacia degli interventi ipotizzati.",
  },
  "santeufemia-sicurezza-accessi-scuole-liberali-2026": {
    proposalId: "santeufemia-sicurezza-accessi-scuole-liberali-2026",
    version: "1.0",
    title: "Presidio e gestione degli accessi nell'area scolastica di Sant'Eufemia",
    request:
      "Valutare misure coordinate di presidio, controllo degli accessi e sicurezza nell'area antistante le scuole elementari di Sant'Eufemia, secondo le richieste dei Liberali.",
    actionTypes: ["prevenzione_rischio", "coordinamento", "organizzazione"],
    measures: [
      "Valutare un presidio della Polizia Locale negli orari di ingresso e uscita dagli istituti.",
      "Verificare il funzionamento dell'impianto di videosorveglianza esistente e l'eventuale necessità di ripristino.",
      "Riesaminare gli accessi e la sosta dei veicoli, predisponendo eventuali limitazioni e segnaletica orizzontale e verticale.",
      "Favorire il coordinamento operativo con i Carabinieri sulle criticità di sicurezza segnalate.",
      "Valutare il coinvolgimento dei servizi sociali nei casi pertinenti, distinguendo l'assistenza dalle attività di controllo.",
    ],
    expectedOutcome:
      "Esaminare misure di prevenzione e gestione dei flussi scolastici; non sono verificati l'adozione delle misure o risultati sulla sicurezza.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261106[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261106[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261106)].sort();
}
