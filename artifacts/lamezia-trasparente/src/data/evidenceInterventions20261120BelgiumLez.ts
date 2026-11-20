import type { EvidenceIntervention } from "./evidenceInterventions";

/** Two distinct Belgian local LEZ policies evaluated in one original 2025 quasi-experimental study; original study and official implementing authorities verified on 2026-11-20. */
export const EVIDENCE_INTERVENTIONS_2026_11_20_BELGIUM_LEZ: readonly EvidenceIntervention[] = [
  {
    "country": "Belgio",
    "problem": "L'esposizione urbana agli inquinanti da traffico (NO₂, black carbon, PM₂.₅ e PM₁₀), la disuguaglianza territoriale dell'esposizione e i possibili effetti sulla salute; necessità di valutare le limitazioni alla circolazione separando le tendenze generali dai risultati associati alla politica.",
    "mechanism": "La limitazione dell'accesso ai veicoli che non rispettano determinati standard emissivi mira a modificare il parco veicolare che attraversa la zona e a diminuire le emissioni locali. L'effetto empirico è stimato sul cambiamento della pendenza delle serie di esposizione rispetto alle città di controllo; non isola in modo perfetto la LEZ da altre politiche concomitanti.",
    "primaryArea": "ambiente_clima_energia",
    "secondaryAreas": [
      "mobilita_spazio_pubblico",
      "salute_pubblica_locale",
      "welfare_inclusione_servizi_sociali"
    ],
    "interventionTypes": [
      "regolazione",
      "enforcement_controllo",
      "infrastruttura_digitale",
      "informazione_trasparenza",
      "targeting_data_analytics"
    ],
    "tools": [
      "delimitazione territoriale e controlli accessi basati sulle classi emissive EURO",
      "registrazione/esenzioni e autorizzazioni di ingresso secondo le regole locali",
      "dati di esposizione residenziale da modello ad alta risoluzione ATMO-Street (2016–2022)",
      "dati sanitari amministrativi di rimborso delle cure (2014–2023)",
      "confronti longitudinali con 17 città senza LEZ e aree adiacenti",
      "monitoraggio delle differenze di esposizione fra quartieri secondo indice di deprivazione"
    ],
    "outcomes": [
      "NO₂ annuale e intensità relativa di riduzione rispetto ai controlli",
      "PM₂.₅, PM₁₀ e black carbon nelle aree LEZ e adiacenti",
      "differenze di esposizione nei quartieri per deprivazione socioeconomica",
      "uso cronico di farmaci per diabete, malattie respiratorie, cardiovascolari, antidepressivi e antitrombotici come proxy sanitari"
    ],
    "evidenceStrength": "moderata",
    "evaluationStudies": [
      {
        "label": "Bruyneel et al. (2025), Environment International 199:109515 — articolo originale open access",
        "url": "https://www.sciencedirect.com/science/article/pii/S0160412025002661",
        "doi": "10.1016/j.envint.2025.109515",
        "citation": "Bruyneel, L., Cox, B., Stauffer, A., Vandenthoren, L., Fierens, F., Nawrot, T. S. e Horemans, C. (2025). Positive impact of the introduction of low-emission zones in Antwerp and Brussels on air quality, socio-economic disparities and health: a quasi-experimental study. Environment International 199, 109515. Pubblicato il 1 maggio 2025."
      },
      {
        "label": "PubMed — scheda verificabile dell'articolo peer-reviewed",
        "url": "https://pubmed.ncbi.nlm.nih.gov/40328086/",
        "citation": "National Library of Medicine, PMID 40328086; doi:10.1016/j.envint.2025.109515."
      },
      {
        "label": "Mutualités Libres — rapporto del gruppo autore della valutazione",
        "url": "https://www.mloz.be/fr/news/zones-de-basses-emissions-quel-impact-sur-la-qualite-de-lair-et-la-sante-en-belgique",
        "citation": "Mutualités Libres/Onafhankelijke Ziekenfondsen, comunicazione ufficiale della ricerca con stime osservate 2016–2022."
      }
    ],
    "lastVerifiedAt": "2026-11-20",
    "transferabilityItaly": "Trasferibile principalmente l'approccio valutativo, che confronta l'andamento di NO₂ e black carbon con città o zone comparabili e analizza esiti distributivi e costi di mobilità; non è giustificato istituire automaticamente una LEZ in un comune italiano senza misurare criticità locali, basi giuridiche, flussi di traffico, alternative di trasporto e sostenibilità.",
    "implementability": "strutturale",
    "capacityDataNeeds": [
      "serie storiche NO₂/PM₂.₅ e altri inquinanti con siti o modelli comparabili e metadati",
      "flussi origine-destinazione e composizione emissiva del parco veicolare",
      "piano generale del traffico urbano, competenze regolatorie e valutazione legale",
      "indicatori di esposizione e vulnerabilità a scala aggregata e privacy by design",
      "valutazione d'impatto economico e accessibilità per categorie vulnerabili",
      "piano di valutazione ex ante con aree di controllo, test pre-trend e verifiche di spillover",
      "risorse per informazione, deroghe proporzionate e gestione ricorsi"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-20",
        "note": "Discovery tramite Parallel Search su interventi urbani europei; lettura diretta dell'articolo originale Environment International (testo completo, tabelle 2 e 4, sezione limiti), fonti amministrative di Antwerpen e Bruxelles e portale PGTU Lamezia; deduplicazione per ente, territorio e DOI contro le PR e l'archivio. Separati i due programmi territoriali, pur condividendo la stessa valutazione. Nessun effetto sanitario clinico o bilancio economico netto attribuito senza evidenza."
      }
    ],
    "id": "antwerp-belgium-low-emission-zone-air-quality-2017",
    "title": "Anversa: zona a basse emissioni e riduzione accelerata dell'esposizione urbana a NO₂",
    "authority": "Stad Antwerpen (Comune di Anversa), nel quadro normativo della Regione fiamminga",
    "territory": "Anversa, centro urbano e quartiere Linkeroever",
    "implementationYear": "Febbraio 2017; dati ambientali di valutazione 2016–2022, sanitari 2014–2023",
    "measure": "A partire da febbraio 2017 il Comune di Anversa ha istituito una Low Emission Zone (LEZ) nel centro e a Linkeroever: accesso ai veicoli regolato da standard EURO e tipo di alimentazione, sistema di verifica, registrazioni e deroghe. Misura comunale realmente introdotta e mantenuta con modifiche regolamentari successive.",
    "population": "Residenti e utenti delle zone regolate, proprietari di veicoli che intendono accedervi e residenti nelle zone limitrofe; nello studio, sottocampione di Anversa di una coorte totale di 420.007 individui, con 17 città di controllo.",
    "territorialScale": "Zona urbana centrale, inclusi quartieri limitrofi analizzati entro fasce 1, 1–2 e 2–5 km; politica del Comune di Anversa.",
    "interventionStatus": "LEZ attiva al 20 novembre 2026; condizioni aggiornate nel tempo e criteri non identici a quelli vigenti al lancio del 2017.",
    "evaluationMethod": "Valutazione quasi-sperimentale osservazionale: modello longitudinale a effetti casuali con tempo, gruppo, baseline e interazione tempo×esposizione per inquinanti; comparatore fiammingo, 2016–2022. Per esiti sanitari comparative interrupted time series pesata per inverse propensity score, 2014–2023. Non RCT; pre-trend ambientali non direttamente verificabili per assenza di dati storici sufficienti.",
    "comparator": "Residenti di città fiamminghe prive di LEZ e relative aree adiacenti, selezionate dal pool di 17 città di controllo; per l'analisi sanitaria gruppi IPS-ponderati delle città senza LEZ.",
    "results": "Fra 2016 e 2022 la media residenziale di NO₂ nelle zone analizzate passa da 34,94 a 24,46 µg/m³ (−30% osservato). Nel confronto aggiustato con le città fiamminghe, NO₂ diminuisce più rapidamente di 0,712 µg/m³ per anno (interazione, p<0,0001); migliorano più rapidamente anche PM₂.₅, PM₁₀ e black carbon. Alcune aree adiacenti migliorano, ma gli effetti sono eterogenei. La differenza nella variazione di pendenza dell'uso cronico di antidiabetici è favorevole ma non significativa nel modello IPS principale (p=0,066); non è dimostrato un miglioramento clinico del diabete.",
    "effectSize": "NO₂ da 34,94 a 24,46 µg/m³, −10,48 µg/m³ o circa −30% osservato (NON effetto causale netto). Riduzione annuale aggiuntiva stimata vs città fiamminghe: NO₂ 0,712 µg/m³/anno, BC 0,047 µg/m³/anno, PM₂.₅ 0,152 µg/m³/anno, PM₁₀ 0,114 µg/m³/anno (tutte interazioni p<0,0001). Antidiabetici (cITS IPS): differenza variazione di pendenza −0,0025, p=0,066, non significativa.",
    "costsRequirements": "Lo studio non rende disponibile il costo economico integrale della LEZ né il costo per µg/m³ evitato. Occorrono deliberazione e base giuridica, segnaletica, controlli, sistema informativo, registrazione/esenzioni, alternative di accessibilità, analisi dell'impatto distributivo e risorse per la valutazione.",
    "limitations": [
      "La riduzione grezza del 30% non misura l'impatto causale isolato della LEZ: miglioramenti generali di qualità dell'aria hanno interessato anche i controlli.",
      "Disponibilità di esposizioni residenziali modellate soltanto dal 2016 impedisce di verificare i trend paralleli pre-intervento per la qualità dell'aria.",
      "Anversa ha adottato altre politiche di mobilità (es. estensione zone 30 nel 2018), mentre anche alcune città di controllo hanno cambiato politiche urbane.",
      "Il calo di inquinanti nel 2020 può riflettere anche le restrizioni COVID-19; le misure di esposizione derivano da modelli, non da sensori individuali.",
      "Gli outcome sanitari derivano da rimborsi farmaceutici e non da diagnosi cliniche; il risultato per antidiabetici di Anversa non è statisticamente significativo nel modello ponderato principale.",
      "Indice di deprivazione basato su dati 2011 e possibili cambiamenti compositivi dei quartieri; nessuna analisi del costo completo o delle difficoltà d'accesso economiche dei residenti."
    ],
    "unintendedEffects": "Non è disponibile una valutazione causale completa dei costi per persone e attività che possiedono veicoli non conformi né dei possibili spostamenti dei flussi; lo studio riscontra miglioramenti anche nelle aree adiacenti, non prova l'assenza universale di traffico deviato. Costi di sostituzione veicoli e accessibilità sono potenziali rischi distributivi, non danni misurati da questo studio.",
    "primarySource": {
      "label": "Comune di Anversa — quadro normativo e delibere sulla LEZ dal 2016",
      "url": "https://www.antwerpen.be/info/wetgeving-lage-emissiezone-lez"
    },
    "lameziaAdaptation": "Lamezia ha avviato l'aggiornamento del PGTU nel 2026 con oltre 450 questionari. Prima di qualunque limitazione, definire con Comune, ARPACAL e Regione un quadro dei livelli e delle fonti del NO₂, concentrazioni da traffico nei punti sensibili, dati sui flussi e un comparatore credibile; pubblicare indicatori per area e possibili effetti distributivi. Esaminare inizialmente soluzioni proporzionate (flussi, soste, accessibilità scolastica, trasporto pubblico) evitando di presentare la LEZ come soluzione immediata.",
    "tags": [
      "Anversa",
      "Antwerpen",
      "Belgio",
      "2017",
      "LEZ",
      "NO2",
      "black carbon",
      "PM2.5",
      "aria urbana",
      "modelli effetti casuali",
      "quasi-esperimento",
      "spillover",
      "mobilità",
      "PGTU",
      "2025"
    ]
  },
  {
    "country": "Belgio",
    "problem": "L'esposizione urbana agli inquinanti da traffico (NO₂, black carbon, PM₂.₅ e PM₁₀), la disuguaglianza territoriale dell'esposizione e i possibili effetti sulla salute; necessità di valutare le limitazioni alla circolazione separando le tendenze generali dai risultati associati alla politica.",
    "mechanism": "La limitazione dell'accesso ai veicoli che non rispettano determinati standard emissivi mira a modificare il parco veicolare che attraversa la zona e a diminuire le emissioni locali. L'effetto empirico è stimato sul cambiamento della pendenza delle serie di esposizione rispetto alle città di controllo; non isola in modo perfetto la LEZ da altre politiche concomitanti.",
    "primaryArea": "ambiente_clima_energia",
    "secondaryAreas": [
      "mobilita_spazio_pubblico",
      "salute_pubblica_locale",
      "welfare_inclusione_servizi_sociali"
    ],
    "interventionTypes": [
      "regolazione",
      "enforcement_controllo",
      "infrastruttura_digitale",
      "informazione_trasparenza",
      "targeting_data_analytics"
    ],
    "tools": [
      "delimitazione territoriale e controlli accessi basati sulle classi emissive EURO",
      "registrazione/esenzioni e autorizzazioni di ingresso secondo le regole locali",
      "dati di esposizione residenziale da modello ad alta risoluzione ATMO-Street (2016–2022)",
      "dati sanitari amministrativi di rimborso delle cure (2014–2023)",
      "confronti longitudinali con 17 città senza LEZ e aree adiacenti",
      "monitoraggio delle differenze di esposizione fra quartieri secondo indice di deprivazione"
    ],
    "outcomes": [
      "NO₂ annuale e intensità relativa di riduzione rispetto ai controlli",
      "PM₂.₅, PM₁₀ e black carbon nelle aree LEZ e adiacenti",
      "differenze di esposizione nei quartieri per deprivazione socioeconomica",
      "uso cronico di farmaci per diabete, malattie respiratorie, cardiovascolari, antidepressivi e antitrombotici come proxy sanitari"
    ],
    "evidenceStrength": "moderata",
    "evaluationStudies": [
      {
        "label": "Bruyneel et al. (2025), Environment International 199:109515 — articolo originale open access",
        "url": "https://www.sciencedirect.com/science/article/pii/S0160412025002661",
        "doi": "10.1016/j.envint.2025.109515",
        "citation": "Bruyneel, L., Cox, B., Stauffer, A., Vandenthoren, L., Fierens, F., Nawrot, T. S. e Horemans, C. (2025). Positive impact of the introduction of low-emission zones in Antwerp and Brussels on air quality, socio-economic disparities and health: a quasi-experimental study. Environment International 199, 109515. Pubblicato il 1 maggio 2025."
      },
      {
        "label": "PubMed — scheda verificabile dell'articolo peer-reviewed",
        "url": "https://pubmed.ncbi.nlm.nih.gov/40328086/",
        "citation": "National Library of Medicine, PMID 40328086; doi:10.1016/j.envint.2025.109515."
      },
      {
        "label": "Mutualités Libres — rapporto del gruppo autore della valutazione",
        "url": "https://www.mloz.be/fr/news/zones-de-basses-emissions-quel-impact-sur-la-qualite-de-lair-et-la-sante-en-belgique",
        "citation": "Mutualités Libres/Onafhankelijke Ziekenfondsen, comunicazione ufficiale della ricerca con stime osservate 2016–2022."
      }
    ],
    "lastVerifiedAt": "2026-11-20",
    "transferabilityItaly": "Trasferibile principalmente l'approccio valutativo, che confronta l'andamento di NO₂ e black carbon con città o zone comparabili e analizza esiti distributivi e costi di mobilità; non è giustificato istituire automaticamente una LEZ in un comune italiano senza misurare criticità locali, basi giuridiche, flussi di traffico, alternative di trasporto e sostenibilità.",
    "implementability": "strutturale",
    "capacityDataNeeds": [
      "serie storiche NO₂/PM₂.₅ e altri inquinanti con siti o modelli comparabili e metadati",
      "flussi origine-destinazione e composizione emissiva del parco veicolare",
      "piano generale del traffico urbano, competenze regolatorie e valutazione legale",
      "indicatori di esposizione e vulnerabilità a scala aggregata e privacy by design",
      "valutazione d'impatto economico e accessibilità per categorie vulnerabili",
      "piano di valutazione ex ante con aree di controllo, test pre-trend e verifiche di spillover",
      "risorse per informazione, deroghe proporzionate e gestione ricorsi"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-20",
        "note": "Discovery tramite Parallel Search su interventi urbani europei; lettura diretta dell'articolo originale Environment International (testo completo, tabelle 2 e 4, sezione limiti), fonti amministrative di Antwerpen e Bruxelles e portale PGTU Lamezia; deduplicazione per ente, territorio e DOI contro le PR e l'archivio. Separati i due programmi territoriali, pur condividendo la stessa valutazione. Nessun effetto sanitario clinico o bilancio economico netto attribuito senza evidenza."
      }
    ],
    "id": "brussels-capital-region-low-emission-zone-air-quality-health-2018",
    "title": "Regione Bruxelles-Capitale: LEZ regionale, qualità dell'aria e disuguaglianze di esposizione",
    "authority": "Brussels-Capital Region (Regione di Bruxelles-Capitale), non il solo Comune di Bruxelles",
    "territory": "Regione di Bruxelles-Capitale, 19 comuni; zone limitrofe analizzate",
    "implementationYear": "1 gennaio 2018; evoluzione progressiva degli standard fino al 2026, valutazione 2016–2022 e 2014–2023",
    "measure": "Zona a basse emissioni operativa dal 1 gennaio 2018, estesa a quasi tutto il territorio dei 19 comuni della Regione di Bruxelles-Capitale, con esclusioni territoriali specifiche, criteri d'accesso per veicoli secondo standard emissivi, verifica automatizzata, eccezioni, registrazioni e pass temporanei. Competenza regionale.",
    "population": "Residenti e utenti della Regione, inclusi nuclei socioeconomicamente vulnerabili e residenti nelle aree limitrofe; coorte complessiva dell'articolo 420.007 persone in città LEZ, aree adiacenti e 17 città di controllo.",
    "territorialScale": "Regione urbana comprendente 19 comuni; valutazione di LEZ e anelli adiacenti per inquinanti e differenze fra quartieri.",
    "interventionStatus": "Zona a basse emissioni attiva al 20 novembre 2026. Dal 1 gennaio 2026 sono cambiati alcuni standard di accesso; non si possono proiettare le stime 2018–2022 sull'assetto attuale senza nuova valutazione.",
    "evaluationMethod": "Quasi-esperimento: modelli longitudinali a effetti casuali per inquinanti (2016–2022), confronto con città fiamminghe e valloni senza LEZ, più analisi della deprivazione dei quartieri. Per indicatori sanitari, comparative interrupted time series con pesi da propensity score (2014–2023) e variazione differenziale delle pendenze. Non randomizzato; impossibilità di testare direttamente pre-trend dell'aria.",
    "comparator": "Città di controllo del Belgio senza LEZ (17 nel totale della ricerca), distinte fra Fiandre e Vallonia, e aree adiacenti di tali città; per uso di farmaci, controlli ponderati per caratteristiche osservabili pre-intervento.",
    "results": "La media residenziale NO₂ a Bruxelles passa da 29,44 µg/m³ (2017) a 18,53 (2022): −37% osservato, non l'effetto causale netto. Nel modello il declino annuale è 0,799 µg/m³ più rapido rispetto ai controlli fiamminghi e 0,765 più rapido di quelli valloni (p<0,0001). Black carbon e particolato migliorano relativamente più in fretta. Nei quartieri più deprivati di Bruxelles NO₂ e black carbon registrano diminuzioni più rapide rispetto a quartieri meno deprivati, ma persistono differenze di livello. L'incremento annuale dell'uso cronico di farmaci antidiabetici cresce meno rapidamente che nei controlli di 0,11 punti percentuali all'anno (cITS IPS, p=0,0283); non equivale a una diminuzione della prevalenza clinica del diabete.",
    "effectSize": "NO₂ 29,44→18,53 µg/m³ (−10,91; circa −37%, variazione totale osservata). Pendenza annua aggiuntiva rispetto a città senza LEZ: NO₂ −0,799 µg/m³/anno vs Fiandre e −0,765 vs Vallonia, p<0,0001; per BC −0,045 vs Fiandre e −0,008 vs Vallonia, entrambi p<0,0001. CITS IPS: differenza di variazione di pendenza dell'uso cronico antidiabetici −0,0011 (−0,11 punti percentuali/anno), p=0,0283; altri quattro outcome farmaceutici senza cambiamento differenziale significativo.",
    "costsRequirements": "Nessun bilancio costi-benefici integrale fornito dallo studio. L'intervento richiede competenza regionale, cornice legale e regolamenti, infrastruttura digitale di controllo e sanzione, deroghe e pass, comunicazione multilingue, alternative TPL e valutazione dell'accessibilità per nuclei a basso reddito e servizi essenziali.",
    "limitations": [
      "La riduzione grezza del 37% incorpora anche trend generali e misure concomitanti; non è una stima dell'effetto causale isolato della LEZ.",
      "I dati d'esposizione modellata disponibili dal 2016 non permettono di testare l'ipotesi di parallel trends nel periodo precedente.",
      "Altre politiche di mobilità (Bruxelles zona 30 nel 2022) e differenze con le città di controllo possono confondere i risultati; anno 2020 alterato dalle restrizioni COVID.",
      "Indicatore sanitario: utilizzo cronico di medicinali rimborsati, non diagnosi effettive o incidenza del diabete; mancano fattori clinici e comportamentali come dieta e fumo.",
      "Analisi multipla di diversi outcome sanitari: la significatività del solo indicatore antidiabetici (p=0,0283) va interpretata con particolare cautela.",
      "Indice territoriale di deprivazione costruito con dati del 2011, senza misura completa del mutamento di composizione sociale successivo.",
      "Studio non valuta direttamente impatti su piccoli commerci, costi familiari del cambio veicolo o compromessi su accessibilità e benessere."
    ],
    "unintendedEffects": "Possibili oneri per famiglie, pendolari, artigiani e imprese con veicoli non ammessi non quantificati in questa valutazione; non presentare tali potenziali effetti come danni osservati. La riduzione maggiore in aree svantaggiate non elimina le disuguaglianze nei livelli di esposizione. Miglioramenti rilevati in zone vicine non escludono effetti avversi su specifici corridoi.",
    "primarySource": {
      "label": "Regione di Bruxelles-Capitale — portale ufficiale zona a basse emissioni",
      "url": "https://lez.brussels/"
    },
    "lameziaAdaptation": "Il PGTU di Lamezia avviato nel 2026 prevede indagini di mobilità e consultazione cittadina (>450 questionari). Elaborare una prima diagnosi ambientale e distributiva per i principali assi e servizi cittadini, con ARPACAL, Comune e Regione: NO₂/PM, flussi, parco veicoli, fasce di reddito aggregate, accesso a scuole e servizi essenziali. Valutare prima le alternative di riduzione dell'esposizione e i relativi costi; solo in presenza di un problema documentato e di requisiti giuridici e di trasporto adatti considerare una regolazione degli accessi, predefinendo confronti e mitigazioni per i gruppi vulnerabili.",
    "tags": [
      "Bruxelles",
      "Brussels",
      "Belgio",
      "2018",
      "zona a basse emissioni",
      "LEZ regionale",
      "NO2",
      "black carbon",
      "2016–2022",
      "salute pubblica",
      "antidiabetici",
      "disuguaglianze",
      "cITS",
      "propensity score",
      "mobilità",
      "PGTU"
    ]
  }
];
