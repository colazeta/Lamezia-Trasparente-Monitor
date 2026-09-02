import type { PublicProposal } from "./propostePubblicheCore";

export const CANONICAL_PROPOSAL_ACTIONS = [
  "attivazione_servizio",
  "rafforzamento_servizio",
  "manutenzione",
  "messa_in_sicurezza",
  "infrastruttura",
  "regolazione",
  "trasparenza",
  "coordinamento",
  "riuso",
  "valorizzazione",
  "organizzazione",
  "prevenzione_rischio",
  "partecipazione_digitale",
  "altro",
] as const;

export type CanonicalProposalAction = (typeof CANONICAL_PROPOSAL_ACTIONS)[number];

export const CANONICAL_PROPOSAL_ACTION_LABELS: Record<CanonicalProposalAction, string> = {
  attivazione_servizio: "Attivazione servizio",
  rafforzamento_servizio: "Rafforzamento servizio",
  manutenzione: "Manutenzione",
  messa_in_sicurezza: "Messa in sicurezza",
  infrastruttura: "Infrastruttura",
  regolazione: "Regolazione",
  trasparenza: "Trasparenza",
  coordinamento: "Coordinamento",
  riuso: "Riuso",
  valorizzazione: "Valorizzazione",
  organizzazione: "Organizzazione",
  prevenzione_rischio: "Prevenzione del rischio",
  partecipazione_digitale: "Partecipazione digitale",
  altro: "Altra misura",
};

export type CanonicalProposalPresentation = {
  proposalId: string;
  version: "1.0";
  title: string;
  request: string;
  actionTypes: readonly CanonicalProposalAction[];
  measures: readonly string[];
  expectedOutcome?: string;
  editorialNote?: string;
};

