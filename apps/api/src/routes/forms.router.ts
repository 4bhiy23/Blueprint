import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  addQuestionToForm,
  createForm,
  deleteForm,
  duplicateForm,
  getForm,
  listForms,
  updateForm,
} from "../controllers/forms.controller.js";
import { reorderQuestions } from "../controllers/questions.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createForm);
router.get("/", listForms);
router.get("/:id", getForm);
router.patch("/:id", updateForm);
router.delete("/:id", deleteForm);
router.post("/:id/duplicate", duplicateForm);

// Questions
router.post("/:id/questions", addQuestionToForm);
router.patch("/:id/questions/reorder", reorderQuestions);


export default router;
