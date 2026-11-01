import type { PublicProposal } from "./propostePubblicheCore";

const PROPOSAL_ID = "politiche-sociali-progetto-vita-2026";
const EVENT_ID = "progetto-vita-ats-avviso-tavoli-permanenti-30-ottobre";
const SOURCE_URL = "https://www.comune.lamezia-terme.cz.it/it/news/manifestazione-di-interesse-per-la-costituzione-dei-tavoli-tematici-permanenti";
const DOCUMENT_URL = "https://lamezia-terme-api.municipiumapp.it/s3/3458/allegati/servizi-sociali/manifinteresse-tavoli-tematici-2026/manifestazione-di-interesse.pdf";

/**
 * Sviluppo istituzionale documentato del tema Tavolo permanente sulla disabilità,
 * senza confondere atto autonomo dell'ATS, domanda civica e sua eventuale attuazione.
 */
export function applyScoutingUpdates20261101(
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
    lastUpdated: "2026-10-30",
    linkedActs: Array.from(
      new Set([
        ...proposal.linkedActs,
        "ATS Lamezia Terme — determinazione dirigenziale n. 1656 del 30/10/2026, avviso ETS per tavoli tematici permanenti",
      ]),
    ),
    verificationNote:
      proposal.verificationNote +
      " Il 30 ottobre 2026 il Comune, quale capofila dell'ATS, ha pubblicato l'avviso di manifestazione d'interesse previsto dalla determinazione n. 1656 per la costituzione di tavoli tematici permanenti nel welfare locale, inclusa esplicitamente la macroarea Disabilità. La pagina e l'avviso ufficiali (" + SOURCE_URL + "; " + DOCUMENT_URL + ") documentano l'apertura delle adesioni ETS fino al 16 novembre 2026 e la possibilità di nuove adesioni successive. La procedura non prova che i tavoli siano già insediati o operativi. L'avviso richiama precedenti tavoli connessi al Piano di Zona 2020/2022: non si deduce l'origine dalla proposta associativa, né un suo recepimento o una sua attuazione. Promotore, destinatario, competenza, status pubblico e profilo semantico restano invariati.",
    events: [
      ...proposal.events,
      {
        id: EVENT_ID,
        date: "2026-10-30",
        type: "aggiornamento",
        title: "L'ATS apre le adesioni ai tavoli tematici permanenti, incluso quello sulla disabilità",
        summary:
          "Il Comune capofila ATS pubblica la determinazione dirigenziale n. 1656/2026 e l'avviso rivolto agli Enti del Terzo Settore, che comprende un tavolo sulla disabilità. Il primo termine per le adesioni è il 16 novembre, con successive istanze possibili. È un passaggio procedurale ufficiale nel medesimo filone, ma non prova l'insediamento dei tavoli né un recepimento causale o un'attuazione della proposta dell'associazione.",
        sourceLabel: "Comune di Lamezia Terme — avviso ATS del 30 ottobre 2026",
        sourceUrl: SOURCE_URL,
        evidenceLevel: "fonte_ufficiale",
      },
    ],
  };
}
