import type { PublicProposal } from "./propostePubblicheCore";

const PROPOSAL_ID = "quartiere-bella-manutenzione-masi-2026";
const EVENT_ID = "masi-bella-sollecito-interrogazione-dichiarata-2026-11-18";
const SOURCE_URL = "https://www.lametino.it/ultime/lamezia-masi-pd-strade-dissestate-nel-quartiere-bella-comune-sceglie-il-silenzio.html";

/** Stesso promotore, oggetto e filone di settembre: aggiorna la timeline anziché duplicare. */
export function applyScoutingUpdates20261119Masi<T extends PublicProposal>(proposal: T): T {
  if (proposal.id !== PROPOSAL_ID || proposal.events.some(event => event.id === EVENT_ID)) return proposal;

  return {
    ...proposal,
    periodLabel: "2 settembre–18 novembre 2026",
    lastUpdated: "2026-11-18",
    summary: proposal.summary + " Il 18 novembre Masi ha sollecitato nuovamente un riscontro documentato sulla manutenzione di via Lazio e delle strade di Bella e ha dichiarato di avere depositato un'interrogazione consiliare a risposta orale e richiesta di documenti. Il deposito, il numero di protocollo della precedente diffida e l'assenza di risposta restano dichiarazioni del promotore finché non corroborate da fonti amministrative.",
    verificationNote: proposal.verificationNote + " Il Lametino del 18 novembre riporta il riferimento del consigliere a protocollo 2026-PROT-68150 del 3 settembre per la precedente diffida, e la sua dichiarazione di avere depositato il 18 novembre un'interrogazione orale con richiesta di atti, sopralluoghi, responsabile, interventi e tempi. Non sono stati acquisiti ricevuta comunale, testo protocollato dell'interrogazione, verbali tecnici, riscontro dell'ente o prove che lavori siano stati eseguiti. Nessuna attestazione amministrativa indipendente del deposito o dell'assenza di interventi è inferita dalla fonte giornalistica. L'evento non cambia lo stato pubblico già derivato, non equivale ad attuazione; la competenza non si deduce dal destinatario.",
    events: [
      ...proposal.events,
      {
        id: EVENT_ID,
        date: "2026-11-18",
        type: "aggiornamento" as const,
        title: "Masi rinnova la richiesta di atti e dichiara il deposito di un'interrogazione su via Lazio",
        summary: "Il consigliere chiede riscontro sulla diffida di settembre, sopralluoghi, lavori e messa in sicurezza; riferisce il deposito di un'interrogazione e un numero di protocollo precedente, non verificati autonomamente sul registro comunale.",
        sourceLabel: "il Lametino — dichiarazione di Gennarino Masi, 18 novembre 2026",
        sourceUrl: SOURCE_URL,
        evidenceLevel: "fonte_stampa" as const,
      },
    ],
  } as T;
}
