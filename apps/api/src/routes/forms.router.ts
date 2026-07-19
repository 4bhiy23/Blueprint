import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createForm,
  deleteForm,
  duplicateForm,
  getBuilder,
  getForm,
  listForms,
  saveBuilder,
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
router.get("/:id/builder", getBuilder);
router.put("/:id/builder", saveBuilder);

export default router;
