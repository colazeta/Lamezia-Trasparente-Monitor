import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_27 = [
  {
    id: "stockholm-congestion-tax-health-traffic",
    title: "Congestion tax con tariffazione per fascia oraria",
    authority: "City of Stockholm / Swedish Transport Agency",
    territory: "Stoccolma",
    country: "Svezia",
    implementationYear: "Trial 3 gennaio–31 luglio 2006; implementazione permanente dal 1 agosto 2007",
    problem:
      "Congestione stradale nel centro urbano, tempi di viaggio poco affidabili, emissioni da traffico e relativi effetti sanitari.",
    measure:
      "Tariffa applicata ai veicoli che entrano o escono dal centro di Stoccolma in determinate fasce orarie, con registrazione automatica ai punti di controllo e importi variabili nel corso della giornata.",
    mechanism:
      "Il prezzo marginale degli spostamenti nelle ore congestionate riduce o redistribuisce i viaggi in auto; la riduzione del traffico attenua congestione ed emissioni, con potenziali benefici sanitari cumulativi.",
    population:
      "Automobilisti che attraversano il cordone tariffario e residenti dell'area urbana; la valutazione sanitaria si concentra sui bambini piccoli residenti nella congestion pricing zone.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["ambiente_clima_energia", "salute_pubblica_locale"],
    interventionTypes: ["incentivo_economico", "regolazione", "infrastruttura_digitale", "enforcement_controllo"],
    tools: ["cordone tariffario", "lettura automatica delle targhe", "tariffe per fascia oraria", "registro dei passaggi", "procedura di revisione"],
    territorialScale: "Cittadina, con cordone attorno al centro e successiva estensione a Essingeleden",
    interventionStatus:
      "Sistema permanente e tuttora operativo. Nel 2026 la Swedish Transport Agency continua a pubblicare orari, importi, esenzioni e procedure di pagamento/revisione.",
    evaluationMethod:
      "Quasi-esperimento difference-in-differences/event-study che sfrutta il trial 2006, il periodo senza tassa e la reintroduzione permanente, confrontando Stoccolma con altre città svedesi e usando effetti fissi temporali e territoriali.",
    comparator:
      "Altri centri urbani svedesi senza congestion pricing, osservati negli stessi periodi prima, durante e dopo il trial e l'introduzione permanente.",
    outcomes: ["traffico", "PM10", "NO2", "visite acute per asma infantile", "ricoveri per condizioni non respiratorie", "incidenti"],
    results:
      "Il programma ridusse immediatamente il traffico nel cordone di circa 20–25%. L'articolo finale stima riduzioni dell'inquinamento atmosferico nell'ordine del 5–15% e una riduzione significativa degli episodi acuti di asma nei bambini piccoli. Nel working paper, le visite acute per asma diminuiscono di circa 16% durante il trial e di circa 50% dopo l'introduzione permanente rispetto al periodo pre-policy. Non emergono cambiamenti analoghi negli incidenti o nei ricoveri per condizioni non respiratorie.",
    effectSize:
      "Traffico circa −20/−25% durante il trial; inquinamento atmosferico circa −5/−15%; visite acute per asma circa −16% nel trial e circa −50% dopo l'implementazione permanente rispetto al pre-policy, con effetto sanitario graduale.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede base giuridica, infrastruttura di rilevazione e fatturazione, gestione di esenzioni e ricorsi, monitoraggio del traffico e capacità di trasporto alternative. Non si usa una stima storica di costo come parametro trasferibile.",
    limitations: [
      "Non è un RCT; l'identificazione dipende dalla validità del confronto con altre città svedesi e dall'assenza di shock differenziali concomitanti.",
      "La tassa è uno strumento fiscale regolato a livello nazionale svedese pur applicato territorialmente a Stoccolma; la competenza non è direttamente trasferibile a un comune italiano.",
      "Gli outcome sanitari maturano gradualmente e non devono essere attribuiti meccanicamente al solo calo di un singolo inquinante.",
      "Stoccolma dispone di rete di trasporto, struttura urbana e livelli di congestione diversi da Lamezia Terme."
    ],
    unintendedEffects:
      "Possibili effetti distributivi sui pendolari con minori alternative modali, deviazioni di traffico e burden amministrativo; richiede monitoraggio degli spillover e misure di accessibilità.",
    primarySource: {
      label: "Swedish Transport Agency — Congestion tax in Stockholm",
      url: "https://www.transportstyrelsen.se/en/road/vehicles/taxes-and-fees/road-tolls/congestion-taxes-in-stockholm-and-gothenburg/congestion-tax-in-stockholm"
    },
    evaluationStudies: [
      {
        label: "Journal of Human Resources — Congestion Pricing, Air Pollution, and Children's Health",
        url: "https://jhr.uwpress.org/content/56/4/971",
        citation: "Simeonova E, Currie J, Nilsson P, Walker R (2021), Congestion Pricing, Air Pollution, and Children's Health, Journal of Human Resources 56(4):971–996",
        doi: "10.3368/jhr.56.4.0218-9363R2"
      }
    ],
    lastVerifiedAt: "2026-09-27",
    transferabilityItaly:
      "Media-bassa come replica normativa, alta come evidenza sul meccanismo. Milano Area C è un precedente italiano più vicino per competenza e disegno; Stoccolma aggiunge soprattutto evidenza longitudinale su inquinamento e salute. Qualunque applicazione richiede verifica puntuale del quadro nazionale e locale.",
    lameziaAdaptation:
      "Non proporre un cordone tariffario senza una diagnosi di congestione. Prima costruire dati su flussi, velocità, tempi, origine-destinazione, sosta, trasporto pubblico e qualità dell'aria; solo in presenza di congestione concentrata valutare strumenti meno invasivi o un pilot di gestione della domanda, mantenendo outcome su accessibilità, traffico, distribuzione e ambiente.",
    implementability: "strutturale",
    capacityDataNeeds: ["conteggi e velocità di traffico", "origine-destinazione", "offerta TPL", "qualità dell'aria", "analisi distributiva", "verifica giuridica e tecnologica"],
    tags: ["Stoccolma", "congestion pricing", "mobilità", "inquinamento", "asma", "difference-in-differences"],
    revisionHistory: [
      { date: "2026-09-27", note: "Prima verifica e inserimento; separati effetti su traffico, inquinamento e salute e mantenuto il risultato nullo sugli outcome non respiratori." }
    ],
  },
  {
    id: "mendoza-fiscal-exchange-tax-bill-rct",
    title: "Bolette tributarie con fiscal exchange visibile",
    authority: "Municipalidad de la Ciudad de Mendoza — Dirección de Rentas",
    territory: "Ciudad de Mendoza",
    country: "Argentina",
    implementationYear: "Field experiment novembre–dicembre 2019",
    problem:
      "Mancata o tardiva compliance nelle Tasas por Servicios Municipales a la Propiedad Raíz e efficacia incerta dei tradizionali richiami alla tax morale.",
    measure:
      "Cluster RCT su tre versioni della bolletta: design tradizionale; nuovo design semplificato e più saliente; nuovo design più un messaggio di fiscal exchange che mostrava opere pubbliche già realizzate per bambini, parchi e spazi gioco con l'idea 'le tue tasse ritornano'.",
    mechanism:
      "Rendere concreto e visibile il legame tra pagamento e servizi locali può rafforzare reciprocità e legittimità percepita; il trial isola tale componente dalla sola semplificazione grafica.",
    population:
      "22.119 contribuenti nel campione analitico, distribuiti in 1.593 piccole zone geografiche randomizzate; il campione include contribuenti in regola e in arretrato.",
    primaryArea: "fiscalita_entrate_riscossione",
    secondaryAreas: ["capacita_amministrativa_personale"],
    interventionTypes: ["nudging_comunicazione", "informazione_trasparenza", "modifica_organizzativa_processo"],
    tools: ["redesign della bolletta", "messaggio di fiscal exchange", "immagini di opere realizzate", "cluster randomisation", "tracking dei pagamenti"],
    territorialScale: "Cittadina",
    interventionStatus:
      "Esperimento storico. Nel 2026 la Dirección de Rentas continua a emettere e distribuire massivamente bollette per tasse sui servizi municipali e a gestire riscossione, assistenza e piani di pagamento; non si assume che il medesimo messaggio sperimentale sia oggi in uso.",
    evaluationMethod:
      "Cluster-randomized controlled trial con assegnazione di 1.593 zone a tre versioni della bolletta; analisi amministrativa dei pagamenti e follow-up successivi.",
    comparator:
      "Contribuenti nelle zone assegnate alla bolletta tradizionale e, per isolare il fiscal exchange, contribuenti assegnati al nuovo design senza messaggio sulle opere pubbliche.",
    outcomes: ["pagamento della tassa", "pagamento degli arretrati", "eterogeneità per morosità", "eterogeneità per consegna di persona", "rapporto ricavi marginali/costi", "persistenza"],
    results:
      "Nel paper finale il messaggio di fiscal exchange aumenta il tasso di pagamento dei contribuenti morosi di circa il 20% in termini relativi e di quasi il 40% quando la bolletta viene consegnata di persona. Il redesign senza fiscal exchange genera significativamente meno pagamenti. Aumenta anche la cancellazione degli arretrati; il rapporto stimato tra ricavi marginali e costi è circa 18 e gli autori rilevano persistenza dell'effetto due anni dopo.",
    effectSize:
      "Morosi: pagamento circa +20% relativo; quasi +40% relativo con consegna di persona; rapporto ricavi marginali/costi ≈18; persistenza osservata a due anni.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Intervento a basso costo relativo: richiede anagrafe tributaria, capacità di segmentazione/randomizzazione, stampa o comunicazione digitale, tracking del pagamento e contenuti sulle opere pubbliche rigorosamente verificabili.",
    limitations: [
      "L'effetto è particolarmente concentrato nei contribuenti morosi e nella consegna di persona; non è un effetto uniforme su tutti i contribuenti.",
      "Il trial avviene durante una fase di crisi economica argentina e su una specifica tassa municipale, con trasferibilità quantitativa limitata.",
      "La randomizzazione è a livello di piccole zone e una quota ridotta di destinatari ha ricevuto un trattamento diverso da quello assegnato.",
      "La comunicazione funziona solo se le opere mostrate sono reali, verificabili e percepite come pertinenti; messaggi generici di reciprocità possono fallire in altri contesti."
    ],
    unintendedEffects:
      "Rischio reputazionale se la comunicazione appare propagandistica o selettiva; richiede disclosure verificabile su opere, costi e stato di realizzazione e non deve sostituire strumenti di assistenza ai contribuenti in difficoltà.",
    primarySource: {
      label: "Ciudad de Mendoza — Dirección de Rentas",
      url: "https://ciudaddemendoza.gob.ar/area-municipal/direccion-de-rentas/"
    },
    evaluationStudies: [
      {
        label: "Journal of Policy Analysis and Management — Fiscal Exchange and Tax Compliance",
        url: "https://onlinelibrary.wiley.com/doi/10.1002/pam.22460",
        citation: "Schächtele S, Eguino H, Roman S (2023), Fiscal Exchange and Tax Compliance: Evidence From a Field Experiment, Journal of Policy Analysis and Management 42(3):796–814",
        doi: "10.1002/pam.22460"
      }
    ],
    lastVerifiedAt: "2026-09-27",
    transferabilityItaly:
      "Alta come esperimento di comunicazione su entrate comunali, purché il contenuto non alteri obblighi, scadenze o garanzie e ogni claim sulle opere finanziate sia verificabile. Integra, senza duplicarlo, il caso Lambeth sulla semplificazione e il caso Philadelphia sulla salienza delle conseguenze.",
    lameziaAdaptation:
      "Dopo aver testato semplificazione e reminder, creare un terzo braccio che renda visibile un uso reale e verificabile delle entrate comunali, ad esempio manutenzione, rifiuti o servizi di quartiere, con link a dati/progetti pubblici. Pre-specificare pagamento a 30/60/90 giorni, arretrati, contatti, reclami e persistenza a un anno.",
    implementability: "quick_win",
    capacityDataNeeds: ["anagrafe tributaria e arretrati", "randomizzazione", "tracking invio-pagamento", "database verificato delle opere/servizi", "monitoraggio di assistenza e reclami"],
    tags: ["Mendoza", "fiscal exchange", "tasse locali", "riscossione", "nudge", "RCT"],
    revisionHistory: [
      { date: "2026-09-27", note: "Prima verifica e inserimento; usato il paper peer-reviewed finale, includendo persistenza e rapporto ricavi/costi oltre al risultato sui morosi." }
    ],
  },
  {
    id: "mie-transparent-bidder-qualification-public-works",
    title: "Qualificazione trasparente e rule-based degli offerenti nei lavori pubblici",
    authority: "Mie Prefectural Government",
    territory: "Prefettura di Mie",
    country: "Giappone",
    implementationYear: "Riforma introdotta a metà 2002; valutazione su aste maggio 2001–marzo 2004",
    problem:
      "Discrezionalità nella selezione degli offerenti per piccoli lavori pubblici, con accesso ristretto, minore concorrenza e rischio di stabilità collusiva.",
    measure:
      "Per una classe di lavori pubblici di importo inferiore o uguale a circa 70 milioni di yen, Mie sostituì la qualificazione opaca e discrezionale degli offerenti con regole pubbliche: le imprese che soddisfacevano requisiti minimi finanziari e tecnici potevano partecipare senza selezione discrezionale dell'amministrazione.",
    mechanism:
      "Ridurre la discrezionalità ex ante amplia il pool di offerenti e rende più difficile stabilizzare accordi collusivi o accessi privilegiati; una maggiore concorrenza può comprimere il prezzo di aggiudicazione.",
    population:
      "Imprese di costruzione e appalti di lavori pubblici della Prefettura di Mie, inclusi strade, fiumi, porti, ponti e altre opere.",
    primaryArea: "procurement_spesa_pubblica",
    secondaryAreas: ["trasparenza_integrita_anticorruzione", "capacita_amministrativa_personale"],
    interventionTypes: ["procurement_contract_design", "informazione_trasparenza", "modifica_organizzativa_processo"],
    tools: ["criteri pubblici di qualificazione", "requisiti finanziari e tecnici", "accesso aperto agli offerenti eleggibili", "dati di gara", "pubblicazione delle informazioni di procurement"],
    territorialScale: "Regionale/prefetturale",
    interventionStatus:
      "Riforma storica. Oggi Mie gestisce un sistema elettronico di procurement con servizi pubblici di informazione su programmi, bandi e risultati; il record non assume che le regole del 2002 siano rimaste immutate.",
    evaluationMethod:
      "Difference-in-differences su aste di lavori pubblici prima e dopo la riforma, sfruttando il cambiamento della qualificazione per la classe di contratti interessata e confrontandolo con procedure non interessate nello stesso periodo.",
    comparator:
      "Aste/progetti non soggetti allo stesso cambiamento di qualificazione e periodi precedenti alla riforma, all'interno del sistema di procurement della Prefettura di Mie.",
    outcomes: ["costo/prezzo di procurement", "numero di offerenti", "discrezionalità nella qualificazione", "segnali di stabilità collusiva"],
    results:
      "L'articolo peer-reviewed finale stima che la maggiore trasparenza riduca i costi di procurement fino all'8%, con risultati robusti a endogeneità e selezione del campione. I dati descrittivi del working paper mostrano un aumento degli offerenti medi da circa 8,9 a 15,8. Le stime strutturali indicano tuttavia che la sola trasparenza non elimina tutte le inefficienze o la collusione.",
    effectSize:
      "Articolo finale 2009: costo di procurement fino a −8%; offerenti medi nel working paper circa 8,9→15,8. La versione working-paper 2008 riportava una riduzione massima di circa 3%: la discrepanza di versione è conservata esplicitamente.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede regole di ammissione oggettive e pubblicate, registri qualificati degli operatori, sistemi di gara e audit trail, capacità di monitorare partecipazione, concentrazione e qualità. Non è disponibile una stima causale del costo amministrativo della riforma.",
    limitations: [
      "Non è un RCT e riguarda una singola prefettura in un sistema di procurement specifico.",
      "Il paper finale e il working paper precedente riportano magnitudini massime diverse, rispettivamente fino a 8% e circa 3%; l'archivio non nasconde questa revisione.",
      "La maggiore trasparenza può aumentare la concorrenza ma non garantisce da sola l'eliminazione di collusione o inefficienza.",
      "Le regole italiane ed europee sugli appalti impongono già trasparenza, concorrenza e criteri di qualificazione: l'adattamento riguarda soprattutto la riduzione di discrezionalità residua e la misurazione."
    ],
    unintendedEffects:
      "Un'apertura puramente formale può aumentare il numero di offerenti senza migliorare qualità o concorrenza effettiva; criteri troppo rigidi possono anche escludere operatori capaci. Vanno monitorati qualità, concentrazione, contenzioso e tempi.",
    primarySource: {
      label: "Mie Prefecture — Public works procurement information service",
      url: "https://www.pref.mie.lg.jp/JIGYOS/cals/24170023798.htm"
    },
    evaluationStudies: [
      {
        label: "Review of Industrial Organization — Effects of Transparency in Procurement Practices",
        url: "https://link.springer.com/article/10.1007/s11151-009-9208-1",
        citation: "Ohashi H (2009), Effects of Transparency in Procurement Practices on Government Expenditure: A Case Study of Municipal Public Works, Review of Industrial Organization 34:267–285",
        doi: "10.1007/s11151-009-9208-1"
      }
    ],
    lastVerifiedAt: "2026-09-27",
    transferabilityItaly:
      "Alta come principio di design e audit del procurement, ma non come importazione di soglie o procedure giapponesi. In Italia la domanda operativa è dove persistano filtri discrezionali, requisiti non proporzionati o scarsa pubblicità entro il quadro del Codice dei contratti.",
    lameziaAdaptation:
      "Costruire un audit dei bandi e affidamenti comunali su criteri di accesso, numero di offerenti, esclusioni, procedure negoziate, concentrazione dei fornitori e ribassi. Dove esiste discrezionalità lecita ma non necessaria, standardizzare criteri ex ante e pubblicarli; misurare prima/dopo partecipazione, tempi, contenzioso, prezzi e qualità, senza usare il solo ribasso come misura di successo.",
    implementability: "medio_termine",
    capacityDataNeeds: ["dataset gare e invitati", "criteri di qualificazione strutturati", "esclusioni e motivazioni", "numero di offerte valide", "prezzi e ribassi", "qualità/esecuzione", "analisi concentrazione fornitori"],
    tags: ["Mie", "Giappone", "procurement", "trasparenza", "qualificazione offerenti", "difference-in-differences"],
    revisionHistory: [
      { date: "2026-09-27", note: "Prima verifica e inserimento; preservata la differenza tra stima finale peer-reviewed fino a −8% e working paper precedente circa −3%." }
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
