import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_12 = [
  {
    id: "italy-random-municipal-auditor-assignment",
    title: "Sorteggio dei revisori degli enti locali per ridurre conflitti di interesse e rafforzare la disciplina fiscale",
    authority: "Comuni italiani / Ministero dell'Interno — Finanza locale",
    territory: "Italia",
    country: "Italia",
    implementationYear: "Riforma approvata nel 2011; nuovo sistema operativo dal 10 dicembre 2012",
    problem:
      "Quando il vertice politico locale sceglie direttamente il revisore che controlla il bilancio dell'ente, relazioni pregresse e dipendenza dalla nomina possono indebolire l'indipendenza del monitoraggio finanziario e la capacità di correggere tempestivamente squilibri di bilancio.",
    measure:
      "La riforma ha sostituito la scelta discrezionale dei revisori da parte degli organi locali con un'estrazione casuale da un elenco regionale di professionisti qualificati gestito nell'ambito della finanza locale del Ministero dell'Interno. L'estrazione si applica ai rinnovi dell'organo di revisione e mantiene requisiti di esperienza differenziati per fascia demografica dell'ente.",
    mechanism:
      "Separare il revisore dal decisore politico locale riduce legami personali e aspettative di riconferma, aumentando l'indipendenza del controllo. Un revisore meno dipendente dal sindaco o dalla maggioranza può esercitare più efficacemente verifiche preventive e successive, segnalare squilibri e spingere l'ente verso comportamenti fiscali coerenti con le regole nazionali.",
    population:
      "Comuni italiani soggetti al rinnovo dell'organo di revisione dopo l'entrata in vigore del nuovo sistema; la valutazione sfrutta il passaggio scaglionato al revisore estratto casualmente.",
    primaryArea: "capacita_amministrativa_personale",
    secondaryAreas: ["trasparenza_integrita_anticorruzione", "fiscalita_entrate_riscossione"],
    interventionTypes: ["modifica_organizzativa_processo", "enforcement_controllo"],
    tools: ["elenco regionale dei revisori", "estrazione casuale", "requisiti per fascia demografica", "controllo contabile indipendente", "monitoraggio del bilancio"],
    territorialScale: "Comune / ente locale",
    interventionStatus:
      "Sistema strutturale tuttora operativo: il Ministero dell'Interno pubblica l'elenco dei revisori e i sorteggi effettuati presso le Prefetture-UTG, consultabili a partire dal 10 dicembre 2012.",
    evaluationMethod:
      "Generalized difference-in-differences che sfrutta l'introduzione scaglionata del nuovo sistema in funzione delle date di rinnovo dell'organo di revisione. I comuni che ricevono prima un revisore estratto sono confrontati con comuni che lo riceveranno successivamente, prima e dopo l'arrivo del revisore randomizzato. La riforma modifica direttamente il meccanismo di matching revisore-ente e consente di testare anche la rottura dei legami pregressi revisore-sindaco.",
    comparator:
      "Comuni che, nello stesso periodo, non avevano ancora rinnovato l'organo di revisione e continuavano temporaneamente con il sistema precedente, usati come controlli non ancora trattati.",
    outcomes: ["avanzo netto di bilancio", "rimborso del debito", "capacità tributaria", "entrate e spese aggregate", "legami pregressi revisore-sindaco"],
    results:
      "La revisione NBER più recente, aggiornata nell'aprile 2026, conclude che il matching casuale interrompe i legami revisore-sindaco e che i comuni trattati migliorano in modo significativo e persistente avanzo netto e rimborso del debito. Il miglioramento fiscale deriva soprattutto da un aumento della capacità tributaria, non da un taglio generalizzato della spesa. Il record tratta questi risultati come evidenza sul disegno istituzionale dell'oversight, non come prova che ogni forma di randomizzazione degli incarichi produca automaticamente gli stessi effetti.",
    effectSize:
      "La versione NBER corrente verificata nell'aprile 2026 conferma effetti significativi e persistenti su avanzo netto, rimborso del debito e capacità tributaria. Versioni pubbliche precedenti dello stesso studio quantificavano gli aumenti di avanzo netto e rimborso del debito nell'ordine dell'8–9% e circa 16 euro pro capite di avanzo netto aggiuntivo; questi valori sono mantenuti come ordine di grandezza storico e non come trascrizione puntuale della revisione 2026.",
    evidenceStrength: "forte",
    costsRequirements:
      "Il sistema richiede un elenco professionale aggiornato, requisiti verificabili, procedure di sorteggio tracciabili, gestione delle incompatibilità e capacità dell'ente di fornire tempestivamente documentazione contabile al revisore. Per un singolo Comune il costo diretto della randomizzazione è limitato, ma il modello dipende da una cornice nazionale che assicuri qualità e indipendenza della platea dei revisori.",
    limitations: [
      "La riforma è nazionale e il singolo Comune non può scegliere autonomamente di sostituire il sistema legale di nomina dei revisori con un meccanismo diverso.",
      "L'identificazione sfrutta il rinnovo scaglionato degli organi e richiede che i comuni trattati prima e quelli trattati dopo avrebbero seguito traiettorie comparabili in assenza della riforma.",
      "Lo studio più recente resta un NBER working paper, sebbene aggiornato nell'aprile 2026; il record evita di presentarlo come evidenza peer-reviewed definitiva.",
      "Gli ordini di grandezza percentuali riportati nell'effect size provengono da versioni pubbliche precedenti dello stesso studio; la revisione 2026 è stata verificata sul risultato qualitativo e sulla persistenza degli effetti, non su una nuova trascrizione tabellare completa.",
      "Un aumento della capacità tributaria può riflettere maggiore disciplina e riscossione ma richiede attenzione distributiva e non coincide automaticamente con un miglioramento del benessere dei contribuenti."
    ],
    unintendedEffects:
      "Un controllo più indipendente può aumentare attrito, tempi documentali o prudenza eccessiva nelle decisioni di spesa. Il disegno deve quindi preservare indipendenza senza trasformare il revisore in un sostituto della responsabilità gestionale e politica dell'ente.",
    primarySource: {
      label: "Ministero dell'Interno — Finanza locale, sorteggi dei revisori degli enti locali",
      url: "https://finanzalocale.interno.gov.it/apps/revisori.php/get_estraz"
    },
    evaluationStudies: [
      {
        label: "NBER Working Paper 30644 — revisione aprile 2026",
        url: "https://www.nber.org/papers/w30644",
        citation: "Vannutelli S (2026), From Lapdogs to Watchdogs: Random Auditor Assignment and Municipal Fiscal Performance, NBER Working Paper 30644, revised April 2026",
        doi: "10.3386/w30644"
      }
    ],
    lastVerifiedAt: "2026-09-12",
    transferabilityItaly:
      "Diretta come evidenza istituzionale italiana: mostra che l'indipendenza del monitor può incidere sulla performance fiscale dei comuni. La replica letterale non è una scelta municipale perché il sistema dei revisori è definito dalla legge nazionale; è invece trasferibile il principio di ridurre conflitti di interesse, aspettative di riconferma e discrezionalità nelle nomine di altri organismi o incarichi di controllo quando la normativa consente margini locali.",
    lameziaAdaptation:
      "Non modificare il sistema legale dei revisori. Usare il caso come benchmark per un audit delle nomine e degli incarichi di controllo o verifica sui quali il Comune mantiene discrezionalità: criteri pubblici, dichiarazione dei conflitti, rotazione, pool qualificato e, dove giuridicamente possibile, selezione casuale o comunque separata dal decisore controllato. Collegare poi questi presidi a indicatori di bilancio, rilievi e tempi di correzione, senza assumere che la randomizzazione sia sempre lo strumento appropriato.",
    implementability: "medio_termine",
    capacityDataNeeds: ["mappa degli incarichi di controllo e relativa base normativa", "registro dei conflitti di interesse", "storico delle nomine e riconferme", "indicatori di rilievi e correzioni di bilancio", "parere giuridico sulle procedure selettive utilizzabili"],
    tags: ["revisori", "oversight", "conflitti di interesse", "finanza locale", "difference-in-differences", "Italia"],
    revisionHistory: [{ date: "2026-09-12", note: "Prima verifica e inserimento; usata la revisione NBER di aprile 2026 e distinta esplicitamente la cornice nazionale dai margini di adattamento comunale." }]
  },
  {
    id: "nyc-building-energy-benchmarking-disclosure",
    title: "Benchmarking e disclosure annuale dei consumi energetici e idrici degli edifici",
    authority: "City of New York / Department of Buildings / Mayor's Office of Sustainability",
    territory: "New York City, New York",
    country: "Stati Uniti",
    implementationYear: "Local Law 84 approvata nel 2009; benchmarking annuale operativo dal 2011 e successivamente ampliato",
    problem:
      "Proprietari, gestori, inquilini e amministrazione dispongono spesso di poca informazione comparabile sulle prestazioni energetiche degli edifici esistenti, riducendo la pressione a correggere inefficienze e rendendo difficile prioritizzare audit, retrofit e gestione operativa.",
    measure:
      "La Local Law 84 richiede agli edifici sopra le soglie dimensionali previste di misurare annualmente consumi di energia e acqua tramite ENERGY STAR Portfolio Manager e trasmettere i dati alla città per la pubblicazione. Il programma è stato successivamente ampliato e oggi alimenta un dataset pubblico pluriennale delle prestazioni degli edifici.",
    mechanism:
      "La misurazione ripetuta rende visibili consumi e anomalie ai proprietari e ai gestori; la disclosure pubblica permette confronto fra edifici e aumenta la pressione reputazionale e di mercato. I dati standardizzati consentono inoltre all'amministrazione di indirizzare audit, assistenza e successive politiche di efficienza verso gli edifici peggiori.",
    population:
      "Edifici pubblici e privati di New York City soggetti alle soglie dimensionali della legge; il perimetro è stato ampliato nel tempo rispetto alla soglia originaria di 50.000 square feet per molti edifici privati.",
    primaryArea: "ambiente_clima_energia",
    secondaryAreas: ["digitalizzazione_servizi_online", "trasparenza_integrita_anticorruzione"],
    interventionTypes: ["informazione_trasparenza", "infrastruttura_digitale", "regolazione", "targeting_data_analytics"],
    tools: ["ENERGY STAR Portfolio Manager", "reporting annuale", "open data", "benchmark energetico", "disclosure pubblica", "soglie dimensionali"],
    territorialScale: "Città / edificio",
    interventionStatus:
      "Politica strutturale tuttora operativa. Il Department of Buildings mantiene il Benchmarking Law e la città pubblica dataset aggiornati con energia e acqua per gli edifici soggetti all'obbligo.",
    evaluationMethod:
      "Difference-in-differences che sfrutta la fase iniziale di implementazione e gruppi di edifici esposti in momenti o modi diversi ai diversi componenti della policy. Lo studio identifica gruppi trattamento e controllo all'interno delle fasi del programma e separa, per quanto possibile, l'effetto della misurazione da quello della disclosure pubblica.",
    comparator:
      "Edifici non ancora esposti allo stesso componente della policy nelle fasi iniziali di implementazione, confrontati con gli edifici già soggetti a benchmarking/disclosure prima e dopo l'obbligo.",
    outcomes: ["consumo energetico", "energy use intensity", "source EUI", "adozione di pratiche di gestione energetica", "disclosure delle prestazioni"],
    results:
      "La valutazione attribuisce al benchmarking e alla disclosure una riduzione misurabile del consumo energetico rispetto ai gruppi di controllo. Gli effetti aumentano con la durata di esposizione e lo studio identifica la pubblicazione delle performance come uno dei meccanismi più rilevanti. I risultati non implicano che la sola pubblicazione del dato sostituisca retrofit, manutenzione o standard prestazionali più stringenti.",
    effectSize:
      "Meng, Hsu e Han stimano una riduzione del consumo energetico di circa 6% dopo tre anni e 14% dopo quattro anni di benchmarking/disclosure rispetto al controfattuale; nelle analisi dei meccanismi la disclosure degli ENERGY STAR scores è associata a una riduzione del source EUI nell'ordine dell'8,6% a parità degli altri fattori considerati.",
    evidenceStrength: "forte",
    costsRequirements:
      "Servono anagrafe stabile degli edifici, dati di superficie e destinazione d'uso, accesso alle bollette o ai meter data, strumento standardizzato di benchmarking, assistenza ai proprietari e controlli di qualità sui dati. Per gli edifici pubblici il Comune può partire con dati propri; un obbligo esteso ai privati richiede invece una base normativa specifica e capacità di enforcement.",
    limitations: [
      "La policy è stata introdotta insieme ad altre componenti del Greener, Greater Buildings Plan e in un mercato immobiliare con molte iniziative energetiche; il disegno DiD riduce ma non elimina ogni possibile contaminazione da politiche concomitanti.",
      "Gli effetti medi di New York riguardano soprattutto edifici medio-grandi e non devono essere trasferiti automaticamente al patrimonio edilizio più piccolo o con diverse caratteristiche climatiche e d'uso.",
      "La qualità del benchmarking dipende dalla correttezza dei dati inseriti; errori di superficie, uso o consumi possono alterare confronti e ranking.",
      "La disclosure può produrre miglioramenti attraverso più canali — gestione, investimenti, selezione di mercato — che non sono completamente separabili.",
      "Il dato osservato riguarda consumo energetico, non direttamente comfort, povertà energetica o distribuzione dei costi fra proprietari e inquilini."
    ],
    unintendedEffects:
      "Obblighi di reporting mal progettati possono creare costi amministrativi sproporzionati, incentivare gaming dei dati o trasferire i costi degli interventi sugli inquilini. La policy deve quindi associare controlli di qualità, assistenza tecnica e analisi distributiva alla trasparenza.",
    primarySource: {
      label: "NYC Department of Buildings — Benchmarking and Energy Efficiency Rating",
      url: "https://www.nyc.gov/site/buildings/codes/benchmarking.page"
    },
    evaluationStudies: [
      {
        label: "Energy",
        url: "https://doi.org/10.1016/j.energy.2017.05.148",
        citation: "Meng T, Hsu D, Han A (2017), Estimating energy savings from benchmarking policies in New York City",
        doi: "10.1016/j.energy.2017.05.148"
      },
      {
        label: "NYC Open Data — Local Law 84 building energy and water disclosure",
        url: "https://data.cityofnewyork.us/Environment/NYC-Building-Energy-and-Water-Data-Disclosure-for-/5zyy-y8am",
        citation: "City of New York, Building Energy and Water Data Disclosure for Local Law 84"
      }
    ],
    lastVerifiedAt: "2026-09-12",
    transferabilityItaly:
      "Alta per il principio di misurazione e disclosure del patrimonio pubblico e per programmi volontari o convenzionati; più bassa per un obbligo generalizzato sui privati senza una base normativa nazionale o regionale. Il nucleo trasferibile è costruire una baseline comparabile, pubblicarla e usarla per decidere dove intervenire, non copiare le soglie dimensionali di New York.",
    lameziaAdaptation:
      "Avviare un registro energetico degli edifici comunali con superficie, uso, consumi mensili di elettricità/gas/acqua, costo e normalizzazione climatica; pubblicare una dashboard annuale e identificare gli edifici con intensità anomala per audit e interventi. Solo dopo aver consolidato qualità e governance del dato valutare partnership volontarie con scuole, ASP, edilizia pubblica o grandi proprietari, evitando di presentare benchmark grezzi come giudizi di efficienza senza controllare uso e caratteristiche dell'edificio.",
    implementability: "medio_termine",
    capacityDataNeeds: ["anagrafe degli edifici comunali", "superfici e destinazioni d'uso", "bollette o meter data mensili", "normalizzazione climatica", "data quality checks", "dashboard e processo di audit energetico"],
    tags: ["benchmarking energetico", "edifici", "open data", "disclosure", "difference-in-differences", "efficienza energetica"],
    revisionHistory: [{ date: "2026-09-12", note: "Prima verifica e inserimento sulla base della Local Law 84, dei dataset ufficiali NYC e della valutazione quasi-sperimentale di Meng, Hsu e Han." }]
  },
  {
    id: "vancouver-empty-homes-tax",
    title: "Empty Homes Tax sugli immobili residenziali lasciati vuoti o sottoutilizzati",
    authority: "City of Vancouver",
    territory: "Vancouver, British Columbia",
    country: "Canada",
    implementationYear: "Dal 2017; aliquota iniziale 1%, successivamente aumentata fino al 3% del valore imponibile",
    problem:
      "In un mercato con forte pressione abitativa e bassi vacancy rates nel segmento locativo, una quota di abitazioni può restare vuota o sottoutilizzata per motivi speculativi, sottraendo stock potenzialmente utilizzabile alla residenza di lungo periodo.",
    measure:
      "La città richiede annualmente ai proprietari una dichiarazione d'uso dell'immobile e applica una tassa alle abitazioni classificate come vuote o sottoutilizzate, con esenzioni definite dal by-law. L'obiettivo dichiarato è riportare unità sul mercato della locazione di lungo periodo e destinare il gettito ad iniziative di housing accessibile.",
    mechanism:
      "Aumentare il costo opportunità di tenere inutilizzato un immobile residenziale incentiva il proprietario a occuparlo, affittarlo o venderlo. La dichiarazione annuale crea inoltre un'infrastruttura informativa sulla vacancy e il gettito può finanziare politiche abitative complementari.",
    population:
      "Proprietari di immobili residenziali nella City of Vancouver; abitazioni principali, unità locate per almeno il periodo minimo previsto e altri casi definiti dal by-law sono esclusi o esentati.",
    primaryArea: "housing_politiche_abitative",
    secondaryAreas: ["fiscalita_entrate_riscossione", "capacita_amministrativa_personale"],
    interventionTypes: ["incentivo_economico", "regolazione", "enforcement_controllo", "targeting_data_analytics"],
    tools: ["dichiarazione annuale di utilizzo", "vacancy tax", "audit e verifiche", "property assessment", "esenzioni codificate", "report annuale"],
    territorialScale: "Città / immobile residenziale",
    interventionStatus:
      "Politica strutturale tuttora operativa. Il report cittadino 2025 indica per il 2024 un declared vacant rate dello 0,49%, contro 0,90% nel 2017, e oltre 194 milioni di dollari canadesi di gettito cumulato destinato a iniziative di housing; questi trend sono descrittivi e non vengono trattati come stime causali.",
    evaluationMethod:
      "Difference-in-differences di confine: l'analisi indipendente confronta aree di Vancouver soggette alla tassa con aree simili della confinante Burnaby non soggette alla tassa, concentrandosi su neighbourhoods entro circa 800 metri da Boundary Road. Il disegno osserva il cambiamento prima e dopo l'introduzione e studia vacancy, stock di abitazioni e affitti medi.",
    comparator:
      "Aree residenziali comparabili di Burnaby immediatamente oltre il confine municipale e non soggette alla Vancouver Empty Homes Tax, osservate nello stesso periodo.",
    outcomes: ["vacancy rate", "numero di abitazioni", "affitto medio", "unità dichiarate vuote", "gettito destinato all'housing"],
    results:
      "La valutazione DiD trova che la tassa riduce significativamente la vacancy senza evidenza di riduzione della nuova offerta abitativa e senza un effetto statisticamente rilevabile sull'affitto medio. La città documenta parallelamente una diminuzione di lungo periodo delle unità dichiarate vuote e gettito per programmi di housing, ma questi dati amministrativi non vengono confusi con l'effetto causale stimato al confine con Burnaby.",
    effectSize:
      "Lo studio indipendente stima una riduzione della vacancy di circa 1,5 punti percentuali rispetto al controfattuale; con un vacancy rate pre-policy vicino al 7% nelle aree analizzate, equivale a circa il 21% in meno di abitazioni vuote. Non emerge un effetto significativo sull'affitto medio né sulla costruzione di nuove abitazioni.",
    evidenceStrength: "forte",
    costsRequirements:
      "Servono un'anagrafe immobiliare affidabile, dichiarazioni annuali, collegamento con dati fiscali e di proprietà, procedure di audit, gestione delle esenzioni, contenzioso e capacità di distinguere vacancy effettiva da assenze temporanee o immobili non utilizzabili. La misura può generare gettito ma richiede un'amministrazione dedicata e controlli proporzionati.",
    limitations: [
      "Il disegno quasi-sperimentale identifica soprattutto l'effetto nelle aree vicine al confine Vancouver-Burnaby; l'external validity per quartieri più centrali o mercati immobiliari diversi è limitata.",
      "Nel periodo successivo Vancouver e British Columbia hanno introdotto anche altre politiche su affitti brevi, speculazione e vacancy; il disegno di confine attenua ma non elimina ogni rischio di contaminazione da politiche concomitanti.",
      "La riduzione della vacancy non ha prodotto nello studio un calo statisticamente rilevabile dell'affitto medio: maggiore disponibilità non equivale automaticamente a maggiore affordability nel breve periodo.",
      "Una tassa locale sugli immobili vacanti richiede una base legislativa specifica: la City of Vancouver opera con poteri tributari che non possono essere presunti per un comune italiano.",
      "Dichiarazioni e verifiche possono generare errori di classificazione, oneri amministrativi e contenzioso; servono esenzioni chiare e procedure di ricorso."
    ],
    unintendedEffects:
      "Possibili incentivi a dichiarazioni strategiche, costi di compliance e contenzioso. Una vacancy tax può inoltre spingere alcuni proprietari a vendere invece che affittare e non garantisce da sola riduzioni dei canoni; deve essere valutata come parte di un portafoglio più ampio di politiche abitative.",
    primarySource: {
      label: "City of Vancouver — Empty Homes Tax",
      url: "https://vancouver.ca/home-property-development/empty-homes-tax.aspx"
    },
    evaluationStudies: [
      {
        label: "C.D. Howe Institute — Ripple Effects",
        url: "https://www.cdhowe.org/wp-content/uploads/2024/12/E-Brief_356.pdf",
        citation: "Caracciolo GG, Miglino E (2024), Ripple Effects: The Impact of an Empty-Homes Tax on the Housing Market"
      },
      {
        label: "City of Vancouver — 2025 Empty Homes Tax Annual Report",
        url: "https://vancouver.ca/files/cov/2025-empty-homes-tax-annual-report.pdf",
        citation: "City of Vancouver (2025), Empty Homes Tax Annual Report — 2024 Vacancy Reference Year"
      }
    ],
    lastVerifiedAt: "2026-09-12",
    transferabilityItaly:
      "Bassa per una replica tributaria letterale senza una specifica base legislativa, ma alta come lezione di policy design: misurare vacancy effettiva, distinguere uso temporaneo e sottoutilizzo strutturale, esplicitare esenzioni e valutare l'addizionalità rispetto a strumenti esistenti. Per un comune italiano la prima leva trasferibile è il sistema informativo sull'uso dello stock, non l'imposta in sé.",
    lameziaAdaptation:
      "Non introdurre una vacancy tax comunale senza base normativa. Costruire prima una diagnosi dello stock abitativo sottoutilizzato incrociando, nei limiti di legge, anagrafe, tributi, utenze aggregate, stato edilizio e mercato locativo; distinguere immobili realmente vuoti da seconde case, immobili non agibili e assenze temporanee. Usare la diagnosi per strumenti legalmente disponibili — recupero del patrimonio pubblico, incentivi alla locazione, contrasto agli immobili degradati, accordi con proprietari — e valutare eventuali proposte legislative solo dopo aver quantificato scala e geografia del problema.",
    implementability: "strutturale",
    capacityDataNeeds: ["anagrafe immobiliare e tributaria", "regole privacy per linkage dei dati", "indicatori di vacancy e agibilità", "dati su locazioni e canoni", "processo di verifica/esenzione", "analisi della base giuridica"],
    tags: ["vacancy tax", "housing", "immobili vuoti", "difference-in-differences", "fiscalità immobiliare", "Vancouver"],
    revisionHistory: [{ date: "2026-09-12", note: "Prima verifica e inserimento; separati esplicitamente l'effetto causale DiD al confine Vancouver-Burnaby dai trend amministrativi di lungo periodo pubblicati dalla città." }]
  }
] as const satisfies readonly EvidenceIntervention[];
