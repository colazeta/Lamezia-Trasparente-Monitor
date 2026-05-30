import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";

import request from "supertest";
import app from "../app";

const INGEST_TOKEN = "test-ingest-token";

const VALID_BODY = {
  name: "foto-lavori.jpg",
  size: 1024,
  contentType: "image/jpeg",
};

describe("Storage upload URL (/api/storage/uploads/request-url)", () => {
  let previousToken: string | undefined;

  beforeAll(() => {
    previousToken = process.env.INGEST_API_TOKEN;
  });

  afterAll(() => {
    if (previousToken === undefined) {
      delete process.env.INGEST_API_TOKEN;
    } else {
      process.env.INGEST_API_TOKEN = previousToken;
    }
  });

  afterEach(() => {
    delete process.env.INGEST_API_TOKEN;
  });

  it("returns 503 when ingestion is disabled (no token configured)", async () => {
    delete process.env.INGEST_API_TOKEN;
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .send(VALID_BODY);
    expect(res.status).toBe(503);
  });

  it("returns 401 without a valid ingest token", async () => {
    process.env.INGEST_API_TOKEN = INGEST_TOKEN;
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .set("Authorization", "Bearer wrong-token")
      .send(VALID_BODY);
    expect(res.status).toBe(401);
  });

  it("rejects missing fields with 400", async () => {
    process.env.INGEST_API_TOKEN = INGEST_TOKEN;
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ name: "x.jpg" });
    expect(res.status).toBe(400);
  });

  it("rejects unsupported content types with 400", async () => {
    process.env.INGEST_API_TOKEN = INGEST_TOKEN;
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ ...VALID_BODY, contentType: "application/pdf" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Tipo di immagine");
  });

  it("rejects oversized images with 400", async () => {
    process.env.INGEST_API_TOKEN = INGEST_TOKEN;
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ ...VALID_BODY, size: 20 * 1024 * 1024 });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("troppo grande");
  });
});
