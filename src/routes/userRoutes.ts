import express, { Router } from "express";
import { UserController } from "../controllers/userController";
import { AuthController } from "../controllers/authController";
import { container } from "../di/container";
import { AuthMiddleware } from "../middleware/authMiddleware";
import { upload } from "../middleware/multer";
import { Roles } from "../config/roles";
import { ProblemController } from "../controllers/problemController";
import { ExecuteController } from "../controllers/executeController";
import { AiController } from "../controllers/aiController";
import { AITutorController } from "../controllers/AiTutorCntroller";
import { JobController } from "../controllers/jobController";

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
    const problemController = container.resolve(ProblemController);
    const executeController = container.resolve(ExecuteController);
    const aiController = container.resolve(AiController);
    const aiTutorController=container.resolve(AITutorController)
    const jobController=container.resolve(JobController)

    this.router.post("/signup", userController.register.bind(userController));
    this.router.post(
      "/verify-otp",
      userController.verifyOtp.bind(userController)
    );
    this.router.post("/login", userController.login.bind(userController));
    this.router.post(
      "/github/callback",
      userController.githubCallback.bind(userController)
    );
    this.router.get(
      "/linkedin/callback",
      userController.linkedinCallback.bind(userController)
    );
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
    this.router.get(
      "/user-stats",
      authMiddleware.authenticate(Roles.USER),
      executeController.stats.bind(executeController)
    );
    this.router.patch(
      "/edit-profile",
      authMiddleware.authenticate(Roles.USER),
      upload.single("image"),
      userController.updateProfile.bind(userController)
    );
    this.router.post("/logout", userController.logout.bind(userController));
    this.router.get(
      "/problems",
      problemController.getProblems.bind(problemController)
    );
    this.router.get(
      "/singleproblem/:problemId",
      problemController.getSingleProblem.bind(problemController)
    );
    this.router.post(
      "/runcode",
      authMiddleware.authenticate(Roles.USER),
      executeController.runCode.bind(executeController)
    );
    this.router.post(
      "/submitcode",
      authMiddleware.authenticate(Roles.USER),
      executeController.submitCode.bind(executeController)
    );
    this.router.get(
      "/allsubmissions/:problemId",
      authMiddleware.authenticate(Roles.USER),
      executeController.getAllSubmissions.bind(executeController)
    );
    this.router.post(
      "/aidebugger",
      authMiddleware.authenticate(Roles.USER),
      aiController.explainError.bind(aiController)
    );
    this.router.post(
      "/aitutor",
      authMiddleware.authenticate(Roles.USER),
      aiTutorController.chat.bind(aiTutorController)
    );
    this.router.get(
      "/alljobpost",
      authMiddleware.authenticate(Roles.USER),
      jobController.getAllJobDetails.bind(jobController)
    );
  }
  public getRouter(): Router {
    return this.router;
  }
}
