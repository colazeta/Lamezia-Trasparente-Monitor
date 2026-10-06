import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_06 = [
  {
    id: "washington-capital-bikeshare-congestion",
    title: "Capital Bikeshare come rete di mobilità condivisa per ridurre la congestione locale",
    authority: "District Department of Transportation / Capital Bikeshare partner jurisdictions",
    territory: "Washington, D.C. metropolitan area",
    country: "Stati Uniti",
    implementationYear: "Settembre 2010–presente; espansione valutata nel 2011–2012",
    problem:
      "Congestione urbana e carenza di alternative flessibili per spostamenti brevi e connessioni di primo/ultimo miglio con il trasporto pubblico.",
    measure:
      "Sistema pubblico di bike sharing a stazioni, avviato con 400 biciclette e 49 stazioni e poi rapidamente ampliato; le biciclette possono essere prelevate in una stazione e restituite in un'altra della rete.",
    mechanism:
      "Aumentare l'accessibilità della bicicletta senza richiedere il possesso individuale e offrire un'alternativa per viaggi urbani brevi può sostituire parte degli spostamenti in auto e integrare metropolitana e autobus, riducendo la congestione nelle aree servite.",
    population:
      "Residenti, pendolari e visitatori dell'area metropolitana di Washington che effettuano spostamenti urbani, in particolare nei quartieri serviti dalle stazioni.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["ambiente_clima_energia", "digitalizzazione_servizi_online"],
    interventionTypes: [
      "servizio_diretto",
      "infrastruttura_fisica",
      "infrastruttura_digitale",
      "partnership_pubblico_privato_terzo_settore",
    ],
    tools: [
      "stazioni di bike sharing",
      "biciclette ed e-bike",
      "app e disponibilità in tempo reale",
      "rebalancing della flotta",
      "pianificazione della localizzazione delle stazioni",
    ],
    territorialScale: "Metropolitana, con analisi causale a livello di census block group",
    interventionStatus:
      "Programma permanente. Nel 2026 DDOT continua a gestire Capital Bikeshare con le giurisdizioni partner; la rete supera 700 stazioni nell'area metropolitana.",
    evaluationMethod:
      "Quasi-esperimento che sfrutta l'espansione scaglionata delle stazioni nel 2011–2012. Gli autori combinano propensity-score matching su caratteristiche socioeconomiche, congestione pre-trattamento e infrastruttura di trasporto con effetti fissi di block group e tempo. Il dataset comprende 2.790 segmenti stradali, 305 block group e 560.798 osservazioni block-group-tempo; nel matching principale 39 block group trattati sono confrontati con 36 controlli unici.",
    comparator:
      "Block group senza stazioni, selezionati tramite propensity-score matching e, nelle specifiche principali, evitando controlli immediatamente adiacenti ai trattati per limitare contaminazione spaziale.",
    outcomes: [
      "congestione del traffico motorizzato",
      "eterogeneità dell'effetto per livello iniziale di congestione",
      "spillover spaziali sui block group vicini",
    ],
    results:
      "Le specifiche matched indicano una riduzione causale della congestione nelle aree con stazioni. La stima finale viene sintetizzata dagli autori come una riduzione fino a circa il 4%; nella specifica che controlla esplicitamente il trattamento nei block group adiacenti il coefficiente è circa −2,9%. L'effetto è concentrato nelle aree inizialmente più congestionate. I risultati sugli spillover sono sensibili alla definizione geografica della prossimità e non supportano una conclusione semplice di aumento della congestione nelle aree confinanti.",
    effectSize:
      "Congestione locale circa −2,9% nella specifica con controllo dei block group adiacenti e fino a circa −4% nelle specifiche principali del paper; beneficio maggiore nelle aree ad alta congestione.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede capitale per stazioni e flotta, manutenzione, redistribuzione delle biciclette, sistema digitale e una massa critica di stazioni sufficientemente vicine. Lo studio stima benefici di congestione ma non fornisce un costo netto trasferibile per una città italiana.",
    limitations: [
      "L'allocazione delle stazioni non è randomizzata; il matching riduce ma non elimina il rischio di selezione su fattori non osservati.",
      "La misura dell'effetto riguarda la congestione locale nelle strade urbane del campione e non dimostra automaticamente benefici su emissioni, salute o traffico metropolitano complessivo.",
      "Le stime degli spillover cambiano con la definizione di adiacenza e distanza, per cui gli effetti sulle strade vicine devono essere monitorati empiricamente.",
      "Washington presenta densità, rete ciclabile, trasporto pubblico e domanda di viaggio diversi da Lamezia Terme.",
    ],
    unintendedEffects:
      "Possibile redistribuzione del traffico tra aree adiacenti e rischio di bassa utilizzazione se la rete è troppo rada; servono monitoraggio spaziale, dati di utilizzo e rebalancing.",
    primarySource: {
      label: "District Department of Transportation — Capital Bikeshare",
      url: "https://ddot.dc.gov/page/capital-bikeshare",
    },
    evaluationStudies: [
      {
        label: "Journal of Environmental Economics and Management — Capital Bikeshare and congestion",
        url: "https://doi.org/10.1016/j.jeem.2017.03.007",
        citation:
          "Hamilton TL, Wichman CJ (2018), Bicycle Infrastructure and Traffic Congestion: Evidence from DC's Capital Bikeshare, Journal of Environmental Economics and Management 87:72–93",
        doi: "10.1016/j.jeem.2017.03.007",
      },
    ],
    lastVerifiedAt: "2026-10-06",
    transferabilityItaly:
      "Media-alta come servizio di mobilità condivisa, ma l'efficacia dipende fortemente da densità delle destinazioni, sicurezza ciclabile e rete sufficientemente compatta. Il risultato di Washington non giustifica una rete diffusa in un territorio policentrico senza una diagnosi della domanda.",
    lameziaAdaptation:
      "Prima stimare domanda potenziale, distanze, pendenze, nodi TPL e destinazioni ad alta frequenza. Se la diagnosi è favorevole, testare un cluster compatto di stazioni in una sola area urbana o lungo pochi corridoi/nodi multimodali, con e-bike dove utili, anziché disperdere subito le stazioni sull'intero territorio. Pre-specificare utilizzo per bici/stazione, sostituzione modale, disponibilità, costi di rebalancing e variazioni di traffico nelle strade trattate e adiacenti.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "origine-destinazione e flussi di mobilità",
      "rete e sicurezza ciclabile",
      "domanda potenziale per nodo",
      "dati di utilizzo e disponibilità in tempo reale",
      "conteggi di traffico trattati e comparatori",
      "costi di esercizio e rebalancing",
    ],
    tags: ["Washington DC", "bike sharing", "congestione", "mobilità condivisa", "propensity score matching", "quasi-esperimento"],
    revisionHistory: [
      {
        date: "2026-10-06",
        note: "Prima verifica e inserimento; distinta la stima circa −2,9% della specifica con controllo spaziale dalla sintesi fino a circa −4% del paper finale.",
      },
    ],
  },
  {
    id: "trenton-lead-service-line-community-grant-outreach",
    title: "Sostituzione delle linee idriche in piombo con sussidio semplice e outreach di comunità",
    authority: "City of Trenton / Trenton Water Works / East Trenton Collaborative",
    territory: "East Trenton e area servita da Trenton Water Works, New Jersey",
    country: "Stati Uniti",
    implementationYear:
      "Programma TWW dal 2019; intervento comunitario valutato marzo 2021–fine 2022; sostituzione gratuita e obbligatoria dal 2024",
    problem:
      "Presenza di lead service lines e partecipazione incompleta dei residenti alle ispezioni e sostituzioni, soprattutto per costi, sfiducia, oneri amministrativi e split incentive tra proprietari e inquilini.",
    measure:
      "Nel quartiere East Trenton un'organizzazione comunitaria, integrata con il programma della utility municipale, offrì un sussidio del 100% del contributo di 1.000 dollari ai proprietari residenti e del 50% ai locatori, con domanda semplice e outreach intensivo tramite incontri, canvassing porta a porta, canali di quartiere e social media. Il programma TWW è successivamente evoluto verso sostituzione gratuita e obbligatoria per le proprietà eleggibili.",
    mechanism:
      "La combinazione di rimozione della barriera economica, procedura semplice e trusted messenger locale riduce simultaneamente costi finanziari, informativi e di fiducia che ostacolano accesso, ispezione e sostituzione.",
    population:
      "Proprietari, locatori e residenti di immobili con linee di servizio idrico sospette o confermate in East Trenton; il programma TWW serve anche comuni limitrofi.",
    primaryArea: "salute_pubblica_locale",
    secondaryAreas: ["welfare_inclusione_servizi_sociali", "capacita_amministrativa_personale"],
    interventionTypes: [
      "incentivo_economico",
      "nudging_comunicazione",
      "servizio_diretto",
      "partnership_pubblico_privato_terzo_settore",
      "targeting_data_analytics",
    ],
    tools: [
      "inventario delle service lines",
      "sussidio alla sostituzione",
      "canvassing porta a porta",
      "eventi e comunicazione di quartiere",
      "ispezioni e verifica del materiale",
      "self-survey fotografico",
    ],
    territorialScale: "Quartiere nel trial; utility municipale multi-comune nel programma corrente",
    interventionStatus:
      "Programma corrente e ampliato. Nel luglio 2026 Trenton Water Works dichiarava oltre 11.000 linee sostituite con circa 70 milioni di dollari investiti; le ordinanze 24-020 e 24-022 hanno reso la sostituzione gratuita e obbligatoria per le proprietà eleggibili, con obiettivo di eliminazione entro il 2031.",
    evaluationMethod:
      "Valutazione quasi-sperimentale synthetic-control difference-in-differences del programma comunitario su 18.879 proprietà urbane, 1.010 delle quali nei quattro block group trattati di East Trenton. Lo stesso studio include inoltre un field experiment randomizzato separato su 3.100 proprietà che testava una sola cartolina informativa su un diverso grant comunale.",
    comparator:
      "Controllo sintetico costruito da proprietà urbane non esposte al programma comunitario e bilanciato sui livelli pre-intervento; nel trial della cartolina, 1.550 proprietà trattate contro 1.550 controlli.",
    outcomes: [
      "registrazione al programma LSLR",
      "ispezione interna della linea",
      "sostituzione della linea confermata in piombo",
      "eterogeneità per proprietà in affitto e valore dell'immobile",
      "take-up di un grant pubblicizzato soltanto con cartolina",
    ],
    results:
      "Dopo l'avvio del grant comunitario, le registrazioni risultano circa doppie rispetto al controllo sintetico e ispezioni e sostituzioni oltre il 50% più alte; per le proprietà con linea privata confermata in piombo, la sostituzione aumenta di 17 punti percentuali più del controllo sintetico. Il test randomizzato di una singola cartolina relativa a un diverso grant non produce invece effetti statisticamente significativi su registrazione, ispezione o sostituzione. La combinazione di sussidio, semplicità e outreach intensivo appare quindi il meccanismo rilevante, non la sola informazione sulla disponibilità di fondi.",
    effectSize:
      "Programma comunitario: registrazioni circa 2×; ispezioni e sostituzioni >50% rispetto al controllo sintetico; sostituzione tra linee confermate +17 punti percentuali. Cartolina informativa: +1,7% registrazione, +2,8% ispezione, +0,8% sostituzione, tutti effetti non significativi.",
    evidenceStrength: "forte",
    costsRequirements:
      "Nel trattamento storico il grant copriva il contributo utente di 1.000 dollari; il costo reale di sostituzione era molto maggiore. Nel 2026 TWW indica tipicamente 5.000–10.000 dollari per proprietà e un programma pluriennale da 175 milioni di dollari. Servono inventario affidabile, accesso alle proprietà, procurement, coordinamento con lavori stradali e finanziamento stabile.",
    limitations: [
      "Il programma comunitario combina sussidio e outreach: il synthetic control non separa causalmente il contributo dei singoli componenti.",
      "Un solo quartiere costituisce l'unità principale trattata e il periodo è influenzato dalla ripresa operativa dopo le restrizioni COVID, anche se il controllo sintetico assorbe gli shock comuni.",
      "La partecipazione volontaria non ha raggiunto il 100%: durante lo studio la sostituzione fra le proprietà con linea confermata nel quartiere trattato si fermava intorno al 54%.",
      "Proprietà, responsabilità e regolazione delle linee idriche statunitensi non sono direttamente sovrapponibili al servizio idrico integrato italiano.",
    ],
    unintendedEffects:
      "Gli oneri di accesso e i lavori in proprietà private possono generare ritardi e disagi; la politica corrente di Trenton ha superato parte del problema di take-up rendendo la sostituzione gratuita e obbligatoria, ma richiede capacità finanziaria e di cantiere molto maggiore.",
    primarySource: {
      label: "City of Trenton — Lead Service Line Replacement Program milestones",
      url: "https://www.trentonnj.org/m/newsflash/home/detail/1505",
    },
    evaluationStudies: [
      {
        label: "Environmental and Resource Economics — customer participation in lead-pipe replacement",
        url: "https://doi.org/10.1007/s10640-023-00836-9",
        citation:
          "Klemick H, Wolverton A, Parthum B, Epstein K (2024), Factors Influencing Customer Participation in a Program to Replace Lead Pipes for Drinking Water, Environmental and Resource Economics 87:791–832",
        doi: "10.1007/s10640-023-00836-9",
      },
    ],
    lastVerifiedAt: "2026-10-06",
    transferabilityItaly:
      "Alta come principio di implementazione — inventario, gratuità o forte sussidio, procedure a basso attrito e outreach tramite soggetti fidati — ma subordinata alla presenza effettiva di materiali a rischio e alla ripartizione di competenze tra Comune, gestore idrico e autorità d'ambito.",
    lameziaAdaptation:
      "Prima verificare con il gestore idrico se esista un inventario affidabile dei materiali delle derivazioni e quali segmenti privati/pubblici richiedano intervento. Se emerge un rischio materiale, costruire un pilot per area con accesso gratuito o fortemente sovvenzionato, modulo minimo, contatto diretto e partner territoriali fidati; misurare separatamente identificazione, consenso/accesso, sostituzione completata, tempi e rinunce. Una semplice campagna informativa non dovrebbe essere considerata sufficiente.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "inventario dei materiali delle derivazioni",
      "titolarità e responsabilità delle tratte",
      "dati su età degli edifici e vulnerabilità",
      "procedure di accesso alle proprietà",
      "procurement e capacità di cantiere",
      "finanziamento pluriennale",
      "tracking ispezione-sostituzione",
    ],
    tags: ["Trenton", "acqua potabile", "piombo", "infrastruttura idrica", "outreach", "synthetic control", "field experiment"],
    revisionHistory: [
      {
        date: "2026-10-06",
        note: "Prima verifica e inserimento; distinto l'effetto positivo del grant con outreach dal risultato nullo della cartolina informativa e aggiornato lo stato del programma al luglio 2026.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
