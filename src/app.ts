import express, { Express } from "express";
import cors from "cors";
import { UserRoutes } from "./routes/userRoutes";

export class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares() {
    const corsOptions = {
      origin: true,
      methods: "GET,POST,PUT,PATCH,DELETE",
      credentials: true,
      allowedHeaders: "Content-Type,Authorization",
    };

    this.app.use(cors(corsOptions));
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
