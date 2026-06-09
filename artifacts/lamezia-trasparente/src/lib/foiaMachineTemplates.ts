import {
  FOIA_REQUEST_TYPES,
  FoiaDemoCase,
  FoiaRequestType,
  foiaRequestTypeLabels,
} from "@/data/foiaMachineDemo";

const REQUIRED_CASE_FIELDS = [
  "id",
  "demoOnly",
  "sourceModule",
  "requestType",
  "documentSubject",
  "cautiousMotivation",
  "demoRecipientEntity",
  "sourceContext",
  "dataQualityStatus",
  "cautionNotes",
] as const satisfies readonly (keyof FoiaDemoCase)[];

const EDITABLE_DRAFT_NOTICE =
  "Bozza dimostrativa modificabile: verificare destinatario, riferimenti normativi e contenuti prima di qualsiasi uso esterno.";

const LEGAL_CAUTION_NOTICE =
  "Questa bozza non prova inadempimento, illecito, responsabilità personale o obbligo giuridico accertato; serve solo come traccia prudente per una richiesta documentale.";

export interface FoiaDraft {
  subject: string;
  body: string;
  editableNotice: string;
  legalCaution: string;
}

export type FoiaTypeCounts = Record<FoiaRequestType, number>;

export const foiaMachineTemplateNotices = {
  editableDraft: EDITABLE_DRAFT_NOTICE,
  legalCaution: LEGAL_CAUTION_NOTICE,
} as const;

export function generateFoiaDraft(demoCase: FoiaDemoCase): FoiaDraft {
  const requestLabel = foiaRequestTypeLabels[demoCase.requestType];
  const subject = `${requestLabel} — bozza demo su ${demoCase.documentSubject}`;
  const cautionList = demoCase.cautionNotes.map((note) => `- ${note}`).join("\n");

  return {
    subject,
    editableNotice: EDITABLE_DRAFT_NOTICE,
    legalCaution: LEGAL_CAUTION_NOTICE,
    body: [
      `Destinatario demo: ${demoCase.demoRecipientEntity}`,
      "",
      "Testo modificabile dall'utente:",
      `si chiede cortesemente supporto documentale in merito a: ${demoCase.documentSubject}.`,
      `Motivazione prudente: ${demoCase.cautiousMotivation}.`,
      `Contesto dichiarato: ${demoCase.sourceContext}.`,
      `Stato qualità dato demo: ${demoCase.dataQualityStatus}.`,
      "",
      "Cautele:",
      cautionList,
      `- ${LEGAL_CAUTION_NOTICE}`,
      "",
      EDITABLE_DRAFT_NOTICE,
    ].join("\n"),
  };
}

export function countFoiaCasesByType(cases: readonly FoiaDemoCase[]): FoiaTypeCounts {
  const counts = Object.fromEntries(
    FOIA_REQUEST_TYPES.map((requestType) => [requestType, 0]),
  ) as FoiaTypeCounts;

  for (const demoCase of cases) {
    counts[demoCase.requestType] += 1;
  }

  return counts;
}

export function getMissingFoiaDemoFields(
  demoCase: Partial<FoiaDemoCase>,
): (keyof FoiaDemoCase)[] {
  return REQUIRED_CASE_FIELDS.filter((field) => {
    const value = demoCase[field];

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return value === undefined || value === null || value === "";
  });
}

export function isFoiaDemoOnlyDataset(cases: readonly Partial<FoiaDemoCase>[]): boolean {
  return cases.every((demoCase) => demoCase.demoOnly === true);
}
