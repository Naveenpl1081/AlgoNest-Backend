import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IAnswerService } from "../interfaces/Iserveices/IanswerService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HTTP_STATUS } from "../utils/httpStatus";

@injectable()
export class AnswerController {
  constructor(
    @inject("IAnswerService") private _answerService: IAnswerService
  ) {}

  async addAnswer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { questionId, body } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await this._answerService.addAnswer(
        questionId,
        userId,
        body
      );

      const statusCode = result.success
        ? HTTP_STATUS.CREATED
        : HTTP_STATUS.BAD_REQUEST;
      res.status(statusCode).json(result);
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
  async getAnswersByQuestionId(req: Request, res: Response): Promise<void> {
    try {
      const { questionId } = req.params;
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;

      const result = await this._answerService.getAnswersByQuestionId({
        questionId,
        page,
        limit,
      });

      const statusCode = result.success
        ? HTTP_STATUS.OK
        : HTTP_STATUS.BAD_REQUEST;
      res.status(statusCode).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
  async like(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { answerId } = req.params;
      const userId = req.user?.id;

      if (!answerId || !userId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Missing answerId or userId",
        });
        return;
      }

      const response = await this._answerService.likeAnswer(
        String(answerId),
        String(userId)
      );

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async dislike(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { answerId } = req.params;
      const userId = req.user?.id;

      if (!answerId || !userId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Missing answerId or userId",
        });
        return;
      }

      const response = await this._answerService.dislikeAnswer(
        String(answerId),
        String(userId)
      );

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
