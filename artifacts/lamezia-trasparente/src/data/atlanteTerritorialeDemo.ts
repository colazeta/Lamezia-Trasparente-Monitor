import type { AtlanteFeatureCollection } from "./atlanteTerritoriale";

export const ATLANTE_DEMO_GEOJSON: AtlanteFeatureCollection = {
  type: "FeatureCollection",
  metadata: {
    datasetStatus: "demo",
    publicLabel: "Dato dimostrativo — non usare per analisi",
    sourceInstitution: "ISTAT",
    sourceDataset:
      "Dati dimostrativi per la pagina Atlante territoriale; non contiene sezioni censuarie reali.",
    sourceYear: "demo",
    territorialLevel: "sezione censuaria dimostrativa",
    verificationStatus:
      "Dimostrativo: il file ISTAT processato non e' ancora disponibile nella versione pubblica.",
    knownLimits: [
      "Poligoni e valori sono inventati per provare l'interfaccia.",
      "Non usare per analisi, confronti o decisioni pubbliche.",
      "Il layer ufficiale atteso resta quello ISTAT per sezioni censuarie.",
      "Il layer Zornade resta un livello accessorio/non censuario e non viene usato in questa mappa.",
    ],
    processingDate: "2026-06-19",
  },
  features: [
    {
      type: "Feature",
      properties: {
        sezione_censimento_id: "DEMO-079160-0001",
        istat_municipal_code: "079160",
        municipality: "Lamezia Terme",
        matched_istat_2023_variables: false,
        indicator_columns: ["popolazione_demo"],
        indicators_istat_2023: {
          popolazione_demo: 118,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [16.236, 38.927],
            [16.268, 38.928],
            [16.27, 38.951],
            [16.238, 38.953],
            [16.236, 38.927],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        sezione_censimento_id: "DEMO-079160-0002",
        istat_municipal_code: "079160",
        municipality: "Lamezia Terme",
        matched_istat_2023_variables: false,
        indicator_columns: ["popolazione_demo"],
        indicators_istat_2023: {
          popolazione_demo: 245,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [16.268, 38.928],
            [16.305, 38.93],
            [16.304, 38.955],
            [16.27, 38.951],
            [16.268, 38.928],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        sezione_censimento_id: "DEMO-079160-0003",
        istat_municipal_code: "079160",
        municipality: "Lamezia Terme",
        matched_istat_2023_variables: false,
        indicator_columns: ["popolazione_demo"],
        indicators_istat_2023: {
          popolazione_demo: 172,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [16.239, 38.904],
            [16.271, 38.903],
            [16.268, 38.928],
            [16.236, 38.927],
            [16.239, 38.904],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        sezione_censimento_id: "DEMO-079160-0004",
        istat_municipal_code: "079160",
        municipality: "Lamezia Terme",
        matched_istat_2023_variables: false,
        indicator_columns: ["popolazione_demo"],
        indicators_istat_2023: {
          popolazione_demo: 321,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [16.271, 38.903],
            [16.308, 38.905],
            [16.305, 38.93],
            [16.268, 38.928],
            [16.271, 38.903],
          ],
        ],
      },
    },
  ],
};
