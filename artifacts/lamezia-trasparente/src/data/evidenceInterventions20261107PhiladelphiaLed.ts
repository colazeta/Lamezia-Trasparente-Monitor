import type { EvidenceIntervention } from "./evidenceInterventions";

/** Original city and peer-reviewed sources checked 2026-11-07; DiD, NOT RCT; energy savings are projections. */
export const EVIDENCE_INTERVENTIONS_2026_11_07_PHILADELPHIA_LED: readonly EvidenceIntervention[] = [
  {
    "id": "philadelphia-citywide-led-streetlight-upgrades-crime-did-2023",
    "title": "Filadelfia: conversione progressiva dei lampioni pubblici a LED e riduzione dei reati notturni all'aperto",
    "authority": "City of Philadelphia — Department of Streets; Philadelphia Energy Authority (PEA)",
    "territory": "Philadelphia, Pennsylvania; 13.275 segmenti stradali aggiornati nel periodo di analisi",
    "country": "Stati Uniti",
    "implementationYear": "Avvio agosto 2023; studio sulla prima fase agosto 2023–maggio 2024 (programma completo previsto in 24 mesi)",
    "problem": "Illuminazione pubblica obsoleta e non uniforme, aree poco visibili di notte, elevato costo energetico e concentrazione di reati violenti in alcuni tratti urbani; necessità di integrare sicurezza e manutenzione energetica.",
    "measure": "Philly Streetlight Improvement Project: sostituzione progressiva di apparecchi HPS con LED uniformi e controllabili da remoto, con priorità iniziale ai quartieri definiti attraverso dati su reati e sinistri notturni e svantaggio territoriale. Il progetto comunale prevede circa 130.000 lampioni, ma lo studio osserva soltanto 34.374 aggiornamenti su 13.275 segmenti nel primo periodo di 10 mesi; non confondere con le torri luminose temporanee sperimentate nel 2016 nei complessi NYCHA di New York.",
    "mechanism": "Più visibilità e minori punti bui nelle ore notturne possono modificare opportunità situazionali per i reati di strada; il controllo remoto consente monitoraggio dei guasti e regolazione del flusso, con benefici energetici pianificati. Lo studio non isola sperimentalmente il contributo della visibilità da sorveglianza informale, pattugliamento e altre risposte.",
    "population": "Residenti, pedoni e altri utilizzatori delle strade di Philadelphia; 720 esagoni territoriali analizzati su 23 mesi e sottounità di tratti stradali, senza randomizzazione individuale.",
    "primaryArea": "sicurezza_urbana_prevenzione",
    "secondaryAreas": [
      "ambiente_clima_energia",
      "mobilita_spazio_pubblico",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "infrastruttura_fisica",
      "infrastruttura_digitale",
      "targeting_data_analytics",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "sostituzione di apparecchi HPS con LED a luce più uniforme e lenti diffuse",
      "Lighting Management System (LMS) per telecontrollo e guasti",
      "prioritizzazione iniziale con dati aggregati su reati e sinistri notturni e indicatori di svantaggio",
      "inventario georiferito degli upgrade e delle date di posa",
      "analisi difference-in-differences, event study e robustezza con trattamento continuo a dose variabile",
      "finanziamento con Sustainability Bond municipale e prospettive di risparmio energetico"
    ],
    "territorialScale": "Intervento infrastrutturale programmato sull'intera città, valutazione delle prime 34.374 installazioni su 13.275 segmenti urbani; non un singolo complesso abitativo.",
    "interventionStatus": "Programma comunale attuato dal 2023, con prima fase realizzata e valutata fino a maggio 2024. Lo stato effettivo di completamento di tutti i circa 130.000 apparecchi nel 2026 non è attestato dagli studi citati.",
    "evaluationMethod": "Studio quasi-sperimentale con differenze-nelle-differenze e studio degli eventi (event-study), regressioni panel a effetti fissi per esagono e mese; intensità del trattamento quale numero di lampioni convertiti. Analisi di robustezza con effetti temporali regionali, trend specifici per esagono e stimatore DiD robusto all'eterogeneità con trattamenti scaglionati. Nessuna allocazione randomizzata: installazioni avviate prioritariamente nelle zone a rischio più elevato.",
    "comparator": "Esagoni/tratti non ancora aggiornati o non aggiornati nel periodo, con confronto dei trend pre/post e controllo per effetti fissi territoriali e mensili; distribuzione delle installazioni diseguale, con livelli iniziali di reati più alti nelle aree trattate.",
    "outcomes": [
      "reati totali rilevati dalla polizia",
      "reati all'aperto in orario notturno",
      "reati con armi da fuoco all'aperto nelle ore notturne",
      "reati violenti e contro il patrimonio outdoor notturni",
      "reati indoor, nuisance e finanziari come confronti di coerenza",
      "percezione di sicurezza da interviste qualitative",
      "risparmio energetico, emissioni e bilancio economico soltanto come obiettivi/previsioni del progetto e non outcome direttamente stimati dal disegno criminologico"
    ],
    "results": "Le regressioni DiD associano il passaggio a lampioni LED a un calo statisticamente significativo dei reati notturni all'aperto, in particolare quelli con armi da fuoco. Per l'esposizione media agli upgrade nei primi 10 mesi, stima circa −15,2% di reati outdoor notturni e −21,0% di reati da arma da fuoco outdoor notturni; anche reati violenti e contro il patrimonio outdoor notturni diminuiscono. Per tutti gli orari e gli ambienti, il calo stimato totale è circa −5,1%. Nessun miglioramento statisticamente robusto per nuisance e reati finanziari. Le interviste suggeriscono percezioni favorevoli, ma non sono una valutazione randomizzata. Non è verificato un effetto persistente dopo i 10 mesi né un risparmio energetico effettivamente realizzato nello studio.",
    "effectSize": "MacDonald et al., Tabella 3 (di notte, all'aperto; effetto percentuale per variazione media LED): reati totali −15,21% (IC95% −17,58 a −12,84), gun crime −20,98% (IC95% −26,17 a −15,77), violenti −19,89% (IC95% −23,82 a −15,94), contro patrimonio −16,09% (IC95% −18,83 a −13,34). Tabella 2, tutti gli orari: reati complessivi −5,138% (IC95% −6,605 a −3,669), reati con armi −17,22% (−21,29 a −13,14). Le percentuali sono stime modellistiche DiD, non variazioni grezze della città; nessun RCT. Stima degli autori di 5% del calo cittadino delle armi non equivale a prova di quota causale esatta.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Il progetto completo è annunciato dal Comune a 91,2 milioni USD per circa 130.000 lampioni, finanziato con Sustainability Bond; è un costo di capitale dell'intero programma, NON il costo delle 34.374 conversioni analizzate. La città ha PREVISTO consumi per illuminazione −50% e neutralità finanziaria in circa 20 anni sulla base di risparmi, minore manutenzione e incentivi: previsioni ex ante non verificate dalla valutazione criminologica. Richiede censimento GIS dei corpi illuminanti, standard tecnici e fotometrici, autorizzazioni, contratto/gestore, programmi manutentivi, misura kWh e monitoraggio guasti.",
    "limitations": [
      "Studio non randomizzato: i primi aggiornamenti sono prioritizzati in aree ad alta criminalità e potrebbero coincidere con altre politiche, regressione verso la media o cambiamenti del pattugliamento; residuo confondimento possibile nonostante controlli e test.",
      "Orizzonte dello studio limitato a 10 mesi di rollout e circa 3,28 mesi medi di esposizione per area: effetti pluriennali, decadimento e manutenzione successiva non identificati.",
      "Le misure sono reati registrati dalla polizia, sensibili a variazioni di denuncia, pattugliamento e classificazione; non misurano direttamente vittimizzazione totale.",
      "Lo studio non identifica il meccanismo specifico e non attribuisce gli effetti al solo risparmio energetico, al colore della luce o al controllo remoto.",
      "Effetti su nuisance e reati finanziari non robusti; possibili correlazioni tra segnalazione di reati e trattamento.",
      "La città statunitense ha densità, reati da arma da fuoco e scala molto diversi da Lamezia; non proiettare percentuali statunitensi su un comune italiano.",
      "Le valutazioni su cost-neutrality, energia e CO2 della fonte municipale sono obiettivi progettuali ex ante e non misure consuntive verificate nello studio."
    ],
    "unintendedEffects": "La valutazione non trova chiari segnali di trasferimento dei reati ai tratti limitrofi e suggerisce una piccola diffusione di benefici, con incertezza per i sottogruppi. In un'attuazione italiana occorre monitorare abbagliamento, temperatura di colore, inquinamento luminoso, disturbo a residenti/fauna, sicurezza stradale, accessibilità e disparità di distribuzione; tali effetti ambientali non sono stati quantificati causalmente nello studio.",
    "primarySource": {
      "label": "City of Philadelphia, Department of Streets — avvio ufficiale Philly Streetlight Improvement Project (8 agosto 2023)",
      "url": "https://www.phila.gov/2023-08-09-construction-begins-on-citywide-philly-streetlight-improvement-project/"
    },
    "evaluationStudies": [
      {
        "label": "MacDonald et al., Criminology & Public Policy — articolo originale open access (tabelle 2–5)",
        "url": "https://onlinelibrary.wiley.com/doi/10.1111/1745-9133.70006",
        "citation": "MacDonald, J. M., Chalfin, A., Moritz, M., Wade, B., Mendlein, A. K., Braga, A. A., & South, E. C. (first published online 2025; volume 25(1), 2026). Can enhanced street lighting improve public safety at scale? Criminology & Public Policy, 25(1), 31–62.",
        "doi": "10.1111/1745-9133.70006"
      },
      {
        "label": "Versione integrale depositata su PubMed Central",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC13593346/",
        "citation": "MacDonald et al., testo completo open access, metodi e intervalli di confidenza; stessa valutazione, non studio indipendente."
      }
    ],
    "lastVerifiedAt": "2026-11-07",
    "transferabilityItaly": "La programmazione e manutenzione dell'illuminazione pubblica rientrano nelle competenze comunali, spesso gestite attraverso concessioni/contratti: Lamezia dispone già di servizio esternalizzato e canali di segnalazione. Il principio trasferibile è audit georeferenziato di qualità illuminotecnica + upgrade basati su bisogni + valutazione comparata. Servono verifiche di contratti esistenti, regole illuminotecniche/ambientali, prescrizioni regionali, GDPR e cooperazione con forze di polizia per indicatori aggregati; nessun Comune può presumere di ridurre del 21% la criminalità locale.",
    "lameziaAdaptation": "Prima di proporre nuovi impianti, ottenere dall'Ufficio Controllo di gestione delle manutenzioni e dal gestore City Green Light un inventario per lampione/strada (tecnologia LED o altro, potenza, flusso, guasti, manutenzione, costi e kWh). Selezionare, previa consultazione dei cittadini, alcune tratte pedonali scarsamente illuminate a Nicastro, Sambiase o Sant'Eufemia vicine a fermate, scuole o servizi, documentandone le criticità oggettive. Progettare solo upgrade compatibili con disciplina illuminotecnica e vincoli contrattuali; se l'upgrade non è già generalizzato, applicare rollout per fasi con strade comparabili e misure prima/dopo su lux, uniformità, guasti, percezione di sicurezza, accessibilità, kWh e sinistri. Per eventuali reati usare esclusivamente statistiche aggregate concordate con autorità competenti, evitare mappe stigmatizzanti. Non assumere che esistano lampioni HPS o tratti non aggiornati: prima verificare lo stato del parco.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "inventario e layer GIS degli impianti e gestore responsabile",
      "contratto di illuminazione e SLA di manutenzione già vigente",
      "storico segnalazioni CityGreenApp e tempi di chiusura guasti",
      "misure fotometriche ante/post, kWh, potenza installata e schede tecniche",
      "segmentazione strade comparabili con registrazione della data di posa",
      "informazioni aggregate su sinistri, sicurezza percepita e, se accessibili legalmente, reati registrati",
      "valutazione di costi, consumi, comfort visivo, luce intrusiva e impatti ambientali"
    ],
    "tags": [
      "Filadelfia",
      "Philly Streetlight Improvement Project",
      "LED",
      "illuminazione pubblica",
      "sicurezza urbana",
      "prevenzione situazionale",
      "difference-in-differences",
      "event study",
      "Philadelphia Energy Authority",
      "contratti di servizio",
      "risparmio energetico previsto",
      "rollout non randomizzato",
      "City Green Light",
      "Lamezia Terme"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-07",
        "note": "Prima acquisizione dopo discovery obbligatoria Parallel Search; verifica diretta dell'articolo originale Wiley (Tab. 2–3, DiD e limiti), della fonte municipale ufficiale 8 agosto 2023 e del servizio illuminazione di Lamezia. Deduplicazione verificata rispetto ai 53 moduli TS di main e alle PR cercate; distinta la conversione LED urbana Philadelphia dall'RCT NYCHA con torri mobili. Energia/costi del progetto segnalati come previsioni, non risultati scientifici."
      }
    ]
  }
];
