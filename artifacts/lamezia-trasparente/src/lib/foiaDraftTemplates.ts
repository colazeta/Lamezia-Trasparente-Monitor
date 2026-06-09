export type FoiaRequestKind =
  | "accesso_civico_semplice"
  | "accesso_civico_generalizzato"
  | "da_valutare";

export type FoiaDraftCheckOutcome =
  | "documento_non_rintracciato"
  | "aggiornamento_non_rintracciato"
  | "dato_incompleto"
  | "chiarimento_puntuale"
  | "documentazione_ampia"
  | "altro";

export type FoiaDraftPublicationExpectation =
  | "obbligatoria"
  | "non_specificata"
  | "da_verificare";

export type FoiaDraftRequestScope =
  | "documento_obbligatorio"
  | "chiarimento_puntuale"
  | "documentazione_ampia"
  | "da_valutare";

export interface FoiaDraftCase {
  sourceModule?: string;
  dataType?: string;
  checkedAt?: string;
  checkOutcome?: FoiaDraftCheckOutcome;
  publicationExpectation?: FoiaDraftPublicationExpectation;
  requestScope?: FoiaDraftRequestScope;
  checkedSources?: readonly string[];
  checkedUrl?: string;
  note?: string;
}

export interface FoiaDraftEditableFields {
  requesterName: string;
  requesterContact: string;
  recipientOffice: string;
  requestSubject: string;
  requestBody: string;
  checkedAt: string;
  checkedSources: readonly string[];
  checkedUrl: string;
  userNote: string;
}

export interface FoiaDraftMetadata {
  sourceModule?: string;
  dataType?: string;
  checkedAt?: string;
  checkedSources: readonly string[];
  checkedUrl?: string;
  checkOutcome: FoiaDraftCheckOutcome;
  publicationExpectation: FoiaDraftPublicationExpectation;
  requestScope: FoiaDraftRequestScope;
}

export interface FoiaDraftResult {
  requestKind: FoiaRequestKind;
  subject: string;
  body: string;
  cautions: readonly string[];
  editableFields: FoiaDraftEditableFields;
  metadata: FoiaDraftMetadata;
}

const REQUEST_KIND_LABELS: Record<FoiaRequestKind, string> = {
  accesso_civico_semplice: "accesso civico semplice",
  accesso_civico_generalizzato: "accesso civico generalizzato",
  da_valutare: "richiesta da valutare",
};

const DEFAULT_CAUTIONS = [
  "Bozza tecnica modificabile: verificare destinatario, competenza dell'ufficio e contenuti prima di qualsiasi invio.",
  "La bozza descrive solo quanto dichiarato dall'utente nel controllo e non accerta responsabilità, intenzioni o cause del dato non rintracciato.",
  "Evitare riferimenti personali o dati non necessari; integrare solo informazioni verificabili e pertinenti.",
  "Verificare separatamente eventuali riferimenti normativi e termini applicabili prima dell'uso esterno.",
] as const;

const EMPTY_EDITABLE_VALUE = "";
const FALLBACK_DATA_TYPE = "informazione o documento indicato dall'utente";
const FALLBACK_MODULE = "contesto di monitoraggio indicato dall'utente";

function cleanText(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized ? normalized : undefined;
}

function cleanList(values: readonly string[] | undefined): string[] {
  return values
    ?.map((value) => cleanText(value))
    .filter((value): value is string => Boolean(value)) ?? [];
}

function resolveRequestKind(metadata: FoiaDraftMetadata): FoiaRequestKind {
  if (
    metadata.requestScope === "documentazione_ampia" ||
    metadata.checkOutcome === "documentazione_ampia"
  ) {
    return "accesso_civico_generalizzato";
  }

  if (
    metadata.publicationExpectation === "obbligatoria" &&
    metadata.requestScope === "documento_obbligatorio" &&
    (metadata.checkOutcome === "documento_non_rintracciato" ||
      metadata.checkOutcome === "aggiornamento_non_rintracciato")
  ) {
    return "accesso_civico_semplice";
  }

  return "da_valutare";
}

