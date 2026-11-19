import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261119";

/** Presentazione canonica LT indipendente dalla nota originale del promotore. */
const CANONICAL_BACKFILL: Record<string, CanonicalProposalPresentation> = {
  "villetta-reillo-albero-sicurezza-masi-2026": {
    proposalId: "villetta-reillo-albero-sicurezza-masi-2026",
    version: "1.0",
    title: "Verifica e sicurezza delle alberature nella villetta Reillo",
    request: "Verificare le condizioni di un albero segnalato presso la villetta Reillo e valutare gli interventi necessari a tutelare gli spazi e gli edifici confinanti.",
    actionTypes: ["messa_in_sicurezza", "manutenzione", "trasparenza"],
    measures: [
      "Effettuare un sopralluogo tecnico per identificare l'albero e verificare la distanza dai fabbricati.",
      "Valutare le condizioni agronomiche, fitostatiche e strutturali sulla base di accertamenti specialistici.",
      "Adottare eventuali misure provvisorie proporzionate ai rischi effettivamente rilevati.",
      "Determinare ed eseguire, se tecnicamente giustificati, interventi di gestione o messa in sicurezza delle parti arboree interessate.",
      "Comunicare gli esiti delle verifiche e gli eventuali tempi degli interventi."
    ],
    expectedOutcome: "Disporre di una valutazione tecnica verificabile e, ove necessarie, di misure di sicurezza motivate, senza presumerne l'esito o l'efficacia.",
    editorialNote: "Il rischio, le caratteristiche dell'esemplare e l'assenza di interventi risultano da dichiarazioni del promotore. Nessun deposito formale o intervento è stato verificato."
  }
};
export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal,"id"|"title"|"summary">): CanonicalProposalPresentation {
  return CANONICAL_BACKFILL[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_BACKFILL[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_BACKFILL)])].sort();
}
