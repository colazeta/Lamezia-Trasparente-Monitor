import type { EvidenceIntervention } from "./evidenceInterventions";

/** DOI 10.1016/j.tra.2022.08.017, original manuscript and Gdańsk authority checked 2026-11-08. */
export const EVIDENCE_INTERVENTIONS_2026_11_08_GDANSK_CYCLING_MAY: readonly EvidenceIntervention[] = [
  {
    "id": "gdansk-poland-rowerowy-maj-school-active-travel-did-2014",
    "title": "Danzica: Rowerowy Maj, mobilità attiva verso le scuole con sfide e premi collettivi",
    "authority": "Gmina Miasta Gdańska (Comune di Danzica), con il gestore comunale della mobilità / Zarząd Transportu Miejskiego w Gdańsku",
    "territory": "Gdańsk (Danzica), Pomerania",
    "country": "Polonia",
    "implementationYear": "Dal maggio 2014 (pilota di due settimane); edizioni annuali da maggio 2015; valutazione 2017–2019",
    "problem": "La prevalenza di spostamenti motorizzati casa-scuola e la scarsa continuità della mobilità attiva rendono difficile avviare abitudini di viaggio sostenibili nella popolazione scolastica.",
    "measure": "Campagna municipale «Rowerowy Maj» ogni maggio in scuole primarie e dell'infanzia aderenti su base volontaria. Alunni e docenti registrano i viaggi attivi casa-scuola in diari individuali e poster di classe mediante adesivi; premi individuali, di classe e per istituto; iniziative educative e sponsorizzazioni locali. Le edizioni più recenti ammettono anche monopattini, pattini e skateboard: non tutti i viaggi conteggiati come partecipazione sono necessariamente in bicicletta.",
    "mechanism": "Gamification e competizione cooperativa tra classi/scuole, ricompense in natura e riconoscimento sociale aumentano temporaneamente la salienza della scelta di muoversi attivamente; accompagnamento scolastico e attività informative. Il meccanismo non sostituisce infrastrutture di sicurezza.",
    "population": "Bambini delle scuole primarie e dell'infanzia, insegnanti e indirettamente genitori/utenti della rete ciclabile; nel 2019 34.615 partecipanti a Gdańsk (61,3% del target), 152 scuole/infanzia. La valutazione osserva i transiti ai contatori stradali, non i singoli bambini.",
    "primaryArea": "mobilita_spazio_pubblico",
    "secondaryAreas": [
      "istruzione_giovani",
      "salute_pubblica_locale",
      "ambiente_clima_energia",
      "partecipazione_democrazia_locale"
    ],
    "interventionTypes": [
      "nudging_comunicazione",
      "incentivo_economico",
      "formazione_capacity_building",
      "partnership_pubblico_privato_terzo_settore"
    ],
    "tools": [
      "diari individuali e poster scolastici con adesivi",
      "premi scolastici in natura e riconoscimento",
      "coordinatori e attività educative presso scuole",
      "contatori automatici di biciclette e serie storiche giornaliere",
      "analisi DiD con controlli meteo, turismo, calendario e bike sharing"
    ],
    "territorialScale": "Cittadina, con adesione volontaria di singoli istituti; politica di mobilità scolastica replicata da numerosi comuni polacchi.",
    "interventionStatus": "Campagna introdotta nel 2014 e ripetuta annualmente; l'autorità comunale documenta l'edizione maggio 2025. La persistenza dei suoi effetti dopo maggio non è dimostrata dallo studio 2017–2019.",
    "evaluationMethod": "Studio quasi-sperimentale difference-in-differences di panel giornaliero sui passaggi rilevati da contatori bici, settembre 2016–agosto 2019, con effetti fissi per contatore e covariate meteo, festività, turismo, stagionalità e disponibilità del bike sharing; test dei trend condizionali, specificazioni alternative e placebo. Nessuna randomizzazione; soltanto una città di controllo.",
    "comparator": "Contatori di Łódź, città non aderente a Rowerowy Maj nel periodo analizzato; confronti città trattata/non trattata durante le edizioni di maggio 2017, 2018 e 2019 e nei mesi non trattati. Le città differiscono per uso della bici e caratteristiche socio-economiche; trend paralleli plausibili solo condizionatamente ai controlli osservati.",
    "outcomes": [
      "flussi giornalieri di biciclette registrati sulla rete di contatori urbani",
      "variazione percentuale del traffico in maggio rispetto al controfattuale DiD",
      "persistenza dei flussi addizionali nel mese di giugno",
      "partecipazione scolastica descrittiva, distinta dall'outcome di efficacia"
    ],
    "results": "I modelli DiD indicano un aumento significativo del traffico ciclabile rilevato dai contatori durante il mese della campagna; la specificazione in log restituisce ~18%, quella di Poisson ~14%. Gli autori NON riscontrano una persistenza di questo incremento in giugno. Non sono misurati direttamente incidenti, emissioni, salute o passaggi dall'auto alla bici tra i singoli alunni; non si attribuisce alla campagna un effetto permanente.",
    "effectSize": "Stima principale sui contatori in maggio: +158,36 biciclette per contatore/giorno (SE 36,86, Tabella 6, p<0,01); +18% nella specificazione log (coefficiente 0,18, SE 0,012, Tabella 7); modello Poisson ~+14% (Tabella 7). Dato descrittivo: 34.615 partecipanti nel 2019, 950.200 tragitti individuali dichiarati; questi non sono effetti causali. Follow-up giugno: effetto non persistente (Tabella 8).",
    "evidenceStrength": "moderata",
    "costsRequirements": "Materiali didattici e adesivi, organizzazione di premi, coordinamento tra ufficio mobilità e scuole, comunicazione, sponsor locali, verifica dei percorsi sicuri e misurazione baseline/follow-up. Il paper non dispone di un'analisi costi-efficacia affidabile né di un costo consuntivo comparabile per edizione. Le cifre di altre varianti/anni non consentono un budget standard per un comune italiano.",
    "limitations": [
      "Una sola città di controllo (Łódź) senza assegnazione casuale; possibili confondenti territoriali non osservati, nonostante controlli e placebo.",
      "L'assunzione di trend paralleli emerge soltanto dopo aggiustamento per stagionalità, meteo, turismo e altri fattori; attenzione alla sensibilità del modello.",
      "I contatori rilevano biciclette anche di adulti e non distinguono viaggi casa-scuola, nuovi ciclisti, cambiamento di percorso o altri utenti.",
      "La campagna aumenta il traffico solo durante maggio: nel periodo successivo osservato non è dimostrata persistenza del cambiamento.",
      "Nessuna stima diretta di riduzione dell'auto, sinistri, emissioni, miglioramento della salute, benessere o rendimento scolastico.",
      "Partecipazione scolastica volontaria e contesto di infrastrutture ciclabili già presenti; efficacia in quartieri privi di percorsi sicuri non stimabile.",
      "Nessuna valutazione comparativa dei costi finanziari netti o benefici di lungo termine."
    ],
    "unintendedEffects": "Non sono riportati effetti indesiderati quantitativamente stimati nello studio. Rischi da monitorare a Lamezia: esposizione di minori a itinerari pericolosi, disparità tra famiglie senza bici, sovraccarico nelle ore d'ingresso, pressione competitiva; prevedere alternativa pedonale e criteri inclusivi.",
    "primarySource": {
      "label": "Zarząd Transportu Miejskiego w Gdańsku — resoconto ufficiale Rowerowy Maj 2025, 11 giugno 2025",
      "url": "https://ztm.gda.pl/wiadomosci/xi-edycja-rowerowego-maja-zakonczona-ponad-milion-aktywnych-podrozy,a,10818"
    },
    "evaluationStudies": [
      {
        "label": "Postprint open access del lavoro originale, Gdańsk University of Technology (tabelle 1, 6–10)",
        "url": "https://mostwiedzy.pl/pl/publication/download/1/impact-evaluation-of-a-cycling-promotion-campaign-using-daily-bicycle-counters-data-the-case-of-cycl_73221.pdf",
        "citation": "Biondi, B., Romanowska, A. & Birr, K. (2022). Impact evaluation of a cycling promotion campaign using daily bicycle counters data: The case of Cycling May in Poland. Transportation Research Part A: Policy and Practice, 164, 337–351.",
        "doi": "10.1016/j.tra.2022.08.017"
      }
    ],
    "lastVerifiedAt": "2026-11-08",
    "transferabilityItaly": "Una campagna scolastica volontaria con premi, diari e collaborazione tra Comune, scuole e associazioni è giuridicamente e amministrativamente adattabile; la sicurezza dei percorsi, l'accessibilità e il consenso/gestione dei dati di minori richiedono valutazione preventiva. È lecito prevedere un pilota con scuole che ricevono l'intervento in tempi differenziati, senza escludere permanentemente istituti. Non trasferire il +18% ai flussi scolastici lametini: lo studio misura contatori cittadini durante il mese dell'iniziativa.",
    "lameziaAdaptation": "Proporre una «Mobilità attiva a scuola» in maggio presso scuole pilota dei tre poli Nicastro, Sambiase e Sant'Eufemia, con percorsi verificati insieme a Polizia Locale, dirigenti scolastici, famiglie e tecnici del PGTU. Premiare frequenza di viaggi a piedi, in bici o in gruppo, senza penalizzare disabilità o distanze non percorribili. Assegnare casualmente, quando fattibile e con adesione informata delle scuole, tempi di avvio differiti; misurare flussi per modo di trasporto agli ingressi, auto in sosta, incidenti/near-miss, continuità 1–3 mesi dopo e costi per scuola. Prevedere percorso sicuro o pedibus, non incentivi a pedalare su strade insicure.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "mappatura degli istituti e degli itinerari casa-scuola con attraversamenti e rischi",
      "accordo con scuole, famiglie e Polizia Locale per osservazioni non identificanti",
      "conteggi comparabili di pedoni, biciclette e auto prima/durante/dopo",
      "protocollo di valutazione preregistrato con controllo meteo e periodo scolastico",
      "budget per materiali, assicurazione, premi e accompagnamento",
      "verifica GDPR e tutela minori per raccolta dei soli dati necessari"
    ],
    "tags": [
      "Gdańsk",
      "Danzica",
      "Polonia",
      "Rowerowy Maj",
      "Cycling May",
      "gamification",
      "mobilità scolastica",
      "bicicletta",
      "pedibus",
      "difference-in-differences",
      "effetto transitorio",
      "Biondi 2022",
      "PGTU Lamezia"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-08",
        "note": "Nuovo caso deduplicato: discovery con Parallel Search; verificati postprint originale Biondi et al. (2022), Tab. 1, 6–8 e conclusioni, oltre al resoconto ZTM comunale; +18% solo nel mese di maggio, non permanente, outcome sui contatori cittadini. Tassonomie e cronologia revisioni mantenute."
      }
    ]
  }
];
