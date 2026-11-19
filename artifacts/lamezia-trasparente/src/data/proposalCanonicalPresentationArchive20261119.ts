import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261118";

/** Presentazione pubblica neutra, indipendente dai record di acquisizione. */
const CANONICAL_20261119: Record<string, CanonicalProposalPresentation> = {
  "porto-turistico-marinella-cafarone-ginepri-cristiano-villella-2026": {
    "proposalId": "porto-turistico-marinella-cafarone-ginepri-cristiano-villella-2026",
    "version": "1.0",
    "title": "Proposta di candidatura per un porto turistico sulla costa lametina",
    "request": "Valutare la partecipazione del Comune alla manifestazione d'interesse regionale sulla portualità turistica con un'ipotesi di porto nel tratto Marinella–Cafarone–Ginepri.",
    "actionTypes": [
      "infrastruttura",
      "organizzazione",
      "trasparenza"
    ],
    "measures": [
      "Esaminare i requisiti e i termini dell'avviso regionale rivolto ai Comuni costieri.",
      "Verificare la fattibilità urbanistica, tecnica, ambientale e paesaggistica di una possibile localizzazione tra Marinella, Cafarone e Ginepri.",
      "Valutare se predisporre e trasmettere una proposta comunale tramite le modalità previste dall'avviso.",
      "Rendere note l'eventuale decisione di partecipare e le motivazioni, gli elaborati e le fasi successive effettivamente documentate."
    ],
    "expectedOutcome": "Disporre di una decisione comunale e, se presentata, di una candidatura verificabile, senza presumere ammissione, finanziamenti o costruzione del porto.",
    "editorialNote": "La Regione ha pubblicato un avviso di ricognizione con scadenza 15 gennaio 2027, non un finanziamento; non è verificata una candidatura comunale. La localizzazione proposta è indicativa e subordinata alle verifiche. Nessuna competenza operativa su demanio e opere è inferita dal destinatario."
  },
  "torrente-canne-rifiuti-via-emilio-la-scala-cittadini-2026": {
    "proposalId": "torrente-canne-rifiuti-via-emilio-la-scala-cittadini-2026",
    "version": "1.0",
    "title": "Rimozione di rifiuti nell'area di via Emilio La Scala e torrente Canne",
    "request": "Richiedere agli enti interessati la verifica dei rifiuti segnalati presso via Emilio La Scala vicino al torrente Canne, la loro rimozione e la bonifica dell'area.",
    "actionTypes": [
      "manutenzione",
      "messa_in_sicurezza",
      "prevenzione_rischio"
    ],
    "measures": [
      "Identificare mediante sopralluogo il tratto interessato e verificare natura ed estensione dei rifiuti segnalati.",
      "Determinare, sulla base degli accertamenti e dei titoli amministrativi, le modalità appropriate di rimozione dei materiali.",
      "Provvedere alla pulizia e alla eventuale bonifica nei limiti di quanto accertato e delle competenze documentate.",
      "Verificare le eventuali criticità ambientali e idrauliche ed adottare misure di prevenzione proporzionate ai riscontri tecnici."
    ],
    "expectedOutcome": "Rendere possibile un intervento mirato e documentabile, senza considerare accertata la natura dei rifiuti, l'entità del rischio o l'esecuzione della bonifica.",
    "editorialNote": "Segnalazione attribuita a un cittadino non nominato; anche gli enti destinatari non sono identificati nominalmente dalla fonte. Non vi sono verbali tecnici o provvedimenti acquisiti e non è consentito inferire il soggetto competente. Geografia di area senza coordinate."
  }
};

export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal, "id" | "title" | "summary">): CanonicalProposalPresentation {
  return CANONICAL_20261119[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261119[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_20261119)])].sort();
}
