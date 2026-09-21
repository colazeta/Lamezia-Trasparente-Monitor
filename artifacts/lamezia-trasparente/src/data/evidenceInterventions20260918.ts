import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_18 = [
  {
    id: "london-20mph-traffic-calming-zones-casualties",
    title: "Zone 20 mph con traffic calming per ridurre feriti e vittime stradali",
    authority: "London boroughs / Transport for London",
    territory: "Londra",
    country: "Regno Unito",
    implementationYear: "Anni 1990–2000 (espansione progressiva delle zone 20 mph nei borough; periodo di valutazione 1986–2006)",
    problem:
      "Elevata incidentalità e gravità degli esiti sulle strade urbane e residenziali, in particolare per bambini e utenti vulnerabili.",
    measure:
      "Introduzione progressiva di zone con limite di 20 mph (32 km/h) accompagnate da misure fisiche di traffic calming, tra cui dossi, restringimenti e altre modifiche geometriche finalizzate a rendere la velocità più bassa effettivamente auto-enforcing. Il trattamento valutato non coincide con un semplice cartello di limite a 20 mph.",
    mechanism:
      "Ridurre la velocità effettiva dei veicoli e l'energia cinetica degli impatti, aumentando al contempo il tempo di reazione e rendendo più sicuri attraversamenti e movimenti di pedoni, ciclisti e bambini nelle strade locali.",
    population:
      "Utenti della rete stradale londinese, con analisi di 119.029 segmenti stradali che avevano registrato almeno un ferito nel periodo 1986–2006.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["sicurezza_urbana_prevenzione", "salute_pubblica_locale"],
    interventionTypes: ["regolazione", "infrastruttura_fisica"],
    tools: [
      "limite 20 mph",
      "dossi e speed cushions",
      "restringimenti e isole pedonali",
      "modifiche alla circolazione locale",
      "dati geocodificati di collisioni e feriti",
    ],
    territorialScale: "Zona / quartiere / rete stradale locale",
    interventionStatus:
      "Le zone 20 mph restano uno strumento operativo dei borough londinesi, ma nel tempo Londra ha anche esteso limiti 20 mph privi dello stesso pacchetto fisico. L'evidenza causale qui archiviata riguarda le zone traffic-calmed valutate nello studio storico, non qualunque limite 20 mph contemporaneo.",
    evaluationMethod:
      "Controlled interrupted time-series / panel longitudinale su 119.029 segmenti stradali con conditional fixed-effects Poisson models. L'analisi confronta l'andamento dei feriti prima e dopo l'introduzione delle zone, corregge per il trend generale di diminuzione dell'incidentalità londinese e verifica separatamente le strade immediatamente adiacenti per identificare possibile displacement.",
    comparator:
      "Segmenti stradali londinesi non ancora o non trattati, trend temporale di fondo della rete e aree immediatamente adiacenti alle zone 20 mph.",
    outcomes: [
      "tutti i feriti da collisione stradale",
      "morti o feriti gravi (KSI)",
      "feriti bambini 0–15 anni",
      "feriti pedoni e ciclisti",
      "feriti nelle aree adiacenti",
    ],
    results:
      "Dopo la correzione per il trend temporale, l'introduzione delle zone 20 mph è associata a una riduzione sostanziale dei feriti. L'effetto è maggiore per i morti/feriti gravi e per i bambini. Non emerge evidenza di spostamento del rischio verso le strade limitrofe, nelle quali i feriti diminuiscono leggermente.",
    effectSize:
      "Tutti i feriti: −41,9% (IC95% −47,8% a −36,0%); morti o feriti gravi: −46,3% (IC95% −54,1% a −38,6%); feriti 0–15 anni: −48,5%; KSI 0–15 anni: −50,2%. Nelle aree adiacenti i feriti diminuiscono in media dell'8,0% (IC95% 4,4%–11,5%).",
    evidenceStrength: "forte",
    costsRequirements:
      "Servono progettazione stradale, ordinanze/atti di regolazione della velocità, lavori fisici, manutenzione e monitoraggio di velocità e collisioni. Le zone storiche valutate richiedevano traffic calming fisico; costi e accettabilità possono essere superiori a quelli di un semplice limite segnalato.",
    limitations: [
      "Lo studio è un forte quasi-esperimento osservazionale, non una randomizzazione; l'adozione delle zone può essere correlata a caratteristiche locali non completamente osservate.",
      "Le zone valutate comprendevano misure fisiche di traffic calming: i risultati non possono essere trasferiti automaticamente a semplici limiti 20 mph solo segnalati.",
      "Il periodo di studio termina nel 2006 e veicoli, mobilità, enforcement e infrastrutture londinesi sono cambiati da allora.",
      "La mortalità isolata ha intervalli di confidenza ampi; gli esiti più precisi sono feriti complessivi e KSI.",
    ],
    unintendedEffects:
      "Dossi e altre misure fisiche possono generare rumore, discomfort, tempi più lunghi per alcuni mezzi di emergenza e deviazioni di traffico. Lo studio non rileva displacement dei feriti verso le strade adiacenti, ma una replica deve monitorare volumi, velocità e traffico deviato.",
    primarySource: {
      label: "Greater London Authority — finanziamento TfL delle zone 20 mph nei borough",
      url: "https://www.london.gov.uk/who-we-are/what-london-assembly-does/questions-mayor/find-an-answer/20-mph-zones-1",
    },
    evaluationStudies: [
      {
        label: "BMJ — studio originale",
        url: "https://www.bmj.com/content/339/bmj.b4469",
        citation: "Grundy C, Steinbach R, Edwards P, Green J, Armstrong B, Wilkinson P (2009), Effect of 20 mph traffic speed zones on road injuries in London, 1986–2006: controlled interrupted time series analysis",
        doi: "10.1136/bmj.b4469",
      },
    ],
    lastVerifiedAt: "2026-09-18",
    transferabilityItaly:
      "Alta per il principio di traffic calming place-based: i comuni italiani possono intervenire sulla viabilità locale con strumenti regolatori e fisici entro il quadro del Codice della strada e delle competenze dell'ente. La trasferibilità dell'effect size è invece limitata: il risultato londinese riguarda zone storiche con specifica geometria e rischio iniziale.",
    lameziaAdaptation:
      "Individuare micro-zone con scuole, attraversamenti, alta presenza pedonale e incidentalità o velocità documentate; misurare velocità e flussi prima dell'intervento; applicare un pacchetto fisico e regolatorio su un numero limitato di zone e usare un rollout per fasi con strade comparabili. Gli outcome minimi sono velocità percentile 85, collisioni/feriti, traffico deviato, percorrenze dei mezzi di emergenza e percezione di sicurezza.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "dati georeferenziati su collisioni e feriti",
      "rilievi di velocità e traffico",
      "inventario di scuole e attraversamenti",
      "progettazione di traffic calming",
      "monitoraggio di spillover e tempi dei servizi di emergenza",
    ],
    tags: ["20 mph", "traffic calming", "sicurezza stradale", "pedoni", "bambini", "controlled interrupted time series"],
    revisionHistory: [
      {
        date: "2026-09-18",
        note: "Prima verifica e inserimento; distinto esplicitamente il trattamento traffic-calmed dalle moderne 20 mph limits solo segnalate.",
      },
    ],
  },
  {
    id: "cardiff-violence-prevention-information-sharing-model",
    title: "Condivisione anonima dei dati sanitari per prevenire la violenza urbana",
    authority: "Cardiff Community Safety Partnership / Cardiff Council / NHS / South Wales Police",
    territory: "Cardiff, Galles",
    country: "Regno Unito",
    implementationYear: "Dal 1997; valutazione principale 2000–2007",
    problem:
      "Una quota rilevante delle aggressioni che producono ferite trattate nei pronto soccorso non viene denunciata alla polizia, lasciando incompleta la mappa di luoghi, orari e modalità della violenza urbana.",
    measure:
      "Raccolta sistematica in pronto soccorso di informazioni su luogo preciso dell'aggressione, momento e arma utilizzata; anonimizzazione e aggregazione; condivisione periodica con polizia e governo locale; uso congiunto dei dati sanitari e di polizia per identificare hot spot e orientare pattugliamenti, gestione della night-time economy, licensing e interventi ambientali.",
    mechanism:
      "Colmare il dark figure della violenza non denunciata, migliorare la precisione territoriale dell'intelligence e trasformare l'informazione sanitaria in azioni preventive coordinate fra salute, polizia e autorità locale.",
    population:
      "Residenti e visitatori di Cardiff esposti a violenza interpersonale; la valutazione usa ricoveri ospedalieri per violenza e dati di polizia a livello urbano e li confronta con 14 città simili in Inghilterra e Galles.",
    primaryArea: "sicurezza_urbana_prevenzione",
    secondaryAreas: ["salute_pubblica_locale", "capacita_amministrativa_personale", "digitalizzazione_servizi_online"],
    interventionTypes: [
      "targeting_data_analytics",
      "modifica_organizzativa_processo",
      "partnership_pubblico_privato_terzo_settore",
      "enforcement_controllo",
    ],
    tools: [
      "dataset anonimo del pronto soccorso",
      "mappatura di hot spot, tempi e armi",
      "riunioni multi-agenzia",
      "targeting di policing e licensing",
      "interventi di gestione dello spazio e della night-time economy",
    ],
    territorialScale: "Città / hot spot",
    interventionStatus:
      "Il Cardiff Model è rimasto un riferimento operativo e metodologico della prevenzione della violenza ed è stato replicato in altre giurisdizioni. Il record riguarda l'implementazione e la valutazione originaria di Cardiff, non assume che ogni replica successiva produca gli stessi effetti.",
    evaluationMethod:
      "Controlled time-series evaluation con Cardiff come città di intervento e 14 città comparabili in Inghilterra e Galles come controllo. Sono modellati nel tempo sia ricoveri ospedalieri correlati alla violenza sia categorie di violenza registrata dalla polizia; la valutazione distingue gli esiti sanitari gravi dalla registrazione di aggressioni meno gravi.",
    comparator: "Quattordici città comparabili in Inghilterra e Galles prive del medesimo sistema integrato di information sharing nel periodo valutato.",
    outcomes: [
      "ricoveri ospedalieri correlati alla violenza",
      "woundings registrati dalla polizia",
      "aggressioni meno gravi registrate dalla polizia",
      "strategia e targeting multi-agenzia",
    ],
    results:
      "Rispetto alle città di confronto, Cardiff registra una riduzione sostanziale dei ricoveri per violenza e un aumento molto più contenuto dei woundings registrati dalla polizia. Le aggressioni meno gravi registrate dalla polizia aumentano, coerentemente con il fatto che cambiamenti nella registrazione e nel reporting non vanno interpretati automaticamente come un peggioramento della violenza reale.",
    effectSize:
      "Ricoveri per violenza: adjusted incidence rate ratio 0,58 (IC95% 0,49–0,69), con tasso che passa da 7 a 5 al mese per 100.000 abitanti a Cardiff mentre aumenta da 5 a 8 nelle città di confronto. Woundings di polizia: adjusted IRR 0,68 (0,61–0,75). Aggressioni meno gravi registrate: adjusted IRR 1,38 (1,13–1,70), quindi aumento relativo della registrazione anziché riduzione.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede protocollo stabile di raccolta dati in pronto soccorso, standardizzazione e controllo qualità, anonimizzazione, governance giuridica della condivisione, capacità GIS/analitica e una partnership operativa che trasformi i dati in decisioni. Il valore deriva dalla chiusura del ciclo data-to-action, non dalla sola dashboard.",
    limitations: [
      "L'assegnazione della città all'intervento non è randomizzata; shock locali o politiche concorrenti possono contribuire alle differenze con le città di confronto.",
      "Gli outcome di polizia dipendono anche da reporting, priorità operative e pratiche di registrazione: l'aumento delle aggressioni minori registrate non equivale necessariamente a un aumento della violenza reale.",
      "Il programma è multi-componente: l'evidenza identifica l'effetto del sistema di information sharing e della partnership nel suo complesso, non il rendimento di una singola azione di licensing, policing o urban design.",
      "La condivisione di dati sanitari richiede una base giuridica, minimizzazione e misure di privacy particolarmente rigorose nel contesto GDPR.",
    ],
    unintendedEffects:
      "Targeting ripetuto di specifici luoghi può generare displacement, maggiore enforcement concentrato o stigma territoriale. La governance deve evitare il trasferimento di dati individuali non necessari e monitorare eventuali spostamenti della violenza.",
    primarySource: {
      label: "Welsh Government — review che descrive il Cardiff Violence Prevention Programme",
      url: "https://www.gov.wales/sites/default/files/statistics-and-research/2019-07/140430-violence-against-women-domestic-abuse-sexual-violence-services-en.pdf",
    },
    evaluationStudies: [
      {
        label: "BMJ — studio originale",
        url: "https://www.bmj.com/content/342/bmj.d3313",
        citation: "Florence C, Shepherd J, Brennan I, Simon T (2011), Effectiveness of anonymised information sharing and use in health service, police, and local government partnership for preventing violence related injury: experimental study and time series analysis",
        doi: "10.1136/bmj.d3313",
      },
    ],
    lastVerifiedAt: "2026-09-18",
    transferabilityItaly:
      "Elevata per il principio di governance e intelligence aggregata, ma subordinata a competenze e data protection. Un comune italiano non controlla ospedali e polizia, ma può essere partner di un protocollo con ASP/ospedale, Prefettura e forze di polizia per ricevere solo statistiche anonimizzate utili a prevenzione urbana, illuminazione, licensing e gestione degli spazi.",
    lameziaAdaptation:
      "Avviare un proof of concept senza dati personali: definire con ASP e forze dell'ordine un set mensile di conteggi aggregati delle aggressioni trattate in emergenza per micro-area, fascia oraria e macro-tipologia, con soglie minime di pubblicazione. Un tavolo ristretto dovrebbe trasformare ogni pattern robusto in una decisione tracciata e valutarne esiti sanitari e di sicurezza. La piattaforma pubblica dovrebbe mostrare solo indicatori aggregati e fonti, mai record individuali.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "accordo interistituzionale e base giuridica",
      "schema dati anonimizzato e soglie di disclosure",
      "geocodifica e GIS",
      "serie storiche sanitarie e di polizia aggregate",
      "workflow documentato data-to-action",
      "monitoraggio di displacement ed equità territoriale",
    ],
    tags: ["Cardiff Model", "violenza", "pronto soccorso", "data sharing", "hot spot", "multi-agenzia"],
    revisionHistory: [
      {
        date: "2026-09-18",
        note: "Prima verifica e inserimento; mantenuti distinti ricoveri per violenza, woundings di polizia e aggressioni minori registrate.",
      },
    ],
  },
  {
    id: "brazil-municipal-participatory-budgeting-health-mortality",
    title: "Bilancio partecipativo municipale per riallocare la spesa verso priorità espresse dai cittadini",
    authority: "Comuni brasiliani che hanno adottato l'Orçamento Participativo; modello sviluppato a Porto Alegre",
    territory: "Brasile — panel di comuni; Porto Alegre come caso pioniere",
    country: "Brasile",
    implementationYear: "Dal 1989 a Porto Alegre; adozioni municipali in più ondate nel periodo 1989–2004",
    problem:
      "Scarsa corrispondenza fra preferenze dei residenti e allocazione della spesa locale, asimmetrie informative fra cittadini e decisori e debole accountability sulle priorità di investimento.",
    measure:
      "Processo ricorrente nel quale residenti e organizzazioni partecipano ad assemblee territoriali e tematiche, formulano e prioritizzano richieste di investimento, eleggono delegati/consiglieri e negoziano con l'amministrazione l'allocazione di una parte del bilancio. Il disegno concreto varia fra comuni.",
    mechanism:
      "Aumentare l'informazione del decisore sui bisogni locali e rendere pubbliche e verificabili le priorità promesse, spostando risorse verso servizi maggiormente richiesti dalla popolazione e rafforzando accountability e monitoraggio sociale.",
    population:
      "Residenti dei comuni brasiliani; lo studio di valutazione usa un panel municipale 1990–2004 con più ondate di adozione e cessazione del bilancio partecipativo.",
    primaryArea: "partecipazione_democrazia_locale",
    secondaryAreas: ["trasparenza_integrita_anticorruzione", "salute_pubblica_locale", "procurement_spesa_pubblica"],
    interventionTypes: ["partecipazione_codesign", "informazione_trasparenza", "modifica_organizzativa_processo"],
    tools: [
      "assemblee territoriali e tematiche",
      "prioritizzazione degli investimenti",
      "delegati e consiglieri eletti dai partecipanti",
      "tracciamento delle domande e delle decisioni",
      "ciclo annuale collegato al bilancio comunale",
    ],
    territorialScale: "Comune / quartieri e aree tematiche",
    interventionStatus:
      "Il modello ha avuto cicli e configurazioni diverse fra i comuni brasiliani. Porto Alegre, dove l'esperienza nasce nel 1989, continua a organizzare il proprio Orçamento Participativo: nel 2025 le assemblee hanno coinvolto 18.055 persone e il ciclo 2025/2026 ha eletto 92 consiglieri di 17 regioni e sei aree tematiche.",
    evaluationMethod:
      "Panel municipale 1990–2004 con variazione nel timing e nella durata dell'adozione fra comuni. Lo studio stima modelli con effetti fissi municipali e controlli, sfrutta le diverse ondate elettorali di adozione e sottopone i risultati a robustness checks per affrontare l'endogeneità della decisione di adottare. Non è un esperimento randomizzato né una DiD moderna con adozione esogena.",
    comparator: "Comuni brasiliani che nello stesso periodo non adottano il bilancio partecipativo o non lo hanno ancora adottato.",
    outcomes: [
      "quota di bilancio destinata a salute e sanità/sanitation",
      "spesa pubblica pro capite complessiva",
      "mortalità infantile",
      "allineamento fra priorità delle assemblee e spesa municipale",
    ],
    results:
      "I comuni che adottano il bilancio partecipativo riallocano una quota maggiore della spesa verso salute e sanitation, coerentemente con le priorità espresse nelle assemblee, senza evidenza che il meccanismo operi semplicemente attraverso un aumento del bilancio pro capite totale. L'adozione è inoltre associata a una riduzione statisticamente significativa della mortalità infantile.",
    effectSize:
      "Quota di bilancio destinata a salute e sanitation: +2–3 punti percentuali, pari a circa +20–30% rispetto alla quota media iniziale della categoria. Mortalità infantile: −1 a −2 decessi per 1.000 nati residenti, circa −5–10% del tasso di mortalità infantile all'inizio del periodo.",
    evidenceStrength: "moderata",
    costsRequirements:
      "Richiede una quota di bilancio realmente contendibile, regole pubbliche su ammissibilità e fattibilità, organizzazione di assemblee, supporto tecnico degli uffici, tracciamento delle domande e feedback sull'esecuzione. Un processo simbolico con risorse minime o senza follow-up non replica il meccanismo valutato.",
    limitations: [
      "L'adozione del bilancio partecipativo è una scelta politica endogena del governo locale e non è randomizzata; i robustness checks riducono ma non eliminano il rischio di selezione e confondimento.",
      "La stima identifica una famiglia di istituzioni partecipative con implementazioni eterogenee fra comuni, non un singolo protocollo standardizzato.",
      "Il calo della mortalità infantile è coerente con la maggiore spesa in salute e sanitation, ma la mediazione non è dimostrata sperimentalmente e possono concorrere altre politiche locali o nazionali.",
      "Le condizioni fiscali, sanitarie e infrastrutturali dei comuni brasiliani 1990–2004 differiscono fortemente da quelle di un comune italiano contemporaneo; gli effect size non sono trasferibili numericamente.",
    ],
    unintendedEffects:
      "Partecipazione selettiva, cattura da gruppi organizzati, sovrarappresentazione di chi dispone di più tempo e aspettative non soddisfatte possono ridurre legittimità ed equità. Servono regole di inclusione, pubblicità delle decisioni e rendicontazione sullo stato di ogni domanda.",
    primarySource: {
      label: "Prefeitura de Porto Alegre — ciclo 2025 dell'Orçamento Participativo",
      url: "https://prefeitura.poa.br/smgov/noticias/orcamento-participativo-de-2025-mobilizou-18-mil-pessoas",
    },
    evaluationStudies: [
      {
        label: "World Development — studio peer-reviewed",
        url: "https://doi.org/10.1016/j.worlddev.2013.01.009",
        citation: "Gonçalves S (2014), The Effects of Participatory Budgeting on Municipal Expenditures and Infant Mortality in Brazil",
        doi: "10.1016/j.worlddev.2013.01.009",
      },
    ],
    lastVerifiedAt: "2026-09-18",
    transferabilityItaly:
      "Alta per il processo partecipativo, che può essere istituito entro la programmazione comunale, ma l'efficacia dipende dal collegamento reale con decisioni e risorse. Non è sufficiente una consultazione digitale non vincolante: serve una quota chiaramente definita, verifica tecnica trasparente e rendicontazione dell'esecuzione.",
    lameziaAdaptation:
      "Sperimentare un ciclo circoscritto su un fondo per micro-interventi di quartiere: pubblicare ex ante dotazione, criteri e costi; raccogliere proposte con canali online e assemblee fisiche; sottoporle a verifica tecnica; permettere ai residenti di prioritizzare; pubblicare stato, tempi e motivazione di ogni decisione. Per valutare il pilot, misurare composizione dei partecipanti, distribuzione territoriale dei progetti, tempi di esecuzione, soddisfazione e fiducia, senza attribuire al primo ciclo outcome sanitari di lungo periodo.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "quota di bilancio dedicata e regole di ammissibilità",
      "anagrafe dei progetti e stato di avanzamento",
      "supporto tecnico alla stima dei costi",
      "canali fisici e digitali inclusivi",
      "monitoraggio della rappresentatività dei partecipanti",
      "report pubblico su selezione, esecuzione e tempi",
    ],
    tags: ["bilancio partecipativo", "Porto Alegre", "democrazia locale", "accountability", "sanitation", "mortalità infantile"],
    revisionHistory: [
      {
        date: "2026-09-18",
        note: "Prima verifica e inserimento; il record tratta l'evidenza comparativa sui comuni brasiliani e non attribuisce l'effect size specificamente a Porto Alegre.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
