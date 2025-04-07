import express, { Router } from "express";
import { initiateCall, getCallLogs } from "../controllers/callController";
import { initiateReminderCall } from "../controllers/callController";

const router: Router = express.Router();

router.post("/calls", initiateCall);

router.post("/initiate-reminder", initiateReminderCall);

router.get("/calls", getCallLogs);

export default router;
