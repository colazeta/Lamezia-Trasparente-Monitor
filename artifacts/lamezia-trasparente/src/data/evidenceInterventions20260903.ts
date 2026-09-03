import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_03 = [
  {
    id: "nyc-public-housing-temporary-street-lighting-rct",
    title: "Illuminazione tattica ad alta intensità negli spazi esterni dell'edilizia pubblica",
    authority: "New York City Police Department / New York City Housing Authority",
    territory: "New York City, New York",
    country: "Stati Uniti",
    implementationYear: "2016 (trial); follow-up fino a tre anni",
    problem:
      "Concentrazione di reati notturni negli spazi esterni di complessi di edilizia pubblica e limitata evidenza causale sull'effetto dell'illuminazione come misura di prevenzione situazionale.",
    measure:
      "Installazione temporanea, da marzo ad agosto 2016, di torri mobili di illuminazione ad alta intensità in un campione di complessi NYCHA selezionati come prioritari; l'allocazione della quantità di illuminazione aggiuntiva fu randomizzata tra i complessi.",
    mechanism:
      "Aumentare visibilità e sorveglianza naturale nelle ore notturne, modificando opportunità e rischio percepito di commettere reati negli spazi esterni senza ampliare direttamente l'attività di polizia.",
    population:
      "Residenti e utilizzatori degli spazi esterni di complessi di edilizia pubblica di New York inclusi nell'esperimento, con particolare attenzione ai reati outdoor nelle ore notturne.",
    primaryArea: "sicurezza_urbana_prevenzione",
    secondaryAreas: ["urbanistica_rigenerazione", "mobilita_spazio_pubblico"],
    interventionTypes: ["infrastruttura_fisica", "targeting_data_analytics"],
    tools: ["torri mobili di illuminazione", "randomizzazione a livello di complesso", "microdati geocodificati sui reati", "analisi degli spillover spaziali"],
    territorialScale: "Complesso residenziale / micro-area",
    interventionStatus:
      "Intervento sperimentale temporaneo concluso. Il follow-up accademico ha seguito gli effetti per tre anni; il trattamento valutato non coincide con una normale sostituzione di lampioni permanenti con LED.",
    evaluationMethod:
      "Randomized controlled trial a livello di complesso di edilizia pubblica. L'illuminazione temporanea fu assegnata casualmente tra siti NYCHA ad alta priorità; le stime considerano l'intensità del trattamento e correggono per potenziali spillover spaziali. Un successivo follow-up verifica la persistenza degli effetti fino a tre anni.",
    comparator:
      "Complessi NYCHA comparabili assegnati casualmente a livelli inferiori o nulli di illuminazione aggiuntiva nello stesso periodo, con analisi delle aree circostanti per displacement/spillover.",
    outcomes: ["reati indice notturni outdoor", "reati diurni e notturni", "arresti", "persistenza degli effetti", "displacement spaziale"],
    results:
      "L'illuminazione aggiuntiva ha ridotto in modo sostanziale i reati indice notturni negli spazi esterni. Il follow-up mostra che le riduzioni della criminalità sono rimaste stabili nei tre anni successivi e non trova evidenza che il beneficio dipenda da un aumento degli arresti o da semplice spostamento verso aree vicine.",
    effectSize:
      "Dopo la correzione per spillover spaziali, l'esperimento stima almeno il 36% in meno di reati indice notturni outdoor. Il follow-up stima benefici sociali annuali da prevenzione del crimine pari a circa 634.000–1,36 milioni di dollari per development, contro un costo annuo del trattamento di circa 125.000 dollari, ma tali valori dipendono dalle assunzioni monetarie sui costi sociali del crimine.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Il trial utilizzava torri tattiche ad alta intensità con costi di noleggio/gestione rilevanti; il follow-up stima circa 125.000 dollari annui per development nel contesto sperimentale. Una versione comunale ordinaria richiederebbe invece audit illuminotecnico, progetto permanente, consumi energetici, manutenzione e valutazione di abbagliamento e inquinamento luminoso.",
    limitations: [
      "Il trattamento era molto più intenso e visibile della normale illuminazione stradale permanente; non è corretto trasferire il 36% a una semplice sostituzione di lampade.",
      "Il contesto era costituito da complessi NYCHA selezionati per elevata priorità di sicurezza, quindi l'effetto medio può non generalizzare a quartieri a rischio basso o moderato.",
      "Le torri temporanee potevano produrre rumore, odori e forte luminosità; questi elementi non sono desiderabili in una soluzione permanente.",
      "La monetizzazione dei benefici dipende da valori convenzionali del costo sociale del crimine e va trattata come analisi economica contestuale, non come risparmio di bilancio direttamente realizzato."
    ],
    unintendedEffects:
      "Il follow-up non rileva displacement criminale rilevante nelle aree prossime, ma una replica deve monitorare inquinamento luminoso, disturbo ai residenti, consumi e possibili deviazioni dei flussi pedonali.",
    primarySource: {
      label: "NBER — Reducing Crime Through Environmental Design",
      url: "https://www.nber.org/papers/w25798"
    },
    evaluationStudies: [
      {
        label: "Journal of Quantitative Criminology / NBER working paper",
        url: "https://www.nber.org/papers/w25798",
        citation: "Chalfin A, Hansen B, Lerner J, Parker L, Reducing Crime Through Environmental Design: Evidence from a Randomized Experiment of Street Lighting in New York City",
        doi: "10.3386/w25798"
      },
      {
        label: "Criminology & Public Policy — long-term follow-up",
        url: "https://onlinelibrary.wiley.com/doi/10.1111/1745-9133.12599",
        citation: "Mitre-Becerril D et al. (2022), Can deterrence persist? Long-term evidence from a randomized experiment in street lighting",
        doi: "10.1111/1745-9133.12599"
      }
    ],
    lastVerifiedAt: "2026-09-03",
    transferabilityItaly:
      "Alta per il principio di prevenzione situazionale e per l'uso di rollout controllati su spazi comunali; media per il trattamento specifico, che era tattico e molto più intenso di una normale illuminazione urbana. La replica deve rispettare standard illuminotecnici, energia, sicurezza e inquinamento luminoso.",
    lameziaAdaptation:
      "Costruire un audit georeferenziato di illuminazione, uso serale dello spazio e segnalazioni/incidenti in un numero limitato di aree comunali; selezionare cluster comparabili, intervenire con illuminazione permanente ben progettata e rollout scaglionato, misurando outcome notturni e utilizzo dello spazio senza assumere che più lumen siano sempre migliori.",
    implementability: "medio_termine",
    capacityDataNeeds: ["mappa punti luce e livelli illuminotecnici", "segnalazioni e dati georeferenziati aggregati", "consumi energetici", "progetto illuminotecnico", "protocollo di valutazione pre/post o rollout scaglionato"],
    tags: ["illuminazione", "prevenzione situazionale", "RCT", "spazio pubblico", "sicurezza", "NYCHA"],
    revisionHistory: [{ date: "2026-09-03", note: "Prima verifica e inserimento; distinta esplicitamente l'illuminazione tattica sperimentale dall'illuminazione urbana ordinaria." }]
  },
  {
    id: "durham-family-connects-universal-newborn-home-visiting",
    title: "Family Connects: visite infermieristiche universali a domicilio dopo la nascita",
    authority: "Durham County Department of Public Health / Family Connects Durham",
    territory: "Durham County, North Carolina",
    country: "Stati Uniti",
    implementationYear: "Trial 2009–2010; programma tuttora operativo",
    problem:
      "Bisogni sanitari e sociali nel periodo post-partum che possono rimanere non identificati, accesso frammentato alle risorse territoriali e uso evitabile di cure di emergenza nei primi anni di vita.",
    measure:
      "Programma universale e gratuito per i genitori di neonati residenti nella contea: da una a tre visite domiciliari di infermieri registrati nelle prime settimane di vita, valutazione strutturata dei bisogni di genitore e bambino, educazione breve e collegamento mirato a risorse sanitarie e comunitarie.",
    mechanism:
      "Offrire a tutte le famiglie un punto di contatto precoce a bassa soglia, identificare bisogni prima che diventino crisi, fornire supporto clinico essenziale e chiudere il referral loop verso servizi già esistenti.",
    population:
      "Tutte le famiglie con un neonato residente nella contea; nel trial furono randomizzate tutte le 4.777 nascite residenti tra luglio 2009 e dicembre 2010, indipendentemente dal reddito o dal livello di rischio.",
    primaryArea: "welfare_inclusione_servizi_sociali",
    secondaryAreas: ["salute_pubblica_locale", "capacita_amministrativa_personale"],
    interventionTypes: ["servizio_diretto", "partnership_pubblico_privato_terzo_settore", "modifica_organizzativa_processo"],
    tools: ["visite infermieristiche domiciliari", "screening strutturato dei bisogni", "directory delle risorse", "referral e follow-up", "dati amministrativi sanitari e sociali"],
    territorialScale: "Contea / nucleo familiare",
    interventionStatus:
      "Programma ancora operativo nel 2026: Durham County indica che tutte le famiglie con neonati di 2–12 settimane possono ricevere gratuitamente da una a tre visite di infermieri registrati, normalmente a partire da circa tre settimane dalla nascita.",
    evaluationMethod:
      "Randomized clinical trial population-based con assegnazione casuale di tutte le 4.777 nascite residenti a Family Connects o servizi usuali. Gli outcome a cinque anni sono misurati su un sottocampione casuale mediante record ospedalieri e Child Protective Services e analizzati intent-to-treat con modelli per conteggi.",
    comparator: "Famiglie di neonati residenti assegnate casualmente ai servizi usuali senza l'offerta Family Connects nel periodo sperimentale.",
    outcomes: ["uso di cure mediche di emergenza", "ricoveri notturni", "indagini CPS per sospetto maltrattamento", "connessione ai servizi", "eterogeneità per sottogruppi"],
    results:
      "A cinque anni le famiglie assegnate al programma mostrano un uso significativamente inferiore di cure mediche di emergenza. Anche le indagini CPS risultano inferiori in termini di dimensione dell'effetto, ma la stima specifica del maltrattamento è meno precisa e il relativo intervallo al 95% include lo zero; non va quindi descritta con la stessa certezza dell'outcome sanitario.",
    effectSize:
      "Cure mediche di emergenza: −33%, da 338 a 227 visite/ricoveri per 100 bambini, con intervallo al 95% che esclude lo zero. Indagini CPS: −39%, da 44 a 27 per 100 bambini; l'intervallo al 95% della stima nel modello include lo zero (p=0,09), mentre quello al 90% lo esclude.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Richiede personale infermieristico formato, accesso tempestivo all'elenco delle nascite, una directory aggiornata dei servizi, capacità di referral e governance dei dati. Il modello indica un costo tipico storico nell'ordine di 500–700 dollari per nascita eleggibile per implementazione ad alta fedeltà; il valore non è trasferibile direttamente ai costi italiani.",
    limitations: [
      "Gli outcome a cinque anni sono osservati su un sottocampione casuale del trial, non sull'intera coorte di 4.777 nascite.",
      "La riduzione delle indagini CPS è grande ma statisticamente meno precisa: il 95% CI include lo zero e il p-value riportato è 0,09.",
      "L'implementazione richiede competenze sanitarie professionali e accesso alle nascite che in Italia non sono di competenza autonoma del Comune.",
      "Il modello funziona come ponte verso una rete locale di servizi sufficientemente capiente; un programma di visite senza risorse effettivamente disponibili non replicherebbe il trattamento."
    ],
    unintendedEffects:
      "Non emergono effetti avversi principali dal trial, ma un sistema universale può generare domanda aggiuntiva sui servizi territoriali e richiede attenzione a consenso, privacy, capacità di risposta e possibili differenze di efficacia tra sottogruppi.",
    primarySource: {
      label: "Durham County Department of Public Health — Family Connects Newborn Home Visiting Program",
      url: "https://dconc.gov/Public-Health/Community-Programming/For-Families-and-Children/Maternal-and-Child-Health"
    },
    evaluationStudies: [
      {
        label: "JAMA Network Open",
        url: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2781681",
        citation: "Goodman WB, Dodge KA, Bai Y, Murphy RA, O'Donnell K (2021), Effect of a Universal Postpartum Nurse Home Visiting Program on Child Maltreatment and Emergency Medical Care at 5 Years of Age",
        doi: "10.1001/jamanetworkopen.2021.16024"
      }
    ],
    lastVerifiedAt: "2026-09-03",
    transferabilityItaly:
      "Alta come modello di presa in carico universale breve e coordinamento dei servizi, ma bassa come competenza municipale autonoma: la realizzazione richiederebbe ASP, punti nascita, consultori, pediatria e servizi sociali, con basi giuridiche e flussi informativi appropriati.",
    lameziaAdaptation:
      "Valutare con ASP e punti nascita un percorso territoriale universale e breve per le famiglie con neonati, iniziando da una feasibility analysis su numero annuo di nascite, personale infermieristico/ostetrico e capacità dei servizi. Un eventuale pilota dovrebbe misurare referral completati, accessi evitabili in emergenza e soddisfazione, senza creare un registro comunale parallelo di dati sanitari personali.",
    implementability: "strutturale",
    capacityDataNeeds: ["numero e flussi delle nascite", "personale infermieristico/ostetrico", "mappa aggiornata dei servizi", "protocollo Comune-ASP-punti nascita", "governance privacy e referral outcome"],
    tags: ["prima infanzia", "post-partum", "home visiting", "RCT", "welfare", "salute", "referral"],
    revisionHistory: [{ date: "2026-09-03", note: "Prima verifica e inserimento; separata la forte evidenza sull'emergenza sanitaria dalla stima meno precisa sulle indagini CPS." }]
  },
  {
    id: "sweden-varberg-partille-waste-norm-feedback-rct",
    title: "Feedback comparativo sul rifiuto residuo per aumentare riciclo e prevenzione",
    authority: "Municipalità di Varberg e Partille / gestori pubblici locali dei rifiuti",
    territory: "Varberg e Partille, Svezia occidentale",
    country: "Svezia",
    implementationYear: "2019 (esperimenti); follow-up fino a circa un anno dopo",
    problem:
      "Quantità di rifiuto residuo ancora elevata nonostante sistemi pay-as-you-throw già basati sul peso e disponibilità di dati granulari sui conferimenti domestici.",
    measure:
      "Due grandi esperimenti municipali hanno inviato alle famiglie lettere periodiche con il proprio rifiuto residuo pro capite confrontato con famiglie simili, smiley/valutazioni normative e suggerimenti pratici. Varberg testava anche una norma dinamica che enfatizzava il cambiamento recente; Partille confrontava frequenza mensile e trimestrale.",
    mechanism:
      "Rendere saliente la performance individuale rispetto a un riferimento sociale credibile e trasformare i dati di pesatura già prodotti dal servizio in feedback personalizzato, incentivando soprattutto maggiore separazione degli imballaggi e prevenzione del rifiuto.",
    population:
      "Quasi tutte le abitazioni unifamiliari nelle due municipalità, per un totale di circa 20.000 famiglie: a Varberg circa 5.000 indirizzi per ciascuno dei tre bracci; a Partille circa 1.800 per ciascuno dei tre bracci.",
    primaryArea: "rifiuti_pulizia_urbana",
    secondaryAreas: ["ambiente_clima_energia", "digitalizzazione_servizi_online"],
    interventionTypes: ["nudging_comunicazione", "informazione_trasparenza", "targeting_data_analytics"],
    tools: ["pesatura dei bidoni", "feedback household-specific", "confronto con pari", "lettere mensili/trimestrali", "consigli di prevenzione e riciclo"],
    territorialScale: "Comune / utenza domestica",
    interventionStatus:
      "Esperimenti conclusi. Entrambe le municipalità applicavano già una tariffazione a peso e disponevano di pesatura dei bidoni durante la raccolta; il feedback era uno strato comportamentale aggiuntivo, non un sostituto del PAYT.",
    evaluationMethod:
      "Due randomized controlled trials su larga scala con randomizzazione per cluster/indirizzi tra controllo e diverse varianti di feedback. Il principale outcome è il peso del rifiuto residuo per persona derivato direttamente dai sistemi di pesatura comunali; il follow-up verifica anche la persistenza dopo la fine delle lettere.",
    comparator: "Famiglie delle stesse municipalità assegnate casualmente al gruppo senza lettere di feedback nello stesso periodo, soggette alle medesime tariffe a peso e regole di raccolta.",
    outcomes: ["kg di rifiuto residuo per persona", "persistenza a un anno", "riciclo di imballaggi", "prevenzione del rifiuto", "dumping illecito", "opt-out dal feedback"],
    results:
      "Tutte le varianti di feedback riducono significativamente il rifiuto residuo; gli effetti sono principalmente associati a maggiore riciclo degli imballaggi e restano in larga parte presenti un anno dopo la fine dell'intervento. Non emerge evidenza di un aumento sostanziale del dumping nei dati disponibili.",
    effectSize:
      "Riduzioni post-trattamento nell'ordine del 7–12% in entrambe le municipalità. Tra le famiglie con livelli iniziali più elevati le riduzioni arrivano a circa 15–20%. Gli autori stimano che l'effetto medio sia comparabile a quello di un aumento del 30–60% della componente marginale della tariffa a peso.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Il costo marginale è basso se esistono già pesatura affidabile e identificazione dell'utenza; servono generazione periodica dei benchmark, comunicazioni personalizzate e gestione opt-out. Gli autori trovano alta cost-effectiveness rispetto ad altri strumenti non-price, ma il beneficio sociale netto dipende dalle preferenze dei destinatari e da quanto la tariffa esistente internalizzi già i costi del rifiuto.",
    limitations: [
      "Il trattamento è stato testato in comuni con PAYT a peso attivo da decenni e pesatura capillare: gli effetti non sono direttamente trasferibili dove questi prerequisiti mancano.",
      "Una quota non trascurabile dei trattati ha effettuato opt-out, soprattutto in Varberg; accettabilità e privacy del confronto sociale sono quindi parte della policy.",
      "Il meccanismo preciso tra prevenzione e riciclo è misurato solo parzialmente; una parte dell'analisi sulla composizione del rifiuto deriva da sottocampioni.",
      "La riduzione del residuo non equivale automaticamente a beneficio ambientale netto: dipende da trattamento delle frazioni, tariffe, costi di raccolta e preferenze delle famiglie."
    ],
    unintendedEffects:
      "Non viene rilevato un aumento evidente del dumping illecito nei dati comunali disponibili e non emerge un forte boomerang effect tra i bassi produttori, ma il feedback può generare fastidio o opt-out e ciò entra nella valutazione di welfare.",
    primarySource: {
      label: "Journal of Public Economics — Norm-based feedback on household waste",
      url: "https://doi.org/10.1016/j.jpubeco.2024.105191"
    },
    evaluationStudies: [
      {
        label: "Journal of Public Economics",
        url: "https://doi.org/10.1016/j.jpubeco.2024.105191",
        citation: "Ek C, Söderberg M (2024), Norm-based feedback on household waste: Large-scale field experiments in two Swedish municipalities",
        doi: "10.1016/j.jpubeco.2024.105191"
      }
    ],
    lastVerifiedAt: "2026-09-03",
    transferabilityItaly:
      "Alta per comuni o gestori che dispongono già di identificazione utenza e misure affidabili dei conferimenti, soprattutto in contesti TARIP/PAYT; bassa dove manca la granularità necessaria. Il trattamento è complementare alla tariffazione puntuale e ha costo marginale relativamente ridotto.",
    lameziaAdaptation:
      "Se e quando saranno disponibili dati granulari di conferimento per utenza, testare su un campione di famiglie un report semplice che mostri rifiuto residuo, trend personale e confronto con utenze comparabili, mantenendo un gruppo di controllo e un opt-out esplicito. Prima di ciò, usare il caso per definire i requisiti informativi di una futura TARIP, non per produrre confronti su dati non affidabili.",
    implementability: "medio_termine",
    capacityDataNeeds: ["identificazione stabile delle utenze", "pesatura o misurazione affidabile del residuo", "dimensione del nucleo o benchmark comparabile", "motore di generazione report", "protocollo opt-out e privacy"],
    tags: ["rifiuti", "feedback", "norme sociali", "RCT", "PAYT", "TARIP", "riciclo", "Varberg", "Partille"],
    revisionHistory: [{ date: "2026-09-03", note: "Prima verifica e inserimento; registrata la dipendenza del trattamento da sistemi di pesatura e tariffazione puntuale preesistenti." }]
  },
  {
    id: "ahmedabad-heat-action-plan-mortality",
    title: "Heat Action Plan: allerta precoce, coordinamento sanitario e protezione dal caldo estremo",
    authority: "Ahmedabad Municipal Corporation",
    territory: "Ahmedabad, Gujarat",
    country: "India",
    implementationYear: "Dal 2013; valutazione principale 2014–2015 rispetto al 2007–2010",
    problem:
      "Elevata mortalità durante ondate di calore estremo, aggravata da scarsa consapevolezza del rischio, esposizione occupazionale e coordinamento insufficiente tra previsioni meteorologiche, sanità e servizi urbani.",
    measure:
      "Piano cittadino di allerta caldo con soglie previsionali, comunicazione pubblica, formazione degli operatori sanitari, coordinamento tra AMC e servizi meteorologici, misure per acqua/idratazione e protezione dei gruppi vulnerabili. Il modello è stato aggiornato nel tempo con azioni operative durante le ondate di calore.",
    mechanism:
      "Anticipare i giorni di rischio elevato, attivare comunicazione e risposta sanitaria prima del picco, ridurre l'esposizione nelle ore più pericolose e coordinare risorse urbane e sanitarie verso le persone più esposte.",
    population: "Popolazione urbana di Ahmedabad, con particolare attenzione a anziani, bambini, lavoratori outdoor, persone con patologie e residenti in aree a maggiore esposizione termica.",
    primaryArea: "salute_pubblica_locale",
    secondaryAreas: ["ambiente_clima_energia", "capacita_amministrativa_personale"],
    interventionTypes: ["informazione_trasparenza", "modifica_organizzativa_processo", "formazione_capacity_building", "partnership_pubblico_privato_terzo_settore"],
    tools: ["soglie di allerta caldo", "previsioni meteorologiche", "formazione sanitaria", "campagne pubbliche", "coordinamento intersettoriale", "punti acqua e misure di protezione"],
    territorialScale: "Città / sistema di risposta al caldo",
    interventionStatus:
      "Il Heat Action Plan è diventato un modello stabile di adattamento cittadino. Nel 2026 Ahmedabad continua a utilizzare allerta e misure operative per il caldo, mentre il piano si integra progressivamente con heat mapping e strategie climatiche più ampie.",
    evaluationMethod:
      "Valutazione osservazionale pre/post: relazione temperatura-mortalità stimata con distributed lag nonlinear models e confronto dei tassi di mortalità nei periodi pre-HAP 2007–2010 e post-HAP 2014–2015. Gli autori stimano anche i decessi annualizzati evitati applicando le differenze di incidenza.",
    comparator: "Relazione temperatura-mortalità e tassi di mortalità osservati nella stessa città negli anni precedenti al piano; non è presente una città di controllo contemporanea.",
    outcomes: ["mortalità estiva per tutte le cause", "mortalità nei giorni oltre 40°C", "mortalità nei giorni oltre 45°C", "rischio a temperature estreme"],
    results:
      "Dopo l'introduzione del piano la relazione tra caldo estremo e mortalità si attenua, soprattutto alle temperature più alte, e gli autori stimano un numero sostanziale di decessi evitati. Il disegno, tuttavia, non isola pienamente il piano da altri cambiamenti intervenuti tra i periodi.",
    effectSize:
      "Stima di 1.190 decessi medi annualizzati evitati nel periodo post-HAP (95% CI 162–2.218). A 47°C il rate ratio massimo stimato scende da 2,34 pre-HAP a 1,25 post-HAP. Per Tmax >45°C il post/pre incidence rate ratio è 0,73, con intervallo molto ampio (0,29–1,81).",
    evidenceStrength: "moderata",
    costsRequirements:
      "Richiede previsione meteorologica operativa, un nodal officer/coordinamento, protocolli sanitari, comunicazione rapida, formazione e misure fisiche di mitigazione. La valutazione non fornisce un costo comparabile completo; l'infrastruttura organizzativa è centrale quanto i singoli interventi materiali.",
    limitations: [
      "Disegno pre/post senza città di controllo: adattamento spontaneo, variazioni demografiche, sanitarie o ambientali possono contribuire alla differenza osservata.",
      "Gli intervalli sugli incidence rate ratio alle temperature più estreme sono ampi per la rarità degli eventi.",
      "La stima di decessi evitati è modellistica e non equivale a un conteggio direttamente osservato di vite salvate dal solo HAP.",
      "Analisi successive hanno evidenziato lacune nella capacità di documentare quali gruppi vulnerabili beneficino maggiormente del piano, quindi equità e copertura devono essere misurate esplicitamente."
    ],
    unintendedEffects:
      "Non sono identificati effetti avversi quantitativi principali, ma un sistema di allerta può avere copertura diseguale, fatigue dei messaggi o scarsa capacità di proteggere lavoratori e residenti che non possono modificare l'esposizione; questi rischi richiedono targeting e monitoraggio distributivo.",
    primarySource: {
      label: "Development and Implementation of South Asia's First Heat-Health Action Plan in Ahmedabad",
      url: "https://www.mdpi.com/1660-4601/11/4/3473"
    },
    evaluationStudies: [
      {
        label: "Journal of Environmental and Public Health",
        url: "https://doi.org/10.1155/2018/7973519",
        citation: "Hess JJ et al. (2018), Building Resilience to Climate Change: Pilot Evaluation of the Impact of India's First Heat Action Plan on All-Cause Mortality",
        doi: "10.1155/2018/7973519"
      },
      {
        label: "Urban Science — critical implementation review",
        url: "https://doi.org/10.3390/urbansci4040053",
        citation: "Nastar M (2020), Message Sent, Now What? A Critical Analysis of the Heat Action Plan in Ahmedabad, India",
        doi: "10.3390/urbansci4040053"
      }
    ],
    lastVerifiedAt: "2026-09-03",
    transferabilityItaly:
      "Alta per il modello di governance e allerta, dato che i comuni italiani hanno funzioni rilevanti di protezione civile, informazione e gestione dello spazio/servizi locali, ma le competenze sanitarie richiedono integrazione con Regione/ASP e il sistema nazionale di previsione e allerta.",
    lameziaAdaptation:
      "Costruire un Heat Action Protocol locale integrato con Protezione Civile, ASP e previsioni ufficiali: soglie e trigger espliciti, elenco di azioni per scuole/servizi/luoghi pubblici, punti acqua e ombra, comunicazione ai lavoratori outdoor e mappa di vulnerabilità. Prima dell'estate definire baseline su temperature, accessi sanitari aggregati e copertura delle azioni per valutarne l'efficacia nel tempo.",
    implementability: "medio_termine",
    capacityDataNeeds: ["previsioni e allerta caldo ufficiali", "mappa urban heat/vulnerabilità", "protocollo Protezione Civile-ASP", "elenco luoghi sensibili e punti acqua/ombra", "indicatori sanitari aggregati e di copertura"],
    tags: ["caldo estremo", "heat action plan", "clima", "salute", "protezione civile", "allerta", "Ahmedabad"],
    revisionHistory: [{ date: "2026-09-03", note: "Prima verifica e inserimento; classificata evidenza moderata per assenza di controllo contemporaneo e registrate le incertezze distributive." }]
  }
] as const satisfies readonly EvidenceIntervention[];
