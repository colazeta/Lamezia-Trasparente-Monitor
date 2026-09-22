import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_22 = [
  {
    id: "nyc-summer-youth-employment-program-lottery",
    title: "Summer Youth Employment Program con accesso tramite lotteria",
    authority: "New York City Department of Youth and Community Development",
    territory: "New York City",
    country: "Stati Uniti",
    implementationYear: "Programma storico; valutazioni su lotterie 2005–2010; operativo nel 2026",
    problem:
      "Accesso limitato dei giovani a esperienze lavorative retribuite, reddito estivo, competenze professionali e reti di lavoro, con possibili ricadute su coinvolgimento nel sistema penale e sicurezza.",
    measure:
      "Programma estivo cittadino che finanzia esperienze di lavoro e project-based learning per giovani residenti. Nei periodi di sovra-domanda, molte allocazioni sono state effettuate tramite lotterie; la città collabora con organizzazioni comunitarie e migliaia di worksite pubblici, non profit e privati. Nel 2026 il programma offre per il quinto anno consecutivo 100.000 posti o altre opportunità retribuite a giovani 14–24 anni per sei settimane in luglio e agosto.",
    mechanism:
      "Ridurre il costo di accesso al primo lavoro, fornire reddito e un'esperienza strutturata, sviluppare abitudini e competenze lavorative e occupare una parte del periodo estivo in attività supervisionate. L'assegnazione tramite lotteria in anni di eccesso di domanda crea inoltre un meccanismo trasparente di accesso quando i posti sono scarsi.",
    population:
      "Giovani residenti a New York City. La valutazione QJE collega 294.100 partecipanti alle lotterie 2005–2008 a dati fiscali, di incarcerazione e mortalità; una valutazione DOL separata analizza quasi 265.000 first-time applicants 2006–2010; lo studio sul crimine usa 163.447 partecipanti alle lotterie 2005–2008.",
    primaryArea: "istruzione_giovani",
    secondaryAreas: [
      "sviluppo_economico_commercio_lavoro",
      "sicurezza_urbana_prevenzione",
      "welfare_inclusione_servizi_sociali",
    ],
    interventionTypes: [
      "servizio_diretto",
      "incentivo_economico",
      "partnership_pubblico_privato_terzo_settore",
      "formazione_capacity_building",
    ],
    tools: [
      "lotteria per l'allocazione dei posti in condizioni di sovra-domanda",
      "stipendi o salari finanziati dal programma",
      "provider comunitari",
      "worksite pubblici, non profit e privati",
      "job readiness e career exploration",
      "dati amministrativi longitudinali",
    ],
    territorialScale: "Cittadina / cinque borough",
    interventionStatus:
      "Operativo nel 2026. DYCD indica il programma come il più grande youth employment program degli Stati Uniti; nel 2026 sono previste 100.000 opportunità retribuite per il quinto anno consecutivo.",
    evaluationMethod:
      "Randomized lottery evaluation. Le valutazioni sfruttano l'assegnazione casuale dei posti SYEP quando le domande superavano la capacità, collegando i risultati della lotteria a dati amministrativi su occupazione e reddito, università, incarcerazione, mortalità, arresti e condanne. Le stime sono intent-to-treat/lottery based e quindi evitano la selezione tipica dei semplici confronti tra partecipanti e non partecipanti.",
    comparator:
      "Giovani eleggibili che partecipano alla stessa lotteria ma non ricevono l'offerta SYEP nello stesso ciclo.",
    outcomes: [
      "occupazione e reddito durante l'estate",
      "redditi negli anni successivi",
      "iscrizione al college",
      "incarcerazione",
      "mortalità",
      "arresti e condanne",
    ],
    results:
      "Le lotterie mostrano un forte aumento dell'occupazione e dei redditi nel periodo del programma. La valutazione di lungo periodo trova riduzioni di incarcerazione e mortalità, ma non un aumento persistente dei redditi: per circa tre anni dopo il programma i redditi medi risultano moderatamente inferiori e non emerge un effetto sull'iscrizione al college. Lo studio 2022 sul crimine trova riduzioni di arresti e condanne durante l'estate del programma, concentrate soprattutto nel piccolo gruppo con precedenti contatti con il sistema penale.",
    effectSize:
      "Valutazione DOL sui first-time applicants 2006–2010: +54 punti percentuali nella probabilità di essere occupati e circa +580 USD di guadagni nell'estate di assegnazione. QJE 2016: circa −10% di incarcerazione e circa −20% di mortalità, in larga parte per omicidio, negli anni successivi; nessun effetto sul college e moderata riduzione dei redditi nei tre anni successivi. JPAM 2022: circa −17% nella probabilità di un arresto durante l'estate del programma e −23% per un arresto per felony; gli effetti sul criminal justice contact sono fortemente eterogenei e concentrati tra i giovani con arresti precedenti.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Richiede finanziamento dei salari/stipendi, provider in grado di reclutare e seguire i giovani, una rete di worksite verificati, matching e supervisione, gestione amministrativa della payroll, sicurezza sul lavoro e un sistema trasparente di selezione quando le domande superano i posti. Una replica italiana dovrebbe coordinarsi con servizi per il lavoro, scuole, terzo settore e normativa su tirocini/lavoro minorile.",
    limitations: [
      "Gli effetti causali derivano dalle coorti e dalle regole del programma 2005–2010; l'attuale SYEP è molto più grande e include segmenti e modalità di reclutamento più articolati, quindi gli effect size non sono automaticamente trasferibili al programma 2026.",
      "Il programma non produce un miglioramento generalizzato di tutti gli outcome: il paper QJE trova un calo moderato dei redditi nei tre anni successivi e nessun effetto sul college.",
      "Le riduzioni di arresti e condanne sono eterogenee e in larga parte concentrate nel piccolo gruppo con precedenti contatti con il sistema penale; non vanno presentate come effetto uniforme su tutti i partecipanti.",
      "Il contesto del mercato del lavoro, del salario minimo e del sistema di giustizia statunitense differisce sostanzialmente da quello italiano.",
    ],
    unintendedEffects:
      "Possibile sostituzione parziale di lavoro che alcuni giovani avrebbero trovato autonomamente e, nel periodo immediatamente successivo, minori redditi medi rispetto ai controlli; una forte espansione può inoltre ridurre la qualità media dei worksite se la capacità di supervisione non cresce in parallelo.",
    primarySource: {
      label: "NYC DYCD — Summer Youth Employment Program 2026",
      url: "https://www.nyc.gov/site/dycd/services/jobs-internships/summer-youth-employment-program-syep.page",
    },
    evaluationStudies: [
      {
        label: "Quarterly Journal of Economics — The Effects of Youth Employment",
        url: "https://academic.oup.com/qje/article/131/1/423/2461127",
        citation:
          "Gelber A, Isen A, Kessler JB (2016), The Effects of Youth Employment: Evidence from New York City Lotteries, Quarterly Journal of Economics 131(1):423–460",
        doi: "10.1093/qje/qjv034",
      },
      {
        label: "Journal of Policy Analysis and Management — The Effects of Youth Employment on Crime",
        url: "https://onlinelibrary.wiley.com/doi/10.1002/pam.22393",
        citation:
          "Kessler JB, Tahamont S, Gelber A, Isen A (2022), The Effects of Youth Employment on Crime: Evidence from New York City Lotteries, Journal of Policy Analysis and Management 41(3):710–730",
        doi: "10.1002/pam.22393",
      },
      {
        label: "U.S. Department of Labor — SYEP implementation and impact evaluation",
        url: "https://www.dol.gov/resource-library/introduction-world-work-study-implementation-and-impacts-new-york-citys-summer-0",
        citation:
          "Valentine EJ, Anderson C, Hossain F, Unterman R (2017), An Introduction to the World of Work: A Study of the Implementation and Impacts of New York City's Summer Youth Employment Program",
      },
    ],
    lastVerifiedAt: "2026-09-22",
    transferabilityItaly:
      "Media-alta sul meccanismo, non sulla scala. Un comune italiano può cofinanziare o coordinare esperienze estive, tirocini e project work con scuole, CPI, imprese e terzo settore, ma deve rispettare le competenze e la normativa nazionale/regionale sul lavoro dei minori e sui tirocini. In caso di domanda superiore ai posti, una regola di allocazione pubblica e verificabile può migliorare equità e valutabilità.",
    lameziaAdaptation:
      "Pilotare un programma estivo di piccola scala rivolto a giovani 16–24 anni con worksite comunali, imprese, cooperative e associazioni; pubblicare criteri di accesso, qualità minima dei worksite e outcome attesi. Se le domande superano i posti, usare una lotteria tra candidati equivalenti o un rollout trasparente, mantenendo priorità separate per categorie vulnerabili previste dalla legge. Misurare occupazione successiva, rientro a scuola/formazione, competenze, assenze, abbandono del programma e, solo in forma aggregata e con basi giuridiche adeguate, indicatori di contatto con servizi di sicurezza/giustizia.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "anagrafe candidati, eleggibilità e assegnazione",
      "rete e standard di qualità dei worksite",
      "payroll/stipendi e assicurazione",
      "follow-up a 6, 12 e 24 mesi su lavoro e formazione",
      "protocollo di allocazione trasparente in caso di sovra-domanda",
      "partnership con scuole, CPI, imprese e terzo settore",
    ],
    tags: ["New York", "giovani", "summer jobs", "lotteria", "occupazione", "criminalità", "RCT", "DYCD"],
    revisionHistory: [
      {
        date: "2026-09-22",
        note: "Prima verifica e inserimento; separati gli effetti immediati su occupazione/reddito dai risultati di lungo periodo e dai risultati eterogenei sul criminal justice contact.",
      },
    ],
  },
  {
    id: "medellin-metrocable-pui-neighborhood-transformation",
    title: "Metrocable e Proyecto Urbano Integral nei quartieri nord-orientali",
    authority: "Alcaldía de Medellín / Empresa de Desarrollo Urbano / Metro de Medellín",
    territory: "Comunas 1-Popular e 2-Santa Cruz, Medellín",
    country: "Colombia",
    implementationYear: "2004–2008 (Linea K e PUI Nororiental); modello successivamente replicato in altre aree",
    problem:
      "Isolamento fisico e sociale di quartieri collinari a basso reddito, scarsa accessibilità al resto della città, deficit di spazio pubblico e servizi, debole connessione istituzionale e livelli molto elevati di violenza.",
    measure:
      "Apertura della Linea K del Metrocable nel 2004, integrata con un Proyecto Urbano Integral nel suo bacino di influenza: spazio pubblico, percorsi pedonali, equipaggiamenti collettivi, interventi ambientali, servizi e gestione sociale/partecipativa. Il PUI Nororiental è stato progettato ed eseguito dalla Empresa de Desarrollo Urbano per l'Alcaldía de Medellín.",
    mechanism:
      "Ridurre isolamento e costi di accesso, aumentare la presenza istituzionale e la qualità dello spazio pubblico, creare connessioni pedonali e servizi e rafforzare l'efficacia collettiva del quartiere. La teoria del cambiamento è quindi territoriale e multi-componente: il trasporto è il perno di un pacchetto di rigenerazione, non l'unico trattamento.",
    population:
      "Residenti dei quartieri a basso reddito nell'area di influenza del Metrocable/PUI. La valutazione confronta 25 quartieri di intervento con 23 quartieri comparabili e segue longitudinalmente 466 residenti tra 2003 e 2008, integrando registri ufficiali degli omicidi.",
    primaryArea: "urbanistica_rigenerazione",
    secondaryAreas: ["mobilita_spazio_pubblico", "sicurezza_urbana_prevenzione", "welfare_inclusione_servizi_sociali"],
    interventionTypes: [
      "infrastruttura_fisica",
      "servizio_diretto",
      "partecipazione_codesign",
      "modifica_organizzativa_processo",
    ],
    tools: [
      "trasporto a fune integrato con la rete metro",
      "spazio pubblico e percorsi pedonali",
      "equipaggiamenti collettivi",
      "progettazione urbana integrata",
      "partecipazione comunitaria",
      "coordinamento interistituzionale territoriale",
    ],
    territorialScale: "Quartiere / area di influenza del corridoio di trasporto",
    interventionStatus:
      "La Linea K è tuttora operativa e il modello PUI è stato successivamente utilizzato in altre aree di Medellín. Il record riguarda l'intervento nord-orientale valutato nel periodo 2003–2008, non le linee Metrocable successive.",
    evaluationMethod:
      "Natural experiment con matched comparison: 25 quartieri interessati dal transit-oriented neighborhood transformation e 23 quartieri comparabili non trattati, osservati prima (2003) e dopo (2008). Gli autori usano propensity-score matching e permutation tests su outcome di violenza, integrando survey longitudinale e registri degli omicidi.",
    comparator:
      "Quartieri con caratteristiche socio-demografiche e livelli di violenza comparabili che non ricevettero nello stesso periodo il pacchetto Metrocable/PUI.",
    outcomes: [
      "tasso di omicidi",
      "violenza riportata dai residenti",
      "efficacia collettiva",
      "fiducia nelle istituzioni",
      "condizioni fisiche e sociali del quartiere",
    ],
    results:
      "Tra 2003 e 2008 la violenza diminuisce in tutta Medellín, ma il calo è sostanzialmente maggiore nei quartieri interessati dal pacchetto di trasformazione. Lo studio trova anche miglioramenti in dimensioni sociali del quartiere coerenti con un rafforzamento dell'efficacia collettiva. Il risultato non identifica separatamente l'effetto del solo Metrocable, perché il trasporto fu accompagnato da investimenti urbani e sociali.",
    effectSize:
      "Il declino del tasso di omicidi è 66% maggiore nei quartieri di intervento rispetto ai controlli (rate ratio 0,33; IC95% 0,18–0,61). Le segnalazioni di violenza da parte dei residenti diminuiscono 75% più che nei quartieri di controllo (odds ratio 0,25; IC95% 0,11–0,67).",
    evidenceStrength: "forte",
    costsRequirements:
      "Intervento ad alta intensità di capitale e coordinamento: infrastruttura di trasporto, opere di spazio pubblico e accessibilità, equipaggiamenti, progettazione urbana, espropri/diritti di suolo quando necessari, manutenzione e capacità di gestione sociale. Una replica non richiede necessariamente un cable car: il requisito trasferibile è la concentrazione coordinata di investimenti in un'area con deficit multidimensionali.",
    limitations: [
      "Non è un RCT: i quartieri di intervento derivano da una scelta urbanistica e, nonostante matching e permutation tests, può restare confondimento residuo.",
      "Il trattamento è multi-componente; non è possibile attribuire la riduzione degli omicidi alla sola Linea K del Metrocable.",
      "Medellín attraversava nello stesso periodo una forte trasformazione della sicurezza e della governance cittadina; i trend macro possono interagire con l'intervento locale.",
      "Gli outcome e gli effect size derivano da quartieri con livelli di violenza e condizioni urbane molto diversi da quelli di un comune medio italiano.",
    ],
    unintendedEffects:
      "Possibili aumenti dei valori immobiliari, pressioni distributive e spostamento delle attività o della violenza devono essere monitorati in interventi di rigenerazione; lo studio non consente di escludere tutti gli effetti di displacement o gentrificazione nel lungo periodo.",
    primarySource: {
      label: "Empresa de Desarrollo Urbano — PUI Nororiental",
      url: "https://www.edu.gov.co/publicaciones/item/60-proyecto-urbano-integral-en-la-zona-nororiental-de-medellin-un-modelo-de-transformacion-de-ciudad",
    },
    evaluationStudies: [
      {
        label: "American Journal of Epidemiology — Reducing Violence by Transforming Neighborhoods",
        url: "https://academic.oup.com/aje/article-abstract/175/10/1045/89012",
        citation:
          "Cerdá M, Morenoff JD, Hansen BB, Tessari Hicks KJ, Duque LF, Restrepo A, Diez-Roux AV (2012), Reducing Violence by Transforming Neighborhoods: A Natural Experiment in Medellín, Colombia, American Journal of Epidemiology 175(10):1045–1053",
        doi: "10.1093/aje/kwr428",
      },
    ],
    lastVerifiedAt: "2026-09-22",
    transferabilityItaly:
      "Media sul principio di rigenerazione integrata, bassa sulla tecnologia specifica del Metrocable salvo contesti topografici eccezionali. Il messaggio trasferibile è coordinare mobilità/accessibilità, spazio pubblico, servizi e presenza istituzionale in una stessa area, evitando micro-opere scollegate. L'adozione richiede coerenza con pianificazione urbanistica, appalti e competenze multi-livello.",
    lameziaAdaptation:
      "Selezionare una micro-area con isolamento, spazi pubblici deboli, servizi lontani e criticità sociali misurabili; costruire un PUI locale che unisca accessibilità pedonale/TPL, illuminazione, connessioni a scuole e servizi, piccoli spazi pubblici e presidio sociale. Definire prima del rollout una zona di confronto plausibile e indicatori su tempi di accesso, uso dello spazio, segnalazioni, incidenti, attività economiche e sicurezza registrata/percepita. Non assumere che la soluzione debba essere un impianto a fune.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "mappa di accessibilità a servizi e TPL",
      "indicatori di sicurezza e uso dello spazio a micro-scala",
      "inventario di spazi pubblici ed equipaggiamenti",
      "analisi sociale e partecipativa del quartiere",
      "stima dei costi e delle competenze multi-ente",
      "piano di valutazione con area di confronto e follow-up pluriennale",
    ],
    tags: ["Medellín", "Metrocable", "PUI", "rigenerazione", "mobilità", "violenza", "natural experiment", "spazio pubblico"],
    revisionHistory: [
      {
        date: "2026-09-22",
        note: "Prima verifica e inserimento; il record tratta esplicitamente Metrocable e PUI come pacchetto territoriale e non attribuisce l'effetto causale alla sola infrastruttura di trasporto.",
      },
    ],
  },
  {
    id: "indonesia-kdp-random-government-audits-village-roads",
    title: "Audit governativi randomizzati sui progetti stradali di villaggio",
    authority: "Government of Indonesia — Kecamatan Development Program",
    territory: "608 villaggi in East Java e Central Java",
    country: "Indonesia",
    implementationYear: "2003–2004 (esperimento all'interno del KDP)",
    problem:
      "Rischio di appropriazione o gonfiamento dei costi nei piccoli lavori pubblici locali, con controlli ordinari poco frequenti e difficoltà dei cittadini a osservare materiali, quantità e prezzi effettivamente impiegati.",
    measure:
      "All'interno del Kecamatan Development Program, alcuni villaggi con un progetto stradale già finanziato furono selezionati casualmente e informati prima dell'avvio dei lavori che il progetto sarebbe stato auditato dal governo centrale, portando la probabilità di audit da circa 4% a 100%. Gli auditor verificavano documentazione e lavori; i risultati venivano discussi pubblicamente in assemblea di villaggio e potevano produrre sanzioni o azioni ulteriori.",
    mechanism:
      "Aumentare in modo credibile la probabilità di controllo indipendente e il costo atteso dell'appropriazione, combinando verifica documentale/tecnica e disclosure locale. La valutazione misura le missing expenditures confrontando i costi ufficiali con una ricostruzione indipendente di prezzi e quantità dei materiali e del lavoro effettivamente impiegati.",
    population:
      "608 villaggi in East Java e Central Java che stavano per realizzare una strada finanziata dal KDP; il programma nazionale KDP finanziava progetti in circa 15.000 villaggi all'anno.",
    primaryArea: "trasparenza_integrita_anticorruzione",
    secondaryAreas: ["procurement_spesa_pubblica", "capacita_amministrativa_personale"],
    interventionTypes: ["enforcement_controllo", "informazione_trasparenza", "modifica_organizzativa_processo"],
    tools: [
      "random audit assignment",
      "audit tecnico e finanziario",
      "stima indipendente di prezzi e quantità",
      "confronto con rendicontazione ufficiale",
      "discussione pubblica dei risultati",
      "meccanismi di sanzione/correzione",
    ],
    territorialScale: "Progetto / villaggio, dentro un programma nazionale di sviluppo locale",
    interventionStatus:
      "L'esperimento 2003–2004 è storico. Il KDP è stato successivamente assorbito ed esteso in programmi nazionali di community-driven development; il record riguarda specificamente l'aumento randomizzato della probabilità di audit nei progetti stradali studiati da Olken.",
    evaluationMethod:
      "Randomized controlled field experiment in 608 villages. I villaggi furono assegnati casualmente a un aumento della probabilità di audit governativo dal livello ordinario di circa 4% a 100% o al controllo. Una misura indipendente delle missing expenditures veniva costruita ex post da ingegneri stimando prezzi e quantità effettive e confrontandole con i conti ufficiali. Il trial testava separatamente anche forme di grassroots monitoring.",
    comparator:
      "Villaggi KDP con progetti stradali analoghi che restavano soggetti alla probabilità ordinaria di audit e alle procedure standard del programma.",
    outcomes: [
      "missing expenditures complessive",
      "missing materials",
      "missing wages",
      "costo-efficacia dell'audit",
      "effetti della partecipazione comunitaria alternativa",
    ],
    results:
      "L'aumento credibile della probabilità di audit riduce in modo sostanziale le missing expenditures. In media, le misure di maggiore partecipazione dal basso hanno effetti molto più piccoli e non riducono le missing expenditures sui materiali; l'evidenza suggerisce che monitoraggio top-down e partecipazione non sono sostituti perfetti, soprattutto quando i cittadini hanno difficoltà a osservare componenti tecniche e materiali.",
    effectSize:
      "Portare la probabilità annunciata di audit da circa 4% a 100% riduce le missing expenditures di circa 8 punti percentuali. L'autore conclude che l'effetto è sufficientemente grande da rendere gli audit cost-effective nel contesto del programma.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Richiede auditor indipendenti, accesso a documenti e cantieri, competenze tecniche per ricostruire quantità/prezzi, regole chiare di campionamento e follow-up, capacità sanzionatoria o correttiva e protezione dell'indipendenza del controllo. Un audit al 100% non è necessariamente il disegno ottimale ordinario: il valore del trial è dimostrare l'effetto deterrente di una probabilità di controllo credibile e non facilmente manipolabile.",
    limitations: [
      "Il contesto istituzionale e di corruzione dei villaggi indonesiani del 2003–2004 è molto diverso da quello di un comune italiano contemporaneo.",
      "Le missing expenditures sono una misura di leakage costruita da stime tecniche indipendenti, non una qualificazione giuridica automatica di corruzione o frode per ogni differenza rilevata.",
      "Il trattamento porta la probabilità di audit al 100% e quindi non identifica da solo la curva costo-efficacia di probabilità intermedie in altri contesti.",
      "La partecipazione comunitaria testata aveva un disegno specifico; il risultato debole non implica che tutte le forme di trasparenza o civic monitoring siano inefficaci.",
    ],
    unintendedEffects:
      "Controlli troppo frequenti o mal disegnati possono aumentare costi amministrativi, ritardi, comportamento difensivo e focalizzazione sulla compliance formale; il campionamento deve quindi essere proporzionato e accompagnato da criteri tecnici chiari.",
    primarySource: {
      label: "World Bank — Kecamatan Development Project appraisal document",
      url: "https://documents.worldbank.org/curated/en/182801468774924408/pdf/Indonesia-Kecamatan-Development-Project.pdf",
    },
    evaluationStudies: [
      {
        label: "Journal of Political Economy — Monitoring Corruption",
        url: "https://www.journals.uchicago.edu/doi/10.1086/517935",
        citation:
          "Olken BA (2007), Monitoring Corruption: Evidence from a Field Experiment in Indonesia, Journal of Political Economy 115(2):200–249",
        doi: "10.1086/517935",
      },
    ],
    lastVerifiedAt: "2026-09-22",
    transferabilityItaly:
      "Alta sul principio di controllo random/risk-based indipendente e verifica tecnico-contabile, ma deve inserirsi nel sistema italiano dei controlli senza sostituire ANAC, revisori, RUP, collaudi o controlli sovraordinati. Un comune può rafforzare controlli interni e quality assurance su un campione predefinito di lavori, purché base giuridica, segregazione dei ruoli e follow-up siano chiari.",
    lameziaAdaptation:
      "Creare un pilot di assurance sui piccoli lavori pubblici comunali: definire ex ante un campione casuale stratificato per valore/tipologia, affiancato da un campione risk-based; per i progetti estratti verificare quantità, prezzi unitari, SAL, varianti, tempi e corrispondenza fisica con il cantiere. Pubblicare metodologia, tasso di campionamento e risultati aggregati, mentre le anomalie individuali restano soggette a verifica umana e alle procedure legali competenti. Confrontare errori/anomalie e tempi/costi con i progetti non campionati per capire se l'aumento di audit produce un effetto deterrente reale.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "registro completo dei lavori e relativi SAL/varianti",
      "prezziari e computi metrici strutturati",
      "campionamento casuale riproducibile e audit trail",
      "competenze tecniche indipendenti di cantiere",
      "protocollo di escalation e follow-up",
      "indicatori di costo, tempo, errori e anomalie comparabili",
    ],
    tags: ["Indonesia", "audit", "anticorruzione", "lavori pubblici", "strade", "RCT", "KDP", "missing expenditures"],
    revisionHistory: [
      {
        date: "2026-09-22",
        note: "Prima verifica e inserimento; mantenuta distinta la misura sperimentale di missing expenditures dalla qualificazione giuridica di corruzione e separati audit top-down e partecipazione comunitaria.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
