export const DATA_STATUS = [
  "ufficiale",
  "estratto",
  "arricchito",
  "da verificare",
  "non rintracciato",
] as const;

export type DataStatus = (typeof DATA_STATUS)[number];

export type StaffingSource = {
  label: string;
  url?: string;
  note: string;
};

export type MacchinaComunaleRecord = {
  id: string;
  area: string;
  service: string;
  plannedStaff: number | null;
  availableStaff: number | null;
  vacantPositions: number | null;
  source: StaffingSource;
  dataStatus: DataStatus;
  lastUpdated: string | null;
  caveat: string;
};

export type MacchinaComunaleSummary = {
  totalAreas: number;
  totalServices: number;
  servicesWithDocumentedGap: number;
  missingOrIncompleteData: number;
  consultedSources: number;
  averageVacancyRate: number | null;
};

export type PublicAdministrativeSignal = {
  id: string;
  title: string;
  source: StaffingSource & {
    publishedAt: string;
    sourceType: "fonte secondaria di stampa locale";
  };
  documentedFact: string;
  reportedElements: readonly string[];
  verificationNeeds: readonly string[];
  civicUse: string;
};

export const MACCHINA_COMUNALE_DATASET_NOTE =
  "Dataset seed manuale e dimostrativo: i valori sono segnaposto tecnici per validare schema, calcoli e interfaccia. Non rappresentano la dotazione organica ufficiale del Comune di Lamezia Terme e devono essere sostituiti o confermati con fonti pubbliche documentate.";

export const publicAdministrativeSignals: readonly PublicAdministrativeSignal[] =
  [
    {
      id: "lametino-2026-06-06-lettera-personale",
      title: "Segnalazione pubblica su fabbisogno e incarichi ad interim",
      source: {
        label:
          "Il Lametino, 6 giugno 2026 — articolo su lettera attribuita a personale e rappresentanze",
        url: "https://www.lametino.it/ultimora/lamezia-dirigenti-e-dipendenti-contro-alcuni-consiglieri-di-maggioranza-e-assessora-basta-accuse-alla-macchina-comunale.html",
        publishedAt: "2026-06-06",
        sourceType: "fonte secondaria di stampa locale",
        note: "Fonte giornalistica utile come spunto di verifica: non sostituisce PIAO, dotazione organica, piano dei fabbisogni, atti di conferimento o documenti protocollati.",
      },
      documentedFact:
        "Esistenza dell'articolo pubblicato il 6 giugno 2026; il testo riferisce di una lettera indirizzata agli organi comunali e attribuita a dirigenti, segreteria comunale, RSU, Cisl-Fp e Csa-Ral.",
      reportedElements: [
        "Rapporto indicato dalla fonte come circa 220 unità in servizio a fronte di oltre 550 necessarie.",
        "Dotazione dirigenziale descritta dalla fonte come sottodimensionata, con incarichi ad interim per alcuni settori.",
      ],
      verificationNeeds: [
        "Acquisire ultimo PIAO e piano triennale del fabbisogno del personale.",
        "Verificare dotazione organica vigente e personale effettivamente in servizio per settore.",
        "Individuare eventuali atti ufficiali sugli incarichi dirigenziali ad interim.",
        "Verificare eventuale protocollo o pubblicazione istituzionale della lettera citata dalla stampa, se ostensibile.",
      ],
      civicUse:
        "Elemento da trattare come segnale pubblico da verificare e come possibile traccia per richieste documentali, non come dato consolidato né come base per valutazioni individuali o accuse.",
    },
  ];

