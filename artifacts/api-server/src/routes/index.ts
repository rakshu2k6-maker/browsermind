import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tasksRouter from "./tasks";
import templatesRouter from "./templates";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tasksRouter);
router.use(templatesRouter);
router.use(statsRouter);

export default router;
