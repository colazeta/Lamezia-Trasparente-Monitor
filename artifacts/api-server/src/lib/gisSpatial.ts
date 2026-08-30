import { comuneGeoJson, quartieriGeoJson } from "../data/gis";

export const municipalBoundarySpatialCollection = {
  ...comuneGeoJson,
  metadata: {
    layer_id: "municipal-boundary" as const,
    geometry_role: "administrative_boundary" as const,
    representation: "municipal_boundary" as const,
    source_label: "OpenStreetMap / Nominatim",
    attribution: "© OpenStreetMap contributors",
    licence: "ODbL 1.0",
    publication_note:
      "Confine comunale usato come geografia di riferimento dell'Atlante; non sostituisce eventuali basi ufficiali più autorevoli che dovessero diventare disponibili.",
  },
};

export const historicCircumscriptionCentroidsSpatialCollection = {
  ...quartieriGeoJson,
  metadata: {
    layer_id: "historic-circumscription-centroids" as const,
    representation: "reference_centroids" as const,
    is_boundary: false as const,
    source_label: "OpenStreetMap / Nominatim",
    attribution: "© OpenStreetMap contributors",
    licence: "ODbL 1.0",
    publication_note:
      "I punti di Nicastro, Sambiase e Sant'Eufemia sono centroidi/toponimi di riferimento e non rappresentano confini di quartiere o circoscrizione.",
  },
};
