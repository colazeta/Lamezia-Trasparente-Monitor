import { createHash } from "node:crypto";
import { db, publicationsTable, type PublicationAttachment } from "@workspace/db";
import { and, asc, desc, isNotNull, isNull, sql } from "drizzle-orm";
import { logger } from "./logger";
import { ObjectStorageService } from "./objectStorage";

const TINN_BASE = "https://albo.tinnvision.cloud";
const ENTE = "00301390795";
const STORAGE_PREFIX = "/api/storage/public-objects/";

// The official detail API is gated behind an `Accept: application/json` header
// (without it the route 404s). The id is `ANNO-PROGRESSIVO` (dash-separated).
const DETAIL_HEADERS = {
  Accept: "application/json",
  "User-Agent": "rendiamoLameziaTrasparente/1.0",
} as const;

// Best-effort tuning: keep the load on the official portal low so file archival
// never blocks or starves the main ingestion cycle.
const MAX_PER_CYCLE = 25;
const CONCURRENCY = 3;
const MAX_FILE_BYTES = 30 * 1024 * 1024; // 30 MB per attachment
const DETAIL_TIMEOUT_MS = 20_000;
const DOWNLOAD_TIMEOUT_MS = 45_000;
const HASH_BACKFILL_MAX_ROWS = 10;
const HASH_BACKFILL_MAX_ATTACHMENTS = 20;
const HASH_BACKFILL_RETRY_AFTER_MS = 24 * 60 * 60 * 1000;

type AllegatoItem = {
  PROGRESSIVO: number | string;
  NOMEALLEGATO?: string;
  DESCALLEGATO?: string;
  tipoAllegato?: string;
};

type DetailResponse = {
  pubblicazioneAlbo?: { ANNO?: number; PROGRESSIVO?: number };
  allegati?: { totalItems?: number; items?: AllegatoItem[] };
};

function parseProgressivo(
  progressivo: string,
): { anno: string; prog: string } | null {
  const m = /^(\d{4})[/_-](\d+)$/.exec(progressivo.trim());
  if (!m) return null;
  return { anno: m[1], prog: m[2] };
}

function safeName(name: string): string {
  return (
    name
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 120) || "allegato"
  );
}

function guessContentType(name: string, headerType: string | null): string {
  if (headerType) {
    // Strip charset noise the portal appends to binary responses.
    const base = headerType.split(";")[0].trim().toLowerCase();
    if (base && base !== "application/octet-stream") return base;
  }
  if (/\.pdf$/i.test(name)) return "application/pdf";
  if (/\.(p7m)$/i.test(name)) return "application/pkcs7-mime";
  if (/\.(zip)$/i.test(name)) return "application/zip";
  if (/\.(docx?)$/i.test(name)) return "application/msword";
  return "application/octet-stream";
}

export function sha256Hex(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

function parseStoredSize(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : null;
  }
  return null;
}

async function fetchDetail(id: string): Promise<DetailResponse | null> {
  const url = `${TINN_BASE}/api/pubblicazioni/${id}?ente=${ENTE}`;
  const res = await fetch(url, {
    headers: DETAIL_HEADERS,
    signal: AbortSignal.timeout(DETAIL_TIMEOUT_MS),
  });
  if (res.status === 404) return null; // no detail available for this act
  if (!res.ok) throw new Error(`detail ${res.status}`);
  return (await res.json()) as DetailResponse;
}

async function archiveAllegato(
  storage: ObjectStorageService,
  idDir: string,
  anno: string,
  prog: string,
  item: AllegatoItem,
): Promise<PublicationAttachment | null> {
  const tipo = (item.tipoAllegato ?? "").toString();
  const name = (item.NOMEALLEGATO || item.DESCALLEGATO || "allegato").trim();
  const officialUrl = `${TINN_BASE}/allegati/${anno}_${prog}_${item.PROGRESSIVO}_${tipo}?ente=${ENTE}`;

  const base: PublicationAttachment = {
    name,
    tipo,
    officialUrl,
    storagePath: null,
    contentType: null,
    size: null,
    sha256: null,
  };

  try {
    const res = await fetch(officialUrl, {
      headers: { "User-Agent": "rendiamoLameziaTrasparente/1.0" },
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
    });
    if (!res.ok) return base; // keep the direct link, skip archival
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > MAX_FILE_BYTES) return base;
    const contentType = guessContentType(
      name,
      res.headers.get("content-type"),
    );
    const filePath = `albo/${idDir}/${item.PROGRESSIVO}-${safeName(name)}`;
    const digest = sha256Hex(buf);
    const storagePath = await storage.uploadPublicObject(
      filePath,
      buf,
      contentType,
    );
    return {
      ...base,
      storagePath: `${STORAGE_PREFIX}${storagePath}`,
      contentType,
      size: buf.byteLength,
      sha256: digest,
    };
  } catch {
    // Network/storage failure: keep the official direct link, no local copy.
    return base;
  }
}

