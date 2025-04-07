import { Twilio } from "twilio";
import logger from "../config/logger";
import { config } from "../config/env";

const client = new Twilio(config.twilioAccountSid, config.twilioAuthToken);

export const makeCallWithAMD = async (phoneNumber: string): Promise<void> => {
  try {
    const twilioPhoneNumber = config.twilioPhoneNumber;
    const ngrokUrl = config.ngrokUrl;

    if (!twilioPhoneNumber || !ngrokUrl) {
      throw new Error(
        "Missing required environment variables: TWILIO_PHONE_NUMBER or NGROK_URL"
      );
    }

    const call = await client.calls.create({
      url: `${ngrokUrl}/twilio/voice`,
      to: phoneNumber,
      from: twilioPhoneNumber,
      statusCallback: `${ngrokUrl}/call-status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
      machineDetection: "DetectMessageEnd",
      machineDetectionTimeout: 30
    });

    logger.info(`Call initiated to ${phoneNumber}`, {
      callSid: call.sid,
      amdEnabled: true
    });
  } catch (error) {
    logger.error(`Failed to initiate call to ${phoneNumber}`, {
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
