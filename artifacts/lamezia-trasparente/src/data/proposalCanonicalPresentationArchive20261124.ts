import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261123Curcio";

const CANONICAL: Record<string, CanonicalProposalPresentation> = {
  "partecipate-accesso-atti-flussi-informativi-masi-2026": {
    "proposalId": "partecipate-accesso-atti-flussi-informativi-masi-2026",
    "version": "1.0",
    "title": "Accesso agli atti e controllo informativo delle partecipate comunali",
    "request": "Rendere disponibili ai consiglieri i documenti sui rapporti tra Comune e rappresentanti nelle tre società partecipate indicate, attestando l'eventuale assenza degli atti.",
    "actionTypes": [
      "trasparenza",
      "organizzazione"
    ],
    "measures": [
      "Acquisire le relazioni dei rappresentanti comunali e i report gestionali disponibili.",
      "Rilasciare verbali assembleari, corrispondenza, direttive, deleghe e istruzioni di voto pertinenti.",
      "Attestare per iscritto l'eventuale assenza degli atti richiesti, indicando gli estremi disponibili.",
      "Valutare la discussione consiliare delle relazioni presentate secondo il regolamento."
    ],
    "expectedOutcome": "Disponibilità di un riscontro documentale per l'esercizio del controllo consiliare.",
    "editorialNote": "Deposito dichiarato ma non verificato; non si presume mancanza di documenti. Le eventuali iniziative ispettive successive sono condizionate al riscontro."
  },
  "palestra-gatti-igiene-gestione-cestistica-2026": {
    "proposalId": "palestra-gatti-igiene-gestione-cestistica-2026",
    "version": "1.0",
    "title": "Igiene e gestione della palestra S. Gatti",
    "request": "Definire modalità e responsabilità per la pulizia, l'igiene e la manutenzione ordinaria della palestra, verificando i disservizi segnalati.",
    "actionTypes": [
      "organizzazione",
      "manutenzione",
      "prevenzione_rischio"
    ],
    "measures": [
      "Definire per iscritto compiti e turni di pulizia e manutenzione ordinaria.",
      "Organizzare la raccolta differenziata dei rifiuti.",
      "Verificare disponibilità dell'acqua calda e accessibilità dei bagni per il pubblico.",
      "Richiedere verifiche igienico-sanitarie all'ASP."
    ],
    "expectedOutcome": "Regole gestionali verificabili e accertamento delle condizioni della struttura.",
    "editorialNote": "La trasmissione all'ASP è annunciata. Non sono accertate condizioni igieniche, responsabilità, obblighi contrattuali o necessità di chiusura."
  }
};

export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal, "id" | "title" | "summary">): CanonicalProposalPresentation { return CANONICAL[proposal.id] ?? previousPresentation(proposal); }
export function hasCanonicalProposalPresentation(id: string): boolean { return Boolean(CANONICAL[id]) || previousHas(id); }
export function getCanonicalProposalPresentationIds(): string[] { return [...new Set([...previousIds(), ...Object.keys(CANONICAL)])].sort(); }
