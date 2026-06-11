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
  "La bozza descrive solo quanto dichiarato dall'utente nel controllo e non attribuisce intenzioni, cause o condotte individuali.",
  "Evitare riferimenti personali o dati non necessari; integrare solo informazioni verificabili e pertinenti.",
  "Verificare separatamente eventuali riferimenti normativi e termini applicabili prima dell'uso esterno.",
] as const;

const EMPTY_EDITABLE_VALUE = "";
const FALLBACK_DATA_TYPE = "informazione o documento indicato dall'utente";
const FALLBACK_MODULE = "contesto di monitoraggio indicato dall'utente";
const NEUTRALIZED_DATA_TYPE = "informazione o documento da descrivere in termini neutrali";
const NEUTRALIZED_MODULE = "contesto da descrivere in termini neutrali";
const NEUTRALIZED_SOURCE = "fonte dichiarata da verificare con formulazione neutrale";
const NEUTRALIZED_URL = "URL dichiarato da verificare con formulazione neutrale";
const NEUTRALIZED_NOTE =
  "Nota dell'utente da riformulare in termini documentali neutrali prima dell'eventuale uso esterno.";

const MISCONDUCT_PATTERN =
  /\b(?:corruzion\w*|illecit\w*|illegal\w*|violazion\w*|omission\w*|favoritism\w*|clientel\w*|collusion\w*|mafios\w*|mafia|infiltrazion\w*|responsabilit[aà]\w*|colpevol\w*|abuso|abusi|frode|frodi|truffa|truffe)\b/i;

function cleanText(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized ? normalized : undefined;
}

function neutralizeMisconductText(
  value: string | undefined,
  neutralValue: string,
): string | undefined {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return undefined;
  }

  return MISCONDUCT_PATTERN.test(cleaned) ? neutralValue : cleaned;
}

function cleanList(values: readonly string[] | undefined): string[] {
  return values
    ?.map((value) => neutralizeMisconductText(value, NEUTRALIZED_SOURCE))
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

function formatCheckedAt(metadata: FoiaDraftMetadata): string {
  return metadata.checkedAt
    ? `alla data del controllo dichiarata (${metadata.checkedAt})`
    : "alla data del controllo indicata dall'utente";
}

function buildOutcomeContext(metadata: FoiaDraftMetadata): string {
  const checkedAt = formatCheckedAt(metadata);

  switch (metadata.checkOutcome) {
    case "documento_non_rintracciato":
      return `Il controllo dichiarato segnala che il documento indicato non è stato rintracciato ${checkedAt}, sulla base delle sole informazioni dichiarate dall'utente.`;
    case "aggiornamento_non_rintracciato":
      return `Il controllo dichiarato segnala che l'aggiornamento atteso del documento indicato non è stato rintracciato ${checkedAt}, sulla base delle sole informazioni dichiarate dall'utente.`;
    case "dato_incompleto":
      return `Il controllo dichiarato descrive un dato parziale o non completo ${checkedAt}; la bozza serve solo a chiedere indicazioni documentali o integrazioni disponibili.`;
    case "chiarimento_puntuale":
      return `Il controllo dichiarato richiede un chiarimento circoscritto ${checkedAt}, senza assumere che manchi un documento obbligatorio.`;
    case "documentazione_ampia":
      return `Il controllo dichiarato riguarda documentazione amministrativa ampia ${checkedAt}; la bozza serve a delimitare una richiesta documentale nei limiti applicabili.`;
    case "altro":
      return `Il controllo dichiarato ha un esito da valutare ${checkedAt}; la bozza non qualifica il caso oltre le informazioni fornite dall'utente.`;
  }
}

function buildCheckedContext(metadata: FoiaDraftMetadata): string[] {
  const contextLines = [
    `Modulo o contesto dichiarato: ${metadata.sourceModule ?? FALLBACK_MODULE}.`,
    `Informazione o documento di interesse: ${metadata.dataType ?? FALLBACK_DATA_TYPE}.`,
    buildOutcomeContext(metadata),
  ];

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
    sourceModule: neutralizeMisconductText(draftCase.sourceModule, NEUTRALIZED_MODULE),
    dataType: neutralizeMisconductText(draftCase.dataType, NEUTRALIZED_DATA_TYPE),
    checkedAt: cleanText(draftCase.checkedAt),
    checkedSources: cleanList(draftCase.checkedSources),
    checkedUrl: neutralizeMisconductText(draftCase.checkedUrl, NEUTRALIZED_URL),
    checkOutcome: draftCase.checkOutcome ?? "altro",
    publicationExpectation: draftCase.publicationExpectation ?? "non_specificata",
    requestScope: draftCase.requestScope ?? "da_valutare",
  };

  const requestKind = resolveRequestKind(metadata);
  const subject = buildSubject(requestKind, metadata.dataType);
  const userNote = neutralizeMisconductText(draftCase.note, NEUTRALIZED_NOTE);
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
