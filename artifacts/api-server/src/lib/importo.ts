// Parser puro per gli importi in formato italiano (1.234.567,89) presenti nel
// testo dell'oggetto di un atto/contratto.
//
// Vive in un modulo isolato e senza dipendenze, così da poter essere importato
// sia da `anacContracts` sia da `contractStoryline` senza introdurre un ciclo
// di import: in passato `contractStoryline` importava questa funzione dal
// modulo `anacContracts` (grande e con dipendenze sul DB), esponendosi a
// problemi di ordine di caricamento che potevano lasciare la funzione
// `undefined` a runtime.

// Importo in formato italiano (1.234.567,89) presente nel testo dell'oggetto.
export function parseImporto(text: string): string | null {
  const m =
    /(?:€|euro|importo[^0-9]{0,20})\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/i.exec(
      text,
    );
  const raw = m?.[1];
  if (!raw) return null;
  const numeric = Number(raw.replace(/\./g, "").replace(",", "."));
  if (Number.isNaN(numeric) || numeric <= 0) return null;
  return numeric.toFixed(2);
}
