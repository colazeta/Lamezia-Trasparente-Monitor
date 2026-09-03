import type { PublicProposal } from "./propostePubblicheCore";
import {
  getCanonicalProposalPresentation as getBaselineCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds as getBaselineCanonicalProposalPresentationIds,
  hasCanonicalProposalPresentation as hasBaselineCanonicalProposalPresentation,
  type CanonicalProposalPresentation,
} from "./proposalCanonicalPresentation";

/**
 * Canonical LT presentation overlay for proposals acquired after the current
 * baseline file. This keeps acquisition wording separate from the citizen-facing
 * request and lets daily scouting remain reviewable in small diffs.
 */
const SCOUTED_CANONICAL_PROPOSAL_PRESENTATIONS: Record<
  string,
  CanonicalProposalPresentation
> = {
  "quartiere-bella-manutenzione-masi-2026": {
    proposalId: "quartiere-bella-manutenzione-masi-2026",
    version: "1.0",
    title: "Manutenzione e sicurezza del quartiere Bella",
    request:
      "Intervenire sulla viabilità e sugli spazi pubblici del quartiere Bella prima dei festeggiamenti patronali e documentare tempi e responsabilità degli interventi.",
    actionTypes: ["manutenzione", "messa_in_sicurezza", "trasparenza"],
    measures: [
      "Effettuare un sopralluogo tecnico documentato sulle strade del quartiere e individuare i tratti più critici.",
      "Ripristinare il manto stradale e chiudere le buche, con priorità a via Lazio e alle strade del percorso processionale.",
      "Mettere in sicurezza con segnaletica temporanea i tratti che non possono essere ripristinati tempestivamente.",
      "Sfalciare l’erba alta e ripristinare il decoro delle aree verdi e degli spazi pubblici.",
      "Comunicare gli interventi disposti, le risorse assegnate e il responsabile del procedimento.",
      "Comunicare soggetti esecutori, cronoprogramma, misure di sicurezza ed esiti del sopralluogo.",
    ],
    expectedOutcome:
      "Ridurre le condizioni di dissesto e degrado e rendere verificabile il programma degli interventi richiesti.",
  },
  "quartiere-bella-pulizia-mtl-2026": {
    proposalId: "quartiere-bella-pulizia-mtl-2026",
    version: "1.0",
    title: "Pulizia e decoro del quartiere Bella",
    request:
      "Ripristinare pulizia e decoro del quartiere Bella prima dei festeggiamenti patronali del 6-8 settembre.",
    actionTypes: ["manutenzione"],
    measures: [
      "Pulire le strade del quartiere.",
      "Sfalciare la vegetazione presente negli spazi interessati.",
      "Ripristinare condizioni di decoro negli spazi pubblici prima dei festeggiamenti.",
    ],
    expectedOutcome:
      "Rendere strade e spazi pubblici più curati in vista dei festeggiamenti patronali.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return (
    SCOUTED_CANONICAL_PROPOSAL_PRESENTATIONS[proposal.id] ??
    getBaselineCanonicalProposalPresentation(proposal)
  );
}

export function hasCanonicalProposalPresentation(proposalId: string) {
  return (
    Boolean(SCOUTED_CANONICAL_PROPOSAL_PRESENTATIONS[proposalId]) ||
    hasBaselineCanonicalProposalPresentation(proposalId)
  );
}

export function getCanonicalProposalPresentationIds() {
  return [
    ...getBaselineCanonicalProposalPresentationIds(),
    ...Object.keys(SCOUTED_CANONICAL_PROPOSAL_PRESENTATIONS),
  ].sort();
}
