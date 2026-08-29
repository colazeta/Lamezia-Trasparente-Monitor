export const PROPOSAL_GEO_AREAS = [
  "nicastro",
  "sambiase",
  "sant_eufemia",
  "costa",
  "intera_citta",
] as const;

export type ProposalGeoArea = (typeof PROPOSAL_GEO_AREAS)[number];

export const PROPOSAL_GEO_AREA_LABELS: Record<ProposalGeoArea, string> = {
  nicastro: "Nicastro",
  sambiase: "Sambiase",
  sant_eufemia: "Sant’Eufemia",
  costa: "Costa lametina",
  intera_citta: "Intera città",
};

export const PROPOSAL_GEO_SCOPES = [
  "point",
  "multi_point",
  "area",
  "citywide",
] as const;

export type ProposalGeoScope = (typeof PROPOSAL_GEO_SCOPES)[number];

export const PROPOSAL_GEO_SCOPE_LABELS: Record<ProposalGeoScope, string> = {
  point: "Luogo puntuale",
  multi_point: "Più luoghi",
  area: "Area territoriale",
  citywide: "Intera città",
};

export const PROPOSAL_GEO_PRECISIONS = [
  "exact_landmark",
  "street_approximate",
  "area_centroid",
  "city_centroid",
] as const;

export type ProposalGeoPrecision =
  (typeof PROPOSAL_GEO_PRECISIONS)[number];

export const PROPOSAL_GEO_PRECISION_LABELS: Record<
  ProposalGeoPrecision,
  string
> = {
  exact_landmark: "Punto identificato",
  street_approximate: "Riferimento stradale approssimato",
  area_centroid: "Centroide / punto rappresentativo dell’area",
  city_centroid: "Centroide di visualizzazione cittadino",
};

export type ProposalGeoPoint = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  area: ProposalGeoArea;
  precision: ProposalGeoPrecision;
  sourceLabel: string;
  sourceUrl?: string;
};

export type ProposalGeography = {
  label: string;
  scope: ProposalGeoScope;
  areas: readonly ProposalGeoArea[];
  points: readonly ProposalGeoPoint[];
  note?: string;
};

const CITY_CENTROID: ProposalGeoPoint = {
  id: "lamezia-city-centroid",
  label: "Lamezia Terme — centroide di visualizzazione",
  latitude: 38.965,
  longitude: 16.31,
  area: "intera_citta",
  precision: "city_centroid",
  sourceLabel: "Centro mappa GIS del progetto",
};

function citywide(label: string): ProposalGeography {
  return {
    label,
    scope: "citywide",
    areas: ["intera_citta"],
    points: [CITY_CENTROID],
    note:
      "La coordinata è un centroide di visualizzazione e non indica un luogo fisico specifico della proposta.",
  };
}

