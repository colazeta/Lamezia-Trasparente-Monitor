import type { EvidenceIntervention } from "./evidenceInterventions";

export function applyEvidenceInterventionUpdates20260919(
  item: EvidenceIntervention,
): EvidenceIntervention {
  if (item.id !== "barcelona-bmincome-guaranteed-income-active-policies") return item;

  return {
    ...item,
    population:
      "Famiglie socialmente vulnerabili residenti in dieci quartieri dell'Eix Besòs. Il report finale registra 1.524 nuclei eleggibili; 1.000 posti di trattamento furono assegnati mediante lotteria stratificata. Il disegno iniziale della valutazione comprendeva 1.000 famiglie nel trattamento, 383 nel controllo e 142 nel gruppo di riserva, escluso dall'impact evaluation.",
    evaluationMethod:
      "Randomized impact evaluation con stratified lottery / randomized block design. La randomizzazione avveniva a livello di nucleo familiare entro strati definiti da eleggibilità alla politica di room rental, employability e trasferimento SMI atteso. Il disegno iniziale comprendeva 1.000 famiglie nel trattamento, 383 nel controllo e 142 nel gruppo di riserva, quest'ultimo escluso dall'impact evaluation. La valutazione usa survey e dati amministrativi e stima principalmente effetti intent-to-treat su benessere, deprivazione, finanze, lavoro e salute, con analisi di robustezza.",
    comparator:
      "383 famiglie inizialmente assegnate al gruppo di controllo attraverso la stessa lotteria stratificata, dopo la separazione del gruppo di riserva di 142 famiglie non incluso nell'impact evaluation; le analisi tengono conto degli strati di randomizzazione e delle successive questioni di implementazione/attrition.",
    limitations: [
      ...item.limitations,
      "Il disegno incontrò questioni ex post di eleggibilità, duplicati, reserve group e attrition; la valutazione documenta e tratta questi problemi, ma vanno conservati come cautela nell'interpretazione dell'RCT.",
    ],
    revisionHistory: [
      ...item.revisionHistory,
      {
        date: "2026-09-19",
        note: "Precisato il disegno di randomizzazione: 1.000 famiglie nel trattamento, 383 nel controllo e 142 nel reserve group escluso dall'impact evaluation; aggiunta cautela sulle questioni ex post di implementazione e attrition.",
      },
    ],
  };
}
