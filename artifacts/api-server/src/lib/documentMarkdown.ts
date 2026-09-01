import {
  db,
  publicationsTable,
  type Publication,
  type PublicationAttachment,
} from "@workspace/db";
import { and, asc, desc, isNull, isNotNull, sql } from "drizzle-orm";
import { PDFParse } from "pdf-parse";
import { logger } from "./logger";
import { ObjectStorageService } from "./objectStorage";
import {
  createDoclingObservationSummary,
  hasEmbeddedPdfMarker,
  observeDoclingCandidate,
  recordDoclingObservation,
  type DoclingObservationSummary,
} from "./doclingObservation";
import {
  isDoclingEnrichmentEnabled,
  type DoclingEnrichmentDecision,
} from "./doclingEnrichmentPolicy";

const MAX_PER_CYCLE = 15;
const CONCURRENCY = 2;
const MAX_TEXT_CHARS = 200_000;
const PARSE_TIMEOUT_MS = 60_000;
const STORAGE_PREFIX = "/api/storage/public-objects/";

type PdfBaselineExtraction = {
  text: string;
  pages: number | null;
  hasEmbeddedPdf: boolean;
};

type DoclingObserver = (decision: DoclingEnrichmentDecision) => void;

function pickPdfAttachment(
  attachments: PublicationAttachment[],
): PublicationAttachment | null {
  for (const a of attachments) {
    const isPdf =
      a.contentType === "application/pdf" || /\.pdf$/i.test(a.name ?? "");
    const isSigned = /\.p7m$/i.test(a.name ?? "");
    if (isPdf && !isSigned && a.storagePath) return a;
  }
  return null;
}

function fmtDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

function cleanBody(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/-\n(?=\p{Ll})/gu, "")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trimEnd())
    .join("\n")
    .trim()
    .slice(0, MAX_TEXT_CHARS);
}

function buildMarkdown(
  pub: Pick<
    Publication,
    | "progressivo"
    | "tipologia"
    | "oggetto"
    | "dataAtto"
    | "pubStart"
    | "pubEnd"
    | "provenienza"
    | "cups"
  >,
  attachment: PublicationAttachment,
  body: string,
): string {
  const lines: string[] = [];
  lines.push(`# ${pub.oggetto.trim()}`);
  lines.push("");
  lines.push(`- **Tipologia:** ${pub.tipologia}`);
  lines.push(`- **Progressivo:** ${pub.progressivo}`);
  const dataAtto = fmtDate(pub.dataAtto);
  if (dataAtto) lines.push(`- **Data atto:** ${dataAtto}`);
  const start = fmtDate(pub.pubStart);
  const end = fmtDate(pub.pubEnd);
  if (start) {
    lines.push(`- **Pubblicazione:** ${start}${end ? ` – ${end}` : ""}`);
  }
  if (pub.provenienza) lines.push(`- **Provenienza:** ${pub.provenienza}`);
  if (pub.cups.length > 0) lines.push(`- **CUP:** ${pub.cups.join(", ")}`);
  lines.push(`- **Fonte:** [${attachment.name}](${attachment.officialUrl})`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(body);
  return lines.join("\n");
}

async function extractFromStorage(
  storage: ObjectStorageService,
  attachment: PublicationAttachment,
  observe: DoclingObserver,
): Promise<PdfBaselineExtraction | null> {
  const storagePath = attachment.storagePath;
  if (!storagePath || !storagePath.startsWith(STORAGE_PREFIX)) return null;
  const relativePath = storagePath.slice(STORAGE_PREFIX.length);

  const file = await storage.searchPublicObject(relativePath);
  if (!file) {
    observe(
      observeDoclingCandidate({
        baselineStatus: "not-run",
        baselineCharacters: null,
        pages: null,
      }),
    );
    return null;
  }

  const [buf] = await file.download();
  const bytes = new Uint8Array(buf);
  const hasEmbeddedPdf = hasEmbeddedPdfMarker(bytes);
  const parser = new PDFParse({ data: bytes });
  try {
    let result: Awaited<ReturnType<PDFParse["getText"]>>;
    try {
      result = (await Promise.race([
        parser.getText(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("pdf parse timeout")), PARSE_TIMEOUT_MS),
        ),
      ])) as Awaited<ReturnType<PDFParse["getText"]>>;
    } catch (err) {
      observe(
        observeDoclingCandidate({
          baselineStatus: "failed",
          baselineCharacters: null,
          pages: null,
          hasEmbeddedPdf,
        }),
      );
      throw err;
    }

    const text = result.text ?? "";
    const pages = Number.isFinite(result.total) ? result.total : null;
    observe(
      observeDoclingCandidate({
        baselineStatus: "ok",
        baselineCharacters: text.length,
        pages,
        hasEmbeddedPdf,
      }),
    );
    return { text, pages, hasEmbeddedPdf };
  } finally {
    await parser.destroy().catch(() => {});
  }
}

