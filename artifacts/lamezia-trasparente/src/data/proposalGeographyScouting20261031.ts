import type { ProposalGeography } from "./proposalGeographyCore";

/**
 * Lamezia police service is citywide, not a fictional pinpoint.
 * The airport is officially denominated "Sant'Eufemia" by ENAC; the precise
 * location of the Polizia di Frontiera office has not been geocoded.
 */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261031: Record<string, ProposalGeography> = {
  "commissariato-lamezia-rinforzi-sap-2026": {
    label: "Commissariato di Polizia di Stato di Lamezia Terme — servizio cittadino",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note:
      "Il SAP tratta l'organico del Commissariato che presta servizio alla città. Citywide è un ambito non georeferenziato e non riceve coordinate. Fonte richiesta: La Nuova Calabria, 28 ottobre 2026.",
  },
  "polizia-frontiera-lamezia-tavolo-indennita-sap-2026": {
    label: "Aeroporto di Lamezia Terme — Sant'Eufemia (Polizia di Frontiera)",
    scope: "area",
    areas: ["sant_eufemia"],
    points: [],
    note:
      "La Nuova Calabria del 28 ottobre identifica la Polizia di Frontiera aeroportuale di Lamezia; ENAC denomina ufficialmente l'aeroporto Sant'Eufemia (https://www.enac.gov.it/aeroporti/aeroporti-in-italia/master-plan/aeroporto-di-lamezia-terme-masterplan-2030-1fase-approvazione-finale/). Non è disponibile la localizzazione verificabile dell'ufficio Polaria: nessuna coordinata WGS84 è inferita.",
  },
};
