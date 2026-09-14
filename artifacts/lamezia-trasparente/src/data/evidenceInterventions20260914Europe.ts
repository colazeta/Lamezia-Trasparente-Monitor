import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_14_EUROPE = [
  {
    id: "london-mini-hollands-active-travel",
    title: "Mini-Hollands: infrastrutture integrate per mobilità attiva nei borough esterni",
    authority: "Transport for London / London Boroughs of Enfield, Kingston upon Thames and Waltham Forest",
    territory: "Outer London — Enfield, Kingston upon Thames e Waltham Forest",
    country: "Regno Unito",
    implementationYear: "2013/2014–2020/2021",
    problem:
      "Elevata dipendenza dall'auto nei borough esterni, rete ciclabile frammentata, ambienti stradali poco favorevoli a camminare e pedalare e conseguente bassa attività fisica incorporata negli spostamenti quotidiani.",
    measure:
      "Investimento territoriale integrato in piste ciclabili protette, moderazione e filtraggio del traffico, ridisegno di centri urbani, attraversamenti pedonali, cycle hubs, parcheggi bici, nuovi spazi pubblici e misure complementari di promozione della mobilità attiva.",
    mechanism:
      "Ridurre rischio percepito e reale, continuità interrotta della rete e vantaggio generalizzato dell'auto attraverso un pacchetto fisico di interventi sufficientemente intenso da cambiare le opportunità quotidiane di camminare e pedalare; l'esposizione più vicina agli interventi dovrebbe produrre una risposta maggiore.",
    population: "Residenti dei tre borough Mini-Holland, con valutazione longitudinale su oltre 3.000 rispondenti al baseline e oltre 1.400 repeat respondents per ciascuna delle tre ondate di follow-up.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["salute_pubblica_locale", "ambiente_clima_energia", "urbanistica_rigenerazione"],
    interventionTypes: ["infrastruttura_fisica", "regolazione", "modifica_organizzativa_processo", "nudging_comunicazione"],
    tools: ["piste ciclabili segregate", "traffic calming", "modal filters", "attraversamenti pedonali", "cycle hubs e parcheggi bici", "ridisegno dei centri urbani", "public realm"],
    territorialScale: "Borough / rete di quartieri e corridoi",
    interventionStatus:
      "Programma infrastrutturale implementato nei tre borough vincitori; le misure sono entrate nella rete locale e il modello ha informato il più ampio Healthy Streets approach londinese.",
    evaluationMethod:
      "Natural experiment longitudinale con residenti dei borough Mini-Holland e residenti di altri borough esterni come controllo; difference-in-differences su più ondate, con analisi dose-risposta distinguendo residenti vicini agli interventi ('high-dose') da esposizione più bassa.",
    comparator: "Residenti di altri borough esterni di Londra non finanziati dal programma e, nelle analisi di dose, residenti più distanti dalle infrastrutture Mini-Holland.",
    outcomes: ["minuti settimanali di mobilità attiva", "probabilità di avere pedalato nella settimana", "raggiungimento di target di mobilità attiva", "attività fisica", "percezione dell'ambiente locale"],
    results:
      "A tre anni, vivere vicino agli interventi è associato in modo consistente a circa 41–44 minuti settimanali aggiuntivi di mobilità attiva rispetto al controllo, soprattutto camminando. Alla terza ondata i residenti high-dose risultano inoltre più propensi a raggiungere almeno 140 minuti di active travel settimanale. Le stime mostrano un gradiente con esposizione più intensa vicino agli interventi.",
    effectSize:
      "Past-week active travel high-dose vs controllo: +41,0 minuti/settimana a Wave 1, +44,0 a Wave 2 e +41,5 a Wave 3; a Wave 3 circa +13% nella probabilità di raggiungere 140 minuti/settimana. La valutazione economica modellata stima £724 milioni di benefici sanitari a 20 anni a fronte di circa £80 milioni di interventi inclusi nell'analisi; questa è una proiezione, non un risparmio osservato.",
    evidenceStrength: "forte",
    costsRequirements:
      "Programma ad alta intensità di capitale: il case study governativo riporta circa £90 milioni di finanziamento TfL nei tre borough, con ulteriori contributi locali in alcuni casi. Richiede progettazione stradale, consultazione, cantieri, manutenzione, coordinamento di rete e capacità di gestire opposizione e redistribuzione del traffico.",
    limitations: [
      "Non è un RCT: l'esposizione dipende dal luogo di residenza e le aree high-dose sono definite in relazione al rollout; residui fattori di selezione territoriale e individuale possono restare nonostante longitudinalità, controllo esterno e DiD.",
      "Gli outcome di mobilità derivano prevalentemente da survey auto-riferite; attrition del panel e cambiamenti nella composizione dei rispondenti possono influenzare le stime.",
      "Il pacchetto comprende infrastrutture e misure molto diverse: la valutazione identifica l'effetto del programma complessivo e non il rendimento causale di ogni singolo elemento.",
      "Il beneficio sanitario monetizzato a 20 anni è modellato sulla mobilità osservata e non costituisce un outcome di bilancio direttamente misurato.",
    ],
    unintendedEffects:
      "Possibili spostamenti del traffico, opposizione locale, problemi di accessibilità o consegne se il disegno dei filtri e dei corridoi non è calibrato; la valutazione del pacchetto non dimostra assenza di effetti distributivi o di displacement su tutte le strade limitrofe.",
    primarySource: {
      label: "UK Department for Transport — London Mini Hollands case study",
      url: "https://www.gov.uk/government/case-studies/london-mini-hollands",
    },
    evaluationStudies: [
      {
        label: "Journal of Transport & Health / University of Cambridge Repository",
        url: "https://www.repository.cam.ac.uk/items/79f5037c-211e-4ef5-8016-650d8e1dd832",
        citation: "Aldred R, Woodcock J, Goodman A (2021), Major investment in active travel in Outer London: Impacts on travel behaviour, physical activity, and health",
        doi: "10.1016/j.jth.2020.100958",
      },
    ],
    lastVerifiedAt: "2026-09-14",
    transferabilityItaly:
      "Alta per il principio di rete e di pacchetto integrato; media per scala finanziaria. Un comune italiano può combinare attraversamenti, continuità ciclabile, moderazione del traffico, parcheggi bici e riqualificazione dello spazio pubblico, ma deve adattare strumenti, standard stradali, competenze e finanziamento al Codice della strada e al proprio PUMS/Piano urbano del traffico.",
    lameziaAdaptation:
      "Evitare micro-interventi isolati. Selezionare un asse e 1–2 quartieri in cui scuole, servizi e centro possano essere collegati con una rete continua a piedi/bici; costruire prima una baseline su flussi, velocità, incidenti, parcheggio e modalità di viaggio. Un primo 'mini-Lamezia' dovrebbe integrare attraversamenti sicuri, moderazione del traffico, continuità ciclabile e parcheggi bici, con rollout per fasi e aree comparabili per misurare spostamenti attivi e traffico sulle strade limitrofe.",
    implementability: "strutturale",
    capacityDataNeeds: ["rete e flussi di traffico", "incidenti georeferenziati", "conteggi pedoni/bici", "origine-destinazione", "progettazione stradale", "consultazione e accessibilità", "monitoraggio strade di confine"],
    tags: ["mobilità attiva", "ciclabilità", "camminabilità", "Mini-Holland", "natural experiment", "difference-in-differences", "Healthy Streets"],
    revisionHistory: [{ date: "2026-09-14", note: "Prima verifica e inserimento; separata la stima DiD osservata dalla valutazione economica modellata a 20 anni." }],
  },
] as const satisfies readonly EvidenceIntervention[];
