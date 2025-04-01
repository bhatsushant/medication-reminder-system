import { Request, Response } from "express";
import { makeCall } from "../services/twilioService";

export const triggerCall = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    const callSid = await makeCall(phoneNumber);
    res.status(200).json({ message: "Call initiated", callSid });
  } catch (error) {
    res.status(500).json({ error: "Error triggering call" });
  }
};
