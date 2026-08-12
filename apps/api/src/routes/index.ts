import { Router } from "express";
import healthRouter from "./health.router.js";
import formsRouter from "./forms.router.js";
import publicFormsRouter from "./public-forms.router.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/forms", formsRouter);
router.use("/public", publicFormsRouter);

export default router;
