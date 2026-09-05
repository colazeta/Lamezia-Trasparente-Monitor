import {
  createPendingAnacBdncpSnapshot,
  type AnacBdncpSyncSnapshot,
} from "./anacBdncpSync";
import {
  createPendingAnacAuthorityDiscoverySnapshot,
  type AnacAuthorityDiscoverySnapshot,
} from "./anacAuthorityDiscovery";
import {
  buildMultiSourceContractsDataset,
  MULTI_SOURCE_CONTRACTS_SCHEMA_VERSION,
  type MultiSourceContractsDataset,
} from "./multiSourceContractsDataset";
import { extractCigs, extractCups } from "./canonicalAlboTaxonomy";
import {
  parseExplicitAmount,
  type AlboPublicSnapshot,
} from "./contractsSource";

export const STATIC_CONTRACTS_DATA_PATH =
  "data/processed/contracts/lamezia-contracts-current.json";

export const STATIC_CONTRACTS_SCHEMA_VERSION = MULTI_SOURCE_CONTRACTS_SCHEMA_VERSION;

export type StaticContractsDataset = MultiSourceContractsDataset;
export type { AlboPublicSnapshot } from "./contractsSource";
export { parseExplicitAmount } from "./contractsSource";

/**
 * Compatibility entry point. The public contracts dataset is a projection of
 * the canonical Albo corpus reconciled with independent ANAC discovery by
 * contracting-authority tax id. Callers keep one stable entry point while the
 * source model remains explicit in the returned dataset.
 */
export function buildStaticContractsDataset(
  snapshot: AlboPublicSnapshot,
  anacSnapshot: AnacBdncpSyncSnapshot = createPendingAnacBdncpSnapshot(),
  authoritySnapshot: AnacAuthorityDiscoverySnapshot =
    createPendingAnacAuthorityDiscoverySnapshot(),
): StaticContractsDataset {
  return buildMultiSourceContractsDataset(
    snapshot,
    anacSnapshot,
    authoritySnapshot,
  );
}

/**
 * Compatibility helper for consumers expecting one CIG. Prefer extractCigs()
 * in new code. When an act contains both an agreement CIG and a specific
 * contract CIG, the specific-contract identifier takes precedence.
 */
export function extractCig(value: string | null | undefined): string | null {
  const subject = value?.toUpperCase() ?? "";
  const specific = Array.from(
    subject.matchAll(
      /\bC\.?\s*I\.?\s*G\.?\s+CONTRATTO\s+SPECIFICO\s*(?:N(?:\.|°|º)?\s*)?[:\-]?\s*([A-Z0-9]{10})\b/giu,
    ),
  )
    .map((match) => match[1]?.toUpperCase())
    .filter((candidate): candidate is string => Boolean(candidate));
  return specific.at(-1) ?? extractCigs(value).at(-1) ?? null;
}

/** Compatibility helper for single-CUP consumers. Prefer extractCups(). */
export function extractCup(value: string | null | undefined): string | null {
  return extractCups(value)[0] ?? null;
}
