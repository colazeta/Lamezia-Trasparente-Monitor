import { timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Protects server-to-server content ingestion endpoints that trigger follower
 * email fan-out. Requires an `Authorization: Bearer <token>` header matching the
 * `INGEST_API_TOKEN` secret. Denies by default: if no token is configured the
 * endpoints are disabled, so they can never be abused to send mass emails.
 */
export function requireIngestAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const expected = process.env.INGEST_API_TOKEN;

  if (!expected) {
    res.status(503).json({
      error:
        "Ingestione contenuti disabilitata: configurare INGEST_API_TOKEN per abilitarla.",
    });
    return;
  }

  const header = req.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const provided = match?.[1]?.trim() ?? "";

  if (!provided || !safeEqual(provided, expected)) {
    res.status(401).json({ error: "Non autorizzato" });
    return;
  }

  next();
}
