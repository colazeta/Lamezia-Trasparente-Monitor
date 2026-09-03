export const EVIDENCE_THEMATIC_AREAS = [
  "trasparenza_integrita_anticorruzione",
  "partecipazione_democrazia_locale",
  "procurement_spesa_pubblica",
  "sicurezza_urbana_prevenzione",
  "welfare_inclusione_servizi_sociali",
  "istruzione_giovani",
  "salute_pubblica_locale",
  "mobilita_spazio_pubblico",
  "ambiente_clima_energia",
  "rifiuti_pulizia_urbana",
  "housing_politiche_abitative",
  "urbanistica_rigenerazione",
  "sviluppo_economico_commercio_lavoro",
  "fiscalita_entrate_riscossione",
  "digitalizzazione_servizi_online",
  "capacita_amministrativa_personale",
] as const;

export type EvidenceThematicArea = (typeof EVIDENCE_THEMATIC_AREAS)[number];

export const EVIDENCE_INTERVENTION_TYPES = [
  "incentivo_economico",
  "nudging_comunicazione",
  "regolazione",
  "enforcement_controllo",
  "servizio_diretto",
  "infrastruttura_fisica",
  "infrastruttura_digitale",
  "modifica_organizzativa_processo",
  "partecipazione_codesign",
  "targeting_data_analytics",
  "procurement_contract_design",
  "partnership_pubblico_privato_terzo_settore",
  "informazione_trasparenza",
  "formazione_capacity_building",
] as const;

export type EvidenceInterventionType = (typeof EVIDENCE_INTERVENTION_TYPES)[number];

export const EVIDENCE_STRENGTHS = [
  "molto_forte",
  "forte",
  "moderata",
  "limitata",
  "da_verificare",
] as const;

export type EvidenceStrength = (typeof EVIDENCE_STRENGTHS)[number];

export const EVIDENCE_IMPLEMENTABILITY = [
  "quick_win",
  "medio_termine",
  "strutturale",
] as const;

export type EvidenceImplementability = (typeof EVIDENCE_IMPLEMENTABILITY)[number];

export const EVIDENCE_AREA_LABELS: Record<EvidenceThematicArea, string> = {
  trasparenza_integrita_anticorruzione: "Trasparenza, integrità e anticorruzione",
  partecipazione_democrazia_locale: "Partecipazione civica e democrazia locale",
  procurement_spesa_pubblica: "Procurement e spesa pubblica",
  sicurezza_urbana_prevenzione: "Sicurezza urbana e prevenzione",
  welfare_inclusione_servizi_sociali: "Welfare, inclusione e servizi sociali",
  istruzione_giovani: "Istruzione e giovani",
  salute_pubblica_locale: "Salute pubblica locale",
  mobilita_spazio_pubblico: "Mobilità e spazio pubblico",
  ambiente_clima_energia: "Ambiente, clima ed energia",
  rifiuti_pulizia_urbana: "Rifiuti e pulizia urbana",
  housing_politiche_abitative: "Housing e politiche abitative",
  urbanistica_rigenerazione: "Urbanistica e rigenerazione",
  sviluppo_economico_commercio_lavoro: "Sviluppo economico, commercio e lavoro",
  fiscalita_entrate_riscossione: "Fiscalità locale, entrate e riscossione",
  digitalizzazione_servizi_online: "Digitalizzazione e servizi online",
  capacita_amministrativa_personale: "Capacità amministrativa e gestione del personale",
};

export const EVIDENCE_INTERVENTION_TYPE_LABELS: Record<
  EvidenceInterventionType,
  string
> = {
  incentivo_economico: "Incentivo economico",
  nudging_comunicazione: "Nudging / comunicazione",
  regolazione: "Regolazione",
  enforcement_controllo: "Enforcement / controllo",
  servizio_diretto: "Servizio diretto",
  infrastruttura_fisica: "Infrastruttura fisica",
  infrastruttura_digitale: "Infrastruttura digitale",
  modifica_organizzativa_processo: "Modifica organizzativa / processo",
  partecipazione_codesign: "Partecipazione / co-design",
  targeting_data_analytics: "Targeting / data analytics",
  procurement_contract_design: "Procurement / contract design",
  partnership_pubblico_privato_terzo_settore: "Partnership pubblico-privato / terzo settore",
  informazione_trasparenza: "Informazione / trasparenza",
  formazione_capacity_building: "Formazione / capacity building",
};

