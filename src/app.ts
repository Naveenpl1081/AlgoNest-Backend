import express, { Express } from "express";
import cors from "cors";
import { UserRoutes } from "./routes/userRoutes";
import { RecruiterRoutes } from "./routes/recuiterRoutes";
import { AuthRoute } from "./routes/authRoutes";
import { AdminRoutes } from "./routes/adminRoutes";
import loggerMiddleware from "./middleware/loggerMiddleware";

import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

export class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares() {
    this.app.use(loggerMiddleware.getMiddleware());

    const corsOptions = {
      origin: (origin:any, callback:any) => {
        const allowedOrigins = [
          process.env.CLIENT_URL,
          "https://algonest.live",
          "https://www.algonest.live",
        ];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, origin);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: [
        "Authorization",
        "Content-Type",
        "Access-Control-Allow-Headers",
        "Origin",
        "Accept",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
      ],
      exposedHeaders: ["Set-Cookie"],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };

    this.app.use(cors(corsOptions));
    this.app.use(cookieParser());
    this.app.use(express.json());
  }

  private setupRoutes() {
    const userRoutes = new UserRoutes();
    const recruiterRoutes = new RecruiterRoutes();
    const authRoute = new AuthRoute();
    const adminRoutes = new AdminRoutes();
    this.app.use("/api/user", userRoutes.getRouter());
    this.app.use("/api/recruiter", recruiterRoutes.getRouter());
    this.app.use("/api/admin", adminRoutes.getRouter());
    this.app.use("/api", authRoute.getRouter());
  }

  public getInstance(): Express {
    return this.app;
  }
}
