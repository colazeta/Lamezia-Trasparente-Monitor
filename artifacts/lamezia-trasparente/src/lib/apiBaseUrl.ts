import { setBaseUrl } from "@workspace/api-client-react";

const CONFIG_ERROR =
  "VITE_API_BASE_URL deve essere un'origine HTTP(S) o un percorso assoluto, senza credenziali, query o frammenti";

function invalidApiBaseUrl(): never {
  throw new Error(CONFIG_ERROR);
}

export function normalizeApiBaseUrl(
  value: string | null | undefined,
): string | null {
  const candidate = value?.trim();
  if (!candidate || candidate === "/") return null;

  if (candidate.startsWith("/")) {
    if (candidate.startsWith("//")) invalidApiBaseUrl();

    const parsed = new URL(candidate, "https://frontend.invalid");
    if (parsed.search || parsed.hash) invalidApiBaseUrl();

    const pathname = parsed.pathname.replace(/\/+$/, "");
    return pathname || null;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return invalidApiBaseUrl();
  }

  if (
    (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    invalidApiBaseUrl();
  }

  const pathname = parsed.pathname.replace(/\/+$/, "");
  return `${parsed.origin}${pathname}`;
}

export function readConfiguredApiBaseUrl(
  value: string | null | undefined,
  reportInvalid: (error: Error) => void = (error) => console.error(error),
): string | null {
  try {
    return normalizeApiBaseUrl(value);
  } catch (error) {
    reportInvalid(error instanceof Error ? error : new Error(CONFIG_ERROR));
    return null;
  }
}

export const configuredApiBaseUrl = readConfiguredApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL,
);

export function apiUrl(
  path: string,
  baseUrl: string | null = configuredApiBaseUrl,
): string {
  const candidate = path.trim();
  if (/^https?:\/\//i.test(candidate)) return candidate;
  if (candidate.startsWith("//")) invalidApiBaseUrl();

  const pathname = candidate.startsWith("/") ? candidate : `/${candidate}`;
  return baseUrl ? `${baseUrl}${pathname}` : pathname;
}

export function absoluteApiUrl(
  path: string,
  baseUrl: string | null = configuredApiBaseUrl,
): string {
  const resolved = apiUrl(path, baseUrl);
  if (/^https?:\/\//i.test(resolved) || typeof window === "undefined") {
    return resolved;
  }
  return new URL(resolved, window.location.origin).toString();
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}

export function configureGeneratedApiClient(
  baseUrl: string | null = configuredApiBaseUrl,
): void {
  setBaseUrl(baseUrl);
}
