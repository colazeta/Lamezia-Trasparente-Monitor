import type { RequestHandler } from "express";

/** Missing auth configuration is an outage, never an anonymous-access mode. */
export const requireClerkConfiguration: RequestHandler = (_req, res, next) => {
  if (!process.env.CLERK_SECRET_KEY?.trim()) {
    res.set("Cache-Control", "private, no-store");
    res.status(503).json({ error: "Autenticazione non disponibile" });
    return;
  }
  next();
};
