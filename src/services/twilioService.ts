import twilio from "twilio";
import { config } from "../config/env";
import logger from "../config/logger";

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

export const makeCall = async (phoneNumber: string) => {
  try {
    const call = await client.calls.create({
      to: phoneNumber,
      from: config.twilio.phoneNumber,
      method: "GET",
      twiml: `<Response>
          <Say voice="alice">${config.twilio.reminderMessage}</Say>
          <Start>
            <Stream url="wss://22d1-73-10-124-67.ngrok-free.app/twilio" track="both_tracks" />
          </Start>
        </Response>`,
      statusCallback:
        "https://22d1-73-10-124-67.ngrok-free.app/webhooks/twilio/call-status", // Webhook to capture call events
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

export const sendSMS = async (to: string, message: string) => {
  try {
    const messageResponse = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to
    });

    logger.info(`SMS sent to ${to} - Message SID: ${messageResponse.sid}`);
    return messageResponse.sid;
  } catch (error) {
    logger.error("Error sending SMS:", error);
    throw error;
  }
};

// Twilio helper library
// const twilio = require("twilio");

// // Your account SID and auth token from twilio.com/console
// const accountSid = config.twilio.accountSid;
// const authToken = config.twilio.authToken;

// // The Twilio client
// const client = twilio(accountSid, authToken);

// // Make the outgoing call
// client.calls
//   .create({
//     twiml:
//       '<Response><Start><Stream url="wss://url.to.deepgram.twilio.proxy" track="both_tracks" /></Start></Response>', // replace number with person B, replace url
//     to: "+12017245819", // person A
//     from: config.twilio.phoneNumber // your Twilio number
//   })
//   .then(call => console.log(call.sid))
//   .catch(err => console.error(err));
