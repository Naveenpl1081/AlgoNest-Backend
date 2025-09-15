import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IExecuteService } from "../interfaces/Iserveices/IexecuteService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HTTP_STATUS } from "../utils/httpStatus";

@injectable()
export class ExecuteController {
  constructor(@inject("IExecuteService") private executeService: IExecuteService) {}

  async runCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("hello i reached exucution controller")
      const userId = req.user?.id;
      console.log("userId",userId)
      console.log("body",req.body)
      const { code, problemId ,language} = req.body;

      if (!code || !language || !problemId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "All fields are required" });
        return;
      }

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      const result = await this.executeService.executeRun({ code, language, problemId, userId });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error("Run code error:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
  }
}
