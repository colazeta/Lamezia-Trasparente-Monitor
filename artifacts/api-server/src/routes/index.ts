import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import themesRouter from "./themes";
import contractsRouter from "./contracts";
import publicationsRouter from "./publications";
import officialsRouter from "./officials";
import organiRouter from "./organi";
import reportsRouter from "./reports";
import statsRouter from "./stats";
import storageRouter from "./storage";
import questionsRouter from "./questions";
import oversightRouter from "./oversight";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(themesRouter);
router.use(contractsRouter);
router.use(publicationsRouter);
router.use(officialsRouter);
router.use(organiRouter);
router.use(reportsRouter);
router.use(statsRouter);
router.use(storageRouter);
router.use(questionsRouter);
router.use(oversightRouter);

export default router;
