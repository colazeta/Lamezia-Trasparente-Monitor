import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_23 = [
  {
    "id": "chicago-large-lots-resident-ownership-greening",
    "title": "Cessione regolata di lotti comunali vacanti ai residenti per la cura urbana",
    "authority": "City of Chicago — Department of Planning and Development",
    "territory": "Chicago (Englewood, East Garfield Park e successivi quartieri), Illinois",
    "country": "Stati Uniti",
    "implementationYear": "Dal 2014; valutazioni su compravendite e outcome 2014–2018",
    "problem": "Elevata presenza di piccoli terreni comunali vacanti e degradati, costi ricorrenti di manutenzione, scarsa cura degli spazi e rischi per la sicurezza nei quartieri.",
    "measure": "Programma Large Lots: offerta di uno o due lotti vacanti di proprietà comunale, con destinazione residenziale e requisiti predeterminati, a proprietari immobiliari eleggibili dello stesso isolato al prezzo simbolico di 1 USD per lotto. L'acquirente poteva destinare il terreno a giardino, area verde o altri usi urbanisticamente consentiti; obbligo di conservarne la proprietà per almeno cinque anni.",
    "mechanism": "Trasferire titolarità e incentivi alla manutenzione a soggetti radicati nel quartiere, favorendo cura continuativa, riuso e sorveglianza informale; possibile riduzione delle opportunità di reato, senza installare necessariamente nuove infrastrutture pubbliche.",
    "population": "Proprietari di immobili e associazioni eleggibili nelle aree selezionate; residenti e fruitori degli isolati che ospitano lotti ceduti.",
    "primaryArea": "urbanistica_rigenerazione",
    "secondaryAreas": [
      "sicurezza_urbana_prevenzione",
      "housing_politiche_abitative",
      "rifiuti_pulizia_urbana",
      "partecipazione_democrazia_locale"
    ],
    "interventionTypes": [
      "regolazione",
      "modifica_organizzativa_processo",
      "partecipazione_codesign",
      "incentivo_economico"
    ],
    "tools": [
      "inventario lotti pubblici",
      "bando e requisiti di eleggibilità",
      "prezzo simbolico",
      "atto di cessione",
      "vincolo quinquennale",
      "monitoraggio visivo dello stato di cura",
      "analisi dei reati per isolato"
    ],
    "territorialScale": "Lotto e isolato urbano; programma municipale mirato a quartieri",
    "interventionStatus": "Programma Large Lots avviato nel 2014; dal 17 novembre 2022 Chicago ha accorpato i programmi di vendita dei terreni in ChiBlockBuilder. Non si assume che la procedura a 1 USD sia tuttora disponibile invariata.",
    "evaluationMethod": "Tre analisi empiriche complementari. (1) Difference-in-differences a livello di isolato sulle vendite e i reati, con eterogeneità per residenza dei compratori (JAPA 2021). (2) Difference-in-differences sulla condizione e cura osservata dei lotti venduti rispetto a lotti di controllo abbinati, 2014–2018 (JAPA 2021). (3) Difference-in-differences su 234 isolati con lotti acquistati e 702 isolati di controllo abbinati, esiti di criminalità nel periodo 2015–2018 (Landscape and Urban Planning 2021).",
    "comparator": "Lotti comunali vacanti non acquistati ma comparabili per la valutazione della cura; isolati senza terreni venduti, abbinati ai trattati, per le stime sulla criminalità; confronti temporali prima e dopo la compravendita.",
    "outcomes": [
      "condizione e cura visibile dei lotti",
      "reati complessivi per isolato",
      "specifiche tipologie di reato",
      "riuso come verde e giardini"
    ],
    "results": "I lotti ceduti hanno registrato un miglioramento significativo dello stato di cura rispetto a lotti comparabili: nel gruppo di controllo lo stato peggiorava fra 2014 e 2018, mentre nei lotti acquistati migliorava dal 2015 e negli anni seguenti. Una valutazione difference-in-differences su reati per isolato stima cali medi del 3,5%, più consistenti quando i compratori vivono nel quartiere. Un'ulteriore analisi con isolati abbinati trova una riduzione della densità di reati a partire dal secondo anno, ma non per tutte le tipologie.",
    "effectSize": "Criminalità per isolato: −3,5% nella stima complessiva e −6,8% per lotti acquistati da residenti del medesimo quartiere (studio JAPA DOI 10.1080/01944363.2020.1792334). Miglioramento significativo della condizione/cura rispetto al controllo 2014–2018, senza un unico effetto percentuale trasferibile nell'abstract (studio JAPA DOI 10.1080/01944363.2021.1891126). Ulteriore confronto criminalità: 234 isolati trattati contro 702 controlli abbinati.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Serve censimento georeferenziato e verifica della titolarità dei suoli, qualificazione urbanistica, procedura pubblica conforme alle norme di valorizzazione e alienazione del patrimonio, perizia di stima, garanzie antidiscriminazione, vincoli d'uso e manutenzione, ispezioni periodiche. Il prezzo di 1 USD riflette il quadro giuridico statunitense, non è una soluzione finanziaria replicabile automaticamente in Italia.",
    "limitations": [
      "Adozione e compravendita non randomizzate: selezione degli acquirenti e localizzazione dei lotti possono correlare con trend preesistenti e attivismo civico; il DiD non elimina ogni confondente.",
      "Le stime −3,5% e −6,8% sono riferite a diversi sottogruppi di isolati di Chicago; non sono previsioni della riduzione dei reati in un comune italiano.",
      "Uno studio di cura e uno di criminalità osservano finestre e campioni parzialmente sovrapposti: non costituiscono repliche completamente indipendenti.",
      "Il programma trasferisce patrimonio pubblico e produce possibili costi-opportunità, rischi di distribuzione ineguale delle opportunità, speculazione e gentrificazione.",
      "I benefici di pulizia non sono una misura diretta dei miglioramenti in salute, prezzi immobiliari o benessere, che richiedono valutazioni separate."
    ],
    "unintendedEffects": "Da monitorare perdita di disponibilità futura del patrimonio pubblico, accesso diseguale ai lotti, trasferimenti di rendite, esclusione di residenti senza proprietà, possibili spostamenti dei reati e costi residui di controllo. Le valutazioni citate non quantificano in modo completo questi effetti.",
    "primarySource": {
      "label": "City of Chicago — Large Lots Program, fonte istituzionale e confluenza in ChiBlockBuilder",
      "url": "https://www.chicago.gov/city/en/depts/dcd/supp_info/large-lot-program.html"
    },
    "evaluationStudies": [
      {
        "label": "Journal of the American Planning Association — proprietà locale e criminalità",
        "url": "https://doi.org/10.1080/01944363.2020.1792334",
        "citation": "Does Local Ownership of Vacant Land Reduce Crime? An Assessment of Chicago's Large Lots Program (2021), JAPA 87(1).",
        "doi": "10.1080/01944363.2020.1792334"
      },
      {
        "label": "Journal of the American Planning Association — cura dei lotti",
        "url": "https://doi.org/10.1080/01944363.2021.1891126",
        "citation": "Rigolon A, Banerjee D, Gobster P, Hadavi S, Stewart W (2021), Transferring Vacant Lots to Private Ownership Improves Care and Empowers Residents, JAPA 87(4):570–584.",
        "doi": "10.1080/01944363.2021.1891126"
      },
      {
        "label": "Landscape and Urban Planning — greening e criminalità",
        "url": "https://doi.org/10.1016/j.landurbplan.2021.104096",
        "citation": "Hadavi S, Rigolon A, Gobster PH, Stewart WP (2021), Resident-led vacant lot greening and crime: Do ownership and visual condition-care matter?, Landscape and Urban Planning 211:104096.",
        "doi": "10.1016/j.landurbplan.2021.104096"
      }
    ],
    "lastVerifiedAt": "2026-10-23",
    "transferabilityItaly": "Media per il meccanismo di coinvolgimento e manutenzione del suolo pubblico; bassa per la cessione automatica a prezzo simbolico. In Italia serve rispettare la disciplina sulle alienazioni e valorizzazione del patrimonio pubblico, gli strumenti urbanistici, il regime degli aiuti e principi di pubblicità e parità di trattamento; considerare concessioni temporanee e patti di collaborazione come alternative alla vendita.",
    "lameziaAdaptation": "Partire dal Piano delle alienazioni e valorizzazioni del Comune di Lamezia Terme (avviso 16 maggio 2025) e individuare i piccoli terreni vacanti realmente disponibili, distinguendoli da beni inalienabili o strategici. Prima di qualsiasi cessione, confrontare un piccolo programma a evidenza pubblica di concessioni d'uso/manutenzione o patti di collaborazione con terreni simili non ancora assegnati. Imporre criteri aperti, obblighi manutentivi e indicatori su pulizia, riuso, costi, reclami e sicurezza percepita. Non riprodurre il prezzo di Chicago.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "inventario patrimoniale con particelle e titoli",
      "zonizzazione e vincoli PSC/REU",
      "storia di manutenzione e segnalazioni per lotto",
      "criteri pubblici per selezione e rendicontazione",
      "baseline fotografica e rilievi indipendenti",
      "costificazione e piano monitoraggio comparativo",
      "valutazione giuridica di concessione o alienazione"
    ],
    "tags": [
      "Chicago",
      "Large Lots",
      "rigenerazione urbana",
      "patrimonio comunale",
      "terreni vacanti",
      "cura del verde",
      "difference-in-differences",
      "sicurezza urbana",
      "governo del territorio"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-23",
        "note": "Inserito dopo controllo dell'archivio in main e lettura della fonte municipale e delle tre valutazioni originali; distinti risultati della cura e stime dei reati, qualificata la non trasferibilità automatica della vendita a 1 USD."
      }
    ]
  }
] as const satisfies readonly EvidenceIntervention[];
