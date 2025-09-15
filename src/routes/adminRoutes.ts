import express, { Router } from "express";
import { container } from "../di/container";
import { AdminController } from "../controllers/adminController";
import { ProblemController } from "../controllers/problemController";
import { CategoryController } from "../controllers/categoryController";

export class AdminRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    const adminController = container.resolve(AdminController);
    const problemController = container.resolve(ProblemController);
    const categoryController = container.resolve(CategoryController);
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
    this.router.get(
      "/problems",
      problemController.getAllProblems.bind(problemController)
    );
    this.router.post(
      "/addproblems",
      problemController.addProblemController.bind(problemController)
    );
    this.router.put(
      "/updateproblem/:problemId",
      problemController.updateProblemController.bind(problemController)
    );
    this.router.post(
      "/addcategory",
      categoryController.addCategoryController.bind(categoryController)
    );
    this.router.get(
      "/allcategory",
      categoryController.getAllCategories.bind(categoryController)
    );
    this.router.get(
      "/categorylist",
      categoryController.categoryList.bind(categoryController)
    );
    this.router.put(
      "/updatecategory/:categoryId",
      categoryController.updateCategoryController.bind(categoryController)
    );

    this.router.patch(
      "/category/:id",
      categoryController.toggleCategoryStatus.bind(categoryController)
    );
    this.router.patch(
      "/problems/:id",
      problemController.toggleProblemStatus.bind(problemController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
