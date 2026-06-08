import type { PublicationAttachment } from "@workspace/api-client-react";

export const ALBO_PORTAL_URL =
  "https://albo.tinnvision.cloud/?ente=00301390795";

const CIG_RE = /\b(?:CIG|SMART\s+CIG)[:\s-]*([A-Z0-9]{10})\b/gi;
const AMOUNT_RE =
  /(?:€|euro|importo)\s*(?:di)?\s*(\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})?)/i;
const BENEFICIARY_RE =
  /\b(?:beneficiari[oa]|affidatari[oa]|operatore\s+economico|ditta|societ[aà]|impresa)\b/i;
const PROGRESSIVO_RE = /^\d{4}[\/_-]\d+$/;

export type AlboSourceKind = "document" | "publication" | "portal-fallback";

export type AlboSourceInfo = {
  kind: AlboSourceKind;
  href: string;
  label: string;
  description: string;
  isPunctual: boolean;
};

export function alboExtractionText(
  parts: Array<string | null | undefined>,
): string {
  return parts.filter(Boolean).join(" ");
}

export function extractAlboCigs(text: string | null | undefined): string[] {
  if (!text) return [];
  return Array.from(text.matchAll(CIG_RE), (match) => match[1].toUpperCase());
}

export function extractAlboAmount(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = AMOUNT_RE.exec(text);
  return match ? match[0] : null;
}

export function hasAlboDetectedAmount(text: string | null | undefined): boolean {
  return extractAlboAmount(text) !== null;
}

export function hasAlboBeneficiarySignal(
  text: string | null | undefined,
): boolean {
  return Boolean(text && BENEFICIARY_RE.test(text));
}

export function isReliableAlboProgressivo(
  progressivo: string | null | undefined,
): boolean {
  return Boolean(progressivo && PROGRESSIVO_RE.test(progressivo.trim()));
}

export function getAlboSourceInfo(
  attachments: PublicationAttachment[] | null | undefined,
): AlboSourceInfo {
  const primaryAttachment = attachments?.[0];

  if (primaryAttachment?.storagePath) {
    return {
      kind: "document",
      href: primaryAttachment.storagePath,
      label: "Apri copia archiviata",
      description:
        "Fonte puntuale del documento/allegato: copia archiviata localmente a partire dall'Albo.",
      isPunctual: true,
    };
  }

  if (primaryAttachment?.officialUrl) {
    return {
      kind: "publication",
      href: primaryAttachment.officialUrl,
      label: "Apri allegato sull'Albo",
      description:
        "Fonte puntuale della pubblicazione Albo: collegamento diretto all'allegato ufficiale disponibile.",
      isPunctual: true,
    };
  }

  return {
    kind: "portal-fallback",
    href: ALBO_PORTAL_URL,
    label: "Apri portale Albo",
    description:
      "Fonte non puntuale: fallback al portale Albo quando non è disponibile un link diretto al documento o alla pubblicazione.",
    isPunctual: false,
  };
}

export function describeAlboMatchCriterion(matchedBy: string): string {
  const normalized = matchedBy.trim().toLowerCase();
  const labels: Record<string, string> = {
    cig: "via CIG",
    cup: "via CUP",
    seduta: "via seduta",
    category: "via categoria",
    categoria: "via categoria",
  };

  return labels[normalized] ?? `via ${matchedBy}`;
}
