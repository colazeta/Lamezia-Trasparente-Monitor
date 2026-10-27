import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261026Backfill";

/** Citizen-facing presentation; distinct from the historical acquisition. */
const CANONICAL_20261027: Record<string, CanonicalProposalPresentation> = {
  "soppressione-staff-sindaco-riallocazione-risorse-nicotera-2026": {
    proposalId: "soppressione-staff-sindaco-riallocazione-risorse-nicotera-2026",
    version: "1.0",
    title: "Riorganizzazione dello staff del sindaco e riallocazione di risorse",
    request:
      "Chiedere la soppressione degli incarichi di supporto politico del sindaco e la destinazione degli eventuali risparmi a servizi sociali e misure sulla TARI.",
    actionTypes: ["organizzazione", "coordinamento", "trasparenza"],
    measures: [
      "Cessare gli incarichi e i rapporti di lavoro collegati allo staff politico del sindaco, secondo le modalità legalmente applicabili.",
      "Non conferire nuovi incarichi né rinnovare contratti per gli uffici di supporto politico indicati nella mozione.",
      "Destinare prioritariamente gli eventuali risparmi effettivamente disponibili al rafforzamento dei servizi sociali rivolti alle persone con disabilità.",
      "Valutare l'impiego delle risorse liberate per contenere la TARI a carico delle famiglie e delle attività produttive.",
    ],
    expectedOutcome:
      "Rendere valutabile una diversa allocazione delle risorse comunali, senza presumere la disponibilità dei risparmi, la riduzione dei tributi o l'attuazione degli interventi richiesti.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261027[proposal.id] ?? previousPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261027[proposalId]) || previousHas(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261027)].sort();
}
