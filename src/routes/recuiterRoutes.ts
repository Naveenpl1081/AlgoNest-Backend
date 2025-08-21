import express ,{Router} from "express"
import { container } from "tsyringe";
import { AuthController } from "../controllers/authController";
import { RecruiterController } from "../controllers/recruiterController";
import { AuthMiddleware } from "../middleware/authMiddleware";
import { Roles } from "../config/roles";
import { upload } from "../middleware/multer";



export class RecruiterRoutes{
    private router:Router

    constructor(){
        this.router=express.Router();
        this.setupRoutes();
    }

    private setupRoutes(){
        const authMiddleware = container.resolve(AuthMiddleware);
        const recruiterController = container.resolve(RecruiterController);
        const authController = container.resolve(AuthController);
        this.router.post("/signup", recruiterController.register.bind(recruiterController));
        this.router.post("/verify-otp", recruiterController.verifyOtp.bind(recruiterController));
        this.router.post("/login",recruiterController.login.bind(recruiterController));
        this.router.post("/resend-otp", recruiterController.resendOtp.bind(recruiterController));
        this.router.get("/refresh-token",authController.refreshTokenHandler.bind(authController))
        this.router.post("/check-user", recruiterController.forgotPassword.bind(recruiterController));
        this.router.post("/reset-password", recruiterController.resetPassword.bind(recruiterController));
        this.router.patch("/company-verification",authMiddleware.authenticate(Roles.RECRUITER),upload.single("document"),recruiterController.submitDocuments.bind(recruiterController))
    }
    public getRouter(): Router {
        return this.router;
      }
}