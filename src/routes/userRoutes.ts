import express, { Router } from "express";
import { UserController } from "../controllers/userController";
import { container } from "../di/container";
import { AuthController } from "../controllers/authController";

export class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    const userController = container.resolve(UserController);
    const authController = container.resolve(AuthController);
    this.router.post("/signup", userController.register.bind(userController));
    this.router.post("/verify-otp", userController.verifyOtp.bind(userController));
    this.router.post("/login",userController.login.bind(userController));
    this.router.post("/resend-otp", userController.resendOtp.bind(userController));
    this.router.get("/refresh-token",authController.refreshTokenHandler.bind(authController))

    this.router.post("/check-user", userController.forgotPassword.bind(userController));
    this.router.post("/reset-password", userController.resetPassword.bind(userController));


  }

  public getRouter(): Router {
    return this.router;
  }
}
