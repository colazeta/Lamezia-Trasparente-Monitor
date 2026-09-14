import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_14_SUPPLEMENT = [
  {
    id: "cape-town-water-bill-behavioural-nudges",
    title: "Messaggi comportamentali nelle bollette per ridurre il consumo idrico domestico",
    authority: "City of Cape Town / Water and Sanitation Directorate",
    territory: "Cape Town",
    country: "Sudafrica",
    implementationYear: "RCT 2015–2016; conservazione della domanda e campagne informative tuttora parte della strategia cittadina",
    problem:
      "Forte pressione sulla sicurezza idrica e necessità di ridurre il consumo domestico senza affidarsi soltanto a nuove infrastrutture, restrizioni o aumenti tariffari.",
    measure:
      "Inserimento nelle bollette mensili di messaggi comportamentali a basso costo: consigli pratici, informazione tariffaria, guadagno/perdita economica, norme sociali, motivazione intrinseca, riconoscimento sociale e appello al bene pubblico. Il trial ha randomizzato i messaggi su una platea quasi cittadina di utenze residenziali idonee.",
    mechanism:
      "Aumentare salienza del consumo e delle conseguenze collettive della scarsità, rafforzare motivazione e riconoscimento per il risparmio e rendere più immediato il collegamento tra comportamento domestico, bolletta e bene pubblico.",
    population:
      "Circa 360.000 utenze residenziali in abitazioni indipendenti nel disegno iniziale; alcune categorie, tra cui utenze a consumo molto basso e utenti con modalità di fatturazione non compatibili con l'inserto, non rientravano nello stesso trattamento sperimentale.",
    primaryArea: "ambiente_clima_energia",
    secondaryAreas: ["digitalizzazione_servizi_online", "capacita_amministrativa_personale"],
    interventionTypes: ["nudging_comunicazione", "informazione_trasparenza"],
    tools: ["bolletta mensile", "messaggi randomizzati", "dati di contatore", "monitoraggio longitudinale"],
    territorialScale: "Città / utenza domestica",
    interventionStatus:
      "Il trial specifico appartiene alla risposta alla siccità del 2015–2016. La City of Cape Town continua però a usare campagne di educazione/awareness, dati di consumo in bolletta ed e-services all'interno della Water Conservation and Water Demand Management Strategy aggiornata nel 2025.",
    evaluationMethod:
      "Randomized controlled trial su circa 360.000 utenze domestiche, con più bracci di messaggistica comportamentale inserita nelle bollette e gruppo di controllo; consumo misurato con dati amministrativi di fatturazione/contatore e analisi dell'eterogeneità lungo la distribuzione del reddito.",
    comparator: "Utenze idonee che ricevevano la normale comunicazione di fatturazione senza lo specifico messaggio comportamentale assegnato ai bracci di trattamento.",
    outcomes: ["consumo idrico mensile", "eterogeneità dell'effetto per fascia di reddito", "persistenza del cambiamento di consumo"],
    results:
      "Dopo sei mesi i diversi messaggi riducono in media il consumo di circa 0,6–1,3%. I messaggi basati sul riconoscimento sociale del risparmio e sul bene pubblico risultano tra i più efficaci, attorno all'1,3% medio. L'effetto è eterogeneo: alcune risposte sono più forti nelle fasce di reddito alte, mentre le utenze nella fascia più bassa mostrano margini di risposta più limitati. Il risultato riguarda una leva comportamentale complementare, non sostituisce leak reduction, gestione della pressione, tariffe o investimenti nell'offerta.",
    effectSize:
      "Riduzione media del consumo dopo sei mesi: circa −0,6% / −1,3% a seconda del messaggio; riconoscimento sociale e appello al bene pubblico circa −1,3% in media. Il paper documenta effetti più elevati per alcuni messaggi nelle fasce di reddito più alte, coerenti con maggiore consumo discrezionale iniziale.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Costo marginale di comunicazione basso se il gestore dispone già di bollettazione e consumi individuali; servono però contatori affidabili, linkage con il sistema di billing, capacità di randomizzazione e analisi, revisione privacy, gestione di opt-out/canali alternativi e monitoraggio delle differenze distributive. Non è una misura sostitutiva degli investimenti sulle perdite di rete.",
    limitations: [
      "Il contesto era una grave siccità, con alta salienza pubblica del risparmio: l'effetto in periodi ordinari può essere inferiore.",
      "Non tutte le utenze cittadine erano trattabili nello stesso modo; esclusioni tecniche e differenze di base limitano l'external validity verso utenti senza consumo individualmente misurato.",
      "Gli effetti medi sono piccoli in termini percentuali: il valore di policy deriva dalla grande scala e dal basso costo, non da una forte riduzione per singola utenza.",
      "La forte eterogeneità per reddito/consumo implica che un messaggio uniforme può essere poco utile o iniquo per famiglie che hanno già consumi essenziali molto bassi.",
    ],
    unintendedEffects:
      "Messaggi insistenti rivolti a famiglie con consumo già essenziale possono generare frustrazione o spostare l'attenzione dalle perdite infrastrutturali; targeting e soglie devono evitare di trattare la vulnerabilità economica come semplice mancata compliance.",
    primarySource: {
      label: "City of Cape Town — Long-term Water Conservation and Water Demand Management Strategy 2025",
      url: "https://web1.capetown.gov.za/web1/newsandnotices/Home/Release/Long-term-Water-Conservation-and-Water-Demand-Management-WC-WDM-Strategy-2025",
    },
    evaluationStudies: [
      {
        label: "Journal of Environmental Economics and Management",
        url: "https://www.sciencedirect.com/science/article/pii/S0095069623000700",
        citation: "Brick K, De Martino S, Visser M (2023), Behavioural nudges for water conservation in unequal settings: Experimental evidence from Cape Town",
        doi: "10.1016/j.jeem.2023.102852",
      },
    ],
    lastVerifiedAt: "2026-09-14",
    transferabilityItaly:
      "Alta come tecnica di comunicazione sperimentale, purché il gestore idrico competente disponga di consumi individuali affidabili e possa integrare messaggi nella bolletta o nei canali digitali. La competenza e la governance del servizio idrico in Italia impongono una collaborazione con il gestore/ente competente, non un'iniziativa comunale isolata.",
    lameziaAdaptation:
      "Con il gestore idrico competente, identificare utenze con serie storica sufficiente e costruire un A/B test su 2–3 messaggi: feedback semplice sul consumo, confronto con il proprio storico e appello al bene pubblico/risparmio idrico. Stratificare la randomizzazione per consumo di base, evitare pressioni sulle utenze già a consumo essenziale e misurare litri/mese, segnalazioni di perdite, reclami, morosità e persistenza. Il pilot dovrebbe restare distinto dagli interventi sulle perdite di rete.",
    implementability: "quick_win",
    capacityDataNeeds: ["dati di contatore per utenza", "integrazione con billing/SMS/email", "baseline di consumo", "randomizzazione e protocollo di analisi", "privacy e minimizzazione dati", "indicatori di vulnerabilità usati solo con adeguate garanzie"],
    tags: ["acqua", "siccità", "nudge", "bollette", "RCT", "demand management", "comunicazione"],
    revisionHistory: [{ date: "2026-09-14", note: "Prima verifica e inserimento; distinto il risultato dell'RCT dal più ampio programma corrente di gestione della domanda." }],
  },
  {
    id: "preston-community-wealth-building-progressive-procurement",
    title: "Community Wealth Building e procurement progressivo con istituzioni-ancora",
    authority: "Preston City Council e anchor institutions locali",
    territory: "Preston, Lancashire",
    country: "Regno Unito",
    implementationYear: "Avvio 2012; sviluppo del modello e del procurement progressivo dal 2013 in avanti",
    problem:
      "Una quota elevata della spesa di enti pubblici e grandi istituzioni locali usciva dall'economia cittadina, mentre Preston presentava salari, occupazione e indicatori di benessere deboli e un tessuto di PMI/organizzazioni sociali con accesso limitato ai grandi contratti.",
    measure:
      "Community Wealth Building coordinato dal Comune con istituzioni-ancora: analisi della spesa, identificazione della spesa influenzabile, procurement orientato al social value, suddivisione di alcuni affidamenti in lotti più accessibili, coinvolgimento di PMI/organizzazioni sociali, promozione del Living Wage e coordinamento tra grandi enti locali.",
    mechanism:
      "Usare il potere di acquisto e di datore di lavoro delle istituzioni radicate nel territorio per rafforzare catene di fornitura accessibili, occupazione e qualità del lavoro, trattenendo una maggiore quota di valore economico nel territorio senza rinunciare alla concorrenza e al value for money.",
    population: "Residenti e lavoratori di Preston, imprese e organizzazioni non profit fornitrici, dipendenti e utenti delle istituzioni-ancora coinvolte.",
    primaryArea: "sviluppo_economico_commercio_lavoro",
    secondaryAreas: ["procurement_spesa_pubblica", "welfare_inclusione_servizi_sociali", "salute_pubblica_locale"],
    interventionTypes: ["procurement_contract_design", "partnership_pubblico_privato_terzo_settore", "modifica_organizzativa_processo", "formazione_capacity_building"],
    tools: ["spend analysis", "social value procurement framework", "lotting/unbundling", "supplier engagement", "anchor network", "Living Wage", "monitoraggio contratti e fornitori"],
    territorialScale: "Città / rete di istituzioni-ancora",
    interventionStatus:
      "Strategia consolidata e ancora attiva nel Preston City Council. La pagina istituzionale continua a presentare progressive procurement, cooperazione con anchor institutions, cooperative e altre componenti del Community Wealth Building.",
    evaluationMethod:
      "Valutazione place-based con matching e difference-in-differences, confrontando Preston prima/dopo l'introduzione del CWB con aree simili non esposte; per alcuni outcome economici e di benessere sono costruiti controfattuali sintetici/Bayesian structural time series. Studi successivi esaminano separatamente l'occupazione e, con dati 2016–2023 su 105.133 contratti di 248 local authorities, l'associazione tra fornitura locale e costo dei contratti.",
    comparator:
      "Aree inglesi simili e non esposte a un programma CWB comparabile per gli outcome di popolazione; per il procurement, contratti con fornitori locali/non locali a Preston, in autorità comparabili e nel complesso delle lower-tier authorities inglesi.",
    outcomes: ["salute mentale", "soddisfazione di vita", "salari", "occupazione", "numero di imprese non profit", "spesa trattenuta localmente", "costo dei contratti"],
    results:
      "La valutazione NIHR associa l'introduzione del CWB a minori problemi di salute mentale e a miglioramenti di salari, occupazione e crescita delle organizzazioni non profit rispetto ai controfattuali. Un successivo studio sull'occupazione stima circa +4,1% nel tasso di occupazione rispetto al controfattuale, con effetti maggiori per alcuni gruppi svantaggiati. Sul procurement, l'analisi 2026 non trova un aumento statisticamente significativo del costo mensile dei contratti quando il fornitore è locale dopo i controlli osservabili. Il Comune documenta inoltre un forte aumento della spesa delle anchor institutions trattenuta a Preston, ma questo dato è descrittivo e non va trattato come effect size causale.",
    effectSize:
      "NIHR: Small Area Mental Health Index −0,11 (IC95% −0,16/−0,06), salari +£38/settimana (IC95% £6,8–£62,1), tasso di occupazione +4,1% (IC95% 2,4–5,7) nell'analisi individuale DiD e circa +20 imprese non profit (IC95% 6–50). Nel paper procurement 2026 il coefficiente sul costo mensile dei contratti locali è piccolo e non statisticamente significativo: evidenza di assenza di un premio di costo osservabile, non prova di risparmio causale.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede capacità di analisi della spesa e dei fornitori, competenze di procurement, coordinamento stabile tra istituzioni-ancora, market engagement, progettazione di lotti/criteri e monitoraggio degli impegni sociali. Una strategia conforme al diritto UE/italiano non può trasformarsi in preferenza geografica discriminatoria verso fornitori locali.",
    limitations: [
      "È una valutazione di un programma place-based multi-componente in una sola città: procurement, Living Wage, anchor coordination e altri cambiamenti avvengono insieme e non consentono di attribuire gli outcome a una singola leva.",
      "L'adozione non è randomizzata; matching, DiD e controfattuali sintetici riducono ma non eliminano confondimento residuo e coincidenza con altri cambiamenti economici locali.",
      "La crescita della spesa trattenuta a Preston riportata dal Comune è descrittiva e non è una stima causale.",
      "Lo studio 2026 sui costi di procurement è osservazionale; nel dataset analizzato Preston contribuisce con un numero ridotto di contratti, e gli autori riconoscono possibile endogeneità nella scelta di fornitori locali.",
    ],
    unintendedEffects:
      "Un'applicazione mal disegnata potrebbe ridurre concorrenza, frammentare eccessivamente gli affidamenti o caricare PMI di obblighi amministrativi sproporzionati. L'assenza di un premio di costo statisticamente significativo non dimostra automaticamente maggiore efficienza o migliore qualità del servizio.",
    primarySource: {
      label: "Preston City Council — Community Wealth Building",
      url: "https://www.preston.gov.uk/communitywealthbuilding",
    },
    evaluationStudies: [
      {
        label: "NIHR Public Health Research",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK621935/",
        citation: "Barr B et al. (2025/2026), The health and health inequalities impact of a place-based community wealth initiative, a mixed-methods study",
        doi: "10.3310/gjbb2107",
      },
      {
        label: "The Lancet Public Health",
        url: "https://pubmed.ncbi.nlm.nih.gov/37094594/",
        citation: "Rose TC et al. (2023), The mental health and wellbeing impact of a Community Wealth Building programme in England: a difference-in-differences study",
        doi: "10.1016/S2468-2667(23)00059-2",
      },
      {
        label: "Journal of Epidemiology and Community Health",
        url: "https://pubmed.ncbi.nlm.nih.gov/40379468/",
        citation: "Rose TC et al. (2025), Understanding the differential effects on employment of a community wealth building programme in England: a difference-in-differences study",
        doi: "10.1136/jech-2024-223499",
      },
      {
        label: "Annals of Public and Cooperative Economics",
        url: "https://onlinelibrary.wiley.com/doi/10.1111/apce.70028",
        citation: "Ahmed R et al. (2026), Local government procurement costs and Community Wealth Building Initiatives in England",
        doi: "10.1111/apce.70028",
      },
    ],
    lastVerifiedAt: "2026-09-14",
    transferabilityItaly:
      "Media-alta per spend analysis, coordinamento tra anchor institutions, suddivisione proporzionata in lotti, supplier engagement e clausole sociali/ambientali ammesse; bassa per qualunque preferenza esplicita basata sulla sede geografica del fornitore, che confliggerebbe con i principi di concorrenza e non discriminazione. L'adattamento deve passare dal Codice dei contratti e dalla disciplina UE vigente.",
    lameziaAdaptation:
      "Avviare una spend analysis del Comune e, su base volontaria, di grandi istituzioni-ancora territoriali: CPV, valore, durata, lotti, numero di offerenti, tempi di pagamento, dimensione e struttura dei fornitori. Usare la geografia dei fornitori soltanto come diagnostica, non come criterio di aggiudicazione. Individuare barriere che escludono PMI e terzo settore, testare lotti più accessibili e criteri sociali/ambientali legittimi, accompagnando il cambiamento con market engagement e monitoraggio di prezzo, qualità, concorrenza e occupazione.",
    implementability: "strutturale",
    capacityDataNeeds: ["dati completi su contratti e fatture", "CPV e lotti", "identità/struttura dei fornitori", "tempi di pagamento", "competenze procurement e legali", "rete di anchor institutions", "baseline su costi, offerenti e outcome sociali"],
    tags: ["community wealth building", "procurement", "social value", "anchor institutions", "sviluppo locale", "difference-in-differences", "PMI"],
    revisionHistory: [{ date: "2026-09-14", note: "Prima verifica e inserimento; separati gli effetti del CWB multi-componente, i trend descrittivi di spesa e l'analisi osservazionale dei costi di procurement." }],
  },
  {
    id: "new-york-summons-redesign-text-reminders",
    title: "Redesign delle convocazioni e SMS per ridurre le mancate comparizioni",
    authority: "New York City Mayor's Office of Criminal Justice / NYPD, con New York State Office of Court Administration",
    territory: "New York City",
    country: "Stati Uniti",
    implementationYear: "Redesign dal 2014; RCT SMS 2016–2017; successiva adozione operativa",
    problem:
      "Una quota molto elevata dei destinatari di summons per infrazioni di basso livello non compariva alla data prevista, generando automaticamente mandati di arresto, costi amministrativi e conseguenze sproporzionate anche quando il problema era dimenticanza o scarsa comprensione delle informazioni.",
    measure:
      "Ridisegno del modulo di summons per portare in alto data, ora, luogo e conseguenze della mancata comparizione; raccolta facoltativa del numero di cellulare e invio di SMS pre-udienza con reminder, conseguenze e prompt di pianificazione, più messaggi successivi per chi aveva mancato l'appuntamento.",
    mechanism:
      "Ridurre frizioni informative, dimenticanza e mancata pianificazione rendendo salienti gli elementi operativi essenziali e inviando reminder nel momento in cui il destinatario può ancora organizzarsi per comparire o rimediare.",
    population:
      "Destinatari di criminal summons per violazioni di basso livello a New York City; circa 20.000 persone che avevano fornito un numero di cellulare furono incluse nella valutazione randomizzata dei messaggi.",
    primaryArea: "capacita_amministrativa_personale",
    secondaryAreas: ["digitalizzazione_servizi_online", "sicurezza_urbana_prevenzione"],
    interventionTypes: ["nudging_comunicazione", "infrastruttura_digitale", "modifica_organizzativa_processo", "informazione_trasparenza"],
    tools: ["modulo ridisegnato", "SMS automatici", "prompt di pianificazione", "informazione sulle conseguenze", "dati amministrativi di comparizione"],
    territorialScale: "Città / singolo destinatario",
    interventionStatus:
      "Dopo la sperimentazione, il modulo ridisegnato è stato adottato per i summons e il set di messaggi più efficace è stato esteso ai destinatari che forniscono un numero di cellulare. Nel 2020 OATH ha inoltre introdotto reminder via SMS per i civil summons, mostrando l'estensione del principio ad altri procedimenti cittadini.",
    evaluationMethod:
      "Due studi su larga scala: valutazione quasi-sperimentale/regression discontinuity del redesign del summons e randomized controlled trial con circa 20.000 destinatari che avevano fornito un numero di telefono, assegnati a diverse sequenze di SMS o a nessun messaggio.",
    comparator:
      "Per il redesign, destinatari del vecchio modulo attorno al cambio di formato; per l'RCT SMS, destinatari con nuovo summons e numero di cellulare che non ricevevano messaggi.",
    outcomes: ["failure to appear", "mandati di arresto emessi", "risoluzione della summons dopo mancata comparizione"],
    results:
      "Il redesign del modulo riduce la mancata comparizione di circa il 13% in termini relativi. Nell'RCT, qualunque messaggio pre-court riduce il failure to appear di 8 punti percentuali da una baseline del 38% (−21% relativo); la sequenza più efficace, che combina conseguenze e pianificazione, lo riduce di circa 10 punti, fino al 28% (−26% relativo). La città ha quindi esteso i reminder ai destinatari che forniscono un cellulare.",
    effectSize:
      "SMS pre-court: −8 p.p. da 38% in media (−21% relativo); miglior sequenza: circa −10 p.p., 38%→28% (−26% relativo). Il redesign del summons riduce FTA di circa 13% relativo. J-PAL stima circa 3.700 mandati annui evitati dai reminder e circa 20.800 combinando redesign e SMS; sono proiezioni di scala, non conteggi sperimentali osservati direttamente.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Costo marginale molto basso quando esistono già anagrafiche, calendario degli appuntamenti e piattaforma di messaggistica: nel trial ogni SMS costava meno di un centesimo di dollaro e J-PAL stima meno di 7.500 dollari per tre reminder all'intera platea 2014. Servono però qualità dei recapiti, gestione opt-out, localizzazione linguistica, sicurezza dei dati e monitoraggio delle consegne.",
    limitations: [
      "Solo una minoranza dei destinatari forniva il numero di cellulare (circa 11–13%): l'RCT identifica bene l'effetto su questa popolazione ma non garantisce lo stesso impatto per chi è digitalmente escluso o ha recapiti instabili.",
      "Il redesign del modulo non è valutato con lo stesso RCT dei messaggi; la sua stima deriva da un disegno quasi-sperimentale separato.",
      "Il contesto è il sistema di summons e corti di New York: competenze, sanzioni e conseguenze legali non sono trasferibili automaticamente a un comune italiano.",
      "L'outcome è amministrativo (comparizione/mancata comparizione) e non dimostra che ogni barriera sostanziale — lavoro, trasporto, cura, vulnerabilità sociale — possa essere risolta con un reminder.",
    ],
    unintendedEffects:
      "Messaggi inviati a numeri errati o condivisi possono creare rischi di privacy; una strategia solo digitale può ampliare il divario per chi non ha telefono stabile, alfabetizzazione o lingua adeguata. Le comunicazioni non devono includere dettagli sensibili non necessari.",
    primarySource: {
      label: "City of New York — New Text Message Reminders for Summons Recipients",
      url: "https://a860-gpp.nyc.gov/downloads/fx719q19s?locale=en",
    },
    evaluationStudies: [
      {
        label: "Science",
        url: "https://www.science.org/doi/10.1126/science.abb6591",
        citation: "Fishbane A, Ouss A, Shah AK (2020), Behavioral nudges reduce failure to appear for court",
        doi: "10.1126/science.abb6591",
      },
      {
        label: "J-PAL evaluation summary and RCT registry",
        url: "https://www.povertyactionlab.org/evaluation/text-message-reminders-decreased-failure-appear-court-new-york-city",
        citation: "J-PAL North America, Text message reminders decreased failure to appear in court in New York City (AEARCTR-0002143)",
      },
    ],
    lastVerifiedAt: "2026-09-14",
    transferabilityItaly:
      "Bassa per la specifica procedura giudiziaria, che non è competenza comunale; alta per il meccanismo amministrativo. Un comune può applicare redesign + reminder a appuntamenti, audizioni o scadenze di propria competenza, senza replicare sanzioni o conseguenze giuridiche del sistema newyorkese.",
    lameziaAdaptation:
      "Selezionare un processo comunale con no-show o mancati adempimenti misurabili — ad esempio appuntamenti allo sportello, servizi sociali, convocazioni amministrative o richieste di integrazione documentale — e ridisegnare la comunicazione in una pagina con azione, data, luogo/canale e conseguenze reali. Randomizzare reminder standard vs reminder con pianificazione, mantenendo un canale non digitale e misurando no-show, completamento, contatti al call center, tempi del personale e reclami. Nessun dettaglio sensibile dovrebbe comparire nell'SMS.",
    implementability: "quick_win",
    capacityDataNeeds: ["calendario/registro degli adempimenti", "recapiti aggiornati e base giuridica", "piattaforma SMS/email", "template multilingue", "randomizzazione e log di consegna", "DPIA/privacy", "outcome di completamento/no-show"],
    tags: ["reminder", "SMS", "administrative burden", "behavioral insights", "RCT", "redesign", "compliance"],
    revisionHistory: [{ date: "2026-09-14", note: "Prima verifica e inserimento; separata la stima quasi-sperimentale del redesign dall'RCT dei messaggi e dalle proiezioni annuali sui mandati evitati." }],
  },
] as const satisfies readonly EvidenceIntervention[];
