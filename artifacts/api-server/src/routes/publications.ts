import { Router, type IRouter } from "express";
import {
  db,
  publicationsTable,
  attuazionePnrrProjectsTable,
  italiadomaniProjectsTable,
  contractsTable,
  feedStatusTable,
  sessionReportsTable,
  sessionInterventionsTable,
  seduteTable,
  organiTable,
  officialsTable,
  officialVotesTable,
  classifyMacrotema,
  type Publication,
  type SessionReport,
  type SessionIntervention,
} from "@workspace/db";
import { and, eq, asc, desc, ilike, gte, lte, ne, or, sql } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import {
  UpsertSedutaReportBody,
  SetPublicationBriefBody,
} from "@workspace/api-zod";
import { ALBO_SOURCE } from "../lib/ingestion";
import { ITALIADOMANI_SOURCE } from "../lib/italiadomaniPnrr";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";
import {
  briefGenerationInProgress,
  countBriefCandidates,
  isBriefAiConfigured,
  isBriefBatchRunning,
  regenerateBriefNow,
  startBriefBatch,
  startLazyBriefGeneration,
} from "../lib/briefs";

const router: IRouter = Router();

function sanitizeText(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
}

function mapIntervention(i: SessionIntervention) {
  return {
    id: i.id,
    speakerName: i.speakerName,
    speakerRole: i.speakerRole,
    content: i.content,
    position: i.position,
  };
}

// ---------------------------------------------------------------------------
// Estrazione punti all'Ordine del Giorno (ODG) dalla seduta/convocazione.
// Supporta i pattern più comuni nei documenti comunali italiani:
//   "1. Approvazione …"  |  "1) Approvazione …"
//   "PUNTO 1: …"         |  "Punto 1 - …"
//
// Se vengono fornite delibere e contratti collegati alla seduta, ogni punto
// viene abbinato agli atti corrispondenti per testo (overlap di parole chiave)
// oppure per posizione (se il numero di delibere corrisponde al numero di punti).
// ---------------------------------------------------------------------------

const ODG_STOPWORDS = new Set([
  "di", "il", "la", "le", "lo", "gli", "i", "e", "in", "a", "per", "con",
  "del", "della", "dei", "delle", "degli", "su", "da", "tra", "fra",
  "un", "una", "uno", "che", "non", "al", "ai", "all", "alle", "nelle",
  "nei", "col", "etc", "vari", "varie", "atti", "atto", "atti",
  "approvazione", "delibera", "deliberazione", "proposta", "schema",
  "ratifica", "presa", "d'atto", "dato", "voto", "parere", "mozione",
]);

function odgKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,;:.!?()\[\]{}'"/\\]+/)
    .filter((w) => w.length >= 4 && !ODG_STOPWORDS.has(w));
}

function keywordOverlap(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((w) => setB.has(w)).length;
}

type OdgOutcome = {
  type: "delibera" | "albo" | "contract";
  id: number;
  title: string;
  matchedBy: "keywords" | "position";
};

