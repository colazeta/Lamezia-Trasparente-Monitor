import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as getPreviousCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds as getPreviousCanonicalProposalPresentationIds,
  hasCanonicalProposalPresentation as hasPreviousCanonicalProposalPresentation,
} from "./proposalCanonicalPresentationArchive";

const SCORDOVILLO_ID =
  "scordovillo-consiglio-aperto-trasparenza-futuro-nazionale-2026";
const POLIZIA_LOCALE_RENDA_ID =
  "polizia-locale-piano-assunzioni-h24-parco-agricolo-2026";

const SCORDOVILLO_CANONICAL_PRESENTATION: CanonicalProposalPresentation = {
  proposalId: SCORDOVILLO_ID,
  version: "1.0",
  title: "Trasparenza e confronto pubblico sul percorso abitativo di Scordovillo",
  request:
    "Rendere pubblicamente verificabile il percorso abitativo collegato al superamento di Scordovillo, discuterlo in sedi pubbliche e sospendere ulteriori procedure di acquisto finché criteri, requisiti, modalità e conseguenze dell'operazione non siano illustrati alla città.",
  actionTypes: ["organizzazione", "trasparenza", "coordinamento"],
  measures: [
    "Convocare un Consiglio comunale aperto dedicato alla vicenda Scordovillo.",
    "Rendere pubblici i criteri utilizzati per individuare i beneficiari e le modalità di assegnazione degli alloggi collegati al percorso.",
    "Chiarire in sede pubblica il ruolo del Comune e le responsabilità dei diversi soggetti istituzionali coinvolti.",
    "Esplicitare le valutazioni sull’impatto sociale delle soluzioni abitative nei quartieri interessati.",
    "Sospendere le ulteriori procedure di acquisto di immobili nel territorio lametino finché criteri, requisiti, modalità e conseguenze dell’operazione non siano illustrati pubblicamente.",
    "Aprire un confronto con i residenti dei quartieri interessati, includendo un incontro del Sindaco con i cittadini che chiedono chiarimenti sul percorso.",
  ],
  expectedOutcome:
    "Rendere il percorso decisionale più conoscibile e verificabile e consentire un confronto pubblico sulle scelte prima di ulteriori acquisizioni, senza attribuire alle misure effetti sostanziali non ancora dimostrati.",
};

const POLIZIA_LOCALE_RENDA_CANONICAL_PRESENTATION: CanonicalProposalPresentation = {
  proposalId: POLIZIA_LOCALE_RENDA_ID,
  version: "1.0",
  title: "Rafforzamento strutturale dell’organico della Polizia Locale",
  request:
    "Definire un piano straordinario di assunzioni a tempo indeterminato per rafforzare l’organico della Polizia Locale e programmare una copertura più estesa del servizio sul territorio comunale.",
  actionTypes: ["rafforzamento_servizio", "organizzazione"],
  measures: [
    "Definire un piano straordinario di assunzioni a tempo indeterminato per la Polizia Locale.",
    "Attivare le procedure di reclutamento consentite per incrementare in modo stabile l’organico.",
    "Programmare l’impiego del personale in modo da ampliare la copertura operativa del servizio, incluse le fasce serali e notturne quando sostenibile.",
  ],
  expectedOutcome:
    "Rafforzare in modo stabile la capacità operativa della Polizia Locale e ampliare la copertura del servizio, senza presumere che le misure richieste siano sufficienti o già finanziate.",
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  if (proposal.id === SCORDOVILLO_ID) return SCORDOVILLO_CANONICAL_PRESENTATION;
  if (proposal.id === POLIZIA_LOCALE_RENDA_ID)
    return POLIZIA_LOCALE_RENDA_CANONICAL_PRESENTATION;
  return getPreviousCanonicalProposalPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string) {
  return (
    proposalId === SCORDOVILLO_ID ||
    proposalId === POLIZIA_LOCALE_RENDA_ID ||
    hasPreviousCanonicalProposalPresentation(proposalId)
  );
}

export function getCanonicalProposalPresentationIds() {
  return [
    ...getPreviousCanonicalProposalPresentationIds(),
    SCORDOVILLO_ID,
    POLIZIA_LOCALE_RENDA_ID,
  ].sort();
}
