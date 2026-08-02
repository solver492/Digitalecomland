import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import ordersRouter from "./orders";
import walletRouter from "./wallet";
import analyticsRouter from "./analytics";
import dashboardRouter from "./dashboard";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(walletRouter);
router.use(analyticsRouter);
router.use(dashboardRouter);
router.use(profileRouter);

export default router;
