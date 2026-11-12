import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261111B";

/** Presentazione civica neutrale separata dai record di acquisizione. */
const CANONICAL_20261112: Record<string, CanonicalProposalPresentation> = {
  "nuovo-cimitero-monumentale-studio-de-biase-2026": {
    proposalId: "nuovo-cimitero-monumentale-studio-de-biase-2026",
    version: "1.0",
    title: "Studio di fattibilità per un nuovo cimitero monumentale",
    request: "Avviare una valutazione comparativa e uno studio di fattibilità per un nuovo cimitero cittadino, verificando in parallelo le possibilità di ampliamento e recupero dei cimiteri storici.",
    actionTypes: ["infrastruttura", "organizzazione", "trasparenza", "valorizzazione"],
    measures: [
      "Censire e rendere conoscibili le domande di concessione cimiteriale pendenti, previa verifica ufficiale.",
      "Verificare le possibilità tecniche di ampliamento e recupero dei cimiteri di Nicastro, Sambiase e Sant'Eufemia.",
      "Individuare e comparare aree alternative per una nuova struttura, senza anticipare la scelta della sede.",
      "Predisporre uno studio di fattibilità urbanistica ed economica con stima dei costi, dei tempi e delle fonti finanziarie.",
      "Valutare l'inserimento degli eventuali interventi nella programmazione comunale e negli strumenti urbanistici.",
    ],
    expectedOutcome: "Mettere a disposizione degli organi competenti un quadro di alternative, domanda effettiva e sostenibilità delle possibili soluzioni, senza presupporre la costruzione.",
    editorialNote: "Lettera aperta dell'11 novembre 2026. Numero delle domande inevase, previsioni del PSC e fattibilità del nuovo cimitero richiedono verifica ufficiale. La sede non è individuata.",
  },
  "microforesta-urbana-lamezia-respira-vescio-scaramuzzino-2026": {
    proposalId: "microforesta-urbana-lamezia-respira-vescio-scaramuzzino-2026",
    version: "1.0",
    title: "Progetto pilota per una microforesta urbana",
    request: "Individuare e valutare la realizzazione sperimentale di una microforesta su uno spazio pubblico di Lamezia, dando attenzione ai quartieri meno dotati di verde.",
    actionTypes: ["valorizzazione", "prevenzione_rischio", "coordinamento"],
    measures: [
      "Individuare e confrontare, secondo la tempistica richiesta dai promotori, aree pubbliche potenzialmente adatte.",
      "Valutare fattibilità tecnica, sicurezza, accessibilità, manutenzione, costi e fonti di finanziamento.",
      "Progettare un eventuale impianto di essenze autoctone, esaminando tecnicamente l'applicabilità del metodo Miyawaki.",
      "Coinvolgere scuole, associazioni, professionisti e cittadini nella progettazione e nell'eventuale cura.",
      "Esaminare, ove appropriato, depavimentazione e criteri di inclusione nella progettazione dello spazio.",
      "Riferire gli esiti della ricognizione alla commissione consiliare e valutare successivi ampliamenti solo su evidenze.",
    ],
    expectedOutcome: "Disporre di un progetto pilota tecnicamente valutato e di elementi per decidere eventuali nuovi interventi, senza presumere benefici ecologici misurati.",
    editorialNote: "Una mozione è riferita dalla stampa il 29 settembre; deposito protocollato non verificato. Criteri di inclusione ulteriormente illustrati il 3 ottobre. Nessuna area selezionata.",
  },
  "reu-verifica-adeguamento-v-commissione-vescio-2026": {
    proposalId: "reu-verifica-adeguamento-v-commissione-vescio-2026",
    version: "1.0",
    title: "Ricognizione normativa del Regolamento Edilizio Urbanistico",
    request: "Verificare la coerenza del REU comunale con la disciplina applicabile e valutare gli eventuali adeguamenti necessari secondo procedure fondate su verifica giuridica e tecnica.",
    actionTypes: ["regolazione", "trasparenza", "organizzazione"],
    measures: [
      "Effettuare una ricognizione delle disposizioni edilizie e urbanistiche vigenti e delle fonti sovraordinate pertinenti.",
      "Individuare e documentare le eventuali incongruenze tecniche o normative del testo comunale.",
      "Valutare caso per caso le procedure consentite per l'eventuale aggiornamento del regolamento.",
      "Esaminare l'eventuale aggiornamento degli allegati A e B del REU, nei limiti delle attribuzioni formalmente accertate.",
      "Riferire al Consiglio comunale gli esiti e le eventuali misure proposte.",
    ],
    expectedOutcome: "Fornire una base tecnica e normativa verificabile per decidere se e come aggiornare il regolamento, senza presumere difformità accertate.",
    editorialNote: "Ordine del giorno attribuito alla V Commissione nella pubblicazione del 28 settembre; protocollo, votazione e atti di recepimento non acquisiti.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261112[proposal.id] ?? previousPresentation(proposal);
}
export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261112[proposalId]) || previousHas(proposalId);
}
export function getCanonicalProposalPresentationIds(): string[] {
  return [...new Set([...previousIds(), ...Object.keys(CANONICAL_20261112)])].sort();
}
