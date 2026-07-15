import { Router } from "express";

const router = Router();
// route = /options
router.patch("/:optionId")
router.delete("/:optionId")

export default router;