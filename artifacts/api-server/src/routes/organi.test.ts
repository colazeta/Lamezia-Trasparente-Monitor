import { describe, it, expect, afterAll, afterEach } from "vitest";
import { eq, inArray } from "drizzle-orm";
import request from "supertest";

import app from "../app";
import {
  db,
  pool,
  CURRENT_COUNCIL_MEMBER_SLUGS,
  CURRENT_COUNCIL_SOURCE,
  CURRENT_GIUNTA_MEMBER_SLUGS,
  CURRENT_GIUNTA_SOURCE,
  CURRENT_INSTITUTIONAL_OFFICIALS,
  CURRENT_INSTITUTIONAL_MEMBERSHIPS,
  COMMISSION_2025_SOURCE,
  ELIGENDO_2019_LAMEZIA_SOURCE,
  HISTORICAL_2019_INSTITUTIONAL_MEMBERSHIPS,
  HISTORICAL_2019_INSTITUTIONAL_OFFICIALS,
  HISTORICAL_2025_COMMISSION_COMPOSITIONS,
  HISTORICAL_2025_COMMISSION_MEMBERSHIPS,
  HISTORICAL_2025_COMMISSION_OFFICIALS,
  HISTORICAL_INSTITUTIONAL_OFFICIALS,
  INSTITUTIONAL_COMMISSION_ORGANI,
  INSTITUTIONAL_POLITICI_SOURCE,
  currentInstitutionalMembershipsForOfficial,
  institutionalMembershipsForOfficial,
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
    expect(CURRENT_COUNCIL_MEMBER_SLUGS).toHaveLength(24);
    expect(CURRENT_GIUNTA_MEMBER_SLUGS).toHaveLength(8);
    expect(CURRENT_INSTITUTIONAL_MEMBERSHIPS).toHaveLength(32);

    const officialSlugs = new Set(
      CURRENT_INSTITUTIONAL_OFFICIALS.map((o) => o.slug),
    );
    expect(
      CURRENT_INSTITUTIONAL_MEMBERSHIPS.every((m) =>
        officialSlugs.has(m.officialSlug),
      ),
    ).toBe(true);
    expect(CURRENT_INSTITUTIONAL_OFFICIALS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Mario Murone",
          role: "sindaco",
          roleTitle: "Sindaco",
          profileUrl:
            "https://www.comune.lamezia-terme.cz.it/it/persone/murone-mario",
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

    expect(currentInstitutionalMembershipsForOfficial("mario-murone")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organoSlug: "consiglio-comunale",
          membershipRole: "Sindaco",
          sourceUrl: CURRENT_COUNCIL_SOURCE.url,
        }),
        expect.objectContaining({
          organoSlug: "giunta-comunale",
          membershipRole: "Sindaco (Presidente)",
          sourceUrl: CURRENT_GIUNTA_SOURCE.url,
        }),
      ]),
    );
    expect(
      currentInstitutionalMembershipsForOfficial("maria-grandinetti")[0],
    ).toMatchObject({
      organoSlug: "consiglio-comunale",
      membershipRole: "Presidente del Consiglio",
      sourceUrl: CURRENT_COUNCIL_SOURCE.url,
    });
  });

  it("adds a source-limited historical 2019 administration nucleus", () => {
    expect(ELIGENDO_2019_LAMEZIA_SOURCE.url).toContain(
      "dtel=10%2F11%2F2019",
    );
    expect(HISTORICAL_2019_INSTITUTIONAL_OFFICIALS).toHaveLength(4);
    expect(
      HISTORICAL_2019_INSTITUTIONAL_OFFICIALS.every(
        (official) => official.status === "cessato",
      ),
    ).toBe(true);
    expect(HISTORICAL_2019_INSTITUTIONAL_OFFICIALS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Paolo Mascaro",
          role: "sindaco",
          roleTitle: "Sindaco eletto nel 2019",
          profileUrl: null,
        }),
        expect.objectContaining({
          name: "Ruggero Pegna",
          role: "consigliere",
        }),
        expect.objectContaining({
          name: "Eugenio Guarascio",
          slug: "eugenio-guarascio-2019",
        }),
        expect.objectContaining({
          name: "Rosario Piccioni",
          roleTitle: "Candidato sindaco eletto consigliere comunale",
        }),
      ]),
    );
    expect(HISTORICAL_2019_INSTITUTIONAL_MEMBERSHIPS).toHaveLength(5);
    expect(
      HISTORICAL_2019_INSTITUTIONAL_MEMBERSHIPS.filter(
        (membership) => membership.organoSlug === "consiglio-comunale",
      ),
    ).toHaveLength(4);
    expect(
      HISTORICAL_2019_INSTITUTIONAL_MEMBERSHIPS.filter(
        (membership) => membership.organoSlug === "giunta-comunale",
      ),
    ).toHaveLength(1);
    expect(
      HISTORICAL_2019_INSTITUTIONAL_MEMBERSHIPS.every((membership) =>
        /copertura parziale/i.test(membership.notes),
      ),
    ).toBe(true);
    expect(institutionalMembershipsForOfficial("paolo-mascaro")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organoSlug: "consiglio-comunale",
          membershipRole: "Sindaco",
          sourceUrl: ELIGENDO_2019_LAMEZIA_SOURCE.url,
        }),
        expect.objectContaining({
          organoSlug: "giunta-comunale",
          membershipRole: "Sindaco (Presidente)",
          sourceUrl: ELIGENDO_2019_LAMEZIA_SOURCE.url,
        }),
      ]),
    );
  });

  it("adds the source-limited 2025 permanent commission compositions", () => {
    expect(COMMISSION_2025_SOURCE.url).toContain(
      "commissioni-consiliari-permanenti-prot-7264",
    );
    expect(INSTITUTIONAL_COMMISSION_ORGANI).toHaveLength(7);
    expect(HISTORICAL_2025_COMMISSION_COMPOSITIONS).toHaveLength(7);
    expect(HISTORICAL_2025_COMMISSION_MEMBERSHIPS).toHaveLength(84);
    expect(HISTORICAL_2025_COMMISSION_OFFICIALS).toHaveLength(12);
    expect(HISTORICAL_INSTITUTIONAL_OFFICIALS.length).toBeGreaterThan(4);
    expect(
      HISTORICAL_2025_COMMISSION_OFFICIALS.every(
        (official) =>
          official.status === "cessato" && official.profileUrl === null,
      ),
    ).toBe(true);

    for (const composition of HISTORICAL_2025_COMMISSION_COMPOSITIONS) {
      expect(composition.members).toHaveLength(12);
    }
    expect(
      HISTORICAL_2025_COMMISSION_MEMBERSHIPS.every(
        (membership) =>
          membership.sourceUrl === COMMISSION_2025_SOURCE.url &&
          membership.startDate === "2025-01-27" &&
          membership.endDate === null &&
          membership.termLabel !== "Mandato corrente" &&
          /non certifica una data di cessazione/i.test(membership.notes),
      ),
    ).toBe(true);
    expect(HISTORICAL_2025_COMMISSION_MEMBERSHIPS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organoSlug: "commissione-affari-generali-istituzionali",
          officialSlug: "dario-arcieri-2025",
          membershipRole: "Componente (Gruppo Misto)",
          position: 0,
        }),
        expect.objectContaining({
          organoSlug: "commissione-politiche-occupazionali-giovanili",
          officialSlug: "matteo-folino",
          membershipRole: "Componente (Forza Italia)",
        }),
        expect.objectContaining({
          organoSlug: "commissione-sviluppo-economico-attivita-produttive",
          officialSlug: "ruggero-pegna",
          membershipRole: "Componente (UDC - Nuovo CDU)",
        }),
      ]),
    );
    expect(institutionalMembershipsForOfficial("matteo-folino")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organoSlug: "consiglio-comunale",
          termLabel: "Mandato corrente",
        }),
        expect.objectContaining({
          organoSlug: "commissione-politiche-occupazionali-giovanili",
          termLabel:
            "Commissioni consiliari permanenti 2025 - amministrazione precedente",
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
      {
        organoId: organo.id,
        officialId: current.id,
        membershipRole: "Componente commissione",
        termLabel: "Commissione precedente",
        startDate: new Date("2025-01-27T00:00:00.000Z"),
        sourceLabel: "Fonte test commissione storica",
        notes: "Riga storica senza data fine esplicita.",
        position: 2,
      },
    ]);

    const res = await request(app).get(`/api/organi/${organo.slug}`);

    expect(res.status).toBe(200);
    expect(res.body.memberCount).toBe(1);
    expect(res.body.historyCount).toBe(3);
    expect(res.body.members).toHaveLength(1);
    expect(res.body.members[0].officialId).toBe(current.id);
    expect(res.body.terms).toHaveLength(3);
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

    const currentProfileRes = await request(app).get(`/api/officials/${current.id}`);
    expect(currentProfileRes.status).toBe(200);
    expect(
      currentProfileRes.body.organi.find(
        (o: { termLabel: string }) => o.termLabel === "Commissione precedente",
      ),
    ).toMatchObject({
      id: organo.id,
      termLabel: "Commissione precedente",
      isCurrent: false,
    });

    await db.delete(organiMembersTable).where(eq(organiMembersTable.organoId, organo.id));
  });
});
