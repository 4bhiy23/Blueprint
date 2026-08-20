import { Router } from "express";
import {
  getPublicForm,
  submitPublicResponse,
} from "./public-forms.controller.js";
import {
  rateLimitPublicFormRead,
  rateLimitPublicFormSubmission,
} from "../../middleware/public-rate-limit.js";

const router = Router();

router.get("/forms/:publicId", rateLimitPublicFormRead, getPublicForm);
router.post(
  "/forms/:publicId/responses",
  rateLimitPublicFormSubmission,
  submitPublicResponse,
);

export default router;
