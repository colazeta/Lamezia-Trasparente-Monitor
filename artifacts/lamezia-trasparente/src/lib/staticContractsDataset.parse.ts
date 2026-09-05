import type { Contract } from "@workspace/api-client-react";
import type { CanonicalProcurementRecord } from "./staticContractsDataset.types";

export function extractCig(value: string | null | undefined): string | null {
  return extractAllCigs(value).at(-1) ?? null;
}

export function extractAllCigs(value: string | null | undefined): string[] {
  const subject = value?.toUpperCase() ?? "";
  return Array.from(
    new Set(
      Array.from(
        subject.matchAll(
          /(?:\bCIG\b|\bC\s*\.\s*I\s*\.\s*G\s*\.)(?:\s+(?:AQ|CONTRATTO\s+SPECIFICO))?(?:\s*(?:N(?:\.|°|º)?|NR\.?))?\s*[:\-]?\s*([A-Z0-9]{10})\b/gu,
        ),
      ).map((match) => match[1]),
    ),
  );
}

export function extractCup(value: string | null | undefined): string | null {
  const candidates = Array.from(
    (value?.toUpperCase() ?? "").matchAll(
      /\bCUP\b(?:\s*(?:N(?:\.|°|º)?|NR\.?))?\s*[:\-]?\s*([A-Z0-9]{15})\b/gu,
    ),
  );
  return candidates.at(-1)?.[1] ?? null;
}

export function parseExplicitAmount(value: string | null | undefined): number {
  const subject = value ?? "";
  const patterns = [
    /(?:€|EURO)\s*([0-9][0-9.\s]*(?:,[0-9]{1,2})?)/iu,
    /\bIMPORTO(?:\s+(?:COMPLESSIVO|TOTALE))?(?:\s+DI|\s+PARI\s+A)?\s*[:=€]?\s*([0-9][0-9.\s]*(?:,[0-9]{1,2})?)/iu,
    /([0-9][0-9.\s]*(?:,[0-9]{1,2})?)\s*(?:€|EURO)\b/iu,
  ];
  for (const pattern of patterns) {
    const parsed = parseItalianNumber(subject.match(pattern)?.[1]);
    if (parsed > 0) return parsed;
  }
  return 0;
}

export function contractCigs(record: CanonicalProcurementRecord): string[] {
  const subject = cleanText(record.source_record.subject).toUpperCase();
  const specific = Array.from(
    subject.matchAll(
      /\bCIG\s+CONTRATTO\s+SPECIFICO(?:\s*(?:N(?:\.|°|º)?|NR\.?))?\s*[:\-]?\s*([A-Z0-9]{10})\b/gu,
    ),
  ).map((match) => match[1]);
  return specific.length > 0
    ? Array.from(new Set(specific))
    : record.identifiers.cigs;
}

export function deriveProcedure(subject: string): {
  label: string;
  directAward: boolean;
} {
  if (/AFFIDAMENTO\s+DIRETTO/iu.test(subject)) {
    return { label: "Affidamento diretto dichiarato nell'oggetto", directAward: true };
  }
  if (/PROCEDURA\s+APERTA/iu.test(subject)) {
    return { label: "Procedura aperta dichiarata nell'oggetto", directAward: false };
  }
  if (/PROCEDURA\s+NEGOZIATA/iu.test(subject)) {
    return { label: "Procedura negoziata dichiarata nell'oggetto", directAward: false };
  }
  return {
    label: "Non determinabile dai campi public-safe degli atti",
    directAward: false,
  };
}

export function deriveAcquisitionTool(subject: string): string | null {
  if (/\bMEPA\b|MERCATO\s+ELETTRONICO/iu.test(subject)) {
    return "MePA dichiarato nell'oggetto";
  }
  if (/\bCONSIP\b/iu.test(subject)) return "Consip dichiarata nell'oggetto";
  return null;
}

export function extractSupplier(subject: string): string {
  const quoted = subject.match(
    /(?:LIBRERIA|SOCIET[AÀ])\s+["“]([^"”]{2,80})["”]/iu,
  )?.[1];
  if (quoted) return cleanText(quoted);
  const company = subject.match(
    /SOCIET[AÀ]\s+([A-Z0-9][^,.;]{1,70}?\s+(?:S\.?P\.?A\.?|S\.?R\.?L\.?|SNC|SAS))\b/iu,
  )?.[1];
  return company
    ? cleanText(company)
    : "Non disponibile nei campi public-safe degli atti";
}

export function deriveMacrotema(
  themeId: string | null | undefined,
  subject: string,
): NonNullable<Contract["macrotema"]> {
  const themeMap: Record<string, NonNullable<Contract["macrotema"]>> = {
    ambiente_territorio: "ambiente",
    ambiente_energia: "ambiente",
    scuola_educazione: "scuole",
    lavori_infrastrutture: "strade",
    servizi_sociali: "sociale",
    welfare_salute: "sociale",
    cultura_sport_turismo: "cultura",
    mobilita_trasporti: "mobilita",
    mobilita_sicurezza: "mobilita",
  };
  if (themeId && themeMap[themeId]) return themeMap[themeId];
  if (/SCUOL|ASILO|MENSA|BIBLIOTEC|LIBR/iu.test(subject)) return "scuole";
  if (/STRAD|VIABILIT|QUARTIERE|LAVORI|EDIFIC|DEMOLIZ|RICOSTRUZ/iu.test(subject)) return "strade";
  if (/ENERG|RIFIUT|AMBIENT|VERDE/iu.test(subject)) return "ambiente";
  if (/SOCIAL|DISABIL|MINOR|ANZIAN/iu.test(subject)) return "sociale";
  if (/CULTUR|TURIS|SPORT|FEST|LUMINAR/iu.test(subject)) return "cultura";
  if (/TRASPORT|MOBILIT|AUTOBUS/iu.test(subject)) return "mobilita";
  return "altro";
}

export function officialAlboUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "albo.tinnvision.cloud"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function cleanText(value: string | null | undefined): string {
  return value?.replace(/\s+/gu, " ").trim() ?? "";
}

export function isUnknownSupplier(value: string): boolean {
  return value.startsWith("Non disponibile");
}

function parseItalianNumber(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number(
    value.replace(/\s+/gu, "").replace(/\./gu, "").replace(",", "."),
  );
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
