export const LEGALITA_TIMELINE_CATEGORIES = [
  "memoria_civica",
  "prevenzione",
  "bene_confiscato",
  "atto_istituzionale",
  "iniziativa_pubblica",
  "fonte_documentale",
] as const;

export type LegalitaTimelineCategory =
  (typeof LEGALITA_TIMELINE_CATEGORIES)[number];

export type LegalitaTimelineDateRange = {
  startDate: string;
  endDate?: string;
  label: string;
};

export type LegalitaTimelineDataQuality =
  | "demo_completo"
  | "demo_parziale"
  | "demo_fonte_mancante";

export type LegalitaTimelineVerificationLevel =
  | "demo_non_verificato"
  | "demo_coerente_con_schema";

export type LegalitaTimelineDocumentSource = {
  label: string;
  kind: "atto_demo" | "scheda_demo" | "verbale_demo" | "nota_metodologica_demo";
  url?: string;
};

export type LegalitaTimelineEvent = {
  id: string;
  title: string;
  category: LegalitaTimelineCategory;
  timeframe: LegalitaTimelineDateRange;
  summary: string;
  documentSource: LegalitaTimelineDocumentSource | null;
  dataQuality: LegalitaTimelineDataQuality;
  verificationLevel: LegalitaTimelineVerificationLevel;
  methodologicalTags: string[];
  cautionNote: string;
  demoOnly: true;
  verifiedRealWorldEvent: false;
};

export const LEGALITA_TIMELINE_DEMO_NOTICE =
  "Dataset dimostrativo fittizio: gli eventi servono solo a validare schema, tassonomia e cautele redazionali; non sono dati verificati o pubblicabili.";

export const LEGALITA_TIMELINE_CAUTION =
  "Gli eventi demo non provano responsabilità, appartenenze, contiguità, infiltrazioni, illeciti o valutazioni su persone, enti o gruppi identificabili.";

export const legalitaTimelineDemoEvents: LegalitaTimelineEvent[] = [
  {
    id: "demo-memoria-civica-001",
    title: "Laboratorio civico di memoria documentale",
    category: "memoria_civica",
    timeframe: {
      startDate: "2025-01-15",
      label: "15 gennaio 2025",
    },
    summary:
      "Esempio fittizio di incontro dedicato alla lettura pubblica di fonti amministrative e note metodologiche.",
    documentSource: {
      label: "Scheda demo laboratorio memoria",
      kind: "scheda_demo",
      url: "demo://legalita/memoria-civica-001",
    },
    dataQuality: "demo_completo",
    verificationLevel: "demo_coerente_con_schema",
    methodologicalTags: ["memoria", "fonte-demo", "nessuna-attribuzione"],
    cautionNote: LEGALITA_TIMELINE_CAUTION,
    demoOnly: true,
    verifiedRealWorldEvent: false,
  },
  {
    id: "demo-prevenzione-001",
    title: "Percorso informativo su accesso civico e prevenzione",
    category: "prevenzione",
    timeframe: {
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      label: "marzo 2025",
    },
    summary:
      "Esempio fittizio di percorso divulgativo su trasparenza, prevenzione amministrativa e limiti di lettura dei dati.",
    documentSource: {
      label: "Nota metodologica demo prevenzione",
      kind: "nota_metodologica_demo",
      url: "demo://legalita/prevenzione-001",
    },
    dataQuality: "demo_completo",
    verificationLevel: "demo_coerente_con_schema",
    methodologicalTags: ["prevenzione", "trasparenza", "cautele"],
    cautionNote: LEGALITA_TIMELINE_CAUTION,
    demoOnly: true,
    verifiedRealWorldEvent: false,
  },
  {
    id: "demo-bene-confiscato-001",
    title: "Scheda esemplificativa su bene destinato a uso civico",
    category: "bene_confiscato",
    timeframe: {
      startDate: "2025-05-10",
      label: "10 maggio 2025",
    },
    summary:
      "Esempio fittizio per descrivere campi e cautele di una futura scheda documentale, senza riferimento a beni reali.",
    documentSource: null,
    dataQuality: "demo_fonte_mancante",
    verificationLevel: "demo_non_verificato",
    methodologicalTags: [
      "bene-demo",
      "fonte-da-collegare",
      "dato-non-verificato",
    ],
    cautionNote: LEGALITA_TIMELINE_CAUTION,
    demoOnly: true,
    verifiedRealWorldEvent: false,
  },
  {
    id: "demo-atto-istituzionale-001",
    title: "Atto istituzionale dimostrativo su trasparenza",
    category: "atto_istituzionale",
    timeframe: {
      startDate: "2025-07-04",
      label: "4 luglio 2025",
    },
    summary:
      "Esempio fittizio di atto redazionale usato per provare la classificazione senza integrare atti ufficiali reali.",
    documentSource: {
      label: "Atto demo trasparenza",
      kind: "atto_demo",
      url: "demo://legalita/atto-istituzionale-001",
    },
    dataQuality: "demo_parziale",
    verificationLevel: "demo_coerente_con_schema",
    methodologicalTags: ["atto-demo", "classificazione", "non-pubblicabile"],
    cautionNote: LEGALITA_TIMELINE_CAUTION,
    demoOnly: true,
    verifiedRealWorldEvent: false,
  },
  {
    id: "demo-iniziativa-pubblica-001",
    title: "Iniziativa pubblica dimostrativa su cultura della legalità",
    category: "iniziativa_pubblica",
    timeframe: {
      startDate: "2025-09-20",
      label: "20 settembre 2025",
    },
    summary:
      "Esempio fittizio di iniziativa pubblica priva di nomi, enti reali o collegamenti a soggetti identificabili.",
    documentSource: {
      label: "Verbale demo iniziativa pubblica",
      kind: "verbale_demo",
      url: "demo://legalita/iniziativa-pubblica-001",
    },
    dataQuality: "demo_completo",
    verificationLevel: "demo_coerente_con_schema",
    methodologicalTags: [
      "iniziativa-demo",
      "cultura-civica",
      "nessun-soggetto-reale",
    ],
    cautionNote: LEGALITA_TIMELINE_CAUTION,
    demoOnly: true,
    verifiedRealWorldEvent: false,
  },
  {
    id: "demo-fonte-documentale-001",
    title: "Archivio dimostrativo di fonti documentali",
    category: "fonte_documentale",
    timeframe: {
      startDate: "2025-11-05",
      label: "5 novembre 2025",
    },
    summary:
      "Esempio fittizio di voce dedicata alla tracciabilità delle fonti e ai limiti di riuso civico.",
    documentSource: {
      label: "Nota demo fonti documentali",
      kind: "nota_metodologica_demo",
      url: "demo://legalita/fonte-documentale-001",
    },
    dataQuality: "demo_completo",
    verificationLevel: "demo_coerente_con_schema",
    methodologicalTags: ["fonti", "tracciabilità", "limiti"],
    cautionNote: LEGALITA_TIMELINE_CAUTION,
    demoOnly: true,
    verifiedRealWorldEvent: false,
  },
];
