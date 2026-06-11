import { describe, expect, it } from "vitest";

import {
  evaluateRecordCompleteness,
  type RecordCompletenessField,
} from "../lib/recordCompleteness";

type DemoRecord = {
  title?: string | null;
  reference?: string;
  amount?: number | null;
  active?: boolean | null;
  notes?: string | null;
  tags?: string[];
  optionalReason?: string | null;
};

const requiredFields = [
  "title",
  "reference",
  "amount",
  "active",
] as const satisfies readonly RecordCompletenessField<DemoRecord>[];

describe("evaluateRecordCompleteness", () => {
  it("marks all required fields as present for a complete civic demo record", () => {
    const result = evaluateRecordCompleteness(
      {
        title: "Contratto demo",
        reference: "Atto 1/2026",
        amount: 1250,
        active: true,
      },
      requiredFields,
    );

    expect(result).toEqual({
      isComplete: true,
      presentFields: ["title", "reference", "amount", "active"],
      missingFields: [],
      emptyFields: [],
      notApplicableFields: [],
      fields: [
        { key: "title", status: "present" },
        { key: "reference", status: "present" },
        { key: "amount", status: "present" },
        { key: "active", status: "present" },
      ],
    });
  });

  it("classifies absent keys and undefined values as missing", () => {
    const result = evaluateRecordCompleteness(
      {
        title: "Scheda demo",
        reference: undefined,
        active: true,
      },
      requiredFields,
    );

    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toEqual(["reference", "amount"]);
    expect(result.emptyFields).toEqual([]);
    expect(result.fields).toEqual([
      { key: "title", status: "present" },
      { key: "reference", status: "missing" },
      { key: "amount", status: "missing" },
      { key: "active", status: "present" },
    ]);
  });

  it("classifies null, empty strings and whitespace-only strings as empty", () => {
    const result = evaluateRecordCompleteness(
      {
        title: "",
        reference: "  \n\t ",
        amount: null,
        active: true,
      },
      requiredFields,
    );

    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toEqual([]);
    expect(result.emptyFields).toEqual(["title", "reference", "amount"]);
    expect(result.fields).toEqual([
      { key: "title", status: "empty" },
      { key: "reference", status: "empty" },
      { key: "amount", status: "empty" },
      { key: "active", status: "present" },
    ]);
  });

  it("preserves 0 and false as present values", () => {
    const result = evaluateRecordCompleteness(
      {
        title: "Procedura demo",
        reference: "Atto 2/2026",
        amount: 0,
        active: false,
      },
      requiredFields,
    );

    expect(result.isComplete).toBe(true);
    expect(result.presentFields).toEqual([
      "title",
      "reference",
      "amount",
      "active",
    ]);
    expect(result.missingFields).toEqual([]);
    expect(result.emptyFields).toEqual([]);
  });

  it("uses caller predicates for non-string empty values such as empty arrays", () => {
    const result = evaluateRecordCompleteness(
      {
        title: "Elenco demo",
        tags: [],
      },
      [
        "title",
        {
          key: "tags",
          isEmpty: (value) => Array.isArray(value) && value.length === 0,
        },
      ] as const satisfies readonly RecordCompletenessField<DemoRecord>[],
    );

    expect(result.isComplete).toBe(false);
    expect(result.presentFields).toEqual(["title"]);
    expect(result.emptyFields).toEqual(["tags"]);
    expect(result.fields).toEqual([
      { key: "title", status: "present" },
      { key: "tags", status: "empty" },
    ]);
  });

  it("marks fields as not applicable only when the caller declares it", () => {
    const result = evaluateRecordCompleteness(
      {
        title: "Scheda senza importo applicabile",
        reference: "Atto 3/2026",
        amount: null,
        active: false,
        optionalReason: "Importo non previsto nel caso demo",
      },
      [
        "title",
        "reference",
        {
          key: "amount",
          isNotApplicable: (record) => Boolean(record.optionalReason),
        },
        "active",
      ] as const satisfies readonly RecordCompletenessField<DemoRecord>[],
    );

    expect(result.isComplete).toBe(true);
    expect(result.presentFields).toEqual(["title", "reference", "active"]);
    expect(result.emptyFields).toEqual([]);
    expect(result.notApplicableFields).toEqual(["amount"]);
    expect(result.fields).toEqual([
      { key: "title", status: "present" },
      { key: "reference", status: "present" },
      { key: "amount", status: "not-applicable" },
      { key: "active", status: "present" },
    ]);
  });

  it("does not mutate the source record", () => {
    const record: DemoRecord = {
      title: "Record immutabile",
      reference: "Atto 4/2026",
      amount: 10,
      active: true,
    };
    const before = structuredClone(record);

    evaluateRecordCompleteness(record, requiredFields);

    expect(record).toEqual(before);
  });
});
