import express, { Router } from "express";
import { container } from "../di/container";
import { AdminController } from "../controllers/adminController";
import { ProblemController } from "../controllers/problemController";
import { CategoryController } from "../controllers/categoryController";
import { SubscriptionPlanController } from "../controllers/subscriptionPlanController";
import { AuthMiddleware } from "../middleware/authMiddleware";

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
    const subscriptionPlanController = container.resolve(
      SubscriptionPlanController
    );
    const authMiddleware = container.resolve(AuthMiddleware);

    this.router.post("/login", adminController.login.bind(adminController));
    this.router.get(
      "/userslist",
      adminController.getAllUsers.bind(adminController)
    );
    this.router.patch(
      "/users/:id",authMiddleware.authenticate,
      adminController.toggleUserStatus.bind(adminController)
    );
    this.router.post("/logout", adminController.logout.bind(adminController));
    this.router.get(
      "/recruiterlist",authMiddleware.authenticate,
      adminController.getAllRecruiters.bind(adminController)
    );
    this.router.patch(
      "/recruiter/:id",authMiddleware.authenticate,
      adminController.toggleRecruiterStatus.bind(adminController)
    );

    this.router.get(
      "/applicantlist",authMiddleware.authenticate,
      adminController.getAllApplicants.bind(adminController)
    );

    this.router.patch(
      "/approve-applicant/:applicantId",authMiddleware.authenticate,
      adminController.acceptApplicant.bind(adminController)
    );
    this.router.patch(
      "/reject-applicant/:applicantId",authMiddleware.authenticate,
      adminController.rejectApplicant.bind(adminController)
    );
    this.router.get(
      "/problems",authMiddleware.authenticate,
      problemController.getAllProblems.bind(problemController)
    );
    this.router.post(
      "/addproblems",authMiddleware.authenticate,
      problemController.addProblemController.bind(problemController)
    );
    this.router.put(
      "/updateproblem/:problemId",authMiddleware.authenticate,
      problemController.updateProblemController.bind(problemController)
    );
    this.router.post(
      "/addcategory",authMiddleware.authenticate,
      categoryController.addCategoryController.bind(categoryController)
    );
    this.router.get(
      "/allcategory",authMiddleware.authenticate,
      categoryController.getAllCategories.bind(categoryController)
    );
    this.router.get(
      "/categorylist",authMiddleware.authenticate,
      categoryController.categoryList.bind(categoryController)
    );
    this.router.put(
      "/updatecategory/:categoryId",authMiddleware.authenticate,
      categoryController.updateCategoryController.bind(categoryController)
    );

    this.router.patch(
      "/category/:id",authMiddleware.authenticate,
      categoryController.toggleCategoryStatus.bind(categoryController)
    );
    this.router.patch(
      "/problems/:id",authMiddleware.authenticate,
      problemController.toggleProblemStatus.bind(problemController)
    );
    this.router.post(
      "/addsubscription",authMiddleware.authenticate,
      subscriptionPlanController.addSubscriptionPlan.bind(
        subscriptionPlanController
      )
    );
    this.router.get(
      "/subscriptions",authMiddleware.authenticate,
      subscriptionPlanController.getAllSubscriptions.bind(
        subscriptionPlanController
      )
    );

    this.router.patch(
      "/subscriptions/:id",
      subscriptionPlanController.toggleSubscriptionStatus.bind(
        subscriptionPlanController
      )
    );
    this.router.put(
      "/editsubscriptions/:subscriptionId",
      subscriptionPlanController.updateSubscriptionController.bind(
        subscriptionPlanController
      )
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