export function extractOdgPoints(
  text: string | null,
  relatedDelibere: { id: number; oggetto: string; category: string }[] = [],
  relatedContracts: { id: number; title: string }[] = [],
): { index: number; text: string; macrotema: string; outcomes: OdgOutcome[] }[] {
  if (!text || !text.trim()) return [];

  // Cerca una sezione ODG esplicita; altrimenti usa l'intero testo.
  const odgMatch =
    /(?:ordine del giorno|o\.d\.g\.|punti all.{0,15}o\.?d\.?g\.?)[:\s]*([\s\S]*?)(?:\n{2,}|$)/i.exec(
      text,
    );
  const source = odgMatch ? odgMatch[1] : text;

  const points: { index: number; text: string; macrotema: string; outcomes: OdgOutcome[] }[] = [];
  const seen = new Set<number>();

  // Pattern: "1. testo" o "1) testo"
  const p1 = /^(\d+)[.)]\s+(.+)/gm;
  // Pattern: "PUNTO 1: testo" o "Punto 1 - testo"
  const p2 = /^PUNTO\s+(\d+)[:\-\s]+(.+)/gim;

  for (const pattern of [p1, p2]) {
    let m;
    while ((m = pattern.exec(source)) !== null) {
      const idx = parseInt(m[1], 10);
      if (seen.has(idx)) continue;
      seen.add(idx);
      const pointText = m[2].replace(/\s+/g, " ").trim();
      if (pointText.length < 5) continue;
      points.push({
        index: idx,
        text: pointText,
        macrotema: classifyMacrotema(pointText),
        outcomes: [],
      });
    }
    if (points.length > 0) break;
  }

  points.sort((a, b) => a.index - b.index);

  if (points.length > 0) {
    const pointKeywords = points.map((p) => odgKeywords(p.text));

    // Abbinamento per parole chiave: soglia ≥ 2 parole in comune.
    const MIN_OVERLAP = 2;
    for (let i = 0; i < points.length; i++) {
      const kw = pointKeywords[i];

      for (const d of relatedDelibere) {
        if (keywordOverlap(kw, odgKeywords(d.oggetto)) >= MIN_OVERLAP) {
          points[i].outcomes.push({
            type: d.category === "delibera" ? "delibera" : "albo",
            id: d.id,
            title: d.oggetto,
            matchedBy: "keywords",
          });
        }
      }

      for (const c of relatedContracts) {
        if (keywordOverlap(kw, odgKeywords(c.title)) >= MIN_OVERLAP) {
          points[i].outcomes.push({
            type: "contract",
            id: c.id,
            title: c.title,
            matchedBy: "keywords",
          });
        }
      }

      // Abbinamento per posizione se le keyword non trovano nulla e il numero
      // di delibere corrisponde al numero di punti ODG (pattern frequente nelle
      // sedute comunali con un delibera per punto).
      if (
        points[i].outcomes.length === 0 &&
        relatedDelibere.length === points.length
      ) {
        const d = relatedDelibere[i];
        if (d) {
          points[i].outcomes.push({
            type: d.category === "delibera" ? "delibera" : "albo",
            id: d.id,
            title: d.oggetto,
            matchedBy: "position",
          });
        }
      }
    }
  }

  return points.slice(0, 30);
}

// Restituisce i macrotemi unici degli ODG della convocazione (per badge multi-tema
// nella lista convocazioni).
function computeOdgMacrotemi(text: string | null): string[] {
  const pts = extractOdgPoints(text);
  const unique = Array.from(new Set(pts.map((p) => p.macrotema))).filter(
    (m) => m !== "altro",
  );
  return unique;
}

async function buildSedutaDetail(publication: Publication) {
  const [report] = await db
    .select()
    .from(sessionReportsTable)
    .where(eq(sessionReportsTable.publicationId, publication.id));


  let interventions: SessionIntervention[] = [];
  if (report) {
    interventions = await db
      .select()
      .from(sessionInterventionsTable)
      .where(eq(sessionInterventionsTable.reportId, report.id))
      .orderBy(
        asc(sessionInterventionsTable.position),
        asc(sessionInterventionsTable.id),
      );
  }

  const [seduta] = await db
    .select()
    .from(seduteTable)
    .where(eq(seduteTable.publicationId, publication.id));

  let organo: {
    id: number;
    type: string;
    name: string;
    slug: string;
  } | null = null;
  let votes: {
    officialId: number;
    name: string;
    slug: string;
    vote: string;
  }[] = [];

  if (seduta) {
    if (seduta.organoId) {
      const [org] = await db
        .select()
        .from(organiTable)
        .where(eq(organiTable.id, seduta.organoId));
      if (org) {
        organo = { id: org.id, type: org.type, name: org.name, slug: org.slug };
      }
    }
    votes = await db
      .select({
        officialId: officialsTable.id,
        name: officialsTable.name,
        slug: officialsTable.slug,
        vote: officialVotesTable.vote,
      })
      .from(officialVotesTable)
      .innerJoin(
        officialsTable,
        eq(officialVotesTable.officialId, officialsTable.id),
      )
      .where(eq(officialVotesTable.sedutaId, seduta.id))
      .orderBy(asc(officialsTable.name));
  }

  // Cerca delibere prodotte nella stessa sessione (stessa subcategory,
  // entro 14 giorni dalla convocazione) per abbinamento ai punti ODG.
  let sessionDelibere: { id: number; oggetto: string; category: string }[] = [];
  if (publication.pubStart) {
    const windowMs = 14 * 24 * 60 * 60 * 1000;
    const after = new Date(publication.pubStart.getTime() - windowMs);
    const before = new Date(publication.pubStart.getTime() + windowMs);
    const conditions = [
      eq(publicationsTable.category, "delibera"),
      gte(publicationsTable.pubStart, after),
      lte(publicationsTable.pubStart, before),
    ];
    if (publication.subcategory) {
      conditions.push(eq(publicationsTable.subcategory, publication.subcategory));
    }
    sessionDelibere = await db
      .select({
        id: publicationsTable.id,
        oggetto: publicationsTable.oggetto,
        category: publicationsTable.category,
      })
      .from(publicationsTable)
      .where(and(...conditions))
      .orderBy(asc(publicationsTable.dataAtto), asc(publicationsTable.id))
      .limit(30);
  }

  // Estrai i punti ODG dal campo agenda della seduta (se disponibile) oppure
  // dal markdownText della convocazione (fallback). Usato per mostrare il tema
  // di ciascun punto dell'ordine del giorno nella UI.
  const odgSource = seduta?.agenda ?? publication.markdownText ?? null;
  const odgPoints = extractOdgPoints(odgSource, sessionDelibere, []);

  return {
    ...mapPublication(publication),
    hasReport: Boolean(report),
    summary: report?.summary ?? null,
    interventions: interventions.map(mapIntervention),
    organo,
    votes,
    odgPoints,
  };
}

