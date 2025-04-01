import { Request, Response } from "express";
import logger from "../config/logger";
import { transcribeAudio } from "../services/stt";
import { sendSMS } from "../services/twilioService";
import { config } from "../config/env";

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
  const { CallSid, CallStatus } = req.body;

  logger.info(
    `Twilio Call Update - CallSid: ${CallSid}, Status: ${CallStatus}`
  );
  const response = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="alice">${config.twilio.reminderMessage}</Say>
    </Response>`;

  res.set("Content-Type", "text/xml");
  res.send(response);
};

export const handleRecordingStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { RecordingUrl, CallSid } = req.body;

    if (!RecordingUrl) {
      logger.warn(`No RecordingUrl received for CallSid: ${CallSid}`);
      res.status(400).json({ error: "No Recording URL provided." });
    }

    logger.info(
      `Recording received for CallSid: ${CallSid} - URL: ${RecordingUrl}`
    );

    // Append .mp3 if required by Deepgram
    const formattedRecordingUrl = RecordingUrl.endsWith(".mp3")
      ? RecordingUrl
      : `${RecordingUrl}.mp3`;

    const transcription = await transcribeAudio(formattedRecordingUrl);
    logger.info(`Transcription: "${transcription}"`);

    res
      .status(200)
      .json({ message: "Recording processed successfully", transcription });
  } catch (error) {
    logger.error("Error processing recording:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
