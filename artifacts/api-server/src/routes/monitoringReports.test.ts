import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { eq } from "drizzle-orm";

import request from "supertest";
import {
  db,
  pool,
  monitoringReportsTable,
  contractsTable,
  attuazionePnrrProjectsTable,
} from "@workspace/db";

// Mock the object-storage layer so the upload-url tests never reach Replit's
// sidecar or Google Cloud Storage. The route module instantiates
// ObjectStorageService at import time, so the mock must be hoisted before
// `../app` is imported.
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
const { sanitizeAttachments } = await import("./monitoringReports");

const INGEST_TOKEN = "test-ingest-token";
const auth = { Authorization: `Bearer ${INGEST_TOKEN}` };

const createdReportIds: number[] = [];
const createdContractIds: number[] = [];
const createdPnrrIds: number[] = [];

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function createContract(): Promise<number> {
  const u = unique("contract");
  const [row] = await db
    .insert(contractsTable)
    .values({
      sourceId: `test-${u}`,
      title: `Contratto ${u}`,
      description: "Contratto di test",
      supplier: "Fornitore di test",
      amount: "1000.00",
      procedureType: "Procedura aperta",
      status: "Aggiudicato",
      cig: `CIG-${u}`.slice(0, 30),
      cup: null,
    })
    .returning({ id: contractsTable.id });
  createdContractIds.push(row.id);
  return row.id;
}

async function createPnrrProject(): Promise<number> {
  const u = unique("pnrr");
  const [row] = await db
    .insert(attuazionePnrrProjectsTable)
    .values({
      sourceId: `test-${u}`,
      url: `https://example.org/${u}`,
      title: `Progetto PNRR ${u}`,
      cup: `CUP-${u}`.slice(0, 30),
    })
    .returning({ id: attuazionePnrrProjectsTable.id });
  createdPnrrIds.push(row.id);
  return row.id;
}

// Inserts a report directly, bypassing the API (used to seed a given status).
async function insertReport(overrides: {
  contractId?: number | null;
  pnrrProjectId?: number | null;
  status?: string;
}): Promise<number> {
  const u = unique("rep");
  const [row] = await db
    .insert(monitoringReportsTable)
    .values({
      subjectType: overrides.pnrrProjectId ? "pnrr" : "contract",
      contractId: overrides.contractId ?? null,
      pnrrProjectId: overrides.pnrrProjectId ?? null,
      subjectTitle: `Progetto ${u}`,
      title: `Report di monitoraggio ${u}`,
      deskAnalysis: "Analisi desk sufficientemente lunga per il test.",
      effectivenessEvaluation:
        "Valutazione di efficacia sufficientemente lunga per il test.",
      impactResults: "Risultati e impatto sufficientemente lunghi per il test.",
      overallAssessment: "neutro",
      status: overrides.status ?? "in_revisione",
      publishedAt: overrides.status === "pubblicato" ? new Date() : null,
    })
    .returning({ id: monitoringReportsTable.id });
  createdReportIds.push(row.id);
  return row.id;
}

function validBody(contractId: number) {
  return {
    subjectType: "contract" as const,
    contractId,
    title: "Monitoraggio civico del cantiere",
    authorName: "Cittadino Attento",
    deskAnalysis: "Analisi desk sufficientemente lunga per superare i 20 char.",
    effectivenessEvaluation:
      "Valutazione di efficacia sufficientemente lunga per superare i 20 char.",
    impactResults:
      "Risultati e impatto sufficientemente lunghi per superare i 20 char.",
    overallAssessment: "positivo" as const,
  };
}

beforeAll(() => {
  process.env.INGEST_API_TOKEN = INGEST_TOKEN;
});

afterAll(async () => {
  await pool.end();
});

beforeEach(() => {
  createdReportIds.length = 0;
  createdContractIds.length = 0;
  createdPnrrIds.length = 0;
  vi.clearAllMocks();
});

afterEach(async () => {
  for (const id of createdReportIds) {
    await db
      .delete(monitoringReportsTable)
      .where(eq(monitoringReportsTable.id, id));
  }
  for (const id of createdContractIds) {
    await db.delete(contractsTable).where(eq(contractsTable.id, id));
  }
  for (const id of createdPnrrIds) {
    await db
      .delete(attuazionePnrrProjectsTable)
      .where(eq(attuazionePnrrProjectsTable.id, id));
  }
});

