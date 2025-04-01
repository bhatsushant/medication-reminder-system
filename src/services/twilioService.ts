import twilio from "twilio";
import { config } from "../config/env";
import logger from "../config//logger";

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

export const makeCall = async (phoneNumber: string) => {
  try {
    const call = await client.calls.create({
      to: phoneNumber,
      from: config.twilio.phoneNumber,
      method: "GET",
      twiml: `<Response><Say>${config.twilio.reminderMessage}</Say></Response>`,
      statusCallback:
        "https://22d1-73-10-124-67.ngrok-free.app/webhook/twilio/call-status", // Webhook to capture call events
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST"
    });

    logger.info(`Call initiated: ${call.sid}`);
    return call.sid;
  } catch (error) {
    logger.error("Error making call:", error);
    throw error;
  }
};

export const sendSMS = async (phoneNumber: string, message: string) => {
  try {
    const messageInstance = await client.messages.create({
      body: message,
      from: config.twilio.phoneNumber,
      to: phoneNumber
    });

    logger.info(`SMS sent: ${messageInstance.sid}`);
    return messageInstance.sid;
  } catch (error) {
    logger.error("Error sending SMS:", error);
    throw error;
  }
};
