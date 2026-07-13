import { Router } from "express";
import healthRouter from './health.router.js'
import formsRouter from './forms.router.js'

const router = Router()

router.use("/health", healthRouter)
router.use("/forms", formsRouter)

export default router
