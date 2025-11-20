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
import { JobApplicationController } from "../controllers/jobApplicationController";
import { InterviewController } from "../controllers/interviewController";
import CommunityController from "../controllers/communityController";
import { AnswerController } from "../controllers/answerController";
import { SubscriptionPlanController } from "../controllers/subscriptionPlanController";

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
    const aiTutorController = container.resolve(AITutorController);
    const jobController = container.resolve(JobController);
    const interviewController = container.resolve(InterviewController);
    const jobApplicationController = container.resolve(
      JobApplicationController
    );
    const communityController=container.resolve(CommunityController)
    const answerController=container.resolve(AnswerController)
    const subscriptionController=container.resolve(SubscriptionPlanController)
    

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
      "/edit-profile/:userId",
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
    this.router.post(
      "/applyjob",
      authMiddleware.authenticate(Roles.USER),
      upload.fields([
        { name: "resume", maxCount: 1 },
        { name: "plusTwoCertificate", maxCount: 1 },
        { name: "degreeCertificate", maxCount: 1 },
        { name: "pgCertificate", maxCount: 1 },
      ]),
      jobApplicationController.applyJob.bind(jobApplicationController)
    );
    this.router.get(
      "/allinterviews",
      authMiddleware.authenticate(Roles.USER),
      interviewController.getAllInterviews.bind(interviewController)
    );
    this.router.get(
      "/locations",
      jobController.fetchLocations.bind(jobController)
    );
    this.router.get(
      "/getonejob/:jobId",
      authMiddleware.authenticate(Roles.USER),
      jobController.getJobById.bind(jobController)
    );
    this.router.post(
      "/addquestion",
      authMiddleware.authenticate(Roles.USER),
      communityController.addQuestionController.bind(communityController)
    );
    this.router.get(
      "/getallquestions",
      authMiddleware.authenticate(Roles.USER),
      communityController.getAllQuestionsController.bind(communityController)
    );
    this.router.get(
      "/getonequestion/:id",
      authMiddleware.authenticate(Roles.USER),
      communityController.getOneQuestion.bind(communityController)
    );
    this.router.post(
      "/addAnswer",
      authMiddleware.authenticate(Roles.USER),
      answerController.addAnswer.bind(answerController)
    );
    this.router.get(
      "/getallanswers/:questionId",
      authMiddleware.authenticate(Roles.USER),
      answerController.getAnswersByQuestionId.bind(answerController)
    );
    this.router.post(
      "/answerlike/:answerId",
      authMiddleware.authenticate(Roles.USER),
      answerController.like.bind(answerController)
    );
    this.router.post(
      "/answerdislike/:answerId",
      authMiddleware.authenticate(Roles.USER),
      answerController.dislike.bind(answerController)
    );

    this.router.get(
      "/showallsubscriptions",
      authMiddleware.authenticate(Roles.USER),
      subscriptionController.showAllSubscriptions.bind(subscriptionController)
    );
    this.router.post(
      "/purchase",
      authMiddleware.authenticate(Roles.USER),
      subscriptionController.purchaseSubscriptionPlan.bind(subscriptionController)
    );
    this.router.post(
      "/verify-payment/:sessionId",
      authMiddleware.authenticate(Roles.USER),
      subscriptionController.verifyStripeSession.bind(
        subscriptionController
      )
    );
    this.router.get(
      "/ispremium",
      authMiddleware.authenticate(Roles.USER),
      userController.isPremium.bind(userController)
    );
    this.router.get(
      "/isstandard",
      authMiddleware.authenticate(Roles.USER),
      userController.isStandard.bind(userController)
    );
    this.router.get(
      "/isbasic",
      authMiddleware.authenticate(Roles.USER),
      userController.isBasic.bind(userController)
    );
  }
  public getRouter(): Router {
    return this.router;
  }
}
