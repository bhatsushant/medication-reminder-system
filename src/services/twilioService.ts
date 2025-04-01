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
      //   twiml: `<Response><Gather input="speech dtmf" timeout="3" numDigits="1"><Say voice="alice">${config.twilio.reminderMessage}</Say></Gather></Response>`,
      twiml: `<Response><Say voice="alice">${config.twilio.reminderMessage}</Say><Record maxLength="30" playBeep="true" /></Response>`,
      statusCallback:
        "https://22d1-73-10-124-67.ngrok-free.app/webhooks/twilio/call-status", // Webhook to capture call events
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
      record: true
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
