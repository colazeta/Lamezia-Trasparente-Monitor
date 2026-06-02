import {
  db,
  bandiTable,
  bandoMatchesTable,
  publicationsTable,
  contractsTable,
  attuazionePnrrProjectsTable,
  classifyMacrotema,
  type Bando,
  type BandoMatch,
} from "@workspace/db";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { logger } from "./logger";

// --- Estrazione di CUP/CIG dal testo libero del bando -----------------------
// I bandi non hanno un CIG/CUP strutturato, ma la redazione può citarli nelle
// keyword o nella descrizione: in tal caso diventano la chiave più affidabile
// per incrociare contratti ANAC e progetti PNRR.
const CIG_RE = /\b([0-9A-Z]{10})\b/g;
const CUP_RE = /\b([A-Z]\d{2}[A-Z][0-9A-Z]{11})\b/g;

function extractCodes(text: string): { cigs: string[]; cups: string[] } {
  const upper = (text ?? "").toUpperCase();
  const cups = [...upper.matchAll(CUP_RE)].map((m) => m[1]);
  const cupSet = new Set(cups);
  // I CIG sono 10 caratteri: escludiamo i frammenti già catturati come CUP.
  const cigs = [...upper.matchAll(CIG_RE)]
    .map((m) => m[1])
    .filter((c) => !cupSet.has(c) && /\d/.test(c));
  return { cigs: [...new Set(cigs)], cups: [...cupSet] };
}

function cleanKeywords(keywords: string[] | null | undefined): string[] {
  return (keywords ?? [])
    .map((k) => k.trim())
    .filter((k) => k.length >= 3);
}

// Numero massimo di riscontri suggeriti per bando e per tipo di sorgente, per
// non sommergere la redazione di proposte poco rilevanti.
const MAX_SUGGESTIONS_PER_SOURCE = 5;

type ExistingMatchSets = {
  publication: Set<number>;
  contract: Set<number>;
  pnrr: Set<number>;
};

async function loadExistingMatchSets(
  bandoId: number,
): Promise<ExistingMatchSets> {
  const rows = await db
    .select({
      targetType: bandoMatchesTable.targetType,
      publicationId: bandoMatchesTable.publicationId,
      contractId: bandoMatchesTable.contractId,
      pnrrProjectId: bandoMatchesTable.pnrrProjectId,
    })
    .from(bandoMatchesTable)
    .where(eq(bandoMatchesTable.bandoId, bandoId));
  const sets: ExistingMatchSets = {
    publication: new Set<number>(),
    contract: new Set<number>(),
    pnrr: new Set<number>(),
  };
  for (const r of rows) {
    if (r.publicationId != null) sets.publication.add(r.publicationId);
    if (r.contractId != null) sets.contract.add(r.contractId);
    if (r.pnrrProjectId != null) sets.pnrr.add(r.pnrrProjectId);
  }
  return sets;
}