function mapPublication(p: Publication) {
  return {
    id: p.id,
    progressivo: p.progressivo,
    tipologia: p.tipologia,
    category: p.category,
    subcategory: p.subcategory,
    provenienza: p.provenienza,
    oggetto: p.oggetto,
    dataAtto: p.dataAtto ? p.dataAtto.toISOString() : null,
    pubStart: p.pubStart ? p.pubStart.toISOString() : null,
    pubEnd: p.pubEnd ? p.pubEnd.toISOString() : null,
    numRegSet: p.numRegSet,
    numRegGen: p.numRegGen,
    cups: p.cups,
    pnrrMission: p.pnrrMission,
    isPnrr: p.isPnrr,
    attachments: p.attachments ?? [],
    isNew: p.isNew,
    firstSeenAt: p.firstSeenAt.toISOString(),
    // Macrotema: usa il valore persistito (eventualmente curato manualmente);
    // ricade sulla classificazione automatica per i record ancora senza valore.
    macrotema:
      p.macrotema ?? classifyMacrotema(`${p.oggetto} ${p.tipologia ?? ""}`),
    // Sintesi "In breve" generata dall'AI (null finché non generata).
    brief: p.brief ?? null,
    // Vero se la sintesi è stata scritta/curata a mano (il batch la lascia stare).
    briefManual: p.briefManual,
    // Quando la sintesi è stata generata/aggiornata l'ultima volta.
    briefGeneratedAt: p.briefGeneratedAt
      ? p.briefGeneratedAt.toISOString()
      : null,
    // Per le convocazioni: macrotemi aggregati dai punti ODG (multi-tema).
    // Permette alla lista convocazioni di mostrare badge per tutti i temi
    // trattati nella seduta, non solo il macrotema principale.
    odgMacrotemi:
      p.category === "convocazione"
        ? computeOdgMacrotemi(p.markdownText ?? null)
        : [],
  };
}

function buildFilters(req: {
  query: Record<string, unknown>;
}) {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;
  const tipologia =
    typeof req.query.tipologia === "string" ? req.query.tipologia : undefined;
  const from = typeof req.query.from === "string" ? req.query.from : undefined;
  const to = typeof req.query.to === "string" ? req.query.to : undefined;

  const conditions = [];
  if (q) conditions.push(ilike(publicationsTable.oggetto, `%${q}%`));
  if (category) conditions.push(eq(publicationsTable.category, category));
  if (tipologia) conditions.push(eq(publicationsTable.tipologia, tipologia));
  const fromDate = from ? new Date(from) : undefined;
  if (fromDate && !Number.isNaN(fromDate.getTime())) {
    conditions.push(gte(publicationsTable.pubStart, fromDate));
  }
  const toDate = to ? new Date(to) : undefined;
  if (toDate && !Number.isNaN(toDate.getTime())) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(to as string)) {
      toDate.setHours(23, 59, 59, 999);
    }
    conditions.push(lte(publicationsTable.pubStart, toDate));
  }
  return conditions;
}

router.get("/publications/feed-status", async (_req, res) => {
  const [row] = await db
    .select()
    .from(feedStatusTable)
    .where(eq(feedStatusTable.source, ALBO_SOURCE));

  if (!row) {
    res.json({
      source: ALBO_SOURCE,
      label: null,
      url: null,
      status: "pending",
      error: null,
      itemsTotal: 0,
      itemsNew: 0,
      lastCheckedAt: null,
      lastUpdatedAt: null,
    });
    return;
  }

  res.json({
    source: row.source,
    label: row.label,
    url: row.url,
    status: row.status,
    error: row.error,
    itemsTotal: row.itemsTotal,
    itemsNew: row.itemsNew,
    lastCheckedAt: row.lastCheckedAt ? row.lastCheckedAt.toISOString() : null,
    lastUpdatedAt: row.lastUpdatedAt ? row.lastUpdatedAt.toISOString() : null,
  });
});

