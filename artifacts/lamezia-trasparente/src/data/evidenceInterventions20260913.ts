import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_13 = [
  {
    id: "philadelphia-property-tax-delinquency-reminder-rct",
    title: "Lettere di sollecito mirate per ridurre la morosità dell'imposta immobiliare",
    authority: "City of Philadelphia — Department of Revenue",
    territory: "Philadelphia, Pennsylvania",
    country: "Stati Uniti",
    implementationYear: "2015–2016 (esperimento su contribuenti tardivi)",
    problem:
      "Una quota dei proprietari paga l'imposta immobiliare oltre la scadenza, riducendo la tempestività delle entrate comunali e aumentando i costi di riscossione. La morosità può dipendere da scarsa salienza, procrastinazione, percezione debole delle conseguenze o difficoltà economiche.",
    measure:
      "Il Department of Revenue ha collaborato a un esperimento randomizzato in cui i contribuenti immobiliari in ritardo ricevevano una di sette lettere di sollecito: un semplice promemoria, due versioni che rendevano salienti conseguenze e sanzioni economiche della mancata regolarizzazione e quattro versioni basate su motivazioni di tax morale, servizi pubblici, comportamento degli altri contribuenti o dovere civico. Un gruppo di controllo non riceveva alcuna lettera aggiuntiva.",
    mechanism:
      "Rendere immediatamente salienti scadenza e conseguenze reali della persistente morosità può ridurre procrastinazione e sottovalutazione dei costi del ritardo. Il confronto fra messaggi diversi consente inoltre di distinguere deterrenza, semplice reminder e appelli alla tax morale.",
    population:
      "19.039 proprietari di un singolo immobile con pagamento tardivo inclusi nel campione finale; 2.088 assegnati al gruppo holdout senza reminder e 16.951 assegnati alle sette lettere sperimentali.",
    primaryArea: "fiscalita_entrate_riscossione",
    secondaryAreas: ["capacita_amministrativa_personale"],
    interventionTypes: ["nudging_comunicazione", "enforcement_controllo", "informazione_trasparenza"],
    tools: ["lettere di sollecito randomizzate", "dati amministrativi fiscali", "gruppo holdout", "messaggi sulle conseguenze economiche", "monitoraggio dei pagamenti"],
    territorialScale: "Città / contribuente",
    interventionStatus:
      "L'esperimento è concluso. Philadelphia continua a gestire direttamente la Real Estate Tax e offre pagamento online, piani di pagamento e programmi di assistenza; il record non assume che le sette lettere sperimentali siano oggi utilizzate nella stessa forma.",
    evaluationMethod:
      "Randomized controlled field experiment a livello di contribuente. I contribuenti tardivi furono assegnati casualmente a una di sette lettere oppure a un holdout senza reminder; pagamenti e compliance successivi furono osservati nei dati amministrativi. Lo studio verifica anche se l'effetto persiste nell'anno fiscale successivo.",
    comparator: "2.088 contribuenti tardivi assegnati casualmente al gruppo holdout che non riceveva il reminder aggiuntivo.",
    outcomes: ["pagamento dell'imposta immobiliare", "compliance", "entrate aggiuntive", "persistenza della compliance nell'anno successivo"],
    results:
      "Le lettere aumentano in media il pagamento rispetto al gruppo senza reminder, ma i messaggi che rendono salienti le conseguenze economiche della morosità risultano i più efficaci. Gli appelli alla tax morale sono meno efficaci delle lettere di deterrenza. L'effetto non persiste nell'anno successivo: il reminder modifica soprattutto il comportamento immediato e non crea una nuova abitudine stabile di compliance.",
    effectSize:
      "Ogni lettera costava circa 1 dollaro e, mediando i sette trattamenti, generava circa 37 dollari di entrate fiscali comunali aggiuntive; le due lettere che enfatizzavano le conseguenze economiche producevano circa 65 dollari di entrate aggiuntive per lettera inviata. Non emerge un effetto persistente sulla compliance nell'anno successivo.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Richiede un'anagrafica tributaria pulita, indirizzi affidabili, testi giuridicamente corretti sulle conseguenze del ritardo e capacità di collegare ogni comunicazione agli esiti di pagamento. Nel trial il costo marginale dichiarato era circa 1 dollaro per lettera; costi postali, amministrativi e di assistenza variano nel contesto italiano.",
    limitations: [
      "Il contesto fiscale e le procedure di enforcement di Philadelphia differiscono da IMU, TARI e riscossione locale italiana; le stesse magnitudini non sono trasferibili automaticamente.",
      "I risultati riguardano contribuenti già tardivi e non dimostrano l'efficacia dello stesso messaggio sulla popolazione generale.",
      "La maggiore entrata è un outcome amministrativo, non una misura di benessere: un messaggio più coercitivo può incidere diversamente sui contribuenti in difficoltà economica.",
      "Le conseguenze comunicate devono essere reali, legalmente applicabili e descritte senza esagerazioni; una falsa minaccia non replica il trattamento ed è incompatibile con una comunicazione pubblica corretta.",
      "Il paper trova che gli effetti non hanno persistenza nell'anno successivo, quindi il reminder non sostituisce una strategia strutturale di compliance e assistenza."
    ],
    unintendedEffects:
      "Una comunicazione di deterrenza mal calibrata può aumentare stress, reclami o sfiducia, soprattutto tra contribuenti vulnerabili o con debiti contestati. Il disegno deve affiancare alle conseguenze informazioni chiare su rateizzazione, assistenza, riesame e canali di contatto.",
    primarySource: {
      label: "City of Philadelphia — Department of Revenue, property-tax payment and assistance",
      url: "https://www.phila.gov/2026-08-11-pay-your-property-taxes-online-no-username-or-password-needed/"
    },
    evaluationStudies: [
      {
        label: "National Tax Journal",
        url: "https://doi.org/10.17310/ntj.2019.3.01",
        citation: "Chirico M, Inman RP, Loeffler C, MacDonald J, Sieg H (2019), Deterring Property Tax Delinquency in Philadelphia: An Experimental Evaluation of Nudge Strategies",
        doi: "10.17310/ntj.2019.3.01"
      },
      {
        label: "NBER Working Paper 23243",
        url: "https://www.nber.org/papers/w23243",
        citation: "Chirico M, Inman RP, Loeffler C, MacDonald J, Sieg H (2019), Deterring Property Tax Delinquency in Philadelphia: An Experimental Evaluation of Nudge Strategies",
        doi: "10.3386/w23243"
      }
    ],
    lastVerifiedAt: "2026-09-13",
    transferabilityItaly:
      "Alta per il principio sperimentale e comunicativo: un Comune italiano può, entro il quadro legale applicabile, testare versioni più chiare dei solleciti e misurare pagamento, importi recuperati e richieste di assistenza. È invece necessario adattare integralmente scadenze, sanzioni, rateizzazione e competenze al tributo italiano interessato.",
    lameziaAdaptation:
      "Selezionare un flusso di sollecito ad alto volume e giuridicamente standardizzato, per esempio su una posizione tributaria per cui il Comune dispone già di una procedura ordinaria. Randomizzare, previa validazione legale, comunicazione standard, reminder semplificato e versione che esplicita conseguenze realmente applicabili insieme ai canali di rateizzazione/assistenza. Predefinire pagamento entro 30 e 60 giorni, importo recuperato, rateizzazioni, reclami e costo per euro recuperato, con analisi separata delle situazioni di vulnerabilità o contestazione.",
    implementability: "quick_win",
    capacityDataNeeds: ["anagrafica tributaria e stato dei pagamenti", "template validati giuridicamente", "randomizzazione e tracciamento della comunicazione", "outcome a 30/60 giorni", "dati su rateizzazioni, assistenza e reclami", "presidi per vulnerabilità e contenzioso"],
    tags: ["tributi", "property tax", "compliance", "reminder", "deterrenza", "RCT", "riscossione"],
    revisionHistory: [{ date: "2026-09-13", note: "Prima verifica e inserimento; separate efficacia immediata, costo-efficacia e assenza di persistenza nell'anno successivo." }]
  },
  {
    id: "stockholm-congestion-tax-child-asthma",
    title: "Congestion tax con tariffa temporale per ridurre traffico, inquinamento e asma infantile",
    authority: "Stockholms stad / Swedish Transport Agency",
    territory: "Stoccolma",
    country: "Svezia",
    implementationYear: "Trial gennaio–luglio 2006; sistema permanente dal 2007",
    problem:
      "Elevati flussi di traffico nell'area centrale generano congestione e inquinanti atmosferici da traffico, con costi di mobilità e rischi sanitari particolarmente rilevanti per i bambini esposti.",
    measure:
      "Introduzione di un pedaggio di congestione per i veicoli che entrano o escono dall'area centrale nelle fasce orarie previste, con importi differenziati nel corso della giornata e rilevazione automatica dei passaggi. Il trial del 2006 fu accompagnato anche da un potenziamento del trasporto pubblico; dopo una pausa, il sistema è stato reso permanente.",
    mechanism:
      "Attribuire un prezzo ai viaggi automobilistici nelle fasce e nei punti congestionati riduce o riprogramma una parte degli spostamenti, abbassando traffico ed emissioni locali. La riduzione dell'esposizione a inquinanti può tradursi in minori riacutizzazioni respiratorie, con effetti sanitari che possono maturare più lentamente della riduzione immediata del traffico.",
    population:
      "Automobilisti che attraversano il cordone di Stoccolma e popolazione residente esposta alle variazioni di traffico e qualità dell'aria; la valutazione sanitaria si concentra in particolare sui bambini piccoli residenti nell'area interessata.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["ambiente_clima_energia", "salute_pubblica_locale", "fiscalita_entrate_riscossione"],
    interventionTypes: ["incentivo_economico", "regolazione", "enforcement_controllo", "infrastruttura_digitale"],
    tools: ["cordone tariffario", "tariffe variabili per fascia oraria", "rilevazione automatica dei transiti", "fatturazione del pedaggio", "monitoraggio qualità dell'aria", "dati sanitari amministrativi"],
    territorialScale: "Area urbana centrale / rete stradale metropolitana",
    interventionStatus:
      "Politica strutturale tuttora operativa. La Swedish Transport Agency amministra attualmente il congestion tax di Stoccolma con stazioni automatiche e importi differenziati per orario; il sistema è stato modificato nel tempo rispetto al trial originario.",
    evaluationMethod:
      "Natural experiment con confronto temporale e geografico: il disegno sfrutta l'introduzione del trial nel 2006, la successiva sospensione e la reintroduzione permanente, confrontando inquinamento e outcome sanitari di Stoccolma con quelli di altri centri urbani svedesi non soggetti al pedaggio. La valutazione utilizza dati 2004–2010 e verifica anche outcome placebo non respiratori.",
    comparator:
      "Periodi senza congestion tax nella stessa area e altri centri urbani svedesi che non introdussero la stessa policy nello stesso periodo.",
    outcomes: ["traffico nel congestion-pricing zone", "NO2 e particolato", "attacchi acuti di asma nei bambini", "ricoveri non respiratori e incidenti come outcome placebo"],
    results:
      "L'introduzione del congestion pricing riduce rapidamente il traffico e l'inquinamento locale. Gli attacchi acuti di asma nei bambini diminuiscono in modo più graduale, coerentemente con l'ipotesi che i benefici sanitari richiedano esposizione prolungata a livelli inferiori di inquinamento. Non emergono analoghi cambiamenti per ricoveri non respiratori o incidenti, usati come controlli placebo.",
    effectSize:
      "Nel trial il traffico nell'area soggetta al pedaggio diminuì di circa 20–25%; la valutazione stima una riduzione dell'inquinamento atmosferico nell'ordine del 5–15%. Nel periodo permanente gli attacchi acuti di asma tra i bambini piccoli diminuirono di circa 8,7 casi ogni 10.000 bambini rispetto al controfattuale, una riduzione prossima alla metà della baseline riportata dagli autori.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede base legislativa per il prelievo, infrastruttura di rilevazione e billing, gestione di esenzioni e contenzioso, dati di traffico e un sistema credibile di alternative modali. Il trial di Stoccolma fu accompagnato da un sostanziale potenziamento del trasporto pubblico, elemento da considerare parte del contesto di implementazione.",
    limitations: [
      "Non è un RCT: l'identificazione deriva dalla sequenza trial–sospensione–reintroduzione e dal confronto con altre città, quindi non elimina ogni possibile cambiamento concomitante.",
      "Durante il trial furono potenziati autobus e altre alternative di trasporto; il disegno empirico sfrutta la dinamica del pedaggio ma non rende irrilevante questo pacchetto di policy più ampio.",
      "Il congestion tax svedese è oggi amministrato in una cornice nazionale e non dimostra che un Comune italiano disponga autonomamente della potestà di introdurre un pedaggio urbano equivalente.",
      "La struttura urbana, il trasporto pubblico, il parco veicolare e i livelli di inquinamento di Stoccolma differiscono sostanzialmente da Lamezia Terme.",
      "Gli effetti sanitari si manifestano più lentamente di quelli sul traffico e non devono essere attribuiti a singoli giorni di riduzione dell'inquinamento."
    ],
    unintendedEffects:
      "Un pedaggio può imporre costi distributivi ai lavoratori o residenti con minori alternative, deviare traffico su altri assi e generare opposizione politica. Esenzioni, alternative di trasporto e monitoraggio del displacement sono quindi elementi essenziali del disegno, non accessori.",
    primarySource: {
      label: "Swedish Transport Agency — Congestion tax in Stockholm",
      url: "https://www.transportstyrelsen.se/en/road/vehicles/taxes-and-fees/road-tolls/congestion-taxes-in-stockholm-and-gothenburg/congestion-tax-in-stockholm"
    },
    evaluationStudies: [
      {
        label: "Journal of Human Resources",
        url: "https://doi.org/10.3368/jhr.56.4.0218-9363R2",
        citation: "Simeonova E, Currie J, Nilsson P, Walker R (2021), Congestion Pricing, Air Pollution and Children's Health",
        doi: "10.3368/jhr.56.4.0218-9363R2"
      },
      {
        label: "NBER Working Paper 24410",
        url: "https://www.nber.org/papers/w24410",
        citation: "Simeonova E, Currie J, Nilsson P, Walker R (2019 revision), Congestion Pricing, Air Pollution and Children's Health",
        doi: "10.3386/w24410"
      }
    ],
    lastVerifiedAt: "2026-09-13",
    transferabilityItaly:
      "Media per il trattamento letterale, perché un congestion charge richiede una specifica base giuridica, sistema di enforcement e alternative di mobilità. Alta è invece la trasferibilità del metodo: definire un'area o corridoio, misurare traffico e inquinamento prima dell'intervento, modellare effetti distributivi e valutare esplicitamente anche spillover e salute.",
    lameziaAdaptation:
      "Non proporre un congestion tax senza prima verificare la base normativa e l'esistenza di un problema di congestione compatibile con questo strumento. Costruire una baseline su flussi, origine-destinazione, velocità, parcheggio, NO2/PM e offerta TPL nei principali corridoi e nel centro; simulare misure meno invasive di access management, sosta e trasporto collettivo. Solo se diagnosi e quadro giuridico lo giustificassero, un eventuale schema di pricing dovrebbe essere accompagnato da alternative modali, analisi distributiva e un protocollo controfattuale predefinito.",
    implementability: "strutturale",
    capacityDataNeeds: ["conteggi di traffico e origine-destinazione", "monitoraggio NO2/PM", "offerta e domanda TPL", "dati su parcheggio e accessi", "analisi distributiva", "parere giuridico sulla potestà tariffaria", "infrastruttura di enforcement e billing"],
    tags: ["congestion pricing", "traffico", "qualità dell'aria", "asma", "salute infantile", "natural experiment", "Stoccolma"],
    revisionHistory: [{ date: "2026-09-13", note: "Prima verifica e inserimento; distinti effetti immediati su traffico/inquinamento, benefici sanitari più graduali e vincoli di trasferibilità giuridica." }]
  },
  {
    id: "rotterdam-oude-westen-garbage-commitment-nudge",
    title: "Impegno volontario e reminder visivi per ridurre i rifiuti abbandonati vicino ai cassonetti",
    authority: "Gemeente Rotterdam / Behavioural Insights Group Rotterdam",
    territory: "Oude Westen, Rotterdam",
    country: "Paesi Bassi",
    implementationYear: "2019 (field pilot municipale)",
    problem:
      "Abbandoni ricorrenti di sacchi e rifiuti accanto ai contenitori urbani generano degrado, costi di pulizia ripetuti e possibili incentivi al free riding, anche quando il Comune interviene frequentemente per rimuoverli.",
    measure:
      "Tre micro-aree adiacenti furono confrontate per due settimane: nessun intervento aggiuntivo; canvassing porta a porta standard con spiegazione delle regole; oppure lo stesso canvassing arricchito da un commitment nudge. Nel trattamento comportamentale ai residenti veniva chiesto volontariamente di esporre uno sticker di impegno a mantenere pulita la strada e venivano collocati reminder visivi vicino ai contenitori, enfatizzando responsabilità condivisa e comportamento desiderato.",
    mechanism:
      "Un impegno volontario pubblico può rafforzare coerenza fra intenzione e comportamento, mentre i reminder nel punto di conferimento rendono la norma saliente nel momento della decisione. La visibilità degli impegni dei vicini può inoltre sostenere una norma sociale locale contro l'abbandono.",
    population:
      "Residenti e utilizzatori di tre aree adiacenti dell'Oude Westen con 30 punti di conferimento osservati al baseline; il trattamento completo raggiunse direttamente circa il 29% delle famiglie dell'area nudge e il 74% delle famiglie contattate accettò lo sticker di impegno.",
    primaryArea: "rifiuti_pulizia_urbana",
    secondaryAreas: ["ambiente_clima_energia"],
    interventionTypes: ["nudging_comunicazione", "informazione_trasparenza", "servizio_diretto"],
    tools: ["canvassing porta a porta", "sticker di commitment volontario", "cartelli-reminder ai contenitori", "osservazione sistematica dei punti di conferimento", "Behavioural Insights Group"],
    territorialScale: "Quartiere / cluster di punti di raccolta",
    interventionStatus:
      "Field pilot municipale concluso e valutato; il record non assume che il pacchetto sperimentale sia stato esteso in modo permanente a tutta Rotterdam. Il servizio comunale di raccolta e pulizia dei rifiuti domestici resta operativo a livello cittadino.",
    evaluationMethod:
      "Field experiment quasi-sperimentale con tre aree adiacenti selezionate per convenienza, non assegnate casualmente: controllo, canvassing standard e canvassing con nudge. L'outcome era il numero di giorni per settimana in cui comparivano nuovi rifiuti illegali entro cinque metri dai contenitori, misurato prima, subito dopo e circa due mesi dopo. L'analisi confronta cambiamenti entro e fra gruppi, ma la contiguità rende possibile contaminazione fra aree.",
    comparator: "Un'area senza intervento aggiuntivo e un'area con il solo canvassing standard sulle regole di conferimento.",
    outcomes: ["giorni con nuovi rifiuti abbandonati", "persistenza dell'effetto a circa due mesi", "risposta al canvassing standard", "potenziale spillover tra aree"],
    results:
      "Il trattamento arricchito con commitment e reminder riduce immediatamente e in modo molto ampio i giorni con nuovi abbandoni, con un effetto ancora visibile al follow-up di circa due mesi. Il solo canvassing non mostra lo stesso effetto immediato; la sua successiva riduzione può però riflettere contaminazione o spillover dalla vicina area nudge e non viene interpretata come prova indipendente di efficacia.",
    effectSize:
      "Nel gruppo nudge i giorni con nuovi abbandoni diminuiscono di oltre due terzi fra pre-test e post-test e la riduzione resta al follow-up. Gli autori riportano un effect size standardizzato molto grande (circa d=2,4 nell'analisi post-test; l'abstract sintetizza d=2,60). La discrepanza fra statistiche riepilogative viene mantenuta esplicita e non utilizzata per inferire precisione superiore a quella consentita dal disegno.",
    evidenceStrength: "moderata",
    costsRequirements:
      "Il trattamento usa materiali relativamente economici ma richiede personale per canvassing, gestione dei punti di raccolta e monitoraggio. Deve poggiare su un servizio rifiuti funzionante: contenitori pieni, raccolte irregolari o assenza di canali per rifiuti ingombranti possono rendere inefficace o iniquo un intervento puramente comportamentale.",
    limitations: [
      "Le tre aree furono selezionate per convenienza e non randomizzate, quindi differenze non osservate possono contribuire al risultato.",
      "Le aree erano adiacenti e gli autori segnalano un rischio concreto di contaminazione/spillover, soprattutto nell'interpretazione del gruppo con canvassing standard.",
      "Il quartiere presentava livelli relativamente elevati di coesione sociale; l'effetto può essere inferiore dove fiducia e connessioni di vicinato sono più deboli.",
      "Sticker di commitment e reminder ai contenitori sono parte dello stesso pacchetto, quindi non è possibile attribuire causalmente l'effetto a uno solo dei due componenti.",
      "Il follow-up è di circa due mesi e non dimostra persistenza nel medio-lungo periodo.",
      "Lavori stradali ridussero da 10 a 7 i punti osservabili nel gruppo nudge al follow-up e barriere linguistiche limitarono la copertura del canvassing."
    ],
    unintendedEffects:
      "Messaggi normativi possono generare stigma o semplicemente spostare gli abbandoni verso punti non osservati. Una replica deve quindi monitorare siti limitrofi e non usare il nudge per sostituire correzioni infrastrutturali, frequenza di raccolta o accesso ai servizi per ingombranti.",
    primarySource: {
      label: "Gemeente Rotterdam — Domestic refuse",
      url: "https://www.rotterdam.nl/en/domestic-refuse"
    },
    evaluationStudies: [
      {
        label: "Frontiers in Psychology",
        url: "https://doi.org/10.3389/fpsyg.2021.660410",
        citation: "Dewies M et al. (2021), Committing to Keep Clean: Nudging Complements Standard Policy Measures to Reduce Illegal Urban Garbage Disposal in a Neighborhood With High Levels of Social Cohesion",
        doi: "10.3389/fpsyg.2021.660410"
      }
    ],
    lastVerifiedAt: "2026-09-13",
    transferabilityItaly:
      "Alta come micro-pilota comportamentale, purché il problema sia realmente un conferimento improprio e non l'effetto di cassonetti saturi o servizi insufficienti. La forza dell'evidenza è però moderata: una replica italiana dovrebbe migliorare il disegno, randomizzando punti o cluster e misurando esplicitamente displacement e qualità del servizio.",
    lameziaAdaptation:
      "Identificare alcuni punti di raccolta con abbandono ricorrente ma servizio regolare e costruire cluster comparabili. Mantenere costanti frequenza di raccolta e manutenzione; assegnare casualmente, se possibile, controllo, informazione standard e informazione + commitment/reminder. Misurare con protocollo predefinito giorni con nuovi abbandoni, volume/tipologia, segnalazioni e siti limitrofi per almeno 8–12 settimane, senza raccogliere dati personali dei residenti.",
    implementability: "quick_win",
    capacityDataNeeds: ["mappa georeferenziata dei punti critici", "stato e saturazione dei contenitori", "frequenza di raccolta", "osservazioni standardizzate o immagini non personali", "cluster comparabili e randomizzazione", "monitoraggio dei siti limitrofi", "materiali multilingue se necessari"],
    tags: ["rifiuti", "abbandono", "nudging", "commitment", "canvassing", "behavioural insights", "Rotterdam"],
    revisionHistory: [{ date: "2026-09-13", note: "Prima verifica e inserimento; evidenza classificata moderata per assenza di randomizzazione, contaminazione possibile e follow-up breve." }]
  }
] as const satisfies readonly EvidenceIntervention[];
