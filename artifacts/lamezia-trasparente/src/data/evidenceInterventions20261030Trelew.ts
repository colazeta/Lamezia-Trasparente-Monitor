import type { EvidenceIntervention } from "./evidenceInterventions";

/** Trelew cluster RCT and municipal rollout: primary sources verified on 2026-10-30. */
export const EVIDENCE_INTERVENTIONS_2026_10_30_TRELEW: readonly EvidenceIntervention[] = [
{
  "id": "trelew-argentina-recycling-sorting-simple-information-cluster-rct-2019",
  "title": "Trelew: istruzioni semplici per conferire correttamente i rifiuti riciclabili nella raccolta porta a porta",
  "authority": "Municipalidad de Trelew — Dirección de Gestión Ambiental; consorzio GIRSU Virch-Valdés, con ricercatori del German Development Institute e World Bank",
  "territory": "Trelew, Provincia del Chubut, Patagonia argentina",
  "country": "Argentina",
  "implementationYear": "Marzo 2019: sperimentazione randomizzata; novembre 2019: estensione a circa 20.000 famiglie; studio pubblicato online il 27 novembre 2021 e su rivista nel 2022",
  "problem": "La raccolta differenziata di Trelew era compromessa da sacchi di materiali secchi mescolati con rifiuti umidi conferiti nel giorno riservato ai riciclabili. La contaminazione rendeva più costosa, rischiosa e inefficace la selezione all'impianto; molti utenti non conoscevano il giorno corretto di raccolta.",
  "measure": "Co-progettazione con il Comune di una lettera illustrata con istruzioni semplici sui materiali da separare e sul giorno per esporre soltanto i riciclabili; confronto randomizzato con quattro versioni (lettera base; lettera con richiamo prosociale; lettera con calendario magnetico; combinazione completa) e controllo senza comunicazione aggiuntiva. Dopo la prova è stata distribuita la versione informativa semplice a circa 20.000 famiglie.",
  "mechanism": "Rimuovere barriere cognitive e operative: definizione semplice di secco/umido, regola di conferimento giornaliero esplicita e sequenza di azioni visivamente comprensibile; evitare errori da informazione dispersiva senza ricorrere a sanzioni o incentivi monetari.",
  "population": "Residenti di quartieri a reddito medio e alto di Trelew con raccolta porta a porta e propri cestelli: invii sperimentali a circa 4.800 destinatari, inclusa una quota di piccole attività (circa il 10%); 400 isolati randomizzati; ispezioni fisiche di 1.565 e 1.568 punti di conferimento nei due follow-up. Quartieri meno abbienti con contenitori condivisi esclusi.",
  "primaryArea": "rifiuti_pulizia_urbana",
  "secondaryAreas": [
    "ambiente_clima_energia",
    "digitalizzazione_servizi_online",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "nudging_comunicazione",
    "informazione_trasparenza",
    "modifica_organizzativa_processo",
    "targeting_data_analytics"
  ],
  "tools": [
    "lettera e infografica con istruzioni sintetiche sulla separazione",
    "regola del giorno di raccolta resa immediatamente visibile",
    "varianti sperimentali con messaggio prosociale o calendario magnetico",
    "assegnazione casuale a 400 isolati stratificati per quartiere e indirizzi",
    "ispezione di sacchi fisicamente raccolti e tracciati con QR code",
    "verifica a due settimane e sei mesi"
  ],
  "territorialScale": "Città, con assegnazione casuale per isolato e osservazione dei punti di conferimento domestici.",
  "interventionStatus": "Intervento sperimentale realizzato nel marzo 2019; rollout della comunicazione informativa nel novembre 2019 a circa 20.000 famiglie documentato dagli autori. Nel novembre 2025 il Comune ha introdotto un nuovo sistema di raccolta differenziata secco/umido: non è la stessa misura né una replica sperimentale; non è verificato che le lettere originarie siano tuttora utilizzate.",
  "evaluationMethod": "Cluster randomized controlled trial su 400 isolati (randomizzazione stratificata per quartiere e numero indirizzi), quattro bracci di trattamento e controllo; due rilevazioni indipendenti di rifiuti reali raccolti a due settimane e sei mesi. Modello multinomial logit di comportamento osservato: sacco esclusivamente secco/riciclabile, sacco contenente umido oppure nessun sacco.",
  "comparator": "Isolati randomizzati senza comunicazione aggiuntiva, sottoposti alle medesime regole preesistenti di raccolta e alle rilevazioni sul campo.",
  "outcomes": [
    "probabilità relativa (odds) di esporre un sacco contaminato con umido rispetto a un sacco di soli riciclabili",
    "probabilità relativa di nessun sacco rispetto a esposizione di soli riciclabili",
    "persistenza a sei mesi della corretta esposizione di materiali secchi",
    "eventuali conferimenti impropri e mancata esposizione",
    "tonnellate effettivamente riciclate, costi netti, contaminazione dell'intero flusso comunale e impatto del rollout: non valutati causalmente"
  ],
  "results": "Tutte e quattro le comunicazioni hanno ridotto le odds di sacchi contaminati con umido, relativamente ai sacchi di soli riciclabili, a due settimane e sei mesi. La sola lettera semplice è risultata efficace senza evidenza di un miglioramento incrementale dovuto all'appello prosociale o al calendario magnetico. Misura diretta mediante ispezione dei sacchi, non semplice autovalutazione. I 20.000 destinatari del rollout non costituiscono un campione randomizzato di valutazione.",
  "effectSize": "Lettera semplice vs controllo, odds ratio per sacco umido/misto rispetto a sacco soltanto secco: 0,32 a due settimane (p<0,001) e 0,38 a sei mesi (p<0,001), corrispondenti a odds inferiori del 68% e del 62%, rispettivamente; NON sono cali di 68/62 punti percentuali nella quota di rifiuti o di contaminazione. Altre varianti: OR 0,38–0,50 a due settimane e 0,40–0,52 a sei mesi per la stessa comparazione. Campioni fisicamente rilevati: n=1.565 e n=1.568 punti di conferimento.",
  "evidenceStrength": "forte",
  "costsRequirements": "Stampa e distribuzione di lettere chiare e infografiche, segmentazione per zone e calendari, collaborazione col gestore e personale per audit visivi dei conferimenti; il calendario magnetico non ha mostrato benefici incrementali accertati. Gli autori descrivono basso costo e scalabilità, ma non forniscono una stima monetaria sufficientemente verificabile di costo per kg recuperato né un bilancio costi-benefici municipale complessivo.",
  "limitations": [
    "Randomizzazione per isolato solo nei quartieri a reddito medio-alto con contenitori individuali: risultati non generalizzabili a zone con cassonetti condominiali e a utenze vulnerabili senza validazione.",
    "L'unità osservata è spesso il cestello esterno e non sempre il singolo nucleo: alcune famiglie condividono il punto di raccolta.",
    "Due verifiche su un singolo giorno settimanale (a due settimane e sei mesi); non quantificano l'effetto su tutti i giorni, le tonnellate o la raccolta complessiva annua.",
    "Il modello stima odds ratio fra comportamenti, non una riduzione in punti percentuali del tasso di contaminazione o del volume totale dei rifiuti.",
    "L'incremento di raccolta separata osservato nel trial non equivale necessariamente a maggiore materiale effettivamente riciclato a valle dell'impianto.",
    "Il rollout esteso a 20.000 famiglie è documentato come attuazione, non accompagnato nello studio da una nuova valutazione controfattuale indipendente.",
    "Le varianti multiple non risultano più efficaci del messaggio semplice; non è provata superiorità di comunicazioni emotive o magneti."
  ],
  "unintendedEffects": "Lo studio non rileva un aumento sistematico di conferimenti umidi rispetto a nessun sacco, con eccezione esplorativa della combinazione lettera+calendario a due settimane. Possibili inconvenienti da monitorare a Lamezia: confusione con colori e turni diversi, esposizioni fuori orario, carico aggiuntivo su operatori, materiali apparentemente separati ma non idonei, scarsa accessibilità dei messaggi.",
  "primarySource": {
    "label": "German Development Institute e World Bank — report operativo sul progetto municipale Trelew (2019)",
    "url": "https://www.idos-research.de/en/others-publications/article/using-behavioral-science-to-increase-recycling-in-argentina/"
  },
  "evaluationStudies": [
    {
      "label": "Waste Management — articolo sperimentale peer-reviewed e tabelle originali",
      "url": "https://doi.org/10.1016/j.wasman.2021.11.021",
      "citation": "Pegels, A., Castañeda, J. L., Humphreys, C., Kötter, C., Negre, M., Weidner, C. e Kutzner, F. (2022), Aligning recycling behaviors and the recycling system – Towards a full cycle of materials and behavioral methods, Waste Management, 138, 1–7.",
      "doi": "10.1016/j.wasman.2021.11.021"
    },
    {
      "label": "PubMed — scheda bibliografica indipendente dello studio e riassunto verificabile",
      "url": "https://pubmed.ncbi.nlm.nih.gov/34847465/",
      "citation": "U.S. National Library of Medicine, PMID 34847465, pubblicato online 27 novembre 2021."
    }
  ],
  "lastVerifiedAt": "2026-10-30",
  "transferabilityItaly": "Alta per il principio di ridurre gli errori di conferimento con informazioni centrate sulle regole operative e testarle con outcome fisici; la comunicazione deve rispecchiare le frazioni, gli orari, i mastelli e i turni effettivi del gestore italiano. L'effetto in termini di odds ratio non può essere trasferito quantitativamente senza una nuova valutazione locale.",
  "lameziaAdaptation": "Con Lamezia Multiservizi, individuare le 2–3 zone di raccolta porta a porta con più errori o non conformità; testare in isolati comparabili, con assegnazione casuale e senza alterare la raccolta ordinaria, un'infografica in italiano semplice e versioni linguistiche accessibili che illustrino frazione/mastello/giorno/orario specifici di ciascuna zona. Misurare a 2 settimane, 3 e 6 mesi quota di sacchi corretti, contaminazioni, esposizioni fuori turno, kg di materiali recuperabili, costi e reclami; pubblicare risultati aggregati. Usare come riferimento il calendario e il riciclabolario già pubblicati da Lamezia Multiservizi, evitando di replicare la distinzione binaria secco/umido di Trelew.",
  "implementability": "quick_win",
  "capacityDataNeeds": [
    "calendari ufficiali per zona aggiornati e riciclabolario verificato",
    "mappa di isolati e punti di raccolta per campionamento e randomizzazione",
    "baseline su conformità dei conferimenti, rifiuto residuo e materiale contaminato",
    "accordo con Lamezia Multiservizi per raccolta e audit fisici standardizzati",
    "stima dei costi di stampa/distribuzione, canali accessibili anche offline",
    "protocollo di ricerca per cluster e unità di osservazione, minimo campione e analisi di potenza",
    "monitoraggio reclami, errori fuori turno e percorsi dei materiali a valle dell'impianto"
  ],
  "tags": [
    "Trelew",
    "Argentina",
    "rifiuti",
    "raccolta differenziata",
    "comunicazione",
    "sacchi riciclabili",
    "contaminazione",
    "cluster RCT",
    "nudging",
    "informazione semplice",
    "2019",
    "2022",
    "porta a porta",
    "GIRSU"
  ],
  "revisionHistory": [
    {
      "date": "2026-10-30",
      "note": "Nuovo intervento verificato su studio peer-reviewed (metodi, tabelle 3–4 e discussione), report operativo IDOS-World Bank e fonti dirette dei gestori. Distinti trial 2019, 20.000 famiglie del rollout, odds ratio vs punti percentuali e nuovo sistema municipale 2025."
    }
  ]
}
];