router.get("/publications", async (req, res) => {
  const macrotemaFilter =
    typeof req.query.macrotema === "string" ? req.query.macrotema : undefined;
  const conditions = buildFilters(req);
  // Filtro macrotema a livello DB: usa il valore persistito quando disponibile;
  // le righe senza macrotema persistito vengono incluse solo se la classificazione
  // automatica in-memory corrisponde (post-filter residuale).
  if (macrotemaFilter) {
    conditions.push(
      or(
        eq(publicationsTable.macrotema, macrotemaFilter),
        // Include rows not yet backfilled: resolved to in-memory filter below.
        sql`${publicationsTable.macrotema} IS NULL`,
      )!,
    );
  }
  const rows = await db
    .select()
    .from(publicationsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(publicationsTable.pubStart), desc(publicationsTable.id));

  let filtered = rows;
  // Post-filter only the IS NULL rows that haven't been classified+persisted yet.
  if (macrotemaFilter) {
    filtered = rows.filter(
      (r) =>
        r.macrotema === macrotemaFilter ||
        (!r.macrotema &&
          classifyMacrotema(`${r.oggetto} ${r.tipologia ?? ""}`) ===
            macrotemaFilter),
    );
  }

  res.json(filtered.map(mapPublication));
});

router.get("/publications/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Atto non trovato" });
    return;
  }

  const [publication] = await db
    .select()
    .from(publicationsTable)
    .where(eq(publicationsTable.id, id));

  if (!publication) {
    res.status(404).json({ error: "Atto non trovato" });
    return;
  }

  // Genera "In breve" in modo lazy se non ancora disponibile.
  // Funziona sia con markdownText (testo completo) sia con solo l'oggetto.
  // Non sovrascrive le sintesi manuali (briefManual=true).
  // Il lock impedisce chiamate LLM concorrenti per lo stesso atto (protezione costi).
  if (!publication.brief && !publication.briefManual) {
    startLazyBriefGeneration(
      id,
      publication.oggetto,
      publication.markdownText ?? null,
    );
  }

  res.json(mapPublication(publication));
});

