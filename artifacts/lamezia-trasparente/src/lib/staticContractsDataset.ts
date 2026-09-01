import type {
  Contract,
  ContractStoryline,
  FeedStatus,
  LifecyclePhase,
  StorylineIndicators,
} from "@workspace/api-client-react";
import {
  buildAnacBdncpConnectionStatus,
  createPendingAnacBdncpSnapshot,
  type AnacBdncpConnectionStatus,
  type AnacBdncpSyncSnapshot,
} from "./anacBdncpSync";
import { bdncpUrlForCig } from "./bdncp";

export const STATIC_CONTRACTS_DATA_PATH =
  "data/processed/contracts/lamezia-contracts-current.json";

export const STATIC_CONTRACTS_SCHEMA_VERSION = "lamezia-contracts-current.v1";

type AlboAreaTheme = {
  theme_id?: string | null;
};

type AlboPublicItem = {
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
  counts?: {
    acquired?: number;
    publishable?: number;
  };
  known_limits?: string[];
  items?: AlboPublicItem[];
};

export type StaticContractsDataset = {
  schemaVersion: typeof STATIC_CONTRACTS_SCHEMA_VERSION;
  generatedAt: string;
  source: {
    id: "albo_pretorio_cig_current";
    label: string;
    url: string;
    scope: "current-albo-window";
    publicClaim: "atti correnti con CIG";
    limitations: string[];
  };
  coverage: {
    alboItemsAcquired: number;
    publicItems: number;
    cigBearingItems: number;
    contracts: number;
    withCup: number;
    withExplicitAmount: number;
    withExplicitSupplier: number;
  };
  feedStatus: FeedStatus;
  anacConnection: AnacBdncpConnectionStatus;
  contracts: Contract[];
  storylines: Record<string, ContractStoryline>;
};

type ContractPhaseDetails = {
  phase: LifecyclePhase;
  label: string;
};

export function buildStaticContractsDataset(
  snapshot: AlboPublicSnapshot,
  anacSnapshot: AnacBdncpSyncSnapshot = createPendingAnacBdncpSnapshot(),
): StaticContractsDataset {
  const generatedAt = validIsoDate(snapshot.generated_at)
    ? snapshot.generated_at!
    : validIsoDate(snapshot.retrieved_at)
      ? snapshot.retrieved_at!
      : new Date(0).toISOString();
  const sourceUrl =
    officialAlboUrl(snapshot.source_url) ??
    "https://albo.tinnvision.cloud/?ente=00301390795";
  const publicItems = (snapshot.items ?? []).filter(
    (item) =>
      item.public_visibility === "publishable" &&
      item.verification_status === "official_source_acquired",
  );
  const selectedItems = publicItems
    .map((item) => ({ item, cig: extractCig(item.subject) }))
    .filter(
      (entry): entry is { item: AlboPublicItem; cig: string } =>
        entry.cig !== null,
    );

  const contracts = selectedItems
    .map(({ item, cig }) => buildContract(item, cig))
    .filter((contract): contract is Contract => contract !== null)
    .sort(compareContractsNewestFirst);
  const itemsByContractId = new Map<number, AlboPublicItem>();

  for (const { item, cig } of selectedItems) {
    const contract = buildContract(item, cig);
    if (contract) itemsByContractId.set(contract.id, item);
  }

  const storylines = Object.fromEntries(
    contracts.map((contract) => {
      const item = itemsByContractId.get(contract.id);
      return [String(contract.id), buildStoryline(contract, item)];
    }),
  );
  const limitations = uniqueStrings([
    "Il perimetro comprende solo gli atti correnti dell'Albo Pretorio che riportano un CIG; non e' uno storico completo dei contratti del Comune.",
    "Ogni CIG formalmente valido collega la vista ufficiale ANAC; la copertura strutturata resta limitata ai pacchetti mensili dichiarati nello stato della fonte.",
    "Un CIG senza match nello snapshot consultato non risulta per questo assente dalla BDNCP.",
    "Importi, operatori economici, procedure e strumenti di acquisto sono valorizzati solo quando risultano espliciti nell'oggetto pubblico dell'atto.",
    ...(snapshot.known_limits ?? []),
  ]);
  const feedStatus: FeedStatus = {
    source: "albo_pretorio_cig_current",
    label: "Albo Pretorio — atti correnti con CIG",
    url: sourceUrl,
    status: "current-window",
    error: null,
    itemsTotal: contracts.length,
    itemsNew: 0,
    lastCheckedAt: validIsoDate(snapshot.retrieved_at)
      ? snapshot.retrieved_at
      : generatedAt,
    lastUpdatedAt: generatedAt,
  };
  const anacConnection = buildAnacBdncpConnectionStatus(
    anacSnapshot,
    contracts.map((contract) => contract.cig),
  );

  return {
    schemaVersion: STATIC_CONTRACTS_SCHEMA_VERSION,
    generatedAt,
    source: {
      id: "albo_pretorio_cig_current",
      label: snapshot.source?.trim() || "Albo Pretorio Comune di Lamezia Terme",
      url: sourceUrl,
      scope: "current-albo-window",
      publicClaim: "atti correnti con CIG",
      limitations,
    },
    coverage: {
      alboItemsAcquired:
        finiteNonNegative(snapshot.counts?.acquired) ??
        (snapshot.items ?? []).length,
      publicItems:
        finiteNonNegative(snapshot.counts?.publishable) ?? publicItems.length,
      cigBearingItems: contracts.length,
      contracts: contracts.length,
      withCup: contracts.filter((contract) => Boolean(contract.cup)).length,
      withExplicitAmount: contracts.filter((contract) => contract.amount > 0)
        .length,
      withExplicitSupplier: contracts.filter(
        (contract) => !isUnknownSupplier(contract.supplier),
      ).length,
    },
    feedStatus,
    anacConnection,
    contracts,
    storylines,
  };
}

