import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_02 = [
  {
    id: "barcelona-bmincome-guaranteed-income-pilot",
    title: "B-MINCOME: sostegno al reddito municipale combinato con politiche di inclusione",
    authority: "Ajuntament de Barcelona — Area de Drets Socials",
    territory: "Dieci quartieri dell'asse Besos, Barcellona",
    country: "Spagna",
    implementationYear: "2017–2019",
    problem:
      "Povertà persistente e forte deprivazione materiale in quartieri vulnerabili, insieme a frammentazione degli aiuti e difficoltà di inclusione sociale e lavorativa.",
    measure:
      "Pilota che combinava un sostegno municipale al reddito, calcolato in funzione di reddito, composizione e bisogni essenziali del nucleo, con quattro politiche attive: formazione e occupazione, imprenditorialità sociale, promozione dell'affitto di stanze e partecipazione comunitaria. Le varianti sperimentali differivano per condizionalità e tasso di ritiro del beneficio al crescere del reddito.",
    mechanism:
      "Ridurre direttamente il gap tra risorse e bisogni essenziali e, in alcune varianti, accompagnare il trasferimento con servizi di attivazione e partecipazione; la randomizzazione tra modalità consente di distinguere gli effetti del sostegno e dei diversi disegni.",
    population:
      "Famiglie a rischio di esclusione socioeconomica residenti in dieci quartieri del Besos e già in contatto con servizi sociali o programmi comunali; 1.000 famiglie assegnate ai trattamenti da una lotteria stratificata su 1.524 famiglie eleggibili.",
    primaryArea: "welfare_inclusione_servizi_sociali",
    secondaryAreas: ["sviluppo_economico_commercio_lavoro", "salute_pubblica_locale", "partecipazione_democrazia_locale"],
    interventionTypes: ["incentivo_economico", "servizio_diretto", "formazione_capacity_building", "partecipazione_codesign"],
    tools: ["trasferimento mensile means-tested", "lotteria stratificata", "servizi di attivazione", "dati amministrativi e survey", "partnership di ricerca"],
    territorialScale: "Quartiere / nucleo familiare",
    interventionStatus:
      "Pilota concluso nel 2019. Il progetto era esplicitamente sperimentale: la legislazione spagnola consente ai comuni di condurre pilot, ma non attribuisce loro una competenza generale per istituire stabilmente un reddito minimo municipale.",
    evaluationMethod:
      "Randomized controlled trial con lotteria stratificata. Mille famiglie furono assegnate a diverse combinazioni di trasferimento e politiche attive, con un gruppo di controllo; l'impatto finale è stimato su survey e dati amministrativi, con analisi di robustezza. Studi successivi utilizzano lo stesso esperimento per gli effetti occupazionali.",
    comparator: "Famiglie eleggibili assegnate casualmente al gruppo di controllo e non beneficiarie del pacchetto B-MINCOME nel periodo sperimentale.",
    outcomes: [
      "deprivazione materiale severa",
      "insicurezza alimentare",
      "soddisfazione di vita ed economica",
      "arretrati e debito",
      "qualità del sonno",
      "partecipazione al lavoro",
      "istruzione e formazione"
    ],
    results:
      "Il programma ha migliorato benessere e sicurezza materiale, riducendo deprivazione severa, insicurezza alimentare, arretrati e ricorso a prestiti familiari. Gli effetti positivi non si traducono in un miglioramento generale degli outcome sanitari. Esiste un trade-off rilevante: la partecipazione lavorativa si riduce e uno studio successivo sui dati sperimentali conferma effetti occupazionali negativi, soprattutto per alcune famiglie con responsabilità di cura.",
    effectSize:
      "Valutazione finale: deprivazione materiale severa −8 punti percentuali; scala 'andare a letto affamati' −0,130; insicurezza alimentare −0,213; arretrati −0,168; qualità del sonno +0,066; partecipazione lavorativa −0,130. Il trasferimento medio alle famiglie trattate è stato circa 463 euro al mese. Lo studio 2025 stima che circa due anni dopo l'avvio i principali percettori trattati fossero il 22% meno propensi a lavorare rispetto ai controlli.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Il progetto B-MINCOME aveva un budget complessivo di circa 6,07 milioni di euro, di cui circa 4,85 milioni cofinanziati dal programma Urban Innovative Actions. Richiede anagrafiche sociali affidabili, regole di eleggibilità e calcolo del beneficio, pagamenti periodici, integrazione con servizi sociali e capacità di valutazione sperimentale.",
    limitations: [
      "Il pilot combinava trasferimenti e più politiche attive e comprendeva diverse modalità di condizionalità e ritiro del beneficio: non esiste un unico trattamento semplice da replicare.",
      "Non vi era un pre-analysis plan/preregistrazione per l'analisi occupazionale successiva; non-take-up e attrition richiedono cautela nell'interpretazione di alcuni outcome.",
      "Gli effetti positivi sul benessere coesistono con effetti negativi sulla partecipazione lavorativa, quindi una valutazione corretta deve rendere visibili entrambi.",
      "In Spagna il Comune poteva sperimentare il trasferimento ma non trasformarlo autonomamente in una misura permanente; in Italia andrebbe verificata puntualmente la base giuridica e il coordinamento con misure nazionali e regionali."
    ],
    unintendedEffects:
      "Riduzione della partecipazione e della qualità della partecipazione lavorativa; alcune politiche attive hanno avuto problemi di implementazione e la promozione dell'affitto di stanze non ha prodotto una base valutativa utile.",
    primarySource: {
      label: "Ajuntament de Barcelona — B-MINCOME / European Funds",
      url: "https://ajuntament.barcelona.cat/estrategiaifinances/en/european-funds-0"
    },
    evaluationStudies: [
      {
        label: "Ivàlua — Final report: impact evaluation of B-MINCOME",
        url: "https://ivalua.es/sites/default/files/2021-02/Informe%20Avaluaci%C3%B3%20Impacte%20BMincome_0.pdf",
        citation: "Todeschini F, Sabes-Figuera R (2019), BMINCOME Project: Final report — Impact evaluation of GMI on household outcomes"
      },
      {
        label: "Journal of Public Economics",
        url: "https://doi.org/10.1016/j.jpubeco.2025.105420",
        citation: "The employment effects of a means-tested guaranteed income policy (2025)",
        doi: "10.1016/j.jpubeco.2025.105420"
      }
    ],
    lastVerifiedAt: "2026-09-02",
    transferabilityItaly:
      "Alta come modello di sperimentazione e integrazione tra sostegno economico e servizi; bassa per una replica letterale di un reddito minimo municipale permanente senza una specifica base giuridica. Il valore trasferibile è soprattutto il disegno: eleggibilità trasparente, integrazione dati-servizi, varianti testabili e misurazione esplicita dei trade-off.",
    lameziaAdaptation:
      "Non creare un nuovo reddito comunale senza base normativa. Mappare invece i trasferimenti e servizi sociali già accessibili, misurare non-take-up e frammentazione, identificare una popolazione circoscritta e testare un pacchetto legalmente disponibile di supporto economico/servizi con criteri predefiniti, outcome su deprivazione e lavoro e un gruppo di confronto quando fattibile.",
    implementability: "strutturale",
    capacityDataNeeds: ["anagrafiche dei servizi sociali", "dati ISEE e benefici in forma protetta", "regole di eleggibilità", "integrazione con servizi regionali/nazionali", "protocollo di valutazione"],
    tags: ["povertà", "reddito minimo", "RCT", "servizi sociali", "non-take-up", "Barcelona", "inclusione"],
    revisionHistory: [{ date: "2026-09-02", note: "Prima verifica e inserimento nell'archivio; registrato esplicitamente il trade-off occupazionale." }]
  },
  {
    id: "oakland-ceasefire-focused-deterrence",
    title: "Oakland Ceasefire: prevenzione focalizzata della violenza armata con servizi e deterrenza mirata",
    authority: "City of Oakland / Oakland Police Department / Department of Violence Prevention",
    territory: "Oakland, California",
    country: "Stati Uniti",
    implementationYear: "Dal 2012; valutazione principale 2010–2017; strategia sostenuta nel piano cittadino 2026–2030",
    problem:
      "Sparatorie e omicidi concentrati in un numero molto ristretto di gruppi e persone ad altissimo rischio, con frammentazione tra enforcement, servizi sociali e organizzazioni comunitarie.",
    measure:
      "Strategia di focused deterrence partnership-based: analisi continua dei pattern di violenza, contatto diretto tramite call-in o notifiche individuali, offerta di life coaching, supporti e percorsi verso lavoro/servizi, coinvolgimento di leader comunitari e religiosi e, per chi continua a commettere violenza, enforcement multi-agenzia strettamente focalizzato.",
    mechanism:
      "Concentrare risorse sulla piccolissima popolazione che guida o subisce la maggior parte della violenza, comunicare in modo credibile conseguenze e alternative, ridurre i rischi individuali mediante servizi e aumentare la certezza di una risposta mirata anziché ampliare indiscriminatamente i controlli.",
    population:
      "Gruppi e individui identificati come al più alto rischio di sparare o essere colpiti; la città stima che il sottoinsieme a rischio più elevato rappresenti circa lo 0,3% della popolazione cittadina.",
    primaryArea: "sicurezza_urbana_prevenzione",
    secondaryAreas: ["welfare_inclusione_servizi_sociali", "capacita_amministrativa_personale"],
    interventionTypes: ["targeting_data_analytics", "partnership_pubblico_privato_terzo_settore", "servizio_diretto", "enforcement_controllo"],
    tools: ["problem analysis", "weekly shooting reviews", "call-in", "custom notifications", "life coaching", "supporti abitativi e occupazionali", "enforcement focalizzato"],
    territorialScale: "Città / gruppi e micro-aree ad alto rischio",
    interventionStatus:
      "Strategia ancora attiva. Il 2 giugno 2026 il City Council ha adottato un Community Violence Reduction Plan quadriennale che include il mantenimento di Ceasefire; Measure NN fornisce una fonte di finanziamento dedicata alla riduzione della violenza.",
    evaluationMethod:
      "Studio quasi-sperimentale 2010–2017 con matched comparison groups, propensity-score matching, panel/growth-curve models, analisi di reti e stime difference-in-differences per confrontare gruppi e census block groups direttamente trattati con gruppi e aree comparabili non direttamente trattati.",
    comparator: "Gang/gruppi e census block groups comparabili che non ricevevano direttamente l'intervento nello stesso periodo.",
    outcomes: ["sparatorie totali", "sparatorie gang-involved", "sparatorie sospette gang-involved", "vittimizzazioni da arma da fuoco", "spillover"],
    results:
      "La valutazione indipendente rileva riduzioni statisticamente significative delle sparatorie nelle aree e nei gruppi trattati rispetto ai comparatori, con effetti anche sui gruppi collegati nelle reti. Il programma è classificato 'Effective' da CrimeSolutions/NIJ. I risultati descrittivi più recenti della città non vanno confusi con la stima causale storica.",
    effectSize:
      "Rispetto ai matched comparisons: sparatorie totali annuali −20% nei block groups trattati; sparatorie trimestrali gang-involved −26%; sparatorie sospette gang-involved −30%; vittimizzazioni trimestrali da arma da fuoco −23% nei gruppi direttamente trattati.",
    evidenceStrength: "forte",
    costsRequirements:
      "La valutazione federale non fornisce un costo comparabile del programma. La strategia richiede analisi continuativa della violenza, personale specializzato, coordinamento stabile tra polizia, servizi e comunità, offerta reale di supporti e supervisione delle pratiche di targeting. Nel 2026 Oakland ha stabilizzato una parte del finanziamento tramite Measure NN.",
    limitations: [
      "Disegno quasi-sperimentale, non randomizzato: matching e modelli panel riducono ma non eliminano completamente il rischio di confondimento.",
      "Il contesto di violenza armata e le competenze di polizia/statali differiscono fortemente dall'ordinamento italiano.",
      "Il trattamento è un pacchetto coordinato: non è possibile attribuire gli effetti a un singolo elemento come call-in, servizi o enforcement.",
      "Il targeting di persone ad alto rischio richiede garanzie rigorose contro bias, opacità algoritmica, stigmatizzazione e uso improprio dei dati."
    ],
    unintendedEffects:
      "Una focused deterrence mal disegnata può trasformarsi in sorveglianza eccessiva o concentrare enforcement su gruppi già svantaggiati. Il modello di Oakland prevede esplicitamente servizi, leadership comunitaria e procedural justice, che devono essere considerati parte del trattamento.",
    primarySource: {
      label: "City of Oakland — Oakland Ceasefire Strategy",
      url: "https://www.oaklandca.gov/Public-Safety-Streets/Crime-Prevention/Oakland-Ceasefire-Strategy"
    },
    evaluationStudies: [
      {
        label: "CrimeSolutions / National Institute of Justice",
        url: "https://crimesolutions.ojp.gov/ratedprograms/ceasefire-oakland-calif",
        citation: "CrimeSolutions Program Profile: Ceasefire (Oakland, California)"
      },
      {
        label: "Journal of Research in Crime and Delinquency",
        url: "https://doi.org/10.1177/0022427818821716",
        citation: "Braga AA et al. (2019), Street Gangs, Gun Violence, and Focused Deterrence: Comparing Place-based and Group-based Evaluation Methods to Estimate Direct and Spillover Deterrent Effects",
        doi: "10.1177/0022427818821716"
      }
    ],
    lastVerifiedAt: "2026-09-02",
    transferabilityItaly:
      "Media per il pacchetto completo, perché enforcement e investigazione non sono competenze comunali; alta per il principio di governance: concentrare prevenzione e supporti su problemi e persone effettivamente ad alto rischio, integrando Comune, Prefettura, forze di polizia, ASP e terzo settore con regole chiare di dati e accountability.",
    lameziaAdaptation:
      "Costruire, con Prefettura e attori competenti, un protocollo di prevenzione della violenza grave che parta da una problem analysis condivisa e non da liste opache. Il Comune può guidare la componente di servizi, mentoring, housing/employment navigation e coordinamento territoriale; qualsiasi targeting individuale o enforcement deve restare nelle competenze previste dalla legge e con garanzie documentate.",
    implementability: "strutturale",
    capacityDataNeeds: ["problem analysis interistituzionale", "dati su eventi violenti aggregati e governati", "rete di servizi e case management", "protocollo privacy e accountability", "valutazione degli esiti"],
    tags: ["violenza armata", "focused deterrence", "Ceasefire", "servizi", "partnership", "quasi-esperimento", "Oakland"],
    revisionHistory: [{ date: "2026-09-02", note: "Prima verifica e inserimento nell'archivio; verificata la continuità della strategia nel piano cittadino 2026." }]
  },
  {
    id: "seattle-sweetened-beverage-tax-child-bmi",
    title: "Sweetened Beverage Tax con valutazione su acquisti e BMI infantile",
    authority: "City of Seattle",
    territory: "Seattle, Washington",
    country: "Stati Uniti",
    implementationYear: "Dal 1 gennaio 2018",
    problem:
      "Elevato consumo di bevande zuccherate, associato a rischi per la salute, e necessità di finanziare interventi per accesso a cibo sano, salute e apprendimento dei bambini.",
    measure:
      "Imposta municipale sulla distribuzione di bevande zuccherate per la vendita al dettaglio a Seattle, con aliquota standard di 1,75 centesimi di dollaro per oncia e aliquote/esenzioni specifiche per alcuni produttori; i proventi finanziano programmi di food access, salute e early learning.",
    mechanism:
      "Aumentare il prezzo relativo delle bevande tassate per ridurne domanda e acquisto e dedicare le entrate a interventi di salute e nutrizione; la normativa ha previsto anche una valutazione accademica indipendente degli effetti economici e sanitari.",
    population: "Consumatori e distributori di bevande zuccherate nella città; la valutazione BMI include bambini seguiti dagli stessi sistemi sanitari a Seattle e in aree vicine non tassate.",
    primaryArea: "salute_pubblica_locale",
    secondaryAreas: ["fiscalita_entrate_riscossione", "welfare_inclusione_servizi_sociali"],
    interventionTypes: ["regolazione", "incentivo_economico", "informazione_trasparenza"],
    tools: ["imposta per oncia", "registrazione e filing dei distributori", "fondo dedicato", "Community Advisory Board", "valutazione indipendente"],
    territorialScale: "Intera città / distribuzione commerciale",
    interventionStatus:
      "Imposta ancora in vigore nel 2026. La città pubblica regole, aliquote, allocazione dei proventi e report di valutazione; il Community Advisory Board continua a formulare raccomandazioni sull'impiego delle entrate.",
    evaluationMethod:
      "Per l'outcome sanitario principale: studio di coorte con synthetic difference-in-differences. Il campione di confronto è ripesato per riprodurre i trend pre-tassa di BMIp95; l'analisi principale include 6.313 bambini e analisi di sensibilità within-person su 22.779 bambini.",
    comparator: "Bambini residenti in aree vicine non soggette alla tassa e seguiti dagli stessi sistemi sanitari, ripesati per allineare i trend pre-intervento.",
    outcomes: ["BMIp95 infantile", "BMI", "acquisti di bevande tassate", "prezzi", "entrate e destinazione dei fondi"],
    results:
      "Dopo l'introduzione, i bambini residenti a Seattle mostrano una riduzione modesta ma statisticamente significativa di BMIp95 rispetto al campione sintetico delle aree non tassate. Le precedenti valutazioni cittadine documentano inoltre un forte pass-through sui prezzi e una riduzione degli acquisti di bevande tassate. La città ha mantenuto separata e trasparente la destinazione delle entrate a programmi di salute e food access.",
    effectSize:
      "Synthetic DiD sul BMIp95: −0,90 punti percentuali (IC95% −1,20 a −0,60; p<0,001) su 6.313 bambini. Analisi di sensibilità: BMI non trasformato −0,22 punti. L'effetto è clinicamente modesto e non equivale a una riduzione dimostrata della prevalenza di obesità.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede potere tributario esplicito, identificazione dei soggetti passivi, amministrazione fiscale e controlli. Seattle ha inoltre istituito un fondo dedicato, un advisory board e una valutazione pluriennale; tra 2017 e 2023 il team ha prodotto 13 report e cinque pubblicazioni peer-reviewed.",
    limitations: [
      "Lo studio BMI è quasi-sperimentale, non randomizzato; il synthetic DiD migliora la comparabilità dei trend ma non esclude confondenti time-varying non osservati.",
      "BMIp95 è un outcome continuo e l'effetto medio è piccolo; non va tradotto automaticamente in una diminuzione della prevalenza di obesità.",
      "Il quadro tributario statunitense non è trasferibile: un comune italiano non può introdurre autonomamente una nuova accisa/imposta di questo tipo senza base legislativa.",
      "Una parte dell'effetto complessivo può derivare anche dall'uso vincolato delle entrate e da altri cambiamenti nel food environment, non soltanto dal segnale di prezzo."
    ],
    unintendedEffects:
      "Possibili effetti distributivi regressivi sul lato del prezzo e sostituzione verso prodotti non tassati richiedono monitoraggio; Seattle ha mitigato parte del problema destinando i proventi a programmi di food access e salute, ma ciò non annulla automaticamente l'incidenza fiscale.",
    primarySource: {
      label: "City of Seattle — Sweetened Beverage Tax",
      url: "https://seattle.gov/city-finance/business-taxes-and-licenses/seattle-taxes/sweetened-beverage-tax"
    },
    evaluationStudies: [
      {
        label: "JAMA Network Open / PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/38809555/",
        citation: "Jones-Smith JC et al. (2024), Sweetened Beverage Tax Implementation and Change in Body Mass Index Among Children in Seattle",
        doi: "10.1001/jamanetworkopen.2024.13644"
      }
    ],
    lastVerifiedAt: "2026-09-02",
    transferabilityItaly:
      "Bassa per la tassa in sé in assenza di una base legislativa nazionale; alta per il modello di policy design: valutazione ex ante/ex post, trasparenza dell'uso delle entrate e combinazione tra incentivi di prezzo e programmi mirati di salute. Alcune leve trasferibili possono essere procurement, vending e food policy negli spazi di competenza comunale.",
    lameziaAdaptation:
      "Non proporre una municipal sugar tax senza una verifica legislativa. Utilizzare invece il caso come benchmark per una food-environment strategy comunale: mappare distributori automatici e offerta nelle strutture comunali/scolastiche di competenza, rivedere capitolati e concessioni, misurare acquisti e qualità nutrizionale e associare eventuali economie o entrate esistenti a programmi di accesso al cibo sano.",
    implementability: "strutturale",
    capacityDataNeeds: ["analisi delle competenze tributarie", "dati su acquisti/offerta alimentare", "procurement e concessioni comunali", "indicatori di salute aggregati", "governance trasparente delle risorse"],
    tags: ["salute", "bevande zuccherate", "tassazione", "synthetic DiD", "food policy", "Seattle"],
    revisionHistory: [{ date: "2026-09-02", note: "Prima verifica e inserimento nell'archivio; verificati stato corrente dell'imposta e reporting cittadino 2026." }]
  },
  {
    id: "nyc-small-schools-of-choice",
    title: "Small Schools of Choice: piccole scuole superiori non selettive con forte personalizzazione",
    authority: "New York City Department of Education / New York City Public Schools",
    territory: "New York City",
    country: "Stati Uniti",
    implementationYear: "Dal 2002; principali coorti valutate entrate nel 2005–2008; follow-up pubblicato nel 2026",
    problem:
      "Bassi tassi di diploma e accesso al college in grandi high schools urbane scarsamente performanti, soprattutto per studenti provenienti da famiglie a basso reddito e gruppi storicamente svantaggiati.",
    measure:
      "Creazione di centinaia di piccole high schools pubbliche non selettive, generalmente circa 100 studenti per grado, sviluppate tramite processi competitivi e partnership con organizzazioni educative e comunitarie. Il modello enfatizza rigore accademico, rilevanza reale dell'apprendimento e relazioni personalizzate tra studenti e adulti.",
    mechanism:
      "Ridurre la scala organizzativa e costruire comunità scolastiche più personali e coerenti, con aspettative elevate, relazioni stabili, counseling e partnership esterne; l'oversubscription genera lotterie che permettono di isolare l'effetto dell'offerta e dell'iscrizione rispetto ad altre scuole pubbliche della stessa città.",
    population:
      "Studenti di New York City, prevalentemente provenienti da contesti a basso reddito; la valutazione di lungo periodo segue circa 16.000 studenti che parteciparono alle lotterie di ammissione nelle coorti 2005–2008.",
    primaryArea: "istruzione_giovani",
    secondaryAreas: ["welfare_inclusione_servizi_sociali", "capacita_amministrativa_personale"],
    interventionTypes: ["modifica_organizzativa_processo", "servizio_diretto", "partnership_pubblico_privato_terzo_settore", "formazione_capacity_building"],
    tools: ["scuole di piccola scala", "lotterie di ammissione", "partnership educative", "counseling e mentoring", "college readiness", "monitoraggio longitudinale"],
    territorialScale: "Rete scolastica cittadina / singola scuola",
    interventionStatus:
      "Riforma storica del sistema scolastico cittadino. Le scuole valutate sono state create nel ciclo di riorganizzazione avviato dal 2002; il follow-up MDRC 2026 documenta gli esiti fino a sei anni dopo la prevista conclusione della high school.",
    evaluationMethod:
      "Natural experiment basato sulle lottery-like admissions rules delle scuole oversubscribed. Gli esiti dei vincitori delle lotterie che si iscrivono alle Small Schools of Choice sono confrontati con quelli degli studenti che perdono la stessa lotteria e frequentano altre high schools pubbliche; il disegno ha soddisfatto il più alto standard del What Works Clearinghouse senza riserve nelle valutazioni precedenti.",
    comparator: "Studenti che avevano scelto le stesse Small Schools of Choice ma non ottennero un posto nelle lotterie e frequentarono altre scuole pubbliche di New York City.",
    outcomes: ["diploma high school", "iscrizione post-secondaria", "laurea quadriennale", "occupazione", "redditi", "costo per diplomato"],
    results:
      "Le Small Schools of Choice aumentano in modo consistente il diploma e l'iscrizione post-secondaria. Il follow-up 2026 mostra che l'effetto persiste fino al conseguimento di titoli universitari quadriennali, ma non produce effetti rilevabili su occupazione o redditi nei sei anni successivi alla prevista conclusione della high school. Le valutazioni dei costi trovano un costo per diplomato inferiore rispetto alle scuole dei controlli.",
    effectSize:
      "Valutazioni precedenti: diploma in quattro anni +9,4 punti percentuali (71,6% vs 62,2%); diploma + iscrizione al college l'anno successivo +8,4 p.p.; costo per diplomato circa 14–16% più basso. Follow-up 2026: iscrizione post-secondaria immediata +9,5 p.p.; conseguimento di laurea quadriennale +2,5 p.p.; nessun effetto rilevabile su occupazione o redditi.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Il modello richiede riorganizzazione della rete scolastica, personale e leadership capaci di sostenere piccoli ambienti, partnership educative e sistemi di ammissione/monitoraggio. Le scuole valutate spendevano leggermente di più per studente di alcune grandi scuole, ma il maggior tasso di diploma riduceva il costo per diplomato.",
    limitations: [
      "L'effetto riguarda un modello organizzativo complesso, non la sola riduzione numerica della dimensione della scuola o della classe.",
      "I controlli frequentavano altre scuole di New York in un periodo di riforme diffuse: l'effetto è relativo a quell'alternativa, non alle grandi scuole fallimentari che alcune SSC sostituirono.",
      "Non emergono effetti su occupazione o redditi nel periodo di follow-up, nonostante i miglioramenti educativi.",
      "In Italia le competenze su scuole superiori, personale docente e curriculum non appartengono al comune: la trasferibilità diretta a Lamezia è quindi limitata."
    ],
    unintendedEffects:
      "La riorganizzazione di grandi scuole può produrre costi di transizione, problemi di spazio e distribuzione degli studenti. Il disegno valutato includeva accesso non selettivo e lotterie: replicare solo scuole piccole selettive altererebbe sostanzialmente il trattamento.",
    primarySource: {
      label: "City of New York — announcement of new small secondary schools",
      url: "https://www.nyc.gov/html/om/html/2004a/pr055-04.html"
    },
    evaluationStudies: [
      {
        label: "MDRC — Enduring Success (2026)",
        url: "https://www.mdrc.org/work/publications/enduring-success",
        citation: "Unterman R, Shih M (2026), Enduring Success: Effects of New York City's Small Schools of Choice on Postsecondary Degree Attainment and Employment"
      },
      {
        label: "MDRC — 2014 findings",
        url: "https://www.mdrc.org/news/press-release/new-findings-show-new-york-city-s-small-high-schools-boost-college-enrollment",
        citation: "MDRC (2014), New Findings Show New York City's Small High Schools Boost College Enrollment Rates Among Disadvantaged Students"
      }
    ],
    lastVerifiedAt: "2026-09-02",
    transferabilityItaly:
      "Bassa per una replica istituzionale letterale da parte di un comune, ma media per i principi di progettazione di servizi educativi e giovanili: piccola scala, relazioni stabili adulto-ragazzo, partnership con terzo settore e università, accesso non selettivo e monitoraggio di esiti longitudinali.",
    lameziaAdaptation:
      "Usare il modello non per riorganizzare autonomamente le scuole superiori, ma per progettare servizi comunali o partnership con scuole, CPIA, terzo settore e università: piccoli hub di mentoring/college-career guidance per studenti a rischio di dispersione, tutor stabile, accesso trasparente e outcome su frequenza, diploma e transizione post-diploma.",
    implementability: "strutturale",
    capacityDataNeeds: ["accordi con istituzioni scolastiche", "dati aggregati su dispersione e transizioni", "mentori/tutor", "partnership con terzo settore e università", "follow-up longitudinale"],
    tags: ["scuola", "dropout", "college", "lotteria", "natural experiment", "mentoring", "New York"],
    revisionHistory: [{ date: "2026-09-02", note: "Prima verifica e inserimento nell'archivio; incluso il follow-up MDRC pubblicato nel gennaio 2026." }]
  }
] as const satisfies readonly EvidenceIntervention[];
