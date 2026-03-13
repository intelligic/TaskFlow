import { createLogger, format, transports } from "winston";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const serverRootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logsDir = path.join(serverRootDir, "logs");
try {
  fs.mkdirSync(logsDir, { recursive: true });
} catch {
  // ignore
}

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}] ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logsDir, "error.log"), level: "error" }),
    new transports.File({ filename: path.join(logsDir, "combined.log") })
  ]
});

export default logger;
