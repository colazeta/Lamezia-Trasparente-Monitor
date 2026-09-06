import type { PublicProposal } from "./propostePubblicheCore";
import {
  getCanonicalProposalPresentation as getBaselineCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds as getBaselineCanonicalProposalPresentationIds,
  hasCanonicalProposalPresentation as hasBaselineCanonicalProposalPresentation,
  type CanonicalProposalPresentation,
} from "./proposalCanonicalPresentation";

/**
 * Canonical LT presentation overlay for proposals acquired after the current
 * baseline file. This keeps acquisition wording separate from the citizen-facing
 * request and lets daily scouting remain reviewable in small diffs.
 */
const SCOUTED_CANONICAL_PROPOSAL_PRESENTATIONS: Record<
  string,
  CanonicalProposalPresentation
> = {
  "quartiere-bella-manutenzione-masi-2026": {
    proposalId: "quartiere-bella-manutenzione-masi-2026",
    version: "1.0",
    title: "Manutenzione e sicurezza del quartiere Bella",
    request:
      "Intervenire sulla viabilità e sugli spazi pubblici del quartiere Bella prima dei festeggiamenti patronali e documentare tempi e responsabilità degli interventi.",
    actionTypes: ["manutenzione", "messa_in_sicurezza", "trasparenza"],
    measures: [
      "Effettuare un sopralluogo tecnico documentato sulle strade del quartiere e individuare i tratti più critici.",
      "Ripristinare il manto stradale e chiudere le buche, con priorità a via Lazio e alle strade del percorso processionale.",
      "Mettere in sicurezza con segnaletica temporanea i tratti che non possono essere ripristinati tempestivamente.",
      "Sfalciare l’erba alta e ripristinare il decoro delle aree verdi e degli spazi pubblici.",
      "Comunicare gli interventi disposti, le risorse assegnate e il responsabile del procedimento.",
      "Comunicare soggetti esecutori, cronoprogramma, misure di sicurezza ed esiti del sopralluogo.",
    ],
    expectedOutcome:
      "Ridurre le condizioni di dissesto e degrado e rendere verificabile il programma degli interventi richiesti.",
  },
  "quartiere-bella-pulizia-mtl-2026": {
    proposalId: "quartiere-bella-pulizia-mtl-2026",
    version: "1.0",
    title: "Pulizia e decoro del quartiere Bella",
    request:
      "Ripristinare pulizia e decoro del quartiere Bella prima dei festeggiamenti patronali del 6-8 settembre.",
    actionTypes: ["manutenzione"],
    measures: [
      "Pulire le strade del quartiere.",
      "Sfalciare la vegetazione presente negli spazi interessati.",
      "Ripristinare condizioni di decoro negli spazi pubblici prima dei festeggiamenti.",
    ],
    expectedOutcome:
      "Rendere strade e spazi pubblici più curati in vista dei festeggiamenti patronali.",
  },
  "palasparti-riapertura-manutenzione-mtl-2026": {
    proposalId: "palasparti-riapertura-manutenzione-mtl-2026",
    version: "1.0",
    title: "Riapertura e manutenzione del Palasparti",
    request:
      "Definire tempi e condizioni per la riapertura del Palasparti e intervenire sull’area esterna durante il periodo di chiusura.",
    actionTypes: ["manutenzione", "trasparenza", "organizzazione"],
    measures: [
      "Comunicare la data prevista per la riapertura del Palasparti.",
      "Indicare eventuali adempimenti, autorizzazioni o collaudi ancora necessari e i relativi tempi.",
      "Rimuovere la vegetazione incolta e ripristinare la pulizia dell’area esterna.",
      "Effettuare la derattizzazione del perimetro dell’impianto.",
      "Definire una programmazione con tempi verificabili per la restituzione dell’impianto all’uso sportivo.",
    ],
    expectedOutcome:
      "Rendere verificabili i tempi di riapertura e migliorare le condizioni dell’area esterna nel periodo di chiusura.",
  },
  "fna-disabilita-gravissima-bando-futuro-nazionale-2026": {
    proposalId: "fna-disabilita-gravissima-bando-futuro-nazionale-2026",
    version: "1.0",
    title: "Accesso ai fondi FNA per la disabilità gravissima",
    request:
      "Pubblicare l’avviso per l’accesso ai fondi FNA destinati alla disabilità gravissima e rendere verificabili tempi e stato della procedura.",
    actionTypes: ["organizzazione", "trasparenza"],
    measures: [
      "Pubblicare l’avviso per l’accesso ai fondi FNA destinati alla disabilità gravissima.",
      "Indicare tempi certi per le istruttorie e le successive erogazioni.",
      "Rendere pubblico lo stato delle risorse ricevute e le tempistiche procedurali previste.",
    ],
    expectedOutcome:
      "Rendere accessibile la procedura e verificabili tempi e risorse per i potenziali beneficiari.",
  },
  "sanita-pubblica-petizione-presidio-malerba-2026": {
    proposalId: "sanita-pubblica-petizione-presidio-malerba-2026",
    version: "1.0",
    title: "Rafforzamento della sanità pubblica e dei servizi territoriali",
    request:
      "Definire interventi pubblici, calendarizzati e verificabili per rafforzare ospedale e servizi territoriali, ridurre le criticità di accesso e rendere trasparenti risorse, responsabilità e avanzamento.",
    actionTypes: [
      "rafforzamento_servizio",
      "organizzazione",
      "trasparenza",
      "coordinamento",
    ],
    measures: [
      "Rendere trasparenti i fondi destinati alla sanità lametina e il loro utilizzo.",
      "Pubblicare un piano operativo calendarizzato per il potenziamento dell’ospedale e dei servizi territoriali.",
      "Definire priorità chiare e un sistema pubblico di monitoraggio degli interventi.",
      "Ridurre le liste d’attesa con interventi dedicati.",
      "Adeguare e valorizzare il Consultorio Familiare, garantendone funzioni, personale e servizi.",
      "Attuare pienamente l’Assistenza Domiciliare Integrata con le funzioni previste.",
      "Rafforzare gli organici, con priorità ai servizi di emergenza-urgenza.",
      "Ripristinare e rendere pienamente operativi i reparti e i servizi carenti.",
      "Pubblicare comunicazioni periodiche sullo stato della sanità territoriale.",
      "Convocare un Consiglio comunale aperto sulla sanità.",
      "Rendere trasparenti tavoli tecnici, progetti e interlocuzioni del Comune con Regione e ASP.",
    ],
    expectedOutcome:
      "Rendere verificabili programmazione, risorse e avanzamento degli interventi richiesti e rafforzare l’accesso ai servizi sanitari sul territorio.",
  },
  "la-mia-estate-avvio-attivita-oltre-autismo-2026": {
    proposalId: "la-mia-estate-avvio-attivita-oltre-autismo-2026",
    version: "1.0",
    title: "Tempi e condizioni per l’avvio di La mia estate",
    request:
      "Definire con chiarezza i tempi e le condizioni amministrative necessari all’avvio delle attività del progetto La mia estate per i beneficiari dell’ATS di Lamezia Terme.",
    actionTypes: ["organizzazione", "trasparenza", "attivazione_servizio"],
    measures: [
      "Comunicare quando potranno iniziare concretamente le attività del progetto.",
      "Indicare con precisione eventuali documenti ancora necessari per la convenzione.",
      "Indicare quando gli eventuali documenti mancanti siano stati richiesti e quale termine sia stato assegnato per produrli.",
      "Chiarire quali spese possano essere rendicontate dagli enti erogatori per organizzare personale e attività.",
    ],
    expectedOutcome:
      "Rendere verificabili gli adempimenti residui e i tempi necessari per l’avvio delle attività senza attribuire esiti non ancora documentati.",
  },
  "emodinamica-h24-commissione-sanita-pd-2026": {
    proposalId: "emodinamica-h24-commissione-sanita-pd-2026",
    version: "1.0",
    title: "Emodinamica fissa H24 al Giovanni Paolo II",
    request:
      "Configurare al Giovanni Paolo II un servizio di emodinamica fisso H24, superando il modello intermittente e itinerante previsto per il presidio.",
    actionTypes: ["rafforzamento_servizio", "organizzazione"],
    measures: [
      "Modificare la configurazione H6/H12 prevista per Lamezia in favore di un servizio H24.",
      "Garantire gli adeguamenti di personale necessari alla copertura continuativa richiesta.",
      "Organizzare il servizio come struttura fissa anziché come équipe itinerante.",
      "Configurare un hub funzionale per la fascia tirrenica dal basso Cosentino al Vibonese.",
    ],
    expectedOutcome:
      "Rendere continuativa la disponibilità del servizio secondo la configurazione H24 richiesta dal promotore.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return (
    SCOUTED_CANONICAL_PROPOSAL_PRESENTATIONS[proposal.id] ??
    getBaselineCanonicalProposalPresentation(proposal)
  );
}

export function hasCanonicalProposalPresentation(proposalId: string) {
  return (
    Boolean(SCOUTED_CANONICAL_PROPOSAL_PRESENTATIONS[proposalId]) ||
    hasBaselineCanonicalProposalPresentation(proposalId)
  );
}

export function getCanonicalProposalPresentationIds() {
  return [
    ...getBaselineCanonicalProposalPresentationIds(),
    ...Object.keys(SCOUTED_CANONICAL_PROPOSAL_PRESENTATIONS),
  ].sort();
}
