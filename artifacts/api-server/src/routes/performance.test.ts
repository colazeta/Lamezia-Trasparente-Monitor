import { describe, it, expect, afterEach, afterAll } from "vitest";
import { inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import {
  db,
  pool,
  performanceCategoriesTable,
  performanceIndicatorsTable,
  performanceIndicatorValuesTable,
} from "@workspace/db";

const createdCategoryIds: number[] = [];
const createdIndicatorIds: number[] = [];

async function createCategory(): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [row] = await db
    .insert(performanceCategoriesTable)
    .values({
      slug: `cat-${unique}`,
      name: `Categoria ${unique}`,
      description: "Categoria di test",
    })
    .returning();
  createdCategoryIds.push(row.id);
  return row.id;
}

async function createIndicator(categoryId: number): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [row] = await db
    .insert(performanceIndicatorsTable)
    .values({
      slug: `ind-${unique}`,
      categoryId,
      title: `Indicatore ${unique}`,
      unit: "n.",
    })
    .returning();
  createdIndicatorIds.push(row.id);
  return row.id;
}

async function addValue(
  indicatorId: number,
  period: string,
  value: number,
): Promise<void> {
  await db.insert(performanceIndicatorValuesTable).values({
    indicatorId,
    period,
    value: String(value),
  });
}

type CategoryResponse = {
  id: number;
  indicators: {
    id: number;
    latestValue: { value: number; period: string } | null;
    previousValue: { value: number; period: string } | null;
  }[];
};

function findIndicator(body: CategoryResponse[], indicatorId: number) {
  for (const category of body) {
    const indicator = category.indicators.find((i) => i.id === indicatorId);
    if (indicator) return indicator;
  }
  return undefined;
}

afterEach(async () => {
  const indicatorIds = createdIndicatorIds.splice(0);
  if (indicatorIds.length) {
    await db
      .delete(performanceIndicatorValuesTable)
      .where(inArray(performanceIndicatorValuesTable.indicatorId, indicatorIds));
    await db
      .delete(performanceIndicatorsTable)
      .where(inArray(performanceIndicatorsTable.id, indicatorIds));
  }
  const categoryIds = createdCategoryIds.splice(0);
  if (categoryIds.length) {
    await db
      .delete(performanceCategoriesTable)
      .where(inArray(performanceCategoriesTable.id, categoryIds));
  }
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/performance/categories inline latest values", () => {
  it("exposes the two most recent periods as latestValue and previousValue", async () => {
    const categoryId = await createCategory();
    const indicatorId = await createIndicator(categoryId);
    // Inseriti fuori ordine per verificare che il route ordini per periodo.
    await addValue(indicatorId, "2022", 100);
    await addValue(indicatorId, "2024", 300);
    await addValue(indicatorId, "2023", 200);

    const res = await request(app).get("/api/performance/categories");
    expect(res.status).toBe(200);

    const indicator = findIndicator(res.body as CategoryResponse[], indicatorId);
    expect(indicator).toBeDefined();
    expect(indicator!.latestValue).toEqual({ value: 300, period: "2024" });
    expect(indicator!.previousValue).toEqual({ value: 200, period: "2023" });
  });

  it("returns a latestValue but null previousValue when only one value exists", async () => {
    const categoryId = await createCategory();
    const indicatorId = await createIndicator(categoryId);
    await addValue(indicatorId, "2024", 42);

    const res = await request(app).get("/api/performance/categories");
    expect(res.status).toBe(200);

    const indicator = findIndicator(res.body as CategoryResponse[], indicatorId);
    expect(indicator).toBeDefined();
    expect(indicator!.latestValue).toEqual({ value: 42, period: "2024" });
    expect(indicator!.previousValue).toBeNull();
  });

  it("returns null for both when the indicator has no values", async () => {
    const categoryId = await createCategory();
    const indicatorId = await createIndicator(categoryId);

    const res = await request(app).get("/api/performance/categories");
    expect(res.status).toBe(200);

    const indicator = findIndicator(res.body as CategoryResponse[], indicatorId);
    expect(indicator).toBeDefined();
    expect(indicator!.latestValue).toBeNull();
    expect(indicator!.previousValue).toBeNull();
  });
});
