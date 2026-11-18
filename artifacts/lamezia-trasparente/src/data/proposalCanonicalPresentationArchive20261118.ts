import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261117";

/** Titoli e misure LT neutrali e indipendenti dai record di acquisizione. */
const CANONICAL_20261118: Record<string, CanonicalProposalPresentation> = {
  "luminarie-frazioni-contrade-raso-2026": {
    "proposalId": "luminarie-frazioni-contrade-raso-2026",
    "version": "1.0",
    "title": "Luminarie natalizie nelle frazioni e contrade",
    "request": "Prevedere negli allestimenti natalizi 2026 almeno una luminaria per ciascuna frazione, località e contrada di Lamezia Terme e rendere verificabile la copertura territoriale.",
    "actionTypes": [
      "organizzazione",
      "valorizzazione",
      "trasparenza"
    ],
    "measures": [
      "Censire le frazioni, le località e le contrade da considerare nella programmazione degli allestimenti.",
      "Valutare l'installazione di almeno una luminaria in ciascuna località, nel rispetto delle verifiche tecniche e delle risorse disponibili.",
      "Comunicare quali località saranno effettivamente interessate e i relativi tempi.",
      "Rendere conoscibili i criteri utilizzati per distribuire gli allestimenti sul territorio."
    ],
    "expectedOutcome": "Disporre di una programmazione territoriale esplicita e verificabile, senza presumere che le installazioni siano già autorizzate o eseguite.",
    "editorialNote": "La stampa parla di richiesta formalizzata, ma non è stato acquisito un protocollo comunale o un atto che confermi il deposito. Nessuna installazione è trattata come attuazione accertata."
  },
  "via-gramsci-palermo-completamento-viario-cristiano-villella-2026": {
    "proposalId": "via-gramsci-palermo-completamento-viario-cristiano-villella-2026",
    "version": "1.0",
    "title": "Completamento del collegamento tra via Gramsci e via Palermo",
    "request": "Verificare la situazione progettuale e amministrativa del collegamento fra via Gramsci e via Palermo e valutare le condizioni per il completamento.",
    "actionTypes": [
      "infrastruttura",
      "trasparenza",
      "messa_in_sicurezza"
    ],
    "measures": [
      "Verificare destinazione urbanistica, titolarità e vincoli del tracciato segnalato.",
      "Accertare lo stato delle eventuali opere già predisposte e identificare le lavorazioni residue.",
      "Verificare progetti approvati, risorse eventualmente impegnate e motivi documentati del mancato completamento.",
      "Valutare la fattibilità e i costi degli interventi necessari e rendere pubblico un eventuale cronoprogramma."
    ],
    "expectedOutcome": "Fornire un quadro tecnico-amministrativo utile a decidere un eventuale completamento, senza presumere un progetto approvato o risultati viabilistici.",
    "editorialNote": "Il sopralluogo e le condizioni del collegamento sono riferiti dai consiglieri. L'interrogazione è annunciata, non verificata come formalmente depositata."
  },
  "coordinamento-sport-impianti-associazioni-2026": {
    "proposalId": "coordinamento-sport-impianti-associazioni-2026",
    "version": "1.0",
    "title": "Coordinamento e trasparenza nell'accesso agli impianti sportivi",
    "request": "Costituire un coordinamento tra associazioni sportive per esaminare disponibilità, manutenzione, sicurezza e criteri di utilizzo degli impianti pubblici, avviando un confronto documentato con le istituzioni.",
    "actionTypes": [
      "coordinamento",
      "trasparenza",
      "organizzazione"
    ],
    "measures": [
      "Raccogliere e organizzare le esigenze delle società sportive rispetto agli spazi disponibili e alle condizioni d'uso.",
      "Presentare un'istanza di accesso agli atti per conoscere procedure di assegnazione, interventi previsti e informazioni sugli impianti.",
      "Richiedere un incontro con Sindaco, assessore e uffici comunali per discutere soluzioni verificabili.",
      "Valutare il coinvolgimento di Provincia, scuole e organismi sportivi in base alle rispettive funzioni documentate."
    ],
    "expectedOutcome": "Avere informazioni confrontabili e un percorso di interlocuzione verificabile, senza presumere la costituzione del coordinamento o modifiche già approvate.",
    "editorialNote": "Il nome del coordinamento indica il progetto annunciato; la fonte non identifica tutte le associazioni aderenti né documenta l'effettiva costituzione o l'invio dell'accesso agli atti."
  },
  "teatro-costabile-cronoprogramma-progetto-civico-2026": {
    "proposalId": "teatro-costabile-cronoprogramma-progetto-civico-2026",
    "version": "1.0",
    "title": "Informazioni sui lavori e sulla riapertura del Teatro Franco Costabile",
    "request": "Chiarire pubblicamente lo stato amministrativo e tecnico dei lavori al Teatro Franco Costabile e indicare le condizioni e le tempistiche previste per restituirlo alla fruizione.",
    "actionTypes": [
      "trasparenza",
      "organizzazione"
    ],
    "measures": [
      "Pubblicare lo stato aggiornato del procedimento e delle lavorazioni previste.",
      "Comunicare i passaggi ancora necessari per la conclusione dei lavori e gli eventuali collaudi.",
      "Indicare le ragioni tecniche o procedurali documentate che incidono sui tempi.",
      "Rendere conoscibile un cronoprogramma aggiornato e, se verificabile, la data prevista di riapertura."
    ],
    "expectedOutcome": "Mettere a disposizione un quadro verificabile dei tempi e degli adempimenti, senza presumere la fine dei lavori o una data certa di apertura.",
    "editorialNote": "Il periodo di chiusura e le criticità sono riportati dal promotore; nessun atto tecnico-amministrativo originale o comunicazione ufficiale sulla data di apertura è stato acquisito."
  }
};

export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal, "id" | "title" | "summary">): CanonicalProposalPresentation {
  return CANONICAL_20261118[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261118[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_20261118)])].sort();
}
