import { Router } from "express";
import { deleteOption, updateOption } from "../controllers/options.controller.js";

const router = Router();

router.patch("/:optionId", updateOption);
router.delete("/:optionId", deleteOption);

export default router;
