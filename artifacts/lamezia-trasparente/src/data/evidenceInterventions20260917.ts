import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_17 = [
  {
    id: "nyc-public-housing-street-lighting-rct",
    title: "Illuminazione tattica intensiva per ridurre i reati notturni negli insediamenti di edilizia pubblica",
    authority: "New York City Mayor’s Office of Criminal Justice / New York City Housing Authority",
    territory: "New York City, New York",
    country: "Stati Uniti",
    implementationYear: "2016 (esperimento con torri luminose temporanee); interventi permanenti di safety lighting realizzati parallelamente nel Mayor’s Action Plan",
    problem:
      "Elevata concentrazione di reati gravi all'aperto nelle ore notturne in alcuni complessi di edilizia pubblica, insieme a spazi esterni scarsamente illuminati e percepiti come insicuri.",
    measure:
      "Installazione temporanea di torri luminose mobili ad alta intensità in complessi NYCHA selezionati, con quantità di luce assegnata casualmente. Nello stesso periodo il Mayor’s Action Plan finanziava anche la sostituzione e l'espansione dell'illuminazione esterna permanente in vari complessi di edilizia pubblica.",
    mechanism:
      "Aumentare visibilità e sorveglianza naturale nelle ore notturne, ridurre le opportunità situazionali per reati all'aperto e aumentare la probabilità percepita di osservazione, senza modificare direttamente enforcement o sanzioni.",
    population:
      "Residenti e utilizzatori degli spazi esterni di complessi NYCHA ad elevata criminalità; il rapporto di valutazione randomizza 77 complessi (39 trattamento, 38 controllo), mentre l'articolo peer-reviewed analizza l'intensità di illuminazione assegnata casualmente nei siti sperimentali.",
    primaryArea: "sicurezza_urbana_prevenzione",
    secondaryAreas: ["mobilita_spazio_pubblico", "housing_politiche_abitative"],
    interventionTypes: ["infrastruttura_fisica", "targeting_data_analytics"],
    tools: [
      "torri luminose temporanee",
      "mappatura dei complessi ad alta criminalità",
      "randomizzazione dell'intensità di illuminazione",
      "dati di polizia georeferenziati",
      "analisi degli spillover spaziali",
    ],
    territorialScale: "Complesso residenziale / micro-area",
    interventionStatus:
      "L'esperimento con torri temporanee era una misura tattica del 2016 e non va descritto come programma permanente. New York ha però realizzato nello stesso Mayor’s Action Plan importanti installazioni permanenti di safety lighting nei complessi NYCHA; l'effetto causale stimato riguarda specificamente il trattamento sperimentale temporaneo.",
    evaluationMethod:
      "Randomized controlled field experiment. Il rapporto OJP randomizza 77 complessi di edilizia pubblica tra 39 treatment e 38 control; nei siti trattati l'intensità luminosa viene assegnata casualmente. Le stime usano i reati registrati dalla polizia e modellano esplicitamente possibili spillover verso le aree vicine.",
    comparator: "Complessi NYCHA assegnati al controllo e, nelle analisi di dose, siti con minore intensità luminosa assegnata casualmente.",
    outcomes: [
      "reati index gravi all'aperto di notte",
      "reati nelle aree immediatamente circostanti",
      "possibile displacement spaziale",
      "criminalità complessiva nei complessi",
    ],
    results:
      "I siti che ricevettero maggiore illuminazione registrarono forti riduzioni dei reati index all'aperto di notte. La stima locale nei punti illuminati è circa −60%; dopo avere incorporato il possibile spostamento verso aree vicine, la stima più conservativa è almeno −36%. Poiché soltanto una parte dei reati complessivi avviene all'aperto di notte, questo non equivale a una riduzione del 36% della criminalità totale.",
    effectSize:
      "Reati index gravi all'aperto di notte: circa −60% nei luoghi direttamente illuminati; almeno −36% quando l'analisi include le aree circostanti e il possibile displacement. L'NBER traduce quest'ultima stima in circa −4% sui reati index complessivi nei complessi, dato che circa l'11% dei reati considerati avviene all'aperto di notte.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Il trattamento sperimentale richiede apparecchiature luminose, alimentazione, collocazione e manutenzione; una replica comunale permanente dovrebbe usare un progetto illuminotecnico ordinario e costi di ciclo di vita, non torri temporanee. Gli interventi permanenti NYCHA del Mayor’s Action Plan avevano costi milionari a scala di grandi complessi e non costituiscono il costo del solo RCT.",
    limitations: [
      "L'RCT testa illuminazione tattica temporanea in complessi di edilizia pubblica ad alta criminalità; l'effetto non è automaticamente trasferibile alla normale sostituzione di lampioni su strade con livelli di rischio inferiori.",
      "L'outcome è criminalità registrata dalla polizia e non comprende tutti gli episodi non denunciati.",
      "La stima del 60% riguarda l'area direttamente trattata; la stima di almeno 36% è quella più prudente quando si considera il possibile displacement spaziale.",
      "La contemporanea strategia Mayor’s Action Plan comprendeva anche altri interventi nei complessi NYCHA; l'identificazione sperimentale riguarda l'assegnazione delle luci temporanee, non l'intero pacchetto cittadino.",
    ],
    unintendedEffects:
      "Illuminazione molto intensa può generare abbagliamento, disturbo notturno, consumo energetico e opposizione dei residenti se mal progettata. Una replica deve misurare anche reclami, qualità luminosa e spillover, non solo i reati nel punto trattato.",
    primarySource: {
      label: "NYCHA — completamento di safety lighting nel Mayor’s Action Plan (2016)",
      url: "https://www.nyc.gov/site/nycha/about/press/pr-2016/Mayors-Office-Nycha-Completion-Of-273-Safety-Lights-To-Reduce-Crime-At-ST-Nick-Houses-20161102.page",
    },
    evaluationStudies: [
      {
        label: "Journal of Quantitative Criminology — articolo peer-reviewed",
        url: "https://link.springer.com/article/10.1007/s10940-020-09490-6",
        citation:
          "Chalfin A, Hansen B, Lerner J, Parker L (2022), Reducing Crime Through Environmental Design: Evidence from a Randomized Experiment of Street Lighting in New York City",
        doi: "10.1007/s10940-020-09490-6",
      },
      {
        label: "Office of Justice Programs — rapporto sperimentale",
        url: "https://www.ojp.gov/library/publications/impact-street-lighting-crime-new-york-city-public-housing",
        citation: "Chalfin A, Hansen B, Parker L, Lerner J (2017), The Impact of Street Lighting on Crime in New York City Public Housing",
      },
    ],
    lastVerifiedAt: "2026-09-17",
    transferabilityItaly:
      "Elevata per il principio di prevenzione situazionale tramite illuminazione mirata, ma non per la replica letterale delle torri mobili. Un comune italiano può intervenire sull'illuminazione pubblica e sugli spazi di propria competenza, coordinandosi con gestori e forze dell'ordine; targeting e valutazione devono evitare di trasformare aree vulnerabili in etichette criminogene permanenti.",
    lameziaAdaptation:
      "Costruire una baseline notturna su guasti, livelli di illuminamento, incidenti, segnalazioni e reati aggregati per micro-area; selezionare pochi punti comparabili con problemi documentati e realizzare un retrofit LED/progetto illuminotecnico con rollout scaglionato. Misurare reati registrati, percezione di sicurezza, uso dello spazio, consumi, guasti, reclami e spostamento verso strade limitrofe. Non usare il numero di denunce come unico criterio di targeting.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "inventario georeferenziato dei punti luce",
      "misure di illuminamento e stato manutentivo",
      "dati aggregati su reati/segnalazioni e incidenti",
      "disegno illuminotecnico",
      "gruppi o fasi di confronto",
      "monitoraggio di displacement e reclami",
    ],
    tags: ["illuminazione pubblica", "sicurezza urbana", "prevenzione situazionale", "RCT", "NYCHA", "place-based"],
    revisionHistory: [{ date: "2026-09-17", note: "Prima verifica e inserimento nell'archivio; distinta esplicitamente l'illuminazione tattica randomizzata dalle installazioni permanenti del più ampio Mayor’s Action Plan." }],
  },
  {
    id: "auckland-unitary-plan-upzoning-housing",
    title: "Upzoning su larga scala per aumentare l'offerta abitativa e contenere i canoni",
    authority: "Auckland Council",
    territory: "Auckland",
    country: "Nuova Zelanda",
    implementationYear: "2016 (Auckland Unitary Plan operativo da novembre 2016; successivi aggiornamenti del piano)",
    problem:
      "Crescita della popolazione più rapida della costruzione residenziale, prezzi e affitti in aumento e vincoli urbanistici che limitavano densità e capacità edificatoria in gran parte dell'area urbana.",
    measure:
      "Auckland ha modificato su larga scala il proprio zoning attraverso l'Auckland Unitary Plan, consentendo forme abitative a media e alta densità in circa tre quarti del suolo residenziale precedentemente più restrittivo e aumentando fortemente la capacità teorica di nuove abitazioni.",
    mechanism:
      "Ridurre il vincolo regolatorio sulla densità e aumentare il numero di siti economicamente sviluppabili, permettendo a operatori e proprietari di rispondere alla domanda con più townhouse, rowhouses e appartamenti; l'aumento dell'offerta dovrebbe ridurre la pressione sui costi abitativi rispetto a un controfattuale senza riforma.",
    population: "Famiglie e imprese del mercato abitativo dell'area metropolitana di Auckland; proprietari, inquilini, sviluppatori e nuovi nuclei che cercano alloggio.",
    primaryArea: "urbanistica_rigenerazione",
    secondaryAreas: ["housing_politiche_abitative", "sviluppo_economico_commercio_lavoro"],
    interventionTypes: ["regolazione", "modifica_organizzativa_processo"],
    tools: [
      "Auckland Unitary Plan",
      "rezoning / upzoning",
      "aumento delle densità consentite",
      "maggiore capacità edificatoria presso centri e corridoi urbani",
      "monitoraggio dei building consents",
    ],
    territorialScale: "Metropolitana / city-region",
    interventionStatus:
      "L'Auckland Unitary Plan resta lo strumento urbanistico operativo del Council ed è soggetto a successive plan changes. Le valutazioni riguardano la grande riforma entrata in funzione nel 2016, non ogni modifica successiva.",
    evaluationMethod:
      "Due valutazioni peer-reviewed complementari usano synthetic control. La prima costruisce un controfattuale di Auckland da altre aree urbane neozelandesi per stimare housing starts/permits dopo la riforma; la seconda costruisce un controfattuale dei canoni per stimare l'effetto sui rent indexes. Studi precedenti avevano inoltre usato confronti quasi-sperimentali tra aree upzoned e non upzoned, affrontando il possibile displacement della costruzione.",
    comparator: "Auckland sintetica costruita come combinazione ponderata di altre aree urbane con andamenti pre-riforma simili; nei lavori precedenti, aree non upzoned e scenari con displacement della costruzione.",
    outcomes: [
      "permessi/avvii di nuove abitazioni per abitante",
      "permessi cumulati attribuibili alla riforma",
      "composizione del nuovo stock abitativo",
      "indice dei canoni di locazione",
      "affordability abitativa",
    ],
    results:
      "La valutazione 2026 sulla costruzione stima che l'upzoning abbia circa raddoppiato i nuovi permessi/avvii abitativi pro capite entro cinque anni e che, nei sette anni successivi, circa il 46% dei nuovi starts osservati sia attribuibile alla riforma secondo il controfattuale sintetico. Una seconda pubblicazione 2026 stima che nel 2024 i canoni fossero circa il 23% inferiori al controfattuale senza riforma. Le due stime condividono però la logica synthetic-control e non equivalgono a randomizzazione.",
    effectSize:
      "Housing starts/permits pro capite: circa ×2 entro cinque anni. Dopo sette anni: circa 52.200 permessi cumulati sopra il synthetic control, pari al 46% dei circa 112.300 permessi emessi nel periodo. Canoni: −23,0% nel 2024 rispetto al controfattuale sintetico nella specificazione preferita dello studio pubblicato nel 2026.",
    evidenceStrength: "forte",
    costsRequirements:
      "La riforma non richiede principalmente spesa in trasferimenti ma elevata capacità urbanistica: revisione del piano, analisi infrastrutturale, consultazione, aggiornamento delle regole, permitting e coordinamento con reti di trasporto, acqua e servizi. L'aumento di capacità edilizia può richiedere investimenti infrastrutturali complementari e gestione degli impatti di quartiere.",
    limitations: [
      "Synthetic control non è randomizzazione: le stime dipendono dalla qualità del donor pool, dal fit pre-riforma e dall'assenza di shock post-2016 differenziali non catturati dal controllo sintetico.",
      "La riforma è molto ampia e coincide con altre dinamiche macroeconomiche, migratorie, creditizie e di costruzione; gli studi conducono robustness checks ma non possono isolare ogni canale concorrente.",
      "La stima dei canoni a −23% è rispetto a un controfattuale modellato, non una diminuzione nominale osservata del 23% rispetto al livello del 2016.",
      "Mercato, demografia, normativa urbanistica e domanda di Auckland differiscono fortemente da Lamezia; gli effect size non sono trasferibili numericamente.",
    ],
    unintendedEffects:
      "L'upzoning può aumentare valori fondiari dei siti sviluppabili, pressioni infrastrutturali e conflitti locali su densità, paesaggio e parcheggio. La maggiore offerta non garantisce che ogni segmento di reddito trovi immediatamente alloggi accessibili e va coordinata con infrastrutture e politiche sociali.",
    primarySource: {
      label: "Auckland Council — Auckland Unitary Plan",
      url: "https://www.aucklandcouncil.govt.nz/en/plans-policies-bylaws-reports-projects/our-plans-strategies/unitary-plan.html",
    },
    evaluationStudies: [
      {
        label: "Economic Modelling — housing construction",
        url: "https://www.sciencedirect.com/science/article/pii/S0264999326001215",
        citation: "Greenaway-McGrevy R (2026), Can zoning reform increase housing construction? Evidence from Auckland",
        doi: "10.1016/j.econmod.2026.107592",
      },
      {
        label: "Economic Inquiry — rents",
        url: "https://onlinelibrary.wiley.com/doi/full/10.1111/ecin.70075",
        citation: "Greenaway-McGrevy R (2026), Can zoning reform reduce housing costs? Evidence from rents in Auckland",
        doi: "10.1111/ecin.70075",
      },
      {
        label: "Journal of Urban Economics — quasi-experimental construction study",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S0094119023000244",
        citation: "Greenaway-McGrevy R, Phillips PCB (2023), The impact of upzoning on housing construction in Auckland",
      },
    ],
    lastVerifiedAt: "2026-09-17",
    transferabilityItaly:
      "Trasferibile come principio di revisione evidence-based della capacità urbanistica, non come copia delle regole neozelandesi. In Italia occorre verificare competenze comunali, piano strutturale/urbanistico vigente, standard, vincoli paesaggistici e regionali, capacità delle reti e procedure di valutazione.",
    lameziaAdaptation:
      "Prima di aumentare indici edificatori, costruire una mappa particellare di capacità teorica, permessi, cantieri/completamenti, stock vuoto, prezzi/canoni, accesso a stazioni e servizi. Identificare eventuali aree in cui il vincolo è realmente urbanistico e testare densificazione mirata presso nodi serviti, evitando espansione periferica non infrastrutturata. Monitorare permessi, completamenti, prezzi/canoni, tipologie prodotte e carico su reti per almeno 5 anni.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "piano urbanistico e zoning georeferenziati",
      "permessi e completamenti per particella",
      "stock abitativo e vuoto",
      "prezzi e canoni per micro-area",
      "capacità di reti e servizi",
      "indicatori di accessibilità a trasporto e servizi",
      "disegno controfattuale predefinito",
    ],
    tags: ["upzoning", "housing supply", "affitti", "urbanistica", "synthetic control", "Auckland"],
    revisionHistory: [{ date: "2026-09-17", note: "Prima verifica e inserimento; incorporati i due studi peer-reviewed 2026 su costruzione e canoni, mantenendo le stime come controfattuali synthetic-control e non come effetti randomizzati." }],
  },
  {
    id: "acayucan-street-paving-rct-tax-compliance",
    title: "Pavimentazione randomizzata di strade periferiche con effetti su patrimonio, credito e compliance tributaria",
    authority: "Gobierno municipal de Acayucan",
    territory: "Acayucan, Veracruz",
    country: "Messico",
    implementationYear: "2006–2009 (rollout sperimentale della prima pavimentazione di strade residenziali periferiche)",
    problem:
      "Quartieri periferici con strade non pavimentate, bassa qualità dell'infrastruttura locale e risorse municipali insufficienti per asfaltare contemporaneamente tutti i progetti eleggibili; nel lungo periodo, anche bassa compliance dell'imposta immobiliare locale.",
    measure:
      "Il Comune, non potendo finanziare tutte le strade eleggibili nello stesso periodo, collaborò alla randomizzazione di 56 progetti di prima pavimentazione: 28 furono selezionati per ricevere l'intervento. La pavimentazione comprendeva la trasformazione fisica della strada residenziale; il successivo follow-up collega l'assegnazione e la realizzazione alle storie amministrative di pagamento dell'imposta immobiliare.",
    mechanism:
      "Migliorare direttamente accessibilità e qualità dello spazio residenziale, capitalizzando parte del beneficio nel valore delle proprietà e facilitando credito/consumi; nel lungo periodo, un servizio pubblico locale visibile può anche rafforzare reciprocità e percezione dell'efficienza comunale, aumentando la propensione a pagare l'imposta immobiliare.",
    population:
      "1.231 famiglie residenti nelle strade eleggibili nel trial originario; 56 progetti stradali, di cui 28 assegnati casualmente alla pavimentazione. Il follow-up fiscale usa i registri amministrativi delle proprietà interessate dall'esperimento.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["sviluppo_economico_commercio_lavoro", "fiscalita_entrate_riscossione", "urbanistica_rigenerazione"],
    interventionTypes: ["infrastruttura_fisica", "servizio_diretto"],
    tools: [
      "prima pavimentazione/asfaltatura di strade residenziali",
      "randomizzazione dei progetti eleggibili",
      "perizie professionali sui valori immobiliari",
      "survey famiglie",
      "registri amministrativi di property tax",
      "follow-up longitudinale",
    ],
    territorialScale: "Strada / quartiere periferico",
    interventionStatus:
      "Il trial è storico e la specifica randomizzazione non è un programma permanente. Il caso resta rilevante perché l'intervento era una vera opera municipale implementata entro un vincolo di bilancio e dispone ora di evidenza sperimentale sia sugli effetti economici di breve periodo sia sulla compliance fiscale di lungo periodo.",
    evaluationMethod:
      "Randomized controlled infrastructure experiment: 56 progetti di strada eleggibili, 28 assegnati casualmente al trattamento; survey su 1.231 famiglie e perizie immobiliari a circa due anni. Il follow-up 2025 riutilizza l'assegnazione randomizzata e i registri amministrativi fiscali; distingue intent-to-treat (assegnazione) da esposizione effettiva alla pavimentazione, data l'incompleta realizzazione di alcuni progetti.",
    comparator: "Strade eleggibili non selezionate casualmente per la pavimentazione nel periodo iniziale.",
    outcomes: [
      "valore della casa e del terreno",
      "proprietà di veicoli",
      "beni durevoli e miglioramenti domestici",
      "uso di credito garantito e dimensione dei prestiti",
      "risparmio/consumi",
      "pagamento dell'imposta immobiliare",
      "percezione dell'efficienza del governo locale",
    ],
    results:
      "La pavimentazione aumenta in modo sostanziale il valore immobiliare e del terreno e consente alle famiglie di convertire parte dell'aumento di ricchezza in veicoli, beni durevoli, miglioramenti della casa e maggiore credito garantito. Il follow-up fiscale mostra che anche molti anni dopo l'assegnazione alla pavimentazione aumenta modestamente ma significativamente la compliance della property tax, soprattutto tra proprietari direttamente beneficiati.",
    effectSize:
      "Perizie professionali: valore delle abitazioni +16% e valore del terreno +54%; valutazione dei proprietari: valore della casa circa +25%; proprietà di veicoli circa +40%. Follow-up fiscale: assegnazione alla pavimentazione +1,5 p.p. di compliance; esposizione effettiva +2,6 p.p. (circa +3% sulla baseline). Tra proprietari direttamente beneficiati: +3,2 p.p. per assegnazione e +4,8 p.p. per pavimentazione effettiva, circa +5,5% sulla baseline.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Intervento infrastrutturale ad alto costo unitario rispetto a un nudge amministrativo; richiede progettazione, appalto, drenaggio, manutenzione e selezione trasparente delle priorità. Nel trial il vincolo di bilancio rese possibile una randomizzazione fra progetti già eleggibili; in Italia qualsiasi rollout deve rispettare programmazione delle opere, sicurezza e procurement e non può sacrificare criteri obbligatori per finalità sperimentali.",
    limitations: [
      "La città e il periodo sono molto diversi dal contesto italiano; i grandi effetti patrimoniali riflettono la prima pavimentazione di strade periferiche precedentemente non asfaltate.",
      "Non tutti i progetti assegnati furono realizzati, per cui le stime su esposizione effettiva richiedono l'uso dell'assegnazione randomizzata come strumento e non vanno confuse con un semplice confronto paved/unpaved.",
      "L'aumento di compliance fiscale è modesto rispetto agli effetti patrimoniali e non dimostra che qualunque investimento visibile aumenti automaticamente il gettito.",
      "Il ritorno in valori immobiliari può tradursi in benefici diversi per proprietari e affittuari e può modificare oneri fiscali o pressioni di mercato.",
    ],
    unintendedEffects:
      "Miglioramenti infrastrutturali possono aumentare valori e rendite fondiarie e quindi favorire maggiormente i proprietari; possono inoltre produrre traffico aggiuntivo o pressione di sviluppo. La priorità delle opere deve rimanere basata su bisogno, sicurezza ed equità, non sul solo potenziale di gettito.",
    primarySource: {
      label: "Studio sperimentale originario — collaborazione con il gobierno municipal de Acayucan",
      url: "https://docs.iza.org/dp5346.pdf",
    },
    evaluationStudies: [
      {
        label: "Review of Economics and Statistics — trial originario",
        url: "https://ideas.repec.org/a/tpr/restat/v98y2016i2p254-267.html",
        citation: "Gonzalez-Navarro M, Quintana-Domeque C (2016), Paving Streets for the Poor: Experimental Analysis of Infrastructure Effects",
      },
      {
        label: "IZA Discussion Paper 18082 — follow-up sulla compliance tributaria",
        url: "https://www.iza.org/en/publications/dp/18082/local-public-goods-and-property-tax-compliance-experimental-evidence-from-street-pavement",
        citation: "Fernández Sierra M, Gonzalez-Navarro M, Quintana-Domeque C (2025), Local Public Goods and Property Tax Compliance: Experimental Evidence from Street Pavement",
      },
      {
        label: "J-PAL — sintesi del trial di Acayucan",
        url: "https://www.povertyactionlab.org/es/evaluation/el-impacto-de-pavimentar-las-calles-en-mexico",
        citation: "J-PAL, El Impacto de Pavimentar las Calles en México",
      },
    ],
    lastVerifiedAt: "2026-09-17",
    transferabilityItaly:
      "Alta per il principio di rollout valutabile quando esistono più opere già eleggibili di quante possano essere finanziate nello stesso anno; bassa per la replica meccanica degli effect size, perché a Lamezia la maggior parte della rete urbana è già pavimentata. Il canale rilevante può riguardare riqualificazione di strade degradate, marciapiedi, drenaggio o accessibilità.",
    lameziaAdaptation:
      "Costruire una graduatoria trasparente di strade/micro-opere basata su stato manutentivo, sicurezza, drenaggio, accessibilità e popolazione servita. Se più interventi hanno priorità equivalente ma il bilancio impone fasi, usare un rollout scaglionato e misurare prima/dopo qualità dello spazio, tempi di viaggio, segnalazioni, attività economiche e soddisfazione; collegare in forma aggregata anche la compliance tributaria per verificare, senza presumerlo, se servizi visibili modificano il rapporto fiscale con il Comune.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "catasto/asset register della rete stradale",
      "indice trasparente di bisogno manutentivo",
      "costi e cronoprogramma delle opere",
      "dati su segnalazioni e sicurezza stradale",
      "outcome economici e di soddisfazione",
      "dati tributari aggregati e governance privacy",
      "rollout comparabile o randomizzazione solo tra progetti realmente equivalenti",
    ],
    tags: ["pavimentazione", "infrastrutture locali", "RCT", "property tax", "credito", "valori immobiliari", "Acayucan"],
    revisionHistory: [{ date: "2026-09-17", note: "Prima verifica e inserimento; integrato il trial originario con il follow-up 2025 sulla compliance tributaria e mantenuta la distinzione tra assegnazione e pavimentazione effettiva." }],
  },
] as const satisfies readonly EvidenceIntervention[];
