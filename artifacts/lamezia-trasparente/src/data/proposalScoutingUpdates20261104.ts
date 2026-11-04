import type { PublicProposal } from "./propostePubblicheCore";

/** Voto consiliare documentato dalla cronaca ANSA; non prova una risposta a Mascaro. */
export function applyScoutingUpdates20261104Mascaro<T extends PublicProposal>(proposal: T): T {
  if (proposal.id !== "riequilibrio-piano-revoca-mascaro-2026") return proposal;
  return {
    ...proposal,
    periodLabel: "20 luglio – 3 novembre 2026",
    lastUpdated: "2026-11-03",
    linkedActs: [
      ...proposal.linkedActs,
      "Piano di riequilibrio pluriennale approvato dal Consiglio comunale il 3/11/2026 secondo ANSA; numero e testo della delibera originale non acquisiti",
    ],
    verificationNote: proposal.verificationNote +
      " Aggiornamento del 3 novembre: ANSA riferisce il voto favorevole del Consiglio sul Piano decennale. Non è disponibile in questa acquisizione il testo originale della deliberazione, né è verificato che la memoria Mascaro sia stata esaminata o abbia ricevuto risposta. Il voto riguarda il Piano proposto dall'Amministrazione e NON costituisce recepimento, rigetto esplicito o attuazione della proposta di Mascaro; il precedente stato resta proposta_emersa. La successiva fase dinanzi alla Corte dei conti è soltanto prevista.",
    events: [
      ...proposal.events,
      {
        id: "mascaro-riequilibrio-voto-piano-contesto",
        date: "2026-11-03",
        type: "aggiornamento" as const,
        title: "Il Consiglio approva il Piano di riequilibrio; manca la delibera originale",
        summary: "ANSA riferisce l'approvazione consiliare del Piano pluriennale di riequilibrio il 3 novembre. È un atto di contesto sullo stesso oggetto, non un accoglimento né un rigetto espresso della richiesta di Mascaro; il numero e il testo della delibera non sono ancora acquisiti.",
        sourceLabel: "ANSA, 3 novembre 2026 — resoconto del voto sul Piano",
        sourceUrl: "https://www.ansa.it/calabria/notizie/2026/11/03/il-consiglio-comunale-di-lamezia-approva-il-piano-di-riequilibrio_9ec0c0d9-1469-428d-b394-557dc25388d6.html",
        evidenceLevel: "fonte_stampa" as const,
      },
    ],
  } as T;
}
