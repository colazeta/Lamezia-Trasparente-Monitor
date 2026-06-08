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

export function calculateIndicativeDeadline(sentDate: string, days = 30) {
  const date = new Date(`${sentDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatFoiaDate(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
}

function daysUntil(dateValue: string, today: string) {
  const target = new Date(`${dateValue}T00:00:00`).getTime();
  const current = new Date(`${today}T00:00:00`).getTime();
  if (Number.isNaN(target) || Number.isNaN(current)) return undefined;
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
