import {
  db,
  publicationsTable,
  contractsTable,
  themesTable,
  categoriesTable,
  performanceCategoriesTable,
  performanceIndicatorsTable,
  performanceIndicatorValuesTable,
  attuazionePnrrProjectsTable,
  type Publication,
  type PerformanceIndicator,
} from "@workspace/db";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

// Strato di accesso ai dati condiviso dall'API pubblica REST e dal server MCP,
// così le due superfici espongono esattamente gli stessi dati e filtri. Tutto
// in sola lettura.

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export type Pagination = {
  page: number;
  pageSize: number;
  offset: number;
};

export type Paginated<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export function parsePagination(query: Record<string, unknown>): Pagination {
  const rawPage = Number(query.page);
  const rawSize = Number(query.pageSize);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const pageSize =
    Number.isFinite(rawSize) && rawSize >= 1
      ? Math.min(MAX_PAGE_SIZE, Math.floor(rawSize))
      : DEFAULT_PAGE_SIZE;
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function envelope<T>(
  data: T[],
  total: number,
  { page, pageSize }: Pagination,
): Paginated<T> {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
    },
  };
}

function asBool(value: unknown): boolean | undefined {
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

// --- Documenti (atti / pubblicazioni Albo Pretorio) ---

function mapAttachment(a: {
  name: string;
  tipo: string;
  officialUrl: string;
  storagePath: string | null;
  contentType: string | null;
  size: number | null;
}) {
  return {
    name: a.name,
    officialUrl: a.officialUrl,
    archivedUrl: a.storagePath,
    contentType: a.contentType,
    size: a.size,
  };
}

export function mapDocument(p: Publication) {
  return {
    id: p.id,
    progressivo: p.progressivo,
    tipologia: p.tipologia,
    category: p.category,
    subcategory: p.subcategory,
    provenienza: p.provenienza,
    oggetto: p.oggetto,
    dataAtto: p.dataAtto ? p.dataAtto.toISOString() : null,
    pubStart: p.pubStart ? p.pubStart.toISOString() : null,
    pubEnd: p.pubEnd ? p.pubEnd.toISOString() : null,
    numRegSet: p.numRegSet,
    numRegGen: p.numRegGen,
    cups: p.cups,
    pnrrMission: p.pnrrMission,
    isPnrr: p.isPnrr,
    attachments: (p.attachments ?? []).map(mapAttachment),
    hasMarkdown: Boolean(p.markdownText),
    markdownSource: p.markdownSource,
    markdownExtractedAt: p.markdownExtractedAt
      ? p.markdownExtractedAt.toISOString()
      : null,
  };
}

function documentFilters(query: Record<string, unknown>): SQL[] {
  const conditions: SQL[] = [];
  const q = asString(query.q);
  if (q) {
    const clause = or(
      ilike(publicationsTable.oggetto, `%${q}%`),
      ilike(publicationsTable.tipologia, `%${q}%`),
    );
    if (clause) conditions.push(clause);
  }
  const category = asString(query.category);
  if (category) conditions.push(eq(publicationsTable.category, category));
  const tipologia = asString(query.tipologia);
  if (tipologia) conditions.push(eq(publicationsTable.tipologia, tipologia));

  const from = asString(query.from);
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) {
      conditions.push(gte(publicationsTable.pubStart, d));
    }
  }
  const to = asString(query.to);
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(to)) d.setHours(23, 59, 59, 999);
      conditions.push(lte(publicationsTable.pubStart, d));
    }
  }

  const isPnrr = asBool(query.isPnrr);
  if (isPnrr !== undefined) {
    conditions.push(eq(publicationsTable.isPnrr, isPnrr));
  }
  const hasMarkdown = asBool(query.hasMarkdown);
  if (hasMarkdown === true) {
    conditions.push(isNotNull(publicationsTable.markdownText));
  } else if (hasMarkdown === false) {
    conditions.push(isNull(publicationsTable.markdownText));
  }
  return conditions;
}

