import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_11 = [
  {
    id: "rochester-guaranteed-basic-income-pilot",
    title: "Guaranteed Basic Income: trasferimento monetario incondizionato temporaneo per residenti a basso reddito",
    authority: "City of Rochester / Black Community Focus Fund",
    territory: "Rochester, New York",
    country: "Stati Uniti",
    implementationYear: "2023–2024; valutazione tecnica finale pubblicata nel dicembre 2025",
    problem:
      "Nuclei a basso reddito esposti a insicurezza alimentare, difficoltà nel pagamento di affitto e utenze, scarsa capacità di risparmio e fragilità finanziaria, con programmi assistenziali spesso frammentati o vincolati a usi specifici.",
    measure:
      "Pilota cittadino di Guaranteed Basic Income che ha erogato 500 USD al mese per 12 mesi, senza obbligo di lavoro né vincoli sulla destinazione della spesa, a 351 residenti adulti selezionati tra persone eleggibili residenti da almeno un anno, in census tract qualificati e con reddito familiare non superiore al 185% della soglia federale di povertà.",
    mechanism:
      "Fornire liquidità prevedibile e non vincolata consente ai beneficiari di assorbire shock, ridurre arretrati e insicurezza materiale, costruire risparmio e scegliere autonomamente tra bisogni concorrenti senza dover superare procedure separate per ciascuna voce di spesa.",
    population:
      "Adulti residenti a Rochester in aree eleggibili e con reddito familiare fino al 185% della soglia federale di povertà; i posti furono offerti tramite randomizzazione tra richiedenti eleggibili e 351 persone ricevettero il trasferimento.",
    primaryArea: "welfare_inclusione_servizi_sociali",
    secondaryAreas: ["sviluppo_economico_commercio_lavoro", "housing_politiche_abitative"],
    interventionTypes: ["incentivo_economico", "servizio_diretto"],
    tools: ["trasferimento monetario mensile", "randomizzazione dell'offerta", "dati di survey", "dati amministrativi e creditizi", "pagamenti senza vincolo di destinazione"],
    territorialScale: "Città / individuo e nucleo familiare",
    interventionStatus:
      "Pilota concluso. La City of Rochester lo presenta come prima iniziativa cittadina di guaranteed income; la valutazione tecnica finale è stata pubblicata il 5 dicembre 2025. Il record non assume che il pilota sia divenuto un diritto permanente o un programma strutturale.",
    evaluationMethod:
      "Randomized offer design: in collaborazione con la City of Rochester e il Wilson Sheehan Lab for Economic Opportunities, i posti del programma furono offerti casualmente tra richiedenti eleggibili. La valutazione confronta beneficiari/offerta e gruppo di confronto usando survey di fine programma e ulteriori dati amministrativi/creditizi, distinguendo gli outcome finanziari direttamente osservati dalle percezioni auto-riferite.",
    comparator:
      "Richiedenti eleggibili non selezionati casualmente per ricevere il trasferimento durante il pilota, osservati nello stesso contesto cittadino.",
    outcomes: ["risparmio e accesso bancario", "insicurezza alimentare", "preoccupazioni per sfratto e distacco utenze", "progresso verso obiettivi finanziari", "occupazione", "credito e debito"],
    results:
      "La valutazione finale documenta miglioramenti nella capacità di risparmio e nell'accesso bancario e minore insicurezza materiale, incluse preoccupazioni per cibo, sfratto e distacco delle utenze. I beneficiari risultano inoltre più propensi a riferire progressi verso obiettivi finanziari. Gli effetti non devono essere interpretati come prova che un trasferimento municipale temporaneo produca automaticamente miglioramenti permanenti dopo la fine dei pagamenti.",
    effectSize:
      "Il report finale indica che i beneficiari erano 183% più propensi a dichiarare di avere più risparmi rispetto a un anno prima e 100% più propensi a riferire progressi verso obiettivi finanziari; il risparmio aggiuntivo medio riportato a fine programma era nell'ordine di 250 USD. Il report documenta anche riduzioni dell'insicurezza alimentare e di altre difficoltà, ma questo record non trasforma in effect size valori che non risultano verificati con sufficiente precisione nelle fonti consultate.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Il trattamento sperimentale costava 6.000 USD per beneficiario per 12 mesi, oltre a costi di selezione, amministrazione dei pagamenti, protezione dati e valutazione. Una replica italiana richiederebbe una base giuridica e finanziaria esplicita, coordinamento con prestazioni nazionali/regionali e una verifica ex ante degli effetti su accesso e compatibilità con altri benefici.",
    limitations: [
      "Il programma era temporaneo e circoscritto: gli effetti durante l'anno di pagamento non dimostrano persistenza dopo la cessazione del trasferimento.",
      "Parte degli outcome principali deriva da survey di fine programma e può essere influenzata da non-risposta o misurazione auto-riferita; gli outcome amministrativi/creditizi vanno letti separatamente.",
      "Il trattamento combina un trasferimento elevato rispetto al reddito di famiglie molto povere con un contesto statunitense specifico; dimensione e composizione degli effetti non sono direttamente trasferibili a Lamezia.",
      "Un comune italiano non può presumere di poter istituire autonomamente un reddito minimo o una prestazione monetaria generalizzata: competenza, base normativa, copertura finanziaria e coordinamento con misure nazionali e regionali devono essere verificati.",
      "L'esperimento misura l'effetto di un trasferimento per un gruppo selezionato di richiedenti eleggibili, non l'effetto fiscale e distributivo di un programma universale cittadino."
    ],
    unintendedEffects:
      "Un trasferimento temporaneo può creare un cliff alla cessazione, interagire con altre prestazioni o concentrare risorse su una platea non perfettamente coincidente con i bisogni più urgenti. Questi rischi richiedono regole di coordinamento e follow-up, non sono una ragione per inferire effetti avversi non osservati dal trial.",
    primarySource: {
      label: "City of Rochester — Guaranteed Basic Income Pilot Program",
      url: "https://www.cityofrochester.gov/departments/mayors-office/guaranteed-basic-income"
    },
    evaluationStudies: [
      {
        label: "City of Rochester — final technical report",
        url: "https://www.cityofrochester.gov/sites/default/files/2025-12/GBI_technical_report_FINAL_v2_12.5.2025.pdf",
        citation: "Kalsi P, Phillips D, Swanson R, Turner P (2025), The Impact of Guaranteed Basic Income for Low-Income Households in Rochester"
      },
      {
        label: "Wilson Sheehan Lab for Economic Opportunities — project page",
        url: "https://leo.nd.edu/partners-projects/projects/guaranteed-basic-income-city-of-rochester",
        citation: "University of Notre Dame LEO, Guaranteed Basic Income — City of Rochester"
      }
    ],
    lastVerifiedAt: "2026-09-11",
    transferabilityItaly:
      "Bassa per una replica letterale come reddito cittadino autonomo, ma alta come evidenza sul valore di trasferimenti semplici e prevedibili quando l'obiettivo è stabilizzare famiglie a basso reddito. Per un comune italiano il nucleo trasferibile è soprattutto la semplificazione del sostegno economico e la sperimentazione rigorosa entro strumenti per i quali esista una competenza giuridica chiara.",
    lameziaAdaptation:
      "Non istituire un nuovo reddito comunale senza base normativa. Mappare invece i contributi economici comunali già legittimamente erogabili, i tempi di accesso, le causali e le sovrapposizioni; verificare se una piccola quota di risorse possa essere trasformata in un sostegno temporaneo più semplice e flessibile per una popolazione circoscritta, con randomizzazione o rollout graduale quando eticamente e giuridicamente possibile e outcome su arretrati, sicurezza alimentare, stabilità abitativa e ricorso ai servizi.",
    implementability: "strutturale",
    capacityDataNeeds: ["mappa delle prestazioni economiche esistenti", "base giuridica e copertura finanziaria", "criteri di eleggibilità", "coordinamento con ISEE e misure nazionali/regionali", "sistema di pagamento", "protocollo di valutazione e follow-up"],
    tags: ["reddito garantito", "cash transfer", "RCT", "povertà", "stabilità finanziaria", "Rochester"] ,
    revisionHistory: [{ date: "2026-09-11", note: "Prima verifica e inserimento sulla base del report tecnico finale della City of Rochester; preservata la distinzione tra outcome di survey, dati amministrativi e limiti di trasferibilità giuridica in Italia." }]
  },
  {
    id: "seattle-lead-prebooking-diversion",
    title: "LEAD: diversion pre-booking verso case management e servizi di supporto",
    authority: "City of Seattle / Seattle Police Department / LEAD partners",
    territory: "Seattle, Washington",
    country: "Stati Uniti",
    implementationYear: "Dal 2011; valutazione della fase di implementazione ottobre 2011–luglio 2014",
    problem:
      "Persone coinvolte ripetutamente in reati di basso livello legati a uso di sostanze, salute mentale, povertà estrema e instabilità abitativa possono entrare in un ciclo ricorrente di arresto, detenzione e nuovo contatto con il sistema penale senza risoluzione dei bisogni sottostanti.",
    measure:
      "Law Enforcement Assisted Diversion (LEAD) sostituisce, nei casi eleggibili, l'arresto e la prosecution ordinaria con un invio pre-booking a case management intensivo e servizi individualizzati, tra cui trattamento, housing support, accesso a reddito/benefici e altri supporti sociali. Il modello è nato a Seattle nel 2011 ed è successivamente stato replicato in altre giurisdizioni.",
    mechanism:
      "Interrompere il ciclo arresto-detenzione-recidiva affrontando bisogni di salute comportamentale, sostanze, reddito e alloggio attraverso una relazione continuativa di case management, mantenendo una risposta coordinata tra enforcement e servizi.",
    population:
      "Nella valutazione originaria 318 adulti sospettati di attività di basso livello connesse soprattutto a droga o prostituzione nel territorio di Seattle; 203 partecipanti LEAD furono confrontati con 115 persone eleggibili nel sistema ordinario.",
    primaryArea: "sicurezza_urbana_prevenzione",
    secondaryAreas: ["welfare_inclusione_servizi_sociali", "salute_pubblica_locale", "housing_politiche_abitative"],
    interventionTypes: ["servizio_diretto", "modifica_organizzativa_processo", "partnership_pubblico_privato_terzo_settore"],
    tools: ["pre-booking diversion", "case management", "referral a servizi", "coordinamento polizia-servizi", "supporto abitativo e al reddito"],
    territorialScale: "Città / individuo ad alto bisogno",
    interventionStatus:
      "Il modello originario di Seattle è evoluto e si è diffuso. Nel 2026 la Washington State Health Care Authority mantiene un LEAD Grant Program basato sugli stessi principi di alternative comunitarie a jail e prosecution; il programma contemporaneo non coincide perfettamente con la configurazione sperimentale 2011–2014.",
    evaluationMethod:
      "Valutazione controllata non randomizzata su 318 persone, con confronto tra partecipanti LEAD e soggetti system-as-usual che soddisfacevano criteri comparabili. L'analisi usa aggiustamenti statistici per differenze osservabili e misura arresti e nuove accuse nel follow-up; l'allocazione al trattamento non fu casuale e rimane possibile selection bias residuo.",
    comparator:
      "115 persone eleggibili che ricevettero la risposta ordinaria del sistema penale invece dell'invio LEAD, confrontate con 203 partecipanti al programma.",
    outcomes: ["nuovi arresti", "nuove accuse penali", "accuse felony", "recidivismo registrato", "contatto con servizi di supporto"],
    results:
      "Rispetto al sistema ordinario, la partecipazione LEAD è associata a una sostanziale riduzione della probabilità di nuovi arresti e delle accuse felony. Il risultato riguarda eventi registrati dal sistema di giustizia e non dimostra che ogni forma di condotta illecita sottostante sia diminuita nella stessa misura.",
    effectSize:
      "Nel peer-reviewed follow-up LEAD è associato a odds di arresto inferiori del 60% e a odds di nuove accuse felony inferiori del 39% rispetto al system-as-usual, dopo gli aggiustamenti previsti dall'analisi.",
    evidenceStrength: "moderata",
    costsRequirements:
      "Richiede case manager con carichi sostenibili, accesso reale a housing, trattamento e sostegni economici, protocolli condivisi con polizia e giustizia, criteri di eleggibilità trasparenti, supervisione e sistemi di dati interoperabili. Una diversion senza capacità di servizio sufficiente non replica il trattamento valutato.",
    limitations: [
      "L'assegnazione non era randomizzata: gli operatori partecipavano alla selezione e aggiustamenti statistici non eliminano possibili differenze non osservate tra gruppo LEAD e controllo.",
      "Gli outcome principali sono arresti e accuse registrate, che dipendono sia dalla condotta sia dalle pratiche di enforcement; non coincidono automaticamente con la criminalità effettiva.",
      "Il campione è relativamente piccolo e concentrato su reati di basso livello e su un contesto statunitense con competenze di polizia e prosecution molto diverse dall'Italia.",
      "Il programma è un pacchetto complesso: non è possibile attribuire l'effetto separatamente al case management, al mancato arresto, all'housing support o ad altri servizi.",
      "Discrezionalità nei referral può creare disparità di accesso se criteri, audit e monitoraggio dell'equità non sono espliciti."
    ],
    unintendedEffects:
      "Rischi di net-widening, accesso diseguale alla diversion o dipendenza da scelte discrezionali degli operatori. Una replica deve monitorare chi viene escluso, chi viene inviato, i tempi di presa in carico e gli outcome di sicurezza oltre ai soli arresti.",
    primarySource: {
      label: "Washington State Health Care Authority — LEAD Grant Program fact sheet",
      url: "https://www.hca.wa.gov/assets/program/fact-sheet-lead.pdf"
    },
    evaluationStudies: [
      {
        label: "Evaluation and Program Planning",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S014971891630266X",
        citation: "Collins SE, Lonczak HS, Clifasefi SL (2017), Seattle's Law Enforcement Assisted Diversion (LEAD): Program effects on recidivism outcomes",
        doi: "10.1016/j.evalprogplan.2017.05.008"
      },
      {
        label: "U.S. Office of Justice Programs — Recidivism Report",
        url: "https://www.ojp.gov/library/publications/lead-program-evaluation-recidivism-report",
        citation: "Collins SE, Lonczak HS, Clifasefi SL (2015), LEAD Program Evaluation: Recidivism Report"
      }
    ],
    lastVerifiedAt: "2026-09-11",
    transferabilityItaly:
      "Bassa per la componente formale di pre-booking/prosecution, che dipende da poteri e procedure non comunali, ma medio-alta per il modello di partnership e presa in carico alternativa. Un comune italiano può contribuire a protocolli con Prefettura, Questura, ASP/SerD e terzo settore per collegare persone ad alto bisogno a servizi prima che crisi ripetute generino nuovi contatti istituzionali, senza attribuirsi poteri penali che non possiede.",
    lameziaAdaptation:
      "Costruire con Prefettura, forze di polizia, ASP/SerD, servizi sociali e terzo settore un protocollo di referral per persone con contatti ripetuti e bisogni complessi, iniziando da una popolazione molto circoscritta. Il Comune dovrebbe presidiare case management sociale, housing e accesso ai servizi, mentre le decisioni penali restano alle autorità competenti. Predefinire criteri di inclusione, audit di equità, tempi di presa in carico e outcome su stabilità, accessi ai servizi e nuovi contatti istituzionali.",
    implementability: "strutturale",
    capacityDataNeeds: ["protocollo interistituzionale", "case management intensivo", "capacità SerD/salute mentale", "housing e sostegni sociali", "criteri di referral", "audit di equità", "linkage dati privacy-safe"],
    tags: ["diversion", "case management", "sostanze", "sicurezza urbana", "LEAD", "Seattle", "quasi-esperimento"],
    revisionHistory: [{ date: "2026-09-11", note: "Prima verifica e inserimento; classificata evidenza moderata per l'allocazione non randomizzata e mantenuta esplicita la distinzione tra recidivismo registrato e condotta sottostante." }]
  },
  {
    id: "rochester-lead-law-rental-inspections",
    title: "Lead Law: ispezioni preventive degli alloggi in affitto e test della polvere di piombo",
    authority: "City of Rochester",
    territory: "Rochester, New York",
    country: "Stati Uniti",
    implementationYear: "Ordinanza approvata nel dicembre 2005; implementazione dal 2006; regime ispettivo aggiornato nel 2026",
    problem:
      "Un vasto stock abitativo antecedente al divieto della vernice al piombo esponeva bambini, in particolare nelle locazioni a basso reddito, a rischi che il solo intervento dopo un caso di avvelenamento o la sola ispezione visiva potevano non intercettare.",
    measure:
      "Emendamento al codice abitativo che integra la prevenzione del piombo nel Certificate of Occupancy per immobili in affitto costruiti prima del 1978. Nelle aree classificate ad alto rischio sulla base dei precedenti livelli ematici infantili, le unità che superano l'ispezione visiva devono anche superare dust-wipe tests; le violazioni richiedono remediation prima della piena conformità.",
    mechanism:
      "Spostare il controllo da un modello reattivo, successivo all'esposizione di un bambino, a una prevenzione primaria basata sul rischio dell'edificio e del territorio; il test della polvere identifica contaminazione non visibile e rende l'obbligo di remediation verificabile con una misura ambientale.",
    population:
      "Immobili residenziali in affitto pre-1978 soggetti al regime comunale di Certificate of Occupancy, con controlli più intensi nelle aree ad alto rischio; outcome sanitari osservati tra bambini sotto i sei anni sottoposti a blood lead testing.",
    primaryArea: "salute_pubblica_locale",
    secondaryAreas: ["housing_politiche_abitative", "capacita_amministrativa_personale"],
    interventionTypes: ["regolazione", "enforcement_controllo", "targeting_data_analytics", "modifica_organizzativa_processo"],
    tools: ["Certificate of Occupancy", "ispezione visiva", "dust-wipe testing", "mappa di rischio", "remediation obbligatoria", "dati di blood lead surveillance"],
    territorialScale: "Immobile / area di rischio / città",
    interventionStatus:
      "La politica locale ha continuato a evolvere. Nel 2026 Rochester sta modificando requisiti ispettivi e Certificate of Occupancy per coordinarsi con la nuova disciplina statale, mantenendo un sistema locale di controllo del piombo negli alloggi in affitto.",
    evaluationMethod:
      "Valutazione osservazionale dei primi anni di implementazione basata su dati ispettivi comunali, survey/focus group dei proprietari e dati sanitari sui livelli ematici infantili, con confronto temporale pre/post. Non esiste una città di controllo o randomizzazione: la riduzione degli elevated blood lead levels coincide con trend più ampi e non può essere attribuita integralmente all'ordinanza.",
    comparator:
      "Periodo pre-implementazione nella stessa città e andamento dei diversi tipi di ispezione/unità; non è presente un gruppo di controllo contemporaneo equivalente.",
    outcomes: ["unità con hazard al piombo identificate", "hazard rilevati solo dal dust-wipe test", "conformità e remediation", "elevated blood lead levels nei bambini", "costi di compliance dei proprietari"],
    results:
      "Il programma ha ispezionato quasi tutte le unità target previste nei primi quattro anni e ha identificato migliaia di alloggi con hazard da rendere lead-safe. Il dust-wipe testing ha intercettato una quota sostanziale di rischi che la sola ispezione visiva avrebbe mancato. Nello stesso periodo gli elevated blood lead levels infantili sono diminuiti nettamente, ma il disegno before-after non consente di attribuire causalmente l'intero calo alla legge locale.",
    effectSize:
      "Nella valutazione 2006–2008 circa 3.440 unità, approssimativamente 12 ogni 100 case ispezionate, fallirono un controllo visivo o dust-wipe per hazard interni; quasi un terzo degli hazard interni sarebbe stato perso senza dust-wipe testing. Tra i bambini sotto i sei anni testati, la quota con blood lead ≥10 µg/dL scese dal 7,5% nei due anni precedenti al 5,0% nei due anni successivi; il numero annuo riportato passò da 604 nel 2004–2005 a 284 nel 2007–2008. Quest'ultimo andamento è osservazionale e non un effect size causale della legge.",
    evidenceStrength: "moderata",
    costsRequirements:
      "Richiede inventario del patrimonio locativo e anno di costruzione, ispettori formati, accesso a laboratori/campionamento, procedure di remediation e reinspezione, sistema di certificazione e integrazione con dati sanitari aggregati per il targeting. La valutazione storica riporta costi mediani di compliance più elevati negli immobili di minor valore, evidenziando un potenziale onere distributivo.",
    limitations: [
      "Il principale outcome sanitario è before-after senza controllo contemporaneo; nello stesso periodo erano in corso trend nazionali e locali di riduzione dell'esposizione al piombo, per cui non è corretto attribuire la diminuzione dei livelli ematici integralmente all'ordinanza.",
      "La prevalenza di vernice al piombo, età del patrimonio edilizio, mercato dell'affitto e poteri ispettivi di Rochester differiscono dal contesto italiano.",
      "Il targeting geografico usa dati sanitari storici: una replica richiede governance rigorosa, dati aggregati e protezione contro stigmatizzazione di quartieri o proprietari.",
      "La compliance può trasferire costi a proprietari o inquilini e produrre ritiro di unità dal mercato se remediation, incentivi e tempi non sono calibrati.",
      "Le soglie sanitarie e gli standard tecnici sul piombo si sono evoluti dal periodo originario e non vanno importati meccanicamente in un nuovo contesto."
    ],
    unintendedEffects:
      "Possibili costi regressivi per proprietari di immobili di basso valore, aumento dei costi di locazione o temporanea perdita di offerta durante i lavori. Il disegno deve bilanciare enforcement, assistenza tecnica e sostegni alla remediation senza abbassare gli standard sanitari.",
    primarySource: {
      label: "City of Rochester — 2026 Lead Paint Inspection Requirements",
      url: "https://www.cityofrochester.gov/departments/neighborhood-and-business-development/2026-changes-inspection-requirements-lead-paint"
    },
    evaluationStudies: [
      {
        label: "Environmental Health Perspectives / PMC",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3279433",
        citation: "Korfmacher KS, Ayoob M, Morley R (2012), Rochester's Lead Law: Evaluation of a Local Environmental Health Policy Innovation",
        doi: "10.1289/ehp.1103606"
      },
      {
        label: "National Center for Healthy Housing — evaluation summary",
        url: "https://nchh.org/research/eval-of-rochesters-lead-law",
        citation: "Center for Governmental Research / National Center for Healthy Housing, An Evaluation of the City of Rochester's Lead Law: 2006–2008"
      }
    ],
    lastVerifiedAt: "2026-09-11",
    transferabilityItaly:
      "Media per il principio di prevenzione primaria e risk-based inspection, bassa per una replica letterale del regime statunitense. In Italia competenze sanitarie, disciplina delle locazioni e standard edilizi richiedono coordinamento con ASP e normativa nazionale/regionale; il nucleo trasferibile è combinare targeting trasparente, ispezione oggettiva e remediation verificabile prima che emerga un danno sanitario.",
    lameziaAdaptation:
      "Prima di ipotizzare un regime sul piombo, verificare se esista localmente un rischio materiale documentato. Più in generale, usare il modello per un audit degli hazard abitativi di competenza comunale: censire età e stato degli immobili pubblici o delle situazioni note ai servizi, definire pochi indicatori sanitari/ambientali misurabili con ASP, scegliere criteri di priorità trasparenti e testare una ispezione proattiva con follow-up di remediation. Non creare registri sanitari personali nel database civico.",
    implementability: "strutturale",
    capacityDataNeeds: ["inventario edifici e anno di costruzione", "quadro normativo e competenze ispettive", "protocollo Comune-ASP", "laboratorio/test ambientali", "dati sanitari aggregati", "procedura di remediation e reinspezione", "analisi distributiva"],
    tags: ["piombo", "housing", "ispezioni proattive", "salute ambientale", "dust wipe", "Rochester", "before-after"],
    revisionHistory: [{ date: "2026-09-11", note: "Prima verifica e inserimento; la riduzione dei blood lead levels è registrata come andamento osservazionale e non come effetto causale della legge, mentre il contributo del dust-wipe testing alla rilevazione degli hazard è mantenuto separato." }]
  }
] as const satisfies readonly EvidenceIntervention[];
