import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_25 = [
  {
    id: "emilia-romagna-payt-waste-tariff",
    title: "Tariffazione puntuale dei rifiuti (Pay-As-You-Throw) nei comuni dell'Emilia-Romagna",
    authority: "Comuni dell'Emilia-Romagna / Regione Emilia-Romagna / ATERSIR",
    territory: "Emilia-Romagna",
    country: "Italia",
    implementationYear:
      "Adozioni comunali scaglionate almeno dal decennio 2010; quadro regionale rafforzato dalla L.R. 16/2015 e dal PRRB 2022–2027",
    problem:
      "Una tariffazione dei rifiuti largamente presuntiva attenua l'incentivo economico a ridurre il rifiuto residuo e a migliorare la separazione delle frazioni, mentre i comuni sostengono costi di raccolta e trattamento non direttamente collegati al comportamento dell'utenza.",
    measure:
      "Nei comuni aderenti, una quota della tariffa o del tributo viene collegata alla quantità di rifiuto residuo effettivamente conferita, misurata con sistemi puntuali. La configurazione concreta varia fra tariffa corrispettiva puntuale, tributo puntuale e TARI presuntiva con misurazione del residuo; il principio comune è rendere osservabile il conferimento dell'indifferenziato e incorporarlo nel segnale di prezzo.",
    mechanism:
      "Far dipendere almeno una componente del costo del servizio dal rifiuto residuo rende più visibile il costo marginale del conferimento e incentiva prevenzione, migliore separazione e riduzione dell'indifferenziato. La misurazione puntuale produce inoltre dati operativi utilizzabili per monitoraggio, confronto territoriale e redesign del servizio.",
    population:
      "Utenze domestiche e non domestiche nei comuni emiliano-romagnoli che hanno adottato sistemi di misurazione e/o tariffazione puntuale; nel 2024 la Regione censisce 199 comuni su 330 con misurazione puntuale del rifiuto.",
    primaryArea: "rifiuti_pulizia_urbana",
    secondaryAreas: [
      "ambiente_clima_energia",
      "fiscalita_entrate_riscossione",
      "capacita_amministrativa_personale",
    ],
    interventionTypes: [
      "incentivo_economico",
      "regolazione",
      "targeting_data_analytics",
      "modifica_organizzativa_processo",
    ],
    tools: [
      "misurazione del rifiuto residuo per utenza",
      "tariffa o tributo con componente puntuale",
      "contenitori/sacchi identificati secondo il modello locale",
      "registro utenze e conferimenti",
      "monitoraggio di raccolta differenziata, residuo e costi del servizio",
    ],
    territorialScale:
      "Comunale, con adozione scaglionata all'interno di un quadro regionale e di regolazione del servizio",
    interventionStatus:
      "In espansione e operativo. La Regione Emilia-Romagna riporta che nel 2024 199 comuni su 330, pari a circa il 76% della popolazione regionale, avevano implementato sistemi di misurazione puntuale; 132 applicavano tariffa corrispettiva puntuale e 2 tributo puntuale.",
    evaluationMethod:
      "Due valutazioni quasi-sperimentali su panel comunali con adozione scaglionata. Lo studio Ecological Economics 2026 confronta two-way fixed effects DiD, staggered DiD e Synthetic DiD proprio per gestire adozione eterogenea e violazioni dei parallel trends. Lo studio Journal of Cleaner Production 2024 usa synthetic control con staggered treatment adoption e verifica robustezza con più stimatori DiD di nuova generazione su dati 2010–2022.",
    comparator:
      "Comuni non ancora trattati o non trattati nello stesso periodo, combinati secondo le diverse specificazioni DiD/synthetic control; le stime non derivano dal semplice confronto descrittivo fra comuni a tariffa puntuale e media regionale.",
    outcomes: [
      "quota di raccolta differenziata",
      "rifiuto residuo pro capite",
      "produzione totale di rifiuti",
      "costo complessivo del servizio",
      "composizione dei costi ambientali e di gestione",
    ],
    results:
      "Lo studio 2026 trova un aumento robusto di circa 10 punti percentuali della quota di raccolta differenziata. Il cambiamento è spiegato quasi interamente dalla riduzione del rifiuto indifferenziato pro capite, senza crescita significativa della quantità di differenziato prodotta, ed è quindi coerente anche con prevenzione/riduzione del rifiuto. Non emerge un aumento statisticamente significativo del costo totale medio del servizio, pur cambiando la composizione dei costi. Lo studio 2024, con specificazione differente, trova anch'esso un miglioramento della raccolta separata e una riduzione della produzione di rifiuto di circa 60 kg pro capite annui; la sua stima di minore spesa ambientale viene mantenuta come corroborazione, non fusa con l'outcome di costo totale dello studio 2026.",
    effectSize:
      "Studio 2026: circa +10 punti percentuali nella quota di raccolta differenziata in media; riduzione del residuo pro capite e nessun aumento significativo del costo totale medio del servizio. Studio 2024: circa +10% nella misura di raccolta separata riportata dagli autori e circa −60 kg di rifiuti pro capite/anno; la stima di circa −€130 pro capite di spesa corrente energetico-ambientale appartiene al modello preferito di quello studio e non viene interpretata come risparmio causale certo sul costo totale del servizio.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede sistemi affidabili di identificazione/misurazione dei conferimenti, anagrafe utenze pulita, integrazione con fatturazione o TARI, assistenza all'utenza, controlli su errori e conferimenti impropri e capacità di monitorare costi e qualità delle frazioni. La valutazione 2026 non trova un aumento significativo del costo totale medio, ma ciò non elimina costi di transizione, hardware, comunicazione e redesign contrattuale.",
    limitations: [
      "L'adozione non è randomizzata: gli stessi autori rilevano selezione legata a capacità e performance dei comuni, motivo per cui le specificazioni causalmente più robuste sono preferibili ai confronti semplici.",
      "I comuni adottano configurazioni tecniche e tariffarie diverse; l'effetto medio non identifica quale combinazione di contenitore, frequenza, formula tariffaria e controllo sia ottimale.",
      "Possibili comportamenti di elusione, conferimenti impropri o spostamenti verso utenze/territori non trattati devono essere misurati localmente e non sono esclusi da ogni specificazione.",
      "Le stime 2024 e 2026 utilizzano outcome di costo differenti; non è corretto trasformare la stima di minore spesa ambientale del primo studio in una garanzia di equivalente risparmio di cassa complessivo.",
    ],
    unintendedEffects:
      "Se disegnata male, la tariffazione può incentivare abbandono o conferimenti impropri, penalizzare nuclei con bisogni non comprimibili o produrre contestazioni di misura. Servono quindi correttivi distributivi, audit dei dati e monitoraggio dell'illegal dumping insieme agli outcome ambientali.",
    primarySource: {
      label: "Regione Emilia-Romagna — diffusione della tariffa puntuale",
      url: "https://ambiente.regione.emilia-romagna.it/it/rifiuti/rifiuti/economia-circolare/tariffa-puntuale/diffusione-della-tariffa-puntuale-in-emilia-romagna",
    },
    evaluationStudies: [
      {
        label: "Ecological Economics — environmental and economic effects of PAYT",
        url: "https://www.sciencedirect.com/science/article/pii/S0921800926000765",
        citation:
          "Compagnoni M, Torbert J (2026), Environmental and economic effects of pay-as-you-throw waste taxation: An assessment based on difference-in-differences models, Ecological Economics 246:108991",
        doi: "10.1016/j.ecolecon.2026.108991",
      },
      {
        label: "Journal of Cleaner Production — PAYT in Emilia-Romagna",
        url: "https://www.sciencedirect.com/science/article/pii/S0959652624031081",
        citation:
          "Di Matteo D, Guadagno E (2024), Tax incentives and environmental performance: The pay-as-you-throw policy in Emilia-Romagna, Italy, Journal of Cleaner Production 475:143659",
        doi: "10.1016/j.jclepro.2024.143659",
      },
    ],
    lastVerifiedAt: "2026-09-25",
    transferabilityItaly:
      "Alta sul piano istituzionale perché l'intervento è già applicato in numerosi comuni italiani; la trasferibilità concreta dipende però dall'assetto regionale del servizio, dal gestore e dalle regole tariffarie applicabili. Il valore del caso è soprattutto mostrare che l'effetto va valutato sul residuo, sui costi e sui comportamenti di spostamento, non soltanto sulla percentuale di differenziata.",
    lameziaAdaptation:
      "Prima di modificare la tariffa, costruire con il gestore e l'autorità d'ambito competente una baseline per zona/utenza su kg di residuo, frequenze di esposizione, qualità delle frazioni, abbandoni, costi e morosità. Se tecnicamente e giuridicamente praticabile, introdurre la misurazione del residuo per fasi e simulare la formula tariffaria prima della piena applicazione. Prevedere correttivi per nuclei con esigenze non comprimibili e confrontare aree/periodi di rollout su residuo pro capite, qualità della differenziata, costo totale del servizio, reclami e illegal dumping.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "anagrafe utenze allineata con servizio e tributi",
      "misure affidabili dei conferimenti di residuo",
      "dati di qualità delle frazioni e scarti",
      "costi completi del servizio per componente",
      "segnalazioni e controlli su abbandoni/conferimenti impropri",
      "analisi distributiva e simulazione della tariffa",
      "coordinamento con gestore e autorità d'ambito competente",
    ],
    tags: [
      "Emilia-Romagna",
      "PAYT",
      "tariffa puntuale",
      "rifiuti",
      "raccolta differenziata",
      "synthetic DiD",
      "Italia",
    ],
    revisionHistory: [
      {
        date: "2026-09-25",
        note: "Prima verifica e inserimento; stime causali separate dai dati descrittivi regionali e outcome di costo 2024 distinti dal costo totale analizzato nel 2026.",
      },
    ],
  },
  {
    id: "chicago-becoming-a-man-school-counselling-rcts",
    title: "Becoming a Man (BAM): counselling scolastico per decisioni e gestione dei conflitti",
    authority: "Chicago Public Schools / City of Chicago, in partnership con Youth Guidance",
    territory: "Chicago, Illinois",
    country: "Stati Uniti",
    implementationYear:
      "RCT principali 2009–2010 e 2013–2015; BAM continua a essere offerto in scuole CPS nel 2026",
    problem:
      "Coinvolgimento di adolescenti in conflitti e violenza, arresti, disimpegno scolastico e rischio di mancato completamento della scuola superiore nei quartieri con elevata vulnerabilità.",
    measure:
      "Programma in-school sviluppato da Youth Guidance con sessioni settimanali in piccoli gruppi guidate da counsellor formati. Gli esercizi di matrice cognitivo-comportamentale e comportamentale aiutano i giovani a riconoscere risposte automatiche, reinterpretare situazioni ad alta tensione e scegliere deliberatamente una risposta più adatta.",
    mechanism:
      "Ridurre l'automaticità nelle situazioni ad alto rischio e creare uno spazio regolare di riflessione e relazione con un adulto può modificare la gestione dei conflitti e, contemporaneamente, migliorare l'engagement con la scuola. L'ipotesi di meccanismo è supportata in modo suggestivo, non definitivamente isolata dagli RCT.",
    population:
      "Ragazzi e giovani uomini economicamente svantaggiati iscritti a Chicago Public Schools. I due RCT principali randomizzarono rispettivamente circa 2.740 e 2.064 giovani; studi successivi hanno testato l'espansione a popolazioni e contesti scolastici differenti.",
    primaryArea: "istruzione_giovani",
    secondaryAreas: ["sicurezza_urbana_prevenzione", "welfare_inclusione_servizi_sociali"],
    interventionTypes: [
      "servizio_diretto",
      "partnership_pubblico_privato_terzo_settore",
      "formazione_capacity_building",
    ],
    tools: [
      "sessioni settimanali in piccoli gruppi durante la giornata scolastica",
      "counsellor dedicati",
      "esercizi cognitivo-comportamentali e di role play",
      "referral e supporto individuale",
      "monitoraggio con dati scolastici e amministrativi",
    ],
    territorialScale: "Rete di scuole pubbliche cittadine, con implementazione per istituto",
    interventionStatus:
      "Operativo come programma disponibile in Chicago Public Schools. CPS continua nel 2026 a indicare Becoming a Man tra i programmi di supporto che le scuole possono offrire; il record distingue lo stato corrente dall'evidenza causale prodotta nei trial storici.",
    evaluationMethod:
      "Due grandi randomized controlled trials principali in Chicago Public Schools, implementati nel 2009–2010 e 2013–2015, con assegnazione individuale a BAM o servizi scolastici/comunitari ordinari e linkage a dati amministrativi su scuola e arresti. Ulteriori RCT di espansione hanno testato popolazioni e setting diversi e mostrato maggiore eterogeneità.",
    comparator:
      "Studenti eleggibili assegnati casualmente al gruppo di controllo, che ricevevano i servizi scolastici e comunitari disponibili in condizioni ordinarie.",
    outcomes: [
      "arresti totali",
      "arresti per reati violenti",
      "school engagement",
      "graduation on time",
      "persistenza degli effetti dopo la fine del programma",
    ],
    results:
      "Nei due RCT principali, durante il periodo di intervento BAM riduce gli arresti totali del 28–35% e gli arresti per reati violenti del 45–50%, migliorando anche l'engagement scolastico. Nel primo studio con follow-up, il tasso di diploma aumenta di circa 6–9 punti percentuali, equivalenti a circa 12–19% rispetto alla baseline. Gli effetti sugli arresti del primo trial non persistono chiaramente oltre il periodo di programma, mentre i risultati scolastici sono più duraturi. Studi successivi di scaling trovano effetti più variabili tra gruppi e setting, limitando una generalizzazione meccanica.",
    effectSize:
      "RCT principali: arresti totali durante il programma −28–35%; arresti per reati violenti −45–50%; nel primo trial graduation +6–9 punti percentuali (circa +12–19% in termini relativi). I risultati di scaling successivi sono più eterogenei e non vengono sostituiti con questi effect size storici.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Richiede counsellor formati con presenza regolare a scuola, piccoli gruppi protetti, coordinamento con dirigenti e servizi di supporto, supervisione clinico-professionale e continuità per almeno un anno scolastico. Le stime di beneficio-costo dei trial sono favorevoli, ma una replica italiana dovrebbe ricostruire ex ante costi di personale, formazione, spazi e referral anziché trasferire i prezzi di Chicago.",
    limitations: [
      "Gli effect size più forti riguardano i due RCT storici su specifiche popolazioni maschili e scuole di Chicago; non dimostrano la stessa efficacia per ogni popolazione, fascia d'età o contesto.",
      "Nel primo trial gli effetti sugli arresti non persistono chiaramente dopo il programma; l'outcome di sicurezza non va quindi presentato come riduzione permanente della criminalità.",
      "Gli studi successivi di espansione hanno trovato effetti più variabili e in alcune specificazioni non statisticamente rilevabili, segnalando rischi di attenuazione durante lo scaling.",
      "Il meccanismo causale preciso non è isolato completamente: l'evidenza su metacognizione/automaticità è suggestiva e non prova che counselling, relazione adulta e contesto di gruppo siano separabili.",
      "L'uso di dati su arresti o giustizia minorile in un contesto italiano richiederebbe basi giuridiche e garanzie molto più rigorose; non è necessario per valutare un pilot scolastico.",
    ],
    unintendedEffects:
      "Un targeting percepito come selezione dei giovani 'a rischio' può produrre stigma; un disegno esclusivamente maschile può inoltre lasciare scoperti altri gruppi con bisogni analoghi. La replica dovrebbe evitare etichette criminogene, definire criteri educativi trasparenti e monitorare take-up, dropout e differenze tra sottogruppi.",
    primarySource: {
      label: "Chicago Public Schools — Supportive Schools",
      url: "https://www.cps.edu/academics/supportive-schools/",
    },
    evaluationStudies: [
      {
        label: "Quarterly Journal of Economics — randomized field experiments in Chicago",
        url: "https://academic.oup.com/qje/article/132/1/1/2724542",
        citation:
          "Heller SB, Shah AK, Guryan J, Ludwig J, Mullainathan S, Pollack HA (2017), Thinking, Fast and Slow? Some Field Experiments to Reduce Crime and Dropout in Chicago, Quarterly Journal of Economics 132(1):1–54",
        doi: "10.1093/qje/qjw033",
      },
      {
        label: "University of Chicago Crime Lab — Becoming a Man research overview",
        url: "https://crimelab.uchicago.edu/projects/becoming-a-man-bam/",
        citation: "University of Chicago Crime Lab, Becoming a Man — research overview and scaling evidence",
      },
    ],
    lastVerifiedAt: "2026-09-25",
    transferabilityItaly:
      "Media-alta come servizio educativo/preventivo, non come intervento di polizia. Scuole, servizi sociali e terzo settore possono organizzare counselling di gruppo strutturato, ma la replicazione richiede un modello professionale definito, formazione e supervisione. Gli outcome primari in Italia dovrebbero essere educativi e psicosociali; eventuali outcome di sicurezza devono essere aggregati e giuridicamente appropriati.",
    lameziaAdaptation:
      "Se esiste domanda da parte delle scuole, progettare con istituti, servizi sociali, ASP e terzo settore un piccolo pilot di counselling di gruppo per adolescenti esposti a conflitti, disimpegno o vulnerabilità, evitando etichette criminalizzanti. Randomizzare o scaglionare l'accesso solo quando domanda e posti lo rendono eticamente e organizzativamente appropriato. Misurare frequenza, assenze, sospensioni/provvedimenti scolastici, engagement, benessere, conflitti autoriferiti e completamento; non rendere l'accesso dipendente da dati di polizia.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "accordi con scuole e servizi competenti",
      "counsellor qualificati e supervisione",
      "criteri di accesso non stigmatizzanti",
      "consenso e protezione dei dati dei minori",
      "baseline e follow-up su frequenza, engagement e benessere",
      "monitoraggio di take-up, dropout e differenze tra sottogruppi",
    ],
    tags: [
      "Chicago",
      "Becoming a Man",
      "BAM",
      "giovani",
      "scuola",
      "violenza",
      "counselling",
      "RCT",
    ],
    revisionHistory: [
      {
        date: "2026-09-25",
        note: "Prima verifica e inserimento; risultati dei due RCT principali separati dall'eterogeneità degli studi di scaling e dalla non persistenza degli arresti nel primo follow-up.",
      },
    ],
  },
  {
    id: "salvador-bahia-azul-citywide-sanitation",
    title: "Bahia Azul: espansione cittadina della rete fognaria e del risanamento ambientale",
    authority: "Governo dello Stato della Bahia / EMBASA, con interventi nell'area urbana di Salvador",
    territory: "Salvador, Bahia",
    country: "Brasile",
    implementationYear: "Programma avviato nel 1996–1997; grande espansione della rete valutata tra 1997 e 2004",
    problem:
      "Copertura fognaria molto bassa nei quartieri poveri di Salvador, scarichi domestici nell'ambiente e alta prevalenza di diarrea infantile legata a condizioni sanitarie e infrastrutturali sfavorevoli.",
    measure:
      "Il programma Bahia Azul ha esteso massicciamente la rete fognaria di Salvador, insieme a componenti più ampie di approvvigionamento idrico, gestione dei rifiuti, rafforzamento istituzionale ed educazione all'uso della rete. L'obiettivo dichiarato per Salvador era portare la copertura fognaria da circa il 26% delle famiglie verso l'80%.",
    mechanism:
      "Allontanare in modo sicuro i reflui e ridurre la contaminazione fecale dell'ambiente urbano diminuisce le vie di esposizione dei bambini agli agenti enterici. L'effetto dipende non solo dalla costruzione della rete principale ma anche dalle connessioni domestiche effettive, dal funzionamento del sistema e dall'adozione da parte delle famiglie.",
    population:
      "Residenti di Salvador, con valutazione epidemiologica focalizzata su bambini sotto i tre anni in aree povere precedentemente poco o per nulla servite dalla rete fognaria.",
    primaryArea: "salute_pubblica_locale",
    secondaryAreas: [
      "ambiente_clima_energia",
      "urbanistica_rigenerazione",
      "welfare_inclusione_servizi_sociali",
    ],
    interventionTypes: [
      "infrastruttura_fisica",
      "servizio_diretto",
      "modifica_organizzativa_processo",
      "nudging_comunicazione",
    ],
    tools: [
      "estensione della rete fognaria",
      "connessioni delle abitazioni alla rete",
      "impianti e collettori di trattamento/trasporto",
      "campagna di educazione sanitaria e promozione delle connessioni",
      "monitoraggio epidemiologico in aree sentinella",
    ],
    territorialScale: "Cittadina/metropolitana, inserita in un più ampio programma statale di risanamento",
    interventionStatus:
      "Intervento storico completato e seguito da ulteriori programmi di espansione e manutenzione del sistema. Il record riguarda l'espansione Bahia Azul valutata epidemiologicamente e non attribuisce al programma originario gli investimenti successivi.",
    evaluationMethod:
      "Before-after osservazionale particolarmente informativo basato su due coorti di bambini nelle stesse aree sentinella prima e dopo l'espansione, con campionamento stratificato delle aree povere e aggiustamento multivariato per confondenti. Non esiste una città contemporanea non trattata né assegnazione randomizzata.",
    comparator:
      "Coorte di bambini e condizioni delle aree sentinella prima dell'intervento, confrontate con la coorte post-intervento; le analisi esplorano anche eterogeneità in base al rischio di diarrea al baseline.",
    outcomes: [
      "prevalenza longitudinale di diarrea nei bambini sotto i tre anni",
      "copertura fognaria di quartiere",
      "eterogeneità dell'effetto nelle aree a più alto rischio",
      "connessione effettiva delle abitazioni alla rete",
    ],
    results:
      "Dopo aggiustamento per confondenti, l'implementazione è associata a una riduzione del 22% della prevalenza longitudinale di diarrea nella popolazione studiata nel complesso e del 43% nelle aree con prevalenza iniziale più elevata. L'evidenza successiva e i documenti di implementazione mostrano però che la copertura fisica della rete non coincide automaticamente con connessioni domestiche effettive: una valutazione pubblica del 2005 segnalò insufficienza delle connessioni, elemento cruciale per interpretare e trasferire il caso.",
    effectSize:
      "Prevalenza longitudinale di diarrea: circa −22% dopo aggiustamento nell'insieme delle aree studiate; circa −43% nelle aree con maggiore prevalenza al baseline. Il programma mirava ad aumentare la copertura fognaria cittadina da circa 26% a 80%, ma questo target infrastrutturale non viene trattato come effect size sanitario.",
    evidenceStrength: "moderata",
    costsRequirements:
      "Programma infrastrutturale di grande scala. Il paper Lancet riporta un budget complessivo Bahia Azul di circa 440 milioni USD, con circa metà destinata all'espansione della rete fognaria di Salvador; il resto comprendeva anche acqua, rifiuti, capacità istituzionale e altri comuni. Una campagna pubblica assorbì circa 3 milioni USD. Questi importi storici non sono trasferibili direttamente a un comune italiano e non costituiscono costo unitario dell'effetto sanitario.",
    limitations: [
      "È un before-after con due coorti e aggiustamento statistico, non un RCT né un difference-in-differences con città di controllo; trend sanitari secolari e altri cambiamenti possono spiegare una parte dell'effetto.",
      "Bahia Azul era un pacchetto ampio, comprendente anche acqua, rifiuti, educazione e capacità istituzionale; non è possibile attribuire con certezza l'intero effetto alla sola costruzione delle condotte.",
      "La connessione domestica alla rete fu incompleta in alcune aree: costruire capacità infrastrutturale non garantisce utilizzo effettivo.",
      "Il contesto epidemiologico, insediativo e di governance di Salvador negli anni Novanta è molto diverso da quello di una città italiana contemporanea.",
    ],
    unintendedEffects:
      "Il principale rischio implementativo documentato è infrastruttura sottoutilizzata quando le abitazioni non vengono collegate alla rete. Grandi opere di risanamento possono inoltre richiedere cantieri, acquisizioni e coordinamento sociale; questi effetti devono essere gestiti e non sono catturati dall'outcome di diarrea.",
    primarySource: {
      label: "Governo dello Stato della Bahia — retrospettiva sul programma Bahia Azul",
      url: "https://www.ba.gov.br/infraestrutura/noticia/2024-03/5253/bahia-azul",
    },
    evaluationStudies: [
      {
        label: "The Lancet — two-cohort evaluation of city-wide sanitation",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2212752/",
        citation:
          "Barreto ML et al. (2007), Effect of city-wide sanitation programme on reduction in rate of childhood diarrhoea in northeast Brazil: assessment by two cohort studies, The Lancet 370(9599):1622–1628",
        doi: "10.1016/S0140-6736(07)61638-9",
      },
    ],
    lastVerifiedAt: "2026-09-25",
    transferabilityItaly:
      "Media come principio di pianificazione integrata, bassa come replica istituzionale letterale. In Italia fognatura e depurazione coinvolgono gestori e autorità d'ambito oltre al Comune; l'insegnamento trasferibile è che una diagnosi sanitaria/ambientale deve guidare priorità e che il KPI non può fermarsi ai metri di rete realizzati: vanno misurate connessioni effettive, funzionamento e outcome ambientali.",
    lameziaAdaptation:
      "Costruire con gestore, autorità d'ambito e servizi sanitari una mappa delle aree non collegate o con criticità di fognatura, scarichi, reflui e allagamenti, distinguendo rete disponibile da utenze effettivamente connesse. Per eventuali investimenti, fissare indicatori su connessioni completate, guasti/sversamenti, qualità ambientale e segnalazioni prima e dopo i lavori. Dove il problema è la mancata connessione a infrastruttura esistente, valutare assistenza tecnica e rimozione delle barriere amministrative prima di nuove opere.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "mappa aggiornata di rete fognaria e depurazione",
      "utenze potenzialmente servibili ma non connesse",
      "segnalazioni di sversamenti, odori, guasti e allagamenti",
      "dati ambientali e sanitari aggregati ove disponibili",
      "piano investimenti del gestore e vincoli tecnici",
      "governance chiara tra Comune, gestore e autorità competente",
    ],
    tags: [
      "Salvador",
      "Bahia Azul",
      "saneamento",
      "fognatura",
      "salute infantile",
      "diarrea",
      "before-after",
    ],
    revisionHistory: [
      {
        date: "2026-09-25",
        note: "Prima verifica e inserimento; effetto sanitario classificato moderato per assenza di controllo contemporaneo e separato dal target infrastrutturale e dai problemi di connessione domestica.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
