import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import commandsRouter from "./commands";
import historyRouter from "./history";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/dashboard", dashboardRouter);
router.use("/commands", commandsRouter);
router.use("/history", historyRouter);
router.use("/settings", settingsRouter);

export default router;
