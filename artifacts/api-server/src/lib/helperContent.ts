// =============================================================================
// Helper Cittadinanza Civica — Modello contenuti
// =============================================================================
//
// Fonte unica versionata che alimenta l'helper "Cittadinanza Civica" su web e
// mobile. Struttura in due parti:
//   1. storyChapters — capitoli della storia/identità del progetto
//   2. sections      — schede funzionalità con tour step per ogni sezione del sito
//
// CONVENZIONE DI ESTENSIONE:
//   Ogni volta che si aggiunge una nuova sezione o funzionalità al sito,
//   aggiungere una voce nell'array `sections` qui sotto. Questo è l'unico
//   punto da aggiornare: il tour guidato, l'assistente AI e il "centro guida"
//   su web e mobile leggeranno automaticamente il nuovo contenuto.
//
//   Schema minimo per una nuova voce:
//   {
//     id:          stringa kebab-case univoca            (es. "nuova-sezione")
//     title:       nome visibile nell'helper             (es. "Nuova Sezione")
//     description: cosa il cittadino può fare in 1-2 frasi
//     route:       percorso relativo nel sito web        (es. "/nuova-sezione")
//     tourSteps:   passi del tour guidato (può essere vuoto [])
//   }
// =============================================================================

export type TourStep = {
  /** Identificatore CSS/testuale dell'elemento target nel DOM (usato dal tour). */
  target: string;
  /** Testo descrittivo mostrato al cittadino nel tooltip del tour. */
  text: string;
  /** Ordine del passo (1-based). */
  order: number;
};

export type HelperSection = {
  /** Id univoco della sezione, usato come chiave stabile da web e mobile. */
  id: string;
  /** Titolo visibile nell'helper. */
  title: string;
  /** Cosa può fare il cittadino in questa sezione (1-2 frasi, tono diretto). */
  description: string;
  /** Route relativa del sito web (es. "/temi"). Usata per link e navigazione. */
  route: string;
  /** Passi del tour guidato per questa sezione. */
  tourSteps: TourStep[];
};

export type StoryChapter = {
  /** Id univoco del capitolo. */
  id: string;
  /** Titolo del capitolo. */
  title: string;
  /** Testo esteso del capitolo (Markdown-friendly). */
  body: string;
  /** Ordine di presentazione (1-based). */
  order: number;
};

export type HelperContents = {
  /** Versione del modello, incrementare quando la struttura cambia in modo incompatibile. */
  version: string;
  /** Capitoli che raccontano la storia e l'identità del progetto. */
  storyChapters: StoryChapter[];
  /** Schede funzionalità, una per sezione/area del sito. */
  sections: HelperSection[];
};

