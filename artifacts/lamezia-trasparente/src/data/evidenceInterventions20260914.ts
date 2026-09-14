import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_14 = [
  {
    id: "emilia-romagna-payt-tariffa-puntuale",
    title: "Tariffazione puntuale dei rifiuti (PAYT) basata sul rifiuto residuo",
    authority: "Comuni dell'Emilia-Romagna / Regione Emilia-Romagna / ATERSIR",
    territory: "Emilia-Romagna",
    country: "Italia",
    implementationYear: "Adozione comunale progressiva dal 2013; quadro regionale rafforzato dal 2015",
    problem:
      "Una tariffazione dei rifiuti poco collegata alla quantità di residuo conferito attenua l'incentivo economico alla prevenzione e alla corretta separazione, mentre la gestione dell'indifferenziato genera costi ambientali e di trattamento.",
    measure:
      "Sistemi pay-as-you-throw che misurano il rifiuto residuo attribuibile all'utenza e collegano almeno una componente della tariffa al servizio effettivamente fruito o alla quantità conferita; i modelli regionali comprendono TARI tributo puntuale e tariffa corrispettiva puntuale.",
    mechanism:
      "Rendere visibile e monetariamente rilevante il costo marginale del rifiuto indifferenziato, incentivando prevenzione, separazione e minore conferimento del residuo; la misurazione puntuale genera inoltre dati gestionali utilizzabili per monitoraggio e redesign del servizio.",
    population: "Utenze domestiche e non domestiche dei comuni che introducono sistemi di misurazione e tariffazione puntuale.",
    primaryArea: "rifiuti_pulizia_urbana",
    secondaryAreas: ["fiscalita_entrate_riscossione", "digitalizzazione_servizi_online", "capacita_amministrativa_personale"],
    interventionTypes: ["incentivo_economico", "regolazione", "infrastruttura_digitale", "targeting_data_analytics", "modifica_organizzativa_processo"],
    tools: ["misurazione del rifiuto residuo", "identificazione dell'utenza", "tariffa variabile", "contenitori/sacchi/tag o dispositivi equivalenti", "billing integrato", "monitoraggio conferimenti"],
    territorialScale: "Comune / bacino di gestione rifiuti",
    interventionStatus:
      "Diffusione ampia ma non universale. Nel 2024 la Regione registra sistemi di misurazione puntuale in 199 dei 330 comuni; 134 applicano TTP/TCP e 65 misurano il residuo mantenendo una TARI presuntiva.",
    evaluationMethod:
      "Valutazione quasi-sperimentale del rollout comunale scaglionato in Emilia-Romagna, con confronto tra TWFE difference-in-differences, staggered DiD e Synthetic DiD per affrontare timing eterogeneo e pre-trend non paralleli.",
    comparator: "Comuni emiliano-romagnoli non ancora passati a PAYT nello stesso periodo, con costruzione del controfattuale mediante specificazioni DiD e Synthetic DiD.",
    outcomes: ["quota di raccolta differenziata", "rifiuto residuo pro capite", "rifiuto totale pro capite", "quantità di differenziato", "costi del servizio rifiuti"],
    results:
      "L'introduzione di PAYT aumenta in modo robusto la quota di raccolta differenziata. Il miglioramento è spiegato quasi interamente da una riduzione del rifiuto indifferenziato, non da un aumento significativo della quantità di differenziato prodotta, risultato coerente con un effetto di prevenzione. In media non emerge un aumento significativo del costo totale del servizio, pur cambiando la composizione dei costi.",
    effectSize:
      "Quota di raccolta differenziata: circa +10 punti percentuali in media secondo le specificazioni robuste riportate dal JRC/Journal. Il paper rileva inoltre una riduzione sostanziale del residuo e del rifiuto totale; per evitare falsa precisione il record conserva come effect size principale la stima di +10 p.p. esplicitamente riportata nell'abstract ufficiale JRC.",
    evidenceStrength: "forte",
    costsRequirements:
      "Servono identificazione affidabile delle utenze e dei conferimenti, dispositivi o contenitori compatibili con la misurazione, integrazione con il gestore e il sistema di fatturazione, gestione delle anomalie, assistenza agli utenti e capacità di enforcement contro abbandoni/elusione. La valutazione non rileva un aumento significativo del costo totale medio del servizio, ma segnala ricomposizioni dei costi e selezione dei comuni con maggiore capacità.",
    limitations: [
      "Non è un RCT: l'adozione è endogena e i comuni più capaci o già meglio performanti possono adottare prima; lo studio usa strategie DiD/SDiD per ridurre ma non eliminare il rischio di confondimento residuo.",
      "I risultati medi dell'Emilia-Romagna non identificano automaticamente l'effetto atteso in un comune con diversa densità, organizzazione della raccolta, evasione TARI o capacità del gestore.",
      "La sola misurazione del residuo non equivale a PAYT: nel 2024 65 comuni misuravano puntualmente pur mantenendo una TARI presuntiva.",
      "Va monitorato il possibile displacement verso comuni confinanti, abbandono illecito o conferimenti impropri: il paper discute piccoli segnali di spillover di confine, non una prova di dumping su larga scala.",
    ],
    unintendedEffects:
      "Possibili conferimenti impropri, abbandono o spostamento del rifiuto verso aree confinanti se il pricing non è accompagnato da controlli, accessibilità del servizio e monitoraggio; possibili effetti distributivi su famiglie numerose o con specifiche esigenze da correggere tramite regole tariffarie appropriate.",
    primarySource: {
      label: "Regione Emilia-Romagna — diffusione della tariffa puntuale",
      url: "https://ambiente.regione.emilia-romagna.it/it/rifiuti/rifiuti/economia-circolare/tariffa-puntuale/diffusione-della-tariffa-puntuale-in-emilia-romagna",
    },
    evaluationStudies: [
      {
        label: "Joint Research Centre / Ecological Economics",
        url: "https://publications.jrc.ec.europa.eu/repository/handle/JRC145510",
        citation: "Compagnoni M, Torbert J (2026), Environmental and economic effects of pay-as-you-throw waste taxation: An assessment based on difference-in-differences models",
        doi: "10.1016/j.ecolecon.2026.108991",
      },
    ],
    lastVerifiedAt: "2026-09-14",
    transferabilityItaly:
      "Alta sul piano istituzionale: la tariffazione puntuale è già praticata da numerosi comuni italiani e il DM 20 aprile 2017 disciplina criteri per sistemi di misurazione puntuale. La trasferibilità sostanziale dipende però dal modello di raccolta, dal gestore, dal regolamento tariffario e dalla capacità di misurare il residuo senza creare forti incentivi all'elusione.",
    lameziaAdaptation:
      "Prima di modificare la tariffa, costruire una baseline per utenza/zona su modello di raccolta, indifferenziato, differenziata, costi, insoluti e abbandoni; verificare con il gestore quali flussi possono essere attribuiti in modo affidabile. Solo dopo valutare un rollout graduale della misurazione e, se tecnicamente e giuridicamente sostenibile, una componente PAYT, mantenendo aree o periodi comparabili e indicatori espliciti su residuo, costi, qualità della differenziata e abbandono.",
    implementability: "strutturale",
    capacityDataNeeds: ["baseline rifiuti per zona/utenza", "anagrafica TARI e linkage con il gestore", "tecnologia di misurazione", "integrazione billing", "audit abbandoni e contaminazione", "analisi distributiva", "quadro regolamentare e tariffario"],
    tags: ["PAYT", "tariffa puntuale", "rifiuti", "TARI", "economia circolare", "difference-in-differences", "synthetic DiD"],
    revisionHistory: [{ date: "2026-09-14", note: "Prima verifica e inserimento nell'archivio; separati PAYT pieno e sola misurazione puntuale." }],
  },
  {
    id: "chicago-one-summer-plus-youth-jobs-rct",
    title: "Lavoro estivo retribuito e mentoring per giovani a rischio di violenza",
    authority: "City of Chicago / Department of Family and Support Services e partner",
    territory: "Chicago, Illinois",
    country: "Stati Uniti",
    implementationYear: "Trial 2012; programma cittadino successivamente ampliato e dal 2026 rinnovato come Chicago Youth Works",
    problem:
      "Giovani di quartieri ad alta violenza con poche opportunità di lavoro estivo, esposizione a conflitti e rischio elevato di arresti per reati violenti.",
    measure:
      "Otto settimane di lavoro estivo retribuito a salario minimo con job mentor; nel trial un braccio offriva 25 ore settimanali di lavoro e un secondo combinava 15 ore di lavoro con 10 ore di social-emotional learning basato su principi di cognitive behavioural therapy.",
    mechanism:
      "Offrire esperienza lavorativa strutturata, relazione con adulti di riferimento e occasioni per esercitare gestione dei conflitti e comportamento professionale. Il fatto che la riduzione della violenza emerga soprattutto dopo l'estate indica che il meccanismo non può essere ridotto al semplice 'tenere occupati' i giovani durante le ore di programma.",
    population: "1.634 studenti svantaggiati di 13 scuole superiori in aree di Chicago ad alta violenza nel trial 2012; il programma cittadino attuale serve più ampiamente giovani e giovani adulti.",
    primaryArea: "istruzione_giovani",
    secondaryAreas: ["sicurezza_urbana_prevenzione", "sviluppo_economico_commercio_lavoro", "welfare_inclusione_servizi_sociali"],
    interventionTypes: ["servizio_diretto", "incentivo_economico", "partnership_pubblico_privato_terzo_settore", "formazione_capacity_building"],
    tools: ["posti di lavoro estivi", "salario", "job mentor", "placement presso enti pubblici/nonprofit", "social-emotional learning in un braccio del trial", "dati amministrativi su scuola e arresti"],
    territorialScale: "Città / scuole e quartieri target",
    interventionStatus:
      "Modello di youth employment consolidato. Nel 2026 One Summer Chicago è stato rinnovato come Chicago Youth Works, che continua a offrire opportunità estive e annuali tramite istituzioni pubbliche, imprese e organizzazioni di comunità.",
    evaluationMethod:
      "Randomized controlled trial: 1.634 giovani assegnati casualmente a jobs-only, jobs + social-emotional learning oppure controllo; outcome misurati con dati amministrativi di polizia e scuola fino a 16 mesi e in follow-up successivi.",
    comparator: "Gruppo di controllo non ammesso a One Summer Plus, libero di cercare altre opportunità estive disponibili in città.",
    outcomes: ["arresti per reati violenti", "arresti per reati contro il patrimonio/droga/altri reati", "presenza scolastica", "GPA", "occupazione successiva"],
    results:
      "L'offerta del programma riduce in modo sostanziale gli arresti per reati violenti nei 16 mesi successivi alla randomizzazione; i due bracci di trattamento producono effetti simili. Non emergono effetti statisticamente significativi sugli altri tipi di arresto o sugli outcome scolastici nel trial iniziale, e i follow-up non mostrano un miglioramento generale e persistente dell'occupazione.",
    effectSize:
      "Arresti per reati violenti: −43% nei 16 mesi successivi, pari a 3,95 arresti violenti in meno ogni 100 giovani (circa 5/100 nei trattati contro 9/100 nel controllo). La riduzione si verifica in larga parte dopo la conclusione delle otto settimane di programma.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Richiede budget per salari, enti ospitanti, matching/placement, supervisione e job mentors, copertura assicurativa e gestione amministrativa; un adattamento italiano deve rispettare norme su lavoro minorile, tirocini, sicurezza e contrattualistica. Il trial non giustifica di presentare il programma come politica occupazionale di lungo periodo.",
    limitations: [
      "Il campione era altamente selezionato: giovani prevalentemente afroamericani, a basso reddito e provenienti da scuole/quartieri ad alta violenza; l'external validity verso contesti italiani meno violenti è incerta.",
      "L'outcome principale è un arresto registrato, non una misura completa della condotta violenta; può dipendere anche da pratiche di enforcement.",
      "Il disegno non identifica quale componente — lavoro, mentoring, struttura della giornata o apprendimento socio-emotivo — generi l'effetto; i due bracci risultano simili sulla violenza.",
      "Follow-up successivi indicano assenza di miglioramenti generali su occupazione e scuola e suggeriscono eterogeneità, incluso un possibile aumento di reati contro il patrimonio in alcuni orizzonti/sottogruppi.",
    ],
    unintendedEffects:
      "Non emerge una riduzione generale degli arresti o un miglioramento automatico dell'occupazione; i follow-up richiedono cautela su possibili aumenti di reati contro il patrimonio in alcuni gruppi/orizzonti. Una replica deve quindi monitorare una famiglia ampia di outcome, non soltanto la violenza.",
    primarySource: {
      label: "Chicago Youth Works — City of Chicago youth employment programme",
      url: "https://www.chicagoyouthworks.org/",
    },
    evaluationStudies: [
      {
        label: "Science / PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/25477459/",
        citation: "Heller SB (2014), Summer jobs reduce violence among disadvantaged youth",
        doi: "10.1126/science.1257809",
      },
      {
        label: "NBER follow-up",
        url: "https://www.nber.org/papers/w23443",
        citation: "Davis JMV, Heller SB (2017), Rethinking the Benefits of Youth Employment Programs: The Heterogeneous Effects of Summer Jobs",
        doi: "10.3386/w23443",
      },
    ],
    lastVerifiedAt: "2026-09-14",
    transferabilityItaly:
      "Moderata-alta come modello di prevenzione giovanile attraverso opportunità retribuite, ma bassa per una replica meccanica del targeting basato su arresti o rischio di violenza. Un comune italiano può invece costruire partnership per lavori estivi regolari e mentorship usando criteri sociali trasparenti e non stigmatizzanti.",
    lameziaAdaptation:
      "Pilotare un programma estivo circoscritto per giovani 16–21 anni con scuole, imprese, cooperative e terzo settore: posti retribuiti reali, tutor dedicato e criteri di accesso basati su vulnerabilità socioeconomica e territoriale, non su profilazione predittiva di criminalità. Se la domanda supera i posti e le regole lo consentono, una lotteria tra eleggibili può offrire un controfattuale equo; misurare completamento, assenze, prosecuzione formativa/lavorativa, benessere e contatti con i servizi, senza assumere che l'effetto sulla violenza di Chicago si replichi.",
    implementability: "medio_termine",
    capacityDataNeeds: ["mappatura giovani eleggibili e domanda", "rete di enti ospitanti", "budget salari e tutor", "protocollo lavoro/sicurezza", "consenso e governance dati", "outcome predefiniti e follow-up"],
    tags: ["giovani", "lavoro estivo", "mentoring", "prevenzione violenza", "RCT", "youth employment"],
    revisionHistory: [{ date: "2026-09-14", note: "Prima verifica e inserimento nell'archivio; separato l'effetto sulla violenza dagli outcome nulli su scuola e occupazione." }],
  },
] as const satisfies readonly EvidenceIntervention[];
