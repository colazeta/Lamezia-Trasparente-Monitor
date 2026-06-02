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

// Best-effort tuning: keep the per-cycle work bounded so Markdown extraction
// never starves the main ingestion loop. PDF parsing is CPU-bound, so keep
// concurrency low.
const MAX_PER_CYCLE = 15;
const CONCURRENCY = 2;
const MAX_TEXT_CHARS = 200_000;
const PARSE_TIMEOUT_MS = 60_000;

const STORAGE_PREFIX = "/api/storage/public-objects/";

// Riconosce l'allegato PDF leggibile (escludendo i file firmati .p7m, che sono
// buste PKCS7 e non testo estraibile). Preferisce gli allegati già archiviati
// nello storage pubblico.
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

// Ripulisce il testo grezzo estratto dal PDF: normalizza gli spazi, rimuove le
// righe vuote in eccesso e i trattini di sillabazione a fine riga.
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

// Compone il documento Markdown: intestazione con i metadati dell'atto seguita
// dal corpo del testo estratto. Pensato per essere leggibile da persone e da
// assistenti AI (frontmatter-like elenco di metadati + testo pulito).
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
    lines.push(
      `- **Pubblicazione:** ${start}${end ? ` – ${end}` : ""}`,
    );
  }
  if (pub.provenienza) lines.push(`- **Provenienza:** ${pub.provenienza}`);
  if (pub.cups.length > 0) {
    lines.push(`- **CUP:** ${pub.cups.join(", ")}`);
  }
  lines.push(
    `- **Fonte:** [${attachment.name}](${attachment.officialUrl})`,
  );
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(body);
  return lines.join("\n");
}

async function extractFromStorage(
  storage: ObjectStorageService,
  attachment: PublicationAttachment,
): Promise<string | null> {
  const storagePath = attachment.storagePath;
  if (!storagePath || !storagePath.startsWith(STORAGE_PREFIX)) return null;
  const relativePath = storagePath.slice(STORAGE_PREFIX.length);

  const file = await storage.searchPublicObject(relativePath);
  if (!file) return null;

  const [buf] = await file.download();
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    const result = (await Promise.race([
      parser.getText(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("pdf parse timeout")), PARSE_TIMEOUT_MS),
      ),
    ])) as Awaited<ReturnType<PDFParse["getText"]>>;
    return result.text ?? "";
  } finally {
    await parser.destroy().catch(() => {});
  }
}

async function extractOne(
  storage: ObjectStorageService,
  pub: Publication,
): Promise<boolean> {
  const attachment = pickPdfAttachment(pub.attachments ?? []);

  // Nessun allegato PDF leggibile: marca come elaborato per non ritentare
  // all'infinito, lasciando markdownText = null.
  if (!attachment) {
    await db
      .update(publicationsTable)
      .set({ markdownExtractedAt: new Date() })
      .where(sql`${publicationsTable.id} = ${pub.id}`);
    return false;
  }

  const raw = await extractFromStorage(storage, attachment);
  const body = raw ? cleanBody(raw) : "";

  // Se l'estrazione non produce testo utile, archivia comunque l'esito per non
  // riprovare ogni ciclo (l'allegato potrebbe essere una scansione immagine).
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

/**
 * Estrae il testo pulito in Markdown dall'allegato PDF principale delle
 * pubblicazioni non ancora elaborate (markdownExtractedAt IS NULL) i cui
 * allegati sono già stati archiviati (detailFetchedAt IS NOT NULL). Best-effort,
 * limitato per ciclo, con un piccolo pool di concorrenza. Non solleva mai
 * eccezioni: i fallimenti lasciano markdownExtractedAt NULL per ritentare al
 * ciclo successivo.
 */
export async function extractDocumentMarkdown(): Promise<{
  processed: number;
  withText: number;
}> {
  let storage: ObjectStorageService;
  try {
    storage = new ObjectStorageService();
    storage.getPublicObjectSearchPaths();
  } catch (err) {
    logger.warn(
      { err },
      "Document Markdown extraction skipped: object storage not configured",
    );
    return { processed: 0, withText: 0 };
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

  if (pending.length === 0) return { processed: 0, withText: 0 };

  let processed = 0;
  let withText = 0;
  const queue = [...pending];

  async function worker(): Promise<void> {
    for (;;) {
      const next = queue.shift();
      if (!next) break;
      try {
        const ok = await extractOne(storage, next);
        processed += 1;
        if (ok) withText += 1;
      } catch (err) {
        // Fallimento transitorio: lascia markdownExtractedAt NULL per ritentare.
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
    { processed, withText, source: "document-markdown" },
    "Document Markdown extraction cycle complete",
  );
  return { processed, withText };
}
