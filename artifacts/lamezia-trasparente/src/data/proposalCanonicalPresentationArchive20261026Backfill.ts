import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261026";

/** Citizen-facing neutral copy, separated from the original acquisition records. */
const BACKFILL_CANONICAL: Record<string, CanonicalProposalPresentation> = {
  "piano-comunale-amianto-m5s-lamezia-2026": {
    proposalId: "piano-comunale-amianto-m5s-lamezia-2026",
    version: "1.0",
    title: "Censimento e piano comunale per la gestione del rischio amianto",
    request:
      "Richiedere all'Amministrazione comunale un censimento aggiornato, una mappatura e un Piano comunale amianto con priorità di intervento e possibili risorse, sulla base di una proposta di deliberazione d'iniziativa popolare.",
    actionTypes: ["organizzazione", "coordinamento", "trasparenza"],
    measures: [
      "Avviare l'aggiornamento del censimento e della mappatura entro 90 giorni dall'eventuale approvazione della deliberazione.",
      "Predisporre entro 180 giorni dall'eventuale approvazione un Piano comunale che individui situazioni da approfondire e priorità di intervento.",
      "Individuare possibili fonti di finanziamento per messa in sicurezza e bonifiche, senza presumere disponibilità delle risorse.",
      "Raccogliere segnalazioni dei cittadini sui manufatti potenzialmente contenenti amianto e sottoporle a successive verifiche tecniche.",
    ],
    expectedOutcome:
      "Fornire un quadro aggiornato delle situazioni da verificare e delle opzioni di intervento; l'adozione del piano o l'effettiva bonifica non risultano documentate.",
  },
  "controlli-velocita-bizantini-savutano-branca-2026": {
    proposalId: "controlli-velocita-bizantini-savutano-branca-2026",
    version: "1.0",
    title: "Verifiche di sicurezza e controlli della velocità in due strade",
    request:
      "Valutare la sicurezza stradale in via dei Bizantini e via Savutano e l'opportunità di controlli della velocità, nel rispetto delle condizioni normative applicabili.",
    actionTypes: ["monitoraggio", "organizzazione"],
    measures: [
      "Verificare le condizioni di sicurezza delle due strade e le segnalazioni ricevute.",
      "Valutare l'eventuale installazione di un dispositivo fisso di rilevazione della velocità, soltanto se giuridicamente consentita.",
      "Valutare in alternativa controlli mobili della velocità nelle due arterie.",
    ],
    expectedOutcome:
      "Individuare misure di controllo giuridicamente praticabili e proporzionate, senza assumere che ne sia stata verificata la necessità o dimostrata l'efficacia.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return BACKFILL_CANONICAL[proposal.id] ?? previousPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(BACKFILL_CANONICAL[proposalId]) || previousHas(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(BACKFILL_CANONICAL)].sort();
}
