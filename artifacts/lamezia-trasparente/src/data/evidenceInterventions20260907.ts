import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_07 = [
  {
    id: "santa-clara-homelessness-prevention-cash-rct",
    title: "Assistenza finanziaria temporanea per prevenire la perdita dell’alloggio",
    authority: "Santa Clara County / Destination: Home / rete Homelessness Prevention System",
    territory: "Santa Clara County, California",
    country: "Stati Uniti",
    implementationYear: "Dal 2017; RCT 2019–2020",
    problem:
      "Famiglie e individui a basso reddito possono entrare in homelessness dopo uno shock temporaneo di liquidità, arretrati di affitto o altre spese abitative, anche quando un intervento finanziario limitato sarebbe sufficiente a mantenere l’alloggio.",
    measure:
      "Assistenza finanziaria temporanea per affitto corrente o arretrato, deposito cauzionale, utenze e altre spese strettamente connesse alla stabilità abitativa, normalmente pagata al locatore o al fornitore, affiancata da supporto legale, case management, mediazione e referral. Nel trial l’offerta dell’aiuto finanziario fu randomizzata tra richiedenti a rischio intermedio per i quali le risorse disponibili non erano sufficienti a coprire tutti gli eleggibili.",
    mechanism:
      "Intervenire prima della perdita dell’alloggio sullo shock finanziario che rende imminente lo sfratto o l’uscita dall’abitazione, evitando che una crisi temporanea si trasformi in ingresso nel sistema di homelessness e shelter.",
    population:
      "Nuclei a basso reddito ancora alloggiati ma a rischio imminente di perdere l’abitazione. Il trial ha randomizzato 1.263 persone con punteggio di vulnerabilità intermedio e bassa probabilità di accedere ad altri programmi equivalenti.",
    primaryArea: "housing_politiche_abitative",
    secondaryAreas: ["welfare_inclusione_servizi_sociali"],
    interventionTypes: [
      "incentivo_economico",
      "servizio_diretto",
      "partnership_pubblico_privato_terzo_settore",
    ],
    tools: [
      "fondo di assistenza abitativa temporanea",
      "screening del rischio di homelessness",
      "pagamenti a locatori e fornitori",
      "case management",
      "supporto legale e mediazione",
      "monitoraggio amministrativo degli esiti",
    ],
    territorialScale: "Contea / nucleo familiare",
    interventionStatus:
      "Programma operativo. L’Office of Supportive Housing della contea continua a offrire temporary financial assistance, supporto legale e case management attraverso una rete di partner non profit per famiglie a basso reddito a rischio di perdere l’alloggio.",
    evaluationMethod:
      "Randomized controlled trial individuale, stratificato per agenzia e mese, condotto da luglio 2019 a dicembre 2020. Tra i richiedenti con rischio intermedio, l’offerta di assistenza fu assegnata tramite lotteria; l’analisi intention-to-treat usa dati amministrativi HMIS su shelter e altri servizi per homelessness. L’assegnazione casuale aumentò la ricezione effettiva dell’aiuto dal 12% al 68%, consentendo anche stime IV/LATE della ricezione dell’assistenza.",
    comparator:
      "Richiedenti comparabili assegnati casualmente al controllo nello stesso binomio agenzia-mese, che ricevevano usual care, case management e informazioni su altre risorse ma non l’offerta finanziaria sperimentale.",
    outcomes: [
      "ingresso in homelessness entro sei mesi",
      "uso di emergency shelter",
      "ricezione dell’assistenza finanziaria",
      "cambi di indirizzo come misura supplementare di instabilità abitativa",
    ],
    results:
      "L’offerta di assistenza finanziaria riduce fortemente l’ingresso nei servizi per homelessness nei sei mesi successivi e l’effetto è guidato soprattutto dal minore uso di emergency shelter. L’effetto è evidente nel campione pre-pandemia; per gli ingressi durante la pandemia il rischio nel controllo diventa molto basso, plausibilmente anche per moratorie e altri interventi concomitanti.",
    effectSize:
      "Intention-to-treat: homelessness entro sei mesi −3,8 punti percentuali rispetto a un controfattuale del 4,1%; emergency shelter −2,5 p.p. rispetto a una base del 3,0%. L’offerta randomizzata aumenta la ricezione dell’assistenza dal 12% al 68% (+56 p.p.).",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Servono un fondo rapidamente erogabile, intake e verifica documentale, personale di case management, accordi con locatori/fornitori e un sistema protetto di follow-up. Nel campione sperimentale l’assistenza finanziaria media per persona assegnata al trattamento era nell’ordine di 1.900 USD; nel programma più ampio FY2019-20 l’assistenza media tra i beneficiari era circa 4.442 USD, valori non direttamente trasferibili ai costi italiani.",
    limitations: [
      "Il trial riguarda richiedenti sulla soglia intermedia di vulnerabilità e non identifica automaticamente l’effetto per tutti i possibili beneficiari di un programma di prevenzione.",
      "Il principale outcome HMIS osserva l’ingresso nei servizi per homelessness e può perdere forme di instabilità come coabitazione forzata, spostamenti fuori contea o homelessness non intercettata dai servizi.",
      "Gli effetti sono concentrati nel periodo pre-pandemia; durante la pandemia moratorie e aiuti straordinari abbassarono fortemente il rischio nel gruppo di controllo.",
      "Le analisi benefit-cost del programma utilizzano anche valori monetari e spillover tratti da altra letteratura: non vanno interpretate come effetti economici tutti direttamente misurati dal trial.",
    ],
    unintendedEffects:
      "Un programma scalato male può generare errori di targeting, ritardi amministrativi o incentivi a presentare domanda soltanto quando la crisi è ormai avanzata. Occorre inoltre evitare che il supporto una tantum sostituisca interventi strutturali quando l’affitto è stabilmente insostenibile.",
    primarySource: {
      label: "Santa Clara County Office of Supportive Housing — At risk of losing housing?",
      url: "https://osh.santaclaracounty.gov/get-assistance/risk-losing-housing-we-can-help",
    },
    evaluationStudies: [
      {
        label: "Review of Economics and Statistics",
        url: "https://doi.org/10.1162/rest_a_01344",
        citation:
          "Phillips DC, Sullivan JX (2025), Do Homelessness Prevention Programs Prevent Homelessness? Evidence from a Randomized Controlled Trial",
        doi: "10.1162/rest_a_01344",
      },
      {
        label: "Author working paper — trial details",
        url: "https://sites.nd.edu/james-sullivan/files/2023/04/SCC_homelessness_prevention-8-1.pdf",
        citation:
          "Phillips DC, Sullivan JX (2023), Do homelessness prevention programs prevent homelessness? Evidence from a randomized controlled trial",
      },
    ],
    lastVerifiedAt: "2026-09-07",
    transferabilityItaly:
      "Alta per il principio di prevenzione precoce mediante sostegno economico temporaneo integrato con servizi sociali e supporto abitativo. In Italia occorre però coordinare competenze comunali, fondi regionali/nazionali, disciplina delle locazioni, eventuali contributi già esistenti e regole di accesso ai servizi.",
    lameziaAdaptation:
      "Creare un piccolo Housing Stability Fund comunale o interistituzionale per arretrati, deposito, utenze o spese eccezionali quando i servizi sociali documentano un rischio imminente e plausibilmente temporaneo. Prevedere pagamenti diretti a locatore/fornitore, presa in carico rapida, supporto legale e follow-up a 3, 6 e 12 mesi. Se la domanda supera strutturalmente le risorse, usare criteri trasparenti e valutare un rollout o una lotteria soltanto quando giuridicamente ed eticamente appropriato.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "segnalazioni di arretrati e rischio sfratto",
      "anagrafica dei servizi sociali e criteri di eleggibilità",
      "procedura rapida di pagamento e verifica del debito",
      "partnership con supporto legale e terzo settore",
      "follow-up privacy-safe su permanenza nell’alloggio e sistemazioni temporanee",
    ],
    tags: [
      "homelessness prevention",
      "prevenzione sfratti",
      "assistenza affitto",
      "housing stability",
      "RCT",
      "Santa Clara",
    ],
    revisionHistory: [
      {
        date: "2026-09-07",
        note: "Inserimento dopo scouting Parallel Search e verifica su fonte della contea e studio RCT originale; separate le stime sperimentali dalle analisi benefit-cost extrapolative.",
      },
    ],
  },
  {
    id: "brazil-municipal-participatory-budgeting-health",
    title: "Bilancio partecipativo municipale con priorità territoriali di investimento",
    authority: "Municipalità brasiliane aderenti; modello originato dal Município de Porto Alegre",
    territory: "Brasile — panel municipale; Porto Alegre come modello originario",
    country: "Brasile",
    implementationYear: "Dal 1989 a Porto Alegre; diffusione osservata 1990–2004",
    problem:
      "Le decisioni di bilancio possono riflettere in modo incompleto le priorità dei residenti e soffrire di asimmetrie informative tra amministrazione e utilizzatori dei servizi, soprattutto per investimenti territoriali e servizi essenziali.",
    measure:
      "Processo periodico di bilancio partecipativo nel quale residenti discutono bisogni e priorità in assemblee territoriali e tematiche, eleggono rappresentanti e concorrono a ordinare gli investimenti da inserire nel bilancio. A Porto Alegre il modello prevede assemblee regionali e tematiche, elezione di delegati/consiglieri e priorità di investimento sottoposte all’amministrazione.",
    mechanism:
      "Aumentare informazione dal basso e accountability sul bilancio può riallocare spesa verso bisogni percepiti come prioritari, rendere verificabili gli impegni e ridurre la distanza tra preferenze dei cittadini e investimenti effettivi.",
    population:
      "Residenti dei comuni brasiliani che hanno adottato il bilancio partecipativo; lo studio principale osserva l’adozione municipale e gli outcome di bilancio e mortalità infantile nel periodo 1990–2004.",
    primaryArea: "partecipazione_democrazia_locale",
    secondaryAreas: ["salute_pubblica_locale", "urbanistica_rigenerazione"],
    interventionTypes: [
      "partecipazione_codesign",
      "modifica_organizzativa_processo",
      "informazione_trasparenza",
    ],
    tools: [
      "assemblee territoriali",
      "assemblee tematiche",
      "prioritizzazione pubblica degli investimenti",
      "delegati e consiglieri eletti dai partecipanti",
      "rendicontazione delle opere e delle domande",
    ],
    territorialScale: "Comune / quartieri e aree tematiche",
    interventionStatus:
      "Il modello resta operativo a Porto Alegre. Nella tornata 2025 la città ha registrato 18.055 partecipanti in 23 assemblee e ha eletto delegati, consiglieri e priorità di investimento; nel 2026 il Comune continua a gestire e digitalizzare il ciclo delle domande del bilancio partecipativo.",
    evaluationMethod:
      "Studio panel sulle municipalità brasiliane nel periodo 1990–2004 con variazione temporale nell’adozione. Le specificazioni includono effetti fissi territoriali e temporali, controlli politici e fiscali e trend regionali, oltre a robustness check per affrontare la selezione nell’adozione. Non si tratta di assegnazione casuale e l’identificazione resta vulnerabile a fattori non osservati che cambiano nel tempo.",
    comparator:
      "Evoluzione delle municipalità non partecipative e delle stesse unità prima/dopo l’adozione, con controlli ed effetti fissi; ulteriori verifiche limitano il confronto ai comuni che adottano in periodi differenti.",
    outcomes: [
      "quota di bilancio destinata a salute e sanità",
      "quota di bilancio destinata ad altre categorie di spesa",
      "mortalità infantile",
      "allineamento della spesa con le priorità emerse nei forum",
    ],
    results:
      "L’adozione del bilancio partecipativo è associata a una riallocazione significativa verso salute e sanità e a una riduzione della mortalità infantile. Il pattern resiste a più specificazioni, ma la policy non è randomizzata e i comuni adottanti differiscono dai non adottanti: il risultato va interpretato come evidenza quasi-sperimentale moderata, non come RCT.",
    effectSize:
      "Stime principali: quota del bilancio per salute e sanità +2–3 punti percentuali; mortalità infantile −1/−2 decessi per 1.000 nati, circa −5/−10% rispetto al livello iniziale del periodo. Le magnitudini non sono automaticamente trasferibili ad altri ordinamenti o livelli sanitari di base.",
    evidenceStrength: "moderata",
    costsRequirements:
      "Servono facilitazione, suddivisione territoriale comprensibile, informazioni tecniche e costi dei progetti, calendario stabile, personale per istruttoria e fattibilità, raccordo con il ciclo di bilancio e procurement e un sistema pubblico di monitoraggio dell’esecuzione.",
    limitations: [
      "L’adozione non è randomizzata: i comuni partecipativi presentavano caratteristiche politiche, economiche e urbane differenti dai non adottanti e possono esistere confondenti variabili nel tempo.",
      "Il risultato sulla mortalità infantile è mediato dalla riallocazione verso salute e sanità nel contesto brasiliano degli anni 1990–2000 e non deve essere presentato come effetto diretto replicabile di una consultazione di bilancio italiana.",
      "Le regole del bilancio partecipativo differivano tra municipalità per quota di bilancio, rappresentanza, ranking e calendario; il trattamento non è perfettamente uniforme.",
      "Partecipazione numerosa non equivale automaticamente a partecipazione rappresentativa: composizione dei partecipanti ed equità territoriale devono essere misurate separatamente.",
    ],
    unintendedEffects:
      "Possibili rischi sono cattura da gruppi più organizzati, sottorappresentazione di residenti con minore tempo o risorse, frammentazione delle priorità, aspettative non finanziabili e ritardi se la fattibilità tecnica viene verificata soltanto dopo il voto.",
    primarySource: {
      label: "Prefeitura de Porto Alegre — rodada do Orçamento Participativo",
      url: "https://prefeitura.poa.br/smgov/noticias/rodada-do-orcamento-participativo-encerra-com-grande-publico-na-regiao-ilhas",
    },
    evaluationStudies: [
      {
        label: "World Development",
        url: "https://doi.org/10.1016/j.worlddev.2013.01.009",
        citation:
          "Gonçalves S (2014), The Effects of Participatory Budgeting on Municipal Expenditures and Infant Mortality in Brazil",
        doi: "10.1016/j.worlddev.2013.01.009",
      },
      {
        label: "Open manuscript",
        url: "https://base.socioeco.org/docs/effects_of_participatory_budgeting.pdf",
        citation:
          "Gonçalves S, The Effects of Participatory Budgeting on Municipal Expenditures and Infant Mortality in Brazil — manuscript version",
      },
    ],
    lastVerifiedAt: "2026-09-07",
    transferabilityItaly:
      "Alta per il meccanismo istituzionale di partecipazione su una quota delimitata di investimenti, purché le proposte siano compatibili con bilancio, competenze e procurement. Molto più bassa è la trasferibilità quantitativa degli outcome sanitari storici brasiliani.",
    lameziaAdaptation:
      "Destinare una quota piccola e predefinita degli investimenti di quartiere a un ciclo annuale: 4–6 assemblee territoriali più una finestra digitale, catalogo di proposte ammissibili e costate, verifica di fattibilità prima del voto finale e dashboard pubblica su progetto, costo, affidamento, avanzamento e completamento. Predefinire indicatori di rappresentatività, equità territoriale, tempi di esecuzione e quota di progetti effettivamente realizzati.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "mappa dei quartieri e popolazione di riferimento",
      "costi standard e istruttoria tecnica dei progetti",
      "tracciamento di bilancio e procurement",
      "registro aggregato della partecipazione e indicatori di inclusione",
      "dashboard di avanzamento delle priorità approvate",
    ],
    tags: [
      "bilancio partecipativo",
      "partecipazione civica",
      "accountability",
      "spesa locale",
      "Porto Alegre",
      "panel data",
    ],
    revisionHistory: [
      {
        date: "2026-09-07",
        note: "Inserimento dopo scouting Parallel Search e verifica su fonte municipale corrente e studio World Development originale; forza moderata per selezione non randomizzata nell’adozione.",
      },
    ],
  },
  {
    id: "nyc-right-to-counsel-eviction",
    title: "Assistenza legale gratuita ai conduttori nei procedimenti di sfratto",
    authority: "City of New York / Human Resources Administration — Office of Civil Justice",
    territory: "New York City, New York",
    country: "Stati Uniti",
    implementationYear: "Avvio 2017; rollout graduale 2017–2020 e copertura cittadina",
    problem:
      "Nei procedimenti di sfratto i locatori dispongono normalmente di rappresentanza legale mentre molti conduttori a basso reddito affrontano senza assistenza procedimenti tecnici, scadenze, negoziazioni e possibili default judgment, aumentando il rischio di perdita dell’alloggio.",
    measure:
      "Universal Access/Right to Counsel offre rappresentanza o consulenza legale gratuita ai conduttori che affrontano uno sfratto, tramite organizzazioni non profit contrattualizzate dalla città. Il rollout iniziale fu progressivo per ZIP code e la presa in carico avviene in collegamento con Housing Court e servizi cittadini.",
    mechanism:
      "Un avvocato può identificare difese, evitare default procedurali, negoziare arretrati e accordi, presentare documenti, rappresentare il conduttore alle udienze e collegare il caso ad aiuti economici o servizi, riducendo la probabilità che una difficoltà abitativa produca un ordine di rilascio o uno sfratto eseguito.",
    population:
      "Conduttori di New York City che affrontano procedimenti di sfratto. Nel periodo studiato la rappresentanza piena era destinata ai nuclei con reddito fino al 200% della soglia federale di povertà; il servizio cittadino oggi pubblicizza assistenza gratuita in tutti gli ZIP code e indipendentemente dallo status migratorio.",
    primaryArea: "housing_politiche_abitative",
    secondaryAreas: ["welfare_inclusione_servizi_sociali"],
    interventionTypes: ["servizio_diretto", "partnership_pubblico_privato_terzo_settore"],
    tools: [
      "contratti con organizzazioni di legal services",
      "intake in Housing Court",
      "Tenant Helpline / 311",
      "screening di eleggibilità",
      "dati amministrativi sui procedimenti",
    ],
    territorialScale: "Città / singolo procedimento di sfratto",
    interventionStatus:
      "Programma attivo e formalmente disponibile in tutti gli ZIP code. La capacità operativa è però un vincolo sostanziale: il Comptroller di New York ha rilevato che la quota di conduttori eleggibili con piena rappresentanza è scesa dal 71% nel FY2021 al 42% nel FY2024, mostrando che un diritto nominale senza sufficiente offerta legale può restare incompleto.",
    evaluationMethod:
      "Valutazione quasi-sperimentale su microdati address-level di Housing Court 2016–2019. Gli autori sfruttano il rollout graduale per ZIP code come strumento per la probabilità di ottenere un avvocato e stimano modelli two-stage least squares con ZIP fixed effects, borough-by-month fixed effects e ricchi controlli; robustness check aggiungono address fixed effects. Le stime IV sono effetti locali della rappresentanza sui casi la cui probabilità di avere un avvocato è aumentata grazie al programma.",
    comparator:
      "Procedimenti nello stesso ZIP prima dell’accesso e procedimenti in ZIP non ancora raggiunti dal rollout nello stesso periodo, con effetti fissi e controlli; la disponibilità del programma è usata come strumento per la rappresentanza effettiva.",
    outcomes: [
      "giudizio con possesso a favore del locatore",
      "ammontare del giudizio monetario",
      "emissione del warrant di sfratto",
      "esecuzione del warrant / sfratto",
      "nuovi procedimenti nei quindici mesi successivi",
    ],
    results:
      "Ottenere rappresentanza legale grazie al rollout riduce in modo marcato giudizi con possesso, emissione dei warrant e sfratti eseguiti. Le stime ridotte dell’introduzione del programma su tutti i casi dei ZIP trattati sono più piccole, come atteso, perché il rollout aumenta la probabilità di rappresentanza ma non la assegna a ogni caso. Nel follow-up disponibile non emerge un aumento di nuovi procedimenti entro quindici mesi.",
    effectSize:
      "TSLS/LATE della rappresentanza indotta dal programma: giudizio con possesso −32,1 punti percentuali; warrant emesso −32,3 p.p.; warrant eseguito/sfratto −8,4 p.p. Reduced form del rollout su tutti i casi: circa −4,0 p.p. nei giudizi con possesso, −4,0 p.p. nei warrant emessi e −1,0 p.p. negli sfratti eseguiti.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede finanziamento ricorrente, un numero sufficiente di avvocati e paralegali, contratti con provider qualificati, intake tempestivo, coordinamento con tribunali e servizi sociali e sistemi di case tracking. L’esperienza recente di New York mostra che la capacità del workforce e i carichi di lavoro possono essere il principale collo di bottiglia.",
    limitations: [
      "Il rollout geografico non fu randomizzato e privilegiò aree ad alto bisogno; la strategia IV e gli effetti fissi migliorano l’identificazione ma richiedono l’assunzione che la disponibilità del programma influenzi gli outcome principalmente attraverso la rappresentanza.",
      "Le stime TSLS sono local average treatment effects per i conduttori la cui rappresentanza cambia grazie al rollout e non coincidono con l’effetto medio su ogni procedimento.",
      "Lo studio copre 2016–2019, prima della pandemia e delle successive modifiche al mercato e alle regole abitative; l’attuale capacità di erogazione è inferiore alla piena copertura statutaria.",
      "I dati giudiziari non osservano tutte le uscite informali dall’alloggio e il follow-up non consente di stabilire effetti di lunghissimo periodo sui comportamenti dei locatori.",
    ],
    unintendedEffects:
      "Possibili effetti da monitorare sono code e ritardi se l’offerta legale è insufficiente, maggiore durata di alcuni procedimenti e adattamenti dei locatori su screening, filing o offerta di alloggi. Lo studio non trova nel primo periodo evidenza chiara di filing aggiuntivi, ma non può escludere risposte di lungo periodo.",
    primarySource: {
      label: "NYC Human Resources Administration — Legal Services for Tenants",
      url: "https://www.nyc.gov/site/hra/help/legal-services-for-tenants.page",
    },
    evaluationStudies: [
      {
        label: "Journal of Public Economics",
        url: "https://doi.org/10.1016/j.jpubeco.2023.104844",
        citation:
          "Cassidy MT, Currie J (2023), The effects of legal representation on tenant outcomes in housing court: Evidence from New York City’s Universal Access program",
        doi: "10.1016/j.jpubeco.2023.104844",
      },
      {
        label: "Open published manuscript",
        url: "https://miketcassidy.com/files/cassidy-currie-2023-evictions-jpube.pdf",
        citation:
          "Cassidy MT, Currie J (2023), Journal of Public Economics 222, 104844 — open manuscript",
      },
    ],
    lastVerifiedAt: "2026-09-07",
    transferabilityItaly:
      "Media. Un comune italiano non può replicare automaticamente il diritto processuale newyorkese né modificare le regole dello sfratto, ma può finanziare o coordinare servizi di consulenza e rappresentanza per nuclei vulnerabili, integrandoli con servizi sociali, contributi per morosità incolpevole e misure regionali/nazionali.",
    lameziaAdaptation:
      "Creare uno sportello integrato di prevenzione sfratti con triage legale e sociale già alla prima segnalazione di arretrati o intimazione: consulenza sui diritti, verifica degli aiuti disponibili, mediazione con il locatore, referral a patrocinio/avvocati convenzionati e presa in carico sociale. Misurare quota di casi raggiunti prima dell’udienza, accordi, mantenimento dell’alloggio, tempi di risoluzione e ricorso a sistemazioni emergenziali.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "partnership con avvocatura e soggetti di legal aid",
      "protocollo di referral con servizi sociali e housing",
      "budget ricorrente e dimensionamento dei carichi",
      "dati privacy-safe sugli esiti dei casi",
      "mappa dei contributi e delle misure contro la morosità disponibili",
    ],
    tags: [
      "sfratti",
      "right to counsel",
      "legal aid",
      "housing stability",
      "instrumental variables",
      "New York City",
    ],
    revisionHistory: [
      {
        date: "2026-09-07",
        note: "Inserimento dopo scouting Parallel Search e verifica su HRA, dati correnti di capacità del Comptroller e articolo Journal of Public Economics; distinti effetti IV della rappresentanza e reduced form del rollout.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
