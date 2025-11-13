import { ICommunityAnswer } from "../models/Ianswer";

export interface IAnswerRepository {
  createAnswer(answerData: {
    questionId: string;
    userId: string;
    body: string;
  }): Promise<ICommunityAnswer>;
  findAnswersByQuestionId(options: {
    questionId: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: ICommunityAnswer[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  toggleLike(
    answerId: string,
    userId: string
  ): Promise<ICommunityAnswer | null> 
  toggleDislike(
    answerId: string,
    userId: string
  ): Promise<ICommunityAnswer | null>
}