export const PROPOSAL_GEOGRAPHY: Record<string, ProposalGeography> = {
  "piazza-italia-sicurezza-prevenzione-2026": {
    label: "Piazza Italia e area circostante, Sant’Eufemia",
    scope: "point",
    areas: ["sant_eufemia"],
    points: [
      {
        id: "piazza-italia",
        label: "Piazza Italia, Sant’Eufemia Lamezia",
        latitude: 38.9202,
        longitude: 16.2525,
        area: "sant_eufemia",
        precision: "exact_landmark",
        sourceLabel: "Stradario cartografico — Piazza Italia",
        sourceUrl: "https://www.blia.it/in/39202-102525",
      },
    ],
  },
  "fontana-piazza-mercato-vecchio-manutenzione-2026": {
    label: "Piazza Mercato Vecchio, Nicastro",
    scope: "point",
    areas: ["nicastro"],
    points: [
      {
        id: "piazza-mercato-vecchio",
        label: "Piazza Mercato Vecchio",
        latitude: 38.97493,
        longitude: 16.31961,
        area: "nicastro",
        precision: "exact_landmark",
        sourceLabel: "OpenStreetMap / Mapcarta",
        sourceUrl: "https://mapcarta.com/33604066",
      },
    ],
  },
  "asili-nido-continuita-servizio-2026": {
    label: "Tre asili nido comunali: Nicastro, Sambiase e Sant’Eufemia",
    scope: "multi_point",
    areas: ["nicastro", "sambiase", "sant_eufemia"],
    points: [
      {
        id: "asilo-via-conforti",
        label: "Asilo nido comunale — via Conforti (Nicastro)",
        latitude: 38.97671,
        longitude: 16.31792,
        area: "nicastro",
        precision: "street_approximate",
        sourceLabel: "Riferimento stradale via Conforti",
        sourceUrl:
          "https://www.impresaitalia.info/kk04107409/davoli-valentina/lamezia-terme.aspx",
      },
      {
        id: "asilo-via-spartivento",
        label: "Asilo nido comunale — via Spartivento (Sambiase)",
        latitude: 38.9654,
        longitude: 16.2719,
        area: "sambiase",
        precision: "street_approximate",
        sourceLabel: "Riferimento territoriale Viale Salvemini / Spartivento",
        sourceUrl: "https://www.blia.it/in/39654-102719",
      },
      {
        id: "asilo-via-giovanni-xxiii",
        label: "Asilo nido comunale — via Giovanni XXIII (Sant’Eufemia)",
        latitude: 38.91875,
        longitude: 16.2554,
        area: "sant_eufemia",
        precision: "street_approximate",
        sourceLabel: "Riferimento stradale via Giovanni XXIII",
        sourceUrl:
          "https://www.impresaitalia.info/kk05025042/montesanti-elena-rosa-maria/lamezia-terme.aspx",
      },
    ],
    note:
      "Le tre localizzazioni territoriali sono confermate dal Comune; le coordinate sono riferimenti stradali utili al filtro e alla visualizzazione, non rilievi catastali degli edifici.",
  },
  "ponte-sant-antonio-rilancio-2026": {
    label: "Ponte Sant’Antonio e vie limitrofe, Nicastro",
    scope: "area",
    areas: ["nicastro"],
    points: [
      {
        id: "ponte-sant-antonio",
        label: "Via / Ponte Sant’Antonio",
        latitude: 38.9747,
        longitude: 16.3207,
        area: "nicastro",
        precision: "street_approximate",
        sourceLabel: "Stradario cartografico — Via Ponte Sant’Antonio",
        sourceUrl: "https://www.blia.it/in/39747-103207",
      },
    ],
  },
  "politiche-sociali-progetto-vita-2026": citywide(
    "Politiche sociali e disabilità — intero territorio comunale",
  ),
  "riuso-libri-scolastici-inclusione-2026": citywide(
    "Scuola e inclusione — intero territorio comunale",
  ),
  "ex-cinema-grandinetti-bonifica-2026": {
    label: "Ex Cinema Grandinetti, Sambiase",
    scope: "point",
    areas: ["sambiase"],
    points: [
      {
        id: "ex-cinema-grandinetti",
        label: "Ex Cinema Grandinetti",
        latitude: 38.96586,
        longitude: 16.27891,
        area: "sambiase",
        precision: "exact_landmark",
        sourceLabel: "OpenStreetMap / Mapcarta",
        sourceUrl: "https://mapcarta.com/W596701561",
      },
    ],
  },
  "cinghiali-centro-misure-sicurezza-2026": citywide(
    "Aree urbane di Lamezia Terme — riferimento cittadino",
  ),
  "ginepri-marinella-sicurezza-valorizzazione-2026": {
    label: "Pineta Ginepri–Marinella, lungomare e fascia costiera",
    scope: "area",
    areas: ["sant_eufemia", "costa"],
    points: [
      {
        id: "lungomare-ginepri",
        label: "Lungomare Ginepri — punto rappresentativo",
        latitude: 38.90046,
        longitude: 16.22163,
        area: "costa",
        precision: "area_centroid",
        sourceLabel: "OpenStreetMap / Mapcarta",
        sourceUrl: "https://mapcarta.com/W588618092",
      },
    ],
    note:
      "Il riferimento rappresenta il filone territoriale Ginepri–Marinella e non delimita l’intero perimetro interessato dall’interrogazione.",
  },
  "passerella-marinella-gizzeria-2026": {
    label: "Marinella, SS18 e collegamento verso Gizzeria Lido",
    scope: "area",
    areas: ["costa"],
    points: [
      {
        id: "via-antonio-cappelli-bastione",
        label: "Via Antonio Cappelli / area Bastione di Malta — punto rappresentativo",
        latitude: 38.93044,
        longitude: 16.22154,
        area: "costa",
        precision: "area_centroid",
        sourceLabel: "AroundUs / Wikimedia — Bastione di Malta, Via Antonio Cappelli",
        sourceUrl: "https://it.aroundus.com/p/8132132-bastione-di-malta",
      },
    ],
    note:
      "Il punto è un riferimento territoriale lungo via Antonio Cappelli e non identifica la posizione esatta della futura passerella o del ponte sul torrente Piscirò.",
  },
  "emodinamica-h24-giovanni-paolo-ii-2026": {
    label: "Presidio ospedaliero Giovanni Paolo II",
    scope: "point",
    areas: ["sambiase"],
    points: [
      {
        id: "ospedale-giovanni-paolo-ii",
        label: "Presidio ospedaliero Giovanni Paolo II, via Senatore Arturo Perugini",
        latitude: 38.9583756,
        longitude: 16.3001498,
        area: "sambiase",
        precision: "exact_landmark",
        sourceLabel: "Regione Calabria — DGR 720/2023, tabella delle strutture ospedaliere",
        sourceUrl:
          "https://www.regione.calabria.it/wp-content/uploads/2023/12/dgr--720----del-15.12.2023-_.pdf",
      },
    ],
    note:
      "La coordinata è quella associata al P.O. Giovanni Paolo II nella tabella regionale delle strutture ospedaliere. Il tag Sambiase serve al filtro territoriale dell'archivio e non sostituisce una delimitazione amministrativa di quartiere.",
  },
  "convocazioni-ordini-giorno-digitali": citywide(
    "Trasparenza delle sedute — intero territorio comunale",
  ),
  "streaming-archivio-sedute-pubbliche": citywide(
    "Accesso alle sedute pubbliche — intero territorio comunale",
  ),
  "resoconto-integrale-sedute-consiliari": citywide(
    "Resoconti delle sedute — intero territorio comunale",
  ),
  "firma-digitale-iniziative-petizioni": citywide(
    "Partecipazione civica digitale — intero territorio comunale",
  ),
};

export function getProposalGeography(
  proposalId: string,
): ProposalGeography | undefined {
  return PROPOSAL_GEOGRAPHY[proposalId];
}

export function proposalMatchesGeoArea(
  proposalId: string,
  area: ProposalGeoArea,
): boolean {
  return getProposalGeography(proposalId)?.areas.includes(area) ?? false;
}

export function getProposalGeoAreas() {
  return [...PROPOSAL_GEO_AREAS].sort((a, b) =>
    PROPOSAL_GEO_AREA_LABELS[a].localeCompare(
      PROPOSAL_GEO_AREA_LABELS[b],
      "it",
    ),
  );
}
