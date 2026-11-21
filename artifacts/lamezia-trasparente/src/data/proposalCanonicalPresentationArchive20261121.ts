import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261120Nucifero";
const CANONICAL_ADDITION: Record<string, CanonicalProposalPresentation> = {
  "ospedale-lamezia-spoke-sismico-dipartimenti-perri-2026": {
    "proposalId": "ospedale-lamezia-spoke-sismico-dipartimenti-perri-2026",
    "version": "1.0",
    "title": "Rete sanitaria interaziendale e ruolo antisismico dell'ospedale di Lamezia",
    "request": "Valutare il rafforzamento del presidio Giovanni Paolo II come nodo della rete ospedaliera e per le maxi-emergenze sismiche, con una gestione clinica coordinata fra le aziende interessate.",
    "actionTypes": [
      "organizzazione",
      "rafforzamento_servizio",
      "coordinamento",
      "prevenzione_rischio"
    ],
    "measures": [
      "Valutare il riconoscimento del presidio quale Spoke idoneo per le emergenze sismiche secondo la normativa applicabile.",
      "Progettare dipartimenti interaziendali tra ASP di Catanzaro e AOU Renato Dulbecco, con una direzione concordata.",
      "Programmare la rotazione delle équipe mediche, infermieristiche e in formazione presso il presidio lametino.",
      "Coordinare liste d'attesa e disponibilità delle sale operatorie per attività appropriate alla sede.",
      "Verificare infrastrutture e sistemi essenziali necessari alla continuità operativa in caso di sisma.",
      "Valutare il coordinamento logistico con 118, Protezione civile e strutture mobili per maxi-emergenze."
    ],
    "expectedOutcome": "Disporre di una valutazione organizzativa e tecnica per sostenere le funzioni del presidio e la continuità assistenziale nelle emergenze.",
    "editorialNote": "Richieste individuali del 24 settembre e 20 novembre 2026. Non risultano atti regionali di riconoscimento, dipartimenti istituiti, fondi disponibili verificati o risultati già ottenuti."
  },
  "rotoli-illuminazione-mozione-vescio-muraca-2026": {
    "proposalId": "rotoli-illuminazione-mozione-vescio-muraca-2026",
    "version": "1.0",
    "title": "Ripristino dell'illuminazione nell'Area PIP di contrada Rotoli",
    "request": "Ripristinare e rendere operativi i punti luce lungo gli accessi e le strade dell'Area PIP, rendendo conoscibili risorse, procedimenti e tempi degli interventi.",
    "actionTypes": [
      "manutenzione",
      "infrastruttura",
      "trasparenza"
    ],
    "measures": [
      "Verificare lo stato tecnico degli impianti di illuminazione esistenti.",
      "Definire le opere necessarie al ripristino e all'eventuale completamento dell'impianto.",
      "Indicare eventuali risorse stanziate e atti amministrativi adottati.",
      "Comunicare un calendario di attivazione dei punti luce e monitorare gli interventi."
    ],
    "expectedOutcome": "Ottenere una programmazione verificabile del ripristino, senza presumere l'effettiva riattivazione.",
    "editorialNote": "Mozione citata nell'ordine del giorno di maggio (prot. 36726/2026 ripreso dalla stampa) e approvazione unanime riferita dalla promotrice. Mancano atto originale, verbale di voto e protocolli delle successive interrogazioni. Discussione, dichiarazione di approvazione e promessa di intervento non provano esecuzione."
  },
  "rotoli-illuminazione-verifiche-branca-2026": {
    "proposalId": "rotoli-illuminazione-verifiche-branca-2026",
    "version": "1.0",
    "title": "Verifiche e tempi per l'illuminazione della zona produttiva di Rotoli",
    "request": "Accertare gli adempimenti amministrativi e tecnici necessari per riattivare l'illuminazione pubblica nell'Area PIP e nelle strade della zona produttiva di contrada Rotoli.",
    "actionTypes": [
      "trasparenza",
      "manutenzione",
      "messa_in_sicurezza"
    ],
    "measures": [
      "Verificare la presenza di un progetto tecnico per il ripristino degli impianti.",
      "Indicare gli eventuali stanziamenti e le procedure di gara o affidamento.",
      "Pubblicare un cronoprogramma verificabile per l'inizio e la conclusione degli interventi.",
      "Valutare misure temporanee per migliorare la visibilità fino al ripristino."
    ],
    "expectedOutcome": "Ottenere riscontri documentali e una pianificazione verificabile degli interventi.",
    "editorialNote": "Interrogazione riferita dal quotidiano, priva di copia protocollata acquisita. Si mantiene un ID distinto dall'iniziativa Vescio/Muraca, con lo stesso filone territoriale, per differenza di promotore e richiesta documentale."
  }
};
const MONTELLO_ID = "via-montello-illuminazione-potature-carito-2026";
export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal, "id" | "title" | "summary">): CanonicalProposalPresentation {
 const existing = CANONICAL_ADDITION[proposal.id];
 if (existing) return existing;
 const prior = previousPresentation(proposal);
 if (proposal.id !== MONTELLO_ID) return prior;
 return { ...prior, measures: [...prior.measures, "Fornire un riscontro documentato su risorse disponibili, interventi programmati e tempi di ripristino dei punti luce di via Montello."], editorialNote: [prior.editorialNote, "Il 20 novembre la consigliera Vescio riferisce una interrogazione: deposito, risposte e opere non verificati con atti ufficiali."].filter(Boolean).join(" ") };
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean { return Boolean(CANONICAL_ADDITION[proposalId]) || previousHas(proposalId); }
export function getCanonicalProposalPresentationIds(): string[] { return [...new Set([...previousIds(), ...Object.keys(CANONICAL_ADDITION)])].sort(); }
