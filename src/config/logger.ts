import { createLogger, format, transports } from "winston";
import fs from "fs";
import path from "path";

// Ensure logs directory exists
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

export const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), logFormat)
    }),
    new transports.File({ filename: path.join(logDir, "app.log") })
  ]
});
