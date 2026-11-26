import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261125";
const CANONICAL: Record<string, CanonicalProposalPresentation> = {
  "via-settembrini-illuminazione-cristiano-villella-2026": {
    "proposalId": "via-settembrini-illuminazione-cristiano-villella-2026",
    "version": "1.0",
    "title": "Ripristino dell’illuminazione in via Settembrini",
    "request": "Ripristinare l’illuminazione pubblica di via Settembrini, individuando gli interventi, le risorse e i tempi necessari.",
    "actionTypes": [
      "manutenzione",
      "trasparenza",
      "messa_in_sicurezza"
    ],
    "measures": [
      "Individuare gli interventi necessari per ripristinare l’illuminazione.",
      "Stanziare le risorse necessarie.",
      "Comunicare i tempi previsti e ripristinare il servizio."
    ],
    "expectedOutcome": "Ripristino del servizio di illuminazione e disponibilità di tempi verificabili.",
    "editorialNote": "Comunicato firmato dai consiglieri: trasmissione dell’interrogazione dichiarata, senza protocollo o copia dell’atto. Il guasto e la natura straordinaria dell’intervento sono riferiti dai promotori; nessuna verifica tecnica o ripartizione contrattuale specifica acquisita. La scheda comunale dell'Ufficio Controllo di gestione delle manutenzioni documenta la gestione del servizio esternalizzato di illuminazione pubblica, non la responsabilità specifica del guasto. Competenza valutata solo parzialmente. Nessuna risposta, stanziamento o ripristino verificati."
  },
  "approdo-turistico-leggero-gruppo-pd-2026": {
    "proposalId": "approdo-turistico-leggero-gruppo-pd-2026",
    "version": "1.0",
    "title": "Candidatura per un approdo turistico leggero sul litorale",
    "request": "Candidare all’avviso regionale un approdo per il diporto leggero, con punto pubblico di alaggio e varo, previa verifica di fattibilità.",
    "actionTypes": [
      "infrastruttura",
      "coordinamento",
      "prevenzione_rischio"
    ],
    "measures": [
      "Presentare la candidatura comunale entro il 15 gennaio 2027, termine indicato nella nota.",
      "Valutare una rampa antiscivolo per alaggio e varo di piccole imbarcazioni.",
      "Valutare un braccio frangiflutti in massi naturali.",
      "Prevedere una zona di sosta drenante per veicoli e carrelli e servizi ecologici minimi.",
      "Svolgere verifiche tecniche, idrauliche e ambientali per definire il sito.",
      "Convocare la commissione consiliare competente prima dell’invio."
    ],
    "expectedOutcome": "Disponibilità di una candidatura valutabile per un accesso pubblico al mare destinato al diporto leggero.",
    "editorialNote": "Nota firmata da Carito attribuisce la mozione al gruppo PD; deposito dichiarato, senza copia protocollata. La proposta è distinta da quella Cristiano–Villella del 18 novembre per promotore e configurazione di approdo leggero, pur nello stesso filone. L’avviso regionale è ricognitivo e non dimostra finanziamento, autorizzazione, localizzazione definitiva, adesione o attuazione. Nessuna competenza esclusiva su demanio o autorizzazioni inferita; not_assessed."
  },
  "prevenzione-violenza-genere-azione-lamezia-2026": {
    "proposalId": "prevenzione-violenza-genere-azione-lamezia-2026",
    "version": "1.0",
    "title": "Prevenzione della violenza di genere e servizi di sostegno",
    "request": "Adottare interventi continuativi di prevenzione educativa e di sostegno alle persone coinvolte nella violenza di genere a Lamezia.",
    "actionTypes": [
      "prevenzione_rischio",
      "rafforzamento_servizio",
      "coordinamento"
    ],
    "measures": [
      "Attivare percorsi continuativi di educazione al rispetto e all’affettività a partire dalle scuole primarie.",
      "Sostenere stabilmente centri antiviolenza e case rifugio del territorio.",
      "Organizzare supporto psicologico per minori che assistono alla violenza, in rete con i servizi sociali.",
      "Attivare spazi di ascolto e incontri per il sostegno alla genitorialità.",
      "Promuovere percorsi rivolti agli uomini autori di violenza.",
      "Formare personale comunale, polizia locale e operatori di primo contatto."
    ],
    "expectedOutcome": "Disponibilità di percorsi strutturati di prevenzione, formazione e supporto territoriale.",
    "editorialNote": "Comunicato del presidente di Azione Lamezia; le sei misure sono rivolte alla politica locale, senza individuazione di un’autorità unica, importi o atti. Distinta dalla proposta Lamezia Bene Comune del 24 novembre per promotore e ulteriori misure. L’iniziativa comunale del 25 novembre era annunciata già il 22 novembre e non costituisce recepimento della proposta. Nessun deposito, risposta o attuazione accertati; not_assessed."
  }
};
export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal,"id"|"title"|"summary">): CanonicalProposalPresentation { return CANONICAL[proposal.id] ?? previousPresentation(proposal); }
export function hasCanonicalProposalPresentation(id: string): boolean { return Boolean(CANONICAL[id]) || previousHas(id); }
export function getCanonicalProposalPresentationIds(): string[] { return [...new Set([...previousIds(), ...Object.keys(CANONICAL)])].sort(); }
