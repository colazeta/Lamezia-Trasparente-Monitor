import type { PublicProposal } from "./propostePubblicheCore";

const PROPOSAL_ID = "politiche-sociali-progetto-vita-2026";
const EVENT_ID = "progetto-vita-intesa-ats-asp-riferita-26-ottobre";
const SOURCE_URL =
  "https://www.lametino.it/ultimora/lamezia-accordo-tra-comune-e-asp-per-lintegrazione-sociosanitaria-di-persone-fragili-e-con-disabilita.html";

/**
 * Newspaper-source context on an existing civic proposal, not a new proposal,
 * verified institutional filing, causal reception, or implementation evidence.
 */
export function applyScoutingUpdates20261027ProjectVita(
  proposal: PublicProposal,
): PublicProposal {
  if (
    proposal.id !== PROPOSAL_ID ||
    proposal.events.some((event) => event.id === EVENT_ID)
  ) {
    return proposal;
  }

  return {
    ...proposal,
    lastUpdated: "2026-10-26",
    verificationNote:
      proposal.verificationNote +
      " Il 26 ottobre 2026 il Lametino ha pubblicato una comunicazione attribuita al Comune e all'ASP di Catanzaro che riferisce la sottoscrizione di un Accordo interistituzionale per l'integrazione sociosanitaria. La comunicazione menziona PUA, équipe multidisciplinare, Progetti di Vita, case manager, budget integrato e tavolo distrettuale. Non è stata acquisita copia dell'accordo firmato, né chiarito il rapporto con il protocollo ATS-ASP del 31 dicembre 2025 già citato dal Comune. È un aggiornamento documentale del contesto amministrativo, non prova che le proposte civiche siano state recepite o attuate. Il 26 ottobre è data della pubblicazione, non data indipendentemente verificata della firma. Non modifica destinatario, competenza, stato istituzionale o classificazioni.",
    events: [
      ...proposal.events,
      {
        id: EVENT_ID,
        date: "2026-10-26",
        type: "aggiornamento",
        title: "Riferita una nuova intesa tra Comune e ASP per i Progetti di Vita",
        summary:
          "Una comunicazione riportata dal Lametino il 26 ottobre attribuisce a Comune e ASP la sottoscrizione di un'intesa sull'integrazione sociosanitaria. Il testo descrive PUA, valutazione multidisciplinare, case manager, budget di progetto e tavolo di coordinamento. Il documento sottoscritto non è stato acquisito; non è verificato il rapporto con il precedente protocollo del 2025, né un collegamento causale con la proposta associativa. Nessun recepimento o intervento attuativo è accertato con questa fonte.",
        sourceLabel:
          "il Lametino, 26 ottobre 2026 — comunicazione attribuita a Comune e ASP",
        sourceUrl: SOURCE_URL,
        evidenceLevel: "fonte_stampa",
      },
    ],
  };
}
