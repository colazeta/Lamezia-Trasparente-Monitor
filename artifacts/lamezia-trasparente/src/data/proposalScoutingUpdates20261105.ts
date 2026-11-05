import type { PublicProposal } from "./propostePubblicheCore";

const PROPOSAL_ID = "corsi-acqua-manutenzione-cristiano-villella-2026";
const EVENT_ID = "cristiano-villella-torrenti-giunta-protocollo-2026-11-04";

/**
 * Aggiornamento di contesto sulla stessa proposta, non recepimento né attuazione.
 * Delibera originale, sottoscrizione del protocollo e lavori non acquisiti.
 */
export function applyScoutingUpdates20261105CorsiAcqua<T extends PublicProposal>(proposal: T): T {
  if (proposal.id !== PROPOSAL_ID || proposal.events.some(event => event.id === EVENT_ID)) return proposal;
  return {
    ...proposal,
    periodLabel: "10 ottobre–4 novembre 2026",
    lastUpdated: "2026-11-04",
    linkedActs: [
      ...proposal.linkedActs,
      "Giunta comunale, 4/11/2026 — aggiornamento del Protocollo d'Intesa Comune–Calabria Verde per sei corsi d'acqua, riferito dalla stampa con dichiarazioni del Sindaco; numero e testo della delibera non acquisiti",
    ],
    verificationNote:
      proposal.verificationNote +
      " Il 4 novembre il Lametino riporta una comunicazione attribuita all'Amministrazione, con dichiarazioni del Sindaco Mario Murone, secondo cui la Giunta ha approvato un aggiornamento del protocollo con Calabria Verde per manutenzione di sei corsi d'acqua (Canne, Bagni, Piazza, Cottola, Gabella e Fella) e una spesa comunale prevista di 39.406 euro. Il testo originale e il numero della deliberazione non sono stati acquisiti, né sono verificati la stipula definitiva del protocollo, l'avvio o l'esecuzione dei lavori o la loro estensione al torrente presso Fialà. Si registra un contesto istituzionale riportato dalla stampa, NON una risposta formale alla proposta di Cristiano e Villella, un recepimento causale o un'attuazione. Destinatario e competenza restano separati: not_assessed.",
    events: [
      ...proposal.events,
      {
        id: EVENT_ID,
        date: "2026-11-04",
        type: "aggiornamento" as const,
        title: "La stampa riporta l'aggiornamento del protocollo per sei corsi d'acqua",
        summary:
          "Secondo la nota di Giunta pubblicata dal Lametino, è stato approvato un aggiornamento del protocollo Comune–Calabria Verde per sei corsi d'acqua, con una spesa comunale annunciata di 39.406 euro. Non sono acquisiti la delibera originale, la firma definitiva e prove di lavori eseguiti. Nessun nesso causale con la richiesta dei consiglieri è dimostrato.",
        sourceLabel: "il Lametino — comunicazione di Giunta con dichiarazioni del Sindaco, 4 novembre 2026",
        sourceUrl: "https://www.lametino.it/ultime/social-housing-difesa-del-suolo-e-legalita-la-giunta-di-lamezia-approva-nuovi-provvedimenti.html",
        evidenceLevel: "fonte_stampa" as const,
      },
    ],
  } as T;
}