export const macchinaComunaleRecords: readonly MacchinaComunaleRecord[] = [
  {
    id: "demo-affari-generali-segreteria",
    area: "Affari generali e segreteria",
    service: "Segreteria generale e supporto agli organi",
    plannedStaff: 12,
    availableStaff: 9,
    vacantPositions: 3,
    source: {
      label: "Seed dimostrativo in attesa di PIAO/dotazione organica",
      note: "Voce predisposta per collegare Piano integrato di attività e organizzazione, dotazione organica o atti equivalenti.",
    },
    dataStatus: "da verificare",
    lastUpdated: "2026-06-08",
    caveat:
      "Indicatore calcolabile solo come prova tecnica del modulo: richiede verifica su fonte ufficiale prima di qualsiasi uso informativo.",
  },
  {
    id: "demo-servizi-finanziari-ragioneria",
    area: "Servizi finanziari",
    service: "Ragioneria, bilancio e programmazione economica",
    plannedStaff: 10,
    availableStaff: 10,
    vacantPositions: 0,
    source: {
      label: "Seed dimostrativo in attesa di documenti contabili e fabbisogni",
      note: "Campo fonte pensato per collegare bilanci, piani del fabbisogno o sezioni di Amministrazione Trasparente.",
    },
    dataStatus: "da verificare",
    lastUpdated: "2026-06-08",
    caveat:
      "L'assenza di scopertura nel dato demo non indica completezza né adeguatezza dell'organico reale.",
  },
  {
    id: "demo-lavori-pubblici-manutenzioni",
    area: "Lavori pubblici e manutenzioni",
    service: "Programmazione lavori, manutenzioni e cantieri",
    plannedStaff: 16,
    availableStaff: 11,
    vacantPositions: 5,
    source: {
      label: "Seed dimostrativo da sostituire con fonte ufficiale",
      note: "Predisposizione per collegare piano triennale, atti organizzativi e documenti sul personale.",
    },
    dataStatus: "da verificare",
    lastUpdated: "2026-06-08",
    caveat:
      "La pressione organizzativa è un segnale descrittivo aggregato e non valuta persone, uffici o responsabilità individuali.",
  },
  {
    id: "demo-servizi-sociali-welfare",
    area: "Servizi sociali e welfare",
    service: "Servizi alla persona e misure di sostegno",
    plannedStaff: null,
    availableStaff: 14,
    vacantPositions: null,
    source: {
      label: "Fabbisogno non rintracciato nel seed",
      note: "Record utile a rappresentare un dato parziale: il tasso di scopertura non viene calcolato senza personale previsto o posti vacanti.",
    },
    dataStatus: "non rintracciato",
    lastUpdated: null,
    caveat:
      "Dato incompleto: segnala una necessità di tracciamento della fonte, non una valutazione sul servizio.",
  },
  {
    id: "demo-urbanistica-edilizia",
    area: "Urbanistica ed edilizia privata",
    service: "Istruttorie urbanistiche e sportello edilizia",
    plannedStaff: 9,
    availableStaff: null,
    vacantPositions: null,
    source: {
      label: "Seed dimostrativo con disponibilità da verificare",
      note: "Esempio di record in cui la dotazione prevista esiste ma manca il dato disponibile aggiornato.",
    },
    dataStatus: "da verificare",
    lastUpdated: "2026-06-08",
    caveat:
      "Senza organico disponibile o posti vacanti non viene prodotto alcun tasso di scopertura.",
  },
];

export function getVacantPositions(record: MacchinaComunaleRecord) {
  if (typeof record.vacantPositions === "number") return record.vacantPositions;
  if (
    typeof record.plannedStaff === "number" &&
    typeof record.availableStaff === "number"
  ) {
    return Math.max(record.plannedStaff - record.availableStaff, 0);
  }
  return null;
}

export function getVacancyRate(record: MacchinaComunaleRecord) {
  const vacancies = getVacantPositions(record);
  if (
    vacancies == null ||
    typeof record.plannedStaff !== "number" ||
    record.plannedStaff <= 0
  ) {
    return null;
  }
  return vacancies / record.plannedStaff;
}

export function summarizeMacchinaComunale(
  records: readonly MacchinaComunaleRecord[],
): MacchinaComunaleSummary {
  const rates = records
    .map(getVacancyRate)
    .filter((rate): rate is number => rate != null);
  const sourceLabels = new Set(records.map((record) => record.source.label));

  return {
    totalAreas: new Set(records.map((record) => record.area)).size,
    totalServices: records.length,
    servicesWithDocumentedGap: records.filter((record) => {
      const vacancies = getVacantPositions(record);
      return vacancies != null && vacancies > 0;
    }).length,
    missingOrIncompleteData: records.filter(
      (record) =>
        record.dataStatus === "non rintracciato" ||
        record.plannedStaff == null ||
        record.availableStaff == null ||
        getVacantPositions(record) == null,
    ).length,
    consultedSources: sourceLabels.size,
    averageVacancyRate: rates.length
      ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length
      : null,
  };
}
