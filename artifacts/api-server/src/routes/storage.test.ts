import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from "vitest";

import request from "supertest";

// Mock the object-storage layer so the suite never reaches Replit's sidecar or
// Google Cloud Storage. The route module instantiates ObjectStorageService at
// import time, so the mock must be hoisted before `../app` is imported.
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

const { ObjectNotFoundError } = await import("../lib/objectStorage");
const app = (await import("../app")).default;

const INGEST_TOKEN = "test-ingest-token";

const VALID_BODY = {
  name: "foto-lavori.jpg",
  size: 1024,
  contentType: "image/jpeg",
};

function fakeImageResponse(): Response {
  return new Response("fake-image-bytes", {
    headers: { "Content-Type": "image/jpeg" },
  });
}

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
    vi.clearAllMocks();
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

  it("returns an upload URL and object path for a valid authorized request", async () => {
    process.env.INGEST_API_TOKEN = INGEST_TOKEN;
    const uploadURL =
      "https://storage.googleapis.com/bucket/.private/uploads/abc-123?sig=x";
    const objectPath = "/objects/uploads/abc-123";
    storageMocks.getObjectEntityUploadURL.mockResolvedValue(uploadURL);
    storageMocks.normalizeObjectEntityPath.mockReturnValue(objectPath);

    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send(VALID_BODY);

    expect(res.status).toBe(200);
    expect(res.body.uploadURL).toBe(uploadURL);
    expect(res.body.objectPath).toBe(objectPath);
    expect(res.body.metadata).toEqual(VALID_BODY);
    expect(storageMocks.getObjectEntityUploadURL).toHaveBeenCalledTimes(1);
    expect(storageMocks.normalizeObjectEntityPath).toHaveBeenCalledWith(
      uploadURL,
    );
  });

  it("returns 500 when generating the upload URL fails", async () => {
    process.env.INGEST_API_TOKEN = INGEST_TOKEN;
    storageMocks.getObjectEntityUploadURL.mockRejectedValue(
      new Error("sidecar down"),
    );

    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send(VALID_BODY);

    expect(res.status).toBe(500);
  });
});

describe("Serve private object (/api/storage/objects/*)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("streams the object when it exists", async () => {
    storageMocks.getObjectEntityFile.mockResolvedValue({});
    storageMocks.downloadObject.mockResolvedValue(fakeImageResponse());

    const res = await request(app).get(
      "/api/storage/objects/uploads/abc-123",
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("image/jpeg");
    expect(storageMocks.getObjectEntityFile).toHaveBeenCalledWith(
      "/objects/uploads/abc-123",
    );
  });

  it("returns 404 when the object does not exist", async () => {
    storageMocks.getObjectEntityFile.mockRejectedValue(
      new ObjectNotFoundError(),
    );

    const res = await request(app).get(
      "/api/storage/objects/uploads/missing",
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Object not found");
  });
});

describe("Serve public object (/api/storage/public-objects/*)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("streams the asset when it is found", async () => {
    storageMocks.searchPublicObject.mockResolvedValue({});
    storageMocks.downloadObject.mockResolvedValue(fakeImageResponse());

    const res = await request(app).get(
      "/api/storage/public-objects/banner.jpg",
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("image/jpeg");
    expect(storageMocks.searchPublicObject).toHaveBeenCalledWith("banner.jpg");
  });

  it("returns 404 when the asset is not found", async () => {
    storageMocks.searchPublicObject.mockResolvedValue(null);

    const res = await request(app).get(
      "/api/storage/public-objects/missing.jpg",
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("File not found");
  });
});
