import {
  MigrationError,
  reportMigrationStatus,
  type MigrationStatus,
} from "@workspace/db";
import { logger } from "./logger";
import { sendEmail } from "./email";

/**
 * Writes a single, scannable line summarising the database's migration state at
 * startup so a deploy can be verified at a glance from the logs: which migration
 * the database is on, how many are applied vs. committed, and whether anything
 * is still pending. A non-empty `pendingTags` after `runMigrations()` succeeded
 * means migrations exist on disk that the database has not applied — surface it
 * as a warning rather than an info line.
 */
export function logMigrationStatus(status: MigrationStatus): void {
  const base = {
    lastAppliedMigration: status.lastAppliedTag,
    appliedCount: status.appliedCount,
    journalCount: status.journalCount,
    pendingCount: status.pendingTags.length,
  };

  if (status.pendingTags.length > 0) {
    logger.warn(
      { ...base, pendingMigrations: status.pendingTags },
      `Database migration state: on "${status.lastAppliedTag ?? "(none)"}" ` +
        `with ${status.pendingTags.length} migration(s) still pending. ` +
        `This usually means a new migration was deployed but not applied — ` +
        `run: pnpm --filter @workspace/db run migrate, then restart the API server.`,
    );
    return;
  }

  logger.info(
    base,
    `Database migration state: up to date on "${status.lastAppliedTag ?? "(none)"}" ` +
      `(${status.appliedCount}/${status.journalCount} applied).`,
  );
}

/**
 * Fetches the live migration status for the health endpoint. Read-only: it never
 * applies or records anything, so it is safe to call on every request.
 */
export async function getMigrationHealth(): Promise<MigrationStatus> {
  return reportMigrationStatus();
}

/**
 * The non-"ok" migration states that warrant actively alerting the team after a
 * deploy:
 * - `pending`  — `runMigrations()` succeeded but the database is still behind
 *                the shipped migrations (a new migration was deployed but not
 *                applied). Carries the live {@link MigrationStatus}.
 * - `aborted`  — the migration run threw {@link MigrationError} (the batch is
 *                atomic, so nothing was applied). Carries the full error so the
 *                alert can name the phase, detected state and rolled-back set.
 * - `failed`   — the run threw a non-{@link MigrationError} (e.g. the database
 *                was unreachable), so we have no structured payload to reuse.
 */
export type MigrationAlert =
  | { kind: "pending"; status: MigrationStatus }
  | { kind: "aborted"; error: MigrationError }
  | { kind: "failed"; error: unknown };

