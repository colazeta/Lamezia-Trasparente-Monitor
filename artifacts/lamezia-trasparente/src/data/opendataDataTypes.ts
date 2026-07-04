export type OpenDataTypeStatus = "published" | "ready";

export interface OpenDataTypeDefinition {
  id: string;
  label: string;
  shortLabel: string;
  status: OpenDataTypeStatus;
  statusLabel: string;
  description: string;
  model: string;
  updateCadence: string;
  formats: string[];
  currentSurface: string;
  href?: string;
  civicUses: string[];
  requiredMetadata: string[];
}

export const OPEN_DATA_TYPE_LIBRARY = [
  {
    id: "daily-time-series",
    label: "Serie temporali giornaliere",
    shortLabel: "Serie giornaliera",
    status: "published",
    statusLabel: "Pubblicato",
    description:
      "Dati con una riga per giorno, valori misurati o stimati, indicatori derivati e ultimo giorno completo disponibile.",
    model:
      "date, valori giornalieri, anomalie o variazioni, metadati di fonte e periodo di riferimento.",
    updateCadence:
      "Giornaliera quando la fonte espone un nuovo giorno completo; altrimenti conserva l'ultima serie valida.",
    formats: ["JSON statico", "CSV derivabile", "grafico SVG"],
    currentSurface: "Clima e territorio",
    href: "#clima-territorio",
    civicUses: [
      "lettura di tendenze locali",
      "confronto tra anni",
      "note metodologiche e richieste civiche",
    ],
    requiredMetadata: [
      "fonte",
      "periodo baseline",
      "ultimo giorno completo",
      "caveat",
    ],
  },
  {
    id: "tabular-registers",
    label: "Dataset tabellari",
    shortLabel: "Tabella",
    status: "ready",
    statusLabel: "Modello pronto",
    description:
      "Tabelle consultabili con record omogenei, filtri, ordinamento e risorse scaricabili senza chiamate runtime dal browser.",
    model:
      "id stabile, campi descrittivi, fonte, data di aggiornamento, licenza o nota sui termini.",
    updateCadence:
      "Periodica o manuale, sempre documentata nei metadati del dataset pubblicato.",
    formats: ["JSON statico", "CSV", "DCAT/JSON-LD"],
    currentSurface: "Catalogo OpenData",
    civicUses: [
      "ricerca e confronto",
      "verifica di completezza",
      "riuso in fogli di calcolo",
    ],
    requiredMetadata: [
      "fonte",
      "licenza o termini",
      "data generazione",
      "campi principali",
    ],
  },
  {
    id: "territorial-layers",
    label: "Layer territoriali",
    shortLabel: "Geodato",
    status: "ready",
    statusLabel: "Modello pronto",
    description:
      "Dati con geometrie, coordinate o chiavi territoriali, pensati per mappe, join civici e confronti tra zone.",
    model:
      "geometria o coordinate, identificativo territoriale, attributi, dizionario indicatori e scala di lettura.",
    updateCadence:
      "Legata alla fonte cartografica o statistica; ogni layer dichiara data e perimetro di validita.",
    formats: ["GeoJSON", "JSON statico", "CSV con coordinate"],
    currentSurface: "Atlante e future schede OpenData",
    civicUses: [
      "mappatura di fenomeni locali",
      "confronto tra quartieri o sezioni",
      "documentazione di scelte territoriali",
    ],
    requiredMetadata: [
      "sistema di riferimento",
      "scala territoriale",
      "fonte geometrie",
      "limiti di precisione",
    ],
  },
  {
    id: "civic-indicators",
    label: "Indicatori civici aggregati",
    shortLabel: "Indicatore",
    status: "ready",
    statusLabel: "Modello pronto",
    description:
      "Metriche sintetiche costruite da fonti pubbliche o da dataset gia pubblicati, con formula e perimetro espliciti.",
    model:
      "indicatore, formula, periodo, fonte primaria, valore, confronto e nota sui limiti.",
    updateCadence:
      "Coerente con la fonte di base; gli indicatori non anticipano dati non ancora pubblicati.",
    formats: ["JSON statico", "tabella", "serie storica"],
    currentSurface: "Statistiche e dashboard civici",
    civicUses: [
      "lettura rapida di fenomeni complessi",
      "monitoraggio nel tempo",
      "supporto a dossier pubblici",
    ],
    requiredMetadata: [
      "formula",
      "fonte primaria",
      "periodo osservato",
      "limite interpretativo",
    ],
  },
] as const satisfies readonly OpenDataTypeDefinition[];

export const OPEN_DATA_TYPE_LIBRARY_SUMMARY = {
  total: OPEN_DATA_TYPE_LIBRARY.length,
  published: OPEN_DATA_TYPE_LIBRARY.filter((type) => type.status === "published")
    .length,
  ready: OPEN_DATA_TYPE_LIBRARY.filter((type) => type.status === "ready")
    .length,
};