describe("POST /api/monitoring-reports (create)", () => {
  it("creates a valid report in the in_revisione state", async () => {
    const contractId = await createContract();
    const res = await request(app)
      .post("/api/monitoring-reports")
      .send(validBody(contractId));
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    createdReportIds.push(res.body.id);
    expect(res.body.status).toBe("in_revisione");
    expect(res.body.contractId).toBe(contractId);
    expect(res.body.publishedAt).toBeNull();
  });

  it("rejects a too-short title with 400", async () => {
    const contractId = await createContract();
    const res = await request(app)
      .post("/api/monitoring-reports")
      .send({ ...validBody(contractId), title: "abc" });
    expect(res.status).toBe(400);
  });

  it("rejects too-short phase fields with 400", async () => {
    const contractId = await createContract();
    const res = await request(app)
      .post("/api/monitoring-reports")
      .send({ ...validBody(contractId), deskAnalysis: "troppo corto" });
    expect(res.status).toBe(400);
  });

  it("rejects a missing required field with 400", async () => {
    const contractId = await createContract();
    const body = validBody(contractId) as Record<string, unknown>;
    delete body.overallAssessment;
    const res = await request(app).post("/api/monitoring-reports").send(body);
    expect(res.status).toBe(400);
  });

  it("rejects an invalid overallAssessment with 400", async () => {
    const contractId = await createContract();
    const res = await request(app)
      .post("/api/monitoring-reports")
      .send({ ...validBody(contractId), overallAssessment: "ottimo" });
    expect(res.status).toBe(400);
  });

  it("rejects a contract subject without a contractId with 400", async () => {
    const body = validBody(0) as Record<string, unknown>;
    delete body.contractId;
    const res = await request(app).post("/api/monitoring-reports").send(body);
    expect(res.status).toBe(400);
  });

  it("rejects an unknown contractId with 400", async () => {
    const res = await request(app)
      .post("/api/monitoring-reports")
      .send({ ...validBody(99999999) });
    expect(res.status).toBe(400);
  });

  it("creates a pnrr-subject report", async () => {
    const pnrrProjectId = await createPnrrProject();
    const res = await request(app)
      .post("/api/monitoring-reports")
      .send({
        ...validBody(0),
        subjectType: "pnrr",
        contractId: undefined,
        pnrrProjectId,
      });
    expect(res.status).toBe(201);
    createdReportIds.push(res.body.id);
    expect(res.body.subjectType).toBe("pnrr");
    expect(res.body.pnrrProjectId).toBe(pnrrProjectId);
  });

  it("drops external attachment urls but keeps storage-backed ones", async () => {
    const contractId = await createContract();
    const res = await request(app)
      .post("/api/monitoring-reports")
      .send({
        ...validBody(contractId),
        attachments: [
          { title: "Foto", url: "/api/storage/objects/abc" },
          { title: "Esterno", url: "https://evil.example.org/x.jpg" },
        ],
      });
    expect(res.status).toBe(201);
    createdReportIds.push(res.body.id);
    expect(res.body.attachments).toHaveLength(1);
    expect(res.body.attachments[0].url).toBe("/api/storage/objects/abc");
  });

  it("caps the number of attachments at 10", async () => {
    const contractId = await createContract();
    const attachments = Array.from({ length: 15 }, (_, i) => ({
      title: `Allegato ${i}`,
      url: `/api/storage/objects/file-${i}`,
    }));
    const res = await request(app)
      .post("/api/monitoring-reports")
      .send({ ...validBody(contractId), attachments });
    expect(res.status).toBe(201);
    createdReportIds.push(res.body.id);
    expect(res.body.attachments).toHaveLength(10);
  });
});

