import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261105";

/** Presentazione cittadina neutrale: il record di acquisizione è conservato a parte. */
const CANONICAL_BACKFILL_20261105: Record<string, CanonicalProposalPresentation> = {
  "turismo-imposta-soggiorno-trasparenza-acu-calabria-2026": {
    proposalId: "turismo-imposta-soggiorno-trasparenza-acu-calabria-2026",
    version: "1.0",
    title: "Dati pubblici e confronto sull'eventuale imposta di soggiorno",
    request:
      "Rendere verificabili i dati e gli obblighi relativi all'eventuale introduzione dell'imposta di soggiorno e coinvolgere le associazioni dei consumatori nella discussione, come richiesto da ACU Calabria.",
    actionTypes: ["trasparenza", "coordinamento"],
    measures: [
      "Accertare e pubblicare i dati sulle presenze turistiche richiamati per motivare l'eventuale introduzione dell'imposta.",
      "Pubblicare informazioni dettagliate sulla destinazione degli eventuali proventi e sugli adempimenti richiesti ai gestori delle strutture ricettive.",
      "Valutare una piattaforma pubblica accessibile per consultare queste informazioni.",
      "Coinvolgere le associazioni dei consumatori nel confronto sull'eventuale imposta e sulla programmazione turistica.",
    ],
    expectedOutcome:
      "Consentire un confronto pubblico basato su informazioni consultabili; non è dimostrato che tali misure siano state adottate o che producano specifici effetti economici.",
  },
  "tutela-cane-kira-progetto-gestione-controllata-solla-2026": {
    proposalId: "tutela-cane-kira-progetto-gestione-controllata-solla-2026",
    version: "1.0",
    title: "Valutazione di un piano di gestione controllata per Kira",
    request:
      "Valutare, previa verifica delle condizioni necessarie, la possibilità di un ritorno controllato del cane Kira nel contesto di provenienza, secondo la richiesta contenuta nella petizione di Clara Solla.",
    actionTypes: ["coordinamento", "prevenzione_rischio", "organizzazione"],
    measures: [
      "Verificare le condizioni di benessere dell'animale e di sicurezza delle persone prima di qualsiasi decisione.",
      "Valutare la fattibilità del possibile ritorno nel territorio di provenienza, senza prevedere un rilascio non sorvegliato.",
      "Individuare un tutor responsabile di un eventuale progetto di gestione.",
      "Definire attività di monitoraggio e forme di collaborazione fra volontari, associazioni e soggetti istituzionali interessati.",
    ],
    expectedOutcome:
      "Disporre di elementi per una decisione informata sull'eventuale gestione futura; non sono verificati né gli accertamenti né un provvedimento di rientro.",
  },
  "scuola-perri-pitagora-orario-sei-giorni-di-spena-2026": {
    proposalId: "scuola-perri-pitagora-orario-sei-giorni-di-spena-2026",
    version: "1.0",
    title: "Riesame della distribuzione settimanale dell'orario scolastico",
    request:
      "Riesaminare l'organizzazione delle lezioni per le classi interessate dell'I.C. Perri Pitagora Don Milani e valutare una distribuzione dal lunedì al sabato, come richiesto dalla petizione promossa da Silvia Di Spena.",
    actionTypes: ["organizzazione", "coordinamento"],
    measures: [
      "Riesaminare l'articolazione attuale delle lezioni per le classi interessate.",
      "Valutare l'alternativa 08:15–13:15 dal lunedì al sabato rispetto all'orario 07:55–13:55 dal lunedì al venerdì indicato nella petizione.",
      "Favorire un confronto tra dirigenti, organi scolastici, famiglie e amministrazione comunale.",
    ],
    expectedOutcome:
      "Esaminare la compatibilità della distribuzione oraria con le esigenze educative e familiari, senza presumere che il cambiamento sia stato approvato o produca benefici misurati.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_BACKFILL_20261105[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_BACKFILL_20261105[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_BACKFILL_20261105)].sort();
}