export const EVIDENCE_STRENGTH_LABELS: Record<EvidenceStrength, string> = {
  molto_forte: "Molto forte",
  forte: "Forte",
  moderata: "Moderata",
  limitata: "Limitata",
  da_verificare: "Da verificare",
};

export const EVIDENCE_IMPLEMENTABILITY_LABELS: Record<
  EvidenceImplementability,
  string
> = {
  quick_win: "Quick win",
  medio_termine: "Medio termine",
  strutturale: "Strutturale",
};

export type EvidenceLink = {
  label: string;
  url: string;
};

export type EvaluationStudy = EvidenceLink & {
  citation: string;
  doi?: string;
};

export type EvidenceIntervention = {
  id: string;
  title: string;
  authority: string;
  territory: string;
  country: string;
  implementationYear: string;
  problem: string;
  measure: string;
  mechanism: string;
  population: string;
  primaryArea: EvidenceThematicArea;
  secondaryAreas: readonly EvidenceThematicArea[];
  interventionTypes: readonly EvidenceInterventionType[];
  tools: readonly string[];
  territorialScale: string;
  interventionStatus: string;
  evaluationMethod: string;
  comparator: string;
  outcomes: readonly string[];
  results: string;
  effectSize: string;
  evidenceStrength: EvidenceStrength;
  costsRequirements: string;
  limitations: readonly string[];
  unintendedEffects: string;
  primarySource: EvidenceLink;
  evaluationStudies: readonly EvaluationStudy[];
  lastVerifiedAt: string;
  transferabilityItaly: string;
  lameziaAdaptation: string;
  implementability: EvidenceImplementability;
  capacityDataNeeds: readonly string[];
  tags: readonly string[];
  revisionHistory: readonly { date: string; note: string }[];
};

