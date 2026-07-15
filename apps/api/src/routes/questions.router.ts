import { Router } from "express";
import { addOption, deleteQuestion, updateQuestion } from "../controllers/questions.controller";

const router = Router()
// route = /questions
router.patch("/:questionId", updateQuestion);
router.delete("/:questionId", deleteQuestion);
router.post("/:questionId/option", addOption)

export default router