import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_10 = [
  {
    id: "catalonia-municipal-ibi-solar-pv-rebates",
    title: "Bonificazioni comunali dell'imposta immobiliare per l'autoconsumo fotovoltaico",
    authority: "Comuni catalani / Institut Català d'Energia (mappatura istituzionale)",
    territory: "Catalogna",
    country: "Spagna",
    implementationYear: "Adozioni comunali scaglionate osservate nel 2015–2022; misure locali ancora presenti nel 2026",
    problem:
      "Gli elevati costi iniziali e i tempi di recupero dell'investimento possono rallentare l'adozione domestica di impianti fotovoltaici, anche quando tecnologia e irraggiamento rendono l'autoconsumo tecnicamente possibile.",
    measure:
      "Riduzione temporanea dell'Impuesto sobre Bienes Inmuebles (IBI) decisa con ordinanza comunale per immobili che installano volontariamente impianti fotovoltaici per autoconsumo. Percentuale, durata, requisiti e tetti variano tra comuni; l'Institut Català d'Energia mantiene una mappatura istituzionale delle bonificazioni comunali.",
    mechanism:
      "Ridurre il costo privato netto dell'investimento dopo l'installazione e rendere più favorevole il rendimento atteso del fotovoltaico domestico. La variazione territoriale e temporale delle ordinanze genera inoltre un'esposizione differenziata utilizzabile per valutare l'effetto della politica.",
    population:
      "Proprietari di immobili e famiglie nei comuni catalani che introducono una bonificazione IBI per impianti fotovoltaici di autoconsumo; l'analisi empirica usa un panel mensile bilanciato di comuni catalani dal 2015 al 2022.",
    primaryArea: "ambiente_clima_energia",
    secondaryAreas: ["fiscalita_entrate_riscossione", "sviluppo_economico_commercio_lavoro"],
    interventionTypes: ["incentivo_economico", "regolazione", "informazione_trasparenza"],
    tools: ["bonificazione IBI", "ordinanza fiscale comunale", "registri degli impianti fotovoltaici", "mappatura delle agevolazioni", "autoconsumo"],
    territorialScale: "Comune / immobile",
    interventionStatus:
      "Politica diffusa ma eterogenea tra comuni. L'ICAEN continua a documentare strumenti comunali per promuovere l'autoconsumo; aliquota, durata e condizioni devono essere verificate nell'ordinanza vigente di ciascun ente.",
    evaluationMethod:
      "Difference-in-differences con adozione scaglionata su panel mensile comunale 2015–2022. Lo studio stima group-time treatment effects per confrontare l'evoluzione dei comuni dopo l'introduzione della bonificazione con comuni non ancora esposti nello stesso periodo, tenendo conto della tempistica differenziata dell'adozione.",
    comparator:
      "Comuni catalani non ancora trattati nello stesso periodo del comune che introduce la bonificazione, secondo il disegno staggered DiD del paper.",
    outcomes: ["capacità fotovoltaica installata", "numero di nuove installazioni fotovoltaiche", "adozione residenziale dell'autoconsumo", "addizionalità delle installazioni agevolate", "costo implicito di abbattimento della CO2"],
    results:
      "L'introduzione della bonificazione IBI aumenta sostanzialmente l'adozione fotovoltaica comunale, ma la valutazione finale mostra anche un'importante quota inframarginale: il 68% delle installazioni agevolate sarebbe avvenuto anche senza la politica. Il risultato sostiene quindi l'efficacia sul margine di adozione, non l'idea che tutto il beneficio fiscale finanzi capacità addizionale.",
    effectSize:
      "Nell'articolo pubblicato la bonificazione aumenta la capacità fotovoltaica installata del 34–50% e produce circa una nuova installazione aggiuntiva per comune trattato al mese. Gli autori stimano che il 68% delle installazioni esentate sarebbe avvenuto comunque e un costo implicito di abbattimento di circa 102 €/tCO2.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede base giuridica per l'agevolazione, modifica dell'ordinanza fiscale, criteri di eleggibilità verificabili, collegamento con documentazione tecnica dell'impianto e una stima ex ante del minor gettito. Il paper stima un costo implicito di abbattimento di circa 102 €/tCO2 nel contesto analizzato; non è un costo fiscale unitario direttamente trasferibile a un comune italiano.",
    limitations: [
      "L'adozione della bonificazione non è randomizzata: il disegno staggered DiD migliora l'identificazione ma non elimina ogni possibile differenza non osservata tra comuni che adottano prima, dopo o mai la misura.",
      "Tra il 2015 e il 2022 cambiano anche prezzi dei pannelli, incentivi nazionali/regionali, prezzi energetici e disciplina dell'autoconsumo; il paper usa la variazione comunale per isolare la bonificazione, ma il contesto di mercato resta importante per la trasferibilità.",
      "Percentuale, durata, tetti e requisiti differiscono tra ordinanze: l'intervallo di effetto medio pubblicato non identifica automaticamente il disegno fiscalmente più efficiente.",
      "La quota inframarginale stimata è elevata: il 68% delle installazioni agevolate sarebbe avvenuto anche senza la politica, quindi addizionalità e costo-opportunità del gettito devono essere esplicitamente valutati.",
      "Un incentivo legato alla proprietà immobiliare può favorire maggiormente famiglie proprietarie con capitale o accesso al credito; equità distributiva e accesso dei condomini richiedono analisi separata.",
      "In Italia un comune non può presumere di poter replicare la bonificazione spagnola sull'IMU: la base legislativa e i margini di autonomia tributaria devono essere verificati prima di qualsiasi proposta."
    ],
    unintendedEffects:
      "Possibili effetti distributivi regressivi, perdita di gettito per installazioni che sarebbero avvenute comunque e concentrazione del beneficio sugli immobili tecnicamente più adatti o sui proprietari con maggiore capacità finanziaria.",
    primarySource: {
      label: "Institut Català d'Energia — municipis amb bonificacions IBI per a l'autoconsum",
      url: "https://icaen.gencat.cat/ca/energia/autoconsum/autoconsum-fotovoltaic/cercador-de-municipis-amb-bonificacions-per-a-lautoconsum"
    },
    evaluationStudies: [
      {
        label: "Resource and Energy Economics — ScienceDirect",
        url: "https://www.sciencedirect.com/science/article/pii/S0928765526000321",
        citation: "van Raalte L, Teixidó JJ (2026), Municipal tax incentives and solar PV adoption: Causal evidence from Catalonia, Resource and Energy Economics 87, 101583"
      },
      {
        label: "Universitat de Barcelona / RePEc working paper",
        url: "https://ideas.repec.org/p/ira/wpaper/202605.html",
        citation: "van Raalte L, Teixidó JJ (2026), Municipal tax incentives and solar PV adoption: Causal evidence from Catalonia, Working Paper 2026/05"
      }
    ],
    lastVerifiedAt: "2026-09-10",
    transferabilityItaly:
      "Media per lo strumento fiscale specifico e alta per il principio di policy design. Un comune italiano può usare leve locali per accelerare l'autoconsumo soltanto entro i margini normativi effettivamente disponibili; il valore del caso catalano è mostrare sia addizionalità misurabile sia il rischio di finanziare investimenti inframarginali, per cui aliquota, durata e costo fiscale devono essere trattati come parametri valutabili.",
    lameziaAdaptation:
      "Prima di proporre una nuova agevolazione, mappare impianti fotovoltaici esistenti, nuove installazioni, tipologie immobiliari, autoconsumo collettivo e incentivi già disponibili a Lamezia; verificare con tributi e ufficio legale quali leve fiscali locali siano realmente consentite. Se esiste uno spazio normativo, stimare ex ante beneficiari, minor gettito, quota plausibilmente inframarginale e addizionalità attesa e introdurre una misura con durata e tetto espliciti, monitorando installazioni addizionali per euro di beneficio.",
    implementability: "strutturale",
    capacityDataNeeds: ["registro georeferenziato degli impianti", "dati catastali/tributari aggregati", "quadro normativo IMU e tributi locali", "stima del minor gettito", "baseline e gruppo di confronto", "analisi distributiva", "stima dell'addizionalità"],
    tags: ["fotovoltaico", "autoconsumo", "IBI", "incentivo fiscale", "difference-in-differences", "Catalogna", "energia"],
    revisionHistory: [{ date: "2026-09-10", note: "Prima verifica e inserimento; allineato il record all'articolo finale pubblicato: capacità +34–50%, circa una installazione aggiuntiva per comune/mese, 68% di installazioni agevolate stimate come inframarginali e costo implicito di abbattimento circa 102 €/tCO2; separata la trasferibilità giuridica dello strumento fiscale in Italia." }]
  },
  {
    id: "seattle-king-county-healthy-homes-asthma",
    title: "Healthy Homes: visite domiciliari con community health workers per ridurre i trigger dell'asma",
    authority: "Public Health — Seattle & King County",
    territory: "Seattle e King County, Washington",
    country: "Stati Uniti",
    implementationYear: "Primi anni 2000 (trial); programma CHW per l'asma evoluto e ancora operativo nel 2026",
    problem:
      "Bambini con asma persistente in famiglie a basso reddito possono essere esposti in casa a muffa, umidità, fumo, polvere, allergeni e altri trigger, con sintomi, accessi urgenti e costi sanitari che non vengono risolti dalla sola prescrizione farmacologica.",
    measure:
      "Community health workers effettuano valutazioni ambientali domiciliari, educazione sull'asma, supporto al cambiamento dei comportamenti e forniscono strumenti o risorse per ridurre i trigger. Nel trial 274 famiglie furono randomizzate tra un intervento ad alta intensità con sette visite e un set completo di risorse e un intervento a bassa intensità con una sola visita e risorse limitate.",
    mechanism:
      "Portare prevenzione e self-management nell'ambiente domestico consente di identificare esposizioni non visibili in ambulatorio, tradurre la diagnosi in azioni pratiche e ridurre contemporaneamente più trigger dell'asma attraverso educazione, piccoli dispositivi e advocacy abitativa.",
    population:
      "274 famiglie a basso reddito con un bambino di 4–12 anni affetto da asma nel trial originario; il programma attuale di King County offre supporto CHW a bambini e adulti con asma mediante sessioni personalizzate e valutazione dell'ambiente domestico.",
    primaryArea: "salute_pubblica_locale",
    secondaryAreas: ["housing_politiche_abitative", "welfare_inclusione_servizi_sociali"],
    interventionTypes: ["servizio_diretto", "formazione_capacity_building", "partnership_pubblico_privato_terzo_settore"],
    tools: ["community health workers", "home environmental assessment", "educazione sull'asma", "piano di riduzione dei trigger", "fornitura di materiali", "referral e advocacy abitativa"],
    territorialScale: "Nucleo familiare / contea",
    interventionStatus:
      "Il trial originario è concluso. Public Health — Seattle & King County mantiene nel 2026 un Community Health Worker Asthma Program che dichiara oltre vent'anni di attività e offre quattro sessioni personalizzate, valutazione domestica, piano sui trigger e materiali tra cui filtri HEPA; il modello attuale non è identico al trattamento sperimentale storico.",
    evaluationMethod:
      "Randomized controlled trial con follow-up a un anno. Le 274 famiglie furono assegnate casualmente a un braccio ad alta intensità (sette visite e risorse complete) o a un comparatore attivo a bassa intensità (una visita e risorse limitate). Gli outcome includevano qualità di vita del caregiver, uso di servizi urgenti, giorni con sintomi e azioni/riduzioni dei trigger domestici.",
    comparator:
      "Intervento attivo a bassa intensità con una visita domiciliare e risorse limitate, non assenza di intervento; l'effect size va quindi interpretato come beneficio incrementale dell'intensificazione del programma.",
    outcomes: ["qualità di vita del caregiver", "uso di servizi sanitari urgenti per asma", "giorni con sintomi di asma", "azioni di riduzione dei trigger domestici", "costi e risparmi proiettati"],
    results:
      "Il braccio ad alta intensità migliora significativamente più del comparatore la qualità di vita del caregiver e riduce l'uso di servizi urgenti per asma. I giorni con sintomi diminuiscono maggiormente, ma la differenza tra i gruppi non raggiunge la significatività statistica. Aumentano inoltre numerose azioni domestiche per ridurre i trigger.",
    effectSize:
      "Differenza tra alta e bassa intensità: miglioramento della qualità di vita del caregiver p=0,005; riduzione dell'uso di servizi urgenti p=0,026. I giorni con sintomi migliorano di più nel braccio intensivo ma la differenza tra gruppi non è statisticamente significativa (p=0,138). La valutazione proietta un risparmio netto a quattro anni di circa 189–721 USD per partecipante del braccio intensivo rispetto al comparatore, non un risparmio di bilancio direttamente osservato.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Richiede community health workers formati e supervisionati, accesso consensuale alle abitazioni, protocolli per valutare trigger e self-management, piccoli materiali (ad esempio coperture, aspirazione/filtrazione o altri strumenti appropriati), integrazione con pediatria e capacità di referral per problemi strutturali dell'alloggio. Il costo dipende dall'intensità delle visite e dai materiali forniti.",
    limitations: [
      "Il comparatore riceveva comunque una visita e risorse limitate: il trial misura il beneficio incrementale di un programma più intensivo e non l'effetto del modello Healthy Homes rispetto a nessun servizio.",
      "La differenza nei giorni con sintomi non raggiunge la significatività statistica tra i due gruppi, quindi non deve essere presentata come un effetto causale positivo consolidato.",
      "La popolazione era composta da famiglie a basso reddito con bambini asmatici in un sistema sanitario e abitativo statunitense; prevalenza dei trigger, accesso ai servizi e responsabilità del proprietario differiscono dal contesto italiano.",
      "La stima di risparmio a quattro anni è una proiezione economica basata sugli outcome osservati, non un risparmio contabile misurato per l'amministrazione.",
      "Il programma attuale di King County è un'evoluzione del modello e non va considerato identico al protocollo randomizzato dei primi anni 2000."
    ],
    unintendedEffects:
      "Possibile aumento di domanda sui servizi abitativi quando le visite identificano muffa, umidità o problemi strutturali non risolvibili dalla famiglia; rischio di medicalizzare problemi dell'alloggio o attribuire responsabilità al nucleo senza interventi sul proprietario. Consenso, privacy e confini tra dati sanitari e sociali devono essere espliciti.",
    primarySource: {
      label: "King County — Community Health Worker Asthma Program",
      url: "https://kingcounty.gov/en/dept/dph/health-safety/health-centers-programs-services/community-health-workers"
    },
    evaluationStudies: [
      {
        label: "American Journal of Public Health / PubMed Central",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1449237/",
        citation: "Krieger JW, Takaro TK, Song L, Weaver M (2005), The Seattle-King County Healthy Homes Project: A Randomized, Controlled Trial of a Community Health Worker Intervention to Decrease Exposure to Indoor Asthma Triggers",
        doi: "10.2105/AJPH.2004.042994"
      },
      {
        label: "CDC Stacks — implementation study",
        url: "https://stacks.cdc.gov/view/cdc/31002",
        citation: "Krieger JW et al. (2002), The Seattle-King County Healthy Homes Project: implementation of a comprehensive approach to improving indoor environmental quality for low-income children with asthma"
      }
    ],
    lastVerifiedAt: "2026-09-10",
    transferabilityItaly:
      "Alta per il principio di intervento domiciliare integrato salute-abitazione, ma media per l'implementazione diretta comunale: diagnosi e gestione clinica richiedono ASP, pediatri e servizi sanitari, mentre il Comune può contribuire su servizi sociali, condizioni abitative, povertà energetica e raccordo con proprietari/gestori.",
    lameziaAdaptation:
      "Valutare con ASP, pediatri e servizi sociali un piccolo percorso per bambini con asma scarsamente controllata e condizioni abitative che possono contribuire ai trigger. Il nucleo operativo potrebbe prevedere 3–4 visite CHW/infermieristiche, checklist ambientale, materiali a basso costo e referral per muffa/umidità o altri problemi strutturali. Predefinire outcome su giorni senza sintomi, accessi urgenti, assenze scolastiche e trigger risolti, mantenendo i dati sanitari fuori dall'archivio civico pubblico.",
    implementability: "medio_termine",
    capacityDataNeeds: ["accordo Comune-ASP/pediatria", "community health workers o personale formato", "protocollo di consenso e privacy", "checklist ambientale", "budget per piccoli materiali", "referral verso servizi abitativi", "outcome sanitari in forma protetta"],
    tags: ["asma", "Healthy Homes", "community health worker", "salute ambientale", "housing", "RCT", "visite domiciliari", "King County"],
    revisionHistory: [{ date: "2026-09-10", note: "Prima verifica e inserimento; esplicitato che il comparatore era un intervento attivo a bassa intensità e che i risparmi economici sono proiettati." }]
  },
  {
    id: "rio-de-janeiro-public-daycare-lottery",
    title: "Accesso gratuito agli asili nido comunali assegnato tramite lotteria in presenza di posti scarsi",
    authority: "Prefeitura da Cidade do Rio de Janeiro — Secretaria Municipal de Educação",
    territory: "Rio de Janeiro",
    country: "Brasile",
    implementationYear: "Cohort 2008: lotteria dei posti a dicembre 2007; rete comunale di creches tuttora operativa",
    problem:
      "Domanda di servizi 0–3 superiore ai posti pubblici disponibili, con carico di cura sulle famiglie e possibili effetti su lavoro dei caregiver, reddito familiare, nutrizione e sviluppo dei bambini.",
    measure:
      "Posti gratuiti in asili nido comunali per bambini 0–3 anni. A fine 2007, in presenza di eccesso di domanda, la città assegnò tramite lotteria circa 10.000 posti tra circa 24.000 richiedenti. I bambini ammessi ricevevano assistenza a tempo pieno nei giorni feriali, per circa 9,5 ore, con cinque pasti o snack durante la giornata e servizi educativi dell'infanzia.",
    mechanism:
      "Sostituire una parte rilevante della cura familiare informale con assistenza pubblica continuativa libera tempo dei caregiver per lavoro o studio e fornisce al bambino alimentazione e stimoli educativi regolari. La lotteria permette di distinguere questi effetti dalla selezione delle famiglie che scelgono volontariamente il nido.",
    population:
      "Circa 24.000 bambini di 0–3 anni candidati ai posti comunali e le loro famiglie; circa 10.000 posti furono assegnati mediante lotteria nella coorte originaria.",
    primaryArea: "istruzione_giovani",
    secondaryAreas: ["welfare_inclusione_servizi_sociali", "sviluppo_economico_commercio_lavoro", "salute_pubblica_locale"],
    interventionTypes: ["servizio_diretto", "infrastruttura_fisica", "modifica_organizzativa_processo"],
    tools: ["asili nido comunali", "lotteria di ammissione", "tempo pieno", "pasti", "dati amministrativi e survey longitudinali"],
    territorialScale: "Città / centro per l'infanzia / bambino",
    interventionStatus:
      "La lotteria 2007 costituisce il meccanismo sperimentale studiato e non va assunta come regola attuale di assegnazione. La Secretaria Municipal de Educação continua a gestire una rete di creches e Educação Infantil e pubblica servizi di iscrizione e l'elenco delle strutture.",
    evaluationMethod:
      "Randomized lottery evaluation con intent-to-treat e follow-up longitudinali. L'eccesso di domanda permise alla città di randomizzare l'offerta di posti; gli studi seguono vincitori e non vincitori a circa uno, quattro e sette anni, collegando survey e dati amministrativi per lavoro/reddito dei caregiver e sviluppo, nutrizione e risultati scolastici dei bambini.",
    comparator:
      "Bambini e famiglie eleggibili che parteciparono alla stessa lotteria ma non ricevettero un posto comunale tramite l'estrazione iniziale; alcuni poterono utilizzare successivamente altre forme di cura, quindi l'ITT misura l'effetto dell'offerta e non della frequenza perfetta.",
    outcomes: ["tempo trascorso al nido", "reddito familiare", "partecipazione al lavoro dei caregiver", "nutrizione e crescita del bambino", "sviluppo cognitivo", "risultati scolastici di medio periodo"],
    results:
      "Vincere la lotteria aumenta fortemente l'esposizione al nido pubblico. I nuclei vincitori mostrano redditi più elevati nel primo anno e a quattro anni, ma non a sette anni quando i bambini sono ormai nell'istruzione universale. L'aumento della partecipazione al lavoro è trainato soprattutto da nonni e fratelli/sorelle adolescenti conviventi, non dai genitori. Gli studi riportano inoltre benefici persistenti su alcuni indicatori nutrizionali e benefici cognitivi più concentrati nel breve periodo.",
    effectSize:
      "La versione NBER 2024 stima che vincere la lotteria aumenti di circa il 34% il tempo totale trascorso al nido nei primi quattro anni; una revisione del manoscritto del 25 settembre 2025 riporta circa il 32%. Il record conserva questa differenza di versione anziché presentarla come discrepanza sostanziale. Gli effetti sul reddito sono positivi a uno e quattro anni e non persistono a sette anni; non viene riportato qui un unico effect size sintetico perché gli outcome e le wave differiscono.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Intervento intensivo in capitale e personale: posti fisici, educatori, coordinamento, mensa, orario prolungato, standard di sicurezza e finanziamento ricorrente. La valutazione di Rio segnala che l'aumento di reddito familiare non copre da solo il costo pubblico del servizio; la decisione va quindi valutata anche su sviluppo infantile, equità, conciliazione e welfare, non come progetto che si autofinanzia.",
    limitations: [
      "La lotteria identifica l'effetto dell'offerta di un posto nel contesto di forte razionamento del 2007–2008; non identifica automaticamente l'effetto marginale di espandere il servizio quando la copertura è già elevata.",
      "Vincitori e non vincitori possono utilizzare altre soluzioni di cura: l'ITT è la stima più credibile di policy, mentre l'effetto della frequenza effettiva richiede ulteriori assunzioni.",
      "Le versioni del working paper hanno aggiornato lievemente la stima del primo stadio (circa 34% nella versione NBER e 32% nel manoscritto 2025); il record non tratta questa revisione come un nuovo effetto causale.",
      "Gli effetti occupazionali sono eterogenei all'interno della famiglia e non vanno descritti semplicemente come aumento del lavoro materno: il paper più recente indica un ruolo importante di nonni e fratelli/sorelle adolescenti.",
      "Costi, orari, pasti, composizione familiare e alternative private/informali di Rio differiscono dal contesto italiano; il valore trasferibile è il servizio e il disegno di valutazione, non la scala o il costo storico."
    ],
    unintendedEffects:
      "Possibile crowd-out di soluzioni private o informali, elevati costi fiscali e distribuzione dei benefici diversa da quella attesa se la cura informale è fornita da altri membri della famiglia. Una graduatoria o lotteria usata a fini di valutazione deve rispettare criteri di equità e non può sottrarre posti a chi ha un diritto prioritario.",
    primarySource: {
      label: "Prefeitura do Rio — relação de Creches, EDIs e Escolas",
      url: "https://matricula.rio/EscolasEDI"
    },
    evaluationStudies: [
      {
        label: "NBER Working Paper 30653",
        url: "https://www.nber.org/papers/w30653",
        citation: "Attanasio O, Paes de Barros R, Carneiro P, Evans DK, Lima L, Olinto P, Schady N, Public Childcare, Labor Market Outcomes of Caregivers, and Child Development: Experimental Evidence from Brazil",
        doi: "10.3386/w30653"
      },
      {
        label: "Inter-American Development Bank — medium-term follow-up",
        url: "https://www.iadb.org/en/project/BR-T1397",
        citation: "IDB, Medium-Term Impacts of Access to Daycare on School Outcomes: Experimental Evidence from Rio de Janeiro"
      }
    ],
    lastVerifiedAt: "2026-09-10",
    transferabilityItaly:
      "Alta per la competenza e la logica di servizio: i comuni italiani hanno un ruolo diretto nei servizi educativi per la prima infanzia, sebbene finanziamento e gestione siano condivisi con livelli regionali/nazionali e soggetti gestori. Il caso mostra che l'impatto deve includere non solo lavoro materno ma l'intera organizzazione familiare, reddito, sviluppo e nutrizione.",
    lameziaAdaptation:
      "Costruire una diagnosi 0–3 per Lamezia con posti comunali e convenzionati, liste d'attesa, orari, costi, rinunce e localizzazione della domanda. Se esiste eccesso di domanda, programmare un'espansione graduale dei posti e misurare prima e dopo occupazione dei caregiver, rinunce, reddito/ISEE in forma protetta, continuità di frequenza e indicatori educativi. Qualsiasi allocazione sperimentale deve operare solo tra famiglie con pari diritto e quando i posti sono realmente scarsi, senza sostituire criteri legali di priorità.",
    implementability: "strutturale",
    capacityDataNeeds: ["anagrafe dei posti 0–3", "liste d'attesa e domande", "costi per posto", "orari e personale", "dati su rinunce/frequenza", "accordi con gestori e Regione", "protocollo di valutazione e privacy"],
    tags: ["asilo nido", "prima infanzia", "lotteria", "RCT", "caregiver", "lavoro", "nutrizione", "Rio de Janeiro"],
    revisionHistory: [{ date: "2026-09-10", note: "Prima verifica e inserimento; registrate la natura ITT della lotteria, l'eterogeneità degli effetti familiari e la lieve revisione del primo stadio tra versioni del working paper." }]
  }
] as const satisfies readonly EvidenceIntervention[];