// ---------------------------------------------------------------------------
// STORIA DEL PROGETTO
// ---------------------------------------------------------------------------
const storyChapters: StoryChapter[] = [
  {
    id: "nascita",
    order: 1,
    title: "Come nasce rendiamoLameziaTrasparente",
    body: `rendiamoLameziaTrasparente è un osservatorio civico indipendente nato dalla volontà di cittadini di Lamezia Terme di rendere accessibili, comprensibili e monitorabili le informazioni pubbliche del proprio Comune.

Il progetto non è un sito istituzionale del Comune: è uno strumento **della comunità, per la comunità**. Raccoglie, organizza e presenta in modo chiaro i dati già pubblici ma spesso difficili da trovare o leggere: atti dell'Albo Pretorio, contratti pubblici, progetti PNRR, indicatori di performance, bandi, organi istituzionali e molto altro.

L'obiettivo è semplice: abbassare la barriera tra i dati pubblici e il cittadino comune, rendendo la partecipazione civica più facile e informata.`,
  },
  {
    id: "filosofia",
    order: 2,
    title: "Trasparenza come diritto, non come favore",
    body: `La trasparenza amministrativa è un diritto sancito dalla legge (D.Lgs. 33/2013 e successive modifiche). Eppure, avere accesso formale ai dati non significa poterli usare davvero.

rendiamoLameziaTrasparente parte da questa constatazione: non basta pubblicare, bisogna **rendere comprensibile**. Per questo il sito:

- aggrega automaticamente dati da fonti ufficiali (ANAC, Albo Pretorio, censimento PNRR, ISTAT)
- li organizza in temi di interesse civico
- permette ai cittadini di segnalare, commentare e monitorare
- espone tutto tramite un'API pubblica aperta a giornalisti, ricercatori e sviluppatori

La piattaforma è open source e non ha scopi commerciali.`,
  },
  {
    id: "monitoraggio-civico",
    order: 3,
    title: "Il cuore: il monitoraggio civico",
    body: `Il fulcro del progetto sono i **temi di monitoraggio civico**: aree tematiche (sanità, lavori pubblici, istruzione, legalità…) alle quali i cittadini possono iscriversi per seguire l'evoluzione della spesa pubblica, dei contratti e degli atti amministrativi del Comune.

Ogni tema raccoglie automaticamente contratti ANAC, atti dell'Albo Pretorio, progetti PNRR e indicatori di performance. I cittadini possono:

- segnalare la rilevanza di un tema ("questo mi riguarda")
- condividere un tema con la propria rete
- seguire un tema per ricevere aggiornamenti
- pubblicare segnalazioni civiche collegate a specifici contratti o progetti PNRR

Il monitoraggio civico è ispirato al modello **Monithon** e alla metodologia dei report civici aperti.`,
  },
  {
    id: "legalita-trasparenza",
    order: 4,
    title: "Legalità e trasparenza: lo sguardo sul rischio corruttivo",
    body: `La sezione **Legalità e Trasparenza** raccoglie le informazioni sul rispetto degli obblighi di trasparenza e anticorruzione del Comune: piani anticorruzione, misure adottate, obblighi di pubblicazione.

Non è una valutazione giuridica, ma uno strumento di consapevolezza civica: sapere quali obblighi esistono e se sono rispettati è il primo passo per esercitare un controllo informato.`,
  },
  {
    id: "opendata-api",
    order: 5,
    title: "Dati aperti e API pubblica: per chi vuole andare più in fondo",
    body: `rendiamoLameziaTrasparente non è solo un sito di consultazione: è anche un **nodo di dati aperti**.

Tutti i dati esposti sono disponibili:

- tramite un **catalogo Open Data** conforme allo standard DCAT-AP_IT (il catalogo nazionale dei dati pubblici)
- tramite un'**API pubblica REST** documentata con specifica OpenAPI, pensata per giornalisti, ricercatori e sviluppatori
- tramite un **server MCP** (Model Context Protocol) che permette agli assistenti AI di interrogare i dati direttamente

Chiunque può scaricare i dataset, integrarli nei propri strumenti o costruire nuove applicazioni sopra i dati del Comune.`,
  },
  {
    id: "futuro",
    order: 6,
    title: "Un progetto in continua crescita",
    body: `rendiamoLameziaTrasparente è in costante evoluzione. Nuove sezioni vengono aggiunte man mano che nuove fonti di dati pubblici diventano disponibili o che la comunità esprime nuovi bisogni di monitoraggio.

Se sei un cittadino, un giornalista, un ricercatore o uno sviluppatore e vuoi contribuire, puoi:

- usare l'API pubblica per costruire i tuoi strumenti
- segnalare dati mancanti o errori tramite la sezione Accesso Civico
- condividere i temi di monitoraggio che ti interessano

La trasparenza si costruisce insieme.`,
  },
];

