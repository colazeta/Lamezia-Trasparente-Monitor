import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_28 = [
  {
    id: "denver-supportive-housing-social-impact-bond-rct",
    title: "Supportive housing Housing First per persone senza dimora ad alta utilizzazione dei servizi",
    authority: "City and County of Denver / Denver Housing Authority / Colorado Coalition for the Homeless / Mental Health Center of Denver",
    territory: "Denver, Colorado",
    country: "Stati Uniti",
    implementationYear: "2016–2020 (iniziativa Social Impact Bond e trial quinquennale)",
    problem:
      "Cronicità della homelessness associata a uso ripetuto di carcere, polizia, detox, pronto soccorso e shelter, con alti costi umani e amministrativi.",
    measure:
      "Offerta di supportive housing con sussidio abitativo permanente e servizi intensivi secondo approccio Housing First, senza precondizioni di sobrietà o trattamento, rivolta a persone con homelessness cronica e frequenti interazioni con giustizia ed emergenza sanitaria.",
    mechanism:
      "Stabilizzare rapidamente l'abitazione riduce esposizione alla strada e ricorso ciclico a servizi di emergenza; il case management intensivo sostiene permanenza nell'alloggio, salute e accesso ai servizi ordinari.",
    population:
      "724 persone eleggibili al trial: 363 randomizzate all'offerta di supportive housing e 361 ai servizi usuali; il 79% del gruppo trattamento è stato localizzato, ingaggiato e alloggiato.",
    primaryArea: "housing_politiche_abitative",
    secondaryAreas: ["welfare_inclusione_servizi_sociali", "sicurezza_urbana_prevenzione", "salute_pubblica_locale"],
    interventionTypes: ["servizio_diretto", "partnership_pubblico_privato_terzo_settore", "modifica_organizzativa_processo"],
    tools: ["Housing First", "voucher abitativi", "case management intensivo", "coordinamento dati amministrativi", "finanziamento pay-for-success"],
    territorialScale: "Cittadina, su popolazione target ad alta intensità di utilizzo dei servizi",
    interventionStatus:
      "L'iniziativa SIB storica è conclusa; Denver continua a utilizzare e ampliare supportive housing come componente della propria strategia per la homelessness.",
    evaluationMethod:
      "Randomized controlled trial con assegnazione individuale 363/361 e analisi intention-to-treat su dati amministrativi di housing, shelter, polizia, carcere, detox e sanità nell'arco di più anni.",
    comparator:
      "Persone eleggibili randomizzate al gruppo di controllo, con accesso ai servizi usuali disponibili nella comunità ma senza offerta del programma Denver SIB.",
    outcomes: ["giorni di assistenza abitativa", "retention abitativa", "visite a shelter", "contatti di polizia", "arresti", "jail stays", "giorni in carcere", "uso di detox", "costi pubblici"],
    results:
      "L'offerta di supportive housing produce 560 giorni aggiuntivi di assistenza abitativa in tre anni rispetto al controllo. Tra i partecipanti effettivamente alloggiati e vivi, la retention è 86% a un anno, 81% a due e 77% a tre anni. In intention-to-treat si osservano 127 visite a shelter in meno (−40%), otto contatti di polizia in meno (−34%), quattro arresti in meno (−40%), quasi due jail stays in meno (−30%), 38 giorni in carcere in meno (−27%) e quattro accessi detox in meno (−65%).",
    effectSize:
      "+560 giorni di housing assistance in tre anni; shelter visits −40%; police contacts −34%; arresti −40%; jail stays −30%; jail days −27%; detox visits −65%.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Intervento ad alta intensità di risorse. Urban Institute stima costi annui per unità di circa 22.265 USD presso CCH e 35.770 USD presso MHCD; circa metà del costo annuo per persona è compensata da costi evitati in altri servizi pubblici, con differenze importanti per provider e fonte di finanziamento.",
    limitations: [
      "Il trattamento causale valutato è il supportive housing; il meccanismo finanziario Social Impact Bond non è separatamente randomizzato e non va considerato responsabile degli effetti.",
      "Solo il 79% degli assegnati al trattamento è stato effettivamente alloggiato: le stime intention-to-treat incorporano questa non-compliance.",
      "La popolazione era selezionata per homelessness cronica e frequente uso di carcere/emergenze; gli effect size non sono trasferibili a tutte le persone in difficoltà abitativa.",
      "Voucher, Medicaid e struttura dei servizi di Denver differiscono profondamente dal finanziamento e dalle competenze di un comune italiano."
    ],
    unintendedEffects:
      "Nessun principale danno sistematico riportato nel trial, ma il modello richiede monitoraggio di esclusioni dalla platea, continuità dei servizi, disponibilità di alloggi e possibili colli di bottiglia nel case management.",
    primarySource: {
      label: "City and County of Denver — Homelessness Resolution / supportive housing",
      url: "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Department-of-Housing-Stability/About-Housing-Stability/Homelessness-Resolution"
    },
    evaluationStudies: [
      {
        label: "Urban Institute — Breaking the Homelessness-Jail Cycle with Housing First",
        url: "https://www.urban.org/research/publication/breaking-homelessness-jail-cycle-housing-first-results-denver-supportive-housing-social-impact-bond-initiative",
        citation: "Cunningham MK, Hanson D, Gillespie S, Pergamit M et al. (2021/updated 2025), Breaking the Homelessness-Jail Cycle with Housing First: Results from the Denver Supportive Housing Social Impact Bond Initiative"
      },
      {
        label: "Urban Institute — Costs and Offsets of Providing Supportive Housing",
        url: "https://www.urban.org/research/publication/analyzing-costs-and-offsets-denvers-supportive-housing-program",
        citation: "Gillespie S, Hanson D, Leopold J, Oneto AD (2021), Costs and Offsets of Providing Supportive Housing to Break the Homelessness-Jail Cycle"
      }
    ],
    lastVerifiedAt: "2026-09-28",
    transferabilityItaly:
      "Alta sul principio Housing First e sulla valutazione integrata di housing, servizi e costi evitati; media-bassa sulla specifica architettura SIB. In Italia servono coordinamento tra Comune, servizi sociali, ASP/SerD/CSM, enti abitativi e terzo settore e una chiara base per l'accesso agli alloggi.",
    lameziaAdaptation:
      "Identificare una platea ristretta di persone con homelessness o grave esclusione abitativa e uso ripetuto di servizi emergenziali, costruire un percorso Housing First con alloggio stabile e case management, e misurare permanenza, accessi a shelter/emergenze, contatti istituzionali e costi. Se i posti sono scarsi, usare criteri trasparenti e un rollout valutabile; evitare di usare la randomizzazione quando esistono diritti soggettivi o urgenze incompatibili.",
    implementability: "strutturale",
    capacityDataNeeds: ["censimento homelessness", "flussi servizi sociali e sanitari", "disponibilità alloggi", "case management", "accordi di data sharing", "costi unitari dei servizi", "governance interistituzionale"],
    tags: ["Denver", "Housing First", "supportive housing", "homelessness", "RCT", "carcere", "cost offsets"],
    revisionHistory: [
      { date: "2026-09-28", note: "Prima verifica e inserimento; distinti gli effetti del supportive housing dal meccanismo di finanziamento SIB e riportati gli outcome intention-to-treat." }
    ],
  },
  {
    id: "nyc-local-law-84-energy-benchmarking-disclosure",
    title: "Benchmarking e disclosure annuale dei consumi energetici degli edifici",
    authority: "City of New York — Department of Buildings / Department of Citywide Administrative Services",
    territory: "New York City",
    country: "Stati Uniti",
    implementationYear: "Local Law 84 approvata nel 2009; benchmarking pubblico dal 2010 e privato dal 2011",
    problem:
      "Scarsa informazione comparabile sulla performance energetica degli edifici e deboli incentivi a identificare inefficienze operative e investimenti di retrofit.",
    measure:
      "Obbligo per gli edifici coperti di misurare annualmente consumi energetici e, ove previsto, idrici tramite EPA ENERGY STAR Portfolio Manager e trasmettere i dati alla città, che utilizza e rende disponibili indicatori standardizzati di performance.",
    mechanism:
      "Misurazione ripetuta, confronto con edifici simili e disclosure rendono visibile l'inefficienza, migliorano la gestione operativa e aumentano la salienza economica degli interventi di efficienza per proprietari e mercato.",
    population:
      "Edifici commerciali e multifamiliari di grandi dimensioni coperti dalla legge; la valutazione causale del primo periodo sfrutta un panel di circa 340 edifici pubblici e privati e le diverse fasi di disclosure.",
    primaryArea: "ambiente_clima_energia",
    secondaryAreas: ["digitalizzazione_servizi_online", "trasparenza_integrita_anticorruzione", "capacita_amministrativa_personale"],
    interventionTypes: ["regolazione", "informazione_trasparenza", "infrastruttura_digitale", "modifica_organizzativa_processo"],
    tools: ["ENERGY STAR Portfolio Manager", "registro edifici coperti", "reporting annuale", "indicatori EUI", "public disclosure", "controlli di compliance"],
    territorialScale: "Cittadina, con applicazione agli edifici che ricadono nelle soglie normative",
    interventionStatus:
      "Obbligo tuttora operativo. Il Department of Buildings pubblica il Covered Buildings List 2026 e richiede la submission annuale dei dati di consumo.",
    evaluationMethod:
      "Due modelli difference-in-differences che sfruttano la diversa tempistica e i differenti componenti della policy per costruire gruppi di trattamento e controllo, separando disclosure complessiva e disclosure degli ENERGY STAR score.",
    comparator:
      "Edifici non ancora esposti al medesimo componente di disclosure nello stesso periodo, secondo il phase-in della normativa; i due effect size principali utilizzano gruppi di controllo differenti.",
    outcomes: ["energy use intensity", "source EUI", "ENERGY STAR score", "consumo energetico degli edifici"],
    results:
      "Meng, Hsu e Han stimano che la disclosure complessiva di consumi ed ENERGY STAR score riduca l'energy use intensity di circa il 6% dopo tre anni e il 14% dopo quattro. La disclosure del solo ENERGY STAR score è associata a circa −9% dopo tre anni e −13% dopo quattro, in una specificazione con diverso gruppo di controllo.",
    effectSize:
      "Disclosure complessiva: EUI −6% a tre anni e −14% a quattro; disclosure ENERGY STAR score: EUI −9% a tre anni e −13% a quattro. Le due serie non sono additive perché derivano da disegni e gruppi di controllo diversi.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede anagrafe affidabile degli edifici, accesso o caricamento dei consumi, piattaforma standardizzata, qualità dei dati, assistenza ai soggetti obbligati, controlli di compliance e capacità di usare i benchmark per priorità di audit e retrofit.",
    limitations: [
      "Non è un RCT; l'identificazione sfrutta il phase-in normativo e dipende dalla validità dei gruppi di controllo e delle assunzioni difference-in-differences.",
      "Il panel causale è molto più piccolo dell'intero universo di edifici coperti e rappresenta la prima fase di attuazione.",
      "Nello stesso periodo New York attuava altre politiche del Greener, Greater Buildings Plan e cambiamenti energetici; residua il rischio di contaminazione da interventi concomitanti.",
      "Gli effect size del 6/14% e 9/13% utilizzano gruppi di controllo differenti e non devono essere sommati né trattati come repliche indipendenti."
    ],
    unintendedEffects:
      "Costi di compliance e qualità variabile dei dati auto-riportati; un sistema di ranking può inoltre incentivare attenzione al punteggio più che agli interventi con maggior rendimento sociale, se non accompagnato da audit e controllo qualità.",
    primarySource: {
      label: "NYC Department of Buildings — Local Law 84 Benchmarking",
      url: "https://www.nyc.gov/site/buildings/codes/ll84-benchmarking-law.page"
    },
    evaluationStudies: [
      {
        label: "Energy — Estimating energy savings from benchmarking policies in New York City",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S0360544217309209",
        citation: "Meng T, Hsu D, Han A (2017), Estimating energy savings from benchmarking policies in New York City, Energy 133:415–423",
        doi: "10.1016/j.energy.2017.05.148"
      }
    ],
    lastVerifiedAt: "2026-09-28",
    transferabilityItaly:
      "Alta per il patrimonio comunale e per programmi volontari/di trasparenza; la replica di un obbligo esteso ai privati dipende dalle competenze normative nazionali e regionali. Il nucleo trasferibile è creare una baseline comparabile e pubblicabile, non importare soglie statunitensi.",
    lameziaAdaptation:
      "Partire dagli edifici comunali: integrare bollette e caratteristiche fisiche, calcolare kWh/m², costo/m² e indicatori climaticamente corretti, pubblicare una dashboard e selezionare gli edifici peggiori per audit/retrofit. Solo dopo valutare accordi con altri enti o programmi volontari per immobili privati e terziari.",
    implementability: "medio_termine",
    capacityDataNeeds: ["inventario immobili comunali", "bollette e POD/PDR", "superficie e destinazione d'uso", "normalizzazione climatica", "dashboard", "data quality checks", "audit energetici"],
    tags: ["New York City", "Local Law 84", "benchmarking", "energia", "edifici", "disclosure", "difference-in-differences"],
    revisionHistory: [
      { date: "2026-09-28", note: "Prima verifica e inserimento; separati i due effetti di disclosure e specificato che usano gruppi di controllo differenti." }
    ],
  },
  {
    id: "cape-town-water-bill-conservation-nudges-rct",
    title: "Messaggi comportamentali nelle bollette per ridurre il consumo idrico",
    authority: "City of Cape Town — Water and Sanitation / Billing",
    territory: "Città del Capo",
    country: "Sudafrica",
    implementationYear: "Campagna sperimentale novembre 2015–aprile 2016, durante la siccità",
    problem:
      "Necessità di ridurre rapidamente la domanda idrica domestica in un contesto di scarsità e forte disuguaglianza senza fare affidamento soltanto su tariffe e restrizioni.",
    measure:
      "Grande RCT con inserti nelle bollette mensili che testavano messaggi diversi: consigli pratici, grafici di consumo/tariffa, framing di guadagni o perdite, norme sociali, motivazione intrinseca, riconoscimento sociale e appello al bene pubblico, contro bolletta ordinaria.",
    mechanism:
      "Feedback saliente e motivazioni sociali o finanziarie riducono attriti cognitivi e rendono immediatamente visibile il contributo del singolo alla conservazione; la randomizzazione consente di distinguere quali frame modificano davvero i consumi.",
    population:
      "Oltre 360.000 utenze domestiche individualmente misurate in abitazioni indipendenti nel disegno complessivo; il panel analitico principale si riduce a circa 275.000 utenze dopo merge ed esclusioni operative. Le utenze sotto 6 kL/mese non venivano ulteriormente spinte a ridurre i consumi.",
    primaryArea: "ambiente_clima_energia",
    secondaryAreas: ["capacita_amministrativa_personale", "digitalizzazione_servizi_online"],
    interventionTypes: ["nudging_comunicazione", "informazione_trasparenza", "modifica_organizzativa_processo"],
    tools: ["inserti in bolletta", "consumi da contatore", "randomizzazione per utenza", "social recognition", "public-good framing", "feedback finanziario"],
    territorialScale: "Cittadina, su utenze domestiche individualmente misurate",
    interventionStatus:
      "Esperimento storico; il Comune continua nel 2026 a promuovere monitoraggio dei consumi, riparazione delle perdite e conservazione idrica, senza assumere che gli stessi inserti sperimentali siano ancora utilizzati.",
    evaluationMethod:
      "Large-scale randomized controlled trial con controllo a bolletta ordinaria; regressioni difference-in-differences e controlli per trend/eterogeneità per stimare gli effetti dei diversi messaggi sul consumo mensile.",
    comparator:
      "Utenze randomizzate al gruppo di controllo che ricevevano la normale bolletta senza inserti comportamentali.",
    outcomes: ["consumo idrico mensile", "eterogeneità per valore immobiliare/reddito", "persistenza post-intervento", "performance relativa dei messaggi"],
    results:
      "Tutti i principali messaggi riducono in media i consumi rispetto al controllo, con effetti compresi tra circa −0,6% e −1,3% dopo sei mesi. Il riconoscimento sociale e l'appello al bene pubblico sono tra i trattamenti più efficaci, con circa 315 litri al mese in meno, pari a circa −1,3% rispetto alla baseline media. Gli effetti sono eterogenei: i gruppi più abbienti rispondono maggiormente agli incentivi sociali, mentre il gruppo a reddito più basso non mostra risposta significativa. La riduzione relativa rispetto al controllo riemerge/persiste fino a 18 mesi dopo la campagna.",
    effectSize:
      "Consumo medio −0,6%/−1,3% a seconda del messaggio; social recognition/public good circa −315 L/mese (≈−1,3%); evidenza di persistenza fino a 18 mesi post-intervento.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Costo marginale basso se esistono bollettazione centralizzata e dati di consumo; richiede però misurazione individuale, segmentazione, randomizzazione/monitoraggio, capacità di non sollecitare ulteriormente utenze già a consumo molto basso e analisi distributiva.",
    limitations: [
      "Sono escluse varie utenze con e-billing e quelle sotto 6 kL/mese all'avvio, quindi il campione non rappresenta perfettamente tutti i residenti.",
      "Gli effetti medi sono piccoli e fortemente eterogenei; il gruppo a reddito più basso non risponde significativamente ai nudges.",
      "Il periodo coincide con una siccità crescente e successive misure più forti: la persistenza di lungo periodo va interpretata nel contesto di un forte shock comune.",
      "Il programma presuppone contatori individuali affidabili e un canale di bollettazione controllabile dall'ente/gestore."
    ],
    unintendedEffects:
      "Rischio di messaggi iniqui o inefficaci verso famiglie con consumi già incomprimibili; il disegno originario attenua il problema escludendo dall'invio chi consumava sotto 6 kL/mese.",
    primarySource: {
      label: "City of Cape Town — Saving water",
      url: "https://www.capetown.gov.za/Family%20and%20home/residential-utility-services/residential-water-and-sanitation-services/saving-water"
    },
    evaluationStudies: [
      {
        label: "Journal of Environmental Economics and Management — Behavioural nudges for water conservation in unequal settings",
        url: "https://www.sciencedirect.com/science/article/pii/S0095069623000700",
        citation: "Brick K, De Martino S, Visser M (2023), Behavioural nudges for water conservation in unequal settings: Experimental evidence from Cape Town, Journal of Environmental Economics and Management 121:102852",
        doi: "10.1016/j.jeem.2023.102852"
      }
    ],
    lastVerifiedAt: "2026-09-28",
    transferabilityItaly:
      "Alta come test comportamentale a basso costo se il gestore idrico dispone di bollettazione e misure individuali; la competenza operativa può essere del gestore/ambito più che del Comune, quindi serve partnership istituzionale.",
    lameziaAdaptation:
      "Con il gestore idrico, identificare utenze con dati affidabili e consumi non già minimi; randomizzare messaggi semplici su perdite, consumo storico, bene pubblico o costo, mantenendo un controllo. Pre-specificare consumo a 1/3/6 mesi e analizzare eterogeneità per baseline e vulnerabilità. Nessun messaggio coercitivo verso famiglie con consumi essenziali o esigenze sanitarie.",
    implementability: "medio_termine",
    capacityDataNeeds: ["dati di consumo per utenza", "canale bollettazione", "segmentazione per baseline", "protocollo privacy", "randomizzazione", "analisi distributiva", "coordinamento con gestore idrico"],
    tags: ["Cape Town", "acqua", "nudging", "bollette", "siccità", "RCT", "consumi domestici"],
    revisionHistory: [
      { date: "2026-09-28", note: "Prima verifica e inserimento; riportati effetti medi, eterogeneità per reddito e persistenza con cautela sul contesto di siccità." }
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
