import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_27: readonly EvidenceIntervention[] = [
  {
    "id": "jerico-colombia-water-consumption-social-norm-reports-rct",
    "title": "Report mensili comparativi sui consumi idrici domestici per favorire il risparmio d'acqua",
    "authority": "Empresas Públicas de Jericó (EPJ), in collaborazione con la municipalità di Jericó e ricercatori dell'Università di Göteborg / Universidad de Concepción",
    "territory": "Jericó, dipartimento di Antioquia",
    "country": "Colombia",
    "implementationYear": "2013 (invio di report da gennaio 2013 per circa un anno)",
    "problem": "Consumi idrici domestici elevati, risorsa idrica sovrautilizzata e insufficiente consapevolezza del consumo individuale; incentivi tariffari alla riduzione del consumo relativamente deboli.",
    "measure": "Il gestore pubblico dell'acqua ha allegato mensilmente alla bolletta report personalizzati con il consumo registrato, confronti con utenze domestiche di composizione familiare simile, giudizi descrittivi sul consumo e informazioni sulle conseguenze ambientali. I report erano facoltativi e interrompibili su richiesta.",
    "mechanism": "Feedback ripetuto, confronto sociale con famiglie comparabili e salienza dei costi ambientali permettono di identificare sprechi e orientare le abitudini di consumo senza aumentare le tariffe.",
    "population": "1.311 nuclei residenti urbani partecipanti alla randomizzazione (656 assegnati ai report e 655 al controllo interno); il sotto-campione analitico dei contatori sempre funzionanti comprende 956 famiglie. Ulteriori 500 famiglie di Támesis fungono da confronto esterno per analizzare gli spillover.",
    "primaryArea": "ambiente_clima_energia",
    "secondaryAreas": [
      "capacita_amministrativa_personale",
      "digitalizzazione_servizi_online",
      "welfare_inclusione_servizi_sociali"
    ],
    "interventionTypes": [
      "nudging_comunicazione",
      "informazione_trasparenza",
      "modifica_organizzativa_processo",
      "targeting_data_analytics"
    ],
    "tools": [
      "dati mensili di consumo e letture dei contatori",
      "report cartacei allegati alla bolletta",
      "raggruppamento comparativo per adult-equivalent units",
      "confronto con media e quartile più efficiente",
      "messaggi descrittivi e normativi",
      "opzione di non ricevere ulteriori report"
    ],
    "territorialScale": "Municipio, utenze residenziali urbane; confronto di supporto con il vicino municipio di Támesis.",
    "interventionStatus": "Campagna sperimentale implementata e conclusa nel 2013–2014; non è documentata dalle fonti consultate la prosecuzione dello stesso protocollo a regime nel 2026.",
    "evaluationMethod": "Esperimento randomizzato sul destinatario dei report all'interno di Jericó, stimato tramite difference-in-differences su consumi amministrativi mensili e stagionalità. La componente di spillover usa anche 500 utenze di Támesis come controllo esterno NON randomizzato a livello municipale; analisi di robustezza sul sotto-campione dei contatori sempre funzionanti.",
    "comparator": "655 utenze di Jericó randomizzate a nessun report aggiuntivo, per l'effetto diretto; 500 utenze di Támesis non esposte alla campagna come ulteriore confronto non randomizzato per gli effetti indiretti.",
    "outcomes": [
      "consumo idrico residenziale mensile in metri cubi",
      "effetto diretto dei report",
      "effetti indiretti sui residenti non destinatari",
      "eterogeneità per consumi iniziali e reddito"
    ],
    "results": "La campagna ha ridotto statisticamente il consumo idrico delle utenze direttamente destinatarie rispetto al controllo randomizzato: riduzione stimata circa 4,6% a sei mesi e 5,45% a undici mesi nel campione complessivo; nel sotto-campione dei contatori sempre funzionanti gli effetti salgono a circa 5,84% e 6,82%. L'effetto è maggiore tra utenze con elevati consumi iniziali e famiglie relativamente abbienti. Gli autori segnalano un possibile spillover del 5,8% sui non destinatari nei primi sei mesi, basato su un confronto con Támesis meno solido del confronto randomizzato interno; non identificano un meccanismo convincente di diffusione tramite specifiche reti sociali.",
    "effectSize": "Difference-in-differences diretta, 1.311 nuclei: −4,605% a sei mesi (p<0,05) e −5,447% a undici mesi (p<0,01). Sottocampione 956 nuclei con contatori funzionanti: −5,844% a sei mesi e −6,822% a undici mesi (entrambi p<0,01), Tabella 3 del discussion paper 2016; articolo JEEM 2018 sintetizza 'fino a −6,8%'. Spillover stimato −5,8% nei sei mesi, non identificato da randomizzazione municipale.",
    "evidenceStrength": "forte",
    "costsRequirements": "Serve accesso autorizzato ai dati mensili per utenza, letture effettive e controllo qualità dei contatori, segmentazione comparabile della composizione domestica, stampa/inserimento o invio elettronico dei report, gestione opt-out, analisi indipendente. Lo studio non offre un costo netto per m³ di acqua risparmiata trasferibile a Lamezia.",
    "limitations": [
      "La stima −6,8% è ottenuta sul sotto-campione dei contatori sempre funzionanti (956 su 1.311); la selezione potrebbe limitare la generalizzabilità, mentre la stima full sample è inferiore.",
      "Il confronto per gli spillover con Támesis non deriva da randomizzazione tra città e può risentire di shock locali o tendenze divergenti.",
      "Un evento turistico straordinario nell'aprile 2013 ha influenzato le serie di consumo ed è stato escluso in alcune specificazioni.",
      "Il programma combina benchmarking, norme sociali, informazioni ambientali e report ripetuti: non è possibile attribuire l'effetto a una singola componente.",
      "Contesto colombiano di sussidi e consumo di partenza elevato, differente da tariffe, usi e assetto gestionale italiano.",
      "Non sono disponibili nella pubblicazione consuntivi amministrativi e costi verificati a lungo termine né evidenza sull'effetto dopo la conclusione della campagna."
    ],
    "unintendedEffects": "Non sono documentati effetti indesiderati causalmente misurati. In fase di replica occorre prevenire l'effetto boomerang sulle utenze già virtuose, comunicazioni stigmatizzanti, confronto tra nuclei non comparabili e rischi di trattamento improprio dei dati domestici.",
    "primarySource": {
      "label": "Empresas Públicas de Jericó — servizio ufficiale di acquedotto (identità dell'ente attuatore)",
      "url": "https://eeppj.com.co/servicios/"
    },
    "evaluationStudies": [
      {
        "label": "Jaime Torres e Carlsson (2018), articolo scientifico peer-reviewed",
        "url": "https://doi.org/10.1016/j.jeem.2018.08.005",
        "citation": "Jaime Torres, M. M. e Carlsson, F. (2018), Direct and spillover effects of a social information campaign on residential water-savings, Journal of Environmental Economics and Management, 92, 222–243.",
        "doi": "10.1016/j.jeem.2018.08.005"
      },
      {
        "label": "Environment for Development / Resources for the Future — testo integrale e tabelle del trial",
        "url": "https://media.rff.org/archive/files/document/file/EfD-DP-16-05.pdf",
        "citation": "Jaime Torres, M. M. e Carlsson, F. (2016), Social Norms and Information Diffusion in Water-Saving Programs: Evidence from a Randomized Field Experiment in Colombia, EfD Discussion Paper 16-05."
      },
      {
        "label": "EfD — scheda della pubblicazione definitiva",
        "url": "https://www.efdinitiative.org/publications/direct-and-spillover-effects-social-information-campaign-residential-water-savings",
        "citation": "Environment for Development (2018), scheda istituzionale della pubblicazione sul Journal of Environmental Economics and Management."
      }
    ],
    "lastVerifiedAt": "2026-10-27",
    "transferabilityItaly": "Trasferibilità tecnica plausibile nei comuni con misuratori affidabili e letture periodiche, ma la comunicazione in bolletta compete al gestore del servizio idrico. Una replica richiede accordo con il gestore, conformità alla regolazione ARERA, trasparenza dei metodi comparativi, protezione dei dati personali, attenzione ai soggetti vulnerabili e canali analogici per gli esclusi digitali.",
    "lameziaAdaptation": "Promuovere con Sorical e ARRICAL un pilot volontario su utenze idriche residenziali di Lamezia con contatori e serie storiche verificati. Prima ricostruire le condizioni di fatturazione, le letture reali e la distribuzione dei consumi; poi confrontare per assegnazione casuale la comunicazione ordinaria con un report semplice: andamento mensile, fascia di utenze di pari numerosità familiare, consigli neutrali e opzione di rinuncia. Misurare m³/utenza a 6 e 12 mesi, persistenza, segnalazioni di anomalie e soddisfazione. Distinguere risparmio domestico misurato dalle perdite di rete e non condividere dati nominativi con il Comune.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "accordo formale con Sorical, ente gestore, e confronto istituzionale con ARRICAL",
      "verifica contatori funzionanti e letture effettive, con periodi e stagionalità comparabili",
      "accesso ai dati di consumo pseudonimizzati e protocollo GDPR",
      "caratteristiche familiari soltanto se lecite e necessarie, o confronti per profili di consumo",
      "validazione ex ante dell'esperimento e capacità di randomizzazione",
      "monitoraggio di consumi, anomalie, opt-out e costi di stampa/distribuzione",
      "canali cartacei non esclusivamente digitali"
    ],
    "tags": [
      "consumi idrici",
      "risparmio acqua",
      "Colombia",
      "Jericó",
      "randomized field experiment",
      "utility comunale",
      "norme sociali",
      "report comparativi",
      "diffusione informazione",
      "ARERA",
      "Sorical"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-27",
        "note": "Nuovo caso deduplicato rispetto ai moduli GitHub attivi e alle PR esaminate; verifica incrociata del trial completo 2016, delle stime pubblicate nel 2018 e delle fonti istituzionali EPJ/Sorical. Separata la stima sul campione intero dal sotto-campione dei contatori funzionanti e qualificata la maggiore incertezza degli spillover."
      }
    ]
  }
];
