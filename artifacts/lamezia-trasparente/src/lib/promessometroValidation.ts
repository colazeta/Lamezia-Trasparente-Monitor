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

const DEMONSTRATIVE_RESIDUE_PATTERN =
  /\b(template|placeholder|demo|dimostrativ[oa]|fittizi[oa]|modello|esempio|da inserire|da indicare|da censire|sostituire)\b/i;

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

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(timestamp);
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

    if (DEMONSTRATIVE_RESIDUE_PATTERN.test(promise[field])) {
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
