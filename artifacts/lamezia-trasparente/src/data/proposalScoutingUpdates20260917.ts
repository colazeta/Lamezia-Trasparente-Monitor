import type { PublicProposal } from "./propostePubblicheCore";

const LA_MIA_ESTATE_ID = "la-mia-estate-avvio-attivita-oltre-autismo-2026";
const LA_MIA_ESTATE_ALBO_SOURCE_URL =
  "https://albo.tinnvision.cloud/export/print?a=2026-09-17&da=2026-03-17&ente=00301390795&wich=all";

function updateLaMiaEstateConventionStep(
  proposal: PublicProposal,
): PublicProposal {
  const eventId = "la-mia-estate-schema-convenzione-16-settembre";
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  return {
    ...proposal,
    periodLabel: "18 agosto–16 settembre 2026",
    lastUpdated: "2026-09-16",
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il 16 settembre l'Albo Pretorio del Comune di Lamezia Terme registra la determinazione dirigenziale R.G. n. 1446, pubblicazione n. 2026/2976, del Settore Servizi alla Persona, avente a oggetto l'approvazione dello schema di convenzione, l'impegno e l'autorizzazione alla sottoscrizione con gli enti erogatori risultati idonei per la misura regionale La mia estate. Il passaggio documenta un avanzamento amministrativo concreto verso l'erogazione del servizio. L'oggetto ufficiale dell'atto non prova però, da solo, che tutte le convenzioni siano già state materialmente sottoscritte né che le attività siano iniziate. Non viene inoltre attribuito un nesso causale con le richieste di Oltre l'Autismo e l'evento non è trattato come recepimento o attuazione della proposta.",
    linkedActs: [
      ...proposal.linkedActs,
      "Determinazione dirigenziale R.G. n. 1446 del 16/09/2026 — Albo Pretorio n. 2026/2976",
    ],
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-09-16",
        type: "aggiornamento",
        title:
          "Il Comune approva lo schema di convenzione e autorizza la sottoscrizione con gli enti idonei",
        summary:
          "La determinazione dirigenziale R.G. n. 1446 del 16 settembre 2026 approva lo schema di convenzione, dispone l'impegno e autorizza la sottoscrizione con gli enti erogatori risultati idonei della misura La mia estate. L'atto documenta un avanzamento amministrativo ma non dimostra, da solo, l'effettiva sottoscrizione di tutte le convenzioni o l'avvio delle attività.",
        sourceLabel:
          "Albo Pretorio Comune di Lamezia Terme — determinazione R.G. n. 1446/2026, pubbl. 2026/2976",
        sourceUrl: LA_MIA_ESTATE_ALBO_SOURCE_URL,
        evidenceLevel: "fonte_ufficiale",
      },
    ],
  };
}

/**
 * Scouting del 17 settembre 2026.
 *
 * Registra soltanto sviluppi verificati su fonte originaria. L'atto comunale
 * sulla convenzione di La mia estate è distinto sia dal recepimento della
 * proposta di Oltre l'Autismo sia dall'effettivo avvio delle attività.
 */
export function applyScoutingUpdates20260917(
  proposal: PublicProposal,
): PublicProposal {
  if (proposal.id === LA_MIA_ESTATE_ID)
    return updateLaMiaEstateConventionStep(proposal);
  return proposal;
}
