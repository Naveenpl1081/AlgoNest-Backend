import fs from "fs";
import path from "path";
import { createLogger, format, transports, Logger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";


const logDir = path.join(__dirname, "../../logs");


if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}


function cleanOldLogs() {
  const files = fs.readdirSync(logDir);
  files.forEach(file => {
    const filePath = path.join(logDir, file);
    const stats = fs.statSync(filePath);
    const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
    if (ageInDays > 14) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old log file: ${file}`);
    }
  });
}


cleanOldLogs();

const logger: Logger = createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  level: "http",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(logDir, "app-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});


logger.on('rotate', function(oldFilename, newFilename) {
  console.log(`Rotated from ${oldFilename} to ${newFilename}`);
});

export default logger;
