import type { EvidenceIntervention } from "./evidenceInterventions";

/** NYC Homebase RCT: original experimental outcomes and caveats verified 2026-11-07. */
export const EVIDENCE_INTERVENTIONS_2026_11_07_NYC_HOMEBASE: readonly EvidenceIntervention[] = [
{
  "id": "new-york-city-homebase-homelessness-prevention-rct-2010",
  "title": "New York City: Homebase Community Prevention e prevenzione della perdita dell'alloggio",
  "authority": "New York City Department of Homeless Services (DHS), con centri di prevenzione territoriali e organizzazioni partner",
  "territory": "New York City, New York",
  "country": "Stati Uniti",
  "implementationYear": "Introdotto negli anni 2000; copertura cittadina dal 2007; valutazione randomizzata 2010–2012, report 2013",
  "problem": "Famiglie vulnerabili prossime a perdere l'alloggio e ad accedere ai rifugi temporanei, con elevati costi individuali e amministrativi e difficoltà di accesso tempestivo ai sostegni.",
  "measure": "La rete Homebase Community Prevention offre ai nuclei a rischio, prima dell'ingresso nei rifugi, un case manager e un piano individualizzato: mediazione con il locatore, consulenza su diritti e benefici, sostegno alla ricerca di impiego, rinvii legali, contributi temporanei per morosità, utenze o spese di trasloco. L'esperimento ha assegnato casualmente l'accesso al pacchetto di servizi a richiedenti eleggibili.",
  "mechanism": "L'assistenza tempestiva e integrata risolve problemi abitativi sanabili prima che degenerino in perdita dell'alloggio; riduce barriere pratiche e informative e aiuta a coordinare misure già esistenti. L'effetto stimato riguarda l'offerta complessiva, non un singolo componente.",
  "population": "295 famiglie eleggibili a rischio di homelessness nella sperimentazione (150 assegnate a Homebase, 145 al controllo); servizio territoriale più ampio non rappresentato integralmente dal campione.",
  "primaryArea": "housing_politiche_abitative",
  "secondaryAreas": [
    "welfare_inclusione_servizi_sociali",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "servizio_diretto",
    "incentivo_economico",
    "modifica_organizzativa_processo",
    "partnership_pubblico_privato_terzo_settore",
    "targeting_data_analytics"
  ],
  "tools": [
    "screening preliminare di eleggibilità e rischio",
    "case manager di prossimità e piano personalizzato",
    "mediazione abitativa e orientamento legale",
    "assistenza per contributi e servizi sociali",
    "aiuti finanziari limitati per morosità, utenze e trasloco",
    "registri amministrativi di accesso e permanenza nei rifugi"
  ],
  "territorialScale": "Centri di comunità in quartieri urbani a elevato bisogno; rete municipale nell'area di New York City.",
  "interventionStatus": "Programma municipale storicamente implementato e valutato; il record descrive specificamente il trattamento Homebase Community Prevention randomizzato nel 2010–2012, senza presumere che l'attuale programma coincida nei dettagli con la versione valutata.",
  "evaluationMethod": "Randomized controlled trial (2010–2012), assegnazione individuale a offerta Homebase CP vs usual services; intention-to-treat (ITT) e dati amministrativi sui rifugi durante 27 mesi; analisi di regressione con covariate di baseline e blocchi di randomizzazione. Riportati intervalli di confidenza al 90% e p-value con test monodirezionale secondo il report.",
  "comparator": "145 famiglie eleggibili assegnate ai servizi ordinari senza accesso al pacchetto aggiuntivo Homebase CP, confrontate con 150 famiglie assegnate all'offerta.",
  "outcomes": [
    "notti trascorse in rifugi temporanei nei 27 mesi successivi",
    "quota di famiglie che trascorre almeno una notte nei rifugi",
    "domande di accesso ai rifugi",
    "costi dei servizi vs spesa per rifugi evitata",
    "uso di prestazioni per minori e sostegni al reddito",
    "esiti occupazionali esplorativi"
  ],
  "results": "Nel confronto randomizzato, le famiglie assegnate a Homebase CP trascorrono in media 9,6 notti in rifugio contro 32,2 nel controllo aggiustato: −22,6 notti nell'arco del follow-up di 27 mesi (outcome confermativo). Analisi esplorative: almeno una notte in rifugio 8,0% contro 14,5% (−6,5 punti percentuali) e domanda di accesso 9,3% contro 18,2% (−8,9 punti). Non sono stati rilevati effetti significativi su tutela minori o sostegni TANF/SNAP; differenze occupazionali non interpretabili come causali per squilibri già presenti prima dell'assegnazione.",
  "effectSize": "Outcome primario ITT: −22,6 notti in rifugio per famiglia su 27 mesi; IC 90% [−41,7; −3,4], p=0,03 riportato con test unilaterale; media trattamento 9,6 e controllo aggiustato 32,2. Outcome secondari esplorativi: −6,5 punti percentuali almeno una notte (8,0% vs 14,5%, p=0,04 unilaterale); −8,9 punti domanda di rifugio (9,3% vs 18,2%, p=0,02 unilaterale). La differenza unadjusted e la stima ITT adjusted non devono essere confuse con effetti di per-protocol.",
  "evidenceStrength": "forte",
  "costsRequirements": "Secondo il report RCT, costo per famiglia trattata circa USD 2.235 (USD 1.896 operativi + USD 339 sostegni diretti), valore dei giorni di rifugio evitati stimato USD 2.375 (22,6 notti × USD 105,08): saldo contabile modellizzato +USD 140 per famiglia, molto incerto, non una prova di risparmio netto replicabile. Occorrono operatori dedicati, accordi con proprietari/servizi, accesso legittimo a dati amministrativi, risorse per aiuti di emergenza e governance privacy.",
  "limitations": [
    "Campione sperimentale ridotto (295 famiglie) e una sola città; l'effetto è stimato per nuclei eleggibili, non per ogni famiglia in difficoltà economica.",
    "Risultato confermativo significativo al test unilaterale e IC al 90%; precisione inferiore a quella che una lettura non qualificata del solo p-value potrebbe suggerire.",
    "Una parte del beneficio sulle notti in rifugio è concentrata nell'assenza di casi con permanenze molto lunghe tra i trattati; stima sensibile alla coda della distribuzione.",
    "Un certo squilibrio pre-trattamento nella storia di rifugio è gestito nelle stime aggiustate; il gruppo trattato non riceve sempre servizi effettivi (134 su 150 secondo il report).",
    "Il saldo di USD 140 deriva da monetizzazione dei pernottamenti risparmiati senza attualizzazione; nessun budget comunale italiano può assumere direttamente tale rendimento.",
    "Le analisi sulla quota di ingressi e domande sono esplorative e non hanno la stessa pre-specificazione del risultato primario.",
    "Il contesto statunitense del diritto all'accoglienza, della struttura dei rifugi e dei contributi abitativi differisce da quello italiano; impossibile tradurre automaticamente le soglie di eleggibilità.",
    "Il programma può prevenire l'ingresso nei rifugi senza necessariamente eliminare tutte le forme di precarietà abitativa non registrate nei dati amministrativi."
  ],
  "unintendedEffects": "Nessun aumento statisticamente accertato degli esiti negativi secondari riportati. Possibili rischi di errata selezione dei nuclei, esclusione di persone con bisogni ma senza requisiti formali, dipendenza da fondi temporanei e spostamento verso sistemazioni informali non rilevate; rischi da monitorare, non effetti documentati causalmente.",
  "primarySource": {
    "label": "New York City — documento istituzionale su Homebase Community Prevention e valutazioni 2009–2013",
    "url": "https://www.nyc.gov/assets/opportunity/pdf/policybriefs/homelessness-prevention.pdf"
  },
  "evaluationStudies": [
    {
      "label": "Abt Associates per NYC Department of Homeless Services — rapporto finale dell'esperimento randomizzato",
      "url": "https://www.abtglobal.com/sites/default/files/migrated_files/cf819ade-6613-4664-9ac1-2344225c24d7.pdf",
      "citation": "Rolston, H., Geyer, J., Locke, G., Metraux, S. & Treglia, D. (2013). Evaluation of the Homebase Community Prevention Program: Final Report. Abt Associates / NYC DHS."
    },
    {
      "label": "Journal of Housing Economics — analisi quasi-sperimentale territoriale del medesimo programma, distinta dall'RCT",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4770906/",
      "citation": "Goodman, S., Messeri, P. & O'Flaherty, B. (2016). Homelessness prevention in New York City: On average, it works. Journal of Housing Economics, 31, 14–34.",
      "doi": "10.1016/j.jhe.2015.12.001"
    }
  ],
  "lastVerifiedAt": "2026-11-07",
  "transferabilityItaly": "Alta per il meccanismo di prevenzione precoce, sportello integrato e case management sociale; richiede adattamento a competenze, prestazioni e procedure degli Ambiti Territoriali Sociali italiani. Non trasferibili i costi del sistema di rifugi newyorkese né l'assegnazione casuale di sostegni cui una famiglia abbia diritto.",
  "lameziaAdaptation": "Nell'Ambito Territoriale Sociale di Lamezia collegare l'Avviso 'Una Casa per Tutti' 2026–2027 (contributi al canone di locazione), gli sportelli sociali e gli strumenti per la prevenzione della morosità: istituire triage tempestivo su situazioni a rischio di sfratto; offrire un referente unico per orientamento a misure disponibili, mediazione locativa legittima, supporto documentale e raccordo con servizi territoriali. Monitorare esito delle domande, tempi di presa in carico, mantenimento dell'alloggio a 6/12 mesi, sfratti eseguiti laddove dato disponibile legalmente e costi; proteggere i dati dei nuclei vulnerabili. Non alterare graduatorie o diritti legalmente stabiliti.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "mappa delle misure abitative e responsabilità Comune/ATS/Regione",
    "personale di case management e accordi con terzo settore e servizi legali",
    "processo formalizzato di triage e consenso/informativa appropriata dove pertinente",
    "dati aggregati delle domande e pagamenti di 'Una Casa per Tutti'",
    "indicatori privacy-safe di rischio abitativo e permanenza nell'alloggio a 6 e 12 mesi",
    "valutazione di fattibilità giuridica per disegno progressivo di ampliamento dei servizi"
  ],
  "tags": [
    "New York City",
    "Homebase",
    "homelessness prevention",
    "prevenzione sfratti",
    "housing",
    "case management",
    "welfare",
    "RCT",
    "intention-to-treat",
    "servizi di prossimità",
    "morosità incolpevole",
    "Lamezia Terme",
    "Una Casa per Tutti",
    "prevenzione abitativa"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-07",
      "note": "Primo censimento, verifica diretta del rapporto sperimentale Abt/NYC DHS (tabella outcome e analisi costi), del policy brief municipale e della valutazione territoriale peer-reviewed. Distinti outcome ITT primari/esplorativi, test unilaterali al 90%, costo modellizzato e rischi di trasferibilità."
    }
  ]
}
];
