import type { PublicProposal } from "./propostePubblicheCore";

const ASILI_ID = "asili-nido-continuita-servizio-2026";

const ASILI_ACTUAL_START_SOURCE_URL =
  "https://www.lametino.it/ultimora/lamezia-partito-il-servizio-degli-asili-nido-comunali-ficus-su-famiglie-e-ambientamenti.html";

function updateAsiliActualStart(proposal: PublicProposal): PublicProposal {
  const eventId = "asili-nido-avvio-effettivo-15-settembre";
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  return {
    ...proposal,
    periodLabel: "26 agosto–15 settembre 2026",
    lastUpdated: "2026-09-15",
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il 15 settembre due testate locali documentano l'effettivo avvio del servizio nei tre asili nido comunali di via Conforti, via Spartivento e via Giovanni XXIII, dopo la calendarizzazione ufficiale dell'11 settembre. Il Lametino riferisce che il servizio è partito e che l'avvio segue il perfezionamento della nuova gestione e gli interventi richiesti per l'accreditamento; Corriere di Lamezia riporta nello stesso giorno la dichiarazione dell'assessore al Welfare Mimmo Gianturco sull'avvio del servizio e sulla presenza dell'Amministrazione presso le strutture. La convergenza viene usata come evidenza dell'avvio operativo del servizio, non come prova che tutte le ulteriori richieste formulate nell'interrogazione di Masi siano integralmente soddisfatte. Nessuna fonte collega causalmente l'avvio all'interrogazione e non viene inferito un recepimento politico della proposta.",
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-09-15",
        type: "aggiornamento",
        title: "Parte il servizio nei tre asili nido comunali",
        summary:
          "Il 15 settembre viene documentato l'avvio effettivo del servizio negli asili di via Conforti, via Spartivento e via Giovanni XXIII. L'evento costituisce evidenza di avvio operativo del servizio già calendarizzato, ma non dimostra il completamento di tutte le ulteriori richieste sulla continuità e trasparenza né un nesso causale con l'interrogazione.",
        sourceLabel:
          "il Lametino, 15 settembre 2026 — avvio del servizio degli asili nido comunali",
        sourceUrl: ASILI_ACTUAL_START_SOURCE_URL,
        evidenceLevel: "ricostruzione_multi_fonte",
      },
    ],
  };
}

/**
 * Scouting del 16 settembre 2026.
 *
 * Aggiorna timeline già censite solo quando una fonte successiva supera la soglia
 * probatoria del precedente stato. L'avvio del servizio nidi è distinto dal
 * recepimento politico e dalla completa attuazione di tutte le misure richieste.
 */
export function applyScoutingUpdates20260916(
  proposal: PublicProposal,
): PublicProposal {
  if (proposal.id === ASILI_ID) return updateAsiliActualStart(proposal);
  return proposal;
}
