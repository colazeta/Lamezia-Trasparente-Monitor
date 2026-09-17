import type { ProposalGeography } from "./proposalGeographyCore";

export const SCOUTED_PROPOSAL_GEOGRAPHY_20260917: Record<
  string,
  ProposalGeography
> = {
  "fna-assistenza-progetto-vita-liberali-lamezia-2026": {
    label: "Intero territorio comunale e ATS di Lamezia Terme",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note:
      "La proposta riguarda coordinamento e accesso a misure sociali e sociosanitarie sull'intero territorio di riferimento; non identifica un luogo puntuale. Lo scope resta quindi citywide e non riceve coordinate artificiali.",
  },
  "cimitero-sant-eufemia-loculi-accessi-custodia-comitato-2026": {
    label: "Cimitero di Sant’Eufemia Lamezia e relativi accessi",
    scope: "area",
    areas: ["sant_eufemia"],
    points: [],
    note:
      "La fonte identifica il cimitero di Sant'Eufemia e i relativi percorsi di accesso, ma non fornisce un perimetro né una coordinata WGS84 verificabile rappresentativa dell'intero insieme di misure richieste. Si usa quindi scope area con tag Sant'Eufemia e senza coordinate.",
  },
};
