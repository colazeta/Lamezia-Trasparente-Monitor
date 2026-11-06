import type { ProposalGeography } from "./proposalGeographyCore";

/** Località e riferimento scolastico acquisiti senza inventare coordinate o plessi. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261106: Record<string, ProposalGeography> = {
  "contrade-acquadauzano-filicioni-viabilita-cristiano-villella-2026": {
    label: "Acquadauzano, Gabella, Filicioni, Cubiti e Caria — tratti di viabilità segnalati",
    scope: "area",
    areas: ["intera_citta"],
    points: [],
    note:
      "Cinque località nominate espressamente nel comunicato del 22 ottobre 2026: https://www.lametino.it/ultime/lamezia-cristiano-e-villella-su-criticita-della-viabilita-nelle-frazioni-necessari-interventi.html . La classificazione territoriale amministrativa è generica perché non sono acquisiti perimetri o coordinate dei singoli tratti: non equivale a intervento citywide e non sono assegnate coordinate WGS84.",
  },
  "santeufemia-sicurezza-accessi-scuole-liberali-2026": {
    label: "Area antistante le scuole elementari di Sant'Eufemia Lamezia",
    scope: "area",
    areas: ["sant_eufemia"],
    points: [],
    note:
      "Il comunicato del 20 ottobre 2026 individua l'area antistante le scuole elementari di Sant'Eufemia, senza identificare univocamente il plesso: https://www.lametino.it/ultime/lamezia-i-liberali-dopo-lennesimo-episodio-di-furto-a-santeufemia-serve-massima-attenzione.html . Localizzazione di quartiere, non punto georeferenziato WGS84.",
  },
};
