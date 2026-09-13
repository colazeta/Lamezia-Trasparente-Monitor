import type { ProposalGeography } from "./proposalGeographyCore";

/**
 * The proposal is triggered by Scordovillo but explicitly concerns housing
 * choices and their possible effects across several neighbourhoods. It is
 * therefore classified citywide and deliberately carries no coordinates.
 */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20260913: Record<
  string,
  ProposalGeography
> = {
  "scordovillo-consiglio-aperto-trasparenza-futuro-nazionale-2026": {
    label:
      "Scordovillo e scelte abitative collegate al suo superamento nel territorio comunale",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note:
      "La richiesta nasce dalla vicenda Scordovillo ma riguarda espressamente criteri e impatto sociale di soluzioni abitative in diverse zone della città. Lo scope è quindi citywide; coerentemente con il contratto geografico LT, non vengono assegnate coordinate artificiali.",
  },
};