async function enrichOne(
  storage: ObjectStorageService,
  pub: { id: number; progressivo: string },
): Promise<void> {
  const parsed = parseProgressivo(pub.progressivo);
  if (!parsed) {
    await db
      .update(publicationsTable)
      .set({ detailFetchedAt: new Date() })
      .where(sql`${publicationsTable.id} = ${pub.id}`);
    return;
  }

  const { anno, prog } = parsed;
  const id = `${anno}-${prog}`;
  const idDir = `${anno}-${prog}`;

  const detail = await fetchDetail(id);
  const items = detail?.allegati?.items ?? [];

  const attachments: PublicationAttachment[] = [];
  for (const item of items) {
    const att = await archiveAllegato(storage, idDir, anno, prog, item);
    if (att) attachments.push(att);
  }

  await db
    .update(publicationsTable)
    .set({ attachments, detailFetchedAt: new Date() })
    .where(sql`${publicationsTable.id} = ${pub.id}`);
}

export type AttachmentHashBackfillResult = {
  rowsExamined: number;
  rowsUpdated: number;
  attachmentsAttempted: number;
  hashesBackfilled: number;
  skipped: number;
};

function withBackfillAttempt(
  attachment: PublicationAttachment,
  attemptedAt: string,
): PublicationAttachment {
  return { ...attachment, sha256BackfillAttemptedAt: attemptedAt };
}

/**
 * Bounded legacy provenance repair. It hashes only bytes already present in the
 * canonical object-storage copy; it never refetches an attachment from Tinn.
 * Recorded/storage size mismatches are fail-closed and leave the hash unset.
 *
 * Every attempted legacy attachment records only a technical ISO timestamp in
 * the JSONB record. Never-attempted/least-recently-attempted rows are selected
 * first, while failed attempts are cooled down for 24 hours. This prevents a
 * permanently unavailable object from starving older eligible records.
 */
export async function backfillAlboAttachmentHashes(
  storage: ObjectStorageService,
): Promise<AttachmentHashBackfillResult> {
  const attemptedAt = new Date().toISOString();
  const retryBefore = new Date(
    Date.now() - HASH_BACKFILL_RETRY_AFTER_MS,
  ).toISOString();
  const safeAttachments = sql`CASE
    WHEN jsonb_typeof(${publicationsTable.attachments}) = 'array'
      THEN ${publicationsTable.attachments}
    ELSE '[]'::jsonb
  END`;
  const eligibleAttachment = sql`COALESCE(attachment->>'storagePath', '') LIKE ${`${STORAGE_PREFIX}%`}
    AND COALESCE(attachment->>'sha256', '') = ''
    AND (
      COALESCE(attachment->>'sha256BackfillAttemptedAt', '') = ''
      OR attachment->>'sha256BackfillAttemptedAt' < ${retryBefore}
    )`;
  const oldestAttempt = sql`COALESCE((
    SELECT MIN(COALESCE(NULLIF(attachment->>'sha256BackfillAttemptedAt', ''), ''))
    FROM jsonb_array_elements(${safeAttachments}) AS attachment
    WHERE ${eligibleAttachment}
  ), '')`;

  const candidates = await db
    .select({
      id: publicationsTable.id,
      attachments: publicationsTable.attachments,
    })
    .from(publicationsTable)
    .where(
      and(
        isNotNull(publicationsTable.detailFetchedAt),
        sql`EXISTS (
          SELECT 1
          FROM jsonb_array_elements(${safeAttachments}) AS attachment
          WHERE ${eligibleAttachment}
        )`,
      ),
    )
    .orderBy(oldestAttempt, desc(publicationsTable.pubStart), asc(publicationsTable.id))
    .limit(HASH_BACKFILL_MAX_ROWS);

  let rowsUpdated = 0;
  let attachmentsAttempted = 0;
  let hashesBackfilled = 0;
  let skipped = 0;

  for (const row of candidates) {
    let changed = false;
    const attachments: PublicationAttachment[] = [];

    for (const attachment of row.attachments ?? []) {
      const lastAttempt = attachment.sha256BackfillAttemptedAt ?? null;
      const eligibleRetry = !lastAttempt || lastAttempt < retryBefore;
      if (
        attachment.sha256 ||
        !attachment.storagePath?.startsWith(STORAGE_PREFIX) ||
        !eligibleRetry
      ) {
        attachments.push(attachment);
        continue;
      }

      if (attachmentsAttempted >= HASH_BACKFILL_MAX_ATTACHMENTS) {
        attachments.push(attachment);
        continue;
      }
      attachmentsAttempted += 1;
      changed = true;

      const attemptedAttachment = withBackfillAttempt(attachment, attemptedAt);
      if (attachment.size !== null && attachment.size > MAX_FILE_BYTES) {
        skipped += 1;
        attachments.push(attemptedAttachment);
        continue;
      }

      const relativePath = attachment.storagePath.slice(STORAGE_PREFIX.length);
      try {
        const file = await storage.searchPublicObject(relativePath);
        if (!file) {
          skipped += 1;
          attachments.push(attemptedAttachment);
          continue;
        }

        const [metadata] = await file.getMetadata();
        const storedSize = parseStoredSize(metadata.size);
        if (
          storedSize === null ||
          storedSize === 0 ||
          storedSize > MAX_FILE_BYTES ||
          (attachment.size !== null && attachment.size !== storedSize)
        ) {
          skipped += 1;
          attachments.push(attemptedAttachment);
          continue;
        }

        const [buf] = await file.download();
        if (buf.byteLength !== storedSize) {
          skipped += 1;
          attachments.push(attemptedAttachment);
          continue;
        }

        attachments.push({
          ...attemptedAttachment,
          size: attachment.size ?? storedSize,
          sha256: sha256Hex(buf),
        });
        hashesBackfilled += 1;
      } catch {
        skipped += 1;
        attachments.push(attemptedAttachment);
      }
    }

    if (changed) {
      await db
        .update(publicationsTable)
        .set({ attachments })
        .where(sql`${publicationsTable.id} = ${row.id}`);
      rowsUpdated += 1;
    }
  }

  return {
    rowsExamined: candidates.length,
    rowsUpdated,
    attachmentsAttempted,
    hashesBackfilled,
    skipped,
  };
}

