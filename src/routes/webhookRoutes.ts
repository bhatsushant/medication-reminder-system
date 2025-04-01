import express, { Router } from "express";
import {
  handleCallStatus,
  handleIncomingCall,
  handleRecordingStatus
} from "../controllers/webhookController";

const router: Router = express.Router();

router.post("/twilio/call-status", handleCallStatus);
router.post("/twilio/recording-status", handleRecordingStatus);
router.post("/twilio/incoming-call", handleIncomingCall);

export default router;
