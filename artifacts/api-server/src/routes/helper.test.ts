import { describe, it, expect, afterAll, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import { pool } from "@workspace/db";
import { _resetOpenAiClientForTest } from "./helper";

afterAll(async () => {
  await pool.end();
});

// ---------------------------------------------------------------------------
// Mock the openai module so tests run without real credentials or HTTP calls.
// Use a class so `new OpenAI({...})` returns a proper instance with the right
// shape. The vi.fn() constructor warning does not appear with class syntax.
// ---------------------------------------------------------------------------
const mockCreate = vi.fn().mockResolvedValue({
  choices: [
    {
      finish_reason: "stop",
      message: {
        role: "assistant",
        content: "Puoi trovare i contratti nella sezione /contratti.",
        tool_calls: null,
      },
    },
  ],
});

vi.mock("openai", () => {
  return {
    default: class MockOpenAI {
      chat = { completions: { create: mockCreate } };
    },
  };
});

beforeEach(() => {
  // Reset the cached client so each test suite starts fresh.
  _resetOpenAiClientForTest();
  // Ensure AI env vars are present for the lazy initializer.
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL =
    process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? "https://mock-openai.test/v1";
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY =
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "test-key";
  // Reset call count on the mock.
  mockCreate.mockClear();
});

// ---------------------------------------------------------------------------
// GET /api/helper/guide
// ---------------------------------------------------------------------------
describe("GET /api/helper/guide", () => {
  it("returns 200 with structured helper contents", async () => {
    const res = await request(app).get("/api/helper/guide");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("version");
    expect(Array.isArray(res.body.storyChapters)).toBe(true);
    expect(res.body.storyChapters.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.sections)).toBe(true);
    expect(res.body.sections.length).toBeGreaterThan(0);
  });

  it("includes all expected section ids", async () => {
    const res = await request(app).get("/api/helper/guide");
    expect(res.status).toBe(200);
    const ids = res.body.sections.map((s: { id: string }) => s.id);
    const expected = [
      "home",
      "contratti",
      "albo",
      "pnrr",
      "temi",
      "monitoraggio",
      "legalita",
      "performance",
      "opendata",
      "bandi",
      "beni-confiscati",
      "api-pubblica",
    ];
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });

  it("each section has required fields (id, title, description, route, tourSteps)", async () => {
    const res = await request(app).get("/api/helper/guide");
    for (const section of res.body.sections) {
      expect(typeof section.id).toBe("string");
      expect(typeof section.title).toBe("string");
      expect(typeof section.description).toBe("string");
      expect(typeof section.route).toBe("string");
      expect(Array.isArray(section.tourSteps)).toBe(true);
    }
  });

  it("returns a non-empty welcomeHighlights array with icon and text", async () => {
    const res = await request(app).get("/api/helper/guide");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.welcomeHighlights)).toBe(true);
    expect(res.body.welcomeHighlights.length).toBeGreaterThan(0);
    for (const h of res.body.welcomeHighlights) {
      expect(typeof h.icon).toBe("string");
      expect(h.icon.length).toBeGreaterThan(0);
      expect(typeof h.text).toBe("string");
      expect(h.text.length).toBeGreaterThan(0);
    }
  });

  it("each story chapter has required fields", async () => {
    const res = await request(app).get("/api/helper/guide");
    for (const chapter of res.body.storyChapters) {
      expect(typeof chapter.id).toBe("string");
      expect(typeof chapter.title).toBe("string");
      expect(typeof chapter.body).toBe("string");
      expect(typeof chapter.order).toBe("number");
    }
  });

  it("tour steps have required fields and positive order", async () => {
    const res = await request(app).get("/api/helper/guide");
    for (const section of res.body.sections) {
      for (const step of section.tourSteps) {
        expect(typeof step.target).toBe("string");
        expect(typeof step.text).toBe("string");
        expect(typeof step.order).toBe("number");
        expect(step.order).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// POST /api/helper/ask — validation
// ---------------------------------------------------------------------------
describe("POST /api/helper/ask — validation", () => {
  it("returns 400 when question is missing", async () => {
    const res = await request(app)
      .post("/api/helper/ask")
      .send({})
      .set("Content-Type", "application/json");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/question/i);
  });

  it("returns 400 when question is empty string", async () => {
    const res = await request(app)
      .post("/api/helper/ask")
      .send({ question: "   " })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/question/i);
  });

  it("returns 400 when question is not a string", async () => {
    const res = await request(app)
      .post("/api/helper/ask")
      .send({ question: 42 })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/helper/ask — SSE streaming response
// ---------------------------------------------------------------------------
// Helper that collects SSE body as a string. Supertest's custom parser stores
// the result in res.body (not res.text) when a parse fn is provided.
function sseBody(res: import("superagent").Response): string {
  return typeof res.body === "string" ? res.body : "";
}

function parseSseEvents(raw: string): Record<string, unknown>[] {
  return raw
    .split("\n")
    .filter((l) => l.startsWith("data:"))
    .map((l) => JSON.parse(l.slice(5).trim()) as Record<string, unknown>);
}

async function askSse(
  question: string,
  extra: Record<string, unknown> = {},
): Promise<import("supertest").Response> {
  return request(app)
    .post("/api/helper/ask")
    .send({ question, ...extra })
    .set("Content-Type", "application/json")
    .buffer(true)
    .parse((res, callback) => {
      let data = "";
      res.on("data", (chunk: Buffer) => {
        data += chunk.toString();
      });
      res.on("end", () => callback(null, data));
    });
}

describe("POST /api/helper/ask — SSE response", () => {
  it("returns text/event-stream for a valid question", async () => {
    const res = await askSse("Come funziona il sito?");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/event-stream/);
    const body = sseBody(res);
    expect(body).toContain("data:");
    expect(body).toContain('"done":true');
  });

  it("response contains content chunks and a done event", async () => {
    const res = await askSse("Dove trovo i contratti?");
    expect(res.status).toBe(200);
    const events = parseSseEvents(sseBody(res));
    const doneEvent = events.find((e) => e.done === true);
    expect(doneEvent).toBeTruthy();
    const contentEvents = events.filter(
      (e) => typeof e.content === "string",
    );
    expect(contentEvents.length).toBeGreaterThan(0);
  });

  it("accepts an optional currentRoute field without error", async () => {
    const res = await askSse("Cosa vedo qui?", { currentRoute: "/pnrr" });
    expect(res.status).toBe(200);
    expect(sseBody(res)).toContain('"done":true');
  });

  it("calls the AI model with the user question in messages", async () => {
    await askSse("Test data anchoring");

    expect(mockCreate).toHaveBeenCalled();
    const callArgs = mockCreate.mock.calls[0][0] as {
      messages: { role: string; content: string }[];
    };
    const userMsg = callArgs.messages.find((m) => m.role === "user");
    expect(userMsg?.content).toBe("Test data anchoring");
  });
});

// ---------------------------------------------------------------------------
// POST /api/helper/ask — 503 when AI integration is unavailable
// ---------------------------------------------------------------------------
describe("POST /api/helper/ask — integration unavailable", () => {
  it("returns 503 when AI env vars are absent and client not yet cached", async () => {
    // Reset cache so getOpenAiClient() will re-check env vars.
    _resetOpenAiClientForTest();
    const origBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
    const origKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
    delete process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
    delete process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

    try {
      const res = await request(app)
        .post("/api/helper/ask")
        .send({ question: "Test domanda" })
        .set("Content-Type", "application/json");

      expect(res.status).toBe(503);
      expect(res.body.error).toBeTruthy();
    } finally {
      if (origBase) process.env.AI_INTEGRATIONS_OPENAI_BASE_URL = origBase;
      if (origKey) process.env.AI_INTEGRATIONS_OPENAI_API_KEY = origKey;
    }
  });
});

// ---------------------------------------------------------------------------
// POST /api/helper/ask — rate limiting
// ---------------------------------------------------------------------------
describe("POST /api/helper/ask — rate limiting", () => {
  it("returns 429 after exceeding the per-IP limit", async () => {
    // Use a unique X-Forwarded-For IP to isolate this test's rate-limit bucket.
    const testIp = `10.99.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    let lastStatus = 200;
    for (let i = 0; i < 11; i++) {
      const res = await request(app)
        .post("/api/helper/ask")
        .send({ question: `Domanda ${i}` })
        .set("Content-Type", "application/json")
        .set("X-Forwarded-For", testIp);
      lastStatus = res.status;
      if (res.status === 429) break;
    }
    expect(lastStatus).toBe(429);
  });
});