function buildCheckedContext(metadata: FoiaDraftMetadata): string[] {
  const contextLines = [
    `Modulo o contesto dichiarato: ${metadata.sourceModule ?? FALLBACK_MODULE}.`,
    `Informazione o documento di interesse: ${metadata.dataType ?? FALLBACK_DATA_TYPE}.`,
  ];

  if (metadata.checkedAt) {
    contextLines.push(
      `Non risulta rintracciato/aggiornato alla data del controllo (${metadata.checkedAt}) quanto indicato, sulla base delle sole informazioni dichiarate dall'utente.`,
    );
  } else {
    contextLines.push(
      "Non risulta rintracciato/aggiornato alla data del controllo indicata dall'utente quanto indicato, sulla base delle sole informazioni dichiarate dall'utente.",
    );
  }

  if (metadata.checkedSources.length > 0) {
    contextLines.push(`Fonti consultate dichiarate: ${metadata.checkedSources.join("; ")}.`);
  }

  if (metadata.checkedUrl) {
    contextLines.push(`URL consultato dichiarato: ${metadata.checkedUrl}.`);
  }

  return contextLines;
}

function buildRequestSentence(requestKind: FoiaRequestKind, metadata: FoiaDraftMetadata): string {
  if (requestKind === "accesso_civico_semplice") {
    return "Si chiede cortesemente di indicare dove il documento o l'aggiornamento obbligatorio sia pubblicato oppure, se necessario, di fornire indicazioni per renderlo rintracciabile secondo le modalità applicabili.";
  }

  if (requestKind === "accesso_civico_generalizzato") {
    return "Si chiede cortesemente di valutare l'accesso alla documentazione amministrativa più ampia descritta dall'utente, nei limiti e con le cautele applicabili.";
  }

  if (metadata.checkOutcome === "dato_incompleto" || metadata.checkOutcome === "chiarimento_puntuale") {
    return "Si chiede cortesemente un chiarimento puntuale sulle informazioni disponibili, senza assumere che il dato parziale dipenda da una causa specifica.";
  }

  return "Si chiede cortesemente di valutare la forma più corretta della richiesta e di fornire, se possibile, indicazioni documentali verificabili.";
}

function buildSubject(requestKind: FoiaRequestKind, dataType: string | undefined): string {
  const target = dataType ?? FALLBACK_DATA_TYPE;
  return `Bozza ${REQUEST_KIND_LABELS[requestKind]} — ${target}`;
}

export function buildFoiaDraft(draftCase: FoiaDraftCase): FoiaDraftResult {
  const metadata: FoiaDraftMetadata = {
    sourceModule: cleanText(draftCase.sourceModule),
    dataType: cleanText(draftCase.dataType),
    checkedAt: cleanText(draftCase.checkedAt),
    checkedSources: cleanList(draftCase.checkedSources),
    checkedUrl: cleanText(draftCase.checkedUrl),
    checkOutcome: draftCase.checkOutcome ?? "altro",
    publicationExpectation: draftCase.publicationExpectation ?? "non_specificata",
    requestScope: draftCase.requestScope ?? "da_valutare",
  };

  const requestKind = resolveRequestKind(metadata);
  const subject = buildSubject(requestKind, metadata.dataType);
  const userNote = cleanText(draftCase.note);
  const contextLines = buildCheckedContext(metadata);
  const requestSentence = buildRequestSentence(requestKind, metadata);
  const noteLines = userNote ? ["Nota dell'utente:", userNote, ""] : [];

  const body = [
    "Testo modificabile dall'utente:",
    "si richiede supporto documentale sulla base del seguente controllo civico preliminare.",
    "",
    "Contesto dichiarato:",
    ...contextLines,
    "",
    ...noteLines,
    "Richiesta suggerita:",
    requestSentence,
    "",
    "Cautele:",
    ...DEFAULT_CAUTIONS.map((caution) => `- ${caution}`),
  ].join("\n");

  return {
    requestKind,
    subject,
    body,
    cautions: DEFAULT_CAUTIONS,
    editableFields: {
      requesterName: EMPTY_EDITABLE_VALUE,
      requesterContact: EMPTY_EDITABLE_VALUE,
      recipientOffice: EMPTY_EDITABLE_VALUE,
      requestSubject: subject,
      requestBody: body,
      checkedAt: metadata.checkedAt ?? EMPTY_EDITABLE_VALUE,
      checkedSources: metadata.checkedSources,
      checkedUrl: metadata.checkedUrl ?? EMPTY_EDITABLE_VALUE,
      userNote: userNote ?? EMPTY_EDITABLE_VALUE,
    },
    metadata,
  };
}
