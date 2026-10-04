import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_04 = [
  {
    id: "nyc-school-zone-speed-cameras-did",
    title: "Enforcement automatico della velocità nelle school zones",
    authority: "New York City Department of Transportation (NYC DOT)",
    territory: "New York City",
    country: "Stati Uniti",
    implementationYear: "Pilota dal gennaio 2014; espansioni successive; autorizzazione rinnovata fino al 1 luglio 2030",
    problem: "Eccesso di velocità e rischio di collisioni e feriti nelle aree scolastiche.",
    measure: "Speed camera automatiche nelle school zones, con rilevazione dei veicoli oltre la soglia prevista, revisione umana dell'evento e sanzione al proprietario; operatività 24/7 dal 2022.",
    mechanism: "Un controllo continuo e prevedibile aumenta la probabilità di rilevare l'eccesso di velocità e modifica il comportamento senza richiedere un fermo su strada.",
    population: "Conducenti e utenti della strada nelle school zones di New York City, inclusi studenti, pedoni e ciclisti.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["sicurezza_urbana_prevenzione", "salute_pubblica_locale", "digitalizzazione_servizi_online"],
    interventionTypes: ["enforcement_controllo", "infrastruttura_digitale", "regolazione", "targeting_data_analytics"],
    tools: ["speed camera", "radar/laser", "revisione umana", "notice of liability", "procedura di contestazione"],
    territorialScale: "Cittadina, con installazione nelle school speed zones",
    interventionStatus: "Programma operativo; nel 2025 lo Stato di New York ne ha rinnovato l'autorizzazione fino al 1 luglio 2030.",
    evaluationMethod: "Difference-in-differences con adozione scaglionata sul rollout di circa 2.000 speed camera tra 2014 e 2023, usando circa 700.000 collisioni, 200.000 feriti e 18 milioni di sanzioni.",
    comparator: "Aree/intersezioni non ancora trattate o non trattate nello stesso periodo secondo il disegno staggered-adoption.",
    outcomes: ["collisioni", "feriti da collisione", "violazioni per eccesso di velocità", "persistenza dell'effetto"],
    results: "La valutazione quasi-sperimentale stima circa −5% di collisioni e −2,5% di feriti al mese dopo l'attivazione; nei primi sette mesi ciò corrisponde a circa −30% di collisioni e −16% di feriti. Il −94% delle violazioni giornaliere medie riportato da NYC DOT è mantenuto come dato descrittivo, non come stima causale.",
    effectSize: "Collisioni circa −5% al mese e −30% cumulato nei primi 7 mesi; feriti circa −2,5% al mese e −16% cumulato nei primi 7 mesi.",
    evidenceStrength: "forte",
    costsRequirements: "Richiede base giuridica, dispositivi certificati, selezione trasparente dei siti, gestione dati, revisione umana, notifica, contenzioso e manutenzione.",
    limitations: [
      "Non è un RCT e l'identificazione dipende dal disegno difference-in-differences.",
      "Le school zones di una grande metropoli non sono direttamente comparabili con strade e traffico di Lamezia.",
      "I dati sulle collisioni derivano da eventi registrati dalla polizia e possono non includere tutti gli incidenti.",
      "Nel periodo erano attive anche altre componenti di Vision Zero.",
      "In Italia installazione e modalità di accertamento dipendono dal quadro nazionale e dalle competenze applicabili."
    ],
    unintendedEffects: "Possibili oneri regressivi delle sanzioni, contestazioni e spostamento delle velocità verso tratti non controllati; vanno monitorati spillover ed equità.",
    primarySource: {
      label: "NYC DOT — Automated Speed Enforcement Program",
      url: "https://www.nyc.gov/html/dot/downloads/pdf/speed-camera-report.pdf"
    },
    evaluationStudies: [
      {
        label: "PNAS — Can speed cameras make streets safer?",
        url: "https://www.pnas.org/doi/10.1073/pnas.2520328122",
        citation: "Stagoff-Belfort A, Ben-Menachem J, et al. (2025), Can speed cameras make streets safer? Quasi-experimental evidence from New York City, Proceedings of the National Academy of Sciences",
        doi: "10.1073/pnas.2520328122"
      },
      {
        label: "New York State Senate — S8344",
        url: "https://www.nysenate.gov/legislation/bills/2025/S8344",
        citation: "New York State Senate Bill S8344 (2025), renewal of New York City's school-zone speed camera authority through 1 July 2030"
      }
    ],
    lastVerifiedAt: "2026-10-04",
    transferabilityItaly: "Media come meccanismo di sicurezza stradale, subordinata al quadro italiano su accertamento automatico, omologazione e competenze. Il valore trasferibile è il targeting data-driven e un rollout valutabile, non la replica della sanzione di New York.",
    lameziaAdaptation: "Costruire prima un layer georeferenziato di velocità, collisioni e feriti presso scuole e attraversamenti; solo dove giuridicamente e tecnicamente appropriato introdurre strumenti automatici per fasi, confrontandoli anche con traffic calming fisico.",
    implementability: "medio_termine",
    capacityDataNeeds: ["collisioni e feriti geocodificati", "misure di velocità e traffico", "mappa scuole e attraversamenti", "verifica giuridica e tecnica", "registro sanzioni e ricorsi", "monitoraggio degli spillover"],
    tags: ["New York City", "speed camera", "sicurezza stradale", "school zones", "automated enforcement", "difference-in-differences"],
    revisionHistory: [{ date: "2026-10-04", note: "Prima verifica e inserimento; separati gli effetti causali della valutazione PNAS dal calo descrittivo delle violazioni e verificato il rinnovo legislativo fino al 2030." }]
  },
  {
    id: "nyc-summer-youth-employment-program-lottery",
    title: "Programma estivo di lavoro retribuito per giovani",
    authority: "New York City Department of Youth & Community Development (DYCD)",
    territory: "New York City",
    country: "Stati Uniti",
    implementationYear: "Programma attivo dal 1963; valutazione tramite lotterie 2005–2008; operativo nel 2026",
    problem: "Scarso accesso dei giovani a esperienze lavorative retribuite, reddito estivo e reti professionali, con possibili ricadute su disengagement e rischio sociale.",
    measure: "Esperienze estive di lavoro e career exploration retribuite presso enti, organizzazioni e datori di lavoro; nei cicli storici sovra-domandati l'accesso veniva assegnato tramite lotterie.",
    mechanism: "Lavoro strutturato, reddito, supervisione adulta, esperienza professionale e tempo impegnato in attività prosociali possono migliorare gli outcome durante l'estate anche senza produrre guadagni occupazionali persistenti.",
    population: "Giovani residenti di New York City che fanno domanda al programma; il programma corrente serve persone tra 14 e 24 anni.",
    primaryArea: "sviluppo_economico_commercio_lavoro",
    secondaryAreas: ["istruzione_giovani", "welfare_inclusione_servizi_sociali", "sicurezza_urbana_prevenzione"],
    interventionTypes: ["servizio_diretto", "incentivo_economico", "partnership_pubblico_privato_terzo_settore", "formazione_capacity_building"],
    tools: ["lavoro estivo retribuito", "career exploration", "provider territoriali", "matching con worksite", "lotteria nei cicli valutati", "dati amministrativi longitudinali"],
    territorialScale: "Cittadina",
    interventionStatus: "Operativo nel 2026; DYCD continua a presentare SYEP come il più grande programma di lavoro giovanile estivo degli Stati Uniti, rivolto ai 14–24enni.",
    evaluationMethod: "Randomized lottery evaluation su circa 294.100 partecipanti alle lotterie 2005–2008, collegati a dati fiscali, detentivi e di mortalità.",
    comparator: "Candidati eleggibili che non hanno ottenuto il posto nella lotteria, confrontati con vincitori/partecipanti nello stesso ciclo.",
    outcomes: ["occupazione e reddito nell'estate", "occupazione e redditi successivi", "incarcerazione", "mortalità", "college enrollment"],
    results: "La valutazione QJE trova −0,098 punti percentuali nella probabilità di incarcerazione, circa −10% relativo, e −0,073 punti percentuali nella mortalità, circa −18%, soprattutto tra i maschi. L'occupazione aumenta fortemente nell'anno del programma, ma non emergono miglioramenti persistenti dell'occupazione o del college enrollment; i redditi medi risultano moderatamente più bassi nei tre anni successivi.",
    effectSize: "Incarcerazione −0,098 p.p. (circa −10% relativo); mortalità −0,073 p.p. (circa −18% relativo); probabilità di occupazione nell'anno del programma circa +71 p.p.",
    evidenceStrength: "molto_forte",
    costsRequirements: "Richiede budget per compensi, rete di datori di lavoro e provider, selezione e matching, supervisione, sicurezza sul lavoro, amministrazione delle paghe e capacità di seguire gli outcome.",
    limitations: [
      "Non emergono miglioramenti generalizzati e persistenti di occupazione, redditi o college enrollment.",
      "Le principali coorti causali sono 2005–2008 e il programma è evoluto nel tempo.",
      "La lotteria identifica l'effetto in un contesto di domanda eccedente e non prova che un'espansione illimitata produca lo stesso effetto.",
      "I meccanismi dietro la riduzione di mortalità e incarcerazione non sono identificati in modo univoco."
    ],
    unintendedEffects: "Possibile crowd-out di altri lavori estivi e, nelle coorti studiate, modesta riduzione dei redditi medi nei tre anni successivi; qualità dei worksite e supervisione possono essere eterogenee.",
    primarySource: {
      label: "NYC DYCD — Summer Youth Employment Program",
      url: "https://www.nyc.gov/site/dycd/services/jobs-internships/summer-youth-employment-program-syep.page"
    },
    evaluationStudies: [
      {
        label: "Quarterly Journal of Economics — The Effects of Youth Employment",
        url: "https://www.nber.org/papers/w20810",
        citation: "Gelber A, Isen A, Kessler JB (2016), The Effects of Youth Employment: Evidence from New York City Lotteries, Quarterly Journal of Economics 131(1):423–460",
        doi: "10.1093/qje/qjv034"
      }
    ],
    lastVerifiedAt: "2026-10-04",
    transferabilityItaly: "Medio-alta come modello di politica attiva giovanile, ma dipende da fonti di finanziamento, disciplina del lavoro e ruolo di Comune, Regione, servizi per l'impiego e soggetti ospitanti. Un tie-break casuale ha senso soltanto tra candidati realmente equivalenti e dopo verifica giuridica.",
    lameziaAdaptation: "Costruire un pilot estivo limitato con imprese, terzo settore, cultura, ambiente, turismo e servizi comunali, con mansioni formative e supervisione. Se le domande ammissibili superano i posti, valutare una procedura trasparente e, ove consentito, randomizzazione tra equivalenti. Misurare completamento, occupazione estiva, assenze e follow-up formativo.",
    implementability: "medio_termine",
    capacityDataNeeds: ["platea e domanda potenziale", "budget per compensi", "rete di worksite", "criteri di eleggibilità", "supervisione e sicurezza", "dati longitudinali su partecipazione e follow-up"],
    tags: ["New York City", "summer jobs", "giovani", "occupazione", "lotteria", "RCT", "prevenzione"],
    revisionHistory: [{ date: "2026-10-04", note: "Prima verifica e inserimento; mantenuti insieme i benefici causali su incarcerazione/mortalità e i risultati nulli o negativi sugli outcome occupazionali di più lungo periodo." }]
  }
] as const satisfies readonly EvidenceIntervention[];
