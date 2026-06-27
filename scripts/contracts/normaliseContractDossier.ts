import {
  BDNCP_APPALTI_URL,
  preferredBdncpUrl,
} from "../../artifacts/lamezia-trasparente/src/lib/bdncp";
import {
  buildContractDossier,
  type ContractDossier,
  type ContractEvidence,
  type ContractIngestionMetadata,
  type ContractIngestionStatus,
  type ContractSourceUpdateKind,
} from "../../artifacts/lamezia-trasparente/src/lib/contractDossier";
import { classifyProcurementIdentifier } from "../../artifacts/lamezia-trasparente/src/lib/procurementIdentifiers";

export const ANAC_CIG_PARSER_VERSION = "anac-cig-fixture-v0";

type NormalisedContract = Parameters<
  typeof buildContractDossier
>[0]["contract"];

export interface AnacCigSourceRecord {
  source_record_id?: string | null;
  cig?: string | null;
  cup?: string | null;
  oggetto?: string | null;
  importo?: number | string | null;
  operatore?: string | null;
  data_pubblicazione?: string | null;
  data_aggiudicazione?: string | null;
  aggiudicazione?: string | null;
  aggiudicatario?: string | null;
  procedura?: string | null;
  stazione_appaltante?: string | null;
  dataset_published_at?: string | null;
}

export interface AnacCigNormalisationOptions {
  source_dataset_id: string;
  source_dataset_label: string;
  source_downloaded_at?: string | null;
  source_published_at?: string | null;
  source_update_kind?: ContractSourceUpdateKind;
}

export type AnacCigNormalisationResult =
  | {
      status: "parsed";
      recordId: string;
      contract: NormalisedContract;
      dossier: ContractDossier;
      ingestionMetadata: ContractIngestionMetadata;
      mappingNotes: string[];
    }
  | {
      status: "needs_review" | "skipped";
      recordId: string;
      ingestionMetadata: ContractIngestionMetadata;
      mappingNotes: string[];
      reason: string;
    };

export function normaliseAnacCigRecords(
  records: readonly AnacCigSourceRecord[],
  options: AnacCigNormalisationOptions,
): AnacCigNormalisationResult[] {
  return records.map((record, index) =>
    normaliseAnacCigRecord(record, options, index),
  );
}

export function normaliseAnacCigRecord(
  record: AnacCigSourceRecord,
  options: AnacCigNormalisationOptions,
  index = 0,
): AnacCigNormalisationResult {
  const recordId =
    normalizeText(record.source_record_id) || `fixture-${index + 1}`;
  const cigClassification = classifyProcurementIdentifier(record.cig);
  const metadataBase = buildIngestionMetadata(
    record,
    options,
    recordId,
    "parsed",
    [],
  );

  if (cigClassification.type === "empty") {
    return buildNeedsReviewResult(
      record,
      options,
      recordId,
      "CIG non rilevato nel record sorgente.",
    );
  }

  if (cigClassification.type !== "cig" || !cigClassification.formallyValid) {
    return buildNeedsReviewResult(
      record,
      options,
      recordId,
      "CIG presente ma non coerente con i controlli formali locali.",
    );
  }

  const cupClassification = classifyProcurementIdentifier(record.cup);
  const amount = parseAmount(record.importo);
  const awardDate = normalizeDate(record.data_aggiudicazione);
  const publicationDate = normalizeDate(record.data_pubblicazione);
  const operator =
    normalizeText(record.aggiudicatario) || normalizeText(record.operatore);
  const hasAwardEvidence = Boolean(
    awardDate ||
    operator ||
    normalizeText(record.aggiudicazione) ||
    normalizeText(record.aggiudicatario),
  );
  const mappingNotes = buildMappingNotes(record, {
    hasAmount: amount != null,
    hasOperator: Boolean(operator),
    hasCup: cupClassification.type === "cup" && cupClassification.formallyValid,
    hasAwardEvidence,
  });
  const ingestionMetadata = {
    ...metadataBase,
    mapping_notes: mappingNotes,
  };
  const contract = buildContract(record, {
    index,
    cig: cigClassification.normalized,
    cup:
      cupClassification.type === "cup" && cupClassification.formallyValid
        ? cupClassification.normalized
        : null,
    amount,
    operator,
    awardDate,
    publicationDate,
  });
  const sourceEvidence = buildSourceEvidence(record, {
    cig: cigClassification.normalized,
    hasAwardEvidence,
    ingestionMetadata,
  });
  const dossier = buildContractDossier({
    contract,
    sourceEvidence,
    ingestionMetadata: [ingestionMetadata],
  });

  return {
    status: "parsed",
    recordId,
    contract,
    dossier,
    ingestionMetadata,
    mappingNotes,
  };
}

function buildNeedsReviewResult(
  record: AnacCigSourceRecord,
  options: AnacCigNormalisationOptions,
  recordId: string,
  reason: string,
): AnacCigNormalisationResult {
  const mappingNotes = [reason];

  return {
    status: "needs_review",
    recordId,
    ingestionMetadata: buildIngestionMetadata(
      record,
      options,
      recordId,
      "needs_mapping",
      mappingNotes,
    ),
    mappingNotes,
    reason,
  };
}

