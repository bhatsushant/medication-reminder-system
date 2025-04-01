import axios from "axios";
import { config } from "../config/env";
import logger from "../config/logger";

export const transcribeAudio = async (audioUrl: string): Promise<string> => {
  try {
    console.log("AUDIO URL:", audioUrl);

    // Send the recording to Deepgram
    const deepgramResponse = await axios.post(
      "https://api.deepgram.com/v1/listen",
      {
        url: audioUrl // ✅ Ensure this is correct
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Token ${config.deepgram.apiKey}`,
          "Content-Type": "audio/mp3"
        }
      }
    );

    const transcription =
      deepgramResponse.data.results?.channels?.[0]?.alternatives?.[0]
        ?.transcript || "";

    logger.info(`Transcription: ${transcription}`);
    return transcription;
  } catch (error) {
    logger.error("Error transcribing audio:", error);
    throw error;
  }
};
