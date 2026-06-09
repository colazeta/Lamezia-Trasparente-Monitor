export type CivicDemoModuleId =
  | "promessometro"
  | "incarichimetro"
  | "foia-machine"
  | "legalita-antimafia-timeline"
  | "beni-confiscati";

export type CivicDemoArea =
  | "programmazione-civica"
  | "incarichi-e-organizzazione"
  | "accesso-civico"
  | "legalita-e-monitoraggio"
  | "patrimonio-monitorato";

export type CivicDemoStatus =
  | "schema-only"
  | "demo-seed"
  | "methodology-draft";

export type CivicDemoExposureLevel =
  | "not-integrated"
  | "internal-preview"
  | "documentation-only";

export interface CivicDemoDatasetManifestEntry {
  id: CivicDemoModuleId;
  technicalName: string;
  civicArea: CivicDemoArea;
  demoStatus: CivicDemoStatus;
  exposureLevel: CivicDemoExposureLevel;
  demoOnly: true;
  cautionNotes: readonly string[];
  linkedDatasetNotes: readonly string[];
}

export interface CivicDemoDatasetManifestSummary {
  total: number;
  byArea: Record<CivicDemoArea, number>;
  byStatus: Record<CivicDemoStatus, number>;
}

const CIVIC_DEMO_AREAS: readonly CivicDemoArea[] = [
  "programmazione-civica",
  "incarichi-e-organizzazione",
  "accesso-civico",
  "legalita-e-monitoraggio",
  "patrimonio-monitorato",
];

const CIVIC_DEMO_STATUSES: readonly CivicDemoStatus[] = [
  "schema-only",
  "demo-seed",
  "methodology-draft",
];

function createZeroCounts<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
}

export const civicDemoDatasetManifest = [
  {
    id: "promessometro",
    technicalName: "Promessometro demo",
    civicArea: "programmazione-civica",
    demoStatus: "demo-seed",
    exposureLevel: "not-integrated",
    demoOnly: true,
    cautionNotes: [
      "Record dimostrativi non collegati ad atti o impegni reali.",
      "Indicatori da trattare come bozza metodologica, non come valutazione pubblica.",
    ],
    linkedDatasetNotes: [
      "Schema descrittivo per impegni civici simulati.",
      "Relazione futura con fonti documentali da definire prima dell'uso operativo.",
    ],
  },
  {
    id: "incarichimetro",
    technicalName: "Incarichimetro demo",
    civicArea: "incarichi-e-organizzazione",
    demoStatus: "schema-only",
    exposureLevel: "not-integrated",
    demoOnly: true,
    cautionNotes: [
      "Nessun nominativo o soggetto reale incluso nel manifest.",
      "Usare solo per verifiche di forma e copertura campi.",
    ],
    linkedDatasetNotes: [
      "Inventario tecnico di campi per incarichi simulati.",
      "Collegamenti documentali lasciati come note descrittive non vincolanti.",
    ],
  },
  {
    id: "foia-machine",
    technicalName: "FOIA Machine demo",
    civicArea: "accesso-civico",
    demoStatus: "methodology-draft",
    exposureLevel: "documentation-only",
    demoOnly: true,
    cautionNotes: [
      "Casi fittizi senza protocolli, uffici o procedimenti identificabili.",
      "Stato utile solo a descrivere possibili passaggi di monitoraggio.",
    ],
    linkedDatasetNotes: [
      "Traccia astratta per richieste civiche simulate.",
      "Campi di esito e scadenza da validare prima di qualsiasi integrazione.",
    ],
  },
  {
    id: "legalita-antimafia-timeline",
    technicalName: "Timeline legalita antimafia demo",
    civicArea: "legalita-e-monitoraggio",
    demoStatus: "methodology-draft",
    exposureLevel: "internal-preview",
    demoOnly: true,
    cautionNotes: [
      "Eventi fittizi privi di persone, enti, luoghi o atti riconoscibili.",
      "Le ricorrenze sono segnali dimostrativi e richiedono verifica documentale.",
    ],
    linkedDatasetNotes: [
      "Bozza di tassonomia per eventi civici simulati.",
      "Relazione con note metodologiche da completare fuori da questo manifest.",
    ],
  },
  {
    id: "beni-confiscati",
    technicalName: "Beni confiscati demo",
    civicArea: "patrimonio-monitorato",
    demoStatus: "demo-seed",
    exposureLevel: "not-integrated",
    demoOnly: true,
    cautionNotes: [
      "Asset fittizi senza indirizzi, codici catastali o assegnatari reali.",
      "Dati utili solo a controllare struttura e cautele di esposizione.",
    ],
    linkedDatasetNotes: [
      "Descrizione tecnica per schede patrimoniali simulate.",
      "Fonti operative e logiche di aggiornamento non definite in questa v0.",
    ],
  },
] as const satisfies readonly CivicDemoDatasetManifestEntry[];

export function hasUniqueCivicDemoModuleIds(
  entries: readonly CivicDemoDatasetManifestEntry[] = civicDemoDatasetManifest,
): boolean {
  const ids = entries.map((entry) => entry.id);
  return new Set(ids).size === ids.length;
}

export function filterCivicDemoManifestByStatus(
  status: CivicDemoStatus,
  entries: readonly CivicDemoDatasetManifestEntry[] = civicDemoDatasetManifest,
): CivicDemoDatasetManifestEntry[] {
  return entries.filter((entry) => entry.demoStatus === status);
}

export function summarizeCivicDemoDatasetManifest(
  entries: readonly CivicDemoDatasetManifestEntry[] = civicDemoDatasetManifest,
): CivicDemoDatasetManifestSummary {
  const summary: CivicDemoDatasetManifestSummary = {
    total: entries.length,
    byArea: createZeroCounts(CIVIC_DEMO_AREAS),
    byStatus: createZeroCounts(CIVIC_DEMO_STATUSES),
  };

  for (const entry of entries) {
    summary.byArea[entry.civicArea] += 1;
    summary.byStatus[entry.demoStatus] += 1;
  }

  return summary;
}

export function isCivicDemoManifestDemoOnly(
  entries: readonly CivicDemoDatasetManifestEntry[] = civicDemoDatasetManifest,
): boolean {
  return entries.every((entry) => entry.demoOnly === true);
}
