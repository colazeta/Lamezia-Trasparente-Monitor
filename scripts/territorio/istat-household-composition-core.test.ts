import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateHouseholdComposition,
  assertPublishableHouseholdComposition,
  type HouseholdCensusRow,
} from "./istat-household-composition-core";

const completeRows: HouseholdCensusRow[] = [
  {
    sectionId: "0791600000001",
    PF1: 100,
    PF3: 30,
    PF4: 25,
    PF5: 20,
    PF6: 15,
    PF7: 7,
    PF8: 3,
  },
  {
    sectionId: "0791600000002",
    PF1: 50,
    PF3: 20,
    PF4: 10,
    PF5: 8,
    PF6: 7,
    PF7: 3,
    PF8: 2,
  },
];

test("aggregates PF3-PF8 and reconciles exactly to PF1", () => {
  const profile = aggregateHouseholdComposition(completeRows);

  assert.equal(profile.totalHouseholds, 150);
  assert.deepEqual(
    profile.byComponents.map(({ key, households }) => ({ key, households })),
    [
      { key: "1", households: 50 },
      { key: "2", households: 35 },
      { key: "3", households: 28 },
      { key: "4", households: 22 },
      { key: "5", households: 10 },
      { key: "6+", households: 5 },
    ],
  );
  assert.equal(profile.indicators.onePersonHouseholds, 50);
  assert.equal(profile.indicators.onePersonShare, 33.3);
  assert.equal(profile.indicators.fivePlusHouseholds, 15);
  assert.equal(profile.indicators.fivePlusShare, 10);
  assert.equal(profile.quality.reconciliationDifference, 0);
  assert.equal(profile.quality.exactReconciliation, true);
  assert.doesNotThrow(() => assertPublishableHouseholdComposition(profile));
});

test("excludes explicitly marked fictitious census sections", () => {
  const profile = aggregateHouseholdComposition([
    ...completeRows,
    {
      sectionId: "0791608888881",
      isFictitious: true,
      PF1: 5,
      PF3: 5,
      PF4: 0,
      PF5: 0,
      PF6: 0,
      PF7: 0,
      PF8: 0,
    },
  ]);

  assert.equal(profile.totalHouseholds, 150);
  assert.equal(profile.quality.skippedFictitiousRows, 1);
});

test("rejects a row without a census-section identifier", () => {
  assert.throws(
    () =>
      aggregateHouseholdComposition([
        {
          ...completeRows[0],
          sectionId: null,
        },
      ]),
    /missing its section identifier/i,
  );
});

test("rejects rows outside municipality 079160", () => {
  assert.throws(
    () =>
      aggregateHouseholdComposition([
        {
          ...completeRows[0],
          sectionId: "0790230000001",
        },
      ]),
    /outside municipality 079160/i,
  );
});

test("does not publish a profile with an unexplained PF1 residual", () => {
  const profile = aggregateHouseholdComposition([
    {
      sectionId: "0791600000001",
      PF1: 100,
      PF3: 30,
      PF4: 25,
      PF5: 20,
      PF6: 10,
      PF7: 7,
      PF8: 3,
    },
  ]);

  assert.equal(profile.quality.reconciliationDifference, -5);
  assert.equal(profile.quality.exactReconciliation, false);
  assert.throws(
    () => assertPublishableHouseholdComposition(profile),
    /does not reconcile with PF1/i,
  );
});

test("keeps incomplete rows visible in QA instead of coercing null to zero", () => {
  const profile = aggregateHouseholdComposition([
    ...completeRows,
    {
      sectionId: "0791600000003",
      PF1: 20,
      PF3: 10,
      PF4: null,
      PF5: 4,
      PF6: 3,
      PF7: 2,
      PF8: 1,
    },
  ]);

  assert.equal(profile.totalHouseholds, 150);
  assert.equal(profile.quality.incompleteRows, 1);
  assert.throws(
    () => assertPublishableHouseholdComposition(profile),
    /incomplete census rows/i,
  );
});
