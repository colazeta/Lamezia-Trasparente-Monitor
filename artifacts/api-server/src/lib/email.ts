import { logger } from "./logger";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "Lamezia Trasparente <onboarding@resend.dev>";
}

async function getResendApiKey(): Promise<string | null> {
  if (process.env.RESEND_API_KEY) {
    return process.env.RESEND_API_KEY;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) {
    return null;
  }

  try {
    const res = await fetch(
      `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=resend`,
      {
        headers: {
          Accept: "application/json",
          X_REPLIT_TOKEN: xReplitToken,
        },
      },
    );

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as {
      items?: Array<{ settings?: Record<string, unknown> }>;
    };
    const settings = data.items?.[0]?.settings ?? {};
    const apiKey =
      (settings["api_key"] as string | undefined) ??
      (settings["apiKey"] as string | undefined) ??
      null;
    return apiKey;
  } catch (err) {
    logger.error({ err }, "Failed to fetch Resend credentials");
    return null;
  }
}

/**
 * Sends a transactional email via Resend.
 *
 * Email delivery is optional: if Resend is not connected (no API key available),
 * the email is logged and skipped instead of throwing, so core flows keep working.
 *
 * Returns true if the email was sent, false otherwise.
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const apiKey = await getResendApiKey();

  if (!apiKey) {
    logger.warn(
      { to: params.to, subject: params.subject },
      "Email not sent: Resend is not configured. Connect Resend to enable email delivery.",
    );
    return false;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to: [params.to],
        subject: params.subject,
        html: params.html,
        ...(params.text ? { text: params.text } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error(
        { to: params.to, status: res.status, body },
        "Resend rejected the email",
      );
      return false;
    }

    logger.info({ to: params.to, subject: params.subject }, "Email sent");
    return true;
  } catch (err) {
    logger.error({ err, to: params.to }, "Failed to send email via Resend");
    return false;
  }
}