export async function listDocuments(
  query: Record<string, unknown>,
): Promise<Paginated<ReturnType<typeof mapDocument>>> {
  const pagination = parsePagination(query);
  const conditions = documentFilters(query);
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(publicationsTable)
      .where(where)
      .orderBy(desc(publicationsTable.pubStart), desc(publicationsTable.id))
      .limit(pagination.pageSize)
      .offset(pagination.offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(publicationsTable)
      .where(where),
  ]);

  return envelope(rows.map(mapDocument), count, pagination);
}

export async function getDocument(
  id: number,
): Promise<ReturnType<typeof mapDocument> | null> {
  if (!Number.isFinite(id)) return null;
  const [row] = await db
    .select()
    .from(publicationsTable)
    .where(eq(publicationsTable.id, id))
    .limit(1);
  return row ? mapDocument(row) : null;
}

export async function getDocumentMarkdown(id: number): Promise<{
  id: number;
  progressivo: string;
  oggetto: string;
  markdownSource: string | null;
  markdownExtractedAt: string | null;
  markdown: string;
} | null> {
  if (!Number.isFinite(id)) return null;
  const [row] = await db
    .select()
    .from(publicationsTable)
    .where(eq(publicationsTable.id, id))
    .limit(1);
  if (!row || !row.markdownText) return null;
  return {
    id: row.id,
    progressivo: row.progressivo,
    oggetto: row.oggetto,
    markdownSource: row.markdownSource,
    markdownExtractedAt: row.markdownExtractedAt
      ? row.markdownExtractedAt.toISOString()
      : null,
    markdown: row.markdownText,
  };
}

// --- Contratti pubblici (ANAC) ---

export function mapContract(c: typeof contractsTable.$inferSelect) {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    supplier: c.supplier,
    amount: Number(c.amount),
    procedureType: c.procedureType,
    status: c.status,
    awardDate: c.awardDate.toISOString(),
    cig: c.cig,
    cup: c.cup,
    stazioneAppaltante: c.stazioneAppaltante,
    acquisitionTool: c.acquisitionTool,
    withoutTender: c.withoutTender,
    withoutMepa: c.withoutMepa,
    anacUrl: c.anacUrl,
    themeId: c.themeId,
    macrotema: c.macrotema,
    latitude: c.latitude !== null ? Number(c.latitude) : null,
    longitude: c.longitude !== null ? Number(c.longitude) : null,
    geoQuartiere: c.geoQuartiere,
  };
}

function contractFilters(query: Record<string, unknown>): SQL[] {
  const conditions: SQL[] = [];
  const search = asString(query.q) ?? asString(query.search);
  if (search) {
    const like = `%${search}%`;
    const clause = or(
      ilike(contractsTable.title, like),
      ilike(contractsTable.description, like),
      ilike(contractsTable.supplier, like),
      ilike(contractsTable.cig, like),
    );
    if (clause) conditions.push(clause);
  }
  const supplier = asString(query.supplier);
  if (supplier) conditions.push(ilike(contractsTable.supplier, `%${supplier}%`));
  const procedureType = asString(query.procedureType);
  if (procedureType) {
    conditions.push(eq(contractsTable.procedureType, procedureType));
  }
  const macrotema = asString(query.macrotema);
  if (macrotema) conditions.push(eq(contractsTable.macrotema, macrotema));

  const minAmount = Number(query.minAmount);
  if (Number.isFinite(minAmount)) {
    conditions.push(gte(contractsTable.amount, minAmount.toString()));
  }
  const maxAmount = Number(query.maxAmount);
  if (Number.isFinite(maxAmount)) {
    conditions.push(lte(contractsTable.amount, maxAmount.toString()));
  }
  const from = asString(query.from);
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) {
      conditions.push(gte(contractsTable.awardDate, d));
    }
  }
  const to = asString(query.to);
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      conditions.push(lte(contractsTable.awardDate, d));
    }
  }
  const themeId = Number(query.themeId);
  if (Number.isFinite(themeId)) {
    conditions.push(eq(contractsTable.themeId, themeId));
  }
  return conditions;
}

