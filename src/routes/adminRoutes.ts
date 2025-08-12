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
    this.router.get("/users", adminController.getAllUsers.bind(adminController));
    this.router.patch("/users:id",adminController.toggleUserStatus.bind(adminController))

  }

  public getRouter(): Router {
    return this.router;
  }
}
