import express, { Router } from "express";
import { UserController } from "../controllers/userController";
import { AuthController } from "../controllers/authController";
import { container } from "../di/container";
import { AuthMiddleware } from "../middleware/authMiddleware";
import { upload } from "../middleware/multer";
import { Roles } from "../config/roles";
export class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    const userController = container.resolve(UserController);
    const authController = container.resolve(AuthController);
    const authMiddleware = container.resolve(AuthMiddleware);

    this.router.post("/signup", userController.register.bind(userController));
    this.router.post(
      "/verify-otp",
      userController.verifyOtp.bind(userController)
    );
    this.router.post("/login", userController.login.bind(userController));
    this.router.post("/github/callback", userController.githubCallback.bind(userController));
    this.router.post("/linkedin/callback", userController.linkedinCallback.bind(userController));
    this.router.post(
      "/resend-otp",
      userController.resendOtp.bind(userController)
    );
    this.router.get(
      "/refresh-token",
      authController.refreshTokenHandler.bind(authController)
    );
    this.router.post(
      "/check-user",
      userController.forgotPassword.bind(userController)
    );
    this.router.post(
      "/reset-password",
      userController.resetPassword.bind(userController)
    );
    this.router.get(
      "/user-profile",
      authMiddleware.authenticate(Roles.USER),
      userController.profile.bind(userController)
    );
    this.router.patch(
      "/edit-profile",
      authMiddleware.authenticate(Roles.USER),
      upload.single("image"),
      userController.updateProfile.bind(userController)
    );
    this.router.post("/logout", userController.logout.bind(userController));
  }

  public getRouter(): Router {
    return this.router;
  }
}
