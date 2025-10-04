import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IAITutorService } from "../interfaces/Iserveices/IaiTutorService";

@injectable()
export class AITutorController {
  constructor(
    @inject("IAITutorService")
    private __aiTutorService: IAITutorService
  ) {}

  async chat(req: Request, res: Response) {
    const startTime = Date.now();

    try {
      console.log("body", req.body);
      const { message, conversationHistory, language, topic } = req.body;

      if (!message?.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            type: "VALIDATION_ERROR",
            message: "Message is required",
            userMessage: " Please type a message to chat with the AI tutor.",
            suggestions: [
              "Ask about a programming concept",
              "Share code you need help with",
              "Describe a problem you're trying to solve",
            ],
          },
        });
      }

      if (message.length > 5000) {
        return res.status(400).json({
          success: false,
          error: {
            type: "VALIDATION_ERROR",
            message: "Message is too long",
            userMessage: " Please keep your message under 5000 characters.",
            suggestions: [
              "Break your question into smaller parts",
              "Focus on the specific issue you need help with",
              "Share only the relevant code sections",
            ],
          },
        });
      }

      const history = Array.isArray(conversationHistory)
        ? conversationHistory
        : [];

      const result = await this.__aiTutorService.chat({
        message,
        conversationHistory: history,
        language: language || "general",
        topic,
      });

      const responseTime = Date.now() - startTime;

      return res.json({
        success: true,
        data: {
          response: result.response,
          suggestions: result.suggestions,
          relatedTopics: result.relatedTopics,
          codeExamples: result.codeExamples,
        },
        metadata: {
          language: result.metadata.language,
          aiProvider: result.metadata.aiProvider,
          responseTimeMs: responseTime,
          timestamp: new Date().toISOString(),
          conversationLength: history.length + 1,
        },
      });
    } catch (err: any) {
      const responseTime = Date.now() - startTime;
      console.error("AITutorController Error:", err);

      if (err.type === "RATE_LIMITED") {
        return res.status(429).json({
          success: false,
          error: {
            type: "RATE_LIMITED",
            message: err.message,
            userMessage:
              " The AI tutor is busy right now. Please try again in a moment.",
            retryAfter: err.retryAfter || 60,
            suggestions: [
              "Wait a minute before sending another message",
              "The AI has usage limits to ensure quality for everyone",
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
              "Check your message and try again",
              "Make sure your question is clear and specific",
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
          userMessage: " Something went wrong. Please try again.",
          suggestions: [
            "Try rephrasing your question",
            "Check your internet connection",
            "Contact support if the issue persists",
          ],
        },
        metadata: { responseTimeMs: responseTime },
      });
    }
  }
}
