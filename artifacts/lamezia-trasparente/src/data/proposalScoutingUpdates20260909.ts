import type { PublicProposal } from "./propostePubblicheCore";

const PD_EMODINAMICA_ID = "emodinamica-h24-commissione-sanita-pd-2026";
const MURACA_SOURCE_URL =
  "https://www.lametino.it/ultime/lamezia-muraca-pd-bene-lavvio-della-cardiologia-interventistica-ora-reclutare-medici.html";

function updatePdEmodinamica(proposal: PublicProposal): PublicProposal {
  const eventId = "emodinamica-pd-muraca-reclutamento-8-settembre";
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  return {
    ...proposal,
    periodLabel: "5–8 settembre 2026",
    lastUpdated: "2026-09-08",
    verificationNote:
      `${proposal.verificationNote} ` +
      "L'8 settembre Fabrizio Muraca, consigliere comunale PD, ha formulato a nome personale e del Partito Democratico un ulteriore sviluppo dello stesso oggetto: dare mandato ad Azienda Zero per procedure straordinarie e mirate di reclutamento di cardiologi ed emodinamisti, con l'obiettivo dichiarato di rendere possibile una copertura continuativa H24 e il pieno inserimento del presidio nella rete tempo-dipendente per la sindrome coronarica acuta. Poiché promotore politico normalizzato, oggetto e filone coincidono sostanzialmente con la proposta della Commissione Sanità PD del 5 settembre, lo sviluppo viene aggiunto alla stessa timeline invece di creare un duplicato. L'operatività della sala e le prime procedure cliniche, documentate dalla fonte, non vengono interpretate come attuazione della richiesta di emodinamica fissa H24 né del nuovo reclutamento. La funzione di gestione delle procedure di reclutamento del personale del SSR risulta trasferita ad Azienda Zero dal DCA Calabria n. 217/2025; questo rafforza la base amministrativa del competence assessment già qualificato come partially_verified, senza trasformare il destinatario politico in ente competente.",
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-09-08",
        type: "aggiornamento",
        title:
          "Il PD chiede reclutamento mirato di cardiologi ed emodinamisti tramite Azienda Zero",
        summary:
          "Muraca chiede al Presidente della Regione e Commissario ad acta di dare mandato ad Azienda Zero per procedure straordinarie e mirate di reclutamento di cardiologi ed emodinamisti, collegando il rafforzamento degli organici alla richiesta già censita di rendere continuativo il servizio H24. Le prime procedure effettuate nella nuova sala non sono considerate prova di attuazione della configurazione H24 richiesta.",
        sourceLabel: "il Lametino — dichiarazioni di Fabrizio Muraca (PD)",
        sourceUrl: MURACA_SOURCE_URL,
        evidenceLevel: "fonte_stampa",
      },
    ],
  };
}

/**
 * Scouting del 9 settembre 2026: deduplica il nuovo intervento di Fabrizio
 * Muraca come sviluppo della proposta PD già censita sull'emodinamica H24.
 */
export function applyScoutingUpdates20260909(
  proposal: PublicProposal,
): PublicProposal {
  if (proposal.id === PD_EMODINAMICA_ID) return updatePdEmodinamica(proposal);
  return proposal;
}
