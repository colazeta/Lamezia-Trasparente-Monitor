import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import {
  getCanonicalProposalPresentation as previousPresentation,
  getCanonicalProposalPresentationIds as previousIds,
  hasCanonicalProposalPresentation as previousHas,
} from "./proposalCanonicalPresentationArchive20261026Backfill";

/** Citizen-facing presentation; distinct from the historical acquisition. */
const CANONICAL_20261027: Record<string, CanonicalProposalPresentation> = {
  "soppressione-staff-sindaco-riallocazione-risorse-nicotera-2026": {
    proposalId: "soppressione-staff-sindaco-riallocazione-risorse-nicotera-2026",
    version: "1.0",
    title: "Riorganizzazione dello staff del sindaco e riallocazione di risorse",
    request:
      "Chiedere la soppressione degli incarichi di supporto politico del sindaco e la destinazione degli eventuali risparmi a servizi sociali e misure sulla TARI.",
    actionTypes: ["organizzazione", "coordinamento", "trasparenza"],
    measures: [
      "Cessare gli incarichi e i rapporti di lavoro collegati allo staff politico del sindaco, secondo le modalità legalmente applicabili.",
      "Non conferire nuovi incarichi né rinnovare contratti per gli uffici di supporto politico indicati nella mozione.",
      "Quantificare formalmente i risparmi annui conseguibili e trasmettere una relazione al Consiglio comunale.",
      "Destinare prioritariamente gli eventuali risparmi effettivamente disponibili al rafforzamento dei servizi sociali per le persone fragili e con disabilità.",
      "Valutare l'impiego delle risorse liberate per mitigare la TARI a carico delle famiglie e delle attività produttive.",
      "Valutare in subordine l'utilizzo delle risorse liberate a sostegno degli equilibri del piano di riequilibrio finanziario pluriennale.",
      "Riferire al Consiglio comunale sulle misure adottate o programmate entro 30 giorni dall'eventuale approvazione della mozione.",
    ],
    expectedOutcome:
      "Rendere valutabile una diversa allocazione delle risorse comunali, senza presumere la disponibilità dei risparmi, la riduzione dei tributi o l'attuazione degli interventi richiesti.",
  },
  "via-della-vittoria-manutenzione-deflusso-cristiano-villella-2026": {
    proposalId: "via-della-vittoria-manutenzione-deflusso-cristiano-villella-2026",
    version: "1.0",
    title: "Manutenzione e gestione delle acque meteoriche in via della Vittoria",
    request:
      "Chiedere verifiche tecniche e interventi di manutenzione della strada, sicurezza della circolazione e deflusso delle acque meteoriche nell'area di via della Vittoria, Nicastro.",
    actionTypes: ["prevenzione_rischio", "organizzazione", "trasparenza"],
    measures: [
      "Verificare lo stato del manto stradale di via della Vittoria e programmare il ripristino dei tratti che risultino deteriorati.",
      "Valutare interventi di controllo e segnalazione per il rispetto del limite di velocità di 30 km/h indicato nella richiesta.",
      "Effettuare sopralluoghi sui marciapiedi e sulle segnalazioni di vegetazione, rifiuti e altre criticità nell'area interessata.",
      "Accertare lo stato del canale di scolo delle acque meteoriche e verificare tecnicamente l'eventuale ostruzione e le sue cause.",
      "Programmare l'eventuale ripristino del deflusso delle acque, qualora le verifiche tecniche ne attestino la necessità.",
      "Fornire una risposta scritta e orale in Consiglio comunale sugli interventi valutati e sulle relative tempistiche.",
    ],
    expectedOutcome:
      "Disporre di accertamenti e possibili interventi motivati sulle criticità segnalate, senza presumere responsabilità, cause degli allagamenti, disponibilità dei lavori o efficacia già dimostrata.",
  },
};

export function getCanonicalProposalPresentation(
  proposal: Pick<PublicProposal, "id" | "title" | "summary">,
): CanonicalProposalPresentation {
  return CANONICAL_20261027[proposal.id] ?? previousPresentation(proposal);
}

export function hasCanonicalProposalPresentation(proposalId: string): boolean {
  return Boolean(CANONICAL_20261027[proposalId]) || previousHas(proposalId);
}

export function getCanonicalProposalPresentationIds(): string[] {
  return [...previousIds(), ...Object.keys(CANONICAL_20261027)].sort();
}
