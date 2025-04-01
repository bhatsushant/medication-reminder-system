// import { twilioClient } from "../config/twilio";
// import { generateSpeech } from "./tts";
// import { transcribeAudio } from "./stt";
// import { config } from "../config/env";
// import logger from "../config/logger";

// export const makeCall = async (phoneNumber: string) => {
//   try {
//     const call = await twilioClient.calls.create({
//       to: phoneNumber,
//       from: config.twilio.phoneNumber,
//       method: "GET",
//       twiml: `<Response><Say>${config.twilio.reminderMessage}</Say></Response>`,
//       statusCallback: "https://22d1-73-10-124-67.ngrok-free.app/twilio-webhook", // Webhook to capture call events
//       statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
//       statusCallbackMethod: "POST"
//     });
//     logger.info(
//       `📞 Call initiated - SID: ${call.sid} | To: ${phoneNumber} | status: ${call.status}`
//     );

//     return { callSID: call.sid, status: call.status };
//   } catch (error) {
//     logger.error(`Call Error: ${error}`);
//   }
// };

// export const handleCallResponse = async (
//   callSid: string,
//   recordingUrl: string
// ): Promise<void> => {
//   const responseText = await transcribeAudio(recordingUrl);
//   logger.info(
//     `📋 Call Log - SID: ${callSid} | Patient Response: "${responseText}"`
//   );
// };

// export const handleMissedCall = async (phoneNumber: string): Promise<void> => {
//   const smsMessage =
//     "We called to check on your medication but couldn't reach you. Please call us back.";

//   try {
//     await twilioClient.messages.create({
//       body: smsMessage,
//       from: config.twilio.phoneNumber,
//       to: phoneNumber
//     });
//     logger.warn(`📩 Missed Call - Sent SMS to: ${phoneNumber}`);
//   } catch (error) {
//     logger.error(`SMS Error: ${error}`);
//   }
// };
