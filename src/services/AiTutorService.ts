import { inject, injectable } from "tsyringe";
import {
  IAITutorRepository,
  IConversationMessage,
} from "../interfaces/Irepositories/IaiTutorRepository";
import { IAITutorService } from "../interfaces/Iserveices/IaiTutorService";

@injectable()
export class AITutorService implements IAITutorService {
  constructor(
    @inject("IAITutorRepository")
    private _aiTutorRepository: IAITutorRepository
  ) {}

  async chat(params: {
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
  }> {
    const startTime = Date.now();

    try {
      const cleanedMessage = params.message?.trim();

      if (!cleanedMessage) {
        throw new Error("Message cannot be empty");
      }

      if (cleanedMessage.length > 5000) {
        throw new Error(
          "Message is too long. Please keep it under 5000 characters."
        );
      }

      const limitedHistory = params.conversationHistory.slice(-20);

      const result = await this._aiTutorRepository.getChatResponse({
        message: cleanedMessage,
        conversationHistory: limitedHistory,
        language: params.language || "general",
        topic: params.topic,
      });

      const responseTime = Date.now() - startTime;
      const aiProvider = process.env.GROQ_API_KEY ? "Groq AI" : "Smart Tutor";

      return {
        ...result,
        metadata: {
          language: params.language || "general",
          aiProvider,
          responseTime,
        },
      };
    } catch (error: any) {
      console.error("AITutorService Error:", error);

      if (error.message.includes("empty")) {
        const customError = new Error("Message cannot be empty") as any;
        customError.type = "VALIDATION_ERROR";
        throw customError;
      }

      if (error.message.includes("too long")) {
        const customError = new Error("Message is too long") as any;
        customError.type = "VALIDATION_ERROR";
        throw customError;
      }

      throw error;
    }
  }
}
