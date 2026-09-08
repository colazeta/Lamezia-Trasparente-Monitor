import type { PublicProposal } from "./propostePubblicheCore";
import {
  getCanonicalProposalPresentation as getPreviousCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds as getPreviousCanonicalProposalPresentationIds,
  hasCanonicalProposalPresentation as hasPreviousCanonicalProposalPresentation,
} from "./proposalCanonicalPresentationArchive";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";

const SCOUTED_CANONICAL_PROPOSAL_PRESENTATIONS_20260908: Record<
  string,
  CanonicalProposalPresentation
> = {
  "emodinamica-h24-reclutamento-muraca-2026": {
    proposalId: "emodinamica-h24-reclutamento-muraca-2026",
    version: "1.0",
    title: "Organico e H24 per la Cardiologia Interventistica",
    request:
      "Rafforzare l'organico della Cardiologia Interventistica del Giovanni Paolo II per rendere possibile una copertura H24 e il pieno inserimento del presidio nella rete SCA.",
    actionTypes: ["rafforzamento_servizio", "organizzazione"],
    measures: [
      "Avviare procedure mirate di reclutamento di cardiologi ed emodinamisti.",
      "Rafforzare in modo strutturale l'organico dedicato alla Cardiologia Interventistica.",
      "Organizzare il servizio per garantire una copertura continuativa H24.",
      "Completare l'inserimento del presidio nella rete tempo-dipendente della Sindrome Coronarica Acuta.",
    ],
    expectedOutcome:
      "Rendere continuativa la disponibilità del servizio secondo la configurazione H24 richiesta e completare il percorso di integrazione nella rete SCA.",
  },
  "parco-via-degli-itali-manutenzione-branca-2026": {
    proposalId: "parco-via-degli-itali-manutenzione-branca-2026",
    version: "1.0",
    title: "Manutenzione e sicurezza del parco di via degli Itali",
    request:
      "Ripristinare condizioni di manutenzione, sicurezza e fruibilità nel parco giochi di via degli Itali a Capizzaglie.",
    actionTypes: ["manutenzione", "messa_in_sicurezza"],
    measures: [
      "Ripristinare e mantenere l'illuminazione delle aree pavimentate e verdi del parco.",
      "Mettere in sicurezza e riparare i giochi per bambini danneggiati.",
      "Sostituire i cestini danneggiati.",
      "Effettuare la manutenzione del verde e ripristinare il decoro dell'area.",
    ],
    expectedOutcome:
      "Rendere il parco nuovamente fruibile in condizioni di manutenzione e sicurezza verificabili.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return (
    SCOUTED_CANONICAL_PROPOSAL_PRESENTATIONS_20260908[proposal.id] ??
    getPreviousCanonicalProposalPresentation(proposal)
  );
}

export function hasCanonicalProposalPresentation(proposalId: string) {
  return (
    Boolean(SCOUTED_CANONICAL_PROPOSAL_PRESENTATIONS_20260908[proposalId]) ||
    hasPreviousCanonicalProposalPresentation(proposalId)
  );
}

export function getCanonicalProposalPresentationIds() {
  return [
    ...getPreviousCanonicalProposalPresentationIds(),
    ...Object.keys(SCOUTED_CANONICAL_PROPOSAL_PRESENTATIONS_20260908),
  ].sort();
}
