import type { EvidenceIntervention } from "./evidenceInterventions";

export function applyEvidenceInterventionUpdates20260919(
  item: EvidenceIntervention,
): EvidenceIntervention {
  if (item.id === "barcelona-bmincome-guaranteed-income-active-policies") {
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

  if (item.id === "new-york-local-trans-fat-restrictions-cardiovascular") {
    return {
      ...item,
      transferabilityItaly:
        "Bassa per una replica regolatoria generalizzata e, soprattutto, non necessaria come replica letterale: il Regolamento (UE) 2019/649, direttamente applicabile, limita già dal 1° aprile 2021 gli acidi grassi trans industriali a un massimo di 2 g per 100 g di grassi negli alimenti destinati al consumatore finale e al retail. Il valore trasferibile del caso è quindi il policy design: standard nutrizionali più ambiziosi negli ambienti sotto controllo comunale, procurement/concessioni verificabili e valutazione degli effetti, non un nuovo divieto locale parallelo.",
      lameziaAdaptation:
        "Non proporre un divieto comunale generalizzato dei grassi trans, già oggetto di disciplina europea. Usare invece il caso per auditare mense, vending, catering, eventi e concessioni comunali: verificare conformità e qualità nutrizionale complessiva, definire standard di procurement eventualmente più stringenti dove giuridicamente consentito, e monitorare sostituzioni, costi e consumo. Se si sperimenta un intervento locale, misurare outcome di acquisto/composizione e accettabilità, senza pretendere di osservare nel breve periodo ricoveri cardiovascolari attribuibili al Comune.",
      limitations: [
        ...item.limitations,
        "Nel contesto italiano del 2026 la disciplina europea già limita gli acidi grassi trans industriali a 2 g per 100 g di grassi; l'intervento storico di New York non rappresenta quindi un vuoto regolatorio locale da colmare con una copia della policy.",
      ],
      revisionHistory: [
        ...item.revisionHistory,
        {
          date: "2026-09-19",
          note: "Aggiunto il quadro UE vigente: Regolamento (UE) 2019/649, limite di 2 g di acidi grassi trans industriali per 100 g di grassi applicabile dal 1° aprile 2021; riformulata la trasferibilità verso procurement e ambienti alimentari comunali, non verso un divieto locale duplicativo.",
        },
      ],
    };
  }

  return item;
}
