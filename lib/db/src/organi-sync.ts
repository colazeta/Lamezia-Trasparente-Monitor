import { eq } from "drizzle-orm";
import { db } from "./client";
import {
  organiTable,
  organiMembersTable,
  seduteTable,
  officialsTable,
  publicationsTable,
  sessionReportsTable,
  type Official,
  type Organo,
} from "./schema";

export const ORGANO_TYPES = ["consiglio", "giunta", "commissione"] as const;
export type OrganoType = (typeof ORGANO_TYPES)[number];

type KeystoneOrgano = {
  type: OrganoType;
  slug: string;
  name: string;
  description: string;
  position: number;
};

export const KEYSTONE_ORGANI: KeystoneOrgano[] = [
  {
    type: "consiglio",
    slug: "consiglio-comunale",
    name: "Consiglio Comunale",
    description:
      "Organo di indirizzo e di controllo politico-amministrativo del Comune, composto dal Sindaco e dai consiglieri eletti.",
    position: 0,
  },
  {
    type: "giunta",
    slug: "giunta-comunale",
    name: "Giunta Comunale",
    description:
      "Organo esecutivo del Comune, presieduto dal Sindaco e composto dagli assessori.",
    position: 1,
  },
  {
    type: "commissione",
    slug: "commissioni-consiliari",
    name: "Commissioni Consiliari",
    description:
      "Commissioni permanenti del Consiglio Comunale incaricate dell'istruttoria degli atti.",
    position: 2,
  },
];

/** Maps a convocazione subcategory to the slug of its organo. */
function organoSlugForConvocazione(subcategory: string | null): string {
  switch (subcategory) {
    case "consiglio":
      return "consiglio-comunale";
    case "giunta":
      return "giunta-comunale";
    case "commissione":
    default:
      return "commissioni-consiliari";
  }
}

/** Creates the keystone organi if missing (idempotent, by slug). */
export async function ensureOrgani(): Promise<void> {
  for (const o of KEYSTONE_ORGANI) {
    await db
      .insert(organiTable)
      .values({
        type: o.type,
        slug: o.slug,
        name: o.name,
        description: o.description,
        position: o.position,
      })
      .onConflictDoUpdate({
        target: organiTable.slug,
        set: {
          type: o.type,
          name: o.name,
          description: o.description,
          position: o.position,
          updatedAt: new Date(),
        },
      });
  }
}

/** Returns the membership rows an official should have, derived from role. */
function membershipsForOfficial(
  official: Official,
  bySlug: Map<string, Organo>,
): { organoId: number; membershipRole: string | null }[] {
  const out: { organoId: number; membershipRole: string | null }[] = [];
  const consiglio = bySlug.get("consiglio-comunale");
  const giunta = bySlug.get("giunta-comunale");
  const title = official.roleTitle ?? null;

  switch (official.role) {
    case "sindaco":
      if (giunta)
        out.push({
          organoId: giunta.id,
          membershipRole: "Sindaco (Presidente)",
        });
      if (consiglio)
        out.push({ organoId: consiglio.id, membershipRole: "Sindaco" });
      break;
    case "assessore":
      if (giunta)
        out.push({ organoId: giunta.id, membershipRole: title ?? "Assessore" });
      break;
    case "consigliere":
      if (consiglio) {
        let membershipRole = "Consigliere";
        if (title && /presidente del consiglio/i.test(title)) {
          membershipRole = "Presidente del Consiglio";
        } else if (title && /capogruppo/i.test(title)) {
          membershipRole = title;
        }
        out.push({ organoId: consiglio.id, membershipRole });
      }
      break;
    default:
      break;
  }
  return out;
}

/** Rebuilds organi_members from the officials table (idempotent). */
export async function syncOrganoMemberships(): Promise<void> {
  const organi = await db.select().from(organiTable);
  const bySlug = new Map(organi.map((o) => [o.slug, o]));
  const officials = await db.select().from(officialsTable);

  const rows: {
    organoId: number;
    officialId: number;
    membershipRole: string | null;
    position: number;
  }[] = [];
  for (const official of officials) {
    if (official.status !== "in_carica") continue;
    for (const m of membershipsForOfficial(official, bySlug)) {
      rows.push({
        organoId: m.organoId,
        officialId: official.id,
        membershipRole: m.membershipRole,
        position: rows.length,
      });
    }
  }

  await db.transaction(async (tx) => {
    await tx.delete(organiMembersTable);
    if (rows.length) {
      await tx.insert(organiMembersTable).values(rows);
    }
  });
}

/**
 * Materialises a seduta for every convocazione publication and links the
 * corresponding session_report to it. Idempotent (keyed by publicationId).
 */
export async function syncSedute(): Promise<void> {
  const organi = await db.select().from(organiTable);
  const bySlug = new Map(organi.map((o) => [o.slug, o]));
  const convocazioni = await db
    .select()
    .from(publicationsTable)
    .where(eq(publicationsTable.category, "convocazione"));

  for (const pub of convocazioni) {
    const organo = bySlug.get(organoSlugForConvocazione(pub.subcategory));
    if (!organo) continue;
    const [seduta] = await db
      .insert(seduteTable)
      .values({
        organoId: organo.id,
        publicationId: pub.id,
        type: organo.type,
        date: pub.dataAtto ?? pub.pubStart ?? null,
        agenda: pub.oggetto,
      })
      .onConflictDoUpdate({
        target: seduteTable.publicationId,
        set: {
          organoId: organo.id,
          type: organo.type,
          date: pub.dataAtto ?? pub.pubStart ?? null,
          agenda: pub.oggetto,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (seduta) {
      await db
        .update(sessionReportsTable)
        .set({ sedutaId: seduta.id })
        .where(eq(sessionReportsTable.publicationId, pub.id));
    }
  }
}

/** Full organi/sedute synchronisation. Safe to call repeatedly. */
export async function runOrganiSedutaSync(): Promise<void> {
  await ensureOrgani();
  await syncOrganoMemberships();
  await syncSedute();
}
