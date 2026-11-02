import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261101";

/** Presentazioni neutre, separate dai record di acquisizione e dai relativi claim. */
const CANONICAL_20261102: Record<string, CanonicalProposalPresentation> = {
  "ospedale-ascensori-totem-ticket-malati-cronici-2026": {
    proposalId: "ospedale-ascensori-totem-ticket-malati-cronici-2026",
    version: "1.0",
    title: "Accessibilità degli ascensori e pagamento automatico dei ticket ospedalieri",
    request:
      "Ripristinare la funzionalità degli ascensori e dei sistemi automatici di pagamento ticket del Presidio ospedaliero di Lamezia Terme, come richiesto dall'Associazione Malati Cronici del Lametino.",
    actionTypes: ["manutenzione", "rafforzamento_servizio", "messa_in_sicurezza"],
    measures: [
      "Verificare le condizioni degli ascensori segnalati e ripristinarne il funzionamento in sicurezza.",
      "Verificare le casse automatiche e i totem per il pagamento dei ticket e ripristinare le funzionalità non disponibili.",
    ],
    expectedOutcome:
      "Facilitare la mobilità interna al presidio e l'accesso ai pagamenti dei ticket; i guasti segnalati, gli interventi necessari e i risultati non sono indipendentemente accertati.",
  },
  "municipio-ascensore-accessibilita-lamezia-maltrattata-2026": {
    proposalId: "municipio-ascensore-accessibilita-lamezia-maltrattata-2026",
    version: "1.0",
    title: "Ripristino dell'accessibilità verticale della sede municipale",
    request:
      "Ripristinare e mettere in sicurezza l'ascensore del palazzo comunale di Lamezia Terme, come richiesto da Lamezia Maltrattata.",
    actionTypes: ["manutenzione", "messa_in_sicurezza"],
    measures: [
      "Verificare le condizioni tecniche dell'ascensore segnalato.",
      "Eseguire gli interventi necessari al ripristino e alla messa in sicurezza dell'impianto.",
    ],
    expectedOutcome:
      "Agevolare l'accesso agli uffici comunali ai piani superiori, anche per persone con difficoltà motorie; lo stato dell'ascensore e l'effetto delle misure restano da verificare.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261102[proposal.id] ?? previousPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261102[proposalId]) || previousHas(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261102)].sort();
}
