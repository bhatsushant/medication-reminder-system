import axios from "axios";
import { config } from "../config/env";
import logger from "../config/logger";

export const generateSpeech = async (text: string) => {
  try {
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/synthesize",
      { text },
      {
        headers: { Authorization: `Token ${config.elevenLabs.apiKey}` }
      }
    );

    const audioUrl = response.data.audio_url;
    logger.info(`Generated speech audio: ${audioUrl}`);
    return audioUrl;
  } catch (error) {
    logger.error("Error generating speech:", error);
    throw error;
  }
};
