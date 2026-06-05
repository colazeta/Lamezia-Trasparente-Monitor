import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

/**
 * Editor allowlist: comma-separated email addresses in EDITOR_EMAILS env var.
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

/**
 * Protects editorial endpoints.
 * Accepts a valid Clerk session whose primary email is in the EDITOR_EMAILS
 * allowlist. In development, any authenticated Clerk user is accepted when no
 * allowlist is configured.
 */
export function requireEditorAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
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
