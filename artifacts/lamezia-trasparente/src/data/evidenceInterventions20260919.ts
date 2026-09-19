import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_19 = [
  {
    id: "barcelona-bmincome-guaranteed-income-active-policies",
    title: "B-MINCOME: sostegno minimo municipale con politiche attive per famiglie vulnerabili",
    authority: "Ajuntament de Barcelona — Àrea de Drets Socials",
    territory: "Eix Besòs, Barcellona",
    country: "Spagna",
    implementationYear: "2017–2019 (intervento); valutazione finale 2019 e successiva sintesi peer-reviewed",
    problem:
      "Povertà persistente, grave deprivazione materiale e vulnerabilità sociale concentrate in dieci quartieri dell'Eix Besòs, con famiglie già in contatto con i servizi sociali municipali e difficoltà economiche non risolte dai soli strumenti ordinari.",
    measure:
      "Pilot municipale che combinava il Municipal Inclusion Support, un trasferimento monetario mensile means-tested a livello familiare, con quattro politiche attive: formazione e occupazione, economia sociale e imprenditorialità, promozione dell'affitto di stanze e partecipazione comunitaria. Le famiglie furono assegnate a diverse configurazioni che variavano condizionalità e modalità di ritiro del beneficio al crescere del reddito.",
    mechanism:
      "Ridurre immediatamente il gap tra risorse disponibili e bisogni essenziali, attenuando deprivazione, insicurezza alimentare e stress finanziario; parallelamente, testare se politiche attive e differenti regole di condizionalità/withdrawal migliorassero autonomia, inclusione e partecipazione economica senza produrre eccessivi disincentivi al lavoro.",
    population:
      "Famiglie socialmente vulnerabili residenti in dieci quartieri dell'Eix Besòs. Tra 1.524 nuclei eleggibili, 1.000 furono selezionati mediante lotteria stratificata per accedere alle diverse modalità del programma; gli altri eleggibili costituivano il principale controfattuale per la valutazione.",
    primaryArea: "welfare_inclusione_servizi_sociali",
    secondaryAreas: [
      "sviluppo_economico_commercio_lavoro",
      "capacita_amministrativa_personale",
      "partecipazione_democrazia_locale",
    ],
    interventionTypes: [
      "incentivo_economico",
      "servizio_diretto",
      "modifica_organizzativa_processo",
      "formazione_capacity_building",
    ],
    tools: [
      "Municipal Inclusion Support mensile",
      "lotteria stratificata",
      "means testing familiare",
      "diverse regole di condizionalità e withdrawal",
      "formazione e supporto all'occupazione",
      "economia sociale e imprenditorialità",
      "supporto alla locazione di stanze",
      "attività di partecipazione comunitaria",
    ],
    territorialScale: "Dieci quartieri / famiglie vulnerabili",
    interventionStatus:
      "Pilot concluso nel 2019. Il record riguarda l'esperimento municipale B-MINCOME e la sua valutazione; non assume che Barcellona abbia trasformato il pilot in un reddito di base municipale universale permanente.",
    evaluationMethod:
      "Randomized impact evaluation con stratified lottery / randomized block design fra 1.524 famiglie eleggibili. Mille nuclei furono selezionati per i posti disponibili nelle diverse configurazioni del programma. La valutazione usa survey e dati amministrativi e stima principalmente effetti intent-to-treat su benessere, deprivazione, finanze, lavoro e salute, con analisi di robustezza sulle diverse specificazioni.",
    comparator:
      "Famiglie eleggibili non selezionate dalla lotteria e quindi soggette allo status quo dei servizi e delle prestazioni disponibili, tenendo conto della stratificazione usata nell'assegnazione.",
    outcomes: [
      "soddisfazione di vita",
      "grave deprivazione materiale",
      "insicurezza alimentare e fame",
      "arretrati e debito",
      "soddisfazione per la situazione economica",
      "partecipazione al lavoro e qualità dell'occupazione",
      "sonno e salute mentale",
      "ricorso ad altre prestazioni sociali",
    ],
    results:
      "Il programma aumenta il benessere soggettivo e riduce grave deprivazione materiale, insicurezza alimentare, probabilità di andare a letto affamati, arretrati e dipendenza da prestiti informali. Migliora anche la soddisfazione per la situazione economica e alcuni indicatori del sonno. Tuttavia non emerge un miglioramento convincente degli esiti sanitari complessivi e la partecipazione al lavoro, così come la qualità della partecipazione lavorativa, diminuisce nel gruppo trattato. L'aumento delle prescrizioni di antidolorifici è un esito avverso che richiede cautela interpretativa.",
    effectSize:
      "Effetti standardizzati/medi riportati nella valutazione finale: soddisfazione di vita +0,146; grave deprivazione materiale −0,080; scala 'andare a letto affamati' −0,130; insicurezza alimentare −0,213; arretrati −0,168; partecipazione al lavoro −0,130; qualità della partecipazione lavorativa −0,044; qualità del sonno +0,066; soddisfazione per la situazione economica +1,075; prestiti da familiari/amici −0,071; debito in essere −0,044; trasferimenti discrezionali aggiuntivi dei servizi sociali −0,130. Il rischio di disturbo mentale e le nuove diagnosi di depressione/ansia non mostrano effetti statisticamente convincenti.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Intervento ad alta intensità amministrativa e finanziaria. Il progetto complessivo aveva un budget di circa 6,07 milioni di euro, comprendente anche disegno, implementazione, partnership e valutazione, e non va interpretato come costo netto dei soli trasferimenti. Il trasferimento medio mensile effettivamente erogato alle famiglie beneficiarie era nell'ordine di 463 euro, con importi variabili in funzione di reddito e composizione familiare. Servono integrazione con servizi sociali, controlli di eleggibilità, sistema di pagamento, gestione delle interazioni con altre prestazioni e capacità valutativa.",
    limitations: [
      "Il pilot riguarda famiglie vulnerabili già selezionate in dieci quartieri ad alta povertà dell'Eix Besòs; la validità esterna verso la popolazione comunale generale è limitata.",
      "B-MINCOME è un pacchetto complesso con trasferimento monetario, differenti regole di condizionalità e quattro politiche attive: non tutti gli effetti possono essere attribuiti a una singola componente.",
      "Il programma riduce la partecipazione al lavoro e la qualità della partecipazione lavorativa; questo effetto deve essere trattato come trade-off sostanziale e non nascosto dietro i miglioramenti di benessere.",
      "Gli esiti di salute non migliorano in modo convincente; il miglioramento economico non può quindi essere tradotto automaticamente in un beneficio sanitario.",
      "Alcune politiche attive, in particolare la componente collegata all'affitto di stanze, incontrarono difficoltà operative e di take-up.",
    ],
    unintendedEffects:
      "Riduzione della partecipazione al lavoro e della qualità dell'occupazione; aumento della prescrizione di antidolorifici in alcune analisi; complessità amministrativa e possibili interazioni non desiderate con altre prestazioni. Una replica deve monitorare esplicitamente questi outcome anziché concentrarsi solo sulla riduzione della deprivazione.",
    primarySource: {
      label: "Ajuntament de Barcelona — B-MINCOME executive report",
      url: "https://ajuntament.barcelona.cat/dretssocials/sites/default/files/arxius-documents/bmincome_executive_report.pdf",
    },
    evaluationStudies: [
      {
        label: "Ivàlua — final impact evaluation",
        url: "https://ivalua.cat/sites/default/files/2021-02/Informe%20Avaluaci%C3%B3%20Impacte%20BMincome_0.pdf",
        citation: "Todeschini F, Sabes-Figuera R (2019), Barcelona city council welfare programme: Impact evaluation results — BMINCOME Project",
      },
      {
        label: "Basic Income Studies — peer-reviewed synthesis",
        url: "https://doi.org/10.1515/bis-2021-0047",
        citation: "Riutort S, Laín B, Julià A (2023), Basic Income at Municipal Level: Insights from the Barcelona B-MINCOME Pilot",
        doi: "10.1515/bis-2021-0047",
      },
    ],
    lastVerifiedAt: "2026-09-19",
    transferabilityItaly:
      "Il principio è trasferibile solo entro le competenze e le risorse effettivamente disponibili a un comune italiano. Non si può presumere che un comune possa creare un reddito minimo autonomo equivalente né ignorare ISEE, prestazioni nazionali/regionali e vincoli di bilancio. È invece trasferibile il disegno di un sostegno temporaneo o integrativo, collegato ai servizi sociali e valutato con un controfattuale credibile quando la domanda eccede le risorse disponibili.",
    lameziaAdaptation:
      "Mappare prima tutti i contributi economici comunali e le loro sovrapposizioni con misure nazionali/regionali. Se esiste una platea eleggibile più ampia delle risorse disponibili, sperimentare un sostegno temporaneo semplificato o un top-up entro strumenti giuridicamente disponibili, eventualmente associando una sola politica attiva ben definita. Usare criteri trasparenti e, solo se compatibile con le regole di priorità, un rollout o una lotteria stratificata fra nuclei equivalenti. Misurare separatamente deprivazione materiale, insicurezza alimentare, arretrati, lavoro, salute, ricorso ai servizi e costo amministrativo.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "mappa delle prestazioni comunali e dei criteri ISEE",
      "integrazione con misure nazionali e regionali",
      "dati amministrativi sui pagamenti e sul ricorso ai servizi",
      "survey pre/post su deprivazione e sicurezza alimentare",
      "indicatori di lavoro e reddito",
      "protocollo di randomizzazione o rollout equo se applicabile",
      "data governance e valutazione indipendente",
    ],
    tags: ["B-MINCOME", "reddito minimo", "RCT", "povertà", "deprivazione materiale", "insicurezza alimentare", "servizi sociali"],
    revisionHistory: [
      {
        date: "2026-09-19",
        note: "Prima verifica e inserimento; mantenuti esplicitamente i benefici su deprivazione e benessere insieme agli effetti negativi sul lavoro e ai risultati sanitari nulli/non convincenti.",
      },
    ],
  },
  {
    id: "new-york-local-trans-fat-restrictions-cardiovascular",
    title: "Restrizioni locali ai grassi trans nella ristorazione e ricoveri cardiovascolari",
    authority: "New York City Board of Health e sei county health departments dello Stato di New York",
    territory: "New York City e contee di Westchester, Nassau, Albany, Suffolk, Rockland e Broome",
    country: "Stati Uniti",
    implementationYear: "2007–2011 (adozione scaglionata delle restrizioni locali)",
    problem:
      "Elevata esposizione alimentare agli acidi grassi trans artificiali, associati a maggiore rischio cardiovascolare, in un contesto in cui ristoranti e altri esercizi di somministrazione utilizzavano ancora oli parzialmente idrogenati.",
    measure:
      "Restrizioni locali all'uso di grassi trans artificiali negli esercizi di ristorazione. New York City introdusse una soglia inferiore a 0,5 g per porzione con implementazione in due fasi dal luglio 2007 e luglio 2008; altri county health departments dello Stato adottarono misure analoghe tra il 2008 e il 2011.",
    mechanism:
      "Rimuovere una fonte evitabile di esposizione ai grassi trans nella ristorazione imponendo la riformulazione degli ingredienti e verificando la conformità durante i controlli sanitari, con l'obiettivo di ridurre nel tempo infarto miocardico e ictus nella popolazione.",
    population:
      "Residenti di undici contee altamente urbanizzate dello Stato di New York soggette a restrizioni locali, confrontati con residenti di venticinque contee altamente urbanizzate senza restrizioni nel periodo di studio.",
    primaryArea: "salute_pubblica_locale",
    secondaryAreas: ["capacita_amministrativa_personale"],
    interventionTypes: ["regolazione", "enforcement_controllo", "informazione_trasparenza"],
    tools: [
      "limite regolatorio ai grassi trans per porzione",
      "implementazione in fasi",
      "controlli negli esercizi alimentari",
      "verifica di etichette e ingredienti",
      "comunicazione agli operatori",
    ],
    territorialScale: "Città / contea",
    interventionStatus:
      "Le restrizioni locali furono implementate tra 2007 e 2011. Successivamente la rimozione federale degli oli parzialmente idrogenati dalla catena alimentare statunitense ha in larga parte superato la funzione autonoma di queste regole locali. Il caso è archiviato come precedente di policy locale e valutazione causale, non come leva attuale identica per un comune italiano.",
    evaluationMethod:
      "Quasi-esperimento panel 2002–2013 con adozione scaglionata. Lo studio confronta undici contee altamente urbanizzate con restrizioni e venticinque contee analogamente urbanizzate senza restrizioni, usando effetti fissi di contea e anno, trend lineari specifici per contea e aggiustamenti demografici/di commuting. Analizza il cambiamento dei ricoveri per infarto miocardico e ictus almeno tre anni dopo l'entrata in vigore.",
    comparator:
      "Venticinque contee altamente urbanizzate dello Stato di New York senza restrizioni locali ai grassi trans nel periodo valutato.",
    outcomes: [
      "ricoveri per infarto miocardico",
      "ricoveri per ictus",
      "ricoveri combinati per infarto o ictus",
    ],
    results:
      "Tre o più anni dopo l'implementazione, le contee con restrizioni mostrano un declino più rapido dei ricoveri cardiovascolari rispetto alle contee di confronto. L'effetto è statisticamente significativo per l'outcome combinato e per l'infarto miocardico. La stima sull'ictus è nella stessa direzione ma non raggiunge la significatività statistica convenzionale.",
    effectSize:
      "A ≥3 anni dall'implementazione: ricoveri per infarto o ictus combinati −6,2% (IC95% −9,2% a −3,2%; p<0,001); infarto miocardico −7,8% (IC95% −12,7% a −2,8%; p=0,002); ictus −3,6% (IC95% −7,6% a +0,4%; p=0,08), quindi non statisticamente significativo. Le analisi di sensibilità che escludono New York City mantengono un'associazione significativa per l'outcome combinato.",
    evidenceStrength: "forte",
    costsRequirements:
      "Servono base regolatoria, comunicazione agli operatori, periodo di transizione, capacità ispettiva e verifica di ingredienti/etichette. Gli esercizi devono riformulare prodotti o approvvigionamenti. Il costo pubblico marginale può essere contenuto se il controllo è integrato nelle ispezioni alimentari ordinarie, ma il costo di compliance ricade anche sugli operatori.",
    limitations: [
      "L'adozione delle restrizioni non è randomizzata; pur con effetti fissi, trend specifici e analisi di sensibilità, resta possibile confondimento residuo da altre politiche o cambiamenti concomitanti.",
      "L'effetto è stimato aggregando più giurisdizioni locali con tempi e implementazioni non perfettamente identici; non è un effect size specifico della sola New York City.",
      "La stima sull'ictus isolato non è statisticamente significativa e non va presentata come beneficio causale dimostrato.",
      "La successiva regolazione federale degli oli parzialmente idrogenati limita la trasferibilità contemporanea dello stesso strumento negli Stati Uniti e rende il caso soprattutto un precedente di policy design locale.",
      "Il quadro delle competenze sanitarie e alimentari dei comuni italiani differisce sostanzialmente da quello dei local health departments statunitensi.",
    ],
    unintendedEffects:
      "Costi di riformulazione e sostituzione degli ingredienti per gli operatori; rischio di sostituzione con alternative non necessariamente ottimali dal punto di vista nutrizionale. La valutazione misura ricoveri cardiovascolari, non la qualità complessiva della dieta o gli effetti economici sugli esercizi.",
    primarySource: {
      label: "New York City — case study della restrizione sui grassi trans",
      url: "https://www.nyc.gov/html/ia/gprb/downloads/pdf/NYC_Health_TransFat.pdf",
    },
    evaluationStudies: [
      {
        label: "JAMA Cardiology — studio originale",
        url: "https://jamanetwork.com/journals/jamacardiology/fullarticle/2618359",
        citation: "Brandt EJ, Myerson R, Perraillon MC, Polonsky TS (2017), Hospital Admissions for Myocardial Infarction and Stroke Before and After the Trans-Fatty Acid Restrictions in New York",
        doi: "10.1001/jamacardio.2017.0491",
      },
    ],
    lastVerifiedAt: "2026-09-19",
    transferabilityItaly:
      "Limitata per una replica regolatoria generalizzata: non si può presumere che un comune italiano abbia il potere di vietare autonomamente specifici ingredienti nell'intera ristorazione. È però trasferibile il principio di usare standard nutrizionali verificabili nelle mense, nei distributori, negli eventi o nelle concessioni sotto controllo comunale e di coordinare eventuali controlli sanitari con ASP e autorità competenti.",
    lameziaAdaptation:
      "Non proporre un divieto comunale generalizzato. Partire dagli ambienti sotto controllo dell'ente — mense, vending, concessioni, catering per eventi e strutture comunali — definendo standard nutrizionali coerenti con il quadro nazionale/europeo e clausole verificabili di procurement. Monitorare composizione dei prodotti, sostituzioni e costi; se si vuole valutare l'effetto, usare un rollout per sedi o contratti e outcome di acquisto/consumo, senza pretendere di osservare nel breve periodo ricoveri cardiovascolari attribuibili al Comune.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "mappa di mense, distributori e concessioni comunali",
      "specifiche nutrizionali e base giuridica applicabile",
      "dati di acquisto e composizione dei prodotti",
      "capacità di verifica contrattuale e ispettiva",
      "monitoraggio di sostituzioni e costi per operatori",
    ],
    tags: ["grassi trans", "ristorazione", "salute cardiovascolare", "regolazione locale", "quasi-esperimento", "New York"],
    revisionHistory: [
      {
        date: "2026-09-19",
        note: "Prima verifica e inserimento; separati l'effetto significativo su infarto/outcome combinato dal risultato non significativo sull'ictus e limitata la trasferibilità regolatoria al contesto italiano.",
      },
    ],
  },
  {
    id: "chicago-predictive-food-inspection-prioritization",
    title: "Prioritizzazione predittiva delle ispezioni alimentari",
    authority: "City of Chicago — Department of Public Health e Department of Innovation and Technology",
    territory: "Chicago, Illinois",
    country: "Stati Uniti",
    implementationYear: "2014–2015 (sviluppo e pilot); uso operativo per prioritizzare le canvass inspections dal 2015",
    problem:
      "Il Chicago Department of Public Health doveva ispezionare migliaia di esercizi alimentari con meno di tre dozzine di ispettori; l'ordine operativo tradizionale non identificava necessariamente per primi gli esercizi con violazioni critiche e quindi prolungava l'esposizione potenziale dei clienti.",
    measure:
      "Modello predittivo che assegna un risk score agli esercizi alimentari combinando dati storici di ispezione e licenza con altre fonti amministrative e ambientali. Il punteggio viene usato per ordinare le routine canvass inspections, lasciando invariati gli obblighi di frequenza per le diverse classi di rischio e senza sostituire l'ispezione umana.",
    mechanism:
      "Concentrare prima la limitata capacità ispettiva sugli esercizi con maggiore probabilità stimata di violazioni critiche, riducendo il tempo che intercorre prima dell'individuazione e correzione dei rischi più seri.",
    population:
      "Oltre diecimila esercizi alimentari di Chicago inclusi nel sistema di scoring; la valutazione originale si concentra sulle routine canvass inspections e su un test out-of-sample di 60 giorni.",
    primaryArea: "capacita_amministrativa_personale",
    secondaryAreas: ["digitalizzazione_servizi_online", "salute_pubblica_locale"],
    interventionTypes: ["targeting_data_analytics", "modifica_organizzativa_processo", "infrastruttura_digitale"],
    tools: [
      "risk scoring predittivo",
      "storico delle ispezioni",
      "licenze commerciali",
      "segnalazioni sanitarie e ambientali",
      "dati meteo e di contesto",
      "prioritizzazione della coda di ispezione",
      "codice e dati open source",
    ],
    territorialScale: "Città / portafoglio di ispezioni",
    interventionStatus:
      "Il City of Chicago reporta che dal 2015 il modello iniziò a essere usato per prioritizzare le canvass inspections. Il programma di ispezioni e il relativo open dataset restano attivi nel 2026; l'uso in produzione dell'esatta versione 2015 del modello non è stato verificato come invariato e non viene quindi assunto nel record.",
    evaluationMethod:
      "Valutazione operativa out-of-sample su 60 giorni: un modello addestrato su periodi precedenti riassegna l'ordine delle ispezioni già osservate e confronta il tempo cumulato necessario a trovare le violazioni critiche con l'ordine Business As Usual. È una validazione temporale e controfattuale di prioritizzazione, non un randomized field trial e non assegna casualmente gli esercizi a due diverse strategie reali di ispezione.",
    comparator: "Ordine Business As Usual effettivamente usato dal Chicago Department of Public Health nello stesso periodo di test.",
    outcomes: [
      "giorni necessari per individuare esercizi con violazioni critiche",
      "quota di violazioni critiche individuata nella prima metà della sequenza di ispezioni",
      "efficienza operativa della coda di ispezione",
    ],
    results:
      "Nel test di 60 giorni l'ordinamento data-driven identifica in media gli esercizi con violazioni critiche circa una settimana prima rispetto all'ordine Business As Usual. Circa il 69% degli esercizi con violazioni critiche viene individuato nella prima metà della sequenza ordinata dal modello. Il risultato dimostra un miglioramento di prioritizzazione operativa, non una riduzione causalmente dimostrata delle malattie trasmesse da alimenti.",
    effectSize:
      "Circa 7 giorni prima, in media, per l'individuazione di violazioni critiche nel test out-of-sample di 60 giorni; circa 69% degli esercizi con violazioni critiche individuato nella prima metà delle ispezioni ordinate dal modello. La metrica riguarda il time-to-detection e la resa della sequenza di ispezione, non l'incidenza di foodborne illness.",
    evidenceStrength: "moderata",
    costsRequirements:
      "Richiede storico affidabile di ispezioni e relativi esiti, identificativi stabili degli esercizi, infrastruttura dati, capacità di modellazione e manutenzione, integrazione con il workflow degli ispettori e monitoraggio di drift, falsi negativi e disparità territoriali. Il modello originale fu sviluppato anche con supporto esterno, ma il codice e la pipeline furono resi open source.",
    limitations: [
      "La valutazione non è un trial randomizzato sul campo: riordina controfattualmente una stessa coda di ispezioni sulla base di outcome osservati in un test out-of-sample.",
      "L'outcome è l'individuazione più rapida di violazioni critiche, non una riduzione direttamente misurata di malattie, ricoveri o altri esiti sanitari.",
      "La qualità predittiva può degradarsi nel tempo per cambiamenti di regole, comportamenti e dati; Chicago ha modificato le procedure del food code nel 2018, rendendo necessario ricalibrare qualunque modello storico.",
      "Variabili di quartiere, segnalazioni o altri proxy possono introdurre bias geografici o sociali; il punteggio deve supportare, non sostituire, il giudizio ispettivo e deve essere sottoposto ad audit di equità.",
      "Non è stato verificato che l'esatta versione del modello del 2015 sia ancora quella utilizzata operativamente nel 2026.",
    ],
    unintendedEffects:
      "Rischio di concentrare controlli ripetuti sugli stessi territori o profili di esercizio, di trascurare falsi negativi e di creare feedback loop nei dati ispettivi. Una governance robusta richiede human review, quota di ispezioni non guidate dal modello, monitoraggio geografico e retraining periodico.",
    primarySource: {
      label: "City of Chicago — repository ufficiale Food Inspections Evaluation",
      url: "https://github.com/Chicago/food-inspections-evaluation",
    },
    evaluationStudies: [
      {
        label: "City of Chicago — reproducible evaluation report",
        url: "https://github.com/Chicago/food-inspections-evaluation/blob/master/REPORTS/forecasting-restaurants-with-critical-violations-in-Chicago.Rmd",
        citation: "Schenk T Jr, Leynes G, Solanki A, Collins S, Smart G, Albright B, Crippin D, Forecasting restaurants with critical violations in Chicago",
      },
    ],
    lastVerifiedAt: "2026-09-19",
    transferabilityItaly:
      "Alta per il principio di prioritizzazione di una coda ispettiva, ma solo dove l'ente ha una competenza ispettiva reale e dati storici sufficienti. La sicurezza alimentare in Italia coinvolge soprattutto ASL/ASP e altre autorità, quindi un comune non dovrebbe replicare autonomamente il caso senza partnership. Il medesimo approccio può essere più direttamente applicabile a controlli comunali su rifiuti, occupazione di suolo, manutenzione, edilizia o altri procedimenti di competenza dell'ente, con adeguate garanzie procedurali.",
    lameziaAdaptation:
      "Non partire da un modello opaco. Selezionare un processo ispettivo comunale ad alto volume con outcome chiaro e storico sufficiente; costruire prima una baseline con regole trasparenti e pochi predittori verificabili; validare il ranking su dati futuri e poi, se la performance è utile, usare un rollout controllato o stepped-wedge. Misurare violazioni materiali individuate per giornata ispettiva, tempo alla scoperta, falsi negativi, concentrazione geografica, reclami e differenze fra gruppi. Mantenere sempre una quota di controlli casuali o non guidati dal modello per evitare feedback loop e preservare capacità di audit.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "storico strutturato delle ispezioni e degli esiti",
      "identificativi stabili di esercizi/asset",
      "workflow digitale della coda ispettiva",
      "capacità analitica e validazione out-of-sample",
      "human oversight e procedura di override",
      "monitoraggio di drift, bias e falsi negativi",
      "quota di controlli casuali per audit",
    ],
    tags: ["ispezioni", "predictive analytics", "risk scoring", "Chicago", "open source", "capacità amministrativa", "food safety"],
    revisionHistory: [
      {
        date: "2026-09-19",
        note: "Prima verifica e inserimento; classificata l'evidenza come moderata perché il pilot è una validazione out-of-sample di prioritizzazione e non un RCT sul campo, e mantenuto separato il time-to-detection dagli outcome sanitari.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