// ---------------------------------------------------------------------------
// SCHEDE FUNZIONALITÀ (sezioni del sito)
// ---------------------------------------------------------------------------
// CONVENZIONE: aggiungere qui una voce per ogni nuova sezione/funzionalità.
// ---------------------------------------------------------------------------
const sections: HelperSection[] = [
  {
    id: "home",
    title: "Home — Panoramica del Comune",
    description:
      "La pagina principale offre una visione d'insieme dell'attività del Comune: ultimi atti pubblicati, contratti recenti, aggiornamenti sui temi seguiti e indicatori chiave di performance.",
    route: "/",
    tourSteps: [
      {
        target: "[data-tour='home-hero']",
        text: "Benvenuto/a su rendiamoLameziaTrasparente. Qui trovi una panoramica aggiornata dell'attività del Comune di Lamezia Terme.",
        order: 1,
      },
      {
        target: "[data-tour='home-stats']",
        text: "I numeri principali: quanti contratti pubblici, atti e progetti PNRR sono monitorati. Un colpo d'occhio sulla dimensione della spesa pubblica locale.",
        order: 2,
      },
      {
        target: "[data-tour='home-themes']",
        text: "I temi di monitoraggio civico più attivi. Cliccane uno per seguire come il Comune spende in quell'area.",
        order: 3,
      },
    ],
  },
  {
    id: "domande",
    title: "Domande Civiche",
    description:
      "Fai domande pubbliche al Comune e segui le risposte. Le domande dei cittadini e le risposte dell'amministrazione sono visibili a tutti per favorire la trasparenza.",
    route: "/domande",
    tourSteps: [
      {
        target: "[data-tour='questions-list']",
        text: "Qui trovi le domande pubbliche poste dai cittadini al Comune, con le risposte ufficiali quando disponibili.",
        order: 1,
      },
      {
        target: "[data-tour='questions-new']",
        text: "Puoi porre una nuova domanda pubblica. Sarà visibile a tutti i cittadini e all'amministrazione.",
        order: 2,
      },
    ],
  },
  {
    id: "temi",
    title: "Temi di Monitoraggio Civico",
    description:
      "Esplora le aree tematiche (lavori pubblici, sanità, istruzione, sicurezza…) e segui quelle che ti interessano. Ogni tema raccoglie automaticamente contratti, atti e progetti PNRR collegati.",
    route: "/temi",
    tourSteps: [
      {
        target: "[data-tour='themes-list']",
        text: "I temi di monitoraggio sono le aree di interesse civico: ogni tema raccoglie contratti, atti e dati PNRR del Comune in quell'area.",
        order: 1,
      },
      {
        target: "[data-tour='themes-filter']",
        text: "Filtra i temi per categoria o cerca per parola chiave per trovare quelli che ti interessano.",
        order: 2,
      },
      {
        target: "[data-tour='theme-follow']",
        text: "Segui un tema per ricevere notifiche sugli aggiornamenti. Puoi anche segnalare la sua rilevanza o condividerlo.",
        order: 3,
      },
    ],
  },
  {
    id: "contratti",
    title: "Appalti e Contratti Pubblici",
    description:
      "Consulta i contratti pubblici del Comune aggiornati dall'ANAC. Cerca per fornitore, importo, tipo di procedura o area tematica. Ogni contratto mostra il CIG, l'importo aggiudicato e la procedura usata.",
    route: "/contratti",
    tourSteps: [
      {
        target: "[data-tour='contracts-search']",
        text: "Cerca tra i contratti pubblici del Comune: puoi filtrare per parola chiave, fornitore, periodo o importo.",
        order: 1,
      },
      {
        target: "[data-tour='contracts-list']",
        text: "Ogni contratto mostra il CIG (codice identificativo gara), l'importo, il fornitore e il tipo di procedura usata.",
        order: 2,
      },
      {
        target: "[data-tour='contract-detail']",
        text: "Clicca su un contratto per vedere tutti i dettagli, il collegamento ai temi di monitoraggio e la posizione geografica.",
        order: 3,
      },
    ],
  },
  {
    id: "albo",
    title: "Albo Pretorio",
    description:
      "Sfoglia gli atti ufficiali pubblicati sull'Albo Pretorio: delibere, determine, ordinanze, convocazioni. Puoi leggere il testo completo degli atti che hanno l'allegato PDF analizzato.",
    route: "/albo",
    tourSteps: [
      {
        target: "[data-tour='albo-list']",
        text: "L'Albo Pretorio raccoglie tutti gli atti ufficiali pubblicati dal Comune: delibere del Consiglio, determine dirigenziali, ordinanze e avvisi.",
        order: 1,
      },
      {
        target: "[data-tour='albo-filter']",
        text: "Filtra per tipologia di atto, periodo o parola chiave nell'oggetto.",
        order: 2,
      },
      {
        target: "[data-tour='albo-markdown']",
        text: "Gli atti con l'icona del documento hanno il testo completo estratto dall'allegato PDF, leggibile direttamente nel sito.",
        order: 3,
      },
    ],
  },
  {
    id: "pnrr",
    title: "Progetti PNRR",
    description:
      "Monitora i progetti del Piano Nazionale di Ripresa e Resilienza che riguardano Lamezia Terme: fondi assegnati, stato di avanzamento, missioni e investimenti.",
    route: "/pnrr",
    tourSteps: [
      {
        target: "[data-tour='pnrr-stats']",
        text: "Il totale dei fondi PNRR assegnati al Comune e la distribuzione per missione.",
        order: 1,
      },
      {
        target: "[data-tour='pnrr-list']",
        text: "L'elenco dei progetti PNRR aggiornato dal censimento nazionale. Cerca per titolo, CUP o missione.",
        order: 2,
      },
      {
        target: "[data-tour='pnrr-detail']",
        text: "Ogni progetto mostra importo finanziato, soggetto attuatore, stato e le segnalazioni civiche dei cittadini.",
        order: 3,
      },
    ],
  },
  {
    id: "organi",
    title: "Organi Istituzionali e Amministratori",
    description:
      "Scopri chi governa Lamezia Terme: composizione del Consiglio Comunale, della Giunta, delle commissioni. Leggi i verbali delle sedute e come ha votato ogni consigliere.",
    route: "/organi",
    tourSteps: [
      {
        target: "[data-tour='organi-list']",
        text: "Gli organi istituzionali del Comune: Consiglio Comunale, Giunta, commissioni e altri organismi.",
        order: 1,
      },
      {
        target: "[data-tour='organi-members']",
        text: "Clicca su un organo per vedere i membri, le cariche e le sedute registrate.",
        order: 2,
      },
    ],
  },
  {
    id: "monitoraggio",
    title: "Monitoraggio Civico (Segnalazioni)",
    description:
      "Pubblica segnalazioni civiche collegate a contratti o progetti PNRR specifici. Le segnalazioni seguono le tre fasi del monitoraggio civico: avvio, svolgimento, completamento.",
    route: "/monitoraggio",
    tourSteps: [
      {
        target: "[data-tour='monitoring-intro']",
        text: "Il monitoraggio civico ti permette di segnalare cosa succede sul campo: un cantiere avviato, uno ritardato, un'opera completata o abbandonata.",
        order: 1,
      },
      {
        target: "[data-tour='monitoring-new']",
        text: "Puoi creare una segnalazione collegandola a un contratto (tramite CIG) o a un progetto PNRR (tramite CUP). La segnalazione passerà per revisione prima di essere pubblicata.",
        order: 2,
      },
      {
        target: "[data-tour='monitoring-phases']",
        text: "Ogni segnalazione ha una fase: Avvio (il progetto è iniziato?), Svolgimento (come procede?), Completamento (è finito come previsto?).",
        order: 3,
      },
    ],
  },
  {
    id: "legalita",
    title: "Legalità e Trasparenza",
    description:
      "Verifica il rispetto degli obblighi di trasparenza e anticorruzione del Comune: piani anticorruzione, misure adottate, obblighi di pubblicazione e loro stato di adempimento.",
    route: "/legalita",
    tourSteps: [
      {
        target: "[data-tour='legality-overview']",
        text: "Una panoramica degli obblighi di trasparenza e anticorruzione del Comune e del loro stato di adempimento.",
        order: 1,
      },
      {
        target: "[data-tour='legality-areas']",
        text: "Gli obblighi sono organizzati per aree tematiche. Clicca su un'area per vedere i requisiti specifici.",
        order: 2,
      },
    ],
  },
  {
    id: "performance",
    title: "Indicatori di Performance",
    description:
      "Consulta gli indicatori di benessere e di efficienza del Comune aggiornati con dati ISTAT e fonti ufficiali: economia, ambiente, servizi, sicurezza, istruzione.",
    route: "/performance",
    tourSteps: [
      {
        target: "[data-tour='performance-categories']",
        text: "Gli indicatori di performance sono organizzati per categoria: economia locale, ambiente, servizi al cittadino, sicurezza, istruzione.",
        order: 1,
      },
      {
        target: "[data-tour='performance-indicator']",
        text: "Ogni indicatore mostra il valore più recente, il valore precedente e il trend. I dati vengono aggiornati automaticamente dalle fonti ufficiali.",
        order: 2,
      },
    ],
  },
  {
    id: "opendata",
    title: "Open Data",
    description:
      "Scarica i dataset del Comune in formato aperto (CSV, JSON). Il catalogo è conforme allo standard DCAT-AP_IT ed è indicizzato nel portale nazionale dei dati aperti.",
    route: "/opendata",
    tourSteps: [
      {
        target: "[data-tour='opendata-catalog']",
        text: "Il catalogo dei dataset aperti del Comune, organizzato per tema. Ogni dataset è scaricabile in formato CSV o JSON.",
        order: 1,
      },
      {
        target: "[data-tour='opendata-preview']",
        text: "Clicca su un dataset per vedere un'anteprima dei dati, i metadati e i link per il download.",
        order: 2,
      },
    ],
  },
  {
    id: "bandi",
    title: "Bandi e Finanziamenti",
    description:
      "Esplora i bandi di finanziamento pubblici (regionali, nazionali, europei) rilevanti per Lamezia Terme e verifica se il Comune ha partecipato o vinto.",
    route: "/bandi",
    tourSteps: [
      {
        target: "[data-tour='bandi-list']",
        text: "I bandi di finanziamento pubblici rilevanti per il territorio: fondi europei, nazionali e regionali.",
        order: 1,
      },
      {
        target: "[data-tour='bandi-match']",
        text: "Per ogni bando puoi vedere se il Comune ha presentato domanda o ha ottenuto il finanziamento, incrociando i dati con contratti e atti.",
        order: 2,
      },
    ],
  },
  {
    id: "beni-confiscati",
    title: "Beni Confiscati alla Criminalità",
    description:
      "Consulta il censimento dei beni confiscati alla criminalità organizzata presenti sul territorio di Lamezia Terme, con dati aggiornati dall'ANBSC.",
    route: "/beni-confiscati",
    tourSteps: [
      {
        target: "[data-tour='beni-list']",
        text: "I beni confiscati alla criminalità organizzata nel territorio di Lamezia Terme, aggiornati dal database ANBSC.",
        order: 1,
      },
      {
        target: "[data-tour='beni-detail']",
        text: "Ogni bene mostra tipo, indirizzo, destinazione d'uso e lo stato di gestione.",
        order: 2,
      },
    ],
  },
  {
    id: "api-pubblica",
    title: "API Pubblica e Open Data per Sviluppatori",
    description:
      "Accedi a tutti i dati della piattaforma tramite API REST documentata (OpenAPI) o tramite il server MCP per assistenti AI. Pensata per giornalisti, ricercatori e sviluppatori.",
    route: "/sviluppatori",
    tourSteps: [
      {
        target: "[data-tour='api-intro']",
        text: "L'API pubblica permette di interrogare tutti i dati del sito in modo programmatico: contratti, atti, temi, performance, PNRR.",
        order: 1,
      },
      {
        target: "[data-tour='api-docs']",
        text: "La documentazione interattiva (OpenAPI) mostra tutti gli endpoint disponibili e permette di testarli direttamente dal browser.",
        order: 2,
      },
    ],
  },
  {
    id: "accesso-civico",
    title: "Accesso Civico",
    description:
      "Invia richieste di accesso civico generalizzato (FOIA) al Comune per ottenere documenti e informazioni non ancora pubblicati. Monitora lo stato della tua richiesta.",
    route: "/accesso-civico",
    tourSteps: [
      {
        target: "[data-tour='accesso-civico-intro']",
        text: "L'accesso civico generalizzato (FOIA) ti permette di richiedere al Comune qualsiasi documento o informazione in suo possesso.",
        order: 1,
      },
      {
        target: "[data-tour='accesso-civico-new']",
        text: "Compila il modulo per inviare una richiesta. Puoi seguire l'iter e ricevere aggiornamenti sullo stato.",
        order: 2,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// EXPORT principale
// ---------------------------------------------------------------------------
export const helperContents: HelperContents = {
  version: "1.0.0",
  storyChapters,
  sections,
};

/**
 * Restituisce un testo di contesto compatto che l'assistente AI può usare
 * come base di conoscenza. Include la descrizione di ogni sezione e i
 * capitoli della storia del progetto.
 */
export function buildAssistantContext(): string {
  const sectionsText = sections
    .map(
      (s) =>
        `### ${s.title} (route: ${s.route})\n${s.description}`,
    )
    .join("\n\n");

  const storyText = storyChapters
    .map((c) => `### ${c.title}\n${c.body}`)
    .join("\n\n");

  return `## Identità del progetto\n\n${storyText}\n\n## Sezioni del sito\n\n${sectionsText}`;
}
