import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createForm,
  deleteForm,
  duplicateForm,
  getForm,
  listForms,
  updateForm,
} from "../controllers/forms.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createForm);
router.get("/", listForms);
router.get("/:id", getForm);
router.patch("/:id", updateForm);
router.delete("/:id", deleteForm);
router.post("/:id/duplicate", duplicateForm);

export default router;
