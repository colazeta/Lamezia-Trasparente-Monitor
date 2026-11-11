import type { PublicProposal } from "./propostePubblicheCore";

const PROPOSAL_ID = "aeroporto-intermodalita-rilancio-taverna-2026";
const EVENT_ID = "taverna-cronoprogramma-aeroporto-e-tariffe-2026-11-10";
const SOURCE_URL = "https://www.lametino.it/ultime/lamezia-taverna-pd-aeroporto-tra-cantieri-fermi-e-voli-doro-che-penalizzano-i-calabresi.html";

/** Sviluppo del medesimo promotore e filone: mantiene l'identificativo di settembre. */
export function applyScoutingUpdates20261111Taverna<T extends PublicProposal>(proposal: T): T {
  if (proposal.id !== PROPOSAL_ID || proposal.events.some(event => event.id === EVENT_ID)) {
    return proposal;
  }

  return {
    ...proposal,
    periodLabel: "1 settembre–10 novembre 2026",
    lastUpdated: "2026-11-10",
    verificationNote:
      proposal.verificationNote +
      " Nella nota pubblicata il 10 novembre 2026, lo stesso promotore Domenico Taverna (segreteria PD Lamezia) chiede un cronoprogramma pubblico e verificabile per i lavori del terminal e un'interlocuzione urgente con i vettori sulle tariffe dei voli nei periodi di rientro. Le affermazioni sui cantieri, sul contenzioso, sui finanziamenti e sui prezzi sono attribuite al promotore, non accertamenti indipendenti. Non risultano verificati nuovi atti amministrativi, deposito formale, risposte istituzionali, accordi tariffari, avvio o completamento dei lavori. La competenza già valutata sulla pianificazione intermodale non viene estesa automaticamente alla regolazione dei prezzi dei biglietti.",
    events: [
      ...proposal.events,
      {
        id: EVENT_ID,
        date: "2026-11-10",
        type: "aggiornamento" as const,
        title: "Richiesti cronoprogramma pubblico del terminal e iniziative contro il caro voli",
        summary:
          "Domenico Taverna torna sullo scalo di Lamezia, chiede di rendere pubblici tempi verificabili per i lavori del terminal e sollecita un'interlocuzione con i vettori per valutare misure sui prezzi dei voli. La presenza di ritardi, l'esistenza di possibili accordi e l'efficacia delle misure non sono accertate autonomamente.",
        sourceLabel: "il Lametino — nota di Domenico Taverna, 10 novembre 2026",
        sourceUrl: SOURCE_URL,
        evidenceLevel: "fonte_stampa" as const,
      },
    ],
  } as T;
}
