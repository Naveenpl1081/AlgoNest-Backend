import { IQuestionResponse } from "../../models/Iquestion";

export interface QuestionListResponse {
    success: boolean;
    message: string;
    data?: {
      questions: IQuestionResponse[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }