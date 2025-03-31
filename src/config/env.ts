import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
    reminderMessage:
      "Hello, this is a reminder from your healthcare provider to confirm your medications. Have you taken Aspirin, Cardivol, and Metformin today?"
  },
  elevenLabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || "",
    voiceId: process.env.ELEVENLABS_VOICE_ID || ""
  },
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY || ""
  }
};
