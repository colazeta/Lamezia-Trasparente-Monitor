import assert from "node:assert/strict";
import test from "node:test";

import {
  createCanonicalSubject,
  ensureActiveLegacySubjectMapping,
  generateCanonicalUuidV7,
  isCanonicalDomainType,
  isCanonicalUuidV7,
  LegacySubjectMappingConflictError,
} from "./canonicalIdentity";

const UUID_V4 = "550e8400-e29b-41d4-a716-446655440000";

test("canonical UUID generator emits RFC 9562 UUIDv7 values", () => {
  const first = generateCanonicalUuidV7(1_788_712_500_000);
  const second = generateCanonicalUuidV7(1_788_712_500_000);
  assert.equal(isCanonicalUuidV7(first), true);
  assert.equal(isCanonicalUuidV7(second), true);
  assert.notEqual(first, second);
  assert.equal(isCanonicalUuidV7(UUID_V4), false);
});

test("canonical UUID generator fails closed outside the 48-bit millisecond range", () => {
  assert.throws(() => generateCanonicalUuidV7(-1), RangeError);
  assert.throws(() => generateCanonicalUuidV7(Number.MAX_SAFE_INTEGER), RangeError);
});

test("domain types must be namespaced lower-case semantic tokens", () => {
  assert.equal(isCanonicalDomainType("party.person"), true);
  assert.equal(isCanonicalDomainType("procurement.contract"), true);
  assert.equal(isCanonicalDomainType("crime.event"), true);
  assert.equal(isCanonicalDomainType("person"), false);
  assert.equal(isCanonicalDomainType("Party.Person"), false);
  assert.equal(isCanonicalDomainType("party.person.extra"), false);
});

test("createCanonicalSubject validates identity before issuing SQL", async () => {
  let calls = 0;
  const client = {
    async query(_text: string, params?: unknown[]) {
      calls += 1;
      return {
        rows: [{
          subjectId: params?.[0],
          subjectKind: params?.[1],
          domainType: params?.[2],
        }],
      };
    },
  };
  const subjectId = generateCanonicalUuidV7(1_788_712_500_001);
  const created = await createCanonicalSubject(client, {
    subjectId,
    subjectKind: "entity",
    domainType: "party.organization",
  });
  assert.equal(calls, 1);
  assert.deepEqual(created, {
    subjectId,
    subjectKind: "entity",
    domainType: "party.organization",
  });

  await assert.rejects(
    () => createCanonicalSubject(client, {
      subjectId: UUID_V4,
      subjectKind: "entity",
      domainType: "party.organization",
    }),
    /UUIDv7/,
  );
  await assert.rejects(
    () => createCanonicalSubject(client, {
      subjectId,
      subjectKind: "entity",
      domainType: "organization",
    }),
    /namespaced/,
  );
  assert.equal(calls, 1);
});

test("legacy mapping helper is idempotent when the existing active target agrees", async () => {
  const subjectId = generateCanonicalUuidV7(1_788_712_500_002);
  let insertCalls = 0;
  let selectCalls = 0;
  const client = {
    async query(text: string) {
      if (text.includes("INSERT INTO legacy_subject_map")) {
        insertCalls += 1;
        if (insertCalls === 1) {
          return { rows: [{ mappingId: 7, subjectId, resolutionMethod: "migration_backfill" }] };
        }
        return { rows: [] };
      }
      selectCalls += 1;
      return { rows: [{ mappingId: 7, subjectId, resolutionMethod: "migration_backfill" }] };
    },
  };
  const input = {
    legacyNamespace: "db.public",
    legacyType: "official",
    legacyId: "42",
    subjectId,
    resolutionMethod: "migration_backfill",
  };

  const first = await ensureActiveLegacySubjectMapping(client, input);
  const second = await ensureActiveLegacySubjectMapping(client, input);
  assert.equal(first.created, true);
  assert.equal(second.created, false);
  assert.equal(first.mappingId, second.mappingId);
  assert.equal(first.subjectId, second.subjectId);
  assert.equal(insertCalls, 2);
  assert.equal(selectCalls, 1);
});

test("legacy mapping helper fails closed when an active legacy identity points elsewhere", async () => {
  const requested = generateCanonicalUuidV7(1_788_712_500_003);
  const existing = generateCanonicalUuidV7(1_788_712_500_004);
  const client = {
    async query(text: string) {
      if (text.includes("INSERT INTO legacy_subject_map")) return { rows: [] };
      return { rows: [{ mappingId: 9, subjectId: existing, resolutionMethod: "manual_confirmed" }] };
    },
  };
  await assert.rejects(
    () => ensureActiveLegacySubjectMapping(client, {
      legacyNamespace: "db.public",
      legacyType: "official",
      legacyId: "42",
      subjectId: requested,
      resolutionMethod: "migration_backfill",
    }),
    (error: unknown) =>
      error instanceof LegacySubjectMappingConflictError &&
      error.existingSubjectId === existing &&
      error.requestedSubjectId === requested,
  );
});

test("legacy mapping helper rejects blank/free-form identity tokens before querying", async () => {
  let calls = 0;
  const client = {
    async query() {
      calls += 1;
      return { rows: [] };
    },
  };
  const subjectId = generateCanonicalUuidV7(1_788_712_500_005);
  await assert.rejects(
    () => ensureActiveLegacySubjectMapping(client, {
      legacyNamespace: "DB Public",
      legacyType: "official",
      legacyId: "42",
      subjectId,
      resolutionMethod: "migration_backfill",
    }),
    /legacyNamespace/,
  );
  await assert.rejects(
    () => ensureActiveLegacySubjectMapping(client, {
      legacyNamespace: "db.public",
      legacyType: "official",
      legacyId: "   ",
      subjectId,
      resolutionMethod: "migration_backfill",
    }),
    /legacyId/,
  );
  assert.equal(calls, 0);
});
