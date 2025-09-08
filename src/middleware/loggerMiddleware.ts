import morgan, { StreamOptions } from "morgan";
import logger from "../utils/logger"; // Adjust path if needed
import { RequestHandler } from "express";
import dotenv from "dotenv";

dotenv.config();

class LoggerMiddleware {
  private stream: StreamOptions;

  constructor() {
    this.stream = {
      write: (message: string) => {
        logger.http(message.trim());
      },
    };
  }

  public getMiddleware(): RequestHandler {
    const isDevelopment = process.env.NODE_ENV === "development";

    console.log(`Logger initialized - Environment: ${process.env.NODE_ENV}`);

    if (isDevelopment) {
      return morgan("dev", { stream: this.stream });
    } else {
      return morgan("combined", { stream: this.stream });
    }
  }

  public getCustomMiddleware(): RequestHandler {
    const customFormat =
      ":method :url :status :response-time ms - :res[content-length]";
    return morgan(customFormat, { stream: this.stream });
  }

  public getCleanMiddleware(): RequestHandler {
    return morgan("dev", {
      stream: this.stream,
      skip: (req) => {
        return (
          req.url.includes(".css") ||
          req.url.includes(".js") ||
          req.url.includes(".ico") ||
          req.url.includes("/health")
        );
      },
    });
  }
}

export default new LoggerMiddleware();
