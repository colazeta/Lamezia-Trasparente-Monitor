import type { PublicProposal } from "./propostePubblicheCore";
/** Follow-up sullo stesso oggetto via Montello, senza nuovo ID e senza inferire deposito. */
export function applyScoutingUpdates20261121Montello<T extends PublicProposal>(proposal: T): PublicProposal {
  if (proposal.id !== "via-montello-illuminazione-potature-carito-2026") return proposal;
  if (proposal.events.some(e => e.id === "vescio-pd-via-montello-interrogazione-2026-11-20")) return proposal;
  return {
    ...proposal,
    periodLabel: "14–20 novembre 2026",
    lastUpdated: "2026-11-20",
    summary: proposal.summary + " Il 20 novembre la consigliera Lidia Vescio (PD) comunica di aver rivolto un'interrogazione anche su via Montello, chiedendo interventi, risorse e tempi certi; non è disponibile la ricevuta istituzionale del deposito.",
    verificationNote: proposal.verificationNote + " Sviluppo 20 novembre: Lidia Vescio (PD) riferisce un'ulteriore interrogazione del gruppo, documentata nel suo comunicato, ma nessun atto o protocollo originale è stato acquisito. La continuità di oggetto (via Montello), gruppo politico e misure giustifica un solo proposal ID; nessuna risposta o esecuzione verificata.",
    events: [...proposal.events, {
      id: "vescio-pd-via-montello-interrogazione-2026-11-20",
      date: "2026-11-20", type: "aggiornamento",
      title: "Il gruppo PD rinnova richiesta di illuminazione e tempi per via Montello",
      summary: "Vescio riferisce una interrogazione rivolta all'amministrazione per risorse, interventi e date. Il deposito non è attestato da protocollo originale.",
      sourceLabel: "LameziaTerme.it — nota di Lidia Vescio, 20 novembre 2026",
      sourceUrl: "https://www.lameziaterme.it/vescio-pd-illuminazione-area-pip-in-via-montello-servono-tempi-certi/", evidenceLevel: "fonte_stampa"
    }]
  };
}
