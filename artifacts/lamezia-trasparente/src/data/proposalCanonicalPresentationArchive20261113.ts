import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261112";

/** Presentazioni canoniche LT neutre; l'acquisizione rimane separata. */
const CANONICAL_20261113: Record<string, CanonicalProposalPresentation> = {
  "capizzaglie-un-passo-oltre-riattivazione-cristiano-villella-2026": {
    "proposalId": "capizzaglie-un-passo-oltre-riattivazione-cristiano-villella-2026",
    "version": "1.0",
    "title": "Recupero del progetto Un Passo Oltre a Capizzaglie",
    "request": "Valutare la riattivazione del progetto socio-culturale Un Passo Oltre presso l'ex scuola Barbuto, verificandone l'assetto tecnico e le risorse effettivamente disponibili.",
    "actionTypes": [
      "infrastruttura",
      "valorizzazione",
      "organizzazione"
    ],
    "measures": [
      "Acquisire e verificare lo stato amministrativo e progettuale dell'intervento originario e delle eventuali rimodulazioni.",
      "Ricostruire la situazione attuale del finanziamento e individuare eventuali fonti di copertura.",
      "Valutare la realizzabilità di un centro socio-culturale e di spazi di aggregazione per giovani e famiglie.",
      "Esaminare l'inserimento di laboratori educativi, strutture sportive, orto e serra didattica secondo verifiche tecniche.",
      "Valutare la realizzazione di un'area giochi nello spazio comunale indicato dai promotori, previa verifica della disponibilità del sito."
    ],
    "expectedOutcome": "Disporre di una valutazione documentata delle condizioni per il possibile recupero del progetto, senza presumere finanziamenti spendibili o risultati sociali già dimostrati.",
    "editorialNote": "Richiesta pubblica del 12 novembre 2026. Il richiamo alla delibera del 2015 e al finanziamento è riportato dai promotori; mancano gli atti originali e la verifica delle risorse attuali. Interpellanza riferita, deposito non accertato."
  },
  "rambaldi-de-fazio-secondo-accesso-nuovo-cdu-2026": {
    "proposalId": "rambaldi-de-fazio-secondo-accesso-nuovo-cdu-2026",
    "version": "1.0",
    "title": "Valutazione di un secondo accesso al Polo Rambaldi-De Fazio",
    "request": "Verificare le criticità segnalate sulla viabilità di ingresso e uscita dal polo scolastico e valutare un secondo collegamento accessibile anche ai mezzi di emergenza.",
    "actionTypes": [
      "infrastruttura",
      "prevenzione_rischio",
      "coordinamento"
    ],
    "measures": [
      "Effettuare rilievi sui flussi veicolari negli orari di ingresso e uscita e sui possibili ostacoli al transito dei soccorsi.",
      "Esaminare la configurazione della viabilità esistente e le eventuali opzioni per un secondo accesso.",
      "Verificare la titolarità delle strade e dei terreni interessati e le autorizzazioni necessarie.",
      "Valutare costi, fattibilità, sicurezza e accessibilità delle soluzioni alternative.",
      "Coinvolgere scuola e soggetti istituzionali interessati nella valutazione tecnica prima di scegliere un intervento."
    ],
    "expectedOutcome": "Rendere disponibile una valutazione tecnica delle possibili soluzioni di accesso, senza presumere che il nuovo collegamento sia già fattibile o finanziato.",
    "editorialNote": "Lettera aperta del Nuovo CDU del 12 novembre 2026 rivolta alla Provincia. Proprietà, competenza su strade e terreni, incidenti e fattibilità non accertati da fonti istituzionali."
  }
};

export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal, "id" | "title" | "summary">): CanonicalProposalPresentation {
  return CANONICAL_20261113[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261113[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_20261113)])].sort();
}
