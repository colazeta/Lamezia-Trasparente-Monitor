import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

// Riallinea i contatori denormalizzati dei temi alle tabelle sorgente. I
// contatori vengono aggiornati in modo atomico nelle stesse transazioni delle
// inserzioni (share/follow), ma un ricalcolo periodico li mantiene coerenti
// anche in presenza di dati storici incoerenti o interventi manuali sul DB.
//
// `relevanceCount` non ha una tabella sorgente (è un contatore puro) e quindi
// non viene ricalcolato.
export async function reconcileThemeCounters(): Promise<void> {
  try {
    await db.execute(sql`
      UPDATE themes AS t SET
        share_count = (
          SELECT count(*)::int FROM shares s WHERE s.theme_id = t.id
        ),
        follower_count = (
          SELECT count(*)::int FROM theme_followers f WHERE f.theme_id = t.id
        )
      WHERE
        t.share_count <> (
          SELECT count(*)::int FROM shares s WHERE s.theme_id = t.id
        )
        OR t.follower_count <> (
          SELECT count(*)::int FROM theme_followers f WHERE f.theme_id = t.id
        )
    `);
  } catch (err) {
    logger.error({ err }, "Theme counters reconciliation failed");
  }
}
