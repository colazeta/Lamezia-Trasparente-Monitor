import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as getPreviousCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds as getPreviousCanonicalProposalPresentationIds,
  hasCanonicalProposalPresentation as hasPreviousCanonicalProposalPresentation,
} from "./proposalCanonicalPresentationArchive20260913";

const SERRA_ANNUNZIATA_ID =
  "serra-annunziata-rifiuti-sicurezza-serratore-2026";

const SERRA_ANNUNZIATA_CANONICAL_PRESENTATION: CanonicalProposalPresentation = {
  proposalId: SERRA_ANNUNZIATA_ID,
  version: "1.0",
  title: "Bonifica, monitoraggio e prevenzione nelle località Serra e Annunziata",
  request:
    "Effettuare un intervento di pulizia e bonifica e predisporre un piano continuativo di monitoraggio, controlli e gestione dei rifiuti nelle località Serra e Annunziata, coordinando i soggetti coinvolti.",
  actionTypes: [
    "manutenzione",
    "prevenzione_rischio",
    "rafforzamento_servizio",
    "coordinamento",
  ],
  measures: [
    "Effettuare un intervento di pulizia e bonifica delle aree interessate.",
    "Predisporre un piano continuativo con monitoraggio costante e regolarità degli interventi.",
    "Rafforzare i controlli e le misure contro l’abbandono illecito dei rifiuti.",
    "Valutare l’installazione di videosorveglianza o fototrappole nei punti maggiormente interessati e, se già presenti, verificarne funzionamento e operatività.",
    "Verificare l’adeguatezza del sistema di raccolta e valutare correttivi o punti di raccolta organizzati e controllati.",
    "Rafforzare il coordinamento tra Amministrazione comunale, Polizia Locale, gestore del servizio e altre autorità competenti.",
  ],
  expectedOutcome:
    "Ridurre la ricorrenza dell’abbandono dei rifiuti e migliorare nel tempo vivibilità e sicurezza delle aree, senza attribuire alle misure un’efficacia non ancora dimostrata.",
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  if (proposal.id === SERRA_ANNUNZIATA_ID)
    return SERRA_ANNUNZIATA_CANONICAL_PRESENTATION;
  return getPreviousCanonicalProposalPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string) {
  return (
    proposalId === SERRA_ANNUNZIATA_ID ||
    hasPreviousCanonicalProposalPresentation(proposalId)
  );
}

export function getCanonicalProposalPresentationIds() {
  return [
    ...getPreviousCanonicalProposalPresentationIds(),
    SERRA_ANNUNZIATA_ID,
  ].sort();
}
