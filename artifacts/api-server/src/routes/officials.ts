import { Router, type IRouter } from "express";
import {
  db,
  officialsTable,
  officialActivitiesTable,
  officialRemunerationsTable,
  officialDeclarationsTable,
  officialVotesTable,
  organiTable,
  organiMembersTable,
  publicationsTable,
  OFFICIAL_STATUSES,
  type Official,
  type OfficialActivity,
  type OfficialRemuneration,
  type OfficialDeclaration,
  type OfficialStatusValue,
} from "@workspace/db";
import { and, eq, asc, desc, ilike, inArray } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import { CreateOfficialBody, UpdateOfficialBody } from "@workspace/api-zod";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";

const router: IRouter = Router();

const VOTE_VALUES = ["favorevole", "contrario", "astenuto", "assente"] as const;

function sanitizeText(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
}

function cleanOptional(value: string | undefined | null): string | null {
  if (typeof value !== "string") return null;
  const cleaned = sanitizeText(value);
  return cleaned ? cleaned : null;
}

// Restituisce lo stato validato (default "in_carica" se assente) oppure null se
// il valore fornito non è ammesso dal vincolo di check sul DB.
function resolveOfficialStatus(
  value: string | undefined | null,
): OfficialStatusValue | null {
  const cleaned = cleanOptional(value);
  if (!cleaned) return "in_carica";
  return OFFICIAL_STATUSES.includes(cleaned as OfficialStatusValue)
    ? (cleaned as OfficialStatusValue)
    : null;
}

