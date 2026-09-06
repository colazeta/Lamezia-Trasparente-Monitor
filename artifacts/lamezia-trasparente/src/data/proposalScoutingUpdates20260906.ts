import type { PublicProposal } from "./propostePubblicheCore";

const EMODINAMICA_IDS = new Set([
  "emodinamica-h24-giovanni-paolo-ii-2026",
  "emodinamica-h24-vescio-2026",
  "emodinamica-h24-nucifero-2026",
]);

const PERIOD_LABELS: Record<string, string> = {
  "emodinamica-h24-giovanni-paolo-ii-2026": "18 agosto–4 settembre 2026",
  "emodinamica-h24-vescio-2026": "14 agosto–4 settembre 2026",
  "emodinamica-h24-nucifero-2026": "19 agosto–4 settembre 2026",
};

const ASP_CARDIOLOGY_SOURCE_URL =
  "https://www.corrieredilamezia.it/attualita/2026_09_04/lamezia-terme-asp-cz-eseguite-le-procedure-zero-e-operativa-la-sala-di-cardiologia-interventistica_66194/";

function updateEmodinamica(proposal: PublicProposal): PublicProposal {
  const eventId = `emodinamica-${proposal.promoterId}-sala-cardiologia-interventistica-operativa-4-settembre`;
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  return {
    ...proposal,
    periodLabel: PERIOD_LABELS[proposal.id] ?? proposal.periodLabel,
    lastUpdated: "2026-09-04",
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il 4 settembre una nota dell'ASP di Catanzaro, ripresa integralmente dalla stampa locale, ha comunicato il completamento della dotazione strumentale della sala di cardiologia interventistica del Giovanni Paolo II e l'esecuzione delle prime due procedure. È un'evidenza operativa sostanziale relativa alla sala, ma le fonti verificate non documentano un servizio di emodinamica strutturale H24/7, la copertura continuativa delle emergenze cardiologiche, personale stabile dedicato o la piena integrazione nella Rete STEMI. L'evento è quindi registrato come aggiornamento e non come attuazione della richiesta H24. Non è stato reperito un permalink dedicato sul sito ASP della nota del 4 settembre; il testo è però attribuito esplicitamente all'ASP e riprodotto concordemente da più testate.",
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-09-04",
        type: "aggiornamento",
        title:
          "L'ASP comunica l'operatività della sala di cardiologia interventistica",
        summary:
          "La nota dell'ASP di Catanzaro comunica che, completata la dotazione strumentale con le apparecchiature arrivate nei mesi di giugno e luglio, il 4 settembre la sala di cardiologia interventistica del Giovanni Paolo II ha eseguito le prime due procedure. La fonte non documenta l'attivazione di un servizio di emodinamica H24/7 né la copertura continuativa delle emergenze: il passaggio non viene quindi trattato come attuazione della richiesta H24.",
        sourceLabel: "ASP Catanzaro via Corriere di Lamezia",
        sourceUrl: ASP_CARDIOLOGY_SOURCE_URL,
        evidenceLevel: "fonte_stampa",
      },
    ],
  };
}

/**
 * Scouting del 6 settembre 2026: sviluppo operativo della sala di cardiologia
 * interventistica emerso il 4 settembre. Lo stesso fatto viene collegato alle
 * tre proposte del filone H24 senza fonderle, perché i promotori restano distinti.
 */
export function applyScoutingUpdates20260906(
  proposal: PublicProposal,
): PublicProposal {
  if (EMODINAMICA_IDS.has(proposal.id)) return updateEmodinamica(proposal);
  return proposal;
}
