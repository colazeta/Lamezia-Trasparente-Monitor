import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261110";

/** Presentazione neutrale LT della proposta, separata dal verbale di acquisizione. */
const CANONICAL_20261111: Record<string, CanonicalProposalPresentation> = {
  "scordovillo-consiglio-aperto-pd-azione-per-vivere-bene-2026": {
    proposalId: "scordovillo-consiglio-aperto-pd-azione-per-vivere-bene-2026",
    version: "1.0",
    title: "Confronto pubblico sul percorso abitativo di Scordovillo",
    request:
      "Convocare un Consiglio comunale aperto sulle decisioni relative al superamento del campo di Scordovillo, con la partecipazione dei soggetti istituzionali e sociali interessati.",
    actionTypes: ["organizzazione", "trasparenza", "coordinamento"],
    measures: [
      "Convocare una seduta aperta del Consiglio comunale dedicata a Scordovillo.",
      "Invitare i rappresentanti delle istituzioni statali, regionali e locali coinvolte e i soggetti del Terzo Settore interessati.",
      "Illustrare pubblicamente le scelte relative allo sgombero e ai percorsi abitativi e di inclusione sociale.",
      "Prevedere uno spazio di confronto pubblico sulle prospettive per il quartiere e per le altre zone interessate dalle scelte abitative.",
    ],
    expectedOutcome:
      "Consentire un confronto pubblico informato sulle decisioni e sui percorsi ipotizzati, senza presupporre che la seduta produca interventi o risultati già conseguiti.",
    editorialNote:
      "La seduta del 19 novembre è annunciata dai promotori; non è stata verificata attraverso una convocazione o un ordine del giorno comunale acquisito.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261111[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261111[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261111)].sort();
}
