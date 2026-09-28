import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_23 = [
  {
    id: "san-francisco-sfpark-demand-responsive-parking-pricing",
    title: "SFpark e pricing della sosta regolato dalla domanda",
    authority: "San Francisco Municipal Transportation Agency (SFMTA)",
    territory: "San Francisco",
    country: "Stati Uniti",
    implementationYear: "Pilot 2011–2013; programma demand-responsive adottato a scala cittadina nel 2017 e operativo nel 2026",
    problem:
      "Elevata occupazione di alcuni tratti di sosta, tempi di ricerca del parcheggio, circolazione indotta, doppia fila e uso inefficiente di spazi disponibili in strade o autorimesse vicine.",
    measure:
      "SFpark ha combinato parcometri intelligenti, dati sull'occupazione, informazione agli utenti e prezzi che aumentano o diminuiscono gradualmente per blocco e fascia oraria in funzione della domanda. Dopo il pilot, SFMTA ha adottato nel 2017 il demand-responsive pricing per i parcometri e i parcheggi sotto la propria gestione; nel 2026 gli aggiustamenti dei parcometri restano periodici e mirano a mantenere l'occupazione media fra il 60% e l'80%.",
    mechanism:
      "Usare il prezzo come segnale per distribuire la domanda di sosta nello spazio e nel tempo, mantenendo una piccola quota di posti disponibili nei tratti più richiesti. Una maggiore probabilità di trovare posto dovrebbe ridurre il cruising alla ricerca di parcheggio, mentre la disponibilità di dati e pagamento digitale riduce frizioni e rende l'adeguamento monitorabile.",
    population:
      "Automobilisti che utilizzano la sosta a pagamento e attività/utenti delle aree servite dai parcometri SFMTA. La valutazione del pilot confronta aree SFpark e aree di controllo e utilizza misure dirette del tempo e della distanza di ricerca del parcheggio.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["digitalizzazione_servizi_online", "ambiente_clima_energia"],
    interventionTypes: [
      "incentivo_economico",
      "infrastruttura_digitale",
      "targeting_data_analytics",
      "modifica_organizzativa_processo",
    ],
    tools: [
      "parcometri e sistemi di pagamento digitali",
      "stima dell'occupazione per blocco e fascia oraria",
      "aggiustamenti tariffari periodici",
      "target di occupazione 60–80%",
      "dati pubblici e valutazione con aree di controllo",
    ],
    territorialScale: "Cittadina, con tariffazione a livello di blocco/fascia oraria",
    interventionStatus:
      "Operativo. Il Board SFMTA ha adottato il Demand-Responsive Pricing Program il 5 dicembre 2017. Nel luglio 2026 SFMTA ha effettuato un nuovo aggiustamento cittadino delle tariffe, con variazioni di 0,25 USD in aumento sopra l'80% di occupazione e in diminuzione sotto il 60%.",
    evaluationMethod:
      "Valutazione quasi-sperimentale del pilot con aree di trattamento e controllo. L'analisi peer-reviewed preferita usa un difference-in-differences con generalized mixed-effects models su misure dirette di search time e search distance prima e dopo SFpark. La valutazione amministrativa SFMTA usa inoltre un ampio sistema di indicatori su occupazione, prezzi, citazioni, traffico e emissioni.",
    comparator:
      "Aree di San Francisco non incluse nel pilot SFpark nello stesso periodo, osservate prima e dopo l'introduzione del pricing demand-responsive.",
    outcomes: [
      "tempo di ricerca della sosta",
      "distanza percorsa alla ricerca della sosta",
      "occupazione e disponibilità dei posti",
      "tariffe medie",
      "citazioni per violazioni del parcometro",
      "vehicle miles travelled e gas serra da cruising",
    ],
    results:
      "L'analisi peer-reviewed difference-in-differences stima riduzioni medie di circa il 15% del tempo e del 12% della distanza percorsa alla ricerca di sosta. La valutazione SFMTA, più ampia ma da non trattare come un singolo effect size causale, riporta una riduzione del search time da 11,5 a 6,5 minuti, maggiore raggiungimento del target di disponibilità, meno blocchi completamente occupati, meno citazioni e una riduzione stimata del traffico e delle emissioni associati al cruising. Le tariffe medie non aumentarono nel pilot.",
    effectSize:
      "Peer-reviewed DiD: circa −15% nel parking search time e −12% nella search distance. Valutazione SFMTA del pilot: search time 11,5→6,5 minuti (−43% nel confronto amministrativo), target 60–80% raggiunto 31% più spesso, blocchi completamente occupati −16%, citazioni ai parcometri −23%, VMT/GHG da cruising circa −30%; tariffa media on-street −4% e garage −12%. Il −43% SFMTA non viene usato come stima causale preferita.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede dati affidabili su occupazione/domanda, parcometri o sistemi di pagamento capaci di applicare tariffe differenziate, regole trasparenti di aggiustamento, comunicazione agli utenti, capacità analitica e verifica degli effetti su residenti, attività economiche e utenti con disabilità. Il pilot SFpark fu una dimostrazione tecnologica e organizzativa di scala rilevante, quindi una replica integrale è più onerosa di un test su poche aree.",
    limitations: [
      "Il pilot non è un RCT: le aree SFpark e di controllo possono differire per caratteristiche non completamente osservate.",
      "La riduzione amministrativa del 43% del search time è maggiore della stima peer-reviewed DiD di circa 15%; per prudenza il record usa quest'ultima come riferimento causale principale.",
      "L'uso di prezzi dinamici può produrre effetti distributivi e spostamento della domanda verso strade limitrofe o sosta non regolata; questi effetti vanno misurati localmente.",
      "Il quadro giuridico, tariffario e di gestione della sosta di San Francisco non è direttamente trasferibile a un comune italiano.",
    ],
    unintendedEffects:
      "Possibile spostamento della sosta verso strade vicine non tariffate, aumento del costo per utenti vincolati a determinate destinazioni e percezione della misura come strumento di gettito se target e algoritmo tariffario non sono trasparenti.",
    primarySource: {
      label: "SFMTA — SFpark Evaluation",
      url: "https://www.sfmta.com/getting-around/drive-park/demand-responsive-pricing/sfpark-evaluation",
    },
    evaluationStudies: [
      {
        label: "Transportation Research Part A — difference-in-differences su cruising e pricing",
        url: "https://trid.trb.org/view/1509225",
        citation:
          "Alemi F, Rodier C, Drake C (2018), Cruising and on-street parking pricing: A difference-in-difference analysis of measured parking search time and distance in San Francisco, Transportation Research Part A 111:187–198",
        doi: "10.1016/j.tra.2018.03.007",
      },
      {
        label: "SFMTA — SFpark Pilot Project Evaluation",
        url: "https://www.sfmta.com/reports/sfpark-pilot-project-evaluation-report",
        citation: "San Francisco Municipal Transportation Agency (2014), SFpark Pilot Project Evaluation",
      },
      {
        label: "SFMTA — Demand-Responsive Parking Pricing Program",
        url: "https://www.sfmta.com/getting-around/drive-park/demand-responsive-pricing",
        citation: "San Francisco Municipal Transportation Agency, Demand-Responsive Parking Pricing Program",
      },
    ],
    lastVerifiedAt: "2026-09-23",
    transferabilityItaly:
      "Media. I comuni italiani dispongono di competenze sulla regolazione della sosta e possono usare tariffe differenziate entro il quadro normativo applicabile, ma una replica richiede verifica regolamentare, contrattuale e tecnologica. Il principio più trasferibile è definire un target esplicito di disponibilità e adeguare gradualmente prezzi o regole sulla base di dati, anziché massimizzare l'occupazione o il gettito.",
    lameziaAdaptation:
      "Costruire prima una baseline su occupazione, durata e turnover della sosta nelle aree centrali e presso poli ad alta domanda. Dove esistono parcometri e un quadro giuridico/contrattuale compatibile, testare su poche zone una tariffazione per fascia oraria o micro-area legata a un target di disponibilità pubblicato ex ante. Misurare occupazione, ricerca del posto, turnover, gettito, carico/scarico, accessibilità, reclami e possibili spostamenti sulle strade vicine; non usare il gettito come outcome primario.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "occupazione della sosta per blocco e fascia oraria",
      "dati di pagamento e durata della sosta",
      "mappa di residenti, carico/scarico e stalli accessibili",
      "regole trasparenti di adeguamento tariffario",
      "verifica giuridica e dei contratti di gestione",
      "misure di cruising, turnover e spillover",
    ],
    tags: ["San Francisco", "SFpark", "sosta", "pricing", "cruising", "parcometri", "difference-in-differences"],
    revisionHistory: [
      {
        date: "2026-09-23",
        note: "Prima verifica e inserimento; distinta la stima peer-reviewed DiD dalla più ampia valutazione amministrativa SFMTA del pilot.",
      },
    ],
  },
  {
    id: "lambeth-council-tax-bill-simplification-rct",
    title: "Semplificazione della bolletta Council Tax",
    authority: "London Borough of Lambeth",
    territory: "Lambeth, Londra",
    country: "Regno Unito",
    implementationYear: "RCT iniziale su bollette inviate a marzo; studio pubblicato nel 2018",
    problem:
      "Ritardi e mancati pagamenti della Council Tax, costi di riscossione e complessità comunicativa per residenti che devono identificare importo, scadenza e azione richiesta.",
    measure:
      "Randomizzazione di modifiche alla bolletta Council Tax fra circa 8.000 famiglie di Ferndale, Thornton e Brixton Hill: controllo, versione semplificata, messaggio con norma sociale descrittiva e combinazione semplificazione + norma sociale. La versione semplificata rendeva più salienti l'azione richiesta e le informazioni essenziali di pagamento.",
    mechanism:
      "Ridurre il carico cognitivo e amministrativo rendendo più semplice capire cosa pagare, quando e come. Il trial testava separatamente questo meccanismo da un messaggio di norma sociale, consentendo di osservare che la semplificazione funzionava mentre la norma sociale non aggiungeva un beneficio affidabile e, in un successivo rollout più ampio, poteva persino ridurre il pagamento.",
    population:
      "Circa 8.000 famiglie in tre ward di Lambeth con tassi di riscossione inferiori alla media del borough, ma non i più bassi: Ferndale, Thornton e Brixton Hill.",
    primaryArea: "fiscalita_entrate_riscossione",
    secondaryAreas: ["capacita_amministrativa_personale"],
    interventionTypes: ["nudging_comunicazione", "informazione_trasparenza", "modifica_organizzativa_processo"],
    tools: [
      "redesign della bolletta",
      "gerarchia visiva delle informazioni",
      "messaggi comportamentali testati separatamente",
      "randomizzazione per household",
      "monitoraggio dei pagamenti",
    ],
    territorialScale: "Tre ward, con successiva seconda ondata più ampia nel borough",
    interventionStatus:
      "Esperimento concluso e utilizzato da Lambeth come parte di un programma più ampio di testing e refinement delle comunicazioni sulla Council Tax. Il record riguarda l'evidenza sperimentale pubblicata, non implica che l'esatta grafica sperimentale sia ancora quella corrente.",
    evaluationMethod:
      "Randomized controlled trial con disegno fattoriale nella prima ondata: controllo, semplificazione, norma sociale e combinazione dei due messaggi. Una seconda ondata estesa all'intera popolazione testò nuovamente il messaggio di norma sociale e documentò un effetto di segno opposto.",
    comparator:
      "Famiglie che ricevono la bolletta standard nello stesso periodo e nelle stesse ward; nella seconda ondata il confronto riguarda versioni della comunicazione inviate nello stesso ciclo.",
    outcomes: ["pagamento della Council Tax", "riscossione delle entrate", "eterogeneità per ward, storia di pagamento e deprivation"],
    results:
      "Nella prima ondata la semplificazione aumenta di circa quattro punti percentuali il numero di famiglie che pagano. La presentazione del council riporta un aumento di circa l'8% nel numero di paganti e circa un punto percentuale in più di gettito riscosso. La norma sociale da sola non migliora il comportamento; nella seconda ondata, applicata su una popolazione più ampia, il messaggio di norma sociale produce un backfire e riduce il tasso di pagamento. Il caso supporta quindi il redesign semplice, non l'uso indiscriminato delle social norms.",
    effectSize:
      "Prima ondata: +3,8 punti percentuali nel pagamento per la semplificazione e +4,3 punti per la versione combinata rispetto al controllo; il paper sintetizza l'effetto della semplificazione in circa +4 punti percentuali. Presentazione Lambeth: circa +8% nel numero di paganti e +1 punto percentuale di revenue collection. Seconda ondata: la norma sociale descrittiva riduce il pagamento; il record non converte il coefficiente probit in punti percentuali.",
    evidenceStrength: "forte",
    costsRequirements:
      "Costo marginale basso quando la comunicazione viene già prodotta e spedita dal sistema di riscossione. Richiede accesso al flusso di generazione degli avvisi, capacità di randomizzazione/A-B testing, definizione ex ante della finestra di outcome e controllo legale della chiarezza e completezza dell'atto.",
    limitations: [
      "Il trial iniziale riguarda tre ward selezionate con collection rate sotto la media; la validità esterna verso tutti i contribuenti è limitata.",
      "Il messaggio di norma sociale non è un trattamento affidabile: nella seconda ondata ha ridotto il pagamento e non deve essere incorporato automaticamente in una replica.",
      "Il sistema britannico di Council Tax e i suoi avvisi non coincidono con TARI, IMU o altre entrate locali italiane.",
      "Un miglioramento nel pagamento a breve termine non dimostra persistenza, migliore equità o riduzione strutturale della morosità.",
    ],
    unintendedEffects:
      "I messaggi comportamentali possono avere effetti di segno opposto su popolazioni diverse; una comunicazione troppo orientata al pagamento può inoltre aumentare richieste di assistenza o generare pressione impropria su contribuenti in effettiva difficoltà se non rende visibili rateizzazione e canali di supporto.",
    primarySource: {
      label: "Local Government Association / Lambeth — Nudging residents to increase Council Tax collection",
      url: "https://www.local.gov.uk/sites/default/files/documents/Lambeth%20council%20tax%20presentation.pdf",
    },
    evaluationStudies: [
      {
        label: "Journal of Behavioral Public Administration — How best to nudge taxpayers?",
        url: "https://journal-bpa.org/index.php/jbpa/article/view/10",
        citation:
          "John P, Blume T (2018), How best to nudge taxpayers? The impact of message simplification and descriptive social norms on payment rates in a central London local authority, Journal of Behavioral Public Administration 1(1)",
        doi: "10.30636/jbpa.11.10",
      },
    ],
    lastVerifiedAt: "2026-09-23",
    transferabilityItaly:
      "Alta per il meccanismo di semplificazione, previa verifica giuridica degli elementi obbligatori delle comunicazioni fiscali. I comuni possono testare una migliore gerarchia dell'informazione senza modificare l'obbligazione tributaria. La social norm va invece considerata un trattamento distinto, non una componente standard, perché a Lambeth ha mostrato un backfire nel rollout successivo.",
    lameziaAdaptation:
      "Selezionare un flusso ripetitivo di TARI, IMU o recupero di una entrata locale e creare una variante di una pagina che renda immediatamente visibili importo, scadenza, modalità di pagamento, contatti, rateizzazione e cosa fare in caso di errore. Randomizzare la variante rispetto alla comunicazione corrente, pre-specificando pagamento entro una finestra fissa, euro riscossi, richieste di assistenza e reclami. Non inserire una social norm nella versione principale; eventualmente testarla come braccio separato solo dopo revisione del messaggio.",
    implementability: "quick_win",
    capacityDataNeeds: [
      "template attuale degli avvisi",
      "sistema di generazione/stampa o invio digitale con randomizzazione",
      "pagamenti collegabili in modo pseudonimizzato al braccio di trattamento",
      "finestra di outcome predefinita",
      "dati su assistenza, rateizzazioni e reclami",
    ],
    tags: ["Lambeth", "Council Tax", "semplificazione", "nudge", "riscossione", "RCT", "administrative burden"],
    revisionHistory: [
      {
        date: "2026-09-23",
        note: "Prima verifica e inserimento; identificata la semplificazione come trattamento canonico e registrato esplicitamente il backfire della norma sociale nella seconda ondata.",
      },
    ],
  },
  {
    id: "las-vegas-body-worn-cameras-rct",
    title: "Body-worn cameras per gli agenti di pattuglia",
    authority: "Las Vegas Metropolitan Police Department (LVMPD)",
    territory: "Las Vegas e Clark County, Nevada",
    country: "Stati Uniti",
    implementationYear: "RCT 2014–2015; body-worn cameras operative anche nel 2026",
    problem:
      "Controversie e reclami sugli incontri fra polizia e cittadini, uso della forza, qualità della documentazione degli interventi e costi amministrativi delle indagini sui reclami.",
    measure:
      "Assegnazione randomizzata di body-worn cameras a un gruppo di agenti di pattuglia LVMPD, con confronto rispetto ad agenti senza camera nel periodo sperimentale. Il dispositivo registra audio/video degli incontri quando attivato secondo policy, creando un record digitale utilizzabile per evidenza, supervisione e gestione dei reclami.",
    mechanism:
      "La possibilità che l'incontro sia documentato può modificare il comportamento di agenti e cittadini, aumentare la verificabilità ex post e ridurre i costi di ricostruzione dei reclami. L'effetto dipende però fortemente da regole di attivazione, supervisione, conservazione, accesso e uso disciplinare/probatorio dei video.",
    population:
      "416 agenti di pattuglia LVMPD inclusi nel randomized controlled trial; l'esperimento fu condotto su agenti appartenenti a un pool di volontari, con conseguenti limiti di generalizzabilità all'intera forza.",
    primaryArea: "trasparenza_integrita_anticorruzione",
    secondaryAreas: ["sicurezza_urbana_prevenzione", "digitalizzazione_servizi_online", "capacita_amministrativa_personale"],
    interventionTypes: ["infrastruttura_digitale", "informazione_trasparenza", "modifica_organizzativa_processo", "enforcement_controllo"],
    tools: [
      "body-worn camera",
      "policy di attivazione",
      "archiviazione sicura di evidenze digitali",
      "audit trail e supervisione",
      "procedure di accesso/redazione dei video",
      "gestione dei reclami",
    ],
    territorialScale: "Dipartimento di polizia metropolitano / agenti di pattuglia",
    interventionStatus:
      "Le body-worn cameras fanno parte dell'infrastruttura operativa LVMPD. Nel 2026 il dipartimento continua a gestire e rilasciare, ove previsto, video BWC attraverso il Public Records Unit e le proprie policy operative.",
    evaluationMethod:
      "Randomized controlled trial su 416 agenti di pattuglia, con assegnazione al gruppo BWC o controllo e confronto degli outcome prima e dopo l'assegnazione. Il trial misura reclami dei cittadini, use-of-force reports e attività di enforcement; la valutazione include anche una componente di cost-benefit.",
    comparator:
      "Agenti LVMPD assegnati casualmente al gruppo di controllo senza body-worn camera durante il periodo sperimentale.",
    outcomes: [
      "agenti con almeno un citizen complaint",
      "agenti con almeno un use-of-force report",
      "arresti e citazioni",
      "costi di gestione e indagine dei reclami",
    ],
    results:
      "Nel trial di Las Vegas gli agenti con camera mostrano riduzioni sostanziali nella quota con almeno un reclamo e almeno un report di uso della forza rispetto al gruppo di controllo; al tempo stesso aumentano modestamente alcune attività di enforcement, come arresti e citazioni. La valutazione economica stima costi delle BWC inferiori ai risparmi amministrativi associati alla riduzione dei reclami. L'evidenza esterna più ampia sulle BWC è però eterogenea: le revisioni sistematiche trovano una riduzione media dei reclami più coerente dell'effetto sull'uso della forza, che non è statisticamente chiaro nel complesso degli studi.",
    effectSize:
      "Quota di agenti con almeno un reclamo: trattamento 54,6%→38,1% contro controllo 48,0%→45,5%. Quota con almeno un use-of-force report: trattamento 31,2%→19,7% contro controllo 26,3%→27,3%. In termini relativi, circa −30% negli agenti con reclami e −37% negli agenti con use-of-force report nel gruppo BWC, contro variazioni molto più piccole o opposte nel controllo. Costi stimati: 828–1.097 USD per utilizzatore/anno; risparmi associati ai reclami circa 4.006 USD per utilizzatore/anno, con risparmio netto stimato 2.909–3.178 USD.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede acquisto e sostituzione dei dispositivi, storage sicuro, upload e gestione dell'evidenza digitale, redazione dei video, formazione, policy di attivazione, supervisione, gestione degli accessi e capacità di rispondere alle richieste di accesso. In Italia richiederebbe una preventiva verifica molto rigorosa di base giuridica, GDPR, DPIA, disciplina lavoristica, conservazione, minimizzazione e rapporti con autorità giudiziaria e forze di polizia competenti.",
    limitations: [
      "Il trial riguarda un singolo dipartimento e un pool di agenti volontari; selezione e cultura organizzativa possono limitare la validità esterna.",
      "Le body-worn cameras non hanno un effetto uniforme nella letteratura: revisioni sistematiche trovano effetti eterogenei e nessun effetto medio statisticamente chiaro sull'uso della forza, anche se la riduzione dei reclami è più consistente.",
      "Attivazione, supervisione e policy di accesso sono parte sostanziale del trattamento: acquistare telecamere senza un protocollo equivalente non replica l'intervento valutato.",
      "Un minor numero di reclami non dimostra automaticamente maggiore fiducia pubblica, né distingue sempre tra migliore condotta, migliore risoluzione dei reclami o cambiamenti nella propensione a presentare reclamo.",
      "Il contesto giuridico e operativo statunitense è molto diverso da quello della Polizia Locale italiana.",
    ],
    unintendedEffects:
      "Possibile aumento di alcune attività di enforcement, costi e rischi di privacy, raccolta di immagini di persone vulnerabili o in luoghi privati, chilling effects e uso secondario dei filmati. Una policy debole di attivazione può inoltre creare selezione nelle registrazioni e ridurre accountability anziché aumentarla.",
    primarySource: {
      label: "Las Vegas Metropolitan Police Department — Public Records / Body Worn Camera",
      url: "https://www.lvmpd.com/i-want-to/file/public-records",
    },
    evaluationStudies: [
      {
        label: "NIJ/OJP — The Las Vegas Body-Worn Camera Experiment",
        url: "https://nij.ojp.gov/speech/las-vegas-body-worn-camera-experiment",
        citation: "National Institute of Justice / CNA (2017), The Las Vegas Body-Worn Camera Experiment",
      },
      {
        label: "Journal of Criminal Law and Criminology — randomized controlled trial",
        url: "https://www.ojp.gov/library/publications/effects-body-worn-cameras-police-activity-and-police-citizen-encounters",
        citation:
          "Braga AA, Sousa WH, Coldren JR Jr, Rodriguez D (2018), The Effects of Body-Worn Cameras on Police Activity and Police-Citizen Encounters: A Randomized Controlled Trial, Journal of Criminal Law and Criminology 108(3):511–538",
      },
      {
        label: "Campbell Systematic Reviews — body-worn cameras systematic review",
        url: "https://onlinelibrary.wiley.com/doi/10.1002/cl2.1112",
        citation:
          "Lum C et al. (2020), Body-worn cameras' effects on police officers and citizen behavior: A systematic review, Campbell Systematic Reviews 16:e1112",
        doi: "10.1002/cl2.1112",
      },
    ],
    lastVerifiedAt: "2026-09-23",
    transferabilityItaly:
      "Bassa-media e fortemente condizionata dal diritto. Il principio di documentazione verificabile di alcuni incontri può essere rilevante per una Polizia Locale, ma prima di qualsiasi pilot servono base giuridica, valutazione d'impatto sulla protezione dei dati (DPIA), regole su attivazione e conservazione, confronto con DPO e rappresentanze del personale, delimitazione delle finalità e verifica delle competenze. Non è un intervento da introdurre come semplice acquisto tecnologico.",
    lameziaAdaptation:
      "Valutare anzitutto la fattibilità giuridica e organizzativa per un pilot molto circoscritto della Polizia Locale, senza registrazione generalizzata. Definire ex ante eventi registrabili, attivazione, eccezioni, retention, redazione, accessi e audit trail; mantenere una fase comparativa o un rollout scaglionato. Misurare reclami, tempi e costo di risoluzione, utilizzo probatorio, compliance alla policy, eventuali episodi di uso della forza pertinenti e impatti sulla privacy. Non usare la tecnologia per sorveglianza indiscriminata né assumere che gli effetti di Las Vegas si replichino automaticamente.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "parere giuridico e DPIA",
      "policy di attivazione e retention",
      "storage sicuro e controllo degli accessi",
      "processo di redazione e rilascio",
      "baseline su reclami e tempi/costi di gestione",
      "audit di compliance alla policy",
      "formazione e governance con DPO e responsabili operativi",
    ],
    tags: ["Las Vegas", "body-worn camera", "polizia", "accountability", "reclami", "uso della forza", "RCT", "privacy"],
    revisionHistory: [
      {
        date: "2026-09-23",
        note: "Prima verifica e inserimento; preservata la forza del RCT locale ma ridimensionata la trasferibilità alla luce dell'eterogeneità della letteratura e dei vincoli privacy/giuridici italiani.",
      },
    ],
  },
] satisfies readonly EvidenceIntervention[];
