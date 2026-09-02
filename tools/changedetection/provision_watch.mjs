#!/usr/bin/env node
import process from "node:process";

export const EXPECTED_CHANGEDETECTION_VERSION = "0.55.8";
export const WATCH_KEY = "pnrr-index";
export const WATCH_TITLE = "LT sentinel · pnrr-index";
export const CANONICAL_URL =
  "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr";
export const CHECK_INTERVAL_MINUTES = 15;

const MIN_SECRET_CHARS = 32;

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function normaliseBaseUrl(value) {
  const url = new URL(value);
  url.pathname = url.pathname.replace(/\/+$/u, "");
  url.search = "";
  url.hash = "";
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("CHANGEDETECTION_BASE_URL must be http(s)");
  }
  return url.href.replace(/\/$/u, "");
}

function isLoopback(hostname) {
  return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1";
}

export function buildNotificationBody() {
  return JSON.stringify(
    {
      schemaVersion: 1,
      sentinel: "changedetection.io",
      watchKey: WATCH_KEY,
      watchUrl: "__WATCH_URL__",
      notificationTimestamp: "__NOTIFICATION_TIMESTAMP__",
    },
    null,
    2,
  )
    .replace('"__WATCH_URL__"', '"{{ watch_url }}"')
    .replace('"__NOTIFICATION_TIMESTAMP__"', "{{ notification_timestamp }}");
}

export function buildNotificationUrl(receiverValue, token, options = {}) {
  if (token.length < MIN_SECRET_CHARS) {
    throw new Error("CHANGE_SENTINEL_WEBHOOK_TOKEN must contain at least 32 characters");
  }

  const receiver = new URL(receiverValue);
  const insecureLocalAllowed = options.allowInsecureLocal === true;
  if (receiver.protocol === "http:") {
    if (!insecureLocalAllowed || !isLoopback(receiver.hostname)) {
      throw new Error("Receiver must use HTTPS except explicit loopback smoke tests");
    }
  } else if (receiver.protocol !== "https:") {
    throw new Error("Receiver URL must use HTTP(S)");
  }

  const scheme = receiver.protocol === "https:" ? "posts:" : "post:";
  const apprise = new URL(receiver.href);
  apprise.protocol = scheme;
  apprise.searchParams.set("+x-lt-sentinel-token", token);
  return apprise.href;
}

export function desiredWatchConfig(notificationUrl) {
  return {
    url: CANONICAL_URL,
    title: WATCH_TITLE,
    fetch_backend: "html_requests",
    time_between_check_use_default: false,
    time_between_check: {
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: CHECK_INTERVAL_MINUTES,
      seconds: 0,
    },
    notification_urls: [notificationUrl],
    notification_title: "LT sentinel change · pnrr-index",
    notification_body: buildNotificationBody(),
    notification_format: "text",
  };
}

function findExistingWatch(watches) {
  const matches = Object.entries(watches ?? {}).filter(([, watch]) =>
    watch && typeof watch === "object" &&
    (watch.title === WATCH_TITLE || watch.url === CANONICAL_URL),
  );
  if (matches.length > 1) {
    throw new Error("Multiple changedetection watches match the LT PNRR sentinel identity");
  }
  return matches[0] ?? null;
}

