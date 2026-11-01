import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261031B";

/** Presentazione cittadina neutrale e autonoma rispetto al record di acquisizione. */
const CANONICAL_20261101: Record<string, CanonicalProposalPresentation> = {
  "turismo-imposta-soggiorno-tavolo-federalberghi-2026": {
    proposalId: "turismo-imposta-soggiorno-tavolo-federalberghi-2026",
    version: "1.0",
    title: "Coordinamento turistico e uso degli introiti dell'imposta di soggiorno",
    request:
      "Istituire un tavolo per l'accoglienza turistica e destinare gli eventuali introiti dell'imposta di soggiorno a servizi e iniziative turistici, come richiesto da Federalberghi Calabria.",
    actionTypes: ["coordinamento", "trasparenza", "organizzazione", "rafforzamento_servizio"],
    measures: [
      "Istituire un tavolo di coordinamento tra Comune, operatori ricettivi, ristoratori, tassisti, aziende di trasporto e operatori culturali.",
      "Definire e rendere verificabili le destinazioni turistiche degli eventuali proventi dell'imposta di soggiorno.",
      "Valutare un progetto comune per l'identità e l'accoglienza turistica della città.",
      "Valutare l'accessibilità delle informazioni turistiche, anche in lingua inglese, e la conoscibilità degli orari di musei e trasporti.",
      "Esaminare il coordinamento dei collegamenti turistici tra aeroporto, stazione, città e costa.",
    ],
    expectedOutcome:
      "Migliorare la programmazione e la riconoscibilità dell'accoglienza turistica; l'effettiva disponibilità di fondi, l'istituzione del tavolo e i benefici attesi restano da verificare.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261101[proposal.id] ?? previousPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261101[proposalId]) || previousHas(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261101)].sort();
}
