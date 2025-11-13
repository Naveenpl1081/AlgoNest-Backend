import { ICommunityAnswer, ILikeDislikeResponse } from "../models/Ianswer";

export interface IAnswerService{
    addAnswer(
        questionId: string,
        userId: string,
        body: string
      ): Promise<{ success: boolean; message: string; data?: ICommunityAnswer }>
      getAnswersByQuestionId(options: {
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
      }>
      likeAnswer(answerId: string, userId: string): Promise<ILikeDislikeResponse>
      dislikeAnswer(answerId: string, userId: string): Promise<ILikeDislikeResponse>
}