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
