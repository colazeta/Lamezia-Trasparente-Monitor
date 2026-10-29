import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261028";

/** Copy canonica per i cittadini, separata dalle fonti di acquisizione. */
const CANONICAL_20261029: Record<string, CanonicalProposalPresentation> = {
  "cafaldo-rifacimento-strade-cristiano-villella-2026": {
    proposalId: "cafaldo-rifacimento-strade-cristiano-villella-2026",
    version: "1.0",
    title: "Rifacimento del manto stradale nel rione Cafaldo",
    request:
      "Programmare il rifacimento organico delle pavimentazioni di sei vie del rione Cafaldo, valutando la disponibilità di finanziamenti ammissibili.",
    actionTypes: ["manutenzione", "messa_in_sicurezza", "coordinamento"],
    measures: [
      "Verificare le condizioni del manto stradale in via Boccaccio, via Cirillo, via Reggio Calabria, via Mazzini, via Padre Elia Iannazzo e via Maggiore Toselli.",
      "Programmare un intervento di rifacimento complessivo delle pavimentazioni interessate.",
      "Valutare se gli interventi possano essere finanziati con risorse PINQuA ancora disponibili e utilizzabili, previa verifica dei requisiti.",
      "Individuare risorse comunali o ulteriori canali di finanziamento qualora le risorse PINQuA non siano applicabili.",
    ],
    expectedOutcome:
      "Migliorare le condizioni della pavimentazione e la sicurezza della circolazione, come obiettivo della richiesta e non come effetto già verificato.",
  },
  "polo-oncologico-regionale-lamezia-natrella-2026": {
    proposalId: "polo-oncologico-regionale-lamezia-natrella-2026",
    version: "1.0",
    title: "Proposta di Polo Oncologico Regionale al Giovanni Paolo II",
    request:
      "Valutare l'individuazione del presidio ospedaliero Giovanni Paolo II di Lamezia Terme quale sede di un Polo Oncologico Regionale.",
    actionTypes: ["rafforzamento_servizio", "organizzazione", "infrastruttura"],
    measures: [
      "Valutare l'istituzione di un Polo Oncologico Regionale con sede al Giovanni Paolo II.",
      "Esaminare le possibili integrazioni tra assistenza oncologica, diagnostica specialistica e attività di ricerca.",
      "Valutare il potenziamento dei posti letto dedicati all'oncologia nell'eventuale nuovo assetto regionale.",
      "Considerare il rafforzamento degli organici sanitari necessario per i servizi proposti.",
    ],
    expectedOutcome:
      "Ampliare l'accesso alle cure oncologiche specialistiche nella regione, secondo la finalità dichiarata dal promotore, senza presumere benefici dimostrati o decisioni già adottate.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261029[proposal.id] ?? previousPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261029[proposalId]) || previousHas(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261029)].sort();
}