function buildContract(
  record: AnacCigSourceRecord,
  input: {
    index: number;
    cig: string;
    cup: string | null;
    amount: number | null;
    operator: string;
    awardDate: string | null;
    publicationDate: string | null;
  },
): NormalisedContract {
  const title = normalizeText(record.oggetto) || "Record ANAC CIG test fixture";
  const isPublicWork =
    Boolean(input.cup) || /lavor|opera|manutenzione/i.test(title);

  return {
    id: -100000 - input.index,
    title,
    description:
      "Record normalizzato da fixture test ANAC/open-data; non esposto in produzione.",
    supplier: input.operator || "Operatore non disponibile nella fonte fixture",
    amount: input.amount ?? 0,
    procedureType:
      normalizeText(record.procedura) || "Procedura non disponibile",
    status:
      input.awardDate || input.operator
        ? "Aggiudicazione da fonte"
        : "Da verificare",
    awardDate: input.awardDate ?? input.publicationDate ?? "",
    cig: input.cig,
    cup: input.cup,
    stazioneAppaltante:
      normalizeText(record.stazione_appaltante) ||
      "Stazione appaltante non disponibile",
    acquisitionTool: null,
    withoutTender: false,
    withoutMepa: false,
    anacUrl: preferredBdncpUrl(null, input.cig) ?? BDNCP_APPALTI_URL,
    themeId: null,
    macrotema: isPublicWork ? "strade" : null,
    macrotemaManual: false,
    latitude: null,
    longitude: null,
    geoAddress: null,
    geoQuartiere: null,
    geoSource: null,
    geoManual: false,
    geoVerify: false,
  };
}

function buildSourceEvidence(
  record: AnacCigSourceRecord,
  input: {
    cig: string;
    hasAwardEvidence: boolean;
    ingestionMetadata: ContractIngestionMetadata;
  },
): ContractEvidence[] {
  const evidence: ContractEvidence[] = [
    {
      id: `anac-cig-${input.ingestionMetadata.source_record_id}-gara`,
      phaseKey: "gara_pubblicazione",
      title: "Record ANAC CIG ingerito",
      description:
        "Record normalizzato da fixture locale ANAC/open-data. La presenza del CIG documenta la fonte procedura, non l'intero ciclo di vita.",
      sourceKind: "bdncp",
      sourceStatus: "official-ingested-source",
      sourceLabel: input.ingestionMetadata.source_dataset_label,
      sourceUrl: preferredBdncpUrl(null, input.cig) ?? undefined,
      identifier: input.cig,
      isOfficialSourceEvidence: true,
      ingestionMetadata: input.ingestionMetadata,
    },
  ];

  if (input.hasAwardEvidence) {
    evidence.push({
      id: `anac-cig-${input.ingestionMetadata.source_record_id}-affidamento`,
      phaseKey: "affidamento",
      title: "Campo aggiudicazione/affidamento da fonte ANAC",
      description:
        normalizeText(record.aggiudicazione) ||
        normalizeText(record.aggiudicatario) ||
        "La fixture contiene campi di aggiudicazione normalizzabili.",
      sourceKind: "bdncp",
      sourceStatus: "official-ingested-source",
      sourceLabel: input.ingestionMetadata.source_dataset_label,
      sourceUrl: preferredBdncpUrl(null, input.cig) ?? undefined,
      identifier: input.cig,
      isOfficialSourceEvidence: true,
      ingestionMetadata: input.ingestionMetadata,
    });
  }

  return evidence;
}

function buildIngestionMetadata(
  record: AnacCigSourceRecord,
  options: AnacCigNormalisationOptions,
  recordId: string,
  ingestionStatus: ContractIngestionStatus,
  mappingNotes: string[],
): ContractIngestionMetadata {
  return {
    source_dataset_id: options.source_dataset_id,
    source_dataset_label: options.source_dataset_label,
    source_record_id: recordId,
    source_downloaded_at: options.source_downloaded_at ?? null,
    source_published_at:
      normalizeDate(record.dataset_published_at) ??
      options.source_published_at ??
      null,
    source_update_kind: options.source_update_kind ?? "unknown",
    parser_version: ANAC_CIG_PARSER_VERSION,
    ingestion_status: ingestionStatus,
    mapping_notes: mappingNotes,
  };
}

function buildMappingNotes(
  _record: AnacCigSourceRecord,
  state: {
    hasAmount: boolean;
    hasOperator: boolean;
    hasCup: boolean;
    hasAwardEvidence: boolean;
  },
): string[] {
  const notes = [
    "Record fixture normalizzato senza scraping di pagine dinamiche.",
    "Esecuzione e collaudo restano non documentati senza fonte esplicita.",
  ];

  if (!state.hasAmount) {
    notes.push("Importo non disponibile nella fonte fixture.");
  }

  if (!state.hasOperator) {
    notes.push("Operatore/aggiudicatario non disponibile nella fonte fixture.");
  }

  if (!state.hasCup) {
    notes.push("CUP non rilevato nelle fonti disponibili.");
  }

  if (!state.hasAwardEvidence) {
    notes.push("Affidamento non documentato da campi di aggiudicazione.");
  }

  return notes;
}

function parseAmount(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const normalized = text.replace(/\./g, "").replace(",", ".");
  const amount = Number(normalized);

  return Number.isFinite(amount) ? amount : null;
}

function normalizeDate(value: string | null | undefined): string | null {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return text.slice(0, 10);
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}
