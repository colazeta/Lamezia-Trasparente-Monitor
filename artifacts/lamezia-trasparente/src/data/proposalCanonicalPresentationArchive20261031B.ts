import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261031";

/** Presentazioni neutrali per il cittadino; il record originario resta separato. */
const CANONICAL_20261031_B: Record<string, CanonicalProposalPresentation> = {
  "riequilibrio-piano-revoca-mascaro-2026": {
    proposalId: "riequilibrio-piano-revoca-mascaro-2026",
    version: "1.0",
    title: "Richiesta di revoca o revisione del Piano di riequilibrio finanziario",
    request:
      "Riesaminare il ricorso al riequilibrio finanziario pluriennale, revocando la deliberazione di adesione oppure, in subordine, rimodulando il piano secondo la proposta di Mascaro.",
    actionTypes: ["regolazione", "trasparenza", "organizzazione"],
    measures: [
      "Accertare e motivare i presupposti dello squilibrio strutturale e l'eventuale insufficienza degli strumenti ordinari di riequilibrio.",
      "Riesaminare e aggiornare le poste della massa passiva alla luce delle variazioni documentate.",
      "Richiedere al Ministero dell'Economia e delle Finanze, anche tramite ANCI, un'informativa sul tavolo tecnico relativo al Fondo anticipazioni di liquidità richiamato nella memoria.",
      "Valutare, in via principale, di non dare seguito alla deliberazione di adesione al riequilibrio, ricorrendo se possibile agli strumenti ordinari di ripiano.",
      "In subordine, valutare una rimodulazione della massa passiva e clausole di salvaguardia riferite agli sviluppi normativi e contabili.",
    ],
    expectedOutcome:
      "Sottoporre la scelta di finanza comunale a un riesame, senza presumere che le valutazioni contabili del promotore siano corrette né che le alternative siano già praticabili.",
  },
  "palestre-allenamento-raffaele-arpaia-lamezia-2026": {
    proposalId: "palestre-allenamento-raffaele-arpaia-lamezia-2026",
    version: "1.0",
    title: "Spazi coperti per gli allenamenti della Raffaele Arpaia Lamezia",
    request:
      "Individuare spazi coperti e orari disponibili per consentire gli allenamenti del settore giovanile della società sportiva.",
    actionTypes: ["rafforzamento_servizio", "organizzazione", "coordinamento"],
    measures: [
      "Verificare la disponibilità di palestre e fasce orarie utilizzabili dagli atleti del settore giovanile.",
      "Valutare soluzioni temporanee di accesso agli spazi durante l'indisponibilità del PalaSparti.",
      "Chiarire le condizioni e i tempi della soluzione individuata senza presupporre disponibilità di strutture non confermate.",
    ],
    expectedOutcome:
      "Consentire continuità agli allenamenti al coperto, quale finalità dichiarata della mobilitazione e non come soluzione già ottenuta.",
  },
  "educazione-legalita-mozione-fdi-lamezia-2026": {
    proposalId: "educazione-legalita-mozione-fdi-lamezia-2026",
    version: "1.0",
    title: "Iniziative di educazione alla legalità rivolte ai giovani",
    request:
      "Promuovere iniziative educative sulla legalità, con eventuale coinvolgimento di scuole e associazioni, nell'ambito della mozione presentata dal gruppo consiliare FdI.",
    actionTypes: ["prevenzione_rischio", "coordinamento", "organizzazione"],
    measures: [
      "Valutare l'organizzazione di iniziative di sensibilizzazione ed educazione alla legalità rivolte soprattutto ai giovani.",
      "Coinvolgere, ove disponibili e nei rispettivi ruoli, scuole, associazioni e istituzioni interessate.",
      "Valutare l'espressione formale della solidarietà dell'amministrazione alle Forze dell'Ordine richiesta nella stessa mozione.",
    ],
    expectedOutcome:
      "Svolgere attività educative e di sensibilizzazione, senza presumere una riduzione dimostrata della violenza né l'avvio delle iniziative.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261031_B[proposal.id] ?? previousPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261031_B[proposalId]) || previousHas(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261031_B)].sort();
}
