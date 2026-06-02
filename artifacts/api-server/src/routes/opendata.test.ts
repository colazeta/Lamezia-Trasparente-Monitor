import { describe, it, expect, afterAll, afterEach } from "vitest";
import { inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import {
  db,
  pool,
  opendataDatasetsTable,
  opendataResourcesTable,
} from "@workspace/db";

const createdDatasetIds: number[] = [];

async function createDataset(
  overrides: Partial<typeof opendataDatasetsTable.$inferInsert> = {},
): Promise<typeof opendataDatasetsTable.$inferSelect> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [dataset] = await db
    .insert(opendataDatasetsTable)
    .values({
      sourceId: `test-${unique}`,
      slug: `dataset-${unique}`,
      title: `Dataset di test ${unique}`,
      description: "Descrizione di test",
      category: "Governo",
      theme: "GOVE",
      frequency: "ANNUAL",
      licenseId: "https://creativecommons.org/licenses/by/4.0/",
      licenseTitle: "CC-BY 4.0",
      holderName: "Comune di Lamezia Terme",
      portalUrl: "https://example.org/dataset/x",
      tags: ["bilancio", "trasparenza"],
      resourceCount: 1,
      metadataModified: new Date("2025-06-01"),
      ...overrides,
    })
    .returning();
  createdDatasetIds.push(dataset.id);
  await db.insert(opendataResourcesTable).values({
    sourceId: `res-${unique}`,
    datasetId: dataset.id,
    name: "Risorsa CSV",
    description: "una risorsa",
    format: "CSV",
    url: "https://example.org/data.csv",
    position: 0,
    lastModified: new Date("2025-06-01"),
  });
  return dataset;
}

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  if (createdDatasetIds.length) {
    // resources cascade on dataset delete
    await db
      .delete(opendataDatasetsTable)
      .where(inArray(opendataDatasetsTable.id, createdDatasetIds.splice(0)));
  }
});

describe("DCAT-AP_IT catalog", () => {
  it("exposes the full catalog as JSON-LD", async () => {
    const ds = await createDataset();
    const res = await request(app).get("/api/opendata/catalog.jsonld");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/ld+json");
    expect(res.body["@context"]).toBeTruthy();
    expect(res.body["@type"]).toContain("dcat:Catalog");
    const datasets = res.body["dcat:dataset"] as Array<Record<string, unknown>>;
    const found = datasets.find(
      (d) => d["dct:identifier"] === ds.sourceId,
    );
    expect(found).toBeTruthy();
    expect(found?.["@type"]).toContain("dcat:Dataset");
    expect((found?.["dcat:theme"] as { "@id": string })["@id"]).toContain(
      "data-theme/GOVE",
    );
    const dists = found?.["dcat:distribution"] as Array<
      Record<string, unknown>
    >;
    expect(dists.length).toBe(1);
    expect((dists[0]["dcat:downloadURL"] as { "@id": string })["@id"]).toBe(
      "https://example.org/data.csv",
    );
  });

  it("exposes a single dataset as JSON-LD", async () => {
    const ds = await createDataset();
    const res = await request(app).get(
      `/api/opendata/datasets/${ds.id}/dcat.jsonld`,
    );
    expect(res.status).toBe(200);
    expect(res.body["dct:identifier"]).toBe(ds.sourceId);
    expect(res.body["@context"]).toBeTruthy();
  });
});

describe("CKAN-compatible Action API", () => {
  it("package_search returns the CKAN envelope", async () => {
    const ds = await createDataset();
    const res = await request(app)
      .get("/api/3/action/package_search")
      .query({ q: ds.title });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result.count).toBeGreaterThanOrEqual(1);
    const pkg = res.body.result.results.find(
      (p: { identifier: string }) => p.identifier === ds.sourceId,
    );
    expect(pkg).toBeTruthy();
    expect(pkg.num_resources).toBe(1);
    expect(pkg.resources[0].url).toBe("https://example.org/data.csv");
  });

  it("package_show resolves by sourceId and slug", async () => {
    const ds = await createDataset();
    const bySource = await request(app)
      .get("/api/3/action/package_show")
      .query({ id: ds.sourceId });
    expect(bySource.status).toBe(200);
    expect(bySource.body.result.title).toBe(ds.title);

    const bySlug = await request(app)
      .get("/api/3/action/package_show")
      .query({ id: ds.slug });
    expect(bySlug.status).toBe(200);
    expect(bySlug.body.result.identifier).toBe(ds.sourceId);
  });

  it("package_show 404s for unknown id with CKAN error envelope", async () => {
    const res = await request(app)
      .get("/api/3/action/package_show")
      .query({ id: "does-not-exist-xyz" });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.__type).toBe("Not Found Error");
  });

  it("package_list and group_list return arrays", async () => {
    await createDataset();
    const list = await request(app).get("/api/3/action/package_list");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.result)).toBe(true);

    const groups = await request(app).get("/api/3/action/group_list");
    expect(groups.status).toBe(200);
    expect(groups.body.result).toContain("Governo");
  });
});
