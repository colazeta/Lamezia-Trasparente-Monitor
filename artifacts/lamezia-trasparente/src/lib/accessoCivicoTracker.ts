export type AccessRequestStatus =
  | "draft"
  | "ready_to_send"
  | "sent"
  | "answered"
  | "partially_answered"
  | "rejected"
  | "expired"
  | "needs_follow_up";

export type CivicAccessRequestKind =
  | "accesso_civico_semplice"
  | "accesso_civico_generalizzato";

export type MissingEvidenceTriggerKind =
  | "seduta_non_rilevata"
  | "verbale_resoconto_non_rilevato"
  | "dataset_open_data_assente_o_non_aggiornato"
  | "cup_cig_non_riconciliato"
  | "atto_citato_documento_non_raggiungibile";

export interface MissingEvidenceTrigger {
  kind: MissingEvidenceTriggerKind;
  sourceLabel: string;
  missingEvidenceLabel: string;
  observedAt: string;
  sourceUrl?: string;
  contextNote?: string;
  expectedPublication?: "obbligatoria" | "da_verificare" | "non_specificata";
}

export interface CivicAccessRequestTemplate {
  id: CivicAccessRequestKind;
  title: string;
  genericRecipient: string;
  institutionalOpening: string;
  requestIntro: string;
  closingCaution: string;
  defaultStatus: AccessRequestStatus;
}

export interface CivicAccessRequest {
  id: string;
  kind: CivicAccessRequestKind;
  subject: string;
  missingSource: string;
  request: string;
  genericRecipient: string;
  status: AccessRequestStatus;
  linkedTrigger: MissingEvidenceTrigger;
  createdAt: string;
}

export interface AccessRequestTrackerEntry {
  request: CivicAccessRequest;
  status: AccessRequestStatus;
  statusNote: string;
  updatedAt: string;
}

export const accessRequestStatuses: readonly AccessRequestStatus[] = [
  "draft",
  "ready_to_send",
  "sent",
  "answered",
  "partially_answered",
  "rejected",
  "expired",
  "needs_follow_up",
] as const;

export const civicAccessRequestTemplates: Record<
  CivicAccessRequestKind,
  CivicAccessRequestTemplate
> = {
  accesso_civico_semplice: {
    id: "accesso_civico_semplice",
    title: "Accesso civico semplice",
    genericRecipient: "Responsabile della trasparenza / Ufficio competente",
    institutionalOpening:
      "Con tono collaborativo si chiede di verificare la disponibilità del documento o dell'informazione indicata.",
    requestIntro:
      "Si richiede la pubblicazione, l'indicazione del collegamento raggiungibile o un cortese riscontro sullo stato di aggiornamento.",
    closingCaution:
      "La richiesta resta una bozza da verificare prima dell'invio e non implica valutazioni su cause, responsabilità o completezza delle fonti.",
    defaultStatus: "draft",
  },
  accesso_civico_generalizzato: {
    id: "accesso_civico_generalizzato",
    title: "Accesso civico generalizzato",
    genericRecipient: "Ufficio competente per l'accesso civico",
    institutionalOpening:
      "Con tono rispettoso si chiede supporto documentale sul vuoto informativo rilevato nel monitoraggio civico.",
    requestIntro:
      "Si richiede copia, riferimento pubblico o indicazione dell'eventuale ufficio competente per la verifica documentale.",
    closingCaution:
      "La richiesta è una bozza di lavoro, non costituisce consulenza legale e non presuppone irregolarità o omissioni intenzionali.",
    defaultStatus: "draft",
  },
} as const;

const TRIGGER_SUBJECTS: Record<MissingEvidenceTriggerKind, string> = {
  seduta_non_rilevata: "seduta non rilevata",
  verbale_resoconto_non_rilevato: "verbale o resoconto non rilevato",
  dataset_open_data_assente_o_non_aggiornato:
    "dataset open data assente o non aggiornato",
  cup_cig_non_riconciliato: "CUP/CIG non riconciliato",
  atto_citato_documento_non_raggiungibile:
    "atto citato con documento non raggiungibile",
};

function normalizeText(value: string | undefined, fallback: string): string {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || fallback;
}

function normalizeDateOnly(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "data da verificare";
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);

  return slug || "richiesta";
}

export function selectAccessRequestTemplate(
  trigger: MissingEvidenceTrigger,
): CivicAccessRequestTemplate {
  if (trigger.expectedPublication === "obbligatoria") {
    return civicAccessRequestTemplates.accesso_civico_semplice;
  }

  return civicAccessRequestTemplates.accesso_civico_generalizzato;
}

export function createCivicAccessRequest(
  trigger: MissingEvidenceTrigger,
  createdAt = trigger.observedAt,
): CivicAccessRequest {
  const template = selectAccessRequestTemplate(trigger);
  const sourceLabel = normalizeText(trigger.sourceLabel, "fonte da verificare");
  const missingEvidenceLabel = normalizeText(
    trigger.missingEvidenceLabel,
    "documento o informazione da verificare",
  );
  const contextNote = normalizeText(trigger.contextNote, "");
  const triggerLabel = TRIGGER_SUBJECTS[trigger.kind];
  const observedAt = normalizeDateOnly(trigger.observedAt);
  const subject = `${template.title} — ${triggerLabel}: ${missingEvidenceLabel}`;
  const sourceUrl = normalizeText(trigger.sourceUrl, "");
  const sourceLine = sourceUrl ? `${sourceLabel} (${sourceUrl})` : sourceLabel;

  const requestLines = [
    template.institutionalOpening,
    `Vuoto documentale rilevato: ${missingEvidenceLabel}.`,
    `Fonte o contesto collegato: ${sourceLine}.`,
    `Data del controllo dichiarata: ${observedAt}.`,
    contextNote ? `Nota di contesto: ${contextNote}.` : undefined,
    template.requestIntro,
    template.closingCaution,
  ].filter((line): line is string => Boolean(line));

  return {
    id: `car-${slugify(`${trigger.kind}-${missingEvidenceLabel}-${observedAt}`)}`,
    kind: template.id,
    subject,
    missingSource: sourceLine,
    request: requestLines.join("\n"),
    genericRecipient: template.genericRecipient,
    status: template.defaultStatus,
    linkedTrigger: {
      kind: trigger.kind,
      sourceLabel,
      missingEvidenceLabel,
      observedAt,
      ...(sourceUrl ? { sourceUrl } : {}),
      ...(contextNote ? { contextNote } : {}),
      ...(trigger.expectedPublication
        ? { expectedPublication: trigger.expectedPublication }
        : {}),
    },
    createdAt: normalizeDateOnly(createdAt),
  };
}

export function createAccessRequestTrackerEntry(
  trigger: MissingEvidenceTrigger,
  updatedAt = trigger.observedAt,
): AccessRequestTrackerEntry {
  const request = createCivicAccessRequest(trigger, updatedAt);

  return {
    request,
    status: request.status,
    statusNote:
      "Bozza generata per verifica umana: nessun invio automatico è stato effettuato.",
    updatedAt: normalizeDateOnly(updatedAt),
  };
}
