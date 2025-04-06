import { Request, Response } from "express";
import VoiceResponse = require("twilio/lib/twiml/VoiceResponse");
import axios from "axios";
import logger from "../config/logger";
import { config } from "../config/env";
import { makeCallWithAMD } from "../services/twilioService";
import twilio from "twilio";

/**
 * Handles incoming calls from patients
 */
export const handleIncomingCall = (req: Request, res: Response): void => {
  const { From, To, CallSid } = req.body;

  logger.info(`Incoming call received from ${From}`, {
    callSid: CallSid,
    to: To,
    from: From,
  });

  const twiml = new VoiceResponse();

  // Using the same gather/response pattern as outgoing calls
  const gather = twiml.gather({
    input: ["speech"],
    timeout: 5,
    speechTimeout: "auto",
    action: `${config.ngrokUrl}/twilio/process-response`,
    method: "POST",
  });

  gather.say(
    "Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.",
  );

  // Fallback if no response
  twiml.say("Thank you for calling. Please remember to take your medications.");
  twiml.hangup();

  res.type("text/xml");
  res.send(twiml.toString());
};

/**
 * Initiates an outbound call to a patient
 */
export const initiateCall = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    res.status(400).json({ error: "Phone number is required" });
    return;
  }

  try {
    // Trigger call using Twilio API
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Calls.json`,
      new URLSearchParams({
        To: phoneNumber,
        From: config.twilioPhoneNumber,
        Url: `${config.ngrokUrl}/twilio/outgoing-call`,
        Method: "POST",
        MachineDetection: "DetectMessageEnd",
        AsyncAmd: "true",
        AsyncAmdStatusCallback: `${config.ngrokUrl}/twilio/amd-status`,
        StatusCallback: `${config.ngrokUrl}/call-status`,
        StatusCallbackMethod: "POST",
        StatusCallbackEvent:
          "initiated ringing answered in-progress completed busy no-answer canceled failed",
      }),
      {
        auth: {
          username: config.twilioAccountSid,
          password: config.twilioAuthToken,
        },
      },
    );

    // Track call in database
    // await db.collection('callTracking').insertOne({
    //   callSid: response.data.sid,
    //   recipientNumber: phoneNumber,
    //   messageId: messageId || null,
    //   status: 'initiated',
    //   wasAnswered: false,
    //   startTime: new Date(),
    //   reminderSent: false
    // });

    logger.info(`Call initiated to ${phoneNumber}`, {
      callSid: response.data.sid,
    });
    res.status(200).json({
      success: true,
      callSid: response.data.sid,
    });
  } catch (error: unknown) {
    // Properly type the error as unknown
    logger.error("Error initiating call:", error);

    // Safely access error properties with type narrowing
    if (error instanceof Error) {
      res.status(500).json({
        error: "Failed to initiate call",
        message: error.message,
      });
    } else if (axios.isAxiosError(error) && error.response) {
      // Handle Axios-specific errors
      res.status(error.response.status).json({
        error: "Twilio API error",
        message: error.response.data,
      });
    } else {
      // Generic error handling
      res.status(500).json({
        error: "An unknown error occurred",
      });
    }
  }
};

/**
 * Processes the patient's response to a call
 */
export const processCallResponse = (req: Request, res: Response): void => {
  const twiml = new VoiceResponse();
  const { SpeechResult, CallSid } = req.body;

  // Log patient's response
  logger.info(`Call ${CallSid} - Patient response: "${SpeechResult}"`);

  // TODO: Process response using NLP service or simple keyword matching
  const response = analyzeSpeechResponse(SpeechResult);

  twiml.say(response);
  twiml.hangup();

  res.type("text/xml");
  res.send(twiml.toString());
};

/**
 * Handles scenario when patient doesn't respond
 */
export const handleNoResponse = (req: Request, res: Response): void => {
  const twiml = new VoiceResponse();

  // Message when no response is received
  twiml.say(
    "I didn't hear your response. We'll try again later. Please remember to take your medications as prescribed.",
  );
  twiml.hangup();

  res.type("text/xml");
  res.send(twiml.toString());
};

/**
 * Simple function to analyze speech response
 * In a real application, this could be replaced with an NLP service
 */
/**
 * Simple function to analyze speech response
 * In a real application, this could be replaced with an NLP service
 */
function analyzeSpeechResponse(speech: string): string {
  // Convert to lowercase and trim whitespace
  speech = speech.toLowerCase().trim();

  // Check for affirmative responses
  const affirmativeResponses = [
    "yes",
    "yeah",
    "yep",
    "correct",
    "i did",
    "i have",
  ];
  const isAffirmative = affirmativeResponses.some(
    (response) => speech === response || speech.includes(response),
  );

  if (isAffirmative) {
    return "Thank you for confirming that you've taken your medications. Have a great day!";
  }

  // Check for negative responses
  const negativeResponses = [
    "no",
    "nope",
    "haven't",
    "i haven't",
    "not yet",
    "didn't",
  ];
  const isNegative = negativeResponses.some(
    (response) => speech === response || speech.includes(response),
  );

  if (isNegative) {
    return "I'm noting that you haven't taken your medications yet. Please remember to take them as prescribed by your doctor.";
  }

  // Default response for unclear answers
  return "I'm not sure I understood your response. Please remember to take your medications as prescribed by your doctor.";
}

/**
 * Retrieves call logs from Twilio API
 */
export const getCallLogs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Get call logs from Twilio API
    const response = await axios.get(
      `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Calls.json`,
      {
        auth: {
          username: config.twilioAccountSid,
          password: config.twilioAuthToken,
        },
        params: {
          // Optional filtering parameters
          // Status: 'completed',
          // From: config.twilioPhoneNumber,
          // StartTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    );

    logger.info(`Retrieved ${response.data.calls.length} call logs`);
    res.status(200).json(response.data.calls);
  } catch (error: unknown) {
    logger.error("Error retrieving call logs:", error);

    if (error instanceof Error) {
      res.status(500).json({
        error: "Failed to retrieve call logs",
        message: error.message,
      });
    } else if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).json({
        error: "Twilio API error",
        message: error.response.data,
      });
    } else {
      res.status(500).json({
        error: "An unknown error occurred",
      });
    }
  }
};

export const handleAmdStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    CallSid,
    AnsweredBy,
    MachineDetectionDuration,
    MachineDetectionStatus,
  } = req.body;

  logger.info(`AMD Status for call ${CallSid}`, {
    answeredBy: AnsweredBy,
    detectionDuration: MachineDetectionDuration,
    detectionStatus: MachineDetectionStatus,
  });

  try {
    // Update our call tracking with the AMD result
    // Uncomment this when you have the database setup
    /*
    await db.collection('callTracking').updateOne(
      { callSid: CallSid },
      {
        $set: {
          answeredBy: AnsweredBy,
          detectionStatus: MachineDetectionStatus,
          amdCallbackReceived: true,
          amdCallbackTime: new Date()
        }
      }
    );
    */

    // If call went to voicemail, you might want to handle it specially
    if (
      AnsweredBy === "machine_start" ||
      AnsweredBy === "machine_end_beep" ||
      AnsweredBy === "machine_end_silence" ||
      AnsweredBy === "machine_end_other"
    ) {
      // Get call details to find the phone number
      // Uncomment this when you have the database setup
      /*
      const callDetails = await db.collection('callTracking').findOne({ callSid: CallSid });

      if (callDetails && !callDetails.reminderSent) {
        // Send a text message instead
        await sendTextReminder(callDetails.recipientNumber, callDetails.messageId);

        // Mark reminder as sent
        await db.collection('callTracking').updateOne(
          { callSid: CallSid },
          { $set: { reminderSent: true, reminderSentTime: new Date() } }
        );

        logger.info(`Text reminder sent after voicemail detection`, {
          callSid: CallSid,
          phoneNumber: callDetails.recipientNumber
        });
      }
      */

      // For now, just log that voicemail was detected

      const callDetailsResponse = await axios.get(
        `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Calls/${CallSid}.json`,
        {
          auth: {
            username: config.twilioAccountSid,
            password: config.twilioAuthToken,
          },
          timeout: 5000,
        },
      );

      const phoneNumber = callDetailsResponse.data.to;

      logger.info(`Voicemail detected for call ${CallSid}`, {
        answeredBy: AnsweredBy,
        phoneNumber,
      });
      const client = twilio(config.twilioAccountSid, config.twilioAuthToken);

      await client.calls(CallSid).update({
        twiml: `
          <Response>
            <Pause length="2"/>
            <Say voice="alice">Hello, this is your medication reminder service. It's time to take your prescribed medication. Please don't forget to take the correct dosage. If you have any questions, please contact your healthcare provider. Thank you.</Say>
          </Response>
        `,
      });

      // Optional: Send SMS as backup
      // Some voicemail systems might cut off messages or be unreliable
      // So it's good practice to also send an SMS
      // await sendVoicemailBackupSms(phoneNumber);
    }
  } catch (error) {
    logger.error(`Error handling AMD status for call ${CallSid}`, {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Always respond with success to Twilio
  res.sendStatus(200);
};

export const initiateReminderCall = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      res.status(400).json({ error: "Phone number is required" });
      return;
    }

    // Call the makeCallWithAMD function
    await makeCallWithAMD(phoneNumber);

    res.status(200).json({ message: "Reminder call initiated" });
  } catch (error) {
    logger.error("Failed to initiate reminder call", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: "Failed to initiate call" });
  }
};

/**
 * Send SMS as backup when a voicemail is left
 * This ensures the recipient gets the message even if the voicemail system fails
 */
export const sendVoicemailBackupSms = async (
  phoneNumber: string,
): Promise<void> => {
  try {
    const messageContent =
      "We called to check on your medication but couldn't reach you. Please call us back or take your medications if you haven't done so.";

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`,
      new URLSearchParams({
        To: phoneNumber,
        From: config.twilioPhoneNumber,
        Body: messageContent,
      }),
      {
        auth: {
          username: config.twilioAccountSid,
          password: config.twilioAuthToken,
        },
      },
    );

    logger.info(`Voicemail backup SMS sent to ${phoneNumber}`, {
      messageSid: response.data.sid,
    });
  } catch (error) {
    logger.error(`Failed to send voicemail backup SMS to ${phoneNumber}`, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
