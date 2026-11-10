import type { PublicProposal } from "./propostePubblicheCore";

const ID = "ex-cinema-grandinetti-bonifica-2026";
const EVENT = "lidia-vescio-grandinetti-esito-riferito-2026-08-18";

/** Un'affermazione della proponente non equivale ad atto ufficiale né a prova di lavori. */
export function applyScoutingUpdates20261110Grandinetti<T extends PublicProposal>(proposal: T): T {
  if (proposal.id !== ID || proposal.events.some(event => event.id === EVENT)) return proposal;
  return {
    ...proposal,
    periodLabel: "Luglio–agosto 2026",
    lastUpdated: "2026-08-18",
    verificationNote:
      proposal.verificationNote +
      " Il 18 agosto Lidia Vescio ha dichiarato che il Consiglio aveva approvato la sua mozione e che l'area dell'ex cinema era stata messa in sicurezza dopo la presentazione. La fonte è una nota della stessa proponente ripresa dal Corriere di Lamezia; non sono stati reperiti il verbale o il voto originale del Consiglio né certificazioni, affidamenti o altri riscontri autonomi sui lavori. Si registra come aggiornamento dichiarativo, senza classificare l'evento come recepimento, risposta ufficiale o implementation evidence. È distinta la successiva proposta di Salvatore Vescio sulla gestione culturale del medesimo immobile.",
    events: [
      ...proposal.events,
      {
        id: EVENT,
        date: "2026-08-18",
        type: "aggiornamento" as const,
        title: "La proponente dichiara approvata la mozione e riferisce la messa in sicurezza",
        summary:
          "Lidia Vescio riferisce l'approvazione consiliare della mozione e un primo intervento di messa in sicurezza. Le affermazioni non sono confermate in questa acquisizione dal verbale del Consiglio né da atti o verifiche tecniche sull'esecuzione: nessun recepimento o attuazione verificati.",
        sourceLabel: "Corriere di Lamezia — nota di Lidia Vescio, 18 agosto 2026",
        sourceUrl: "https://www.corrieredilamezia.it/politica/2026_08_18/ex-cinema-grandinetti-la-mozione-di-lidia-vescio-produce-il-primo-risultato-area-messa-in-sicurezza_65804/",
        evidenceLevel: "fonte_stampa" as const,
      },
    ],
  } as T;
}
