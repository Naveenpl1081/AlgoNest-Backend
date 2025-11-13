import { IQuestion, IQuestionInput } from "../models/Iquestion";

export interface ICommunityRepository {
  addQuestion(
    userId: string,
    questionData: Partial<IQuestionInput>
  ): Promise<IQuestion>;
  getAllQuestions(options: {
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
  }>;
  getOneQuestion(
    questionId: string
  ): Promise<{ data: IQuestion[]; total: number }>;
}
