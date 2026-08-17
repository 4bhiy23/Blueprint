import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  createForm,
  deleteForm,
  duplicateForm,
  exportResponsesCsv,
  getBuilder,
  getFormAnalytics,
  getForm,
  getResponse,
  listForms,
  listResponses,
  saveBuilder,
  updateForm,
} from "./forms.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createForm);
router.get("/", listForms);
router.get("/:id/analytics", getFormAnalytics);
router.get("/:id/responses/export", exportResponsesCsv);
router.get("/:id/responses", listResponses);
router.get("/:id/responses/:responseId", getResponse);
router.get("/:id", getForm);
router.patch("/:id", updateForm);
router.delete("/:id", deleteForm);
router.post("/:id/duplicate", duplicateForm);
router.get("/:id/builder", getBuilder);
router.put("/:id/builder", saveBuilder);

export default router;
