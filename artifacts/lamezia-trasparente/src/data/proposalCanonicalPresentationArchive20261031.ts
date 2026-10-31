import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261029";

/** Testi pubblici neutrali, separati dalle dichiarazioni di acquisizione. */
const CANONICAL_20261031: Record<string, CanonicalProposalPresentation> = {
  "commissariato-lamezia-rinforzi-sap-2026": {
    proposalId: "commissariato-lamezia-rinforzi-sap-2026",
    version: "1.0",
    title: "Potenziamento del personale del Commissariato di Lamezia",
    request:
      "Valutare un incremento del personale in servizio al Commissariato di Polizia di Stato di Lamezia Terme, secondo la richiesta del SAP.",
    actionTypes: ["rafforzamento_servizio", "organizzazione"],
    measures: [
      "Esaminare la richiesta sindacale di rafforzamento dell'organico del Commissariato.",
      "Valutare l'assegnazione di personale aggiuntivo al Commissariato di Lamezia Terme.",
    ],
    expectedOutcome:
      "Rafforzare la capacità operativa del Commissariato, quale obiettivo della proposta non accompagnato da una stima verificata dei fabbisogni.",
  },
  "polizia-frontiera-lamezia-tavolo-indennita-sap-2026": {
    proposalId: "polizia-frontiera-lamezia-tavolo-indennita-sap-2026",
    version: "1.0",
    title: "Confronto sull'indennità per la Polizia di Frontiera aeroportuale",
    request:
      "Avviare un tavolo di concertazione sul riconoscimento e sull'attribuzione dell'indennità di sicurezza e frontiera agli operatori della Polizia aeroportuale di Lamezia Terme.",
    actionTypes: ["coordinamento", "organizzazione"],
    measures: [
      "Promuovere un tavolo di concertazione tra gli organismi interessati.",
      "Esaminare i presupposti e le modalità di riconoscimento dell'indennità di sicurezza e frontiera.",
      "Chiarire le modalità di attribuzione dell'indennità agli operatori interessati.",
    ],
    expectedOutcome:
      "Chiarire il trattamento indennitario richiesto, senza presumere la spettanza giuridica delle somme né una decisione già adottata.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261031[proposal.id] ?? previousPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261031[proposalId]) || previousHas(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261031)].sort();
}
