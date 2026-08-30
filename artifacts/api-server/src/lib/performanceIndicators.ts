import { logger } from "./logger";
import { syncPopulationPerformanceProjection } from "./demographics";

// Prefisso comune delle sorgenti automatiche della sezione Performance. La
// popolazione mantiene l'identificativo storico `performance:istat-popolazione`
// nello stato fonti per compatibilità, ma la sua acquisizione canonica avviene
// ora nell'archivio demografico versionato.
export const PERFORMANCE_FEED_PREFIX = "performance:";

// La sezione Performance non interroga più direttamente ISTAT per la
// popolazione. Aggiorna soltanto la propria proiezione corrente a partire dalle
// osservazioni demografiche canoniche, così una revisione della stessa annualità
// non distrugge la release precedente.
export async function runPerformanceIngestion(): Promise<void> {
  const projectionChanges = await syncPopulationPerformanceProjection();
  logger.info(
    { projectionChanges },
    "Performance projection refreshed from demographic archive",
  );
}
