export const PROPOSAL_PROMOTER_TYPES = [
  "cittadino_comitato",
  "associazione",
  "categoria",
  "forza_politica",
  "consigliere",
  "amministrazione",
  "altro",
] as const;

export type ProposalPromoterType = (typeof PROPOSAL_PROMOTER_TYPES)[number];

export const PROPOSAL_CHANNELS = [
  "iniziativa_popolare",
  "petizione",
  "conferenza_stampa",
  "comunicato",
  "mozione",
  "interrogazione",
  "delibera_proposta",
  "assemblea_pubblica",
  "altro",
] as const;

export type ProposalChannel = (typeof PROPOSAL_CHANNELS)[number];

export const PROPOSAL_STATUSES = [
  "proposta_emersa",
  "presentata_formalmente",
  "discussa",
  "recepita_parzialmente",
  "recepita_integralmente",
  "respinta",
  "senza_seguito_noto",
  "non_verificabile",
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const PROPOSAL_EVIDENCE_LEVELS = [
  "fonte_ufficiale",
  "fonte_stampa",
  "fonte_social_verificabile",
  "ricostruzione_multi_fonte",
  "fonte_interna_documentale",
] as const;

export type ProposalEvidenceLevel = (typeof PROPOSAL_EVIDENCE_LEVELS)[number];

export const PROPOSAL_EVENT_TYPES = [
  "emersione",
  "deposito",
  "petizione",
  "calendarizzazione",
  "discussione",
  "risposta_istituzionale",
  "recepimento",
  "aggiornamento",
] as const;

export type ProposalEventType = (typeof PROPOSAL_EVENT_TYPES)[number];

export type ProposalEvent = {
  id: string;
  date: string;
  type: ProposalEventType;
  title: string;
  summary: string;
  sourceLabel: string;
  sourceUrl?: string;
  evidenceLevel: ProposalEvidenceLevel;
};

export type PublicProposal = {
  id: string;
  title: string;
  summary: string;
  promoterId: string;
  promoter: string;
  promoterType: ProposalPromoterType;
  coPromoters?: readonly string[];
  periodLabel: string;
  year: string;
  theme: string;
  threadId: string;
  threadLabel: string;
  territorialArea?: string;
  institutionalRecipient?: string;
  channel: ProposalChannel;
  sourceLabel: string;
  sourceUrl?: string;
  status: ProposalStatus;
  linkedActs: readonly string[];
  verificationNote: string;
  evidenceLevel: ProposalEvidenceLevel;
  firstSeen: string;
  lastUpdated: string;
  events: readonly ProposalEvent[];
};

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  proposta_emersa: "Proposta emersa",
  presentata_formalmente: "Presentata formalmente",
  discussa: "Discussa",
  recepita_parzialmente: "Recepita parzialmente",
  recepita_integralmente: "Recepita integralmente",
  respinta: "Respinta",
  senza_seguito_noto: "Senza seguito noto",
  non_verificabile: "Non verificabile",
};

export const PROPOSAL_CHANNEL_LABELS: Record<ProposalChannel, string> = {
  iniziativa_popolare: "Iniziativa popolare",
  petizione: "Petizione",
  conferenza_stampa: "Conferenza stampa",
  comunicato: "Comunicato",
  mozione: "Mozione",
  interrogazione: "Interrogazione",
  delibera_proposta: "Delibera proposta",
  assemblea_pubblica: "Assemblea pubblica",
  altro: "Altro",
};

export const PROPOSAL_PROMOTER_TYPE_LABELS: Record<
  ProposalPromoterType,
  string
> = {
  cittadino_comitato: "Cittadino/comitato",
  associazione: "Associazione",
  categoria: "Categoria",
  forza_politica: "Forza politica",
  consigliere: "Consigliere",
  amministrazione: "Amministrazione",
  altro: "Altro",
};

export const PROPOSAL_EVIDENCE_LABELS: Record<
  ProposalEvidenceLevel,
  string
> = {
  fonte_ufficiale: "Fonte ufficiale",
  fonte_stampa: "Fonte stampa",
  fonte_social_verificabile: "Fonte social verificabile",
  ricostruzione_multi_fonte: "Ricostruzione da più fonti",
  fonte_interna_documentale: "Fonte interna/documentale",
};

export const PROPOSAL_EVENT_LABELS: Record<ProposalEventType, string> = {
  emersione: "Proposta emersa",
  deposito: "Deposito / presentazione",
  petizione: "Petizione",
  calendarizzazione: "Calendarizzazione istituzionale",
  discussione: "Discussione",
  risposta_istituzionale: "Risposta istituzionale",
  recepimento: "Recepimento",
  aggiornamento: "Aggiornamento",
};

