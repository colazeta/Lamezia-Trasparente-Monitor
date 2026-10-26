import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261023";

const SCOUTED_CANONICAL_20261026: Record<string, CanonicalProposalPresentation> = {
  "petizione-preintese-autonomia-differenziata-comitato-2026": {
    proposalId: "petizione-preintese-autonomia-differenziata-comitato-2026",
    version: "1.0",
    title: "Petizione sulle pre-intese per l'autonomia differenziata",
    request:
      "Chiedere al Presidente e al Consiglio regionale della Calabria iniziative istituzionali per la sospensione del procedimento sulle pre-intese e per l'eventuale valutazione di un'impugnazione dopo una loro approvazione.",
    actionTypes: ["coordinamento", "trasparenza", "organizzazione"],
    measures: [
      "Sollecitare la Regione Calabria a richiedere la sospensione dell'iter relativo alle pre-intese.",
      "Chiedere un esame regionale dei presupposti costituzionali e delle possibili ricadute amministrative e finanziarie.",
      "Invitare il Consiglio regionale a valutare, nell'eventualità dell'approvazione delle intese, eventuali iniziative di impugnazione giuridicamente disponibili.",
      "Raccogliere adesioni alla petizione e renderne conoscibile il testo ai destinatari.",
    ],
    expectedOutcome:
      "Sottoporre alle istituzioni regionali una richiesta formalmente valutabile, senza presumere l'ammissibilità di ogni rimedio richiesto, un deposito avvenuto o una modifica dell'iter normativo.",
    editorialNote:
      "Il tema riguarda la governance istituzionale regionale. Si applica il concetto ufficiale UE GOVE già presente nel profilo semantico, in assenza di una specifica Materia dei servizi pubblici tra le 15; nessuna estensione locale LT.",
  },
  "piano-ricognizione-interventi-rete-idrica-pd-2026": {
    proposalId: "piano-ricognizione-interventi-rete-idrica-pd-2026",
    version: "1.0",
    title: "Ricognizione tecnica e programmazione degli interventi sulla rete idrica",
    request:
      "Ottenere informazioni tecniche aggiornate sulla rete idrica cittadina e una programmazione documentata di interventi e risorse, mediante confronto con gli interlocutori istituzionali indicati.",
    actionTypes: ["coordinamento", "trasparenza", "organizzazione"],
    measures: [
      "Avviare interlocuzioni con Regione Calabria, Arrical e Sorical sugli interventi programmati per Lamezia.",
      "Richiedere una ricognizione aggiornata delle perdite, delle condotte vulnerabili e delle cause riferite di interruzione dell'erogazione.",
      "Sollecitare l'individuazione di fonti di finanziamento per interventi strutturali.",
      "Richiedere un cronoprogramma degli interventi e la sua comunicazione alla Commissione consiliare e ai cittadini.",
      "Riferire al Consiglio gli esiti delle interlocuzioni entro 60 giorni dall'eventuale approvazione della mozione.",
      "Trasmettere la mozione alle istituzioni sovracomunali indicate nella richiesta, se approvata.",
    ],
    expectedOutcome:
      "Disporre di un quadro verificabile di criticità, priorità, risorse e scadenze, senza anticipare l'effettiva realizzazione degli interventi.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return SCOUTED_CANONICAL_20261026[proposal.id] ?? previousPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(SCOUTED_CANONICAL_20261026[proposalId]) || previousHas(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(SCOUTED_CANONICAL_20261026)].sort();
}
