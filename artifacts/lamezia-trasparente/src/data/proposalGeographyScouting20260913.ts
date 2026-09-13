import type { ProposalGeography } from "./proposalGeographyCore";

const LAMEZIA_CITYWIDE: ProposalGeography = {
  label: "Intero territorio comunale di Lamezia Terme",
  scope: "citywide",
  areas: ["intera_citta"],
  points: [],
  note:
    "Ambito cittadino non georeferenziato: la proposta riguarda l'intero territorio comunale e, coerentemente con il contratto geografico LT, non riceve coordinate artificiali.",
};

/**
 * Scordovillo is the trigger for the first proposal, but its housing choices are
 * explicitly framed as having effects across several neighbourhoods. The local
 * police proposal is likewise about service coverage across the whole city.
 */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20260913: Record<
  string,
  ProposalGeography
> = {
  "scordovillo-consiglio-aperto-trasparenza-futuro-nazionale-2026": {
    ...LAMEZIA_CITYWIDE,
    label:
      "Scordovillo e scelte abitative collegate al suo superamento nel territorio comunale",
    note:
      "La richiesta nasce dalla vicenda Scordovillo ma riguarda espressamente criteri e impatto sociale di soluzioni abitative in diverse zone della città. Lo scope è quindi citywide; non vengono assegnate coordinate artificiali.",
  },
  "polizia-locale-piano-assunzioni-h24-parco-agricolo-2026": {
    ...LAMEZIA_CITYWIDE,
    note:
      "La richiesta riguarda il rafforzamento dell'organico e l'estensione della copertura operativa della Polizia Locale sull'intero territorio comunale. Lo scope è citywide e resta privo di coordinate.",
  },
};