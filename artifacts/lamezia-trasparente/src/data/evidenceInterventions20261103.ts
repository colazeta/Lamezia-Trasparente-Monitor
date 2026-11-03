import type { EvidenceIntervention } from "./evidenceInterventions";

/** Verified municipal interventions; sources checked 2026-11-03. Trial effects are not forecasts for Lamezia. */
export const EVIDENCE_INTERVENTIONS_2026_11_03: readonly EvidenceIntervention[] = [
  {
    "id": "surrey-uk-food-waste-refuse-bin-sticker-cluster-rct-2015",
    "title": "Surrey: promemoria visivi sui contenitori dell'indifferenziato per aumentare la raccolta separata degli scarti alimentari",
    "authority": "Due autorità locali del Sud-Est inglese non nominate nell'abstract; collaborazione con Surrey County Council / Surrey Waste Partnership",
    "territory": "Surrey e Sud-Est dell'Inghilterra (due autorità locali; distretti del trial non identificati in modo verificabile)",
    "country": "Regno Unito",
    "implementationYear": "2015 (trial; documentata campagna più ampia della Surrey Waste Partnership nel 2015–2016)",
    "problem": "Parte delle famiglie dispone del servizio per i rifiuti alimentari ma continua a collocarli nei contenitori dell'indifferenziato; scarsa salienza delle istruzioni nei momenti concreti di conferimento.",
    "measure": "Adesivi visibili di promemoria sul coperchio dei contenitori dell'indifferenziato presso le aree trattate, mantenendo invariato il servizio ordinario di raccolta. Separatamente, la partnership ha successivamente attuato una campagna più ampia con adesivi, volantini e sacchetti per i contenitori dell'organico.",
    "mechanism": "Un segnale semplice e situato nel punto in cui si compie la scelta di conferimento richiama la separazione dei rifiuti alimentari, senza introdurre sanzioni, incentivi o nuove infrastrutture.",
    "population": "64.284 famiglie in 55 aree locali: 33.716 famiglie in 29 aree trattate e 30.568 in 26 aree di controllo; solo utenze servite da raccolta differenziata dell'organico.",
    "primaryArea": "rifiuti_pulizia_urbana",
    "secondaryAreas": [
      "ambiente_clima_energia",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "nudging_comunicazione",
      "informazione_trasparenza",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "adesivi 'No food waste please' sui contenitori del secco",
      "peso per area del rifiuto alimentare differenziato",
      "randomizzazione per gruppi territoriali",
      "monitoraggio pre e post"
    ],
    "territorialScale": "Aree di raccolta all'interno di due amministrazioni locali; successivo rollout di partnership su scala di contea non valutato con identico esperimento.",
    "interventionStatus": "Trial completato; una campagna associata della Surrey Waste Partnership è documentata nel 2015–2016. Non si presume che il trattamento sperimentale sia ancora attivo nel 2026.",
    "evaluationMethod": "Randomised controlled field trial a gruppi territoriali, con 55 aree ripartite tra trattamento e controllo; baseline fino a 15 settimane e osservazione 16 settimane dopo l'applicazione degli adesivi; outcome oggettivo di pesatura della raccolta organica.",
    "comparator": "26 aree di controllo, circa 30.568 famiglie, con gestione e comunicazione ordinarie; confronto della variazione della raccolta separata misurata nel medesimo periodo.",
    "outcomes": [
      "peso raccolto separatamente di rifiuti alimentari (aggregato per area)",
      "persistenza del cambiamento nella finestra osservata"
    ],
    "results": "La raccolta separata di scarti alimentari nelle aree trattate cresce significativamente dopo gli adesivi mentre nelle aree di controllo resta sostanzialmente invariata. Gli autori riportano persistenza del comportamento nel successivo periodo osservato, senza consentire da questi dati una stima di effetti a molti anni. La successiva campagna di contea combina più strumenti e non equivale al trial sugli adesivi isolati.",
    "effectSize": "+20,74% di peso di scarti alimentari separatamente raccolti nel gruppo trattato rispetto al proprio periodo baseline; nel controllo variazione media prossima a zero. È una variazione relativa, non +20,74 punti percentuali di 'tasso di riciclo' né riduzione del 20,74% dei rifiuti prodotti.",
    "evidenceStrength": "forte",
    "costsRequirements": "Costo indicativo stimato dagli autori di circa £0,35 per famiglia per l'intervento con adesivo (contesto 2015); richiede continuità del servizio organico, anagrafe di zone e passaggi di raccolta, installazione e pesatura affidabile per giro. Non è disponibile un conto economico netto italiano.",
    "limitations": [
      "Le due autorità locali dell'esperimento non sono identificate nominalmente nell'abstract dello studio; il ruolo di Surrey County Council risulta dall'affiliazione degli autori, non prova da sola la titolarità di ogni giro di raccolta.",
      "Randomizzazione per aree: differenze nei flussi dei contenitori, composizione familiare e caratteristiche dei giri possono influire sulla trasferibilità.",
      "Non è documentato un outcome diretto di riduzione della quantità totale di spreco alimentare, né una misura univoca della contaminazione e del beneficio climatico.",
      "La campagna Surrey Waste Partnership 2015–2016 comprendeva adesivi, volantini e sacchetti: il suo incremento aggregato osservazionale non è una seconda stima causale attribuibile al solo adesivo.",
      "Non è verificato che l'incremento persista per anni dopo l'esperimento o che i costi pubblici netti siano inferiori ai risparmi."
    ],
    "unintendedEffects": "Possibile aumento della raccolta dell'organico senza riduzione dello spreco alimentare; messaggi poco chiari possono generare conferimenti non conformi e aumentare la contaminazione. Questi rischi non risultano quantificati in modo causale dal trial.",
    "primarySource": {
      "label": "Keep Britain Tidy — testimonianza alla House of Commons sulla campagna Surrey Waste Partnership",
      "url": "https://committees.parliament.uk/writtenevidence/71255/html/"
    },
    "evaluationStudies": [
      {
        "label": "Waste Management / PubMed — valutazione randomizzata",
        "url": "https://pubmed.ncbi.nlm.nih.gov/27697423/",
        "citation": "Shearer, L., Gatersleben, B., Morse, S., Smyth, M., & Hunt, S. (2017). A problem unstuck? Evaluating the effectiveness of sticker prompts for encouraging household food waste recycling behaviour. Waste Management, 60, 164–172.",
        "doi": "10.1016/j.wasman.2016.09.036"
      }
    ],
    "lastVerifiedAt": "2026-11-03",
    "transferabilityItaly": "Buona per i comuni con raccolta organica operativa e tracciabilità dei pesi per zona; la replica richiede prima un controllo delle regole locali di conferimento e del contratto di servizio. Si trasferisce il meccanismo informativo, non l'effetto numerico osservato nel Surrey.",
    "lameziaAdaptation": "Con Lamezia Multiservizi selezionare giri di raccolta comparabili; misurare per 10–12 settimane gli kg di organico separato e gli scarti nell'indifferenziato; assegnare a caso per giro l'adesivo sul contenitore del residuo con istruzioni coerenti al calendario locale; osservare altre 12–16 settimane e confrontare differenza dei pesi per utenza, purezza della frazione e costi. Evitare messaggi ai condomini non serviti allo stesso modo.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "calendario e perimetro dei giri serviti da Lamezia Multiservizi",
      "pesi per frazione e giro con identificativo stabile",
      "numero di utenze servite per giro",
      "protocollo di cluster randomisation e monitoraggio qualità del conferito",
      "stima costi di installazione e comunicazione"
    ],
    "tags": [
      "rifiuti",
      "organico",
      "raccolta differenziata",
      "adesivi",
      "nudge",
      "cluster RCT",
      "Surrey",
      "Regno Unito"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-03",
        "note": "Inserimento iniziale dopo lettura dello studio peer-reviewed e della testimonianza parlamentare; distinta campagna multipla dal trial causale."
      }
    ]
  },
  {
    "id": "sao-paulo-iptu-arrears-consequences-letter-rct-2019",
    "title": "São Paulo: lettere che chiariscono le conseguenze legali della morosità migliorano la regolarizzazione dell'IPTU",
    "authority": "Prefeitura do Município de São Paulo — (011).lab e Secretaria Municipal da Fazenda",
    "territory": "São Paulo, Stato di São Paulo",
    "country": "Brasile",
    "implementationYear": "2019 (relazione municipale sul progetto; working paper valutativo 2020)",
    "problem": "Elevata incidenza di rate non pagate dell'imposta immobiliare urbana IPTU e scarsa efficacia delle comunicazioni tradizionali inviate ai debitori prima delle procedure amministrative.",
    "measure": "Sperimentazione su avvisi autentici di pagamento di cinque testi alternativi comportamentali rispetto alla comunicazione ordinaria. Il trattamento più efficace illustra in modo chiaro le conseguenze giuridiche già applicabili alla mancata regolarizzazione entro 30 giorni, senza introdurre nuovi poteri sanzionatori.",
    "mechanism": "Rendere saliente e comprensibile la conseguenza legale concreta e la scadenza del pagamento può ridurre inerzia, incertezza e sottovalutazione delle conseguenze della morosità.",
    "population": "15.178 osservazioni di contribuenti/rate di IPTU in arretrato assegnate a sei gruppi (cinque lettere alternative e controllo ordinario); campione locale di contribuenti già destinatari di notifica di recupero.",
    "primaryArea": "fiscalita_entrate_riscossione",
    "secondaryAreas": [
      "capacita_amministrativa_personale",
      "digitalizzazione_servizi_online"
    ],
    "interventionTypes": [
      "nudging_comunicazione",
      "informazione_trasparenza",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "lettere di pagamento IPTU riscritte",
      "test con cinque bracci sperimentali e controllo",
      "registrazioni amministrative di regolarizzazione a 30 giorni",
      "test statistici con correzioni per confronti multipli"
    ],
    "territorialScale": "Municipio metropolitano; avvisi individuali a contribuenti morosi di una specifica entrata locale.",
    "interventionStatus": "Esperimento realizzato e documentato dal laboratorio municipale nel 2019 e valutato nel working paper 2020; non è verificato il mantenimento del medesimo modello di lettera nel 2026.",
    "evaluationMethod": "Randomized controlled trial individuale a sei bracci, cinque avvisi riscritti vs lettera originale; analisi intention-to-treat della regolarizzazione entro 30 giorni. Correzioni per confronti multipli Bonferroni/Holm/Benjamini-Hochberg; standard errors raggruppati per identificativo del contribuente nello studio.",
    "comparator": "Gruppo di contribuenti in arretrato assegnati casualmente alla lettera ordinaria dello stesso procedimento tributario, con 48,46% di regolarizzazione entro 30 giorni.",
    "outcomes": [
      "quota di posizioni regolarizzate entro 30 giorni",
      "ammontare delle riscossioni associato all'esperimento, soggetto a metodologie di attribuzione",
      "differenze per persona fisica/giuridica"
    ],
    "results": "La 'Consequences Letter' raggiunge una regolarizzazione del 52,53% contro 48,46% per la lettera ordinaria. È l'unico trattamento significativo anche dopo la correzione Bonferroni riportata dagli autori (p unilaterale corretto 0,011). Le altre varianti non mostrano risultati tutti robusti ai confronti multipli. Una parte del risultato potrebbe riflettere squilibri iniziali nella quota di persone fisiche rispetto alle persone giuridiche fra i gruppi, come ammesso dallo studio.",
    "effectSize": "+4,07 punti percentuali, pari a +8,4% relativo della quota di posizioni regolarizzate a 30 giorni (52,53% vs 48,46%). Gli autori stimano circa R$ 950.000 di riscossione aggiuntiva associata all'esperimento; R$ 60 milioni di possibile extrapolazione annuale non sono gettito effettivamente realizzato.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Richiede basi amministrative di crediti e stato dei pagamenti, verifica legale di testi/scadenze, tracciatura di consegna e assegnazione, analisi statistica e gestione reclami. Il paper fornisce stime di costi/ricavi del pilot non una revisione contabile indipendente; i costi brasiliani non sono trasferibili automaticamente.",
    "limitations": [
      "Working paper del 2020 e relazione comunale del 2019, senza verifica di pubblicazione peer-reviewed; necessaria prudenza sulla replicabilità.",
      "Gli autori rilevano uno squilibrio fra contribuenti persone fisiche e giuridiche: l'effetto della lettera sulle conseguenze può essere parzialmente associato a questa differenza.",
      "P-value Bonferroni riportato è unilaterale (0,011); la soglia e la strategia di test vanno esplicitate.",
      "L'outcome è regolarizzazione entro 30 giorni, non riduzione stabile della morosità o miglioramento della sostenibilità finanziaria a lungo termine.",
      "Il richiamo al registro brasiliano CADIN riguarda un istituto locale specifico: non è replicabile in Italia né giustifica minacce non previste dalla legge.",
      "La previsione di R$ 60 milioni è proiezione derivata dal pilot, non incasso consuntivo."
    ],
    "unintendedEffects": "Possibile aumento dell'ansia finanziaria di persone vulnerabili se i testi enfatizzano conseguenze senza informazioni su rettifiche, rateizzazione e assistenza; necessità di evitare errori sull'importo dovuto o richiami impropri a sanzioni.",
    "primarySource": {
      "label": "Prefeitura de São Paulo / (011).lab — relazione amministrativa 2019, archivio ENAP",
      "url": "https://repositorio.enap.gov.br/items/ac371f3c-4d65-458a-8ca2-d337282f0127/full"
    },
    "evaluationStudies": [
      {
        "label": "FGV EAESP — working paper completo e tabelle sperimentali",
        "url": "https://eaesp.fgv.br/sites/eaesp.fgv.br/files/u519/increasing_tax_compliance_with_behavioral_insights_evidence_from_sao_paulo.pdf",
        "citation": "Pfeifer, F. F., & Pacheco, T. S. (2020). Increasing tax compliance with behavioral insights: evidence from São Paulo. Working paper, São Paulo City Hall (011).lab / FGV EAESP."
      }
    ],
    "lastVerifiedAt": "2026-11-03",
    "transferabilityItaly": "Buona sul piano della chiarezza delle comunicazioni per entrate di competenza comunale (es. TARI e altre posizioni locali), ma ogni contenuto, scadenza, conseguenza giuridica e canale di notifica deve essere validato secondo diritto italiano e competenze dell'ente; non si trasferisce il CADIN brasiliano.",
    "lameziaAdaptation": "Esaminare avvisi reali TARI o altri crediti comunali gestiti direttamente, con l'ufficio tributi e privacy; costruire versione semplificata che descriva soltanto conseguenze previste dalla normativa vigente e indica pagamento, contestazione, rettifica e assistenza. Se giuridicamente ammissibile, sperimentare invio randomizzato fra avvisi ugualmente legittimi senza differenziare termini o diritti; misurare tasso di pagamento a 30/60 giorni, importi incassati, reclami e differenze per condizione di vulnerabilità.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "catalogo degli avvisi e base normativa di ciascun tributo comunale",
      "dataset pseudonimizzato del debito, storico pagamento e comunicazioni",
      "validazione ufficio tributi, RPCT e privacy/DPO per testo e sperimentazione",
      "sistema di misurazione pagamenti entro termini e reclami",
      "monitoraggio dei gruppi vulnerabili"
    ],
    "tags": [
      "fiscalità comunale",
      "IPTU",
      "morosità",
      "nudging",
      "lettere",
      "RCT",
      "São Paulo",
      "riscossione",
      "comunicazioni legali"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-03",
        "note": "Nuovo caso dopo verifica relazione originale del Comune 2019 e working paper 2020; preservate incertezze sugli squilibri tra gruppi e sulle extrapolazioni di gettito."
      }
    ]
  }
];
