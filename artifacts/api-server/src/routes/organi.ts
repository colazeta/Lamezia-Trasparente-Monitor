import { Router, type IRouter } from "express";
import {
  db,
  organiTable,
  organiMembersTable,
  seduteTable,
  officialsTable,
  publicationsTable,
  sessionReportsTable,
  classifyMacrotema,
  type Organo,
  type Publication,
  type Seduta,
} from "@workspace/db";
import { and, eq, asc, desc, inArray, sql } from "drizzle-orm";

import { computeOdgMacrotemi } from "./publications";

const router: IRouter = Router();

function organoRef(o: Pick<Organo, "id" | "type" | "name" | "slug">) {
  return { id: o.id, type: o.type, name: o.name, slug: o.slug };
}

/**
 * Builds a lookup of the publication linked to each seduta, so listings can
 * expose the seduta's macrotema (and the ODG-derived macrotemi) for filtering.
 */
async function publicationsForSedute(
  sedute: Seduta[],
): Promise<Map<number, Publication>> {
  const ids = Array.from(
    new Set(
      sedute
        .map((s) => s.publicationId)
        .filter((id): id is number => id != null),
    ),
  );
  if (!ids.length) return new Map();
  const rows = await db
    .select()
    .from(publicationsTable)
    .where(inArray(publicationsTable.id, ids));
  return new Map(rows.map((r) => [r.id, r]));
}

function mapSeduta(
  s: Seduta,
  organo: Organo | undefined,
  hasReport: boolean,
  pub?: Publication,
) {
  const macrotema = pub
    ? pub.macrotema ?? classifyMacrotema(`${pub.oggetto} ${pub.tipologia ?? ""}`)
    : null;
  const odgMacrotemi = pub ? computeOdgMacrotemi(pub.markdownText ?? null) : [];
  return {
    id: s.id,
    type: s.type,
    date: s.date ? s.date.toISOString() : null,
    agenda: s.agenda,
    hasReport,
    publicationId: s.publicationId,
    organo: organo ? organoRef(organo) : null,
    macrotema,
    odgMacrotemi,
  };
}

/**
 * Returns the set of seduta ids that have an attached session report, keyed for
 * quick lookup. Used to populate the `hasReport` flag on seduta listings.
 */
async function sedutaIdsWithReport(sedutaIds: number[]): Promise<Set<number>> {
  if (!sedutaIds.length) return new Set();
  const rows = await db
    .select({ sedutaId: sessionReportsTable.sedutaId })
    .from(sessionReportsTable);
  return new Set(
    rows
      .map((r) => r.sedutaId)
      .filter((id): id is number => id !== null && sedutaIds.includes(id)),
  );
}

router.get("/organi", async (_req, res) => {
  const organi = await db
    .select()
    .from(organiTable)
    .orderBy(asc(organiTable.position), asc(organiTable.id));

  const memberCounts = await db
    .select({
      organoId: organiMembersTable.organoId,
      count: sql<number>`count(*)::int`,
    })
    .from(organiMembersTable)
    .groupBy(organiMembersTable.organoId);
  const sedutaCounts = await db
    .select({
      organoId: seduteTable.organoId,
      count: sql<number>`count(*)::int`,
    })
    .from(seduteTable)
    .groupBy(seduteTable.organoId);

  const memberMap = new Map(memberCounts.map((m) => [m.organoId, m.count]));
  const sedutaMap = new Map(
    sedutaCounts.map((s) => [s.organoId, s.count]),
  );

  res.json(
    organi.map((o) => ({
      ...organoRef(o),
      description: o.description,
      position: o.position,
      memberCount: memberMap.get(o.id) ?? 0,
      sedutaCount: sedutaMap.get(o.id) ?? 0,
    })),
  );
});

router.get("/organi/:slug", async (req, res) => {
  const slug = req.params.slug;
  const [organo] = await db
    .select()
    .from(organiTable)
    .where(eq(organiTable.slug, slug));
  if (!organo) {
    res.status(404).json({ error: "Organo non trovato" });
    return;
  }

  const members = await db
    .select({
      officialId: officialsTable.id,
      name: officialsTable.name,
      slug: officialsTable.slug,
      role: officialsTable.role,
      roleTitle: officialsTable.roleTitle,
      group: officialsTable.group,
      status: officialsTable.status,
      membershipRole: organiMembersTable.membershipRole,
      position: organiMembersTable.position,
    })
    .from(organiMembersTable)
    .innerJoin(
      officialsTable,
      eq(organiMembersTable.officialId, officialsTable.id),
    )
    .where(eq(organiMembersTable.organoId, organo.id))
    .orderBy(asc(organiMembersTable.position), asc(officialsTable.name));

  const sedute = await db
    .select()
    .from(seduteTable)
    .where(eq(seduteTable.organoId, organo.id))
    .orderBy(desc(seduteTable.date), desc(seduteTable.id));

  const reportSet = await sedutaIdsWithReport(sedute.map((s) => s.id));
  const pubMap = await publicationsForSedute(sedute);

  res.json({
    ...organoRef(organo),
    description: organo.description,
    position: organo.position,
    memberCount: members.length,
    sedutaCount: sedute.length,
    members: members.map((m) => ({
      officialId: m.officialId,
      name: m.name,
      slug: m.slug,
      role: m.role,
      roleTitle: m.roleTitle,
      group: m.group,
      status: m.status,
      membershipRole: m.membershipRole,
    })),
    sedute: sedute.map((s) =>
      mapSeduta(
        s,
        organo,
        reportSet.has(s.id),
        s.publicationId != null ? pubMap.get(s.publicationId) : undefined,
      ),
    ),
  });
});

router.get("/sedute", async (req, res) => {
  const organoSlug =
    typeof req.query.organo === "string" ? req.query.organo : undefined;
  const tipo = typeof req.query.tipo === "string" ? req.query.tipo : undefined;

  const organi = await db.select().from(organiTable);
  const organiById = new Map(organi.map((o) => [o.id, o]));
  const organiBySlug = new Map(organi.map((o) => [o.slug, o]));

  const conditions = [];
  if (organoSlug) {
    const target = organiBySlug.get(organoSlug);
    if (!target) {
      res.json([]);
      return;
    }
    conditions.push(eq(seduteTable.organoId, target.id));
  }
  if (tipo) conditions.push(eq(seduteTable.type, tipo));

  const sedute = await db
    .select()
    .from(seduteTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(seduteTable.date), desc(seduteTable.id));

  const reportSet = await sedutaIdsWithReport(sedute.map((s) => s.id));
  const pubMap = await publicationsForSedute(sedute);

  res.json(
    sedute.map((s) =>
      mapSeduta(
        s,
        s.organoId ? organiById.get(s.organoId) : undefined,
        reportSet.has(s.id),
        s.publicationId != null ? pubMap.get(s.publicationId) : undefined,
      ),
    ),
  );
});

export default router;
