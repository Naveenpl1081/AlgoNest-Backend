import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IAIService } from "../interfaces/Iserveices/IaiService";

@injectable()
export class AiController {
  constructor(@inject("IAIService") private __aiService: IAIService) {}

  async explainError(req: Request, res: Response) {
    const startTime = Date.now();

    try {
      const { code, errorLog, problemStatement } = req.body;

      if (!code?.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            type: "VALIDATION_ERROR",
            message: "Code is required",
            userMessage: "🚫 Please provide your code to get debugging help.",
            suggestions: [
              "Paste your complete code in the 'code' field",
              "Make sure your code is not empty",
              "Include the relevant function or logic you're debugging",
            ],
          },
        });
      }

      if (!problemStatement?.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            type: "VALIDATION_ERROR",
            message: "Problem statement is required",
            userMessage: "🚫 Please describe what your code is supposed to do.",
            suggestions: [
              "Explain the problem you're trying to solve",
              "Describe the expected behavior",
              "Include any specific requirements or constraints",
            ],
          },
        });
      }

      if (code.length > 20000) {
        return res.status(400).json({
          success: false,
          error: {
            type: "VALIDATION_ERROR",
            message: "Code is too long",
            userMessage:
              "🚫 Please provide code that is less than 20,000 characters.",
            suggestions: [
              "Focus on the problematic part of your code",
              "Remove unnecessary comments or debug statements",
              "Break down large functions into smaller ones",
            ],
          },
        });
      }

      const analysis = await this.__aiService.explainError({
        code,
        errorLog: errorLog || "",
        problemStatement,
      });

      const responseTime = Date.now() - startTime;

      console.log("📤 Sending to frontend:", {
        explanation: analysis.explanation?.substring(0, 100) + "...",
        suggestedFix: analysis.suggestedFix?.substring(0, 100) + "...",
        confidence: analysis.confidence,
        provider: analysis.aiProvider,
      });

      return res.json({
        success: true,
        data: {
          explanation: analysis.explanation,
          suggestedFix: analysis.suggestedFix,
          codeExample: analysis.codeExample,
          confidence: analysis.confidence,
          aiProvider: analysis.aiProvider,
        },
        metadata: {
          codeLength: code.length,
          hasErrorLog: !!errorLog,
          responseTimeMs: responseTime,
          timestamp: new Date().toISOString(),
          confidenceLevel: this.getConfidenceLevel(analysis.confidence),
        },
      });
    } catch (err: any) {
      const responseTime = Date.now() - startTime;
      console.error("AIController Error:", err);

      if (err.type === "RATE_LIMITED") {
        return res.status(429).json({
          success: false,
          error: {
            type: "RATE_LIMITED",
            message: err.message,
            userMessage:
              "⏰ AI service is temporarily busy. Please try again in a minute.",
            retryAfter: err.retryAfter || 60,
            suggestions: [
              "Wait a minute before trying again",
              "Our AI service has usage limits to ensure quality",
              "Try simplifying your code if it's very long",
            ],
          },
          metadata: { responseTimeMs: responseTime },
        });
      }

      if (err.type === "VALIDATION_ERROR") {
        return res.status(400).json({
          success: false,
          error: {
            type: "VALIDATION_ERROR",
            message: err.message,
            userMessage: "🚫 " + err.message,
            suggestions: [
              "Please check your input and try again",
              "Ensure all required fields are provided",
              "Verify your code is valid and complete",
            ],
          },
          metadata: { responseTimeMs: responseTime },
        });
      }

      if (err.type === "NETWORK_ERROR") {
        return res.status(503).json({
          success: false,
          error: {
            type: "NETWORK_ERROR",
            message: err.message,
            userMessage:
              "🌐 Connection issue. Please check your internet and try again.",
            suggestions: [
              "Check your internet connection",
              "Try again in a few moments",
              "Contact support if the problem persists",
            ],
          },
          metadata: { responseTimeMs: responseTime },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          type: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          userMessage:
            "❌ Something went wrong while analyzing your code. Please try again.",
          suggestions: [
            "Try submitting your request again",
            "Simplify your code if it's very complex",
            "Contact support if the issue continues",
            "Check that your code is valid syntax",
          ],
        },
        metadata: { responseTimeMs: responseTime },
      });
    }
  }

  private getConfidenceLevel(confidence: number): string {
    if (confidence >= 90) return "Very High";
    if (confidence >= 75) return "High";
    if (confidence >= 60) return "Medium";
    if (confidence >= 40) return "Low";
    return "Very Low";
  }
}