async function extractOne(
  storage: ObjectStorageService,
  pub: Publication,
  observe: DoclingObserver,
): Promise<boolean> {
  const attachment = pickPdfAttachment(pub.attachments ?? []);

  if (!attachment) {
    await db
      .update(publicationsTable)
      .set({ markdownExtractedAt: new Date() })
      .where(sql`${publicationsTable.id} = ${pub.id}`);
    return false;
  }

  const extraction = await extractFromStorage(storage, attachment, observe);
  const raw = extraction?.text ?? "";
  const body = raw ? cleanBody(raw) : "";

  if (!body) {
    await db
      .update(publicationsTable)
      .set({
        markdownExtractedAt: new Date(),
        markdownSource: attachment.name,
      })
      .where(sql`${publicationsTable.id} = ${pub.id}`);
    return false;
  }

  const markdown = buildMarkdown(pub, attachment, body);
  await db
    .update(publicationsTable)
    .set({
      markdownText: markdown,
      markdownSource: attachment.name,
      markdownExtractedAt: new Date(),
    })
    .where(sql`${publicationsTable.id} = ${pub.id}`);
  return true;
}

export async function extractDocumentMarkdown(): Promise<{
  processed: number;
  withText: number;
  doclingObservation: DoclingObservationSummary;
}> {
  const doclingObservation = createDoclingObservationSummary();
  const observe: DoclingObserver = (decision) => {
    recordDoclingObservation(doclingObservation, decision);
  };

  let storage: ObjectStorageService;
  try {
    storage = new ObjectStorageService();
    storage.getPublicObjectSearchPaths();
  } catch (err) {
    logger.warn(
      { err },
      "Document Markdown extraction skipped: object storage not configured",
    );
    return { processed: 0, withText: 0, doclingObservation };
  }

  const pending = await db
    .select()
    .from(publicationsTable)
    .where(
      and(
        isNull(publicationsTable.markdownExtractedAt),
        isNotNull(publicationsTable.detailFetchedAt),
        sql`jsonb_array_length(${publicationsTable.attachments}) > 0`,
      ),
    )
    .orderBy(desc(publicationsTable.pubStart), asc(publicationsTable.id))
    .limit(MAX_PER_CYCLE);

  if (pending.length === 0) {
    return { processed: 0, withText: 0, doclingObservation };
  }

  let processed = 0;
  let withText = 0;
  const queue = [...pending];

  async function worker(): Promise<void> {
    for (;;) {
      const next = queue.shift();
      if (!next) break;
      try {
        const ok = await extractOne(storage, next, observe);
        processed += 1;
        if (ok) withText += 1;
      } catch (err) {
        logger.warn(
          { err, progressivo: next.progressivo },
          "Document Markdown extraction failed for publication",
        );
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () => worker()),
  );

  logger.info(
    {
      processed,
      withText,
      source: "document-markdown",
      doclingObservation: {
        mode: "shadow-only",
        realEnrichmentEnabled: isDoclingEnrichmentEnabled(),
        ...doclingObservation,
      },
    },
    "Document Markdown extraction cycle complete",
  );
  return { processed, withText, doclingObservation };
}
