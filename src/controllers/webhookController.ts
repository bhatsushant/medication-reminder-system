import { Request, Response } from "express";
import twilio from "twilio";
import logger from "../config/logger";
import { config } from "../config/env";
import { CallLogModel } from "../models/callLog";

export const handleOutgoingCall = async (req: Request, res: Response) => {
  const { To, CallSid } = req.body;

  try {
    await CallLogModel.create({
      callSid: CallSid,
      phoneNumber: To,
      callStatus: "initiated",
      direction: "outbound",
      recordingUrl: ""
    });

    const twiml = new twilio.twiml.VoiceResponse();

    const gather = twiml.gather({
      input: ["speech"],
      speechModel: "deepgram_nova-2",
      timeout: 5,
      speechTimeout: "auto",
      language: "en-US",
      action: `${config.ngrokUrl}/twilio/process-response`,
      method: "POST"
    });

    gather.say(
      {
        voice: "Polly.Joanna"
      },
      "Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please confirm if you have taken your Aspirin, Cardivol, and Metformin today."
    );
  });

    twiml.redirect(`${config.ngrokUrl}/twilio/no-response`);

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    logger.error("Failed to create call log for outgoing call", {
      error: error instanceof Error ? error.message : String(error),
      callSid: CallSid
    });
  }
};

export const processWebhookResponse = (req: Request, res: Response): void => {
  const { SpeechResult, CallSid } = req.body;

  logger.info(`Call ${CallSid} - Patient response: "${SpeechResult}"`);

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say("Thank you for confirming. Have a great day!");
  twiml.hangup();

  res.type("text/xml");
  res.send(twiml.toString());
};

export const handleNoResponse = (req: Request, res: Response): void => {
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.say(
    "We called to check on your medication but couldn't reach you. Please call us back or take your medications if you haven't done so."
  );
  twiml.hangup();

  res.type("text/xml");
  res.send(twiml.toString());
};
