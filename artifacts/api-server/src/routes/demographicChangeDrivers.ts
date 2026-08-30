import { Router, type IRouter } from "express";
import { LAMEZIA_ISTAT_CODE } from "../lib/demographics";
import { type BalanceGranularity } from "../lib/demographicBalance";
import {
  getReconciledChangeDrivers,
  summarizeReconciledChangeDrivers,
} from "../lib/demographicChangeDrivers";

const router: IRouter = Router();

router.get("/demographics/change-drivers", async (req, res) => {
  const raw = Array.isArray(req.query.granularity)
    ? req.query.granularity[0]
    : req.query.granularity;
  const granularity: BalanceGranularity = raw === "monthly" ? "monthly" : "annual";
  const points = await getReconciledChangeDrivers(granularity);

  res.json({
    geography: {
      code: LAMEZIA_ISTAT_CODE,
      name: "Lamezia Terme",
      level: "municipality",
    },
    granularity,
    source: {
      name: "ISTAT",
      dataset: granularity === "annual" ? "P02" : "D7B",
      url:
        granularity === "annual"
          ? "https://demo.istat.it/app/?i=P02&l=it"
          : "https://demo.istat.it/app/?i=D7B&l=it",
    },
    current: points,
    summaries: {
      last5: summarizeReconciledChangeDrivers(points, 5),
      last10: summarizeReconciledChangeDrivers(points, 10),
      full: summarizeReconciledChangeDrivers(points, points.length),
    },
    methodology: {
      identities: {
        naturalBalance: "nati vivi − morti",
        internalBalance:
          "iscritti da altri comuni − cancellati verso altri comuni",
        foreignBalance: "iscritti dall'estero − cancellati per l'estero",
        otherBalance:
          "iscritti per altri motivi − cancellati per altri motivi",
      },
      annualReconciliation:
        "Per una release annuale definitiva la variazione è riconciliata come saldo naturale + saldo migratorio interno + saldo migratorio estero + aggiustamento statistico. Per una release annuale ancora provvisoria entrano soltanto le tre poste reali; il saldo per altri motivi può essere diffuso ma non concorre ancora al calcolo della popolazione provvisoria.",
      monthlyReconciliation:
        "Nel bilancio mensile provvisorio la popolazione di fine periodo è costruita sui flussi naturale, migratorio interno e migratorio estero; le altre poste e la copertura censuaria entrano nel successivo consolidamento definitivo.",
      temporalBreak:
        "Dal 2019 ISTAT contabilizza i flussi per data dell'evento nell'ambito della nuova contabilità micro-demografica MIDEA/ANVIS. I confronti con periodi precedenti richiedono una serie ricostruita separata.",
      reconciliationStatus:
        "exact indica una quadratura entro ±0,5 persone; mismatch segnala che le poste disponibili non quadrano con la variazione osservata e richiede verifica; partial indica che manca almeno una posta necessaria.",
      narrative:
        "Le frasi descrittive identificano soltanto la componente cumulata di maggiore ampiezza assoluta e non esprimono giudizi, causalità o valutazioni di policy.",
    },
  });
});

export default router;
