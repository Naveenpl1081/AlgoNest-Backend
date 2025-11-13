import { ICommunityRepository } from "../interfaces/Irepositories/IcommunityRepository";
import { IQuestion, IQuestionInput } from "../interfaces/models/Iquestion";
import Question from "../models/communityQuestionSchema";
import { BaseRepository } from "./baseRepository";
import { FilterQuery, Types } from "mongoose";

export class CommunityRepository
  extends BaseRepository<IQuestion>
  implements ICommunityRepository
{
  constructor() {
    super(Question);
  }
  async addQuestion(
    userId: string,
    questionData: IQuestionInput
  ): Promise<IQuestion> {
    try {
      const question = await this.create({
        ...questionData,
        userId: new Types.ObjectId(userId),
        upvotes: 0,
        downvotes: 0,
        answersCount: 0,
      } as Partial<IQuestion>);

      return question;
    } catch (error: any) {
      console.error("Error in addQuestion repository:", error);
      throw new Error(error.message || "Failed to create question in database");
    }
  }
  async getAllQuestions(options: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string;
  }): Promise<{
    data: IQuestion[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const filter: FilterQuery<IQuestion> = {};

    if (options.search) {
      filter.$or = [
        { title: { $regex: options.search, $options: "i" } },
        { description: { $regex: options.search, $options: "i" } },
      ];
    }

    if (options.tags) {
      const tagsArray = options.tags.split(",").map((tag) => tag.trim());
      filter.tags = { $in: tagsArray };
    }

    const page = options.page || 1;
    const limit = options.limit || 10;

    const result = (await this.find(filter, {
      pagination: { page, limit },
      sort: { createdAt: -1 },
      populate: { path: "userId", select: "username email" },
    })) as { data: IQuestion[]; total: number };

    return {
      data: result.data,
      total: result.total,
      page,
      limit,
      pages: Math.ceil(result.total / limit),
    };
  }
  async getOneQuestion(
    questionId: string
  ): Promise<{ data: IQuestion[]; total: number }> {
    try {
      const filter: FilterQuery<IQuestion> = {};
      if (questionId) {
        filter._id = questionId;
      }
      
     
      const questions = await this.find(filter, {
        populate: { path: "userId", select: "username email" },
      }) as IQuestion[];
      
      return { 
        data: Array.isArray(questions) ? questions : [], 
        total: Array.isArray(questions) ? questions.length : 0 
      };
    } catch (error) {
      console.error("error occurred while fetching the question:", error);
      throw new Error("Failed to fetch the question");
    }
  }
}
