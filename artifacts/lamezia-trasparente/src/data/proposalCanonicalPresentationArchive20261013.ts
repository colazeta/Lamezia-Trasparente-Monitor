import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as getPreviousCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds as getPreviousCanonicalProposalPresentationIds,
  hasCanonicalProposalPresentation as hasPreviousCanonicalProposalPresentation,
} from "./proposalCanonicalPresentationArchive20260915";

const SCOUTED_CANONICAL_20261013: Record<string, CanonicalProposalPresentation> = {
  "viabilita-manutenzione-vie-vescio-2026": {
    proposalId: "viabilita-manutenzione-vie-vescio-2026",
    version: "1.0",
    title: "Verifiche e programmazione degli interventi sulla viabilità",
    request:
      "Verificare le criticità segnalate su strade e percorsi pedonali e definire interventi prioritari con misure provvisorie di sicurezza e tempi comunicati al Consiglio comunale.",
    actionTypes: ["manutenzione", "messa_in_sicurezza", "trasparenza", "organizzazione"],
    measures: [
      "Effettuare sopralluoghi e verifiche tecniche sulle strade e sui percorsi indicati.",
      "Adottare misure temporanee di sicurezza nei tratti pericolosi, se confermati dalle verifiche.",
      "Programmare interventi di ripristino assegnando priorità alle criticità accertate.",
      "Valutare l'istituzione del senso unico in via Indipendenza.",
      "Verificare la stabilità dei versanti nelle aree di Casturi e Calia.",
      "Comunicare al Consiglio tempi previsti di avvio e completamento degli interventi.",
    ],
    expectedOutcome:
      "Rendere verificabile la programmazione delle manutenzioni e affrontare le condizioni di pericolo che risultino confermate, senza presumere che le criticità riferite siano tutte accertate.",
  },
  "regolamento-servizio-taxi-usb-2026": {
    proposalId: "regolamento-servizio-taxi-usb-2026",
    version: "1.0",
    title: "Completamento del regolamento comunale del servizio taxi",
    request:
      "Concludere il percorso di valutazione e approvazione del regolamento taxi richiesto dal sindacato, chiarendo le regole di esercizio e tutela degli utenti.",
    actionTypes: ["regolazione", "organizzazione", "trasparenza"],
    measures: [
      "Concludere l'esame della proposta di regolamento per il servizio taxi.",
      "Definire condizioni e modalità di esercizio del servizio a tutela degli utenti.",
      "Precisare regole e controlli per contrastare l'abusivismo.",
      "Chiarire gli ambiti territoriali di esercizio e le relative modalità di verifica.",
      "Comunicare l'esito del percorso regolamentare e i successivi passaggi.",
    ],
    expectedOutcome:
      "Rendere più chiara la disciplina del servizio taxi, senza affermare che le modifiche siano già state adottate o che abbiano effetti dimostrati.",
  },
  "sant-eufemia-studio-autonomia-comunale-2026": {
    proposalId: "sant-eufemia-studio-autonomia-comunale-2026",
    version: "1.0",
    title: "Studio di fattibilità per l'eventuale autonomia di Sant'Eufemia",
    request:
      "Avviare un percorso civico di studio e confronto sulla possibilità di costituire un Comune autonomo di Sant'Eufemia Lamezia, prima di un'eventuale iniziativa istituzionale.",
    actionTypes: ["organizzazione", "trasparenza", "coordinamento"],
    measures: [
      "Promuovere la costituzione di un comitato dedicato al percorso di studio.",
      "Raccogliere e documentare le criticità dei servizi e degli spazi pubblici segnalate dai residenti.",
      "Esaminare i confini ipotizzabili e la sostenibilità economica e amministrativa di un eventuale Comune.",
      "Valutare la possibile organizzazione dei servizi pubblici nel nuovo assetto.",
      "Preparare uno studio di fattibilità da sottoporre, se del caso, alle istituzioni regionali.",
    ],
    expectedOutcome:
      "Rendere documentata e valutabile una possibile alternativa organizzativa, senza presumere l'ammissibilità o l'attuabilità della separazione amministrativa.",
    editorialNote:
      "La primaria semantica è l'ufficiale EU Data Theme GOVE, mapping già adottato per il filone di governance, poiché le 15 Materie dei servizi pubblici non comprendono l'organizzazione istituzionale comunale. Nessuna estensione locale.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return SCOUTED_CANONICAL_20261013[proposal.id] ??
    getPreviousCanonicalProposalPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(SCOUTED_CANONICAL_20261013[proposalId]) ||
    hasPreviousCanonicalProposalPresentation(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [
    ...getPreviousCanonicalProposalPresentationIds(),
    ...Object.keys(SCOUTED_CANONICAL_20261013),
  ].sort();
}
