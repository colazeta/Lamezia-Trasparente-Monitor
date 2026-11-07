import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261106";

/** Il testo cittadino è distinto dalle note di acquisizione e non presume esiti. */
const CANONICAL_20261107: Record<string, CanonicalProposalPresentation> = {
  "cimitero-nicastro-loculi-verifiche-familiari-2026": {
    proposalId: "cimitero-nicastro-loculi-verifiche-familiari-2026",
    version: "1.0",
    title: "Accertamenti e interventi sui loculi del cimitero di Nicastro",
    request:
      "Verificare le condizioni dei loculi indicati dai familiari in un'ala del cimitero di Nicastro e definire eventuali interventi urgenti di ripristino e sicurezza.",
    actionTypes: ["manutenzione", "messa_in_sicurezza", "prevenzione_rischio"],
    measures: [
      "Individuare l'ala e i loculi oggetto della segnalazione.",
      "Effettuare una verifica tecnica delle infiltrazioni e dei possibili cedimenti segnalati.",
      "Valutare le precauzioni e le misure urgenti necessarie sulla base degli accertamenti.",
      "Programmare gli eventuali interventi di ripristino e comunicare le relative tempistiche.",
    ],
    expectedOutcome:
      "Disporre di un accertamento tecnico e di un eventuale programma di interventi; condizioni effettive ed esiti non sono verificati.",
  },
  "decentramento-tre-municipi-casa-di-vetro-2026": {
    proposalId: "decentramento-tre-municipi-casa-di-vetro-2026",
    version: "1.0",
    title: "Valutazione di tre municipi territoriali a Lamezia Terme",
    request:
      "Avviare un confronto istituzionale sulla fattibilità e sulle modalità di un decentramento territoriale articolato nelle tre aree storiche di Nicastro, Sambiase e Sant'Eufemia.",
    actionTypes: ["organizzazione", "coordinamento"],
    measures: [
      "Aprire un esame della proposta nelle commissioni e in Consiglio comunale.",
      "Verificare preliminarmente i requisiti normativi e statutari per un eventuale assetto di tre municipi.",
      "Valutare sportelli e referenti di prossimità per cittadini e servizi locali.",
      "Definire possibili funzioni di monitoraggio della manutenzione e dei servizi territoriali.",
      "Esaminare modalità di partecipazione di associazioni e comitati e le condizioni di eventuale rappresentanza elettiva.",
    ],
    expectedOutcome:
      "Definire un modello valutabile di prossimità amministrativa, senza dare per scontata la fattibilità normativa né benefici già dimostrati.",
  },
  "regolamento-cerimoniale-casa-di-vetro-2026": {
    proposalId: "regolamento-cerimoniale-casa-di-vetro-2026",
    version: "1.0",
    title: "Regole trasparenti per il cerimoniale e le commemorazioni comunali",
    request:
      "Esaminare e, se compatibile con le norme applicabili, adottare un regolamento comunale sul cerimoniale e sugli omaggi istituzionali a cittadini benemeriti.",
    actionTypes: ["regolazione", "trasparenza"],
    measures: [
      "Avviare un confronto consiliare su un testo di regolamento.",
      "Definire criteri pubblici e non discrezionali per le commemorazioni istituzionali.",
      "Disciplinare, nei casi consentiti, comunicazioni di cordoglio e partecipazione del Sindaco o di un delegato.",
      "Individuare le condizioni per eventuali bandiere a mezz'asta, lutto cittadino e sedute commemorative.",
      "Rendere consultabili le regole e le procedure adottate.",
    ],
    expectedOutcome:
      "Fornire criteri uniformi e conoscibili per le iniziative di memoria pubblica, senza presumere adozione o risultati.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261107[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261107[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261107)].sort();
}
