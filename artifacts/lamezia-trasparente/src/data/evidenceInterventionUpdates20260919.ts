import type { EvidenceIntervention } from "./evidenceInterventions";

export function applyEvidenceInterventionUpdates20260919(
  item: EvidenceIntervention,
): EvidenceIntervention {
  if (item.id !== "barcelona-bmincome-guaranteed-income-active-policies") return item;

  return {
    ...item,
    population:
      "Famiglie socialmente vulnerabili residenti in dieci quartieri dell'Eix Besòs. La documentazione finale non è perfettamente coerente nei conteggi: l'executive summary riporta 1.524 nuclei eleggibili, mentre la sezione sulla lottery parla di 1.527 valid families. Il disegno iniziale dell'esperimento viene poi descritto come 1.000 famiglie nel trattamento, 383 nel controllo e 142 nel gruppo di riserva, escluso dall'impact evaluation. Il record conserva quindi separatamente questi numeri senza forzarne una riconciliazione.",
    evaluationMethod:
      "Randomized impact evaluation con stratified lottery / randomized block design. La randomizzazione avveniva a livello di nucleo familiare entro strati definiti da eleggibilità alla politica di room rental, employability e trasferimento SMI atteso. Il report descrive il disegno iniziale come 1.000 famiglie nel trattamento, 383 nel controllo e 142 nel gruppo di riserva, quest'ultimo escluso dall'impact evaluation. La valutazione usa survey e dati amministrativi e stima principalmente effetti intent-to-treat su benessere, deprivazione, finanze, lavoro e salute, con analisi di robustezza.",
    comparator:
      "383 famiglie inizialmente assegnate al gruppo di controllo attraverso la stessa lotteria stratificata, dopo la separazione del gruppo di riserva di 142 famiglie non incluso nell'impact evaluation; le analisi tengono conto degli strati di randomizzazione e delle successive questioni di implementazione/attrition.",
    limitations: [
      ...item.limitations,
      "Il report presenta una lieve incoerenza interna nei conteggi della popolazione randomizzata: 1.524 nuclei eleggibili nell'executive summary, 1.527 valid families nella sezione sulla lottery, mentre il disegno iniziale trattamento/controllo/riserva riportato nello stesso documento somma a 1.525. Il record non riconcilia artificialmente questi valori.",
      "Il disegno incontrò questioni ex post di eleggibilità, duplicati, reserve group e attrition; la valutazione documenta e tratta questi problemi, ma vanno conservati come cautela nell'interpretazione dell'RCT.",
    ],
    revisionHistory: [
      ...item.revisionHistory,
      {
        date: "2026-09-19",
        note: "Precisato il disegno di randomizzazione (1.000 trattamento, 383 controllo, 142 reserve group escluso dall'impact evaluation) e resa esplicita la lieve incoerenza interna del report sui conteggi complessivi 1.524/1.527/1.525; aggiunta cautela sulle questioni ex post di implementazione e attrition.",
      },
    ],
  };
}
