import express, { Router } from "express";
import { UserController } from "../controllers/userController";
import { container } from "../di/container";

export class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    const userController = container.resolve(UserController);
    this.router.post("/signup", userController.register.bind(userController));
    this.router.post("/verify-otp", userController.verifyOtp.bind(userController));

  }

  public getRouter(): Router {
    return this.router;
  }
}
