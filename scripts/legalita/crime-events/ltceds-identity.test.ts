import assert from "node:assert/strict";
import test from "node:test";

import { isUuidV7 } from "@workspace/publication-standardisation/ltceds";

import { generateUuidV7, uuidV7Timestamp } from "./ltceds-identity";

test("generateUuidV7 emits RFC 9562 version and variant", () => {
  const value = generateUuidV7(1_725_000_000_000);
  assert.equal(isUuidV7(value), true);
  assert.equal(value[14], "7");
  assert.match(value[19]!, /[89ab]/i);
});

test("uuidV7Timestamp round-trips the 48-bit Unix millisecond timestamp", () => {
  const timestamp = 1_725_000_123_456;
  assert.equal(uuidV7Timestamp(generateUuidV7(timestamp)), timestamp);
});

test("generateUuidV7 produces distinct opaque identifiers at the same timestamp", () => {
  const timestamp = 1_725_000_000_000;
  assert.notEqual(generateUuidV7(timestamp), generateUuidV7(timestamp));
});

test("generateUuidV7 fails closed for invalid timestamps", () => {
  assert.throws(() => generateUuidV7(-1), RangeError);
  assert.throws(() => generateUuidV7(Number.NaN), RangeError);
  assert.throws(() => generateUuidV7(0x1_0000_0000_0000), RangeError);
});

test("uuidV7Timestamp rejects UUIDv4", () => {
  assert.equal(uuidV7Timestamp("550e8400-e29b-41d4-a716-446655440000"), null);
});