router.get("/publications/:id/storia", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Atto non trovato" });
    return;
  }

  const [publication] = await db
    .select()
    .from(publicationsTable)
    .where(eq(publicationsTable.id, id));

  if (!publication) {
    res.status(404).json({ error: "Atto non trovato" });
    return;
  }

  const oggettoUpper = publication.oggetto.toUpperCase();
  const cupsUpper = publication.cups.map((c) => c.toUpperCase());

  // Cerca contratti collegati via CIG (il CIG del contratto compare nell'oggetto
  // dell'atto) oppure via CUP (il CUP del contratto è nella lista cups dell'atto).
  const allContracts = await db.select().from(contractsTable);
  const relatedContracts: {
    id: number;
    title: string;
    cig: string | null;
    cup: string | null;
    amount: number;
    awardDate: string;
    macrotema: string | null;
    matchedBy: "cig" | "cup";
  }[] = [];

  for (const c of allContracts) {
    let matchedBy: "cig" | "cup" | null = null;
    if (c.cig && oggettoUpper.includes(c.cig.toUpperCase())) {
      matchedBy = "cig";
    } else if (c.cup && cupsUpper.includes(c.cup.toUpperCase())) {
      matchedBy = "cup";
    }
    if (matchedBy) {
      relatedContracts.push({
        id: c.id,
        title: c.title,
        cig: c.cig,
        cup: c.cup,
        amount: Number(c.amount),
        awardDate: c.awardDate.toISOString(),
        macrotema: c.macrotema ?? null,
        matchedBy,
      });
    }
  }

  // Cerca progetti PNRR collegati via CUP.
  const relatedPnrr: {
    id: number;
    cup: string;
    title: string;
    mission: string | null;
    matchedBy: "cup";
  }[] = [];

  if (cupsUpper.length > 0) {
    const pnrrRows = await db
      .select()
      .from(italiadomaniProjectsTable)
      .where(
        sql`UPPER(${italiadomaniProjectsTable.cup}) = ANY(ARRAY[${sql.join(cupsUpper.map((c) => sql`${c}`), sql`, `)}]::text[])`,
      );
    for (const p of pnrrRows) {
      relatedPnrr.push({
        id: p.id,
        cup: p.cup,
        title: p.title,
        mission: p.mission ?? null,
        matchedBy: "cup",
      });
    }
  }

  // Cerca pubblicazioni sorelle che condividono lo stesso CIG o uno dei CUP.
  // Usa i CIG estratti dai contratti correlati come pivot.
  const relatedCigs = relatedContracts
    .filter((c) => c.cig)
    .map((c) => c.cig as string);

  const siblingRows: Publication[] = [];

  // Match per CIG: cerca altre pubblicazioni che menzionano gli stessi CIG.
  for (const cig of relatedCigs) {
    const rows = await db
      .select()
      .from(publicationsTable)
      .where(
        and(
          ne(publicationsTable.id, id),
          ilike(publicationsTable.oggetto, `%${cig}%`),
        ),
      )
      .orderBy(desc(publicationsTable.pubStart))
      .limit(10);
    for (const r of rows) {
      if (!siblingRows.find((s) => s.id === r.id)) siblingRows.push(r);
    }
  }

  // Match per CUP: cerca altre pubblicazioni con gli stessi CUP strutturati.
  if (cupsUpper.length > 0) {
    const cupRows = await db
      .select()
      .from(publicationsTable)
      .where(
        and(
          ne(publicationsTable.id, id),
          sql`${publicationsTable.cups} && ARRAY[${sql.join(cupsUpper.map((c) => sql`${c}`), sql`, `)}]::text[]`,
        ),
      )
      .orderBy(desc(publicationsTable.pubStart))
      .limit(10);
    for (const r of cupRows) {
      if (!siblingRows.find((s) => s.id === r.id)) siblingRows.push(r);
    }
  }

  const siblings = siblingRows.slice(0, 15).map((r) => {
    const cig = relatedCigs.find((c) => r.oggetto.toUpperCase().includes(c.toUpperCase()));
    const matchedBy: "cig" | "cup" = cig ? "cig" : "cup";
    return {
      id: r.id,
      progressivo: r.progressivo,
      oggetto: r.oggetto,
      tipologia: r.tipologia,
      category: r.category,
      pubStart: r.pubStart ? r.pubStart.toISOString() : null,
      macrotema:
        r.macrotema ?? classifyMacrotema(`${r.oggetto} ${r.tipologia ?? ""}`),
      matchedBy,
    };
  });

  // Seduta di origine: la convocazione da cui è stato prodotto questo atto.
  // Non applicabile se questo atto è già una convocazione (è esso stesso la seduta).
  // Cerca la prima convocazione sorella che condivide CIG o CUP (cronologicamente
  // precedente o coincidente), presumendo che sia l'atto che ha convocato la seduta.
  let originatingSeduta: {
    id: number;
    progressivo: string;
    oggetto: string;
    pubStart: string | null;
    subcategory: string | null;
  } | null = null;

  if (publication.category !== "convocazione") {
    const convSiblings = siblingRows.filter(
      (r) => r.category === "convocazione",
    );
    if (convSiblings.length > 0) {
      // Prefer the earliest convocazione (likely the one that called the meeting).
      const earliest = [...convSiblings].sort((a, b) => {
        const ta = a.pubStart?.getTime() ?? 0;
        const tb = b.pubStart?.getTime() ?? 0;
        return ta - tb;
      })[0];
      originatingSeduta = {
        id: earliest.id,
        progressivo: earliest.progressivo,
        oggetto: earliest.oggetto,
        pubStart: earliest.pubStart ? earliest.pubStart.toISOString() : null,
        subcategory: earliest.subcategory ?? null,
      };
    }
  }

  res.json({
    contracts: relatedContracts,
    pnrrProjects: relatedPnrr,
    siblings,
    originatingSeduta,
  });
});

router.get("/delibere", async (req, res) => {
  const tipo = typeof req.query.tipo === "string" ? req.query.tipo : undefined;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;

  const conditions = [eq(publicationsTable.category, "delibera")];
  if (tipo) conditions.push(eq(publicationsTable.subcategory, tipo));
  if (q) conditions.push(ilike(publicationsTable.oggetto, `%${q}%`));

  const rows = await db
    .select()
    .from(publicationsTable)
    .where(and(...conditions))
    .orderBy(desc(publicationsTable.pubStart), desc(publicationsTable.id));
  res.json(rows.map(mapPublication));
});

