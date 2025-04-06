import { Request, Response } from "express";
import twilio from "twilio";
import WebSocket from "ws";
import logger from "../config/logger";
import { config } from "../config/env";

/**
 * Handles TwiML generation for outgoing medication reminder calls
 */
export const handleOutgoingCall = (req: Request, res: Response): void => {
  const { AnsweredBy } = req.body;

  console.log("AnsweredBy", AnsweredBy);
  const twiml = new twilio.twiml.VoiceResponse();

  // Add Gather for speech recognition
  const gather = twiml.gather({
    input: ["speech"],
    timeout: 5,
    speechTimeout: "auto",
    language: "en-US",
    action: `${config.ngrokUrl}/twilio/process-response`,
    method: "POST",
  });

  // TTS message to patient
  gather.say(
    {
      voice: "Polly.Joanna", // or another voice
    },
    "Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.",
  );

  // If patient doesn't respond, handle fallback
  twiml.redirect(`${config.ngrokUrl}/twilio/no-response`);

  res.type("text/xml");
  res.send(twiml.toString());
};

/**
 * Processes patient's speech response
 */
export const processWebhookResponse = (req: Request, res: Response): void => {
  const { SpeechResult, CallSid } = req.body;

  // Log patient's response
  logger.info(`Call ${CallSid} - Patient response: "${SpeechResult}"`);

  // Generate TwiML for thank you message
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say("Thank you for confirming. Have a great day!");
  twiml.hangup();

  res.type("text/xml");
  res.send(twiml.toString());
};

/**
 * Handles scenario when patient doesn't respond to the prompt
 */
export const handleNoResponse = (req: Request, res: Response): void => {
  const { CallSid, To, CallStatus, AnsweredBy } = req.body;

  // Log if the call reached voicemail
  if (AnsweredBy && AnsweredBy.includes("machine")) {
    logger.info(`No response from ${To} (voicemail detected)`, {
      callSid: CallSid,
      answeredBy: AnsweredBy,
    });
  } else {
    // Log if the user didn't respond (but didn't send to voicemail)
    logger.info(`No response from ${To}`, {
      callSid: CallSid,
      status: CallStatus,
    });
  }

  const twiml = new twilio.twiml.VoiceResponse();

  // Leave a voicemail message
  twiml.say(
    "We called to check on your medication but couldn't reach you. Please call us back or take your medications if you haven't done so.",
  );
  twiml.hangup();

  res.type("text/xml");
  res.send(twiml.toString());
};

/**
 * Handles audio stream from Twilio for real-time transcription
 * This can be used for advanced transcription requirements
 */
export const handleAudioStream = (req: Request, res: Response): void => {
  const streamSid = req.body.StreamSid || req.query.StreamSid;

  if (!streamSid) {
    logger.warn("Missing StreamSid in Twilio stream request");
    res.status(400).json({ error: "Missing StreamSid" });
    return;
  }

  logger.info(`Audio stream started for StreamSid: ${streamSid}`);

  // Create WebSocket connection to Deepgram
  const socket = new WebSocket("wss://api.deepgram.com/v1/listen", {
    headers: {
      Authorization: `Token ${config.deepgramApiKey}`,
    },
  });

  // Configure Deepgram WebSocket
  socket.on("open", () => {
    logger.info(`Connected to Deepgram for StreamSid: ${streamSid}`);
    socket.send(
      JSON.stringify({
        punctuate: true,
        interim_results: false,
        encoding: "mulaw",
        sample_rate: 8000,
        channels: 1,
      }),
    );
  });

  // Process transcription results
  socket.on("message", (data) => {
    try {
      const response = JSON.parse(data.toString());
      if (response.channel?.alternatives?.[0]?.transcript) {
        const transcript = response.channel.alternatives[0].transcript;
        logger.info(`[Transcription] ${transcript}`);
      }
    } catch (error) {
      logger.error("Error parsing Deepgram response:", error);
    }
  });

  // Handle errors and connection cleanup
  socket.on("error", (error) => {
    logger.error("WebSocket error:", error);
  });

  socket.on("close", () => {
    logger.info(`Deepgram connection closed for StreamSid: ${streamSid}`);
  });

  // Stream audio data to Deepgram
  req.on("data", (chunk) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(chunk);
    }
  });

  req.on("end", () => {
    logger.info(`Twilio audio stream ended for StreamSid: ${streamSid}`);
    if (socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
    res.status(200).json({ message: "Audio stream processed" });
  });
};
