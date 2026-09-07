import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import type { Pool, PoolClient } from "pg";
import { types } from "pg";
import {
  buildInspectionRead,
  InspectionInputError,
  withInspectionTransaction,
  type InspectionTable,
} from "@workspace/db/inspection";
import { createDatabaseAdminRouter } from "../routes/databaseAdmin";

const session = vi.hoisted(() => ({
  userId: null as string | null,
  sessionId: null as string | null,
  sessionClaims: { azp: "https://owner.example" },
}));
vi.mock("@clerk/express", () => ({ getAuth: () => session }));

const table: InspectionTable = {
  name: "categories",
  schema: "public",
  estimatedRows: null,
  bytes: 8192,
  rls: false,
  registered: true,
  issues: [],
  relations: [],
  constraints: [],
  indexes: [],
  columns: [
    {
      name: "id",
      type: "integer",
      nullable: false,
      default: null,
      ordinal: 1,
      primaryKey: true,
      redacted: false,
    },
    {
      name: "name",
      type: "text",
      nullable: false,
      default: null,
      ordinal: 2,
      primaryKey: false,
      redacted: false,
    },
    {
      name: "api_token",
      type: "text",
      nullable: true,
      default: null,
      ordinal: 3,
      primaryKey: false,
      redacted: true,
    },
  ],
};

function database() {
  const query = vi.fn(async (sql: string) => {
    if (sql.includes("current_database() AS database"))
      return {
        rows: [
          {
            database: "test",
            version: "18",
            bytes: 8192,
            captured_at: "2026-09-07T12:00:00Z",
            has_migrations: false,
          },
        ],
      };
    if (sql.includes("CASE WHEN c.reltuples"))
      return {
        rows: [
          {
            name: table.name,
            schema: "public",
            estimatedRows: null,
            bytes: 8192,
            rls: false,
          },
        ],
      };
    if (sql.includes("a.attname AS name"))
      return {
        rows: table.columns.map((c) => ({ ...c, table_name: table.name })),
      };
    if (sql.includes("FROM pg_constraint k JOIN pg_class c")) {
      // pg_attribute.attname is name (OID 19): name[] (1003) has no
      // parser in pg. Decode the wire values with the installed driver,
      // using text[] (1009) only when the actual projection casts to text.
      const decode = (key: string, value: string) =>
        types.getTypeParser(
          (sql.includes(`a.attname::text FROM unnest(k.${key})`)
            ? 1009
            : 1003) as Parameters<typeof types.getTypeParser>[0],
        )(value);
      return {
        rows: [
          {
            table_name: table.name,
            name: "categories_parent_fk",
            type: "f",
            definition: "FOREIGN KEY (id) REFERENCES categories(id)",
            validated: true,
            columns: decode("conkey", "{id}"),
            targetSchema: "public",
            targetTable: "categories",
            targetColumns: decode("confkey", "{id}"),
          },
        ],
      };
    }
    if (sql.includes("count(*)")) return { rows: [{ count: 1 }] };
    if (sql.startsWith("SELECT left"))
      return {
        rows: [
          { id: "1", name: "Synthetic category", api_token: "[oscurato]" },
        ],
      };
    return { rows: [] };
  });
  const release = vi.fn();
  const client = { query, release } as unknown as PoolClient;
  const connect = vi.fn(async () => client);
  const pool = { connect } as unknown as Pick<Pool, "connect">;
  const app = express();
  app.use("/api/admin/database", createDatabaseAdminRouter(pool));
  return { app, pool, query, release, connect };
}
function owner() {
  session.userId = "user_owner1";
  session.sessionId = "sess_test";
}

beforeEach(() => {
  vi.unstubAllEnvs();
  session.userId = null;
  session.sessionId = null;
  session.sessionClaims.azp = "https://owner.example";
  vi.stubEnv("DATABASE_ADMIN_USER_ID", "user_owner1");
  vi.stubEnv("DATABASE_ADMIN_ORIGIN", "https://owner.example");
});

