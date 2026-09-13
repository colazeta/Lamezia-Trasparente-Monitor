import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as getPreviousCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds as getPreviousCanonicalProposalPresentationIds,
  hasCanonicalProposalPresentation as hasPreviousCanonicalProposalPresentation,
} from "./proposalCanonicalPresentationArchive";

const SCORDOVILLO_ID =
  "scordovillo-consiglio-aperto-trasparenza-futuro-nazionale-2026";

const SCORDOVILLO_CANONICAL_PRESENTATION: CanonicalProposalPresentation = {
  proposalId: SCORDOVILLO_ID,
  version: "1.0",
  title: "Consiglio comunale aperto su Scordovillo e trasparenza del percorso abitativo",
  request:
    "Convocare un Consiglio comunale aperto su Scordovillo e rendere pubblicamente verificabili criteri, responsabilità e modalità delle decisioni relative al percorso abitativo collegato al superamento del campo.",
  actionTypes: ["organizzazione", "trasparenza", "coordinamento"],
  measures: [
    "Convocare un Consiglio comunale aperto dedicato alla vicenda Scordovillo.",
    "Rendere pubblici i criteri utilizzati per individuare i beneficiari e le modalità di assegnazione degli alloggi collegati al percorso.",
    "Chiarire in sede pubblica il ruolo del Comune e le responsabilità dei diversi soggetti istituzionali coinvolti.",
    "Esplicitare le valutazioni sull’impatto sociale delle soluzioni abitative nei quartieri interessati.",
  ],
  expectedOutcome:
    "Rendere il percorso decisionale più conoscibile e verificabile e consentire una discussione pubblica delle scelte, senza attribuire alla seduta effetti sostanziali non ancora dimostrati.",
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  if (proposal.id === SCORDOVILLO_ID) return SCORDOVILLO_CANONICAL_PRESENTATION;
  return getPreviousCanonicalProposalPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string) {
  return proposalId === SCORDOVILLO_ID || hasPreviousCanonicalProposalPresentation(proposalId);
}

export function getCanonicalProposalPresentationIds() {
  return [...getPreviousCanonicalProposalPresentationIds(), SCORDOVILLO_ID].sort();
}