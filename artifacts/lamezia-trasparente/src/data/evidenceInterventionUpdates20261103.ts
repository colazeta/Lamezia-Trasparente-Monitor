import type { EvidenceIntervention } from "./evidenceInterventions";

/** Follow-up: same Italian municipal PAYT treatment, new Emilia-Romagna evaluation.
 * Update the canonical id rather than publishing a second, overlapping case.
 * Original publisher article, European Commission JRC abstract and regional implementation records verified 2026-11-03.
 */
export function applyEvidenceInterventionUpdates20261103(
  item: EvidenceIntervention,
): EvidenceIntervention {
  if (item.id !== "italy-payt-municipal-waste-fees") return item;

  return {
    ...item,
    territory: item.territory + "; nuova valutazione 2010–2019 su comuni dell'Emilia-Romagna",
    implementationYear: item.implementationYear + "; in Emilia-Romagna adozioni scaglionate dal 2013",
    evaluationMethod:
      item.evaluationMethod +
      " Compagnoni e Torbert (2026) confrontano due-way fixed effects DiD, stimatori per adozione scaglionata (inclusi controlli never-treated) e synthetic difference-in-differences sul panel di comuni dell'Emilia-Romagna 2010–2019. Esaminano anche eterogeneità fra adozioni fino al 2015 e dopo il 2015.",
    comparator:
      item.comparator +
      " Nel nuovo studio emiliano-romagnolo le stime per coorti utilizzano comuni della stessa regione che non avevano adottato PAYT entro il 2019; i gruppi presentano potenziali differenze di capacità amministrativa e performance pre-intervento.",
    results:
      item.results +
      " Un'ulteriore valutazione peer-reviewed, Compagnoni e Torbert (2026), sull'introduzione scaglionata del PAYT nei comuni emiliano-romagnoli trova un aumento medio di circa 10 punti percentuali della quota di raccolta differenziata. Il cambiamento deriva principalmente dalla riduzione del rifiuto indifferenziato pro capite, non da un aumento statisticamente significativo della quantità differenziata prodotta. Nel loro campione non emerge un aumento statisticamente significativo del costo totale medio del servizio; variano però le componenti del costo, incluse maggiori esigenze amministrative. Queste stime appartengono a un panel regionale e a metodi diversi da quelli dei precedenti studi nazionali: non vanno sommate né interpretate come una replica degli stessi effetti.",
    effectSize:
      item.effectSize +
      " Compagnoni e Torbert (2026, comuni Emilia-Romagna 2010–2019): circa +10 punti percentuali nella quota differenziata (non +10% relativo); nell'analisi per coorti adozioni fino al 2015 +9,1 pp, adozioni dopo il 2015 +20,2 pp contro comuni never-treated, con residuo pro capite rispettivamente −7,7% e −19,1%. Le differenze fra coorti non sono prova che rinviare l'adozione produca un effetto superiore; la stima dei costi totali non è statisticamente diversa da zero.",
    costsRequirements:
      item.costsRequirements +
      " Il follow-up Emilia-Romagna (2026) identifica aumenti dei costi comuni/amministrativi, compensati in media da variazioni in altre componenti: non dimostra un risparmio netto universale, né quantifica un costo di avvio trasferibile a Lamezia. Il passaggio necessita di sistemi di misura, gestione utenze, verifica del regolamento tariffario e del piano economico finanziario.",
    limitations: [
      ...item.limitations,
      "L'analisi Emilia-Romagna 2026 è quasi-sperimentale, non randomizzata: adozioni più frequenti fra comuni relativamente ricchi e con migliore raccolta differenziata prima del trattamento; possibile selezione legata alla capacità amministrativa.",
      "Non confondere l'aumento di circa 10 punti percentuali della quota differenziata con un aumento assoluto dei kg riciclati: gli autori attribuiscono il risultato prevalentemente alla diminuzione del residuo.",
      "Il risultato di costo totale non statisticamente significativo nello studio regionale non conferma né smentisce in modo diretto la riduzione del costo totale stimata con matching nello studio nazionale: campioni, specificazioni e periodi sono differenti.",
      "Il confronto Early/Late e le analisi synthetic DiD restano sensibili a caratteristiche degli adottanti, trend controfattuali e possibili spillover geografici; gli autori non dispongono di misure dirette complete degli abbandoni illeciti.",
      "I 199 comuni con misurazione puntuale nel 2024 riportati dalla Regione includono 65 comuni ancora in TARI presuntiva: non equivalgono a 199 comuni con tariffa puntuale effettivamente applicata.",
    ],
    primarySource: {
      label: "Regione Emilia-Romagna — diffusione e stato di attuazione della tariffa puntuale (dati 2024)",
      url: "https://ambiente.regione.emilia-romagna.it/it/rifiuti/rifiuti/economia-circolare/tariffa-puntuale/diffusione-della-tariffa-puntuale-in-emilia-romagna",
    },
    evaluationStudies: [
      ...item.evaluationStudies,
      {
        label: "Ecological Economics / European Commission Joint Research Centre — staggered DiD e synthetic DiD",
        url: "https://publications.jrc.ec.europa.eu/repository/handle/JRC145510",
        citation:
          "Compagnoni, M., & Torbert, J. (2026). Environmental and economic effects of pay-as-you-throw waste taxation: An assessment based on difference-in-differences models. Ecological Economics, 246, 108991.",
        doi: "10.1016/j.ecolecon.2026.108991",
      },
    ],
    lastVerifiedAt: "2026-11-03",
    lameziaAdaptation:
      item.lameziaAdaptation +
      " L'evidenza emiliano-romagnola rende prioritario separare nei dati di Lamezia kg/abitante di indifferenziato, kg/abitante di raccolta differenziata, quota percentuale della differenziata e costi del servizio per componente. Prima di proporre la tariffazione puntuale, valutare con Lamezia Multiservizi e uffici tributi la tracciabilità per giro/utenza, le risorse di avvio, l'impatto distributivo e una verifica sperimentale con controllo di abbandoni, contaminazione e reclami.",
    capacityDataNeeds: [
      ...item.capacityDataNeeds,
      "serie storiche annuali almeno comunali per frazione e costi unitari, con distinguo tra rifiuto raccolto e riciclo effettivo",
      "cronoprogramma e condizioni di adozione PAYT confrontabili per eventuale analisi controfattuale",
    ],
    tags: [...item.tags, "Emilia-Romagna", "synthetic DiD", "valutazione 2026", "costi amministrativi"],
    revisionHistory: [
      ...item.revisionHistory,
      {
        date: "2026-11-03",
        note:
          "Nuova evidenza originale Compagnoni e Torbert, Ecological Economics (2026), DOI 10.1016/j.ecolecon.2026.108991: +~10 pp quota differenziata con prevalente calo del residuo, costi totali non significativamente aumentati, variazioni di componenti; riscontrata l'adozione effettiva sui dati regionali. Aggiornato record canonico esistente senza duplicarlo.",
      },
    ],
  };
}
