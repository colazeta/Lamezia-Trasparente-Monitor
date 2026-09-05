import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateLtcedsSourceDisposition,
  sourceMaySolelySupportPublicEvent,
  type LtcedsSourceDefinition,
} from "./ltceds-source-registry";

const baseSource: LtcedsSourceDefinition = {
  sourceId: "synthetic-source",
  name: "Synthetic source",
  authorityType: "public_authority_primary",
  acquisitionMode: "manual",
  contentMode: "narrative",
  evidenceRole: "occurrence_primary",
  candidatePolicy: "automatic",
  publicationSupport: "primary_possible",
  reuseStatus: "manual_review",
  personalDataRisk: "medium",
  reputationalRisk: "medium",
  requiresCorroboration: false,
  limitations: ["Synthetic fixture only."],
};

test("disabled source policy fails closed at policy evaluation", () => {
  const source: LtcedsSourceDefinition = {
    ...baseSource,
    candidatePolicy: "disabled",
  };

  assert.equal(evaluateLtcedsSourceDisposition(source), "disabled");
  assert.equal(sourceMaySolelySupportPublicEvent(source), false);
});

test("context-only evidence cannot solely support a public event", () => {
  const source: LtcedsSourceDefinition = {
    ...baseSource,
    evidenceRole: "context_only",
    publicationSupport: "context_only",
  };

  assert.equal(evaluateLtcedsSourceDisposition(source), "context_only");
  assert.equal(sourceMaySolelySupportPublicEvent(source), false);
});
