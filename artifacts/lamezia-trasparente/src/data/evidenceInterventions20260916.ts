import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_16 = [
  {
    id: "denver-supportive-housing-housing-first-sib",
    title: "Supportive housing Housing First per persone nel ciclo homelessness–carcere",
    authority: "City and County of Denver, con Colorado Coalition for the Homeless e Mental Health Center of Denver",
    territory: "Denver, Colorado",
    country: "Stati Uniti",
    implementationYear: "2016–2020 (iniziativa Social Impact Bond); modello successivamente proseguito ed esteso nel sistema locale di supportive housing",
    problem:
      "Un piccolo gruppo di persone con homelessness cronica utilizzava ripetutamente carcere, detox, pronto soccorso, rifugi e altri servizi di emergenza, senza ottenere stabilità abitativa e con costi elevati per i sistemi pubblici.",
    measure:
      "Offerta di supportive housing secondo l'approccio Housing First: sussidio abitativo permanente e accesso rapido a un alloggio, senza prerequisiti di sobrietà o trattamento, accompagnati da case management intensivo e servizi sanitari/sociali coordinati. La fase iniziale fu finanziata tramite un Social Impact Bond da 8,6 milioni di dollari.",
    mechanism:
      "Stabilizzare prima la condizione abitativa e usare una relazione continuativa di case management per ridurre il ricorso ciclico a carcere, rifugi, detox e servizi di emergenza, spostando la risposta pubblica dalla gestione ripetuta della crisi a un servizio stabile e preventivo.",
    population:
      "Adulti con homelessness cronica e frequenti contatti con il sistema di giustizia e altri servizi di emergenza di Denver; nella valutazione 724 persone eleggibili furono randomizzate tra offerta di supportive housing e servizi ordinari.",
    primaryArea: "housing_politiche_abitative",
    secondaryAreas: [
      "welfare_inclusione_servizi_sociali",
      "sicurezza_urbana_prevenzione",
      "salute_pubblica_locale",
      "capacita_amministrativa_personale",
    ],
    interventionTypes: [
      "servizio_diretto",
      "modifica_organizzativa_processo",
      "partnership_pubblico_privato_terzo_settore",
      "targeting_data_analytics",
    ],
    tools: [
      "Housing First",
      "sussidio abitativo permanente",
      "case management intensivo",
      "referral basato su utilizzo ripetuto dei servizi",
      "coordinamento inter-agenzia",
      "dati amministrativi su housing, giustizia e salute",
      "Social Impact Bond nella fase iniziale",
    ],
    territorialScale: "Città / popolazione ad altissimo bisogno",
    interventionStatus:
      "La specifica iniziativa SIB è stata implementata nel 2016–2020 e valutata per cinque anni. Denver ha successivamente continuato a utilizzare e ampliare il supportive housing; la documentazione cittadina più recente usa ancora i risultati del SIB come base del modello Housing First locale.",
    evaluationMethod:
      "Randomized controlled trial di 724 persone eleggibili: 363 assegnate casualmente all'offerta di supportive housing e 361 al gruppo di controllo con usual care nella comunità. La valutazione usa dati amministrativi longitudinali per housing, polizia, carcere, rifugi e servizi sanitari. L'RCT identifica l'effetto dell'offerta del pacchetto Housing First/supportive housing, non l'effetto causale del meccanismo finanziario Social Impact Bond.",
    comparator: "Usual care e servizi comunitari ordinari disponibili alle persone randomizzate nel gruppo di controllo.",
    outcomes: [
      "giorni di assistenza abitativa permanente",
      "stabilità abitativa",
      "accessi ai rifugi",
      "contatti con la polizia",
      "arresti",
      "permanenze e giorni in carcere",
      "utilizzo del detox",
      "servizi sanitari di emergenza",
      "costi pubblici evitati",
    ],
    results:
      "Rispetto al controllo, l'offerta di supportive housing ha prodotto circa 560 giorni aggiuntivi di assistenza abitativa permanente in tre anni. Ha inoltre ridotto gli accessi ai rifugi di circa il 40%, i contatti con la polizia del 34%, gli arresti del 40%, le permanenze in carcere del 30%, i giorni complessivi in carcere del 27% e gli accessi a detox di breve durata o finanziati dalla città del 65%. Le differenze sui servizi medici di emergenza non sono risultate statisticamente significative. Fra i partecipanti effettivamente alloggiati e ancora osservabili, la permanenza in alloggio era 86% a un anno, 81% a due anni e 77% a tre anni: questi tassi descrivono la retention dei partecipanti ospitati e non vanno confusi con l'effetto randomizzato sull'intero gruppo assegnato al trattamento.",
    effectSize:
      "RCT (offerta vs usual care): +560 giorni di assistenza abitativa permanente in tre anni; visite ai rifugi −40% (circa 127 visite in meno); contatti con la polizia −34% (circa 8 in meno); arresti −40% (circa 4 in meno); permanenze in carcere −30% e giorni in carcere −27% (circa 38 giorni in meno); utilizzo di detox di breve durata/cittadino −65% (circa 4 visite in meno). Circa metà del costo annuale pro capite del programma è stata compensata da costi evitati in altri sistemi; la stima di cost offset è circa 6.876 USD annui per persona e non equivale a un risparmio di bilancio integrale o immediatamente monetizzabile.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Intervento ad alta intensità: richiede disponibilità o sussidi per alloggi permanenti, case manager con carichi sostenibili, servizi sanitari/sociali e coordinamento tra enti. Nella valutazione il costo medio annuale per persona variava tra circa 12.078 e 15.484 USD a seconda del provider e dei giorni effettivamente trascorsi in housing; circa metà era compensata da minore utilizzo di altri servizi. Il finanziamento SIB non è un requisito necessario per replicare il servizio.",
    limitations: [
      "L'RCT identifica l'effetto dell'offerta di supportive housing/Housing First, non dimostra che il finanziamento tramite Social Impact Bond sia superiore al finanziamento pubblico ordinario.",
      "La popolazione target era estremamente selezionata per homelessness cronica e frequente utilizzo di giustizia/emergenza; gli effect size non sono trasferibili a ogni popolazione con bisogno abitativo.",
      "I tassi di retention 86/81/77% sono calcolati tra persone effettivamente alloggiate e osservabili, mentre gli effetti causali principali derivano dal confronto randomizzato intent-to-treat/offerta.",
      "Costi evitati in carcere, ambulanza o rifugi non coincidono necessariamente con risparmi di cassa realizzabili dai singoli enti, soprattutto in presenza di elevati costi fissi.",
    ],
    unintendedEffects:
      "Il programma può aumentare l'uso appropriato di alcuni servizi sanitari ambulatoriali e quindi alcune voci di spesa; vincoli nell'offerta di alloggi o case manager possono produrre attese e selezione di fatto. La condivisione inter-agenzia di dati su persone vulnerabili richiede inoltre governance, minimizzazione e garanzie privacy molto robuste.",
    primarySource: {
      label: "City and County of Denver — Department of Housing Stability, presentazione sul supportive housing",
      url: "https://www.denvergov.org/files/assets/public/v/1/city-council/documents/d6/host-2024-city-council-presentation_.pdf",
    },
    evaluationStudies: [
      {
        label: "Urban Institute — Breaking the Homelessness-Jail Cycle with Housing First",
        url: "https://www.urban.org/research/publication/breaking-homelessness-jail-cycle-housing-first-results-denver-supportive-housing-social-impact-bond-initiative",
        citation: "Gillespie S et al. (2021), Breaking the Homelessness-Jail Cycle with Housing First: Results from the Denver Supportive Housing Social Impact Bond Initiative",
      },
      {
        label: "Urban Institute — Costs and Offsets of Providing Supportive Housing",
        url: "https://www.urban.org/sites/default/files/publication/104499/costs-and-offsets-of-providing-supportive-housing-to-break-the-homelessness-jail-cycle_0.pdf",
        citation: "Gillespie S, Hanson D, Leopold J, Oneto AD (2021), Costs and Offsets of Providing Supportive Housing to Break the Homelessness-Jail Cycle",
      },
    ],
    lastVerifiedAt: "2026-09-16",
    transferabilityItaly:
      "Alta per il principio Housing First e per la presa in carico integrata, ma il Comune non può replicare da solo il perimetro di Denver: salute, dipendenze, giustizia e sicurezza richiedono ASP/SerD, Prefettura e altri enti competenti. Non è necessario importare il Social Impact Bond: il risultato sperimentale riguarda il servizio, non la struttura finanziaria.",
    lameziaAdaptation:
      "Costruire con servizi sociali, ASP/SerD, Prefettura e terzo settore una piccola popolazione target basata su criteri trasparenti di homelessness grave e accessi ripetuti ai servizi; garantire prima un alloggio stabile e poi case management intensivo. Partire con pochi posti e follow-up a 12/24/36 mesi, misurando permanenza in casa, ricoveri/accessi urgenti aggregati, uso dei servizi sociali, contatti con il sistema di sicurezza e costo complessivo per persona. Qualunque linkage individuale dovrebbe restare in un ambiente amministrativo protetto e non nella piattaforma pubblica.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "mappatura della homelessness e dell'emergenza abitativa",
      "stock o sussidi abitativi",
      "case manager",
      "protocollo Comune–ASP/SerD–Prefettura–terzo settore",
      "governance e privacy per dati inter-agenzia",
      "outcome longitudinali e costing per sistema",
    ],
    tags: ["Denver", "Housing First", "supportive housing", "homelessness", "RCT", "carcere", "case management", "cost offset"],
    revisionHistory: [
      {
        date: "2026-09-16",
        note: "Prima verifica e inserimento; separato esplicitamente l'effetto randomizzato del supportive housing dall'efficacia non identificata del meccanismo di finanziamento Social Impact Bond.",
      },
    ],
  },
  {
    id: "boston-public-preschool-lottery-long-term",
    title: "Pre-K pubblico di qualità con accesso su larga scala e benefici di lungo periodo",
    authority: "City of Boston / Boston Public Schools",
    territory: "Boston, Massachusetts",
    country: "Stati Uniti",
    implementationYear: "Cohorti valutate 1997–2003; Universal Pre-K successivamente ampliato e tuttora operativo",
    problem:
      "Accesso diseguale a educazione prescolare di qualità e necessità di migliorare preparazione scolastica, progressione educativa e opportunità di lungo periodo dei bambini.",
    measure:
      "Offerta pubblica di pre-kindergarten a quattro anni nelle Boston Public Schools. Nelle scuole sovra-domandate l'assegnazione incorporava lotterie di spareggio, permettendo una valutazione causale di lungo periodo. Il sistema cittadino è stato successivamente ampliato verso una Universal Pre-K gratuita con erogazione anche tramite provider comunitari qualificati.",
    mechanism:
      "Anticipare l'accesso a un ambiente educativo strutturato e di qualità, con curriculum, interazioni educative e servizi scolastici che possono migliorare competenze socio-comportamentali, continuità nella scuola e preparazione per le scelte successive, anche quando gli effetti sui test standardizzati si attenuano.",
    population:
      "Bambini di quattro anni richiedenti un posto nelle Boston Public Schools; lo studio di lungo periodo segue più di 4.000 candidati randomizzati in sette coorti di ammissione 1997–2003.",
    primaryArea: "istruzione_giovani",
    secondaryAreas: ["welfare_inclusione_servizi_sociali"],
    interventionTypes: ["servizio_diretto", "modifica_organizzativa_processo", "formazione_capacity_building"],
    tools: [
      "posti Pre-K pubblici",
      "curriculum e standard di qualità",
      "assegnazione centralizzata dei posti",
      "lotterie di spareggio nelle scuole sovra-domandate",
      "partnership tra città e Boston Public Schools",
      "provider comunitari qualificati nell'espansione successiva",
    ],
    territorialScale: "Città / rete scolastica",
    interventionStatus:
      "Il programma si è evoluto rispetto alle coorti storiche oggetto dello studio: Boston oggi offre Universal Pre-K gratuita e dichiara accesso a pre-kindergarten di qualità per i bambini residenti, con erogazione attraverso scuole pubbliche e organizzazioni comunitarie. Gli effect size di lungo periodo si riferiscono però al programma BPS e alle coorti 1997–2003, non automaticamente a ogni configurazione attuale.",
    evaluationMethod:
      "Disegno basato sulle lotterie di ammissione: i tie-break randomizzati nel meccanismo di school assignment sono usati come strumento per la frequenza del preschool, consentendo stime causali di lungo periodo. Lo studio segue oltre 4.000 candidati randomizzati attraverso dati amministrativi su diploma, SAT, college, disciplina, incarcerazione giovanile e test standardizzati.",
    comparator: "Bambini che persero casualmente il tie-break per un posto nelle scuole Pre-K sovra-domandate e seguirono le alternative disponibili.",
    outcomes: [
      "diploma di scuola superiore",
      "SAT test-taking",
      "iscrizione al college",
      "iscrizione a college quadriennale",
      "progressione scolastica",
      "sospensioni e disciplina",
      "incarcerazione giovanile",
      "punteggi ai test standardizzati statali",
    ],
    results:
      "La frequenza del preschool pubblico aumenta l'iscrizione al college, la probabilità di sostenere il SAT e il diploma di scuola superiore; riduce inoltre diverse misure disciplinari, inclusa l'incarcerazione giovanile. L'effetto non è accompagnato da un miglioramento rilevabile dei punteggi ai test standardizzati statali, mostrando che i benefici di lungo periodo non possono essere sintetizzati soltanto attraverso i test scolastici.",
    effectSize:
      "Stime lottery-IV pubblicate: iscrizione al college nei tempi previsti +8,3 punti percentuali da una baseline del 46% (circa +18% relativo); iscrizione a un college quadriennale +5,9 p.p.; diploma di scuola superiore circa +5,4 p.p. nei tempi previsti e +6,0 p.p. per aver mai conseguito il diploma; SAT test-taking circa +8,5 p.p. Nessun effetto rilevabile sui punteggi standardizzati statali.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Espandere posti di qualità richiede spazi, educatori qualificati, rapporto numerico sostenibile, curriculum, supervisione e finanziamento pluriennale. La città di Boston utilizza una combinazione di posti BPS e provider comunitari; il costo marginale e la capacità di personale sono determinanti per la trasferibilità.",
    limitations: [
      "Gli effetti sono local average treatment effects per candidati la cui frequenza è influenzata dalle lotterie nelle scuole sovra-domandate; non rappresentano necessariamente l'effetto medio su tutti i bambini.",
      "Le coorti valutate entrarono nel preschool nel 1997–2003; il modello attuale di Universal Pre-K è più ampio e usa anche provider comunitari, quindi non si deve attribuire automaticamente alla configurazione corrente lo stesso effect size.",
      "Il programma non mostra un effetto rilevabile sui test standardizzati statali: selezionare soltanto outcome accademici immediati sottostimerebbe alcuni benefici, ma non giustifica nemmeno l'idea che ogni dimensione cognitiva migliori.",
      "Le competenze istituzionali e l'organizzazione dell'educazione 3–6 in Italia differiscono da quelle statunitensi e richiedono coordinamento con sistema scolastico, Regione e gestori.",
    ],
    unintendedEffects:
      "Un'espansione rapida può spostare domanda e personale da servizi privati o del terzo settore, creare carenze di educatori e generare accesso diseguale se informazione, orari o procedure favoriscono famiglie già più attrezzate. Questi effetti devono essere monitorati insieme alla sola numerosità dei posti.",
    primarySource: {
      label: "City of Boston — Early Childhood, Education and Intervention",
      url: "https://www.boston.gov/departments/early-childhood/education-and-intervention",
    },
    evaluationStudies: [
      {
        label: "Quarterly Journal of Economics — The Long-Term Effects of Universal Preschool in Boston",
        url: "https://academic.oup.com/qje/article/138/1/363/6701924",
        citation: "Gray-Lobe G, Pathak PA, Walters CR (2023), The Long-Term Effects of Universal Preschool in Boston, Quarterly Journal of Economics 138(1):363–411",
        doi: "10.1093/qje/qjac036",
      },
      {
        label: "NBER Working Paper 28756",
        url: "https://www.nber.org/papers/w28756",
        citation: "Gray-Lobe G, Pathak PA, Walters CR (2021), The Long-Term Effects of Universal Preschool in Boston",
        doi: "10.3386/w28756",
      },
    ],
    lastVerifiedAt: "2026-09-16",
    transferabilityItaly:
      "Alta come evidenza sul valore di posti prescolari pubblici di qualità, ma l'adattamento deve rispettare l'assetto italiano di nidi/scuola dell'infanzia e le competenze di Comune, Stato e Regione. Il principio più trasferibile è collegare espansione dell'offerta, standard di qualità e valutazione longitudinale, non imitare il meccanismo di lotteria statunitense.",
    lameziaAdaptation:
      "Costruire innanzitutto una baseline 3–6 (e, separatamente, 0–3) con posti pubblici/convenzionati, domanda, liste d'attesa, rinunce, orari, copertura territoriale, personale e qualità. Se esiste domanda insoddisfatta, espandere gradualmente l'offerta di qualità e seguire coorti su frequenza, continuità, assenze e transizioni scolastiche. Se l'oversubscription produce già regole di priorità o spareggi ex lege, usarli solo come opportunità valutativa; non creare una lotteria per finalità di ricerca quando non è appropriato.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "anagrafe dei posti e della domanda 3–6",
      "liste d'attesa e rinunce",
      "geografia dell'offerta",
      "personale e standard di qualità",
      "costi per posto",
      "linkage longitudinali con esiti scolastici in forma protetta",
    ],
    tags: ["Boston", "Pre-K", "preschool", "lotteria", "istruzione", "college", "diploma", "RCT naturale"],
    revisionHistory: [
      {
        date: "2026-09-16",
        note: "Prima verifica e inserimento sulla base dello studio peer-reviewed con lotterie di ammissione e della documentazione cittadina corrente; separati gli effect size delle coorti storiche dal programma Universal Pre-K oggi ampliato.",
      },
    ],
  },
  {
    id: "buenos-aires-hospital-procurement-price-monitoring",
    title: "Monitoraggio comparativo dei prezzi di acquisto negli ospedali pubblici durante un crackdown anticorruzione",
    authority: "Secretaría de Salud, Gobierno de la Ciudad de Buenos Aires",
    territory: "Buenos Aires — rete degli ospedali pubblici cittadini",
    country: "Argentina",
    implementationYear: "1996–1997",
    problem:
      "Forti differenze nei prezzi pagati dagli ospedali pubblici per input omogenei, in un contesto in cui l'amministrazione cittadina considerava la corruzione e la debolezza dei controlli sul procurement un problema prioritario.",
    measure:
      "Da settembre 1996 la Secretaría de Salud richiese ai 33 ospedali pubblici della città di trasmettere sistematicamente per un gruppo di input informazioni su prezzo, quantità, marca, fornitore e mese dell'acquisto. Il monitoraggio comparativo dei prezzi fu introdotto come componente di un più ampio crackdown anticorruzione e aumentò la pressione di audit sugli uffici acquisti ospedalieri.",
    mechanism:
      "Rendere confrontabili acquisti decentralizzati di beni omogenei, ridurre l'asimmetria informativa del centro amministrativo e aumentare la probabilità percepita che prezzi anomali o pratiche inefficienti siano individuati. Il meccanismo può operare sia riducendo rent extraction/corruzione sia migliorando informazione e sforzo degli addetti agli acquisti.",
    population: "Uffici acquisti e amministrazioni degli ospedali pubblici della Città di Buenos Aires; indirettamente pazienti e bilancio sanitario cittadino.",
    primaryArea: "trasparenza_integrita_anticorruzione",
    secondaryAreas: ["procurement_spesa_pubblica", "capacita_amministrativa_personale"],
    interventionTypes: ["enforcement_controllo", "informazione_trasparenza", "modifica_organizzativa_processo"],
    tools: [
      "reporting standardizzato dei prezzi di acquisto",
      "benchmark cross-ospedale",
      "dati su prezzo, quantità, marca e fornitore",
      "monitoraggio centrale",
      "aumento dell'intensità di audit",
    ],
    territorialScale: "Rete cittadina di ospedali pubblici",
    interventionStatus:
      "Intervento storico: il dataset studiato copre la politica di monitoraggio e il crackdown del 1996–1997; nel dicembre 1997 la Secretaría de Salud cessò di compilare la serie utilizzata nello studio. Il caso è conservato come evidenza storica sul meccanismo di procurement monitoring, non come descrizione della governance attuale di Buenos Aires.",
    evaluationMethod:
      "Studio before-after panel su transazioni ospedaliere con effetti fissi e prodotti omogenei, sfruttando l'introduzione cittadina del crackdown come shock temporale e distinguendo una fase iniziale di audit massimo (primi nove mesi) da una fase successiva di intensità inferiore. Il campione analitico principale usa quattro input standardizzati e controlla anche l'andamento dell'indice dei prezzi farmaceutici. Non esiste però un gruppo contemporaneo di ospedali non trattati nella stessa città.",
    comparator: "Prezzi degli stessi input negli stessi ospedali prima del crackdown; controlli per prodotto/ospedale e verifica che i prezzi farmaceutici all'ingrosso non mostrassero un calo equivalente.",
    outcomes: ["prezzo unitario degli input omogenei", "dispersione/benchmark dei prezzi", "relazione tra audit intensity, salari e prezzi"],
    results:
      "Nella versione finale peer-reviewed i prezzi pagati per input di base omogenei diminuiscono del 14,6% durante i primi nove mesi del crackdown, quando l'intensità di audit è considerata massima. Nei successivi sette mesi recuperano circa cinque punti percentuali ma restano 9,7% sotto il periodo pre-intervento. Sull'intero periodo post la stima è circa −12,3%. Il paper interpreta i prezzi come indicatore imperfetto di corruzione/inefficienza e non dimostra che l'intera riduzione derivi da minore corruzione.",
    effectSize:
      "Versione finale Journal of Law & Economics: prezzi −14,6% nei primi nove mesi; nella fase successiva ancora −9,7% rispetto al pre-periodo; stima complessiva post-policy circa −12,3%. Le stime più alte riportate nel working paper iniziale (ad esempio −18% nei primi sei mesi) non sono usate come effect size canonico perché superseded dalla versione peer-reviewed.",
    evidenceStrength: "moderata",
    costsRequirements:
      "Richiede un dizionario di beni realmente comparabili, dati transazionali tempestivi e di buona qualità, analisti capaci di normalizzare quantità/specification e una funzione indipendente che esamini gli outlier. Il paper non fornisce un costo amministrativo completo dell'intervento; una replica moderna dovrebbe usare per quanto possibile dati nativi dell'e-procurement invece di creare reporting duplicato.",
    limitations: [
      "Non è un RCT né un difference-in-differences con unità non trattate: l'intervento fu cittadino e il controfattuale principale è temporale, quindi altri cambiamenti contemporanei possono contribuire agli effetti.",
      "L'intensità di audit è inferita dalle fasi del crackdown e non randomizzata.",
      "Prezzi elevati possono riflettere corruzione, ma anche minore capacità negoziale, informazione insufficiente, qualità non osservata o scarso effort; il paper stesso tratta il prezzo come proxy imperfetto.",
      "L'analisi si concentra su quattro input di base molto omogenei; la trasferibilità a servizi complessi, lavori o beni con forte differenziazione qualitativa è limitata.",
      "Il contesto risale al 1996–1997 e precede i moderni sistemi di e-procurement e open contracting.",
    ],
    unintendedEffects:
      "Un monitoraggio focalizzato solo sul prezzo può incentivare lo spostamento di pratiche opportunistiche verso categorie non monitorate, specifiche tecniche, quantità o qualità. Benchmark troppo meccanici possono inoltre penalizzare acquisti legittimamente più costosi se non si controllano condizioni di consegna, marca/specification e qualità.",
    primarySource: {
      label: "Inter-American Development Bank — Trasparenza e accountability negli ospedali pubblici: il caso argentino",
      url: "https://publications.iadb.org/fr/node/13306",
    },
    evaluationStudies: [
      {
        label: "Journal of Law and Economics — The Role of Wages and Auditing during a Crackdown on Corruption in the City of Buenos Aires",
        url: "https://www.journals.uchicago.edu/doi/10.1086/345578",
        citation: "Di Tella R, Schargrodsky E (2003), The Role of Wages and Auditing during a Crackdown on Corruption in the City of Buenos Aires, Journal of Law and Economics 46(1):269–292",
        doi: "10.1086/345578",
      },
      {
        label: "Harvard Business School — full text of the peer-reviewed article",
        url: "https://www.hbs.edu/ris/Publication%20Files/The%20Role%20of%20Wages%20and%20Auditing%20Buenos%20Aires_73092d4c-baf3-4e44-8c1b-7c7310e9d15b.pdf",
        citation: "Di Tella R, Schargrodsky E (2003), full-text author copy",
      },
    ],
    lastVerifiedAt: "2026-09-16",
    transferabilityItaly:
      "Alta per il principio di procurement analytics, benchmark di prezzo e audit risk-based, ma la replica deve innestarsi nel sistema italiano di e-procurement, BDNCP/ANAC e nelle piattaforme certificate, evitando nuovi obblighi informativi ridondanti. Il monitoraggio deve controllare specifiche, quantità, qualità, tempi e struttura della procedura, non soltanto il prezzo.",
    lameziaAdaptation:
      "Creare un pilot analitico su poche categorie comunali omogenee e ricorrenti: unit price normalizzato, quantità, fornitore, data, lotto, numero di offerenti, tempi di consegna e varianti. Confrontare distribuzioni nel tempo e con benchmark disponibili, segnalando outlier a una revisione umana indipendente senza etichettarli automaticamente come corruzione. Misurare prima/dopo prezzo, concorrenza, qualità/ritardi e frequenza degli outlier; per appalti complessi usare modelli di rischio distinti e non estendere il benchmark di prezzo meccanicamente.",
    implementability: "quick_win",
    capacityDataNeeds: [
      "estrazioni da piattaforme di e-procurement/BDNCP",
      "dizionario di categorie comparabili",
      "normalizzazione di unità e specifiche",
      "storico fornitori e offerenti",
      "controllo qualità/tempi di consegna",
      "workflow di revisione umana degli outlier",
    ],
    tags: ["Buenos Aires", "procurement", "anticorruzione", "audit", "benchmark prezzi", "ospedali", "monitoraggio", "outlier"],
    revisionHistory: [
      {
        date: "2026-09-16",
        note: "Prima verifica e inserimento; usate le stime della versione peer-reviewed finale e classificazione prudente moderata per assenza di un gruppo contemporaneo non trattato e per il carattere imperfetto del prezzo come proxy di corruzione.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
