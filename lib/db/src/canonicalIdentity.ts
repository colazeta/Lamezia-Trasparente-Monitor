import { randomBytes } from "node:crypto";

import type { QueryClient } from "./baselineLogic";
import type { CanonicalSubjectKind } from "./schema/canonicalIdentity";

const MAX_UNIX_MS_48 = 0xffffffffffff;
const UUID_V7_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DOMAIN_TYPE_PATTERN = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;
const LEGACY_TOKEN_PATTERN = /^[a-z][a-z0-9_.-]{0,63}$/;

function encodeUuid(bytes: Uint8Array): string {
  const hex = Buffer.from(bytes).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Generate an RFC 9562 UUIDv7 using a 48-bit Unix-millisecond timestamp. */
export function generateCanonicalUuidV7(nowMs = Date.now()): string {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0 || nowMs > MAX_UNIX_MS_48) {
    throw new RangeError(
      "UUIDv7 timestamp must be an integer in the 48-bit Unix-millisecond range",
    );
  }

  const bytes = new Uint8Array(16);
  let timestamp = BigInt(nowMs);
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = Number(timestamp & 0xffn);
    timestamp >>= 8n;
  }
  bytes.set(randomBytes(10), 6);
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  return encodeUuid(bytes);
}

export function isCanonicalUuidV7(value: string): boolean {
  return UUID_V7_PATTERN.test(value);
}

export function isCanonicalDomainType(value: string): boolean {
  return DOMAIN_TYPE_PATTERN.test(value);
}

export interface CreateCanonicalSubjectInput {
  subjectId?: string;
  subjectKind: CanonicalSubjectKind;
  domainType: string;
}

export interface CanonicalSubjectIdentity {
  subjectId: string;
  subjectKind: CanonicalSubjectKind;
  domainType: string;
}

/**
 * Creates one canonical addressability row. This helper intentionally does not
 * also create a legacy mapping: callers that need an atomic multi-row backfill
 * must use a transaction-aware domain migration in the later migration phase.
 */
export async function createCanonicalSubject(
  client: QueryClient,
  input: CreateCanonicalSubjectInput,
): Promise<CanonicalSubjectIdentity> {
  const subjectId = input.subjectId ?? generateCanonicalUuidV7();
  if (!isCanonicalUuidV7(subjectId)) {
    throw new TypeError("subjectId must be an RFC 9562 UUIDv7");
  }
  if (input.subjectKind !== "entity" && input.subjectKind !== "event") {
    throw new TypeError("subjectKind must be entity or event");
  }
  if (!isCanonicalDomainType(input.domainType)) {
    throw new TypeError(
      "domainType must be a namespaced lower-case token such as party.person",
    );
  }

  const result = await client.query(
    `INSERT INTO canonical_subjects (subject_id, subject_kind, domain_type)
     VALUES ($1, $2, $3)
     RETURNING subject_id AS "subjectId", subject_kind AS "subjectKind", domain_type AS "domainType"`,
    [subjectId, input.subjectKind, input.domainType],
  );
  const row = result.rows[0];
  if (!row) throw new Error("canonical subject insert returned no row");
  return {
    subjectId: String(row["subjectId"]),
    subjectKind: String(row["subjectKind"]) as CanonicalSubjectKind,
    domainType: String(row["domainType"]),
  };
}

export interface LegacySubjectIdentity {
  legacyNamespace: string;
  legacyType: string;
  legacyId: string;
}

export interface EnsureLegacySubjectMappingInput extends LegacySubjectIdentity {
  subjectId: string;
  resolutionMethod: string;
}

export interface ActiveLegacySubjectMapping extends LegacySubjectIdentity {
  mappingId: number;
  subjectId: string;
  resolutionMethod: string;
  created: boolean;
}

