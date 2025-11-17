import { inject, injectable } from "tsyringe";
import { IAnswerRepository } from "../interfaces/Irepositories/IanswerRepository";
import { IAnswerService } from "../interfaces/Iserveices/IanswerService";
import {
  ICommunityAnswer,
  ILikeDislikeResponse,
} from "../interfaces/models/Ianswer";

@injectable()
export class AnswerService implements IAnswerService {
  constructor(
    @inject("IAnswerRepository") private _answerRepository: IAnswerRepository
  ) {}

  async addAnswer(
    questionId: string,
    userId: string,
    body: string
  ): Promise<{ success: boolean; message: string; data?: ICommunityAnswer }> {
    try {
      if (!questionId || !userId || !body) {
        return {
          success: false,
          message: "Question ID, User ID, and body are required",
        };
      }

      if (body.trim().length < 10) {
        return {
          success: false,
          message: "Answer must be at least 10 characters long",
        };
      }

      if (body.length > 10000) {
        return {
          success: false,
          message: "Answer cannot exceed 10000 characters",
        };
      }

      const answer = await this._answerRepository.createAnswer({
        questionId,
        userId,
        body: body.trim(),
      });

      return {
        success: true,
        message: "Answer added successfully",
        data: answer,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to add answer",
      };
    }
  }

  async getAnswersByQuestionId(options: {
    questionId: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      answers: ICommunityAnswer[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    try {
      const result = await this._answerRepository.findAnswersByQuestionId({
        questionId: options.questionId,
        page: options.page,
        limit: options.limit,
      });

      return {
        success: true,
        message: "Answers fetched successfully",
        data: {
          answers: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch answers",
      };
    }
  }

  async likeAnswer(
    answerId: string,
    userId: string
  ): Promise<ILikeDislikeResponse> {
    try {
      const result = await this._answerRepository.toggleLike(answerId, userId);

      if (!result) {
        return {
          success: false,
          message: "Answer not found",
        };
      }

      const mappedData = {
        _id: result._id.toString(),
        likesCount: result.likes.length,
        dislikesCount: result.dislikes.length,
        userHasLiked: result.likes.some(
          (id: any) => id.toString() === userId.toString()
        ),
        userHasDisliked: result.dislikes.some(
          (id: any) => id.toString() === userId.toString()
        ),
      };

      return {
        success: true,
        message: mappedData.userHasLiked
          ? "Answer liked successfully"
          : "Like removed successfully",
        data: mappedData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update like",
      };
    }
  }

  async dislikeAnswer(
    answerId: string,
    userId: string
  ): Promise<ILikeDislikeResponse> {
    try {
      const result = await this._answerRepository.toggleDislike(
        answerId,
        userId
      );

      if (!result) {
        return {
          success: false,
          message: "Answer not found",
        };
      }

      const mappedData = {
        _id: result._id.toString(),
        likesCount: result.likes.length,
        dislikesCount: result.dislikes.length,
        userHasLiked: result.likes.some(
          (id: any) => id.toString() === userId.toString()
        ),
        userHasDisliked: result.dislikes.some(
          (id: any) => id.toString() === userId.toString()
        ),
      };

      return {
        success: true,
        message: mappedData.userHasDisliked
          ? "Answer disliked successfully"
          : "Dislike removed successfully",
        data: mappedData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update dislike",
      };
    }
  }
}
