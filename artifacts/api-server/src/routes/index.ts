import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import themesRouter from "./themes";
import contractsRouter from "./contracts";
import gisRouter from "./gis";
import opendataRouter from "./opendata";
import publicationsRouter from "./publications";
import officialsRouter from "./officials";
import organiRouter from "./organi";
import reportsRouter from "./reports";
import statsRouter from "./stats";
import storageRouter from "./storage";
import questionsRouter from "./questions";
import oversightRouter from "./oversight";
import performanceRouter from "./performance";
import fundamentalActsRouter from "./fundamentalActs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(themesRouter);
router.use(contractsRouter);
router.use(gisRouter);
router.use(opendataRouter);
router.use(publicationsRouter);
router.use(officialsRouter);
router.use(organiRouter);
router.use(reportsRouter);
router.use(statsRouter);
router.use(storageRouter);
router.use(questionsRouter);
router.use(oversightRouter);
router.use(performanceRouter);
router.use(fundamentalActsRouter);

export default router;
