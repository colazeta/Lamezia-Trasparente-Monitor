import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261114B";

/** Presentazione canonica LT separata dalla provenienza. */
const CANONICAL_20261116: Record<string, CanonicalProposalPresentation> = {
  "via-montello-illuminazione-potature-carito-2026": {
    "proposalId": "via-montello-illuminazione-potature-carito-2026",
    "version": "1.0",
    "title": "Illuminazione e manutenzione di via Montello",
    "request": "Verificare l'illuminazione di via Montello e valutare interventi su alberature e punti luce segnalati come problematici.",
    "actionTypes": [
      "manutenzione",
      "messa_in_sicurezza"
    ],
    "measures": [
      "Eseguire sopralluoghi sui punti luce e sulle chiome che ne limiterebbero l'illuminazione.",
      "Valutare potature mirate delle alberature interessate, ove tecnicamente necessarie.",
      "Verificare la funzionalità dei lampioni e programmare eventuali sostituzioni o adeguamenti.",
      "Rendere disponibili gli esiti delle verifiche e gli eventuali tempi degli interventi."
    ],
    "expectedOutcome": "Identificare eventuali interventi motivati da riscontri tecnici, senza presumerne l'efficacia.",
    "editorialNote": "La nota annuncia una futura interrogazione, non un deposito documentato. Le criticità sono riferite dal promotore."
  },
  "bellafemmina-ente-fiera-servizi-bevilacqua-2026": {
    "proposalId": "bellafemmina-ente-fiera-servizi-bevilacqua-2026",
    "version": "1.0",
    "title": "Valutazione di un polo fieristico a Bellafemmina",
    "request": "Valutare un polo fieristico e un centro servizi polifunzionale a Bellafemmina, con possibili raccordi intermodali e turistici.",
    "actionTypes": [
      "infrastruttura",
      "valorizzazione",
      "coordinamento"
    ],
    "measures": [
      "Identificare le aree potenzialmente interessate e verificarne vincoli e disponibilità.",
      "Valutare la fattibilità tecnico-economica di un ente fieristico e di un centro servizi.",
      "Esaminare le connessioni con la rete viaria, la stazione, l'aeroporto e il polo termale.",
      "Definire solo dopo le verifiche eventuali fasi progettuali e procedure amministrative."
    ],
    "expectedOutcome": "Disporre di elementi documentati per valutare le opzioni, senza attribuire finanziamenti o vantaggi accertati.",
    "editorialNote": "La presentazione agli esponenti della Regione è riportata da Bevilacqua, non comprovata da atti originali acquisiti."
  }
};

export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal, "id" | "title" | "summary">): CanonicalProposalPresentation {
  return CANONICAL_20261116[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261116[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_20261116)])].sort();
}
