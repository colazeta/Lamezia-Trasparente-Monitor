import type { PublicProposal } from "./propostePubblicheCore";

const ASILI_ID = "asili-nido-continuita-servizio-2026";

/**
 * Incremental updates to already-censused proposals.
 *
 * This layer is intentionally separate from the core dataset: when new evidence
 * concerns the same promoter/object/thread, the proposal is enriched instead of
 * being duplicated. It also lets daily scouting remain reviewable in small diffs.
 */
export function applyScoutingUpdates(proposal: PublicProposal): PublicProposal {
  if (proposal.id !== ASILI_ID) return proposal;

  const linkedActs = Array.from(
    new Set([
      ...proposal.linkedActs,
      "Determinazione dirigenziale R.G. n. 1308 del 13/08/2026 — Albo Pretorio n. 2026/2689 (presa d'atto)",
      "Determinazione dirigenziale R.G. n. 1326 del 17/08/2026 — Albo Pretorio n. 2026/2719 (impegno spesa; voce n. 246)",
    ]),
  );

  const alreadyUpdated = proposal.events.some(
    (event) => event.id === "asili-nido-masi-controreplica-29-agosto",
  );

  return {
    ...proposal,
    periodLabel: "26–29 agosto 2026",
    lastUpdated: "2026-08-29",
    linkedActs,
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il 29 agosto Masi ha pubblicato una controreplica che amplia i quesiti già confluiti nell'interrogazione urgente. La verifica sull'Albo Pretorio richiede una cautela puntuale: la stampa richiama una 'Determinazione n. 246 del 13 agosto', mentre l'archivio ufficiale associa al 13 agosto la determinazione R.G. n. 1308 (pubblicazione 2026/2689, voce n. 245, presa d'atto) e al 17 agosto la determinazione R.G. n. 1326 (pubblicazione 2026/2719, voce n. 246, impegno spesa). Il dataset collega entrambi gli atti ufficiali e non tratta come verificata l'associazione numero-data riportata nel comunicato.",
    events: alreadyUpdated
      ? proposal.events
      : [
          ...proposal.events,
          {
            id: "asili-nido-masi-controreplica-29-agosto",
            date: "2026-08-29",
            type: "aggiornamento",
            title: "Masi amplia i quesiti dopo la risposta dell'Amministrazione",
            summary:
              "Nella controreplica alla nota di Gianturco, Masi chiede di chiarire la causa concreta del mancato avvio, il significato dell'“integrazione dell'efficacia dell'aggiudicazione” richiamata per il 25 agosto, i soggetti indicati come “più enti” coinvolti, la mancata informazione al Consiglio del 13 agosto e le misure di continuità effettivamente valutate o adottate. La nota richiama inoltre atti della procedura che vengono verificati separatamente sull'Albo Pretorio.",
            sourceLabel: "il Lametino",
            sourceUrl:
              "https://www.lametino.it/ultime/lamezia-masi-pd-su-asili-nido-comunali-non-un-incidente-tecnico-fallimento-di-programmazione-gestione-e-trasparenza.html",
            evidenceLevel: "fonte_stampa",
          },
        ],
  };
}