interface MigrationAlertEmail {
  subject: string;
  html: string;
  text: string;
  /** Flat fields summarising the alert for structured logging. */
  logFields: Record<string, unknown>;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function migrationList(tags: string[]): string {
  return tags.length > 0 ? tags.join(", ") : "(nessuna)";
}

const REMEDY =
  "Per applicare le migrazioni manualmente: " +
  "pnpm --filter @workspace/db run migrate, poi riavviare l'API server.";

/**
 * Renders the alert email for a non-"ok" migration state. Pure: it only formats
 * the supplied {@link MigrationStatus} / {@link MigrationError} payload, so it is
 * trivially unit-testable. The body always names the detected state and the
 * affected migration(s).
 */
export function buildMigrationAlertEmail(
  alert: MigrationAlert,
): MigrationAlertEmail {
  if (alert.kind === "pending") {
    const { status } = alert;
    const pending = status.pendingTags;
    const last = status.lastAppliedTag ?? "(nessuna)";
    const summary =
      `Il deploy è andato a buon fine ma il database è rimasto indietro: ` +
      `${pending.length} migrazione/i in sospeso non sono state applicate. ` +
      `L'ingestione e le funzioni che dipendono dallo schema potrebbero non ` +
      `funzionare finché il database non viene aggiornato.`;
    return {
      subject: `[Lamezia Trasparente] Database non aggiornato dopo il deploy (${pending.length} migrazione/i in sospeso)`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1a1a1a; line-height: 1.6;">
          <h2 style="margin-bottom: 8px;">Database non aggiornato dopo il deploy</h2>
          <p>${summary}</p>
          <p><strong>Stato rilevato:</strong> migrazioni in sospeso (pending)</p>
          <p><strong>Ultima migrazione applicata:</strong> ${escapeHtml(last)}</p>
          <p><strong>Applicate / totali:</strong> ${status.appliedCount} / ${status.journalCount}</p>
          <p><strong>Migrazioni in sospeso:</strong> ${escapeHtml(migrationList(pending))}</p>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />
          <p style="font-size:12px;color:#666;">${escapeHtml(REMEDY)}</p>
        </div>`,
      text:
        `Database non aggiornato dopo il deploy.\n\n${summary}\n\n` +
        `Stato rilevato: migrazioni in sospeso (pending)\n` +
        `Ultima migrazione applicata: ${last}\n` +
        `Applicate / totali: ${status.appliedCount} / ${status.journalCount}\n` +
        `Migrazioni in sospeso: ${migrationList(pending)}\n\n${REMEDY}`,
      logFields: {
        state: "pending",
        lastAppliedMigration: status.lastAppliedTag,
        appliedCount: status.appliedCount,
        journalCount: status.journalCount,
        pendingMigrations: pending,
      },
    };
  }

  if (alert.kind === "aborted") {
    const { error } = alert;
    const cause = error.cause instanceof Error ? error.cause.message : String(error.cause);
    const pending = error.pendingMigrations;
    const summary =
      `L'aggiornamento del database si è interrotto durante la fase ` +
      `"${error.phase}" (stato rilevato: ${error.detectedState}). Le migrazioni ` +
      `vengono applicate in un'unica transazione, quindi nessuna è stata ` +
      `applicata: il database è rimasto allo stato precedente. L'ingestione non ` +
      `verrà avviata finché il problema non è risolto.`;
    return {
      subject: `[Lamezia Trasparente] Aggiornamento database interrotto dopo il deploy (fase ${error.phase})`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1a1a1a; line-height: 1.6;">
          <h2 style="margin-bottom: 8px;">Aggiornamento database interrotto dopo il deploy</h2>
          <p>${summary}</p>
          <p><strong>Stato rilevato:</strong> ${escapeHtml(error.detectedState)}</p>
          <p><strong>Fase fallita:</strong> ${escapeHtml(error.phase)}</p>
          <p><strong>Migrazioni tentate (annullate):</strong> ${escapeHtml(migrationList(pending))}</p>
          <p><strong>Errore:</strong> ${escapeHtml(cause)}</p>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />
          <p style="font-size:12px;color:#666;">${escapeHtml(REMEDY)}</p>
        </div>`,
      text:
        `Aggiornamento database interrotto dopo il deploy.\n\n${summary}\n\n` +
        `Stato rilevato: ${error.detectedState}\n` +
        `Fase fallita: ${error.phase}\n` +
        `Migrazioni tentate (annullate): ${migrationList(pending)}\n` +
        `Errore: ${cause}\n\n${REMEDY}`,
      logFields: {
        state: "aborted",
        phase: error.phase,
        detectedState: error.detectedState,
        pendingMigrations: pending,
        cause,
      },
    };
  }

  const cause = alert.error instanceof Error ? alert.error.message : String(alert.error);
  const summary =
    `L'aggiornamento del database non è stato completato dopo il deploy a causa ` +
    `di un errore imprevisto. L'ingestione non verrà avviata finché il problema ` +
    `non è risolto.`;
  return {
    subject: `[Lamezia Trasparente] Aggiornamento database non riuscito dopo il deploy`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1a1a1a; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Aggiornamento database non riuscito dopo il deploy</h2>
        <p>${summary}</p>
        <p><strong>Stato rilevato:</strong> errore imprevisto</p>
        <p><strong>Errore:</strong> ${escapeHtml(cause)}</p>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />
        <p style="font-size:12px;color:#666;">${escapeHtml(REMEDY)}</p>
      </div>`,
    text:
      `Aggiornamento database non riuscito dopo il deploy.\n\n${summary}\n\n` +
      `Stato rilevato: errore imprevisto\n` +
      `Errore: ${cause}\n\n${REMEDY}`,
    logFields: { state: "failed", cause },
  };
}

function opsAlertRecipient(): string | null {
  const raw = process.env.OPS_ALERT_EMAIL?.trim();
  return raw ? raw : null;
}

/**
 * Actively alerts the team when a deploy left the database migrations in a
 * non-"ok" state. Emails the address in `OPS_ALERT_EMAIL` (reusing the existing
 * Resend-backed {@link sendEmail}) with an alert that names the detected state
 * and the affected migration(s), so a bad deploy surfaces immediately instead of
 * only as a log line.
 *
 * Best-effort by design: it always logs the problem first, never throws, and
 * degrades gracefully when no recipient is configured or email delivery is
 * unavailable, so it cannot disrupt startup. Returns true when an alert email
 * was actually dispatched.
 */
export async function alertMigrationProblem(
  alert: MigrationAlert,
): Promise<boolean> {
  try {
    const email = buildMigrationAlertEmail(alert);

    logger.error(
      email.logFields,
      `Database migration is not "ok" after deploy — alerting the team: ${email.subject}`,
    );

    const to = opsAlertRecipient();
    if (!to) {
      logger.warn(
        email.logFields,
        "Migration alert email not sent: OPS_ALERT_EMAIL is not set. " +
          "Set it to the team's address to receive deploy migration alerts.",
      );
      return false;
    }

    const sent = await sendEmail({
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    if (sent) {
      logger.info({ to, state: email.logFields["state"] }, "Migration alert email dispatched.");
    }
    return sent;
  } catch (err) {
    logger.error({ err }, "Failed to send the migration alert email.");
    return false;
  }
}
