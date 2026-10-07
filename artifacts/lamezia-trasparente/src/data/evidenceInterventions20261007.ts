import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_07 = [
  {
    id: "new-taipei-unit-based-garbage-bag-pricing",
    title: "Tariffazione PAYT con sacchi ufficiali per i rifiuti indifferenziati",
    authority: "New Taipei City Government — Environmental Protection Department",
    territory: "New Taipei City",
    country: "Taiwan",
    implementationYear:
      "Rollout distrettuale dal luglio 2008; estensione progressiva ai 29 distretti entro il 2011",
    problem:
      "Elevata produzione di rifiuto urbano indifferenziato e debole incentivo economico alla prevenzione quando il costo del servizio non varia con la quantità conferita.",
    measure:
      "Sistema unit-based / pay-as-you-throw nel quale il rifiuto indifferenziato deve essere conferito in sacchi ufficiali acquistati dagli utenti. Durante la fase di implementazione gli addetti potevano rifiutare rifiuti in sacchi non conformi; nella fase di enforcement erano previste sanzioni per il conferimento senza sacco ufficiale.",
    mechanism:
      "Trasformare una parte del costo del rifiuto residuo in un prezzo marginale visibile per unità conferita incentiva prevenzione, riduzione del residuo e separazione dei materiali riciclabili, mentre regole di raccolta ed enforcement rendono credibile il segnale di prezzo.",
    population:
      "Residenti e utenze dei 29 distretti di New Taipei City; la valutazione utilizza dati mensili distrettuali su rifiuto urbano e riciclo.",
    primaryArea: "rifiuti_pulizia_urbana",
    secondaryAreas: ["fiscalita_entrate_riscossione", "capacita_amministrativa_personale"],
    interventionTypes: ["incentivo_economico", "regolazione", "enforcement_controllo"],
    tools: [
      "sacchi ufficiali a pagamento",
      "raccolta separata gratuita/alternativa al residuo",
      "rollout distrettuale",
      "rifiuto del conferimento non conforme",
      "sanzioni",
      "monitoraggio mensile di rifiuto e riciclo",
    ],
    territorialScale: "Cittadina, con introduzione progressiva per distretto",
    interventionStatus:
      "Sistema di raccolta municipale consolidato. Nel 2026 l'Environmental Protection Department mantiene il servizio di raccolta e informazioni operative; la regola dei sacchi dedicati continua a essere richiamata nei materiali istituzionali correnti sulla gestione dei rifiuti.",
    evaluationMethod:
      "Valutazione quasi-sperimentale con panel mensile dei 29 distretti e introduzione scaglionata del programma. Il modello usa effetti fissi di distretto e di mese e controlli distrettuali/mensili; il panel dettagliato comprende 66 mesi (luglio 2007–dicembre 2012) e 1.914 osservazioni.",
    comparator:
      "Lo stesso distretto prima dell'implementazione e, nel rollout scaglionato, distretti non ancora trattati nello stesso periodo, con effetti fissi territoriali e temporali.",
    outcomes: [
      "kg mensili pro capite di rifiuto urbano",
      "kg mensili pro capite di riciclo",
      "persistenza della riduzione del rifiuto",
      "possibili spillover territoriali / conferimenti impropri",
    ],
    results:
      "Dopo l'implementazione, il rifiuto mensile pro capite diminuisce di circa 7 kg, pari a circa il 40% della media pre-trattamento, mentre il riciclo aumenta di circa 1,5 kg pro capite al mese, circa il 15%. La serie cittadina 2000–2017 non mostra un ritorno del rifiuto ai livelli precedenti, suggerendo persistenza. La valutazione non fornisce però una misura altrettanto robusta dell'eventuale illegal dumping.",
    effectSize:
      "Rifiuto urbano mensile pro capite circa −7 kg (≈−40% rispetto alla media pre-trattamento); riciclo circa +1,5 kg pro capite/mese (≈+15%); nessun rebound evidente nella serie cittadina fino al 2017.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede produzione e distribuzione capillare dei sacchi ufficiali, regole di tariffazione e conferimento, rete di vendita, integrazione con raccolta differenziata, comunicazione, controlli e dati operativi. Lo studio non fornisce una stima amministrativa direttamente trasferibile dei costi di implementazione.",
    limitations: [
      "Il rollout non è randomizzato: gli effetti fissi attenuano, ma non eliminano, la possibilità che il timing distrettuale rifletta fattori locali non osservati.",
      "Programmi nazionali di raccolta differenziata e altre politiche sui rifiuti erano già attivi prima del PAYT; i time fixed effects riducono ma non annullano questa complessità.",
      "L'eventuale spostamento dei conferimenti o illegal dumping è più difficile da osservare del rifiuto raccolto e non va considerato escluso in modo definitivo.",
      "Densità urbana, modalità di raccolta e compliance di New Taipei sono diverse dal contesto di un comune calabrese; gli effect size non sono direttamente trasferibili.",
    ],
    unintendedEffects:
      "Il prezzo sul residuo può incentivare conferimenti impropri, abbandono o uso scorretto delle frazioni gratuite se controllo e servizi alternativi sono deboli; può inoltre incidere proporzionalmente di più sui nuclei con maggiore produzione inevitabile di rifiuto.",
    primarySource: {
      label: "New Taipei City Environmental Protection Department — Waste Collection Information",
      url: "https://crd-rubbish.epd.ntpc.gov.tw/dispPageBox/Ntpcepd/NtpCp.aspx?ddsPageID=USERGUIDEEN",
    },
    evaluationStudies: [
      {
        label: "Journal of Social Sciences and Philosophy — Effects of a Unit-Based Pricing Program on Municipal Solid Waste",
        url: "https://www.rchss.sinica.edu.tw/files_news/33-02-2021/3.pdf",
        citation:
          "Wu S-W, Lin L-K (2021), Effects of a Unit-Based Pricing Program on Municipal Solid Waste: Evidence from New Taipei City, Journal of Social Sciences and Philosophy 33(2):253–285",
      },
    ],
    lastVerifiedAt: "2026-10-07",
    transferabilityItaly:
      "Alta sul meccanismo PAYT, ma l'assetto tariffario, il soggetto competente e le modalità di misurazione devono essere verificati nel quadro italiano e nel contratto/organizzazione locale del servizio. È più trasferibile il principio 'pagare il residuo, rendere semplici e convenienti le alternative' che il formato specifico del sacco taiwanese.",
    lameziaAdaptation:
      "Prima stimare per zona e tipologia di utenza kg di residuo, raccolta differenziata, impurità e abbandoni. Con il gestore, progettare un pilot delimitato di tariffazione puntuale o sacchi/RFID per il solo residuo, lasciando accessibili le frazioni differenziate; pre-specificare soglie, esenzioni/mitigazioni per esigenze non comprimibili e un monitor anti-abbandono. Il rollout per aree consentirebbe una valutazione quasi-sperimentale locale.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "baseline di rifiuto residuo e differenziato per area/utenza",
      "dati di qualità delle frazioni",
      "registro abbandoni e conferimenti impropri",
      "anagrafe utenze e regole tariffarie",
      "sistema sacchi/RFID o altra misurazione del residuo",
      "monitoraggio distributivo e delle esenzioni",
    ],
    tags: ["PAYT", "tariffa puntuale", "rifiuti", "riciclo", "New Taipei", "fixed effects"],
    revisionHistory: [
      {
        date: "2026-10-07",
        note: "Prima verifica e inserimento; separati gli outcome direttamente misurati da illegal dumping e altri possibili spillover non identificati con la stessa forza.",
      },
    ],
  },
  {
    id: "berkeley-sugar-sweetened-beverage-distributor-tax",
    title: "Imposta locale sulla distribuzione di bevande zuccherate",
    authority: "City of Berkeley",
    territory: "Berkeley, California",
    country: "Stati Uniti",
    implementationYear:
      "Measure D approvata nel novembre 2014; riscossione dal 2015; Measure Z del novembre 2024 ha rimosso la scadenza del 2027",
    problem:
      "Elevato consumo di bevande zuccherate e conseguenti rischi di salute pubblica, con particolare attenzione ai gruppi a basso reddito e alle disuguaglianze di esposizione.",
    measure:
      "Imposta di 1 centesimo di dollaro per oncia fluida sulla distribuzione di bevande zuccherate nel territorio cittadino. L'imposta è riscossa a monte dai distributori; Berkeley affianca al tributo un Panel of Experts che formula raccomandazioni sull'uso di fondi per programmi di salute e accesso all'acqua.",
    mechanism:
      "L'imposta aumenta il prezzo relativo delle bevande tassate nella misura in cui viene trasferita ai prezzi al dettaglio, riducendone la domanda; contemporaneamente il gettito può sostenere interventi complementari di prevenzione, accesso all'acqua e ambienti alimentari più sani.",
    population:
      "Consumatori di Berkeley; la valutazione iniziale si concentra su quartieri a basso reddito e li confronta con quartieri di Oakland e San Francisco.",
    primaryArea: "salute_pubblica_locale",
    secondaryAreas: ["fiscalita_entrate_riscossione", "welfare_inclusione_servizi_sociali"],
    interventionTypes: ["incentivo_economico", "regolazione"],
    tools: [
      "excise/distributor tax per oncia",
      "registrazione e remittance dei distributori",
      "Panel of Experts",
      "monitoraggio dei consumi",
      "allocazioni a programmi di salute pubblica",
    ],
    territorialScale: "Cittadina",
    interventionStatus:
      "In vigore nel 2026 a 1 centesimo per oncia. Gli elettori hanno approvato Measure Z nel novembre 2024 eliminando la precedente scadenza del 1 gennaio 2027. Una distinta proposta elettorale del novembre 2026 per modificare il tributo non è trattata come politica vigente prima del voto.",
    evaluationMethod:
      "Controlled repeated cross-sectional study: indagini sui consumi prima e dopo l'introduzione in quartieri di Berkeley confrontate con quartieri di Oakland e San Francisco. Il primo follow-up osserva l'esito circa quattro mesi dopo l'implementazione; un secondo studio ripete annualmente le indagini fino al 2017.",
    comparator:
      "Quartieri demograficamente comparabili di Oakland e San Francisco non esposti alla tassa nel periodo iniziale; confronto dei cambiamenti pre/post aggiustato per covariate.",
    outcomes: [
      "frequenza di consumo di bevande zuccherate",
      "consumo di acqua",
      "consumo di soda e sports drinks",
      "persistenza degli effetti a tre anni",
      "trasferimento dell'imposta ai prezzi",
    ],
    results:
      "Nel primo follow-up il consumo aggiustato di bevande zuccherate diminuisce del 21% a Berkeley mentre aumenta del 4% nelle aree di confronto; il consumo di acqua cresce del 63% contro il 19% nei controlli. Il follow-up 2014–2017 trova una riduzione aggiustata di 0,55 consumi al giorno, circa il 52%, maggiore a Berkeley rispetto ai quartieri di confronto, senza un cambiamento significativo nei controlli.",
    effectSize:
      "Primo follow-up: SSB −21% a Berkeley vs +4% nei comparatori; acqua +63% vs +19%. A tre anni: −0,55 consumi SSB/giorno rispetto al baseline, circa −52%, con differenza significativa rispetto ai comparatori.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede specifica potestà tributaria, definizioni merceologiche, registrazione dei distributori, amministrazione e controllo del tributo. Berkeley utilizza inoltre capacità di grant management e valutazione; i costi e il gettito locali non sono trasferibili automaticamente.",
    limitations: [
      "Le valutazioni sono controlled before/after su repeated cross-sections, non randomizzate; restano possibili confondimento residuo e cambiamenti di composizione dei campioni.",
      "Il primo follow-up è molto precoce e misura consumo auto-riferito; il follow-up a tre anni rafforza la persistenza ma mantiene il disegno osservazionale.",
      "La tassa non è trasferita integralmente ai prezzi in tutti i formati e retailer, e la prossimità di aree non tassate può favorire acquisti transfrontalieri.",
      "La città è piccola, relativamente istruita e inserita in una densa area metropolitana; la magnitudine non è direttamente generalizzabile.",
      "Un comune italiano non dispone automaticamente della potestà di introdurre una nuova accisa locale su questa base imponibile: la trasferibilità normativa deve essere verificata prima di qualunque proposta fiscale.",
    ],
    unintendedEffects:
      "Possibili acquisti fuori confine, sostituzione verso prodotti non tassati e oneri amministrativi per distributori; l'impatto distributivo dipende dall'incidenza della tassa e dall'uso del gettito. Il record non attribuisce automaticamente alla tassa esiti clinici non misurati dagli studi di consumo.",
    primarySource: {
      label: "City of Berkeley — Sugar-Sweetened Beverage Tax",
      url: "https://berkeleyca.gov/doing-business/operating-berkeley/business-taxes/special-business-taxes",
    },
    evaluationStudies: [
      {
        label: "American Journal of Public Health — initial controlled evaluation",
        url: "https://pubmed.ncbi.nlm.nih.gov/27552267/",
        citation:
          "Falbe J et al. (2016), Impact of the Berkeley Excise Tax on Sugar-Sweetened Beverage Consumption, American Journal of Public Health 106(10):1865–1871",
        doi: "10.2105/AJPH.2016.303362",
      },
      {
        label: "American Journal of Public Health — three-year follow-up",
        url: "https://pubmed.ncbi.nlm.nih.gov/30789776/",
        citation:
          "Lee MM et al. (2019), Sugar-Sweetened Beverage Consumption 3 Years After the Berkeley, California, Sugar-Sweetened Beverage Tax, American Journal of Public Health 109(4):637–639",
        doi: "10.2105/AJPH.2019.304971",
      },
    ],
    lastVerifiedAt: "2026-10-07",
    transferabilityItaly:
      "Bassa per la replica fiscale diretta senza una base legislativa specifica; alta come evidenza sul meccanismo prezzo-consumo e sulla necessità di misurare sostituzioni e acquisti fuori area. Sono invece più direttamente praticabili politiche comunali coerenti su acqua, vending, concessioni, eventi e ristorazione collettiva.",
    lameziaAdaptation:
      "Non proporre una 'soda tax comunale' senza base normativa. Usare il caso per costruire una politica locale sugli ambienti alimentari nelle competenze effettive: acqua facilmente accessibile negli edifici e negli eventi comunali, criteri per distributori automatici e concessioni, eventuali standard nella ristorazione collettiva e monitoraggio delle vendite/consumi. Se in futuro esistesse una leva fiscale sovraordinata, pre-specificare comparatori e spillover commerciali.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "verifica delle competenze tributarie",
      "mappatura di vending e concessioni comunali",
      "dati aggregati su vendite/consumi",
      "accesso all'acqua negli edifici e spazi comunali",
      "monitoraggio distributivo e degli acquisti fuori area",
    ],
    tags: ["Berkeley", "sugar-sweetened beverages", "salute pubblica", "tax", "consumi", "controlled before-after"],
    revisionHistory: [
      {
        date: "2026-10-07",
        note: "Prima verifica e inserimento; mantenuti separati consumo, pass-through, uso del gettito e limiti di competenza fiscale italiana.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
