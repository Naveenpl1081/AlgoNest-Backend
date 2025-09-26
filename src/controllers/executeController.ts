import { Response } from "express";
import { inject, injectable } from "tsyringe";
import { IExecuteService } from "../interfaces/Iserveices/IexecuteService";
import { AppError } from "../interfaces/models/IAppError";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HTTP_STATUS } from "../utils/httpStatus";

@injectable()
export class ExecuteController {
  constructor(
    @inject("IExecuteService") private _executeService: IExecuteService
  ) {}

  async submitCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { code, problemId, language } = req.body;

      if (!code || !language || !problemId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Code, language, and problemId are required",
        });
        return;
      }

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const requestTimeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(HTTP_STATUS.REQUEST_TIMEOUT).json({
            success: false,
            message: "Request timeout - your code took too long to execute",
            testResults: [
              {
                caseNumber: 1,
                input: "N/A",
                output: "Request Timeout",
                expected: "N/A",
                passed: false,
                error:
                  "Request timeout - check for infinite loops or optimize your code",
              },
            ],
          });
        }
      }, 30000);

      const result = await this._executeService.executeSubmit({
        code,
        language,
        problemId,
        userId,
      });

      clearTimeout(requestTimeout);

      if (!res.headersSent) {
        res.status(HTTP_STATUS.OK).json(result);
      }
    } catch (error) {
      console.error("Run code error:", error);

      if (!res.headersSent) {
        const errorMessage =
          error instanceof Error ? error.message : "Internal server error";

        const isTimeoutError =
          errorMessage.includes("timeout") ||
          errorMessage.includes("Time limit") ||
          errorMessage.includes("took too long");

        res
          .status(
            isTimeoutError
              ? HTTP_STATUS.REQUEST_TIMEOUT
              : HTTP_STATUS.INTERNAL_SERVER_ERROR
          )
          .json({
            success: false,
            message: errorMessage,
            testResults: [
              {
                caseNumber: 1,
                input: "N/A",
                output: isTimeoutError ? "Time Limit Exceeded" : "System Error",
                expected: "N/A",
                passed: false,
                error: errorMessage,
              },
            ],
          });
      }
    }
  }

  async runCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { code, problemId, language } = req.body;

      if (!code || !language || !problemId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Code, language, and problemId are required",
        });
        return;
      }

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const requestTimeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(HTTP_STATUS.REQUEST_TIMEOUT).json({
            success: false,
            message: "Request timeout - your code took too long to execute",
            testResults: [
              {
                caseNumber: 1,
                input: "N/A",
                output: "Request Timeout",
                expected: "N/A",
                passed: false,
                error:
                  "Request timeout - check for infinite loops or optimize your code",
              },
            ],
          });
        }
      }, 30000);

      const result = await this._executeService.executeRun({
        code,
        language,
        problemId,
        userId,
      });

      clearTimeout(requestTimeout);

      if (!res.headersSent) {
        res.status(HTTP_STATUS.OK).json(result);
      }
    } catch (error) {
      console.error("Run code error:", error);

      if (!res.headersSent) {
        const errorMessage =
          error instanceof Error ? error.message : "Internal server error";

        const isTimeoutError =
          errorMessage.includes("timeout") ||
          errorMessage.includes("Time limit") ||
          errorMessage.includes("took too long");

        res
          .status(
            isTimeoutError
              ? HTTP_STATUS.REQUEST_TIMEOUT
              : HTTP_STATUS.INTERNAL_SERVER_ERROR
          )
          .json({
            success: false,
            message: errorMessage,
            testResults: [
              {
                caseNumber: 1,
                input: "N/A",
                output: isTimeoutError ? "Time Limit Exceeded" : "System Error",
                expected: "N/A",
                passed: false,
                error: errorMessage,
              },
            ],
          });
      }
    }
  }

  async getAllSubmissions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const id = req.params.problemId;
      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Problem ID is required",
        });
        return;
      }

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "User authentication required",
        });
        return;
      }

      const submissions = await this._executeService.allSubmissionService(
        userId,
        id
      );

      if (!submissions) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "No submissions found",
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async stats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("Reached stats controller");
  
      const userId = req.user?.id;
      console.log("userId",userId)
      if (!userId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "User ID missing from token." });
        return;
      }
  
      const stats = await this._executeService.getUserStats(userId);
  
      res.status(HTTP_STATUS.OK).json({ success: true, data: stats });
    } catch (err: unknown) {
      const error = err as AppError;
      console.error("Stats error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: error.message || "Something went wrong." });
    }
  }
  
}
