import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_20 = [
  {
    id: "halifax-clear-bag-waste-policy",
    title: "Sacchi trasparenti per i rifiuti residui e separazione alla fonte",
    authority: "Halifax Regional Municipality — Solid Waste Resources",
    territory: "Halifax Regional Municipality, Nova Scotia",
    country: "Canada",
    implementationYear: "2015 (raccolta residenziale); estensione ai condomini dal 2021",
    problem:
      "Elevato conferimento di rifiuto residuo e presenza di materiali riciclabili o organici nel garbage stream, con costi di smaltimento e perdita di materiale recuperabile.",
    measure:
      "Modifica del sistema di raccolta porta a porta che, dal 1° agosto 2015, richiede sacchi trasparenti per il rifiuto residuo residenziale, consentendo un sacco opaco di privacy e mantenendo raccolte separate per riciclo e organico. La trasparenza rende visibili gli errori di conferimento e consente agli addetti di rifiutare o segnalare sacchi non conformi; il Comune accompagnò la misura con comunicazione pubblica e altre modifiche di sorting/collection.",
    mechanism:
      "Aumentare salienza e verificabilità della separazione alla fonte: l'utente sa che il contenuto del rifiuto residuo è osservabile, mentre l'operatore può identificare contaminazione e non conformità. Il meccanismo combina quindi nudge, regola di conferimento ed enforcement leggero.",
    population:
      "Utenze residenziali servite dalla raccolta municipale di Halifax; la valutazione usa l'universo dei dati amministrativi sui flussi di rifiuto nel periodo attorno all'introduzione della policy.",
    primaryArea: "rifiuti_pulizia_urbana",
    secondaryAreas: ["ambiente_clima_energia", "capacita_amministrativa_personale"],
    interventionTypes: ["regolazione", "nudging_comunicazione", "enforcement_controllo", "informazione_trasparenza"],
    tools: [
      "sacchi trasparenti per il residuo",
      "un sacco opaco di privacy per nucleo",
      "regole di sorting alla fonte",
      "controllo visivo al conferimento",
      "campagna informativa",
      "dati amministrativi di tonnellaggio",
    ],
    territorialScale: "Regione municipale / raccolta residenziale",
    interventionStatus:
      "La regola dei sacchi trasparenti resta parte del sistema di raccolta residenziale di Halifax. La documentazione municipale 2024 attribuisce all'introduzione del 2015 circa il 25% di riduzione del garbage tonnage residenziale e registra una riduzione di circa il 17% dopo l'estensione ai condomini nel 2021; questi dati amministrativi sono corroborativi e non sostituiscono la stima causale dello studio.",
    evaluationMethod:
      "Regression discontinuity / interrupted discontinuity sul punto di introduzione della Clear Bag Policy, usando dati amministrativi universali sui flussi di municipal solid waste. Lo studio peer-reviewed analizza agosto 2015–luglio 2017 e confronta il comportamento dei flussi immediatamente prima e dopo il cambiamento di policy, con specifiche di robustezza e analisi di eterogeneità territoriale.",
    comparator:
      "Traiettoria dei flussi di rifiuto residenziale prima dell'entrata in vigore della policy, identificata attorno alla discontinuità temporale; la documentazione comunale confronta inoltre i tonnellaggi anno-su-anno come verifica descrittiva.",
    outcomes: [
      "rifiuto residuo conferito",
      "riciclaggio",
      "municipal solid waste totale",
      "tonnellaggio destinato a discarica",
      "eterogeneità della risposta fra quartieri",
    ],
    results:
      "Lo studio trova un aumento del riciclaggio e una riduzione sia del rifiuto residuo sia del municipal solid waste totale dopo l'introduzione della policy. La documentazione di Halifax mostra un calo immediato del garbage tonnage e conferma che il sistema è rimasto operativo negli anni successivi.",
    effectSize:
      "Studio peer-reviewed: riciclaggio +15% e municipal solid waste totale −27% nel periodo agosto 2015–luglio 2017. Report municipale sui primi due mesi: garbage residenziale 10.356→7.108 tonnellate rispetto agli stessi mesi dell'anno precedente (−31,4%) e riciclaggio +19,4%. Report municipale 2024: circa −25% del garbage tonnage residenziale attribuito all'introduzione dei sacchi trasparenti nel 2015; estensione ai condomini nel 2021 circa −17% del garbage stream.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede modifica regolamentare/contrattuale delle modalità di conferimento, disponibilità di sacchi conformi, comunicazione capillare, istruzioni agli addetti, gestione dei rifiuti non conformi e monitoraggio dei flussi. Il costo unitario del contenitore è in gran parte sostenuto dagli utenti, ma l'implementazione richiede capacità di enforcement e customer service. Va prevista una soluzione di privacy e accessibilità.",
    limitations: [
      "La discontinuità temporale non equivale a randomizzazione individuale: altri cambiamenti coincidenti nella gestione dei rifiuti possono contribuire agli effetti osservati.",
      "Nel 2015 Halifax introdusse anche altre modifiche di sorting/collection; non tutto il cambiamento può essere attribuito con certezza al solo materiale trasparente del sacco.",
      "La misura può incentivare conferimenti impropri, illegal dumping o spostamento verso canali non osservati; questi outcome devono essere monitorati direttamente.",
      "Gli effetti dipendono dalla qualità delle alternative di riciclo e organico: rendere visibile il residuo senza offrire canali semplici di separazione può produrre costi o resistenze senza beneficio equivalente.",
    ],
    unintendedEffects:
      "Possibili problemi di privacy, non-raccolta di sacchi non conformi, illegal dumping o trasferimento del rifiuto verso altri canali. Halifax consente un sacco opaco di privacy, un dettaglio operativo rilevante per la trasferibilità.",
    primarySource: {
      label: "Halifax Regional Municipality — Garbage collection / By-law S-600",
      url: "https://www.halifax.ca/home-property/garbage-recycling-green-cart/garbage-collection",
    },
    evaluationStudies: [
      {
        label: "Journal of Environmental Economics and Management — Clear Bag Policy",
        url: "https://doi.org/10.1016/j.jeem.2020.102404",
        citation: "Akbulut-Yuksel M, Boulatoff C (2021), The effects of a green nudge on municipal solid waste: Evidence from a clear bag policy, Journal of Environmental Economics and Management 106, 102404",
        doi: "10.1016/j.jeem.2020.102404",
      },
      {
        label: "Halifax Regional Council — Changes at the Curb: Impact on Waste Tonnages",
        url: "https://legacycontent.halifax.ca/council/agendasc/documents/151027cai04.pdf",
        citation: "Halifax Regional Municipality (2015), Changes at the Curb – Impact on Waste Tonnages",
      },
    ],
    lastVerifiedAt: "2026-09-20",
    transferabilityItaly:
      "Il principio è trasferibile ai comuni italiani solo in coordinamento con gestore e disciplina locale del servizio rifiuti. È particolarmente rilevante dove esistono già raccolta differenziata porta a porta, tariffazione/rilevazione per utenza e frequenti errori di separazione. Prima di adottarlo vanno verificati compatibilità con capitolato, regolamento comunale, privacy, accessibilità e costi distributivi.",
    lameziaAdaptation:
      "Prima fase: usare dati Lamezia/gestore per individuare frazioni o zone con elevata contaminazione del residuo. Se il problema è reale, sperimentare su aree comparabili un protocollo con sacco trasparente o altro contenitore ispezionabile, un'opzione di privacy, comunicazione standardizzata e identiche frequenze di raccolta. Misurare kg di residuo per utenza/area, qualità delle frazioni differenziate, rifiuti non raccolti, segnalazioni e illegal dumping, evitando di giudicare il successo soltanto dalla diminuzione del residuo.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "tonnellaggi per frazione e area con serie pre-intervento",
      "analisi merceologica del residuo",
      "dati su non conformità e rifiuti non raccolti",
      "segnalazioni di abbandono e illegal dumping",
      "coordinamento contrattuale con il gestore",
      "protocollo privacy/accessibilità",
      "disegno di rollout o comparatore territoriale",
    ],
    tags: ["Halifax", "clear bag", "rifiuti", "riciclaggio", "regression discontinuity", "sorting", "waste diversion"],
    revisionHistory: [
      {
        date: "2026-09-20",
        note: "Prima verifica e inserimento; separata la stima causale peer-reviewed dalle riduzioni descrittive riportate nei documenti municipali e segnalate le modifiche concorrenti del sistema di raccolta.",
      },
    ],
  },
  {
    id: "denver-star-alternative-crisis-response",
    title: "STAR: risposta civile alle crisi comportamentali a basso rischio in alternativa alla risposta di polizia",
    authority: "City and County of Denver — Department of Public Health & Environment / Denver 9-1-1",
    territory: "Denver, Colorado",
    country: "Stati Uniti",
    implementationYear: "2020–oggi",
    problem:
      "Chiamate di emergenza a basso rischio collegate a salute mentale, uso di sostanze, homelessness o bisogni sociali che tradizionalmente ricevevano una risposta di polizia anche quando la necessità primaria era sanitaria o sociale.",
    measure:
      "Support Team Assisted Response (STAR): squadre civili con professionista di salute comportamentale e paramedico/EMT rispondono a chiamate 9-1-1 selezionate come non violente e a basso rischio, senza arma o significativo pericolo di sicurezza, fornendo valutazione clinica, de-escalation, referral e collegamento a servizi.",
    mechanism:
      "Allineare il tipo di responder al bisogno reale, evitando l'ingresso non necessario nel sistema penale, migliorando la presa in carico clinico-sociale e liberando capacità di polizia per eventi che richiedono funzioni coercitive o di sicurezza.",
    population:
      "Persone coinvolte in chiamate STAR-eligible a Denver. Nella valutazione 2026: 4.167 primi incontri clinici STAR tra giugno 2020 e luglio 2024, confrontati con 87.826 field interviews di polizia con nature codes simili e nessun precedente incontro STAR.",
    primaryArea: "sicurezza_urbana_prevenzione",
    secondaryAreas: ["salute_pubblica_locale", "welfare_inclusione_servizi_sociali", "capacita_amministrativa_personale"],
    interventionTypes: ["servizio_diretto", "modifica_organizzativa_processo", "partnership_pubblico_privato_terzo_settore", "targeting_data_analytics"],
    tools: [
      "triage 9-1-1 per chiamate eleggibili",
      "team paramedico/EMT + behavioral health clinician",
      "de-escalation e valutazione clinica",
      "referral a servizi sociali e sanitari",
      "Community Partner Network",
      "monitoraggio amministrativo degli esiti",
    ],
    territorialScale: "Città / sistema di risposta alle emergenze",
    interventionStatus:
      "Programma istituzionalizzato da Denver. La pagina ufficiale del Comune nel 2026 descrive STAR come risposta civile alle chiamate a basso rischio; indicava un livello di servizio ridotto fino ad agosto 2026. Il record non presume quale sia l'esatto livello operativo successivo senza un aggiornamento amministrativo più recente.",
    evaluationMethod:
      "Valutazione quasi-sperimentale 2026 basata su propensity score matching e regressioni aggiustate. Il gruppo STAR comprende il primo incontro clinico STAR di ciascuna persona; il comparatore è composto da field interviews di polizia con codici di chiamata simili. I modelli controllano età, razza/etnia, motivo dell'incontro, precedente homelessness e livello pre-intervento dell'outcome. Non è una randomizzazione e rimane possibile confondimento non osservato.",
    comparator:
      "Persone con una field interview di polizia per nature codes simili a quelli STAR-eligible, mai precedentemente incontrate da STAR, abbinate tramite propensity score matching.",
    outcomes: [
      "qualsiasi contatto con la polizia nel successivo anno",
      "qualsiasi arresto nel successivo anno",
      "booking nel successivo anno",
      "numero di contatti di polizia",
      "numero di arresti",
      "successivi incontri STAR",
      "costi e capacità del programma",
    ],
    results:
      "Nel successivo anno, le persone con un incontro STAR mostrano una probabilità aggiustata inferiore di qualsiasi contatto di polizia e di qualsiasi arresto rispetto al gruppo matched con risposta di polizia. Non emerge invece una riduzione della probabilità di booking né un effetto statisticamente significativo sul numero totale di arresti. L'effetto sui contatti di polizia è più marcato tra persone con storia di homelessness.",
    effectSize:
      "Qualsiasi contatto di polizia: 50% nel comparatore vs 42% STAR (−8 punti percentuali; circa −16% relativo; p<0,001). Qualsiasi arresto: 18% vs 15% (differenza regressiva riportata −0,02; circa −16% relativo; p<0,05). Qualsiasi booking: 15% vs 15%, nessun effetto. Numero medio di contatti di polizia: 1,62 vs 1,46 (−0,16; p<0,05). Tra persone con storia di homelessness: 3,28 vs 2,84 contatti (−0,44; p<0,001).",
    evidenceStrength: "moderata",
    costsRequirements:
      "Il report 2026 stima per il 2023 circa 2,49 milioni di dollari per i van team inclusi circa 542 mila dollari di costi di capitale e circa 1,92 milioni per il Community Partner Network; i costi esclusi capitale sono circa 3,86 milioni complessivi. Una stima semplice è circa 237 dollari per risposta van nel 2023 e circa 470 dollari includendo follow-up medio, ma il report stesso segnala che sono approssimazioni e non una cost-effectiveness analysis completa.",
    limitations: [
      "Il disegno è propensity-score matched, non randomizzato: differenze non osservate fra persone indirizzate a STAR e persone incontrate dalla polizia possono spiegare parte dell'associazione.",
      "Le chiamate eleggibili sono per definizione a basso rischio e non violente; i risultati non sono trasferibili a eventi con armi, violenza o elevato pericolo.",
      "La probabilità di booking e il numero totale di arresti non mostrano effetti convincenti; non va presentato come riduzione generalizzata di ogni outcome penale.",
      "I costi per risposta sono stime amministrative semplici e non incorporano in modo completo tutti i costi in-kind o tutti i benefici evitati.",
      "Il sistema statunitense 9-1-1 e le competenze di polizia/sanità non sono direttamente equivalenti all'assetto italiano.",
    ],
    unintendedEffects:
      "Rischio di under-triage o ritardo se una chiamata apparentemente a basso rischio evolve in evento violento; rischio opposto di sovra-esclusione dal programma se i criteri sono troppo cautelativi. Servono protocolli chiari di escalation, audit degli incidenti e monitoraggio di equità nell'accesso.",
    primarySource: {
      label: "City and County of Denver — Support Team Assisted Response (STAR)",
      url: "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Public-Health-Environment/Community-Behavioral-Health/Behavioral-Health-Support/Behavioral-Health-Outreach/Support-Team-Assisted-Response-STAR-Program",
    },
    evaluationStudies: [
      {
        label: "Urban Institute — Aligning Crisis Response with Community Needs",
        url: "https://www.urban.org/research/publication/aligning-crisis-response-community-needs",
        citation: "Gillespie S, Curran-Groome W, Chen B, Hanson D (2026), Aligning Crisis Response with Community Needs: Evidence from Denver's Support Team Assisted Response (STAR) and Co-Responder Programs, Urban Institute",
      },
    ],
    lastVerifiedAt: "2026-09-20",
    transferabilityItaly:
      "Il meccanismo è trasferibile come protocollo interistituzionale di triage e risposta socio-sanitaria, non come sostituzione unilaterale della polizia da parte del Comune. In Italia vanno rispettate le competenze di 112/118, forze di polizia, ASP/CSM/SerD, servizi sociali e polizia locale. È più realistico partire da una classe molto circoscritta di richieste non violente e non urgenti che oggi rimbalzano tra più servizi.",
    lameziaAdaptation:
      "Mappare per 6–12 mesi chiamate/richieste ripetute collegate a crisi sociali o comportamentali a basso rischio usando solo dati aggregati e governance interistituzionale. Con ASP/CSM/SerD, servizi sociali, Prefettura e centrali operative, definire una tassonomia di eleggibilità, escalation immediata se emerge rischio e un team/mobile pathway sanitario-sociale. Valutare con rollout controllato tempi di risposta, successivi contatti con servizi e forze dell'ordine, accessi in emergenza, referral completati, incidenti di sicurezza e costo per caso.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "accordo interistituzionale su competenze ed escalation",
      "classificazione standardizzata delle richieste a basso rischio",
      "operatori socio-sanitari mobili o reperibili",
      "linkage protetto fra dati di servizio",
      "indicatori su arresti/contatti, accessi sanitari e referral",
      "audit di sicurezza ed equità",
      "valutazione quasi-sperimentale o rollout per fasi",
    ],
    tags: ["Denver", "STAR", "crisis response", "salute mentale", "911", "propensity score matching", "de-escalation"],
    revisionHistory: [
      {
        date: "2026-09-20",
        note: "Prima verifica e inserimento sulla base della valutazione Urban Institute 2026; classificata evidenza moderata per il rischio di confondimento residuo e mantenuti esplicitamente gli outcome nulli su booking e conteggio degli arresti.",
      },
    ],
  },
  {
    id: "philadelphia-abandoned-housing-remediation-rct",
    title: "Messa in sicurezza leggera degli edifici abbandonati con porte e finestre funzionanti",
    authority: "City of Philadelphia — Department of Licenses and Inspections / Philadelphia Redevelopment Authority",
    territory: "Philadelphia, Pennsylvania",
    country: "Stati Uniti",
    implementationYear: "2011 (rafforzamento ordinanza); 2018–2019 (trial)",
    problem:
      "Edifici residenziali abbandonati con aperture sbarrate o degradate, facciate deteriorate e rifiuti, concentrati in quartieri a basso reddito e associati a disordine fisico e rischio di violenza armata.",
    measure:
      "Applicazione/sperimentazione della Doors and Windows Ordinance attraverso un remediation package a basso costo: installazione di porte e finestre funzionanti sulle aperture frontali e laterali, riparazione di elementi deteriorati della facciata, rimozione di rifiuti e vegetazione e manutenzione periodica. Un secondo braccio riceveva solo pulizia di rifiuti/vegetazione; il controllo non riceveva intervento.",
    mechanism:
      "Ridurre accessibilità e uso illecito degli edifici abbandonati, ripristinare segnali visibili di proprietà/manutenzione e aumentare la sorvegliabilità dello spazio senza demolizione o ricostruzione completa.",
    population:
      "Edifici abbandonati che violavano la Doors and Windows Ordinance e residenti delle aree circostanti. Trial: 63 cluster con 258 case; 23 cluster/58 case full remediation, 20/93 trash cleanup, 20/107 controllo.",
    primaryArea: "housing_politiche_abitative",
    secondaryAreas: ["sicurezza_urbana_prevenzione", "urbanistica_rigenerazione"],
    interventionTypes: ["regolazione", "enforcement_controllo", "infrastruttura_fisica", "servizio_diretto"],
    tools: [
      "Doors and Windows Ordinance",
      "ispezioni e notice of violation",
      "porte e finestre funzionanti",
      "riparazione leggera della facciata",
      "pulizia rifiuti e diserbo",
      "manutenzione periodica",
      "dati georeferenziati di polizia",
    ],
    territorialScale: "Città / cluster di edifici abbandonati",
    interventionStatus:
      "Il trial è concluso. Philadelphia continua a imporre requisiti di manutenzione, chiusura e sicurezza delle aperture degli edifici vacanti attraverso il Property Maintenance Code e l'enforcement di L&I. Il record riguarda l'evidenza causale sul remediation package, non afferma che il trial sia un programma cittadino permanente nella stessa forma.",
    evaluationMethod:
      "Cluster randomized controlled trial cittadino. Da 3.265 case eleggibili furono formati 63 cluster e assegnati casualmente a full remediation, trash cleanup o no-intervention control. Gli outcome mensili furono analizzati con difference-in-differences mixed-effects per 18 mesi pre e 18 mesi post. Il trial include controlli di parallel trend e analisi di displacement.",
    comparator:
      "Cluster di edifici abbandonati assegnati casualmente al no-intervention control; secondo braccio attivo con sola rimozione di rifiuti e vegetazione per distinguere la componente strutturale dalla semplice pulizia.",
    outcomes: [
      "weapons violations",
      "gun assaults",
      "shootings",
      "reati/episodi legati a sostanze",
      "public drunkenness",
      "percezione di sicurezza",
      "tempo trascorso all'aperto",
      "displacement della violenza",
    ],
    results:
      "Il full remediation package mostra riduzioni relative di weapons violations e gun assaults rispetto al controllo nella specificazione primaria; la riduzione degli shootings non è statisticamente significativa. Il solo trash cleanup non produce effetti convincenti sugli outcome di violenza. Non emergono effetti affidabili su sostanze, ubriachezza pubblica, percezione di sicurezza o tempo all'aperto, né evidenza di displacement della violenza.",
    effectSize:
      "Specificazione primaria: weapons violations −8,43% (IC95% −14,68% a −1,19%; p=0,02), gun assaults −13,12% (IC95% −21,32% a −3,01%; p=0,01), shootings −6,96% (IC95% −15,32% a 3,03%; p=0,17, non significativo). Dopo correzione per test multipli i q-value dei due primi outcome sono 0,35; nella specificazione trend-adjusted gli effetti su weapons violations e gun assaults non restano statisticamente significativi. Queste sensibilità impediscono di trattare le stime come definitive nonostante il disegno randomizzato.",
    evidenceStrength: "forte",
    costsRequirements:
      "Intervento fisico leggero ma richiede inventario affidabile degli immobili abbandonati, accertamento della proprietà, potere di ordinanza/abatement, accesso legale, fornitori per serramenti e manutenzione e follow-up. Nel trial alcune finestre/porte furono rubate e dovettero essere reinstallate, mostrando la necessità di prevedere manutenzione e vandalismo nei costi.",
    limitations: [
      "Pur essendo un cluster RCT, i cluster differivano in almeno una caratteristica basale e alcuni pre-trend, con possibile instabilità delle stime.",
      "Gli effetti principali su weapons violations e gun assaults non sopravvivono alla correzione per test multipli riportata dagli autori (q=0,35) e perdono significatività nella specificazione trend-adjusted.",
      "La riduzione degli shootings non è statisticamente significativa; non va descritta come effetto causale certo.",
      "La sola pulizia di rifiuti/vegetazione non mostra un beneficio convincente: il meccanismo sembra richiedere la componente strutturale di messa in sicurezza.",
      "Il contesto di violenza armata e proprietà vacanti di Philadelphia differisce materialmente da quello italiano e limita la trasferibilità delle magnitudini.",
    ],
    unintendedEffects:
      "Possibili furti/vandalismo dei nuovi serramenti, costi ricorrenti di manutenzione e rischio di interventi su immobili privati senza un percorso giuridico sufficientemente chiaro. Il trial non rileva displacement significativo della violenza nelle aree immediatamente circostanti.",
    primarySource: {
      label: "City of Philadelphia — L&I: code violations for vacant properties and doors/windows",
      url: "https://www.phila.gov/departments/department-of-licenses-and-inspections/resolve-a-code-violation-at-your-property/",
    },
    evaluationStudies: [
      {
        label: "JAMA Internal Medicine — citywide cluster randomized trial",
        url: "https://doi.org/10.1001/jamainternmed.2022.5460",
        citation: "South EC, MacDonald JM, Tam VW, Ridgeway G, Branas CC (2023), Effect of Abandoned Housing Interventions on Gun Violence, Perceptions of Safety, and Substance Use in Black Neighborhoods: A Citywide Cluster Randomized Trial, JAMA Internal Medicine 183(1):31–39",
        doi: "10.1001/jamainternmed.2022.5460",
      },
    ],
    lastVerifiedAt: "2026-09-20",
    transferabilityItaly:
      "Il principio è trasferibile come enforcement graduato su immobili realmente abbandonati e pericolosi, ma la base giuridica italiana per ordinanze, accesso, intervento sostitutivo, recupero costi e tutela della proprietà va verificata caso per caso. Non è necessario importare la logica anti-gun violence: gli outcome locali possono essere sicurezza, intrusioni, incendi, degrado, segnalazioni e valore d'uso dello spazio.",
    lameziaAdaptation:
      "Costruire prima un inventario verificato degli immobili abbandonati distinguendo proprietà pubblica/privata, rischio strutturale, aperture accessibili, rifiuti, incendi/intrusioni e procedimenti già aperti. Su immobili pubblici o su casi con chiara base di intervento, sperimentare un pacchetto minimo standardizzato di chiusura con porte/finestre, pulizia e manutenzione, introducendo il rollout per priorità di rischio. Confrontare con immobili equivalenti non ancora trattati e misurare intrusioni, incendi, interventi di polizia/vigili del fuoco, segnalazioni, riaperture abusive e costi di manutenzione.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "censimento georeferenziato degli immobili abbandonati",
      "titolarità e stato dei procedimenti",
      "classificazione di rischio strutturale e accessibilità",
      "segnalazioni, incendi, intrusioni e interventi di emergenza aggregati",
      "costi standard di remediation e manutenzione",
      "protocollo legale per intervento sostitutivo e recupero costi",
      "disegno di rollout con comparatori",
    ],
    tags: ["Philadelphia", "abandoned housing", "Doors and Windows", "cluster RCT", "blight remediation", "sicurezza urbana", "housing"],
    revisionHistory: [
      {
        date: "2026-09-20",
        note: "Prima verifica e inserimento; distinto esplicitamente dal caso dei vacant lots già in archivio e ridimensionata la forza dell'evidenza per i q-value da multiple testing e la perdita di significatività nelle specificazioni trend-adjusted.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