const CANONICAL_PROPOSAL_PRESENTATIONS: Record<string, CanonicalProposalPresentation> = {
  "piazza-italia-sicurezza-prevenzione-2026": {
    proposalId: "piazza-italia-sicurezza-prevenzione-2026",
    version: "1.0",
    title: "Sicurezza e vivibilità di Piazza Italia",
    request:
      "Rafforzare in modo stabile prevenzione, controllo e gestione delle situazioni di vulnerabilità nell’area di Piazza Italia.",
    actionTypes: ["prevenzione_rischio", "coordinamento", "rafforzamento_servizio"],
    measures: [
      "Coordinare controlli più frequenti tra i soggetti competenti.",
      "Potenziare la videosorveglianza nell’area.",
      "Valutare misure regolatorie comunali quando necessarie.",
      "Rafforzare il coordinamento con la Prefettura.",
      "Coinvolgere i servizi sociali nei casi di vulnerabilità.",
    ],
    expectedOutcome: "Ridurre i rischi e migliorare la vivibilità dello spazio pubblico.",
  },
  "fontana-piazza-mercato-vecchio-manutenzione-2026": {
    proposalId: "fontana-piazza-mercato-vecchio-manutenzione-2026",
    version: "1.0",
    title: "Ripristino della fontana di Piazza Mercato Vecchio",
    request:
      "Ripristinare condizioni di pulizia, funzionalità e decoro della fontana di Piazza Mercato Vecchio.",
    actionTypes: ["manutenzione", "messa_in_sicurezza"],
    measures: [
      "Rimuovere acqua stagnante, alghe e rifiuti dalle vasche.",
      "Pulire e ripristinare la fontana.",
      "Contrastare i comportamenti che contribuiscono al degrado dell’area.",
    ],
    expectedOutcome: "Restituire alla piazza una fontana pulita, sicura e mantenuta nel tempo.",
  },
  "asili-nido-continuita-servizio-2026": {
    proposalId: "asili-nido-continuita-servizio-2026",
    version: "1.0",
    title: "Continuità e avvio dei tre asili nido comunali",
    request:
      "Garantire l’avvio tempestivo dei tre asili nido comunali e prevenire interruzioni del servizio durante le procedure di affidamento.",
    actionTypes: ["attivazione_servizio", "organizzazione", "trasparenza"],
    measures: [
      "Pubblicare gli atti rilevanti della procedura di affidamento.",
      "Attivare il servizio con la massima tempestività possibile.",
      "Prevedere misure di continuità o soluzioni ponte in caso di ritardi procedurali.",
    ],
    expectedOutcome: "Evitare vuoti di assistenza per bambini e famiglie durante i cambi di gestione.",
  },
  "ponte-sant-antonio-rilancio-2026": {
    proposalId: "ponte-sant-antonio-rilancio-2026",
    version: "1.0",
    title: "Manutenzione e valorizzazione dell’area di Ponte S. Antonio",
    request:
      "Migliorare manutenzione, sicurezza, mobilità e valorizzazione dell’area di Ponte S. Antonio e delle vie limitrofe.",
    actionTypes: ["manutenzione", "messa_in_sicurezza", "valorizzazione"],
    measures: [
      "Rafforzare manutenzione e decoro dello spazio pubblico.",
      "Migliorare sicurezza e controllo della viabilità.",
      "Valorizzare il patrimonio turistico e culturale dell’area.",
    ],
    expectedOutcome: "Rendere l’area più sicura, curata e fruibile da residenti e visitatori.",
  },
  "politiche-sociali-progetto-vita-2026": {
    proposalId: "politiche-sociali-progetto-vita-2026",
    version: "1.0",
    title: "Riorganizzazione delle politiche per disabilità e Progetto di Vita",
    request:
      "Rafforzare la continuità assistenziale e la governance comunale dei servizi per disabilità e non autosufficienza.",
    actionTypes: ["rafforzamento_servizio", "organizzazione", "trasparenza", "coordinamento"],
    measures: [
      "Garantire continuità assistenziale nei passaggi tra servizi e misure.",
      "Istituire un Tavolo permanente sulla disabilità.",
      "Definire un Piano territoriale annuale per il Progetto di Vita.",
      "Rendere trasparenti criteri di accesso, monitoraggio e risultati.",
      "Utilizzare il budget di progetto e rafforzare la co-progettazione con il Terzo settore.",
      "Rafforzare capacità amministrativa, formazione e osservazione dei bisogni.",
    ],
    expectedOutcome: "Rendere i percorsi di presa in carico più continui, trasparenti e personalizzati.",
  },
  "riuso-libri-scolastici-inclusione-2026": {
    proposalId: "riuso-libri-scolastici-inclusione-2026",
    version: "1.0",
    title: "Riuso dei libri scolastici per la didattica inclusiva",
    request:
      "Recuperare testi scolastici e manuali semplificati ancora utilizzabili e destinarli gratuitamente alle attività di inclusione scolastica.",
    actionTypes: ["riuso", "coordinamento"],
    measures: [
      "Evitare il macero dei testi ancora utilizzabili.",
      "Organizzare la raccolta e la distribuzione gratuita ai docenti impegnati nell’inclusione.",
      "Definire un protocollo locale con gli attori interessati.",
      "Candidare Lamezia come area pilota di sperimentazione.",
    ],
    expectedOutcome: "Ampliare la disponibilità di materiali didattici per l’inclusione riducendo gli sprechi.",
  },
  "ex-cinema-grandinetti-bonifica-2026": {
    proposalId: "ex-cinema-grandinetti-bonifica-2026",
    version: "1.0",
    title: "Messa in sicurezza e recupero dell’ex Cinema Grandinetti",
    request:
      "Ripulire e mettere in sicurezza l’area dell’ex Cinema Grandinetti, mantenendo trasparente l’avanzamento del progetto di recupero.",
    actionTypes: ["manutenzione", "messa_in_sicurezza", "trasparenza", "valorizzazione"],
    measures: [
      "Pulire l’area e rimuovere la vegetazione invasiva.",
      "Valutare derattizzazione e disinfestazione quando necessarie.",
      "Mettere in sicurezza immobile e pertinenze.",
      "Prevenire occupazioni abusive e vandalismi.",
      "Aggiornare il Consiglio sul progetto di riqualificazione finanziato.",
    ],
    expectedOutcome: "Ridurre degrado e rischi nell’attesa della riqualificazione dell’immobile.",
  },
  "cinghiali-centro-misure-sicurezza-2026": {
    proposalId: "cinghiali-centro-misure-sicurezza-2026",
    version: "1.0",
    title: "Contenimento dei cinghiali nelle aree urbane",
    request:
      "Attivare misure coordinate per contenere la presenza dei cinghiali nelle aree urbane e ridurre i rischi per persone e traffico.",
    actionTypes: ["prevenzione_rischio", "coordinamento"],
    measures: [
      "Definire con gli enti competenti le azioni di contenimento applicabili.",
      "Adottare misure per la sicurezza di residenti, pedoni e automobilisti.",
    ],
    expectedOutcome: "Ridurre la probabilità di incidenti e situazioni di pericolo in ambito urbano.",
  },
  "ginepri-marinella-sicurezza-valorizzazione-2026": {
    proposalId: "ginepri-marinella-sicurezza-valorizzazione-2026",
    version: "1.0",
    title: "Sicurezza e valorizzazione di Ginepri-Marinella",
    request:
      "Verificare e migliorare sicurezza, manutenzione e valorizzazione della pineta, del lungomare e dell’arenile di Ginepri-Marinella.",
    actionTypes: ["messa_in_sicurezza", "manutenzione", "valorizzazione"],
    measures: [
      "Verificare le condizioni di sicurezza della pineta e degli spazi costieri.",
      "Rafforzare manutenzione e cura del lungomare e dell’arenile.",
      "Definire interventi di valorizzazione dell’area.",
    ],
    expectedOutcome: "Migliorare fruibilità, sicurezza e qualità dello spazio pubblico costiero.",
  },
  "passerella-marinella-gizzeria-2026": {
    proposalId: "passerella-marinella-gizzeria-2026",
    version: "1.0",
    title: "Completamento del collegamento ciclopedonale Marinella–Gizzeria",
    request:
      "Completare gli adempimenti necessari alla nuova passerella ciclopedonale e rendere più sicuri i collegamenti esistenti nell’attesa dell’opera.",
    actionTypes: ["infrastruttura", "messa_in_sicurezza", "manutenzione", "trasparenza"],
    measures: [
      "Chiarire gli adempimenti ancora a carico del Comune e i relativi tempi.",
      "Approvare rapidamente gli atti di competenza se non vi sono ulteriori ostacoli.",
      "Pulire e ripristinare i percorsi esistenti, compresa via Antonio Cappelli.",
      "Verificare la possibile riapertura in sicurezza del vecchio ponte pedonale come soluzione temporanea.",
    ],
    expectedOutcome: "Garantire un collegamento ciclopedonale continuo e sicuro tra Marinella e Gizzeria Lido.",
  },
  "emodinamica-h24-giovanni-paolo-ii-2026": {
    proposalId: "emodinamica-h24-giovanni-paolo-ii-2026",
    version: "1.0",
    title: "Emodinamica H24 strutturale al Giovanni Paolo II",
    request:
      "Garantire al Presidio Giovanni Paolo II un servizio di emodinamica strutturale e permanente operativo 24 ore su 24.",
    actionTypes: ["attivazione_servizio", "rafforzamento_servizio", "organizzazione"],
    measures: [
      "Attivare un servizio H24 e 7 giorni su 7.",
      "Integrare pienamente il presidio nella Rete STEMI e nella rete per le sindromi coronariche acute.",
      "Dare priorità al reclutamento di specialisti.",
      "Garantire risorse tecnologiche adeguate.",
    ],
    expectedOutcome: "Assicurare una risposta continuativa alle emergenze cardiologiche acute.",
  },
  "convocazioni-ordini-giorno-digitali": {
    proposalId: "convocazioni-ordini-giorno-digitali",
    version: "1.0",
    title: "Pubblicazione digitale di convocazioni e ordini del giorno",
    request:
      "Rendere convocazioni, ordini del giorno e aggiornamenti delle sedute pubbliche facilmente accessibili online.",
    actionTypes: ["trasparenza", "partecipazione_digitale"],
    measures: [
      "Pubblicare convocazioni e ordini del giorno in formato facilmente consultabile.",
      "Aggiornare tempestivamente variazioni e integrazioni delle sedute.",
    ],
    expectedOutcome: "Facilitare l’accesso dei cittadini alla programmazione delle sedute pubbliche.",
  },
  "streaming-archivio-sedute-pubbliche": {
    proposalId: "streaming-archivio-sedute-pubbliche",
    version: "1.0",
    title: "Streaming e archivio digitale delle sedute pubbliche",
    request:
      "Consentire la visione a distanza delle sedute pubbliche e conservarne un archivio digitale consultabile nel tempo.",
    actionTypes: ["trasparenza", "partecipazione_digitale"],
    measures: [
      "Trasmettere in diretta le sedute pubbliche.",
      "Conservare registrazioni e metadati in un archivio digitale ricercabile.",
    ],
    expectedOutcome: "Ampliare accessibilità e memoria pubblica delle attività consiliari.",
  },
  "resoconto-integrale-sedute-consiliari": {
    proposalId: "resoconto-integrale-sedute-consiliari",
    version: "1.0",
    title: "Resoconto integrale delle sedute consiliari",
    request:
      "Pubblicare resoconti integrali o stenografici delle sedute consiliari in formato facilmente consultabile.",
    actionTypes: ["trasparenza"],
    measures: [
      "Produrre un resoconto integrale o stenografico per ciascuna seduta.",
      "Rendere i resoconti ricercabili e collegati alla relativa seduta e all’ordine del giorno.",
    ],
    expectedOutcome: "Rafforzare controllo civico, accessibilità e memoria documentale delle sedute.",
  },
  "firma-digitale-iniziative-petizioni": {
    proposalId: "firma-digitale-iniziative-petizioni",
    version: "1.0",
    title: "Sottoscrizione digitale di iniziative, istanze e petizioni",
    request:
      "Consentire la sottoscrizione digitale di iniziative popolari, istanze e petizioni rivolte al Comune.",
    actionTypes: ["partecipazione_digitale", "organizzazione"],
    measures: [
      "Definire uno strumento digitale per la sottoscrizione delle iniziative civiche ammesse.",
      "Integrare requisiti di identificazione, validità, privacy e tracciabilità nel processo.",
    ],
    expectedOutcome: "Ridurre le barriere operative alla partecipazione civica formale.",
  },
  "emodinamica-h24-vescio-2026": {
    proposalId: "emodinamica-h24-vescio-2026",
    version: "1.0",
    title: "Emodinamica H24 e personale stabile al Giovanni Paolo II",
    request:
      "Attivare un servizio di emodinamica H24 con personale stabile e rendere trasparenti i criteri della programmazione cardiologica regionale.",
    actionTypes: ["attivazione_servizio", "rafforzamento_servizio", "trasparenza"],
    measures: [
      "Garantire operatività H24 anche per le emergenze.",
      "Superare il ricorso strutturale a équipe itineranti.",
      "Rafforzare il presidio con personale stabile.",
      "Pubblicare dati e criteri alla base della scelta organizzativa H6/H12.",
    ],
    expectedOutcome: "Assicurare continuità dell’assistenza cardiologica e maggiore trasparenza della programmazione.",
  },
  "emodinamica-h24-nucifero-2026": {
    proposalId: "emodinamica-h24-nucifero-2026",
    version: "1.0",
    title: "Emodinamica H24 e rafforzamento del Giovanni Paolo II",
    request:
      "Istituire un servizio di emodinamica H24 non itinerante e rafforzare in modo strutturale il presidio ospedaliero.",
    actionTypes: ["attivazione_servizio", "rafforzamento_servizio", "infrastruttura"],
    measures: [
      "Attivare un servizio di emodinamica H24 strutturale.",
      "Escludere una soluzione organizzativa basata stabilmente su équipe itineranti.",
      "Investire in personale, infrastrutture, diagnostica e pronto soccorso.",
    ],
    expectedOutcome: "Rafforzare la capacità stabile del presidio di rispondere ai bisogni sanitari del territorio.",
  },
  "scuole-orario-ridotto-caldo-settembre-2026": {
    proposalId: "scuole-orario-ridotto-caldo-settembre-2026",
    version: "1.0",
    title: "Orario scolastico ridotto a settembre",
    request:
      "Ridurre temporaneamente l’orario giornaliero delle scuole cittadine durante settembre in presenza di temperature elevate.",
    actionTypes: ["organizzazione", "prevenzione_rischio"],
    measures: [
      "Applicare un orario ridotto per il mese di settembre.",
      "Considerare in particolare gli edifici privi di adeguata climatizzazione o ventilazione.",
    ],
    expectedOutcome: "Ridurre l’esposizione di studenti e personale a condizioni termiche sfavorevoli.",
  },
  "tutela-animali-regolamento-garante-sportello-2026": {
    proposalId: "tutela-animali-regolamento-garante-sportello-2026",
    version: "1.0",
    title: "Regole e servizi comunali per la tutela degli animali",
    request:
      "Aggiornare il quadro comunale per la tutela degli animali e attivare strumenti permanenti di ascolto, garanzia e gestione delle emergenze.",
    actionTypes: ["regolazione", "attivazione_servizio", "coordinamento"],
    measures: [
      "Aggiornare il regolamento comunale alla normativa regionale.",
      "Promuovere attività didattiche e culturali sul benessere animale.",
      "Attivare uno sportello di ascolto.",
      "Istituire un garante per i diritti degli animali.",
      "Formalizzare una rete di contatti per le emergenze.",
    ],
    expectedOutcome: "Rendere più stabile, accessibile e coordinata la tutela degli animali sul territorio comunale.",
  },
  "scuole-posticipo-apertura-petizione-2026": {
    proposalId: "scuole-posticipo-apertura-petizione-2026",
    version: "1.0",
    title: "Posticipo di dieci giorni dell’avvio delle lezioni",
    request:
      "Rinviare di dieci giorni l’avvio delle lezioni e aprire un confronto sulle esigenze organizzative di famiglie e studenti.",
    actionTypes: ["organizzazione"],
    measures: [
      "Posticipare di dieci giorni la data di avvio delle lezioni.",
      "Trasmettere la richiesta alle istituzioni regionali competenti.",
      "Aprire un confronto sulle esigenze organizzative connesse all’avvio dell’anno scolastico.",
    ],
    expectedOutcome: "Modificare temporaneamente il calendario di avvio dell’anno scolastico.",
  },
  "ospedale-organici-continuita-chirurgica-pd-2026": {
    proposalId: "ospedale-organici-continuita-chirurgica-pd-2026",
    version: "1.0",
    title: "Organici e continuità chirurgica al Giovanni Paolo II",
    request:
      "Ripristinare la continuità delle attività chirurgiche e rafforzare stabilmente personale e capacità dei reparti interessati.",
    actionTypes: ["rafforzamento_servizio", "organizzazione", "coordinamento"],
    measures: [
      "Attivare soluzioni organizzative temporanee per garantire le sedute chirurgiche.",
      "Effettuare una ricognizione formale dei fabbisogni di personale.",
      "Rafforzare stabilmente gli organici di Urologia, Ortopedia e Oncologia.",
      "Adeguare i posti letto alle esigenze assistenziali.",
      "Rafforzare l’interlocuzione con ASP e Regione e convocare la Conferenza dei Sindaci.",
    ],
    expectedOutcome: "Ridurre le interruzioni delle attività chirurgiche e stabilizzare la capacità assistenziale del presidio.",
  },
  "prevenzione-maltempo-manutenzione-de-sensi-2026": {
    proposalId: "prevenzione-maltempo-manutenzione-de-sensi-2026",
    version: "1.0",
    title: "Manutenzione preventiva prima della stagione piovosa",
    request:
      "Avviare prima dell’autunno un programma ordinario e calendarizzato di manutenzione preventiva del territorio comunale.",
    actionTypes: ["manutenzione", "prevenzione_rischio", "organizzazione"],
    measures: [
      "Pulire e video-ispezionare caditoie e tombini nei punti critici.",
      "Potare le alberature che interferiscono con sicurezza e viabilità.",
      "Pulire canali di scolo, fossi e reticolo minore.",
      "Verificare muretti, scarpate e segnaletica.",
      "Calendarizzare lo spazzamento delle foglie a partire da settembre.",
    ],
    expectedOutcome: "Ridurre vulnerabilità e disservizi connessi alle piogge autunnali.",
  },
  "aeroporto-intermodalita-rilancio-taverna-2026": {
    proposalId: "aeroporto-intermodalita-rilancio-taverna-2026",
    version: "1.0",
    title: "Intermodalità e accessibilità dell’aeroporto di Lamezia",
    request:
      "Rafforzare il ruolo dello scalo di Lamezia attraverso connessioni ferroviarie, servizi di terra e una maggiore integrazione con il territorio regionale.",
    actionTypes: ["infrastruttura", "rafforzamento_servizio", "coordinamento", "valorizzazione"],
    measures: [
      "Rafforzare l’intermodalità ferro-aria e il collegamento con l’Alta Velocità.",
      "Potenziare i servizi di terra dello scalo.",
      "Coinvolgere maggiormente Comuni e territori nelle scelte strategiche di SACAL.",
      "Migliorare i collegamenti tra aeroporto, borghi, strutture ricettive e destinazioni culturali ed enogastronomiche.",
    ],
    expectedOutcome: "Migliorare accessibilità dello scalo e integrazione dell’aeroporto con la mobilità e l’offerta territoriale.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  const canonical = CANONICAL_PROPOSAL_PRESENTATIONS[proposal.id];
  if (!canonical) {
    throw new Error(`Missing canonical proposal presentation for ${proposal.id}`);
  }
  return canonical;
}

export function hasCanonicalProposalPresentation(proposalId: string) {
  return Boolean(CANONICAL_PROPOSAL_PRESENTATIONS[proposalId]);
}

export function getCanonicalProposalPresentationIds() {
  return Object.keys(CANONICAL_PROPOSAL_PRESENTATIONS).sort();
}
