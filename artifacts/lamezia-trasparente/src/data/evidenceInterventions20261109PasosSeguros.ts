import type { EvidenceIntervention } from "./evidenceInterventions";

/** Pasos Seguros, Ciudad de México: peer-reviewed quasi-experimental evidence + municipal implementation. Verified 2026-11-09. */
export const EVIDENCE_INTERVENTIONS_2026_11_09_PASOS_SEGUROS: readonly EvidenceIntervention[] = [
  {
    "id": "mexico-city-pasos-seguros-intersection-redesign-did-2015",
    "title": "Città del Messico: riqualificazione integrata degli incroci per ridurre gli investimenti pedonali (Pasos Seguros)",
    "authority": "Gobierno de la Ciudad de México, Autoridad del Espacio Público e uffici responsabili della sicurezza stradale e della mobilità",
    "territory": "Città del Messico (incroci su corridoi stradali principali)",
    "country": "Messico",
    "implementationYear": "2015–2017 (tre fasi di Pasos Seguros; 91 intersezioni incluse nella valutazione)",
    "problem": "Incroci pericolosi sulle arterie urbane, con investimenti di pedoni e ostacoli fisici all'attraversamento sicuro; necessità di intervenire sulla geometria delle strade anziché limitarsi alla sensibilizzazione.",
    "measure": "Riqualificazione fisica mirata di incroci individuati come punti critici: attraversamenti pedonali più visibili, ampliamento dei marciapiedi, isole di rifugio, restringimento/riduzione delle corsie, semafori e segnali pedonali con adeguamento dei tempi di attraversamento; campagna di sensibilizzazione di pedoni e automobilisti. Programma progressivo effettivamente attuato nel 2015–2017.",
    "mechanism": "Riduce distanze e tempo di esposizione dei pedoni alla carreggiata, rende gli attraversamenti visibili, crea spazi di attesa protetti e regola l'interazione tra flussi pedonali e automobilistici. L'eventuale riduzione degli incidenti è attribuibile al pacchetto, non a una singola componente.",
    "population": "Pedoni e altri utenti della strada che utilizzano gli incroci trattati; 91 incroci separati almeno 80 metri da altri interventi analizzati in uno studio con incroci di controllo appaiati.",
    "primaryArea": "mobilita_spazio_pubblico",
    "secondaryAreas": [
      "sicurezza_urbana_prevenzione",
      "salute_pubblica_locale",
      "urbanistica_rigenerazione"
    ],
    "interventionTypes": [
      "infrastruttura_fisica",
      "regolazione",
      "nudging_comunicazione",
      "targeting_data_analytics"
    ],
    "tools": [
      "identificazione di intersezioni ad alta incidentalità",
      "allargamento marciapiedi e isole salvagente",
      "attraversamenti visibili e segnaletica",
      "riduzione/riconfigurazione corsie",
      "semafori pedonali e revisione dei tempi",
      "dati georeferenziati C5 sulle collisioni",
      "sopralluoghi e verifica fotografica storica"
    ],
    "territorialScale": "Intersezione stradale e corridoi di mobilità; programma metropolitano con 91 incroci oggetto di valutazione.",
    "interventionStatus": "Intervento storico attuato a partire dal 2015; l'analisi riguarda opere 2015–2017 e non certifica manutenzione o assetto attuale di ciascun incrocio. Il programma più ampio si è evoluto nel tempo.",
    "evaluationMethod": "Valutazione quasi-sperimentale con selezione di incroci di controllo non trattati, propensity score matching (due controlli per trattato, vicini e sulle stesse arterie), modello binomiale negativo a intercette casuali e difference-in-differences su osservazioni mensili per 12 mesi prima e 12 dopo. Gli autori riportano controllo dell'ipotesi dei trend paralleli in appendice. Analisi QCA descrittiva delle combinazioni di componenti e sensibilità per tutti gli incidenti.",
    "comparator": "Incroci non trattati della medesima rete stradale, individuati a distanze di 100–800 m e appaiati per caratteristiche infrastrutturali e ambientali; non randomizzazione. Le differenze iniziali di incidentalità fra trattati e controlli sono significative, perciò la stima si basa sulla differenza delle variazioni, non sui livelli.",
    "outcomes": [
      "numero mensile di collisioni con investimento di pedone (feriti e deceduti)",
      "collisioni con feriti pedoni",
      "collisioni con decessi pedoni confermati sul posto",
      "collisioni complessive tra utenti della strada"
    ],
    "results": "Sui 91 incroci trattati analizzati, il confronto quasi-sperimentale stima una riduzione relativa del 21% degli incidenti pedonali documentati rispetto all'evoluzione negli incroci di controllo. L'effetto relativo sugli incidenti con feriti è simile, mentre quello sui decessi NON è statisticamente significativo. Nel test di sensibilità diminuiscono anche gli incidenti totali. Lo studio non identifica effetti causali delle singole componenti o benefici sul lungo periodo.",
    "effectSize": "Tabella 3 articolo originale: incidenti pedonali RR 0,79 (IC95% 0,62–0,99), differenza nelle variazioni −0,16 incidenti/intersezione/mese (IC95% −0,26 a −0,06); incidenti con feriti RR 0,79 (IC95% 0,62–1,00; stima borderline), DiD −0,15 (−0,25 a −0,05); decessi RR 0,61 (IC95% 0,13–2,92), NON significativo; tutti gli incidenti RR 0,86 (IC95% 0,74–0,98) nella sensitivity analysis. NON interpretare il −21% come riduzione certa dei morti o stima direttamente trasferibile.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Richiede progettazione stradale conforme alla normativa, disponibilità delle aree, infrastrutture e semafori, accordi fra Comune e gestori della strada, cantierizzazione e manutenzione; accesso a dati di incidentalità e volumi di traffico. La valutazione scientifica non contiene un costo unitario verificato né una stima costi-benefici; occorrono prezziari e computi italiani. Fonti amministrative storiche presentano diverse enumerazioni delle prime opere (54/56 incroci nel 2015).",
    "limitations": [
      "Selezione degli incroci ad alta incidentalità non casuale; l'appaiamento e DiD rafforzano il confronto ma non escludono confondenti non osservati o regressione verso la media.",
      "Al baseline gli incroci trattati presentavano tassi di incidenti significativamente superiori ai controlli; la comparabilità dei trend è più importante dell'uguaglianza dei livelli.",
      "Le date esatte delle opere non erano nei registri amministrativi e sono state ricostruite da immagini storiche Google Street View: per il 24% il periodo di incertezza era 7–12 mesi e per l'8% oltre un anno.",
      "I dati C5 registrano soprattutto eventi con feriti/decessi confermati sul posto; escludono investimenti senza lesioni e alcuni decessi successivi, dunque non equivalgono al totale delle conseguenze sanitarie.",
      "Mancano conteggi diretti dei flussi di pedoni e veicoli per incrocio; lo studio usa proxy ambientali.",
      "Solo 12 mesi pre/post e insufficiente potenza statistica per mortalità; non è dimostrata la persistenza oltre il follow-up.",
      "L'analisi delle combinazioni infrastrutturali è associativa (QCA) e non separa causalmente il contributo di singoli elementi."
    ],
    "unintendedEffects": "Non sono valutati compiutamente spostamenti di traffico, effetti su tempi bus/emergenze, accessibilità per persone con disabilità o costi di manutenzione. L'analisi di sensibilità trova una riduzione degli incidenti complessivi nel periodo, ma non prova assenza di effetti indesiderati.",
    "primarySource": {
      "label": "Gobierno de la Ciudad de México / SEDUVI — Cuarto Informe de Labores, sezione Pasos Seguros (attuazione 2015, pp. 68–69)",
      "url": "https://www.seduvi.cdmx.gob.mx/storage/app/uploads/public/5ad/914/c21/5ad914c21d7ef723961049.pdf"
    },
    "evaluationStudies": [
      {
        "label": "Articolo originale integrale (PubMed Central, BMJ)",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7614172/",
        "citation": "Cárdenas-Cárdenas, L. M. et al. (2023). One-year impact of a multicomponent, street-level design intervention in Mexico City on pedestrian crashes: a quasi-experimental study. Journal of Epidemiology and Community Health 77(3):140–146.",
        "doi": "10.1136/jech-2022-219335"
      },
      {
        "label": "BMJ — pubblicazione peer-reviewed (DOI)",
        "url": "https://doi.org/10.1136/jech-2022-219335",
        "citation": "Cárdenas-Cárdenas et al. (2023), Journal of Epidemiology & Community Health, 77, 140–146.",
        "doi": "10.1136/jech-2022-219335"
      }
    ],
    "lastVerifiedAt": "2026-11-09",
    "transferabilityItaly": "Alta per il principio di protezione fisica degli attraversamenti, ma la progettazione deve rispettare Codice della strada, normativa tecnica, accessibilità universale, visibilità, competenza dell'ente proprietario, sicurezza semaforica e flussi di trasporto pubblico. La stima −21% è contestuale, non un obiettivo di riduzione garantito per comuni italiani.",
    "lameziaAdaptation": "Integrare il PGTU di Lamezia Terme (consultazione comunale del marzo 2026) con un censimento georeferenziato e prioritizzato degli incroci a rischio nei centri di Nicastro, Sambiase e Sant'Eufemia e nei percorsi casa-scuola. Per 8–12 attraversamenti idonei, verificare volumi, collisioni pre-intervento, visibilità, accessibilità e competenze; progettare isole di rifugio, ampliamento marciapiedi, segnaletica e tempi semaforici dove necessario. Attuare per fasi su incroci comparabili con protocolli di sicurezza e controllo tecnico; valutare prima/dopo con comparatori, misurando incidenti, velocità, conflitti di traffico e accessibilità, non solo numero di strisce ridipinte.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "registro georeferenziato sinistri di Polizia Locale e altre autorità (almeno 3–5 anni)",
      "rilievi di flusso pedonale, veicolare e velocità, inclusi attraversamenti scolastici",
      "mappa di strade comunali/provinciali/statali e responsabilità progettuali",
      "audit progettuale su Codice della strada, accessibilità e trasporto pubblico",
      "budget opere e manutenzione con prezziari regionali",
      "protocollo di valutazione con incroci di controllo, baseline, finestre temporali predefinite e privacy"
    ],
    "tags": [
      "Pasos Seguros",
      "Ciudad de México",
      "Messico",
      "sicurezza pedonale",
      "attraversamenti",
      "incroci",
      "traffic calming",
      "difference-in-differences",
      "propensity score matching",
      "sicurezza stradale",
      "PGTU",
      "Lamezia Terme"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-09",
        "note": "Primo censimento: verificati direttamente studio originale BMJ/PMC (metodo, tabella 3, limiti e date ricostruite da Street View), rapporto istituzionale di attuazione di Città del Messico e PGTU Lamezia. Distinta evidenza DiD −21% da mortalità non significativa e dai claim before-after dell'ente. Confrontato con 55 moduli dell'archivio su main: assenza di duplicati per programma, città e DOI."
      }
    ]
  }
];
