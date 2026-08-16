import { Router } from "express";
import {
  getPublicForm,
  submitPublicResponse,
} from "./public-forms.controller.js";

const router = Router();

router.get("/forms/:publicId", getPublicForm);
router.post("/forms/:publicId/responses", submitPublicResponse);

export default router;
