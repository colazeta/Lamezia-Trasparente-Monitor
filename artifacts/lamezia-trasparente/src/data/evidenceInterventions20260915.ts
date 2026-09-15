import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_15 = [
  {
    id: "milan-area-c-congestion-charge-pm10",
    title: "Area C: congestion charge e restrizioni di accesso nel centro di Milano",
    authority: "Comune di Milano",
    territory: "Milano — Cerchia dei Bastioni / Area C",
    country: "Italia",
    implementationYear: "2012; misura tuttora operativa nel 2026",
    problem:
      "Congestione veicolare e inquinamento atmosferico nel centro urbano, con necessità di ridurre gli ingressi dei veicoli e l'esposizione a emissioni da traffico.",
    measure:
      "Zona a traffico limitato con accesso a pagamento nei giorni feriali, controllo elettronico delle targhe, divieti progressivi per le classi veicolari più inquinanti ed esenzioni/discipline specifiche per categorie autorizzate.",
    mechanism:
      "Aumentare il costo generalizzato dell'accesso in auto al centro e limitare i veicoli più emissivi, inducendo riduzione o modifica degli spostamenti e quindi delle emissioni locali da traffico.",
    population: "Residenti, pendolari, visitatori e utenti della rete stradale nell'area centrale di Milano e nelle zone circostanti.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["ambiente_clima_energia", "salute_pubblica_locale", "digitalizzazione_servizi_online"],
    interventionTypes: ["incentivo_economico", "regolazione", "enforcement_controllo", "infrastruttura_digitale"],
    tools: ["congestion charge", "43 varchi elettronici", "lettura targhe", "calendario dei divieti per classe emissiva", "portale digitale Area C", "monitoraggio qualità dell'aria ARPA Lombardia"],
    territorialScale: "Zona centrale urbana / cordone di accesso",
    interventionStatus:
      "Attiva nel 2026. Il Comune indica che Area C opera tutto l'anno dal lunedì al venerdì, 7:30–19:30, con accesso regolato da varchi elettronici e calendario di divieti aggiornato.",
    evaluationMethod:
      "Valutazione controfattuale pubblicata nel 2026 con Matrix Completion su dati mensili di qualità dell'aria 2008–2019 in Lombardia, usando località non trattate come donor pool e includendo variabili meteorologiche per ridurre il confondimento. Il metodo ricostruisce la traiettoria controfattuale di Area C senza richiedere la classica assunzione di parallel trends.",
    comparator:
      "Controfattuale sintetico/data-driven ricostruito da stazioni e territori lombardi non soggetti ad Area C, condizionato anche su variabili meteorologiche.",
    outcomes: ["concentrazione di PM10", "concentrazione di NOx"],
    results:
      "La valutazione 2026 identifica una riduzione statisticamente significativa delle concentrazioni di PM10 all'interno di Area C dopo l'introduzione della policy. Non trova invece un effetto coerente sui NOx. Il risultato supporta quindi un beneficio specifico sul particolato, non un miglioramento generalizzato di tutti gli inquinanti.",
    effectSize:
      "Riduzione del PM10 statisticamente significativa nel controfattuale Matrix Completion; l'abstract e i metadati pubblicamente accessibili verificati non riportano un singolo effect size sintetico affidabile, quindi il record non inventa una magnitudine. Nessun effetto consistente sui NOx.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede quadro regolatorio per la ZTL e la tariffazione, rete di varchi/camere e back-office targhe, gestione delle esenzioni, assistenza agli utenti, enforcement e monitoraggio continuo di traffico e qualità dell'aria. I costi e la proporzionalità dipendono dalla scala del cordone e dall'infrastruttura già disponibile.",
    limitations: [
      "La Matrix Completion rafforza il controfattuale ma resta una valutazione quasi-sperimentale di una singola città, non un RCT.",
      "Area C combina prezzo di accesso e restrizioni per classe emissiva; il disegno valuta il pacchetto e non identifica separatamente il contributo di ciascuna componente.",
      "Il beneficio osservato è robusto per PM10 ma non per NOx: non va presentato come riduzione uniforme dell'inquinamento atmosferico.",
      "Il centro di Milano ha densità, trasporto pubblico, domanda di accesso e capacità amministrativa diverse da Lamezia Terme; la trasferibilità dello strumento completo è limitata.",
    ],
    unintendedEffects:
      "Possibili deviazioni del traffico ai margini della zona, effetti distributivi sui soggetti con minori alternative modali e costi amministrativi di compliance; questi aspetti devono essere misurati esplicitamente in qualsiasi adattamento.",
    primarySource: {
      label: "Comune di Milano — Area C",
      url: "https://www.comune.milano.it/argomenti/mobilita/area-c",
    },
    evaluationStudies: [
      {
        label: "Environmetrics — Counterfactual Evaluation of Traffic Restrictions on Air Quality in Milan's Congestion Charge Zone Using Matrix Completion",
        url: "https://onlinelibrary.wiley.com/doi/10.1002/env.70111",
        citation: "Adam R, Biancalani F, Metulini R (2026), Counterfactual Evaluation of Traffic Restrictions on Air Quality in Milan's Congestion Charge Zone Using Matrix Completion",
        doi: "10.1002/env.70111",
      },
    ],
    lastVerifiedAt: "2026-09-15",
    transferabilityItaly:
      "Elevata come riferimento giuridico-amministrativo italiano per ZTL, access control e valutazione data-driven, ma bassa per una replica meccanica del congestion charge in un comune con struttura urbana molto diversa. È soprattutto trasferibile il principio di legare restrizioni a baseline, controfattuale e monitoraggio multi-outcome.",
    lameziaAdaptation:
      "Non partire da una tariffa di accesso. Costruire prima una baseline su flussi, velocità, sosta, TPL, PM10/NOx e incidenti nei principali poli urbani e commerciali; identificare eventuali micro-zone con congestione documentata e testare misure proporzionate (gestione accessi, sosta, logistica, priorità TPL/pedonale). Qualunque pricing richiederebbe poi verifica giuridica, analisi distributiva e monitoraggio dei percorsi di deviazione.",
    implementability: "strutturale",
    capacityDataNeeds: ["conteggi e origini-destinazioni", "dati di sosta", "qualità dell'aria", "offerta TPL", "mappa accessi e viabilità", "analisi giuridica", "valutazione distributiva", "controfattuale ex ante"],
    tags: ["Area C", "Milano", "congestion charge", "ZTL", "PM10", "matrix completion", "mobilità", "qualità dell'aria"],
    revisionHistory: [{ date: "2026-09-15", note: "Prima verifica e inserimento sulla base della nuova valutazione controfattuale pubblicata nel 2026 e della documentazione corrente del Comune di Milano." }],
  },
  {
    id: "seattle-sweetened-beverage-tax",
    title: "Sweetened Beverage Tax sulla distribuzione di bevande zuccherate",
    authority: "City of Seattle",
    territory: "Seattle, Washington",
    country: "Stati Uniti",
    implementationYear: "2018; tassa tuttora operativa",
    problem:
      "Elevato consumo di bevande zuccherate e conseguenti rischi nutrizionali, insieme alla necessità di finanziare interventi di accesso al cibo sano, salute infantile e apprendimento precoce.",
    measure:
      "Accisa municipale sulla distribuzione di bevande zuccherate destinate alla vendita al dettaglio in città. L'aliquota standard è 1,75 centesimi di dollaro per oncia, con regole specifiche per piccoli produttori ed esenzioni definite dal codice municipale.",
    mechanism:
      "Far aumentare il prezzo relativo delle bevande tassate per ridurne la domanda e generare contestualmente entrate vincolate a programmi di salute, alimentazione e infanzia.",
    population: "Consumatori, distributori e rivenditori di bevande a Seattle; beneficiari dei programmi finanziati dal gettito.",
    primaryArea: "salute_pubblica_locale",
    secondaryAreas: ["fiscalita_entrate_riscossione", "welfare_inclusione_servizi_sociali"],
    interventionTypes: ["incentivo_economico", "regolazione"],
    tools: ["accisa per oncia", "registrazione e dichiarazione dei distributori", "scanner data retail", "allocazione vincolata del gettito", "Community Advisory Board"],
    territorialScale: "Città / mercato retail",
    interventionStatus:
      "Operativa dal 1 gennaio 2018. Nel 2026 Seattle continua a riscuotere la Sweetened Beverage Tax e a destinare le entrate a programmi definiti dal Seattle Municipal Code.",
    evaluationMethod:
      "Quasi-esperimento difference-in-differences con scanner data a livello UPC, confrontando Seattle con Portland, Oregon, prima e dopo l'entrata in vigore della tassa. Studi successivi estendono l'analisi a grammi di zucchero venduti e possibili sostituzioni verso categorie non tassate.",
    comparator: "Portland, Oregon, città di confronto non soggetta alla Seattle Sweetened Beverage Tax nello stesso periodo.",
    outcomes: ["volume di bevande tassate venduto", "prezzi retail", "volume di bevande non tassate", "grammi di zucchero venduti", "acquisti transfrontalieri", "sostituzione verso dolci e alcol"],
    results:
      "Nel primo anno il volume delle bevande tassate venduto a Seattle diminuisce in media del 22% rispetto a Portland; le bevande non tassate aumentano del 4% e non emerge un aumento significativo delle vendite di bevande tassate nell'area di confine compatibile con cross-border shopping sufficiente a neutralizzare l'effetto. A due anni, i grammi di zucchero venduti dalle bevande tassate sono inferiori del 23%; tenendo conto di bevande non tassate, dolci e zucchero da tavola, lo studio stima una riduzione netta del 19% dei grammi di zucchero venduti. Sono però documentate sostituzioni: vendite di dolci +4–6% e volume complessivo di birra/vino +4–5% in alcune analisi.",
    effectSize:
      "Volume bevande tassate: −22% nel primo anno (p<0,001). Grammi di zucchero da bevande tassate: −23% a uno e due anni; riduzione netta di zucchero venduto dopo le principali sostituzioni: −19% al secondo anno. Bevande non tassate +4% nel primo anno; dolci +4% a un anno e +6% a due anni; birra+vino circa +4% a un anno e +5% a due anni.",
    evidenceStrength: "forte",
    costsRequirements:
      "Servono base legale per un'imposta locale di questo tipo, anagrafe dei distributori, capacità di dichiarazione/riscossione e controllo, definizione delle esenzioni e monitoraggio di prezzi e vendite. In Italia la leva fiscale comunale è strettamente tipizzata: non si può presumere che un Comune possa introdurre autonomamente un'accisa analoga.",
    limitations: [
      "Il disegno è quasi-sperimentale e dipende dall'adeguatezza di Portland come controfattuale e dalla copertura dei punti vendita nei dati scanner.",
      "Gli outcome principali riguardano vendite e zucchero venduto, non dimostrano direttamente riduzioni di obesità, diabete o altri esiti clinici.",
      "Sono osservate sostituzioni verso dolci e, in analisi dedicate, verso bevande alcoliche; il beneficio nutrizionale non va quindi inferito dalla sola riduzione della categoria tassata.",
      "Struttura delle potestà tributarie e del mercato statunitense non è trasferibile automaticamente a un comune italiano.",
    ],
    unintendedEffects:
      "Moderata sostituzione verso prodotti non tassati, inclusi dolci e in alcuni studi birra; possibili effetti regressivi sul prezzo per consumatori a basso reddito devono essere valutati insieme alla destinazione redistributiva del gettito.",
    primarySource: {
      label: "City of Seattle — Sweetened Beverage Tax",
      url: "https://www.seattle.gov/city-finance/business-taxes-and-licenses/seattle-taxes/sweetened-beverage-tax",
    },
    evaluationStudies: [
      {
        label: "Public Health Nutrition / PubMed — beverage prices and volume sold",
        url: "https://pubmed.ncbi.nlm.nih.gov/32070906/",
        citation: "Powell LM et al. (2020), The impact of Seattle's Sweetened Beverage Tax on beverage prices and volume sold",
      },
      {
        label: "JAMA Network Open / PubMed — grams of sugar sold",
        url: "https://pubmed.ncbi.nlm.nih.gov/34739061/",
        citation: "Powell LM et al. (2021), Evaluation of Changes in Grams of Sugar Sold After the Implementation of the Seattle Sweetened Beverage Tax",
        doi: "10.1001/jamanetworkopen.2021.32275",
      },
    ],
    lastVerifiedAt: "2026-09-15",
    transferabilityItaly:
      "Bassa per la replica fiscale diretta senza una specifica base legislativa; alta come lezione di valutazione su prezzi, volumi, sostituzione e uso vincolato delle entrate. Un comune italiano può usare lo stesso framework per misure alimentari nelle proprie competenze — mense, vending, concessioni, eventi e procurement — senza chiamarle impropriamente accise municipali.",
    lameziaAdaptation:
      "Non proporre una soda tax comunale senza base giuridica. Applicare il principio a leve disponibili: standard nutrizionali e pricing nei distributori di edifici comunali/scuole dove competente, capitolati di concessione, acqua gratuita e comunicazione. Definire ex ante un comparatore e misurare vendite per categoria, zucchero totale, sostituzioni verso snack, accettabilità e differenze per utenza.",
    implementability: "medio_termine",
    capacityDataNeeds: ["analisi delle competenze legali", "dati di vendita da vending/concessionari", "capitolati e contratti", "informazioni nutrizionali", "monitoraggio sostituzioni", "analisi distributiva"],
    tags: ["Seattle", "bevande zuccherate", "sugar tax", "salute pubblica", "DiD", "fiscalità", "nutrizione", "sostituzione"],
    revisionHistory: [{ date: "2026-09-15", note: "Prima verifica e inserimento; separati gli effetti robusti sulle vendite dagli outcome sanitari non direttamente identificati e registrate le sostituzioni osservate." }],
  },
  {
    id: "ahmedabad-heat-action-plan",
    title: "Heat Action Plan con allerta precoce e risposta coordinata alle ondate di calore",
    authority: "Ahmedabad Municipal Corporation",
    territory: "Ahmedabad, Gujarat",
    country: "India",
    implementationYear: "Pilot 2013; piena implementazione dal 2014 e successive revisioni",
    problem:
      "Elevata mortalità e morbilità durante ondate di calore estremo in una città densamente popolata, con forte esposizione di lavoratori all'aperto, anziani, bambini e residenti vulnerabili.",
    measure:
      "Heat Action Plan municipale che combina soglie di allerta meteorologica, comunicazione pubblica, coordinamento inter-agenzia, preparazione di ospedali e servizi sanitari, formazione del personale medico e comunitario, acqua/idratazione e misure mirate per gruppi vulnerabili.",
    mechanism:
      "Anticipare l'esposizione estrema con previsioni e livelli di allerta, attivare comportamenti protettivi e servizi prima del picco di calore, aumentare la capacità clinica di riconoscimento e trattamento e coordinare enti che altrimenti reagirebbero separatamente.",
    population: "Popolazione urbana di Ahmedabad, con attenzione a gruppi vulnerabili e persone esposte professionalmente o abitative al caldo estremo.",
    primaryArea: "salute_pubblica_locale",
    secondaryAreas: ["ambiente_clima_energia", "capacita_amministrativa_personale", "welfare_inclusione_servizi_sociali"],
    interventionTypes: ["nudging_comunicazione", "modifica_organizzativa_processo", "formazione_capacity_building", "servizio_diretto", "targeting_data_analytics"],
    tools: ["heat-health warning system", "soglie di temperatura", "bollettini e messaggi pubblici", "protocolli inter-agenzia", "training sanitario", "sorveglianza mortalità", "punti acqua/ORS nelle implementazioni successive"],
    territorialScale: "Città / sistema locale di emergenza sanitaria e climatica",
    interventionStatus:
      "Il piano è stato lanciato nel 2013 e aggiornato ripetutamente negli anni successivi. Il record conserva come evidenza primaria la struttura formalizzata AMC e non attribuisce alle versioni più recenti risultati causali aggiuntivi non valutati.",
    evaluationMethod:
      "Valutazione quasi-sperimentale before-after su mortalità giornaliera e temperatura: distributed lag nonlinear models e confronti delle incidence rates nei periodi 2007–2010 pre-HAP e 2014–2015 post-HAP, con stima di decessi annualizzati evitati. Non esiste un contemporaneo gruppo di controllo urbano equivalente.",
    comparator: "Relazione temperatura-mortalità e tassi di mortalità di Ahmedabad nel periodo pre-HAP 2007–2010 rispetto al periodo post-HAP 2014–2015.",
    outcomes: ["mortalità giornaliera per tutte le cause", "mortalità nei giorni sopra 40°C", "mortalità nei giorni sopra 45°C", "decessi annualizzati stimati evitati"],
    results:
      "La relazione tra calore estremo e mortalità è risultata attenuata dopo l'implementazione, soprattutto alle temperature più elevate. Lo studio stima 1.190 decessi annualizzati evitati nel periodo post-HAP, ma con intervallo di confidenza ampio; gli incidence rate ratio post/pre sopra 40°C e 45°C hanno a loro volta intervalli che includono 1. Il caso è quindi informativo e plausibile, ma non deve essere presentato come un RCT o come prova definitiva che l'intera riduzione sia causata dal piano.",
    effectSize:
      "Massimo RR di mortalità a 47°C: 2,34 (IC95% 1,98–2,76) pre-HAP contro 1,25 (1,02–1,53) post-HAP. IRR post/pre per Tmax >40°C: 0,95 (0,73–1,22); per >45°C: 0,73 (0,29–1,81). Decessi annualizzati stimati evitati: 1.190 (IC95% 162–2.218).",
    evidenceStrength: "moderata",
    costsRequirements:
      "Richiede accesso a previsioni meteorologiche affidabili, soglie di allerta, responsabili e trigger operativi predefiniti, comunicazione multicanale, coordinamento con strutture sanitarie e protezione civile, formazione stagionale e dati tempestivi su eventi sanitari. Molte componenti sono organizzative e relativamente poco costose rispetto a infrastrutture fisiche.",
    limitations: [
      "Confronto before-after senza città di controllo contemporanea: trend temporali, cambiamenti sanitari e altri fattori possono spiegare parte della differenza.",
      "Il periodo post-HAP valutato comprende solo 2014–2015 e il numero di giornate a temperature estreme è limitato, producendo intervalli di confidenza ampi.",
      "La stima dei decessi evitati è modellata e annualizzata, non un conteggio sperimentale direttamente osservato.",
      "Il pacchetto include molte componenti; non è possibile isolare quale specifica misura produca l'effetto.",
    ],
    unintendedEffects:
      "Allerte troppo frequenti o poco calibrate possono produrre alert fatigue; messaggi generici possono non raggiungere lavoratori all'aperto, persone isolate o famiglie in abitazioni surriscaldate, rendendo necessaria una componente esplicita di targeting e outreach.",
    primarySource: {
      label: "Ahmedabad Municipal Corporation / NRDC — Ahmedabad Heat Action Plan 2014",
      url: "https://cdkn.org/resource/report-ahmedabad-heat-action-plan-2014",
    },
    evaluationStudies: [
      {
        label: "Journal of Environmental and Public Health — mortality evaluation",
        url: "https://onlinelibrary.wiley.com/doi/10.1155/2018/7973519",
        citation: "Hess JJ et al. (2018), Building Resilience to Climate Change: Pilot Evaluation of the Impact of India's First Heat Action Plan on All-Cause Mortality",
        doi: "10.1155/2018/7973519",
      },
      {
        label: "International Journal of Environmental Research and Public Health — implementation study",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4024996/",
        citation: "Knowlton K et al. (2014), Development and Implementation of South Asia's First Heat-Health Action Plan in Ahmedabad",
        doi: "10.3390/ijerph110403473",
      },
    ],
    lastVerifiedAt: "2026-09-15",
    transferabilityItaly:
      "Alta per il meccanismo organizzativo: i Comuni italiani, in coordinamento con protezione civile, ASP/ASL e Regione, possono formalizzare soglie, responsabilità, comunicazione e servizi locali durante le ondate di calore. Le competenze sanitarie e di allerta non vanno però attribuite unilateralmente al Comune.",
    lameziaAdaptation:
      "Integrare in un protocollo locale heat-health pre-stagionale dati di temperatura e vulnerabilità, contatti per ASP/protezione civile/servizi sociali, soglie di attivazione, mappa di acqua/ombra/refugi climatici, outreach verso anziani soli e lavoratori esposti e un piano di comunicazione. Per valutarlo, costruire ora la baseline di mortalità/morbilità, accessi urgenti e chiamate nei giorni caldi e confrontare stagioni future con metodi time-series, possibilmente usando comuni comparabili come controllo.",
    implementability: "medio_termine",
    capacityDataNeeds: ["previsioni e soglie meteo", "registro dei trigger operativi", "dati sanitari aggregati", "mappa della vulnerabilità", "rete ASP/protezione civile/servizi sociali", "canali di allerta", "valutazione time-series"],
    tags: ["Ahmedabad", "heat action plan", "ondate di calore", "allerta precoce", "climate adaptation", "mortalità", "salute pubblica", "capacity building"],
    revisionHistory: [{ date: "2026-09-15", note: "Prima verifica e inserimento; classificata evidenza moderata per l'assenza di un controllo contemporaneo e mantenute separate stime modellate e osservazioni dirette." }],
  },
] as const satisfies readonly EvidenceIntervention[];