router.get("/convocazioni", async (req, res) => {
  const tipo = typeof req.query.tipo === "string" ? req.query.tipo : undefined;
  const macrotemaFilter =
    typeof req.query.macrotema === "string" ? req.query.macrotema : undefined;

  const conditions = [eq(publicationsTable.category, "convocazione")];
  if (tipo) conditions.push(eq(publicationsTable.subcategory, tipo));
  // Macrotema DB filter: include rows matching persisted value OR not yet classified.
  if (macrotemaFilter) {
    conditions.push(
      or(
        eq(publicationsTable.macrotema, macrotemaFilter),
        sql`${publicationsTable.macrotema} IS NULL`,
      )!,
    );
  }

  const rows = await db
    .select()
    .from(publicationsTable)
    .where(and(...conditions))
    .orderBy(desc(publicationsTable.pubStart), desc(publicationsTable.id));

  // Map and then post-filter: include rows whose publication-level macrotema
  // OR any ODG-point macrotema matches the requested filter.
  const mapped = rows.map(mapPublication);
  const filtered = macrotemaFilter
    ? mapped.filter(
        (r) =>
          r.macrotema === macrotemaFilter ||
          r.odgMacrotemi.includes(macrotemaFilter),
      )
    : mapped;

  res.json(filtered);
});

async function findConvocazione(id: number): Promise<Publication | undefined> {
  const [publication] = await db
    .select()
    .from(publicationsTable)
    .where(
      and(
        eq(publicationsTable.id, id),
        eq(publicationsTable.category, "convocazione"),
      ),
    );
  return publication;
}

router.get("/convocazioni/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Seduta non trovata" });
    return;
  }

  const publication = await findConvocazione(id);
  if (!publication) {
    res.status(404).json({ error: "Seduta non trovata" });
    return;
  }

  res.json(await buildSedutaDetail(publication));
});

router.post(
  "/convocazioni/:id/report",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Seduta non trovata" });
      return;
    }

    const parsed = UpsertSedutaReportBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati del resoconto non validi" });
      return;
    }

    const publication = await findConvocazione(id);
    if (!publication) {
      res.status(404).json({ error: "Seduta non trovata" });
      return;
    }

    const summary =
      typeof parsed.data.summary === "string" && sanitizeText(parsed.data.summary)
        ? sanitizeText(parsed.data.summary)
        : null;

    const interventions = parsed.data.interventions.map((intervention) => ({
      speakerName: sanitizeText(intervention.speakerName),
      speakerRole:
        typeof intervention.speakerRole === "string" &&
        sanitizeText(intervention.speakerRole)
          ? sanitizeText(intervention.speakerRole)
          : null,
      content: sanitizeText(intervention.content),
    }));

    if (interventions.some((i) => !i.speakerName || !i.content)) {
      res.status(400).json({
        error: "Ogni intervento richiede un relatore e un contenuto.",
      });
      return;
    }

    await db.transaction(async (tx) => {
      const [report]: SessionReport[] = await tx
        .insert(sessionReportsTable)
        .values({ publicationId: id, summary })
        .onConflictDoUpdate({
          target: sessionReportsTable.publicationId,
          set: { summary, updatedAt: new Date() },
        })
        .returning();

      await tx
        .delete(sessionInterventionsTable)
        .where(eq(sessionInterventionsTable.reportId, report.id));

      if (interventions.length) {
        await tx.insert(sessionInterventionsTable).values(
          interventions.map((intervention, index) => ({
            reportId: report.id,
            ...intervention,
            position: index,
          })),
        );
      }
    });

    res.json(await buildSedutaDetail(publication));
  },
);

function normalizeCup(value: string): string {
  return value.toUpperCase().replace(/\s+/g, "");
}

const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

function isStaleUpdate(
  lastUpdatedAt: Date | null,
  lastSeenAt: Date,
  status: string | null,
): boolean {
  const s = (status ?? "").toLowerCase();
  if (
    s.includes("conclus") ||
    s.includes("complet") ||
    s.includes("chius") ||
    s.includes("terminat")
  ) {
    return false;
  }
  const ref = lastUpdatedAt ?? lastSeenAt;
  return Date.now() - ref.getTime() > SIX_MONTHS_MS;
}

