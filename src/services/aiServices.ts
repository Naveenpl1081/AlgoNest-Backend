import { inject, injectable } from "tsyringe";
import { IAIRepository } from "../interfaces/Irepositories/IaiRepository";
import { IAIService } from "../interfaces/Iserveices/IaiService";

@injectable()
export class AIService implements IAIService {
  constructor(@inject("IAIRepository") private _aiRepository: IAIRepository) {}

  async explainError(params: {
    code: string;
    errorLog: string;
    problemStatement: string;
  }): Promise<{
    explanation: string;
    suggestedFix: string;
    codeExample?: string;
    confidence: number;
    aiProvider: string;
  }> {
    try {
 
      const cleanedParams = {
        code: params.code?.trim() || "",
        errorLog: params.errorLog?.trim() || "No specific error provided",
        problemStatement: params.problemStatement?.trim() || "Debug this code"
      };

      console.log("cleaned params",cleanedParams)

    
      if (!cleanedParams.code) {
        throw new Error("Code cannot be empty");
      }

      if (cleanedParams.code.length > 20000) {
        throw new Error("Code is too long for analysis");
      }

 
      const result = await this._aiRepository.getAIExplanation(cleanedParams);
      
 
      const aiProvider = process.env.GROQ_API_KEY ? "Groq AI" : "Smart Analysis";

      return {
        ...result,
        aiProvider
      };

    } catch (error: any) {
      console.error("AIService Error:", error);
      
     
      if (error.message.includes("Code cannot be empty")) {
        const customError = new Error("Code cannot be empty") as any;
        customError.type = 'VALIDATION_ERROR';
        throw customError;
      }

      if (error.message.includes("too long")) {
        const customError = new Error("Code is too long for analysis") as any;
        customError.type = 'VALIDATION_ERROR';
        throw customError;
      }

      
      throw error;
    }
  }
}