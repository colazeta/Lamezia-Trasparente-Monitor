import type { ProgrammePromise } from "@/data/promessometro";

export type PromessometroValidationField =
  | "sourcePromiseSummary"
  | "sourceLink"
  | "sourceDate"
  | "sourceLabel"
  | "mandateReference"
  | "implementationStatus"
  | "cautionNote"
  | "lastVerification"
  | "missingForObservableImplementation";

export interface PromessometroValidationIssue {
  promiseId: string;
  field: PromessometroValidationField;
  message: string;
}

export interface PromessometroValidationResult {
  realRecordCount: number;
  placeholderCount: number;
  issues: PromessometroValidationIssue[];
}

const MODEL_RECORD_RESIDUE_PHRASES = [
  "questo record è un modello redazionale, non una promessa reale",
  "va sostituito con un estratto da programma elettorale",
  "fonte programmatica da indicare prima della pubblicazione",
  "mandato/amministrazione da indicare nella scheda reale",
  "record dimostrativo escluso dai conteggi documentali",
  "esempio di collegamento da sostituire",
  "da inserire dopo verifica documentale",
] as const;

const REQUIRED_TEXT_FIELDS = [
  "sourcePromiseSummary",
  "sourceLabel",
  "mandateReference",
  "cautionNote",
  "missingForObservableImplementation",
] as const satisfies readonly PromessometroValidationField[];

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoDate(value: string | undefined): boolean {
  if (!hasText(value)) {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isHttpUrl(value: string | undefined): boolean {
  if (!hasText(value)) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function containsModelRecordResidue(value: string): boolean {
  const normalizedValue = value.trim().toLocaleLowerCase("it-IT");

  return MODEL_RECORD_RESIDUE_PHRASES.some((phrase) =>
    normalizedValue.includes(phrase.toLocaleLowerCase("it-IT")),
  );
}

function pushIssue(
  issues: PromessometroValidationIssue[],
  promise: ProgrammePromise,
  field: PromessometroValidationField,
  message: string,
) {
  issues.push({
    promiseId: promise.id,
    field,
    message,
  });
}

function validateRequiredTextFields(
  promise: ProgrammePromise,
  issues: PromessometroValidationIssue[],
) {
  for (const field of REQUIRED_TEXT_FIELDS) {
    if (!hasText(promise[field])) {
      pushIssue(
        issues,
        promise,
        field,
        "Campo obbligatorio per una promessa reale.",
      );
      continue;
    }

    if (containsModelRecordResidue(promise[field])) {
      pushIssue(
        issues,
        promise,
        field,
        "Il record reale contiene testo modello/dimostrativo residuo.",
      );
    }
  }
}

export function isRealProgrammePromise(promise: ProgrammePromise): boolean {
  return promise.isPlaceholder !== true;
}

export function getRealProgrammePromises(
  promises: readonly ProgrammePromise[],
): ProgrammePromise[] {
  return promises.filter(isRealProgrammePromise);
}

export function validatePromessometroRealRecords(
  promises: readonly ProgrammePromise[],
): PromessometroValidationResult {
  const issues: PromessometroValidationIssue[] = [];
  const placeholderCount = promises.filter(
    (promise) => promise.isPlaceholder === true,
  ).length;
  const realPromises = getRealProgrammePromises(promises);

  for (const promise of realPromises) {
    validateRequiredTextFields(promise, issues);

    if (!isHttpUrl(promise.sourceLink)) {
      pushIssue(
        issues,
        promise,
        "sourceLink",
        "La fonte della promessa deve essere un URL http(s) verificabile.",
      );
    }

    if (!isIsoDate(promise.sourceDate)) {
      pushIssue(
        issues,
        promise,
        "sourceDate",
        "La data fonte deve essere compilata in formato YYYY-MM-DD.",
      );
    }

    if (!hasText(promise.implementationStatus)) {
      pushIssue(
        issues,
        promise,
        "implementationStatus",
        "Lo stato documentale è obbligatorio per una promessa reale.",
      );
    }

    if (!isIsoDate(promise.lastVerification)) {
      pushIssue(
        issues,
        promise,
        "lastVerification",
        "L'ultimo aggiornamento deve essere compilato in formato YYYY-MM-DD.",
      );
    }
  }

  return {
    realRecordCount: realPromises.length,
    placeholderCount,
    issues,
  };
}
