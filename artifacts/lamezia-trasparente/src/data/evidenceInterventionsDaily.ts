import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_DAILY = [
  {
    id: "london-20mph-traffic-calmed-zones",
    title: "Zone urbane a 20 mph con moderazione fisica del traffico",
    authority: "Transport for London / London boroughs",
    territory: "Londra",
    country: "Regno Unito",
    implementationYear: "Zone introdotte progressivamente dal 1989; valutazione 1986–2006",
    problem:
      "Elevato rischio di collisioni e lesioni stradali, in particolare per bambini, pedoni e utenti vulnerabili, sulle strade urbane e residenziali.",
    measure:
      "Introduzione di zone con limite a 20 mph (circa 32 km/h) accompagnate, nei programmi storicamente valutati, da misure di traffic calming e ridisegno della strada per rendere credibile e auto-applicativo il limite.",
    mechanism:
      "Ridurre velocità operative e differenziali di velocità, diminuendo sia la probabilità di collisione sia l'energia trasferita in caso di impatto.",
    population: "Residenti e utenti delle strade incluse nelle zone 20 mph e delle aree immediatamente adiacenti.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["sicurezza_urbana_prevenzione", "salute_pubblica_locale"],
    interventionTypes: ["regolazione", "infrastruttura_fisica", "enforcement_controllo"],
    tools: ["limiti di velocità", "traffic calming", "ridisegno stradale", "segnaletica", "monitoraggio incidenti"],
    territorialScale: "Strada / quartiere / rete urbana",
    interventionStatus:
      "Politica consolidata e tuttora in espansione: nel 2026 TfL indica che oltre metà delle strade di Londra è soggetta a 20 mph e prosegue l'estensione sulla propria rete.",
    evaluationMethod:
      "Controlled interrupted time-series su dati di polizia geocodificati 1986–2006: 119.029 segmenti stradali con almeno un ferito, modelli di Poisson a effetti fissi e aggiustamento per il trend sottostante delle collisioni; verifica anche delle aree adiacenti.",
    comparator:
      "Evoluzione temporale sugli stessi segmenti prima dell'introduzione e trend delle altre strade londinesi; aree adiacenti analizzate per verificare displacement.",
    outcomes: ["feriti da collisione", "morti o feriti gravi", "feriti tra 0–15 anni", "pedoni feriti", "displacement nelle aree adiacenti"],
    results:
      "L'introduzione delle zone è associata a forti riduzioni delle vittime stradali, più marcate per bambini e per morti/feriti gravi. Non emerge spostamento del rischio verso le strade immediatamente adiacenti.",
    effectSize:
      "Tutte le vittime −41,9% (IC95% 36,0–47,8); 0–15 anni −48,5%; morti/feriti gravi −46,3%; morti/feriti gravi 0–15 anni −50,2%; pedoni −32,4%. Nelle aree adiacenti le vittime diminuiscono dell'8,0%.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede diagnosi dei tratti a rischio, progettazione stradale, segnaletica e, dove necessario, moderazione fisica ed enforcement. La sola modifica nominale del limite non coincide con il trattamento storico valutato.",
    limitations: [
      "Studio osservazionale longitudinale, non randomizzato; il disegno controlla trend e regressione verso la media ma non elimina ogni possibile confondente.",
      "Le zone storiche includevano spesso interventi fisici di traffic calming: non è corretto trasferire automaticamente la stessa stima a un semplice cambio di segnaletica.",
      "Composizione del traffico, infrastruttura stradale e livelli di incidentalità londinesi differiscono dal contesto di Lamezia Terme.",
    ],
    unintendedEffects:
      "Lo studio non trova evidenza di migrazione delle vittime nelle aree adiacenti; restano da monitorare tempi di percorrenza, deviazioni di traffico e accettabilità locale in ogni nuova implementazione.",
    primarySource: {
      label: "Transport for London — Safe speeds",
      url: "https://tfl.gov.uk/corporate/protecting-our-network/road-safety/safe-speeds",
    },
    evaluationStudies: [
      {
        label: "BMJ",
        url: "https://www.bmj.com/content/339/bmj.b4469",
        citation: "Grundy et al. (2009), Effect of 20 mph traffic speed zones on road injuries in London, 1986-2006: controlled interrupted time series analysis",
        doi: "10.1136/bmj.b4469",
      },
      {
        label: "Transport for London — review of borough zones",
        url: "https://content.tfl.gov.uk/review-of-20mph-zones-in-london-boroughs-full-report.pdf",
        citation: "Webster and Layfield (2007), Review of 20 mph zones in London Boroughs, PPR243",
      },
    ],
    lastVerifiedAt: "2026-08-30",
    transferabilityItaly:
      "Alta per la logica di sicurezza stradale e per interventi mirati su strade comunali, ma l'equivalente italiano deve rispettare Codice della strada, competenze e standard tecnici nazionali. L'elemento trasferibile è la combinazione limite credibile + progetto fisico + misurazione.",
    lameziaAdaptation:
      "Costruire una mappa comunale di collisioni, velocità rilevate, scuole, attraversamenti e flussi pedonali; selezionare pochi cluster ad alto rischio e introdurre zone 30 km/h con traffic calming, preferibilmente con rollout per fasi e misure pre/post su velocità, collisioni e traffico di deviazione.",
    implementability: "medio_termine",
    capacityDataNeeds: ["microdati georeferenziati sugli incidenti", "rilievi di velocità", "rete stradale e scuole", "conteggi di traffico", "progettazione tecnica"],
    tags: ["sicurezza stradale", "zone 30", "traffic calming", "pedoni", "quasi-esperimento"],
    revisionHistory: [{ date: "2026-08-30", note: "Prima verifica e inserimento nell'archivio." }],
  },
  {
    id: "italy-payt-municipal-waste-fees",
    title: "Tariffazione puntuale dei rifiuti (PAYT/TARIP) basata sulla quantità conferita",
    authority: "Comuni italiani che adottano sistemi PAYT / tariffazione puntuale",
    territory: "Italia — oltre 6.100 comuni nel dataset principale",
    country: "Italia",
    implementationYear: "Adozioni comunali osservate nei dati 2017; successive valutazioni longitudinali",
    problem:
      "Una tariffa rifiuti scarsamente collegata alla quantità effettivamente prodotta riduce l'incentivo a prevenire il rifiuto e a differenziare correttamente, mentre la componente indifferenziata è costosa da gestire.",
    measure:
      "Passaggio da una tariffazione prevalentemente parametrica a un sistema pay-as-you-throw in cui almeno una parte del corrispettivo dipende dalla quantità di rifiuto conferita, misurata tramite peso, volume, sacchi/contenitori o conferimenti identificati.",
    mechanism:
      "Rendere marginalmente costoso il rifiuto residuo e visibile il nesso tra comportamento dell'utente e tariffa, incentivando prevenzione e raccolta differenziata e riducendo i costi della frazione indifferenziata.",
    population: "Utenze domestiche e non domestiche dei comuni che applicano tariffazione puntuale.",
    primaryArea: "rifiuti_pulizia_urbana",
    secondaryAreas: ["ambiente_clima_energia", "fiscalita_entrate_riscossione"],
    interventionTypes: ["incentivo_economico", "regolazione", "targeting_data_analytics"],
    tools: ["misurazione dei conferimenti", "identificazione utenza", "tariffa variabile", "raccolta differenziata", "monitoraggio costi e abbandoni"],
    territorialScale: "Comune / servizio di gestione dei rifiuti",
    interventionStatus:
      "Strumento adottato da una minoranza ma ormai consolidato di comuni italiani; la letteratura recente continua a valutarne effetti diretti e spillover ambientali.",
    evaluationMethod:
      "Studio Banca d'Italia su circa 6.100 comuni con OLS, propensity-score matching e robustness check che restringe i controlli ai comuni confinanti; una successiva valutazione longitudinale utilizza stacked difference-in-differences sull'adozione PAYT.",
    comparator:
      "Comuni TARI comparabili non PAYT; nelle verifiche più restrittive comuni confinanti non PAYT e, nello studio longitudinale, comuni non ancora trattati / non trattati secondo il disegno stacked DiD.",
    outcomes: ["rifiuti totali pro capite", "rifiuto indifferenziato", "raccolta differenziata", "costo totale del servizio", "costi della frazione indifferenziata", "comportamenti pro-ambientali"],
    results:
      "Il PAYT è associato a forte riduzione del residuo, maggiore differenziazione e costi di gestione più bassi. Il successivo studio longitudinale conferma la riduzione dell'indifferenziato e identifica anche spillover positivi su comportamenti ambientali non direttamente tariffati.",
    effectSize:
      "Nel propensity-score matching Banca d'Italia: rifiuti totali −22 kg/abitante (circa −5%); indifferenziato −94 kg (circa −53%); costo totale −26 €/abitante (circa −18%); costo dell'indifferenziato −22 €/abitante (circa −44%).",
    evidenceStrength: "forte",
    costsRequirements:
      "Sono necessari sistemi affidabili di identificazione e misurazione, integrazione con l'anagrafica TARI/TARIP, regole per la quota variabile, comunicazione agli utenti e capacità di controllare abbandoni/trasferimenti. Gli investimenti iniziali possono essere rilevanti.",
    limitations: [
      "Le stime puntuali Banca d'Italia derivano da matching su osservabili e non da assegnazione casuale; la comparazione con comuni confinanti attenua ma non annulla il rischio di selezione.",
      "Tecnologia, formula tariffaria e qualità della raccolta differiscono tra comuni: PAYT non è un trattamento perfettamente uniforme.",
      "Rischi di abbandono illegale, errori di misurazione e distribuzione regressiva dei costi richiedono monitoraggio e correttivi locali.",
    ],
    unintendedEffects:
      "Il rischio principale è lo smaltimento/elusione fuori circuito; la valutazione deve includere abbandoni, contaminazione della differenziata e oneri per nuclei numerosi o vulnerabili, non solo la riduzione dell'indifferenziato.",
    primarySource: {
      label: "Banca d'Italia — Questioni di Economia e Finanza n. 584",
      url: "https://www.bancaditalia.it/pubblicazioni/qef/2020-0584/index.html",
    },
    evaluationStudies: [
      {
        label: "Banca d'Italia",
        url: "https://www.bancaditalia.it/pubblicazioni/qef/2020-0584/QEF_584_20.pdf",
        citation: "Messina and Tomasi (2020), Wasted in waste? The benefits of switching from taxes to Pay-as-you-throw fees: the Italian case",
        doi: "10.32057/0.QEF.2020.584",
      },
      {
        label: "Journal of Economic Behavior & Organization",
        url: "https://ideas.repec.org/a/eee/jeborg/v239y2025ics016726812500366x.html",
        citation: "Colussi, Romagnoli and Villar (2025), The indirect environmental effects of taxing waste",
        doi: "10.1016/j.jebo.2025.107247",
      },
    ],
    lastVerifiedAt: "2026-08-30",
    transferabilityItaly:
      "Molto alta perché l'evidenza riguarda direttamente comuni italiani. La scelta operativa resta però subordinata al quadro tariffario vigente, al gestore del servizio, alla disponibilità di infrastruttura di misurazione e alla struttura locale della raccolta.",
    lameziaAdaptation:
      "Prima di una transizione generalizzata, costruire una simulazione TARI/TARIP su dati reali di utenza e raccolta; valutare un pilota geograficamente circoscritto con contenitori o sacchi identificati, mantenendo una baseline su residuo, differenziata, costi, abbandoni e reclami e prevedendo correttivi per vulnerabilità e nuclei numerosi.",
    implementability: "strutturale",
    capacityDataNeeds: ["anagrafica TARI", "quantità per frazione e zona", "costi del servizio", "tecnologia di identificazione/misurazione", "dati su abbandoni e reclami"],
    tags: ["rifiuti", "PAYT", "TARIP", "incentivi", "tariffazione puntuale", "difference-in-differences"],
    revisionHistory: [{ date: "2026-08-30", note: "Prima verifica e inserimento nell'archivio." }],
  },
  {
    id: "chicago-one-summer-plus-youth-jobs",
    title: "Lavoro estivo retribuito e mentoring per giovani esposti a elevato rischio di violenza",
    authority: "City of Chicago / Department of Family and Support Services / One Summer Chicago Plus",
    territory: "Chicago, Illinois",
    country: "Stati Uniti",
    implementationYear: "2012 (coorte principale valutata); successive espansioni e repliche",
    problem:
      "Giovani in quartieri ad alta violenza con accesso limitato al lavoro estivo, alta esposizione a vittimizzazione e arresti e deboli opportunità di esperienza lavorativa strutturata.",
    measure:
      "Programma estivo di otto settimane: 25 ore settimanali di lavoro retribuito al salario minimo in enti pubblici o nonprofit con mentor; un secondo braccio sostituiva 10 ore di lavoro con formazione socio-emotiva basata su principi cognitivo-comportamentali.",
    mechanism:
      "Offrire esperienza lavorativa, adulti di riferimento, routine e competenze di gestione dei conflitti prima dell'uscita dal sistema scolastico, modificando opportunità e comportamenti anche oltre il periodo estivo.",
    population: "1.634 studenti di scuola superiore, 14–21 anni, provenienti da 13 scuole/quartieri di Chicago ad alta violenza.",
    primaryArea: "istruzione_giovani",
    secondaryAreas: ["sicurezza_urbana_prevenzione", "sviluppo_economico_commercio_lavoro", "welfare_inclusione_servizi_sociali"],
    interventionTypes: ["servizio_diretto", "partnership_pubblico_privato_terzo_settore", "formazione_capacity_building", "incentivo_economico"],
    tools: ["lavori estivi retribuiti", "mentor 1:10", "placement in enti pubblici/nonprofit", "formazione socio-emotiva"],
    territorialScale: "Città / scuole e quartieri target",
    interventionStatus:
      "Il modello ha alimentato le successive edizioni ed espansioni di One Summer Chicago; la valutazione qui riportata si riferisce alla coorte 2012 e non attribuisce automaticamente gli stessi effetti alle versioni successive.",
    evaluationMethod:
      "Randomized controlled trial: 1.634 candidati assegnati casualmente a lavoro+mentoring, lavoro+mentoring+SEL oppure controllo; outcome da registri scolastici e arresti fino a 16 mesi dopo la randomizzazione.",
    comparator: "Giovani eleggibili assegnati al gruppo di controllo, senza offerta del programma One Summer Plus.",
    outcomes: ["arresti per reati violenti", "altri arresti", "frequenza scolastica", "outcome scolastici"],
    results:
      "L'offerta di lavoro estivo riduce in modo sostanziale gli arresti per reati violenti, con gran parte dell'effetto dopo la fine delle otto settimane. Non emergono effetti sull'insieme degli altri arresti o sulla frequenza scolastica; sostituire ore di lavoro con SEL non aggiunge un beneficio rilevabile.",
    effectSize:
      "Arresti per reati violenti −43% in 16 mesi, pari a 3,95 arresti violenti in meno ogni 100 giovani assegnati al programma rispetto al controllo.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Richiede salario per i partecipanti, posti di lavoro reali e supervisionati, partner pubblici/nonprofit, matching, gestione amministrativa e mentor. Nel trial i giovani erano pagati al salario minimo dell'Illinois dell'epoca (8,25 USD/ora).",
    limitations: [
      "Il campione era deliberatamente concentrato su giovani svantaggiati in aree di Chicago ad alta violenza; l'effetto medio non va trasferito a popolazioni giovanili generali.",
      "Non sono emersi miglioramenti generali negli outcome scolastici o nell'occupazione formale successiva: il beneficio dimostrato è soprattutto sulla violenza.",
      "Il trattamento include lavoro, mentoring e supporto organizzativo: non è identificato il contributo separato di ciascun componente.",
    ],
    unintendedEffects:
      "Le analisi successive invitano a monitorare anche reati non violenti, occupazione e scuola, perché un programma efficace sulla violenza non implica automaticamente benefici su tutti gli altri outcome.",
    primarySource: {
      label: "University of Chicago Crime Lab — One Summer Chicago Plus",
      url: "https://crimelab.uchicago.edu/projects/one-summer-chicago-plus/",
    },
    evaluationStudies: [
      {
        label: "Science / PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/25477459/",
        citation: "Heller (2014), Summer jobs reduce violence among disadvantaged youth",
        doi: "10.1126/science.1257809",
      },
      {
        label: "J-PAL evaluation summary",
        url: "https://www.povertyactionlab.org/evaluation/summer-jobs-reduce-violence-among-youth-facing-barriers-opportunity-united-states",
        citation: "J-PAL, Summer Jobs Reduce Violence Among Youth Facing Barriers to Opportunity in the United States",
      },
    ],
    lastVerifiedAt: "2026-08-30",
    transferabilityItaly:
      "Moderata-alta per un programma locale mirato di esperienza lavorativa e mentoring, purché sia inserito nelle competenze e nei partenariati disponibili e non venga presentato come misura universale di prevenzione della criminalità.",
    lameziaAdaptation:
      "Creare un piccolo programma estivo per adolescenti/giovani in condizione di fragilità, con posti presso uffici e servizi comunali, biblioteche, cultura, verde, associazioni e imprese partner, salario/indennità coerente con il quadro italiano e tutor dedicati. Se le domande eccedono i posti, usare una lotteria trasparente o rollout casualizzato per una valutazione credibile.",
    implementability: "medio_termine",
    capacityDataNeeds: ["criteri di eleggibilità", "posti di lavoro/tirocinio sicuri", "budget compensi", "mentor e partner", "consensi e governance dati", "outcome predefiniti"],
    tags: ["giovani", "lavoro estivo", "prevenzione violenza", "mentoring", "RCT"],
    revisionHistory: [{ date: "2026-08-30", note: "Prima verifica e inserimento nell'archivio." }],
  },
  {
    id: "denver-housing-first-supportive-housing-sib",
    title: "Housing First con supporto intensivo per persone senza dimora ad alto utilizzo dei servizi",
    authority: "City and County of Denver",
    territory: "Denver, Colorado",
    country: "Stati Uniti",
    implementationYear: "2016–2020",
    problem:
      "Persone in homelessness cronica che ciclicamente utilizzano carcere, polizia, shelter, detox e servizi sanitari d'emergenza senza raggiungere stabilità abitativa.",
    measure:
      "Offerta di alloggio permanente con sussidio e servizi intensivi secondo Housing First, senza precondizioni di trattamento; il programma fu finanziato inizialmente con un Social Impact Bond e servizi/case management dedicati.",
    mechanism:
      "Stabilizzare rapidamente l'abitazione e fornire supporto continuativo per ridurre il ciclo strada–emergenza–carcere e spostare l'uso dei servizi verso cure e sostegni programmati.",
    population: "724 persone eleggibili con homelessness cronica e frequenti interazioni con sistemi di giustizia ed emergenza; 363 randomizzate all'offerta e 361 al controllo.",
    primaryArea: "housing_politiche_abitative",
    secondaryAreas: ["welfare_inclusione_servizi_sociali", "salute_pubblica_locale", "sicurezza_urbana_prevenzione"],
    interventionTypes: ["servizio_diretto", "partnership_pubblico_privato_terzo_settore", "procurement_contract_design"],
    tools: ["alloggio permanente", "sussidio abitativo", "Housing First", "case management intensivo", "contratto pay-for-success"],
    territorialScale: "Città / popolazione ad alto bisogno",
    interventionStatus:
      "La sperimentazione SIB si è conclusa con valutazione finale; Denver ha continuato a sviluppare strumenti di supportive housing e fondi dedicati alla homelessness, ma il record riguarda il trattamento valutato 2016–2020.",
    evaluationMethod:
      "Randomized controlled trial intent-to-treat: 724 eleggibili assegnati casualmente all'offerta di supportive housing o ai servizi usuali; follow-up su housing, shelter, polizia, carcere, detox e sanità per tre anni e oltre.",
    comparator: "Servizi usuali disponibili nella comunità senza offerta del programma Denver SIB.",
    outcomes: ["giorni con assistenza abitativa", "shelter", "contatti di polizia", "arresti", "giorni e ingressi in carcere", "detox", "servizi sanitari"],
    results:
      "L'offerta di supportive housing aumenta fortemente il tempo in alloggio e riduce shelter, contatti di polizia, arresti, ingressi/giorni in carcere e detox. Le differenze aggregate nell'uso dei servizi medici d'emergenza non risultano tutte statisticamente significative.",
    effectSize:
      "+560 giorni di assistenza abitativa in tre anni; shelter −40%; contatti di polizia −34%; arresti −40%; ingressi in carcere −30%; giorni in carcere −27% (−38 giorni); visite detox −65%. Tra i partecipanti effettivamente alloggiati, 86% era ancora stabilmente alloggiato a un anno.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Il SIB originario mobilitò 8,6 milioni USD per 250 persone target e fece leva anche su risorse abitative e Medicaid. Il modello richiede stock/voucher abitativi e servizi intensivi; i risparmi su altri sistemi compensano solo parte del costo e non va assunto un pareggio automatico.",
    limitations: [
      "Il trattamento dipende dalla disponibilità di alloggi e da servizi intensivi multidisciplinari; il solo sussidio abitativo non equivale al programma valutato.",
      "Il contesto statunitense di sanità, homelessness e giustizia è diverso dal sistema italiano; competenze e finanziamenti sono distribuiti tra Comune, sanità e altri enti.",
      "La randomizzazione stima l'effetto dell'offerta; non tutte le persone assegnate al trattamento furono effettivamente localizzate e alloggiate.",
    ],
    unintendedEffects:
      "Nessun claim di piena autosufficienza finanziaria: l'analisi dei costi mostra offset importanti ma non elimina il costo netto. La selezione dei beneficiari deve evitare criteri che penalizzino chi ha bisogni elevati ma minore uso documentato dei servizi.",
    primarySource: {
      label: "City and County of Denver — Department of Housing Stability, 2024 briefing",
      url: "https://denvergov.org/files/assets/public/v/1/city-council/documents/d6/host-2024-city-council-presentation_.pdf",
    },
    evaluationStudies: [
      {
        label: "Urban Institute — final RCT report",
        url: "https://www.urban.org/research/publication/breaking-homelessness-jail-cycle-housing-first-results-denver-supportive-housing-social-impact-bond-initiative",
        citation: "Cunningham et al. (2021), Breaking the Homelessness-Jail Cycle with Housing First: Results from the Denver Supportive Housing Social Impact Bond Initiative",
      },
      {
        label: "Urban Institute — costs and offsets",
        url: "https://www.urban.org/research/publication/costs-and-offsets-providing-supportive-housing-break-homelessness-jail-cycle",
        citation: "Gillespie et al. (2021), Costs and Offsets of Providing Supportive Housing to Break the Homelessness-Jail Cycle",
      },
    ],
    lastVerifiedAt: "2026-08-30",
    transferabilityItaly:
      "Trasferibilità concettuale alta per Housing First e case management integrato; trasferibilità istituzionale più complessa perché richiede coordinamento tra Comune, ASP/servizi sanitari, terzo settore e soggetti che controllano risorse abitative.",
    lameziaAdaptation:
      "Prima mappare la popolazione senza dimora ad alto utilizzo di pronto soccorso, servizi sociali e, dove legalmente e proporzionatamente possibile, sistemi di giustizia. Solo in presenza di stock/voucher e partner clinico-sociali, avviare un piccolo programma Housing First con case manager e outcome su stabilità abitativa, emergenze, shelter e costi di servizio.",
    implementability: "strutturale",
    capacityDataNeeds: ["stima homelessness e bisogni", "stock/voucher abitativi", "case management", "accordi Comune-ASP-terzo settore", "data governance inter-ente", "analisi costi"],
    tags: ["Housing First", "homelessness", "supportive housing", "case management", "RCT"],
    revisionHistory: [{ date: "2026-08-30", note: "Prima verifica e inserimento nell'archivio." }],
  },
  {
    id: "boston-public-prek-long-term-lottery",
    title: "Pre-K pubblico di qualità e risultati educativi di lungo periodo",
    authority: "Boston Public Schools / City of Boston",
    territory: "Boston, Massachusetts",
    country: "Stati Uniti",
    implementationYear: "Coorti 1997–2003; programma cittadino successivamente evoluto ed esteso",
    problem:
      "Accesso diseguale a educazione prescolare strutturata e necessità di capire se un programma pubblico su larga scala produce benefici che persistono oltre i test scolastici di breve periodo.",
    measure:
      "Accesso a posti di pre-kindergarten nelle Boston Public Schools. Il programma contemporaneo Boston Pre-K è city-funded, opera per 6,5 ore al giorno e 180 giorni, con curriculum strutturato, personale qualificato, family engagement e delivery anche tramite provider comunitari; questa configurazione attuale è però successiva alle coorti valutate.",
    mechanism:
      "Fornire precocemente un ambiente educativo strutturato e stabile che sviluppi competenze accademiche, sociali e comportamentali e migliori la transizione nel percorso scolastico.",
    population: "Oltre 4.000 bambini di quattro anni partecipanti alle lotterie di ammissione BPS in sette coorti 1997–2003.",
    primaryArea: "istruzione_giovani",
    secondaryAreas: ["welfare_inclusione_servizi_sociali"],
    interventionTypes: ["servizio_diretto", "formazione_capacity_building", "partnership_pubblico_privato_terzo_settore"],
    tools: ["pre-K pubblico", "lotteria di ammissione storica", "curriculum", "personale qualificato", "family engagement"],
    territorialScale: "Città / sistema scolastico",
    interventionStatus:
      "Boston continua a finanziare un programma universale Pre-K, oggi più ampio e con modello mixed-delivery. Gli effetti causali qui riportati appartengono alle coorti BPS 1997–2003 e non vanno attribuiti automaticamente all'attuale configurazione.",
    evaluationMethod:
      "Natural experiment basato sulle lotterie di ammissione: oltre 4.000 candidati di quattro anni in sette coorti, con comparazione tra vincitori e non vincitori e follow-up amministrativo di circa vent'anni su scuola, SAT, college e disciplina.",
    comparator: "Bambini comparabili che parteciparono alla stessa procedura di assegnazione ma non ottennero un posto tramite la lotteria.",
    outcomes: ["diploma", "SAT", "immatricolazione universitaria", "college quadriennale", "test standardizzati", "assenze e sospensioni", "incarcerazione minorile"],
    results:
      "Il pre-K aumenta diploma, partecipazione al SAT e accesso al college e riduce alcuni outcome disciplinari, senza un effetto discernibile sui test standardizzati statali. Il risultato suggerisce che valutazioni limitate ai test di breve periodo possono perdere benefici di lungo termine.",
    effectSize:
      "Immatricolazione universitaria on-time +8,3 punti percentuali (+18% sul baseline); college in qualsiasi momento +5,4 pp; college quadriennale +5,9 pp; partecipazione al SAT +8,5 pp; incarcerazione minorile −1 pp.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Richiede posti educativi, personale qualificato, curriculum e coaching, capacità di inclusione e continuità con la scuola dell'infanzia/primaria. Il costo locale non è trasferibile direttamente dal contesto di Boston e va stimato sul sistema italiano 0–6.",
    limitations: [
      "La configurazione Boston Pre-K attuale è cambiata rispetto al programma BPS delle coorti 1997–2003; il record separa esplicitamente trattamento valutato e modello odierno.",
      "La lotteria identifica l'effetto per bambini la cui partecipazione dipende dall'esito dell'assegnazione, non necessariamente per ogni bambino della città.",
      "Non vi è un aumento rilevabile nei test standardizzati statali: i benefici osservati sono soprattutto su traiettorie educative e comportamentali di lungo periodo.",
    ],
    unintendedEffects:
      "L'espansione quantitativa senza standard di qualità può non replicare gli effetti storici. Va inoltre verificata l'equità di accesso per famiglie con minore capacità informativa o barriere linguistiche.",
    primarySource: {
      label: "Boston Public Schools — Boston Pre-K",
      url: "https://www.bostonpublicschools.org/students-families/universal-pre-k-boston/about",
    },
    evaluationStudies: [
      {
        label: "Quarterly Journal of Economics",
        url: "https://academic.oup.com/qje/article-abstract/138/1/363/6701924",
        citation: "Gray-Lobe, Pathak and Walters (2023), The Long-Term Effects of Universal Preschool in Boston",
        doi: "10.1093/qje/qjac036",
      },
      {
        label: "NBER working paper",
        url: "https://www.nber.org/papers/w28756",
        citation: "Gray-Lobe, Pathak and Walters, The Long-Term Effects of Universal Preschool in Boston",
      },
    ],
    lastVerifiedAt: "2026-08-30",
    transferabilityItaly:
      "Alta come principio di investimento precoce e qualità, ma non come replica istituzionale: in Italia competenze su servizi 0–6, scuola dell'infanzia e personale sono distribuite tra Stato, Regione, Comune e gestori. L'elemento utile è misurare qualità e outcome di lungo periodo, non importare il modello amministrativo di Boston.",
    lameziaAdaptation:
      "Mappare copertura, liste d'attesa, orari, personale, continuità educativa e servizi integrativi dell'offerta prescolare locale; identificare un pacchetto realistico di qualità (formazione/coaching, curriculum, family engagement, transizioni) e impostare fin dall'inizio indicatori longitudinali, evitando di valutare il programma solo sui test immediati.",
    implementability: "strutturale",
    capacityDataNeeds: ["mappa offerta 0–6", "liste d'attesa e domanda", "standard di qualità", "accordi con scuole/gestori", "indicatori longitudinali", "governance privacy"],
    tags: ["pre-K", "prima infanzia", "istruzione", "lotteria", "outcome di lungo periodo"],
    revisionHistory: [{ date: "2026-08-30", note: "Prima verifica e inserimento nell'archivio." }],
  },
] as const satisfies readonly EvidenceIntervention[];
