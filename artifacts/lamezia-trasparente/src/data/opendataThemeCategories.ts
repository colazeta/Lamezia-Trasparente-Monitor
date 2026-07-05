export type OpenDataThemeStatus = "published" | "ready";

export interface OpenDataThemeDataset {
  id: string;
  label: string;
  statusLabel: string;
  dataType: string;
  description: string;
  updateCadence: string;
  sourceLabel: string;
  href?: string;
}

export interface OpenDataThemeCategory {
  id: string;
  label: string;
  shortLabel: string;
  status: OpenDataThemeStatus;
  statusLabel: string;
  description: string;
  civicQuestion: string;
  datasets: OpenDataThemeDataset[];
  dataTypes: string[];
  civicUses: string[];
}

export const DEFAULT_OPEN_DATA_THEME_ID = "climate-territory";

export const OPEN_DATA_THEME_LIBRARY = [
  {
    id: "climate-territory",
    label: "Clima e territorio",
    shortLabel: "Clima",
    status: "published",
    statusLabel: "Dataset pubblicato",
    description:
      "Serie ambientali e territoriali utili a leggere tendenze locali, limiti del dato e aggiornamenti documentati.",
    civicQuestion:
      "Come cambiano nel tempo le condizioni climatiche e territoriali osservabili con dati aperti riusabili?",
    datasets: [
      {
        id: "lamezia-climate-daily",
        label: "Anomalie climatiche · Lamezia Terme",
        statusLabel: "Disponibile",
        dataType: "Serie temporale giornaliera",
        description:
          "Temperatura media giornaliera rispetto alla normale 1991-2020, con serie JSON statica e ultimo giorno completo disponibile.",
        updateCadence:
          "Aggiornamento giornaliero pianificato al mattino quando la fonte espone il giorno precedente completo.",
        sourceLabel: "Open-Meteo Historical Weather API",
        href: "#clima-territorio",
      },
    ],
    dataTypes: [
      "serie temporali giornaliere",
      "indicatori civici",
      "dataset territoriali",
    ],
    civicUses: [
      "lettura di tendenze locali",
      "confronto tra anni",
      "supporto a note civiche e richieste di accesso",
    ],
  },
  {
    id: "contracts-spending",
    label: "Contratti e spesa pubblica",
    shortLabel: "Contratti",
    status: "ready",
    statusLabel: "Categoria pronta",
    description:
      "Dataset su affidamenti, spesa, CIG, CUP e collegamenti alle fonti ufficiali quando disponibili.",
    civicQuestion:
      "Quali risorse pubbliche vengono impegnate, con quali atti e con quale tracciabilita delle fonti?",
    datasets: [],
    dataTypes: ["registri tabellari", "indicatori aggregati", "timeline"],
    civicUses: [
      "monitoraggio di affidamenti e importi",
      "confronto tra procedure",
      "preparazione di dossier civici",
    ],
  },
  {
    id: "administration-acts",
    label: "Amministrazione e atti",
    shortLabel: "Atti",
    status: "ready",
    statusLabel: "Categoria pronta",
    description:
      "Dati su atti, organi, sedute e documenti pubblici, con metadati per provenienza e aggiornamento.",
    civicQuestion:
      "Quali decisioni sono documentate e come si collegano a temi, organi e fonti ufficiali?",
    datasets: [],
    dataTypes: ["registri tabellari", "cronologie", "metadati documentali"],
    civicUses: [
      "ricostruzione di decisioni pubbliche",
      "verifica di completezza documentale",
      "orientamento alla consultazione degli atti",
    ],
  },
  {
    id: "assets-confiscated-property",
    label: "Patrimonio e beni confiscati",
    shortLabel: "Patrimonio",
    status: "ready",
    statusLabel: "Categoria pronta",
    description:
      "Dataset su beni, patrimonio pubblico e riuso sociale, da leggere insieme ai limiti delle fonti disponibili.",
    civicQuestion:
      "Quali beni pubblici o confiscati sono descritti, localizzati o riutilizzabili secondo fonti documentate?",
    datasets: [],
    dataTypes: ["dataset tabellari", "layer territoriali", "schede fonte"],
    civicUses: [
      "mappatura civica",
      "monitoraggio del riuso",
      "segnalazione di lacune informative",
    ],
  },
  {
    id: "participation-access",
    label: "Partecipazione e accesso civico",
    shortLabel: "Accesso",
    status: "ready",
    statusLabel: "Categoria pronta",
    description:
      "Dati e modelli per domande civiche, richieste FOIA, percorsi di partecipazione e riuso del catalogo.",
    civicQuestion:
      "Quali dati aiutano cittadini, redazioni civiche e associazioni a chiedere, verificare e riusare informazioni pubbliche?",
    datasets: [],
    dataTypes: ["indicatori civici", "template", "cataloghi di fonti"],
    civicUses: [
      "preparazione di richieste mirate",
      "alfabetizzazione al dato pubblico",
      "riuso in iniziative civiche",
    ],
  },
] as const satisfies readonly OpenDataThemeCategory[];

export const OPEN_DATA_THEME_LIBRARY_SUMMARY = {
  total: OPEN_DATA_THEME_LIBRARY.length,
  published: OPEN_DATA_THEME_LIBRARY.filter(
    (theme) => theme.status === "published",
  ).length,
  ready: OPEN_DATA_THEME_LIBRARY.filter((theme) => theme.status === "ready")
    .length,
};