export const EVIDENCE_INTERVENTIONS = [
  {
    id: "philadelphia-vacant-lot-greening",
    title: "Rigenerazione leggera e manutenzione dei lotti urbani abbandonati",
    authority: "City of Philadelphia / Pennsylvania Horticultural Society",
    territory: "Philadelphia, Pennsylvania",
    country: "Stati Uniti",
    implementationYear: "2013–2015 (trial); programma cittadino tuttora operativo",
    problem:
      "Lotti vacanti degradati associati a illegal dumping, vegetazione incontrollata, paura dello spazio pubblico e concentrazione di reati in quartieri vulnerabili.",
    measure:
      "Pulizia dei lotti, rimozione dei rifiuti, livellamento, posa di prato e alcuni alberi, recinzione bassa e manutenzione periodica; un secondo trattamento più leggero prevedeva sfalcio e rimozione dei rifiuti.",
    mechanism:
      "Ridurre i segnali fisici di abbandono, eliminare opportunità ambientali per attività illecite e rendere lo spazio più utilizzabile e sorvegliabile dalla comunità.",
    population: "Residenti e utilizzatori delle aree circostanti i lotti trattati.",
    primaryArea: "urbanistica_rigenerazione",
    secondaryAreas: ["sicurezza_urbana_prevenzione", "salute_pubblica_locale", "rifiuti_pulizia_urbana"],
    interventionTypes: ["infrastruttura_fisica", "servizio_diretto", "partnership_pubblico_privato_terzo_settore"],
    tools: ["manutenzione standardizzata", "contratti locali", "segnalazioni 311", "ispezioni e ordinanze anti-degrado"],
    territorialScale: "Lotto / cluster di isolati, scalabile a livello cittadino",
    interventionStatus: "Programma consolidato; la città continua a ispezionare e pulire lotti vacanti.",
    evaluationMethod:
      "Cluster randomized controlled trial: 541 lotti randomizzati in 110 cluster tra greening, sfalcio/pulizia e controllo senza intervento; analisi anche difference-in-differences su outcome di polizia.",
    comparator: "Cluster di lotti lasciati senza intervento nel periodo di studio.",
    outcomes: ["sparatorie", "reati complessivi", "violenza con armi", "furti con scasso", "nuisance crime", "percezione di sicurezza"],
    results:
      "Entrambi i trattamenti hanno ridotto significativamente le sparatorie senza evidenza di spostamento nelle aree adiacenti. Nei quartieri sotto la soglia di povertà il trial più ampio rileva riduzioni anche di criminalità complessiva, violenza armata, furti con scasso e nuisance crime.",
    effectSize:
      "Sparatorie: −6,8% per il greening e −9,2% per sfalcio/pulizia rispetto al controllo; nei quartieri sotto la soglia di povertà: criminalità complessiva −13,3%, violenza armata −29,1%, furti con scasso −21,9%, nuisance crime −30,3%.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Nel trial il greening iniziale costava in media circa 5 USD/m² e la manutenzione circa 0,50 USD/m². Servono censimento dei lotti, titolo/diritto di accesso, standard manutentivi e capacità di manutenzione ricorrente.",
    limitations: [
      "Le stime di maggiore entità sulla criminalità sono specifiche ai quartieri sotto la soglia di povertà.",
      "Assetto proprietario, norme sull'accesso ai fondi privati e livelli di violenza differiscono dal contesto italiano.",
      "Il programma richiede manutenzione nel tempo: la sola pulizia una tantum non equivale al trattamento valutato.",
    ],
    unintendedEffects: "Nessuna evidenza di displacement delle sparatorie nei buffer adiacenti nel trial dedicato.",
    primarySource: {
      label: "City of Philadelphia — Vacant Lot Program",
      url: "https://www.phila.gov/services/trash-recycling-city-upkeep/report-a-problem-with-trash-recycling-or-city-upkeep/request-a-vacant-lot-cleanup/",
    },
    evaluationStudies: [
      {
        label: "PNAS / PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/29483246/",
        citation: "Branas et al. (2018), Citywide cluster randomized trial to restore blighted vacant land and its effects on violence, crime, and fear",
        doi: "10.1073/pnas.1718503115",
      },
      {
        label: "Office of Justice Programs",
        url: "https://www.ojp.gov/library/publications/effect-remediating-blighted-vacant-land-shootings-citywide-cluster-randomized",
        citation: "Moyer et al. (2019), Effect of Remediating Blighted Vacant Land on Shootings: A Citywide Cluster Randomized Trial",
      },
    ],
    lastVerifiedAt: "2026-08-29",
    transferabilityItaly:
      "Alta per lotti pubblici o per aree sulle quali il Comune dispone di un titolo di intervento chiaro. Il nucleo trasferibile è la standardizzazione di pulizia, verde leggero e manutenzione, non la replica meccanica dell'ordinanza statunitense.",
    lameziaAdaptation:
      "Censire lotti comunali o aree degradate con localizzazione, stato manutentivo e segnalazioni; selezionare un primo gruppo di micro-aree comparabili e introdurre pulizia/verde leggero con rollout scaglionato, misurando segnalazioni, uso dello spazio, costi di manutenzione e indicatori di sicurezza prima e dopo.",
    implementability: "medio_termine",
    capacityDataNeeds: ["inventario georeferenziato dei lotti", "titolarità e vincoli", "segnalazioni/manutenzioni storiche", "protocollo di outcome predefinito"],
    tags: ["rigenerazione", "verde urbano", "sicurezza", "place-based", "RCT"],
    revisionHistory: [{ date: "2026-08-29", note: "Prima verifica e inserimento nell'archivio." }],
  },
  {
    id: "medellin-metrocable-neighbourhood-upgrading",
    title: "Connessione delle periferie e riqualificazione integrata attorno al Metrocable",
    authority: "Municipio di Medellín / Metro de Medellín",
    territory: "Medellín",
    country: "Colombia",
    implementationYear: "2004–2008",
    problem:
      "Quartieri collinari a basso reddito fisicamente isolati dal centro urbano, con forti barriere di mobilità e livelli elevati di violenza.",
    measure:
      "Realizzazione del Metrocable per collegare quartieri periferici alla rete metropolitana, accompagnata da investimenti municipali in infrastrutture fisiche di quartiere e spazio urbano.",
    mechanism:
      "Ridurre l'isolamento territoriale e aumentare accessibilità, presenza istituzionale, qualità dello spazio fisico e connessioni con opportunità e servizi urbani.",
    population: "Residenti dei quartieri popolari serviti dalla Linea K e dalle opere di riqualificazione associate.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["urbanistica_rigenerazione", "sicurezza_urbana_prevenzione", "welfare_inclusione_servizi_sociali"],
    interventionTypes: ["infrastruttura_fisica", "servizio_diretto", "modifica_organizzativa_processo"],
    tools: ["trasporto pubblico integrato", "opere di quartiere", "investimento place-based coordinato"],
    territorialScale: "Quartieri / asse di mobilità urbana",
    interventionStatus: "Infrastruttura consolidata e successivamente estesa ad altre linee.",
    evaluationMethod:
      "Natural experiment con confronto pre/post 2003–2008 tra 25 quartieri di intervento e 23 quartieri comparabili, propensity-score matching e permutation tests; 466 residenti più registri degli omicidi.",
    comparator: "23 quartieri comparabili non interessati dallo stesso pacchetto di investimento nel periodo analizzato.",
    outcomes: ["tasso di omicidi", "violenza riferita dai residenti", "risorse e condizioni di quartiere"],
    results:
      "La violenza è diminuita in entrambi i gruppi, ma la riduzione è stata significativamente maggiore nei quartieri interessati dall'intervento integrato.",
    effectSize:
      "Riduzione del tasso di omicidi 66% maggiore nei quartieri di intervento (rate ratio 0,33; IC95% 0,18–0,61); violenza riferita dai residenti ridotta 75% in più (OR 0,25; IC95% 0,11–0,67).",
    evidenceStrength: "forte",
    costsRequirements:
      "Intervento ad alta intensità di capitale e coordinamento; richiede pianificazione trasportistica, opere pubbliche, manutenzione e investimenti complementari nei quartieri.",
    limitations: [
      "Il trattamento è un pacchetto: lo studio non identifica separatamente l'effetto della funivia da quello delle opere di quartiere.",
      "Non è un RCT; restano possibili differenze non osservate nonostante matching e test di bilanciamento.",
      "Topografia, scala metropolitana e livelli di violenza di Medellín non sono direttamente comparabili a Lamezia Terme.",
    ],
    unintendedEffects: "Lo studio citato non documenta un effetto indesiderato dominante; la principale cautela è l'attribuzione dell'effetto al pacchetto integrato.",
    primarySource: {
      label: "Metro de Medellín — Linea K",
      url: "https://www.metrodemedellin.gov.co/al-dia/noticias/metrocable-l%C3%ADnea-k-15-a%C3%B1os-de-mejor-calidad-de-vida-para-la-zona-nororiental-de-medell%C3%ADn",
    },
    evaluationStudies: [
      {
        label: "American Journal of Epidemiology / PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/22472117/",
        citation: "Cerdá et al. (2012), Reducing violence by transforming neighborhoods: a natural experiment in Medellín, Colombia",
        doi: "10.1093/aje/kwr428",
      },
    ],
    lastVerifiedAt: "2026-08-29",
    transferabilityItaly:
      "Il mezzo tecnico non è il punto trasferibile. È più rilevante il principio di collegare investimenti di mobilità a riqualificazione fisica e servizi nei quartieri meno accessibili, evitando interventi infrastrutturali isolati.",
    lameziaAdaptation:
      "Per assi o quartieri con accessibilità debole, progettare eventuali interventi di trasporto insieme a illuminazione, percorsi pedonali, fermate, micro-spazi pubblici e servizi; usare rollout per fasi e confrontare indicatori di accessibilità, utilizzo, manutenzione e sicurezza tra aree simili.",
    implementability: "strutturale",
    capacityDataNeeds: ["matrice origine-destinazione", "accessibilità ai servizi", "indicatori di quartiere", "piano integrato opere-mobilità"],
    tags: ["mobilità", "periferie", "rigenerazione integrata", "sicurezza", "quasi-esperimento"],
    revisionHistory: [{ date: "2026-08-29", note: "Prima verifica e inserimento nell'archivio." }],
  },
  {
    id: "milano-area-c-congestion-charge",
    title: "Area C: tariffazione degli accessi al centro e restrizione del traffico",
    authority: "Comune di Milano",
    territory: "Milano — Cerchia dei Bastioni",
    country: "Italia",
    implementationYear: "2012–presente",
    problem: "Congestione, traffico privato e inquinamento atmosferico nel centro urbano.",
    measure:
      "Zona a traffico limitato con tariffa di ingresso, varchi elettronici che rilevano le targhe, restrizioni per alcune categorie emissive ed esenzioni definite.",
    mechanism:
      "Attribuire un prezzo all'ingresso in auto nell'area centrale e limitarne l'accesso per modificare volumi, orari, itinerari e composizione del traffico, incentivando alternative modali.",
    population: "Veicoli e utenti che accedono al centro di Milano nei giorni e negli orari di attivazione.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["ambiente_clima_energia", "salute_pubblica_locale"],
    interventionTypes: ["regolazione", "incentivo_economico", "infrastruttura_digitale", "enforcement_controllo"],
    tools: ["varchi elettronici", "ticket di ingresso", "regole emissive", "esenzioni", "monitoraggio traffico e qualità dell'aria"],
    territorialScale: "Zona urbana centrale",
    interventionStatus: "Operativa; regole ed esenzioni aggiornate periodicamente dal Comune.",
    evaluationMethod:
      "Natural experiment basato sulla sospensione giudiziaria inattesa del 2012, integrato da successive valutazioni controfattuali; uno studio del 2026 usa matrix completion su dati mensili 2008–2019 e controlli meteorologici.",
    comparator: "Periodo di sospensione inattesa e controfattuali costruiti con serie di monitoraggio della Lombardia.",
    outcomes: ["ingressi veicolari", "composizione del traffico", "PM10", "CO", "NOx"],
    results:
      "La sospensione della tariffa ha fatto aumentare nettamente gli ingressi, fornendo evidenza quasi-sperimentale dell'effetto sul traffico. Le analisi sull'aria indicano benefici per il particolato, mentre l'evidenza sui NOx è meno consistente.",
    effectSize:
      "Durante la sospensione gli ingressi in Area C sono aumentati del 14,5%; la sintesi OECD riporta +6% di CO dentro l'area e +17% di PM10 all'esterno durante la sospensione. La valutazione 2026 trova una riduzione statisticamente significativa del PM10 dopo l'introduzione, ma nessun effetto coerente sui NOx.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede quadro regolatorio, sistema di varchi e pagamento, gestione delle esenzioni, enforcement, monitoraggio e disponibilità di alternative di trasporto. Costi non comparabili in modo semplice con un comune medio-piccolo.",
    limitations: [
      "I risultati derivano da una grande area metropolitana con rete di trasporto pubblico molto più estesa di quella lametina.",
      "Traffico, composizione del parco veicoli e dispersione degli inquinanti cambiano nel tempo.",
      "Il PM10 mostra effetti più chiari dei NOx: non va presentata come misura risolutiva per ogni inquinante.",
    ],
    unintendedEffects: "La letteratura documenta sostituzioni temporali e spaziali verso orari e strade non tariffati; vanno considerate nel disegno.",
    primarySource: {
      label: "Comune di Milano — Area C",
      url: "https://www.comune.milano.it/aree-tematiche/mobilita/area-c",
    },
    evaluationStudies: [
      {
        label: "Journal of Urban Economics",
        url: "https://ideas.repec.org/p/hal/journl/hal-01589743.html",
        citation: "Gibson & Carnovale (2015), The effects of road pricing on driver behavior and air pollution",
        doi: "10.1016/j.jue.2015.06.005",
      },
      {
        label: "Environmetrics",
        url: "https://onlinelibrary.wiley.com/doi/10.1002/env.70111",
        citation: "Adam, Biancalani & Metulini (2026), Counterfactual Evaluation of Traffic Restrictions on Air Quality in Milan's Congestion Charge Zone Using Matrix Completion",
        doi: "10.1002/env.70111",
      },
    ],
    lastVerifiedAt: "2026-08-29",
    transferabilityItaly:
      "Trasferibilità tecnica e giuridica possibile solo dopo una diagnosi locale di congestione e con un disegno proporzionato. Per città più piccole può essere più realistico un perimetro ridotto, una ZTL dinamica o misure mirate anziché una congestion charge piena.",
    lameziaAdaptation:
      "Non replicare Area C per analogia. Prima misurare flussi, origine-destinazione, occupazione del suolo, parcheggi e alternative modali nei principali poli; solo se emerge un problema concentrato, valutare un micro-perimetro sperimentale con orari, esenzioni e outcome definiti ex ante.",
    implementability: "strutturale",
    capacityDataNeeds: ["conteggi traffico", "matrici origine-destinazione", "offerta TPL", "qualità dell'aria", "quadro giuridico e costi di enforcement"],
    tags: ["congestion pricing", "ZTL", "PM10", "mobilità", "natural experiment"],
    revisionHistory: [{ date: "2026-08-29", note: "Inserita includendo la nuova valutazione controfattuale pubblicata nel luglio 2026." }],
  },
  {
    id: "junin-property-tax-deterrence-message",
    title: "Messaggio di deterrenza nella bolletta dei tributi immobiliari",
    authority: "Municipalidad de Junín",
    territory: "Junín, Provincia di Buenos Aires",
    country: "Argentina",
    implementationYear: "2011",
    problem: "Bassa compliance nel pagamento di un tributo municipale legato ai servizi alla proprietà.",
    measure:
      "Inserimento nella bolletta di messaggi randomizzati: deterrenza con sanzioni e conseguenze legali effettive, reciprocità/uso delle risorse, informazione sul comportamento degli altri contribuenti; gruppo di controllo senza messaggio.",
    mechanism:
      "Correggere percezioni inesatte sul costo del mancato pagamento o sulle norme sociali attraverso informazione saliente incorporata in una comunicazione già dovuta.",
    population: "Circa 23.000 contribuenti individuali del tributo immobiliare municipale.",
    primaryArea: "fiscalita_entrate_riscossione",
    secondaryAreas: ["capacita_amministrativa_personale"],
    interventionTypes: ["nudging_comunicazione", "enforcement_controllo", "informazione_trasparenza"],
    tools: ["bolletta tributaria", "randomizzazione per blocchi geografici", "messaggio sulle conseguenze legali"],
    territorialScale: "Intero universo dei contribuenti individuali registrati nel Comune",
    interventionStatus: "Esperimento concluso; evidenza storica utilizzabile per il design di comunicazioni fiscali.",
    evaluationMethod:
      "Randomized field experiment sull'intero universo dei contribuenti individuali, randomizzato entro 25 blocchi geografici in tre trattamenti e un controllo.",
    comparator: "Contribuenti che hanno ricevuto la bolletta senza messaggio aggiuntivo.",
    outcomes: ["probabilità di pagamento del tributo"],
    results:
      "Solo il messaggio di deterrenza, che riportava sanzioni e conseguenze legali reali, ha aumentato in media la compliance; i messaggi su reciprocità/equità e comportamento altrui non hanno prodotto effetti medi comparabili.",
    effectSize: "Aumento della probabilità di pagamento di quasi 5 punti percentuali rispetto al controllo.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Costo marginale basso se il Comune dispone già di una bolletta/comunicazione e di un'anagrafica affidabile; richiede revisione legale del testo e tracciamento degli esiti.",
    limitations: [
      "Il contenuto efficace era specifico al sistema sanzionatorio locale e non può essere copiato in un altro ordinamento.",
      "L'esperimento è del 2011 e il canale era cartaceo: canali digitali e comportamento dei contribuenti possono modificare l'effetto.",
      "Eterogeneità degli effetti: una comunicazione efficace in media non è necessariamente ottimale per tutti i segmenti.",
    ],
    unintendedEffects: "Nessun beneficio medio dimostrato dai messaggi di reciprocità o peer effect; comunicazioni non calibrate possono quindi aggiungere rumore senza migliorare la riscossione.",
    primarySource: {
      label: "Inter-American Development Bank — working paper originale",
      url: "https://publications.iadb.org/en/tax-compliance-and-enforcement-pampas-evidence-field-experiment",
    },
    evaluationStudies: [
      {
        label: "Journal of Economic Behavior & Organization",
        url: "https://ideas.repec.org/a/eee/jeborg/v116y2015icp65-82.html",
        citation: "Castro & Scartascini (2015), Tax compliance and enforcement in the pampas: evidence from a field experiment",
        doi: "10.1016/j.jebo.2015.04.002",
      },
    ],
    lastVerifiedAt: "2026-08-29",
    transferabilityItaly:
      "Alta come principio di design: rendere salienti obblighi, scadenze e conseguenze realmente previste dalla legge dentro comunicazioni esistenti. Il testo deve però essere costruito sul quadro tributario italiano e non assumere che ogni tributo locale reagisca allo stesso modo.",
    lameziaAdaptation:
      "Su una specifica entrata comunale con margine di recupero, testare messaggi informativi differenti su popolazioni eleggibili e predefinite, con gruppo di controllo e outcome amministrativi. Il messaggio di deterrenza deve riportare esclusivamente conseguenze certe e giuridicamente corrette, senza linguaggio intimidatorio.",
    implementability: "quick_win",
    capacityDataNeeds: ["anagrafica contribuenti pulita", "storico pagamento", "canale di comunicazione", "protocollo sperimentale e verifica legale"],
    tags: ["tributi locali", "compliance", "nudge", "riscossione", "RCT"],
    revisionHistory: [{ date: "2026-08-29", note: "Prima verifica e inserimento nell'archivio." }],
  },
  {
    id: "brazil-participatory-budgeting-health-sanitation",
    title: "Bilancio partecipativo e riallocazione verso salute e servizi igienico-sanitari",
    authority: "Comuni brasiliani che hanno adottato il bilancio partecipativo",
    territory: "Panel di comuni brasiliani",
    country: "Brasile",
    implementationYear: "1990–2004",
    problem:
      "Disallineamento tra priorità di spesa municipale e preferenze dei residenti, con forti bisogni in salute e servizi igienico-sanitari.",
    measure:
      "Processi di bilancio partecipativo nei quali residenti e amministrazione interagiscono sulla definizione di una quota delle priorità di spesa municipale.",
    mechanism:
      "Migliorare i flussi informativi tra cittadini e rappresentanti, rendere più visibili le preferenze locali e spostare risorse verso servizi con domanda sociale elevata.",
    population: "Residenti dei comuni brasiliani inclusi nel panel 1990–2004.",
    primaryArea: "partecipazione_democrazia_locale",
    secondaryAreas: ["salute_pubblica_locale", "welfare_inclusione_servizi_sociali"],
    interventionTypes: ["partecipazione_codesign", "modifica_organizzativa_processo", "informazione_trasparenza"],
    tools: ["assemblee/processi partecipativi", "prioritizzazione della spesa", "bilancio comunale"],
    territorialScale: "Comune; analisi comparata multi-comune",
    interventionStatus: "Adozione variabile tra comuni e nel tempo; evidenza riferita al periodo 1990–2004.",
    evaluationMethod:
      "Panel municipale con difference-in-differences e propensity score matching, più robustness checks sulla selezione nell'adozione.",
    comparator: "Comuni senza bilancio partecipativo o non ancora adottanti nello stesso periodo.",
    outcomes: ["quota di spesa in salute e sanitation", "mortalità infantile"],
    results:
      "I comuni adottanti hanno destinato una quota maggiore delle risorse a salute e servizi igienico-sanitari; questo cambiamento è associato a una riduzione significativa della mortalità infantile.",
    effectSize:
      "Riduzione stimata della mortalità infantile di circa 1–2 decessi per 1.000 bambini residenti, pari a circa il 5–10% del livello iniziale del 1990.",
    evidenceStrength: "moderata",
    costsRequirements:
      "Costi soprattutto organizzativi: regole, facilitazione, comunicazione, verifica di ammissibilità, istruttoria tecnica dei progetti e capacità di attuare e rendicontare le scelte.",
    limitations: [
      "L'adozione non è randomizzata; DiD, matching e robustness checks riducono ma non eliminano il rischio di confondimento tempo-variante.",
      "L'effetto medio deriva da numerosi comuni e non implica che ogni singola esperienza produca lo stesso risultato.",
      "Il contesto istituzionale e di bisogno del Brasile degli anni 1990–2000 è molto diverso da quello italiano contemporaneo.",
    ],
    unintendedEffects: "Rischio di partecipazione selettiva, cattura da gruppi più organizzati e aspettative non soddisfatte se la quota di bilancio o la capacità realizzativa sono troppo limitate.",
    primarySource: {
      label: "World Development — studio originale sull'adozione municipale",
      url: "https://ideas.repec.org/a/eee/wdevel/v53y2014icp94-110.html",
    },
    evaluationStudies: [
      {
        label: "World Development",
        url: "https://ideas.repec.org/a/eee/wdevel/v53y2014icp94-110.html",
        citation: "Gonçalves (2014), The Effects of Participatory Budgeting on Municipal Expenditures and Infant Mortality in Brazil",
        doi: "10.1016/j.worlddev.2013.01.009",
      },
      {
        label: "3ie evidence map — study design",
        url: "https://gapmaps.3ieimpact.org/effects-participatory-budgeting-brazil-goncalves-2014",
        citation: "3ie classification: Difference-in-Differences and Propensity Score Matching",
      },
    ],
    lastVerifiedAt: "2026-08-29",
    transferabilityItaly:
      "Alta per il processo, non per la dimensione dell'effetto. Un Comune italiano può delimitare una quota reale e trasparente di risorse, definire criteri di ammissibilità e pubblicare l'intero ciclo dalla proposta alla realizzazione.",
    lameziaAdaptation:
      "Avviare un ciclo pilota su una quota circoscritta e concretamente spendibile, con proposte pubbliche, verifica tecnica preventiva, voto/decisione trasparente e dashboard di attuazione. Prevedere outreach mirato per ridurre la sovrarappresentazione dei gruppi già più attivi.",
    implementability: "medio_termine",
    capacityDataNeeds: ["quota di bilancio disponibile", "regolamento e criteri", "piattaforma o processo di partecipazione", "tracking pubblico dei progetti"],
    tags: ["bilancio partecipativo", "partecipazione", "sanità", "spesa pubblica", "DiD"],
    revisionHistory: [{ date: "2026-08-29", note: "Prima verifica e inserimento nell'archivio." }],
  },
] as const satisfies readonly EvidenceIntervention[];

export function getEvidenceCountries() {
  return Array.from(new Set(EVIDENCE_INTERVENTIONS.map((item) => item.country))).sort((a, b) =>
    a.localeCompare(b, "it"),
  );
}

export function getEvidenceAreas() {
  return Array.from(new Set(EVIDENCE_INTERVENTIONS.map((item) => item.primaryArea))).sort((a, b) =>
    EVIDENCE_AREA_LABELS[a].localeCompare(EVIDENCE_AREA_LABELS[b], "it"),
  );
}

export function getEvidenceInterventionTypes() {
  return Array.from(new Set(EVIDENCE_INTERVENTIONS.flatMap((item) => item.interventionTypes))).sort((a, b) =>
    EVIDENCE_INTERVENTION_TYPE_LABELS[a].localeCompare(EVIDENCE_INTERVENTION_TYPE_LABELS[b], "it"),
  );
}

export function findEvidenceIntervention(id: string) {
  return EVIDENCE_INTERVENTIONS.find((item) => item.id === id) ?? null;
}
