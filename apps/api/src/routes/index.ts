import { Router } from "express";
import healthRouter from './health.router.js'
import formsRouter from './forms.router.js'
import questionsRouter from "./questions.router.js";
import optionsRouter from "./options.router.js";

const router = Router()

router.use("/health", healthRouter)
router.use("/forms", formsRouter)
router.use("/questions", questionsRouter)
router.use("/options", optionsRouter)

export default router
