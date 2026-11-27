import type { EvidenceIntervention } from "./evidenceInterventions";

/**
 * 2026-11-09: new peer-reviewed evaluation for an existing intervention.
 * Preserve its canonical ID and prior studies; no duplicate record.
 */
export function applyEvidenceInterventionUpdates20261109(
  item: EvidenceIntervention,
): EvidenceIntervention {
  if (item.id !== "italy-payt-municipal-waste-fees") return item;

  return {
    ...item,
    evaluationMethod:
      `${item.evaluationMethod} Compagnoni e Torbert (2026) analizzano le adozioni scaglionate nei comuni dell'Emilia-Romagna con difference-in-differences a effetti fissi bidirezionali, staggered DiD e synthetic DiD, affrontando il rischio di trend paralleli non credibili e di selezione nell'adozione. Valente (2023) usa random forest e R-learning per stimare effetti eterogenei di prezzi continui su un panel 2010–2015 di 3.574 comuni del Centro-Nord, 194 adottanti tra 2012 e 2015 (circa 1,7 milioni di residenti).`,
    comparator:
      `${item.comparator} Nello studio Emilia-Romagna 2026 le specificazioni DiD e synthetic DiD confrontano le traiettorie dei comuni adottanti con controfattuali costruiti dai comuni non trattati o non ancora trattati; la scelta del comparatore dipende dallo stimatore. Valente (2023) usa prezzi continui e il controfattuale a prezzo zero (assenza di PAYT), con aggiustamento per caratteristiche comunali osservabili.`,
    results:
      `${item.results} Nella valutazione peer-reviewed di Compagnoni e Torbert (2026) sulle adozioni scaglionate in Emilia-Romagna, la tariffazione puntuale aumenta in media di circa 10 punti percentuali il tasso di raccolta differenziata. L'aumento della quota dipende soprattutto dalla riduzione del rifiuto indifferenziato per abitante, senza incremento statisticamente significativo della quantità differenziata. Il costo totale del servizio non mostra un aumento statisticamente significativo, pur cambiando la composizione delle voci di costo. Non confondere il risultato con la percentuale osservata dalla Regione nel 2024. Valente (2023) trova risposte non lineari: prezzi più alti favoriscono lo spostamento verso la differenziata più che ulteriori riduzioni del rifiuto totale; i risparmi di gestione modellati maturano soprattutto quando cala il rifiuto complessivo. Nel breve periodo i costi possono aumentare.`,
    effectSize:
      `${item.effectSize} Nuova stima 2026 per l'Emilia-Romagna: circa +10 punti percentuali nel tasso di raccolta differenziata (DiD scaglionato/synthetic DiD); nessun incremento statisticamente significativo della quantità differenziata né del costo totale del servizio. L'assenza di significatività NON equivale a dimostrare costi identici o un risparmio economico. Valente (2023), Tabella 4, stima risparmi medi annui di gestione nei comuni PAYT di 0,13, 3,14 e 20,17 euro/abitante negli anni 1, 2 e 3; quote di comuni con risparmio stimato: 36%, 89%, tutti i comuni osservati al terzo anno. Tabella 5: simulazione per tutti i comuni del campione, 23,85 euro/abitante al terzo anno (99,8% con risparmio previsto); non sono risparmi di bilancio osservati né previsioni per Lamezia.`,
    evidenceStrength: "forte",
    costsRequirements:
      `${item.costsRequirements} Il nuovo studio del 2026 non identifica un aumento statisticamente significativo del costo totale medio, ma registra una ricomposizione delle voci: servono contabilità analitica e costi di investimento per valutare la convenienza di una specifica transizione locale. Valente (2023) mostra che la convenienza dipende anche dai costi unitari delle due frazioni e dalla prevenzione complessiva, non soltanto dalla percentuale differenziata.`,
    limitations: [
      ...item.limitations,
      "Compagnoni e Torbert (2026) segnalano che i comuni adottano la tariffazione puntuale in modo selettivo in funzione di capacità e performance precedenti; stimatori DiD tradizionali possono essere distorti da pre-trend non paralleli e adozione scaglionata. L'uso di metodi alternativi rafforza ma non rende sperimentale la prova.",
      "Regione Emilia-Romagna (dato 2024): 199 comuni misurano puntualmente il rifiuto, ma solo 2 applicano TARI tributo puntuale e 132 una tariffa corrispettiva puntuale; altri 65 misurano il residuo mantenendo TARI presuntiva. Non considerare tutti e 199 come tariffazione PAYT.",
      "I valori amministrativi regionali 2024 (83,5% di differenziata nei comuni a tariffa/tributo puntuale, 79,0% media regionale; 108 contro 139,6 kg pro capite di residuo) sono confronti descrittivi, NON la stima causale DiD di +10 punti percentuali.",
      "La stima 2026 riguarda comuni dell'Emilia-Romagna; non trasferire l'effetto medio numerico direttamente a Lamezia senza verificare raccolta esistente, tecnologia, caratteristiche socioeconomiche, governance territoriale e rischi di abbandono.",
      "Valente (2023): adozione non randomizzata e identificazione condizionata alle caratteristiche osservate; Sud e Isole esclusi dal campione. I risparmi della Tabella 4 sono calcolati combinando effetti stimati sulle quantità e costi unitari; la Tabella 5 è una simulazione di adozione, non un consuntivo. Non sommare i risultati alle altre valutazioni né interpretare la differenza rispetto a Compagnoni e Torbert come contraddizione diretta: differiscono campioni, periodi e definizioni dei costi.",
    ],
    primarySource: {
      label: "Regione Emilia-Romagna — diffusione della misurazione e tariffazione puntuale, dati ufficiali 2024 (pagina aggiornata 2026)",
      url: "https://ambiente.regione.emilia-romagna.it/it/rifiuti/rifiuti/economia-circolare/tariffa-puntuale/diffusione-della-tariffa-puntuale-in-emilia-romagna",
    },
    evaluationStudies: [
      ...item.evaluationStudies,
      {
        label: "Ecological Economics — articolo definitivo peer-reviewed (2026); scheda JRC European Commission: https://publications.jrc.ec.europa.eu/repository/handle/JRC145510",
        url: "https://www.sciencedirect.com/science/article/pii/S0921800926000765",
        citation: "Compagnoni, M. & Torbert, J. (2026). Environmental and economic effects of pay-as-you-throw waste taxation: An assessment based on difference-in-differences models. Ecological Economics, 246, 108991.",
        doi: "10.1016/j.ecolecon.2026.108991",
      },
      {
        label: "Journal of Environmental Economics and Management — versione editoriale integrale (2023)",
        url: "https://www.uhu.es/decofin/wp-content/uploads/Valente_JEEM2023.pdf",
        citation: "Valente, M. (2023). Policy evaluation of waste pricing programs using heterogeneous causal effect estimation. Journal of Environmental Economics and Management, 117, 102755, sezioni 1.2, 3.4–3.6, Tabelle 4–5.",
        doi: "10.1016/j.jeem.2022.102755",
      },
    ],
    lastVerifiedAt: "2026-11-27",
    lameziaAdaptation:
      `${item.lameziaAdaptation} Usare come benchmark i sistemi dell'Emilia-Romagna, distinguendo una semplice pesatura dalla vera tariffa puntuale; verificare prima con Comune, gestore Lamezia Multiservizi e autorità d'ambito se esistano pesature individuali, identità utenza, dati di costo e margini regolatori. Un eventuale pilota deve confrontare residuo pro capite, quota e quantità differenziata, costo complessivo e sue componenti, abbandoni e impatto distributivo; non presupporre che Lamezia applichi già TARIP. Simulare più livelli della componente variabile e i costi delle singole frazioni con dati locali; monitorare quantità totali, accessibilità e impatti distributivi per almeno tre anni, senza importare i prezzi o i risparmi medi del Centro-Nord.`,
    capacityDataNeeds: [
      ...item.capacityDataNeeds,
      "distinzione tra misurazione puntuale e effettivo meccanismo di tariffazione a corrispettivo",
      "monitoraggio delle componenti del costo totale del servizio prima e dopo il trattamento",
      "comparatore credibile tra territori e verifica delle tendenze antecedenti",
      "dati aggregati per verificare gli effetti distributivi e l'eventuale abbandono di rifiuti",
    ],
    tags: [
      ...item.tags,
      "Emilia-Romagna",
      "Compagnoni-Torbert-2026",
      "staggered-DiD",
      "synthetic-DiD",
      "prevenzione-rifiuti",
      "eterogeneità tariffaria",
    ],
    revisionHistory: [
      ...item.revisionHistory,
      {
        date: "2026-11-09",
        note: "Nuova evidenza peer-reviewed (Compagnoni & Torbert 2026, DOI 10.1016/j.ecolecon.2026.108991) verificata sul publisher e sul JRC, con riscontro della Regione Emilia-Romagna sui regimi adottati nel 2024. Aggiunti +10 pp sul tasso di RD, meccanismo di riduzione del residuo e outcome costi non significativo; chiarita selezione e distinzione tra 134 comuni a tariffa puntuale e 65 con sola misurazione. Conservati ID, studi e revisioni originari.",
      },
      {
        date: "2026-11-27",
        note: "Aggiunta valutazione peer-reviewed Valente (2023), DOI 10.1016/j.jeem.2022.102755, individuata con Parallel Search e verificata sulla versione editoriale integrale, incluse immagini Tabelle 4–5. Distinti costi stimati dei comuni adottanti da simulazioni, prezzi non lineari e limiti di trasferibilità (Sud e Isole esclusi). ID e studi precedenti conservati.",
      },
    ],
  };
}
