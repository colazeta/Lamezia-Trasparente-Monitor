import type { PublicProposal } from "./propostePubblicheCore";

const PROPOSAL_ID = "scordovillo-consiglio-aperto-trasparenza-futuro-nazionale-2026";
const EVENT_ID = "scordovillo-centrosinistra-data-consiglio-aperto-riferita-2026-11-10";

/**
 * Sviluppo contestuale (non causale) della proposta di Futuro Nazionale:
 * un diverso gruppo riferisce la convocazione per il 19 novembre, ma il
 * documento istituzionale di convocazione non è acquisito.
 */
export function applyScoutingUpdates20261111Scordovillo<T extends PublicProposal>(proposal: T): T {
  if (proposal.id !== PROPOSAL_ID || proposal.events.some(event => event.id === EVENT_ID)) return proposal;
  return {
    ...proposal,
    periodLabel: "12 settembre–10 novembre 2026",
    lastUpdated: "2026-11-10",
    verificationNote:
      proposal.verificationNote +
      " Il 10 novembre i consiglieri di PD, Azione e Per Vivere Bene, distinti dai promotori Futuro Nazionale, dichiarano di aver chiesto un Consiglio comunale aperto su Scordovillo e che la seduta è stata convocata per il 19 novembre. L'annuncio è attribuito ai sei firmatari e non a un atto comunale direttamente acquisito: non si inferiscono né deposito formale della richiesta originaria di Futuro Nazionale, né calendarizzazione verificata, discussione, risposta, recepimento o attuazione della stessa. La coincidenza dell'oggetto è una relazione di filone, non prova di causalità o di titolarità esclusiva.",
    events: [
      ...proposal.events,
      {
        id: EVENT_ID,
        date: "2026-11-10",
        type: "aggiornamento" as const,
        title: "Altri gruppi consiliari riferiscono una seduta aperta per il 19 novembre",
        summary:
          "I gruppi PD, Azione e Per Vivere Bene comunicano che sarebbe stata convocata una seduta aperta su Scordovillo per il 19 novembre. L'atto di convocazione e l'ordine del giorno ufficiali non sono stati acquisiti; resta un aggiornamento del filone e non un esito formalmente verificato della precedente richiesta di Futuro Nazionale.",
        sourceLabel: "il Lametino — comunicato di sei consiglieri, 10 novembre 2026",
        sourceUrl:
          "https://www.lametino.it/ultime/lamezia-il-19-novembre-consiglio-comunale-aperto-sul-superamento-del-campo-rom-di-scordovillo.html",
        evidenceLevel: "fonte_stampa" as const,
      },
    ],
  } as T;
}