// Calcola e inserisce i riscontri di partecipazione *suggeriti* per un singolo
// bando. NON distruttivo: non tocca i riscontri già presenti (confermati,
// scartati o suggeriti in precedenza), aggiunge solo i nuovi non ancora visti.
export async function refreshBandoMatchesFor(bando: Bando): Promise<number> {
  const keywords = cleanKeywords(bando.keywords);
  const { cigs, cups } = extractCodes(
    `${bando.keywords?.join(" ") ?? ""} ${bando.description}`,
  );
  if (keywords.length === 0 && cigs.length === 0 && cups.length === 0) return 0;

  const existing = await loadExistingMatchSets(bando.id);
  const now = new Date();
  let added = 0;

  const inserts: (typeof bandoMatchesTable.$inferInsert)[] = [];

  // --- Pubblicazioni (Albo Pretorio) ---
  const pubKeywordConds = keywords.flatMap((k) => [
    ilike(publicationsTable.oggetto, `%${k}%`),
    ilike(publicationsTable.tipologia, `%${k}%`),
  ]);
  if (pubKeywordConds.length > 0) {
    const pubs = await db
      .select({
        id: publicationsTable.id,
        oggetto: publicationsTable.oggetto,
      })
      .from(publicationsTable)
      .where(or(...pubKeywordConds))
      .orderBy(
        desc(
          sql`coalesce(${publicationsTable.pubStart}, ${publicationsTable.dataAtto})`,
        ),
        desc(publicationsTable.id),
      )
      .limit(MAX_SUGGESTIONS_PER_SOURCE);
    for (const p of pubs) {
      if (existing.publication.has(p.id)) continue;
      existing.publication.add(p.id);
      inserts.push({
        bandoId: bando.id,
        targetType: "publication",
        publicationId: p.id,
        matchReason: "Parola chiave nell'oggetto della pubblicazione",
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // --- Contratti ANAC: per CIG/CUP (alta precisione) e per keyword ---
  const contractConds = [
    ...cigs.map((c) => eq(contractsTable.cig, c)),
    ...cups.map((c) => eq(contractsTable.cup, c)),
    ...keywords.flatMap((k) => [
      ilike(contractsTable.title, `%${k}%`),
      ilike(contractsTable.description, `%${k}%`),
    ]),
  ];
  if (contractConds.length > 0) {
    const rows = await db
      .select({
        id: contractsTable.id,
        cig: contractsTable.cig,
        cup: contractsTable.cup,
      })
      .from(contractsTable)
      .where(or(...contractConds))
      .orderBy(desc(contractsTable.awardDate), desc(contractsTable.id))
      .limit(MAX_SUGGESTIONS_PER_SOURCE);
    for (const r of rows) {
      if (existing.contract.has(r.id)) continue;
      existing.contract.add(r.id);
      const reason =
        r.cig && cigs.includes(r.cig)
          ? `CIG ${r.cig}`
          : r.cup && cups.includes(r.cup)
            ? `CUP ${r.cup}`
            : "Parola chiave nel contratto";
      inserts.push({
        bandoId: bando.id,
        targetType: "contract",
        contractId: r.id,
        matchReason: reason,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // --- Progetti PNRR: per CUP e per keyword ---
  const pnrrConds = [
    ...cups.map((c) => eq(attuazionePnrrProjectsTable.cup, c)),
    ...keywords.flatMap((k) => [
      ilike(attuazionePnrrProjectsTable.title, `%${k}%`),
      ilike(attuazionePnrrProjectsTable.intervention, `%${k}%`),
    ]),
  ];
  if (pnrrConds.length > 0) {
    const rows = await db
      .select({
        id: attuazionePnrrProjectsTable.id,
        cup: attuazionePnrrProjectsTable.cup,
      })
      .from(attuazionePnrrProjectsTable)
      .where(or(...pnrrConds))
      .orderBy(desc(attuazionePnrrProjectsTable.id))
      .limit(MAX_SUGGESTIONS_PER_SOURCE);
    for (const r of rows) {
      if (existing.pnrr.has(r.id)) continue;
      existing.pnrr.add(r.id);
      const reason =
        r.cup && cups.includes(r.cup)
          ? `CUP ${r.cup}`
          : "Parola chiave nel progetto PNRR";
      inserts.push({
        bandoId: bando.id,
        targetType: "pnrr",
        pnrrProjectId: r.id,
        matchReason: reason,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  if (inserts.length > 0) {
    await db.insert(bandoMatchesTable).values(inserts).onConflictDoNothing();
    added = inserts.length;
  }
  return added;
}

// Parole che fanno pensare a un bando/finanziamento pubblico, usate per
// proporre candidati a partire dalle pubblicazioni dell'Albo.
const BANDO_CANDIDATE_RE =
  /\b(bando|avviso pubblico|finanziament|contribut|sovvenzion|fondo|fondi|pnrr|por\b|fesr|fse|call\b)\b/i;

function truncate(text: string, max = 140): string {
  const t = (text ?? "").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function makeSlug(parts: string): string {
  return parts
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Inserisce un candidato bando (source="suggested") ancorato alla sua sorgente.
// Idempotente e non distruttivo: `suggestedSourceRef` è univoco e in conflitto
// non viene mai sovrascritto (la redazione può averlo già modificato).
async function insertCandidate(values: {
  ref: string;
  slug: string;
  title: string;
  description: string;
  enteErogatore?: string;
  settore: string | null;
  keywords: string[];
}): Promise<boolean> {
  const res = await db
    .insert(bandiTable)
    .values({
      slug: values.slug,
      title: values.title,
      description: values.description,
      enteErogatore: values.enteErogatore ?? "",
      source: "suggested",
      settore: values.settore,
      keywords: values.keywords,
      suggestedSourceRef: values.ref,
    })
    .onConflictDoNothing({ target: bandiTable.suggestedSourceRef })
    .returning({ id: bandiTable.id });
  return res.length > 0;
}

// Propone candidati bando a partire dai dati già ingeriti che fanno pensare a
// un bando/finanziamento pubblico: pubblicazioni dell'Albo (avvisi), contratti
// ANAC finanziati (con CUP, indice di un programma di finanziamento) e progetti
// PNRR (ogni progetto deriva da una misura/bando nazionale). Idempotente e non
// distruttivo: ogni candidato è ancorato alla sorgente via `suggestedSourceRef`.
async function refreshBandoCandidates(): Promise<number> {
  let created = 0;

  // --- 1) Albo Pretorio: avvisi/bandi pubblicati ---
  const pubs = await db
    .select({
      id: publicationsTable.id,
      progressivo: publicationsTable.progressivo,
      oggetto: publicationsTable.oggetto,
      tipologia: publicationsTable.tipologia,
    })
    .from(publicationsTable)
    .where(
      or(
        ilike(publicationsTable.oggetto, "%bando%"),
        ilike(publicationsTable.oggetto, "%avviso pubblico%"),
        ilike(publicationsTable.oggetto, "%finanziament%"),
        ilike(publicationsTable.oggetto, "%contribut%"),
        ilike(publicationsTable.oggetto, "%pnrr%"),
      ),
    )
    .orderBy(desc(publicationsTable.id))
    .limit(200);

  for (const p of pubs) {
    if (!BANDO_CANDIDATE_RE.test(`${p.oggetto} ${p.tipologia}`)) continue;
    const ok = await insertCandidate({
      ref: `pub-${p.progressivo}`,
      slug: makeSlug(`suggerito-pub-${p.progressivo}`),
      title: truncate(p.oggetto),
      description: p.oggetto,
      settore: classifyMacrotema(`${p.oggetto} ${p.tipologia ?? ""}`),
      keywords: [],
    });
    if (ok) created += 1;
  }

  // --- 2) Contratti ANAC con CUP: indizio di un'opera/servizio finanziato da
  //        un programma (il CUP è assegnato ai progetti d'investimento pubblico) ---
  const contracts = await db
    .select({
      id: contractsTable.id,
      sourceId: contractsTable.sourceId,
      title: contractsTable.title,
      description: contractsTable.description,
      stazioneAppaltante: contractsTable.stazioneAppaltante,
      cup: contractsTable.cup,
    })
    .from(contractsTable)
    .where(
      and(
        sql`${contractsTable.cup} is not null and ${contractsTable.cup} <> ''`,
        or(
          ilike(contractsTable.title, "%finanziament%"),
          ilike(contractsTable.title, "%pnrr%"),
          ilike(contractsTable.title, "%por%"),
          ilike(contractsTable.title, "%fesr%"),
          ilike(contractsTable.description, "%finanziament%"),
          ilike(contractsTable.description, "%pnrr%"),
        ),
      ),
    )
    .orderBy(desc(contractsTable.awardDate), desc(contractsTable.id))
    .limit(100);

  for (const c of contracts) {
    const ref = `contract-${c.sourceId ?? c.id}`;
    const ok = await insertCandidate({
      ref,
      slug: makeSlug(`suggerito-contratto-${c.sourceId ?? c.id}`),
      title: truncate(c.title),
      description: c.description,
      enteErogatore: c.stazioneAppaltante ?? "",
      settore: classifyMacrotema(`${c.title} ${c.description}`),
      keywords: c.cup ? [c.cup] : [],
    });
    if (ok) created += 1;
  }

  // --- 3) Progetti PNRR: ogni progetto attua una misura/bando nazionale ---
  const pnrr = await db
    .select({
      id: attuazionePnrrProjectsTable.id,
      sourceId: attuazionePnrrProjectsTable.sourceId,
      title: attuazionePnrrProjectsTable.title,
      intervention: attuazionePnrrProjectsTable.intervention,
      investment: attuazionePnrrProjectsTable.investment,
      holder: attuazionePnrrProjectsTable.holder,
      cup: attuazionePnrrProjectsTable.cup,
    })
    .from(attuazionePnrrProjectsTable)
    .orderBy(desc(attuazionePnrrProjectsTable.id))
    .limit(100);

  for (const r of pnrr) {
    const base = r.intervention?.trim() || r.investment?.trim() || r.title;
    const ok = await insertCandidate({
      ref: `pnrr-${r.sourceId}`,
      slug: makeSlug(`suggerito-pnrr-${r.sourceId}`),
      title: truncate(`PNRR – ${base}`),
      description: [r.title, r.intervention, r.investment]
        .filter((x) => x && x.trim())
        .join(" · "),
      enteErogatore: r.holder ?? "PNRR",
      settore: classifyMacrotema(`${base} ${r.title}`),
      keywords: r.cup ? [r.cup] : [],
    });
    if (ok) created += 1;
  }

  return created;
}

// Aggiorna scadenze/stati: i bandi aperti la cui scadenza è passata diventano
// "concluso"; quelli entro 30 giorni diventano "in-scadenza". Non tocca i
// bandi senza scadenza. Solo per i bandi manuali (curati).
async function refreshBandoStatuses(): Promise<void> {
  const now = Date.now();
  const soon = now + 30 * 24 * 60 * 60 * 1000;
  const rows = await db
    .select({
      id: bandiTable.id,
      status: bandiTable.status,
      scadenza: bandiTable.scadenza,
    })
    .from(bandiTable)
    .where(eq(bandiTable.source, "manual"));
  for (const r of rows) {
    if (!r.scadenza) continue;
    const t = r.scadenza.getTime();
    const next = t < now ? "concluso" : t <= soon ? "in-scadenza" : "aperto";
    if (next !== r.status) {
      await db
        .update(bandiTable)
        .set({ status: next, updatedAt: new Date() })
        .where(eq(bandiTable.id, r.id));
    }
  }
}

// Ciclo completo invocato dall'ingestione: aggiorna stati, propone candidati e
// ricalcola i riscontri di partecipazione per tutti i bandi.
export async function refreshBandiSuggestions(): Promise<{
  candidates: number;
  matched: number;
}> {
  await refreshBandoStatuses();
  const candidates = await refreshBandoCandidates();
  const bandi = await db.select().from(bandiTable);
  let matched = 0;
  for (const b of bandi) {
    matched += await refreshBandoMatchesFor(b);
  }
  logger.info(
    { source: "bandi", candidates, matched, processed: bandi.length },
    "Bandi suggestions refreshed",
  );
  return { candidates, matched };
}

// --- Esito di partecipazione (derivato) -------------------------------------
export const BANDO_ESITI = [
  "vinto",
  "partecipato",
  "non-partecipato",
  "da-verificare",
] as const;
export type BandoEsito = (typeof BANDO_ESITI)[number];

// Deriva l'esito di un bando dai suoi riscontri *confermati*:
// - "vinto": esiste un contratto o progetto PNRR confermato (il finanziamento
//   si è tradotto in un'opera/affidamento)
// - "partecipato": esiste solo un atto/pubblicazione confermato
// - "non-partecipato": bando concluso senza alcun riscontro confermato
// - "da-verificare": ci sono suggerimenti non confermati, oppure il bando è
//   ancora aperto e non si hanno riscontri
export function deriveEsito(
  status: string,
  matches: Pick<BandoMatch, "targetType" | "confirmed" | "dismissed">[],
): BandoEsito {
  const confirmed = matches.filter((m) => m.confirmed && !m.dismissed);
  const hasFunded = confirmed.some(
    (m) => m.targetType === "contract" || m.targetType === "pnrr",
  );
  if (hasFunded) return "vinto";
  if (confirmed.length > 0) return "partecipato";
  const pending = matches.some((m) => !m.confirmed && !m.dismissed);
  if (pending) return "da-verificare";
  if (status === "concluso") return "non-partecipato";
  return "da-verificare";
}

// Stima delle risorse perse per un bando: vale solo per i bandi conclusi senza
// partecipazione confermata. Si basa esclusivamente sull'importo medio
// aggiudicato (la cifra tipicamente ottenibile da chi vince il bando). Se non
// è disponibile, la stima non è calcolabile e vale 0.
export function lostAmountFor(bando: Bando, esito: BandoEsito): number {
  if (bando.status !== "concluso" || esito !== "non-partecipato") return 0;
  return bando.importoMedioAggiudicato
    ? Number(bando.importoMedioAggiudicato)
    : 0;
}
