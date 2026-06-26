import {
  classifyProcurementIdentifier,
  normalizeCigCandidate,
  type ProcurementIdentifierClassification,
} from "./procurementIdentifiers";

export const BDNCP_APPALTI_URL =
  "https://dati.anticorruzione.it/superset/dashboard/appalti/";

export const ANAC_PVL_URL = "https://pubblicitalegale.anticorruzione.it/";

export const ANAC_DIGITAL_CONTRACTS_URL =
  "https://www.anticorruzione.it/-/digitalizzazione-contratti-pubblici";

export type BdncpBridgeStatus =
  | "formal-cig-search"
  | "fallback-search"
  | "missing-cig";

export interface BdncpSearchBridge {
  kind: "link-search-bridge";
  sourceSystem: "bdncp";
  url: string;
  normalizedCig: string | null;
  cigClassification: ProcurementIdentifierClassification;
  formallyValidCig: boolean;
  status: BdncpBridgeStatus;
  label: string;
  publicClaim: "collegamento parziale";
  publicLimit: string;
}

export function buildBdncpSearchUrl(cig: string | null | undefined): string {
  const classification = classifyProcurementIdentifier(cig);

  if (classification.type === "cig" && classification.formallyValid) {
    return `${BDNCP_APPALTI_URL}?cig=${encodeURIComponent(
      classification.normalized,
    )}`;
  }

  return BDNCP_APPALTI_URL;
}

export function bdncpUrlForCig(cig: string | null | undefined): string | null {
  const classification = classifyProcurementIdentifier(cig);

  if (classification.type !== "cig" || !classification.formallyValid) {
    return null;
  }

  return buildBdncpSearchUrl(classification.normalized);
}

export function buildBdncpSearchBridge(
  cig: string | null | undefined,
): BdncpSearchBridge {
  const cigClassification = classifyProcurementIdentifier(cig);
  const normalizedCig =
    cigClassification.type === "cig" && cigClassification.normalized
      ? normalizeCigCandidate(cig)
      : null;
  const formallyValidCig =
    cigClassification.type === "cig" && cigClassification.formallyValid;
  const hasAnyInput = (cig ?? "").trim().length > 0;

  return {
    kind: "link-search-bridge",
    sourceSystem: "bdncp",
    url: buildBdncpSearchUrl(cig),
    normalizedCig,
    cigClassification,
    formallyValidCig,
    status: formallyValidCig
      ? "formal-cig-search"
      : hasAnyInput
        ? "fallback-search"
        : "missing-cig",
    label: formallyValidCig
      ? `Ricerca BDNCP per CIG ${cigClassification.normalized}`
      : "Ricerca BDNCP da completare",
    publicClaim: "collegamento parziale",
    publicLimit:
      "Il link apre un punto di ricerca ufficiale ANAC/BDNCP e non certifica, da solo, una scheda sincronizzata nella piattaforma locale.",
  };
}

export function isSafeOfficialContractUrl(
  explicitUrl: string | null | undefined,
): boolean {
  const normalizedUrl = explicitUrl?.trim();

  if (!normalizedUrl) {
    return false;
  }

  try {
    const parsed = new URL(normalizedUrl);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "dati.anticorruzione.it" ||
        parsed.hostname === "pubblicitalegale.anticorruzione.it" ||
        parsed.hostname === "www.anticorruzione.it" ||
        parsed.hostname.endsWith(".anticorruzione.it"))
    );
  } catch {
    return false;
  }
}

export function preferredBdncpUrl(
  explicitUrl: string | null | undefined,
  cig: string | null | undefined,
): string | null {
  const normalizedUrl = explicitUrl?.trim();

  if (normalizedUrl && isSafeOfficialContractUrl(normalizedUrl)) {
    return normalizedUrl;
  }

  return bdncpUrlForCig(cig);
}
