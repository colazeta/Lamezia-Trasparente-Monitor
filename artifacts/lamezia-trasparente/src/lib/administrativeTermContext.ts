export const administrativeTermVerificationStatuses = [
  "documented",
  "partial",
  "needs_source",
] as const;

export type AdministrativeTermVerificationStatus =
  (typeof administrativeTermVerificationStatuses)[number];

export const administrativeTermTypes = [
  "mayor_administration",
  "commissioner_management",
] as const;

export type AdministrativeTermType = (typeof administrativeTermTypes)[number];

export interface AdministrativeTermSourceNote {
  label: string;
  url?: string;
  note?: string;
}

export interface AdministrativeTermContext {
  id: string;
  termType: AdministrativeTermType;
  startsOn: string;
  endsOn: string;
  mayorName?: string;
  commissionerLabel?: string;
  source?: AdministrativeTermSourceNote;
  verificationStatus: AdministrativeTermVerificationStatus;
  verificationNote: string;
}

export interface AdministrativeTermYearLink {
  term: AdministrativeTermContext;
  overlapStartsOn: string;
  overlapEndsOn: string;
}

export interface AnnualAdministrativeTermContext {
  year: number;
  terms: AdministrativeTermYearLink[];
  verificationStatus: AdministrativeTermVerificationStatus;
  note: string;
}

export type AnnualRecordWithYear = {
  year: number;
};

export type AnnualRecordWithAdministrativeTermContext<
  TRecord extends AnnualRecordWithYear,
> = TRecord & {
  administrativeTermContext: AnnualAdministrativeTermContext;
};

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!isoDatePattern.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function compareIsoDates(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

function maxIsoDate(left: string, right: string): string {
  return compareIsoDates(left, right) >= 0 ? left : right;
}

function minIsoDate(left: string, right: string): string {
  return compareIsoDates(left, right) <= 0 ? left : right;
}

function getYearBounds(year: number): { startsOn: string; endsOn: string } {
  return {
    startsOn: `${year}-01-01`,
    endsOn: `${year}-12-31`,
  };
}

function hasDocumentedSource(term: AdministrativeTermContext): boolean {
  return Boolean(
    term.source &&
    (term.source.label.trim().length > 0 || term.source.note?.trim().length),
  );
}

function getMostCautiousStatus(
  statuses: readonly AdministrativeTermVerificationStatus[],
): AdministrativeTermVerificationStatus {
  if (statuses.includes("needs_source")) {
    return "needs_source";
  }

  if (statuses.includes("partial")) {
    return "partial";
  }

  return "documented";
}

export function validateAdministrativeTermContext(
  term: AdministrativeTermContext,
): string[] {
  const issues: string[] = [];

  if (term.id.trim().length === 0) {
    issues.push("id_required");
  }

  if (!isValidIsoDate(term.startsOn)) {
    issues.push("startsOn_invalid");
  }

  if (!isValidIsoDate(term.endsOn)) {
    issues.push("endsOn_invalid");
  }

  if (
    isValidIsoDate(term.startsOn) &&
    isValidIsoDate(term.endsOn) &&
    compareIsoDates(term.startsOn, term.endsOn) > 0
  ) {
    issues.push("date_range_invalid");
  }

  if (
    term.termType === "mayor_administration" &&
    !term.mayorName?.trim().length
  ) {
    issues.push("mayorName_required_for_mayor_administration");
  }

  if (
    term.termType === "commissioner_management" &&
    !term.commissionerLabel?.trim().length
  ) {
    issues.push("commissionerLabel_required_for_commissioner_management");
  }

  if (term.verificationNote.trim().length === 0) {
    issues.push("verificationNote_required");
  }

  if (
    term.verificationStatus !== "needs_source" &&
    !hasDocumentedSource(term)
  ) {
    issues.push("source_required_unless_needs_source");
  }

  return issues;
}

export function getAdministrativeTermsForYear(
  year: number,
  terms: readonly AdministrativeTermContext[],
): AnnualAdministrativeTermContext {
  const yearBounds = getYearBounds(year);
  const linkedTerms = terms
    .filter(
      (term) =>
        validateAdministrativeTermContext(term).length === 0 &&
        compareIsoDates(term.startsOn, yearBounds.endsOn) <= 0 &&
        compareIsoDates(term.endsOn, yearBounds.startsOn) >= 0,
    )
    .map<AdministrativeTermYearLink>((term) => ({
      term,
      overlapStartsOn: maxIsoDate(term.startsOn, yearBounds.startsOn),
      overlapEndsOn: minIsoDate(term.endsOn, yearBounds.endsOn),
    }))
    .sort((left, right) => {
      const byStart = compareIsoDates(
        left.overlapStartsOn,
        right.overlapStartsOn,
      );

      if (byStart !== 0) {
        return byStart;
      }

      return left.term.id.localeCompare(right.term.id);
    });

  if (linkedTerms.length === 0) {
    return {
      year,
      terms: [],
      verificationStatus: "needs_source",
      note: "Nessun contesto di mandato collegato all'annualità: verifica fonte richiesta.",
    };
  }

  return {
    year,
    terms: linkedTerms,
    verificationStatus: getMostCautiousStatus(
      linkedTerms.map((linkedTerm) => linkedTerm.term.verificationStatus),
    ),
    note: "Contesto temporale di mandato collegato all'annualità; non produce valutazioni comparative o attribuzioni personali.",
  };
}

export function attachAdministrativeTermContextToAnnualRecords<
  TRecord extends AnnualRecordWithYear,
>(
  records: readonly TRecord[],
  terms: readonly AdministrativeTermContext[],
): AnnualRecordWithAdministrativeTermContext<TRecord>[] {
  return records.map((record) => ({
    ...record,
    administrativeTermContext: getAdministrativeTermsForYear(
      record.year,
      terms,
    ),
  }));
}