router.get("/pnrr/projects", async (_req, res) => {
  const [masterList, attuazioneRows, alboRows, italiadomaniStatus] =
    await Promise.all([
      db
        .select()
        .from(italiadomaniProjectsTable)
        .orderBy(
          desc(italiadomaniProjectsTable.lastSeenAt),
          desc(italiadomaniProjectsTable.id),
        ),
      db.select().from(attuazionePnrrProjectsTable),
      db
        .select()
        .from(publicationsTable)
        .where(eq(publicationsTable.isPnrr, true))
        .orderBy(desc(publicationsTable.pubStart), desc(publicationsTable.id)),
      db
        .select()
        .from(feedStatusTable)
        .where(eq(feedStatusTable.source, ITALIADOMANI_SOURCE))
        .then((rows) => rows[0] ?? null),
    ]);

  // Index attuazione rows by normalised CUP for O(1) lookup.
  const attuazioneByCup = new Map<
    string,
    (typeof attuazioneRows)[number]
  >();
  for (const r of attuazioneRows) {
    if (r.cup) attuazioneByCup.set(normalizeCup(r.cup), r);
  }

  // Index albo publications by CUP.
  const docsByCup = new Map<string, Publication[]>();
  for (const r of alboRows) {
    for (const c of r.cups) {
      const cup = normalizeCup(c);
      const list = docsByCup.get(cup);
      if (list) list.push(r);
      else docsByCup.set(cup, [r]);
    }
  }

  const matchedDocIds = new Set<number>();

  // The Italia Domani census is always the authoritative master list.
  // If the table is empty (ingestor has not yet run or failed), return an
  // empty census with explicit feed state — never substitute the old
  // Attuazione source as master, which would misrepresent coverage.

  let projects: object[];

  if (masterList.length === 0) {
    projects = [];
  } else {
    projects = masterList.map((p) => {
      const cup = normalizeCup(p.cup);
      const attuazione = attuazioneByCup.get(cup);
      const trasparenzaCompleta = Boolean(attuazione);
      const aggiornamentoVecchio = isStaleUpdate(
        p.italiadomaniUpdatedAt,
        p.lastSeenAt,
        p.status,
      );

      const alboMatched = docsByCup.get(cup) ?? [];
      const documents = alboMatched.map((d) => {
        matchedDocIds.add(d.id);
        return mapPublication(d);
      });
      let lastPublication: string | null = null;
      for (const d of documents) {
        if (d.pubStart && (!lastPublication || d.pubStart > lastPublication)) {
          lastPublication = d.pubStart;
        }
      }

      const allAttachments = attuazione?.attachments ?? [];
      const lastUpdatedAt =
        p.italiadomaniUpdatedAt?.toISOString() ??
        p.lastSeenAt.toISOString();

      return {
        id: p.id,
        key: p.cup,
        sourceId: p.cup,
        url: attuazione?.url ?? null,
        title: p.title,
        cup: p.cup,
        mission: p.mission,
        component: p.component,
        investment: p.investment,
        intervention: attuazione?.intervention ?? null,
        holder: p.holder,
        attuatore: p.attuatore,
        importoFinanziato:
          p.importoFinanziato != null ? Number(p.importoFinanziato) : null,
        status: p.status,
        startDate: p.startDate ? p.startDate.toISOString() : null,
        endDate: p.endDate ? p.endDate.toISOString() : null,
        publishedAt: attuazione?.publishedAt
          ? attuazione.publishedAt.toISOString()
          : null,
        lastUpdatedAt,
        attachments: allAttachments,
        trasparenzaCompleta,
        aggiornamentoVecchio,
        documentsCount: documents.length,
        lastPublication,
        documents,
      };
    });
  }

  const uncensored = alboRows
    .filter((r) => !matchedDocIds.has(r.id))
    .map(mapPublication);

  const censusLastUpdatedAt = italiadomaniStatus?.lastUpdatedAt
    ? italiadomaniStatus.lastUpdatedAt.toISOString()
    : null;

  res.json({ projects, uncensored, censusLastUpdatedAt });
});

// ---------------------------------------------------------------------------
// Rigenera la sintesi "In breve" di un SINGOLO atto su richiesta (un clic dalla
// scheda atto del pannello di redazione). A differenza del batch, FORZA la
// sovrascrittura: utile quando una sintesi generata è sbagliata o di bassa
// qualità. Reimposta briefManual=false (è una sintesi AI). Le sintesi scritte a
// mano si gestiscono con PUT /admin/publications/:id/brief.
// ---------------------------------------------------------------------------
router.post(
  "/admin/publications/:id/regenerate-brief",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Atto non trovato" });
      return;
    }

    if (!isBriefAiConfigured()) {
      res.status(503).json({
        error:
          "Generazione AI non configurata: impostare AI_INTEGRATIONS_OPENAI_BASE_URL e AI_INTEGRATIONS_OPENAI_API_KEY.",
      });
      return;
    }

    const [publication] = await db
      .select()
      .from(publicationsTable)
      .where(eq(publicationsTable.id, id));

    if (!publication) {
      res.status(404).json({ error: "Atto non trovato" });
      return;
    }

    const outcome = await regenerateBriefNow(
      id,
      publication.oggetto,
      publication.markdownText ?? null,
    );

    if (outcome.status === "busy") {
      res.status(409).json({
        error: "Generazione già in corso per questo atto. Riprova tra poco.",
      });
      return;
    }
    if (outcome.status === "failed") {
      res.status(502).json({
        error:
          "Impossibile rigenerare la sintesi: il servizio AI non ha restituito un testo. Riprova più tardi.",
      });
      return;
    }

    const [updated] = await db
      .select()
      .from(publicationsTable)
      .where(eq(publicationsTable.id, id));

    res.json(mapPublication(updated ?? publication));
  },
);