describe("sanitizeAttachments (unit)", () => {
  it("returns an empty array for non-array input", () => {
    expect(sanitizeAttachments(undefined)).toEqual([]);
    expect(sanitizeAttachments(null)).toEqual([]);
    expect(sanitizeAttachments("not-an-array")).toEqual([]);
    expect(sanitizeAttachments(42)).toEqual([]);
    expect(sanitizeAttachments({ title: "x", url: "/api/storage/objects/a" })).toEqual(
      [],
    );
  });

  it("drops non-object and falsy entries", () => {
    expect(
      sanitizeAttachments([null, undefined, "string", 7, true]),
    ).toEqual([]);
  });

  it("drops entries with a missing or non-string title or url", () => {
    expect(
      sanitizeAttachments([
        { url: "/api/storage/objects/a" },
        { title: "Solo titolo" },
        { title: 5, url: "/api/storage/objects/a" },
        { title: "ok", url: 5 },
      ]),
    ).toEqual([]);
  });

  it("drops entries with a blank (whitespace-only) title or url", () => {
    expect(
      sanitizeAttachments([
        { title: "   ", url: "/api/storage/objects/a" },
        { title: "Foto", url: "   " },
      ]),
    ).toEqual([]);
  });

  it("rejects urls that are not under /api/storage/", () => {
    expect(
      sanitizeAttachments([
        { title: "Esterno", url: "https://evil.example.org/x.jpg" },
        { title: "Relativo", url: "/uploads/x.jpg" },
        { title: "Protocollo", url: "javascript:alert(1)" },
        { title: "Quasi", url: "/api/storageX/objects/a" },
      ]),
    ).toEqual([]);
  });

  it("keeps a valid storage-backed attachment", () => {
    expect(
      sanitizeAttachments([
        { title: "Foto", url: "/api/storage/objects/abc" },
      ]),
    ).toEqual([
      { title: "Foto", url: "/api/storage/objects/abc", contentType: null },
    ]);
  });

  it("trims the title and truncates it to 200 characters", () => {
    const longTitle = "a".repeat(250);
    const [out] = sanitizeAttachments([
      { title: `  ${longTitle}  `, url: "/api/storage/objects/abc" },
    ]);
    expect(out.title).toHaveLength(200);
    expect(out.title).toBe("a".repeat(200));
  });

  it("passes through a string contentType and nulls anything else", () => {
    const out = sanitizeAttachments([
      {
        title: "Con tipo",
        url: "/api/storage/objects/a",
        contentType: "image/jpeg",
      },
      {
        title: "Tipo numerico",
        url: "/api/storage/objects/b",
        contentType: 123,
      },
      { title: "Senza tipo", url: "/api/storage/objects/c" },
    ]);
    expect(out).toEqual([
      { title: "Con tipo", url: "/api/storage/objects/a", contentType: "image/jpeg" },
      { title: "Tipo numerico", url: "/api/storage/objects/b", contentType: null },
      { title: "Senza tipo", url: "/api/storage/objects/c", contentType: null },
    ]);
  });

  it("caps the number of attachments at 10", () => {
    const many = Array.from({ length: 15 }, (_, i) => ({
      title: `Allegato ${i}`,
      url: `/api/storage/objects/file-${i}`,
    }));
    const out = sanitizeAttachments(many);
    expect(out).toHaveLength(10);
    expect(out[0].url).toBe("/api/storage/objects/file-0");
    expect(out[9].url).toBe("/api/storage/objects/file-9");
  });
});

describe("GET /api/monitoring-reports (public list)", () => {
  it("returns only pubblicato reports", async () => {
    const contractId = await createContract();
    const publishedId = await insertReport({
      contractId,
      status: "pubblicato",
    });
    const pendingId = await insertReport({
      contractId,
      status: "in_revisione",
    });
    const rejectedId = await insertReport({ contractId, status: "rifiutato" });

    const res = await request(app)
      .get("/api/monitoring-reports")
      .query({ contractId });
    expect(res.status).toBe(200);
    const ids = res.body.map((r: { id: number }) => r.id);
    expect(ids).toContain(publishedId);
    expect(ids).not.toContain(pendingId);
    expect(ids).not.toContain(rejectedId);
  });
});

