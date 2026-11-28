import type { PublicProposal } from "./propostePubblicheCore";
import type { CanonicalProposalPresentation } from "./proposalCanonicalPresentation";
import { getCanonicalProposalPresentation as previousPresentation, getCanonicalProposalPresentationIds as previousIds, hasCanonicalProposalPresentation as previousHas } from "./proposalCanonicalPresentationArchive20261126";
const CANONICAL: Record<string, CanonicalProposalPresentation> = {
  "sfere-terina-valorizzazione-costruttori-nautici-2026": {
    "proposalId": "sfere-terina-valorizzazione-costruttori-nautici-2026",
    "version": "1.0",
    "title": "Valorizzazione delle sfere di Terina e scultura all’aeroporto",
    "request": "Valorizzare le sfere civiche di Terina attraverso il riconoscimento regionale e una scultura esposta nello scalo lametino.",
    "actionTypes": [
      "valorizzazione",
      "coordinamento"
    ],
    "measures": [
      "Proporre l’inserimento delle sfere civiche tra i Marcatori Identitari Distintivi della Calabria.",
      "Proporre a SACAL la donazione della scultura raffigurante la sfera.",
      "Concordare una possibile esposizione permanente con SACAL.",
      "Accompagnare l’opera con contenuti informativi sul patrimonio archeologico."
    ],
    "expectedOutcome": "Rendere riconoscibile il patrimonio di Terina ai visitatori dello scalo.",
    "editorialNote": "La nota del 27 settembre è attribuita all’ufficio comunicazione dell’associazione; il 20 novembre viene annunciata la scultura e il 27 novembre il confronto del 28 a Falerna. L'autorizzazione museale e la commissione dell’opera sono riferite dal promotore, senza atto originale. Nessuna accettazione di SACAL, installazione o inserimento ufficiale nei MID verificati. Competenza non valutata."
  },
  "beni-confiscati-fug-libera-lamezia-2026": {
    "proposalId": "beni-confiscati-fug-libera-lamezia-2026",
    "version": "1.0",
    "title": "Destinazione del 2% del Fondo Unico Giustizia al riuso sociale",
    "request": "Destinare stabilmente il 2% del Fondo Unico Giustizia al riutilizzo pubblico e sociale dei beni confiscati.",
    "actionTypes": [
      "riuso",
      "rafforzamento_servizio"
    ],
    "measures": [
      "Destinare stabilmente il 2% del Fondo Unico Giustizia al riutilizzo pubblico e sociale dei beni confiscati."
    ],
    "expectedOutcome": "Mettere risorse continuative a disposizione del riuso sociale dei beni confiscati.",
    "editorialNote": "La fonte del co-organizzatore locale documenta l'appello e il banchetto previsto il 28 novembre al Complesso Monumentale di San Domenico. La campagna nazionale era già avviata; 25 novembre è la prima evidenza locale qui acquisita. Il 27 novembre la stampa conferma la mobilitazione locale; non si attribuiscono firme nazionali a Lamezia né si presume deposito, adesione comunale, esito del banchetto o attuazione. Destinatari nazionali esplicitati da Libera; competenza non valutata."
  }
};
export function getCanonicalProposalPresentation(proposal: Pick<PublicProposal,"id"|"title"|"summary">): CanonicalProposalPresentation { return CANONICAL[proposal.id] ?? previousPresentation(proposal); }
export function hasCanonicalProposalPresentation(id: string): boolean { return Boolean(CANONICAL[id]) || previousHas(id); }
export function getCanonicalProposalPresentationIds(): string[] { return [...new Set([...previousIds(), ...Object.keys(CANONICAL)])].sort(); }
