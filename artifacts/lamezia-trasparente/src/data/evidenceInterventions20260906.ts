import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_06 = [
  {
    id: "italy-emilia-romagna-municipal-unions-efficiency",
    title: "Gestione associata di funzioni e servizi tramite Unioni di Comuni",
    authority: "Comuni dell'Emilia-Romagna / Regione Emilia-Romagna",
    territory: "Emilia-Romagna",
    country: "Italia",
    implementationYear: "Adozioni progressive; valutazione principale 2001–2011",
    problem:
      "La frammentazione dei piccoli comuni può impedire economie di scala, duplicare strutture amministrative e rendere più costosa la produzione di servizi locali e funzioni specialistiche.",
    measure:
      "Costituzione o adesione a Unioni di Comuni alle quali gli enti associati conferiscono funzioni e servizi da gestire congiuntamente, mettendo in comune strutture, personale, professionalità e capacità organizzative. In Emilia-Romagna il modello è sostenuto da una politica regionale di riordino territoriale e incentivazione della gestione associata.",
    mechanism:
      "Aggregare domanda, personale e capacità amministrativa può ridurre costi fissi pro capite e duplicazioni, aumentare la scala operativa dei servizi e rendere accessibili professionalità che sarebbero onerose per un singolo piccolo comune.",
    population:
      "Comuni aderenti alle Unioni e residenti che utilizzano i servizi e le funzioni comunali gestiti in forma associata.",
    primaryArea: "capacita_amministrativa_personale",
    secondaryAreas: ["procurement_spesa_pubblica", "digitalizzazione_servizi_online"],
    interventionTypes: ["modifica_organizzativa_processo", "formazione_capacity_building"],
    tools: [
      "conferimento di funzioni comunali",
      "uffici e personale condivisi",
      "programmazione associata",
      "incentivi regionali al riordino",
      "monitoraggio di spesa e output dei servizi",
    ],
    territorialScale: "Intercomunale / Unione di Comuni",
    interventionStatus:
      "Modello istituzionale tuttora operativo in Emilia-Romagna; la Regione continua a supportare le Unioni e pubblica nel 2026 mappe e dati aggiornati sulle forme associative.",
    evaluationMethod:
      "La valutazione positiva principale utilizza dati amministrativi dei comuni emiliano-romagnoli e metodologie quasi-sperimentali, combinando differenze nelle differenze e matching per confrontare l'evoluzione della spesa dei comuni entrati in Unione con comuni comparabili non aderenti. Un successivo studio usa nearest-neighbour matching e fuzzy regression discontinuity su un indice più ampio di efficienza tecnica e non trova un effetto significativo, rendendo l'evidenza complessiva eterogenea.",
    comparator:
      "Comuni comparabili non aderenti a un'Unione nello stesso periodo; nel successivo studio, comuni prossimi alle soglie istituzionali utilizzate nel fuzzy regression discontinuity design.",
    outcomes: [
      "spesa corrente pro capite",
      "livello degli output dei servizi locali",
      "efficienza tecnica amministrativa",
      "persistenza dei risparmi nel tempo",
    ],
    results:
      "Lo studio sull'Emilia-Romagna stima che l'adesione a un'Unione riduca la spesa corrente totale pro capite senza evidenza di riduzione degli output dei servizi, con risparmi che persistono nel tempo. Tuttavia, uno studio successivo su un diverso indice di efficienza tecnica non rileva un effetto statisticamente significativo: il record documenta quindi un risultato positivo specifico sulla spesa, non una prova generale che ogni forma di cooperazione intercomunale migliori l'efficienza.",
    effectSize:
      "Circa −5% di spesa corrente totale pro capite nello studio quasi-sperimentale sull'Emilia-Romagna, senza riduzione rilevata del livello dei servizi; lo studio successivo sull'indice composito di efficienza tecnica trova invece un effetto non significativo.",
    evidenceStrength: "moderata",
    costsRequirements:
      "Richiede accordi istituzionali stabili, definizione precisa delle funzioni conferite, governance e responsabilità condivise, armonizzazione di processi e sistemi informativi e capacità di misurare separatamente costi e output. I costi di transizione possono precedere eventuali economie di scala.",
    limitations: [
      "I risultati positivi più netti provengono soprattutto da piccoli comuni dell'Emilia-Romagna; Lamezia Terme ha dimensioni e struttura organizzativa diverse.",
      "L'adesione alle Unioni non è randomizzata e, pur con matching e difference-in-differences, può restare selezione non osservata.",
      "Un successivo studio con fuzzy regression discontinuity e matching non trova un miglioramento significativo dell'efficienza tecnica complessiva, quindi la letteratura non è univoca.",
      "Risparmiare spesa non equivale automaticamente a migliorare qualità o accessibilità: gli output e gli standard di servizio devono essere monitorati insieme ai costi.",
    ],
    unintendedEffects:
      "Una gestione associata mal progettata può aumentare livelli di coordinamento, allungare responsabilità decisionali o allontanare il servizio dall'utente. Devono quindi essere osservati tempi, qualità, accessibilità e accountability oltre alla sola spesa.",
    primarySource: {
      label: "Regione Emilia-Romagna — Unioni di Comuni",
      url: "https://www.regione.emilia-romagna.it/autonomie-locali/unioni-di-comuni",
    },
    evaluationStudies: [
      {
        label: "Journal of Regional Science — Ferraresi et al. (2018)",
        url: "https://doi.org/10.1111/jors.12388",
        citation:
          "Ferraresi M, Migali G, Rizzo L (2018), Does intermunicipal cooperation promote efficiency gains? Evidence from Italian municipal unions",
        doi: "10.1111/jors.12388",
      },
      {
        label: "Journal of Regional Science — Luca & Modrego (2021)",
        url: "https://doi.org/10.1111/jors.12509",
        citation:
          "Luca D, Modrego F (2021), Stronger together? Assessing the causal effect of inter-municipal cooperation on the efficiency of small Italian municipalities",
        doi: "10.1111/jors.12509",
      },
    ],
    lastVerifiedAt: "2026-09-06",
    transferabilityItaly:
      "Diretta sul piano giuridico-istituzionale, perché le Unioni di Comuni sono uno strumento italiano consolidato; più limitata sul piano dell'effetto causale per un comune medio-grande. Il principio trasferibile a Lamezia è soprattutto la condivisione selettiva di funzioni specialistiche dove esistono costi fissi elevati o competenze rare.",
    lameziaAdaptation:
      "Prima di ipotizzare una nuova struttura associativa, mappare 3–5 funzioni con elevati costi fissi o carenze di competenze — per esempio data engineering, cybersecurity, procurement specialistico, progettazione europea o servizi tecnici — e confrontare costo/qualità attuali con scenari di gestione condivisa con comuni limitrofi. Avviare eventualmente un solo servizio condiviso con SLA, costi e output predefiniti.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "contabilità analitica per funzione",
      "indicatori di output e qualità",
      "mappa delle competenze del personale",
      "analisi dei comuni partner e delle funzioni condivisibili",
      "accordo di governance e SLA",
    ],
    tags: ["Unioni di Comuni", "cooperazione intercomunale", "capacità amministrativa", "economie di scala", "Italia", "difference-in-differences"],
    revisionHistory: [
      {
        date: "2026-09-06",
        note: "Inserimento dopo scouting Parallel Search e verifica su fonte regionale e studi peer-reviewed; forza moderata per evidenza successiva non univoca.",
      },
    ],
  },
  {
    id: "london-boroughs-universal-free-school-meals-bodyweight",
    title: "Pasti scolastici gratuiti universali nelle scuole primarie",
    authority: "London Boroughs of Newham, Islington, Southwark e Tower Hamlets",
    territory: "Londra",
    country: "Regno Unito",
    implementationYear: "Rollout locale 2009/10–2014/15",
    problem:
      "La mensa gratuita basata sulla prova dei mezzi lascia fuori una parte dei bambini, può creare stigma e non garantisce che tutti gli alunni abbiano accesso regolare a un pasto scolastico nutrizionalmente regolato.",
    measure:
      "Quattro autorità locali londinesi hanno progressivamente esteso il pasto scolastico gratuito a tutti i bambini della scuola primaria, indipendentemente dal reddito familiare, anticipando le successive estensioni su scala più ampia.",
    mechanism:
      "Eliminare prezzo e prova dei mezzi aumenta il take-up e riduce stigma e frizioni amministrative; sostituire pranzi domestici o acquisti alternativi con pasti scolastici soggetti a standard nutrizionali può inoltre modificare la qualità media della dieta.",
    population:
      "Bambini delle scuole primarie statali nei quattro borough; la valutazione utilizza dati sanitari population-wide raccolti da infermieri scolastici alle età 4/5 e 10/11 anni.",
    primaryArea: "istruzione_giovani",
    secondaryAreas: ["salute_pubblica_locale", "welfare_inclusione_servizi_sociali"],
    interventionTypes: ["servizio_diretto", "incentivo_economico", "modifica_organizzativa_processo"],
    tools: ["mensa scolastica", "finanziamento universale del pasto", "standard nutrizionali", "dati scolastici e sanitari aggregati"],
    territorialScale: "Borough / sistema scolastico primario locale",
    interventionStatus:
      "Le iniziative locali sono state successivamente affiancate e ampliate da programmi più estesi a Londra; Tower Hamlets continua a indicare una copertura universale dei pasti gratuiti per gli alunni delle scuole statali del borough.",
    evaluationMethod:
      "Difference-in-differences che sfrutta il rollout in tempi diversi tra quattro autorità locali londinesi e confronta i bambini esposti con popolazioni scolastiche non ancora esposte, utilizzando dati sanitari amministrativi population-wide. Lo studio adotta metodi robusti alla variazione del timing del trattamento e all'eterogeneità degli effetti.",
    comparator:
      "Bambini di autorità locali non ancora coperte da un programma universale nello stesso periodo e coorti con diversa durata di esposizione.",
    outcomes: ["BMI", "prevalenza di obesità", "prevalenza di sovrappeso", "durata dell'esposizione al pasto universale"],
    results:
      "L'esposizione ai pasti gratuiti universali riduce BMI e prevalenza di obesità sia a 4/5 sia a 10/11 anni, con effetti più piccoli nei bambini più grandi e indicazioni che una maggiore durata dell'esposizione produca benefici cumulativi.",
    effectSize:
      "Per un bambino esposto per sette anni, la stima è circa −1/−2 punti percentuali nella probabilità di obesità e un BMI inferiore di circa 4–7% di una deviazione standard rispetto a un bambino non esposto.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede finanziamento stabile dei pasti aggiuntivi, capacità di cucina/refettorio, procurement e controllo qualità, personale e gestione dei picchi di domanda. Il costo netto dipende da take-up, infrastruttura esistente e trasferimenti nazionali/regionali.",
    limitations: [
      "La policy non è randomizzata: il disegno sfrutta il rollout locale e richiede assunzioni controfattuali proprie del difference-in-differences.",
      "I quattro borough hanno livelli elevati di povertà infantile e caratteristiche urbane specifiche, quindi la magnitudine dell'effetto può non trasferirsi integralmente ad altri territori.",
      "L'effetto riguarda pasti scolastici soggetti a standard nutrizionali: la gratuità senza qualità del pasto non costituisce lo stesso trattamento.",
      "La sostenibilità dipende dalla capacità fisica delle mense e dal finanziamento ricorrente, non soltanto dalla decisione tariffaria.",
    ],
    unintendedEffects:
      "Un aumento rapido del take-up può mettere sotto pressione cucine, refettori e personale; devono essere monitorati tempi di servizio, qualità nutrizionale, spreco alimentare e sostituzione di altre forme di sostegno.",
    primarySource: {
      label: "Tower Hamlets Council — Free school meals",
      url: "https://www.towerhamlets.gov.uk/lgnl/education_and_learning/school_finance_and_support/free_school_meals.aspx",
    },
    evaluationStudies: [
      {
        label: "Journal of Health Economics",
        url: "https://doi.org/10.1016/j.jhealeco.2024.102937",
        citation:
          "Holford A, Rabe B (2024), Universal free school meals and children's bodyweight: Impacts by age and duration of exposure",
        doi: "10.1016/j.jhealeco.2024.102937",
      },
    ],
    lastVerifiedAt: "2026-09-06",
    transferabilityItaly:
      "Alta sul piano operativo perché la refezione scolastica è già un servizio nel quale i comuni italiani svolgono un ruolo rilevante; la sostenibilità economica e la struttura tariffaria restano però locali e l'universalità va confrontata con fasce ISEE, esenzioni e capacità fisica disponibile.",
    lameziaAdaptation:
      "Costruire prima una baseline per scuola su iscritti, adesioni alla mensa, fasce tariffarie/ISEE, rinunce, morosità, costo marginale del pasto, capienza e spreco. Se emergono barriere di prezzo o stigma, valutare un'estensione progressiva della gratuità in un gruppo di scuole o classi con rollout scaglionato e outcome su take-up, assenze, spreco e indicatori di benessere disponibili in forma aggregata.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "take-up mensa per scuola",
      "costi fissi e marginali",
      "capienza cucine e refettori",
      "fasce tariffarie e ISEE in forma protetta",
      "indicatori di qualità nutrizionale e spreco",
    ],
    tags: ["mensa scolastica", "pasti gratuiti", "obesità infantile", "Londra", "difference-in-differences", "welfare"],
    revisionHistory: [
      {
        date: "2026-09-06",
        note: "Prima verifica; rollout locale e risultati quantitativi controllati sulla fonte accademica open access e su fonte dell'autorità locale.",
      },
    ],
  },
  {
    id: "san-francisco-sfpark-demand-responsive-parking",
    title: "Tariffe di sosta dinamiche basate sull'occupazione degli stalli (SFpark)",
    authority: "San Francisco Municipal Transportation Agency",
    territory: "San Francisco, California",
    country: "Stati Uniti",
    implementationYear: "Pilota dal 2011; metodologia successivamente estesa",
    problem:
      "Prezzi di sosta rigidi possono produrre isolati saturi, ricerca prolungata di parcheggio, circling, doppia fila e congestione, mentre altri stalli vicini restano sottoutilizzati.",
    measure:
      "Sistema SFpark con sensori e dati di occupazione, informazioni sulla disponibilità e tariffe dei parcheggi su strada e in autorimessa aggiustate periodicamente per mantenere una quota di stalli liberi e avvicinare l'occupazione a un intervallo obiettivo.",
    mechanism:
      "Prezzi differenziati per luogo e fascia oraria redistribuiscono la domanda verso blocchi, orari o autorimesse meno saturi; una maggiore probabilità di trovare subito posto riduce il traffico di ricerca e le relative esternalità.",
    population: "Automobilisti, utenti del trasporto pubblico, residenti, visitatori e attività nelle aree pilota di San Francisco.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["ambiente_clima_energia", "digitalizzazione_servizi_online", "sviluppo_economico_commercio_lavoro"],
    interventionTypes: ["incentivo_economico", "regolazione", "infrastruttura_digitale", "targeting_data_analytics", "informazione_trasparenza"],
    tools: ["parcometri intelligenti", "sensori/dati di occupazione", "pricing per blocco e fascia oraria", "informazioni real-time", "dashboard e valutazione con aree di controllo"],
    territorialScale: "Quartieri commerciali / rete di sosta urbana",
    interventionStatus:
      "Il pilota è concluso, ma San Francisco ha adottato la metodologia di demand-responsive pricing nella gestione ordinaria di migliaia di parcometri e autorimesse municipali.",
    evaluationMethod:
      "Il programma è stato valutato con aree pilota e di controllo e, in studi accademici successivi, con difference-in-differences che sfrutta il rollout e le variazioni tariffarie per stimare effetti su traffico e trasporto pubblico. La valutazione SFMTA misura inoltre occupazione, ricerca di parcheggio, VMT ed emissioni prima e dopo l'intervento.",
    comparator: "Aree di controllo e periodi/blocchi non ancora interessati dalle variazioni del programma, osservati parallelamente alle aree pilota.",
    outcomes: ["tempo di ricerca del parcheggio", "saturazione degli stalli", "vehicle miles travelled da circling", "emissioni", "flusso di traffico", "ridership degli autobus"],
    results:
      "SFpark ha reso meno frequente la completa saturazione degli isolati e ha ridotto sensibilmente ricerca di parcheggio, circling ed emissioni. Uno studio peer-reviewed difference-in-differences conferma un aumento significativo della ridership degli autobus e una riduzione del traffico nelle aree interessate.",
    effectSize:
      "Valutazione SFMTA: tempo medio di ricerca −5 minuti (−43%); isolati completamente pieni −16%; VMT ed emissioni di gas serra dovuti al circling −30%; raggiungimento dell'occupazione obiettivo 60–80% +31% nelle aree pilota, contro +6% nei controlli.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede inventario digitale della sosta, sistemi di pagamento e dati affidabili, capacità analitica, regole trasparenti per gli aggiustamenti tariffari e comunicazione agli utenti. Sensori dedicati non sono necessariamente indispensabili se l'occupazione può essere stimata con altre fonti, ma il pilot originale utilizzava infrastruttura tecnologica significativa.",
    limitations: [
      "Il programma combina pricing, tecnologia, informazione e nuovi strumenti di pagamento; non ogni risultato può essere attribuito al solo prezzo.",
      "San Francisco ha densità, domanda di sosta e alternative di trasporto pubblico molto diverse da Lamezia Terme.",
      "Le stime ufficiali pre/post con aree di controllo sono più ampie delle sole stime causali peer-reviewed e non vanno trattate come equivalenti per ogni outcome.",
      "Una tariffa dinamica può produrre effetti distributivi e spostamenti della domanda verso strade limitrofe che richiedono monitoraggio locale.",
    ],
    unintendedEffects:
      "Aumenti tariffari in punti molto richiesti possono essere regressivi o spostare sosta e traffico su vie vicine; il sistema deve quindi includere limiti alle variazioni, monitoraggio dei bordi e alternative per residenti, disabili e categorie con bisogni specifici.",
    primarySource: {
      label: "SFMTA — SFpark Evaluation",
      url: "https://www.sfmta.com/getting-around/drive-park/demand-responsive-pricing/sfpark-evaluation",
    },
    evaluationStudies: [
      {
        label: "Journal of Environmental Economics and Management",
        url: "https://doi.org/10.1016/j.jeem.2019.102273",
        citation:
          "Krishnamurthy CKB, Ngo NS (2020), The effects of smart-parking on transit and traffic: Evidence from SFpark",
        doi: "10.1016/j.jeem.2019.102273",
      },
      {
        label: "SFMTA — SFpark pilot evaluation summary",
        url: "https://www.sfmta.com/sites/default/files/reports-and-documents/2018/04/sfpark_eval_summary_2014.pdf",
        citation: "San Francisco Municipal Transportation Agency (2014), SFpark Pilot Project Evaluation Summary",
      },
    ],
    lastVerifiedAt: "2026-09-06",
    transferabilityItaly:
      "Media-alta per città italiane con aree commerciali congestionate e sosta tariffata, ma la fattibilità dipende da poteri tariffari, parcometri, dati e domanda locale. Il principio trasferibile è usare prezzi e dati per gestire un obiettivo di disponibilità, non copiare le tariffe di San Francisco.",
    lameziaAdaptation:
      "Selezionare uno o due ambiti con sosta tariffata e saturazione documentata, misurare occupazione per fascia oraria e tempo di ricerca, quindi testare per alcuni mesi piccole variazioni tariffarie predefinite per mantenere una quota di stalli liberi. Usare aree comparabili come controllo e monitorare traffico di bordo, turnover commerciale e accettabilità.",
    implementability: "medio_termine",
    capacityDataNeeds: ["inventario stalli", "occupazione per fascia oraria", "transazioni dei parcometri", "flussi di traffico", "regole tariffarie", "aree di controllo e metriche commerciali"],
    tags: ["sosta", "smart parking", "pricing", "SFpark", "congestione", "mobilità", "difference-in-differences"],
    revisionHistory: [
      {
        date: "2026-09-06",
        note: "Prima verifica su fonte SFMTA e studio peer-reviewed; separati i risultati della valutazione ufficiale dalle stime causali accademiche.",
      },
    ],
  },
  {
    id: "los-angeles-restaurant-hygiene-grade-cards",
    title: "Pubblicazione obbligatoria dei voti di igiene dei ristoranti",
    authority: "Los Angeles County Department of Public Health / città aderenti",
    territory: "Los Angeles County, California",
    country: "Stati Uniti",
    implementationYear: "Dal 1998",
    problem:
      "Le ispezioni sanitarie possono produrre informazioni tecniche che restano poco visibili ai consumatori, riducendo l'incentivo reputazionale degli esercizi a migliorare rapidamente le condizioni igieniche.",
    measure:
      "Attribuzione di un punteggio/grade alle strutture alimentari dopo l'ispezione e obbligo di esporre il cartello in posizione chiaramente visibile al pubblico nelle aree soggette all'ordinanza della contea.",
    mechanism:
      "Rendere l'esito dell'ispezione immediatamente osservabile al punto di scelta modifica la domanda dei consumatori e aumenta il costo reputazionale di standard igienici bassi, rafforzando gli incentivi alla conformità oltre alla sola sanzione amministrativa.",
    population: "Ristoranti e altri esercizi alimentari soggetti alle ispezioni della contea e consumatori che li frequentano.",
    primaryArea: "salute_pubblica_locale",
    secondaryAreas: ["sviluppo_economico_commercio_lavoro", "digitalizzazione_servizi_online"],
    interventionTypes: ["informazione_trasparenza", "enforcement_controllo", "regolazione"],
    tools: ["ispezioni sanitarie", "punteggio standardizzato", "grade card A/B/C", "obbligo di esposizione", "registro pubblico degli esiti"],
    territorialScale: "Contea / città aderenti / singolo esercizio",
    interventionStatus:
      "Sistema tuttora operativo: Los Angeles County mantiene requisiti di grading e posting per esercizi alimentari nelle aree non incorporate e nelle città che hanno adottato l'ordinanza della contea.",
    evaluationMethod:
      "La valutazione economica sfrutta l'introduzione non anticipata del sistema, variazioni temporali e adozioni differenziate tra città per stimare effetti su punteggi igienici e domanda. Una successiva valutazione delle ospedalizzazioni confronta Los Angeles County prima/dopo il 1998 con il resto della California, aggiustando per trend temporali e geografici mediante regressione OLS.",
    comparator:
      "Ristoranti e territori non ancora soggetti alla disclosure nelle analisi economiche; per l'outcome sanitario, il resto della California nel periodo 1993–2000 insieme alla baseline pre-1998 di Los Angeles County.",
    outcomes: ["punteggi delle ispezioni", "risposta della domanda dei consumatori", "ospedalizzazioni per malattie trasmesse da alimenti", "persistenza degli standard igienici"],
    results:
      "Dopo l'introduzione dei grade card, i punteggi igienici dei ristoranti sono aumentati e la qualità dichiarata ha iniziato a influire maggiormente sulla domanda. L'analisi sanitaria controllata associa il programma anche a una riduzione significativa delle ospedalizzazioni per malattie trasmesse da alimenti rispetto al trend del resto della California.",
    effectSize:
      "Studio QJE: punteggi delle ispezioni circa +5%. Studio sulle ospedalizzazioni: −13,1% nel 1998 rispetto al controfattuale aggiustato (p<0,01), con riduzione mantenuta anche negli anni successivi analizzati.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede un sistema ispettivo standardizzato, criteri di scoring comprensibili, procedure di riesame, produzione/esposizione dei cartelli e dati pubblici aggiornati. Il valore della disclosure dipende dalla qualità e comparabilità delle ispezioni sottostanti.",
    limitations: [
      "Non è un RCT: le stime sfruttano introduzione e adozione territoriale della policy, controlli temporali e geografici e modelli osservazionali.",
      "Il calo delle ospedalizzazioni non consente di attribuire ogni singolo caso evitato direttamente a uno specifico ristorante o all'esposizione del cartello.",
      "Standard ispettivi, frequenza dei controlli e competenze sanitarie in Italia differiscono dal sistema della contea di Los Angeles.",
      "La disclosure può creare forti conseguenze reputazionali; accuratezza, diritto di rettifica e tempestività dell'aggiornamento sono parte essenziale del trattamento.",
    ],
    unintendedEffects:
      "Errori o ritardi nell'aggiornamento del grade possono produrre danni reputazionali sproporzionati; devono esistere meccanismi rapidi di correzione e una presentazione che distingua chiaramente esito, data e stato dell'ispezione.",
    primarySource: {
      label: "Los Angeles County Department of Public Health — Grading and Posting Requirements",
      url: "https://publichealth.lacounty.gov/eh/inspection/grading-posting-requirements-retail-food-facilities.htm",
    },
    evaluationStudies: [
      {
        label: "Quarterly Journal of Economics",
        url: "https://doi.org/10.1162/003355303321675428",
        citation:
          "Jin GZ, Leslie P (2003), The Effect of Information on Product Quality: Evidence from Restaurant Hygiene Grade Cards",
        doi: "10.1162/003355303321675428",
      },
      {
        label: "Journal of Environmental Health / University of Maryland",
        url: "https://drum.lib.umd.edu/items/a7c10bd5-f8d4-4249-890e-91ef7335307d",
        citation:
          "Simon PA et al. (2005), Impact of Restaurant Hygiene Grade Cards on Foodborne-Disease Hospitalizations in Los Angeles County",
      },
    ],
    lastVerifiedAt: "2026-09-06",
    transferabilityItaly:
      "Media come modello di trasparenza del controllo, ma la competenza sulle ispezioni alimentari in Italia è principalmente sanitaria e non coincide sempre con il comune. Un'applicazione locale richiederebbe accordo con ASP/servizi competenti e verifica della base giuridica per pubblicare e standardizzare gli esiti.",
    lameziaAdaptation:
      "Non creare un voto comunale parallelo. Verificare con ASP Calabria se gli esiti delle ispezioni alimentari possono essere pubblicati in forma standardizzata e tempestiva; in caso affermativo, sperimentare un registro pubblico con data dell'ultima ispezione, stato di conformità secondo la classificazione dell'autorità competente e procedura di rettifica, misurando accessi, tempi di correzione e recidive.",
    implementability: "medio_termine",
    capacityDataNeeds: ["accordo con ASP/SIAN", "schema standard degli esiti ispettivi", "base giuridica per disclosure", "registro degli esercizi", "workflow di rettifica e aggiornamento", "indicatori di recidiva"],
    tags: ["food safety", "ristoranti", "ispezioni", "trasparenza", "grade cards", "Los Angeles", "salute pubblica"],
    revisionHistory: [
      {
        date: "2026-09-06",
        note: "Prima verifica su fonte della contea e valutazioni peer-reviewed; mantenute separate qualità ispettiva, risposta di mercato e outcome sanitario.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
