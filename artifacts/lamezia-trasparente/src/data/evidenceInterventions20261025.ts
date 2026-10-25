import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_25: readonly EvidenceIntervention[] = [
{
  "id": "nyc-safe-routes-to-school-pedestrian-injury",
  "title": "Percorsi casa-scuola sicuri: interventi fisici mirati nei pressi degli istituti",
  "authority": "New York City Department of Transportation (NYC DOT), con Department of Design and Construction (DDC)",
  "territory": "New York City, New York",
  "country": "Stati Uniti",
  "implementationYear": "Avvio municipale nel 2004; interventi e valutazione principale nel 2001–2010 (pre 2001–2008, post 2009–2010)",
  "problem": "Incidentalità pedonale dei bambini nelle fasce di entrata e uscita dalle scuole, con rischi concentrati presso attraversamenti e intersezioni.",
  "measure": "Programma Safe Routes to School: selezione delle scuole con maggiore incidentalità e interventi fisici sulle strade limitrofe, compresi marciapiedi e attraversamenti ad alta visibilità, rallentatori e traffic calming, segnali, fasi semaforiche pedonali dedicate e modifiche alle regole di sosta; iniziative educative accessorie.",
  "mechanism": "Ridurre velocità e conflitti auto-pedoni nei punti di attraversamento, aumentare la visibilità dei bambini e creare percorsi più prevedibili nelle ore di ingresso e uscita.",
  "population": "Bambini e adolescenti di 5–19 anni che camminano nelle aree scolastiche; altri pedoni e utenti degli incroci trattati.",
  "primaryArea": "mobilita_spazio_pubblico",
  "secondaryAreas": [
    "sicurezza_urbana_prevenzione",
    "istruzione_giovani",
    "salute_pubblica_locale"
  ],
  "interventionTypes": [
    "infrastruttura_fisica",
    "regolazione",
    "targeting_data_analytics",
    "formazione_capacity_building"
  ],
  "tools": [
    "mappatura degli incidenti geocodificati",
    "prioritizzazione di 124 scuole con elevata incidentalità nella prima fase valutata",
    "attraversamenti ad alta visibilità",
    "rallentatori e traffic calming",
    "semafori pedonali e attraversamento dedicato",
    "marciapiedi e interventi sulle intersezioni"
  ],
  "territorialScale": "Tratti stradali e intersezioni presso scuole; selezione e coordinamento a scala cittadina",
  "interventionStatus": "Programma avviato e interventi stradali realizzati; NYC DDC documenta prosecuzione e ampliamento a 135 scuole prioritarie nella ricognizione del 2016. Non verificata la permanenza nel 2026 della medesima configurazione amministrativa.",
  "evaluationMethod": "Studio osservazionale territoriale pre/post con aree di controllo (Pediatrics 2013); successiva analisi Bayesian changepoint e difference-in-differences con Poisson sovradisperso (Injury Epidemiology 2014), su incidenti pedonali geocodificati 2001–2010. Analisi di costo-efficacia Markov (AJPH 2014) separata dalla stima d'impatto.",
  "comparator": "Census tracts con scuole non interessate dal programma, osservati negli stessi periodi e negli stessi orari scolastici; nel secondo studio anche tracts con interventi programmati/incompleti.",
  "outcomes": [
    "infortuni pedonali dei minori durante 07:00–09:00 e 14:00–16:00 nei giorni scolastici",
    "differenza rispetto ad aree senza intervento",
    "tempistica del cambiamento negli incidenti",
    "benefici e costi sociali simulati"
  ],
  "results": "Nel primo studio il tasso annuale di infortuni pedonali durante gli orari scolastici nelle aree SRTS scende da 8,0 a 4,4 per 10.000 minori (−44% pre/post), mentre nelle aree di controllo resta circa 3,1. Una seconda analisi con DiD stima una riduzione puntuale del 44%, ma con intervallo di confidenza così ampio da includere nessun effetto e persino un aumento del rischio: non è una conferma causale statisticamente precisa. L'analisi economica simula benefici sociali netti di 230 milioni USD e 2.055 QALY assumendo 50 anni di durata degli interventi; non sono risparmi osservati.",
  "effectSize": "Pediatrics 2013: 8,0→4,4 infortuni annui/10.000 minori nei tracts trattati, −44% (IC95% per la riduzione pre/post 17–65%), contro circa 0% di variazione nei tracts non trattati. Injury Epidemiology 2014: stima DiD −44%, IC95% corrispondente a una riduzione dell'87% fino a un aumento del 130%: non statisticamente distinta da zero. AJPH 2014: benefici netti e QALY esclusivamente modellizzati.",
  "evidenceStrength": "moderata",
  "costsRequirements": "Investimenti infrastrutturali, analisi della rete viaria e incidenti, coordinamento tra autorità stradali/scuole e manutenzione; la prima tranche NYC considerata dal modello economico costava circa 10,3 milioni USD (valore storico locale, non unit cost trasferibile).",
  "limitations": [
    "Interventi selezionati in scuole ad alta incidentalità: differenze iniziali fra aree e possibile regressione verso la media.",
    "Lo studio 2013 presenta confronto prima/dopo con controlli territoriali ma non identifica tutti i confondenti; altre politiche stradali cittadine e trend secolari possono spiegare parte del calo.",
    "Lo studio 2014 usa DiD e changepoint, ma l'intervallo al 95% del coefficiente DiD include l'assenza di effetto, nonostante la riduzione descrittiva osservata.",
    "Il pacchetto combina infrastrutture, regolazione ed educazione; non consente di attribuire l'effetto a un singolo elemento.",
    "Le proiezioni economiche dipendono da un modello Markov, da benefici ipotizzati persistenti per 50 anni e da costi USA del 2013, non costituiscono risparmio comunale osservato.",
    "La numerosità delle lesioni e i tassi di mobilità possono essere molto diversi in un comune italiano di minori dimensioni."
  ],
  "unintendedEffects": "Le valutazioni non quantificano compiutamente spostamenti di traffico sugli assi circostanti, tempi per gli automobilisti o possibili impatti sul parcheggio; da misurare esplicitamente in una sperimentazione locale.",
  "primarySource": {
    "label": "NYC Department of Design and Construction — Safe Routes to School (2016)",
    "url": "https://www.nyc.gov/site/ddc/resources/features/september-2016-safe-routes-to-school.page"
  },
  "evaluationStudies": [
    {
      "label": "Pediatrics (2013) — valutazione territoriale",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3557410/",
      "citation": "DiMaggio C, Li G (2013), Effectiveness of a Safe Routes to School Program in Preventing School-Aged Pedestrian Injury, Pediatrics 131(2):290–296",
      "doi": "10.1542/peds.2012-2182"
    },
    {
      "label": "Injury Epidemiology (2014) — changepoint e DiD",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5005758/",
      "citation": "DiMaggio C, Chen Q, Muennig PA, Li G (2014), Timing and effect of a safe routes to school program on child pedestrian injury risk during school travel hours: Bayesian changepoint and difference-in-differences analysis, Injury Epidemiology 1:17",
      "doi": "10.1186/s40621-014-0017-0"
    },
    {
      "label": "American Journal of Public Health (2014) — analisi di costo-efficacia",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4056240/",
      "citation": "Muennig P et al. (2014), The Cost-Effectiveness of New York City's Safe Routes to School Program, American Journal of Public Health 104(7):1294–1299",
      "doi": "10.2105/AJPH.2014.301868"
    }
  ],
  "lastVerifiedAt": "2026-10-25",
  "transferabilityItaly": "Alta per diagnosi delle intersezioni scolastiche, traffic calming e attraversamenti protetti, subordinatamente a Codice della strada, competenze sui tratti viari, accessibilità e progettazione tecnica. La dimensione del beneficio statunitense non è una previsione per un singolo comune italiano.",
  "lameziaAdaptation": "Mappare scuole e accessi a Nicastro, Sambiase e Sant'Eufemia; incrociare incidenti georiferiti, flussi di veicoli, osservazioni delle famiglie e dati della Polizia Locale; scegliere 3–5 siti ad alto rischio e progettare attraversamenti protetti, gestione della sosta e riduzione delle velocità. Misurare velocità, conflitti, sinistri, mobilità attiva e accessibilità prima/dopo, con siti di confronto ove possibile; evitare di valutare il progetto sulla sola apertura dei cantieri.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "mappa scuole e accessi",
    "sinistri geocodificati con data/ora",
    "flussi e velocità prossimità scuole",
    "competenze proprietari strade e vincoli",
    "costi di realizzazione e manutenzione",
    "indicatori di near miss e attraversamenti",
    "piano di valutazione e territori comparatori"
  ],
  "tags": [
    "safe routes to school",
    "sicurezza stradale scolastica",
    "attraversamenti pedonali",
    "infrastrutture",
    "bambini",
    "changepoint",
    "difference-in-differences",
    "analisi costo-efficacia"
  ],
  "revisionHistory": [
    {
      "date": "2026-10-25",
      "note": "Prima verifica e inserimento. Conservata la differenza fra il −44% pre/post e il DiD con IC95% comprendente lo zero; benefici monetari separati come modellizzazione."
    }
  ]
}
];
