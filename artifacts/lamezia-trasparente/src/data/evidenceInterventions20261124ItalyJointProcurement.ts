import type { EvidenceIntervention } from "./evidenceInterventions";

/** Joint public works procurement, original study verified 2026-11-24. */
export const EVIDENCE_INTERVENTIONS_2026_11_24_ITALY_JOINT_PROCUREMENT: readonly EvidenceIntervention[] = [
  {
    "id": "italy-municipal-unions-joint-public-works-procurement-2012-2020",
    "title": "Italia: gestione associata degli appalti di lavori pubblici tramite Unioni di Comuni",
    "authority": "Unioni di Comuni italiane operanti come stazioni appaltanti e Comuni aderenti; esempio istituzionale: Nuovo Circondario Imolese",
    "territory": "Italia, più regioni; contratti di Unioni concentrati soprattutto in Toscana, Emilia-Romagna e Piemonte",
    "country": "Italia",
    "implementationYear": "Adozione progressiva, contratti pubblicati 2012–2020 e conclusi entro aprile 2021; non una riforma simultanea",
    "problem": "Capacità specialistiche frammentate e ritardi nell'esecuzione dei lavori pubblici; il solo ribasso di gara non misura il valore effettivo dell'appalto.",
    "measure": "Affidamento di contratti di lavori pubblici tramite Unioni di Comuni anziché gestione individuale. Le strutture associate possono concentrare competenze, standardizzare documenti e coordinare procedure. Il trattamento empirico è l'identità della stazione appaltante, non la mera adesione all'Unione.",
    "mechanism": "Condivisione di personale, esperienza, procedure e conoscenze specialistiche; possibile miglioramento del coordinamento e della selezione contrattuale. I canali non sono isolati causalmente.",
    "population": "50.905 contratti di lavori pubblici con base d'asta superiore a 40.000 EUR: 1.315 aggiudicati da Unioni e 49.590 da Comuni; 11.778 di questi ultimi da Comuni membri di Unioni.",
    "primaryArea": "procurement_spesa_pubblica",
    "secondaryAreas": [
      "capacita_amministrativa_personale",
      "trasparenza_integrita_anticorruzione"
    ],
    "interventionTypes": [
      "modifica_organizzativa_processo",
      "procurement_contract_design",
      "formazione_capacity_building"
    ],
    "tools": [
      "stazione appaltante associata",
      "standardizzazione atti e procedure",
      "personale specializzato e formazione",
      "dati ANAC sui contratti, date e importi"
    ],
    "territorialScale": "Intercomunale; valutazione multicentrica nazionale a livello di contratto, non stima per una singola Unione.",
    "interventionStatus": "Misura effettivamente adottata nel periodo analizzato. La pagina istituzionale del Nuovo Circondario Imolese aggiornata 28 gennaio 2026 documenta una centrale associata; non attesta che la stessa stima valga per Imola o per tutte le Unioni.",
    "evaluationMethod": "Studio peer-reviewed 2024, effetti fissi per Comune, anno di aggiudicazione e categoria di lavoro, controlli contrattuali e socioeconomici; due matching alternativi (coarsened exact matching, CEM, e nearest-neighbour Mahalanobis). Tabella 7: 3.253 e 12.949 osservazioni rispettivamente, errori standard cluster per categoria di lavoro. Disegno osservazionale comparativo aggiustato, non RCT né variazione esogena.",
    "comparator": "Contratti aggiudicati individualmente da Comuni appartenenti a Unioni nei campioni matched; specificazioni baseline includono anche altri Comuni.",
    "outcomes": [
      "ritardo normalizzato = 100 × (durata effettiva − durata contrattuale) / durata contrattuale",
      "ribasso di aggiudicazione rispetto alla base d'asta",
      "extra costo finale rispetto all'importo di aggiudicazione"
    ],
    "results": "Tabella 7 della versione editoriale: ritardo normalizzato inferiore per le Unioni in entrambi i campioni matched: CEM −54,64 punti dell'indicatore (SE 25,78; p<0,05), Mahalanobis −38,86 (SE 13,55; p<0,01). Ribassi ed extra costi non significativamente differenti nei due campioni matched. La Tabella 3 baseline restituisce coefficienti sul ritardo da −16,92 a −30,80 a seconda della specificazione, con significatività al 10% o al 5%. Il confronto descrittivo non aggiustato fra Unioni e Comuni membri non è significativo sul ritardo. Nessun risparmio complessivo dimostrato.",
    "effectSize": "Tabella 7: −54,64 e −38,86 punti percentuali del ritardo espresso in rapporto alla durata contrattuale (non riduzione percentuale della durata totale, non giorni e non riduzione della criminalità). Per esempio, 100 giorni contrattuali corrispondono aritmeticamente a 54,64 o 38,86 giorni di minore scostamento stimato, non a una previsione per un singolo appalto. Ribasso: −1,97 e −0,58; extra costo: −3,47 e +0,28 punti, tutti non significativi nei matched.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Nessun costo netto della struttura associata identificato dallo studio. Richiede personale, accordi tra enti, riparto delle responsabilità, interoperabilità, tracciabilità delle fasi e verifica della qualificazione ai sensi del quadro vigente.",
    "limitations": [
      "Assenza di assegnazione esogena: matching ed effetti fissi non rimuovono confondenti non osservati variabili nel tempo.",
      "Solo lavori con dati disponibili, pubblicati 2012–2020 e completati entro aprile 2021; rischio di selezione dei contratti conclusi, non rappresentativo dei lavori ancora aperti.",
      "Tabella 1: Calabria ha 1.022 contratti comunali e nessuno aggiudicato da Unioni nel campione; non stima regionale calabrese.",
      "I risultati non si estendono automaticamente a servizi e forniture, grandi opere o stazioni appaltanti provinciali/metropolitane.",
      "L'indicatore usa la durata contrattuale come denominatore: non dimostra durata complessiva più breve dalla progettazione al collaudo, né qualità finale, risparmio o riduzione di illeciti."
    ],
    "unintendedEffects": "Nei modelli baseline emergono in alcune specificazioni ribassi minori; non confermati significativamente nei matched. Possibili duplicazioni organizzative, costi di coordinamento e minore reattività sono rischi da monitorare, non effetti dimostrati. Non confondere velocità di consegna con qualità o legalità.",
    "primarySource": {
      "label": "Nuovo Circondario Imolese — Centrale unica di committenza, servizio associato (aggiornamento 28/01/2026; esempio di attuazione)",
      "url": "https://www.nuovocircondarioimolese.it/amministrazione/uffici/centrale-unica-di-committenza"
    },
    "evaluationStudies": [
      {
        "label": "Regional Studies — Arachi et al. (2024), versione editoriale integrale in IRIS Sapienza",
        "url": "https://iris.uniroma1.it/handle/11573/1714905",
        "doi": "10.1080/00343404.2024.2350615",
        "citation": "Arachi, G., Assisi, D., Cesi, B., Giuranno, M. G., & Russo, F. (2024). Intermunicipal cooperation in public procurement. Regional Studies, 58(11), 2055–2073. Tabelle 1–3, 7."
      },
      {
        "label": "CEIS Tor Vergata — working paper 548 (2022), versione precedente dello stesso studio",
        "url": "https://ceistorvergata.it/RePEc/rpaper/RP548.pdf",
        "citation": "Arachi et al. (2022). Inter-municipal Cooperation in Public Procurement. CEIS Research Paper 548. Non indipendente dalla versione finale; le stime pubblicate nel 2024 prevalgono."
      }
    ],
    "lastVerifiedAt": "2026-11-24",
    "transferabilityItaly": "Alta pertinenza istituzionale, ma trasferibilità empirica condizionata a dimensione, tipo di appalto, qualificazione e capacità. Distinguere le Unioni dalle altre forme di aggregazione e non presumere risparmi.",
    "lameziaAdaptation": "Lamezia ha già un Ufficio Gare e Appalti (https://www.comune.lamezia-terme.cz.it/it/unita_organizzative/ufficio-gare-a-appalti) e ha utilizzato la SUAM di Reggio Calabria per una gara PNRR (GU 06/05/2024, CIG 9837748E75: https://www.gazzettaufficiale.it/eli/id/2024/05/06/TX24BGA2523/s5). Non equiparare SUAM e Unione né presumere effetti locali. Confrontare, dopo verifica di competenze e qualificazione attuali, appalti comunali e appalti affidati ad altri soggetti qualificati, per tipologia, importo e complessità; misurare tempi contrattuali/effettivi, varianti, sospensioni, costo finale, qualità e oneri di coordinamento. Valutare condivisione selettiva di competenze solo se emerge un bisogno documentato.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "CIG/CUP e stazione appaltante, RUP e responsabilità di esecuzione",
      "date pubblicazione, aggiudicazione, consegna, termine contrattuale originario e aggiornato, ultimazione e collaudo",
      "importi a base d'asta, aggiudicazione e consuntivo; varianti e sospensioni",
      "tipologia, valore, complessità e fonte di finanziamento",
      "copertura dei dati, contratti aperti e censura temporale",
      "costi della gestione associata e indicatori di qualità; verifica delle competenze e qualificazione vigenti"
    ],
    "tags": [
      "Italia",
      "Unioni di Comuni",
      "appalti",
      "lavori pubblici",
      "ritardi",
      "ANAC",
      "matching",
      "CEM",
      "Mahalanobis",
      "capacità amministrativa"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-24",
        "note": "Discovery Parallel Search; verifica della versione editoriale 2024 su IRIS tramite estrazione diretta del PDF (Tabelle 1, 3, 7), confronto con working paper 2022 e fonti istituzionali Imola e Lamezia/GU. Deduplicazione su 77 moduli importati e ricerca PR: caso distinto dalla gestione associata generale in Emilia-Romagna (Ferraresi 2018) perché trattamento e outcome sono specifici del procurement; nessun equivalente identificato. Esplicitati risultati nulli sui costi e limiti di identificazione e trasferibilità."
      }
    ]
  }
];
