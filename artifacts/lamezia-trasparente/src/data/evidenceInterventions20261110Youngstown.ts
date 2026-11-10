import type { EvidenceIntervention } from "./evidenceInterventions";

/** Youngstown matched DiD (non-randomised treatment), verified on original 2026-11-10. */
export const EVIDENCE_INTERVENTIONS_2026_11_10_YOUNGSTOWN: readonly EvidenceIntervention[] = [
  {
    "id": "youngstown-ohio-lots-of-green-vacant-lot-community-reuse-matched-did-2010",
    "title": "Youngstown: bonifica e riuso comunitario dei terreni vacanti con manutenzione per ridurre degrado e reati di prossimità",
    "authority": "City of Youngstown e Youngstown Neighborhood Development Corporation (YNDC), con associazioni e residenti",
    "territory": "Youngstown, Ohio",
    "country": "Stati Uniti",
    "implementationYear": "Dal 2010 (Lots of Green 1.0); dal 2011 riuso comunitario 2.0; valutazione sui lotti trattati nella prima fase del programma.",
    "problem": "Ampia presenza di lotti abbandonati e degrado urbano, abbandono di rifiuti, costi manutentivi e reati nelle vicinanze; difficoltà a riutilizzare stabilmente aree lasciate vacanti.",
    "measure": "Lots of Green: versione 1.0, ripulitura standardizzata di detriti, livellamento, prato, alberi, recinzione permeabile e manutenzione periodica; versione 2.0, sostegno a proposte di residenti e associazioni per orti, giardini e altri usi collettivi con manutenzione assunta dai proponenti. Attuazione coordinata da YNDC e sostenuta da fondi di sviluppo della comunità.",
    "mechanism": "Ridurre abbandono visibile e opportunità di utilizzo improprio dei lotti, migliorare sorvegliabilità e uso legittimo, incentivare presenza e responsabilizzazione comunitaria. L'effetto empirico è attribuito al pacchetto territoriale, non esclusivamente al prato o agli orti.",
    "population": "Residenti e utilizzatori dei quartieri prossimi ai 244 lotti trattati inclusi nell'analisi (166 stabilizzazione, 77 riuso comunitario riportati nel paper; piccola discrepanza di contabilizzazione tra sottogruppi e totale); 959 lotti non trattati selezionati come controlli.",
    "primaryArea": "urbanistica_rigenerazione",
    "secondaryAreas": [
      "sicurezza_urbana_prevenzione",
      "partecipazione_democrazia_locale",
      "ambiente_clima_energia",
      "rifiuti_pulizia_urbana"
    ],
    "interventionTypes": [
      "infrastruttura_fisica",
      "servizio_diretto",
      "partecipazione_codesign",
      "partnership_pubblico_privato_terzo_settore",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "censimento dei lotti e stato di abbandono",
      "rimozione rifiuti, terreno di copertura, prato, alberi e recinzione semplice",
      "manutenzione periodica e accordi di adozione",
      "microfinanziamenti per orti/giardini promossi da gruppi di residenti",
      "controlli appaiati per settore cittadino, dimensioni e reddito circostante",
      "dati geocodificati di polizia su cinque tipologie di reato"
    ],
    "territorialScale": "Lotto vacante e raggio di vicinato; selezione in quartieri target e riuso comunitario più ampio nella città.",
    "interventionStatus": "Programma attuato in Youngstown a partire dal 2010, con attività e bandi documentati anche nel 2016; continuità puntuale degli stessi siti e costi nel 2026 non verificata.",
    "evaluationMethod": "Studio peer-reviewed quasi-sperimentale: difference-in-differences su pannello spaziale, 244 lotti trattati e 959 controlli vacanti appaiati (fino a 4:1) per area cittadina, superficie e reddito; modelli GLS, Poisson e Spatial Durbin con spillover per 1/8 e 1/4 di miglio. Le aree TRATTATE non sono state randomizzate; la casualità riguarda la selezione di alcuni controlli eleggibili.",
    "comparator": "Lotti vacanti non interessati dal programma nello stesso comune, selezionati e appaiati; confronto della variazione degli eventi di reato registrati prima e dopo l'intervento e trattamento delle correlazioni spaziali.",
    "outcomes": [
      "furti con scasso registrati",
      "aggressioni gravi registrate",
      "rapine e furti registrati",
      "furti d'auto registrati",
      "effetti nelle aree limitrofe"
    ],
    "results": "Lo studio associa il trattamento a una riduzione di alcune classi di reato nelle aree trattate rispetto a lotti appaiati non trattati. La robustezza maggiore nei modelli spaziali riguarda i furti con scasso attorno ai lotti stabilizzati e le aggressioni attorno ai lotti di riuso comunitario; sono osservati spillover favorevoli per alcuni reati nelle aree vicine. Importante effetto avverso: i modelli GLS e Spatial Durbin indicano un aumento dei furti d'auto nei pressi dei lotti trattati. Non essendo RCT, non si può escludere confondimento da selezione dei luoghi e cambiamenti contemporanei.",
    "effectSize": "Per il trattamento aggregato, modello Poisson: incidenza furti con scasso IRR 0,80 (~−20%) e rapine IRR 0,93 (~−7%) rispetto ai controlli, con specificazioni variabili. Modello GLS: −24% (coeff. −0,24) furti con scasso e +53% (coeff. +0,53) furti d'auto; i modelli spaziali confermano segni positivi per furti d'auto ma non tutte le classi di reato mantengono effetti significativi. NON applicare queste stime a ogni quartiere né trattarle come riduzione assoluta cittadina.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Fondi Community Development Block Grants, lavori iniziali di pulizia/riqualificazione, manutenzione regolare (sfalcio ogni circa due settimane nelle stagioni indicate) e accordi con associazioni. Lo studio non consente di stimare un costo affidabile per reato evitato o il bilancio netto municipale.",
    "limitations": [
      "Trattamenti selezionati in aree strategiche, non assegnati casualmente: il matched DiD non garantisce l'eliminazione di trend e selezione residui.",
      "I dati sono eventi di polizia registrati nell'intorno dei lotti, non vittimizzazione totale; possibili cambiamenti nelle denunce o mobilità.",
      "I risultati variano tra modelli GLS, Poisson e Spatial Durbin, non esiste una singola percentuale d'effetto valida per tutte le tipologie di reato.",
      "Il programma mette insieme lavori, manutenzione e organizzazione comunitaria; l'effetto di ciascuna componente non è separato sperimentalmente.",
      "Il contesto di deindustrializzazione e l'ampiezza del patrimonio vacante di Youngstown differiscono da Lamezia.",
      "La stabilizzazione su terreni privati negli USA non autorizza l'accesso o l'utilizzo di fondi privati in Italia senza titolo e procedure applicabili.",
      "I costi dell'implementazione completa e del monitoraggio pluriennale non risultano verificati nello studio."
    ],
    "unintendedEffects": "Risultato empirico negativo da non omettere: aumento dei furti di autoveicoli attorno ai lotti trattati secondo GLS e modelli spaziali, pur con risultati non coerenti in ogni specificazione. Rischi aggiuntivi da monitorare in Italia: selezione territoriale iniqua dei beneficiari, manutenzione interrotta, sicurezza stradale/accessibilità e contenziosi sulla proprietà.",
    "primarySource": {
      "label": "Youngstown Neighborhood Development Corporation — documentazione dell'effettiva attuazione del programma Lots of Green",
      "url": "https://www.yndc.org/news-media/yndc-hosts-3-youth-greening-grant-application-workshops"
    },
    "evaluationStudies": [
      {
        "label": "Kondo et al. (2016) — originale integrale, USDA Forest Service / Urban Studies",
        "url": "https://research.fs.usda.gov/download/treesearch/49785.pdf",
        "citation": "Kondo, M., Hohl, B., Han, S. & Branas, C. (2016). Effects of greening and community reuse of vacant lots on crime. Urban Studies, 53(15), 3279–3295.",
        "doi": "10.1177/0042098015608058"
      },
      {
        "label": "US Forest Service — scheda ufficiale dell'articolo e sintesi dei limiti",
        "url": "https://research.fs.usda.gov/treesearch/49785",
        "citation": "USDA Forest Service (2016), scheda bibliografica e abstract di Effects of greening and community reuse of vacant lots on crime."
      }
    ],
    "lastVerifiedAt": "2026-11-10",
    "transferabilityItaly": "Trasferibile soprattutto il dispositivo di micro-rigenerazione e custodia civica su aree legalmente disponibili, con manutenzione finanziata nel tempo. Gli outcome di sicurezza richiedono valutazioni locali e dati ottenuti attraverso canali istituzionali; nessun automatismo di trasferimento delle percentuali USA.",
    "lameziaAdaptation": "Usare il geoportale e i registri del patrimonio per identificare, nei quartieri di Lamezia, un piccolo insieme di aree comunali incolte e degradate, verificandone titolarità e vincoli; predisporre un protocollo pubblico di selezione e manutenzione, con due modalità (ripristino verde leggero / adozione associativa). Partire da aree effettivamente disponibili, senza intervenire su proprietà private non autorizzate. Verificare insieme a Polizia Locale e autorità competenti, in forma aggregata, segnalazioni di degrado e indicatori di sicurezza; misurare fruizione, manutenzione e eventuali problemi nei dintorni. Non confondere questo modello con la sperimentazione randomizzata di Philadelphia già presente nell'archivio.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "inventario catastale e urbanistico dei lotti e titolo d'intervento",
      "mappa delle aree comunali disponibili, vincoli e rischi ambientali",
      "budget per lavori e manutenzione annuale",
      "criteri di selezione trasparenti e opportunità di partecipazione aperte",
      "registrazione pre/post di segnalazioni, uso dello spazio e indicatori aggregati di sicurezza",
      "gruppi di confronto comparabili e monitoraggio degli effetti sui dintorni"
    ],
    "tags": [
      "Youngstown",
      "Ohio",
      "Lots of Green",
      "lotti abbandonati",
      "orti urbani",
      "manutenzione",
      "rigenerazione leggera",
      "partecipazione civica",
      "sicurezza urbana",
      "matched DiD",
      "spatial Durbin",
      "effetto indesiderato furti auto"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-10",
        "note": "Nuovo record distinto dal trial Philadelphia già presente: verifica diretta del paper Urban Studies 2016, tabella 4 e descrizione dei trattamenti, documenti attuativi YNDC e deduplicazione 56 moduli main. Evidenziata natura non randomizzata del trattamento, diversità delle specificazioni e aumento furti d'auto in alcuni modelli."
      }
    ]
  }
];
