import { Router } from "express";
import { triggerCall } from "../controllers/callController";

const router = Router();
router.post("/call", triggerCall);

export default router;
