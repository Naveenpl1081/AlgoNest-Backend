import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IAnswerService } from "../interfaces/Iserveices/IanswerService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { AnswerService } from "../services/answerService";

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

      const statusCode = result.success ? 201 : 400;
      res.status(statusCode).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
  async getAnswersByQuestionId(req: Request, res: Response): Promise<void> {
    try {
      const { questionId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  
      const result = await this._answerService.getAnswersByQuestionId({
        questionId,
        page,
        limit,
      });
  
      const statusCode = result.success ? 200 : 400;
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
        res.status(400).json({
          success: false,
          message: "Missing answerId or userId",
        });
        return;
      }

      const response = await this._answerService.likeAnswer(
        String(answerId),
        String(userId)
      );

      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({
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
        res.status(400).json({
          success: false,
          message: "Missing answerId or userId",
        });
        return;
      }

      const response = await this._answerService.dislikeAnswer(
        String(answerId),
        String(userId)
      );

      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