export const PUBLIC_PROPOSALS = [
  {
    id: "piazza-italia-sicurezza-prevenzione-2026",
    title: "Strategia di prevenzione e controlli coordinati per Piazza Italia",
    summary:
      "Richiesta di una strategia stabile per sicurezza, decoro e vivibilità nell'area di Piazza Italia, con controlli coordinati, potenziamento della videosorveglianza, eventuali ordinanze comunali, coordinamento con la Prefettura e coinvolgimento dei servizi sociali nei casi di vulnerabilità.",
    promoterId: "i-liberali-lamezia-terme",
    promoter: "I Liberali Lamezia Terme",
    promoterType: "forza_politica",
    periodLabel: "27 agosto 2026",
    year: "2026",
    theme: "Sicurezza e decoro urbano",
    threadId: "piazza-italia-sicurezza-vivibilita",
    threadLabel: "Piazza Italia: sicurezza, prevenzione e vivibilità",
    territorialArea: "Piazza Italia e aree circostanti, Sant'Eufemia Lamezia",
    institutionalRecipient: "Comune di Lamezia Terme e autorità competenti",
    channel: "comunicato",
    sourceLabel: "City One, 27 agosto 2026",
    sourceUrl:
      "https://www.cityonelamezia.it/santeufemia-lamezia-il-problema-dei-continui-bivacchi-e-delle-condizioni-di-degrado/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "City One pubblica integralmente la nota attribuita a I Liberali Lamezia Terme; il Lametino ne riprende nello stesso giorno le misure principali. La proposta è censita perché contiene richieste operative specifiche. Non sono stati verificati un deposito formale, un'ordinanza adottata, l'attivazione di un tavolo prefettizio o una risposta istituzionale. Le ripubblicazioni dello stesso comunicato non sono trattate come eventi distinti.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-08-27",
    lastUpdated: "2026-08-27",
    events: [
      {
        id: "piazza-italia-liberali-richiesta-prevenzione",
        date: "2026-08-27",
        type: "emersione",
        title: "I Liberali chiedono controlli coordinati e una strategia di prevenzione",
        summary:
          "Il movimento chiede controlli più frequenti e coordinati, potenziamento della videosorveglianza, eventuali ordinanze comunali, possibile apertura di un tavolo permanente in Prefettura e coinvolgimento dei servizi sociali quando emergano situazioni di vulnerabilità.",
        sourceLabel: "City One",
        sourceUrl:
          "https://www.cityonelamezia.it/santeufemia-lamezia-il-problema-dei-continui-bivacchi-e-delle-condizioni-di-degrado/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "fontana-piazza-mercato-vecchio-manutenzione-2026",
    title: "Ripristino e manutenzione della fontana di Piazza Mercato Vecchio",
    summary:
      "Richiesta di intervento sulla fontana ornamentale di Piazza Mercato Vecchio per eliminare acqua stagnante, alghe e rifiuti, ripristinare condizioni di pulizia e decoro e intervenire rispetto ai comportamenti che contribuiscono al degrado.",
    promoterId: "lamezia-maltrattata-cittadini-giovani-assin",
    promoter:
      "Lamezia Maltrattata, Comitato Cittadini Giovani Lametini e Ass.IN Lamezia",
    promoterType: "cittadino_comitato",
    periodLabel: "27 agosto 2026",
    year: "2026",
    theme: "Decoro urbano e manutenzione",
    threadId: "piazza-mercato-vecchio-decoro",
    threadLabel: "Piazza Mercato Vecchio: manutenzione e decoro",
    territorialArea: "Piazza Mercato Vecchio, Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme",
    channel: "comunicato",
    sourceLabel: "LameziaTerme.it, 27 agosto 2026",
    sourceUrl:
      "https://www.lameziaterme.it/lamezia-fontana-piazza-mercato-vecchio-una-palude/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La fonte attribuisce congiuntamente la richiesta a Lamezia Maltrattata, Comitato Cittadini Giovani Lametini e Ass.IN Lamezia. È censita come proposta civica perché formula una richiesta operativa di manutenzione e ripristino; non è stato verificato un deposito formale, una petizione protocollata o una risposta del Comune.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-08-27",
    lastUpdated: "2026-08-27",
    events: [
      {
        id: "fontana-mercato-vecchio-richiesta-intervento",
        date: "2026-08-27",
        type: "emersione",
        title: "I comitati chiedono manutenzione e ripristino della fontana",
        summary:
          "I tre soggetti firmatari chiedono che la fontana torni in condizioni decorose e igieniche, indicando come interventi necessari lo svuotamento e la pulizia delle vasche e un'azione rispetto ai comportamenti che alimentano il degrado.",
        sourceLabel: "LameziaTerme.it",
        sourceUrl:
          "https://www.lameziaterme.it/lamezia-fontana-piazza-mercato-vecchio-una-palude/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "asili-nido-continuita-servizio-2026",
    title: "Avvio urgente e misure di continuità per gli asili nido comunali",
    summary:
      "Richiesta di trasparenza sulla procedura, attivazione urgente del servizio e misure di continuità per evitare vuoti nell'assistenza dei tre asili nido comunali; il 28 agosto la richiesta è confluita in un'interrogazione consiliare urgente a risposta scritta.",
    promoterId: "gennarino-masi",
    promoter: "Gennarino Masi (PD)",
    promoterType: "consigliere",
    periodLabel: "26–28 agosto 2026",
    year: "2026",
    theme: "Welfare e servizi per l'infanzia",
    threadId: "asili-nido-continuita-2026",
    threadLabel:
      "Asili nido: continuità del servizio, gare e ampliamento dell'offerta",
    territorialArea:
      "Asili nido comunali di via Conforti, via Spartivento e via Giovanni XXIII",
    institutionalRecipient: "Comune di Lamezia Terme — Sindaco e Amministrazione comunale",
    channel: "interrogazione",
    sourceLabel: "il Lametino, 28 agosto 2026",
    sourceUrl:
      "https://www.lametino.it/ultime/lamezia-masi-pd-presenta-interrogazione-su-asili-nido-atti-smentiscono-comune.html",
    status: "presentata_formalmente",
    linkedActs: [
      "Determinazione dirigenziale R.G. n. 1358 del 25/08/2026 — Albo Pretorio n. 2026/2759",
    ],
    verificationNote:
      "La proposta è emersa pubblicamente il 26 agosto e il 28 agosto Masi dichiara di avere depositato un'interrogazione consiliare urgente a risposta scritta; non è stato reperito nelle fonti consultate il relativo numero di protocollo. Il repository contiene inoltre la pubblicazione ufficiale all'Albo n. 2026/2759, determinazione R.G. n. 1358 del 25 agosto 2026, relativa alla presa d'atto della determinazione della Stazione Appaltante Metropolitana di Reggio Calabria per la stessa gara. Gli atti amministrativi sono registrati come sviluppi documentali e non come recepimento della proposta.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-08-26",
    lastUpdated: "2026-08-28",
    events: [
      {
        id: "asili-nido-atto-albo-25-agosto",
        date: "2026-08-25",
        type: "aggiornamento",
        title: "Pubblicata la presa d'atto sulla procedura di gara",
        summary:
          "L'Albo Pretorio comunale registra la determinazione R.G. n. 1358 del 25 agosto 2026, pubblicazione n. 2026/2759, con cui il Comune prende atto della determinazione R.G. 2766 del 24 agosto della Stazione Appaltante Metropolitana di Reggio Calabria per la gestione dei tre asili.",
        sourceLabel: "Albo Pretorio Comune di Lamezia Terme — pubbl. 2026/2759",
        sourceUrl:
          "https://albo.tinnvision.cloud/allegati/2026_2759_2_ALLEG?ente=00301390795",
        evidenceLevel: "fonte_ufficiale",
      },
      {
        id: "asili-nido-masi-richiesta-continuita",
        date: "2026-08-26",
        type: "emersione",
        title: "Masi chiede atti pubblici, avvio urgente e continuità del servizio",
        summary:
          "Dopo lo slittamento dell'apertura, il consigliere chiede la pubblicazione degli atti, l'attivazione del servizio con la massima urgenza e soluzioni che evitino di lasciare le famiglie senza assistenza; richiama inoltre la necessità di misure di continuità e di eventuali soluzioni ponte quando le procedure di gara rischiano di produrre vuoti di servizio.",
        sourceLabel: "LameziaTerme.it",
        sourceUrl:
          "https://www.lameziaterme.it/lamezia-asili-nido-chiusi-masi-grave-deficit-programmazione/",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "asili-nido-risposta-gianturco",
        date: "2026-08-26",
        type: "risposta_istituzionale",
        title: "L'Amministrazione risponde sulle gare e annuncia nuovi asili",
        summary:
          "L'Amministrazione attribuisce il ritardo ai tempi della Centrale Unica di Committenza di Reggio Calabria, afferma di aver sottoposto al Consiglio una deliberazione per utilizzare la CUC di Lamezia Multiservizi e comunica di lavorare alla realizzazione di tre ulteriori asili nido entro l'anno educativo 2027/2028.",
        sourceLabel: "LameziaTerme.it",
        sourceUrl:
          "https://www.lameziaterme.it/asili-nido-gianturco-ritardo-legato-alla-gara-non-alla-programmazione/",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "asili-nido-masi-interrogazione-urgente",
        date: "2026-08-28",
        type: "deposito",
        title: "Masi deposita un'interrogazione urgente a risposta scritta",
        summary:
          "L'interrogazione chiede di ricostruire quanto avvenuto tra il 17 e il 25 agosto, spiegare perché non siano state mantenute o attivate misure di continuità e chiarire le responsabilità politiche e amministrative nella gestione del rinvio.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultime/lamezia-masi-pd-presenta-interrogazione-su-asili-nido-atti-smentiscono-comune.html",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "asili-nido-gianturco-risposta-28-agosto",
        date: "2026-08-28",
        type: "risposta_istituzionale",
        title: "Gianturco ricostruisce la proroga tecnica e il subentro del nuovo gestore",
        summary:
          "L'assessore riferisce che il 30 luglio era stata disposta una proroga tecnica al gestore uscente, poi non proseguita dopo l'aggiudicazione; dal 17 agosto il Comune avrebbe avviato gli adempimenti di subentro e tutela dei lavoratori. Comunica inoltre che il 28 agosto è stata effettuata la consegna del servizio al nuovo gestore.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultime/lamezia-gianturco-su-asili-nido-comunali-ogni-passaggio-amministrativo-ha-i-suoi-tempi-no-a-strumentalizzazioni.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "ponte-sant-antonio-rilancio-2026",
    title: "Rilancio dell'area di Ponte S. Antonio",
    summary:
      "Petizione per manutenzione e decoro urbano, maggiore sicurezza e controllo della viabilità e valorizzazione turistico-culturale dell'area di Ponte S. Antonio e delle vie limitrofe.",
    promoterId: "residenti-ponte-sant-antonio",
    promoter: "Gruppo di residenti dell'area Ponte S. Antonio",
    promoterType: "cittadino_comitato",
    periodLabel: "Maggio 2026",
    year: "2026",
    theme: "Spazio pubblico e mobilità",
    threadId: "ponte-sant-antonio-rigenerazione",
    threadLabel: "Ponte S. Antonio: sicurezza, decoro e valorizzazione",
    territorialArea:
      "Ponte S. Antonio, via Indipendenza, via Vignola Statti e vie limitrofe",
    institutionalRecipient: "Comune di Lamezia Terme",
    channel: "petizione",
    sourceLabel: "Corriere di Lamezia, 29 maggio 2026",
    sourceUrl:
      "https://www.corrieredilamezia.it/attualita/2026_05_29/lamezia-petizione-dei-cittadini-per-rilancio-zona-ponte-s-antonio_63249/",
    status: "presentata_formalmente",
    linkedActs: [],
    verificationNote:
      "La fonte riferisce oltre 200 firme e la trasmissione della petizione agli uffici comunali competenti. Non è ancora censito un successivo atto comunale di presa in carico o una risposta formale.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-05-29",
    lastUpdated: "2026-05-29",
    events: [
      {
        id: "ponte-sant-antonio-petizione-trasmessa",
        date: "2026-05-29",
        type: "petizione",
        title: "Petizione trasmessa agli uffici comunali",
        summary:
          "La raccolta supera 200 firme e viene trasmessa al Comune. I promotori chiedono anche un incontro con l'Amministrazione.",
        sourceLabel: "Corriere di Lamezia",
        sourceUrl:
          "https://www.corrieredilamezia.it/attualita/2026_05_29/lamezia-petizione-dei-cittadini-per-rilancio-zona-ponte-s-antonio_63249/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "politiche-sociali-progetto-vita-2026",
    title: "Dieci proposte per politiche sociali, disabilità e Progetto di Vita",
    summary:
      "Pacchetto di proposte su continuità assistenziale, Tavolo permanente sulla disabilità, Piano territoriale per il Progetto di Vita, trasparenza dei criteri di accesso, monitoraggio, budget di progetto, co-progettazione e capacità amministrativa.",
    promoterId: "una-citta-dove-vivere-bene",
    promoter: "Associazione Una Città Dove Vivere Bene",
    promoterType: "associazione",
    periodLabel: "Giugno–agosto 2026",
    year: "2026",
    theme: "Welfare e disabilità",
    threadId: "progetto-vita-disabilita",
    threadLabel: "Disabilità, Progetto di Vita e continuità assistenziale",
    institutionalRecipient: "Comune di Lamezia Terme — Sindaco, Giunta e Consiglio comunale",
    channel: "conferenza_stampa",
    sourceLabel: "il Lametino, 4 giugno 2026",
    sourceUrl:
      "https://www.lametino.it/ultimora/lamezia-le-proposte-dellassociazione-una-citta-dove-vivere-bene-per-rilanciare-le-politiche-sociali.html",
    status: "presentata_formalmente",
    linkedActs: ["Mozione consiliare prot. n. 47464/2026"],
    verificationNote:
      "Il documento associativo è stato presentato pubblicamente; una successiva mozione consiliare di Lo Moro, Masi e Serratore lo richiama espressamente e ne riprende diverse linee operative. L'archivio registra questo passaggio come evoluzione della stessa traiettoria tematica, senza attribuire all'associazione la paternità dell'atto consiliare.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-06-04",
    lastUpdated: "2026-08-13",
    events: [
      {
        id: "politiche-sociali-documento-dieci-punti",
        date: "2026-06-04",
        type: "emersione",
        title: "Presentato il documento in dieci punti",
        summary:
          "L'associazione illustra pubblicamente un pacchetto di misure per riorganizzare le politiche sociali e rafforzare i diritti delle persone con disabilità.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultimora/lamezia-le-proposte-dellassociazione-una-citta-dove-vivere-bene-per-rilanciare-le-politiche-sociali.html",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "politiche-sociali-mozione-consiliare",
        date: "2026-06-06",
        type: "deposito",
        title: "Le proposte entrano in una mozione consiliare",
        summary:
          "I consiglieri Doris Lo Moro, Gennarino Masi e Bernadette Serratore presentano una mozione che richiama il documento associativo e propone continuità assistenziale, Tavolo permanente, Piano territoriale e misure di trasparenza e co-progettazione.",
        sourceLabel: "City One",
        sourceUrl:
          "https://www.cityonelamezia.it/progetto-di-vita-continuita-assistenziale-servizi-disabilita-e-non-autosufficienza-mozione-lo-moro-masi-e-serratore/",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "politiche-sociali-odg-13-agosto",
        date: "2026-08-13",
        type: "calendarizzazione",
        title: "Mozione inserita nell'ordine del giorno del Consiglio",
        summary:
          "La mozione prot. n. 47464/2026 figura tra i punti della seduta consiliare convocata per il 13 agosto 2026.",
        sourceLabel: "City One",
        sourceUrl:
          "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "riuso-libri-scolastici-inclusione-2026",
    title: "Recupero dei libri scolastici invenduti per i docenti di sostegno",
    summary:
      "Proposta per evitare il macero di testi scolastici e manuali semplificati ancora utilizzabili, distribuirli gratuitamente ai docenti per l'inclusione e candidare Lamezia come area pilota di sperimentazione.",
    promoterId: "fernando-nucifero-udc",
    promoter: "Fernando Nucifero (UDC)",
    promoterType: "forza_politica",
    coPromoters: ["Giampaolo Bevilacqua", "Giancarlo Nicotera"],
    periodLabel: "Giugno–agosto 2026",
    year: "2026",
    theme: "Scuola e inclusione",
    threadId: "riuso-libri-inclusione",
    threadLabel: "Riuso dei testi scolastici e didattica inclusiva",
    institutionalRecipient: "Comune di Lamezia Terme — Consiglio comunale",
    channel: "petizione",
    sourceLabel: "Corriere di Lamezia, 15 giugno 2026",
    sourceUrl:
      "https://www.corrieredilamezia.it/politica/2026_06_15/lamezia-nucifero-udc-chiusa-la-petizione-online-per-dire-no-al-macero-dei-libri-scolastici-e-dei-manuali-correlati-semplificati-si-allinclusione_63744/",
    status: "presentata_formalmente",
    linkedActs: ["Mozione prot. n. 59945/2026"],
    verificationNote:
      "La fonte sulla petizione attribuisce l'iniziativa a Fernando Nucifero e indica il sostegno di Giampaolo Bevilacqua e Giancarlo Nicotera. Una successiva fonte sull'ordine del giorno conferma l'approdo del medesimo oggetto in una mozione consiliare; la scheda non attribuisce i firmatari della mozione oltre quanto verificato.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-06-15",
    lastUpdated: "2026-08-13",
    events: [
      {
        id: "riuso-libri-petizione-chiusa",
        date: "2026-06-15",
        type: "petizione",
        title: "Petizione online conclusa con 260 firme",
        summary:
          "Il promotore annuncia la chiusura della petizione e l'obiettivo di avviare un protocollo locale e un progetto pilota a Lamezia.",
        sourceLabel: "Corriere di Lamezia",
        sourceUrl:
          "https://www.corrieredilamezia.it/politica/2026_06_15/lamezia-nucifero-udc-chiusa-la-petizione-online-per-dire-no-al-macero-dei-libri-scolastici-e-dei-manuali-correlati-semplificati-si-allinclusione_63744/",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "riuso-libri-mozione-odg",
        date: "2026-08-13",
        type: "calendarizzazione",
        title: "La proposta compare come mozione nell'ordine del giorno",
        summary:
          "L'ordine del giorno consiliare include la mozione prot. n. 59945/2026 sul recupero e la donazione dei testi scolastici e sulla candidatura di Lamezia come area di sperimentazione nazionale.",
        sourceLabel: "City One",
        sourceUrl:
          "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "ex-cinema-grandinetti-bonifica-2026",
    title: "Bonifica e messa in sicurezza dell'ex Cinema Grandinetti",
    summary:
      "Mozione per ripulire e mettere in sicurezza l'area dell'ex Cinema Grandinetti di Sambiase, prevenire occupazioni e vandalismi e aggiornare il Consiglio sul progetto di riqualificazione finanziato.",
    promoterId: "lidia-vescio",
    promoter: "Lidia Vescio",
    promoterType: "consigliere",
    periodLabel: "Luglio–agosto 2026",
    year: "2026",
    theme: "Rigenerazione urbana e patrimonio",
    threadId: "ex-cinema-grandinetti",
    threadLabel: "Ex Cinema Grandinetti: sicurezza e rigenerazione",
    territorialArea: "Ex Cinema Grandinetti, Sambiase",
    institutionalRecipient: "Comune di Lamezia Terme — Consiglio comunale",
    channel: "mozione",
    sourceLabel: "il Lametino, 9 luglio 2026",
    sourceUrl:
      "https://www.lametino.it/ultime/lamezia-vescio-pd-bonificare-e-mettere-in-sicurezza-area-ex-cinema-grandinetti.html",
    status: "presentata_formalmente",
    linkedActs: ["Mozione prot. n. 56506/2026"],
    verificationNote:
      "La consigliera dichiara di avere depositato la mozione; l'ordine del giorno del 13 agosto ne conferma la calendarizzazione. Non è ancora registrato in questa scheda l'esito della discussione.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-07-09",
    lastUpdated: "2026-08-13",
    events: [
      {
        id: "ex-cinema-grandinetti-mozione-depositata",
        date: "2026-07-09",
        type: "deposito",
        title: "Mozione depositata",
        summary:
          "Vengono richiesti pulizia, sfalcio, eventuale derattizzazione e disinfestazione, messa in sicurezza dell'immobile, controlli e un aggiornamento sul progetto di riqualificazione.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultime/lamezia-vescio-pd-bonificare-e-mettere-in-sicurezza-area-ex-cinema-grandinetti.html",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "ex-cinema-grandinetti-odg",
        date: "2026-08-13",
        type: "calendarizzazione",
        title: "Mozione calendarizzata in Consiglio comunale",
        summary:
          "La mozione prot. n. 56506/2026 figura nell'ordine del giorno della seduta del 13 agosto.",
        sourceLabel: "City One",
        sourceUrl:
          "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "cinghiali-centro-misure-sicurezza-2026",
    title: "Misure per contenere la presenza di cinghiali nelle aree urbane",
    summary:
      "Interrogazione al sindaco per conoscere le azioni che il Comune intende attivare, insieme agli enti competenti, per contenere la presenza dei cinghiali e ridurre i rischi per persone e automobilisti.",
    promoterId: "oscar-branca",
    promoter: "Oscar Branca",
    promoterType: "consigliere",
    periodLabel: "Agosto 2026",
    year: "2026",
    theme: "Ambiente e sicurezza urbana",
    threadId: "cinghiali-aree-urbane",
    threadLabel: "Cinghiali nelle aree urbane e sicurezza",
    territorialArea: "Centro cittadino e aree urbane di Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme — Sindaco",
    channel: "interrogazione",
    sourceLabel: "ANSA, 6 agosto 2026",
    sourceUrl:
      "https://www.ansa.it/calabria/notizie/2026/08/06/cinghiali-in-centro-a-lamezia-presentata-interrogazione-in-consiglio-comunale_5d161f9e-ca32-411b-ae73-c4b96be6624a.html",
    status: "presentata_formalmente",
    linkedActs: [],
    verificationNote:
      "ANSA conferma la presentazione dell'interrogazione e ne riporta la richiesta sostanziale. In questa fase non è associato un numero di protocollo verificato né un esito istituzionale.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-08-06",
    lastUpdated: "2026-08-06",
    events: [
      {
        id: "cinghiali-interrogazione-presentata",
        date: "2026-08-06",
        type: "deposito",
        title: "Interrogazione presentata al sindaco",
        summary:
          "Branca chiede quali misure concrete e coordinate con gli enti competenti saranno adottate per il contenimento del fenomeno e la sicurezza pubblica.",
        sourceLabel: "ANSA",
        sourceUrl:
          "https://www.ansa.it/calabria/notizie/2026/08/06/cinghiali-in-centro-a-lamezia-presentata-interrogazione-in-consiglio-comunale_5d161f9e-ca32-411b-ae73-c4b96be6624a.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "ginepri-marinella-sicurezza-valorizzazione-2026",
    title: "Tutela e valorizzazione di pineta Ginepri-Marinella, lungomare e arenile",
    summary:
      "Interrogazione sulle condizioni di sicurezza, manutenzione e valorizzazione della pineta, del lungomare e dell'arenile, accompagnata da documentazione fotografica e segnalazioni raccolte sul posto.",
    promoterId: "serratore-vitale",
    promoter: "Bernadette Serratore e Annita Vitale",
    promoterType: "consigliere",
    periodLabel: "Giugno–agosto 2026",
    year: "2026",
    theme: "Ambiente, costa e spazio pubblico",
    threadId: "ginepri-marinella-lungomare",
    threadLabel: "Ginepri-Marinella: pineta, lungomare e arenile",
    territorialArea: "Pineta Ginepri-Marinella, lungomare e fascia costiera lametina",
    institutionalRecipient: "Comune di Lamezia Terme — Sindaco e Amministrazione comunale",
    channel: "interrogazione",
    sourceLabel: "il Lametino, 19 giugno 2026",
    sourceUrl:
      "https://www.lametino.it/ultime/lamezia-interrograzione-di-serratore-e-vitale-su-pineta-ginepri-marinella-spiaggia-e-lungomare.html",
    status: "presentata_formalmente",
    linkedActs: ["Interrogazione prot. n. 51106/2026"],
    verificationNote:
      "La scheda separa l'interrogazione dalla successiva replica pubblica dell'Amministrazione, registrata come evento. La replica non equivale automaticamente a risposta consiliare formale né a recepimento della proposta.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-06-19",
    lastUpdated: "2026-08-13",
    events: [
      {
        id: "ginepri-marinella-interrogazione",
        date: "2026-06-19",
        type: "deposito",
        title: "Interrogazione presentata",
        summary:
          "Le consigliere chiedono chiarimenti e interventi su sicurezza, manutenzione e valorizzazione della fascia costiera, richiamando criticità già segnalate in precedenza.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultime/lamezia-interrograzione-di-serratore-e-vitale-su-pineta-ginepri-marinella-spiaggia-e-lungomare.html",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "ginepri-marinella-replica-amministrazione",
        date: "2026-06-19",
        type: "risposta_istituzionale",
        title: "Replica pubblica dell'Amministrazione",
        summary:
          "L'Amministrazione contesta parte della rappresentazione delle criticità e segnala interventi in corso. La replica è mantenuta nella timeline per documentare l'evoluzione del confronto.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultime/lamezia-amministrazione-comunale-a-serratore-e-vitale-su-lungomare-e-pineta-interventi-in-corso-e-situazione-diversa-da-quella-descritta.html",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "ginepri-marinella-odg",
        date: "2026-08-13",
        type: "calendarizzazione",
        title: "Interrogazione presente nell'ordine del giorno consiliare",
        summary:
          "L'interrogazione prot. n. 51106/2026 compare tra i punti della seduta consiliare del 13 agosto.",
        sourceLabel: "City One",
        sourceUrl:
          "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "passerella-marinella-gizzeria-2026",
    title: "Completamento dell'iter per la passerella ciclopedonale Marinella–Gizzeria",
    summary:
      "Richiesta di completare gli adempimenti comunali necessari alla passerella ciclopedonale sulla SS18 tra Marinella e Gizzeria Lido e, nell'attesa, rendere più sicuri i percorsi esistenti con pulizia, ripristino stradale e verifica della possibile riapertura del vecchio ponte pedonale.",
    promoterId: "comitato-gizzeria-lido-marinella",
    promoter: "Comitato spontaneo di cittadini e villeggianti di Gizzeria Lido e Marinella",
    promoterType: "cittadino_comitato",
    periodLabel: "8–13 agosto 2026",
    year: "2026",
    theme: "Mobilità ciclopedonale e sicurezza stradale",
    threadId: "passerella-marinella-gizzeria",
    threadLabel: "Marinella–Gizzeria: passerella ciclopedonale e sicurezza sulla SS18",
    territorialArea:
      "Marinella di Lamezia Terme, SS18, via Antonio Cappelli e collegamento verso Gizzeria Lido",
    institutionalRecipient: "Comune di Lamezia Terme — Sindaco e Lavori Pubblici",
    channel: "assemblea_pubblica",
    sourceLabel: "il Lametino, 8 agosto 2026",
    sourceUrl:
      "https://www.lametino.it/ultimora/passerella-su-ss18-tra-gizzeria-e-lamezia-cittadini-e-istituzioni-a-confronto-servono-risposte-e-tempi-certi.html",
    status: "presentata_formalmente",
    linkedActs: [
      "Delibera n. 146 del 17/06/2021 — accordo preliminare per il collegamento ciclopedonale Marinella–Gizzeria Lido",
    ],
    verificationNote:
      "La proposta emerge da un incontro pubblico promosso da un comitato spontaneo e apolitico. Le consigliere Annita Vitale e Marialucia Raso, presenti all'incontro, hanno successivamente depositato un'interrogazione al Sindaco sul medesimo oggetto: questo passaggio è trattato come istituzionalizzazione della stessa traiettoria civica, non come un record duplicato. Le fonti consultate non documentano ancora una risposta formale del Comune di Lamezia, l'approvazione finale del progetto da parte dell'ente o l'avvio della gara ANAS.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-08-08",
    lastUpdated: "2026-08-13",
    events: [
      {
        id: "passerella-comitato-incontro-pubblico",
        date: "2026-08-08",
        type: "emersione",
        title: "Il comitato chiede tempi certi e soluzioni immediate per la sicurezza",
        summary:
          "Durante l'incontro pubblico il comitato chiede di chiarire e completare l'ultimo passaggio amministrativo per la nuova passerella; propone inoltre la pulizia e riapertura del viottolo e la verifica della possibile riapertura in sicurezza del vecchio ponte pedonale come soluzione temporanea.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultimora/passerella-su-ss18-tra-gizzeria-e-lamezia-cittadini-e-istituzioni-a-confronto-servono-risposte-e-tempi-certi.html",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "passerella-raso-vitale-interrogazione",
        date: "2026-08-10",
        type: "deposito",
        title: "Raso e Vitale depositano un'interrogazione al Sindaco",
        summary:
          "Le consigliere chiedono quali adempimenti restino a carico di Lamezia e con quali tempi; se non vi sono ulteriori ostacoli chiedono l'approvazione rapida degli atti di competenza. Sollecitano anche il completamento del manto stradale e la pulizia costante di via Antonio Cappelli e dell'area del ponte.",
        sourceLabel: "Corriere di Lamezia",
        sourceUrl:
          "https://www.corrieredilamezia.it/politica/2026_08_10/passerella-marinella-gizzeria-raso-e-vitale-lamezia-dica-cosa-deve-fare-e-lo-faccia-intanto-si-garantiscano-pulizia-e-sicurezza_65594/",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "passerella-comitato-ribadisce-ultimo-passo",
        date: "2026-08-13",
        type: "aggiornamento",
        title: "Il comitato ribadisce la richiesta di completare l'iter",
        summary:
          "Caterina Misuraca, indicata come una delle promotrici del comitato, ribadisce che la richiesta è completare l'iter comunale e ottenere una data certa; conferma inoltre l'interesse a valutare il vecchio ponte pedonale come soluzione temporanea se tecnicamente riapribile in sicurezza.",
        sourceLabel: "Calabria 7",
        sourceUrl:
          "https://calabria7.news/attualita/passerella-tra-gizzeria-lido-e-marinella-il-progetto-ce-i-fondi-ci-sono-cosa-aspettiamo/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "emodinamica-h24-giovanni-paolo-ii-2026",
    title: "Emodinamica H24 al Presidio ospedaliero Giovanni Paolo II",
    summary:
      "Mozione regionale per garantire a Lamezia Terme, insieme ai presidi di Corigliano-Rossano, Paola e Vibo Valentia, un servizio di emodinamica strutturale e permanente operativo 24 ore su 24 e 7 giorni su 7, integrato nella Rete STEMI e nella rete per le sindromi coronariche acute, con reclutamento prioritario di specialisti e adeguate risorse tecnologiche.",
    promoterId: "elisa-scutella-m5s",
    promoter: "Elisa Scutellà (M5S)",
    promoterType: "consigliere",
    periodLabel: "18 agosto 2026",
    year: "2026",
    theme: "Sanità e rete ospedaliera",
    threadId: "ospedale-emodinamica-h24",
    threadLabel: "Ospedale Giovanni Paolo II: emodinamica H24 e rete cardiologica",
    territorialArea: "Presidio ospedaliero Giovanni Paolo II, Lamezia Terme",
    institutionalRecipient: "Regione Calabria — Giunta regionale e Consiglio regionale",
    channel: "mozione",
    sourceLabel: "TEN TV, 18 agosto 2026",
    sourceUrl:
      "https://www.tenonline.tv/news/politica/emodinamica-h24-scutella-depositata-mozione-per-trovare-soluzioni/",
    status: "presentata_formalmente",
    linkedActs: [],
    verificationNote:
      "Più fonti giornalistiche convergenti riferiscono il deposito della mozione da parte della capogruppo M5S in Consiglio regionale e ne riportano gli stessi contenuti operativi. Non è stato reperito nelle fonti consultate il numero ufficiale della mozione né un esito della discussione consiliare. La proposta riguarda quattro presidi calabresi; la scheda la censisce perché include espressamente il Presidio Giovanni Paolo II di Lamezia Terme.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-08-18",
    lastUpdated: "2026-08-18",
    events: [
      {
        id: "emodinamica-scutella-mozione-depositata",
        date: "2026-08-18",
        type: "deposito",
        title: "Scutellà deposita la mozione per l'emodinamica H24",
        summary:
          "La mozione chiede servizi strutturali e permanenti H24 nei quattro presidi, piena integrazione nella Rete STEMI e SCA, un piano prioritario di reclutamento di medici e specialisti e un'equa distribuzione di risorse e tecnologie.",
        sourceLabel: "TEN TV",
        sourceUrl:
          "https://www.tenonline.tv/news/politica/emodinamica-h24-scutella-depositata-mozione-per-trovare-soluzioni/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "convocazioni-ordini-giorno-digitali",
    title: "Pubblicità digitale di convocazioni e ordini del giorno",
    summary:
      "Proposta progettuale interna per rendere più accessibili online convocazioni, ordini del giorno e aggiornamenti delle sedute pubbliche del Consiglio comunale.",
    promoterId: "lamezia-trasparente",
    promoter: "Lamezia Trasparente",
    promoterType: "cittadino_comitato",
    periodLabel: "Seed progettuale — data di presentazione pubblica non censita",
    year: "non determinato",
    theme: "Trasparenza e partecipazione democratica",
    threadId: "trasparenza-sedute",
    threadLabel: "Accessibilità e memoria delle sedute pubbliche",
    institutionalRecipient: "Comune di Lamezia Terme — Consiglio comunale",
    channel: "iniziativa_popolare",
    sourceLabel: "Manifest interno/documentale Lamezia Trasparente Monitor",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Record storico interno conservato per non perdere la memoria progettuale. Non va interpretato come proposta formalmente depositata finché non sarà collegata una fonte pubblica esterna o un atto di presentazione.",
    evidenceLevel: "fonte_interna_documentale",
    firstSeen: "2026-06-09",
    lastUpdated: "2026-06-09",
    events: [
      {
        id: "convocazioni-seed-interno",
        date: "2026-06-09",
        type: "emersione",
        title: "Inserita nel manifest progettuale",
        summary: "La proposta viene registrata nel dataset interno del progetto.",
        sourceLabel: "Lamezia Trasparente Monitor",
        evidenceLevel: "fonte_interna_documentale",
      },
    ],
  },
  {
    id: "streaming-archivio-sedute-pubbliche",
    title: "Diretta streaming e archivio digitale delle sedute pubbliche",
    summary:
      "Proposta progettuale interna per consentire la fruizione a distanza delle sedute pubbliche e conservare un archivio digitale consultabile dai cittadini.",
    promoterId: "lamezia-trasparente",
    promoter: "Lamezia Trasparente",
    promoterType: "cittadino_comitato",
    periodLabel: "Seed progettuale — data di presentazione pubblica non censita",
    year: "non determinato",
    theme: "Trasparenza e partecipazione democratica",
    threadId: "trasparenza-sedute",
    threadLabel: "Accessibilità e memoria delle sedute pubbliche",
    institutionalRecipient: "Comune di Lamezia Terme — Consiglio comunale",
    channel: "iniziativa_popolare",
    sourceLabel: "Manifest interno/documentale Lamezia Trasparente Monitor",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Record storico interno conservato separatamente dalle proposte con fonte esterna verificabile.",
    evidenceLevel: "fonte_interna_documentale",
    firstSeen: "2026-06-09",
    lastUpdated: "2026-06-09",
    events: [
      {
        id: "streaming-seed-interno",
        date: "2026-06-09",
        type: "emersione",
        title: "Inserita nel manifest progettuale",
        summary: "La proposta viene registrata nel dataset interno del progetto.",
        sourceLabel: "Lamezia Trasparente Monitor",
        evidenceLevel: "fonte_interna_documentale",
      },
    ],
  },
  {
    id: "resoconto-integrale-sedute-consiliari",
    title: "Resoconto integrale delle sedute consiliari",
    summary:
      "Proposta progettuale interna per pubblicare resoconti stenografici o integrali delle sedute, facilitando controllo civico, memoria documentale e accessibilità.",
    promoterId: "lamezia-trasparente",
    promoter: "Lamezia Trasparente",
    promoterType: "cittadino_comitato",
    periodLabel: "Seed progettuale — data di presentazione pubblica non censita",
    year: "non determinato",
    theme: "Trasparenza e partecipazione democratica",
    threadId: "trasparenza-sedute",
    threadLabel: "Accessibilità e memoria delle sedute pubbliche",
    institutionalRecipient: "Comune di Lamezia Terme — Consiglio comunale",
    channel: "iniziativa_popolare",
    sourceLabel: "Manifest interno/documentale Lamezia Trasparente Monitor",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Record storico interno conservato separatamente dalle proposte con fonte esterna verificabile.",
    evidenceLevel: "fonte_interna_documentale",
    firstSeen: "2026-06-09",
    lastUpdated: "2026-06-09",
    events: [
      {
        id: "resoconto-seed-interno",
        date: "2026-06-09",
        type: "emersione",
        title: "Inserita nel manifest progettuale",
        summary: "La proposta viene registrata nel dataset interno del progetto.",
        sourceLabel: "Lamezia Trasparente Monitor",
        evidenceLevel: "fonte_interna_documentale",
      },
    ],
  },
  {
    id: "firma-digitale-iniziative-petizioni",
    title: "Firma digitale per iniziative popolari, istanze e petizioni",
    summary:
      "Proposta progettuale interna per valutare strumenti digitali che rendano più accessibile la sottoscrizione di iniziative popolari, istanze e petizioni rivolte all'ente.",
    promoterId: "lamezia-trasparente",
    promoter: "Lamezia Trasparente",
    promoterType: "cittadino_comitato",
    periodLabel: "Seed progettuale — data di presentazione pubblica non censita",
    year: "non determinato",
    theme: "Trasparenza e partecipazione democratica",
    threadId: "partecipazione-digitale",
    threadLabel: "Partecipazione civica digitale",
    institutionalRecipient: "Comune di Lamezia Terme",
    channel: "iniziativa_popolare",
    sourceLabel: "Manifest interno/documentale Lamezia Trasparente Monitor",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Record storico interno conservato per memoria progettuale; eventuali profili tecnici, regolamentari e privacy richiedono istruttoria e fonti ufficiali dedicate.",
    evidenceLevel: "fonte_interna_documentale",
    firstSeen: "2026-06-09",
    lastUpdated: "2026-06-09",
    events: [
      {
        id: "firma-digitale-seed-interno",
        date: "2026-06-09",
        type: "emersione",
        title: "Inserita nel manifest progettuale",
        summary: "La proposta viene registrata nel dataset interno del progetto.",
        sourceLabel: "Lamezia Trasparente Monitor",
        evidenceLevel: "fonte_interna_documentale",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];

export type ProposalFilter = {
  theme?: string;
  promoter?: string;
  year?: string;
  status?: ProposalStatus;
  channel?: ProposalChannel;
};

export function normalizeProposalFacet(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("it");
}

export function getProposalThemes(
  proposals: readonly PublicProposal[] = PUBLIC_PROPOSALS,
) {
  return Array.from(new Set(proposals.map((proposal) => proposal.theme))).sort((a, b) =>
    a.localeCompare(b, "it"),
  );
}

export function getProposalPromoters(
  proposals: readonly PublicProposal[] = PUBLIC_PROPOSALS,
) {
  return Array.from(new Set(proposals.map((proposal) => proposal.promoter))).sort((a, b) =>
    a.localeCompare(b, "it"),
  );
}

export function getProposalYears(
  proposals: readonly PublicProposal[] = PUBLIC_PROPOSALS,
) {
  return Array.from(new Set(proposals.map((proposal) => proposal.year))).sort((a, b) =>
    b.localeCompare(a, "it"),
  );
}

export function filterPublicProposals(
  proposals: readonly PublicProposal[],
  filters: ProposalFilter,
) {
  return proposals.filter((proposal) => {
    const matchesTheme =
      !filters.theme ||
      normalizeProposalFacet(proposal.theme) ===
        normalizeProposalFacet(filters.theme);
    const matchesPromoter =
      !filters.promoter ||
      normalizeProposalFacet(proposal.promoter) ===
        normalizeProposalFacet(filters.promoter);
    const matchesYear = !filters.year || proposal.year === filters.year;
    const matchesStatus = !filters.status || proposal.status === filters.status;
    const matchesChannel = !filters.channel || proposal.channel === filters.channel;

    return (
      matchesTheme &&
      matchesPromoter &&
      matchesYear &&
      matchesStatus &&
      matchesChannel
    );
  });
}

export function groupProposalsByPromoter(proposals: readonly PublicProposal[]) {
  const groups = new Map<string, { promoter: string; proposals: PublicProposal[] }>();

  for (const proposal of proposals) {
    const existing = groups.get(proposal.promoterId);
    if (existing) {
      existing.proposals.push(proposal);
    } else {
      groups.set(proposal.promoterId, {
        promoter: proposal.promoter,
        proposals: [proposal],
      });
    }
  }

  return Array.from(groups.entries())
    .map(([promoterId, group]) => ({ promoterId, ...group }))
    .sort((a, b) => {
      const countDelta = b.proposals.length - a.proposals.length;
      return countDelta !== 0 ? countDelta : a.promoter.localeCompare(b.promoter, "it");
    });
}

export function groupProposalsByThread(proposals: readonly PublicProposal[]) {
  const groups = new Map<
    string,
    { threadLabel: string; proposals: PublicProposal[] }
  >();

  for (const proposal of proposals) {
    const existing = groups.get(proposal.threadId);
    if (existing) {
      existing.proposals.push(proposal);
    } else {
      groups.set(proposal.threadId, {
        threadLabel: proposal.threadLabel,
        proposals: [proposal],
      });
    }
  }

  return Array.from(groups.entries())
    .map(([threadId, group]) => ({ threadId, ...group }))
    .sort((a, b) => {
      const latestA = Math.max(...a.proposals.map((proposal) => Date.parse(proposal.lastUpdated)));
      const latestB = Math.max(...b.proposals.map((proposal) => Date.parse(proposal.lastUpdated)));
      return latestB - latestA;
    });
}

export function getLatestProposalEvents(
  proposals: readonly PublicProposal[] = PUBLIC_PROPOSALS,
  limit = 6,
) {
  return proposals
    .flatMap((proposal) =>
      proposal.events.map((event) => ({
        proposalId: proposal.id,
        proposalTitle: proposal.title,
        promoter: proposal.promoter,
        threadLabel: proposal.threadLabel,
        event,
      })),
    )
    .sort((a, b) => b.event.date.localeCompare(a.event.date))
    .slice(0, limit);
}
