import { logger } from "./logger";
import { runDemographicIngestion } from "./demographics";
import { runSelfDescribingDemographicBalanceIngestion } from "./demographicBalanceIngestion";
import { runRbdBackfill } from "./demographicRbd";
import { runPopulationStructureIngestion } from "./populationStructure";
import { runPopulationCitizenshipIngestion } from "./populationCitizenship";
import { runPopulationBirthCountryIngestion } from "./populationBirthCountry";

// Prefisso comune delle sorgenti automatiche della sezione Performance. La
// popolazione mantiene l'identificativo storico `performance:istat-popolazione`
// nello stato fonti per compatibilità, ma la sua acquisizione canonica avviene
// ora nell'archivio demografico versionato.
export const PERFORMANCE_FEED_PREFIX = "performance:";

const ISTAT_SDMX_REQUESTS_PER_MINUTE = 5;

// Il ciclo schedulato continua a passare da questo entrypoint per compatibilità
// con l'orchestratore esistente. La popolazione aggiorna anche la proiezione
// legacy Performance; le altre serie restano invece canoniche demografiche.
export async function runPerformanceIngestion(): Promise<void> {
  const population = await runDemographicIngestion();
  // La popolazione residente usa sempre una singola richiesta SDMX, compreso
  // il caso 304. Le query Demo P02/D7B usate dal bilancio non entrano in questo
  // budget perché non passano dal servizio SDMX.
  let sdmxRequests = 1;
  let sdmxBudgetReliable = true;

  logger.info(
    {
      inserted: population.inserted,
      projectionChanges: population.projectionChanges,
    },
    "Performance population refreshed through demographic archive",
  );

  // Età e sesso vivono nella stessa architettura versionata ma non sono una
  // dipendenza del vecchio indicatore Performance. Un problema della fonte
  // strutturale viene quindi registrato senza impedire gli altri refresh.
  try {
    const structure = await runPopulationStructureIngestion();
    sdmxRequests += structure.requests;
  } catch (err) {
    // Se un modulo fallisce non sappiamo con certezza quante richieste abbia
    // già consumato prima dell'errore: fail-safe, il backfill RBD viene rinviato.
    sdmxBudgetReliable = false;
    logger.error({ err }, "Population structure refresh failed");
  }

  // Cittadinanza e popolazione straniera hanno feed indipendenti. Il modulo
  // restituisce il numero effettivo di richieste così l'orchestratore può
  // rispettare il tetto SDMX anche durante un cold start completo.
  try {
    const citizenship = await runPopulationCitizenshipIngestion();
    sdmxRequests += citizenship.requests;
  } catch (err) {
    sdmxBudgetReliable = false;
    logger.error({ err }, "Population citizenship refresh failed");
  }

  // Il paese di nascita è acquisito dalla tavola Demo RCS tramite il contratto
  // auto-descrittivo form-1/RPCCerca.php. Non usa il servizio SDMX-RI e quindi
  // non entra nel budget delle cinque query SDMX/minuto; resta però isolato in
  // modo che un problema RCS non blocchi gli altri feed demografici.
  try {
    await runPopulationBirthCountryIngestion();
  } catch (err) {
    logger.error({ err }, "Population country-of-birth refresh failed");
  }

  // Il bilancio corrente inizializza le serie annuali canoniche. Solo dopo
  // questa fase innestiamo il backfill RBD 2002–2018 sulle stesse serie: in
  // questo modo la semantica resta unica mentre release e sourceStatus
  // distinguono chiaramente ricostruzione storica e dato post-2019.
  let currentBalanceReady = true;
  await runSelfDescribingDemographicBalanceIngestion().catch((err) => {
    currentBalanceReady = false;
    logger.error({ err }, "Demographic balance refresh failed");
  });

  const rbdFitsBudget =
    sdmxBudgetReliable &&
    sdmxRequests + 1 <= ISTAT_SDMX_REQUESTS_PER_MINUTE;

  if (currentBalanceReady && rbdFitsBudget) {
    await runRbdBackfill().catch((err) => {
      logger.error({ err }, "Reconstructed demographic backfill failed");
    });
  } else if (currentBalanceReady) {
    logger.info(
      {
        sdmxRequests,
        budgetReliable: sdmxBudgetReliable,
        limit: ISTAT_SDMX_REQUESTS_PER_MINUTE,
      },
      "RBD backfill deferred to preserve ISTAT SDMX request budget",
    );
  }
}