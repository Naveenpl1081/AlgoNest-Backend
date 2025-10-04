export interface IConversationMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }

  export interface IAITutorRepository {
    getChatResponse(params: {
      message: string;
      conversationHistory: IConversationMessage[];
      language?: string;
      topic?: string;
    }): Promise<{
      response: string;
      suggestions?: string[];
      relatedTopics?: string[];
      codeExamples?: string[];
    }>;
  }