import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261111";

const ID = "aeroporto-intermodalita-rilancio-taverna-2026";

/** Revisione canonica LT: ingloba il nuovo sviluppo senza alterare il record di acquisizione. */
const CANONICAL_20261111_B: Record<string, CanonicalProposalPresentation> = {
  [ID]: {
    proposalId: ID,
    version: "1.0",
    title: "Accessibilità e informazioni sui lavori dell'aeroporto di Lamezia",
    request:
      "Rafforzare l'accessibilità e i collegamenti dell'aeroporto di Lamezia e rendere trasparenti i tempi degli interventi sul terminal, valutando iniziative sulle tariffe aeree nei periodi di maggiore domanda.",
    actionTypes: ["infrastruttura", "rafforzamento_servizio", "coordinamento", "valorizzazione", "trasparenza"],
    measures: [
      "Rafforzare l'intermodalità ferro-aria e valutare il collegamento con l'Alta Velocità.",
      "Potenziare i servizi di terra e i collegamenti fra aeroporto e destinazioni territoriali.",
      "Coinvolgere maggiormente i Comuni e i territori nelle scelte strategiche sullo scalo.",
      "Pubblicare un cronoprogramma verificabile per l'avvio e il completamento dei lavori sul terminal.",
      "Avviare interlocuzioni con i vettori per valutare possibili iniziative contro i rincari tariffari nei periodi di rientro, nel rispetto dei rispettivi ruoli istituzionali e contrattuali.",
    ],
    expectedOutcome:
      "Rendere conoscibili tempi e interventi programmati e valutare soluzioni di accessibilità e mobilità; non presupporre la riduzione dei prezzi né l'esecuzione dei lavori.",
    editorialNote:
      "Le richieste del 10 novembre integrano quelle del 1° settembre dello stesso promotore. I ritardi e i livelli tariffari sono segnalazioni, non fatti amministrativi verificati. La competenza sugli accordi tariffari non è stata accertata.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261111_B[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261111_B[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261111_B)].filter(
    (id, index, ids) => ids.indexOf(id) === index,
  ).sort();
}
