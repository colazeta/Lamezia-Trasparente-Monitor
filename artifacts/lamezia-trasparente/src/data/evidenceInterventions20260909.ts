import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_09 = [
  {
    id: "nyc-automated-speed-cameras-road-safety",
    title: "Autovelox automatici nelle zone scolastiche con rollout guidato dai dati",
    authority: "New York City Department of Transportation (NYC DOT)",
    territory: "New York City, New York",
    country: "Stati Uniti",
    implementationYear: "Pilot dal 2014; espansioni 2019–2022; autorizzazione rinnovata fino al 2030",
    problem:
      "Velocità eccessiva associata a collisioni, feriti e morti sulle strade urbane, con particolare attenzione alle aree scolastiche e alla necessità di enforcement continuo senza aumentare i contatti di polizia.",
    measure:
      "Rete di sistemi automatici di rilevazione della velocità collocati nelle school speed zones. Il programma è cresciuto da 20 zone pilota a 750 zone con oltre 2.200 telecamere; dal 1 agosto 2022 l'enforcement è operativo 24 ore su 24 e 7 giorni su 7. Le immagini riguardano veicolo e targa, non il conducente, e ogni violazione viene verificata da personale NYC DOT prima dell'emissione della sanzione.",
    mechanism:
      "Aumentare in modo prevedibile e uniforme la probabilità di sanzione per velocità eccessiva induce adattamento del comportamento di guida. Il rollout scaglionato e il posizionamento informato da dati di sicurezza concentrano l'enforcement nei luoghi a maggior rischio.",
    population:
      "Conducenti e utenti della strada nelle aree circostanti le speed camera di New York City; lo studio causale utilizza circa 2.000 camere attivate tra 2014 e 2023, oltre 700.000 collisioni, 200.000 feriti e 18 milioni di violazioni.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["sicurezza_urbana_prevenzione", "salute_pubblica_locale", "digitalizzazione_servizi_online"],
    interventionTypes: ["enforcement_controllo", "infrastruttura_digitale", "targeting_data_analytics"],
    tools: ["radar/laser", "lettura targhe", "Notice of Liability", "verifica umana della violazione", "crash data", "rollout scaglionato", "monitoraggio delle violazioni"],
    territorialScale: "Intersezione/corridoio; rete cittadina di zone scolastiche",
    interventionStatus:
      "Operativo. Nel giugno 2025 lo Stato di New York ha esteso fino al 2030 l'autorizzazione del programma NYC school-zone speed cameras. La rete cittadina resta parte della strategia Vision Zero.",
    evaluationMethod:
      "Difference-in-differences con adozione scaglionata: le intersezioni appena trattate vengono confrontate con intersezioni strutturalmente simili destinate a ricevere la telecamera in un momento successivo. L'analisi segue il rollout 2014–2023, utilizza buffer di 900 piedi e verifica robustezza a COVID-19, ampiezza dei buffer, finestre post-trattamento, covariate, placebo e spillover.",
    comparator:
      "Intersezioni non ancora trattate nello stesso periodo, ma successivamente incluse nel rollout delle telecamere, usate come controfattuale nel disegno staggered DiD.",
    outcomes: ["collisioni", "feriti da collisione", "violazioni per eccesso di velocità", "dinamica temporale dell'effetto"],
    results:
      "L'attivazione delle telecamere riduce in modo persistente collisioni e feriti nei mesi successivi e produce un rapido calo delle violazioni. Le stime accademiche sono coerenti con le evidenze amministrative NYC DOT, ma il record privilegia il disegno quasi-sperimentale per quantificare l'effetto causale.",
    effectSize:
      "Studio PNAS: collisioni −5% al mese in media nei primi sette mesi (IC95% −6,8% a −3,2%), pari a circa −30% cumulato; feriti −2,5% al mese (IC95% −4,3% a −0,6%), circa −16% cumulato. Le violazioni diminuiscono di quasi il 50% entro cinque mesi. Il report NYC DOT documenta inoltre −94% di violazioni giornaliere per camera rispetto all'avvio del programma, dato descrittivo di lungo periodo e non equivalente alla stima DiD.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede base giuridica, dispositivi omologati, progettazione dei siti, connessione e manutenzione, revisione umana delle violazioni, gestione ricorsi e protezione dei dati. NYC DOT riporta per FY2014–2023 circa 472,9 milioni USD di costi operativi e 185,8 milioni di costi di capitale su una rete di scala eccezionalmente maggiore di quella di un comune medio.",
    limitations: [
      "Il rollout non è randomizzato: il disegno staggered DiD usa siti non ancora trattati come controllo e numerose robustness checks, ma dipende comunque dalle assunzioni di identificazione del quasi-esperimento.",
      "Gli effect size causali sono stimati soprattutto nella finestra dei primi sette mesi; gli autori non estrapolano automaticamente la stessa dinamica a orizzonti più lunghi.",
      "Le stime di New York non possono essere trasferite meccanicamente a strade con volumi, velocità, geometria e intensità di enforcement diversi.",
      "In Italia localizzazione, autorizzazione e uso dei dispositivi automatici dipendono dal Codice della strada, dalla disciplina tecnica e dalle competenze applicabili; la fattibilità va verificata puntualmente.",
      "Sanzioni automatiche possono avere effetti distributivi e problemi di elusione tramite targhe oscurate o irregolari; il disegno deve prevedere equità, ricorso e audit."
    ],
    unintendedEffects:
      "Rischi principali: spostamento della velocità verso segmenti non coperti, incentivi fiscali perversi se il programma dipende dalle entrate, oneri regressivi e contestazioni di privacy/due process. NYC separa il compenso del vendor dal gettito e destina le entrate al fondo generale, riducendo l'incentivo a massimizzare le multe.",
    primarySource: {
      label: "NYC DOT — New York City Automated Speed Enforcement Program: 2024 Report",
      url: "https://www.nyc.gov/html/dot/downloads/pdf/speed-camera-report.pdf"
    },
    evaluationStudies: [
      {
        label: "PNAS / PubMed Central",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12718322/",
        citation: "Stagoff-Belfort A, Ben-Menachem J, Beck B (2025), Can speed cameras make streets safer? Quasi-experimental evidence from New York City",
        doi: "10.1073/pnas.2520328122"
      },
      {
        label: "New York State — renewal through 2030",
        url: "https://www.governor.ny.gov/news/keeping-families-safe-governor-signs-legislation-extending-new-york-city-school-speed-camera",
        citation: "Governor of New York (2025), legislation extending New York City's school-zone speed camera program through 2030"
      }
    ],
    lastVerifiedAt: "2026-09-09",
    transferabilityItaly:
      "Media. Il principio di enforcement automatico guidato da dati su velocità e incidentalità è trasferibile, ma poteri, autorizzazioni, collocazione e tecnologia sono fortemente regolati. Il valore maggiore per un comune italiano è l'integrazione tra diagnosi del rischio, selezione trasparente dei siti, enforcement coerente e valutazione controfattuale.",
    lameziaAdaptation:
      "Costruire prima una mappa di incidenti, feriti, velocità rilevate, scuole e attraversamenti; identificare pochi corridoi ad alto rischio e verificare con Prefettura/Polizia locale e uffici tecnici quali strumenti automatici siano giuridicamente e tecnicamente utilizzabili. Se fattibile, introdurre i dispositivi per fasi, conservando segmenti comparabili come controllo e misurando velocità, collisioni, feriti e displacement, senza usare il gettito come KPI di successo.",
    implementability: "strutturale",
    capacityDataNeeds: ["microdati georeferenziati sugli incidenti", "rilievi di velocità", "rete stradale e scuole", "quadro autorizzativo e omologazioni", "gestione ricorsi", "monitoraggio displacement ed equità"],
    tags: ["sicurezza stradale", "speed camera", "Vision Zero", "enforcement automatico", "difference-in-differences", "scuole", "New York City"],
    revisionHistory: [{ date: "2026-09-09", note: "Prima verifica; separate le stime causali PNAS dai trend descrittivi NYC DOT e verificato il rinnovo del programma fino al 2030." }]
  },
  {
    id: "yokohama-property-tax-automatic-debit-nudge",
    title: "Semplificazione e nudge per l'adesione all'addebito automatico dell'imposta immobiliare",
    authority: "City of Yokohama — Totsuka, Konan e Kanazawa wards / municipal tax administration",
    territory: "Yokohama, Kanagawa",
    country: "Giappone",
    implementationYear: "Esperimenti 2020 e 2021; studio pubblicato nel 2026",
    problem:
      "I contribuenti immobiliari devono compiere ripetutamente un'azione di pagamento e l'adesione all'addebito automatico può essere frenata da documenti complessi e dal costo di reperire il codice proprietario necessario alla domanda.",
    measure:
      "Invio ai nuovi contribuenti di materiale postale semplificato che rende salienti i benefici dell'addebito automatico, visualizza una procedura passo-passo e include una scadenza non vincolante. Alcuni gruppi ricevono anche direttamente il codice proprietario necessario alla domanda, riducendo una frizione amministrativa. Il secondo esperimento varia separatamente flyer, codice ed envelope design.",
    mechanism:
      "Combinare aumento della salienza/beneficio percepito con riduzione concreta del costo di compilazione. Il flyer facilita comprensione e azione; fornire il codice evita di doverlo cercare in precedenti avvisi. L'ipotesi è che le due componenti siano complementari.",
    population:
      "Nuovi contribuenti dell'imposta immobiliare. Primo esperimento: 3.184 contribuenti di Totsuka-ku. Secondo esperimento: 7.621 contribuenti di Totsuka-ku, Konan-ku e Kanazawa-ku.",
    primaryArea: "fiscalita_entrate_riscossione",
    secondaryAreas: ["digitalizzazione_servizi_online", "capacita_amministrativa_personale"],
    interventionTypes: ["nudging_comunicazione", "modifica_organizzativa_processo", "informazione_trasparenza"],
    tools: ["direct mail", "flyer semplificato", "owner code precompilato/incluso", "application form", "busta preaffrancata", "randomizzazione", "dati amministrativi sui pagamenti"],
    territorialScale: "Contribuente / ward municipale",
    interventionStatus:
      "Gli esperimenti sono conclusi; il sistema di addebito automatico dei tributi di Yokohama resta operativo e include l'imposta immobiliare e la city planning tax. Le fonti verificate non dimostrano che lo specifico nudge sperimentale sia oggi inviato sistematicamente a tutti i nuovi contribuenti.",
    evaluationMethod:
      "Due natural field experiments randomizzati. Nel 2020 a Totsuka-ku tre gruppi ricevono rispettivamente nudge flyer + owner code, flyer standard, o nessun invio. Nel 2021 7.621 nuovi contribuenti in tre wards vengono randomizzati in cinque gruppi per identificare separatamente l'effetto del flyer, dell'owner code e della busta. Le stime usano linear probability models, balance checks, controlli e correzione FDR per confronti multipli.",
    comparator:
      "Gruppi randomizzati che ricevono materiale standard o nessun mailing; nel secondo esperimento confronti fattoriali tra flyer nudge/standard, owner code incluso/non incluso e busta nudge/standard.",
    outcomes: ["domanda di adesione all'addebito automatico", "pagamento entro la scadenza", "eterogeneità per residenza/co-proprietà"],
    results:
      "Il materiale semplificato e la riduzione della frizione documentale aumentano l'adesione all'addebito automatico. La busta modificata non produce un effetto rilevabile. Crucialmente, nel periodo osservato non emerge alcun miglioramento statisticamente rilevabile del pagamento puntuale: il record non interpreta quindi l'aumento delle adesioni come prova di maggiore compliance fiscale.",
    effectSize:
      "Primo esperimento: nudge flyer + owner code +8,8 punti percentuali nella probabilità di fare domanda per l'addebito automatico; flyer standard +7,3 p.p. rispetto a nessun invio. Secondo esperimento: nudge flyer +2,7 p.p. e owner code +2,8 p.p. separatamente (entrambi significativi al 5% dopo correzione FDR); nudge envelope circa zero. Effetti sul pagamento puntuale: vicini a zero e non statisticamente significativi nei periodi osservati.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Intervento a basso costo se l'ente dispone già di anagrafica tributaria, canale postale/digitale e addebito automatico. Richiede soprattutto redesign della comunicazione, possibilità di precompilare o fornire identificativi necessari, capacità di randomizzazione e misurazione. La stima pubblicata non fornisce un costo unitario completo né dimostra risparmi amministrativi effettivamente realizzati.",
    limitations: [
      "Il risultato positivo riguarda l'adozione del metodo di pagamento, non il gettito o la puntualità: l'outcome di on-time payment è nullo nel periodo osservato.",
      "Il primo esperimento combina flyer e owner code e non identifica separatamente i due meccanismi; il secondo esperimento li separa ma produce effect size più piccoli.",
      "I contribuenti erano nuovi proprietari e la baseline di morosità era bassa, limitando la capacità di rilevare effetti sulla compliance.",
      "Il contesto giapponese di imposta immobiliare, avvisi e codici amministrativi differisce dalla fiscalità comunale italiana; va trasferito il principio di rimozione delle frizioni, non il modulo specifico.",
      "Lo studio è un RIETI Discussion Paper 2026; il disegno sperimentale è forte, ma il record deve essere aggiornato se emergerà una versione peer-reviewed o un follow-up più lungo."
    ],
    unintendedEffects:
      "L'automazione dei pagamenti può aumentare il rischio di addebiti non coperti o errori operativi e richiede procedure chiare di modifica/revoca. Un nudge efficace sull'adesione può inoltre spostare utenti che avrebbero comunque pagato puntualmente senza produrre benefici fiscali netti.",
    primarySource: {
      label: "City of Yokohama — pagamento tramite addebito automatico",
      url: "https://www.city.yokohama.lg.jp/city-info/zaisei/kaikei/nofu/kouza.html"
    },
    evaluationStudies: [
      {
        label: "RIETI Discussion Paper 26-E-023",
        url: "https://www.rieti.go.jp/en/publications/summary/26030006.html",
        citation: "Nishihata M, Kobayashi Y, Ishikawa T (2026), Nudging Automatic Debit for Property Tax: Evidence from two natural field experiments"
      },
      {
        label: "RIETI full paper",
        url: "https://www.rieti.go.jp/jp/publications/dp/26e023.pdf",
        citation: "RIETI Discussion Paper Series 26-E-023, March 2026"
      }
    ],
    lastVerifiedAt: "2026-09-09",
    transferabilityItaly:
      "Alta per il principio di amministrazione comportamentale: semplificare, precompilare e rimuovere un passaggio documentale può aumentare l'adozione di un canale amministrativamente più efficiente. La trasferibilità dell'effetto su compliance/gettito è invece non dimostrata.",
    lameziaAdaptation:
      "Su un pagamento ricorrente gestito dal Comune, identificare una procedura opzionale ma conveniente che soffre di basso take-up per frizioni informative o dati che l'ente possiede già. Testare randomicamente: comunicazione standard; comunicazione semplificata; comunicazione + campo/codice precompilato. Misurare adesione, puntualità effettiva, insoluti, richieste di assistenza e costo amministrativo per almeno 12 mesi, mantenendo esplicitamente distinto il successo di take-up dal successo di riscossione.",
    implementability: "quick_win",
    capacityDataNeeds: ["anagrafica dei contribuenti", "dati sul metodo e puntualità dei pagamenti", "procedura di addebito automatico o equivalente", "possibilità di precompilazione", "randomizzazione e protocollo di outcome"],
    tags: ["tributi locali", "addebito automatico", "nudge", "semplificazione", "field experiment", "compliance", "Yokohama", "EBPM"],
    revisionHistory: [{ date: "2026-09-09", note: "Prima verifica; registrati separatamente gli effetti su take-up e il risultato nullo sull'on-time payment, evitando di inferire un aumento di gettito non osservato." }]
  },
  {
    id: "new-orleans-code-enforcement-early-courtesy-letter-rct",
    title: "Avviso di cortesia anticipato per accelerare la conformità alle violazioni edilizie",
    authority: "City of New Orleans — Code Enforcement",
    territory: "New Orleans, Louisiana",
    country: "Stati Uniti",
    implementationYear: "Field experiment 2016–2017 circa; processo di code enforcement cittadino tuttora operativo",
    problem:
      "Nel processo tradizionale il proprietario poteva apprendere l'esistenza della segnalazione solo al momento della prima ispezione, perdendo settimane utili per correggere problemi semplici e aumentando la probabilità di ulteriori ispezioni, udienze e costi amministrativi.",
    measure:
      "Invio, subito dopo una segnalazione 311 e prima dell'ispezione, di una lettera di cortesia senza valore sanzionatorio che informa il proprietario della segnalazione, annuncia l'ispezione imminente e presenta in modo semplice e saliente ciò che può fare per verificare e correggere il problema.",
    mechanism:
      "Ridurre learning costs e procrastinazione fornendo informazione prima, istruzioni più chiare e più tempo per agire. L'aggiunta di un passaggio leggero a monte mira a evitare passaggi più onerosi a valle, come ripetute ispezioni e hearing.",
    population:
      "Proprietà oggetto di segnalazioni 311 per possibili violazioni del housing/code enforcement. Nel trial New Orleans: 1.153 proprietà, 616 controllo e 537 trattamento.",
    primaryArea: "capacita_amministrativa_personale",
    secondaryAreas: ["urbanistica_rigenerazione", "housing_politiche_abitative"],
    interventionTypes: ["nudging_comunicazione", "modifica_organizzativa_processo", "informazione_trasparenza"],
    tools: ["311", "case management", "courtesy letter", "call-to-action", "scadenza/anticipazione", "ispezione", "randomizzazione"],
    territorialScale: "Singola proprietà / processo cittadino di code enforcement",
    interventionStatus:
      "Il trial è concluso. New Orleans mantiene un processo strutturato di Code Enforcement basato su 311, case management, ispezioni e administrative hearings; la fonte municipale corrente non consente però di affermare che la stessa courtesy letter sperimentale sia oggi uno step standard per ogni caso.",
    evaluationMethod:
      "Randomized field experiment in collaborazione con la City of New Orleans. Le proprietà segnalate vengono assegnate a trattamento o business-as-usual; il trattamento riceve la courtesy letter prima dell'ispezione. L'outcome è compliance/progresso rilevato alla prima visita dell'ispettore. I gruppi risultano sostanzialmente bilanciati e hanno quasi identico tempo medio fino all'ispezione; le stime OLS controllano giorni, mese e caratteristiche disponibili.",
    comparator:
      "Proprietà segnalate assegnate casualmente al processo ordinario, senza lettera anticipata prima della prima ispezione.",
    outcomes: ["conformità o lavori in corso alla prima ispezione", "violazioni persistenti", "passaggio a ulteriori ispezioni/hearing", "costo amministrativo evitabile"],
    results:
      "La comunicazione anticipata aumenta la probabilità che alla prima ispezione la proprietà sia già conforme o mostri lavori in corso. Il paper stima inoltre un ritorno amministrativo positivo perché la lettera costa poco rispetto alle risorse richieste dai casi che proseguono verso enforcement più oneroso.",
    effectSize:
      "Compliance alla prima ispezione: +6,23 punti percentuali rispetto a una baseline di controllo di circa 42,4%, equivalente a +14,7% in termini relativi. Il paper stima circa 1 USD di costo completo per lettera e, applicando l'effetto al campione di controllo e un costo municipale stimato di 402 USD per late compliance, circa 36.000 USD annui di risorse risparmiabili nel contesto New Orleans; questa è una stima modellata, non un risparmio di bilancio osservato ex post.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Richiede un trigger amministrativo precoce (per esempio segnalazione/ticket), anagrafica o recapito affidabile del responsabile, template semplice, workflow automatico e collegamento con il calendario ispettivo. Il costo marginale della comunicazione è basso; il principale requisito è processuale e informativo.",
    limitations: [
      "L'esperimento riguarda housing/code enforcement statunitense e una fase molto specifica del procedimento; non prova che una lettera simile funzioni per ogni tipo di illecito o procedimento comunale.",
      "Il trattamento combina più elementi comportamentali — semplicità, call-to-action, personalizzazione, tempo e salienza — quindi non identifica quale singolo elemento generi l'effetto.",
      "La misura di successo include sia piena conformità sia lavori in corso; non equivale necessariamente a chiusura definitiva del caso.",
      "La stima di risparmio usa ipotesi sui costi amministrativi e sull'applicazione dell'effect size; non è un outcome randomizzato di spesa pubblica.",
      "Le cause strutturali del degrado, inclusa incapacità economica di effettuare lavori, non sono risolte da una comunicazione migliore."
    ],
    unintendedEffects:
      "Un avviso anticipato basato soltanto su una segnalazione non verificata potrebbe essere percepito come una contestazione già accertata. La comunicazione deve quindi dichiarare chiaramente che non costituisce un finding di violazione, prevedere canali di chiarimento e non sostituire l'ispezione formale.",
    primarySource: {
      label: "City of New Orleans — Fighting Blight: What is the Process?",
      url: "https://nola.gov/next/code-enforcement/topics/fighting-blight-what-is-the-process"
    },
    evaluationStudies: [
      {
        label: "Journal of Policy Analysis and Management",
        url: "https://onlinelibrary.wiley.com/doi/10.1002/pam.22178",
        citation: "Linos E, Quan LT, Kirkman E (2020), Nudging Early Reduces Administrative Burden: Three Field Experiments to Improve Code Enforcement",
        doi: "10.1002/pam.22178"
      },
      {
        label: "UC Berkeley archived study",
        url: "https://gspp.berkeley.edu/archived/files/research/pdf/JPAM_versionforResearchgate.pdf",
        citation: "Pre-publication manuscript with New Orleans design, balance checks and cost calculations"
      }
    ],
    lastVerifiedAt: "2026-09-09",
    transferabilityItaly:
      "Alta come principio di process redesign: informare prima e in modo più chiaro può ridurre il costo complessivo di un procedimento quando l'utente ha possibilità concreta di sanare rapidamente. La base giuridica e il wording devono però essere adattati al procedimento italiano e distinguere sempre segnalazione, accertamento e contestazione formale.",
    lameziaAdaptation:
      "Selezionare un procedimento comunale ad alto volume in cui esiste un intervallo tra trigger e sopralluogo/atto formale — per esempio alcune manutenzioni, occupazioni o violazioni sanabili di competenza locale. Randomizzare per alcuni mesi business-as-usual vs avviso informativo anticipato chiaramente non sanzionatorio, misurando conformità prima dell'ispezione, giorni/contatti per pratica, ricorsi, hearing evitati e costi. Escludere casi di pericolo immediato o che richiedono enforcement urgente.",
    implementability: "quick_win",
    capacityDataNeeds: ["ticket/segnalazioni con timestamp", "recapiti affidabili", "workflow e template legale", "esito delle ispezioni", "costi/tempi per fase", "randomizzazione e audit dei reclami"],
    tags: ["code enforcement", "administrative burden", "nudge", "311", "compliance", "RCT", "New Orleans", "process redesign"],
    revisionHistory: [{ date: "2026-09-09", note: "Prima verifica; effect size ricostruito come +6,23 p.p. / +14,7% relativo e separata la stima modellata di risparmio dall'outcome sperimentale." }]
  }
] as const satisfies readonly EvidenceIntervention[];