function parseDate(value: string | undefined | null): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function cleanUrl(value: string | undefined | null): string | null {
  const cleaned = cleanOptional(value);
  if (!cleaned) return null;
  try {
    const url = new URL(cleaned);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return cleaned;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Validates the publication ids referenced by votes. Returns the subset that
 * exist and are delibere. Votes can only target delibere, keeping per-person
 * voting records consistent with the delibera breakdown endpoint.
 */
async function resolveDeliberaVoteIds(
  votes: { publicationId: number }[] | undefined,
): Promise<{ requested: number[]; valid: Set<number> }> {
  const requested = [...new Set((votes ?? []).map((v) => v.publicationId))];
  if (!requested.length) {
    return { requested, valid: new Set() };
  }
  const rows = await db
    .select({ id: publicationsTable.id })
    .from(publicationsTable)
    .where(
      and(
        inArray(publicationsTable.id, requested),
        eq(publicationsTable.category, "delibera"),
      ),
    );
  return { requested, valid: new Set(rows.map((r) => r.id)) };
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function generateUniqueSlug(
  base: string,
  excludeId?: number,
): Promise<string> {
  const root = slugify(base) || "soggetto";
  let candidate = root;
  let suffix = 1;
  for (;;) {
    const [existing] = await db
      .select({ id: officialsTable.id })
      .from(officialsTable)
      .where(eq(officialsTable.slug, candidate));
    if (!existing || existing.id === excludeId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
}

function mapOfficial(o: Official) {
  return {
    id: o.id,
    name: o.name,
    slug: o.slug,
    role: o.role,
    roleTitle: o.roleTitle,
    group: o.group,
    status: o.status,
    appointmentDate: o.appointmentDate
      ? o.appointmentDate.toISOString()
      : null,
    biography: o.biography,
  };
}

function toIsoDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function mapActivity(a: OfficialActivity) {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    date: a.date ? a.date.toISOString() : null,
  };
}

function mapRemuneration(r: OfficialRemuneration) {
  return {
    id: r.id,
    year: r.year,
    amount: r.amount === null ? null : Number(r.amount),
    type: r.type,
    note: r.note,
  };
}

function mapDeclaration(d: OfficialDeclaration) {
  return {
    id: d.id,
    title: d.title,
    date: d.date ? d.date.toISOString() : null,
    content: d.content,
    url: d.url,
  };
}

async function buildProfile(official: Official) {
  const [activities, remunerations, declarations, votes, organi] =
    await Promise.all([
    db
      .select()
      .from(officialActivitiesTable)
      .where(eq(officialActivitiesTable.officialId, official.id))
      .orderBy(
        asc(officialActivitiesTable.position),
        desc(officialActivitiesTable.date),
        asc(officialActivitiesTable.id),
      ),
    db
      .select()
      .from(officialRemunerationsTable)
      .where(eq(officialRemunerationsTable.officialId, official.id))
      .orderBy(
        desc(officialRemunerationsTable.year),
        asc(officialRemunerationsTable.position),
        asc(officialRemunerationsTable.id),
      ),
    db
      .select()
      .from(officialDeclarationsTable)
      .where(eq(officialDeclarationsTable.officialId, official.id))
      .orderBy(
        asc(officialDeclarationsTable.position),
        desc(officialDeclarationsTable.date),
        asc(officialDeclarationsTable.id),
      ),
    db
      .select({
        publicationId: officialVotesTable.publicationId,
        vote: officialVotesTable.vote,
        oggetto: publicationsTable.oggetto,
        numRegGen: publicationsTable.numRegGen,
        subcategory: publicationsTable.subcategory,
        dataAtto: publicationsTable.dataAtto,
        pubStart: publicationsTable.pubStart,
      })
      .from(officialVotesTable)
      .innerJoin(
        publicationsTable,
        eq(officialVotesTable.publicationId, publicationsTable.id),
      )
      .where(eq(officialVotesTable.officialId, official.id))
      .orderBy(
        desc(publicationsTable.dataAtto),
        desc(publicationsTable.pubStart),
        desc(publicationsTable.id),
      ),
    db
      .select({
        id: organiTable.id,
        type: organiTable.type,
        name: organiTable.name,
        slug: organiTable.slug,
        membershipRole: organiMembersTable.membershipRole,
        termLabel: organiMembersTable.termLabel,
        startDate: organiMembersTable.startDate,
        endDate: organiMembersTable.endDate,
        sourceLabel: organiMembersTable.sourceLabel,
        sourceUrl: organiMembersTable.sourceUrl,
        notes: organiMembersTable.notes,
        position: organiTable.position,
      })
      .from(organiMembersTable)
      .innerJoin(organiTable, eq(organiMembersTable.organoId, organiTable.id))
      .where(eq(organiMembersTable.officialId, official.id))
      .orderBy(asc(organiTable.position), asc(organiTable.id)),
  ]);

  return {
    ...mapOfficial(official),
    activities: activities.map(mapActivity),
    remunerations: remunerations.map(mapRemuneration),
    declarations: declarations.map(mapDeclaration),
    votes: votes.map((v) => ({
      publicationId: v.publicationId,
      vote: v.vote,
      oggetto: v.oggetto,
      numRegGen: v.numRegGen,
      subcategory: v.subcategory,
      dataAtto: v.dataAtto
        ? v.dataAtto.toISOString()
        : v.pubStart
          ? v.pubStart.toISOString()
          : null,
    })),
    organi: organi.map((o) => ({
      id: o.id,
      type: o.type,
      name: o.name,
      slug: o.slug,
      membershipRole: o.membershipRole,
      termLabel: o.termLabel,
      startDate: toIsoDate(o.startDate),
      endDate: toIsoDate(o.endDate),
      sourceLabel: o.sourceLabel,
      sourceUrl: o.sourceUrl,
      notes: o.notes,
      isCurrent: official.status === "in_carica" && o.endDate === null,
    })),
  };
}

type OfficialInput =
  | ReturnType<typeof CreateOfficialBody.parse>
  | ReturnType<typeof UpdateOfficialBody.parse>;

async function applyProfileData(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  officialId: number,
  data: OfficialInput,
  validDeliberaIds: Set<number>,
): Promise<void> {
  await tx
    .delete(officialActivitiesTable)
    .where(eq(officialActivitiesTable.officialId, officialId));
  await tx
    .delete(officialRemunerationsTable)
    .where(eq(officialRemunerationsTable.officialId, officialId));
  await tx
    .delete(officialDeclarationsTable)
    .where(eq(officialDeclarationsTable.officialId, officialId));
  await tx
    .delete(officialVotesTable)
    .where(eq(officialVotesTable.officialId, officialId));

  const activities = (data.activities ?? [])
    .map((a, index) => ({
      officialId,
      title: sanitizeText(a.title),
      description: cleanOptional(a.description),
      date: parseDate(a.date),
      position: index,
    }))
    .filter((a) => a.title);
  if (activities.length) {
    await tx.insert(officialActivitiesTable).values(activities);
  }

  const remunerations = (data.remunerations ?? []).map((r, index) => ({
    officialId,
    year: r.year,
    amount:
      typeof r.amount === "number" && Number.isFinite(r.amount)
        ? r.amount.toFixed(2)
        : null,
    type: sanitizeText(r.type),
    note: cleanOptional(r.note),
    position: index,
  }));
  const validRemunerations = remunerations.filter((r) => r.type);
  if (validRemunerations.length) {
    await tx.insert(officialRemunerationsTable).values(validRemunerations);
  }

  const declarations = (data.declarations ?? [])
    .map((d, index) => ({
      officialId,
      title: sanitizeText(d.title),
      date: parseDate(d.date),
      content: cleanOptional(d.content),
      url: cleanUrl(d.url),
      position: index,
    }))
    .filter((d) => d.title);
  if (declarations.length) {
    await tx.insert(officialDeclarationsTable).values(declarations);
  }

  const seen = new Set<number>();
  const votes = (data.votes ?? [])
    .filter((v) => {
      if (seen.has(v.publicationId)) return false;
      seen.add(v.publicationId);
      if (!validDeliberaIds.has(v.publicationId)) return false;
      return VOTE_VALUES.includes(v.vote as (typeof VOTE_VALUES)[number]);
    })
    .map((v, index) => ({
      officialId,
      publicationId: v.publicationId,
      vote: v.vote,
      position: index,
    }));
  if (votes.length) {
    await tx.insert(officialVotesTable).values(votes);
  }
}

router.get("/officials", async (req, res) => {
  const role = typeof req.query.role === "string" ? req.query.role : undefined;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;

  const conditions = [];
  if (role) conditions.push(eq(officialsTable.role, role));
  if (q) conditions.push(ilike(officialsTable.name, `%${q}%`));

  const rows = await db
    .select()
    .from(officialsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(officialsTable.name));

  res.json(rows.map(mapOfficial));
});

router.get("/officials/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Soggetto non trovato" });
    return;
  }

  const [official] = await db
    .select()
    .from(officialsTable)
    .where(eq(officialsTable.id, id));
  if (!official) {
    res.status(404).json({ error: "Soggetto non trovato" });
    return;
  }

  res.json(await buildProfile(official));
});

