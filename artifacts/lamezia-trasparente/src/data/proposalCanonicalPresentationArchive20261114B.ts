import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261114";

/** Presentazione LT indipendente dal record di acquisizione. */
const CANONICAL_20261114_B: Record<string, CanonicalProposalPresentation> = {
  "zuccherificio-opificio-hub-polifunzionale-natrella-2026": {
    proposalId: "zuccherificio-opificio-hub-polifunzionale-natrella-2026",
    version: "1.0",
    title: "Valutazione del riuso dell'ex Zuccherificio e dell'ex Opificio",
    request: "Promuovere un tavolo tecnico con istituzioni, proprietà e potenziali investitori per valutare un progetto di riuso polifunzionale dei due complessi industriali.",
    actionTypes: ["coordinamento", "riuso", "valorizzazione", "infrastruttura"],
    measures: [
      "Proporre un tavolo tecnico tra Amministrazione comunale, Regione, proprietà e potenziali investitori.",
      "Verificare i vincoli urbanistici, patrimoniali e progettuali, nonché la disponibilità delle aree per qualsiasi intervento.",
      "Valutare un eventuale quartiere fieristico e congressuale con funzioni espositive e ricettive.",
      "Esaminare la fattibilità di un terminal per autobus raccordato con la stazione ferroviaria esistente.",
      "Studiare spazi per incubazione d'impresa, coworking, formazione e attività direzionali.",
      "Valutare un parco agroalimentare e luoghi per iniziative musicali e culturali, rispettando il patrimonio industriale esistente."
    ],
    expectedOutcome: "Disporre di un confronto e di verifiche di fattibilità sulle diverse opzioni di riuso, senza presumere accordi, finanziamenti o benefici accertati.",
    editorialNote: "Nota pubblica attribuita a Natrella il 13 novembre 2026. Il progetto è una proposta e non risulta formalizzato. I soggetti economici nominati nella fonte non sono partner verificati. Il destinatario è distinto dall'eventuale competenza su proprietà, urbanistica, trasporti e investimenti."
  }
};

export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal, "id" | "title" | "summary">): CanonicalProposalPresentation {
  return CANONICAL_20261114_B[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261114_B[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_20261114_B)])].sort();
}
