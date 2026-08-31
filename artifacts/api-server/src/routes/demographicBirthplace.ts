import { Router, type IRouter } from "express";
import { LAMEZIA_ISTAT_CODE } from "../lib/demographics";
import { getPopulationBirthCountrySnapshot } from "../lib/populationBirthCountry";

const router: IRouter = Router();

router.get("/demographics/birthplace", async (req, res) => {
  const rawPeriod = Array.isArray(req.query.period)
    ? req.query.period[0]
    : req.query.period;
  const period = typeof rawPeriod === "string" ? rawPeriod : null;
  const snapshot = await getPopulationBirthCountrySnapshot(period);
  if (!snapshot) {
    res.status(404).json({
      error: "Dati sul paese di nascita non ancora disponibili",
    });
    return;
  }

  res.json({
    geography: {
      code: LAMEZIA_ISTAT_CODE,
      name: "Lamezia Terme",
      level: "municipality",
    },
    ...snapshot,
    methodology: {
      birthplace:
        "Il paese di nascita identifica lo Stato in cui il residente è nato. È distinto da cittadinanza, etnia, identità e provenienza migratoria recente e non viene usato come loro proxy.",
      referencePeriod:
        "Le consistenze si riferiscono alla popolazione residente al 1° gennaio dell'anno indicato.",
      temporalBreak:
        "Per gli anni 2002–2018 la tavola RCS deriva dalla ricostruzione intercensuaria ISTAT ed è marcata reconstructed; dal 2019 la fonte è censuaria. La cesura resta esplicita nella serie.",
      countryDetail:
        "Il dettaglio usa i singoli paesi dichiarati dal form RCS. Le aggregazioni continentali e sub-continentali non entrano nella graduatoria; la categoria residuale 'Altri Paesi' resta invece nel totale dei nati all'estero.",
      coverage:
        "La somma delle categorie per paese di nascita viene confrontata con la popolazione residente indipendente dello stesso anno. L'eventuale differenza resta visibile e non viene redistribuita artificialmente.",
      citizenshipCross:
        "ISTAT non diffonde in questa tavola l'incrocio cittadinanza × paese di nascita. LameziaTrasparente mantiene quindi i due assi separati e non ricostruisce celle mancanti o categorie ibride.",
    },
  });
});

export default router;
