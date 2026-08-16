import { Router } from "express";
import healthRouter from "./health/health.router.js";
import formsRouter from "./forms/forms.router.js";
import publicFormsRouter from "./public-forms/public-forms.router.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/forms", formsRouter);
router.use("/public", publicFormsRouter);

export default router;
