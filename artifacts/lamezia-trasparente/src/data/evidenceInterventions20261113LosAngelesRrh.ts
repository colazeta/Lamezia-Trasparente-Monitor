import type { EvidenceIntervention } from "./evidenceInterventions";

/** Fonti originali LAHSA, California Policy Lab e Journal of Urban Economics verificate 2026-11-13. */
export const EVIDENCE_INTERVENTIONS_2026_11_13_LOS_ANGELES_RRH: readonly EvidenceIntervention[] = [
{
  "id": "los-angeles-county-rapid-rehousing-time-limited-subsidies-2019",
  "title": "Los Angeles County: contributi temporanei all'affitto e accesso a un'abitazione per persone senza dimora",
  "authority": "Los Angeles Homeless Services Authority (LAHSA) e programmi locali di Rapid Re-Housing / Time-Limited Subsidy, con agenzie della contea e fornitori convenzionati",
  "territory": "Los Angeles County, California",
  "country": "Stati Uniti",
  "implementationYear": "Programma operativo almeno nel 2016–2019; coorte amministrativa studiata: iscrizioni nel 2019, follow-up per quattro anni",
  "problem": "Persone singole e famiglie già senza dimora non riuscivano ad accedere al mercato privato dell'affitto; le misure permanenti erano insufficienti e gli aiuti di durata limitata avevano evidenza empirica incerta sulla stabilità successiva.",
  "measure": "Assistenza per individuare un alloggio sul mercato, contributi temporanei per il canone e servizi di sostegno: i partecipanti al Rapid Re-Housing potevano ottenere un contratto di locazione e ricevere sussidi per un periodo delimitato. Lo studio confronta chi, pur essendosi iscritto al programma, è riuscito a prendere in locazione un alloggio con aiuto economico (lease-up) e chi non ci è riuscito.",
  "mechanism": "Rimuovere vincoli di liquidità e d'accesso iniziale all'alloggio, sostenendo stabilità abitativa durante la transizione; possibile miglioramento nel lungo periodo per le famiglie tramite continuità abitativa e accesso a benefici, servizi e opportunità.",
  "population": "3.620 iscrizioni al programma RRH del 2019 nella contea, con persone singole e famiglie; circa il 63% dei partecipanti ha effettivamente ottenuto un alloggio con il contributo; comparazione tra gruppi di utenza e stessi fornitori/mese.",
  "primaryArea": "housing_politiche_abitative",
  "secondaryAreas": [
    "welfare_inclusione_servizi_sociali",
    "salute_pubblica_locale",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "incentivo_economico",
    "servizio_diretto",
    "partnership_pubblico_privato_terzo_settore",
    "modifica_organizzativa_processo",
    "targeting_data_analytics"
  ],
  "tools": [
    "sussidio temporaneo al canone sul mercato privato",
    "supporto alla ricerca di alloggi e rapporti con proprietari",
    "case management e servizi accessori",
    "sistema amministrativo Homeless Management Information System (HMIS)",
    "integrazione protetta di archivi relativi a welfare, salute, giustizia e lavoro per la valutazione"
  ],
  "territorialScale": "Contea/area metropolitana; interventi su singoli e nuclei familiari",
  "interventionStatus": "Programma storicamente attuato; la pagina LAHSA aggiornata il 23 marzo 2026 descrive TLS (ex RRH) ma segnala una sospensione delle nuove iscrizioni ai programmi TLS Adults e Family per l'anno fiscale 2025–26. Nessuna inferenza sulla riapertura successiva.",
  "evaluationMethod": "Valutazione quasi-sperimentale osservazionale, pubblicata peer-reviewed nel 2026, su dati amministrativi longitudinali di 3.620 iscrizioni del 2019 con confronto di persone che hanno ottenuto un alloggio (lease-up) e non; effetti fissi per progetto del fornitore × mese di iscrizione, segmenti di servizio, oltre 30 covariate pre-trattamento e regressioni aggiustate; verifiche di bilanciamento e sensitivity/bounds. NON è un RCT e il trattamento non è assegnato casualmente. Le analisi IV con assegnazione quasi-casuale ai caseworker sono solo un bound superiore perché l'exclusion restriction non è credibile.",
  "comparator": "Iscritti allo stesso programma RRH dello stesso fornitore nello stesso mese che NON riuscirono a ottenere un contratto di locazione con il sussidio, aggiustando per caratteristiche osservabili (incluse storie di utilizzo dei servizi), tipologia di nucleo e altri fattori; non gruppo assegnato random.",
  "outcomes": [
    "nuove iscrizioni in ricoveri temporanei o servizi di outreach che indicano ritorno a homelessness entro 4 anni",
    "instabilità abitativa in dati amministrativi su benefici sociali",
    "persistenza degli effetti dopo fine del contributo per singoli e famiglie",
    "uso di pronto soccorso e servizi psichiatrici d'emergenza",
    "interazioni con giustizia penale",
    "benefici pubblici, occupazione e reddito da lavoro"
  ],
  "results": "Il confronto aggiustato associa l'effettivo lease-up con una riduzione, entro quattro anni, di nuove iscrizioni ai servizi per homelessness del 30% per singoli e 25% per famiglie. L'effetto sulle famiglie permane oltre la scadenza del sussidio; per i singoli si attenua fino a non essere evidente al terzo anno dopo l'iscrizione. Nei dati sui benefici l'instabilità abitativa stimata diminuisce del 13% per singoli e 12% per famiglie. Miglioramenti negli esiti sanitari e giudiziari sono individuati soprattutto nelle famiglie; non si osserva riduzione significativa di occupazione o guadagni. I risultati sono compatibili con un effetto positivo, ma restano sensibili alla selezione non osservata tra partecipanti che trovano e non trovano casa.",
  "effectSize": "Nuovo utilizzo di servizi per homelessness nel quadriennio: singoli −11,8 punti percentuali rispetto a 39,6% dei comparatori (≈−30% relativo); famiglie −12,1 punti percentuali (≈−25% relativo). Misure complementari da archivi welfare: instabilità abitativa −13% singoli/−12% famiglie. Sussidio medio per chi riesce a prendere in affitto: circa USD 1.500 al mese per 7 mesi, con maggiore generosità media per famiglie. Bound di sensibilità negli anni successivi all'iscrizione: stima conservativa −2,8 p.p. rispetto a −5,4 p.p. nella specificazione centrale per quello stesso intervallo; IV caseworker ~−20 p.p. è un possibile limite superiore, non stima causale principale.",
  "evidenceStrength": "moderata",
  "costsRequirements": "Per chi ottiene alloggio, sussidio medio di circa 1.500 USD/mese per sette mesi; la spesa pubblica effettiva include anche case management, housing navigation e amministrazione, non quantificati come costo pieno nel risultato sintetico. Richiede budget stabile, enti erogatori, rete proprietari, criteri di eleggibilità, monitoraggio e disponibilità abitativa; non emerge una valutazione di saldo fiscale netto automaticamente esportabile.",
  "limitations": [
    "Il confronto tra chi trova una locazione e chi non ci riesce NON è randomizzato: affidabilità creditizia, storie di sfratto, capacità di negoziare, sostegno sociale e altri fattori non osservati possono influenzare entrambi gli esiti.",
    "I fixed effects fornitore×mese e il bilanciamento su oltre 30 variabili riducono ma non eliminano il confondimento; l'IV basato sui caseworker non soddisfa plausibilmente l'exclusion restriction ed è interpretato dagli autori solo come bound.",
    "La misura principale conta l'uso dei servizi locali per homeless, non tutte le situazioni di homelessness; trasferimenti fuori contea e utenza che non accede ai servizi possono sfuggire ai registri.",
    "L'esito durante l'anno di ingresso può essere parzialmente meccanico, perché il gruppo che riesce a locare non ha necessariamente bisogno di successivi rifugi nel periodo iniziale; importante analizzare persistenza post-sussidio.",
    "Gli effetti osservati sulle famiglie sono più persistenti rispetto a quelli sui singoli; differiscono anche gli importi e la durata medi dei sussidi, perciò le differenze non identificano causalmente il ruolo dell'importo.",
    "Coorte 2019 e osservazione successiva includono la pandemia COVID-19 e un mercato immobiliare estremamente costoso, non rappresentativo di un comune italiano.",
    "Contributi a persone già senza dimora non equivalgono a interventi di prevenzione della perdita della casa: distinti dalla precedente scheda Santa Clara County sull'assistenza preventiva a famiglie ancora alloggiate.",
    "Il programma TLS LAHSA nel 2026 segnala sospensione delle nuove iscrizioni per l'anno fiscale 2025–26; non dedurre da questo che nel 2026 fosse pienamente aperto o definitivamente concluso."
  ],
  "unintendedEffects": "Lo studio non documenta un effetto indesiderato quantitativo dominante sugli esiti occupazionali: nessuna evidenza di minore occupazione/reddito da lavoro. Rischi attuativi da monitorare: scarsità e selezione di proprietari disponibili, disparità nell'accesso, perdita dell'abitazione alla fine del sussidio (specie per singoli), gestione riservata dei dati socio-sanitari. Non sono effetti avversi dimostrati dallo studio.",
  "primarySource": {
    "label": "LAHSA — Time-Limited Subsidy (TLS), ex Rapid Re-Housing: programma e stato amministrativo 2026",
    "url": "https://www.lahsa.org/news?article=896-lahsa-time-limited-subsidy-tls-programs"
  },
  "evaluationStudies": [
    {
      "label": "Blackwell & Gross (2026), Journal of Urban Economics 154, articolo peer-reviewed",
      "url": "https://doi.org/10.1016/j.jue.2026.103889",
      "citation": "Blackwell, B., & Gross, M. (2026). Does Rapid Re-Housing reduce homelessness? Journal of Urban Economics, 154, 103889.",
      "doi": "10.1016/j.jue.2026.103889"
    },
    {
      "label": "California Policy Lab — manoscritto integrale 13 luglio 2026, tabelle e metodi",
      "url": "https://capolicylab.org/wp-content/uploads/2026/07/Does-Rapid-Re-Housing-Reduce-Homelessness.pdf",
      "citation": "Blackwell & Gross, Does Rapid Re-Housing Reduce Homelessness?, versione integrale del 13 luglio 2026."
    },
    {
      "label": "California Policy Lab — scheda autori e collegamento alla rivista",
      "url": "https://capolicylab.org/does-rapid-re-housing-reduce-homelessness/",
      "citation": "California Policy Lab (9 luglio 2026), scheda di ricerca e rinvio all'articolo pubblicato."
    }
  ],
  "lastVerifiedAt": "2026-11-13",
  "transferabilityItaly": "Potenzialmente utile come logica di supporto abitativo temporaneo integrato con accompagnamento sociale, NON come replica di un sussidio generalizzato americano. La fattibilità richiede verifica di competenze comunali e di Ambito territoriale sociale, norme abitative, assegnazioni trasparenti, sussidi esistenti e coordinamento regionale. Gli effetti quantitativi su homelessness non possono essere trasferiti direttamente.",
  "lameziaAdaptation": "Con l'Ambito territoriale sociale e gli enti del terzo settore, mappare le situazioni documentate di senza dimora e grave precarietà abitativa, i percorsi di emergenza e le risorse per sostegno all'affitto già disponibili. Progettare, solo se competenze e fondi lo consentono, un piccolo pilot di contributi temporanei versati con tracciabilità ai locatori e accompagnamento sociale/ricerca alloggi, con criteri pubblici di selezione e gestione del rischio di esclusione. Misurare ottenimento del contratto, stabilità a 6/12/24 mesi, perdita dell'alloggio dopo sospensione del contributo, costo per beneficiario stabilmente alloggiato e alternative di presa in carico. Non proporre raccolte massive di dati sanitari o giudiziari: protocollo minimizzato, base giuridica e DPO.",
  "implementability": "strutturale",
  "capacityDataNeeds": [
    "ricognizione dei servizi sociali comunali e dell'Ambito, accordi con terzo settore e uffici abitativi",
    "mappatura dei bisogni tramite soli dati aggregati e legittimamente disponibili",
    "disponibilità effettiva di alloggi e locatori convenzionabili; accessibilità economica dei canoni",
    "fondi e titolo giuridico del contributo, piano per l'uscita e rischio di ricaduta",
    "criteri verificabili e non discriminatori di eleggibilità e selezione con tutele per nuclei vulnerabili",
    "indicatori predefiniti di stabilità abitativa post-intervento e costi integrali",
    "valutazione con comparatore legittimo che non neghi prestazioni dovute; tutela GDPR e verifiche DPO"
  ],
  "tags": [
    "Los Angeles",
    "California",
    "LAHSA",
    "Rapid Re-Housing",
    "Time-Limited Subsidy",
    "housing",
    "senza dimora",
    "affitti",
    "supporto abitativo",
    "quasi-esperimento",
    "confronto aggiustato",
    "follow-up 4 anni",
    "Journal of Urban Economics 2026",
    "effetti differenziati famiglie-singoli",
    "Lamezia Terme"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-13",
      "note": "Nuova scheda dopo discovery obbligatoria con Parallel Search, verifica diretta di fonte LAHSA aggiornata 23/03/2026, manoscritto California Policy Lab 13/07/2026 e pubblicazione peer-reviewed 08/2026 (DOI). Deduplica rispetto a titolo/studio/territorio e PR del repository, distinta esplicitamente da Brno Rapid Re-Housing e Santa Clara homelessness prevention. Evidenza moderata: disegno matched/adjusted NON randomizzato, caveat di confondimento, stime principali e bound distinti, effetti su famiglie vs singoli e stop iscrizioni TLS FY25-26 documentati."
    }
  ]
}
];
