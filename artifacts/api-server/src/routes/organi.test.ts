import { describe, it, expect, afterAll, afterEach } from "vitest";
import { eq, inArray } from "drizzle-orm";
import request from "supertest";

import app from "../app";
import {
  db,
  pool,
  CURRENT_INSTITUTIONAL_OFFICIALS,
  INSTITUTIONAL_POLITICI_SOURCE,
  organiTable,
  organiMembersTable,
  officialsTable,
} from "@workspace/db";

const createdOrganoIds: number[] = [];
const createdOfficialIds: number[] = [];

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  if (createdOrganoIds.length) {
    await db
      .delete(organiMembersTable)
      .where(inArray(organiMembersTable.organoId, createdOrganoIds));
  }
  if (createdOfficialIds.length) {
    await db
      .delete(officialsTable)
      .where(inArray(officialsTable.id, createdOfficialIds.splice(0)));
  }
  if (createdOrganoIds.length) {
    await db
      .delete(organiTable)
      .where(inArray(organiTable.id, createdOrganoIds.splice(0)));
  }
});

describe("organi historical memberships", () => {
  it("includes the verified current institutional roster", () => {
    expect(INSTITUTIONAL_POLITICI_SOURCE.url).toBe(
      "https://www.comune.lamezia-terme.cz.it/it/page/politici",
    );
    expect(CURRENT_INSTITUTIONAL_OFFICIALS).toHaveLength(31);
    expect(
      CURRENT_INSTITUTIONAL_OFFICIALS.filter((o) => o.role === "sindaco"),
    ).toHaveLength(1);
    expect(
      CURRENT_INSTITUTIONAL_OFFICIALS.filter((o) => o.role === "assessore"),
    ).toHaveLength(7);
    expect(
      CURRENT_INSTITUTIONAL_OFFICIALS.filter((o) => o.role === "consigliere"),
    ).toHaveLength(23);
    expect(CURRENT_INSTITUTIONAL_OFFICIALS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Mario Murone",
          role: "sindaco",
          roleTitle: "Sindaco",
        }),
        expect.objectContaining({
          name: "Maria Grandinetti",
          role: "consigliere",
          roleTitle: "Presidente del Consiglio Comunale",
        }),
        expect.objectContaining({
          name: "Michelangelo Cardamone",
          role: "assessore",
          roleTitle: "Vicesindaco",
        }),
        expect.objectContaining({
          name: "Tranquillo Paradiso",
          role: "assessore",
        }),
      ]),
    );
  });

  it("separates current composition from historical terms", async () => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const [organo] = await db
      .insert(organiTable)
      .values({
        type: "consiglio",
        name: `Consiglio Test ${unique}`,
        slug: `consiglio-test-${unique}`,
        description: "Organo test per storico composizioni.",
        position: 999,
      })
      .returning();
    createdOrganoIds.push(organo.id);

    const [current] = await db
      .insert(officialsTable)
      .values({
        name: `Corrente Test ${unique}`,
        slug: `corrente-test-${unique}`,
        role: "consigliere",
        status: "in_carica",
      })
      .returning();
    const [historical] = await db
      .insert(officialsTable)
      .values({
        name: `Storico Test ${unique}`,
        slug: `storico-test-${unique}`,
        role: "consigliere",
        status: "cessato",
      })
      .returning();
    createdOfficialIds.push(current.id, historical.id);

    await db.insert(organiMembersTable).values([
      {
        organoId: organo.id,
        officialId: current.id,
        membershipRole: "Consigliere",
        termLabel: "Mandato corrente",
        startDate: new Date("2024-06-25T00:00:00.000Z"),
        sourceLabel: "Fonte test corrente",
        notes: "Riga corrente di test.",
        position: 0,
      },
      {
        organoId: organo.id,
        officialId: historical.id,
        membershipRole: "Consigliere",
        termLabel: "Mandato precedente",
        startDate: new Date("2019-06-01T00:00:00.000Z"),
        endDate: new Date("2024-06-24T00:00:00.000Z"),
        sourceLabel: "Fonte test storica",
        notes: "Riga storica di test.",
        position: 1,
      },
    ]);

    const res = await request(app).get(`/api/organi/${organo.slug}`);

    expect(res.status).toBe(200);
    expect(res.body.memberCount).toBe(1);
    expect(res.body.historyCount).toBe(2);
    expect(res.body.members).toHaveLength(1);
    expect(res.body.members[0].officialId).toBe(current.id);
    expect(res.body.terms).toHaveLength(2);
    expect(
      res.body.terms.some(
        (term: { label: string; status: string }) =>
          term.label === "Mandato precedente" && term.status === "historical",
      ),
    ).toBe(true);

    const profileRes = await request(app).get(`/api/officials/${historical.id}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.organi[0]).toMatchObject({
      id: organo.id,
      termLabel: "Mandato precedente",
      isCurrent: false,
    });

    await db.delete(organiMembersTable).where(eq(organiMembersTable.organoId, organo.id));
  });
});
