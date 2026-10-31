import type { ProposalGeography } from "./proposalGeographyCore";

/**
 * Nessun punto WGS84 attribuito senza riscontro della posizione della misura.
 * Le tre misure hanno ambito cittadino e non sono georeferenziate.
 */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261031_B: Record<string, ProposalGeography> = {
  "riequilibrio-piano-revoca-mascaro-2026": {
    label: "Bilancio comunale di Lamezia Terme — intera città",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note:
      "La proposta riguarda la finanza comunale nel suo complesso. Fonte: il Lametino, 20 luglio e 30 ottobre 2026. Nessuna coordinata artificiale.",
  },
  "palestre-allenamento-raffaele-arpaia-lamezia-2026": {
    label: "Disponibilità di palestre e spazi di allenamento a Lamezia Terme",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note:
      "Il presidio si è svolto davanti al Comune; la richiesta riguarda però la disponibilità di palestre cittadine non ancora determinate. PalaSparti e Istituto Agrario di Savutano sono riferimenti di contesto nella fonte il Lametino del 30 ottobre, non punti WGS84 verificati della misura richiesta.",
  },
  "educazione-legalita-mozione-fdi-lamezia-2026": {
    label: "Iniziative educative rivolte ai giovani nel Comune di Lamezia Terme",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note:
      "Scuole e associazioni sono destinatarie eventuali di iniziative non ancora localizzate. Fonte: il Lametino, 30 ottobre 2026. Nessuna georeferenziazione.",
  },
};
