export interface IAIRepository {
  getAIExplanation(params: {
    code: string;
    errorLog: string;
    problemStatement: string;
  }): Promise<{
    explanation: string;
    suggestedFix: string;
    codeExample?: string;
    confidence: number;
  }>;
}