async function apiRequest(baseUrl, apiKey, path, init = {}) {
  const response = await fetch(`${baseUrl}/api/v1${path}`, {
    ...init,
    headers: {
      "x-api-key": apiKey,
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`changedetection API request failed (${response.status})`);
  }
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function assertProvisionedWatch(value, desired) {
  if (!value || typeof value !== "object") throw new Error("Watch verification returned invalid data");
  if (value.url !== desired.url) throw new Error("Provisioned watch URL mismatch");
  if (value.title !== desired.title) throw new Error("Provisioned watch title mismatch");
  if (value.fetch_backend !== desired.fetch_backend) throw new Error("Provisioned watch fetch backend mismatch");
  if (value.time_between_check_use_default !== false) {
    throw new Error("Provisioned watch unexpectedly uses default cadence");
  }
  if (!sameJson(value.time_between_check, desired.time_between_check)) {
    throw new Error("Provisioned watch cadence mismatch");
  }
  if (!sameJson(value.notification_urls, desired.notification_urls)) {
    throw new Error("Provisioned watch notification target mismatch");
  }
  if (value.notification_body !== desired.notification_body) {
    throw new Error("Provisioned watch notification body mismatch");
  }
}

async function sendTestNotification(baseUrl, uuid, desired) {
  const form = new URLSearchParams();
  form.set("notification_urls", desired.notification_urls[0]);
  form.set("notification_title", desired.notification_title);
  form.set("notification_body", desired.notification_body);
  form.set("notification_format", desired.notification_format);
  form.set("window_url", CANONICAL_URL);

  const response = await fetch(`${baseUrl}/notification/send-test/${encodeURIComponent(uuid)}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form,
    redirect: "manual",
  });
  const text = await response.text();
  if (!response.ok || !text.includes("OK - Sent test notifications")) {
    throw new Error(`changedetection test notification failed (${response.status})`);
  }
}

export async function provisionWatch(config) {
  const baseUrl = normaliseBaseUrl(config.baseUrl);
  const systemInfo = await apiRequest(baseUrl, config.apiKey, "/systeminfo");
  if (systemInfo?.version !== EXPECTED_CHANGEDETECTION_VERSION) {
    throw new Error(
      `changedetection version mismatch: expected ${EXPECTED_CHANGEDETECTION_VERSION}`,
    );
  }

  const notificationUrl = buildNotificationUrl(config.receiverUrl, config.webhookToken, {
    allowInsecureLocal: config.allowInsecureLocal,
  });
  const desired = desiredWatchConfig(notificationUrl);
  const watches = await apiRequest(baseUrl, config.apiKey, "/watch");
  const existing = findExistingWatch(watches);

  let uuid;
  let action;
  if (!existing) {
    const created = await apiRequest(baseUrl, config.apiKey, "/watch", {
      method: "POST",
      body: JSON.stringify(desired),
    });
    uuid = created?.uuid;
    action = "created";
  } else {
    [uuid] = existing;
    await apiRequest(baseUrl, config.apiKey, `/watch/${encodeURIComponent(uuid)}`, {
      method: "PUT",
      body: JSON.stringify(desired),
    });
    action = "updated";
  }

  if (typeof uuid !== "string" || !uuid) {
    throw new Error("changedetection did not return a watch UUID");
  }

  const verified = await apiRequest(baseUrl, config.apiKey, `/watch/${encodeURIComponent(uuid)}`);
  assertProvisionedWatch(verified, desired);

  if (config.sendTest === true) {
    await sendTestNotification(baseUrl, uuid, desired);
  }

  return {
    status: "ok",
    provider: "changedetection.io",
    providerVersion: EXPECTED_CHANGEDETECTION_VERSION,
    watchKey: WATCH_KEY,
    uuid,
    action,
    testNotificationSent: config.sendTest === true,
  };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const result = await provisionWatch({
    baseUrl: requiredEnv("CHANGEDETECTION_BASE_URL"),
    apiKey: requiredEnv("CHANGEDETECTION_API_KEY"),
    receiverUrl: requiredEnv("CHANGE_SENTINEL_RECEIVER_URL"),
    webhookToken: requiredEnv("CHANGE_SENTINEL_WEBHOOK_TOKEN"),
    allowInsecureLocal:
      process.env.CHANGE_SENTINEL_ALLOW_INSECURE_LOCAL === "true",
    sendTest: args.has("--send-test"),
  });
  process.stdout.write(JSON.stringify(result) + "\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(() => {
    process.stderr.write("changedetection watch provisioning failed.\n");
    process.exitCode = 1;
  });
}