export async function listContracts(
  query: Record<string, unknown>,
): Promise<Paginated<ReturnType<typeof mapContract>>> {
  const pagination = parsePagination(query);
  const conditions = contractFilters(query);
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(contractsTable)
      .where(where)
      .orderBy(desc(contractsTable.awardDate), desc(contractsTable.id))
      .limit(pagination.pageSize)
      .offset(pagination.offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(contractsTable)
      .where(where),
  ]);

  return envelope(rows.map(mapContract), count, pagination);
}

export async function getContract(
  id: number,
): Promise<ReturnType<typeof mapContract> | null> {
  if (!Number.isFinite(id)) return null;
  const [row] = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.id, id))
    .limit(1);
  return row ? mapContract(row) : null;
}

// --- Temi di monitoraggio civico ---

function mapTheme(t: {
  id: number;
  title: string;
  slug: string;
  summary: string;
  categoryId: number;
  categoryName: string | null;
  status: string;
  relevanceCount: number;
  shareCount: number;
  followerCount: number;
  updatedAt: Date;
}) {
  return {
    id: t.id,
    title: t.title,
    slug: t.slug,
    summary: t.summary,
    categoryId: t.categoryId,
    categoryName: t.categoryName,
    status: t.status,
    relevanceCount: t.relevanceCount,
    shareCount: t.shareCount,
    followerCount: t.followerCount,
    updatedAt: t.updatedAt.toISOString(),
  };
}

export async function listThemes(
  query: Record<string, unknown>,
): Promise<Paginated<ReturnType<typeof mapTheme>>> {
  const pagination = parsePagination(query);
  const conditions: SQL[] = [];
  const search = asString(query.q) ?? asString(query.search);
  if (search) conditions.push(ilike(themesTable.title, `%${search}%`));
  const categoryId = Number(query.categoryId);
  if (Number.isFinite(categoryId)) {
    conditions.push(eq(themesTable.categoryId, categoryId));
  }
  const status = asString(query.status);
  if (status) conditions.push(eq(themesTable.status, status));
  const where = conditions.length ? and(...conditions) : undefined;

  const select = {
    id: themesTable.id,
    title: themesTable.title,
    slug: themesTable.slug,
    summary: themesTable.summary,
    categoryId: themesTable.categoryId,
    categoryName: categoriesTable.name,
    status: themesTable.status,
    relevanceCount: themesTable.relevanceCount,
    shareCount: themesTable.shareCount,
    followerCount: themesTable.followerCount,
    updatedAt: themesTable.updatedAt,
  };

  const [rows, [{ count }]] = await Promise.all([
    db
      .select(select)
      .from(themesTable)
      .innerJoin(categoriesTable, eq(themesTable.categoryId, categoriesTable.id))
      .where(where)
      .orderBy(desc(themesTable.updatedAt), desc(themesTable.id))
      .limit(pagination.pageSize)
      .offset(pagination.offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(themesTable)
      .where(where),
  ]);

  return envelope(rows.map(mapTheme), count, pagination);
}

export async function getTheme(id: number): Promise<
  | (ReturnType<typeof mapTheme> & {
      description: string;
      contracts: ReturnType<typeof mapContract>[];
    })
  | null
> {
  if (!Number.isFinite(id)) return null;
  const [row] = await db
    .select({
      id: themesTable.id,
      title: themesTable.title,
      slug: themesTable.slug,
      summary: themesTable.summary,
      description: themesTable.description,
      categoryId: themesTable.categoryId,
      categoryName: categoriesTable.name,
      status: themesTable.status,
      relevanceCount: themesTable.relevanceCount,
      shareCount: themesTable.shareCount,
      followerCount: themesTable.followerCount,
      updatedAt: themesTable.updatedAt,
    })
    .from(themesTable)
    .innerJoin(categoriesTable, eq(themesTable.categoryId, categoriesTable.id))
    .where(eq(themesTable.id, id))
    .limit(1);
  if (!row) return null;

  const contracts = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.themeId, id))
    .orderBy(desc(contractsTable.awardDate));

  return {
    ...mapTheme(row),
    description: row.description,
    contracts: contracts.map(mapContract),
  };
}

// --- Performance (indicatori di benessere/efficienza) ---

