import express, { Router } from "express";
import {
  handleOutgoingCall,
  processWebhookResponse as webhookProcessResponse,
  handleNoResponse as webhookHandleNoResponse
} from "../controllers/webhookController";
import {
  handleIncomingCall,
  processCallResponse as callProcessResponse,
  handleAmdStatus,
  handleNoResponse as callHandleNoResponse
} from "../controllers/callController";
import { handleCallStatus } from "../controllers/callStatusHandler";
import { initiateReminderCall } from "../controllers/callController";

const router: Router = express.Router();

router.post("/twilio/incoming-call", handleIncomingCall);
router.post("/twilio/outgoing-call", handleOutgoingCall);
router.post("/twilio/process-response", callProcessResponse);
router.post("/twilio/no-response", webhookHandleNoResponse);

router.post("/twilio/amd-status", handleAmdStatus);

router.post("/call-status", handleCallStatus);

router.post("/initiate-reminder", initiateReminderCall);

export default router;
