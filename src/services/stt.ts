// import axios from "axios";
// import { config } from "../config/env";
// import { logger } from "../config/logger";

// export const transcribeAudio = async (audioUrl: string): Promise<string> => {
//   try {
//     const response = await axios.post(
//       "https://api.deepgram.com/v1/listen",
//       { audio_url: audioUrl },
//       { headers: { Authorization: `Bearer ${config.deepgram.apiKey}` } }
//     );

//     return response.data.transcription;
//   } catch (error) {
//     logger.error(`STT Error: ${error}`);
//     return "Error in transcription";
//   }
// };

import axios from "axios";
import { config } from "../config/env";
import logger from "../config/logger";

export const transcribeAudio = async (audioUrl: string): Promise<string> => {
  try {
    const url = "https://api.deepgram.com/v1/listen";

    const headers = {
      Accept: "application/json",
      Authorization: `Token ${config.deepgram.apiKey}`,
      "Content-Type": "application/json"
    };

    const response = await axios.post(url, { url: audioUrl }, { headers });

    if (!response.data || !response.data.results) {
      throw new Error("Invalid response from Deepgram API");
    }

    const transcription =
      response.data.results.channels?.[0]?.alternatives?.[0]?.transcript || "";

    logger.info(`Transcription: ${transcription}`);
    return transcription;
  } catch (error) {
    logger.error("Error transcribing audio:", error);
    throw error;
  }
};
