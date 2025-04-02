import WebSocket from "ws";
import logger from "../config/logger";
import { config } from "../config/env";

// Start a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", ws => {
  logger.info("New WebSocket connection from Twilio");

  const deepgramSocket = new WebSocket(
    `wss://api.deepgram.com/v1/listen?model=general&access_token=${config.deepgram.apiKey}`
  );

  deepgramSocket.on("open", () => {
    logger.info("Connected to Deepgram for real-time transcription");

    // Forward Twilio audio to Deepgram
    ws.on("message", data => {
      deepgramSocket.send(data);
    });

    // Receive transcriptions from Deepgram
    deepgramSocket.on("message", message => {
      const transcriptionData = JSON.parse(message.toString());
      if (transcriptionData.channel.alternatives[0].transcript) {
        logger.info(
          `Transcription: ${transcriptionData.channel.alternatives[0].transcript}`
        );
      }
    });
  });

  ws.on("close", () => {
    logger.info("Twilio WebSocket closed");
    deepgramSocket.close();
  });
});

logger.info("WebSocket server running on ws://localhost:8080");
