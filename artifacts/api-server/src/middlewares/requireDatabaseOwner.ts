import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

/** A single verified session subject; editorial and ingestion grants do not apply. */
export const requireDatabaseOwner: RequestHandler = (req, res, next) => {
  res.set({
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
  });
  res.vary("Authorization");
  res.vary("Cookie");
  let auth;
  try {
    auth = getAuth(req);
  } catch {
    res.status(503).json({ error: "Autenticazione non disponibile" });
    return;
  }
  if (!auth.userId || !auth.sessionId) {
    res.status(401).json({ error: "Accesso richiesto" });
    return;
  }
  const owner = process.env.DATABASE_ADMIN_USER_ID?.trim();
  const origin = process.env.DATABASE_ADMIN_ORIGIN?.trim();
  let validOrigin = false;
  try {
    validOrigin = Boolean(
      origin &&
      new URL(origin).origin === origin &&
      /^https?:\/\//.test(origin),
    );
  } catch {
    /* fail closed */
  }
  if (!owner || !/^user_[A-Za-z0-9]+$/.test(owner) || !validOrigin) {
    res.status(503).json({ error: "Console database non configurata" });
    return;
  }
  if (
    auth.userId !== owner ||
    auth.sessionClaims?.azp !== origin ||
    (req.get("origin") && req.get("origin") !== origin)
  ) {
    res.status(403).json({ error: "Accesso alla console non consentito" });
    return;
  }
  next();
};
