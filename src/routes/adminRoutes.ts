import express, { Router } from "express";
import { container } from "../di/container";
import { AdminController } from "../controllers/adminController";

export class AdminRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    const adminController = container.resolve(AdminController);
    this.router.post("/login", adminController.login.bind(adminController));
    this.router.get(
      "/userslist",
      adminController.getAllUsers.bind(adminController)
    );
    this.router.patch(
      "/users/:id",
      adminController.toggleUserStatus.bind(adminController)
    );
    this.router.post("/logout", adminController.logout.bind(adminController));
    this.router.get(
      "/recruiterlist",
      adminController.getAllRecruiters.bind(adminController)
    );
    this.router.patch(
      "/recruiter/:id",
      adminController.toggleRecruiterStatus.bind(adminController)
    );

    this.router.get(
      "/applicantlist",
      adminController.getAllApplicants.bind(adminController)
    );

    this.router.patch(
      "/approve-applicant/:applicantId",
      adminController.acceptApplicant.bind(adminController)
    );
    this.router.patch(
      "/reject-applicant/:applicantId",
      adminController.rejectApplicant.bind(adminController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