function mapIndicator(i: PerformanceIndicator) {
  return {
    id: i.id,
    slug: i.slug,
    categoryId: i.categoryId,
    title: i.title,
    description: i.description,
    unit: i.unit,
    source: i.source,
    sourceUrl: i.sourceUrl,
    polarity: i.polarity,
  };
}

export async function listPerformance(): Promise<
  Array<{
    id: number;
    slug: string;
    name: string;
    description: string | null;
    indicators: Array<
      ReturnType<typeof mapIndicator> & {
        latestValue: { value: number; period: string } | null;
        previousValue: { value: number; period: string } | null;
      }
    >;
  }>
> {
  const [categories, indicators, values] = await Promise.all([
    db
      .select()
      .from(performanceCategoriesTable)
      .orderBy(
        asc(performanceCategoriesTable.position),
        asc(performanceCategoriesTable.id),
      ),
    db
      .select()
      .from(performanceIndicatorsTable)
      .orderBy(
        asc(performanceIndicatorsTable.position),
        asc(performanceIndicatorsTable.id),
      ),
    db
      .select({
        indicatorId: performanceIndicatorValuesTable.indicatorId,
        period: performanceIndicatorValuesTable.period,
        value: performanceIndicatorValuesTable.value,
      })
      .from(performanceIndicatorValuesTable)
      .orderBy(
        asc(performanceIndicatorValuesTable.indicatorId),
        asc(performanceIndicatorValuesTable.period),
      ),
  ]);

  const latest = new Map<number, { value: number; period: string }>();
  const previous = new Map<number, { value: number; period: string }>();
  for (const v of values) {
    const prev = latest.get(v.indicatorId);
    if (prev) previous.set(v.indicatorId, prev);
    latest.set(v.indicatorId, { value: Number(v.value), period: v.period });
  }

  const byCategory = new Map<number, PerformanceIndicator[]>();
  for (const ind of indicators) {
    const list = byCategory.get(ind.categoryId) ?? [];
    list.push(ind);
    byCategory.set(ind.categoryId, list);
  }

  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    indicators: (byCategory.get(c.id) ?? []).map((ind) => ({
      ...mapIndicator(ind),
      latestValue: latest.get(ind.id) ?? null,
      previousValue: previous.get(ind.id) ?? null,
    })),
  }));
}

// --- Progetti PNRR (censimento Attuazione) ---

export function mapPnrrProject(p: typeof attuazionePnrrProjectsTable.$inferSelect) {
  return {
    id: p.id,
    sourceId: p.sourceId,
    url: p.url,
    title: p.title,
    cup: p.cup,
    mission: p.mission,
    component: p.component,
    investment: p.investment,
    intervention: p.intervention,
    holder: p.holder,
    attuatore: p.attuatore,
    importoFinanziato:
      p.importoFinanziato != null ? Number(p.importoFinanziato) : null,
    status: p.status,
    startDate: p.startDate ? p.startDate.toISOString() : null,
    endDate: p.endDate ? p.endDate.toISOString() : null,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
  };
}

export async function listPnrr(
  query: Record<string, unknown>,
): Promise<Paginated<ReturnType<typeof mapPnrrProject>>> {
  const pagination = parsePagination(query);
  const conditions: SQL[] = [];
  const search = asString(query.q) ?? asString(query.search);
  if (search) {
    const like = `%${search}%`;
    const clause = or(
      ilike(attuazionePnrrProjectsTable.title, like),
      ilike(attuazionePnrrProjectsTable.intervention, like),
      ilike(attuazionePnrrProjectsTable.cup, like),
    );
    if (clause) conditions.push(clause);
  }
  const mission = asString(query.mission);
  if (mission) conditions.push(eq(attuazionePnrrProjectsTable.mission, mission));
  const status = asString(query.status);
  if (status) conditions.push(eq(attuazionePnrrProjectsTable.status, status));
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(attuazionePnrrProjectsTable)
      .where(where)
      .orderBy(
        desc(attuazionePnrrProjectsTable.publishedAt),
        desc(attuazionePnrrProjectsTable.id),
      )
      .limit(pagination.pageSize)
      .offset(pagination.offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(attuazionePnrrProjectsTable)
      .where(where),
  ]);

  return envelope(rows.map(mapPnrrProject), count, pagination);
}
