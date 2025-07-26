import express, { Express } from "express";
import cors from "cors";
import { UserRoutes } from "./routes/userRoutes";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
dotenv.config()

export class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares() {
    const corsOptions = {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin"
      ],
      preflightContinue: false,
      optionsSuccessStatus: 204
    };

    this.app.use(cors(corsOptions));
    this.app.use(cookieParser());
    this.app.use(express.json());
  }

  private setupRoutes() {
    const userRoutes = new UserRoutes();
    this.app.use("/api/user", userRoutes.getRouter());
  }

  public getInstance(): Express {
    return this.app;
  }
}
