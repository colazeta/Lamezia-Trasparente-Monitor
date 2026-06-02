import {
  db,
  fundamentalActsTable,
  publicationsTable,
  type FundamentalAct,
} from "@workspace/db";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { logger } from "./logger";

// Per ogni tipo di atto fondamentale cerca, tra le pubblicazioni già ingerite
// (Albo/publications), la più recente che combacia con le parole chiave del
// tipo e la propone come suggerimento (`suggestedPublicationId`). È una
// operazione NON distruttiva: non tocca la voce corrente confermata dalla
// redazione (title/description/source/file/link), aggiorna solo il campo
// suggerimento, così la redazione può confermarlo o ignorarlo.
export async function refreshFundamentalActSuggestions(): Promise<{
  processed: number;
  matched: number;
}> {
  const acts: FundamentalAct[] = await db.select().from(fundamentalActsTable);

  let matched = 0;
  for (const act of acts) {
    const keywords = (act.keywords ?? [])
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    if (keywords.length === 0) continue;

    const keywordConds = keywords.flatMap((k) => [
      ilike(publicationsTable.oggetto, `%${k}%`),
      ilike(publicationsTable.tipologia, `%${k}%`),
    ]);

    const [best] = await db
      .select({ id: publicationsTable.id })
      .from(publicationsTable)
      .where(or(...keywordConds))
      .orderBy(
        desc(
          sql`coalesce(${publicationsTable.pubStart}, ${publicationsTable.dataAtto})`,
        ),
        desc(publicationsTable.id),
      )
      .limit(1);

    const suggestedId = best?.id ?? null;
    if (suggestedId) matched += 1;

    if (suggestedId !== act.suggestedPublicationId) {
      await db
        .update(fundamentalActsTable)
        .set({ suggestedPublicationId: suggestedId })
        .where(eq(fundamentalActsTable.id, act.id));
    }
  }

  logger.info(
    { processed: acts.length, matched, source: "fundamental-acts" },
    "Fundamental act suggestions refreshed",
  );
  return { processed: acts.length, matched };
}

// Variante usata dopo la creazione/modifica di una singola voce, così il
// suggerimento è disponibile subito senza attendere il ciclo di ingestione.
export async function refreshFundamentalActSuggestion(
  actId: number,
): Promise<void> {
  const [act] = await db
    .select()
    .from(fundamentalActsTable)
    .where(eq(fundamentalActsTable.id, actId));
  if (!act) return;

  const keywords = (act.keywords ?? [])
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
  if (keywords.length === 0) {
    if (act.suggestedPublicationId !== null) {
      await db
        .update(fundamentalActsTable)
        .set({ suggestedPublicationId: null })
        .where(eq(fundamentalActsTable.id, actId));
    }
    return;
  }

  const keywordConds = keywords.flatMap((k) => [
    ilike(publicationsTable.oggetto, `%${k}%`),
    ilike(publicationsTable.tipologia, `%${k}%`),
  ]);

  const [best] = await db
    .select({ id: publicationsTable.id })
    .from(publicationsTable)
    .where(and(or(...keywordConds)))
    .orderBy(
      desc(
        sql`coalesce(${publicationsTable.pubStart}, ${publicationsTable.dataAtto})`,
      ),
      desc(publicationsTable.id),
    )
    .limit(1);

  const suggestedId = best?.id ?? null;
  if (suggestedId !== act.suggestedPublicationId) {
    await db
      .update(fundamentalActsTable)
      .set({ suggestedPublicationId: suggestedId })
      .where(eq(fundamentalActsTable.id, actId));
  }
}
