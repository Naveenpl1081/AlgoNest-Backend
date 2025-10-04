import { IConversationMessage } from "../Irepositories/IaiTutorRepository";

export interface IAITutorService {
    chat(params: {
      message: string;
      conversationHistory: IConversationMessage[];
      language?: string;
      topic?: string;
    }): Promise<{
      response: string;
      suggestions?: string[];
      relatedTopics?: string[];
      codeExamples?: string[];
      metadata: {
        language: string;
        aiProvider: string;
        responseTime: number;
      };
    }>;
  }