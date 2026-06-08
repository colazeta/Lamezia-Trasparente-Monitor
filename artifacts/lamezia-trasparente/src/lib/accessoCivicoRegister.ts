export type FoiaRequestType = "semplice" | "generalizzato" | "integrazione";

export type FoiaSourceModule =
  | "atti"
  | "contratti"
  | "cig-cup"
  | "liquidazioni"
  | "pnrr"
  | "organi"
  | "pubblicazioni";

export type FoiaRegisterStatus =
  | "bozza"
  | "inviata"
  | "in attesa"
  | "risposta ricevuta"
  | "diniego"
  | "silenzio"
  | "riesame"
  | "chiusa";

export type FoiaDeadlineFilter = "all" | "upcoming" | "overdue" | "no-deadline";

export type FoiaLinkedContext = {
  label: string;
  kind: "atto" | "progetto" | "criticita" | "documento";
};

export type FoiaRegisterPublicFields = {
  requestId: string;
  creationDate: string;
  sentDate?: string;
  subject: string;
  requestType: FoiaRequestType;
  recipientOffice: string;
  sourceModule: FoiaSourceModule;
  linkedContext?: FoiaLinkedContext;
  status: FoiaRegisterStatus;
  estimatedDeadline?: string;
  outcome?: string;
  publicNotes?: string;
};

export type FoiaRegisterPrivateFields = {
  requesterName?: string;
  requesterContact?: string;
  privateNotes?: string;
};

export type FoiaRegisterEntry = {
  publicFields: FoiaRegisterPublicFields;
  privateFields?: FoiaRegisterPrivateFields;
};

export type FoiaRegisterAdapter = {
  name: string;
  persistence: "not-configured" | "application-storage";
  description: string;
  list(): Promise<FoiaRegisterEntry[]>;
  createDraft(entry: FoiaRegisterEntry): Promise<FoiaRegisterEntry>;
};

export const foiaRegisterStatuses: FoiaRegisterStatus[] = [
  "bozza",
  "inviata",
  "in attesa",
  "risposta ricevuta",
  "diniego",
  "silenzio",
  "riesame",
  "chiusa",
];

export const foiaSourceModuleLabels: Record<FoiaSourceModule, string> = {
  atti: "Atti e provvedimenti",
  contratti: "Contratti e convenzioni",
  "cig-cup": "CIG/CUP e progetti",
  liquidazioni: "Liquidazioni",
  pnrr: "PNRR",
  organi: "Organi e sedute",
  pubblicazioni: "Pubblicazioni e allegati",
};

export const foiaRequestTypeLabels: Record<FoiaRequestType, string> = {
  semplice: "Accesso civico semplice",
  generalizzato: "Accesso civico generalizzato",
  integrazione: "Integrazione o chiarimento",
};

export const foiaDeadlineFilterLabels: Record<FoiaDeadlineFilter, string> = {
  all: "Tutte le scadenze",
  upcoming: "Scadenze prossime",
  overdue: "Da verificare perché superate",
  "no-deadline": "Senza scadenza stimata",
};

export const foiaRegisterAdapter: FoiaRegisterAdapter = {
  name: "foia-register-adapter-v0",
  persistence: "not-configured",
  description:
    "Punto di integrazione per collegare il registro FOIA a uno storage applicativo verificato. In questa v0 pubblica la pagina usa dati seed e bozze nella sola sessione React, senza localStorage e senza invio PEC/email.",
  async list() {
    return seedFoiaRegisterEntries;
  },
  async createDraft(entry) {
    return entry;
  },
};

export const seedFoiaRegisterEntries: FoiaRegisterEntry[] = [
  {
    publicFields: {
      requestId: "FOIA-2026-001",
      creationDate: "2026-06-06",
      sentDate: "2026-06-06",
      subject:
        "Richiesta stato di avanzamento progetto PNRR: [titolo progetto]",
      requestType: "generalizzato",
      recipientOffice: "Responsabile della trasparenza / Ufficio competente",
      sourceModule: "pnrr",
      status: "in attesa",
      estimatedDeadline: calculateIndicativeDeadline("2026-06-06"),
      outcome: "In attesa di riscontro.",
      linkedContext: {
        label: "[CUP/progetto da verificare]",
        kind: "progetto",
      },
      publicNotes:
        "Voce dimostrativa non collegata a storage applicativo: verificare destinatario, riferimenti e data di invio effettiva.",
    },
  },
  {
    publicFields: {
      requestId: "FOIA-2026-002",
      creationDate: "2026-06-06",
      subject: "Bozza richiesta integrazione documento non accessibile: [atto]",
      requestType: "integrazione",
      recipientOffice: "Responsabile della trasparenza / Ufficio competente",
      sourceModule: "pubblicazioni",
      status: "bozza",
      outcome: "Bozza non inviata.",
      linkedContext: {
        label: "[atto/documento]",
        kind: "documento",
      },
      publicNotes:
        "La voce resta una traccia di lavoro: nessuna comunicazione ufficiale è stata inviata dal portale.",
    },
  },
];

function parseDateOnlyUtc(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);

  if (
    Number.isNaN(time) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return date;
}

function formatDateOnlyUtc(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calculateIndicativeDeadline(sentDate: string, days = 30) {
  const date = parseDateOnlyUtc(sentDate);
  if (!date) return undefined;
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateOnlyUtc(date);
}

export function formatFoiaDate(value: string | undefined) {
  if (!value) return "—";
  const date = parseDateOnlyUtc(value);
  return date
    ? new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      }).format(date)
    : value;
}

function daysUntil(dateValue: string, today: string) {
  const target = parseDateOnlyUtc(dateValue)?.getTime();
  const current = parseDateOnlyUtc(today)?.getTime();
  if (target === undefined || current === undefined) return undefined;
  return Math.ceil((target - current) / 86_400_000);
}

export function matchesFoiaDeadlineFilter(
  entry: FoiaRegisterEntry,
  filter: FoiaDeadlineFilter,
  today: string,
) {
  if (filter === "all") return true;
  const deadline = entry.publicFields.estimatedDeadline;
  if (!deadline) return filter === "no-deadline";
  const diff = daysUntil(deadline, today);
  if (diff === undefined) return filter === "no-deadline";
  if (filter === "upcoming") return diff >= 0 && diff <= 14;
  if (filter === "overdue") return diff < 0;
  return true;
}
