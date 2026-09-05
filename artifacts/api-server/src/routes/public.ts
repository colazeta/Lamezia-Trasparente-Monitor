import { Router, type IRouter, type Request } from "express";
import {
  listDocuments,
  getDocument,
  getDocumentMarkdown,
  listContracts,
  getContract,
  listThemes,
  getTheme,
  listPerformance,
  listPnrr,
} from "../lib/publicData";
import {
  getPublicCrimeEvent,
  getPublicCrimeEventsCoverage,
  listPublicCrimeEvents,
  publicCrimeEventsGeoJson,
} from "../lib/publicCrimeEvents";
import { withCrimeEventsOpenApi } from "../lib/publicCrimeOpenapi";
import { buildPublicOpenApi } from "../lib/publicOpenapi";

// API pubblica, documentata e in sola lettura. Montata su /api/public/v1.
// Nessuna autenticazione: espone solo dati già pubblici. Le scritture restano
// sui router interni protetti da requireIngestAuth.
const router: IRouter = Router();

function origin(req: Request): string {
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0] ??
    req.protocol;
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  return `${proto}://${host}`;
}

function baseUrl(req: Request): string {
  return `${origin(req)}/api/public/v1`;
}

function parseNumericId(raw: string): number {
  return Number.parseInt(raw, 10);
}

// Indice/discovery: elenca le risorse disponibili e i link a documentazione,
// specifica OpenAPI ed endpoint MCP.
router.get("/", (req, res) => {
  const base = baseUrl(req);
  res.json({
    name: "rendiamoLameziaTrasparente — API pubblica",
    version: "1.0.0",
    description:
      "API pubblica in sola lettura sui dati civici di Lamezia Terme: atti, " +
      "contratti, temi, performance, progetti PNRR ed eventi criminali documentati LTCEDS.",
    documentation: `${base}/openapi.json`,
    mcp: {
      endpoint: `${origin(req)}/api/mcp`,
      transport: "streamable-http",
      description: "Server compatibile MCP sugli stessi dati (sola lettura).",
    },
    resources: {
      documents: `${base}/documents`,
      contracts: `${base}/contracts`,
      themes: `${base}/themes`,
      performance: `${base}/performance`,
      pnrr: `${base}/pnrr`,
      crimeEvents: `${base}/crime-events`,
      crimeEventsGeoJson: `${base}/crime-events.geojson`,
      crimeEventsCoverage: `${base}/crime-events/coverage`,
    },
  });
});

router.get("/openapi.json", (req, res) => {
  res.json(withCrimeEventsOpenApi(buildPublicOpenApi(baseUrl(req))));
});

// --- Eventi criminali documentati (LTCEDS) ---
// Route specifiche prima di :eventId per evitare che "coverage" venga
// interpretato come identificatore. Tutti i reader sottostanti interrogano
// esclusivamente crime_public_events.
router.get("/crime-events/coverage", async (_req, res) => {
  res.json(await getPublicCrimeEventsCoverage());
});

router.get("/crime-events.geojson", async (req, res) => {
  const result = await publicCrimeEventsGeoJson(req.query);
  res.type("application/geo+json").json(result);
});

router.get("/crime-events", async (req, res) => {
  res.json(await listPublicCrimeEvents(req.query));
});

router.get("/crime-events/:eventId", async (req, res) => {
  const event = await getPublicCrimeEvent(req.params.eventId);
  if (!event) {
    res.status(404).json({ error: "Evento non disponibile nella proiezione pubblica" });
    return;
  }
  res.json(event);
});

// --- Documenti / atti ---
router.get("/documents", async (req, res) => {
  res.json(await listDocuments(req.query));
});

router.get("/documents/:id/markdown", async (req, res) => {
  const result = await getDocumentMarkdown(req.params.id);
  if (!result) {
    res.status(404).json({ error: "Testo Markdown non disponibile per questo atto" });
    return;
  }
  if (req.query.format === "md") {
    res.type("text/markdown; charset=utf-8").send(result.markdown);
    return;
  }
  res.json(result);
});

router.get("/documents/:id", async (req, res) => {
  const doc = await getDocument(req.params.id);
  if (!doc) {
    res.status(404).json({ error: "Atto non trovato" });
    return;
  }
  res.json(doc);
});

// --- Contratti ---
router.get("/contracts", async (req, res) => {
  res.json(await listContracts(req.query));
});

router.get("/contracts/:id", async (req, res) => {
  const contract = await getContract(parseNumericId(req.params.id));
  if (!contract) {
    res.status(404).json({ error: "Contratto non trovato" });
    return;
  }
  res.json(contract);
});

// --- Temi ---
router.get("/themes", async (req, res) => {
  res.json(await listThemes(req.query));
});

router.get("/themes/:id", async (req, res) => {
  const theme = await getTheme(parseNumericId(req.params.id));
  if (!theme) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }
  res.json(theme);
});

// --- Performance ---
router.get("/performance", async (_req, res) => {
  res.json(await listPerformance());
});

// --- PNRR ---
router.get("/pnrr", async (req, res) => {
  res.json(await listPnrr(req.query));
});

export default router;