describe("GET /api/monitoring-reports/:id (public detail)", () => {
  it("returns a published report", async () => {
    const contractId = await createContract();
    const id = await insertReport({ contractId, status: "pubblicato" });
    const res = await request(app).get(`/api/monitoring-reports/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it("returns 404 for a non-published report", async () => {
    const contractId = await createContract();
    const id = await insertReport({ contractId, status: "in_revisione" });
    const res = await request(app).get(`/api/monitoring-reports/${id}`);
    expect(res.status).toBe(404);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).get("/api/monitoring-reports/99999999");
    expect(res.status).toBe(404);
  });

  it("returns 404 for a non-numeric id", async () => {
    const res = await request(app).get("/api/monitoring-reports/not-a-number");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/monitoring-reports/admin (moderation list)", () => {
  it("requires an ingest token", async () => {
    const res = await request(app).get("/api/monitoring-reports/admin");
    expect(res.status).toBe(401);
  });

  it("rejects a wrong token", async () => {
    const res = await request(app)
      .get("/api/monitoring-reports/admin")
      .set("Authorization", "Bearer wrong-token");
    expect(res.status).toBe(401);
  });

  it("returns reports of any status when authorized", async () => {
    const contractId = await createContract();
    const pendingId = await insertReport({
      contractId,
      status: "in_revisione",
    });
    const res = await request(app)
      .get("/api/monitoring-reports/admin")
      .set(auth);
    expect(res.status).toBe(200);
    const ids = res.body.map((r: { id: number }) => r.id);
    expect(ids).toContain(pendingId);
  });
});

describe("PATCH /api/monitoring-reports/:id (moderate)", () => {
  it("requires an ingest token", async () => {
    const contractId = await createContract();
    const id = await insertReport({ contractId, status: "in_revisione" });
    const res = await request(app)
      .patch(`/api/monitoring-reports/${id}`)
      .send({ status: "pubblicato" });
    expect(res.status).toBe(401);
  });

  it("rejects a wrong token", async () => {
    const contractId = await createContract();
    const id = await insertReport({ contractId, status: "in_revisione" });
    const res = await request(app)
      .patch(`/api/monitoring-reports/${id}`)
      .set("Authorization", "Bearer wrong-token")
      .send({ status: "pubblicato" });
    expect(res.status).toBe(401);
  });

  it("publishes a report and stamps publishedAt", async () => {
    const contractId = await createContract();
    const id = await insertReport({ contractId, status: "in_revisione" });
    const res = await request(app)
      .patch(`/api/monitoring-reports/${id}`)
      .set(auth)
      .send({ status: "pubblicato" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("pubblicato");
    expect(res.body.publishedAt).not.toBeNull();
  });

  it("rejects a report with a moderation note", async () => {
    const contractId = await createContract();
    const id = await insertReport({ contractId, status: "in_revisione" });
    const res = await request(app)
      .patch(`/api/monitoring-reports/${id}`)
      .set(auth)
      .send({ status: "rifiutato", moderationNote: "Fuori tema" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("rifiutato");
    expect(res.body.moderationNote).toBe("Fuori tema");
  });

  it("sets a report back to in_revisione", async () => {
    const contractId = await createContract();
    const id = await insertReport({ contractId, status: "pubblicato" });
    const res = await request(app)
      .patch(`/api/monitoring-reports/${id}`)
      .set(auth)
      .send({ status: "in_revisione" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("in_revisione");
  });

  it("rejects an invalid status with 400", async () => {
    const contractId = await createContract();
    const id = await insertReport({ contractId, status: "in_revisione" });
    const res = await request(app)
      .patch(`/api/monitoring-reports/${id}`)
      .set(auth)
      .send({ status: "archiviato" });
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown report", async () => {
    const res = await request(app)
      .patch("/api/monitoring-reports/99999999")
      .set(auth)
      .send({ status: "pubblicato" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/monitoring-reports/:id", () => {
  it("requires an ingest token", async () => {
    const contractId = await createContract();
    const id = await insertReport({ contractId, status: "in_revisione" });
    const res = await request(app).delete(`/api/monitoring-reports/${id}`);
    expect(res.status).toBe(401);
  });

  it("deletes a report when authorized", async () => {
    const contractId = await createContract();
    const id = await insertReport({ contractId, status: "in_revisione" });
    const res = await request(app)
      .delete(`/api/monitoring-reports/${id}`)
      .set(auth);
    expect(res.status).toBe(204);
    const rows = await db
      .select()
      .from(monitoringReportsTable)
      .where(eq(monitoringReportsTable.id, id));
    expect(rows).toHaveLength(0);
  });

  it("returns 404 for an unknown report", async () => {
    const res = await request(app)
      .delete("/api/monitoring-reports/99999999")
      .set(auth);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/monitoring-reports/uploads/request-url", () => {
  it("rejects missing fields with 400", async () => {
    const res = await request(app)
      .post("/api/monitoring-reports/uploads/request-url")
      .send({ name: "foto.jpg" });
    expect(res.status).toBe(400);
  });

  it("rejects an unsupported content type with 400", async () => {
    const res = await request(app)
      .post("/api/monitoring-reports/uploads/request-url")
      .send({ name: "x.exe", size: 1024, contentType: "application/x-msdownload" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Tipo");
  });

  it("rejects an oversized file with 400", async () => {
    const res = await request(app)
      .post("/api/monitoring-reports/uploads/request-url")
      .send({
        name: "grande.pdf",
        size: 20 * 1024 * 1024,
        contentType: "application/pdf",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("troppo grande");
  });

  it("returns an upload URL for a valid request (no auth required)", async () => {
    const uploadURL =
      "https://storage.googleapis.com/bucket/.private/uploads/abc-123?sig=x";
    const objectPath = "/objects/uploads/abc-123";
    storageMocks.getObjectEntityUploadURL.mockResolvedValue(uploadURL);
    storageMocks.normalizeObjectEntityPath.mockReturnValue(objectPath);

    const body = {
      name: "foto-lavori.jpg",
      size: 1024,
      contentType: "image/jpeg",
    };
    const res = await request(app)
      .post("/api/monitoring-reports/uploads/request-url")
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body.uploadURL).toBe(uploadURL);
    expect(res.body.objectPath).toBe(objectPath);
    expect(res.body.metadata).toEqual(body);
  });
});
