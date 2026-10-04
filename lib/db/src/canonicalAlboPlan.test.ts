import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCanonicalAlboPlan,
  type AlboRegistryRecord,
} from "./canonicalAlboPlan";
import { generateCanonicalUuidV7 } from "./canonicalIdentity";

function record(patch: Record<string, unknown> = {}): AlboRegistryRecord {
  return {
    id: generateCanonicalUuidV7(),
    source_key: "lamezia.albo.current",
    collection_key: "items",
    native_key: "albo-2026-1",
    payload: {
      publication_number: "2026/1",
      source_url: "https://albo.tinnvision.cloud/?ente=00301390795",
      subject: "Liquidazione servizio CIG B123456789",
      public_visibility: "publishable",
      verification_status: "official_source_acquired",
      privacy_risk: "low",
      privacy_attestation: {
        schema_version: "albo-privacy-policy-attestation.v1",
        status: "current",
        policy_version: "albo-privacy-policy.2026-08-30.1",
      },
      ...patch,
    },
  };
}
test("publication identity is shared across source versions; acts and documents stay distinct", () => {
  const first = record({
    office: "Settore lavori",
    act_type: "DETERMINAZIONE",
    act_number: "12",
    act_date: "2026-09-01",
    document_url: "https://albo.tinnvision.cloud/allegati/1",
  });
  const second = {
    ...record({ ...first.payload, subject: "Un altro titolo" }),
    source_key: "lamezia.albo.delibere",
  };
  const p = buildCanonicalAlboPlan([first, second]);
  assert.equal(p.publications.length, 1);
  assert.equal(p.versions.length, 2);
  assert.equal(p.acts.length, 1);
  assert.equal(p.documents.length, 1);
  assert.equal(new Set(p.subjects.map((x) => x.subject_id)).size, 3);
  assert.deepEqual(
    p.versions.map((x) => x.title),
    [first.payload.subject, "Un altro titolo"],
  );
  const existing = p.publications.map((x) => ({
    id: x.id as string,
    kind: "publication" as const,
    key: x.publication_number as string,
  }));
  assert.equal(
    buildCanonicalAlboPlan([first], existing).publications[0].id,
    p.publications[0].id,
  );
});
test("a CIG mention is retained but cannot create a procedure, lot or signed contract", () => {
  const p = buildCanonicalAlboPlan([record()]);
  assert.equal(p.mentions.length, 1);
  assert.equal(p.mentions[0].cig, "B123456789");
  assert.ok(
    p.subjects.every((x) => String(x.domain_type).startsWith("document.")),
  );
  const outcome = p.outcomes.find(
    (x) => x.candidate_key === "procurement:B123456789",
  );
  assert.equal(outcome?.status, "review_required");
  assert.equal(outcome?.target_subject_id, null);
  assert.equal(p.acts.length, 0);
  assert.equal(p.documents.length, 0);
});
test("procurement without CIG and records without publication number receive explicit outcomes", () => {
  const p = buildCanonicalAlboPlan([
    record({
      publication_number: null,
      subject: "Affidamento del servizio di manutenzione",
    }),
  ]);
  assert.equal(p.versions.length, 1);
  assert.equal(p.publications.length, 0);
  assert.equal(p.mentions.length, 1);
  assert.equal(p.mentions[0].cig, null);
  assert.ok(
    p.outcomes.some((x) => x.reason_code === "procurement_without_identifier"),
  );
  assert.ok(
    p.outcomes.some(
      (x) => x.reason_code === "missing_or_invalid_publication_number",
    ),
  );
  assert.equal(p.classifications.length, 3);
});
test("excluded, metadata-only, stale-attested and unverified source records cannot expose withheld content", () => {
  const p = buildCanonicalAlboPlan([
    {
      ...record({
        subject: "PRIVATE CIG B123456789",
        public_visibility: "do_not_publish",
      }),
      collection_key: "excluded",
    },
    record({
      subject: "PRIVATE CIG B123456789",
      public_visibility: "metadata_only",
    }),
    record({
      subject: "PRIVATE CIG B123456789",
      privacy_attestation: { status: "stale" },
    }),
    record({
      subject: "PRIVATE CIG B123456789",
      verification_status: "not_verified",
    }),
  ]);
  assert.equal(p.versions.length, 4);
  assert.equal(p.mentions.length, 0);
  assert.equal(p.summary.withheldRecords, 4);
  assert.ok(p.versions.every((x) => x.title === null));
  assert.ok(p.classifications.every((x) => x.status === "not_applicable"));
  assert.ok(!JSON.stringify(p).includes("PRIVATE"));
});
test("identity is not guessed from title, number alone or non-official URL", () => {
  const p = buildCanonicalAlboPlan([
    record({
      act_type: "DETERMINAZIONE",
      act_number: "12",
      act_date: "2026-09-01",
      document_url: "https://albo.tinnvision.cloud.evil.test/file",
    }),
  ]);
  assert.equal(p.acts.length, 0);
  assert.equal(p.documents.length, 0);
  assert.throws(
    () => buildCanonicalAlboPlan([record({ source_url: "https://evil.test" })]),
    /ALBO_SOURCE_ORIGIN_INVALID/,
  );
});
test("invalid date, duplicate source UUID and incompatible existing identity fail closed", () => {
  assert.throws(
    () => buildCanonicalAlboPlan([record({ publication_start: "2026-02-30" })]),
    /ALBO_INVALID_DATE/,
  );
  const r = record();
  assert.throws(
    () => buildCanonicalAlboPlan([r, r]),
    /ALBO_RECORD_SCOPE_INVALID/,
  );
  assert.throws(
    () =>
      buildCanonicalAlboPlan(
        [r],
        [{ id: "not-uuid", kind: "publication", key: "2026\/1" }],
      ),
    /ALBO_EXISTING_IDENTITY_CONFLICT/,
  );
});
