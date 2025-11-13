import { QuestionListResponse } from "../DTO/IServices/ICommunityService";
import { IQuestion, IQuestionInput, IQuestionResponse } from "../models/Iquestion";

export interface ICommunityService {
  addQuestionService(
    userId: string,
    questionData: Partial<IQuestionInput>
  ): Promise<{ success: boolean; message: string; data?: IQuestion }>;
  getAllQuestionsService(options: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string;
  }): Promise<QuestionListResponse>
  getOneQuestion(questionId:string):Promise<IQuestionResponse |  null>
}
