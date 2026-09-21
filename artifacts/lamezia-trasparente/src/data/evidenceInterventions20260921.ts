import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_21 = [
  {
    id: "london-boroughs-universal-free-school-meals",
    title: "Pasti scolastici gratuiti universali nella scuola primaria",
    authority: "London Boroughs of Newham, Islington, Southwark e Tower Hamlets",
    territory: "Quattro borough di Londra",
    country: "Regno Unito",
    implementationYear: "2009/10–2014/15 (adozione scaglionata nei quattro borough); successiva estensione a tutta Londra dal 2023",
    problem:
      "Accesso incompleto ai pasti scolastici, stigma e non-take-up del sistema means-tested, pressione sui bilanci familiari e disuguaglianze nutrizionali e di salute tra bambini in età primaria.",
    measure:
      "Offerta di pranzo scolastico gratuito a tutti i bambini della scuola primaria indipendentemente dal reddito familiare. Newham avviò il proprio schema nel 2009 e lo mantenne dopo il pilot nazionale; Islington, Southwark e Tower Hamlets introdussero successivamente programmi analoghi. Dal 2023 il Mayor of London finanzia una copertura universale più ampia per le scuole primarie londinesi.",
    mechanism:
      "Eliminare il prezzo e la verifica reddituale al punto di accesso, normalizzando la partecipazione e riducendo stigma e costi di transazione; aumentare la probabilità che i bambini consumino un pasto scolastico regolato da standard nutrizionali e liberare risorse nel bilancio familiare.",
    population:
      "Bambini 4–11 anni nelle scuole primarie statali dei quattro borough; le valutazioni utilizzano dati amministrativi scolastici e dati population-wide del National Child Measurement Programme.",
    primaryArea: "istruzione_giovani",
    secondaryAreas: ["salute_pubblica_locale", "welfare_inclusione_servizi_sociali", "procurement_spesa_pubblica"],
    interventionTypes: ["servizio_diretto", "incentivo_economico", "procurement_contract_design", "modifica_organizzativa_processo"],
    tools: [
      "mensa scolastica universale",
      "grant locali alle scuole",
      "standard nutrizionali",
      "procurement/catering scolastico",
      "dati amministrativi scolastici",
      "National Child Measurement Programme",
    ],
    territorialScale: "Borough / sistema scolastico primario locale",
    interventionStatus:
      "Newham continua a offrire Eat for Free; dal settembre 2023 il Mayor of London finanzia universal free school meals a livello londinese. Nel luglio 2026 City Hall ha approvato fino a 99,4 milioni di sterline per continuare il finanziamento nel 2026-27.",
    evaluationMethod:
      "Natural experiment / difference-in-differences che sfrutta l'adozione scaglionata dei programmi universali nei quattro borough, confrontando l'evoluzione degli outcome con local authorities londinesi o inglesi che non avevano programmi equivalenti. La valutazione di salute usa dati di misurazione infermieristica population-wide; studi successivi usano dynamic difference-in-differences con controlli territoriali abbinati per attainment e assenze.",
    comparator:
      "Local authorities e neighbourhood comparabili nel resto di Londra o dell'Inghilterra che nello stesso periodo mantenevano il sistema means-tested senza universalizzazione locale.",
    outcomes: [
      "take-up dei pasti scolastici",
      "obesità e BMI a 4–5 e 10–11 anni",
      "attainment in Reading e Mathematics",
      "assenze scolastiche",
      "spesa alimentare familiare",
    ],
    results:
      "L'universalizzazione aumenta il take-up e riduce in modo consistente l'obesità nei bambini di Reception e Year 6, con effetti più grandi per chi è esposto più a lungo. La spesa alimentare familiare diminuisce. Gli effetti educativi sono invece eterogenei: alcune analisi trovano miglioramenti in Reading, mentre una valutazione 2025 non trova in media effetti significativi su attainment o assenze nei primi sei anni e segnala risultati positivi solo in alcuni borough/periodi più lunghi.",
    effectSize:
      "Obesità: circa −1,3/−1,4 punti percentuali in media in Reception e Year 6 (circa −9,3% e −5,6% relativi nelle stime del progetto); tra i Year 6 esposti per tutta la primaria fino a −2,1 p.p. (−8,4%). Take-up tra bambini già eleggibili al means-tested FSM: +1,3–1,6 p.p. Famiglia tipo con due adulti e due bambini della primaria: spesa alimentare circa −£37/mese. Gli outcome educativi non sono uniformemente positivi e non vengono sintetizzati in un singolo effect size.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede finanziamento ricorrente per pasto, capacità di cucina/catering, procurement e monitoraggio qualità, gestione di diete speciali/allergie e capacità di assorbire un aumento del take-up. Come ordine di grandezza corrente, City Hall ha approvato fino a £99,4 milioni per il programma londinese 2026-27; tale budget non è trasferibile direttamente a un singolo comune italiano.",
    limitations: [
      "L'adozione dei programmi nei borough non è randomizzata: caratteristiche politiche, sociali o organizzative locali possono generare confondimento residuo nonostante il disegno difference-in-differences.",
      "Gli effetti educativi sono misti: la valutazione 2025 non trova un effetto medio significativo su attainment o assenze nei primi sei anni, quindi il record non presenta il programma come intervento educativo universalmente efficace.",
      "Gli effetti sull'obesità sono più piccoli o non rilevabili nelle scuole con maggiore prevalenza di obesità pre-intervento, suggerendo che il pasto universale non sostituisce interventi aggiuntivi nei contesti più difficili.",
      "Qualità nutrizionale, organizzazione della mensa e contesto istituzionale britannico condizionano la trasferibilità delle stime.",
    ],
    unintendedEffects:
      "Possibili pressioni su capacità di cucina, tempi di servizio, spreco alimentare e costi; l'universalizzazione può inoltre finanziare pasti anche a famiglie che avrebbero potuto pagarli, trade-off che va valutato rispetto ai benefici di take-up, stigma e semplicità amministrativa.",
    primarySource: {
      label: "Newham Council — Eat for Free",
      url: "https://www.newham.gov.uk/school-meals-newham/eat-free",
    },
    evaluationStudies: [
      {
        label: "Journal of Health Economics — Universal free school meals and children's bodyweight",
        url: "https://pubmed.ncbi.nlm.nih.gov/39561608/",
        citation: "Holford A, Rabe B (2024), Universal free school meals and children's bodyweight. Impacts by age and duration of exposure, Journal of Health Economics 98, 102937",
        doi: "10.1016/j.jhealeco.2024.102937",
      },
      {
        label: "International Journal of Educational Research — attainment and absence natural experiment",
        url: "https://eprints.whiterose.ac.uk/id/eprint/231043/",
        citation: "Bryant M et al. (2025), Impacts of discretionary universal free school meal schemes on primary school children's education attainment and school absence: A natural experiment study in England",
        doi: "10.1016/j.ijer.2025.102713",
      },
    ],
    lastVerifiedAt: "2026-09-21",
    transferabilityItaly:
      "Media-alta sul meccanismo, ma dipendente da competenze, finanziamento e organizzazione locale del servizio mensa. I comuni italiani possono intervenire sulla refezione scolastica e sulle agevolazioni tariffarie nei limiti del quadro regionale/nazionale e dei contratti in essere; prima di universalizzare occorre stimare platea, costo marginale, capacità delle cucine e distribuzione dei benefici.",
    lameziaAdaptation:
      "Costruire una baseline unica della refezione scolastica comunale: iscritti per plesso, take-up effettivo, fasce ISEE/esenzioni, rinunce, costo per pasto, capacità di produzione, scarti e tempi di servizio. Valutare poi una progressiva riduzione del prezzo o universalizzazione su una coorte/plessi compatibili con il budget, mantenendo standard nutrizionali e monitorando take-up, spreco, soddisfazione, assenze e pressione sui bilanci familiari. Gli outcome sanitari dovrebbero essere analizzati solo in forma aggregata e con partnership sanitaria appropriata.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "anagrafe iscritti e pasti effettivamente erogati per plesso",
      "fasce tariffarie/esenzioni e non-take-up",
      "costo pieno e marginale per pasto",
      "capacità di cucina/catering e staffing",
      "indicatori su scarto alimentare e qualità nutrizionale",
      "protocollo di valutazione pre/post o rollout scaglionato",
    ],
    tags: ["Londra", "school meals", "universalismo", "nutrizione", "obesità infantile", "difference-in-differences", "mensa scolastica"],
    revisionHistory: [
      {
        date: "2026-09-21",
        note: "Prima verifica e inserimento; separati gli effetti robusti su take-up/bodyweight dagli outcome educativi eterogenei e verificata la prosecuzione del programma londinese nel 2026-27.",
      },
    ],
  },
  {
    id: "nyc-school-zone-speed-cameras-safety",
    title: "Autovelox automatici nelle school zones e sicurezza stradale",
    authority: "New York City Department of Transportation",
    territory: "New York City",
    country: "Stati Uniti",
    implementationYear: "2014–oggi; espansioni successive fino a oltre 2.000 telecamere",
    problem:
      "Eccesso di velocità e collisioni stradali, incluse lesioni a pedoni e altri utenti vulnerabili, con necessità di enforcement scalabile senza aumentare il contatto diretto tra polizia e automobilisti.",
    measure:
      "Installazione progressiva di telecamere automatiche per la velocità in school speed zones, autorizzate dalla legislazione dello Stato di New York. Il sistema rileva i veicoli sopra la soglia prevista e invia una sanzione amministrativa al proprietario; dal 2022 l'enforcement è stato esteso 24/7.",
    mechanism:
      "Aumentare la probabilità certa e impersonale di enforcement nei punti con rischio documentato, modificando il comportamento di guida e riducendo la velocità; l'automazione rende il controllo continuativo e riduce la necessità di fermare il conducente su strada.",
    population:
      "Utenti della strada nei pressi dei siti con speed camera in tutti i borough. Lo studio 2025 combina il rollout di circa 2.000 telecamere 2014–2023 con circa 700.000 collisioni, 200.000 lesioni e 18 milioni di sanzioni.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["sicurezza_urbana_prevenzione", "digitalizzazione_servizi_online"],
    interventionTypes: ["enforcement_controllo", "infrastruttura_digitale", "targeting_data_analytics", "regolazione"],
    tools: [
      "speed cameras automatiche",
      "lettura targa e verifica delle infrazioni",
      "dati georeferenziati su collisioni e lesioni",
      "criteri di localizzazione basati su rischio",
      "sanzione amministrativa al proprietario",
    ],
    territorialScale: "Siti stradali / rete cittadina",
    interventionStatus:
      "Programma consolidato e ampiamente esteso. Nel 2025 NYC DOT riportava oltre 2.400 speed cameras; la continuità operativa dipende dall'autorizzazione legislativa statale applicabile al programma.",
    evaluationMethod:
      "Quasi-esperimento difference-in-differences/event study che sfrutta il rollout scaglionato delle telecamere dal 2014 al 2023. I siti trattati vengono confrontati nel tempo con siti non ancora trattati, stimando gli effetti in buffer di circa 900 piedi attorno alle telecamere.",
    comparator:
      "Intersezioni/aree eleggibili non ancora raggiunte dalla telecamera nello stesso periodo, all'interno del rollout scaglionato cittadino.",
    outcomes: ["collisioni stradali", "lesioni da collisione", "violazioni per eccesso di velocità", "persistenza temporale dell'effetto"],
    results:
      "Lo studio causale trova riduzioni di collisioni e lesioni già nei mesi successivi all'attivazione, con un forte calo delle violazioni per velocità. I dati amministrativi del DOT mostrano parallelamente una diminuzione molto ampia delle violazioni giornaliere per telecamera nel lungo periodo; questo dato descrittivo viene tenuto distinto dalla stima difference-in-differences.",
    effectSize:
      "Studio PNAS: collisioni −5% al mese in media e lesioni −2,5% al mese dopo l'attivazione; cumulativamente nei primi sette mesi circa −30% collisioni e −16% lesioni. NYC DOT riporta descrittivamente una riduzione del 94% delle violazioni giornaliere per telecamera dall'inizio del programma e, per i siti installati nel 2022, 14% meno injuries/fatalities rispetto a siti senza camere; questi ultimi non sono usati come effect size causale principale.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede base normativa, dispositivi omologati e manutenzione, backend per immagini/sanzioni, verifica umana o procedurale, gestione ricorsi, protezione dati, criteri trasparenti di localizzazione e capacità di integrare collisioni, velocità e asset stradali. Va evitato un modello di incentivo economico al vendor legato al numero di sanzioni.",
    limitations: [
      "I siti non sono scelti casualmente: il disegno staggered difference-in-differences riduce ma non elimina il rischio di confondimento da priorità di sicurezza e interventi concomitanti di Vision Zero.",
      "Le stime principali sono locali ai buffer attorno alle telecamere e al periodo osservato dopo l'attivazione; non vanno interpretate automaticamente come riduzione equivalente su tutta la rete cittadina.",
      "L'enforcement automatico può avere effetti distributivi attraverso le sanzioni; equità territoriale, capacità di pagamento e ricorsi devono essere monitorati separatamente dalla sicurezza.",
      "Targhe illeggibili, coperte o fraudolente possono ridurre l'efficacia del sistema, problema documentato anche dagli audit cittadini.",
    ],
    unintendedEffects:
      "Possibile spostamento della velocità verso tratti senza telecamera, oneri regressivi delle multe, errori o contestazioni e incentivi all'occultamento della targa; servono analisi di displacement e audit di equità oltre agli outcome di sicurezza.",
    primarySource: {
      label: "NYC DOT — Speed Camera Program / Vision Zero",
      url: "https://home4.nyc.gov/html/dot/html/motorist/vision-zero-safe-driving.shtml",
    },
    evaluationStudies: [
      {
        label: "PNAS — Can speed cameras make streets safer?",
        url: "https://pubmed.ncbi.nlm.nih.gov/41359844/",
        citation: "Stagoff-Belfort A, Ben-Menachem J, Beck B (2025), Can speed cameras make streets safer? Quasi-experimental evidence from New York City, PNAS 122(50):e2520328122",
        doi: "10.1073/pnas.2520328122",
      },
    ],
    lastVerifiedAt: "2026-09-21",
    transferabilityItaly:
      "Media e strettamente condizionata dal Codice della strada, dall'omologazione/approvazione dei dispositivi e dalle regole vigenti su collocazione e accertamento automatico. Il principio trasferibile non è massimizzare le sanzioni ma selezionare siti con rischio documentato e valutare sicurezza, velocità e displacement con criteri pubblici.",
    lameziaAdaptation:
      "Creare una mappa unica di collisioni con feriti, velocità osservate, scuole, attraversamenti e volumi di traffico. Verificata la base giuridica per ciascun tipo di strada, identificare pochi siti prioritari e usare un rollout scaglionato o siti comparabili per stimare effetti su velocità, collisioni e lesioni. Pubblicare criteri di selezione, non il ranking delle entrate da sanzioni, e monitorare ricorsi, distribuzione territoriale e spostamento del rischio.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "incidenti e lesioni georeferenziati",
      "misure di velocità e flussi prima dell'intervento",
      "inventario scuole/attraversamenti e classificazione stradale",
      "verifica normativa e autorizzativa aggiornata",
      "dati su sanzioni, ricorsi e targhe non leggibili",
      "disegno di rollout/comparatore e analisi di displacement",
    ],
    tags: ["New York City", "speed cameras", "road safety", "automated enforcement", "difference-in-differences", "Vision Zero"],
    revisionHistory: [
      {
        date: "2026-09-21",
        note: "Prima verifica e inserimento; usata come stima principale la valutazione PNAS 2025 e tenuti separati i risultati amministrativi descrittivi del DOT.",
      },
    ],
  },
  {
    id: "sacramento-smud-smartpricing-options",
    title: "SmartPricing Options: tariffe elettriche time-of-use e critical-peak",
    authority: "Sacramento Municipal Utility District (SMUD)",
    territory: "Sacramento County e area di servizio SMUD, California",
    country: "Stati Uniti",
    implementationYear: "2012–2013 (pilot); Time-of-Day successivamente divenuta tariffa residenziale standard",
    problem:
      "Picchi concentrati di domanda elettrica nelle ore estive più onerose, con necessità di capacità di generazione/acquisto usata per poche ore e maggior ricorso a fonti costose e meno favorevoli dal punto di vista ambientale.",
    measure:
      "Pilot su tariffe residenziali variabili nel tempo: time-of-use (TOU), critical peak pricing (CPP) e combinazioni TOU+CPP, con strategie di reclutamento opt-in e default/opt-out e, in alcuni gruppi, display in-home e strumenti informativi digitali.",
    mechanism:
      "Rendere visibile nel prezzo il costo maggiore dell'elettricità nelle ore di picco e dare ai clienti un incentivo a spostare carichi flessibili fuori da quelle finestre; smart meter e strumenti informativi permettono misurazione e feedback granulari.",
    population:
      "Clienti residenziali dell'utility municipale. Il piano sperimentale aveva un sample frame di circa 57.000 utenze e sette gruppi di trattamento; le diverse componenti furono valutate con randomized control trials, random encouragement design e altri confronti pre-specificati.",
    primaryArea: "ambiente_clima_energia",
    secondaryAreas: ["digitalizzazione_servizi_online", "capacita_amministrativa_personale"],
    interventionTypes: ["incentivo_economico", "infrastruttura_digitale", "modifica_organizzativa_processo", "nudging_comunicazione"],
    tools: [
      "smart meter / interval data",
      "tariffe time-of-use",
      "critical peak pricing",
      "default/opt-out enrollment",
      "in-home display e portale web",
      "analisi sperimentale dei load impacts",
    ],
    territorialScale: "Utility locale / area metropolitana",
    interventionStatus:
      "SMUD continua nel 2026 a essere un'utility community-owned e non-profit; la Time-of-Day 5–8 p.m. è la tariffa standard residenziale e Critical Peak Pricing resta una delle opzioni tariffarie disponibili.",
    evaluationMethod:
      "Consumer Behavior Study con disegni randomizzati e controllati: randomized control trials per alcune assegnazioni, random encouragement design per il reclutamento e gruppi distinti per pricing/recruitment/tecnologia. Il DOE ha armonizzato protocolli e metriche tra le utility del programma Smart Grid Investment Grant.",
    comparator:
      "Clienti su tariffa residenziale di controllo e, a seconda della domanda di ricerca, gruppi con differente assegnazione/recruitment o tecnologia informativa.",
    outcomes: ["domanda elettrica nelle ore di picco", "adesione e retention", "risposta a eventi critical peak", "accettazione del disegno tariffario", "costi/benefici del rollout"],
    results:
      "Le tariffe variabili nel tempo riducono in modo sostanziale la domanda nelle ore di picco. I gruppi opt-in reagiscono più intensamente, mentre il default/opt-out ottiene una penetrazione molto più ampia con retention simile. Il pilot contribuì alla successiva adozione di una struttura Time-of-Day come standard residenziale SMUD.",
    effectSize:
      "DOE: riduzione della domanda di picco per TOU circa 12% tra clienti opt-in e 6% tra clienti opt-out; per CPP circa 24% opt-in e 14% opt-out. Enrollment opt-out circa 93% contro 24% opt-in, con retention circa 91% vs 92%. Questi confronti tra strategie di adesione non vanno letti come un unico effetto causale della scelta opt-in/opt-out perché selezione e disegni sperimentali differiscono tra componenti.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede misurazione intervallare, sistemi di billing capaci di tariffe orarie/event-based, comunicazione e customer support, analisi di protezione per utenti vulnerabili e capacità di modellare gli effetti distributivi. Un rollout tariffario per cittadini dipende inoltre dalla regolazione del settore elettrico, non dalla sola decisione comunale.",
    limitations: [
      "Il contesto è una utility municipale statunitense con poteri tariffari propri: un comune italiano ordinario non dispone di un potere equivalente sul prezzo retail dell'elettricità.",
      "I clienti opt-in sono selezionati e mostrano risposte maggiori; i diversi effect size di opt-in e opt-out non devono essere interpretati come se provenissero da una singola randomizzazione della modalità di adesione.",
      "Ridurre la domanda di picco non equivale necessariamente a ridurre il consumo energetico totale o le emissioni della stessa percentuale.",
      "Nel pilot circa un quarto dei clienti lasciò l'abitazione durante i due anni, generando attrition legata alla mobilità residenziale che la valutazione tratta ma che limita la semplicità del confronto longitudinale.",
      "Il sistema elettrico californiano è fortemente summer-peaking; orari e segnali di prezzo ottimali dipendono dalla rete locale.",
    ],
    unintendedEffects:
      "Possibili aumenti di bolletta per famiglie con carichi poco flessibili, risposta differenziata per reddito/condizioni abitative e spostamento dei consumi verso altre ore senza riduzione totale; sono necessarie tutele e analisi distributive.",
    primarySource: {
      label: "SMUD — Residential rates",
      url: "https://www.smud.org/Rate-Information/Residential-Rates",
    },
    evaluationStudies: [
      {
        label: "U.S. Department of Energy — SmartPricing Options Final Evaluation",
        url: "https://www.energy.gov/sites/default/files/2017/08/f36/SMUD_SmartPricingOptionPilotEvaluationFinalCombo11_5_2014.pdf",
        citation: "Potter JM, George SS, Jimenez LR (2014), SmartPricing Options Final Evaluation, Sacramento Municipal Utility District / U.S. Department of Energy",
      },
      {
        label: "U.S. Department of Energy — Consumer Behavior Studies interim synthesis",
        url: "https://www.energy.gov/oe/articles/interim-report-customer-acceptance-retention-and-response-time-based-rates-consumer",
        citation: "U.S. Department of Energy (2015), Interim Report on Impacts from the Consumer Behavior Studies",
      },
    ],
    lastVerifiedAt: "2026-09-21",
    transferabilityItaly:
      "Bassa per una replica tariffaria comunale diretta, ma medio-alta per il principio di demand management su patrimonio pubblico, comunità energetiche o partnership con operatori autorizzati. La lezione trasferibile è usare dati intervallari e incentivi/automazione per spostare carichi, non presumere che il Comune possa definire la tariffa retail.",
    lameziaAdaptation:
      "Partire dagli edifici e carichi sotto controllo comunale: acquisire dati quartorari/orari, identificare picchi di HVAC, illuminazione, pompe e ricarica EV e testare strategie di load shifting o automazione nei periodi più costosi/critici del contratto di fornitura. In parallelo verificare con fornitori/aggregatori autorizzati la possibilità di partecipare a programmi di demand response. Valutare costo, picco kW, kWh totali, comfort e continuità del servizio, senza proporre una tariffa cittadina fuori competenza.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "smart meter o dati intervallari per edifici comunali",
      "profili di carico e contratti/tariffe applicati",
      "inventario HVAC, pompe, ricarica e altri carichi flessibili",
      "sistemi di automazione o building management",
      "analisi economica/distributiva e verifica regolatoria per eventuali partner esterni",
      "protocollo sperimentale su picco, consumo totale e comfort",
    ],
    tags: ["Sacramento", "SMUD", "time-of-use", "critical peak pricing", "demand response", "smart meter", "RCT"],
    revisionHistory: [
      {
        date: "2026-09-21",
        note: "Prima verifica e inserimento; separati gli effetti sulla domanda di picco dal consumo totale e limitata esplicitamente la trasferibilità tariffaria al contesto italiano.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
