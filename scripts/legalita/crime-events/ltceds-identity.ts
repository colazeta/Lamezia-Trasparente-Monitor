import { randomBytes } from "node:crypto";

const MAX_UNIX_MS_48 = 0xffffffffffff;

function encodeUuid(bytes: Uint8Array): string {
  const hex = Buffer.from(bytes).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Generate an RFC 9562 UUIDv7 with a 48-bit Unix-millisecond timestamp. */
export function generateUuidV7(nowMs = Date.now()): string {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0 || nowMs > MAX_UNIX_MS_48) {
    throw new RangeError("UUIDv7 timestamp must be an integer in the 48-bit Unix-millisecond range");
  }

  const bytes = new Uint8Array(16);
  let timestamp = BigInt(nowMs);
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = Number(timestamp & 0xffn);
    timestamp >>= 8n;
  }

  bytes.set(randomBytes(10), 6);
  bytes[6] = (bytes[6]! & 0x0f) | 0x70; // version 7
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // RFC 4122/RFC 9562 variant 10xx
  return encodeUuid(bytes);
}

export function uuidV7Timestamp(value: string): number | null {
  const compact = value.replaceAll("-", "");
  if (!/^[0-9a-f]{32}$/i.test(compact) || compact[12]?.toLowerCase() !== "7") return null;
  const variant = Number.parseInt(compact[16]!, 16);
  if ((variant & 0x8) !== 0x8 || (variant & 0x4) !== 0) return null;
  const timestamp = Number.parseInt(compact.slice(0, 12), 16);
  return Number.isSafeInteger(timestamp) ? timestamp : null;
}
