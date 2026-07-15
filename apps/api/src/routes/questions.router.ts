import { Router } from "express";
import { addOption, deleteQuestion, updateQuestion } from "../controllers/questions.controller.js";

const router = Router();

router.patch("/:questionId", updateQuestion);
router.delete("/:questionId", deleteQuestion);
router.post("/:questionId/options", addOption);

export default router;
