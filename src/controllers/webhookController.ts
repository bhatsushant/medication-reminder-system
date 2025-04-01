import { Request, Response } from "express";
import logger from "../config/logger";
import { transcribeAudio } from "../services/stt";
import { sendSMS } from "../services/twilioService";

export const handleCallStatus = async (req: Request, res: Response) => {
  console.log("REQUEST BODY", req.body);
  const { CallSid, CallStatus, RecordingUrl, To } = req.body;

  logger.info(
    `Twilio Call Update - CallSid: ${CallSid}, Status: ${CallStatus}`
  );

  if (CallStatus === "no-answer" || CallStatus === "busy") {
    const message = `We called to check on your medication but couldn't reach you. Please call us back or take your medications if you haven't done so.`;
    await sendSMS(To, message);
    logger.info(`Sent SMS to ${To} due to missed call.`);
  }

  if (CallStatus === "completed" && RecordingUrl) {
    const transcription = await transcribeAudio(RecordingUrl);
    logger.info(`Patient Response Transcribed: "${transcription}"`);
  }

  res.status(200).send("Webhook received");
};

export const handleIncomingCall = async (req: Request, res: Response) => {
  console.log("REQUEST BODY", req.body);
  const { CallSid, CallStatus, RecordingUrl, To } = req.body;

  logger.info(
    `Twilio Call Update - CallSid: ${CallSid}, Status: ${CallStatus}`
  );
  const response = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="alice">Hello, this is a reminder from your healthcare provider. Have you taken your Aspirin, Cardivol, and Metformin today?</Say>
    </Response>`;

  res.set("Content-Type", "text/xml");
  res.send(response);
};
