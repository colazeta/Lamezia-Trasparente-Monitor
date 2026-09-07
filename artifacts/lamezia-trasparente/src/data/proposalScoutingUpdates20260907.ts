import type { PublicProposal } from "./propostePubblicheCore";

const LA_MIA_ESTATE_ID = "la-mia-estate-avvio-attivita-oltre-autismo-2026";
const STRAFACE_UPDATE_SOURCE_URL =
  "https://www.lametino.it/ultimora/bando-la-mia-estate-straface-misura-sperimentale-riaperti-termini-per-offrire-piu-opportunita-alle-famiglie.html";

function updateLaMiaEstate(proposal: PublicProposal): PublicProposal {
  const eventId = "la-mia-estate-regione-proroga-accreditamenti-6-settembre";
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  return {
    ...proposal,
    periodLabel: "18 agosto–6 settembre 2026",
    lastUpdated: "2026-09-06",
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il 6 settembre l'assessore regionale al Welfare Pasqualina Straface ha dichiarato che la Regione ha promosso una proroga della misura fino al 31 dicembre e che tale passaggio consente agli Ambiti Territoriali Sociali di riaprire i termini per l'accreditamento di ulteriori cooperative e associazioni del Terzo Settore. La DGR Calabria n. 371/2026 prevedeva già, nella scheda progettuale ufficiale, la possibilità di prorogare l'utilizzo dei voucher fino al 31 dicembre. Lo scouting non ha però reperito un successivo atto regionale che formalizzi la proroga né, alla data del 7 settembre, un avviso dell'ATS di Lamezia Terme che documenti l'effettiva riapertura locale degli accreditamenti. Il passaggio è quindi registrato come aggiornamento istituzionale del contesto della misura e non come avvio delle attività, recepimento della richiesta di Oltre l'Autismo o prova di attuazione locale.",
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-09-06",
        type: "aggiornamento",
        title:
          "La Regione annuncia una proroga e la possibilità di riaprire gli accreditamenti negli ATS",
        summary:
          "L'assessore regionale al Welfare dichiara che la Regione ha promosso una proroga di La mia estate fino al 31 dicembre e che gli ATS possono riaprire i termini per accreditare ulteriori cooperative e associazioni del Terzo Settore. Non risulta ancora verificato un atto locale dell'ATS di Lamezia che disponga la riapertura né l'avvio delle attività richiesto dal promotore.",
        sourceLabel:
          "il Lametino — dichiarazioni dell'Assessore regionale al Welfare",
        sourceUrl: STRAFACE_UPDATE_SOURCE_URL,
        evidenceLevel: "fonte_stampa",
      },
    ],
  };
}

/**
 * Scouting del 7 settembre 2026: collega alla proposta di Oltre l'Autismo il
 * nuovo sviluppo regionale del 6 settembre senza trasformarlo in risposta
 * puntuale, recepimento o attuazione del procedimento locale.
 */
export function applyScoutingUpdates20260907(
  proposal: PublicProposal,
): PublicProposal {
  if (proposal.id === LA_MIA_ESTATE_ID) return updateLaMiaEstate(proposal);
  return proposal;
}