export class LegacySubjectMappingConflictError extends Error {
  constructor(
    readonly identity: LegacySubjectIdentity,
    readonly existingSubjectId: string,
    readonly requestedSubjectId: string,
  ) {
    super(
      `Legacy identity ${identity.legacyNamespace}/${identity.legacyType}/${identity.legacyId} ` +
        `is already actively mapped to ${existingSubjectId}, not ${requestedSubjectId}`,
    );
    this.name = "LegacySubjectMappingConflictError";
  }
}

function validateLegacyIdentity(input: LegacySubjectIdentity): void {
  if (!LEGACY_TOKEN_PATTERN.test(input.legacyNamespace)) {
    throw new TypeError("legacyNamespace must be a lower-case registered token");
  }
  if (!LEGACY_TOKEN_PATTERN.test(input.legacyType)) {
    throw new TypeError("legacyType must be a lower-case registered token");
  }
  if (!input.legacyId.trim()) {
    throw new TypeError("legacyId must not be blank");
  }
}

function mappingFromRow(
  row: Record<string, unknown>,
  identity: LegacySubjectIdentity,
  created: boolean,
): ActiveLegacySubjectMapping {
  return {
    ...identity,
    mappingId: Number(row["mappingId"]),
    subjectId: String(row["subjectId"]),
    resolutionMethod: String(row["resolutionMethod"]),
    created,
  };
}

/**
 * Idempotently asserts one active legacy→canonical mapping.
 *
 * The partial unique index in PostgreSQL is the concurrency authority. If the
 * same legacy identity is already mapped to the requested subject, the existing
 * mapping is returned unchanged. If it points to a different subject, the
 * helper fails closed; corrections must use the future historised supersession
 * workflow rather than overwriting a mapping in place.
 */
export async function ensureActiveLegacySubjectMapping(
  client: QueryClient,
  input: EnsureLegacySubjectMappingInput,
): Promise<ActiveLegacySubjectMapping> {
  validateLegacyIdentity(input);
  if (!isCanonicalUuidV7(input.subjectId)) {
    throw new TypeError("subjectId must be an RFC 9562 UUIDv7");
  }
  if (!LEGACY_TOKEN_PATTERN.test(input.resolutionMethod)) {
    throw new TypeError("resolutionMethod must be a lower-case registered token");
  }

  const identity: LegacySubjectIdentity = {
    legacyNamespace: input.legacyNamespace,
    legacyType: input.legacyType,
    legacyId: input.legacyId,
  };

  const inserted = await client.query(
    `INSERT INTO legacy_subject_map (
       legacy_namespace, legacy_type, legacy_id, subject_id,
       resolution_method, mapping_status
     ) VALUES ($1, $2, $3, $4, $5, 'active')
     ON CONFLICT (legacy_namespace, legacy_type, legacy_id)
       WHERE valid_to IS NULL
     DO NOTHING
     RETURNING mapping_id AS "mappingId", subject_id AS "subjectId",
               resolution_method AS "resolutionMethod"`,
    [
      input.legacyNamespace,
      input.legacyType,
      input.legacyId,
      input.subjectId,
      input.resolutionMethod,
    ],
  );
  if (inserted.rows[0]) {
    return mappingFromRow(inserted.rows[0], identity, true);
  }

  const existing = await client.query(
    `SELECT mapping_id AS "mappingId", subject_id AS "subjectId",
            resolution_method AS "resolutionMethod"
     FROM legacy_subject_map
     WHERE legacy_namespace = $1
       AND legacy_type = $2
       AND legacy_id = $3
       AND valid_to IS NULL
     LIMIT 1`,
    [input.legacyNamespace, input.legacyType, input.legacyId],
  );
  const row = existing.rows[0];
  if (!row) {
    throw new Error(
      "active legacy mapping was not inserted and could not be re-read; retry the operation",
    );
  }
  const existingSubjectId = String(row["subjectId"]);
  if (existingSubjectId !== input.subjectId) {
    throw new LegacySubjectMappingConflictError(
      identity,
      existingSubjectId,
      input.subjectId,
    );
  }
  return mappingFromRow(row, identity, false);
}
