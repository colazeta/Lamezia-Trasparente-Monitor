import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_04 = [
  {
    id: "milan-area-c-congestion-charge-air-quality",
    title: "Area C: congestion charge e restrizioni al traffico nel centro di Milano",
    authority: "Comune di Milano",
    territory: "Milano — Cerchia dei Bastioni",
    country: "Italia",
    implementationYear: "Dal 16 gennaio 2012; misura strutturale dal 2013",
    problem:
      "Congestione stradale, elevata pressione del traffico nel centro urbano ed esposizione della popolazione agli inquinanti atmosferici, in particolare particolato e ossidi di azoto.",
    measure:
      "Zona a traffico limitato di circa 8,2 km² con accesso regolato da varchi elettronici, divieti per alcune classi di veicoli e pagamento di una tariffa giornaliera per la maggior parte dei veicoli ammessi. La misura ha sostituito il precedente Ecopass e combina congestion pricing, restrizioni ambientali ed enforcement automatico.",
    mechanism:
      "Ridurre il numero di veicoli che entrano nel centro e modificare composizione della flotta e scelte modali attraverso un costo marginale esplicito dell'accesso, divieti selettivi e controllo sistematico delle targhe.",
    population:
      "Conducenti e veicoli che accedono alla Cerchia dei Bastioni; residenti, lavoratori e utenti del centro esposti alle condizioni di traffico e qualità dell'aria.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["ambiente_clima_energia", "salute_pubblica_locale"],
    interventionTypes: ["regolazione", "incentivo_economico", "enforcement_controllo", "infrastruttura_digitale"],
    tools: ["congestion charge", "ZTL", "varchi elettronici e lettura targhe", "classificazione emissiva dei veicoli", "pagamento digitale", "monitoraggio qualità dell'aria"],
    territorialScale: "Centro urbano / cordone di accesso",
    interventionStatus:
      "Operativa. Il Comune di Milano indica Area C come ZTL centrale attiva tutto l'anno nei giorni feriali; il provvedimento sperimentale del 2012 è stato reso strutturale nel 2013 e successivamente aggiornato.",
    evaluationMethod:
      "Valutazione controfattuale con Fixed Effects Nuclear Norm Matrix Completion su dati mensili di qualità dell'aria 2008–2019 in Lombardia. Il metodo ricostruisce l'andamento che il PM10 e gli NOx avrebbero avuto nell'area trattata in assenza di Area C usando le serie delle stazioni non trattate; le specificazioni includono anche variabili meteorologiche.",
    comparator:
      "Controfattuale sintetico costruito dalle stazioni di monitoraggio lombarde non direttamente interessate dalla congestion charge, calibrato sul periodo pre-2012.",
    outcomes: ["concentrazione di PM10", "concentrazione di NOx", "robustezza dell'effetto a covariate meteorologiche"],
    results:
      "La valutazione pubblicata nel 2026 identifica una riduzione statisticamente significativa del PM10 all'interno di Area C rispetto al controfattuale. Non emerge invece un effetto coerente sugli NOx: il risultato ambientale va quindi letto come specifico al particolato e non come miglioramento uniforme di tutti gli inquinanti.",
    effectSize:
      "PM10: riduzione statisticamente significativa nel modello di matrix completion; l'abstract pubblico dell'articolo 2026 non espone il valore puntuale finale. NOx: nessun effetto consistente nelle specificazioni riportate.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede un perimetro giuridicamente definito, infrastruttura di access control/ANPR, back office per pagamenti, esenzioni e sanzioni, integrazione con classificazioni veicolari e un sistema indipendente di monitoraggio di traffico e qualità dell'aria. Il Comune di Milano applica attualmente un ticket giornaliero ordinario di 7,50 euro, ma il livello tariffario non è direttamente trasferibile.",
    limitations: [
      "Non è un esperimento randomizzato: l'identificazione dipende dalla qualità del controfattuale ricostruito dalle altre stazioni e dalle assunzioni del modello di matrix completion.",
      "La misura sostituisce Ecopass e si inserisce in un sistema di mobilità metropolitana molto diverso da quello di Lamezia Terme; il trattamento non è una semplice ZTL.",
      "L'effetto positivo è chiaro per il PM10 ma non per gli NOx, quindi non va generalizzato a tutti gli inquinanti o a tutti gli outcome sanitari.",
      "Il paper 2026 è recente e l'abstract pubblico non consente di riportare in modo sicuro il valore puntuale finale dell'effetto senza accesso al testo completo."
    ],
    unintendedEffects:
      "Possibili costi distributivi per lavoratori, residenti e attività che dipendono dall'auto, deviazione di traffico e domanda di parcheggio verso aree esterne al cordone. Questi outcome devono essere monitorati insieme a traffico, accessibilità e qualità dell'aria.",
    primarySource: {
      label: "Comune di Milano — Area C",
      url: "https://www.comune.milano.it/argomenti/mobilita/area-c"
    },
    evaluationStudies: [
      {
        label: "Environmetrics",
        url: "https://onlinelibrary.wiley.com/doi/10.1002/env.70111",
        citation: "Adam R, Biancalani F, Metulini R (2026), Counterfactual Evaluation of Traffic Restrictions on Air Quality in Milan's Congestion Charge Zone Using Matrix Completion",
        doi: "10.1002/env.70111"
      }
    ],
    lastVerifiedAt: "2026-09-04",
    transferabilityItaly:
      "Alta sul piano giuridico-operativo solo per città con pressione di traffico, trasporto alternativo e perimetri ZTL adeguati; il caso è particolarmente utile perché dimostra in un contesto italiano come associare una politica di accesso urbano a un disegno controfattuale di valutazione. Per città medie la lezione trasferibile è soprattutto il principio di cordone misurabile, enforcement automatico e outcome ambientali predefiniti.",
    lameziaAdaptation:
      "Non replicare una congestion charge cittadina senza una diagnosi di congestione e alternative modali. Costruire prima una baseline su flussi, sosta, NO2/PM e origine-destinazione nel centro; se emergono hotspot, testare una ZTL o accesso differenziato su un perimetro limitato con rollout per fasi, varchi già disponibili o temporanei e stazioni di controllo esterne utilizzabili come comparatore.",
    implementability: "strutturale",
    capacityDataNeeds: ["conteggi e matrici di traffico", "mappa accessi e parcheggi", "monitoraggio PM10/NO2", "infrastruttura ANPR", "quadro ZTL e sanzioni", "analisi distributiva e alternative TPL"],
    tags: ["Area C", "congestion charge", "ZTL", "PM10", "matrix completion", "Milano", "mobilità urbana"],
    revisionHistory: [{ date: "2026-09-04", note: "Prima verifica; incorporata la nuova valutazione controfattuale Environmetrics 2026 e registrato esplicitamente l'esito nullo/non coerente sugli NOx." }]
  },
  {
    id: "london-low-traffic-neighbourhoods-road-injuries",
    title: "Low Traffic Neighbourhoods per ridurre traffico di attraversamento e incidenti",
    authority: "London boroughs, con coordinamento e finanziamento tramite Transport for London",
    territory: "Greater London",
    country: "Regno Unito",
    implementationYear: "2015–2024; forte espansione dal 2020",
    problem:
      "Elevata esposizione a traffico di attraversamento e rischio di collisioni nelle strade residenziali, con timore che interventi di filtraggio possano semplicemente spostare traffico e incidenti sulle strade di confine.",
    measure:
      "Creazione di aree residenziali nelle quali tutte le proprietà restano raggiungibili in auto ma il traffico motorizzato di attraversamento viene impedito o fortemente disincentivato tramite filtri fisici, fioriere, dissuasori o varchi con telecamera, mantenendo permeabilità a pedoni e biciclette.",
    mechanism:
      "Ridurre volumi e conflitti veicolari sulle strade locali, scoraggiare itinerari di attraversamento e rendere più sicuri gli spostamenti a piedi e in bicicletta senza chiudere l'accesso locale ai residenti e ai servizi.",
    population:
      "Residenti e utenti della strada nelle aree LTN e sulle strade immediatamente perimetrali; la valutazione 2025 copre 113 LTNs introdotti a Londra tra 2015 e 2024.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["sicurezza_urbana_prevenzione", "salute_pubblica_locale", "ambiente_clima_energia"],
    interventionTypes: ["regolazione", "infrastruttura_fisica", "infrastruttura_digitale"],
    tools: ["modal filters", "dissuasori e fioriere", "telecamere", "traffic orders", "conteggi traffico", "dati STATS19 sugli incidenti"],
    territorialScale: "Quartiere / rete di strade locali",
    interventionStatus:
      "Numerosi schemi sono operativi, mentre altri sono stati modificati o rimossi. La governance è decentrata: i borough propongono e progettano gli LTNs sulle proprie strade e restano responsabili delle decisioni e della consultazione.",
    evaluationMethod:
      "Controlled before-and-after longitudinale su dati di polizia STATS19. La valutazione principale usa regressioni di Poisson condizionali a effetti fissi sul numero di feriti per road link e trimestre, dal 2012 a giugno 2024, confrontando l'andamento prima e dopo l'introduzione in 113 LTNs e verificando separatamente le boundary roads; sfrutta anche la rimozione di 27 schemi come ulteriore test di reversibilità.",
    comparator:
      "Stessi road links prima dell'intervento e strade londinesi non trattate nel medesimo periodo; le strade di confine sono analizzate separatamente per verificare displacement del rischio.",
    outcomes: ["feriti stradali totali", "morti o feriti gravi", "feriti per tipologia di utente", "incidenti sulle boundary roads", "effetti dopo rimozione della LTN"],
    results:
      "L'introduzione degli LTNs è associata a una riduzione marcata delle lesioni stradali all'interno delle aree, senza evidenza di aumento complessivo sulle strade di confine. Quando una LTN viene rimossa, il numero di feriti torna verso i livelli pre-intervento, rafforzando l'interpretazione causale pur in un disegno non randomizzato.",
    effectSize:
      "Feriti totali −35% (IC95% 29–40%); morti o feriti gravi −37% (IC95% 24–48%). Boundary roads: feriti totali −2% (IC95% −5% a +2%) e KSI 0% (IC95% −7% a +8%), quindi nessuna evidenza di displacement complessivo.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede progettazione di rete e accessibilità, traffic orders, consultazione con residenti ed emergency services, filtri fisici o enforcement con telecamera e monitoraggio pre/post di traffico, tempi di percorrenza e incidenti. I costi variano molto tra schemi leggeri con bollards/planters e soluzioni con telecamere e riqualificazione dello spazio.",
    limitations: [
      "Gli LTNs non sono assegnati casualmente: borough e quartieri che li adottano possono differire da quelli non trattati per trend o priorità di sicurezza non completamente osservabili.",
      "Una parte importante delle introduzioni 2020 coincide con la pandemia e con forti cambiamenti nei pattern di mobilità; la valutazione lunga fino al 2024 e gli effetti fissi riducono ma non annullano questo rischio.",
      "I benefici risultano più piccoli per alcuni LTNs introdotti nell'Outer London dal 2020, suggerendo che design, contesto e capacità di ridurre realmente il traffico sono determinanti.",
      "La misura richiede una verifica puntuale dell'accesso di emergenza, dei disabili, delle consegne e del possibile trasferimento del traffico prima di una replica."
    ],
    unintendedEffects:
      "Il principale rischio è spostare traffico, congestione o tempi di percorrenza sulle strade perimetrali; la valutazione 2025 non trova un aumento complessivo dei feriti sulle boundary roads, ma questo non esclude effetti locali su volumi, rumore o accessibilità che richiedono monitoraggio specifico.",
    primarySource: {
      label: "London City Hall — responsabilità dei borough per gli LTN",
      url: "https://www.london.gov.uk/who-we-are/what-london-assembly-does/questions-mayor/find-an-answer/ltn"
    },
    evaluationStudies: [
      {
        label: "Injury Prevention / PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/40623802/",
        citation: "Furlong J et al. (2025), Low Traffic Neighbourhoods in London reduce road traffic injuries: a controlled before-and-after analysis (2012–2024)",
        doi: "10.1136/ip-2024-045571"
      },
      {
        label: "Findings — Waltham Forest replication",
        url: "https://doi.org/10.32866/001c.18330",
        citation: "Laverty AA, Aldred R, Goodman A (2021), The Impact of Introducing Low Traffic Neighbourhoods on Road Traffic Injuries",
        doi: "10.32866/001c.18330"
      }
    ],
    lastVerifiedAt: "2026-09-04",
    transferabilityItaly:
      "Alta per strade locali su cui il Comune dispone di competenze di circolazione e progettazione, ma la replica deve essere costruita come intervento di rete e non come singola chiusura. Il dato più utile è l'assenza di aumento medio degli incidenti sulle strade di confine, purché il displacement venga comunque misurato localmente.",
    lameziaAdaptation:
      "Individuare uno o due micro-quartieri con forte traffico di attraversamento, scuole o alta vulnerabilità pedonale; misurare prima volumi, velocità, incidenti e tempi dei mezzi di emergenza; introdurre filtri reversibili per 6–12 mesi con accesso garantito ai residenti e ai servizi e un gruppo di strade comparabili, pubblicando ex ante criteri di conferma, modifica o rimozione.",
    implementability: "medio_termine",
    capacityDataNeeds: ["conteggi traffico per strada", "velocità e incidenti geocodificati", "rete e gerarchia stradale", "consultazione residenti/emergenze", "monitoraggio boundary roads", "traffic order e segnaletica"],
    tags: ["LTN", "traffic calming", "sicurezza stradale", "quartieri", "pedoni", "controlled before-after", "Londra"],
    revisionHistory: [{ date: "2026-09-04", note: "Prima verifica; priorità data alla valutazione 2012–2024 pubblicata nel 2025, che include 113 LTNs, boundary roads e schemi successivamente rimossi." }]
  },
  {
    id: "denver-supportive-housing-sib-housing-first",
    title: "Housing First con supportive housing per persone senza dimora ad alta intensità di servizi",
    authority: "City and County of Denver",
    territory: "Denver, Colorado",
    country: "Stati Uniti",
    implementationYear: "2016–2020 nella valutazione; successivamente esteso",
    problem:
      "Persone in condizione di homelessness cronica con frequenti accessi a carcere, polizia, detox e servizi sanitari d'emergenza, gestite attraverso sistemi costosi ma incapaci di produrre stabilità abitativa.",
    measure:
      "Offerta di alloggio permanente con sussidio abitativo e servizi intensivi secondo il modello Housing First, senza richiedere come precondizione astinenza, trattamento o altri requisiti di 'housing readiness'. Il programma era inizialmente finanziato anche tramite social impact bond/pay-for-success.",
    mechanism:
      "Stabilizzare prima l'abitazione e affiancare case management e servizi clinico-sociali, riducendo la necessità di ricorrere a shelter, polizia, jail, detox e cure d'emergenza per gestire crisi ripetute.",
    population:
      "Persone con homelessness cronica e frequenti interazioni con giustizia penale e servizi d'emergenza; 724 persone eleggibili incluse nell'RCT, 363 assegnate all'offerta di supportive housing e 361 ai servizi usuali.",
    primaryArea: "housing_politiche_abitative",
    secondaryAreas: ["welfare_inclusione_servizi_sociali", "salute_pubblica_locale", "sicurezza_urbana_prevenzione"],
    interventionTypes: ["servizio_diretto", "incentivo_economico", "partnership_pubblico_privato_terzo_settore", "modifica_organizzativa_processo"],
    tools: ["housing voucher", "alloggio permanente", "case management intensivo", "servizi di salute mentale", "pay for success", "integrazione dati giustizia-sanità-welfare"],
    territorialScale: "Città-contea / individuo",
    interventionStatus:
      "Il programma sperimentale è concluso con esiti positivi e Denver ha proseguito con espansioni e finanziamenti diretti, combinando risorse locali, voucher statali/federali e Medicaid.",
    evaluationMethod:
      "Randomized controlled trial con 724 persone eleggibili: assegnazione casuale all'offerta di supportive housing oppure ai servizi usuali della comunità. Follow-up amministrativo pluriennale su assistenza abitativa, shelter, contatti di polizia, arresti, jail e detox.",
    comparator: "361 persone eleggibili assegnate casualmente ai servizi usuali disponibili nella comunità senza l'offerta Denver SIB.",
    outcomes: ["giorni di assistenza abitativa", "stabilità dell'alloggio", "uso dei shelter", "contatti di polizia e arresti", "jail stays e jail days", "detox", "costi pubblici"],
    results:
      "L'offerta di supportive housing ha prodotto molta più stabilità abitativa e ridotto in modo sostanziale uso dei shelter, contatti con polizia, arresti, giorni di carcere e servizi detox. Una parte rilevante dei costi del programma è stata compensata da minore uso di servizi pubblici di emergenza.",
    effectSize:
      "In tre anni: +560 giorni medi di assistenza abitativa; shelter visits −40%; giorni con shelter −35%; contatti di polizia −34%; arresti −40%; jail stays −30%; jail days −27% (−38 giorni medi); detox −65%. Tra chi è stato effettivamente alloggiato e vivo al follow-up, stabilità abitativa 86% a 1 anno, 81% a 2 anni, 77% a 3 anni.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Intervento intensivo: il costo annuo per unità riportato variava circa tra 22.265 e 35.770 USD a seconda del provider; il costo medio annuo effettivo per partecipante era inferiore perché dipendeva dai giorni in housing. Circa metà del costo per persona risultava compensata da minori servizi d'emergenza; per la quota finanziata direttamente da Denver gli offset stimati coprivano circa il 75–94% del costo dei supportive services, a seconda del provider. Servono soprattutto stock/voucher abitativi e servizi specialistici continuativi.",
    limitations: [
      "Il trattamento combina alloggio, sussidio e servizi intensivi: non è possibile attribuire gli effetti a una singola componente.",
      "Denver disponeva di voucher statali/federali, Medicaid e provider specializzati; un comune italiano non controlla autonomamente tutte queste leve.",
      "Gli outcome sanitari non sono tutti positivi: nel report principale alcune differenze nei servizi medici d'emergenza non risultano statisticamente significative.",
      "La popolazione era intenzionalmente ad altissimo utilizzo di servizi e i risultati non vanno generalizzati automaticamente a tutte le persone in emergenza abitativa."
    ],
    unintendedEffects:
      "Non emergono effetti avversi principali dal trial, ma la concentrazione di risorse su una popolazione ad alto utilizzo può sollevare questioni distributive se non è inserita in una strategia più ampia di prevenzione dell'homelessness e accesso all'alloggio.",
    primarySource: {
      label: "Urban Institute — Denver SIB initiative and outcomes",
      url: "https://www.urban.org/features/housing-first-breaks-homelessness-jail-cycle"
    },
    evaluationStudies: [
      {
        label: "Urban Institute — final RCT report",
        url: "https://www.urban.org/research/publication/breaking-homelessness-jail-cycle-housing-first-results-denver-supportive-housing-social-impact-bond-initiative",
        citation: "Cunningham MK et al. (2021), Breaking the Homelessness-Jail Cycle with Housing First: Results from the Denver Supportive Housing Social Impact Bond Initiative"
      },
      {
        label: "US Office of Justice Programs",
        url: "https://www.ojp.gov/library/publications/breaking-homelessness-jail-cycle-housing-first-results-denver-supportive",
        citation: "Office of Justice Programs record of the Denver Supportive Housing Social Impact Bond randomized evaluation"
      }
    ],
    lastVerifiedAt: "2026-09-04",
    transferabilityItaly:
      "Alta come modello di integrazione housing+welfare, ma strutturale sul piano delle competenze. In Italia un Comune può concorrere su alloggi, servizi sociali e presa in carico, mentre sanità, dipendenze e molte risorse abitative richiedono ASP/Regione, terzo settore e altri livelli di governo. Il dato trasferibile è che per gli utenti ad altissima intensità di servizi l'alloggio stabile può sostituire una quota di gestione emergenziale costosa.",
    lameziaAdaptation:
      "Costruire una lista pseudonimizzata di persone in homelessness cronica con ripetuti accessi a dormitorio, pronto soccorso, polizia locale e servizi sociali; verificare con ASP e terzo settore la fattibilità di un micro-programma Housing First da 10–20 unità usando alloggi comunali, locazioni dal privato o beni riutilizzabili. Predefinire outcome su stabilità abitativa, accessi d'emergenza, costi e qualità di vita e usare un rollout graduale se la capacità iniziale è limitata.",
    implementability: "strutturale",
    capacityDataNeeds: ["censimento homelessness cronica", "integrazione privacy-safe dei contatti con servizi", "alloggi o voucher disponibili", "case management specialistico", "accordo Comune-ASP-terzo settore", "contabilità dei costi evitati"],
    tags: ["Housing First", "homelessness", "supportive housing", "RCT", "Denver", "welfare", "housing"],
    revisionHistory: [{ date: "2026-09-04", note: "Prima verifica e inserimento sulla base della valutazione randomizzata quinquennale del Denver SIB." }]
  },
  {
    id: "boston-public-preschool-lottery-long-term",
    title: "Pre-K pubblico su larga scala con effetti di lungo periodo su istruzione e disciplina",
    authority: "Boston Public Schools / City of Boston",
    territory: "Boston, Massachusetts",
    country: "Stati Uniti",
    implementationYear: "Coorti di ammissione 1997–2003; programma pubblico successivamente ampliato",
    problem:
      "Accesso diseguale a educazione prescolare di qualità e necessità di capire se un programma pubblico su larga scala produce benefici persistenti oltre ai test scolastici di breve periodo.",
    measure:
      "Offerta di posti di scuola dell'infanzia pubblica nelle Boston Public Schools per bambini di quattro anni, con classi e curriculum di early childhood education integrati nel sistema scolastico cittadino. Nei programmi sovradomandati l'assegnazione avveniva tramite lotterie, creando variazione casuale nell'accesso.",
    mechanism:
      "Anticipare accesso a un ambiente educativo strutturato, insegnanti specializzati, routine scolastiche e sviluppo socio-emotivo, con effetti potenziali su progressione, disciplina e scelte educative di lungo periodo anche quando i guadagni nei test standardizzati non persistono.",
    population:
      "Oltre 4.000 candidati di quattro anni a Boston Public Schools in sette coorti di ammissione 1997–2003; analisi di lungo periodo fino all'ingresso nell'università e oltre.",
    primaryArea: "istruzione_giovani",
    secondaryAreas: ["welfare_inclusione_servizi_sociali", "sicurezza_urbana_prevenzione"],
    interventionTypes: ["servizio_diretto", "formazione_capacity_building", "modifica_organizzativa_processo"],
    tools: ["pre-K pubblico", "ammissione centralizzata", "lotterie per posti sovradomandati", "curriculum early childhood", "dati longitudinali scuola-college-giustizia minorile"],
    territorialScale: "Sistema scolastico cittadino / bambino",
    interventionStatus:
      "Boston continua a offrire Boston Pre-K: tutte le classi K0 e K1 delle Boston Public Schools fanno parte del programma, oggi affiancato anche da provider comunitari.",
    evaluationMethod:
      "Randomized lottery design: gli autori sfruttano i tie-break e le lotterie di ammissione nei programmi pre-K sovradomandati per stimare causalmente gli effetti dell'iscrizione. Il follow-up collega record scolastici, SAT, National Student Clearinghouse e outcome disciplinari/giudiziari per circa vent'anni.",
    comparator: "Bambini comparabili che parteciparono alle stesse lotterie di ammissione ma non ottennero casualmente un'offerta di posto pre-K.",
    outcomes: ["diploma di scuola superiore", "SAT test-taking", "iscrizione universitaria", "iscrizione a college quadriennale", "test standardizzati", "sospensioni e disciplina", "incarcerazione minorile"],
    results:
      "L'accesso al pre-K pubblico aumenta diploma, partecipazione al SAT e ingresso all'università e migliora gli outcome disciplinari, inclusa una minore probabilità di incarcerazione minorile. Non emerge invece un effetto rilevabile sui test standardizzati statali nel medio-lungo periodo: il beneficio di lungo periodo non passa principalmente da punteggi scolastici più alti.",
    effectSize:
      "Iscrizione universitaria on-time circa +8 punti percentuali rispetto a una baseline di circa 46%; diploma di scuola superiore +6 p.p.; SAT test-taking +9 p.p.; indice aggregato degli outcome disciplinari +0,17 deviazioni standard. Nessun effetto statisticamente rilevabile sui test MCAS nei gradi 3–10.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Richiede posti prescolari sufficienti, personale early-childhood qualificato, curriculum e supervisione pedagogica, sistema di ammissione trasparente e capacità di seguire gli outcome nel tempo. Lo studio non fornisce una stima di costo-beneficio direttamente trasferibile: il costo marginale dipende soprattutto dall'espansione di classi e personale.",
    limitations: [
      "Gli effetti identificati riguardano candidati alle scuole/programmi sovradomandati in cui esisteva una lotteria; la generalizzazione a bambini o sedi senza eccesso di domanda richiede cautela.",
      "Il programma e il sistema scolastico statunitense differiscono dalla governance italiana di nidi e scuola dell'infanzia.",
      "I risultati positivi su istruzione e disciplina coesistono con effetti nulli sui test standardizzati: non è corretto presentare il programma come incremento generalizzato dell'achievement test-based.",
      "Molti effetti risultano più grandi per i maschi, mentre le differenze per razza e reddito sono meno nette."
    ],
    unintendedEffects:
      "Non emergono effetti avversi principali dalla valutazione; una espansione rapida senza personale e qualità adeguati potrebbe però diluire il trattamento che ha prodotto gli effetti osservati.",
    primarySource: {
      label: "Boston Public Schools — Boston Pre-K in public schools",
      url: "https://www.bostonpublicschools.org/students-families/universal-pre-k-boston/settings/public-schools"
    },
    evaluationStudies: [
      {
        label: "Quarterly Journal of Economics",
        url: "https://academic.oup.com/qje/article-abstract/138/1/363/6701924",
        citation: "Gray-Lobe G, Pathak PA, Walters CR (2023), The Long-Term Effects of Universal Preschool in Boston",
        doi: "10.1093/qje/qjac036"
      },
      {
        label: "NBER working paper",
        url: "https://www.nber.org/papers/w28756",
        citation: "Gray-Lobe G, Pathak PA, Walters CR (2021), The Long-Term Effects of Universal Preschool in Boston",
        doi: "10.3386/w28756"
      }
    ],
    lastVerifiedAt: "2026-09-04",
    transferabilityItaly:
      "Alta sul principio di investimento nella prima infanzia e sulla necessità di misurare outcome di lungo periodo, ma la competenza è condivisa tra Comuni, Stato e gestori. Per un comune italiano la replica rilevante non è la lotteria in sé: è l'espansione di posti di qualità con criteri trasparenti e valutazione longitudinale, idealmente sfruttando rollout o soglie amministrative per costruire comparatori credibili.",
    lameziaAdaptation:
      "Mappare domanda, liste d'attesa, copertura e qualità dei servizi 0–6 e della scuola dell'infanzia comunale/convenzionata; identificare quartieri con gap di accesso e progettare un'espansione graduale di posti o sezioni con standard pedagogici comuni. Collegare la valutazione a frequenza, sviluppo iniziale, assenze e transizioni scolastiche, usando rollout per scuola o capacità disponibile anziché introdurre una lotteria non necessaria.",
    implementability: "strutturale",
    capacityDataNeeds: ["domanda e liste d'attesa 0–6", "posti e personale per struttura", "standard di qualità pedagogica", "identificativi longitudinali protetti", "accordi con scuole e gestori", "protocollo di rollout e valutazione"],
    tags: ["pre-K", "prima infanzia", "educazione", "lotteria", "RCT", "Boston", "long-term outcomes"],
    revisionHistory: [{ date: "2026-09-04", note: "Prima verifica e inserimento; registrati sia gli effetti di lungo periodo positivi sia l'assenza di effetti sui test standardizzati." }]
  },
  {
    id: "junin-property-tax-deterrence-bill-rct",
    title: "Messaggi di deterrenza nelle bollette dei tributi immobiliari per aumentare la compliance",
    authority: "Municipalidad de Junín",
    territory: "Junín, Provincia di Buenos Aires",
    country: "Argentina",
    implementationYear: "2011",
    problem:
      "Bassa compliance nel pagamento di un tributo immobiliare municipale collegato a servizi locali, con pagamenti medi storicamente intorno al 40% degli importi dovuti per ciclo e necessità di aumentare la riscossione senza modificare aliquote o capacità ispettiva.",
    measure:
      "Ridisegno sperimentale della bolletta del tributo immobiliare comunale con tre messaggi alternativi: deterrenza e conseguenze concrete del mancato pagamento; informazione sul comportamento dei vicini; informazione su efficienza/uso delle entrate. Un quarto gruppo ricevette la bolletta ordinaria.",
    mechanism:
      "Rendere salienti probabilità e conseguenze dell'enforcement, norme sociali o reciprocità nel momento in cui il contribuente riceve la richiesta di pagamento. Il messaggio di deterrenza esplicitava sanzioni e possibili conseguenze legali reali già previste, senza introdurre nuove penalità.",
    population:
      "Circa 23.000 contribuenti individuali del tributo immobiliare municipale, randomizzati per gruppi con stratificazione geografica; le bollette sperimentali furono inviate nell'agosto 2011 per scadenze settembre-ottobre.",
    primaryArea: "fiscalita_entrate_riscossione",
    secondaryAreas: ["digitalizzazione_servizi_online", "capacita_amministrativa_personale"],
    interventionTypes: ["nudging_comunicazione", "informazione_trasparenza", "enforcement_controllo"],
    tools: ["bolletta tributaria", "messaggio di deterrenza", "randomizzazione stratificata", "anagrafica contribuenti", "monitoraggio pagamenti"],
    territorialScale: "Comune / contribuente",
    interventionStatus:
      "Esperimento concluso. I dati sono stati successivamente riutilizzati per nuove analisi, inclusa una pubblicazione 2026 sull'eterogeneità di genere e sulle risorse che influenzano la compliance.",
    evaluationMethod:
      "Large-scale randomized field experiment: contribuenti assegnati casualmente a controllo o a uno dei tre messaggi sulla bolletta. La randomizzazione fu stratificata geograficamente e gli outcome derivano dai pagamenti amministrativi effettivi.",
    comparator: "Contribuenti che ricevettero la bolletta municipale standard senza messaggi sperimentali nello stesso ciclo fiscale.",
    outcomes: ["probabilità di pagamento/compliance", "tempistica del pagamento", "eterogeneità territoriale", "eterogeneità per convinzioni e caratteristiche del contribuente"],
    results:
      "Il messaggio che rendeva salienti sanzioni e conseguenze legali aumentò significativamente la compliance media. I messaggi basati su reciprocità/uso delle entrate e norme sociali non produssero effetti medi robusti e generarono risposte eterogenee. Una rianalisi pubblicata nel 2026 mostra inoltre differenze di genere nella compliance e nella risposta temporale al messaggio di deterrenza.",
    effectSize:
      "Messaggio di deterrenza: quasi +5 punti percentuali nella probabilità di compliance rispetto al controllo, corrispondenti a circa +9% in termini relativi nelle sintesi IDB. Nessun effetto medio comparabile per i messaggi su reciprocità/equità e peer effects.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Costo marginale molto basso se il Comune possiede già anagrafica tributaria e canale di bollettazione. Servono validazione giuridica del testo, dati affidabili sulle sanzioni effettivamente applicabili, randomizzazione o rollout controllato e capacità di misurare pagamenti per gruppo. Il messaggio deve descrivere enforcement reale e non minacciare controlli inesistenti.",
    limitations: [
      "Il risultato è specifico a un tributo municipale argentino e a un contesto di compliance iniziale relativamente bassa; l'effetto assoluto può cambiare con norme, salienza delle sanzioni e fiducia nell'ente.",
      "I messaggi sociali e di reciprocità non hanno un effetto medio positivo stabile e possono muovere gruppi diversi in direzioni opposte; non vanno combinati automaticamente con il deterrence nudge.",
      "Un messaggio di deterrenza è efficace solo se sanzioni e conseguenze dichiarate sono vere, comprensibili e coerenti con la capacità amministrativa effettiva.",
      "L'intervento migliora la compliance nel ciclo osservato ma non sostituisce qualità dell'anagrafica, facilità di pagamento, rateizzazione e gestione strutturale della morosità."
    ],
    unintendedEffects:
      "Messaggi percepiti come aggressivi o non credibili possono ridurre fiducia e cooperazione; l'eterogeneità emersa nello studio suggerisce di monitorare reclami, richieste di chiarimento e distribuzione degli effetti, non solo l'incasso aggregato.",
    primarySource: {
      label: "IDB Behavioral Economics Group — Junín property-tax bill experiment",
      url: "https://behavioral.iadb.org/en/node/367"
    },
    evaluationStudies: [
      {
        label: "Journal of Economic Behavior & Organization",
        url: "https://doi.org/10.1016/j.jebo.2015.04.002",
        citation: "Castro L, Scartascini C (2015), Tax compliance and enforcement in the pampas: evidence from a field experiment",
        doi: "10.1016/j.jebo.2015.04.002"
      },
      {
        label: "International Tax and Public Finance — follow-up 2026",
        url: "https://link.springer.com/article/10.1007/s10797-026-09975-3",
        citation: "Willing but unable to pay? Gender, preferences, resources, and tax compliance (2026)",
        doi: "10.1007/s10797-026-09975-3"
      }
    ],
    lastVerifiedAt: "2026-09-04",
    transferabilityItaly:
      "Molto alta come tecnica di amministrazione tributaria: i Comuni italiani dispongono di entrate proprie e comunicazioni periodiche su cui è possibile testare chiarezza, salienza delle conseguenze e facilità di pagamento. La replica deve però separare il nudge informativo dall'effettivo procedimento di accertamento e rispettare disciplina tributaria, Statuto del contribuente e protezione dei dati.",
    lameziaAdaptation:
      "Selezionare un tributo o una fase di sollecito con popolazione numerosa e dati di esito affidabili; creare 2–3 versioni della comunicazione, mantenendo un controllo standard. La prima variante dovrebbe rendere estremamente chiari importo, scadenza, canali di pagamento e conseguenze legali realmente applicabili; misurare pagamento entro 30/60 giorni, rateizzazioni, reclami e costo di contatto, con randomizzazione stratificata per zona e storico di compliance.",
    implementability: "quick_win",
    capacityDataNeeds: ["anagrafica tributaria pulita", "storico pagamenti e morosità", "testo validato da ufficio tributi/legale", "canale stampa o digitale", "randomizzazione stratificata", "dashboard di outcome e reclami"],
    tags: ["tributi locali", "tax compliance", "nudge", "deterrenza", "RCT", "Junín", "riscossione"],
    revisionHistory: [{ date: "2026-09-04", note: "Prima verifica; aggiunto anche il follow-up 2026 che rianalizza l'esperimento per genere, preferenze e risorse." }]
  }
] as const satisfies readonly EvidenceIntervention[];
