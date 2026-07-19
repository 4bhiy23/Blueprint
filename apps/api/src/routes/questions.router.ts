import { Router } from "express";
import { addOption } from "../controllers/questions.controller.js";

const router = Router();

router.post("/:questionId/options", addOption);

export default router;
