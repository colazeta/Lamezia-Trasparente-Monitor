import type { EvidenceIntervention } from "./evidenceInterventions";

/** AWED: Yogyakarta city Wolbachia dengue cluster RCT, verified 2026-11-16 against original study and implementing sources. */
export const EVIDENCE_INTERVENTIONS_2026_11_16_YOGYAKARTA_WOLBACHIA: readonly EvidenceIntervention[] = [
  {
    "id": "yogyakarta-awed-wolbachia-aedes-dengue-cluster-rct-2017",
    "title": "Yogyakarta: rilascio territoriale di Aedes aegypti con Wolbachia per prevenire la dengue",
    "authority": "World Mosquito Program e Universitas Gadjah Mada, con autorità sanitarie e amministrazioni locali di Yogyakarta; autorizzazione del Governo provinciale",
    "territory": "Città di Yogyakarta e porzione limitrofa del distretto di Bantul, Regione speciale di Yogyakarta",
    "country": "Indonesia",
    "implementationYear": "Prime sperimentazioni locali dal 2014; trial AWED con assegnazione nel 2016 e rilasci nel 2017; osservazione clinica gennaio 2018–marzo 2020",
    "problem": "Alta incidenza di dengue nelle comunità urbane, nonostante le ordinarie misure di controllo delle zanzare; necessità di prevenzione territoriale della trasmissione con esiti clinici verificabili.",
    "measure": "Rilascio controllato e scaglionato, in 12 cluster urbani randomizzati, di zanzare della specie Aedes aegypti portatrici della variante wMel del batterio Wolbachia, con coinvolgimento comunitario e monitoraggio entomologico. I 12 cluster di controllo hanno continuato le consuete attività anti-zanzare, senza questi rilasci durante il trial.",
    "mechanism": "La presenza stabilizzata di Wolbachia nelle popolazioni locali di Aedes aegypti riduce la capacità del vettore di trasmettere il virus dengue. La persistenza batterica è favorita dalla trasmissione materna nelle zanzare; il meccanismo è di blocco della trasmissione, non di eliminazione della popolazione di zanzare o somministrazione di vaccini agli esseri umani.",
    "population": "Residenti di un'area sperimentale di circa 26 km² (circa 312.000 persone secondo il programma); 8.144 pazienti con febbre arruolati presso 18 ambulatori pubblici, dei quali 6.306 nel campione analitico primario test-positive/test-negative, età 3–45 anni.",
    "primaryArea": "salute_pubblica_locale",
    "secondaryAreas": [
      "ambiente_clima_energia",
      "partecipazione_democrazia_locale",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "servizio_diretto",
      "partnership_pubblico_privato_terzo_settore",
      "partecipazione_codesign",
      "targeting_data_analytics",
      "formazione_capacity_building"
    ],
    "tools": [
      "rilasci programmati di Aedes aegypti con Wolbachia wMel",
      "24 cluster geografici con randomizzazione pubblica vincolata",
      "monitoraggio della prevalenza di Wolbachia nelle popolazioni di zanzare",
      "18 centri di cure primarie e diagnostica virologica",
      "comitati locali, consenso comunitario e comunicazione capillare",
      "confronto sperimentale con usual care"
    ],
    "territorialScale": "24 cluster urbani, circa 26 km², con sperimentazione di sanità pubblica sul territorio cittadino e in una limitata zona adiacente.",
    "interventionStatus": "Trial completato nel 2020, risultati peer-reviewed pubblicati nel 2021. Successive estensioni documentate a Yogyakarta, Sleman e Bantul; lo stato dei singoli siti di monitoraggio e la copertura più recente richiedono verifica locale aggiornata, senza assumere che la randomizzazione continui nei programmi estesi.",
    "evaluationMethod": "Cluster-randomised controlled trial AWED (12 cluster trattati e 12 controllo), randomizzazione vincolata, analisi intention-to-treat con disegno test-negative tra pazienti febbrili 3–45 anni sottoposti a test virologico, con inferenza basata su permutazioni vincolate. Studio originale Utarini et al. (2021), New England Journal of Medicine, doi 10.1056/NEJMoa2030243; il trial non era mascherato e non disponeva di placebo per i cluster di controllo.",
    "comparator": "12 cluster assegnati a usual care, cioè misure ordinarie locali di controllo delle zanzare senza rilascio di Aedes aegypti con Wolbachia durante la sperimentazione; confronto con 12 cluster trattati nello stesso periodo.",
    "outcomes": [
      "dengue sintomatica confermata virologicamente tra i pazienti febbrili arruolati (VCD)",
      "ricovero ospedaliero per dengue confermata tra i partecipanti",
      "prevalenza di Wolbachia nelle popolazioni del vettore",
      "efficacia verso i quattro sierotipi di dengue"
    ],
    "results": "Nel campione primario test-negative, dengue confermata in 67/2.905 soggetti analizzati dei cluster trattati (2,3%) contro 318/3.401 dei controlli (9,4%). Odds ratio aggregato 0,23 (IC 95% 0,15–0,35; p=0,004), corrispondente a efficacia protettiva stimata 77,1% (IC 95% 65,3–84,9). Ricoveri per dengue confermata: 13/2.905 (0,4%) contro 102/3.401 (3,0%), efficacia stimata 86,2% (IC 95% 66,2–94,3). Percentuali fra partecipanti selezionati febbrili, NON incidenze dirette sull'intera popolazione cittadina. I risultati si riferiscono alla dengue, non al West Nile.",
    "effectSize": "Riduzione relativa stimata dei casi sintomatici di dengue confermata: 77,1% (IC 95% 65,3–84,9); efficacia protettiva per ricoveri dengue: 86,2% (IC 95% 66,2–94,3). Numeratori/denominatori nel campione primario: 67/2.905 vs 318/3.401 (dengue); 13/2.905 vs 102/3.401 (ricoveri). Non si tratta di -77 punti percentuali nella popolazione.",
    "evidenceStrength": "forte",
    "costsRequirements": "Programma a elevata complessità tecnico-regolatoria: allevamento/produzione delle zanzare, autorizzazioni ambientali e sanitarie, consenso comunitario, sorveglianza entomologica e clinica, personale specializzato e monitoraggio pluriennale. Non verificato un costo consuntivo integrale del trial; un distinto studio di modellizzazione (BMC Medicine, 2020) ipotizza circa 5,8 milioni USD 2018 su dieci anni per un programma accelerato a Yogyakarta, non costo osservato né preventivo per l'Italia.",
    "limitations": [
      "Effetto identificato su dengue trasmessa da Aedes aegypti in un contesto tropicale endemico, non su West Nile trasmesso principalmente da Culex pipiens, né automaticamente su Aedes albopictus prevalente in Italia.",
      "Campione clinico di pazienti febbrili 3–45 anni, arruolati in ambulatori pubblici; percentuali fra soggetti testati non misurano direttamente il rischio cumulativo dell'intera popolazione.",
      "Randomizzazione di 24 cluster in una sola area geografica; controlli senza placebo, potenziali movimenti tra cluster e contaminazione entomologica delle zone di controllo.",
      "Arruolamento clinico interrotto nel marzo 2020 a causa di COVID-19; non fornisce evidenza sperimentale diretta sulla persistenza degli effetti per un decennio.",
      "Benefici su altre arbovirosi o su vettori diversi dalla specie Aedes aegypti non sono dimostrati dal trial AWED.",
      "Per un comune italiano rilascio di zanzare e monitoraggio sanitario richiedono competenze e autorizzazioni specialistiche di Regione, ASP e istituzioni nazionali; non è un'azione comunale ordinaria immediatamente replicabile."
    ],
    "unintendedEffects": "Non sono disponibili dal trial stime causali complete di eventuali effetti ecologici indesiderati, accettabilità a lungo termine o effetti su altre specie. Una modesta contaminazione da Wolbachia nelle aree controllo è segnalata dagli autori. L'eventuale introduzione di popolazioni di zanzare o modifiche entomologiche non può essere proposta per Lamezia senza specifica valutazione tecnico-scientifica, ambientale e autorizzativa.",
    "primarySource": {
      "label": "World Mosquito Program — Yogyakarta: intervento effettivamente realizzato e collaborazione con governo locale",
      "url": "https://www.worldmosquitoprogram.org/en/global-progress/indonesia/yogyakarta-city"
    },
    "evaluationStudies": [
      {
        "label": "Utarini et al. (2021), New England Journal of Medicine — RCT originale",
        "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa2030243",
        "citation": "Utarini, A. et al. (2021). Efficacy of Wolbachia-Infected Mosquito Deployments for the Control of Dengue. New England Journal of Medicine 384:2177–2186.",
        "doi": "10.1056/NEJMoa2030243"
      },
      {
        "label": "World Mosquito Program — protocollo divulgativo e risultati RCT AWED",
        "url": "https://www.worldmosquitoprogram.org/en/randomised-control-trial-rct",
        "citation": "World Mosquito Program, Applying Wolbachia to Eliminate Dengue: protocollo territoriale, collaborazione con governi e comunità, risultati e limiti."
      },
      {
        "label": "Turner et al. / BMC Medicine (2020) — modello costi di scala, non consuntivo trial",
        "url": "https://link.springer.com/article/10.1186/s12916-020-01638-2",
        "citation": "The cost-effectiveness of controlling dengue in Indonesia using wMel Wolbachia released at scale: a modelling study. BMC Medicine (2020).",
        "doi": "10.1186/s12916-020-01638-2"
      },
      {
        "label": "ECDC — differenze epidemiologiche fra Aedes e Culex e controllo vettoriale in Europa",
        "url": "https://www.ecdc.europa.eu/en/news-events/new-ecdc-weekly-reports-and-guidance-tackle-mosquito-borne-diseases-across-europe",
        "citation": "European Centre for Disease Prevention and Control (2025), guidance on mosquito-borne disease surveillance and vector-specific control."
      },
      {
        "label": "Comune di Lamezia Terme — misure straordinarie contro West Nile 7–8 ottobre 2026",
        "url": "https://www.comune.lamezia-terme.cz.it/it/news/virus-west-nile-intervento-straordinario-disinfestazione-07-e-08-ottobre-2026",
        "citation": "Comune di Lamezia Terme (6 ottobre 2026), avviso su intervento di disinfestazione richiesto dall'ASP; contesto locale, NON prova di efficacia Wolbachia per West Nile."
      }
    ],
    "lastVerifiedAt": "2026-11-16",
    "transferabilityItaly": "La strategia sperimentale specifica su Aedes aegypti non è direttamente trasferibile a Lamezia: vettori, incidenza della dengue, autorizzazioni, attività dell'ASP e condizioni climatiche sono diverse. È trasferibile il modello di pianificazione e valutazione della prevenzione: sorveglianza entomologica, consenso e coinvolgimento territoriale, selezione dei siti, raccolta standardizzata dei risultati e collaborazione tra autorità sanitarie e locali. Non proporre rilasci biologici sulla base del solo trial indonesiano.",
    "lameziaAdaptation": "Lamezia ha pubblicato il 27 agosto 2026 indicazioni di prevenzione West Nile e ha disposto, su richiesta dell'ASP, disinfestazione adulticida/larvicida per Nicastro, Sambiase e Sant'Eufemia il 7–8 ottobre. Concordare con ASP Catanzaro e Regione Calabria una ricognizione dei vettori localmente presenti, degli interventi e dei dati entomologici; valutare la qualità della prevenzione di ristagni, la copertura della comunicazione e i risultati per zone nel rispetto delle competenze. Eventuali programmi sperimentali su Wolbachia devono restare in valutazione scientifica separata, solo per vettori/virus pertinenti, con autorizzazioni sanitarie e ambientali; non presentare la riduzione del 77% come attesa per Lamezia o per West Nile.",
    "implementability": "strutturale",
    "capacityDataNeeds": [
      "coordinamento tecnico con ASP Catanzaro, Dipartimento salute della Regione Calabria e istituti di ricerca entomologica",
      "dati georeferenziati aggregati su specie di zanzare, siti di riproduzione, controlli effettuati e rilevazioni stagionali",
      "censimento dei trattamenti ordinari e straordinari, date, sostanze autorizzate, costi e copertura territoriale",
      "protocollo di comunicazione e feedback pubblico per rimozione ristagni e protezione individuale",
      "confronto sperimentale o quasi-sperimentale con indicatori predefiniti senza sottrarre misure dovute",
      "eventuale valutazione regolatoria, ambientale e bioetica separata prima di ipotizzare rilasci di vettori"
    ],
    "tags": [
      "Yogyakarta",
      "Indonesia",
      "AWED",
      "Wolbachia",
      "Aedes aegypti",
      "dengue",
      "cluster RCT",
      "prevenzione vettoriale",
      "salute pubblica",
      "sorveglianza entomologica",
      "partnership",
      "partecipazione civica",
      "trasferibilità limitata",
      "Lamezia Terme",
      "West Nile distinto",
      "ECDC"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-16",
        "note": "Prima verifica con Parallel Search, controllo diretto NEJM DOI 10.1056/NEJMoa2030243, documentazione World Mosquito Program, ECDC e comunicazioni ufficiali di Lamezia. Deduplicazione contro archivio e PR GitHub. Distinzione esplicita fra effetto dengue/Aedes aegypti e West Nile/Culex e fra outcome sperimentali e costi modellati."
      }
    ]
  }
];
