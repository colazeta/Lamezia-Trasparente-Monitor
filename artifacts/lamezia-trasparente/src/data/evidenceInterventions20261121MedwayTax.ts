import type { EvidenceIntervention } from "./evidenceInterventions";

/** Medway Council first-reminder cluster RCT, original sources verified 2026-11-21. */
export const EVIDENCE_INTERVENTIONS_2026_11_21_MEDWAY_TAX: readonly EvidenceIntervention[] = [
{
  "id": "medway-council-tax-reminder-behavioural-letters-rct-2015",
  "title": "Medway: promemoria tributari comportamentali e aumento dei pagamenti entro sette giorni",
  "authority": "Medway Council, in collaborazione con Behavioural Insights Team (BIT)",
  "territory": "Medway (Chatham, Gillingham, Rochester, Strood e parishes), Kent, Inghilterra",
  "country": "Regno Unito",
  "implementationYear": "2015 (sperimentazione municipale su tre mesi); articolo scientifico pubblicato nel 2019",
  "problem": "Il recupero della Council Tax richiedeva solleciti ripetuti e costosi, anche tra famiglie che avrebbero potuto pagare dopo la prima comunicazione. Serviva verificare se un sollecito più chiaro, con norme sociali corrette o spiegazione delle conseguenze, migliorasse il pagamento tempestivo.",
  "measure": "RCT per cluster con tre versioni della prima lettera di sollecito: lettera amministrativa ordinaria (controllo); lettera semplificata con riferimento verificato alla norma sociale locale (96% paga puntualmente); lettera semplificata contenente un diagramma delle fasi di recupero e delle possibili conseguenze previste. La sperimentazione coprì tre mesi, con rotazione casuale delle condizioni fra unità amministrative.",
  "mechanism": "Rendere saliente il comportamento prevalente dei contribuenti (norma sociale descrittiva) o le reali fasi di riscossione (salienza delle conseguenze), accompagnando l'informazione da istruzioni chiare e tempestive. Il disegno confronta pacchetti di lettera diversi; non isola perfettamente la semplificazione grafica dall'aggiunta del messaggio normativo.",
  "population": "9.130 abitazioni uniche con primo sollecito nel periodo analizzato; i 35 cluster amministrativi furono attribuiti a sequenze casuali dei tre tipi di lettera nei tre mesi. La tabella di bilanciamento riporta 19.127 osservazioni iniziali per il test di attrition, numero da non confondere con le 9.130 abitazioni nell'analisi principale.",
  "primaryArea": "fiscalita_entrate_riscossione",
  "secondaryAreas": [
    "capacita_amministrativa_personale",
    "digitalizzazione_servizi_online",
    "trasparenza_integrita_anticorruzione"
  ],
  "interventionTypes": [
    "nudging_comunicazione",
    "informazione_trasparenza",
    "modifica_organizzativa_processo"
  ],
  "tools": [
    "lettera di sollecito ordinaria",
    "lettera semplificata con norma sociale descrittiva locale, fondata su dato corretto",
    "diagramma esplicativo delle fasi di recupero e delle conseguenze legalmente previste",
    "assegnazione casuale rotante di 35 unità amministrative per tre mesi",
    "dati amministrativi su pagamento entro sette giorni, residui e caratteristiche dei contribuenti"
  ],
  "territorialScale": "Autorità locale unitaria di Medway; randomizzazione a 35 cluster amministrativi, outcome a livello di abitazione",
  "interventionStatus": "Trial completato nel 2015; la Local Government Association, nella scheda del 3 novembre 2017, riferisce che il Comune ha utilizzato successivamente la nuova impostazione dei solleciti. L'adozione continuativa e i risultati nel 2026 non sono stati verificati.",
  "evaluationMethod": "Cluster randomized controlled trial (RCT) multi-arm: 35 unità amministrative, assegnazione casuale rotante a controllo, norma sociale ed enfasi sulle fasi di recupero per tre mesi; ogni abitazione compare una sola volta nelle analisi. Modelli OLS a effetti fissi per mese/unità amministrativa, errori standard clusterizzati; esito primario pagamento entro sette giorni dal sollecito. Articolo peer-reviewed Larkin, Sanders, Andresen e Algate (2019), Journal of Behavioral Public Administration, DOI 10.30636/jbpa.21.54.",
  "comparator": "Abitazioni cui è stata inviata la precedente lettera di primo sollecito non modificata, nello stesso periodo e nella stessa amministrazione attraverso rotazione randomizzata dei cluster; confronto separato fra due pacchetti comportamentali.",
  "outcomes": [
    "percentuale di nuclei che effettuano un pagamento entro sette giorni dalla prima lettera",
    "variazione degli arretrati fra inizio e fine mese nel sottocampione che ha effettuato pagamenti",
    "differenza fra pacchetto con norma sociale e pacchetto con diagramma delle conseguenze",
    "possibile anticipazione degli incassi e riduzione delle successive pratiche di recupero, soltanto proiezioni"
  ],
  "results": "Nell'analisi principale su 9.130 abitazioni, il tasso di pagamento entro sette giorni è 62,97% con il sollecito standard, 75,69% con lettera contenente la norma sociale locale e 69,84% con diagramma dell'enforcement. Le differenze, rispettivamente +12,72 e +6,87 punti percentuali, sono riportate dagli autori come statisticamente significative; il pacchetto con norma sociale supera significativamente il diagramma. Gli importi di arretrati nel sottocampione pagante diminuiscono, ma condizionare su chi paga può introdurre selezione. Gli autori stimano circa 2,77 milioni di GBP/anno di incassi ANTICIPATI in uno scenario di estensione: non è maggior gettito netto osservato né risparmio accertato.",
  "effectSize": "Norma sociale: +12,72 punti percentuali (da 62,97% a 75,69%; +20,2% relativo). Diagramma delle conseguenze: +6,87 punti percentuali (da 62,97% a 69,84%; +10,9% relativo). Analisi principale N=9.130; periodo di osservazione sette giorni. Stima scenariale di anticipazione incassi, non verifica controfattuale finanziaria: circa £2,77m/anno se estesa a tutti i primi solleciti.",
  "evidenceStrength": "forte",
  "costsRequirements": "Modifica di modelli già in uso, verifica legale e linguistica, validazione statistica di qualunque messaggio normativo, integrazione con procedure di invio, gestione e assistenza ai debitori, tracciamento della data e modalità di pagamento. Il costo incrementale può essere contenuto se il modello è già digitalizzato, ma lo studio non pubblica un costo totale consuntivo degli aggiornamenti né una valutazione integrale costi-benefici. La proiezione £2,77m è incasso anticipato e non gettito supplementare.",
  "limitations": [
    "Studio eseguito in un solo comune inglese, con 35 cluster e osservazione per soli tre mesi; esito principale limitato ai sette giorni successivi alla lettera, senza prova di maggiore compliance annuale.",
    "L'inclusione dei soli contribuenti già in ritardo non consente di generalizzare l'effetto a tutti i contribuenti o ad avvisi ordinari prima della scadenza.",
    "Le lettere comportamentali erano entrambe semplificate rispetto al controllo: non è possibile isolare un effetto causale puro della norma sociale rispetto a tutti gli altri cambiamenti della comunicazione.",
    "Il confronto monetario sugli arretrati è condizionato ai soli paganti (N=6.404) e può risentire di selezione post-trattamento; non è una misura sperimentale incondizionata di nuove entrate nette.",
    "Lo studio non valuta in dettaglio debito residuo di lungo periodo, stress finanziario, reclami o differenze distributive per famiglie vulnerabili.",
    "La scheda LGA del 2017 riferisce incrementi relativi del 19% e del 13% per i due trattamenti, mentre la Tabella 2 dell\u0027articolo del 2019 implica rispettivamente +20,2% e +10,9%: la differenza fra stime non è riconciliata nelle fonti consultate. Nel record prevalgono le stime primarie della tabella scientifica.",
    "Un RCT pubblicato relativo alla Council Tax di Lambeth, già censito nell'archivio, ha trovato risultati nulli o avversi per alcuni messaggi di norma sociale; la riuscita non è universale.",
    "Il sistema fiscale britannico (Council Tax) differisce da TARI/IMU e dalle regole italiane di notifica e riscossione; nessuna proiezione quantitativa trasferibile senza un pilota locale."
  ],
  "unintendedEffects": "Lo studio di Medway non quantifica distress finanziario o aggravi per contribuenti fragili. Messaggi normativi non verificati o formulazioni percepite come colpevolizzanti potrebbero ridurre fiducia o aumentare pressioni su persone che non possono pagare; un diverso trial a Lambeth indica possibili effetti avversi delle norme sociali. Non introdurre minacce improprie, informazioni false o esclusioni da riduzioni/rateazioni.",
  "primarySource": {
    "label": "Local Government Association — Using behavioural insights to collect Council Tax collection, Medway Council (3 novembre 2017)",
    "url": "https://www.local.gov.uk/case-studies/using-behavioural-insights-collect-council-tax-collection-medway-council"
  },
  "evaluationStudies": [
    {
      "label": "Larkin et al. (2019), articolo originale peer-reviewed (testo completo, Tabelle 1–2)",
      "url": "https://journal-bpa.org/index.php/jbpa/article/download/54/38/471",
      "doi": "10.30636/jbpa.21.54",
      "citation": "Larkin, C., Sanders, M., Andresen, I. e Algate, F. (2019). Testing local descriptive norms and salience of enforcement action: A field experiment to increase tax collection. Journal of Behavioral Public Administration, 2(1), 1–11. DOI: 10.30636/jbpa.21.54."
    },
    {
      "label": "Journal of Behavioral Public Administration — pagina editoriale dell'articolo",
      "url": "https://journal-bpa.org/index.php/jbpa/article/view/54",
      "citation": "Articolo originale, titolo, autori e DOI verificabili sul sito dell'editore."
    }
  ],
  "lastVerifiedAt": "2026-11-21",
  "transferabilityItaly": "Trasferibile il metodo di semplificazione e test controllato dei primi solleciti tributari, previa verifica della disciplina italiana e delle procedure comunali. Non trasferibili direttamente le percentuali d'effetto, il valore britannico del 96% o le minacce di enforcement britanniche. Verificare il diritto a riduzioni, esenzioni, rettifiche e rateazioni e mantenere invariati gli obblighi di legge per tutte le persone.",
  "lameziaAdaptation": "L'avviso TARI 2026 del Comune di Lamezia (9 settembre 2026) prevede PagoPA e comunicazioni tramite App IO, e-mail/PEC e posta ordinaria: NON è quindi necessario introdurre ex novo i pagamenti digitali. Proporre con l'Ufficio Entrate comunali un audit delle comunicazioni successive alla scadenza, tempi e tassi di pagamento per canale, errori, richieste di rateazione e motivi di mancato pagamento. Su invii omogenei e legalmente compatibili, testare in modo randomizzato solo formulazione, chiarezza, scadenze, istruzioni di pagamento/assistenza, mai diritti o procedure. Qualunque norma sociale andrebbe utilizzata soltanto se basata su dati locali verificati; preferire inizialmente formulazioni neutrali.",
  "implementability": "quick_win",
  "capacityDataNeeds": [
    "modelli correnti di avviso e sollecito TARI/IMU, con revisione normativa e di accessibilità",
    "date individuali di scadenza, comunicazione e pagamento in sistemi amministrativi (trattamento dati minimizzato)",
    "canali di recapito (App IO, PEC, e-mail, posta) e relativi esiti",
    "distinzione fra mancato pagamento, errore di notifica, posizione contestata e incapacità economica",
    "indicatori su rateazioni, riduzioni, esenzioni, rettifiche, reclami e oneri amministrativi",
    "protocollo di assegnazione randomizzato e analisi prespecificata, rispettando parità di trattamento e privacy",
    "governance tra Ufficio Tributi, privacy/legal, sistemi informativi e servizio di assistenza"
  ],
  "tags": [
    "Medway",
    "Regno Unito",
    "Council Tax",
    "2015",
    "RCT",
    "35 cluster",
    "9.130 abitazioni",
    "solleciti tributari",
    "norme sociali descrittive",
    "nudging",
    "behavioral insights",
    "semplificazione",
    "riscossione",
    "7 giorni",
    "Lambeth",
    "TARI",
    "Lamezia Terme",
    "PagoPA",
    "low-cost"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-21",
      "note": "Caso identificato mediante Parallel Search e verificato direttamente sulla scheda ufficiale della Local Government Association e sul testo originale peer-reviewed Larkin et al. (2019), inclusa Tabella 2 controllata a pagina 8. Deduplicazione effettuata mediante lettura diretta dei 69 moduli importati nell'archivio e del file base; controllate PR per Medway, autori e DOI. Distinto dai trial di Lambeth già registrati; non trattati come crescita netta del gettito gli incassi anticipati. Dati TARI Lamezia verificati sull'avviso comunale del 9 settembre 2026."
    }
  ]
}
];
