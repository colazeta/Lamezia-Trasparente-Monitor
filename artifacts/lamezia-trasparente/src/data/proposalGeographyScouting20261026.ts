import type { ProposalGeography } from "./proposalGeographyCore";

/**
 * Geographic origin and substantive territorial scope are documented separately
 * when an initiative started in Lamezia addresses a regional policy.
 */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261026: Record<string, ProposalGeography> = {
  "petizione-preintese-autonomia-differenziata-comitato-2026": {
    label: "Comitato promotore a Lamezia Terme; petizione indirizzata alla Regione Calabria",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note:
      "Il tag cittadino si riferisce all'origine dell'iniziativa e non rappresenta la misura regionale come circoscritta al territorio comunale. L'incontro del 24 ottobre è documentato in via Lissania, ma non vengono inferite coordinate. Citywide non è georeferenziato.",
  },
  "piano-ricognizione-interventi-rete-idrica-pd-2026": {
    label: "Intero sistema idrico del territorio comunale di Lamezia Terme",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note:
      "La richiesta riguarda la rete idrica cittadina complessivamente: non è disponibile un elenco verificato dei punti di intervento e nessuna coordinata WGS84 è attribuita.",
  },
};
