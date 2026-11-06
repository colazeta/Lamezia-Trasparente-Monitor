import type { EvidenceIntervention } from "./evidenceInterventions";

/** BNDES PMAT municipal tax capacity: original AEJ study + institutional provenance verified 2026-11-06. */
export const EVIDENCE_INTERVENTIONS_2026_11_06_PMAT: readonly EvidenceIntervention[] = [
{
  "id": "brazil-bndes-pmat-municipal-tax-capacity-school-infrastructure-1998",
  "title": "Brasile: PMAT, modernizzazione delle amministrazioni tributarie comunali e investimenti scolastici",
  "authority": "Banco Nacional de Desenvolvimento Econômico e Social (BNDES); comuni brasiliani aderenti",
  "territory": "Comuni di diversi Stati del Brasile (programma nazionale a adesione municipale)",
  "country": "Brasile",
  "implementationYear": "Programma istituito 1997 (operatività documentata dal 1998); periodi di adesione valutati 1998–2009",
  "problem": "Capacità amministrativa e informativa insufficiente degli enti locali per accertare e riscuotere entrate proprie; rischio che vincoli di bilancio impediscano investimenti in servizi e infrastrutture scolastiche.",
  "measure": "Il PMAT offre finanziamenti agevolati ai comuni per progetti di modernizzazione dei processi tributari, delle banche dati, della gestione e dei sistemi informatici: sviluppo dei registri e dei catasti, tecnologie, informatizzazione della riscossione e qualificazione del personale. I comuni scelgono di aderire; la tempistica d'avvio dipende anche dalla capacità di istruttoria/erogazione del BNDES.",
  "mechanism": "Il rafforzamento dell'amministrazione delle entrate aumenta la capacità di individuare posizioni imponibili, gestire adempimenti e ridurre costi di raccolta. La maggiore disponibilità di entrate proprie può sostenere investimenti pubblici visibili; lo studio ipotizza, ma non dimostra univocamente, un maggiore incentivo alla accountability rispetto a trasferimenti intergovernativi.",
  "population": "Amministrazioni comunali brasiliane che hanno chiesto o ricevuto PMAT e residenti/utenti di scuole pubbliche; nel campione principale della valutazione circa 4.578 comuni e 57.507 osservazioni comune-anno, con 339 comuni partecipanti analizzati nelle specificazioni pertinenti.",
  "primaryArea": "capacita_amministrativa_personale",
  "secondaryAreas": [
    "fiscalita_entrate_riscossione",
    "istruzione_giovani",
    "digitalizzazione_servizi_online",
    "trasparenza_integrita_anticorruzione"
  ],
  "interventionTypes": [
    "modifica_organizzativa_processo",
    "infrastruttura_digitale",
    "formazione_capacity_building",
    "targeting_data_analytics",
    "incentivo_economico"
  ],
  "tools": [
    "finanziamenti BNDES per progetti comunali",
    "modernizzazione anagrafi tributarie e basi imponibili",
    "sistemi informativi, georeferenziazione e interoperabilità",
    "riorganizzazione controllo, accertamento, riscossione e rapporto con il contribuente",
    "serie storiche Finbra e censimenti delle scuole"
  ],
  "territorialScale": "Amministrazioni comunali di scala diversa in più Stati brasiliani, incluse municipalità medio-piccole.",
  "interventionStatus": "Programma avviato nella seconda metà degli anni Novanta; BNDES documenta ancora linee PMAT Finem e Automático nel 2026. La valutazione riguarda una coorte storica, non l'efficacia delle versioni attuali né l'ammissibilità di finanziamenti italiani.",
  "evaluationMethod": "Quasi-esperimento basato sulla diversa tempistica di avvio fra comuni che aderiscono volontariamente; event-study/difference-in-differences con effetti fissi comunali, controlli temporali e verifiche dei pre-trend, oltre a controlli con propensity-score/common support. Per imputare alle entrate aggiuntive gli effetti sulle infrastrutture scolastiche usa IV basata sul PMAT; confronto con entrate da trasferimenti mediante discontinuità delle soglie demografiche FPM (RDD) su gruppi non identici. Nessuna randomizzazione dei comuni al PMAT.",
  "comparator": "Comuni non aderenti o non ancora avviati, con controlli per caratteristiche osservate e confronto dell'evoluzione pre/post. Per i trasferimenti FPM, comuni vicini a soglie legali di popolazione; la comparazione tra impatto delle entrate proprie e trasferimenti richiede assunzioni ulteriori.",
  "outcomes": [
    "gettito tributario comunale pro capite",
    "numero di aule scolastiche per popolazione in età scolare",
    "indice di qualità delle infrastrutture scolastiche",
    "indicatori di alfabetizzazione, con risultati meno robusti",
    "infrastrutture sanitarie e irregolarità/corruzione, senza effetti positivi robustamente dimostrati"
  ],
  "results": "La versione peer-reviewed (Gadenne 2017) stima che dopo circa sette anni di PMAT il gettito comunale annuo sia più alto di 10–11 reais per residente, circa +10% rispetto al livello iniziale. L'incremento delle entrate proprie indotto dal programma è associato, sotto ipotesi IV, a circa +4–5% nell'indicatore di quantità di infrastrutture scolastiche e +0,1 deviazioni standard nell'indice di qualità. Un aumento corrispondente dei trasferimenti non mostra benefici robusti sugli stessi outcome nel disegno RDD. Non emerge una dimostrazione di miglioramento causale generale in salute, apprendimenti o corruzione.",
  "effectSize": "Articolo 2017, Tab. 3: effetto del programma sul gettito pro capite ~R$10,3–11,6 (specificazioni aggiustate; base circa +10%); R$9,6 pro capite di prestito medio, interpretato come ~R$1 di gettito ANNUO aggiuntivo per R$1 finanziato dopo alcuni anni, non come profitto netto. Infrastrutture scolastiche: +4–5% nel numero di aule per popolazione in età scolare, indice di qualità +~0,1 SD (strumentazione delle entrate); non confondere con risultati scolastici degli studenti. La bozza del 2011 (+12% dopo sei anni) non prevale sulla versione definitiva.",
  "evidenceStrength": "moderata",
  "costsRequirements": "Finanziamenti agevolati BNDES e cofinanziamento/indebitamento comunale; il paper stima R$9,6 di prestiti pro capite medi nelle municipalità osservate, e maggiore gettito ricorrente dopo anni. Servono studio di fattibilità, integrazione di registri, personale tributario e informatico, controllo interno e confronto del maggior gettito netto con costi di investimento e gestione. I prodotti BNDES sono riservati a enti brasiliani, non accessibili al Comune italiano; valori in R$ storici non trasferibili.",
  "limitations": [
    "Adesione al PMAT volontaria e comuni che si candidano potenzialmente diversi: la strategia usa tempi di avvio e controlli, ma la condizione di trend paralleli condizionati non è verificabile.",
    "Investimenti organizzativi e tecnologici eterogenei: non è possibile isolare quale specifico modulo (catasto, software, formazione) produca i miglioramenti.",
    "La relazione tra entrate indotte e infrastrutture passa da una strategia IV e dal confronto con variazioni FPM; richiede assunzioni più forti rispetto alla stima complessiva del PMAT sulle entrate.",
    "Esiti materiali nelle scuole non equivalgono a miglioramenti significativi nell'apprendimento; segnali di alfabetizzazione non robusti.",
    "La mancata crescita osservata di irregolarità non dimostra una riduzione della corruzione; i risultati in sanità non sono robustamente positivi.",
    "Il contesto fiscale e le competenze brasiliane non sono equivalenti a quelle italiane. Gli effetti monetari non sono un business case locale immediatamente applicabile.",
    "Il programma valutato è storico e non identifica l'effetto delle linee PMAT correnti, che possono avere soglie e condizioni finanziarie differenti."
  ],
  "unintendedEffects": "Potenziali rischi non quantificati causalmente: pressione sproporzionata su contribuenti vulnerabili, errori di incrocio dati, contenzioso, trattamento non equo, costi IT e debito; non riportati come effetti accertati. L'effetto distributivo del maggiore gettito richiede analisi separata.",
  "primarySource": {
    "label": "BNDES — PMAT/Finem, modernizzazione della amministrazione tributaria e gestione comunale (descrizione istituzionale)",
    "url": "https://www.bndes.gov.br/wps/portal/site/home/financiamento/produto/bndes-finem-pmat"
  },
  "evaluationStudies": [
    {
      "label": "Gadenne (2017), American Economic Journal: Applied Economics — articolo peer-reviewed",
      "url": "https://doi.org/10.1257/app.20150509",
      "citation": "Gadenne, L. (2017). Tax Me, but Spend Wisely? Sources of Public Finance and Government Accountability. American Economic Journal: Applied Economics, 9(1), 274–314.",
      "doi": "10.1257/app.20150509"
    },
    {
      "label": "Università di Warwick — versione autrice 2016, testo e tabelle econometriche",
      "url": "https://warwick.ac.uk/fac/soc/economics/research/centres/cage/manage/publications/289-2016_gadenne.pdf",
      "citation": "Gadenne, L. (2016), Tax Me, But Spend Wisely? CAGE Working Paper 289; versione precedente alla pubblicazione definitiva."
    },
    {
      "label": "BNDES — valutazione istituzionale successiva del programma (2023; riscontri non equiparati alle stime causali 2017)",
      "url": "https://blogdodesenvolvimento.bndes.gov.br/serie/lancamentos-de-publicacoes/Ao-ampliar-arrecadacao-programa-do-BNDES-induz-municipios-a-mais-investimento-social-mostra-estudo/",
      "citation": "BNDES (2023, aggiornamento 2025), studio istituzionale sugli impatti di PMAT su gettito e infrastrutture sociali."
    }
  ],
  "lastVerifiedAt": "2026-11-06",
  "transferabilityItaly": "Trasferibile il principio di modernizzazione integrata della gestione delle entrate proprie e della valutazione degli outcome, non il credito BNDES o la presunta causalità fra ogni aumento del gettito e migliori servizi. I comuni italiani hanno competenze tributario-riscossive e vincoli di legge diversi; priorità a correttezza dell'accertamento, equità, adempimento spontaneo, protezione dei dati, recupero di basi imponibili omissionate e trasparenza sulla spesa.",
  "lameziaAdaptation": "Avviare ricognizione integrata di IMU, TARI e CUP con Settore Economico-Finanziario e responsabili dei servizi, usando dati aggregati e basi giuridiche corrette; misurare qualità delle anagrafiche, errori e duplicati, omissioni verificabili, tempi di risposta, ricorsi, pagamenti e costi di gestione. Il Comune usa già PagoPA, App IO ed e-mail/PEC per TARI 2026: valutare interoperabilità e comunicazioni prima di acquistare nuovi software. Elaborare business case triennale per interventi di bonifica dati e formazione, con controllo dell'equità e audit degli esiti. Se crescono le entrate effettivamente nette, pubblicare un rendiconto verificabile degli investimenti e dei servizi finanziati senza attribuire automaticamente all'intervento ogni spesa scolastica.",
  "implementability": "strutturale",
  "capacityDataNeeds": [
    "inventario delle banche dati tributarie, fonte e qualità per IMU/TARI/CUP",
    "serie storiche di accertato, riscosso, residui e contenziosi, al netto delle definizioni agevolate",
    "tracciamento degli esiti e dei tempi di bonifica dei dati",
    "mappa dei vincoli normativi e GDPR/DPIA ove richiesto",
    "risorse organizzative ICT e formazione del personale",
    "costeo netto e benchmark su comuni comparabili, con valutazione pre/post o rollout per moduli",
    "monitoraggio delle priorità e dei risultati della spesa aggiuntiva"
  ],
  "tags": [
    "PMAT",
    "BNDES",
    "Brasile",
    "capacità tributaria",
    "modernizzazione amministrativa",
    "riscossione",
    "digitalizzazione",
    "quasi-esperimento",
    "difference-in-differences",
    "variabili strumentali",
    "scuole",
    "accountability",
    "gettito proprio",
    "valutazione costi-benefici"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-06",
      "note": "Primo censimento dopo discovery Parallel Search e verifica diretta su Gadenne AEJ Applied Economics 2017 / working paper Warwick e BNDES. Deduplica dei moduli attivi su main e PR PMAT. Conservati effetti +10% gettito, +4–5% aule e +0,1 SD qualità con ipotesi IV; esclusi claim non dimostrati di profitti netti, test scolastici e anticorruzione."
    }
  ]
}
];
