import axios from "axios";
import { config } from "../config/env";
import { logger } from "../config/logger";
import fs from "fs";

import { ElevenLabsClient } from "elevenlabs";
import { response } from "express";

const elevenlabs = new ElevenLabsClient({ apiKey: config.elevenLabs.apiKey });

export const generateSpeech = async (text: string) => {
  try {
    // Request audio from ElevenLabs API
    const audioStream = await elevenlabs.textToSpeech.convertAsStream(
      config.elevenLabs.voiceId,
      {
        output_format: "mp3_44100_128",
        text: text,
        model_id: "eleven_multilingual_v2"
      }
    );

    // Return audio as a buffer
    const filePath = "./output.mp3";
    const writer = fs.createWriteStream(filePath);
    audioStream.pipe(writer);

    writer.on("finish", () => {
      console.log(`Audio file saved to ${filePath}`);
    });
  } catch (error) {
    console.error("Error in ElevenLabs TTS:", error);
    throw new Error("Failed to generate speech");
  }
};

// export const generateSpeech = async (text: string): Promise<string | null> => {
//   try {
//     console.log(`${config.elevenLabs.apiKey}, ${config.elevenLabs.voiceId}`);
//     const response = await axios.post(
//       `https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=mp3_44100_128`,
//       { text, model_id: "eleven_multilingual_v2" },
//       { headers: { Authorization: `Bearer ${config.elevenLabs.apiKey}` } }
//     );

//     return response.data.audio_url;
//   } catch (error) {
//     logger.error(`TTS Error: ${error}`);
//     return null;
//   }
// };
