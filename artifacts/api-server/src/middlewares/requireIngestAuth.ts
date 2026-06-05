import { timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

function getAllowedEditorEmails(): Set<string> {
  const raw = process.env.EDITOR_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Protects editorial and server-to-server ingestion endpoints.
 *
 * Accepts in order:
 *   1. `Authorization: Bearer <INGEST_API_TOKEN>` — server-to-server / CI.
 *   2. Valid Clerk session whose primary email is in the EDITOR_EMAILS allowlist
 *      (so the /redazione panel can call these endpoints directly).
 *
 * Denies by default when neither credential is present or valid.
 * In production, if EDITOR_EMAILS is empty the Clerk path is also denied
 * (misconfiguration should block access, not grant it).
 */
export function requireIngestAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // --- Option 1: Bearer token (server-to-server / CI / legacy) ---
  const expected = process.env.INGEST_API_TOKEN;
  const header = req.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const provided = match?.[1]?.trim() ?? "";

  if (expected && provided && safeEqual(provided, expected)) {
    next();
    return;
  }

  // --- Option 2: Clerk session with allowlisted email ---
  const auth = getAuth(req);
  const userId = auth?.userId;

  if (userId) {
    const allowedEmails = getAllowedEditorEmails();
    const email =
      (auth.sessionClaims?.email as string | undefined)?.toLowerCase() ?? "";

    if (allowedEmails.size === 0) {
      // Development: accept any authenticated Clerk user when no list set
      if (process.env.NODE_ENV === "development") {
        next();
        return;
      }
      // Production: fail closed — misconfiguration must not grant access
      res.status(403).json({
        error: "Accesso non consentito: EDITOR_EMAILS non configurato.",
      });
      return;
    }

    if (email && allowedEmails.has(email)) {
      next();
      return;
    }

    res.status(403).json({
      error: "Accesso non consentito: email non autorizzata.",
      email: email || "(nessuna)",
    });
    return;
  }

  // --- Neither credential present ---
  if (!expected) {
    res.status(503).json({
      error:
        "Endpoint protetto: autenticarsi con Clerk o configurare INGEST_API_TOKEN.",
    });
    return;
  }

  res.status(401).json({ error: "Non autorizzato" });
}
