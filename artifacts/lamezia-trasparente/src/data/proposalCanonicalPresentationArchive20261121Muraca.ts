import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261121";

/** Testo pubblico neutrale, indipendente dalla fonte di acquisizione. */
const CANONICAL_MURACA: Record<string, CanonicalProposalPresentation> = {
  "natale-2026-eventi-sambiase-isa-muraca": {
    proposalId: "natale-2026-eventi-sambiase-isa-muraca",
    version: "1.0",
    title: "Iniziative natalizie diffuse nei quartieri, con appuntamenti a Sambiase",
    request: "Valutare un programma di eventi e animazione natalizia che coinvolga Sant'Eufemia, Nicastro e Sambiase, prevedendo iniziative anche in Piazza 5 Dicembre.",
    actionTypes: ["organizzazione", "valorizzazione"],
    measures: [
      "Valutare la distribuzione delle iniziative natalizie tra Sant'Eufemia, Nicastro e Sambiase.",
      "Prevedere, ove fattibile, attività di animazione e incontro rivolte a bambini e famiglie in Piazza 5 Dicembre.",
      "Definire e rendere conoscibili date, luoghi e modalità delle eventuali iniziative inserite nel calendario comunale.",
      "Verificare preventivamente gli aspetti organizzativi, autorizzativi e le risorse eventualmente necessarie.",
    ],
    expectedOutcome: "Disporre di una proposta di calendario territoriale verificabile, senza presupporre l'approvazione o l'effettivo svolgimento degli eventi.",
    editorialNote: "Richiesta espressa nel comunicato del 20 novembre 2026. Nessun deposito, finanziamento, programma approvato o realizzazione verificati. Oggetto distinto dalla richiesta di luminarie nelle frazioni della consigliera Raso.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_MURACA[proposal.id] ?? previousPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_MURACA[proposalId]) || previousHas(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_MURACA)])].sort();
}
