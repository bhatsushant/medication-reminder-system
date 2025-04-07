import { Request, Response } from "express";
import logger from "../config/logger";

export const handleCallStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { CallSid, CallStatus, To, CallDuration, Duration, Direction } =
    req.body;

  logger.info(`Call status update for ${To}`, {
    callSid: CallSid,
    status: CallStatus,
    duration: CallDuration,
    direction: Direction
  });

  if (CallStatus === "completed" && parseInt(CallDuration) < 10) {
    logger.warning(`Patient ${To} likely hung up prematurely`, {
      callSid: CallSid,
      callDuration: CallDuration,
      actualTalkDuration: Duration
    });
  } else if (CallStatus === "no-answer" || CallStatus === "busy") {
    logger.warning(`Patient ${To} did not answer or line was busy`, {
      callSid: CallSid,
      status: CallStatus
    });
  }

  res.sendStatus(200);
};
