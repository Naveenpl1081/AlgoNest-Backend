import express, { Router } from "express";
import { container } from "tsyringe";
import { AuthController } from "../controllers/authController";
import { RecruiterController } from "../controllers/recruiterController";
import { AuthMiddleware } from "../middleware/authMiddleware";
import { Roles } from "../config/roles";
import { upload } from "../middleware/multer";
import { JobController } from "../controllers/jobController";
import { JobApplicationController } from "../controllers/jobApplicationController";
import { InterviewController } from "../controllers/interviewController";

export class RecruiterRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    const authMiddleware = container.resolve(AuthMiddleware);
    const recruiterController = container.resolve(RecruiterController);
    const authController = container.resolve(AuthController);
    const jobController = container.resolve(JobController);
    const jobApplicationController=container.resolve(JobApplicationController)
    const interviewController=container.resolve(InterviewController)
    this.router.post(
      "/signup",
      recruiterController.register.bind(recruiterController)
    );
    this.router.post(
      "/verify-otp",
      recruiterController.verifyOtp.bind(recruiterController)
    );
    this.router.post(
      "/login",
      recruiterController.login.bind(recruiterController)
    );
    this.router.post(
      "/resend-otp",
      recruiterController.resendOtp.bind(recruiterController)
    );
    this.router.get(
      "/refresh-token",
      authController.refreshTokenHandler.bind(authController)
    );
    this.router.post(
      "/check-user",
      recruiterController.forgotPassword.bind(recruiterController)
    );
    this.router.post(
      "/reset-password",
      recruiterController.resetPassword.bind(recruiterController)
    );
    this.router.patch(
      "/company-verification",
      authMiddleware.authenticate(Roles.RECRUITER),
      upload.single("document"),
      recruiterController.submitDocuments.bind(recruiterController)
    );

    this.router.get(
      "/recruiter-profile",
      authMiddleware.authenticate(Roles.RECRUITER),
      recruiterController.profile.bind(recruiterController)
    );
    this.router.post(
      "/logout",
      recruiterController.logout.bind(recruiterController)
    );

    this.router.post(
      "/jobpost",
      authMiddleware.authenticate(Roles.RECRUITER),
      jobController.addJob.bind(jobController)
    );
    this.router.get(
      "/alljobpost",
      authMiddleware.authenticate(Roles.RECRUITER),
      jobController.getAllJobs.bind(jobController)
    );
    this.router.put(
      "/updatejobpost/:jobId",
      authMiddleware.authenticate(Roles.RECRUITER),
      jobController.updateJobController.bind(jobController)
    );
    this.router.patch(
      "/jobstatus/:id",
      jobController.toggleJobStatus.bind(jobController)
    );
    this.router.get(
      "/applicants",
      authMiddleware.authenticate(Roles.RECRUITER),
      jobApplicationController.getAllApplicants.bind(jobApplicationController)
    );
    this.router.patch(
      "/aishortlist/:jobId",
      authMiddleware.authenticate(Roles.RECRUITER),
      jobApplicationController.aiShortlist.bind(jobApplicationController)
    );
    this.router.get(
      "/shortlistapplicants",
      authMiddleware.authenticate(Roles.RECRUITER),
      jobApplicationController.getAllShortlistApplicants.bind(jobApplicationController)
    );
    this.router.post(
      "/scheduleinterview",
      authMiddleware.authenticate(Roles.RECRUITER),
      interviewController.scheduleInterview.bind(interviewController)
    );
    this.router.get(
      "/allinterviews",
      authMiddleware.authenticate(Roles.RECRUITER),
      interviewController.getAllInterviews.bind(interviewController)
    );
  }
  public getRouter(): Router {
    return this.router;
  }
}
