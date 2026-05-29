import { db, themeFollowersTable, themesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendEmail } from "./email";
import { logger } from "./logger";

const CONTENT_LABELS: Record<string, string> = {
  document: "un nuovo documento",
  act: "un nuovo atto",
  email: "una nuova corrispondenza",
};

function getBaseUrl(): string {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return "";
}

function themeUrl(themeId: number): string {
  const base = getBaseUrl();
  return base ? `${base}/temi/${themeId}` : `/temi/${themeId}`;
}

function unsubscribeUrl(token: string): string {
  const base = getBaseUrl();
  const path = `/api/unsubscribe?token=${encodeURIComponent(token)}`;
  return base ? `${base}${path}` : path;
}

function subscriptionsUrl(token: string): string {
  const base = getBaseUrl();
  const path = `/api/subscriptions?token=${encodeURIComponent(token)}`;
  return base ? `${base}${path}` : path;
}

export async function sendFollowConfirmationEmail(params: {
  email: string;
  themeId: number;
  themeTitle: string;
  unsubscribeToken: string;
}): Promise<void> {
  const link = themeUrl(params.themeId);
  const unsub = unsubscribeUrl(params.unsubscribeToken);
  const manage = subscriptionsUrl(params.unsubscribeToken);
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1a1a1a; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">Ora segui questo tema</h2>
      <p>Riceverai un'email ogni volta che <strong>${escapeHtml(
        params.themeTitle,
      )}</strong> avrà aggiornamenti (nuovi documenti, atti o corrispondenza).</p>
      <p><a href="${link}" style="color: #0b5fff;">Apri il tema su Lamezia Trasparente</a></p>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />
      <p style="font-size:12px;color:#666;">Gestisci tutte le tue iscrizioni dal <a href="${manage}" style="color:#666;">centro iscrizioni</a> oppure <a href="${unsub}" style="color:#666;">annulla l'iscrizione</a> a questo tema.</p>
    </div>`;
  await sendEmail({
    to: params.email,
    subject: `Segui: ${params.themeTitle}`,
    html,
    text: `Ora segui "${params.themeTitle}". Riceverai un'email ad ogni aggiornamento. Apri: ${link}\n\nGestisci tutte le tue iscrizioni: ${manage}\nAnnulla l'iscrizione a questo tema: ${unsub}`,
  });
}

/**
 * Emails a citizen a secure link to their subscription center.
 *
 * When the address follows at least one theme, `token` is that follower's
 * existing unsubscribe token and the email contains a link to the center.
 * When the address follows nothing, `token` is null and the email explains
 * that no subscriptions were found. Either way an email is sent, so the HTTP
 * response can stay identical and avoid leaking whether an address exists.
 */
export async function sendSubscriptionsLinkEmail(params: {
  email: string;
  token: string | null;
}): Promise<void> {
  if (params.token) {
    const manage = subscriptionsUrl(params.token);
    const html = `
      <div style="font-family: Arial, sans-serif; color: #1a1a1a; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Il tuo centro iscrizioni</h2>
        <p>Hai richiesto di gestire le tue iscrizioni ai temi di Lamezia Trasparente.</p>
        <p><a href="${manage}" style="color: #0b5fff;">Apri il centro iscrizioni</a></p>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />
        <p style="font-size:12px;color:#666;">Se non hai richiesto tu questo messaggio, puoi ignorarlo.</p>
      </div>`;
    await sendEmail({
      to: params.email,
      subject: "Le tue iscrizioni su Lamezia Trasparente",
      html,
      text: `Hai richiesto di gestire le tue iscrizioni ai temi di Lamezia Trasparente.\n\nApri il centro iscrizioni: ${manage}\n\nSe non hai richiesto tu questo messaggio, puoi ignorarlo.`,
    });
    return;
  }

  const home = getBaseUrl();
  const homeLine = home
    ? `<p><a href="${home}" style="color: #0b5fff;">Scopri i temi su Lamezia Trasparente</a></p>`
    : "";
  const homeText = home ? `\n\nScopri i temi: ${home}` : "";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1a1a1a; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">Nessuna iscrizione trovata</h2>
      <p>Hai richiesto di gestire le tue iscrizioni, ma questo indirizzo non segue al momento nessun tema.</p>
      <p>Puoi iscriverti ai temi che ti interessano direttamente dalle loro pagine.</p>
      ${homeLine}
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />
      <p style="font-size:12px;color:#666;">Se non hai richiesto tu questo messaggio, puoi ignorarlo.</p>
    </div>`;
  await sendEmail({
    to: params.email,
    subject: "Le tue iscrizioni su Lamezia Trasparente",
    html,
    text: `Hai richiesto di gestire le tue iscrizioni, ma questo indirizzo non segue al momento nessun tema. Puoi iscriverti ai temi che ti interessano direttamente dalle loro pagine.${homeText}\n\nSe non hai richiesto tu questo messaggio, puoi ignorarlo.`,
  });
}

/**
 * Notifies all followers of a theme that new content has been added.
 * Failures are logged and do not interrupt the caller.
 */
export async function notifyThemeFollowers(params: {
  themeId: number;
  contentType: "document" | "act" | "email";
  contentTitle: string;
}): Promise<void> {
  try {
    const [theme] = await db
      .select({ title: themesTable.title })
      .from(themesTable)
      .where(eq(themesTable.id, params.themeId));

    if (!theme) {
      return;
    }

    const followers = await db
      .select({
        email: themeFollowersTable.email,
        unsubscribeToken: themeFollowersTable.unsubscribeToken,
      })
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, params.themeId));

    if (followers.length === 0) {
      return;
    }

    const label = CONTENT_LABELS[params.contentType] ?? "un nuovo aggiornamento";
    const link = themeUrl(params.themeId);

    await Promise.all(
      followers.map((follower) => {
        const unsub = unsubscribeUrl(follower.unsubscribeToken);
        const manage = subscriptionsUrl(follower.unsubscribeToken);
        const html = `
          <div style="font-family: Arial, sans-serif; color: #1a1a1a; line-height: 1.6;">
            <h2 style="margin-bottom: 8px;">Aggiornamento su un tema che segui</h2>
            <p>È stato aggiunto ${label} al tema <strong>${escapeHtml(
              theme.title,
            )}</strong>:</p>
            <p style="padding:12px 16px;background:#f5f5f5;border-radius:8px;">${escapeHtml(
              params.contentTitle,
            )}</p>
            <p><a href="${link}" style="color: #0b5fff;">Vedi l'aggiornamento su Lamezia Trasparente</a></p>
            <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />
            <p style="font-size:12px;color:#666;">Gestisci tutte le tue iscrizioni dal <a href="${manage}" style="color:#666;">centro iscrizioni</a> oppure <a href="${unsub}" style="color:#666;">annulla l'iscrizione</a> a questo tema.</p>
          </div>`;
        return sendEmail({
          to: follower.email,
          subject: `Aggiornamento: ${theme.title}`,
          html,
          text: `È stato aggiunto ${label} al tema "${theme.title}": ${params.contentTitle}. Vedi: ${link}\n\nGestisci tutte le tue iscrizioni: ${manage}\nAnnulla l'iscrizione a questo tema: ${unsub}`,
        });
      }),
    );

    logger.info(
      { themeId: params.themeId, recipients: followers.length },
      "Theme follower notifications dispatched",
    );
  } catch (err) {
    logger.error(
      { err, themeId: params.themeId },
      "Failed to notify theme followers",
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
