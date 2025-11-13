import { inject, injectable } from "tsyringe";
import { QuestionListResponse } from "../interfaces/DTO/IServices/ICommunityService";
import { ICommunityRepository } from "../interfaces/Irepositories/IcommunityRepository";
import { ICommunityService } from "../interfaces/Iserveices/IcommunityService";
import { IQuestion, IQuestionInput, IQuestionResponse } from "../interfaces/models/Iquestion";
import { IUser } from "../interfaces/models/Iuser";

@injectable()
export class CommunityService implements ICommunityService {
  constructor(
    @inject("ICommunityRepository")
    private _communityRepository: ICommunityRepository
  ) {}

  async addQuestionService(
    userId: string,
    questionData: Partial<IQuestionInput>
  ): Promise<{ success: boolean; message: string; data?: IQuestion }> {
    try {
     
      if (!questionData.title || questionData.title.length < 10) {
        return {
          success: false,
          message: "Title must be at least 10 characters long"
        };
      }

      if (!questionData.description || questionData.description.length < 20) {
        return {
          success: false,
          message: "Description must be at least 20 characters long"
        };
      }

      if (!questionData.tags || questionData.tags.length === 0 || questionData.tags.length > 5) {
        return {
          success: false,
          message: "Question must have between 1 and 5 tags"
        };
      }


      const newQuestion = await this._communityRepository.addQuestion(
        userId,
        questionData
      );

      return {
        success: true,
        message: "Question added successfully",
        data: newQuestion
      };
    } catch (error: any) {
      console.error("Error in addQuestionService:", error);
      
    
      if (error.name === 'ValidationError') {
        return {
          success: false,
          message: Object.values(error.errors).map((e: any) => e.message).join(', ')
        };
      }

      return {
        success: false,
        message: error.message || "Failed to add question"
      };
    }
  }

  async getAllQuestionsService(options: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string;
  }): Promise<QuestionListResponse> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
  
      const result = await this._communityRepository.getAllQuestions({
        page,
        limit,
        search: options.search,
        tags: options.tags,
      });
  
      console.log("result:", result);
  
      const questions: IQuestionResponse[] = result.data.map((question: any) => ({
        _id: question._id.toString(),
  
        userDetails: {
          _id: question.userId._id.toString(),
          username: question.userId.username,
          email: question.userId.email,
        },
  
        title: question.title,
        description: question.description,
        tags: question.tags,
        upvotes: question.upvotes,
        downvotes: question.downvotes,
        answersCount: question.answersCount,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      }));
  
      return {
        success: true,
        message: "Questions fetched successfully",
        data: {
          questions,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error in getAllQuestionsService:", error);
      return {
        message: "Failed to fetch questions",
        success: false,
      };
    }
  }

  async getOneQuestion(questionId: string): Promise<IQuestionResponse | null> {
    try {
      const response = await this._communityRepository.getOneQuestion(questionId);
      
      
      if (!response || !response.data || response.data.length === 0) {
        return null;
      }
      
      const questionData = response.data[0];
      
     
      if (!questionData.userId) {
        throw new Error("User data not populated");
      }
      
      const questions: IQuestionResponse = {
        _id: questionData._id.toString(),
        userDetails: {
          _id: (questionData.userId as IUser)._id.toString(),
          username: (questionData.userId as IUser).username,
          email: (questionData.userId as IUser).email,
        },
        title: questionData.title,
        description: questionData.description,
        tags: questionData.tags,
        upvotes: questionData.upvotes,
        downvotes: questionData.downvotes,
        answersCount: questionData.answersCount,
        createdAt: questionData.createdAt,
        updatedAt: questionData.updatedAt,
      };
      
      return questions;
    } catch (error) {
      console.error("Error in getOneQuestionService:", error);
      throw error; 
    }
  }
  
}