export type RecordCompletenessStatus =
  | "present"
  | "missing"
  | "empty"
  | "not-applicable";

export type RecordCompletenessRule<T extends object, K extends keyof T = keyof T> = {
  key: K;
  isEmpty?: (value: T[K], record: T) => boolean;
  isNotApplicable?: (record: T) => boolean;
};

export type RecordCompletenessField<T extends object, K extends keyof T = keyof T> =
  | K
  | RecordCompletenessRule<T, K>;

export type RecordCompletenessFieldStatus<
  T extends object,
  K extends keyof T = keyof T,
> = {
  key: K;
  status: RecordCompletenessStatus;
};

export type RecordCompletenessResult<
  T extends object,
  K extends keyof T = keyof T,
> = {
  isComplete: boolean;
  presentFields: K[];
  missingFields: K[];
  emptyFields: K[];
  notApplicableFields: K[];
  fields: RecordCompletenessFieldStatus<T, K>[];
};

const hasOwn = <T extends object, K extends PropertyKey>(
  record: T,
  key: K,
): boolean => Object.prototype.hasOwnProperty.call(record, key);

const normalizeRule = <T extends object, K extends keyof T>(
  field: RecordCompletenessField<T, K>,
): RecordCompletenessRule<T, K> =>
  typeof field === "object" && field !== null && "key" in field
    ? field
    : { key: field };

const isDefaultEmptyValue = (value: unknown): boolean => {
  if (value === null) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  return false;
};

export function evaluateRecordCompleteness<
  T extends object,
  K extends keyof T = keyof T,
>(
  record: T,
  requiredFields: readonly RecordCompletenessField<T, K>[],
): RecordCompletenessResult<T, K> {
  const presentFields: K[] = [];
  const missingFields: K[] = [];
  const emptyFields: K[] = [];
  const notApplicableFields: K[] = [];
  const fields: RecordCompletenessFieldStatus<T, K>[] = [];

  for (const field of requiredFields) {
    const rule = normalizeRule(field);
    const { key } = rule;
    let status: RecordCompletenessStatus;

    if (rule.isNotApplicable?.(record)) {
      status = "not-applicable";
      notApplicableFields.push(key);
    } else if (!hasOwn(record, key) || record[key] === undefined) {
      status = "missing";
      missingFields.push(key);
    } else if (
      isDefaultEmptyValue(record[key]) ||
      rule.isEmpty?.(record[key], record) === true
    ) {
      status = "empty";
      emptyFields.push(key);
    } else {
      status = "present";
      presentFields.push(key);
    }

    fields.push({ key, status });
  }

  return {
    isComplete: missingFields.length === 0 && emptyFields.length === 0,
    presentFields,
    missingFields,
    emptyFields,
    notApplicableFields,
    fields,
  };
}