// ---------------------------------------------------------------------------
// Imposta/sostituisce a mano la sintesi "In breve" di un SINGOLO atto. Scrivere
// un testo imposta briefManual=true così il batch automatico la lascia stare;
// inviare un testo vuoto azzera la sintesi (brief=null, briefManual=false) così
// la generazione automatica potrà riproporne una. Un clic dalla scheda atto del
// pannello di redazione.
// ---------------------------------------------------------------------------
router.put(
  "/admin/publications/:id/brief",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Atto non trovato" });
      return;
    }

    const parsed = SetPublicationBriefBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Sintesi non valida" });
      return;
    }

    const [publication] = await db
      .select()
      .from(publicationsTable)
      .where(eq(publicationsTable.id, id));

    if (!publication) {
      res.status(404).json({ error: "Atto non trovato" });
      return;
    }

    const cleaned = sanitizeText(parsed.data.brief);

    if (!cleaned) {
      // Testo vuoto → azzera la sintesi e riabilita la generazione automatica.
      await db
        .update(publicationsTable)
        .set({ brief: null, briefManual: false, briefGeneratedAt: null })
        .where(eq(publicationsTable.id, id));
    } else {
      await db
        .update(publicationsTable)
        .set({
          brief: cleaned,
          briefManual: true,
          briefGeneratedAt: new Date(),
        })
        .where(eq(publicationsTable.id, id));
    }

    const [updated] = await db
      .select()
      .from(publicationsTable)
      .where(eq(publicationsTable.id, id));

    res.json(mapPublication(updated ?? publication));
  },
);

// ---------------------------------------------------------------------------
// Stato della generazione "In breve": quante sintesi mancano ancora (atti con
// testo completo ma senza brief, non curati a mano), quante sono già presenti e
// se un batch è in corso. Usato dal pannello di redazione per mostrare lo stato
// e l'avanzamento del backfill senza dover leggere i log dell'api-server.
// La logica condivisa vive in ../lib/briefs.
// ---------------------------------------------------------------------------
router.get(
  "/admin/publications/briefs-status",
  requireIngestAuth,
  async (_req, res) => {
    const [pending, [withBrief], [total]] = await Promise.all([
      countBriefCandidates(),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(publicationsTable)
        .where(sql`${publicationsTable.brief} IS NOT NULL`),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(publicationsTable),
    ]);

    res.json({
      running: isBriefBatchRunning(),
      pending,
      withBrief: withBrief?.count ?? 0,
      total: total?.count ?? 0,
    });
  },
);

// ---------------------------------------------------------------------------
// Batch job: pre-genera le sintesi "In breve" per tutti gli atti esistenti che
// non hanno ancora una sintesi. Avvio manuale via endpoint protetto
// (server-to-server / cron). Gira in background per non incappare nei timeout
// HTTP su grandi volumi; l'avanzamento è visibile nei log dell'api-server.
// La logica condivisa vive in ../lib/briefs (riusata anche dal ciclo di
// ingestione per pre-generare le sintesi proattivamente).
// ---------------------------------------------------------------------------
router.post(
  "/admin/publications/generate-briefs",
  requireIngestAuth,
  async (_req, res) => {
    if (!isBriefAiConfigured()) {
      res.status(503).json({
        error:
          "Generazione AI non configurata: impostare AI_INTEGRATIONS_OPENAI_BASE_URL e AI_INTEGRATIONS_OPENAI_API_KEY.",
      });
      return;
    }

    if (isBriefBatchRunning()) {
      res.status(409).json({ error: "Generazione sintesi già in corso." });
      return;
    }

    const candidates = await countBriefCandidates();
    if (candidates === 0) {
      res.json({
        status: "noop",
        candidates: 0,
        message: "Nessun atto da elaborare: tutte le sintesi sono già presenti.",
      });
      return;
    }

    // Avvio fire-and-forget protetto dal lock di processo: la risposta torna
    // subito, il job continua in background.
    const outcome = startBriefBatch();
    if (outcome === "already-running") {
      res.status(409).json({ error: "Generazione sintesi già in corso." });
      return;
    }

    res.status(202).json({
      status: "started",
      candidates,
      message: `Generazione avviata per ${candidates} atti. Avanzamento nei log dell'api-server.`,
    });
  },
);

export default router;
