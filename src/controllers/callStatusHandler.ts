import { Request, Response } from "express";
import logger from "../config/logger";

/**
 * Handles Twilio call status callbacks
 */
export const handleCallStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { CallSid, CallStatus, To, CallDuration, Duration, Direction } =
    req.body;

  // Log the call status
  logger.info(`Call status update for ${To}`, {
    callSid: CallSid,
    status: CallStatus,
    duration: CallDuration,
    direction: Direction,
  });

  // Call is completed but was very short (user hung up)
  if (CallStatus === "completed" && parseInt(CallDuration) < 10) {
    logger.warning(`Patient ${To} likely hung up prematurely`, {
      callSid: CallSid,
      callDuration: CallDuration,
      actualTalkDuration: Duration,
    });

    // Send a text reminder
    // try {
    //   await sendTextReminder(To);
    //   logger.info(`Text reminder sent to ${To} after call hang-up`, {
    //     callSid: CallSid,
    //   });
    // } catch (error) {
    //   logger.error(`Failed to send text reminder to ${To}`, {
    //     callSid: CallSid,
    //     error: error instanceof Error ? error.message : String(error),
    //   });
    // }
  } else if (CallStatus === "no-answer" || CallStatus === "busy") {
    // Call was not answered or line was busy
    logger.warning(`Patient ${To} did not answer or line was busy`, {
      callSid: CallSid,
      status: CallStatus,
    });

    // Send a text reminder
    // try {
    //   await sendTextReminder(To);
    //   logger.info(`Text reminder sent to ${To} after ${CallStatus}`, {
    //     callSid: CallSid,
    //   });
    // } catch (error) {
    //   logger.error(`Failed to send text reminder to ${To}`, {
    //     callSid: CallSid,
    //     error: error instanceof Error ? error.message : String(error),
    //   });
    // }
  }

  // Send successful response back to Twilio
  res.sendStatus(200);
};
