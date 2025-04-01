// import express, { Application, Request, Response } from "express";
// import {
//   makeCall,
//   handleCallResponse,
//   handleMissedCall
// } from "./services/callHandler";
// import { logger } from "./config/logger";
// import { config } from "./config/env";
// const VoiceResponse = require("twilio").twiml.VoiceResponse;

// const app: Application = express();
// app.use(express.json());

// interface CallRequest {
//   phone: string;
// }

// // API to trigger a call
// // TODO: Change Response Type
// app.post("/call", async (req: Request<{}, {}, CallRequest>, res: any) => {
//   const { phone } = req.body;
//   if (!phone) {
//     logger.warn("❌ Call API: Missing phone number");
//     return res.status(400).json({ error: "Phone number required" });
//   }

//   logger.info(`📲 Call API Triggered - Phone: ${phone}`);
//   const callStatus = await makeCall(phone);
//   console.log("POST /call", callStatus);
//   res.status(200).send(callStatus);
// });

// // Twilio webhook for handling call events
// app.post("/twilio-webhook", async (req: Request, res: Response) => {
//   console.log(req.body);

//   // const twiml = new VoiceResponse();
//   // twiml.say(config.twilio.reminderMessage);

//   const { CallSid, CallStatus, RecordingUrl, To } = req.body;

//   logger.info(`📡 Twilio Webhook - SID: ${CallSid} | Status: ${CallStatus}`);

//   if (CallStatus === "completed" && RecordingUrl) {
//     await handleCallResponse(CallSid, RecordingUrl);
//   } else if (CallStatus === "no-answer") {
//     await handleMissedCall(To);
//   }

//   res.status(200).send("Webhook Received");
// });

// // Start the server
// app.listen(config.port, () =>
//   logger.info(`🚀 Server running on port ${config.port}`)
// );

import app from "./app";
import logger from "./config/logger";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (reason: Error) => {
  logger.error(`Unhandled Rejection: ${reason.message}`);
});