export function extractCig(value: string | null | undefined): string | null {
  const subject = value?.toUpperCase() ?? "";
  const specific = Array.from(
    subject.matchAll(
      /\bCIG\s+CONTRATTO\s+SPECIFICO\s*[:\-]?\s*([A-Z0-9]{10})\b/gu,
    ),
  );
  if (specific.length > 0) return specific.at(-1)?.[1] ?? null;

  const candidates = Array.from(
    subject.matchAll(/\bCIG(?:\s+AQ)?\s*[:\-]?\s*([A-Z0-9]{10})\b/gu),
  );
  return candidates.at(-1)?.[1] ?? null;
}

export function extractCup(value: string | null | undefined): string | null {
  const match = value
    ?.toUpperCase()
    .match(/\bCUP\s*[:\-]?\s*([A-Z0-9]{15})\b/u);
  return match?.[1] ?? null;
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

function buildContract(item: AlboPublicItem, cig: string): Contract | null {
  const id = contractId(item.publication_number, item.public_id);
  if (id === null) return null;

  const subject = cleanText(item.subject) || "Oggetto non disponibile";
  const cup = extractCup(subject);
  const phase = derivePhase(subject);
  const supplier = extractSupplier(subject);
  const referenceDate = validDateOnly(item.act_date)
    ? item.act_date!
    : validDateOnly(item.publication_start)
      ? item.publication_start!
      : "1970-01-01";
  const procedure = deriveProcedure(subject);

  return {
    id,
    title: truncate(
      cleanText(item.presentation?.display_title) || subject,
      180,
    ),
    description: subject,
    supplier,
    amount: parseExplicitAmount(subject),
    procedureType: procedure.label,
    status: phase.label,
    awardDate: `${referenceDate}T00:00:00.000Z`,
    cig,
    cup,
    stazioneAppaltante: "Comune di Lamezia Terme (CF 00301390795)",
    acquisitionTool: deriveAcquisitionTool(subject),
    withoutTender: procedure.directAward,
    withoutMepa: false,
    anacUrl: bdncpUrlForCig(cig),
    themeId: null,
    macrotema: deriveMacrotema(
      item.presentation?.area_theme?.theme_id,
      subject,
    ),
    macrotemaManual: false,
    latitude: null,
    longitude: null,
    geoAddress: null,
    geoQuartiere: null,
    geoSource: null,
    geoManual: false,
    geoVerify: false,
  };
}

function buildStoryline(
  contract: Contract,
  item: AlboPublicItem | undefined,
): ContractStoryline {
  const phase = derivePhase(contract.description);
  const officialDocument = officialAlboUrl(item?.document_url);
  const estimatedAmount = contract.amount > 0 ? contract.amount : null;
  const phaseCounts: Record<string, number> = { [phase.phase]: 1 };
  const indicators: StorylineIndicators = {
    evidenceCount: 1,
    phaseCounts,
    firstEvidenceDate: contract.awardDate,
    lastEvidenceDate: contract.awardDate,
    daysToFirstLiquidazione: null,
    daysToLastLiquidazione: null,
    awardedAmount: contract.amount,
    extraAmount: null,
    extraAmountIsEstimate: false,
    costOverrunPct: null,
    liquidatedAmount: phase.phase === "liquidazione" ? estimatedAmount : null,
    liquidatedAmountIsEstimate:
      phase.phase === "liquidazione" && estimatedAmount !== null,
    status: "in_corso",
  };

  return {
    contract,
    timeline: [
      {
        publicationId: contract.id,
        progressivo: cleanText(item?.publication_number) || String(contract.id),
        phase: phase.phase,
        matchedBy: "cig",
        tipologia: phase.label,
        oggetto: contract.description,
        date: contract.awardDate,
        estimatedAmount,
        attachments: officialDocument
          ? [
              {
                name: `Atto ${cleanText(item?.publication_number) || contract.id}`,
                tipo: "Documento ufficiale",
                officialUrl: officialDocument,
                storagePath: null,
                contentType: null,
                size: null,
              },
            ]
          : [],
      },
    ],
    indicators,
  };
}

function derivePhase(subject: string): ContractPhaseDetails {
  if (
    /\b(COLLAUD|CERTIFICATO\s+DI\s+REGOLARE\s+ESECUZIONE|CRE)\b/iu.test(subject)
  ) {
    return { phase: "collaudo", label: "Atto di conclusione o verifica" };
  }
  if (/\bVARIANT(?:E|I)|PERIZIA\s+DI\s+VARIANTE/iu.test(subject)) {
    return { phase: "variante", label: "Atto di variante" };
  }
  if (/LIQUIDAZ|\bFATTUR|\bSALDO\b|\bACCONTO\b|\bSVINCOLO\b/iu.test(subject)) {
    return { phase: "liquidazione", label: "Atto di liquidazione" };
  }
  if (
    /AFFIDAMENT|AGGIUDIC|DECISIONE\s+A\s+CONTRARRE|DETERMINA(?:ZIONE)?\s+A\s+CONTRARRE/iu.test(
      subject,
    )
  ) {
    return { phase: "affidamento", label: "Atto di affidamento" };
  }
  if (/\bSAL\b|STATO\s+AVANZAMENTO|\bCONTRATTO\b/iu.test(subject)) {
    return { phase: "contratto", label: "Atto di esecuzione" };
  }
  return { phase: "altro", label: "Atto corrente con CIG" };
}

function deriveProcedure(subject: string): {
  label: string;
  directAward: boolean;
} {
  if (/AFFIDAMENTO\s+DIRETTO/iu.test(subject)) {
    return {
      label: "Affidamento diretto dichiarato nell'oggetto",
      directAward: true,
    };
  }
  if (/PROCEDURA\s+APERTA/iu.test(subject)) {
    return {
      label: "Procedura aperta dichiarata nell'oggetto",
      directAward: false,
    };
  }
  if (/PROCEDURA\s+NEGOZIATA/iu.test(subject)) {
    return {
      label: "Procedura negoziata dichiarata nell'oggetto",
      directAward: false,
    };
  }
  return {
    label: "Non determinabile dall'oggetto dell'atto",
    directAward: false,
  };
}

function deriveAcquisitionTool(subject: string): string | null {
  if (/\bMEPA\b|MERCATO\s+ELETTRONICO/iu.test(subject)) {
    return "MePA dichiarato nell'oggetto";
  }
  if (/\bCONSIP\b/iu.test(subject)) {
    return "Consip dichiarata nell'oggetto";
  }
  return null;
}

function extractSupplier(subject: string): string {
  const quoted = subject.match(
    /(?:LIBRERIA|SOCIET[AÀ])\s+["“]([^"”]{2,80})["”]/iu,
  )?.[1];
  if (quoted) return cleanText(quoted);

  const company = subject.match(
    /SOCIET[AÀ]\s+([A-Z0-9][^,.;]{1,70}?\s+(?:S\.?P\.?A\.?|S\.?R\.?L\.?|SNC|SAS))\b/iu,
  )?.[1];
  return company
    ? cleanText(company)
    : "Non disponibile nell'oggetto pubblico dell'atto";
}

function deriveMacrotema(
  themeId: string | null | undefined,
  subject: string,
): NonNullable<Contract["macrotema"]> {
  const themeMap: Record<string, NonNullable<Contract["macrotema"]>> = {
    ambiente_territorio: "ambiente",
    scuola_educazione: "scuole",
    lavori_infrastrutture: "strade",
    servizi_sociali: "sociale",
    cultura_sport_turismo: "cultura",
    mobilita_trasporti: "mobilita",
  };
  if (themeId && themeMap[themeId]) return themeMap[themeId];
  if (/SCUOL|ASILO|MENSA|BIBLIOTEC|LIBR/iu.test(subject)) return "scuole";
  if (
    /STRAD|VIABILIT|QUARTIERE|LAVORI|EDIFIC|DEMOLIZ|RICOSTRUZ/iu.test(subject)
  ) {
    return "strade";
  }
  if (/ENERG|RIFIUT|AMBIENT|VERDE/iu.test(subject)) return "ambiente";
  if (/SOCIAL|DISABIL|MINOR|ANZIAN/iu.test(subject)) return "sociale";
  if (/CULTUR|TURIS|SPORT|FEST|LUMINAR/iu.test(subject)) return "cultura";
  if (/TRASPORT|MOBILIT|AUTOBUS/iu.test(subject)) return "mobilita";
  return "altro";
}

function contractId(
  publicationNumber: string | undefined,
  publicId: string | undefined,
): number | null {
  const match =
    publicationNumber?.match(/^(\d{4})\/(\d{1,6})$/u) ??
    publicId?.match(/albo-(\d{4})-(\d{1,6})$/u);
  if (!match) return null;
  const year = Number(match[1]);
  const sequence = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(sequence)) return null;
  return year * 100_000 + sequence;
}

function compareContractsNewestFirst(a: Contract, b: Contract): number {
  return Date.parse(b.awardDate) - Date.parse(a.awardDate) || b.id - a.id;
}

function officialAlboUrl(value: string | null | undefined): string | null {
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

function parseItalianNumber(value: string | undefined): number {
  if (!value) return 0;
  const normalized = value
    .replace(/\s+/gu, "")
    .replace(/\./gu, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function cleanText(value: string | null | undefined): string {
  return value?.replace(/\s+/gu, " ").trim() ?? "";
}

function truncate(value: string, maxLength: number): string {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function validDateOnly(value: string | null | undefined): boolean {
  return Boolean(
    value &&
    /^\d{4}-\d{2}-\d{2}$/u.test(value) &&
    !Number.isNaN(Date.parse(value)),
  );
}

function validIsoDate(value: string | null | undefined): boolean {
  return Boolean(value && !Number.isNaN(Date.parse(value)));
}

function finiteNonNegative(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => cleanText(value)).filter(Boolean)),
  );
}

function isUnknownSupplier(value: string): boolean {
  return value.startsWith("Non disponibile");
}
