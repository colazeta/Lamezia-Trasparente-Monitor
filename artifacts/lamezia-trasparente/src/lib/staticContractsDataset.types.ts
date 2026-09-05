import type {
  Contract,
  ContractStoryline,
  FeedStatus,
} from "@workspace/api-client-react";
import type {
  AnacBdncpConnectionStatus,
  AnacBdncpSyncSnapshot,
} from "./anacBdncpSync";

export const STATIC_CONTRACTS_DATA_PATH =
  "data/processed/contracts/lamezia-contracts-current.json";
export const STATIC_CONTRACTS_SCHEMA_VERSION = "lamezia-contracts-current.v1";

export type AlboAreaTheme = { theme_id?: string | null };

export type AlboPublicItem = {
  public_id?: string;
  publication_number?: string;
  publication_start?: string | null;
  act_date?: string | null;
  subject?: string;
  document_url?: string | null;
  verification_status?: string;
  public_visibility?: string;
  presentation?: {
    display_title?: string | null;
    area_theme?: AlboAreaTheme | null;
  } | null;
};

export type AlboPublicSnapshot = {
  source?: string;
  source_url?: string;
  generated_at?: string;
  retrieved_at?: string;
  counts?: { acquired?: number; publishable?: number };
  known_limits?: string[];
  items?: AlboPublicItem[];
};

export type CanonicalProcurementRecord = {
  canonical_id: string;
  public_projection_eligible: boolean;
  source_record: {
    public_id: string | null;
    publication_number: string | null;
    publication_start: string | null;
    act_date: string | null;
    subject: string | null;
    display_title: string | null;
    document_url: string | null;
  };
  taxonomy: {
    existing: { area_theme_id: string | null };
    procurement: {
      classification_status: string;
      relevance: "confirmed" | "possible" | "none" | "unknown";
      phase:
        | "planning"
        | "tender"
        | "award"
        | "execution"
        | "payment"
        | "closure"
        | "other"
        | "unknown";
      administrative_actions: string[];
    };
  };
  identifiers: { cigs: string[]; cups: string[] };
};

export type CanonicalAlboCorpusSnapshot = {
  schema_version: string;
  coverage: {
    records_materialised: number;
    taxonomy_decided: number;
    taxonomy_coverage: number;
    public_projection_eligible: number;
    public_procurement_candidates: number;
    public_procurement_with_cig: number;
    public_procurement_unresolved: number;
  };
  records: CanonicalProcurementRecord[];
};

export type UnresolvedProcurementCandidate = {
  canonicalId: string;
  publicationNumber: string | null;
  title: string;
  relevance: "confirmed" | "possible";
  phase: CanonicalProcurementRecord["taxonomy"]["procurement"]["phase"];
  reason: "missing_cig_in_public_safe_fields";
};

export type StaticContractsDataset = {
  schemaVersion: typeof STATIC_CONTRACTS_SCHEMA_VERSION;
  generatedAt: string;
  source: {
    id: "albo_pretorio_procurement_current";
    label: string;
    url: string;
    scope: "current-albo-window";
    /** Compatibility claim for the materialised Contract list. */
    publicClaim: "atti correnti con CIG";
    /** Research claim for the wider procurement projection, including unresolved candidates. */
    researchClaim: "atti procurement correnti tassonomizzati";
    limitations: string[];
  };
  taxonomy: {
    canonicalCorpusSchemaVersion: string;
    taxonomyCoverage: number;
    taxonomyDecided: number;
  };
  coverage: {
    alboItemsAcquired: number;
    publicItems: number;
    procurementCandidates: number;
    procurementItemsWithCig: number;
    unresolvedProcurementCandidates: number;
    /** @deprecated Compatibility count for the materialised CIG Contract list. */
    cigBearingItems: number;
    contracts: number;
    lifecycleEvents: number;
    withCup: number;
    withExplicitAmount: number;
    withExplicitSupplier: number;
  };
  unresolvedProcurementCandidates: UnresolvedProcurementCandidate[];
  feedStatus: FeedStatus;
  anacConnection: AnacBdncpConnectionStatus;
  contracts: Contract[];
  storylines: Record<string, ContractStoryline>;
};

export type StaticContractsBuilderInput = {
  snapshot: AlboPublicSnapshot;
  anacSnapshot: AnacBdncpSyncSnapshot;
  canonicalCorpus: CanonicalAlboCorpusSnapshot;
};
