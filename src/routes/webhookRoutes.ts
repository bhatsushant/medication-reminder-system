import { Router } from "express";
import {
  handleCallStatus,
  handleIncomingCall
} from "../controllers/webhookController";

const router = Router();

router.post("/twilio/call-status", handleCallStatus);
router.post("/twilio/voice", handleIncomingCall);

export default router;
