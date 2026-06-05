import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

/**
 * Editor allowlist: comma-separated email addresses in EDITOR_EMAILS env var.
 * If not set, falls back to INGEST_API_TOKEN bearer check for backwards
 * compatibility with existing server-to-server usage.
 */
function getAllowedEmails(): Set<string> {
  const raw = process.env.EDITOR_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

function checkBearerToken(req: Request): boolean {
  const expected = process.env.INGEST_API_TOKEN;
  if (!expected) return false;
  const header = req.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const provided = match?.[1]?.trim() ?? "";
  if (!provided) return false;
  // Constant-time comparison
  const { timingSafeEqual } = require("node:crypto") as typeof import("node:crypto");
  const bufA = Buffer.from(provided);
  const bufB = Buffer.from(expected);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Protects editorial endpoints.
 * Accepts:
 *   1. Valid Clerk session whose primary email is in the EDITOR_EMAILS allowlist.
 *   2. INGEST_API_TOKEN Bearer token (server-to-server / legacy compatibility).
 */
export function requireEditorAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // --- Option 1: Bearer token (server-to-server / legacy) ---
  if (checkBearerToken(req)) {
    next();
    return;
  }

  // --- Option 2: Clerk session ---
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Non autorizzato" });
    return;
  }

  const allowedEmails = getAllowedEmails();

  // If no allowlist is configured:
  // - In development: accept any authenticated Clerk user (so local testing works without ENV setup)
  // - In production: reject (fail closed — misconfiguration should block access, not grant it)
  if (allowedEmails.size === 0) {
    if (process.env.NODE_ENV === "development") {
      next();
      return;
    }
    res.status(403).json({
      error: "Accesso non consentito: EDITOR_EMAILS non configurato.",
    });
    return;
  }

  // Check session claims for email (Clerk includes it in JWT claims)
  const email =
    (auth.sessionClaims?.email as string | undefined)?.toLowerCase() ?? "";

  if (!email || !allowedEmails.has(email)) {
    res.status(403).json({
      error: "Accesso non consentito: email non autorizzata.",
      email: email || "(nessuna)",
    });
    return;
  }

  next();
}
