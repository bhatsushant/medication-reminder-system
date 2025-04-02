import app from "./app";
import logger from "./config/logger";
import "./services/webSocketServer";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (reason: Error) => {
  logger.error(`Unhandled Rejection: ${reason.message}`);
});