router.post("/officials", requireIngestAuth, async (req, res) => {
  const parsed = CreateOfficialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati del soggetto non validi" });
    return;
  }

  const name = sanitizeText(parsed.data.name);
  const role = sanitizeText(parsed.data.role);
  if (!name || !role) {
    res.status(400).json({ error: "Nome e ruolo sono obbligatori" });
    return;
  }

  const status = resolveOfficialStatus(parsed.data.status);
  if (status === null) {
    res.status(400).json({ error: "Stato non valido" });
    return;
  }

  const { requested, valid } = await resolveDeliberaVoteIds(parsed.data.votes);
  if (requested.some((deliberaId) => !valid.has(deliberaId))) {
    res.status(400).json({
      error: "Uno o più voti fanno riferimento a delibere inesistenti",
    });
    return;
  }

  const slug = await generateUniqueSlug(name);

  const official = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(officialsTable)
      .values({
        name,
        slug,
        role,
        roleTitle: cleanOptional(parsed.data.roleTitle),
        group: cleanOptional(parsed.data.group),
        status,
        appointmentDate: parseDate(parsed.data.appointmentDate),
        biography: cleanOptional(parsed.data.biography),
      })
      .returning();
    await applyProfileData(tx, created.id, parsed.data, valid);
    return created;
  });

  res.status(201).json(await buildProfile(official));
});