describe("single-owner database boundary", () => {
  it("serialises PostgreSQL foreign-key columns as JSON arrays for navigation", async () => {
    owner();
    const db = database();
    const result = await request(db.app).get("/api/admin/database/catalog");
    expect(result.status).toBe(200);
    const relation = result.body.tables[0].relations[0];
    expect(relation.columns).toEqual(["id"]);
    expect(relation.targetColumns).toEqual(["id"]);
    expect(relation.columns.join(", ")).toBe("id");
    expect(relation.targetColumns.join(", ")).toBe("id");
  });
  it("rejects anonymous and ingestion-only requests before acquiring a connection", async () => {
    const db = database();
    for (const path of [
      "catalog",
      "tables/categories",
      "tables/categories/record?key=%7B%7D",
    ]) {
      const result = await request(db.app)
        .get(`/api/admin/database/${path}`)
        .set("Authorization", "Bearer ingestion-token");
      expect(result.status).toBe(401);
      expect(result.headers["cache-control"]).toBe("private, no-store");
    }
    expect(db.connect).not.toHaveBeenCalled();
  });
  it("does not inherit editorial authority", async () => {
    owner();
    session.userId = "user_editor2";
    vi.stubEnv("EDITOR_EMAILS", "editor@example.com");
    const db = database();
    expect(
      (await request(db.app).get("/api/admin/database/catalog")).status,
    ).toBe(403);
    expect(db.connect).not.toHaveBeenCalled();
  });
  it("fails closed without an owner, including development", async () => {
    owner();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DATABASE_ADMIN_USER_ID", "");
    const db = database();
    expect(
      (await request(db.app).get("/api/admin/database/catalog")).status,
    ).toBe(503);
    expect(db.connect).not.toHaveBeenCalled();
  });
  it("rejects session origins and request origins outside the exact allowlist", async () => {
    owner();
    const db = database();
    session.sessionClaims.azp = "https://other.example";
    expect(
      (await request(db.app).get("/api/admin/database/catalog")).status,
    ).toBe(403);
    session.sessionClaims.azp = "https://owner.example";
    expect(
      (
        await request(db.app)
          .get("/api/admin/database/catalog")
          .set("Origin", "https://other.example")
      ).status,
    ).toBe(403);
    expect(db.connect).not.toHaveBeenCalled();
  });
  it("uses a read-only snapshot and returns null for unavailable estimates", async () => {
    owner();
    const db = database();
    const result = await request(db.app).get("/api/admin/database/catalog");
    expect(result.status).toBe(200);
    expect(result.body.tables[0].estimatedRows).toBeNull();
    expect(db.query.mock.calls[0][0]).toBe(
      "BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY",
    );
    expect(db.query).toHaveBeenCalledWith(
      "SET LOCAL statement_timeout = '3000ms'",
    );
    expect(db.query).toHaveBeenCalledWith("COMMIT");
    expect(db.release).toHaveBeenCalledWith(false);
  });
  it("rejects unsupported mutation and SQL parameters", async () => {
    owner();
    const db = database();
    expect(
      (
        await request(db.app)
          .post("/api/admin/database/tables/categories")
          .send({ sql: "DELETE FROM categories" })
      ).status,
    ).toBe(405);
    expect(db.connect).not.toHaveBeenCalled();
    expect(
      (
        await request(db.app).get(
          "/api/admin/database/tables/categories?sql=SELECT%201",
        )
      ).status,
    ).toBe(400);
  });
  it("rejects malformed keys and unknown tables without reflecting input", async () => {
    owner();
    const db = database();
    expect(
      (
        await request(db.app).get(
          "/api/admin/database/tables/categories/record?key=null",
        )
      ).status,
    ).toBe(400);
    const result = await request(db.app).get(
      "/api/admin/database/tables/pg_authid",
    );
    expect(result.status).toBe(400);
    expect(JSON.stringify(result.body)).not.toContain("pg_authid");
  });
});

describe("bounded database reads", () => {
  it("keeps injection payloads in parameters and escapes literal LIKE metacharacters", () => {
    const read = buildInspectionRead(table, {
      column: "name",
      value: "x%' OR 1=1 --_",
    });
    expect(read.text).not.toContain("OR 1=1");
    expect(read.values[0]).toBe("%x\\%' OR 1=1 --\\_%");
    expect(read.text).toContain('ORDER BY "id" ASC');
    expect(read.text).not.toContain('left("api_token"');
    expect(read.text).toContain("[oscurato]");
  });
  it("rejects arbitrary names, credential filters, direction and oversized pages", () => {
    for (const options of [
      { sort: "name;DROP TABLE categories" },
      { column: "api_token", value: "x" },
      { page: 1001 },
      { pageSize: 101 },
      { page: 1.5 },
      { direction: "desc;--" },
    ])
      expect(() => buildInspectionRead(table, options as never)).toThrow(
        InspectionInputError,
      );
    expect(() => buildInspectionRead({ ...table, name: "pg_authid" })).toThrow(
      InspectionInputError,
    );
  });
  it("requires a complete primary key and adds it as a deterministic sorting tiebreaker", () => {
    expect(() => buildInspectionRead(table, { key: { name: "x" } })).toThrow(
      InspectionInputError,
    );
    const read = buildInspectionRead(table, { key: { id: "1" }, sort: "name" });
    expect(read.text).toContain('WHERE "id" = $1');
    expect(read.text).toContain('"name" ASC NULLS LAST, "id" ASC');
    expect(read.values).toEqual(["1", 1, 0]);
  });
  it("rolls back on error and destroys a connection when rollback fails", async () => {
    const db = database();
    await expect(
      withInspectionTransaction(db.pool, async () => {
        throw new Error("failure");
      }),
    ).rejects.toThrow("failure");
    expect(db.query).toHaveBeenCalledWith("ROLLBACK");
    expect(db.release).toHaveBeenCalledWith(false);
    db.release.mockClear();
    db.query.mockImplementation(async (sql) => {
      if (sql === "ROLLBACK") throw new Error("network");
      return { rows: [] };
    });
    await expect(
      withInspectionTransaction(db.pool, async () => {
        throw new Error("failure");
      }),
    ).rejects.toThrow("failure");
    expect(db.release).toHaveBeenCalledWith(true);
  });
});
