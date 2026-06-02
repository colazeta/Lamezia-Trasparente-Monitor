import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";

// Mock the object-storage layer so these tests never reach Replit's sidecar or
// Google Cloud Storage. The route module instantiates ObjectStorageService at
// import time, so the mock must be hoisted before `../app` is imported. This
// mirrors the pattern used in monitoringReports.test.ts.
const storageMocks = vi.hoisted(() => ({
  getObjectEntityUploadURL: vi.fn(),
  normalizeObjectEntityPath: vi.fn(),
  searchPublicObject: vi.fn(),
  getObjectEntityFile: vi.fn(),
  downloadObject: vi.fn(),
}));

vi.mock("../lib/objectStorage", () => {
  class ObjectNotFoundError extends Error {
    constructor() {
      super("Object not found");
      this.name = "ObjectNotFoundError";
      Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
    }
  }
  class ObjectStorageService {
    getObjectEntityUploadURL = storageMocks.getObjectEntityUploadURL;
    normalizeObjectEntityPath = storageMocks.normalizeObjectEntityPath;
    searchPublicObject = storageMocks.searchPublicObject;
    getObjectEntityFile = storageMocks.getObjectEntityFile;
    downloadObject = storageMocks.downloadObject;
  }
  return { ObjectStorageService, ObjectNotFoundError };
});

const app = (await import("../app")).default;
const { ObjectNotFoundError } = await import("../lib/objectStorage");

const INGEST_TOKEN = "test-ingest-token";
const auth = { Authorization: `Bearer ${INGEST_TOKEN}` };