function emptyHashBackfillResult(): AttachmentHashBackfillResult {
  return {
    rowsExamined: 0,
    rowsUpdated: 0,
    attachmentsAttempted: 0,
    hashesBackfilled: 0,
    skipped: 0,
  };
}

/**
 * Best-effort pass that fetches the official per-act detail, archives its
 * attachments into object storage, records direct links, and gradually adds
 * SHA-256 provenance to legacy stored copies. New archival and legacy hash
 * backfill are independently bounded.
 */
export async function enrichAlboAttachments(): Promise<{
  processed: number;
  withFiles: number;
  hashBackfill: AttachmentHashBackfillResult;
}> {
  let storage: ObjectStorageService;
  try {
    storage = new ObjectStorageService();
    // Validates env config early; if storage isn't set up, skip cleanly.
    storage.getPublicObjectSearchPaths();
  } catch (err) {
    logger.warn(
      { err },
      "Albo attachment archival skipped: object storage not configured",
    );
    return {
      processed: 0,
      withFiles: 0,
      hashBackfill: emptyHashBackfillResult(),
    };
  }

  const pending = await db
    .select({
      id: publicationsTable.id,
      progressivo: publicationsTable.progressivo,
    })
    .from(publicationsTable)
    .where(
      and(
        isNull(publicationsTable.detailFetchedAt),
        sql`${publicationsTable.pubStart} IS NOT NULL`,
      ),
    )
    .orderBy(desc(publicationsTable.pubStart), asc(publicationsTable.id))
    .limit(MAX_PER_CYCLE);

  let processed = 0;
  let withFiles = 0;

  if (pending.length > 0) {
    const queue = [...pending];

    async function worker(): Promise<void> {
      for (;;) {
        const next = queue.shift();
        if (!next) break;
        try {
          await enrichOne(storage, next);
          processed += 1;
        } catch (err) {
          // Transient failure: leave detailFetchedAt NULL to retry next cycle.
          logger.warn(
            { err, progressivo: next.progressivo },
            "Albo attachment enrichment failed for act",
          );
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () => worker()),
    );

    // Count how many of the processed rows ended up with at least one file.
    const refreshed = await db
      .select({ attachments: publicationsTable.attachments })
      .from(publicationsTable)
      .where(
        sql`${publicationsTable.id} IN (${sql.join(
          pending.map((p) => sql`${p.id}`),
          sql`, `,
        )})`,
      );
    withFiles = refreshed.filter((r) => (r.attachments?.length ?? 0) > 0).length;
  }

  const hashBackfill = await backfillAlboAttachmentHashes(storage).catch(() =>
    emptyHashBackfillResult(),
  );

  logger.info(
    {
      processed,
      withFiles,
      hashBackfill,
      source: "albo-attachments",
    },
    "Albo attachment enrichment cycle complete",
  );
  return { processed, withFiles, hashBackfill };
}