router.post("/officials/:id", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Soggetto non trovato" });
    return;
  }

  const parsed = UpdateOfficialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati del soggetto non validi" });
    return;
  }

  const [existing] = await db
    .select()
    .from(officialsTable)
    .where(eq(officialsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Soggetto non trovato" });
    return;
  }

  const name = sanitizeText(parsed.data.name);
  const role = sanitizeText(parsed.data.role);
  if (!name || !role) {
    res.status(400).json({ error: "Nome e ruolo sono obbligatori" });
    return;
  }

  const status = resolveOfficialStatus(parsed.data.status);
  if (status === null) {
    res.status(400).json({ error: "Stato non valido" });
    return;
  }

  const { requested, valid } = await resolveDeliberaVoteIds(parsed.data.votes);
  if (requested.some((deliberaId) => !valid.has(deliberaId))) {
    res.status(400).json({
      error: "Uno o più voti fanno riferimento a delibere inesistenti",
    });
    return;
  }

  const slug =
    name === existing.name
      ? existing.slug
      : await generateUniqueSlug(name, existing.id);

  const official = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(officialsTable)
      .set({
        name,
        slug,
        role,
        roleTitle: cleanOptional(parsed.data.roleTitle),
        group: cleanOptional(parsed.data.group),
        status,
        appointmentDate: parseDate(parsed.data.appointmentDate),
        biography: cleanOptional(parsed.data.biography),
        updatedAt: new Date(),
      })
      .where(eq(officialsTable.id, id))
      .returning();
    await applyProfileData(tx, id, parsed.data, valid);
    return updated;
  });

  res.json(await buildProfile(official));
});

router.get("/delibere/:id/votes", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Delibera non trovata" });
    return;
  }

  const [delibera] = await db
    .select()
    .from(publicationsTable)
    .where(
      and(
        eq(publicationsTable.id, id),
        eq(publicationsTable.category, "delibera"),
      ),
    );
  if (!delibera) {
    res.status(404).json({ error: "Delibera non trovata" });
    return;
  }

  const rows = await db
    .select({
      officialId: officialsTable.id,
      name: officialsTable.name,
      slug: officialsTable.slug,
      role: officialsTable.role,
      group: officialsTable.group,
      vote: officialVotesTable.vote,
    })
    .from(officialVotesTable)
    .innerJoin(
      officialsTable,
      eq(officialVotesTable.officialId, officialsTable.id),
    )
    .where(eq(officialVotesTable.publicationId, id))
    .orderBy(asc(officialsTable.name));

  const tally = { favorevole: 0, contrario: 0, astenuto: 0, assente: 0 };
  for (const row of rows) {
    if (row.vote in tally) {
      tally[row.vote as keyof typeof tally] += 1;
    }
  }

  res.json({
    delibera: {
      id: delibera.id,
      progressivo: delibera.progressivo,
      tipologia: delibera.tipologia,
      category: delibera.category,
      subcategory: delibera.subcategory,
      provenienza: delibera.provenienza,
      oggetto: delibera.oggetto,
      dataAtto: delibera.dataAtto ? delibera.dataAtto.toISOString() : null,
      pubStart: delibera.pubStart ? delibera.pubStart.toISOString() : null,
      pubEnd: delibera.pubEnd ? delibera.pubEnd.toISOString() : null,
      numRegSet: delibera.numRegSet,
      numRegGen: delibera.numRegGen,
      cups: delibera.cups,
      pnrrMission: delibera.pnrrMission,
      isPnrr: delibera.isPnrr,
      isNew: delibera.isNew,
      firstSeenAt: delibera.firstSeenAt.toISOString(),
    },
    tally,
    votes: rows,
  });
});

export default router;
