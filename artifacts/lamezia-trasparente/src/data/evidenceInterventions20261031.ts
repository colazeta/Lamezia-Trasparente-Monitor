import type { EvidenceIntervention } from "./evidenceInterventions";

/** Evidence checked 2026-10-31 on peer-reviewed original studies, authors and official implementing authorities. */
export const EVIDENCE_INTERVENTIONS_2026_10_31: readonly EvidenceIntervention[] = [
  {
    "id": "seattle-king-county-cmto-housing-search-assistance-rct-2018",
    "title": "Seattle e King County: assistenza abitativa personalizzata per trasferimenti in quartieri con maggiori opportunità",
    "authority": "Seattle Housing Authority (SHA) e King County Housing Authority (KCHA), con MDRC, ricercatori e partner locali",
    "territory": "Seattle e King County (Washington), Stati Uniti",
    "country": "Stati Uniti",
    "implementationYear": "Pilot Creating Moves to Opportunity (CMTO): fase I dal 2018 a metà 2019; fase II dal luglio 2019 al 2020; studio definitivo 2024",
    "problem": "Le famiglie a basso reddito beneficiarie di housing vouchers incontrano ostacoli informativi, organizzativi, finanziari e nei rapporti con i proprietari nel cercare alloggi in quartieri con opportunità migliori. Il voucher da solo non rimuove queste barriere.",
    "measure": "Le autorità abitative hanno offerto casualmente a famiglie beneficiarie di nuovi Housing Choice Vouchers un pacchetto aggiuntivo composto da informazioni sui quartieri, consulenza e accompagnamento personalizzato durante la ricerca, intermediazione con i proprietari e copertura di alcune spese iniziali. Una seconda fase ha confrontato intensità e componenti differenti del supporto.",
    "mechanism": "Un referente operativo personalizzato riduce costi di ricerca, carico amministrativo, ostacoli nella preparazione delle domande e frizioni con i locatori; aiuti monetari e informazioni complementano, ma non sostituiscono, l'accompagnamento.",
    "population": "Famiglie a basso reddito, prevalentemente con figli, che ricevevano nuovi voucher di sostegno all'affitto dalle autorità abitative di Seattle e King County. Circa 712 famiglie partecipanti nelle due fasi complessive secondo la ricostruzione MIT 2024; le percentuali principali riguardano la fase I, non tutte le 712 famiglie.",
    "primaryArea": "housing_politiche_abitative",
    "secondaryAreas": [
      "welfare_inclusione_servizi_sociali",
      "capacita_amministrativa_personale",
      "sviluppo_economico_commercio_lavoro"
    ],
    "interventionTypes": [
      "servizio_diretto",
      "incentivo_economico",
      "modifica_organizzativa_processo",
      "partnership_pubblico_privato_terzo_settore",
      "targeting_data_analytics"
    ],
    "tools": [
      "housing vouchers già disponibili",
      "navigator/caseworker di ricerca alloggi",
      "ricerca mirata in aree con indicatori territoriali di opportunità",
      "supporto alle candidature e negoziazione con locatori",
      "assistenza finanziaria per spese iniziali",
      "due fasi RCT preregistrate e registri amministrativi locativi"
    ],
    "territorialScale": "Programma gestito da due autorità abitative locali e applicato alle scelte abitative delle singole famiglie nell'area metropolitana di Seattle/King County.",
    "interventionStatus": "Pilot attuato dal 2018 e valutato nelle due fasi; non si presume identità fra il protocollo originale e gli eventuali servizi correnti delle autorità nel 2026.",
    "evaluationMethod": "Due randomized controlled trials con assegnazione individuale. Fase I: pacchetto completo CMTO aggiuntivo rispetto al servizio ordinario associato al voucher. Fase II: confronto tra informazioni+assistenza finanziaria, servizi ridotti e servizi completi per identificare i meccanismi. Piano preregistrato AEA RCT Registry AEARCTR-0002807; articolo finale peer-reviewed 2024.",
    "comparator": "Famiglie randomizzate a ricevere il voucher e i servizi ordinari, senza pacchetto CMTO aggiuntivo (fase I). Nella fase II, altri bracci con diverse intensità di assistenza.",
    "outcomes": [
      "quota di famiglie che locano un alloggio in quartieri con elevata mobilità economica intergenerazionale stimata",
      "soddisfazione per il quartiere di destinazione",
      "permanenza nel nuovo quartiere osservata nel follow-up",
      "rilevanza relativa dell'accompagnamento personalizzato rispetto a sola informazione e assistenza economica"
    ],
    "results": "Nella fase I, il pacchetto CMTO ha aumentato in misura molto ampia la quota di famiglie che si trasferivano in quartieri classificati come ad alta opportunità. La fase II indica che l'assistenza personalizzata e intensiva è il principale meccanismo: informazione e trasferimenti monetari isolati risultano assai meno incisivi. Gli studi riportano maggior soddisfazione e una certa persistenza della scelta abitativa. Non è stato direttamente dimostrato in questa valutazione un incremento futuro dei redditi dei figli: la qualità/opportunità del quartiere è un outcome intermedio.",
    "effectSize": "Articolo AER 2024, fase I: 53% delle famiglie trattate contro 15% nel controllo ha preso in locazione un alloggio in un'area ad alta opportunità: +38 punti percentuali (non +38%). Comunicazioni preliminari del 2019 riportavano 54% contro 14% su un campione iniziale; per il record è usata la versione definitiva 2024. Nella fase II l'effetto del supporto completo è circa 5 volte quello di sola informazione+assistenza finanziaria e circa 3 volte quello dei servizi ridotti, secondo la sintesi degli autori.",
    "evidenceStrength": "molto_forte",
    "costsRequirements": "Secondo la ricostruzione MIT della valutazione definitiva: costo medio del pacchetto di circa 2.670 USD per famiglia, aggiuntivo rispetto al sussidio abitativo ordinario; personale dedicato, presa in carico, interlocuzione con proprietari, monitoraggio delle domande e fondi per spese di avvio locazione. Il contesto statunitense può comportare canoni e costi del voucher più alti in aree di opportunità; non si tratta di un risparmio di bilancio automaticamente accertato, né di un costo trasferibile in euro senza adattamenti.",
    "limitations": [
      "Intervento selettivo su famiglie già beneficiarie di vouchers con vincoli specifici, non su tutta la popolazione in emergenza abitativa.",
      "Le opportunità territoriali sono misurate mediante indicatori predittivi; lo studio non osserva ancora il reddito adulto futuro dei bambini trattati.",
      "Bundle complesso: il trasferimento della singola componente richiede cautela; nella fase II l'assistenza personalizzata risulta cruciale.",
      "Il mercato locativo, i rapporti con i proprietari e la disciplina italiana dell'ERP e dei contributi abitativi differiscono radicalmente dal modello USA.",
      "L'aumento della mobilità delle famiglie non garantisce disponibilità abitativa complessiva, espansione dell'offerta o assenza di conseguenze distributive per altri aspiranti inquilini."
    ],
    "unintendedEffects": "Possibile maggior costo del sostegno locativo in quartieri con canoni più elevati; pressione sull'offerta abitativa disponibile e possibile esclusione dei beneficiari meno facili da collocare se il personale è limitato. Lo studio non dimostra un effetto indesiderato quantitativo dominante; questi rischi vanno monitorati.",
    "primarySource": {
      "label": "Seattle Housing Authority — Creating Moves to Opportunity (attuazione e disegno delle due fasi)",
      "url": "https://www.seattlehousing.org/housing/housing-choice-vouchers/creating-moves-opportunity"
    },
    "evaluationStudies": [
      {
        "label": "American Economic Review — articolo scientifico definitivo (2024)",
        "url": "https://www.aeaweb.org/articles?id=10.1257/aer.20200407",
        "citation": "Bergman, P., Chetty, R., DeLuca, S., Hendren, N., Katz, L. F. e Palmer, C. (2024). Creating Moves to Opportunity: Experimental Evidence on Barriers to Neighborhood Choice. American Economic Review 114(5), 1281–1337.",
        "doi": "10.1257/aer.20200407"
      },
      {
        "label": "Opportunity Insights — risultati e materiali di replicazione",
        "url": "https://opportunityinsights.org/paper/cmto/",
        "citation": "Opportunity Insights (2024), Creating Moves to Opportunity, abstract, materiali e replicazione."
      },
      {
        "label": "NBER — working paper e preregistrazione",
        "url": "https://www.nber.org/papers/w26164",
        "citation": "Bergman et al. (2019, revisione gennaio 2023), NBER Working Paper 26164.",
        "doi": "10.3386/w26164"
      }
    ],
    "lastVerifiedAt": "2026-10-31",
    "transferabilityItaly": "Trasferibilità elevata del meccanismo amministrativo di accompagnamento personalizzato alla ricerca di alloggi; trasferibilità limitata del voucher statunitense, della mappatura di mobilità intergenerazionale e della selezione degli assegnatari. Nel sistema ERP italiano valgono graduatorie, procedure di assegnazione e vincoli regionali; la consulenza abitativa non può sostituire i diritti e le priorità di legge.",
    "lameziaAdaptation": "Avviare con ATERP Calabria e l'Ambito Territoriale Sociale un servizio pilota di orientamento alloggi per famiglie già eleggibili a programmi di sostegno abitativo, con supporto a reperire immobili disponibili, preparare documenti, comprendere i contratti e contattare locatori, senza modificare graduatorie o assegnazioni spettanti. Collegamento potenziale con l'avviso ATERP del 12/10/2026 per reperire abitazioni nel Comune destinate al progetto Scordovillo e con il contributo comunale 'Una Casa per Tutti' del 2026, previa verifica dei rispettivi requisiti. Predefinire outcome: effettiva locazione, tempi, continuità dell'alloggio, accessibilità a servizi e trasporti, costi.",
    "implementability": "strutturale",
    "capacityDataNeeds": [
      "partnership Comune–ATERP–ATS e basi giuridiche dei sostegni",
      "inventario delle disponibilità abitative per titolarità e requisiti",
      "dati minimizzati su famiglie eleggibili e stato delle pratiche",
      "navigator qualificati e rete di proprietari/intermediari",
      "protocollo di valutazione con comparatori senza ritardare diritti preesistenti",
      "budget, monitoraggio stabilità abitativa e garanzie di non discriminazione"
    ],
    "tags": [
      "housing",
      "CMTO",
      "Seattle",
      "King County",
      "RCT",
      "housing voucher",
      "landlord engagement",
      "mobilità residenziale",
      "case management",
      "opportunità territoriali"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-31",
        "note": "Nuovo record verificato su studio peer-reviewed AER 2024, studio NBER, materiali degli autori e fonte attuatrice SHA. Adottato l'effetto definitivo 53% vs 15% (non i valori preliminari 2019), separato l'outcome intermedio dalle prospettive di reddito futuro e qualificata la trasferibilità istituzionale."
      }
    ]
  },
  {
    "id": "sacramento-311-2020-digital-status-map-transparency-psm-did",
    "title": "Sacramento 311: trasparenza sullo stato delle segnalazioni e mappa pubblica per favorire la partecipazione civica",
    "authority": "City of Sacramento — 311 Customer Service e Information Technology Department",
    "territory": "Sacramento, California, Stati Uniti",
    "country": "Stati Uniti",
    "implementationYear": "Aggiornamento di app e portale online annunciato e attivato il 16 aprile 2020; valutazione peer-reviewed pubblicata nel 2023",
    "problem": "Limitata visibilità delle segnalazioni di manutenzione e dei relativi stati di lavorazione; difficoltà dei residenti nel conoscere attività e problemi già segnalati, con potenziali duplicazioni, sfiducia e bassi livelli di coproduzione informativa.",
    "measure": "Il Comune ha introdotto una versione aggiornata di Sacramento 311 che permette registrazione e tracciamento delle proprie richieste, consultazione delle richieste aperte e storiche attraverso una mappa 'Explore', possibilità di seguire segnalazioni altrui e monitorarne gli aggiornamenti. La modifica includeva contestualmente una riprogettazione di interfaccia.",
    "mechanism": "Rendere pubblicamente osservabile l'esistenza e il progresso delle richieste riduce asimmetrie informative e può incentivare la partecipazione; la mappa mostra problemi e interventi nei quartieri e consente di seguire richieste di interesse collettivo.",
    "population": "Residenti e utilizzatori del sistema 311 per segnalazioni di pulizia, rifiuti, illuminazione, viabilità, problemi urbani e servizi non emergenziali. Valutazione su dati amministrativi di richieste geolocalizzate nelle città trattata e di confronto.",
    "primaryArea": "digitalizzazione_servizi_online",
    "secondaryAreas": [
      "partecipazione_democrazia_locale",
      "trasparenza_integrita_anticorruzione",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "infrastruttura_digitale",
      "informazione_trasparenza",
      "modifica_organizzativa_processo",
      "partecipazione_codesign"
    ],
    "tools": [
      "portale e applicazione municipale Sacramento 311",
      "mappa georeferenziata Explore delle segnalazioni",
      "tracciamento stato e aggiornamenti dei ticket",
      "funzione follow su richieste di altri utenti",
      "registro delle richieste per analisi PSM-DID"
    ],
    "territorialScale": "Città intera; segnalazioni individuali e aree di quartiere osservate tramite dati amministrativi.",
    "interventionStatus": "Funzionalità introdotte nel 2020; il sito e i servizi municipali di Sacramento continuano a descrivere canali digitali 311. Non è verificata una perfetta identità della versione applicativa del 2026 con quella valutata.",
    "evaluationMethod": "Propensity-score matching combinato con difference-in-differences (PSM-DID) su panel di richieste amministrative prima e dopo l'upgrade 2020. Sacramento città trattata confrontata con San Francisco come città di controllo; studiati trend nelle richieste e eterogeneità socioeconomica. Nessuna randomizzazione della città o degli utenti.",
    "comparator": "Richieste e andamento nella città di San Francisco, selezionata come comparatore e abbinata statisticamente alle osservazioni di Sacramento; l'upgrade e gli shock concomitanti non sono stati assegnati casualmente.",
    "outcomes": [
      "partecipazione civica misurata tramite numero/tasso di richieste 311",
      "dinamica temporale a breve e medio termine delle richieste dopo l'upgrade",
      "eterogeneità degli effetti per povertà del quartiere"
    ],
    "results": "Lo studio peer-reviewed individua un aumento statisticamente significativo delle richieste/partecipazione attraverso 311 dopo la maggiore trasparenza digitale, rispetto al confronto PSM-DID con San Francisco. L'incremento risulta principalmente transitorio, concentrato nelle prime quattro settimane. I quartieri con maggiore povertà registrano incrementi inferiori. Non è dimostrata tramite questo studio una riduzione dei tempi di risoluzione o un miglioramento misurato della qualità dei servizi.",
    "effectSize": "Effetto positivo statisticamente significativo sulla partecipazione/volume delle richieste; incremento concentrato nelle prime quattro settimane. Una dimensione numerica precisa del coefficiente non è ricostruibile con sufficiente affidabilità dal testo integrale accessibile: NON assegnare percentuali o punti percentuali non verificati.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Richiede un sistema di ticketing con ID stabile, interfaccia web/mobile, GIS e integrazione tra sistemi comunali, pubblicazione selettiva dei metadati delle segnalazioni, gestione della privacy, aggiornamento degli stati, comunicazione agli utenti e personale per ricevere e risolvere richieste. I costi di sviluppo e manutenzione specifici dell'intervento non sono quantificati nello studio accessibile; non è dimostrato un rapporto costi-benefici.",
    "limitations": [
      "Disegno non randomizzato; controllo con altra città e matching non escludono shock simultanei specifici, particolarmente durante l'emergenza Covid-19 del 2020.",
      "Il trattamento combina trasparenza, usabilità, nuovi account, mappa e tracciamento: non consente di isolare l'effetto della sola divulgazione dello stato.",
      "Gli esiti misurano segnalazioni e partecipazione, non la chiusura effettiva dei ticket o la qualità della manutenzione.",
      "L'effetto stimato è di breve durata, concentrato nelle prime quattro settimane, e non va presentato come cambiamento permanente.",
      "La crescita minore nelle aree più povere evidenzia un rischio di esclusione digitale e disparità nell'utilizzo.",
      "Il confronto con San Francisco potrebbe non controllare tutti i cambiamenti amministrativi e territoriali specifici di Sacramento."
    ],
    "unintendedEffects": "Possibile aumento del carico di richieste e delle duplicazioni se non gestite, squilibri di rappresentanza fra quartieri più e meno connessi e rischi per dati personali o localizzazioni sensibili. Il miglioramento nei tempi di soluzione non è documentato dalla valutazione.",
    "primarySource": {
      "label": "City of Sacramento — annuncio ufficiale dell'aggiornamento di Sacramento 311 del 16 aprile 2020",
      "url": "https://sacramentocityexpress.com/2020/04/16/city-launches-updated-311-app-and-website-to-improve-customer-experience/"
    },
    "evaluationStudies": [
      {
        "label": "Government Information Quarterly — articolo scientifico originale (2023)",
        "url": "https://doi.org/10.1016/j.giq.2023.101868",
        "citation": "Zhao, B., Cheng, S., Schiff, K. J. e Kim, Y. (2023). Digital transparency and citizen participation: Evidence from the online crowdsourcing platform of the City of Sacramento. Government Information Quarterly 40(4), 101868.",
        "doi": "10.1016/j.giq.2023.101868"
      },
      {
        "label": "Purdue University — sintesi istituzionale dell'articolo e del metodo PSM-DID",
        "url": "https://cla.purdue.edu/academic/polsci/research/labs/grail/research/research-publication/digital-transparency-and-citizen-participation-evidence-from-the-online-crowdsourcing-platform-of-the-city-of-sacramento.html",
        "citation": "Purdue GRAIL, Research summary of Zhao et al. (2023)."
      }
    ],
    "lastVerifiedAt": "2026-10-31",
    "transferabilityItaly": "Alta per la pubblicazione selettiva di stato e mappa delle segnalazioni non sensibili nel rispetto di GDPR e accessibilità digitale; moderata per l'effetto sulla partecipazione, che in Italia va verificato con un proprio comparatore e canali non digitali. Non trasferire dati personali, segnalazioni riservate o localizzazioni riferibili a soggetti vulnerabili.",
    "lameziaAdaptation": "Il sito del Comune di Lamezia include già 'Segnala disservizio'. Valutare un estensione graduale del modulo con ID e stato di presa in carico, una mappa anonimizzata di segnalazioni su buche, rifiuti, illuminazione e manutenzione e funzioni di follow senza esporre identità. Pubblicare tempi mediani di risposta, chiusura verificata e ripetizione dei problemi; sperimentare un rollout per categorie o quartieri con confronto contemporaneo e analisi di rappresentatività.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "analisi del funzionamento attuale della funzione Segnala disservizio",
      "ticketing con ID, categorie, timestamp e stati affidabili",
      "regole GDPR, anonimizzazione e moderazione",
      "integrazione GIS e disegno responsive/accessibile",
      "canali telefonici e sportelli alternativi",
      "monitoraggio per quartiere e condizioni sociali, audit delle richieste chiuse"
    ],
    "tags": [
      "Sacramento",
      "311",
      "digital transparency",
      "PSM-DID",
      "segnalazioni",
      "partecipazione civica",
      "GIS",
      "service requests",
      "equità digitale"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-31",
        "note": "Nuovo record verificato sulla comunicazione primaria del Comune del 16/04/2020 e sull'articolo scientifico Zhao et al. 2023; precisati comparatore San Francisco, natura non randomizzata, benefici temporanei, differenze per povertà e assenza di outcome sulla risoluzione."
      }
    ]
  }
];
