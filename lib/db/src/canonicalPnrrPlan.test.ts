import assert from "node:assert/strict";
import test from "node:test";
import { generateCanonicalUuidV7 } from "./canonicalIdentity";
import {
  buildCanonicalPnrrPlan,
  normalizedReportedCup,
  type PnrrRegistryRecord,
} from "./canonicalPnrrPlan";

const CUP = "C81C22001090006";
function record(patch: Record<string, unknown> = {}): PnrrRegistryRecord {
  return {
    id: generateCanonicalUuidV7(),
    collection_key: "projects",
    native_key: "1",
    legacy_id: 1,
    payload: {
      source_id: "1",
      source_url:
        "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr/1",
      title: "Progetto comunale",
      cup: CUP,
      amount_eur: 0,
      attachments: [],
      ...patch,
    },
  };
}
const opencup = {
  source_url: `https://www.opencup.gov.it/portale/it/web/opencup/home/progetto/-/cup/${CUP}`,
  cup: CUP,
  title: "Titolo nella fonte OpenCUP",
  total_cost_eur: 200,
  public_funding_eur: 150,
  cup_status: "ATTIVO",
};

test("missing and malformed CUPs keep evidence and explicit outcomes without synthetic projects", () => {
  const plan = buildCanonicalPnrrPlan([
    record({ cup: null }),
    record({ cup: "C81C220 01090006" }),
  ]);
  assert.equal(plan.projects.length, 0);
  assert.equal(plan.mappings.length, 0);
  assert.ok(plan.assertions.length > 0);
  assert.deepEqual(
    plan.outcomes.map((o) => o.status),
    ["insufficient_evidence", "review_required"],
  );
  assert.ok(plan.outcomes.every((o) => o.target_subject_id === null));
  assert.equal(normalizedReportedCup(" c81c22001090006 "), CUP);
});

test("qualified identifiers reuse stable identities, retain both source records and never merge by title", () => {
  const identity = generateCanonicalUuidV7();
  const first = record();
  const second = {
    ...record({ title: "Una descrizione diversa" }),
    native_key: "2",
    legacy_id: 2,
  };
  const third = {
    ...record({ cup: "C81C22001090007" }),
    native_key: "3",
    legacy_id: 3,
  };
  const plan = buildCanonicalPnrrPlan(
    [first, second, third],
    [{ value: CUP, project_id: identity }],
  );
  assert.equal(plan.projects.length, 2);
  assert.equal(plan.projects.find((p) => p.cup === CUP)?.id, identity);
  assert.equal(
    plan.mappings.filter((m) => m.project_id === identity).length,
    2,
  );
  assert.equal(plan.outcomes.length, 3);
  assert.equal(
    plan.fields.find((f) => f.project_id === identity && f.field === "title")
      ?.alternative_count,
    1,
  );
});

test("cost, funding, CUP status and execution status keep distinct meanings and provenance", () => {
  const plan = buildCanonicalPnrrPlan([
    record({ opencup, status: null, amount_eur: 0 }),
  ]);
  const p = plan.projects[0] as Record<string, unknown>;
  assert.equal(p.financed_amount, "0.00");
  assert.equal(p.opencup_total_cost, "200.00");
  assert.equal(p.opencup_public_funding, "150.00");
  assert.equal(p.execution_status, null);
  assert.equal(p.cup_status, "ATTIVO");
  assert.equal(p.title, "Progetto comunale");
  assert.equal(
    plan.fields.find((f) => f.field === "title")?.alternative_count,
    1,
  );
  assert.equal(
    plan.fields.find((f) => f.field === "financed_amount")?.assertion_pointer,
    "/amount_eur",
  );
  assert.equal(
    plan.fields.find((f) => f.field === "opencup_total_cost")
      ?.assertion_pointer,
    "/opencup/total_cost_eur",
  );
  assert.equal(
    plan.assertions.find((a) => a.source_pointer === "/status")?.value_state,
    "unknown",
  );
  assert.equal(
    plan.assertions.find((a) => a.source_pointer === "/amount_eur")
      ?.value_state,
    "known",
  );
});

test("an enrichment with a different CUP is preserved for review and does not contaminate its parent", () => {
  const plan = buildCanonicalPnrrPlan([
    record({ opencup: { ...opencup, cup: "C81C22001090007" } }),
  ]);
  assert.equal(plan.projects.length, 1);
  assert.equal(
    (plan.projects[0] as Record<string, unknown>).opencup_total_cost,
    null,
  );
  const outcome = plan.outcomes.find((o) => o.candidate_key === "/opencup");
  assert.equal(outcome?.status, "review_required");
  assert.equal(outcome?.target_subject_id, null);
  assert.ok(
    plan.assertions.some(
      (a) => a.source_pointer === "/opencup/total_cost_eur" && a.value === 200,
    ),
  );
});

test("one Albo record can reference several projects; an unknown reference creates no project", () => {
  const evidence: PnrrRegistryRecord = {
    id: generateCanonicalUuidV7(),
    collection_key: "albo_evidence",
    native_key: "albo-1",
    payload: {
      source_url: "https://albo.tinnvision.cloud/?ente=00301390795",
      cups: [CUP, "C81C22001090007", "C81C22001090008"],
    },
  };
  const plan = buildCanonicalPnrrPlan([
    record(),
    record({ cup: "C81C22001090007" }),
    evidence,
  ]);
  const links = plan.outcomes.filter((o) => o.source_record_id === evidence.id);
  assert.equal(plan.projects.length, 2);
  assert.deepEqual(
    links.map((o) => o.status),
    ["resolved", "resolved", "unresolved"],
  );
  assert.equal(links[2].target_subject_id, null);
});

test("invalid precision and dates cannot silently become canonical facts", () => {
  assert.throws(
    () => buildCanonicalPnrrPlan([record({ amount_eur: 1.001 })]),
    /PNRR_CANONICAL_AMOUNT_PRECISION/,
  );
  assert.throws(
    () => buildCanonicalPnrrPlan([record({ start_date: "2026-02-30" })]),
    /PNRR_CANONICAL_DATE_PRECISION/,
  );
  assert.throws(
    () =>
      buildCanonicalPnrrPlan([
        record({ source_url: "https://example.org/project" }),
      ]),
    /PNRR_CLAIM_SOURCE_ORIGIN/,
  );
});