beforeAll(() => {
  process.env.INGEST_API_TOKEN = INGEST_TOKEN;
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/storage/uploads/request-url (image)", () => {
  it("requires an ingest token", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .send({ name: "foto.jpg", size: 1024, contentType: "image/jpeg" });
    expect(res.status).toBe(401);
  });

  it("rejects a wrong token", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .set("Authorization", "Bearer wrong-token")
      .send({ name: "foto.jpg", size: 1024, contentType: "image/jpeg" });
    expect(res.status).toBe(401);
  });

  it("rejects missing fields with 400", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .set(auth)
      .send({ name: "foto.jpg" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing or invalid");
  });

  it("rejects an unsupported content type with 400", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .set(auth)
      .send({ name: "x.exe", size: 1024, contentType: "application/x-msdownload" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Tipo di immagine non supportato");
  });

  it("rejects a document content type on the image endpoint with 400", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .set(auth)
      .send({ name: "doc.pdf", size: 1024, contentType: "application/pdf" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Tipo di immagine non supportato");
  });

  it("rejects an oversized image with 400", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .set(auth)
      .send({
        name: "grande.jpg",
        size: 11 * 1024 * 1024,
        contentType: "image/jpeg",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("troppo grande");
  });

  it("accepts every allowed image type and normalizes the object path", async () => {
    const uploadURL =
      "https://storage.googleapis.com/bucket/.private/uploads/abc-123?sig=x";
    const objectPath = "/objects/uploads/abc-123";
    storageMocks.getObjectEntityUploadURL.mockResolvedValue(uploadURL);
    storageMocks.normalizeObjectEntityPath.mockReturnValue(objectPath);

    for (const contentType of [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/avif",
    ]) {
      const body = { name: "foto.bin", size: 2048, contentType };
      const res = await request(app)
        .post("/api/storage/uploads/request-url")
        .set(auth)
        .send(body);
      expect(res.status).toBe(200);
      expect(res.body.uploadURL).toBe(uploadURL);
      expect(res.body.objectPath).toBe(objectPath);
      expect(res.body.metadata).toEqual(body);
    }
    expect(storageMocks.normalizeObjectEntityPath).toHaveBeenCalledWith(uploadURL);
  });

  it("returns 500 when the storage layer fails", async () => {
    storageMocks.getObjectEntityUploadURL.mockRejectedValue(new Error("boom"));
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .set(auth)
      .send({ name: "foto.jpg", size: 1024, contentType: "image/jpeg" });
    expect(res.status).toBe(500);
  });
});

describe("POST /api/storage/uploads/request-document-url (document)", () => {
  it("requires an ingest token", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-document-url")
      .send({ name: "atto.pdf", size: 1024, contentType: "application/pdf" });
    expect(res.status).toBe(401);
  });

  it("rejects missing fields with 400", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-document-url")
      .set(auth)
      .send({ name: "atto.pdf" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing or invalid");
  });

  it("rejects an unsupported content type with 400", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-document-url")
      .set(auth)
      .send({ name: "x.exe", size: 1024, contentType: "application/x-msdownload" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Tipo di documento non supportato");
  });

  it("rejects an image content type on the document endpoint with 400", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-document-url")
      .set(auth)
      .send({ name: "foto.jpg", size: 1024, contentType: "image/jpeg" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Tipo di documento non supportato");
  });

  it("rejects an oversized document with 400", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-document-url")
      .set(auth)
      .send({
        name: "grande.pdf",
        size: 31 * 1024 * 1024,
        contentType: "application/pdf",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("troppo grande");
  });

  it("accepts allowed document types and normalizes the object path", async () => {
    const uploadURL =
      "https://storage.googleapis.com/bucket/.private/uploads/doc-9?sig=y";
    const objectPath = "/objects/uploads/doc-9";
    storageMocks.getObjectEntityUploadURL.mockResolvedValue(uploadURL);
    storageMocks.normalizeObjectEntityPath.mockReturnValue(objectPath);

    for (const contentType of [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ]) {
      const body = { name: "atto.bin", size: 4096, contentType };
      const res = await request(app)
        .post("/api/storage/uploads/request-document-url")
        .set(auth)
        .send(body);
      expect(res.status).toBe(200);
      expect(res.body.uploadURL).toBe(uploadURL);
      expect(res.body.objectPath).toBe(objectPath);
      expect(res.body.metadata).toEqual(body);
    }
  });
});

describe("GET /api/storage/public-objects/*", () => {
  it("returns 404 when the public object does not exist", async () => {
    storageMocks.searchPublicObject.mockResolvedValue(null);
    const res = await request(app).get("/api/storage/public-objects/missing.png");
    expect(res.status).toBe(404);
    expect(storageMocks.searchPublicObject).toHaveBeenCalledWith("missing.png");
  });

  it("streams the object body for an existing public object", async () => {
    storageMocks.searchPublicObject.mockResolvedValue({ name: "logo.png" });
    storageMocks.downloadObject.mockResolvedValue(
      new Response("public-bytes", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );
    const res = await request(app).get(
      "/api/storage/public-objects/assets/logo.png",
    );
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/plain");
    expect(res.text).toBe("public-bytes");
    expect(storageMocks.searchPublicObject).toHaveBeenCalledWith(
      "assets/logo.png",
    );
  });

  it("returns 500 when downloading the public object throws", async () => {
    storageMocks.searchPublicObject.mockResolvedValue({ name: "logo.png" });
    storageMocks.downloadObject.mockRejectedValue(new Error("download failed"));
    const res = await request(app).get("/api/storage/public-objects/logo.png");
    expect(res.status).toBe(500);
  });
});

describe("GET /api/storage/objects/*", () => {
  it("streams a private object by its normalized path", async () => {
    storageMocks.getObjectEntityFile.mockResolvedValue({ name: "file" });
    storageMocks.downloadObject.mockResolvedValue(
      new Response("private-bytes", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );
    const res = await request(app).get("/api/storage/objects/uploads/abc-123");
    expect(res.status).toBe(200);
    expect(res.text).toBe("private-bytes");
    expect(storageMocks.getObjectEntityFile).toHaveBeenCalledWith(
      "/objects/uploads/abc-123",
    );
  });

  it("returns 404 when the object is not found", async () => {
    storageMocks.getObjectEntityFile.mockRejectedValue(new ObjectNotFoundError());
    const res = await request(app).get("/api/storage/objects/uploads/missing");
    expect(res.status).toBe(404);
    expect(res.body.error).toContain("not found");
  });

  it("returns 500 for an unexpected error", async () => {
    storageMocks.getObjectEntityFile.mockRejectedValue(new Error("kaboom"));
    const res = await request(app).get("/api/storage/objects/uploads/boom");
    expect(res.status).toBe(500);
  });
});
