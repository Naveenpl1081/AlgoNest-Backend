import mongoose, { FilterQuery, Types } from "mongoose";
import { IAnswerRepository } from "../interfaces/Irepositories/IanswerRepository";
import { ICommunityAnswer } from "../interfaces/models/Ianswer";
import { BaseRepository } from "./baseRepository";
import CommunityAnswer from "../models/communityAnswerSchema";
import { IQuestion } from "../interfaces/models/Iquestion";

export class AnswerRepository
  extends BaseRepository<ICommunityAnswer>
  implements IAnswerRepository
{
  constructor() {
    super(CommunityAnswer);
  }
  async createAnswer(answerData: {
    questionId: string;
    userId: string;
    body: string;
  }): Promise<ICommunityAnswer> {
    try {
      const newAnswer = await this.create({
        questionId: new mongoose.Types.ObjectId(answerData.questionId),
        userId: new mongoose.Types.ObjectId(answerData.userId),
        body: answerData.body,
      });
      return newAnswer;
    } catch (error: any) {
      throw new Error(`Error creating answer: ${error.message || error}`);
    }
  }

  async findAnswersByQuestionId(options: {
    questionId: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: ICommunityAnswer[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      const { questionId, page, limit } = options;
      const filter: FilterQuery<ICommunityAnswer> = { questionId };

      if (page !== undefined && limit !== undefined) {
        const result = (await this.find(filter, {
          pagination: { page, limit },
          populate: { path: "userId", select: "username email" },
          sort: { createdAt: -1 },
        })) as { data: ICommunityAnswer[]; total: number };

        return {
          data: result.data,
          total: result.total,
          page,
          limit,
          pages: Math.ceil(result.total / limit),
        };
      } else {
        const result = (await this.find(filter, {
          populate: { path: "userId", select: "username email" },
          sort: { createdAt: -1 },
        })) as ICommunityAnswer[];

        return {
          data: result,
          total: result.length,
          page: 1,
          limit: result.length,
          pages: 1,
        };
      }
    } catch (error) {
      throw new Error(`Error finding answers: ${error}`);
    }
  }

  async toggleLike(
    answerId: string,
    userId: string
  ): Promise<ICommunityAnswer | null> {
    const answer = await this.findById(answerId);
    if (!answer) throw new Error("Answer not found");

    const hasLiked = answer.likes.some(
      (id) => id.toString() === userId.toString()
    );

    return hasLiked
      ? await this.removeLike(answerId, userId)
      : await this.addLike(answerId, userId);
  }

  async toggleDislike(
    answerId: string,
    userId: string
  ): Promise<ICommunityAnswer | null> {
    const answer = await this.findById(answerId);
    if (!answer) throw new Error("Answer not found");

    const hasDisliked = answer.dislikes.some(
      (id) => id.toString() === userId.toString()
    );

    return hasDisliked
      ? await this.removeDislike(answerId, userId)
      : await this.addDislike(answerId, userId);
  }
}
